const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const code = readFileSync(join(__dirname, '..', 'combat-v6.js'), 'utf8');
const createCombat = runInNewContext(code + '\ncreateCombatV6');
const configs = {
  blue: {id:'blue', fire:.145, damageMul:1, hitbox:13},
  green:{id:'green', fire:.18, damageMul:1.38, hitbox:16},
  red:  {id:'red', fire:.098, damageMul:.82, hitbox:11},
  gold: {id:'gold', fire:.155, damageMul:1.18, hitbox:17}
};

function setup({level = 0, ship = 'blue', targets = [], afterPlayerHit, afterBossHit} = {}) {
  const hits = [];
  const sounds = [];
  const messages = [];
  const waveTimes = [];
  const drops = [];
  const S = {
    level, levelTime:0, levelDuration:60, boss:null, bossDeath:null, running:true,
    special:1, specialCooldown:0, weapon:1, score:0, stats:{shots:0, hits:0, kills:0}, equipment:[],
    player:{x:270, y:835, dead:false, shield:0, cool:0}, enemies:[], turrets:[], pBullets:[], eBullets:[], fx:[]
  };
  const combat = createCombat({
    S, W:540, H:960, ctx:new Proxy({}, {get:() => () => {}}),
    LEVELS:Array.from({length:8}, (_, i) => ({scroll:78 + i * 6})),
    ship:() => configs[ship], sfx:type => sounds.push(type),
    showMsg(msg) {
      messages.push(msg);
      waveTimes.push(S.levelTime);
    },
    spawnDrop:(...args) => drops.push(args),
    killEnemy:() => S.stats.kills++,
    hitPlayer(...point) {
      hits.push(point);
      afterPlayerHit?.(S);
    },
    drawEnemyUnit:() => {}, drawTurret:() => {}, quality:() => 2, reducedEffects:() => false,
    bossTargets:() => targets,
    bossHit(target, damage, x, y, metadata) {
      target.hp -= damage;
      hits.push({target, damage, x, y, kind:metadata.kind, piercing:metadata.piercing});
      afterBossHit?.(S, target);
      return true;
    },
    setSpecialStatus:() => {}
  });
  combat.reset();
  return {S, combat, hits, sounds, messages, waveTimes, drops};
}

function step({S, combat}, seconds) {
  for (let i = 0; i < Math.ceil(seconds * 120); i++) {
    S.levelTime += 1 / 120;
    combat.updateActors(1 / 120);
    combat.updateProjectiles(1 / 120);
  }
}

test('all eight missions stage distinct warned encounters, installations and six-second breathing windows', () => {
  const combinations = new Set();
  const families = new Set();
  for (let level = 0; level < 8; level++) {
    const game = setup({level});
    const groundKinds = new Set();
    for (let time = 0; time < 60; time += .25) {
      step(game, .25);
      for (const e of game.S.enemies) families.add(e.role);
      for (const t of game.S.turrets) groundKinds.add(t.kind);
    }
    assert.equal(game.messages.length, 8, 'eight scheduled sections');
    assert(groundKinds.size > 0, 'at least one destructible installation');
    assert(game.waveTimes.some((time, i, times) => i > 0 && time - times[i - 1] >= 7.5));
    combinations.add(game.messages.join('\n'));
  }
  assert.equal(combinations.size, 8);
  assert.deepEqual([...families].sort(), ['bomber','diver','drone','fighter','interceptor','shield','support']);
});

test('support protects nearby escorts and a diver commits to its warned dive', () => {
  const game = setup();
  const support = game.combat.addEnemy('support', {x:215, y:90, group:8});
  const shield = game.combat.addEnemy('shield', {x:280, y:95, group:8});
  const diver = game.combat.addEnemy('diver', {x:140, y:85, group:4});
  step(game, 1.2);
  assert(support.connected.includes(shield));
  assert(shield.link > 0);
  assert.equal(diver.state, 'detect');
  step(game, .8);
  assert.equal(diver.state, 'attack');
  assert(diver.vyNow > 160);
});

test('blue lock-on distributes the salvo across independently targetable modules', () => {
  const targets = [
    {id:'left', x:140, y:315, rx:26, ry:24, hp:300},
    {id:'right', x:400, y:305, rx:26, ry:24, hp:300},
    {id:'core', kind:'bossCore', x:270, y:290, rx:24, ry:35, hp:800}
  ];
  const game = setup({ship:'blue', targets});
  assert(game.combat.special());
  assert.equal(game.combat.special(), false);
  step(game, 2.1);
  assert.deepEqual(new Set(game.hits.map(hit => hit.target.id)), new Set(['left','right','core']));
  assert.equal(game.S.stats.shots, 8);
  assert(game.S.stats.hits > 4);
  assert(game.S.stats.hits <= game.S.stats.shots);
  assert(game.sounds.includes('lockOn'));
});

