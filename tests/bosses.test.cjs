const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const source = readFileSync(path.join(__dirname, '../bosses-v6.js'), 'utf8');

function fixture(level, options = {}) {
  const shots = [], reinforcements = [], messages = [], labels = new Map();
  const player = { x: 270, y: 800, dead: false };
  const state = {
    level, player, boss: null, bossNodes: [], enemies: [], pBullets: [], eBullets: [], turrets: [], fx: [],
    score: 0, stats: { boss: false }, starsCollected: options.stars || 0
  };
  const context2d = new Proxy({
    createRadialGradient: () => ({ addColorStop() {} }),
    drawImage(image) { assert.ok(image, 'loaded image required for drawing'); },
    ellipse(x, y, rx, ry, angle, start, end) {
      assert.ok([x, y, rx, ry, angle, start, end].every(Number.isFinite));
      assert.ok(rx >= 0 && ry >= 0);
    }
  }, { get:(object, key) => object[key] || (() => {}) });
  let completed = 0, congratulations = 0;
  function label(id) {
    if (!labels.has(id)) {
      const classes = new Set();
      labels.set(id, { classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) }, style: {} });
    }
    return labels.get(id);
  }
  const env = {
    W: 540, H: 960, S: state, ctx: context2d, imgs: new Proxy({}, { get: () => ({ width: 1448, height: 1086 }) }),
    document: { createElement: () => ({ getContext: () => context2d }) },
    $: label,
    banner(text) { label('levelBanner').classList.add('show'); messages.push(text); },
    showMsg: text => messages.push(text),
    sfx() {}, hitPlayer() {}, drawImageCentered() {}, stopMusic() {},
    nextLevel: () => { completed++; }, startCongratulations: () => { congratulations++; },
    visualQuality: () => options.low ? 0 : 2,
    reducedEffects: () => Boolean(options.low),
    combat: {
      spawnHostile: shot => shots.push(shot),
      addEnemy: (role, opts) => reinforcements.push({ role, ...opts })
    }
  };
  const boss = vm.runInNewContext(`${source}\nBossV6`, env);
  function step(seconds, render = false) {
    for (let i = 0; i < Math.ceil(seconds * 60); i++) {
      if (state.bossDeath) boss.updateDeath(1 / 60);
      else if (state.boss) boss.update(1 / 60, player);
      if (render) boss.draw();
    }
  }
  function hit(t, damage = 10000, metadata) {
    return boss.hit(t, damage, t.x, t.y, metadata);
  }
  return { boss, state, player, shots, reinforcements, messages, labels, step, hit,
    completed: () => completed, congratulations: () => congratulations };
}

test('each boss exposes attackable modules, loses weapons and completes a distinct wreck timeline', async t => {
  const sequences = new Set();
  const mountedModules = [7, 8, 8, 9, 7, 8, 9, 9];
  for (let level = 0; level < 8; level++) {
    await t.test(`mission ${level + 1}`, () => {
      const f = fixture(level);
      f.boss.spawn();
      const b = f.state.boss;
      sequences.add(JSON.stringify(b.data.wreck));
      assert.equal(f.boss.targets().length, 0);
      f.step(2.5, true);
      assert.equal(f.boss.targets().length, mountedModules[level] + 1);
      assert.ok(f.boss.targets().every(n => n.y >= 94 && n.rx > 0 && n.ry > 0));
      assert.ok(f.labels.get('bossModules').textContent.length > 0);

      const gun = b.nodes.find(n => n.definition.weapon);
      f.step(7);
      assert.ok(f.shots.some(shot => shot.source === gun.id));
      assert.equal(f.hit(gun, 3), true);
      assert.ok(gun.hp < gun.maxHp && !gun.dead);
      assert.equal(f.hit(gun), true);
      assert.equal(f.hit(gun), false);
      assert.ok(gun.dead);
      assert.ok(b.debris.length > 0);
      assert.ok(!f.boss.targets().includes(gun));
      f.shots.length = 0;
      f.step(8, level === 3);
      assert.ok(f.shots.length, 'other attacks remain active');
      assert.ok(f.shots.every(shot => shot.source !== gun.id));

      for (const node of b.nodes) if (!node.dead) f.hit(node);
      f.hit(b.core, b.maxHp * .29);
      assert.ok(b.phase >= 2);
      f.step(1.6);
      f.hit(b.core, b.maxHp * .12);
      f.step(1.6);
      const banner = f.labels.get('levelBanner');
      banner.classList.add('show');
      assert.equal(f.hit(b.core), true);
      assert.equal(f.state.boss, null);
      assert.equal(f.state.stats.boss, true);
      assert.equal(f.state.bossDeath, b);
      assert.equal(banner.classList.contains('show'), false);
      f.step(1.6, true);
      assert.equal(f.completed(), 0);
      assert.ok(b.particles.length > 0);
      const [ruptureTime] = b.data.wreck.events.find(([,id, power]) => id === 'core' && power >= 2);
      f.step(ruptureTime - b.deathTime + .25, true);
      const hullChunks = b.debris.filter(d => d.outline);
      assert.equal(hullChunks.length, 4);
      assert.ok(hullChunks.every(d => d.width > b.w * .4 && d.height > b.h * .4 && d.crop.image));
      assert.ok(hullChunks.some(d => d.vx < 0) && hullChunks.some(d => d.vx > 0));
      f.step(6);
      assert.equal(f.state.bossDeath, null);
      assert.equal(f.completed(), 1);
      assert.equal(f.state.bossNodes.length, 0);
      assert.ok(b.rupturedAt > 0);
    });
  }
  assert.equal(sequences.size, 8);
});

