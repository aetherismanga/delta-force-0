/* Encounters are defined in normalized sprite coordinates, including each detachable part. */
const BossV6 = (() => {
  const part = (id, label, kind, x, y, rx, ry, hp, weapon, art) =>
    ({ id, label, kind, x, y, rx, ry, hp, weapon, art });
  const attack = (mode, kind, count, spread, speed, warning = .54) =>
    ({ mode, kind, count, spread, speed, warning });
  const ENCOUNTERS = [
    {
      intro: 'Vise le radar avant de remonter jusqu’au poste de commandement.',
      name: 'Forteresse tropicale', width: 270, height: 337, anchor: 270, hp: 725,
      hue: '#ffcc70', phase: [.76, .51, .26], stages: ['Défenses extérieures brisées', 'Poste de commandement isolé', 'Poste de commandement exposé'],
      core: [.50, .49, .117, .125], motion: 'fortress', support: ['fighter', 'fighter'],
      parts: [
        part('battery-l', 'Batterie bâbord', 'gun', .16, .31, .068, .099, 38, 'fan'),
        part('battery-r', 'Batterie tribord', 'gun', .84, .31, .068, .099, 38, 'fan'),
        part('engine-l', 'Réacteur bâbord', 'engine', .335, .55, .063, .080, 42),
        part('engine-r', 'Réacteur tribord', 'engine', .665, .55, .063, .080, 42),
        part('armor', 'Blindage du commandement', 'armor', .50, .69, .099, .074, 70),
        part('radar', 'Radar de conduite de tir', 'radar', .666, .266, .060, .051, 55),
        part('tail-gun', 'Canon arrière', 'gun', .50, .86, .071, .047, 53, 'salvo')
      ],
      attacks: [attack('aim', 'bolt', 3, .19, 207), attack('cross', 'bolt', 5, .19, 198), attack('sweep', 'flame', 5, .20, 222)],
      wreck: { time: 5.05, mode: 'fall', color: '#ffd08a', events: [[.13, 'battery-l'], [.44, 'battery-r'], [.67, 'tail-gun'], [.92, 'armor'], [1.15, 'engine-l'], [1.46, 'engine-r'], [1.88, 'radar'], [2.36, 'core', 2.4], [2.91, 'core', 1]] }
    },
    {
      intro: 'Les relais latéraux protègent le pont. Les soutes alimentent les missiles.',
      name: 'Cuirassé fluvial', width: 156, height: 392, anchor: 292, hp: 775,
      hue: '#8be5ff', phase: [.77, .49, .24], stages: ['Bordés perforés', 'Salle des machines en feu', 'Dernière batterie du cuirassé'],
      core: [.50, .57, .225, .161], motion: 'river', support: ['interceptor'],
      parts: [
        part('shield-l', 'Relais de bouclier bâbord', 'shield', .145, .265, .099, .059, 62),
        part('shield-r', 'Relais de bouclier tribord', 'shield', .855, .265, .099, .059, 62),
        part('gun', 'Tourelle lourde', 'gun', .50, .41, .157, .064, 57, 'salvo'),
        part('missiles', 'Batterie de missiles', 'missile', .50, .695, .175, .059, 56, 'missile'),
        part('engine-l', 'Propulsion bâbord', 'engine', .265, .774, .109, .054, 48),
        part('engine-r', 'Propulsion tribord', 'engine', .735, .774, .109, .054, 48),
        part('radar', 'Mât de visée', 'radar', .50, .225, .14, .060, 59),
        part('magazine', 'Soute à missiles', 'magazine', .50, .864, .134, .049, 63)
      ],
      attacks: [attack('cross', 'ion', 4, .22, 219), attack('wave', 'bolt', 5, .21, 216), attack('aim', 'plasma', 4, .26, 237)],
      wreck: { time: 5.35, mode: 'sink', color: '#abd9f0', events: [[.10, 'missiles'], [.36, 'magazine', 1.3], [.62, 'shield-r'], [.94, 'gun'], [1.25, 'engine-r'], [1.48, 'radar'], [1.69, 'shield-l'], [1.93, 'engine-l'], [2.58, 'core', 2.6], [3.40, 'core', 1.1]] }
    },
    {
      intro: 'Ouvre le blindage. Chaque conduite perdue affaiblit les tirs cryogéniques.',
      name: 'Forteresse arctique', width: 340, height: 318, anchor: 267, hp: 845,
      hue: '#b2edff', phase: [.74, .50, .27], stages: ['Plaques cryogéniques fissurées', 'Circuits de refroidissement endommagés', 'Cœur arctique à découvert'],
      core: [.50, .45, .112, .18], motion: 'arctic', support: ['drone', 'interceptor'],
      parts: [
        part('armor-l', 'Blindage cryogénique bâbord', 'armor', .146, .463, .080, .070, 76),
        part('armor-r', 'Blindage cryogénique tribord', 'armor', .854, .463, .080, .070, 76),
        part('engine-l', 'Turbine bâbord', 'engine', .269, .565, .049, .112, 51),
        part('engine-r', 'Turbine tribord', 'engine', .731, .565, .049, .112, 51),
        part('shield', 'Condensateur cryogénique', 'shield', .50, .765, .051, .071, 54),
        part('coil', 'Canon à induction', 'plasma', .50, .273, .049, .100, 55, 'plasma'),
        part('coolant-l', 'Circuit cryogénique bâbord', 'coolant', .278, .334, .045, .062, 60),
        part('coolant-r', 'Circuit cryogénique tribord', 'coolant', .722, .334, .045, .062, 60)
      ],
      attacks: [attack('sweep', 'ion', 5, .21, 211), attack('split', 'plasma', 6, .18, 244), attack('cross', 'ion', 6, .24, 238)],
      wreck: { time: 5.50, mode: 'fall', color: '#a8eaff', events: [[.15, 'armor-l'], [.39, 'armor-r'], [.55, 'coolant-r'], [.78, 'coil'], [1.06, 'coolant-l'], [1.30, 'engine-r'], [1.61, 'engine-l'], [1.98, 'shield'], [2.72, 'core', 2.5], [3.17, 'core', 1.3]] }
    },
    {
      intro: 'Quatre tourelles défendent le pont. Les catapultes lancent les renforts.',
      name: 'Porte-avions Titan', width: 230, height: 438, anchor: 307, hp: 945,
      hue: '#ffc090', phase: [.75, .52, .25], stages: ['Pont d’envol sous le feu', 'Coque du Titan ouverte', 'Centre de commandement exposé'],
      core: [.50, .47, .131, .167], motion: 'carrier', support: ['fighter', 'interceptor'],
      parts: [
        part('cannon', 'Canon principal', 'gun', .252, .267, .103, .066, 66, 'salvo', 'carrierTurretCannon'),
        part('missile', 'Lance-missiles du pont', 'missile', .748, .267, .103, .066, 66, 'missile', 'carrierTurretMissile'),
        part('triple', 'Batterie triple', 'gun', .218, .645, .103, .066, 70, 'fan', 'carrierTurretTriple'),
        part('rotary', 'Canon rotatif', 'plasma', .782, .645, .103, .066, 70, 'plasma', 'carrierTurretRotary'),
        part('hangar', 'Hangar du pont', 'hangar', .50, .705, .110, .082, 65),
        part('engine', 'Salle des machines', 'engine', .50, .875, .076, .055, 62),
        part('catapult-l', 'Catapulte bâbord', 'catapult', .285, .452, .084, .077, 72),
        part('catapult-r', 'Catapulte tribord', 'catapult', .715, .452, .084, .077, 72),
        part('radar', 'Radar de la passerelle', 'radar', .50, .155, .084, .064, 65)
      ],
      attacks: [attack('split', 'bolt', 6, .20, 215), attack('wave', 'ion', 6, .22, 225), attack('cross', 'plasma', 6, .22, 244)],
      wreck: { time: 5.8, mode: 'sink', color: '#ffc28d', events: [[.12, 'cannon'], [.32, 'missile'], [.54, 'catapult-l'], [.72, 'triple'], [.96, 'rotary'], [1.16, 'catapult-r'], [1.36, 'hangar', 1.4], [1.63, 'radar'], [1.96, 'engine'], [2.66, 'core', 2.9], [3.54, 'hangar', 1.25]] }
    },
    {
      intro: 'Détruis le gyroscope puis vise les rotors et la soute à roquettes.',
      name: 'Hydra Rotor', width: 270, height: 328, anchor: 263, hp: 1010,
      hue: '#ffd287', phase: [.78, .53, .28], stages: ['Transmission du rotor fissurée', 'Contrôle de vol dégradé', 'Hydra en perte de stabilité'],
      core: [.50, .66, .101, .101], motion: 'rotor', support: ['drone', 'drone'],
      parts: [
        part('rotor-l', 'Rotor et transmission bâbord', 'rotor', .276, .491, .091, .116, 68),
        part('rotor-r', 'Rotor et transmission tribord', 'rotor', .724, .491, .091, .116, 68),
        part('rockets-l', 'Nacelle de roquettes bâbord', 'missile', .111, .742, .067, .068, 50, 'missile'),
        part('rockets-r', 'Nacelle de roquettes tribord', 'missile', .889, .742, .067, .068, 50, 'missile'),
        part('gun', 'Canon axial', 'gun', .50, .867, .066, .052, 54, 'salvo'),
        part('gyro', 'Gyroscope du rotor', 'gyro', .50, .413, .054, .057, 73),
        part('magazine', 'Soute à roquettes', 'magazine', .50, .215, .079, .062, 75)
      ],
      attacks: [attack('wheel', 'bolt', 6, .22, 233), attack('aim', 'missile', 4, .22, 198), attack('sweep', 'flame', 6, .24, 256)],
      wreck: { time: 5.55, mode: 'spin', color: '#ffdb83', events: [[.11, 'rockets-r'], [.36, 'gun'], [.59, 'magazine', 1.4], [.82, 'rockets-l'], [1.01, 'rotor-l'], [1.30, 'gyro'], [1.63, 'rotor-r'], [2.24, 'core', 2.65], [2.99, 'rotor-r', 1.4]] }
    },
    {
      intro: 'Le condensateur du pont alimente le bouclier et les deux canons à ions.',
      name: 'Leviathan Azure', width: 221, height: 393, anchor: 285, hp: 1090,
      hue: '#60dfff', phase: [.76, .54, .25], stages: ['Pont extérieur sous pression', 'Systèmes de protection dégradés', 'Système central vulnérable'],
      core: [.50, .48, .145, .135], motion: 'azure', support: ['shield', 'interceptor'],
      parts: [
        part('shield-l', 'Projecteur azur bâbord', 'shield', .216, .268, .085, .057, 68),
        part('shield-r', 'Projecteur azur tribord', 'shield', .784, .268, .085, .057, 68),
        part('gun-l', 'Canon à ions bâbord', 'plasma', .155, .54, .089, .067, 66, 'plasma'),
        part('gun-r', 'Canon à ions tribord', 'plasma', .845, .54, .089, .067, 66, 'plasma'),
        part('armor', 'Blindage central', 'armor', .50, .67, .128, .049, 72),
        part('engine', 'Propulsion du Léviathan', 'engine', .50, .866, .110, .060, 64),
        part('radar', 'Radar du dôme', 'radar', .50, .20, .104, .065, 72),
        part('capacitor', 'Condensateur du pont', 'capacitor', .50, .765, .110, .044, 84)
      ],
      attacks: [attack('wave', 'ion', 6, .18, 243), attack('split', 'plasma', 5, .23, 244), attack('wheel', 'ion', 8, .205, 251, .62)],
      wreck: { time: 5.85, mode: 'sink', color: '#8feaff', events: [[.12, 'shield-l'], [.37, 'shield-r'], [.56, 'radar'], [.73, 'armor'], [.99, 'gun-l'], [1.39, 'gun-r'], [1.68, 'capacitor', 1.4], [2.03, 'engine'], [2.58, 'core', 2.8], [3.28, 'core', 1.4]] }
    },
    {
      intro: 'Coupe les vannes de carburant pour éteindre les canons de flanc.',
      name: 'Inferno Bastion', width: 360, height: 313, anchor: 272, hp: 1185,
      hue: '#ff965f', phase: [.78, .51, .25], stages: ['Canons incendiaires endommagés', 'Circuit de carburant en feu', 'Pression critique dans le réacteur'],
      core: [.50, .49, .091, .126], motion: 'inferno', support: ['bomber', 'diver'],
      parts: [
        part('cannon-l', 'Canon incendiaire bâbord', 'flame', .132, .624, .065, .094, 71, 'flame'),
        part('cannon-r', 'Canon incendiaire tribord', 'flame', .868, .624, .065, .094, 71, 'flame'),
        part('tank-l', 'Réservoir bâbord', 'fuel', .397, .271, .060, .097, 66),
        part('tank-r', 'Réservoir tribord', 'fuel', .603, .271, .060, .097, 66),
        part('armor-l', 'Plaque latérale bâbord', 'armor', .302, .449, .073, .061, 68),
        part('armor-r', 'Plaque latérale tribord', 'armor', .698, .449, .073, .061, 68),
        part('engine', 'Turbine principale', 'engine', .50, .815, .061, .085, 75),
        part('valve-l', 'Vanne incendiaire bâbord', 'valve', .276, .704, .049, .061, 74),
        part('valve-r', 'Vanne incendiaire tribord', 'valve', .724, .704, .049, .061, 74)
      ],
      attacks: [attack('aim', 'flame', 6, .22, 245), attack('wheel', 'flame', 7, .22, 232), attack('split', 'flame', 6, .27, 265)],
      wreck: { time: 5.9, mode: 'split', color: '#ff9e64', events: [[.13, 'cannon-l'], [.37, 'cannon-r'], [.53, 'valve-r'], [.71, 'armor-r'], [.88, 'valve-l'], [1.05, 'armor-l'], [1.27, 'tank-l', 1.8], [1.65, 'tank-r', 1.8], [1.98, 'engine', 1.3], [2.63, 'core', 3.1], [3.35, 'tank-r', 1.5]] }
    },
    {
      intro: 'Les conducteurs latéraux alimentent la Forme Zéro. Vise-les avant sa mutation.',
      name: 'Nightfall Ω', width: 270, height: 421, anchor: 305, hp: 1555,
      hue: '#b2a6ff', phase: [.77, .52, .24], stages: ['Collecteurs Ω instables', 'Forme Zéro détectée', 'Ruine du noyau Ω'],
      core: [.50, .49, .137, .149], motion: 'nightfall', support: ['interceptor', 'diver'],
      parts: [
        part('shield-l', 'Collecteur Ω bâbord', 'shield', .295, .261, .087, .062, 95),
        part('shield-r', 'Collecteur Ω tribord', 'shield', .705, .261, .087, .062, 95),
        part('ion-l', 'Canon Ω bâbord', 'plasma', .196, .485, .081, .066, 81, 'plasma'),
        part('ion-r', 'Canon Ω tribord', 'plasma', .804, .485, .081, .066, 81, 'plasma'),
        part('missile', 'Rampe de missiles', 'missile', .50, .688, .098, .053, 82, 'missile'),
        part('engine-l', 'Propulseur Ω bâbord', 'engine', .348, .780, .070, .061, 79),
        part('engine-r', 'Propulseur Ω tribord', 'engine', .652, .780, .070, .061, 79),
        part('conduit-l', 'Conducteur Ω bâbord', 'conduit', .235, .635, .066, .054, 95),
        part('conduit-r', 'Conducteur Ω tribord', 'conduit', .765, .635, .066, .054, 95)
      ],
      attacks: [attack('split', 'bolt', 6, .24, 246), attack('cross', 'ion', 7, .23, 258), attack('wave', 'plasma', 7, .19, 250, .66)],
      finalAttacks: [attack('wheel', 'ion', 8, .19, 270), attack('split', 'plasma', 8, .235, 265, .70), attack('sweep', 'missile', 6, .20, 221, .62)],
      wreck: { time: 6.85, mode: 'collapse', color: '#adbcff', events: [[.16, 'shield-l'], [.38, 'shield-r'], [.57, 'conduit-r'], [.76, 'ion-r'], [.97, 'ion-l'], [1.16, 'conduit-l'], [1.39, 'missile'], [1.70, 'engine-l'], [2.07, 'engine-r'], [2.64, 'core', 1.75], [3.21, 'core', 3.6], [3.83, 'ion-l', 1.9], [4.29, 'core', 1.2]] }
    }
  ];

  const FRAMES = [
    [[9,9,303,427], [12,15,298,476], [15,11,293,479], [9,9,304,485]],
    [[8,9,304,1004], [8,9,310,1004], [8,9,297,1004], [9,9,297,1002]],
    [[12,52,618,576], [14,53,616,576], [12,32,616,576], [13,32,617,576]],
    [[26,24,379,965]],
    [[27,10,357,480], [396,11,340,479], [755,14,321,476]],
    [[6,7,287,501], [297,7,281,501], [591,8,283,500]],
    [[19,4,462,428], [491,6,467,427], [968,23,465,432]],
    [[22,15,204,470], [237,25,202,460], [455,26,264,459], [723,18,234,467], [964,14,234,471], [1204,14,229,471]]
  ];
  const WRECK_SECTIONS = [
    [[0,0],[.43,0],[.47,.18],[.40,.31],[.51,.47],[.33,.44],[.23,.52],[0,.46]],
    [[.43,0],[1,0],[1,.49],[.84,.51],[.66,.44],[.51,.47],[.40,.31],[.47,.18]],
    [[0,.46],[.23,.52],[.33,.44],[.51,.47],[.53,.65],[.42,.77],[.48,1],[0,1]],
    [[.51,.47],[.66,.44],[.84,.51],[1,.49],[1,1],[.48,1],[.42,.77],[.53,.65]]
  ];
  const PALETTES = { bolt: '#ffad73', missile: '#ff8b63', flame: '#ff7740', ion: '#69ddff', plasma: '#b6a6ff' };
  const NODE_COLORS = {
    shield: '#79eaff', engine: '#ffc696', rotor: '#ffc696', fuel: '#ff976a', armor: '#f1d6a7', hangar: '#ffd6ae',
    radar: '#a7efa7', magazine: '#ffab72', coolant: '#a6f0ff', catapult: '#f2dba1',
    gyro: '#f6c4ff', capacitor: '#86e9ff', valve: '#ffab72', conduit: '#c6b4ff'
  };
  const NODE_MESSAGES = {
    shield: 'Projection de bouclier affaiblie', engine: 'Mobilité réduite', rotor: 'Stabilité réduite',
    fuel: 'Salves incendiaires affaiblies', armor: 'Blindage ouvert', hangar: 'Renforts du pont neutralisés',
    radar: 'Visée brouillée', magazine: 'Alimentation des missiles coupée', coolant: 'Tirs cryogéniques affaiblis',
    catapult: 'Lancement de ce flanc neutralisé', gyro: 'Assiette de vol perturbée',
    capacitor: 'Bouclier et canons à ions hors service', valve: 'Canon de ce flanc privé de carburant',
    conduit: 'Puissance de la Forme Zéro réduite'
  };
  const TACTICAL_TARGETS = [
    ['radar', 'Radar au-dessus du moteur tribord'], ['magazine', 'Soute sous la tourelle arrière'],
    ['coolant', 'Conduites au-dessus des turbines'], ['catapult', 'Catapultes sur les côtés du pont'],
    ['gyro', 'Gyroscope à la base du rotor'], ['radar', 'Radar au sommet du dôme'],
    ['valve', 'Vannes derrière les canons latéraux'], ['conduit', 'Conducteurs aux flancs du noyau']
  ];
  const GUNS = {
    fan: attack('aim', 'bolt', 3, .14, 212, .47),
    salvo: attack('aim', 'bolt', 2, .12, 234, .54),
    missile: attack('aim', 'missile', 2, .22, 176, .64),
    plasma: attack('aim', 'plasma', 1, 0, 227, .59),
    flame: attack('aim', 'flame', 3, .19, 240, .60)
  };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;
  const DOWN = Math.PI / 2;
  const alive = node => node && !node.dead;
  let glowTextures;

  function spawn() {
    if (S.boss || S.bossDeath) return;
    const level = S.level, data = ENCOUNTERS[level];
    const b = {
      level, data, x: W / 2, y: -data.height / 2 - 32, w: data.width, h: data.height,
      hp: data.hp, maxHp: data.hp, integrity: 1, phase: 1, angle: 0,
      t: 0, moveTime: 0, entry: true, entryTime: 0,
      shoot: 1.2, attackIndex: 0, summon: 6.4, smoke: 0, flash: 0,
      transformed: false, morph: 0, pending: [], particles: [], debris: [],
      bodyCache: null, hudState: '', core: { id: `boss-${level}-core`, kind: 'bossCore', hp: data.hp, maxHp: data.hp }
    };
    S.boss = b;
    S.bossNodes = data.parts.map((definition, index) => ({
      definition, index, id: `boss-${level}-${definition.id}`, kind: definition.kind, hp: definition.hp,
      maxHp: definition.hp, dead: false, shoot: 1.25 + index * .42, flash: 0, damageTimer: 0
    }));
    b.nodes = S.bossNodes;
    b.partsById = Object.fromEntries(b.nodes.map(n => [n.definition.id, n]));
    b.maxIntegrity = b.maxHp + b.nodes.reduce((sum, n) => sum + n.maxHp, 0);
    S.enemies.length = 0;
    S.eBullets.length = 0;
    S.turrets.length = 0;
    positionParts(b);
    $('bossHud').classList.add('show');
    updateHud(b);
    banner(`BOSS — ${data.name}`, 2.8);
    showMsg(data.intro, 3.4);
    sfx('boss');
  }

  function localPoint(b, x, y) {
    const dx = (x - .5) * b.w, dy = (y - .5) * b.h;
    const c = Math.cos(b.angle), s = Math.sin(b.angle);
    return { x: b.x + dx * c - dy * s, y: b.y + dy * c + dx * s };
  }

  function positionParts(b) {
    for (const n of b.nodes) {
      const d = n.definition;
      const point = localPoint(b, d.x, d.y);
      n.x = point.x;
      n.y = point.y;
      n.rx = Math.max(12, d.rx * b.w);
      n.ry = Math.max(13, d.ry * b.h);
      n.angle = b.angle;
    }
    const [x, y, rx, ry] = b.data.core;
    const point = localPoint(b, x, b.transformed ? y - .075 : y);
    Object.assign(b.core, point);
    b.core.rx = rx * b.w;
    b.core.ry = ry * b.h;
    b.core.angle = b.angle;
  }

  function targets() {
    const b = S.boss;
    if (!b || b.entry || b.morph > 0) return [];
    return [...b.nodes.filter(alive), b.core];
  }

  function count(b, ...kinds) {
    return b.nodes.reduce((total, n) => total + Number(alive(n) && kinds.includes(n.kind)), 0);
  }

  function systemLost(b, id) {
    return b.partsById[id]?.dead === true;
  }

  function activeShields(b) {
    return systemLost(b, 'capacitor') ? 0 : count(b, 'shield');
  }

  function canFire(b, source) {
    if (!alive(source)) return false;
    if (source === b.core) return true;
    const wing = source.definition.id.endsWith('-l') ? 'l' : 'r';
    if (source.kind === 'missile' && systemLost(b, 'magazine')) return false;
    if (source.kind === 'flame' && systemLost(b, `valve-${wing}`)) return false;
    if (source.kind === 'plasma' && (systemLost(b, 'capacitor') || systemLost(b, `conduit-${wing}`))) return false;
    return true;
  }

  function tacticalObjective(b, shields) {
    if (b.entry) return '';
    if (b.morph > 0) return 'Transformation en cours';
    if (shields && b.level === 5) return 'Condensateur derrière le blindage du pont';
    if (shields) return 'Projecteurs à neutraliser';
    const [kind, hint] = TACTICAL_TARGETS[b.level];
    if (count(b, kind)) return hint;
    return count(b, 'armor') ? 'Ouvre les plaques autour du noyau' : 'Noyau à découvert';
  }

  function updateHud(b) {
    const shields = activeShields(b);
    const aliveCount = b.nodes.filter(alive).length;
    const turretCount = b.level === 3 ? count(b, 'gun', 'missile', 'plasma') : 0;
    const percentage = Math.ceil(b.integrity * 100);
    const objective = tacticalObjective(b, shields);
    const state = `${percentage}|${b.phase}|${shields}|${aliveCount}|${turretCount}|${b.entry}|${objective}`;
    if (b.hudState === state) return;
    b.hudState = state;
    $('bossLabel').textContent = b.data.name;
    $('bossFill').style.width = `${percentage}%`;
    $('bossFill2').style.width = `${aliveCount / b.nodes.length * 100}%`;
    $('bossSubLabel').textContent = b.entry ? 'Approche ennemie' : shields ? `Phase ${b.phase} · Projecteurs ${shields}` :
      turretCount ? `Phase ${b.phase} · Tourelles ${turretCount}/4` : `Phase ${b.phase} · Modules ${aliveCount}/${b.nodes.length}`;
    const tactical = $('bossModules');
    if (tactical && tactical.textContent !== objective) tactical.textContent = objective;
  }

  function hit(target, damage, x, y, metadata = {}) {
    const b = S.boss;
    if (!b || b.entry || b.morph > 0 || !target || target.dead || !Number.isFinite(damage) || damage <= 0) return false;
    const pierce = metadata.piercing === true;
    if (target === b.core) {
      const shields = activeShields(b);
      const armor = count(b, 'armor');
      const defense = shields ? (pierce ? .52 : .24) : armor ? (pierce ? .90 : .65) : 1;
      const weakSpot = 1 + (b.phase - 1) * .10;
      const hullFloor = shields || armor ? b.maxHp * .16 : 0;
      // Keep high-tier volleys effective on individual modules and rein in sustained fire on the hull.
      const upgrade = metadata.kind === 'primary' && Number.isFinite(metadata.tier) ? clamp((metadata.tier - 1) / 4, 0, 1) : 0;
      const hullResistance = 1 - upgrade * (b.level === 7 ? .34 : .28);
      b.hp = Math.max(hullFloor, b.hp - damage * 1.66 * defense * weakSpot * hullResistance);
      b.core.hp = b.hp;
      impact(b, x, y, shields ? '#8be7ff' : b.data.hue, shields ? .55 : .83);
      b.flash = shields ? .11 : .15;
    } else if (b.nodes.includes(target)) {
      const resistance = target.kind === 'armor' && !pierce ? .70 : 1;
      target.hp = Math.max(0, target.hp - damage * 1.65 * resistance);
      target.flash = .19;
      impact(b, x, y, NODE_COLORS[target.kind] || b.data.hue, .67);
      if (target.hp <= 0) detach(b, target, true);
    } else {
      return false;
    }
    assessDamage(b);
    return true;
  }

  function assessDamage(b) {
    b.integrity = (b.hp + b.nodes.reduce((sum, n) => sum + n.hp, 0)) / b.maxIntegrity;
    while (b.phase <= 3 && b.integrity <= b.data.phase[b.phase - 1]) {
      b.phase++;
      b.pending.length = 0;
      b.shoot = 1.2;
      b.bodyCache = null;
      showMsg(b.data.stages[b.phase - 2], 2.1);
      sfx('boss');
      const exposed = localPoint(b, .50, b.phase === 2 ? .57 : .47);
      burst(b, exposed.x, exposed.y, b.phase === 4 ? 1.4 : 1.05, b.data.hue);
      if (b.level === 7 && b.phase === 3) {
        b.transformed = true;
        b.morph = 1.38;
        S.eBullets.length = 0;
        banner('NIGHTFALL Ω — FORME ZÉRO', 2.7);
        pulseCamera(.22, .11);
      }
    }
    if (b.hp <= 0) startDeath(b);
    else updateHud(b);
  }

  function moveBoss(b, dt) {
    const enginesLost = b.nodes.filter(n => n.dead && (n.kind === 'engine' || n.kind === 'rotor'));
    const gyroLost = systemLost(b, 'gyro');
    const mobility = 1 - Math.min(.66, enginesLost.length * .28 + (gyroLost ? .18 : 0));
    const t = b.moveTime += dt * mobility;
    const damage = 1 - b.integrity;
    let x = W / 2, y = b.data.anchor, tilt = 0;
    switch (b.data.motion) {
      case 'fortress':
        x += Math.sin(t * .64) * (32 + 22 * damage) * mobility;
        y += Math.sin(t * .89) * (9 + 12 * damage);
        tilt = Math.cos(t * .64) * .04;
        break;
      case 'river':
        x += (Math.sin(t * .54) * 104 + Math.sin(t * .24) * 24) * mobility;
        y += Math.sin(t * .57) * 22;
        tilt = Math.cos(t * .54) * .10 * mobility;
        break;
      case 'arctic':
        x += Math.sin(t * .73) * (74 + 13 * damage) * mobility;
        y += Math.cos(t * 1.24) * (12 + 10 * damage);
        tilt = Math.cos(t * .73) * .09 * mobility;
        break;
      case 'carrier':
        x += Math.sin(t * .43) * 86 * mobility;
        y += Math.cos(t * .62) * 13;
        tilt = Math.cos(t * .43) * .06;
        break;
      case 'rotor':
        x += Math.sin(t * 1.19) * 89 * mobility;
        y += Math.sin(t * 1.67) * 26 + Math.sin(b.t * 4.4) * enginesLost.length * 8;
        tilt = Math.cos(t * 1.28) * .125 + Math.sin(b.t * 6) * .065 * enginesLost.length;
        if (gyroLost) {
          y += Math.sin(b.t * 3.5) * 11;
          tilt += Math.sin(b.t * 3.8) * .11;
        }
        break;
      case 'azure':
        x += (Math.sin(t * .45) * 72 + Math.sin(t * 1.18) * 16) * mobility;
        y += (1 - Math.cos(t * .69)) * 24;
        tilt = Math.sin(t * .75) * .08;
        break;
      case 'inferno':
        x += Math.sin(t * .61) * 65 * mobility;
        y += (1 - Math.cos(t * (.68 + .13 * b.phase))) * 32;
        tilt = Math.cos(t * .61) * .085;
        break;
      case 'nightfall':
        x += (Math.sin(t * (b.transformed ? .83 : .48)) * 87 + Math.sin(t * 1.13) * 15) * mobility;
        y += Math.sin(t * (b.transformed ? 1.38 : .63)) * (b.transformed ? 39 : 16);
        tilt = Math.cos(t * .86) * (b.transformed ? .12 : .055);
        break;
    }
    for (const n of enginesLost) tilt += n.definition.x < .5 ? -.075 : .075;
    y += enginesLost.length * 11;
    const approach = Math.min(1, dt * 2.6);
    b.x = mix(b.x, x, approach);
    b.y = mix(b.y, y, approach);
    b.angle = mix(b.angle, tilt, Math.min(1, dt * 4));
  }

  function prepare(b, source, data, p) {
    const aimed = clamp(Math.atan2(p.y - source.y, p.x - source.x), .45, Math.PI - .45);
    const aim = systemLost(b, 'radar') ? mix(DOWN, aimed, .31) : aimed;
    const index = b.attackIndex;
    const countBoost = source === b.core && b.phase >= 3 && data.count < 7 && b.level >= 3 ? 1 : 0;
    const coolantLoss = b.level === 2 ? 2 - count(b, 'coolant') : 0;
    const conduitLoss = b.transformed ? 2 - count(b, 'conduit') : 0;
    const depleted = data.kind === 'flame' && b.level === 6 && count(b, 'fuel') === 0 ||
      data.kind === 'missile' && systemLost(b, 'magazine') ||
      ['ion', 'plasma'].includes(data.kind) && (coolantLoss === 2 || conduitLoss === 2 || systemLost(b, 'capacitor'));
    const weakened = Math.max(coolantLoss, conduitLoss, depleted ? 2 : 0);
    const num = Math.max(1, data.count + countBoost - weakened);
    const angles = [];
    for (let i = 0; i < num; i++) {
      const spread = (i - (num - 1) / 2) * data.spread;
      let heading;
      switch (data.mode) {
        case 'cross': heading = DOWN + spread + (i % 2 ? .30 : -.30); break;
        case 'wave': heading = DOWN + spread + Math.sin(index * 1.4) * .32; break;
        case 'wheel': heading = DOWN + spread + (index % 2 ? .26 : -.26); break;
        case 'split': heading = DOWN + spread + Math.sign(spread) * .29; break;
        case 'sweep': heading = mix(aim, DOWN, .48) + spread + (index % 2 ? .19 : -.19); break;
        default: heading = aim + spread;
      }
      angles.push(clamp(heading, .22, Math.PI - .22));
    }
    b.pending.push({ source, pattern: data.mode, kind: depleted ? 'bolt' : data.kind, speed: data.speed * (1 - weakened * .09),
      angles, time: data.warning, duration: data.warning });
  }

  function discharge(b, shot) {
    if (!canFire(b, shot.source) || shot.source.y < 85) return;
    const { source, kind } = shot;
    const speedBonus = (b.phase - 1) * 6;
    const size = kind === 'plasma' ? 14 : kind === 'ion' || kind === 'missile' ? 11 : 9;
    for (let i = 0; i < shot.angles.length; i++) {
      const angle = shot.angles[i];
      const speed = shot.speed + speedBonus + (shot.pattern === 'wave' ? i * 14 : 0);
      combat.spawnHostile({
        x: source.x + Math.cos(angle) * 17, y: source.y + Math.sin(angle) * 17, angle, speed, size, kind,
        homing: kind === 'missile' ? .32 : 0, ttl: kind === 'missile' ? 4.4 : 5.7,
        color: PALETTES[kind], source: source.id
      });
    }
    impact(b, source.x, source.y + 13, PALETTES[kind], shot.source === b.core ? 1 : .63);
    sfx('enemyShot');
  }

  function updateWeapons(b, p, dt) {
    if (p.dead) {
      b.pending.length = 0;
      return;
    }
    for (let i = b.pending.length - 1; i >= 0; i--) {
      const shot = b.pending[i];
      shot.time -= dt;
      if (shot.time > 0 && canFire(b, shot.source)) continue;
      if (shot.time <= 0) discharge(b, shot);
      b.pending.splice(i, 1);
    }
    b.shoot -= dt;
    if (b.shoot <= 0) {
      const attacks = b.transformed ? b.data.finalAttacks : b.data.attacks;
      const patternCount = Math.min(attacks.length, b.phase + 1);
      prepare(b, b.core, attacks[b.attackIndex++ % patternCount], p);
      b.shoot = Math.max(1.85, 3.5 - b.level * .13 - (b.phase - 1) * .24);
    }
    for (const n of b.nodes) {
      if (!n.definition.weapon || !canFire(b, n)) continue;
      n.shoot -= dt;
      if (n.shoot > 0) continue;
      const weapon = n.definition.weapon;
      prepare(b, n, GUNS[weapon], p);
      n.shoot = (b.level <= 2 ? 3.8 : 3.35) + (n.index % 3) * .22 + (weapon === 'missile' ? .45 : 0);
    }
    b.summon -= dt;
    if (b.summon > 0 || b.level === 3 && !count(b, 'hangar')) return;
    b.summon = Math.max(7.8, 12.4 - b.phase * .9 - b.level * .21);
    if (S.enemies.length >= 3) return;
    for (const [i, role] of b.data.support.entries()) {
      if (b.level === 3 && systemLost(b, i ? 'catapult-r' : 'catapult-l')) continue;
      const x = clamp(b.x + (i ? 135 : -135), 49, W - 49);
      combat.addEnemy(role, { x, y: -70 - i * 62, lane: x });
    }
  }

  function update(dt, p) {
    const b = S.boss;
    if (!b) return;
    b.t += dt;
    b.flash = Math.max(0, b.flash - dt);
    if (b.entry) {
      b.entryTime = Math.min(2.45, b.entryTime + dt);
      const t = b.entryTime / 2.45;
      b.y = mix(-b.h / 2 - 32, b.data.anchor, t * (2 - t));
      b.entry = t < 1;
      positionParts(b);
      if (!b.entry) updateHud(b);
      return;
    }
    if (b.morph > 0) {
      b.morph = Math.max(0, b.morph - dt);
      if (b.morph < .83) b.w = mix(b.w, 333, Math.min(1, dt * 5));
      if (!b.morph) updateHud(b);
    } else if (b.transformed) {
      b.w = mix(b.w, 333, Math.min(1, dt * 5));
    }
    moveBoss(b, dt);
    positionParts(b);
    updateDamageEffects(b, dt);
    if (b.morph <= 0) updateWeapons(b, p, dt);
    if (p.dead || !b.core.rx || !b.core.ry) return;
    const d = ((p.x - b.core.x) / (b.core.rx * .75)) ** 2 + ((p.y - b.core.y) / (b.core.ry * .72)) ** 2;
    if (d < 1) hitPlayer(p.x, p.y);
  }

  function pulseCamera(shake, stop) {
    if (reducedEffects()) return;
    S.shake = Math.max(S.shake || 0, shake);
    S.hitStop = Math.max(S.hitStop || 0, stop);
  }

  function addParticle(b, particle) {
    const cap = [28, 48, 76][visualQuality()] ?? 48;
    if (b.particles.length >= cap) {
      const small = b.particles.findIndex(f => f.kind === 'spark' || f.kind === 'smoke');
      if (small >= 0) b.particles.splice(small, 1);
      else if (particle.kind === 'smoke' || particle.kind === 'spark') return;
      else b.particles.shift();
    }
    particle.age = 0;
    b.particles.push(particle);
  }

  function impact(b, x, y, color, power) {
    const count = visualQuality() === 2 ? 3 : 1;
    if (b.particles.length > 42 && power < .75) return;
    addParticle(b, { kind: 'impact', x, y, color, size: 15 * power, vx: 0, vy: 3, life: .19 });
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * TAU, speed = 47 + Math.random() * 92;
      addParticle(b, { kind: 'spark', x, y, color, size: 1.45, vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed, life: .17 + Math.random() * .20 });
    }
  }

  function smoke(b, x, y, power = 1) {
    addParticle(b, { kind: 'smoke', x, y, color: '#64717a', size: 17 * power + Math.random() * 6,
      vx: (Math.random() - .5) * 52, vy: 34 + Math.random() * 23, life: .70 + Math.random() * .47 });
  }

  function burst(b, x, y, power, color) {
    addParticle(b, { kind: 'burst', x, y, color, size: 78 * power, vx: 0, vy: 11, life: .53 + power * .14 });
    addParticle(b, { kind: 'ring', x, y, color, size: 99 * power, vx: 0, vy: 12, life: .58 + power * .13 });
    const quantity = [5, 8, 13][visualQuality()] ?? 8;
    for (let i = 0; i < quantity; i++) {
      const a = (i / quantity) * TAU + Math.random() * .33;
      const speed = 65 + Math.random() * 125 * power;
      addParticle(b, { kind: 'spark', x, y, color, size: 1.8 + Math.random() * 1.2,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: .26 + Math.random() * .56 });
    }
    for (let i = 0; i < Math.ceil(power); i++) smoke(b, x + (Math.random() - .5) * 52 * power, y, power * .81);
  }

  function updateParticles(b, dt) {
    for (let i = b.particles.length - 1; i >= 0; i--) {
      const f = b.particles[i];
      f.age += dt;
      if (f.age >= f.life) {
        b.particles.splice(i, 1);
        continue;
      }
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.kind === 'spark') f.vy += 112 * dt;
    }
    for (let i = b.debris.length - 1; i >= 0; i--) {
      const d = b.debris[i];
      d.age += dt;
      if (d.age >= d.life) {
        b.debris.splice(i, 1);
        continue;
      }
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += (d.gravity ?? 100) * dt;
      d.vx *= 1 - dt * .17;
      d.turn += d.spin * dt;
      d.smoke -= dt;
      if (d.smoke <= 0 && d.age < d.life * .7) {
        d.smoke = visualQuality() === 2 ? .095 : .18;
        smoke(b, d.x, d.y, d.size / 85);
      }
    }
  }

  function updateDamageEffects(b, dt) {
    updateParticles(b, dt);
    for (const n of b.nodes) {
      n.flash = Math.max(0, n.flash - dt);
      if (n.hp > n.maxHp * .63 && !n.dead) continue;
      n.damageTimer -= dt;
      if (n.damageTimer > 0) continue;
      n.damageTimer = (n.dead ? .29 : .63) + Math.random() * .30 + (visualQuality() === 0 ? .20 : 0);
      smoke(b, n.x, n.y, n.dead ? .85 : .58);
      if (Math.random() < (n.dead ? .28 : .11)) impact(b, n.x, n.y - 4, '#ffc77b', .61);
    }
    if (b.phase < 2) return;
    b.smoke -= dt;
    if (b.smoke > 0) return;
    b.smoke = .68 - b.phase * .10 + Math.random() * .22;
    const scar = localPoint(b, .49 + (Math.random() - .5) * .33, .59 + (Math.random() - .5) * .27);
    smoke(b, scar.x, scar.y, .54 + b.phase * .17);
    if (b.phase >= 3 && Math.random() < .35) impact(b, scar.x, scar.y, b.data.hue, .9);
  }

  function detach(b, n, combatReward = false) {
    if (!alive(n)) return;
    const frame = spriteFrame(b);
    const original = n.definition;
    const art = n.definition.art && imgs[n.definition.art];
    const crop = art ? { image: art, rect: [0, 0, art.width, art.height] } : cropPart(frame, original);
    n.dead = true;
    n.hp = 0;
    b.bodyCache = null;
    b.pending = b.pending.filter(shot => canFire(b, shot.source));
    const direction = Math.sign(original.x - .5) || (n.index % 2 ? 1 : -1);
    b.debris.push({ x: n.x, y: n.y, width: n.rx * 2.15, height: n.ry * 2.2, size: Math.max(n.rx, n.ry) * 2,
      vx: direction * (38 + Math.random() * 57), vy: -30 - Math.random() * 40,
      turn: b.angle, spin: direction * (.9 + Math.random() * 2.4), smoke: 0, life: 2.8 + Math.random() * .9, age: 0, crop });
    burst(b, n.x, n.y, n.kind === 'fuel' ? 1.5 : n.kind === 'engine' || n.kind === 'rotor' ? 1.24 : 1, b.data.hue);
    pulseCamera(combatReward ? .15 : .10, combatReward ? .035 : 0);
    if (!combatReward) return;
    S.score += 350 + 55 * b.level;
    sfx('explode');
    const note = NODE_MESSAGES[n.kind];
    showMsg(note ? `${n.definition.label} · ${note}` : `${n.definition.label} hors service`, 1.8);
  }

  function startDeath(b) {
    S.boss = null;
    b.pending.length = 0;
    b.phase = 4;
    b.integrity = 0;
    b.deathTime = 0;
    b.deathEvent = 0;
    b.deathX = b.x;
    b.deathY = b.y;
    b.deathAngle = b.angle;
    S.bossDeath = b;
    S.enemies.length = 0;
    S.eBullets.length = 0;
    S.pBullets.length = 0;
    S.turrets.length = 0;
    S.score += 3000 + b.level * 1500;
    if (S.stats) S.stats.boss = true;
    $('score').textContent = S.score;
    $('timer').textContent = 'VICTOIRE';
    $('bossFill').style.width = '0%';
    $('bossFill2').style.width = '0%';
    $('bossSubLabel').textContent = 'Intégrité critique';
    const tactical = $('bossModules');
    if (tactical) tactical.textContent = '';
    $('levelBanner').classList.remove('show');
    stopMusic();
    sfx('explode');
    showMsg('BOSS NEUTRALISÉ', 1.55);
  }

  function updateDeath(dt) {
    const b = S.bossDeath;
    if (!b) return false;
    b.deathTime += dt;
    const t = b.deathTime;
    const { wreck } = b.data;
    const progress = t / wreck.time;
    const reduced = reducedEffects();
    if (wreck.mode === 'sink') {
      b.y = b.deathY + t * 29 + t * t * 2.3;
      b.angle = b.deathAngle + progress * .21;
    } else {
      b.y = b.deathY + t * t * (wreck.mode === 'collapse' ? 4 : 6.9);
      b.x = b.deathX + Math.sin(t * 1.8) * (reduced ? 5 : 14) * progress;
      b.angle = b.deathAngle + (wreck.mode === 'spin' ? t * .47 : progress * .25) * (reduced ? .55 : 1);
    }
    positionParts(b);
    updateParticles(b, dt);
    while (b.deathEvent < wreck.events.length && t >= wreck.events[b.deathEvent][0]) {
      const [, id, power = .9] = wreck.events[b.deathEvent++];
      const node = b.partsById[id];
      const location = node || b.core;
      if (alive(node)) detach(b, node);
      else burst(b, location.x, location.y, power, wreck.color);
      if (id === 'core' && power >= 2) coreRupture(b, power);
      if (b.deathEvent % 2 === 1 || power >= 2) sfx('explode');
    }
    if (t < wreck.time) return true;
    S.bossDeath = null;
    S.bossNodes.length = 0;
    sfx('victory');
    if (S.starsCollected >= 4) startCongratulations();
    else nextLevel();
    return true;
  }

  function coreRupture(b, power) {
    const surface = hullSurface(b);
    b.rupturedAt = b.deathTime;
    b.bodyCache = null;
    pulseCamera(b.level === 7 ? .48 : .34, b.level === 7 ? .16 : .115);
    if (surface) splitHull(b, surface);
    const frame = spriteFrame(b);
    const splits = b.data.wreck.mode === 'split' || b.level === 7 ? 4 : 2;
    for (let i = 0; i < splits; i++) {
      const u = .26 + (i % 3) * .23, v = .29 + Math.floor(i / 3) * .20;
      const p = localPoint(b, u, v);
      const dir = Math.sign(u - .5) || 1;
      b.debris.push({ x: p.x, y: p.y, width: b.w * .22, height: b.h * .23,
        size: 65, age: 0, life: 2.7 + (i % 3) * .17, turn: b.angle, smoke: 0,
        spin: dir * (.8 + i * .24), vx: dir * (47 + i * 12), vy: -37 - i * 6,
        crop: cropPart(frame, { x: u, y: v, rx: .112, ry: .108 }) });
    }
    burst(b, b.core.x + 18, b.core.y - 22, power * .59, '#fff2cf');
  }

  function splitHull(b, image) {
    const mode = b.data.wreck.mode;
    const sink = mode === 'sink';
    const split = mode === 'split';
    const spin = mode === 'spin';
    const deep = mode === 'collapse';
    for (const [i, outline] of WRECK_SECTIONS.entries()) {
      const x = Math.min(...outline.map(point => point[0]));
      const y = Math.min(...outline.map(point => point[1]));
      const w = Math.max(...outline.map(point => point[0])) - x;
      const h = Math.max(...outline.map(point => point[1])) - y;
      const point = localPoint(b, x + w / 2, y + h / 2);
      const side = i % 2 ? 1 : -1;
      const fore = i < 2;
      const speed = sink ? 19 : split ? 104 : deep ? 67 : 51;
      const spinRate = spin ? 1.78 : sink ? .31 : deep ? .79 : 1.08;
      const vy = sink ? (fore ? 30 : 67) : fore ? -44 : 28;
      b.debris.push({
        ...point, width: b.w * w, height: b.h * h, size: 60,
        crop: { image, rect: [x * image.width, y * image.height, w * image.width, h * image.height] },
        outline: outline.map(([u, v]) => [(u - x) / w - .5, (v - y) / h - .5]),
        vx: side * speed * (fore ? .88 : 1.12), vy, turn: b.angle, spin: side * spinRate * (fore ? .76 : 1),
        age: 0, gravity: sink ? 43 : deep ? 61 : 95, smoke: .08 * i, life: sink ? 3.2 : 3.3 + .14 * i
      });
    }
  }

  function spriteFrame(b) {
    let stage = Math.min(FRAMES[b.level].length - 1, b.phase - 1);
    let id;
    if (b.level < 3) {
      id = `boss${b.level}_${stage + 1}`;
    } else if (b.level === 3) {
      id = 'carrierBodyV41';
    } else {
      id = `boss${b.level + 17}`;
      if (b.level === 7) {
        if (!b.transformed) stage = Math.min(1, stage);
        else if (b.rupturedAt !== undefined) stage = 5;
        else if (b.morph > .89) stage = 1;
        else if (b.morph > .48) stage = 2;
        else stage = b.phase >= 4 ? 4 : 3;
      }
    }
    return { id: `${id}-${stage}`, image: imgs[id], rect: FRAMES[b.level][stage] };
  }

  function cropPart(frame, d) {
    const [x, y, w, h] = frame.rect;
    const x0 = clamp(d.x - d.rx, 0, 1), y0 = clamp(d.y - d.ry, 0, 1);
    const x1 = clamp(d.x + d.rx, 0, 1), y1 = clamp(d.y + d.ry, 0, 1);
    return { image: frame.image, rect: [x + x0 * w, y + y0 * h, (x1 - x0) * w, (y1 - y0) * h] };
  }

  function damageHole(path, x, y, rx, ry, seed) {
    path.beginPath();
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * TAU;
      const wobble = 1 + Math.sin(i * 17 + seed * 3.79) * .14 + Math.cos(i * 8.6 - seed) * .09;
      const px = x + Math.cos(a) * rx * wobble;
      const py = y + Math.sin(a) * ry * wobble;
      if (i === 0) path.moveTo(px, py);
      else path.lineTo(px, py);
    }
    path.closePath();
  }

  function hullHoles(b) {
    const pieces = b.nodes.filter(n => n.dead).map(n => n.definition);
    if (b.rupturedAt !== undefined) pieces.push({ x: .50, y: .47, rx: .158, ry: .157 });
    else if (b.phase >= 3) {
      pieces.push({ x: .49, y: .61, rx: .029, ry: .049 });
      if (b.phase === 4) pieces.push({ x: .55, y: .49, rx: .038, ry: .043 });
    }
    return pieces;
  }

  function hullSurface(b) {
    const frame = spriteFrame(b);
    if (!frame.image) return null;
    if (b.bodyCache?.id === frame.id) return b.bodyCache.canvas;
    const quality = visualQuality();
    const canvas = document.createElement('canvas');
    canvas.width = quality === 0 ? 280 : Math.ceil(b.data.width * 1.5);
    canvas.height = quality === 0 ? 350 : Math.ceil(b.data.height * 1.35);
    const surface = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    surface.drawImage(frame.image, ...frame.rect, 0, 0, w, h);
    const holes = hullHoles(b);
    surface.globalCompositeOperation = 'source-atop';
    for (const [i, d] of holes.entries()) {
      damageHole(surface, w * d.x, h * d.y, w * d.rx * 1.09, h * d.ry * 1.11, i);
      surface.fillStyle = '#261d21';
      surface.fill();
      surface.lineWidth = 5;
      surface.strokeStyle = i % 2 ? '#995139' : '#dd8154';
      surface.stroke();
    }
    surface.globalCompositeOperation = 'destination-out';
    for (const [i, d] of holes.entries()) {
      damageHole(surface, w * d.x, h * d.y, w * d.rx * .99, h * d.ry * .95, i);
      surface.fill();
    }
    b.bodyCache = { id: frame.id, canvas };
    return canvas;
  }

  function drawWake(b, alpha) {
    const afloat = b.data.wreck.mode === 'sink';
    ctx.save();
    ctx.translate(b.x + (afloat ? 0 : 13), b.y + (afloat ? -b.h * .13 : 29));
    ctx.rotate(b.angle * .8);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = afloat ? 'rgba(1,16,30,.22)' : 'rgba(5,12,20,.28)';
    ctx.beginPath();
    ctx.ellipse(2, 7, b.w * .37, b.h * .36, 0, 0, TAU);
    ctx.fill();
    if (afloat) {
      const offset = (b.t + (b.deathTime || 0)) % 2.1;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const age = (offset + i * .35) % 2.1 / 2.1;
        ctx.strokeStyle = `rgba(155,222,243,${.29 * (1 - age)})`;
        ctx.beginPath();
        ctx.ellipse(0, b.h * (.24 - age * .51), b.w * (.41 + age * .29), 12 + age * 34, 0, -.12, Math.PI + .12);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawOverlays(b) {
    for (const n of b.nodes) {
      const { definition: d } = n;
      if (n.dead) {
        if (b.deathTime !== undefined && b.rupturedAt !== undefined) continue;
        ctx.save();
        const heat = .46 + .30 * Math.sin(b.t * 6 + n.index);
        ctx.globalAlpha = heat;
        ctx.strokeStyle = '#fb8e57';
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.ellipse(n.x, n.y, n.rx * .82, n.ry * .77, b.angle, .35, 3.12);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      if (d.art && imgs[d.art]) {
        const damaged = n.hp < n.maxHp * .49 && imgs[`${d.art}Dmg`];
        drawImageCentered(damaged || imgs[d.art], n.x, n.y, n.rx * 2.60, n.ry * 2.12, b.angle);
      }
      if (n.kind === 'rotor') {
        ctx.save();
        ctx.globalAlpha = .32 * (n.hp / n.maxHp);
        ctx.strokeStyle = '#d0d8be';
        ctx.lineWidth = 2.3;
        const heading = b.t * (n.hp < n.maxHp * .5 ? 11 : 24) + n.index * 2;
        ctx.beginPath();
        ctx.ellipse(n.x, n.y - 8, n.rx * 1.55, n.ry * .72, b.angle, heading, heading + Math.PI * .82);
        ctx.stroke();
        ctx.restore();
      }
      if (b.deathTime === undefined && !b.entry) drawHardpoint(n);
    }
  }

  function drawHardpoint(n) {
    const color = NODE_COLORS[n.kind] || '#ffd48f';
    const health = n.hp / n.maxHp;
    const x = n.rx * .91, y = n.ry * .88;
    ctx.save();
    ctx.translate(n.x, n.y);
    ctx.rotate(n.angle);
    ctx.strokeStyle = 'rgba(4,16,26,.65)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-x + 6, -y); ctx.lineTo(-x, -y); ctx.lineTo(-x, -y + 6);
    ctx.moveTo(x - 6, -y); ctx.lineTo(x, -y); ctx.lineTo(x, -y + 6);
    ctx.moveTo(-x + 6, y); ctx.lineTo(-x, y); ctx.lineTo(-x, y - 6);
    ctx.moveTo(x - 6, y); ctx.lineTo(x, y); ctx.lineTo(x, y - 6);
    ctx.stroke();
    ctx.globalAlpha = reducedEffects() ? .77 : n.flash > 0 ? 1 : .77;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.65;
    ctx.stroke();
    ctx.fillStyle = color;
    if (health < .98 || n.flash > 0) {
      ctx.fillStyle = '#0a1520';
      ctx.fillRect(-x, y + 5, x * 2, 4);
      ctx.fillStyle = color;
      ctx.fillRect(-x, y + 5, x * 2 * health, 3);
    } else if (n.kind === 'shield' || n.kind === 'capacitor') {
      ctx.beginPath();
      ctx.moveTo(-3, y + 4); ctx.lineTo(0, y + 1); ctx.lineTo(3, y + 4); ctx.lineTo(0, y + 7);
      ctx.closePath();
      ctx.fill();
    } else if (['radar', 'magazine', 'coolant', 'catapult', 'gyro', 'valve', 'conduit'].includes(n.kind)) {
      ctx.fillRect(-6, y + 4, 4, 2);
      ctx.fillRect(2, y + 4, 4, 2);
    }
    ctx.restore();
  }

  function drawCore(b) {
    const n = b.core;
    const shields = activeShields(b);
    const color = shields ? '#7de2ff' : b.phase >= 3 ? '#ffe1a2' : b.data.hue;
    const halo = shields ? 1.4 : 1;
    ctx.save();
    ctx.translate(n.x, n.y);
    ctx.rotate(b.angle);
    ctx.strokeStyle = color;
    ctx.lineWidth = shields ? 2.0 : 1.85;
    ctx.globalAlpha = shields ? .52 : .73;
    for (let i = 0; i < 4; i++) {
      const phase = b.t * (shields ? -.5 : .45) + i * Math.PI * .5;
      ctx.beginPath();
      ctx.ellipse(0, 0, n.rx * halo, n.ry * halo, 0, phase, phase + .59 + shields * .20);
      ctx.stroke();
    }
    if (shields) {
      ctx.globalAlpha = b.flash > 0 && !reducedEffects() ? .14 : .055;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, n.rx * halo, n.ry * halo, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWarnings(b) {
    for (const shot of b.pending) {
      if (!canFire(b, shot.source)) continue;
      const { x, y } = shot.source;
      const phase = 1 - shot.time / shot.duration;
      ctx.save();
      ctx.globalAlpha = .24 + phase * .40;
      ctx.strokeStyle = PALETTES[shot.kind];
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 8]);
      for (let i = 0; i < shot.angles.length; i += shot.angles.length >= 6 ? 2 : 1) {
        const a = shot.angles[i];
        const length = shot.source === b.core ? 92 + phase * 110 : 42 + phase * 54;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18);
        ctx.lineTo(x + Math.cos(a) * length, y + Math.sin(a) * length);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.arc(x, y, 21 - phase * 13, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  function particleTextures() {
    if (glowTextures) return glowTextures;
    const texture = stops => {
      const layer = document.createElement('canvas');
      layer.width = layer.height = 64;
      const c = layer.getContext('2d');
      const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      for (const [at, color] of stops) g.addColorStop(at, color);
      c.fillStyle = g;
      c.fillRect(0, 0, 64, 64);
      return layer;
    };
    glowTextures = {
      smoke: texture([[0, '#25303a'], [.36, 'rgba(67,73,83,.61)'], [.64, 'rgba(91,98,106,.30)'], [1, 'rgba(102,112,122,0)']]),
      blast: texture([[0, '#fff6cf'], [.21, '#ffd982'], [.39, 'rgba(255,111,41,.66)'], [.65, 'rgba(255,83,18,.25)'], [1, 'rgba(190,42,12,0)']])
    };
    return glowTextures;
  }

  function drawParticles(b) {
    if (!b.particles.length) return;
    const textures = particleTextures();
    const quiet = reducedEffects();
    ctx.save();
    for (const f of b.particles) {
      const a = f.age / f.life, fade = 1 - a;
      if (f.kind === 'smoke') {
        ctx.globalAlpha = Math.min(1, a * 7, fade * 1.6) * .68;
        const d = f.size * (1.7 + a * 2.35);
        ctx.drawImage(textures.smoke, f.x - d / 2, f.y - d / 2, d, d);
      } else if (f.kind === 'spark') {
        ctx.globalAlpha = fade * (quiet ? .60 : .91);
        ctx.lineWidth = f.size;
        ctx.strokeStyle = f.color;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x - f.vx * .038, f.y - f.vy * .038);
        ctx.stroke();
      } else if (f.kind === 'ring') {
        const d = f.size * (.24 + a * .90);
        ctx.globalAlpha = fade * (quiet ? .28 : .61);
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 2 + fade * 2.4;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, d * .63, d * .49, 0, 0, TAU);
        ctx.stroke();
      } else {
        const d = f.size * (.57 + a * 1.02);
        ctx.globalAlpha = Math.min(1, a * 13, fade * 2.1) * (quiet ? .48 : .90);
        ctx.drawImage(textures.blast, f.x - d * .61, f.y - d * .61, d * 1.22, d * 1.22);
        const sheet = imgs.newFx;
        if (sheet && f.kind === 'burst') {
          const frames = [[37,687,132,132], [181,654,213,191], [393,639,229,214], [626,646,199,218], [827,675,183,174], [1004,687,126,154]];
          const rect = frames[Math.min(frames.length - 1, Math.floor(a * frames.length))];
          ctx.drawImage(sheet, ...rect, f.x - d / 2, f.y - d / 2, d, d);
        }
      }
    }
    ctx.restore();
  }

  function drawDebris(b) {
    for (const d of b.debris) {
      if (!d.crop.image) continue;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.turn);
      ctx.globalAlpha = Math.min(1, (1 - d.age / d.life) * 2.3);
      if (d.outline) {
        ctx.beginPath();
        for (const [i, [u, v]] of d.outline.entries()) {
          if (!i) ctx.moveTo(u * d.width, v * d.height);
          else ctx.lineTo(u * d.width, v * d.height);
        }
        ctx.closePath();
      } else {
        damageHole(ctx, 0, 0, d.width * .49, d.height * .48, 5);
      }
      ctx.clip();
      ctx.drawImage(d.crop.image, ...d.crop.rect, -d.width / 2, -d.height / 2, d.width, d.height);
      ctx.restore();
    }
  }

  function draw() {
    const b = S.boss || S.bossDeath;
    if (!b) return;
    const dying = b.deathTime !== undefined;
    const afterRupture = b.rupturedAt === undefined ? 0 : b.deathTime - b.rupturedAt;
    const fade = Math.max(0, 1 - afterRupture / .26);
    drawWake(b, Math.max(0, 1 - afterRupture / 1.65));
    const surface = fade > 0 ? hullSurface(b) : null;
    if (surface) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.globalAlpha = fade;
      const filter = b.flash > 0 && !reducedEffects() && visualQuality() === 2;
      if (filter) ctx.filter = 'brightness(1.09)';
      ctx.drawImage(surface, -b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    if (fade > .1) drawOverlays(b);
    if (!dying && !b.entry) {
      drawCore(b);
      drawWarnings(b);
    }
    drawDebris(b);
    drawParticles(b);
  }

  return { spawn, update, updateDeath, targets, hit, draw };
})();