test('red swarm begins with distinct lateral launches and homes onto separate targets', () => {
  const targets = [
    {id:'left', x:165, y:360, rx:29, ry:24, hp:300},
    {id:'right', x:370, y:380, rx:24, ry:25, hp:300}
  ];
  const game = setup({ship:'red', targets});
  game.combat.special();
  step(game, .18);
  assert.equal(game.S.stats.shots, 4);
  assert(game.S.pBullets.some(p => p.vx > 180));
  assert(game.S.pBullets.some(p => p.vx < -180));
  step(game, 1.7);
  assert.equal(game.S.stats.shots, 16);
  assert.deepEqual(new Set(game.hits.map(hit => hit.target.id)), new Set(['left','right']));
  assert(game.sounds.includes('redSwarm'));
});

test('green and gold charge, then pierce targets in the beam without damaging the side lane', () => {
  for (const ship of ['green','gold']) {
    const targets = [
      {id:'front', x:270, y:660, rx:25, ry:30, hp:300},
      {id:'rear', x:270, y:390, rx:25, ry:26, hp:300},
      {id:'off', x:420, y:420, rx:24, ry:26, hp:300}
    ];
    const game = setup({ship, targets});
    game.combat.special();
    step(game, .38);
    assert.equal(game.hits.length, 0);
    step(game, 1.2);
    assert(targets[0].hp < 270);
    assert(targets[1].hp < 270);
    assert.equal(targets[2].hp, 300);
    assert(game.hits.every(hit => hit.piercing));
    assert.equal(game.S.stats.shots, 1);
    assert.equal(game.S.stats.hits, 1);
    assert.equal(game.hits.length, ship === 'green' ? 2 : 22);
  }
});

test('each craft has a distinct primary tier progression', () => {
  const signatures = new Set();
  for (const ship of Object.keys(configs)) {
    const {S, combat} = setup({ship});
    combat.firePlayer();
    assert.equal(S.pBullets.length, 1);
    const baseline = S.pBullets[0].damage;
    S.weapon = 5;
    S.player.cool = 0;
    combat.firePlayer();
    assert(S.pBullets.length >= 4);
    assert(S.pBullets.slice(1).some(b => !b.vx && b.damage > baseline));
    signatures.add(S.pBullets.map(b => [b.vx, b.vy, b.damage]).join('|'));
  }
  assert.equal(signatures.size, 4);
});

test('fast shots use swept contact and respect the visible player hitbox', () => {
  const game = setup();
  const {S, combat, hits} = game;
  const x = S.player.x;
  combat.spawnHostile({x:x + 18, y:730, angle:Math.PI / 2, speed:8500, size:10});
  combat.updateProjectiles(1 / 60);
  assert.equal(hits.length, 0, 'one pixel outside aircraft plus pellet radius');
  combat.spawnHostile({x:x + 14, y:730, angle:Math.PI / 2, speed:8500, size:10});
  combat.updateProjectiles(1 / 60);
  assert.equal(hits.length, 1);
  assert(hits[0][1] < S.player.y);
});

test('swept piercing handles overlapping targets once and reports one precision hit', () => {
  const targets = [
    {id:'first', x:270, y:793, rx:20, ry:14, hp:300},
    {id:'second', x:270, y:774, rx:20, ry:14, hp:300}
  ];
  const {S, combat, hits} = setup({ship:'green', targets});
  S.weapon = 5;
  combat.firePlayer();
  S.pBullets.splice(1);
  combat.updateProjectiles(1 / 30);
  combat.updateProjectiles(1 / 30);
  assert.deepEqual(hits.map(hit => hit.target.id), ['first','second']);
  assert.equal(S.stats.hits, 1);
});

test('the shield absorbs primary shots and a perforating charge can permanently remove it', () => {
  const {S, combat, sounds} = setup({ship:'green'});
  const enemy = combat.addEnemy('shield', {x:270, y:700});
  enemy.shield = 20;
  const hp = enemy.hp;
  combat.firePlayer();
  combat.updateProjectiles(.12);
  assert.equal(enemy.hp, hp);
  assert(enemy.shield < 20 && enemy.shield > 0);
  combat.special();
  for (let i = 0; i < 32; i++) combat.updateProjectiles(1 / 60);
  assert(enemy.shield <= 0);
  assert(enemy.hp < hp);
  assert(sounds.includes('armorBreak'));
  assert.equal(S.stats.kills, 1);
});

test('clearing projectiles on a lethal hit ends the current collision pass', () => {
  const player = setup({afterPlayerHit(S) {
    S.player.dead = true;
    S.eBullets.length = 0;
  }});
  for (let i = 0; i < 3; i++) {
    player.combat.spawnHostile({x:270, y:800, angle:Math.PI / 2, speed:600, size:10});
  }
  player.combat.updateProjectiles(.04);
  assert.equal(player.hits.length, 1);
  assert.equal(player.S.eBullets.length, 0);

  const boss = setup({
    targets: [{id:'core', kind:'bossCore', x:270, y:770, rx:35, ry:24, hp:1}],
    afterBossHit(S, target) {
      if (target.hp > 0) return;
      S.bossDeath = {};
      S.pBullets.length = 0;
      S.eBullets.length = 0;
    }
  });
  boss.S.weapon = 5;
  boss.combat.firePlayer();
  boss.combat.updateProjectiles(.04);
  assert.equal(boss.hits.length, 1);
  assert.equal(boss.S.stats.hits, 1);
  assert.equal(boss.S.pBullets.length, 0);
});
