'use strict';

function createCombatV6({
  S, W, H, ctx, LEVELS, ship, sfx, showMsg, spawnDrop,
  killEnemy, hitPlayer, drawEnemyUnit, drawGroundObject, bossTargets, bossHit,
  quality, reducedEffects, setSpecialStatus, terrainPeriod = () => H
}) {
  const palette = {
    blue: ['#c8f9ff', '#39c4ff'], green: ['#eafaac', '#72e64c'],
    red: ['#ffe2b3', '#ff5a37'], gold: ['#fff3b0', '#ffbb43']
  };
  const roles = {
    fighter:     {type:'green',  hp:3.2, speed:142, rx:23, ry:29, rate:2.6, color:'#5ce2ff'},
    interceptor: {type:'yellow', hp:4.8, speed:164, rx:24, ry:31, rate:2.5, color:'#ff9de0'},
    bomber:      {type:'bomber', hp:14,  speed:85,  rx:37, ry:31, rate:3.2, color:'#ff9a52'},
    drone:       {type:'heli',   hp:3.8, speed:167, rx:22, ry:24, rate:2.6, color:'#f4b3ff'},
    diver:       {type:'red',    hp:4.4, speed:113, rx:23, ry:31, rate:0,   color:'#ff674c'},
    shield:      {type:'heli',   hp:8.5, speed:92,  rx:34, ry:34, rate:3.2, color:'#8af5ff'},
    support:     {type:'yellow', hp:6.5, speed:94,  rx:23, ry:28, rate:0,   color:'#a3fdb2'}
  };
  const earlyArt = {
    fighter:     {key:'enemyAlt', rect:[25,25,174,218], facing:'up'},
    interceptor: {key:'enemyAlt', rect:[744,25,190,221], facing:'up'},
    bomber:      {key:'enemy', rect:[544,503,324,232], facing:'up'},
    drone:       {key:'enemy', rect:[805,963,192,157], facing:'up'},
    diver:       {key:'enemyAlt', rect:[17,540,193,241], facing:'up'},
    shield:      {key:'enemyAlt', rect:[18,810,204,257], facing:'up'},
    support:     {key:'enemyAlt', rect:[738,281,201,235], facing:'up'}
  };
  const lateArt = {
    fighter:     {key:'enemyChapter2', rect:[193,26,191,187], facing:'down'},
    interceptor: {key:'enemyChapter2', rect:[940,256,181,195], facing:'down'},
    bomber:      earlyArt.bomber,
    drone:       {key:'enemyChapter2', rect:[958,891,237,175], facing:'down'},
    diver:       {key:'enemyChapter2', rect:[946,38,167,191], facing:'up'},
    shield:      {key:'enemyChapter2', rect:[203,234,196,217], facing:'up'},
    support:     {key:'enemyChapter2', rect:[207,460,190,209], facing:'down'}
  };
  const surfaceRoles = {
    battery: {kind:'gun', hp:14, rx:25, ry:24, rate:2.8},
    flak: {kind:'mini', hp:14, rx:25, ry:25, rate:2.25},
    launcher: {kind:'missile', hp:18, rx:28, ry:25, rate:3.1, reward:true},
    patrol: {kind:'gun', hp:14, rx:19, ry:35, rate:2.75, cruise:29},
    gunboat: {kind:'plasma', hp:29, rx:30, ry:51, rate:3.15, cruise:17, reward:true}
  };
  // Shore positions are fixed to each terrain tile in the world, including when the map repeats.
  const shoreSites = [
    [[62,162],[486,166],[53,300],[480,408],[60,493],[493,604],[57,727],[483,762]],
    [[53,156],[487,157],[62,265],[486,313],[54,448],[479,549],[55,651],[485,739]],
    [[62,165],[471,152],[65,238],[477,359],[67,432],[476,557],[58,654],[481,743]],
    [[58,151],[492,165],[56,277],[498,380],[62,510],[469,556],[63,657],[476,769]],
    [[59,165],[480,173],[66,239],[476,338],[56,417],[485,536],[53,638],[478,709]],
    [[60,147],[479,150],[56,252],[475,381],[61,449],[478,519],[59,625],[474,732]],
    [[58,167],[479,153],[61,240],[475,328],[68,451],[477,554],[65,661],[476,758]],
    [[72,152],[482,150],[69,238],[490,335],[68,447],[477,552],[62,654],[479,758]]
  ];
  const hostileColors = {
    bolt: ['#fff3d9', '#ff6342'], plasma: ['#e8fbff', '#69c9ff'],
    missile: ['#fff2c7', '#ff9c41'], flame: ['#fff1a3', '#ff7140'],
    ion: ['#f5dbff', '#d18aff']
  };
  const patterns = {
    wedge:   {text:'Formation en approche',              roles:['fighter','fighter','fighter']},
    pincer:  {text:'Intercepteurs sur les deux flancs',  roles:['interceptor','interceptor','fighter']},
    drones:  {text:'Drones en approche rapide',          roles:['drone','drone','drone','drone']},
    bombers: {text:'Bombardier avec escorte',            roles:['fighter','bomber','fighter']},
    dive:    {text:'Plongeurs détectés',                 roles:['diver','diver','fighter']},
    cover:   {text:'Interceptez le vaisseau de soutien',  roles:['shield','support','interceptor']},
    fleet:   {text:'Convoi blindé en approche',          roles:['shield','bomber','support','shield']},
    shore:   {text:'Batteries de rive en vue',            roles:['battery','fighter','launcher']},
    coast:   {text:'Patrouilleur et batteries de rive', roles:['flak','patrol','launcher']},
    river:   {text:'Vedettes armées dans le chenal',     roles:['patrol','fighter','gunboat']},
    strike:  {text:'Escadron d’assaut en approche',       roles:['drone','interceptor','diver','fighter']}
  };
  const missions = [
    [[2,'wedge'],[8,'drones'],[14,'pincer'],[20,'coast'],[27,'bombers'],[37,'wedge'],[44,'cover'],[52,'dive']],
    [[2,'pincer'],[8,'wedge'],[14,'shore'],[21,'bombers'],[28,'dive'],[38,'cover'],[44,'river'],[51,'fleet']],
    [[2,'wedge'],[8,'shore'],[15,'cover'],[22,'drones'],[29,'fleet'],[39,'pincer'],[45,'bombers'],[52,'strike']],
    [[2,'river'],[8,'pincer'],[15,'bombers'],[22,'drones'],[28,'cover'],[38,'coast'],[45,'dive'],[52,'fleet']],
    [[2,'drones'],[8,'dive'],[14,'wedge'],[21,'cover'],[28,'coast'],[38,'bombers'],[44,'drones'],[51,'strike']],
    [[2,'pincer'],[8,'river'],[14,'bombers'],[21,'fleet'],[28,'drones'],[38,'cover'],[45,'dive'],[52,'fleet']],
    [[2,'shore'],[8,'dive'],[14,'strike'],[20,'bombers'],[28,'shore'],[38,'cover'],[45,'dive'],[52,'fleet']],
    [[2,'pincer'],[8,'strike'],[14,'drones'],[20,'cover'],[27,'fleet'],[36,'coast'],[43,'bombers'],[51,'strike']]
  ];
  const cooldowns = {blue:15, green:17, red:15, gold:18};
  const warningQueue = [];
  const trails = [];
  const impacts = [];
  let waveIndex = 0;
  let serial = 0;
  let attack = null;
  let soundWait = 0;
  let impactSoundWait = 0;
  let hitPlayerX;
  let hitPlayerY;
  let playerVx = 0;
  let playerVy = 0;

  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const approach = (current, goal, strength, dt) => current + (goal - current) * Math.min(1, strength * dt);

  function reset() {
    waveIndex = 0;
    serial = 0;
    attack = null;
    soundWait = impactSoundWait = 0;
    playerVx = playerVy = 0;
    hitPlayerX = S.player?.x;
    hitPlayerY = S.player?.y;
    warningQueue.length = trails.length = impacts.length = 0;
  }

  function addEnemy(role, opts = {}) {
    if (S.enemies.length >= 15) return null;
    const def = roles[role];
    if (!def) return null;
    const homeX = clamp(opts.x ?? W / 2, 65, W - 65);
    const entry = opts.entry || 'top';
    const health = def.hp * (1 + S.level * .18) * (opts.elite ? 1.3 : 1);
    const x = entry === 'left' ? -39 : entry === 'right' ? W + 39 : homeX;
    const y = opts.y ?? -48;
    const side = entry === 'left' ? 1 : entry === 'right' ? -1 : homeX < W / 2 ? 1 : -1;
    const enemy = {
      id:'enemy-' + ++serial, targetType:'enemy', role, type:def.type,
      art:(S.level < 4 ? earlyArt : lateArt)[role],
      x, y, homeX, hp:health, maxHp:health, rx:def.rx, ry:def.ry,
      vx:0, vyNow:def.speed, t:0, state:'entry', stateTime:0, side, entry,
      shoot:.85 + (opts.slot ?? 0) * .36, flash:0, burst:0, burstDelay:0,
      shield:role === 'shield' ? health * .82 : 0, link:0, elite:!!opts.elite,
      group:opts.group ?? 0, slot:opts.slot ?? 0, phase:(opts.slot ?? 0) * .36,
      angle:0, dodge:0, evadeCooldown:0, aimX:homeX, aimY:H - 120
    };
    S.enemies.push(enemy);
    return enemy;
  }

  function pickShoreSite(side) {
    const offset = S.bgY ?? S.levelTime * LEVELS[S.level].scroll;
    const period = terrainPeriod();
    let match;
    let distance = Infinity;
    for (const [x, mapY] of shoreSites[S.level]) {
      if ((x < W / 2) !== (side < 0)) continue;
      const wrapped = ((mapY + offset) % period + period) % period;
      const y = wrapped > period - 140 ? wrapped - period : wrapped;
      const error = Math.abs(y + 32);
      if (error >= distance || y > 112) continue;
      if (S.turrets.some(t => !t.naval && Math.abs(t.x - x) < 18 && Math.abs(t.y - y) < 48)) continue;
      distance = error;
      match = {x, y};
    }
    return match;
  }

  function addStructure(role, slot, side) {
    if (S.turrets.filter(t => !t.dead).length >= 5) return null;
    const def = surfaceRoles[role];
    if (!def) return null;
    const naval = Boolean(def.cruise);
    const site = naval ? {x:W / 2 + (role === 'gunboat' ? side * 16 : 0), y:role === 'gunboat' ? -130 : -48}
      : pickShoreSite(side);
    if (!site) return null;
    const health = def.hp * (1 + S.level * .13);
    const surface = {
      id:'ground-' + ++serial, targetType:'ground', role, naval, kind:def.kind, ...site, homeX:site.x,
      hp:health, maxHp:health, rx:def.rx, ry:def.ry, shoot:1.1 + slot * .38,
      warn:0, flash:0, fireFlash:0, dead:false, deathAge:0, t:0, angle:0, targetAngle:Math.PI / 2
    };
    S.turrets.push(surface);
    return surface;
  }

  function scheduleWaves() {
    if (S.boss || S.bossDeath || S.levelTime >= (S.levelDuration || 60)) {
      warningQueue.length = 0;
      return;
    }
    const now = S.levelTime;
    const mission = missions[S.level];
    const next = mission[waveIndex];
    if (next && now >= next[0]) {
      const pattern = patterns[next[1]];
      const waveSize = pattern.roles.length;
      const group = ++waveIndex;
      showMsg(pattern.text, 1.05);
      for (let i = 0; i < waveSize; i++) {
        const role = pattern.roles[i];
        const flank = next[1] === 'pincer' && i < 2;
        const lane = W / 2 + (i - (waveSize - 1) / 2) * (next[1] === 'wedge' ? 92 : 100);
        const side = i === 0 ? -1 : 1;
        const surface = surfaceRoles[role];
        const entry = flank ? i ? 'right' : 'left' : 'top';
        const x = surface ? surface.cruise ? W / 2 : side < 0 ? 65 : W - 65 : lane;
        warningQueue.push({
          role, entry, x:clamp(x, 55, W - 55), y:flank ? 160 + 66 * i : -48,
          slot:i, group, side, due:now + .9 + (next[1] === 'wedge' ? 0 : i * .13),
          elite:S.level >= 4 && (role === 'bomber' || role === 'shield') && group % 2 === 0
        });
      }
    }
    for (let i = 0; i < warningQueue.length;) {
      const signal = warningQueue[i];
      if (signal.due > now) {
        i++;
        continue;
      }
      warningQueue.splice(i, 1);
      if (!surfaceRoles[signal.role]) addEnemy(signal.role, signal);
      else if (!addStructure(signal.role, signal.slot, signal.side) && now < (S.levelDuration || 60) - 4) {
        signal.due = now + .28;
        warningQueue.push(signal);
      }
    }
  }

  function setState(o, state) {
    o.state = state;
    o.stateTime = 0;
  }

  function nearPlayerShot(o) {
    return S.pBullets.some(b => Math.abs(b.x - o.x) < 36 && b.y > o.y + 10 && b.y < o.y + 146 && b.vy < 0);
  }

  function moveEnemy(o, p, dt) {
    const def = roles[o.role];
    const t = o.stateTime;
    const pace = def.speed * (1 + S.level * .026);
    const wave = Math.sin(o.t * (o.role === 'drone' ? 4.5 : 2.1) + o.phase);
    const predictedX = clamp(p.x + playerVx * .42, 54, W - 54);
    let targetX = o.homeX;
    let targetVy = pace;
    let response = 4.5;
    let maxVx = 155;

    switch (o.state) {
      case 'entry':
        targetVy = o.entry === 'top' ? pace * 1.25 : 70;
        maxVx = 190;
        if (o.x > 44 && o.x < W - 44 && o.y > 48) setState(o, 'patrol');
        break;
      case 'patrol':
        targetX += wave * (o.role === 'drone' ? 57 : 24);
        if (o.y > 112 && t > .66 + o.slot * .09) setState(o, 'detect');
        break;
      case 'detect':
        targetVy = pace * .42;
        if (o.role === 'interceptor' || o.role === 'diver') {
          targetX = clamp(predictedX - o.side * 55, 48, W - 48);
          o.aimX = predictedX;
          o.aimY = clamp(p.y + playerVy * .15, H * .62, H - 35);
        }
        if (t > (o.role === 'diver' ? .78 : .3)) setState(o, 'attack');
        break;
      case 'attack':
        if (o.role === 'diver') {
          targetX = o.aimX;
          targetVy = 395 + S.level * 9;
          maxVx = 267;
          if (o.y >= o.aimY + 40) setState(o, 'retreat');
        } else if (o.role === 'interceptor') {
          targetX = clamp(predictedX + o.side * 96, 55, W - 55);
          targetVy = 108;
          maxVx = 186;
        } else if (o.role === 'drone') {
          targetX += wave * 105;
          targetVy = pace * (.85 + Math.cos(o.t * 4.5) * .26);
          maxVx = 230;
          if (t > .15 && o.evadeCooldown <= 0 && nearPlayerShot(o)) {
            o.dodge = o.x < p.x ? -1 : 1;
            setState(o, 'evade');
          }
        } else if (o.role === 'support' || o.role === 'shield' || o.role === 'bomber') {
          targetX += wave * (o.role === 'bomber' ? 33 : 20);
          targetVy = pace * .46;
          if (o.role === 'shield') {
            const ally = S.enemies.find(a => a !== o && a.group === o.group && a.role === 'support');
            if (ally) targetX = clamp(ally.x - o.side * 62, 56, W - 56);
          }
        } else {
          targetX += Math.sin(o.t * 1.6) * 54;
          targetVy = pace * .76;
        }
        if (o.role !== 'diver' && t > (o.role === 'bomber' ? 4.5 : 3.1)) setState(o, 'reposition');
        break;
      case 'evade':
        targetX = o.x + o.dodge * 120;
        targetVy = pace * 1.08;
        maxVx = 233;
        response = 7;
        if (t > .35) {
          o.evadeCooldown = 2.1;
          setState(o, 'reposition');
        }
        break;
      case 'reposition':
        targetX += o.side * 64;
        targetVy = pace * .84;
        if (o.y > H * .56 || o.t > 12) setState(o, 'retreat');
        else if (t > .95) setState(o, 'attack');
        break;
      case 'retreat':
        targetX += o.side * 100;
        targetVy = o.role === 'diver' ? 420 : pace * 1.6;
        break;
    }

    const desired = clamp((targetX - o.x) * 3.2, -maxVx, maxVx);
    const oldVx = o.vx;
    o.vx = approach(o.vx, desired, response, dt);
    o.vyNow = approach(o.vyNow, targetVy, response, dt);
    o.x += (oldVx + o.vx) * .5 * dt;
    o.y += o.vyNow * dt;
    o.angle = rotateToward(o.angle, Math.atan2(-o.vx, o.vyNow), 14 * dt);
  }

  function spawnHostile({x, y, angle, speed, size = 10, kind = 'bolt', homing = 0, ttl = 7, color}) {
    const cap = [20,23,25,27,27,29,31,34][S.level] + (S.boss ? 6 : 0);
    if (S.eBullets.length >= cap || !Number.isFinite(x + y + angle + speed) || y < 5 || y > H - 24) return false;
    S.eBullets.push({x, y, angle, speed, vx:Math.cos(angle) * speed, vy:Math.sin(angle) * speed,
      size, kind, homing, ttl, color, life:0});
    return true;
  }

  function spreadAt(o, p, count, spread, options) {
    const structure = o.targetType === 'ground';
    const nose = structure ? o.targetAngle : o.angle + Math.PI / 2;
    const reach = structure ? (o.naval ? o.ry * .48 : 15) : o.ry * .58;
    const muzzleX = o.x + Math.cos(nose) * reach;
    const muzzleY = o.y + Math.sin(nose) * reach;
    const angle = Math.atan2(p.y - muzzleY, p.x - muzzleX);
    let fired = false;
    for (let i = 0; i < count; i++) {
      fired = spawnHostile({
        x:muzzleX, y:muzzleY, angle:angle + (i - (count - 1) / 2) * spread, ...options
      }) || fired;
    }
    if (fired && soundWait <= 0) {
      sfx('enemyShot');
      soundWait = .14;
    }
    return fired;
  }

  function attackEnemy(o, p, dt) {
    const def = roles[o.role];
    if (p.dead || !def.rate || o.y < 56 || o.y > p.y - 154 || o.x < 25 || o.x > W - 25) return;
    const speed = 162 + S.level * 9;
    if (o.state !== 'attack' && o.state !== 'reposition') {
      o.burst = 0;
      return;
    }
    o.shoot -= dt;
    if (o.burst) {
      o.burstDelay -= dt;
      if (o.burstDelay <= 0) {
        spreadAt(o, p, 1, 0, {speed:speed + 38, size:9, kind:'ion'});
        o.burst--;
        o.burstDelay = .145;
      }
    }
    if (o.shoot > 0) return;
    if (o.role === 'bomber') {
      const missile = (o.shots || 0) % 2 === 0;
      spreadAt(o, p, missile ? 2 : 3, missile ? .24 : .18, missile
        ? {speed:speed * .79, size:13, kind:'missile', homing:.58, ttl:5.1}
        : {speed:speed + 19, size:12, kind:'plasma'});
    } else if (o.role === 'interceptor') {
      o.burst = S.level >= 4 ? 3 : 2;
      o.burstDelay = .05;
    } else {
      spreadAt(o, p, o.role === 'shield' ? 2 : 1, .18,
        {speed:speed + (o.role === 'drone' ? 28 : 0), size:10, kind:o.role === 'shield' ? 'plasma' : 'bolt'});
    }
    o.shots = (o.shots || 0) + 1;
    o.shoot = def.rate * (1 - S.level * .025) + (o.slot % 3) * .17;
    o.flash = .14;
  }

  function updateLinks() {
    const air = S.enemies;
    for (const source of air) {
      if (source.role !== 'support') continue;
      source.connected = [];
      if (source.dead || source.y < 65 || source.y > H * .57) continue;
      for (const target of air) {
        if (target === source || target.dead || target.role === 'support' || target.group !== source.group) continue;
        if (Math.hypot(target.x - source.x, target.y - source.y) > 170) continue;
        target.link = .16;
        source.connected.push(target);
      }
    }
  }

  function updateStructures(dt, p) {
    const scroll = LEVELS[S.level].scroll;
    for (let i = S.turrets.length - 1; i >= 0; i--) {
      const t = S.turrets[i];
      const def = surfaceRoles[t.role];
      t.t += dt;
      t.flash = Math.max(0, t.flash - dt);
      t.fireFlash = Math.max(0, t.fireFlash - dt);
      const cruise = t.naval ? def.cruise : 0;
      if (t.dead) t.deathAge += dt;
      t.y += (scroll + cruise * (t.dead ? .10 : 1)) * dt;
      if (t.naval && !t.dead) {
        const nextX = t.homeX + Math.sin(t.t * .95) * (t.role === 'patrol' ? 20 : 12);
        t.angle = Math.atan2(t.x - nextX, (scroll + cruise) * dt);
        t.x = nextX;
      }
      if (t.y > H + t.ry || (t.dead && t.deathAge > (t.naval ? 3.4 : 3))) {
        S.turrets.splice(i, 1);
        continue;
      }
      if (t.dead || t.y < 95 || t.y > p.y - 190 || p.dead) {
        t.warn = 0;
        continue;
      }
      if (t.shoot > .48) t.targetAngle = rotateToward(t.targetAngle, Math.atan2(p.y - t.y, p.x - t.x), 3.6 * dt);
      t.shoot -= dt;
      t.warn = t.shoot <= .48 ? clamp(1 - t.shoot / .48, 0, 1) : 0;
      if (t.shoot > 0) continue;
      const missile = t.kind === 'missile';
      const count = t.kind === 'mini' ? 4 : t.role === 'gunboat' ? 3 : missile ? 1 : 2;
      const aim = {x:t.x + Math.cos(t.targetAngle) * 500, y:t.y + Math.sin(t.targetAngle) * 500};
      const fired = spreadAt(t, aim, count, t.role === 'gunboat' ? .24 : .13, {
        kind:missile || t.kind === 'plasma' ? t.kind : 'bolt',
        homing:missile ? .45 : 0, size:missile ? 14 : 11, speed:170 + S.level * 8
      });
      t.warn = 0;
      if (fired) t.fireFlash = .18;
      t.shoot = fired ? def.rate : .74;
    }
  }

  function updateActors(dt) {
    const p = S.player;
    if (!p || dt <= 0) return;
    soundWait = Math.max(0, soundWait - dt);
    impactSoundWait = Math.max(0, impactSoundWait - dt);
    if (hitPlayerX !== undefined) {
      playerVx = approach(playerVx, clamp((p.x - hitPlayerX) / dt, -540, 540), 9, dt);
      playerVy = approach(playerVy, clamp((p.y - hitPlayerY) / dt, -540, 540), 9, dt);
    }
    hitPlayerX = p.x;
    hitPlayerY = p.y;
    scheduleWaves();
    updateStructures(dt, p);
    for (let i = S.enemies.length - 1; i >= 0; i--) {
      const o = S.enemies[i];
      o.t += dt;
      o.stateTime += dt;
      o.link = Math.max(0, o.link - dt);
      o.flash = Math.max(0, o.flash - dt);
      o.evadeCooldown -= dt;
      const x = o.x;
      const y = o.y;
      moveEnemy(o, p, dt);
      attackEnemy(o, p, dt);
      if (o.y > H + 85) {
        S.enemies.splice(i, 1);
        continue;
      }
      const playerR = p.shield > 0 ? 33 : ship().hitbox;
      if (!p.dead && Number.isFinite(ellipseContact(x, y, o.x, o.y, p,
          o.rx * .65 + playerR, o.ry * .69 + playerR))) {
        S.enemies.splice(i, 1);
        killEnemy(o);
        hitPlayer(o.x, o.y);
      }
    }
    updateLinks();
  }

  function ellipseContact(x1, y1, x2, y2, target, rx, ry) {
    const angle = rx === ry ? 0 : target.angle || 0;
    const extentX = angle ? Math.max(rx, ry) : rx;
    const extentY = angle ? extentX : ry;
    if (target.x + extentX < Math.min(x1, x2) || target.x - extentX > Math.max(x1, x2) ||
        target.y + extentY < Math.min(y1, y2) || target.y - extentY > Math.max(y1, y2)) return Infinity;
    const sin = angle ? Math.sin(angle) : 0;
    const cos = angle ? Math.cos(angle) : 1;
    const startX = x1 - target.x;
    const startY = y1 - target.y;
    const spanX = x2 - x1;
    const spanY = y2 - y1;
    const ox = (startX * cos + startY * sin) / rx;
    const oy = (-startX * sin + startY * cos) / ry;
    const dx = (spanX * cos + spanY * sin) / rx;
    const dy = (-spanX * sin + spanY * cos) / ry;
    const c = ox * ox + oy * oy - 1;
    if (c <= 0) return 0;
    const a = dx * dx + dy * dy;
    if (a < 1e-10) return Infinity;
    const b = ox * dx + oy * dy;
    const d = b * b - a * c;
    if (d < 0) return Infinity;
    const t = (-b - Math.sqrt(d)) / a;
    return t >= 0 && t <= 1 ? t : Infinity;
  }

  function marked(statsOwner) {
    if (!statsOwner.hit) {
      statsOwner.hit = true;
      S.stats.hits++;
    }
  }

  function addImpact(x, y, color, size = 12, heavy = false, silent = false) {
    const limit = 14 + quality() * 12;
    if (impacts.length < limit) impacts.push({x, y, color, size, heavy, life:heavy ? .43 : .23, seed:Math.random() * 7});
    if (!silent && impactSoundWait <= 0) {
      sfx('enemyImpact');
      impactSoundWait = .09;
    }
  }

  function liveTargets() {
    const targets = [];
    for (const e of S.enemies) if (!e.dead && e.hp > 0 && e.y > 9 && e.x > 6 && e.x < W - 6) targets.push(e);
    for (const t of S.turrets) if (!t.dead && t.hp > 0 && t.y > 9) targets.push(t);
    for (const b of bossTargets()) {
      if (b.y + b.ry > 0) targets.push(b);
    }
    return targets;
  }

  function damageTarget(target, amount, x, y, metadata, aoe = false) {
    if (target.dead || target.hp <= 0) return false;
    if (target.targetType !== 'enemy' && target.targetType !== 'ground') {
      return bossHit(target, amount, x, y, metadata);
    }
    if (target.shield > 0) {
      const drain = amount * (metadata.piercing ? 2.25 : 1);
      target.shield -= drain;
      if (target.shield <= 0) {
        sfx('armorBreak');
        addImpact(x, y, '#88f4ff', 33, true, true);
        amount = Math.max(0, -target.shield) * .6;
      } else {
        addImpact(x, y, '#88f4ff', 9, false, true);
        amount = 0;
      }
    }
    if (target.link > 0) amount *= metadata.piercing ? .87 : .64;
    target.hp -= amount;
    target.flash = .16;
    if (amount > 0) addImpact(x, y, palette[metadata.ship][1], aoe ? 17 : 10);
    if (target.hp > 0) return true;
    target.dead = true;
    if (target.targetType === 'enemy') {
      killEnemy(target);
      if (target.role === 'support' && S.equipment.length < 4) spawnDrop('weapon', target.x, target.y);
      const i = S.enemies.indexOf(target);
      if (i >= 0) S.enemies.splice(i, 1);
    } else {
      const surface = surfaceRoles[target.role];
      S.score += (target.role === 'gunboat' ? 525 : 280) + S.level * 40;
      S.stats.kills++;
      target.warn = 0;
      target.fireFlash = 0;
      target.deathAge = 0;
      addImpact(target.x, target.y, '#ffb56f', 53, true, true);
      S.fx.push({type:'boom', x:target.x, y:target.y, life:.48, maxLife:.48, scale:.58});
      if (surface.reward) spawnDrop('weapon', target.x, target.y);
      sfx('explode');
    }
    return true;
  }

  function addPlayerBullet(p, dx, vx, vy, damage, size, options = {}) {
    if (S.pBullets.length >= 135) return null;
    const selected = ship();
    const b = {
      x:p.x + dx, y:p.y - 31, vx, vy, damage:damage * selected.damageMul,
      size, ship:selected.id, tier:Math.min(5, S.weapon), kind:'primary', ttl:2.2,
      hit:false, turn:0, ...options
    };
    S.stats.shots++;
    S.pBullets.push(b);
    return b;
  }

  function firePlayer() {
    const p = S.player;
    if (!S.running || p.cool > 0 || p.dead || S.bossDeath) return;
    const sh = ship();
    const tier = Math.min(5, S.weapon);
    const pair = (dx, vx, vy, damage, size, opts) => {
      addPlayerBullet(p, -dx, -vx, vy, damage, size, opts);
      addPlayerBullet(p, dx, vx, vy, damage, size, opts);
    };
    p.cool = sh.fire * (1 - (tier - 1) * .035);
    if (sh.id === 'blue') {
      addPlayerBullet(p, 0, 0, -825, 2.2 + tier * .16, 8 + tier);
      if (tier >= 2) pair(12, 9, -810, .78, 6);
      if (tier >= 4) pair(25, 84, -755, .9, 8);
      if (tier === 5) addPlayerBullet(p, 0, 0, -870, 1.55, 11);
    } else if (sh.id === 'green') {
      const piercing = tier >= 3;
      addPlayerBullet(p, 0, 0, -725, 3 + tier * .39, 11 + tier * 1.4,
        {piercing, remaining:piercing ? tier >= 5 ? 3 : 2 : 1});
      if (tier >= 2) pair(19, tier >= 4 ? 46 : 17, -740, tier >= 4 ? 1.16 : .73, 7 + tier);
    } else if (sh.id === 'red') {
      addPlayerBullet(p, 0, 0, -935, 2.14 + tier * .14, 7);
      if (tier >= 2) pair(11, 24, -920, .72, 6);
      if (tier >= 3) pair(20, 101, -860, .63, 7);
      if (tier === 5) pair(29, 182, -778, .63, 7);
    } else {
      const halfSpread = tier === 1 ? 0 : tier >= 4 ? 2 : 1;
      for (let i = -halfSpread; i <= halfSpread; i++) {
        addPlayerBullet(p, i * 15, i * (tier >= 4 ? 75 : 34), -785 - tier * 12,
          i ? .8 + tier * .08 : 2.02 + tier * .23, i ? 8 : 8 + tier * 1.4);
      }
      if (tier === 5) pair(35, 225, -745, .85, 9);
    }
    sfx('shot');
  }

  function missileTargets(b, targets, assigned) {
    let best = null;
    let bestCost = Infinity;
    for (const target of targets) {
      if (target.dead || target.hp <= 0 || target.y > b.y + 26) continue;
      const cost = Math.hypot(target.x - b.x, target.y - b.y)
        + (assigned.get(target.id) || 0) * 340
        + (target.kind === 'bossCore' ? 230 : 0);
      if (cost < bestCost) {
        bestCost = cost;
        best = target;
      }
    }
    return best;
  }

  function rotateToward(current, desired, step) {
    const diff = Math.atan2(Math.sin(desired - current), Math.cos(desired - current));
    return current + clamp(diff, -step, step);
  }

  function targetContact(b, x1, y1, targets) {
    let chosen = null;
    let earliest = Infinity;
    for (const target of targets) {
      if (target.dead || target.hp <= 0 || b.contacted?.has(target.id)) continue;
      const radius = b.size * .43;
      const distance = ellipseContact(x1, y1, b.x, b.y, target, target.rx + radius, target.ry + radius);
      if (distance < earliest) {
        earliest = distance;
        chosen = target;
      }
    }
    return chosen ? {target:chosen, fraction:earliest} : null;
  }

  function emitTrail(b, x, y, dt) {
    if (quality() === 0 || trails.length >= 33 + quality() * 38) return;
    b.trailTimer = (b.trailTimer || 0) - dt;
    if (b.trailTimer > 0) return;
    b.trailTimer = quality() === 1 ? .05 : .032;
    trails.push({x, y, ship:b.ship, size:b.ship === 'blue' ? 10 : 7, life:.24, vx:b.vx * .064, vy:b.vy * .06});
  }

  function updatePlayerShots(dt, targets) {
    let assigned;
    let available;
    if (S.pBullets.some(b => b.turn)) {
      assigned = new Map();
      available = new Map(targets.map(t => [t.id, t]));
      for (const b of S.pBullets) {
        if (!b.turn || !available.has(b.target)) continue;
        assigned.set(b.target, (assigned.get(b.target) || 0) + 1);
      }
    }
    for (let i = S.pBullets.length - 1; i >= 0; i--) {
      const b = S.pBullets[i];
      const oldX = b.x;
      const oldY = b.y;
      b.ttl -= dt;
      if (b.turn) {
        let target = available.get(b.target);
        if (!target || target.dead || target.hp <= 0) {
          target = missileTargets(b, targets, assigned);
          b.target = target?.id;
          if (target) assigned.set(target.id, (assigned.get(target.id) || 0) + 1);
        }
        let angle = Math.atan2(b.vy, b.vx);
        const speed = Math.min(b.maxSpeed, Math.hypot(b.vx, b.vy) + b.accel * dt);
        if (target && b.age >= b.launchDelay) {
          angle = rotateToward(angle, Math.atan2(target.y - b.y, target.x - b.x), b.turn * dt);
        }
        b.age += dt;
        b.vx = Math.cos(angle) * speed;
        b.vy = Math.sin(angle) * speed;
        emitTrail(b, oldX, oldY, dt);
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.ttl <= 0 || b.x < -70 || b.x > W + 70 || b.y < -75 || b.y > H + 60) {
        S.pBullets.splice(i, 1);
        continue;
      }
      let segmentStartX = oldX;
      let segmentStartY = oldY;
      for (;;) {
        const contact = targetContact(b, segmentStartX, segmentStartY, targets);
        if (!contact) break;
        const {target, fraction} = contact;
        const cx = segmentStartX + (b.x - segmentStartX) * fraction;
        const cy = segmentStartY + (b.y - segmentStartY) * fraction;
        const landed = damageTarget(target, b.damage, cx, cy, b);
        if (landed) marked(b);
        if (S.bossDeath) return;
        if (b.turn && landed) {
          const range = b.kind === 'blueMissile' ? 56 : 37;
          if (target.targetType === 'enemy' || target.targetType === 'ground') {
            for (const near of targets) {
              if (near === target || (near.targetType !== 'enemy' && near.targetType !== 'ground') ||
                  Math.hypot(near.x - cx, near.y - cy) >= range) continue;
              damageTarget(near, b.damage * .33, cx, cy, b, true);
            }
          }
          addImpact(cx, cy, palette[b.ship][1], range * .75, true);
        }
        if (landed && (!b.piercing || --b.remaining <= 0)) {
          S.pBullets.splice(i, 1);
          break;
        }
        if (!b.contacted) b.contacted = new Set();
        b.contacted.add(target.id);
        segmentStartX = cx;
        segmentStartY = cy;
      }
    }
  }

  function updateHostileShots(dt) {
    const p = S.player;
    for (let i = S.eBullets.length - 1; i >= 0; i--) {
      const b = S.eBullets[i];
      const x = b.x;
      const y = b.y;
      b.life = (b.life || 0) + dt;
      if (b.homing && !p.dead && b.life < 2.5 && p.y > b.y - 65) {
        const heading = Math.atan2(b.vy, b.vx);
        const aim = Math.atan2(p.y - b.y, p.x - b.x);
        const speed = b.speed ?? Math.hypot(b.vx, b.vy);
        const angle = rotateToward(heading, aim, b.homing * dt);
        b.vx = Math.cos(angle) * speed;
        b.vy = Math.sin(angle) * speed;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.life >= (b.ttl || 7) || b.x < -45 || b.x > W + 45 || b.y < -60 || b.y > H + 45) {
        S.eBullets.splice(i, 1);
        continue;
      }
      const radius = (p.shield > 0 ? 35 : ship().hitbox) + b.size * .42;
      const contact = p.dead ? Infinity : ellipseContact(x, y, b.x, b.y, p, radius, radius);
      if (Number.isFinite(contact)) {
        S.eBullets.splice(i, 1);
        hitPlayer(x + (b.x - x) * contact, y + (b.y - y) * contact);
        if (!S.running || p.dead) return;
      }
    }
  }

  function special() {
    const p = S.player;
    if (!S.running || S.paused || S.transition || S.bossDeath || !S.special || S.specialCooldown > 0 || !p || p.dead) return false;
    const sh = ship();
    S.special = 0;
    S.specialCooldown = cooldowns[sh.id];
    setSpecialStatus();
    showMsg(sh.specialName, 1.3);
    attack = {ship:sh.id, t:0, x:p.x, y:p.y - 32, emitted:0, hit:false, age:0, tick:0, struck:new Set()};
    if (sh.id === 'blue') sfx('lockOn');
    else if (sh.id === 'red') sfx('redSwarm');
    else sfx(sh.id === 'green' ? 'lanceCharge' : 'solarCharge');
    return true;
  }

  function launchMissile(a, p) {
    const blue = a.ship === 'blue';
    const slot = a.emitted % (blue ? 2 : 4);
    const side = slot % 2 ? 1 : -1;
    const spread = blue ? .24 + (a.emitted % 4) * .105 : .22 + (slot >> 1) * .53;
    const angle = -Math.PI / 2 + side * spread;
    const launchSpeed = blue ? 325 : 445;
    addPlayerBullet(p, side * (slot > 1 ? 23 : 14), Math.cos(angle) * launchSpeed,
      Math.sin(angle) * launchSpeed, blue ? 15.3 : 8.1, blue ? 12 : 10, {
        kind:blue ? 'blueMissile' : 'redRocket', turn:blue ? 4.7 : 6.3,
        age:0, maxSpeed:blue ? 685 : 745, accel:blue ? 450 : 620, ttl:2.65,
        launchDelay:blue ? .15 : slot > 1 ? .22 : .09
      });
  }

  function updateBeam(a, p, dt, targets) {
    const green = a.ship === 'green';
    const charge = green ? .45 : .53;
    const duration = green ? .32 : 1.22;
    const radius = green ? 46 : 33;
    if (a.t <= charge) {
      a.x = p.x;
      a.y = p.y - 30;
      return false;
    }
    if (!a.emitted) {
      a.emitted = 1;
      S.stats.shots++;
      sfx(green ? 'lanceFire' : 'solarFire');
      addImpact(a.x, a.y, palette[a.ship][1], green ? 64 : 48, true, true);
      S.shake = Math.max(S.shake || 0, green ? .16 : .10);
    }
    if (a.t > charge + duration) return true;
    if (!green) {
      a.x = approach(a.x, p.x, 13, dt);
      a.y = p.y - 31;
    }
    a.tick -= dt;
    if (a.tick > 0) return false;
    a.tick += green ? .3 : .10;
    const metadata = {ship:a.ship, kind:green ? 'greenLance' : 'solarBeam', piercing:true};
    for (const target of targets) {
      if (target.dead || target.hp <= 0 || target.y - target.ry > a.y - 16) continue;
      if (Math.abs(target.x - a.x) > target.rx + radius) continue;
      if (green && a.struck.has(target.id)) continue;
      const impactX = clamp(a.x, target.x - target.rx * .7, target.x + target.rx * .7);
      const impactY = Math.min(a.y, target.y + target.ry * .55);
      if (damageTarget(target, green ? 52 : 5.7, impactX, impactY, metadata)) {
        marked(a);
        if (green) a.struck.add(target.id);
        if (S.bossDeath) return true;
        addImpact(impactX, impactY, palette[a.ship][1], green ? 28 : 13, green, true);
      }
    }
    return false;
  }

  function updateAttack(dt, targets) {
    if (!attack) return;
    const p = S.player;
    if (p.dead || S.bossDeath) {
      attack = null;
      return;
    }
    attack.t += dt;
    const a = attack;
    if (a.ship === 'green' || a.ship === 'gold') {
      if (updateBeam(a, p, dt, targets)) attack = null;
      return;
    }
    const blue = a.ship === 'blue';
    const delay = blue ? .34 : .12;
    const count = blue ? 8 : 16;
    const interval = blue ? .14 : .115;
    const groupSize = blue ? 2 : 4;
    const desired = a.t < delay ? 0 : Math.min(count, (1 + Math.floor((a.t - delay) / interval)) * groupSize);
    while (a.emitted < desired) {
      launchMissile(a, p);
      a.emitted++;
    }
    a.x = p.x;
    a.y = p.y - 32;
    if (a.t > 1.12) attack = null;
  }

  function ageEffects(dt) {
    for (let i = trails.length - 1; i >= 0; i--) {
      const trail = trails[i];
      trail.life -= dt;
      if (trail.life <= 0) trails.splice(i, 1);
      else {
        trail.x += trail.vx * dt;
        trail.y += trail.vy * dt;
      }
    }
    for (let i = impacts.length - 1; i >= 0; i--) {
      impacts[i].life -= dt;
      if (impacts[i].life <= 0) impacts.splice(i, 1);
    }
  }

  function updateProjectiles(dt) {
    const targets = S.pBullets.length || attack ? liveTargets() : [];
    ageEffects(dt);
    updateAttack(dt, targets);
    if (!S.bossDeath) updatePlayerShots(dt, targets);
    if (!S.bossDeath) updateHostileShots(dt);
    else {
      attack = null;
      trails.length = impacts.length = 0;
    }
  }

  function ring(x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  }

  function drawGround() {
    for (const t of S.turrets) drawGroundObject(t);
  }

  function drawWarning(signal) {
    const p = clamp((signal.due - S.levelTime) / .9, 0, 1);
    const side = signal.entry !== 'top';
    const x = signal.entry === 'left' ? 18 : signal.entry === 'right' ? W - 18 : signal.x;
    const y = side ? signal.y : 117;
    ctx.save();
    ctx.translate(x, y);
    if (side) ctx.rotate(signal.entry === 'left' ? -Math.PI / 2 : Math.PI / 2);
    ctx.globalAlpha = .54 + (1 - p) * .31;
    ctx.fillStyle = '#211a11';
    ctx.strokeStyle = '#ffc56d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -7);
    ctx.lineTo(10, -7);
    ctx.lineTo(0, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawEnemies() {
    for (const signal of warningQueue) drawWarning(signal);
    ctx.save();
    ctx.lineWidth = 1.8;
    for (const o of S.enemies) {
      if (o.role !== 'support' || !o.connected?.length) continue;
      ctx.globalAlpha = .52;
      ctx.strokeStyle = '#92efb8';
      ctx.setLineDash([5, 4]);
      for (const ally of o.connected) {
        if (ally.dead) continue;
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(ally.x, ally.y);
        ctx.stroke();
      }
    }
    ctx.restore();
    for (const o of S.enemies) {
      if (o.role === 'diver' && o.state === 'detect') {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,152,111,.52)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + 19);
        ctx.quadraticCurveTo(o.aimX, o.y + (o.aimY - o.y) * .40, o.aimX, o.aimY);
        ctx.stroke();
        ring(o.aimX, o.aimY, 22, 22);
        ctx.stroke();
        ctx.restore();
      }
      drawEnemyUnit(o);
      if (o.shield > 0 || o.link > 0) {
        ctx.save();
        ctx.lineWidth = o.shield > 0 ? 2.5 : 1.8;
        ctx.strokeStyle = o.shield > 0 ? 'rgba(122,233,255,.87)' : 'rgba(142,249,172,.67)';
        ctx.fillStyle = o.shield > 0 ? 'rgba(74,211,250,.13)' : 'rgba(118,243,165,.10)';
        ring(o.x, o.y, o.rx + 6, o.ry + 4);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (o.role === 'support' || o.role === 'diver' || o.role === 'bomber') {
        const def = roles[o.role];
        ctx.save();
        ctx.fillStyle = def.color;
        ctx.fillRect(o.x - 9, o.y - o.ry - 10, 18, 3);
        if (o.role === 'support') ctx.fillRect(o.x - 1.5, o.y - o.ry - 17, 3, 16);
        ctx.restore();
      }
    }
  }

  function drawPlayerShots() {
    for (const t of trails) {
      const alpha = t.life / .24;
      ctx.globalAlpha = alpha * .32;
      ctx.fillStyle = palette[t.ship][1];
      ring(t.x, t.y, t.size * (1.4 - alpha * .5), t.size * (1.4 - alpha * .5));
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const b of S.pBullets) {
      const [core, edge] = palette[b.ship];
      const half = b.turn ? 15 : 12 + b.tier * 1.7;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
      ctx.fillStyle = edge;
      if (b.turn) {
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(b.size * .43, 5);
        ctx.lineTo(b.size * .30, 12);
        ctx.lineTo(-b.size * .30, 12);
        ctx.lineTo(-b.size * .43, 5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = core;
        ctx.fillRect(-2.1, -8, 4.2, 22);
        ctx.fillStyle = '#fff8d9';
        ctx.fillRect(-1.8, 12, 3.6, 9 + Math.sin(b.age * 45) * 3);
      } else {
        const width = b.size * .62;
        if (b.ship === 'gold' || b.ship === 'green') {
          ring(0, 0, width * .7, half);
          ctx.fill();
        } else ctx.fillRect(-width * .5, -half, width, half * 1.85);
        ctx.fillStyle = core;
        ctx.fillRect(-width * .22, -half * .78, width * .44, half * 1.32);
      }
      ctx.restore();
    }
  }

  function drawHostileShots() {
    for (const b of S.eBullets) {
      const [core, edge] = hostileColors[b.kind] || hostileColors.bolt;
      const radius = b.size / 2;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx));
      ctx.fillStyle = b.color && b.color.startsWith('#') ? b.color : edge;
      if (b.kind === 'missile') {
        ctx.beginPath();
        ctx.moveTo(radius * 1.55, 0);
        ctx.lineTo(-radius * .95, radius * .82);
        ctx.lineTo(-radius * 1.5, 0);
        ctx.lineTo(-radius * .95, -radius * .82);
        ctx.closePath();
      } else ring(0, 0, radius * (b.kind === 'flame' ? 1.4 : 1), radius);
      ctx.fill();
      ctx.fillStyle = core;
      ring(radius * .18, 0, radius * .55, radius * .49);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawReticle(target, tint, scale = 1) {
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.strokeStyle = tint;
    ctx.lineWidth = 2.2;
    const r = (Math.max(target.rx, target.ry) * .64 + 11) * scale;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-r, -r * .52);
      ctx.lineTo(-r, -r);
      ctx.lineTo(-r * .52, -r);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSpecial() {
    if (!attack && !S.pBullets.some(b => b.turn && b.target)) return;
    const a = attack;
    const targets = liveTargets();
    const locks = new Set();
    for (const b of S.pBullets) if (b.turn && b.target) locks.add(b.target);
    if (a?.ship === 'blue' && a.t < .34) {
      const ordered = targets.map(t => ({t, d:Math.hypot(t.x - a.x, t.y - a.y) + (t.kind === 'bossCore' ? 230 : 0)}));
      ordered.sort((u, v) => u.d - v.d);
      for (const {t} of ordered.slice(0, 5)) locks.add(t.id);
    }
    for (const t of targets) {
      if (!locks.has(t.id)) continue;
      const b = S.pBullets.find(projectile => projectile.target === t.id);
      drawReticle(t, b?.ship === 'red' ? '#ffb58a' : '#89e8ff', a?.ship === 'blue' && a.t < .34 ? 1.2 - a.t * .6 : 1);
    }
    if (!a || a.ship === 'blue' || a.ship === 'red') return;
    const green = a.ship === 'green';
    const charge = green ? .45 : .53;
    const [core, edge] = palette[a.ship];
    ctx.save();
    if (a.t < charge) {
      const q = a.t / charge;
      ctx.globalAlpha = .25 + q * .46;
      ctx.strokeStyle = edge;
      ctx.lineWidth = 1.7;
      ctx.setLineDash([11, 9]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 2.8;
      ring(a.x, a.y, 7 + q * 23, 7 + q * 23);
      ctx.stroke();
      ctx.fillStyle = core;
      ring(a.x, a.y, 4 + q * 10, 4 + q * 10);
      ctx.fill();
    } else {
      const phase = (a.t - charge) / (green ? .32 : 1.22);
      const strength = Math.min(1, (1 - phase) * 4);
      const radius = green ? 46 : 33;
      ctx.globalAlpha = (reducedEffects() ? .40 : .60) * strength;
      ctx.fillStyle = edge;
      ctx.fillRect(a.x - radius, 0, radius * 2, a.y);
      ctx.globalAlpha = .78 * strength;
      ctx.fillStyle = core;
      ctx.fillRect(a.x - radius * .34, 0, radius * .68, a.y);
      ctx.globalAlpha = .36 * strength;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(a.x - radius * .15, 0, radius * .3, a.y);
      if (green) {
        ctx.globalAlpha = (1 - phase) * .58;
        ctx.strokeStyle = core;
        ctx.lineWidth = 3;
        ring(a.x, a.y, 9 + 150 * phase, 5 + 60 * phase);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawForeground() {
    ctx.save();
    for (const f of impacts) {
      const progress = 1 - f.life / (f.heavy ? .43 : .23);
      const brightness = reducedEffects() ? .62 : 1;
      ctx.globalAlpha = (1 - progress) * .84 * brightness;
      ctx.strokeStyle = f.color;
      ctx.lineWidth = f.heavy ? 2.8 : 1.8;
      if (f.heavy) {
        ring(f.x, f.y, 2 + f.size * progress, 2 + f.size * progress);
        ctx.stroke();
      }
      const count = f.heavy ? 8 : 4;
      for (let i = 0; i < count; i++) {
        const angle = f.seed + i * Math.PI * 2 / count;
        const outer = f.size * (.35 + progress * 1.3);
        ctx.beginPath();
        ctx.moveTo(f.x + Math.cos(angle) * outer * .64, f.y + Math.sin(angle) * outer * .64);
        ctx.lineTo(f.x + Math.cos(angle) * outer, f.y + Math.sin(angle) * outer);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  return {reset, addEnemy, spawnHostile, updateActors, firePlayer, special, updateProjectiles,
    drawGround, drawEnemies, drawPlayerShots, drawHostileShots, drawSpecial, drawForeground};
}
