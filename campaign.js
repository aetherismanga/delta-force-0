'use strict';

// Each flight pairs its terrain, formations and command ship. Times are in mission seconds.
const FRONT_MISSIONS = [
  {
    name:'Vallée de Cuivre', theme:'Escadrille de cuivre', terrain:{water:'#dbdbbc',cloud:.19,leaves:true}, scroll:122,
    waves:[[2,'talons'],[8,'coast'],[14,'pincer'],[20,'relays'],[27,'bombers'],[37,'river'],[43,'talons'],[50,'fleet'],[55,'dive']],
    boss:{name:'Gypaète de cuivre',hue:'#f6ab6b',w:302,h:302,motion:'arctic',wreck:'fall',guard:'armor',guardName:'Épaulière de cuivre',guns:['fan','salvo'],ammo:'bolt',patterns:['sweep','split','aim'],escorts:['harrier','fighter']}
  },
  {
    name:'Col des Aiguilles', theme:'Dérive blanche', terrain:{snow:true,cloud:.26}, scroll:124,
    waves:[[2,'minefield'],[8,'talons'],[14,'relays'],[20,'cover'],[26,'icewall'],[35,'strike'],[42,'minefield'],[49,'shore'],[55,'pincer']],
    boss:{name:'Rempart du Givre',hue:'#a4e7ff',w:284,h:320,motion:'fortress',wreck:'split',guard:'armor',guardName:'Plaque de givre',guns:['plasma','fan'],ammo:'ion',patterns:['cross','wave','split'],escorts:['layer','drone']}
  },
  {
    name:'Détroit Nadir', theme:'Quille de fer', terrain:{water:'#bcecf5',snow:true,cloud:.18}, scroll:126,
    waves:[[2,'cutters'],[8,'minefield'],[14,'river'],[21,'talons'],[27,'icewall'],[36,'flotilla'],[42,'pincer'],[48,'cutters'],[55,'strike']],
    boss:{name:'Brise-glace Nadir',hue:'#7ee4e3',w:232,h:360,motion:'river',wreck:'sink',guard:'shield',guardName:'Projecteur de pont',guns:['missile','salvo'],ammo:'plasma',patterns:['wave','cross','sweep'],escorts:['harrier','layer']}
  },
  {
    name:'Citadelle des Aurores', theme:'Magnétosphère', terrain:{snow:true,aurora:true,night:true,cloud:.15}, scroll:128,
    waves:[[2,'talons'],[8,'icewall'],[14,'minefield'],[20,'relays'],[26,'pincer'],[35,'talons'],[41,'cover'],[47,'icewall'],[54,'strike']],
    boss:{name:'Couronne boréale',hue:'#98f6d0',w:320,h:307,motion:'rotor',wreck:'spin',guard:'shield',guardName:'Prisme auroral',guns:['plasma','missile'],ammo:'ion',patterns:['wheel','split','wave'],escorts:['layer','harrier']}
  },
  {
    name:'Mer des Dunes', theme:'Crocs d’ambre', terrain:{sand:true,cloud:.12}, scroll:131,
    waves:[[2,'mirages'],[8,'sandwall'],[14,'scarabs'],[20,'dive'],[26,'relays'],[35,'mirages'],[41,'bombers'],[47,'sandwall'],[54,'ambush']],
    boss:{name:'Scorpion d’ocre',hue:'#ffb36a',w:308,h:312,motion:'inferno',wreck:'split',guard:'armor',guardName:'Pince blindée',guns:['flame','missile'],ammo:'flame',patterns:['split','aim','cross'],escorts:['mirage','diver']}
  },
  {
    name:'Les Écluses du Nil', theme:'Rase-mottes sur le Nil', terrain:{water:'#9be5ca',cloud:.17}, scroll:133,
    waves:[[2,'flotilla'],[8,'mirages'],[14,'cutters'],[20,'scarabs'],[26,'coast'],[34,'river'],[40,'ambush'],[46,'flotilla'],[53,'fleet']],
    boss:{name:'Amiral du Nil',hue:'#64d4bd',w:246,h:355,motion:'azure',wreck:'sink',guard:'armor',guardName:'Caisson de flottaison',guns:['salvo','plasma'],ammo:'missile',patterns:['cross','wave','aim'],escorts:['scarab','mirage']}
  },
  {
    name:'Nécropole des Sables', theme:'Mur de sable', terrain:{sand:true,storm:true,cloud:.27}, scroll:136,
    waves:[[2,'ambush'],[7,'relays'],[13,'scarabs'],[19,'mirages'],[25,'sandwall'],[33,'minefield'],[39,'ambush'],[46,'scarabs'],[53,'mirages']],
    boss:{name:'Sphinx des sables',hue:'#f3a78d',w:326,h:292,motion:'arctic',wreck:'fall',guard:'shield',guardName:'Obélisque de champ',guns:['fan','flame'],ammo:'flame',patterns:['sweep','wheel','split'],escorts:['mirage','layer']}
  },
  {
    name:'Éclipse de Gizeh', theme:'Disque noir', terrain:{sand:true,night:true,cloud:.13}, scroll:139,
    waves:[[2,'scarabs'],[7,'ambush'],[13,'sandwall'],[19,'minefield'],[25,'relays'],[33,'mirages'],[39,'scarabs'],[45,'icewall'],[52,'ambush']],
    boss:{name:'Râ, le Disque noir',hue:'#ffcd71',w:322,h:324,motion:'nightfall',wreck:'collapse',guard:'shield',guardName:'Sceau solaire',guns:['missile','plasma'],ammo:'plasma',patterns:['wheel','cross','split'],escorts:['scarab','harrier','mirage']}
  }
];

function frontFile(index, kind = 'stage') {
  return `assets/fronts/${kind}-${3 + Math.floor(index / 4)}-${1 + index % 4}`;
}