test('shield projectors and plating protect the core until the named parts fail', () => {
  const f = fixture(5);
  f.boss.spawn();
  f.step(2.5);
  const b = f.state.boss;
  const shields = b.nodes.filter(n => n.kind === 'shield');
  const before = b.hp;
  f.hit(b.core, 22);
  const shieldedLoss = before - b.hp;
  for (const shield of shields) f.hit(shield);
  const hpAfterShield = b.hp;
  assert.equal(f.hit(b.core, 22, { piercing: true }), true);
  assert.ok(hpAfterShield - b.hp > shieldedLoss);
  f.hit(b.core);
  assert.equal(f.state.boss, b);
  assert.ok(b.hp > 0);
  f.hit(b.nodes.find(n => n.kind === 'armor'));
  f.hit(b.core);
  assert.equal(f.state.bossDeath, b);
});

test('upgraded projectiles still increase pressure without cutting special or localized damage', () => {
  function loss(level, amount, tier, kind, core = true) {
    const f = fixture(level);
    f.boss.spawn();
    f.step(2.5);
    const b = f.state.boss;
    const target = core ? b.core : b.nodes.find(n => n.definition.weapon);
    const hp = target.hp;
    f.hit(target, amount, { tier, kind, ship: 'green' });
    return hp - target.hp;
  }

  for (const level of [0, 7]) {
    const stockViper = loss(level, 4.68, 1, 'primary');
    const upgradedViper = loss(level, 6.83, 5, 'primary');
    assert.ok(upgradedViper / .86 > stockViper, 'upgraded center cannon retains greater sustained damage');
    assert.ok(loss(level, 10, 5, 'primary') < loss(level, 10, 1, 'primary'));
    assert.equal(loss(level, 10, 5, 'primary', false), loss(level, 10, 1, 'primary', false));
    assert.equal(loss(level, 52, 5, 'greenLance'), loss(level, 52, 1, 'greenLance'));
  }
});

test('the Titan hangar cuts off escorts and Hydra rotors degrade handling', () => {
  const titan = fixture(3);
  titan.boss.spawn();
  titan.step(10);
  assert.ok(titan.reinforcements.length > 0);
  titan.reinforcements.length = 0;
  titan.hit(titan.state.boss.nodes.find(n => n.kind === 'hangar'));
  titan.step(17);
  assert.equal(titan.reinforcements.length, 0);

  const intact = fixture(4), damaged = fixture(4);
  intact.boss.spawn();
  damaged.boss.spawn();
  intact.step(2.5);
  damaged.step(2.5);
  for (const rotor of damaged.state.boss.nodes.filter(n => n.kind === 'rotor')) damaged.hit(rotor);
  intact.step(3);
  damaged.step(3);
  assert.ok(damaged.state.boss.moveTime < intact.state.boss.moveTime * .6);
  assert.notEqual(damaged.state.boss.angle, intact.state.boss.angle);
});

test('auxiliary systems disable or weaken their corresponding attacks', async t => {
  function encounter(level) {
    const f = fixture(level);
    f.boss.spawn();
    f.step(2.5);
    f.part = id => f.state.boss.nodes.find(n => n.definition.id === id);
    return f;
  }

  await t.test('Fortress radar controls aimed volleys', () => {
    const pointedAtPlayer = destroyed => {
      const f = encounter(0);
      f.player.x = 500;
      f.player.y = 545;
      if (destroyed) f.hit(f.part('radar'));
      const gun = f.part('tail-gun');
      gun.shoot = 0;
      f.step(.7);
      const volley = f.shots.filter(shot => shot.source === gun.id);
      return Math.abs(Math.PI / 2 - volley.reduce((sum, shot) => sum + shot.angle, 0) / volley.length);
    };
    assert.ok(pointedAtPlayer(false) > pointedAtPlayer(true) * 2);
  });

  await t.test('Cuirassé magazine interrupts even a prepared missile launch', () => {
    const f = encounter(1);
    const missiles = f.part('missiles');
    missiles.shoot = 0;
    f.step(.075);
    assert.ok(f.state.boss.pending.some(shot => shot.source === missiles));
    f.hit(f.part('magazine'));
    f.step(7);
    assert.ok(!missiles.dead && f.shots.every(shot => shot.source !== missiles.id));
  });

  await t.test('Arctic cooling lines power the ion barrage', () => {
    const f = encounter(2);
    const b = f.state.boss;
    b.shoot = 0;
    f.step(.04);
    const armed = b.pending.find(shot => shot.source === b.core);
    assert.equal(armed.kind, 'ion');
    f.hit(f.part('coolant-l'));
    f.hit(f.part('coolant-r'));
    b.shoot = 0;
    b.attackIndex = 0;
    f.step(.04);
    const degraded = b.pending.filter(shot => shot.source === b.core).at(-1);
    assert.equal(degraded.kind, 'bolt');
    assert.ok(degraded.speed < armed.speed && degraded.angles.length < armed.angles.length);
  });

  await t.test('Titan catapults and Hydra gyroscope each affect their own subsystem', () => {
    const f = encounter(3);
    f.hit(f.part('catapult-l'));
    f.step(7);
    assert.equal(f.reinforcements.length, 1);
    assert.equal(f.reinforcements[0].role, 'interceptor');
    f.reinforcements.length = 0;
    f.hit(f.part('catapult-r'));
    f.step(14);
    assert.equal(f.reinforcements.length, 0);

    const hydra = encounter(4);
    const b = hydra.state.boss;
    const before = b.moveTime;
    hydra.hit(hydra.part('gyro'));
    hydra.step(3);
    assert.ok(b.moveTime - before < 2.6);
    assert.ok(hydra.part('rotor-l').hp > 0 && hydra.part('rotor-r').hp > 0);
  });

  await t.test('Azure capacitor opens an alternate path and disables the ion turrets', () => {
    const f = encounter(5);
    const b = f.state.boss;
    f.hit(f.part('capacitor'));
    f.hit(f.part('armor'));
    f.step(9);
    assert.ok(f.shots.every(shot => ![f.part('gun-l').id, f.part('gun-r').id].includes(shot.source)));
    assert.ok(f.part('shield-l').hp > 0 && f.part('shield-r').hp > 0);
    f.hit(b.core);
    assert.equal(f.state.bossDeath, b);
  });

  await t.test('Inferno valve stops just its own flank', () => {
    const f = encounter(6);
    f.hit(f.part('valve-l'));
    f.step(8);
    assert.ok(f.shots.every(shot => shot.source !== f.part('cannon-l').id));
    assert.ok(f.shots.some(shot => shot.source === f.part('cannon-r').id));
  });
});

test('Nightfall transforms without healing or repairing broken parts', () => {
  const f = fixture(7, { stars: 4, low: true });
  f.boss.spawn();
  f.step(2.5, true);
  const b = f.state.boss;
  const part = b.nodes.find(n => n.kind === 'plasma');
  f.hit(part);
  for (const n of b.nodes.filter(n => n.kind === 'conduit')) f.hit(n);
  for (const n of b.nodes.filter(n => n.kind === 'shield')) f.hit(n);
  while (b.phase < 3) f.hit(b.core, 30);
  const hp = b.hp;
  assert.ok(b.transformed && b.morph > 0);
  assert.equal(f.boss.targets().length, 0);
  f.step(1.7, true);
  assert.equal(b.hp, hp);
  assert.ok(b.w > b.data.width);
  assert.equal(part.dead, true);
  assert.ok(!f.boss.targets().includes(part));
  assert.ok(f.messages.some(message => message.includes('FORME ZÉRO')));
  f.shots.length = 0;
  b.shoot = 0;
  b.attackIndex = 0;
  f.step(.8);
  const volley = f.shots.filter(shot => shot.source === b.core.id);
  assert.ok(volley.length > 0 && volley.every(shot => shot.kind === 'bolt'));
  f.hit(b.core);
  f.step(7, true);
  assert.equal(f.completed(), 0);
  assert.equal(f.congratulations(), 1);
  assert.ok(!f.state.shake && !f.state.hitStop);
});
