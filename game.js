'use strict';

const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=540,H=960;let DPR=1;

const LEVELS=[
 {name:'Atoll Zéro',bg:'assets/media/asset-1e7f145fe2b17b49.webp',music:'assets/media/asset-5372aa1538ce11e8.mp3',boss:'assets/bosses/level1_',bossName:'Forteresse tropicale',bossW:365,bossH:255,bossHP:920,scroll:78,difficulty:.75},
 {name:'Canyon Cobra',bg:'assets/media/asset-b4b075f2a8effd54.webp',music:'assets/media/asset-dfd337069a08a75a.mp3',boss:'assets/bosses/level2_',bossName:'Cuirassé fluvial',bossW:190,bossH:410,bossHP:720,scroll:88,difficulty:.92},
 {name:'Fjord Polaris',bg:'assets/media/asset-da11ca2fc6a768ff.webp',music:'assets/media/asset-805d1533c2aa7955.mp3',boss:'assets/bosses/level3_',bossName:'Forteresse arctique',bossW:350,bossH:315,bossHP:930,scroll:96,difficulty:1.08},
 {name:'Assaut Neptune',bg:'assets/media/asset-d540b62ca0222a72.webp',music:'assets/media/asset-27898a229597795c.mp3',boss:'assets/bosses/level4_',bossName:'Porte-avions Titan',bossW:260,bossH:405,bossHP:1220,scroll:105,difficulty:1.22}
,
 {name:"Village Mangrove",bg:"assets/media/asset-1bb9f55694fd63e5.webp",music:"assets/media/asset-6d3da2811150d09c.mp3",boss:'chapter2',bossName:"Hydra Rotor",bossW:350,bossH:330,bossHP:1180,scroll:108,difficulty:1.28},
 {name:"Archipel Sentinel",bg:"assets/media/asset-db68d325555c18f0.webp",music:"assets/media/asset-5826d4c7fbd4a177.mp3",boss:'chapter2',bossName:"Leviathan Azure",bossW:330,bossH:430,bossHP:1420,scroll:112,difficulty:1.34},
 {name:"Village des Cendres",bg:"assets/media/asset-4b8cb13f98415782.webp",music:"assets/media/asset-e0a03e9cc45094f1.mp3",boss:'chapter2',bossName:"Inferno Bastion",bossW:390,bossH:330,bossHP:1650,scroll:116,difficulty:1.42},
 {name:"Base Nocturne",bg:"assets/media/asset-b70f8b9f88ca1679.webp",music:"assets/media/asset-2ef885cd506f5e06.mp3",boss:'chapter2',bossName:"Nightfall Ω",bossW:390,bossH:470,bossHP:1980,scroll:120,difficulty:1.52}
];
const SHIPS=[
 {id:'blue',name:'Aigle bleu',meta:'Équilibré • précis • maniable',hp:3,speed:365,fire:.145,damageMul:1.00,damageTaken:1.00,hitbox:13,specialName:'MISSILES LOCK-ON',color:'#55cfff',frames:{idle:[12,25,245,300],left:[275,55,235,260],right:[520,55,225,260],boost:[730,20,255,330]}},
 {id:'green',name:'Viper vert',meta:'Blindé • puissant • plus lent',hp:5,speed:305,fire:.18,damageMul:1.38,damageTaken:.68,hitbox:16,specialName:'CANON PERFORANT',color:'#67ef72',frames:{idle:[15,355,245,285],left:[280,365,230,255],right:[520,365,230,255],boost:[725,340,260,325]}},
 {id:'red',name:'Talon rouge',meta:'Ultra rapide • fragile • cadence forte',hp:2,speed:425,fire:.098,damageMul:.82,damageTaken:1.22,hitbox:11,specialName:'ESSAIM ROUGE',color:'#ff6666',frames:{idle:[15,680,245,300],left:[280,700,230,250],right:[515,700,230,250],boost:[735,675,250,320]}},
 {id:'gold',name:'As doré',meta:'Puissant • couverture large • moins agile',hp:3,speed:345,fire:.155,damageMul:1.18,damageTaken:.90,hitbox:17,specialName:'RAYON SOLAIRE',color:'#ffd452',frames:{idle:[20,995,240,315],left:[280,1010,230,260],right:[515,1010,230,260],boost:[730,970,265,360]}}
];
const ENEMIES={
 green:{hp:2,score:100,speed:90,size:48,frames:{left:[20,135,150,170],idle:[170,130,220,180],right:[385,135,165,170]}},
 yellow:{hp:2.5,score:130,speed:96,size:50,frames:{left:[25,345,150,170],idle:[170,340,225,185],right:[390,345,165,175]}},
 red:{hp:3,score:170,speed:108,size:52,frames:{left:[25,550,150,180],idle:[170,545,225,190],right:[390,550,165,180]}},
 heli:{hp:5,score:260,speed:82,size:58,anim:[[565,185,170,255],[720,185,170,255],[880,185,170,255],[1040,185,180,255]]},
 bomber:{hp:7,score:360,speed:74,size:68,anim:[[535,500,350,230],[880,500,350,230]]}
};
const FX={blue:[55,10,105,130],red:[55,140,105,90],pink:[55,230,105,85],missile:[55,315,160,105],expl:[30,585,170,135],expl2:[190,580,175,145],expl3:[360,570,200,155],smoke:[35,995,155,115]};

const imgs={};
const sources={players:'assets/media/asset-c6192a52c9fd3c43.png',enemy:'assets/media/asset-7c50342e88c0d854.png',fx:'assets/media/asset-2b8d8d38f5ffd922.png',pickups:'assets/media/asset-587ddc9c51ac0e38.png',logo:'assets/media/asset-9b927fa305681cda.png'};
for(let i=0;i<LEVELS.length;i++)sources['bg'+i]=LEVELS[i].bg;Object.assign(sources,{"boss0_1":"assets/media/asset-5d972b013a226068.png","boss0_2":"assets/media/asset-03adc53a02576fab.png","boss0_3":"assets/media/asset-430a84a42cbc753e.png","boss0_4":"assets/media/asset-a8bfd7915068b92b.png","boss1_1":"assets/media/asset-5e0e03f53edd2f5b.png","boss1_2":"assets/media/asset-576ed988debe69d6.png","boss1_3":"assets/media/asset-10fbe99109a337ac.png","boss1_4":"assets/media/asset-5c158dbb69b3ec44.png","boss2_1":"assets/media/asset-7c66647e2eeb6b5b.png","boss2_2":"assets/media/asset-27825509ff1cb50d.png","boss2_3":"assets/media/asset-1725fae67ac7fdb9.png","boss2_4":"assets/media/asset-fc0ddb93f1c6dd03.png","boss3_1":"assets/media/asset-a89805ca67cdc9b3.png","boss3_2":"assets/media/asset-c17ddb531cd0930c.png","boss3_3":"assets/media/asset-8ef3ed8d8a17b0d5.png","boss3_4":"assets/media/asset-446008995b23f653.png"})
sources.newFx='assets/media/asset-6b37dc97238dd8a5.png';
sources.redStars='assets/media/asset-fa7227c373ca6daa.png';
sources.bossDestroy='assets/media/asset-f1e9c7955a611057.png';
sources.debrisAtlas='assets/media/asset-e44e11c9e481928e.png';

/* Delta Force 0 — assets Evolution */
sources["plane_blue_0"]="assets/media/asset-38f4c286bb41aa1c.png";
sources["plane_blue_1"]="assets/media/asset-cbacd3900178a9d2.png";
sources["plane_blue_2"]="assets/media/asset-c9f461c1dbf721ff.png";
sources["plane_blue_3"]="assets/media/asset-fc028563b0a81544.png";
sources["plane_blue_4"]="assets/media/asset-2b88617001115370.png";
sources["plane_green_0"]="assets/media/asset-80081054373d169a.png";
sources["plane_green_1"]="assets/media/asset-038ef04a7332336a.png";
sources["plane_green_2"]="assets/media/asset-79818a9618b9a161.png";
sources["plane_green_3"]="assets/media/asset-309c9fc641b743f3.png";
sources["plane_green_4"]="assets/media/asset-127a0963e5e87b4d.png";
sources["plane_red_0"]="assets/media/asset-85a3245724b28d4d.png";
sources["plane_red_1"]="assets/media/asset-b7e17c7bfc1ea536.png";
sources["plane_red_2"]="assets/media/asset-e6abc32109ce7f82.png";
sources["plane_red_3"]="assets/media/asset-c47e100783e71cc0.png";
sources["plane_red_4"]="assets/media/asset-e2a90770a654955c.png";
sources["plane_gold_0"]="assets/media/asset-2d3db332069da007.png";
sources["plane_gold_1"]="assets/media/asset-e2c9bc3dca6207cf.png";
sources["plane_gold_2"]="assets/media/asset-463bb498be103828.png";
sources["plane_gold_3"]="assets/media/asset-b41dcb7edb36ef89.png";
sources["plane_gold_4"]="assets/media/asset-1b4c464d60f6324b.png";
sources["shield_icon"]="assets/media/asset-689f530501af4c52.png";
sources["u1_icon"]="assets/media/asset-cfabab185a81004c.png";
sources["u2_icon"]="assets/media/asset-6f35b1001402c826.png";
sources["u3_icon"]="assets/media/asset-ef416cba27c7c878.png";
sources["u4_icon"]="assets/media/asset-8d380893c26df73e.png";
sources["bullet_basic"]="assets/media/asset-233391275b0b1204.png";
sources["bullet_dual"]="assets/media/asset-587ab168af5c939e.png";
sources["bullet_wide"]="assets/media/asset-a52b5101a5892204.png";
sources["bullet_spread"]="assets/media/asset-a5d374400a7b97bd.png";
sources["bullet_elite"]="assets/media/asset-3bc4facf1788ccfa.png";
sources["bullet_special"]="assets/media/asset-3582e3c7f04804e7.png";
sources["congrats_title"]="assets/media/asset-073f3bfb20592d95.png";
sources["reward_special_badge"]="assets/media/asset-fada615f8cc6915a.png";
sources["reward_life_badge"]="assets/media/asset-dd812cc394039e54.png";

/* Evolution Plus embedded assets */
sources["enemyAlt"]="assets/media/asset-3813dfc12f88bc6d.png";
sources["turretAlt"]="assets/media/asset-df504184bbff3839.png";
sources["shieldBoss"]="assets/media/asset-a977a6e4b5f89149.png";
sources["carrierEpic"]="assets/media/asset-2271829c2afcb40f.png";

/* === V4.1 EVOLUTION COMPLETE : ASSETS EMBARQUES === */
sources['uiShipBlue']='assets/media/asset-2ea5b141241a59e0.png';
sources['uiShipGreen']='assets/media/asset-509f2275dbd3ad7e.png';
sources['uiShipRed']='assets/media/asset-bce5dd32ed50ddc8.png';
sources['uiShipGold']='assets/media/asset-5bb8923a0c46cf92.png';
sources['carrierBodyV41']='assets/media/asset-d1d6747a40955000.png';
sources['carrierTurretCannon']='assets/media/asset-ddb26456bb1d8fef.png';
sources['carrierTurretCannonDmg']='assets/media/asset-ba39883c9cfde4d1.png';
sources['carrierTurretMissile']='assets/media/asset-4e8439e72ba879da.png';
sources['carrierTurretMissileDmg']='assets/media/asset-dcdec3e5db02c8f6.png';
sources['carrierTurretTriple']='assets/media/asset-33f6a6e31c4bfd31.png';
sources['carrierTurretTripleDmg']='assets/media/asset-813b719a05179a38.png';
sources['carrierTurretRotary']='assets/media/asset-ac05b7fb1d11d289.png';
sources['carrierTurretRotaryDmg']='assets/media/asset-411425bed63653e0.png';

/* CHAPITRE 2 — assets intégrés */
Object.assign(sources,{"enemyChapter2":"assets/media/asset-683378032d181255.webp","boss21":"assets/media/asset-3ca577449a330f2a.webp","boss22":"assets/media/asset-0d35234232b8797c.webp","boss23":"assets/media/asset-0b1dcd7be3591e57.webp","boss24":"assets/media/asset-2fe730deee843d96.webp"});
Object.assign(sources,{"bg4":"assets/media/asset-1bb9f55694fd63e5.webp","bg5":"assets/media/asset-db68d325555c18f0.webp","bg6":"assets/media/asset-4b8cb13f98415782.webp","bg7":"assets/media/asset-b70f8b9f88ca1679.webp"});

/* V5.2 campaign visual assets */
sources.campaignMenuArt='assets/media/asset-0a16e72ef9f2ed97.webp';
sources.campaignProgressArt='assets/media/asset-3dbc445a1f3a7fd7.webp';
sources.campaignUiArt='assets/media/asset-612cdb378dd78d96.webp';

function drawSprite(img,r,x,y,w,h,rot=0,alpha=1){if(!img)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);if(rot)ctx.rotate(rot);ctx.drawImage(img,r[0],r[1],r[2],r[3],-w/2,-h/2,w,h);ctx.restore()}
function showMsg(t,sec=1.6){$('message').textContent=t;$('message').classList.add('show');clearTimeout(showMsg.t);showMsg.t=setTimeout(()=>$('message').classList.remove('show'),sec*1000)}
function banner(t,sec=2){$('levelBanner').textContent=t;$('levelBanner').classList.add('show');clearTimeout(banner.t);banner.t=setTimeout(()=>$('levelBanner').classList.remove('show'),sec*1000)}

function ship(){return SHIPS.find(x=>x.id===S.selectedShip)||SHIPS[0]}
function stageLabel(i){const chapter=Math.floor(i/4)+1,sub=(i%4)+1;return `${chapter}.${sub}`}
const CAMPAIGN_PAGES=[
 {name:'Front tropical',range:'Niveaux 1.1 à 2.4',chapters:[1,2]},
 {name:'Contre-offensive',range:'Niveaux 3.1 à 4.4',chapters:[3,4]},
 {name:'Guerre totale',range:'Niveaux 5.1 à 6.4',chapters:[5,6]},
 {name:'Dernier assaut',range:'Niveaux 7.1 à 8.4',chapters:[7,8]}
];
const FUTURE_NAMES={3:['Jungle Obsidienne','Delta Rouge','Forteresse Kappa','Temple de Fer'],4:['Désert Spectral','Convoi Zeta','Citadelle Solaire','Orbite Noire'],5:['Glacier Sigma','Faille Titan','Station Borealis','Cœur Arctique'],6:['Métropole Fantôme','Zone Reactor','Avenue des Cendres','Dôme Central'],7:['Lune d’Acier','Anneau Vega','Plateforme Zéro','Nexus Rouge'],8:['Approche Finale','Mur Oméga','Trône Ennemi','Dernière Force']};
function getProgress() {
  if (embedHost) return embedProgress;
  return clampV(parseInt(readSetting('df0progress'),10)||0,0,32);
}
function setProgress(value) {
  const progress = Math.max(getProgress(),clampV(value,0,embedHost ? LEVELS.length : 32));
  if (embedHost) {
    embedProgress = progress;
    sendToHost('progress',{progress});
  } else writeSetting('df0progress',progress);
  return progress;
}
function markLevelComplete(i){return setProgress(i+1)}
let mapPage=0;
function campaignNodeData(globalIndex){const chapter=Math.floor(globalIndex/4)+1,sub=(globalIndex%4)+1,label=`${chapter}.${sub}`;if(globalIndex<LEVELS.length)return {label,name:LEVELS[globalIndex].name,implemented:true};const arr=FUTURE_NAMES[chapter]||[];return {label,name:arr[sub-1]||'Zone classifiée',implemented:false}}
function pageUnlocked(page){return S.invincible||page===0||getProgress()>=page*8}
function renderProgress(page=mapPage){
 mapPage=Math.max(0,Math.min(3,page));
 const progress=getProgress(),P=CAMPAIGN_PAGES[mapPage],TEST_UNLOCK_ALL=S.invincible&&!embedHost;
 const visual=$('progressVisualPage'),future=$('progressFuturePage');
 if(mapPage===0){
   visual.classList.remove('hidden');future.classList.add('hidden');
   const layer=$('progressVisualNodes');layer.innerHTML='';
   for(let gi=0;gi<8;gi++){
     const d=campaignNodeData(gi),btn=document.createElement('button');btn.className=`visualLevelNode vnode${gi}`;
     const complete=gi<progress,available=(TEST_UNLOCK_ALL&&d.implemented)||(gi===progress&&d.implemented),unlocked=d.implemented&&(TEST_UNLOCK_ALL||complete||available);
     if(complete)btn.classList.add('complete');else if(available)btn.classList.add('current');else btn.classList.add('locked');
     const badge=document.createElement('span');badge.className='visualNodeBadge';badge.textContent=complete?'✓ TERMINÉ':available?'▶ DISPONIBLE':'🔒 VERROUILLÉ';btn.appendChild(badge);
     btn.setAttribute('aria-label',`${d.label} ${d.name} ${badge.textContent}`);
     if(unlocked)btn.onclick=()=>{sfx('pickup');launchLevelReliable(gi)};else btn.disabled=true;
     layer.appendChild(btn);
   }
   const done=Math.min(progress,LEVELS.length);$('progressVisualSummary').textContent=TEST_UNLOCK_ALL?`MODE TEST • ${LEVELS.length}/${LEVELS.length} niveaux jouables déverrouillés`:`${done}/${LEVELS.length} zones sécurisées • Prochain objectif : ${progress<LEVELS.length?stageLabel(progress):'chapitre 3 à venir'}`;
   $('mapPrev').disabled=false;$('mapNext').disabled=false;
   $('continueCampaignBtn').hidden=progress>=LEVELS.length;
   $('continueCampaignBtn').textContent=progress?`Continuer · ${stageLabel(progress)}`:'Commencer · 1.1';
 }else{
   visual.classList.add('hidden');future.classList.remove('hidden');
   $('mapPageName').textContent=`Carte ${mapPage+1} — ${P.name}`;$('mapPageRange').textContent=P.range;
   $('mapPrevFuture').disabled=false;$('mapNextFuture').disabled=mapPage===3;
   const m=$('campaignMap');m.innerHTML='<div class="campaignPath"></div>';
   const start=mapPage*8;const y=[58,128,205,278,380,452,529,602];
   const div=document.createElement('div');div.className='chapterDivider';div.style.top='342px';m.appendChild(div);
   const tag1=document.createElement('div');tag1.className='chapterTag';tag1.style.top='16px';tag1.textContent=`CHAPITRE ${P.chapters[0]}`;m.appendChild(tag1);
   const tag2=document.createElement('div');tag2.className='chapterTag';tag2.style.top='350px';tag2.textContent=`CHAPITRE ${P.chapters[1]}`;m.appendChild(tag2);
   for(let k=0;k<8;k++){
     const gi=start+k,d=campaignNodeData(gi),btn=document.createElement('button');btn.className='levelNode';btn.style.top=y[k]+'px';
     const complete=gi<progress,available=(TEST_UNLOCK_ALL&&d.implemented)||(gi===progress&&d.implemented),unlocked=d.implemented&&(TEST_UNLOCK_ALL||gi<=progress);
     if(complete)btn.classList.add('complete');else if(available)btn.classList.add('current');else if(!d.implemented)btn.classList.add('future');else btn.classList.add('locked');
     const st=complete?'✓ TERMINÉ':available?'▶ DISPONIBLE':(!d.implemented?'À VENIR':'🔒 VERROUILLÉ');
     btn.innerHTML=`<div class="n">${d.label}</div><div class="nm">${d.name}</div><div class="st">${st}</div>`;
     if(unlocked||complete)btn.onclick=()=>{sfx('pickup');startGame(gi)};else btn.disabled=true;m.appendChild(btn);
   }
   if(!pageUnlocked(mapPage)){
     const lock=document.createElement('div');lock.className='pageLock';lock.innerHTML=`<div class="pageLockBox"><div class="pageLockIcon">🔒</div><div class="pageLockTitle">Carte verrouillée</div><div class="pageLockText">Termine la carte précédente pour déverrouiller ${P.range}.</div></div>`;m.appendChild(lock);
   }
   const done=Math.min(progress,LEVELS.length);$('progressSummary').textContent=TEST_UNLOCK_ALL?`MODE TEST • tous les niveaux actuellement créés sont accessibles`:`${done}/${LEVELS.length} zones actuelles sécurisées • Prochain objectif : ${progress<LEVELS.length?stageLabel(progress):'chapitre 3 à venir'}`;
   if(TEST_UNLOCK_ALL){$('resumeProgressBtn').disabled=false;$('resumeProgressBtn').textContent='Choisir un niveau déverrouillé';}else{$('resumeProgressBtn').disabled=progress>=LEVELS.length;$('resumeProgressBtn').textContent=progress<LEVELS.length?`Jouer au niveau ${stageLabel(progress)}`:'Chapitre 3 à venir';}
 }
}
function openProgress(){setScreen('progress');renderProgress(0)}

const SHIP_DETAILS={
 blue:{role:'Intercepteur polyvalent',desc:'Pilotage équilibré et tirs concentrés pour viser entre les défenses.',tags:['Précision','Maniabilité'],strong:'Petit gabarit et bonne vitesse.',weak:'Armure moyenne.',special:'Huit missiles autoguidés se répartissent entre les ennemis et les modules du boss.',up:['U1 · Deux tirs décalés','U2 · Noyau renforcé','U3 · Deux tirs inclinés','U4 · Tir central supplémentaire']},
 green:{role:'Chasseur blindé',desc:'Appareil lourd conçu pour tenir sa position et percer les défenses.',tags:['Blindage','Puissance'],strong:'Cinq points d’énergie et impact élevé.',weak:'Déplacement lent et large gabarit.',special:'Après une charge visible, le canon traverse les cibles alignées et fragilise les blindages.',up:['U1 · Double tir lourd','U2 · Obus central perforant','U3 · Batteries latérales','U4 · Canon frontal à pénétration accrue']},
 red:{role:'Chasseur offensif',desc:'Un appareil léger qui alterne déplacements rapides et rafales en diagonale.',tags:['Vitesse','Cadence'],strong:'Vitesse et cadence les plus élevées.',weak:'Deux points d’énergie et projectiles légers.',special:'Quatre salves de missiles autoguidés partent des flancs et poursuivent plusieurs cibles.',up:['U1 · Double rafale','U2 · Première paire diagonale','U3 · Éventail élargi','U4 · Tirs latéraux à grand angle']},
 gold:{role:'Prototype d’élite',desc:'Une couverture croissante et un rayon à balayer sur les points faibles.',tags:['Puissance','Couverture'],strong:'Tir large et résistance accrue.',weak:'Plus grande surface exposée.',special:'Après la charge, le rayon suit les déplacements latéraux du vaisseau et endommage en continu les cibles traversées.',up:['U1 · Flux double','U2 · Tir triple','U3 · Éventail à cinq trajectoires','U4 · Paire latérale supplémentaire']}
};
const ALT_ENEMY_CELLS={blue:[0,0],purple:[4,0],orange:[0,1],green:[4,1],red:[0,2],olive:[4,2],heavy:[0,3],heli:[4,3]};
const TURRET_ROWS={gun:0,mini:1,missile:2,plasma:3};
function updateShipInfo(){
 const box=$('shipInfo');if(!box)return;
 const sh=ship(),d=SHIP_DETAILS[sh.id]||SHIP_DETAILS.blue;
 const key={blue:'uiShipBlue',green:'uiShipGreen',red:'uiShipRed',gold:'uiShipGold'}[sh.id];
 const atk=Math.round(Math.min(100,55*sh.damageMul+(1/sh.fire-6)*5));
 const spd=Math.round(Math.min(100,sh.speed/4.5));
 const def=Math.round(Math.min(100,(sh.hp*15)+(1-sh.damageTaken)*45));
 const spec={blue:78,green:86,red:82,gold:94}[sh.id]||80;
 box.innerHTML=`<div class="shipHero"><img class="shipHeroArt" src="${sources[key]}" alt="${sh.name}"><div class="shipHeroText"><div class="shipInfoTitle">${sh.name}</div><div class="shipInfoRole">${d.role}</div><div class="shipInfoDesc">${d.desc}</div><div class="shipPills">${d.tags.map(x=>`<span class="shipPill">${x}</span>`).join('')}</div></div></div><div class="shipBars"><div class="shipBar"><span>Vitesse</span><div class="shipBarTrack"><div class="shipBarFill" style="width:${spd}%"></div></div><b>${sh.speed}</b></div><div class="shipBar"><span>Attaque</span><div class="shipBarTrack"><div class="shipBarFill" style="width:${atk}%"></div></div><b>${Math.round(sh.damageMul*100)}%</b></div><div class="shipBar"><span>Défense</span><div class="shipBarTrack"><div class="shipBarFill" style="width:${def}%"></div></div><b>${sh.hp}♥</b></div><div class="shipBar"><span>Spécial</span><div class="shipBarTrack"><div class="shipBarFill" style="width:${spec}%"></div></div><b>${spec}</b></div></div><div class="shipTraits"><div class="shipTrait good"><strong>POINTS FORTS</strong>${d.strong}</div><div class="shipTrait bad"><strong>FAIBLESSES</strong>${d.weak}</div></div><div class="shipSpecial"><strong>SPÉCIAL — ${sh.specialName}</strong><br>${d.special}</div><ul class="shipUpgrades">${d.up.map(x=>`<li>${x}</li>`).join('')}</ul>`;
}
function chooseAltVariant(type){if(S.level<1||type==='bomber')return null;const pool=type==='green'?['blue','orange','olive']:type==='yellow'?['purple','orange','green']:type==='red'?['red','olive','purple']:type==='heli'?['heli','heavy']:['blue'];return pool[Math.floor(Math.random()*pool.length)]}

function altEnemyRect(name){const c=ALT_ENEMY_CELLS[name];if(!c)return null;const cw=181,ch=271.5;return [c[0]*cw,c[1]*ch,cw,ch]}

function shieldAlreadyAvailable(){return !!((S.player&&S.player.shield>0)||S.drops.some(d=>d.kind==='shield'))}

function turretRect(t){const row=TURRET_ROWS[t.kind]??0,col=t.dead?4:t.hp<t.maxHp*.45?3:t.flash>0?2:0;return [col*289.6,row*271.5,289.6,271.5]}
function drawTurret(t,bossNode=false){
 if(bossNode&&S.level===3&&t.carrierPart){
   const key=(t.dead||t.hp<=0)?t.carrierDmg:t.carrierPart,im=imgs[key];
   if(im){ctx.save();if(t.flash>0&&!t.dead){ctx.shadowBlur=18;ctx.shadowColor='#fff2a3'}drawImageCentered(im,t.x,t.y,74,70,0,1);ctx.restore();return}
 }
 if(!imgs.turretAlt)return;drawSprite(imgs.turretAlt,turretRect(t),t.x,t.y,bossNode?76:66,bossNode?70:61,0,1)
}

const EQUIP_TYPES=['u1','u2','u3','u4'];
const EQUIP_NAMES={u1:'DOUBLE CYAN',u2:'CANON LOURD',u3:'ÉVENTAIL OR',u4:'MODULE ÉLITE'};
const BULLET_IMAGE={basic:'bullet_basic',u1:'bullet_dual',u2:'bullet_wide',u3:'bullet_spread',u4:'bullet_elite'};
function remainingEquipment(){return EQUIP_TYPES.filter(k=>!S.equipment.includes(k)&&!S.drops.some(d=>d.kind==='weapon'&&d.upgradeType===k))}
function syncWeapon(){S.weapon=1+S.equipment.length}
function resetEquipment(){S.equipment.length=0;syncWeapon()}
function grantStarReward(){if(S.starsRewardGranted)return;S.starsRewardGranted=true;S.special=1;S.specialCooldown=0;$('specialCount').textContent='x1';$('specialBtn').classList.remove('used');S.lives++;$('livesText').textContent='♥'.repeat(S.lives);showMsg('4 ÉTOILES ! SPÉCIAL RECHARGÉ + 1 VIE',2.4);sfx('victory')}
function startCongratulations(){S.rewardCelebration={t:0};S.enemies.length=0;S.eBullets.length=0;S.pBullets.length=0;stopMusic();sfx('victory')}
function drawImageCentered(im,x,y,maxW,maxH,rot=0,alpha=1){if(!im)return;const sc=Math.min(maxW/im.width,maxH/im.height),w=im.width*sc,h=im.height*sc;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);if(rot)ctx.rotate(rot);ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore()}

function drawCongratulations(){const rc=S.rewardCelebration;if(!rc)return;const t=rc.t;ctx.save();ctx.fillStyle='rgba(2,8,18,.82)';ctx.fillRect(0,0,W,H);if(imgs.congrats_title)drawImageCentered(imgs.congrats_title,W/2,175,470,110,0,1);else{ctx.textAlign='center';ctx.font='1000 31px system-ui';ctx.fillStyle='#ffd45e';ctx.fillText('CONGRATULATIONS',W/2,180)}const xs=[105,215,325,435];for(let i=0;i<4;i++){const age=t-(.40+i*.50);if(age<=0)continue;const sc=Math.min(1,age/.22),pulse=1+Math.sin(age*10)*.06;ctx.save();ctx.shadowBlur=22;ctx.shadowColor='#ff442d';ctx.fillStyle='rgba(255,70,35,.17)';ctx.beginPath();ctx.arc(xs[i],330,34*sc*pulse,0,Math.PI*2);ctx.fill();ctx.restore();const r=[52,110,255,285];if(imgs.redStars)ctx.drawImage(imgs.redStars,r[0],r[1],r[2],r[3],xs[i]-31*sc,330-33*sc,62*sc,66*sc)}if(t>2.35){ctx.textAlign='center';ctx.font='1000 24px system-ui';ctx.fillStyle='#fff4b0';ctx.shadowBlur=9;ctx.shadowColor='#ff9b25';ctx.fillText('4 ÉTOILES ROUGES !',W/2,430);ctx.shadowBlur=0;if(imgs.reward_special_badge)drawImageCentered(imgs.reward_special_badge,170,550,195,132);if(imgs.reward_life_badge)drawImageCentered(imgs.reward_life_badge,370,550,175,96);ctx.font='900 17px system-ui';ctx.fillStyle='#dff9ff';ctx.fillText('SPÉCIAL RECHARGÉ  •  +1 VIE',W/2,650);ctx.font='1000 18px system-ui';ctx.fillStyle='#ffe8a7';ctx.fillText(`NIVEAU ${stageLabel(S.level)} TERMINÉ`,W/2,700)}ctx.restore()}

function initShips(){
 const g=$('shipGrid');g.innerHTML='';
 const imgKey={blue:'uiShipBlue',green:'uiShipGreen',red:'uiShipRed',gold:'uiShipGold'};
 for(const sh of SHIPS){
   const b=document.createElement('button');b.className='shipCard';b.dataset.id=sh.id;
   b.innerHTML=`<img class="shipPreviewImg" src="${sources[imgKey[sh.id]]}" alt="${sh.name}"><div class="shipName">${sh.name}</div><div class="shipMeta">${sh.meta}</div>`;
    b.onclick=()=>{S.selectedShip=sh.id;writeSetting('df0ship',sh.id);updateShips();sfx('pickup')};g.appendChild(b)
 }
 updateShips();updateShipInfo();

}

function updateShips(){document.querySelectorAll('.shipCard').forEach(b=>{const active=b.dataset.id===S.selectedShip;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});updateShipInfo()}
function initTracks(){const t=$('trackList');t.innerHTML='';LEVELS.forEach((L,i)=>{const b=document.createElement('button');b.className='track';b.innerHTML=`<span>Niveau ${stageLabel(i)} — ${L.name}</span><span>▶ écouter</span>`;b.onclick=()=>{S.previewing=true;music.pause();music.src=L.music;music.loop=true;music.currentTime=0;if(S.music)music.play().catch(()=>{});document.querySelectorAll('.track').forEach((x,j)=>x.classList.toggle('active',j===i))};t.appendChild(b)})}

function clampV(v,a,b){return Math.max(a,Math.min(b,v))}

function enemyFrame(o){const e=ENEMIES[o.type];if(e.anim)return e.anim[Math.floor(o.t*8)%e.anim.length];if(o.vx<-18)return e.frames.left;if(o.vx>18)return e.frames.right;return e.frames.idle}

function spawnDrop(kind='weapon',x=W/2,y=-25){
 if(kind==='shield'&&shieldAlreadyAvailable())return;
 const d={kind,x,y,vy:105,t:0};
 if(kind==='weapon'){
   const remain=remainingEquipment();
   if(!remain.length){if(shieldAlreadyAvailable())return;d.kind='shield';d.vy=88}else{d.upgradeType=remain[Math.floor(Math.random()*remain.length)];d.vy=92}
 }else if(kind==='shield'){d.vy=88}
 S.drops.push(d)
}
function spawnRedStar(){if(S.redStarsSpawned>=4)return;S.redStarsSpawned++;const lanes=[W*.28,W*.42,W*.58,W*.72],x=lanes[(S.redStarsSpawned-1)%4];S.drops.push({kind:'redstar',x,y:92,vy:66,t:0,starIndex:S.redStarsSpawned,magnet:0});$('redStarCount').textContent=`${S.starsCollected}/4`;showMsg(`★ ÉTOILE ROUGE ${S.redStarsSpawned}/4 ★`,2.0);sfx('pickup')}

function ch2EnemyRect(cell){const cw=181,ch=271.5;return [cell[0]*cw,cell[1]*ch,cw,ch]}

function drawDrop(d){const bob=Math.sin((d.t||0)*6)*3;ctx.save();ctx.translate(d.x,d.y+bob);if(d.kind==='redstar'){const pulse=1+Math.sin(d.t*8)*.12;ctx.save();ctx.shadowBlur=26;ctx.shadowColor='#ff3b20';ctx.fillStyle='rgba(255,55,25,.22)';ctx.beginPath();ctx.arc(0,0,31*pulse,0,Math.PI*2);ctx.fill();ctx.restore();const fr=Math.floor((d.t*8)%4),rects=[[52,110,255,285],[340,105,270,290],[635,105,270,290],[925,95,290,305]],r=rects[fr];if(imgs.redStars)ctx.drawImage(imgs.redStars,r[0],r[1],r[2],r[3],-34*pulse,-34*pulse,68*pulse,68*pulse);ctx.fillStyle='#fff4a8';ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillText(`${d.starIndex}/4`,0,47);ctx.restore();return}else if(d.kind==='weapon'){const im=imgs[`${d.upgradeType||'u1'}_icon`];if(im){const pulse=1+Math.sin(d.t*7)*.06;drawImageCentered(im,0,0,48*pulse,48*pulse);ctx.fillStyle='#fff4a8';ctx.font='1000 11px system-ui';ctx.textAlign='center';ctx.fillText((d.upgradeType||'U1').toUpperCase(),0,33);ctx.restore();return}ctx.shadowBlur=14;ctx.shadowColor='#ffd74e';ctx.fillStyle='#ffd74e';ctx.fillRect(-10,-15,20,30)}else if(d.kind==='shield'){if(imgs.shield_icon){const pulse=1+Math.sin(d.t*8)*.06;drawImageCentered(imgs.shield_icon,0,0,50*pulse,50*pulse);ctx.restore();return}ctx.shadowBlur=16;ctx.shadowColor='#49f3ff';ctx.fillStyle='#49f3ff';ctx.beginPath();ctx.arc(0,0,17,0,Math.PI*2);ctx.fill()}else{ctx.shadowBlur=18;ctx.shadowColor='#ffd14a';ctx.fillStyle='#ffcf3f';ctx.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5,rad=i%2===0?16:7;i?ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad):ctx.moveTo(Math.cos(a)*rad,Math.sin(a)*rad)}ctx.closePath();ctx.fill()}ctx.restore()}
function enemyAngle(o){return Number.isFinite(o.angle)?o.angle:(Math.atan2((o.vyNow||o.vy||160),o.vx||0)+Math.PI/2)}

function drawEnemyUnit(o){const e=ENEMIES[o.type],pulse=1+Math.sin(o.t*10)*.035,size=e.size*(o.elite?1.48:1.35)*pulse,ang=enemyAngle(o);ctx.save();ctx.translate(o.x,o.y);ctx.rotate(ang);ctx.globalAlpha=.8;ctx.shadowBlur=12;ctx.shadowColor=o.elite?'#ffae2b':'rgba(80,220,255,.55)';ctx.fillStyle=o.elite?'rgba(255,162,46,.92)':'rgba(88,234,255,.8)';ctx.beginPath();ctx.moveTo(-7,size*.34);ctx.lineTo(0,size*.68+(Math.sin(o.t*26)>0?8:3));ctx.lineTo(7,size*.34);ctx.closePath();ctx.fill();ctx.restore();if(o.elite){ctx.save();ctx.strokeStyle='rgba(255,190,54,.85)';ctx.shadowBlur=15;ctx.shadowColor='#ff9b24';ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,e.size*.62,0,Math.PI*2);ctx.stroke();ctx.restore()}if(o.ch2Cell&&imgs.enemyChapter2){const r=ch2EnemyRect(o.ch2Cell),ch2Size=size*.92;drawSprite(imgs.enemyChapter2,r,o.x,o.y,ch2Size,ch2Size,ang);return}if(o.variant&&imgs.enemyAlt){const r=altEnemyRect(o.variant);if(r){drawSprite(imgs.enemyAlt,r,o.x,o.y,size*1.08,size*1.08,ang);return}}drawSprite(imgs.enemy,enemyFrame(o),o.x,o.y,size,size,ang)}

const music = $('music');
const settings = {
  graphics: readSetting('df0graphics') || 'auto',
  reduced: readSetting('df0reduced'),
};
const keys = new Set();
const hud = Object.fromEntries([
  'score','level','weapon','timer','livesText','hpFill','bossHud','bossFill','bossFill2',
  'bossLabel','bossSubLabel','specialBtn','specialCount','redStarCount',
].map(id => [id, $(id)]));
const S = {
  scene: 'start', running: false, paused: false, level: 0, levelTime: 0, levelDuration: 60,
  score: 0, missionScore: 0, lives: 3, weapon: 1, equipment: [],
  player: null, enemies: [], pBullets: [], eBullets: [], turrets: [], bossNodes: [],
  drops: [], fx: [], boss: null, bossDeath: null, rewardCelebration: null,
  starsCollected: 0, special: 1, specialCooldown: 0, touch: null, bank: 0,
  bgY: 0, shake: 0, hitStop: 0, stats: newStats(),
  selectedShip: readSetting('df0ship') || 'blue', invincible: readSetting('df0invincible') === '1',
  sound: readSetting('df0sound') !== '0', music: readSetting('df0music') !== '0',
  soundVol: readVolume('df0soundvol', .75), musicVol: readVolume('df0musicvol', .42),
};
const combat = createCombatV6({
  S, W, H, ctx, LEVELS, ENEMIES, ship, sfx, showMsg, spawnDrop, killEnemy, hitPlayer,
  drawEnemyUnit, drawTurret, bossTargets:()=>BossV6.targets(), bossHit:(...args)=>BossV6.hit(...args),
  quality:visualQuality, reducedEffects, setSpecialStatus() {
    hud.specialCount.textContent = Math.ceil(S.specialCooldown)+'s';
    hud.specialBtn.classList.add('used');
  },
});
let frame = 0;
let last = 0;
let nextHudRefresh = 0;
let adaptiveQuality = window.matchMedia('(pointer: coarse)').matches || (navigator.deviceMemory || 8) <= 4 ? 1 : 2;
let performanceWindow = 0;
let slowFrameTime = 0;
let fastFrameTime = 0;
let launchToken = 0;
let nextMission = null;
let deferredInstallPrompt = null;
let activeVideo = null;
let fadeTimeout;
let musicFade = 0;
let missionTrack = '';
let ac;
let audioOutput;
const lastSound = {};
const imageLoads = new Map();
const mediaMotion = matchMedia('(prefers-reduced-motion: reduce)');
let releaseInput;

function readSetting(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeSetting(key, value) {
  try { localStorage.setItem(key, String(value)); } catch { /* Storage can be disabled in private embeds. */ }
}

function readVolume(key, fallback) {
  const value = parseFloat(readSetting(key));
  return Number.isFinite(value) ? clampV(value, 0, 1) : fallback;
}

function newStats() {
  return {shots: 0, hits: 0, kills: 0, damage: 0, bonuses: 0, boss: false};
}

function visualQuality() {
  return ({low: 0, medium: 1, high: 2})[settings.graphics] ?? adaptiveQuality;
}

function reducedEffects() {
  return settings.reduced === null ? mediaMotion.matches : settings.reduced === '1';
}

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, [1, 1.25, 1.75][visualQuality()]);
  if (canvas.width !== Math.round(W*dpr) || canvas.height !== Math.round(H*dpr)) {
    canvas.width = Math.round(W*dpr);
    canvas.height = Math.round(H*dpr);
  }
  DPR = canvas.width / W;
  ctx.setTransform(DPR, 0, 0, canvas.height/H, 0, 0);
  ctx.imageSmoothingEnabled = true;
}

function adaptGraphics(elapsed) {
  if (settings.graphics !== 'auto' || elapsed > .12 || elapsed <= 0) return;
  performanceWindow += elapsed;
  if (elapsed > .023) slowFrameTime += elapsed;
  if (elapsed < .019) fastFrameTime += elapsed;
  if (performanceWindow < 4) return;
  const previous = adaptiveQuality;
  if (slowFrameTime / performanceWindow > .38) adaptiveQuality = Math.max(0, adaptiveQuality-1);
  if (fastFrameTime / performanceWindow > .93 && performanceWindow >= 12) adaptiveQuality = Math.min(2, adaptiveQuality+1);
  if (previous !== adaptiveQuality) resize();
  if (previous !== adaptiveQuality || performanceWindow >= 12 || fastFrameTime / performanceWindow < .9) {
    performanceWindow = slowFrameTime = fastFrameTime = 0;
  }
}

function loadArt(keys) {
  return Promise.all(keys.filter(key => sources[key]).map(key => {
    if (imgs[key]) return imgs[key];
    if (imageLoads.has(key)) return imageLoads.get(key);
    const pending = new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        imgs[key] = image;
        resolve(image);
      };
      image.onerror = () => resolve(null);
      image.src = sources[key];
    }).finally(() => imageLoads.delete(key));
    imageLoads.set(key, pending);
    return pending;
  }));
}

const COMMON_ART = [
  'players','enemy','fx','turretAlt','enemyAlt','enemyChapter2','newFx','debrisAtlas',
  'shieldBoss','shield_icon','redStars','u1_icon','u2_icon','u3_icon','u4_icon',
  'congrats_title','reward_special_badge','reward_life_badge'
];

function loadLevelArt(level) {
  const prefix = level < 4 ? `boss${level}_` : `boss${17+level}`;
  const keys = Object.keys(sources).filter(key =>
    key.startsWith(prefix) || key.startsWith(`plane_${ship().id}_`) || (level===3 && key.startsWith('carrier')));
  if (level === 0) keys.push('bossDestroy');
  return loadArt(['bg'+level, ...keys, ...COMMON_ART]);
}

function releaseOldArt(level) {
  const shipPrefix = `plane_${ship().id}_`;
  const bossPrefix = level < 4 ? `boss${level}_` : `boss${17+level}`;
  for (const key of Object.keys(imgs)) {
    const obsolete = (/^bg\d$/.test(key) && key !== 'bg'+level) ||
      (/^boss\d/.test(key) && !key.startsWith(bossPrefix)) ||
      (key.startsWith('plane_') && !key.startsWith(shipPrefix)) ||
      (key.startsWith('carrier') && level!==3) || (key==='bossDestroy' && level!==0);
    if (obsolete) delete imgs[key];
  }
}

function setScreen(id = null) {
  for (const name of ['start','playMenu','progress','ships','opts','end']) $(name).classList.toggle('hidden', name !== id);
  S.scene = id || 'play';
  $('hud').classList.toggle('hidden', S.scene !== 'play');
  $('installGameBtn').classList.toggle('show', S.scene === 'start' && !!deferredInstallPrompt);
  if (S.scene === 'play') requestLoop();
}

function audio() {
  if (!ac) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      ac = new Audio();
      const limiter = ac.createDynamicsCompressor();
      limiter.threshold.value = -19;
      limiter.ratio.value = 7;
      limiter.connect(ac.destination);
      audioOutput = limiter;
    } catch { return; }
  }
  if (ac.state === 'suspended') ac.resume().catch(() => {});
}

function tone(from, length=.09, type='sine', gain=.055, to=from, delay=0) {
  if (!S.sound || S.soundVol <= 0) return;
  if (!ac) audio();
  if (!ac || !audioOutput) return;
  const start = ac.currentTime + delay;
  const oscillator = ac.createOscillator();
  const volume = ac.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + length);
  volume.gain.setValueAtTime(.0001, start);
  volume.gain.exponentialRampToValueAtTime(Math.max(.0002, gain*S.soundVol), start+.008);
  volume.gain.exponentialRampToValueAtTime(.0001, start+length);
  oscillator.connect(volume).connect(audioOutput);
  oscillator.start(start);
  oscillator.stop(start+length+.01);
  oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
}

const voices = {
  shot: [[550,.038,'triangle',.035,230]],
  enemyShot: [[340,.085,'triangle',.032,145]],
  hit: [[145,.24,'triangle',.18,45],[90,.13,'sawtooth',.03,34]],
  explode: [[125,.21,'triangle',.115,35],[165,.1,'sawtooth',.023,46]],
  pickup: [[565,.12,'sine',.09,790],[935,.18,'triangle',.05,960,.065]],
  special: [[180,.25,'triangle',.11,580]],
  lockOn: [[680,.11,'sine',.085,1050],[320,.23,'triangle',.075,110,.10]],
  redSwarm: [[230,.23,'sawtooth',.035,850],[455,.23,'triangle',.075,122,.08]],
  lanceCharge: [[75,.4,'triangle',.15,440],[170,.42,'sine',.085,835]],
  lanceFire: [[185,.37,'sawtooth',.065,36],[89,.5,'triangle',.125,27]],
  solarCharge: [[265,.53,'sine',.09,860],[392,.56,'triangle',.052,1290]],
  solarFire: [[215,.68,'triangle',.14,70],[1800,.45,'sine',.035,375]],
  armorBreak: [[185,.24,'triangle',.13,39],[470,.14,'sawtooth',.031,170]],
  shieldHit: [[810,.095,'sine',.067,340]],
  enemyImpact: [[260,.065,'triangle',.042,98]],
  boss: [[90,.45,'triangle',.17,46],[170,.3,'sawtooth',.035,92,.08],[140,.39,'triangle',.11,62,.42]],
  victory: [[523,.17,'triangle',.085],[659,.17,'triangle',.085,659,.12],[784,.22,'triangle',.09,784,.24],[1047,.38,'sine',.09,1047,.37]],
  engine: [[52,.34,'sine',.07,34],[93,.31,'triangle',.028,61]],
};

function sfx(name) {
  if (!S.sound || !voices[name]) return;
  const now = performance.now();
  const interval = ({shot:90, enemyShot:155, explode:75, enemyImpact:75, shieldHit:90, engine:500})[name] || 45;
  if (now - (lastSound[name] ?? -Infinity) < interval) return;
  lastSound[name] = now;
  for (const voice of voices[name]) tone(...voice);
}

function playMusic(src, gain=1) {
  const absolute = new URL(src, document.baseURI).href;
  if (music.src !== absolute) music.src = src;
  music.volume = S.musicVol * gain;
  if (S.music) music.play().catch(() => {});
}

function stopMusic() {
  cancelAnimationFrame(musicFade);
  music.pause();
  music.currentTime = 0;
}

function fadeMusic(from, to, duration) {
  cancelAnimationFrame(musicFade);
  const start = performance.now();
  const apply = now => {
    const progress = Math.min(1, (now-start)/duration);
    music.volume = S.musicVol * (from+(to-from)*progress);
    if (progress < 1) musicFade = requestAnimationFrame(apply);
  };
  musicFade = requestAnimationFrame(apply);
}

function boostBossMusic() {
  if (S.music) fadeMusic(.75, 1, 950);
}

function setupLevel(first = false) {
  nextHudRefresh = 0;
  Object.assign(S, {
    levelTime: 0, bgY: 0, special: 1, specialCooldown: 0, boss: null,
    bossDeath: null, rewardCelebration: null, shake: 0, hitStop: 0, transition: false,
    starsCollected: 0, redStarsSpawned: 0, redStarNext: 8, starsRewardGranted: false,
    shieldSpawned: false, shieldDropAt: 33, dropSchedule: 9, respawnTimer: 0,
    bank: 0, touch: null, missionScore: S.score, stats: newStats(),
  });
  for (const key of ['enemies','pBullets','eBullets','turrets','bossNodes','drops','fx']) S[key] = [];
  const pilot = ship();
  S.player = {x:W/2, y:H-125, hp:pilot.hp, maxHp:pilot.hp, speed:pilot.speed,
    cool:0, inv:1.6, dead:false, shield:0, vx:0, vy:0};
  combat.reset();
  Scenery.reset(S.level);
  hideAlert();
  hud.bossHud.classList.remove('show');
  hud.bossFill.style.width = '100%';
  hud.bossFill2.style.width = '0%';
  hud.bossSubLabel.textContent = '';
  $('bossModules').textContent = '';
  hud.specialBtn.classList.remove('used');
  hud.specialBtn.setAttribute('aria-label', `Tir spécial · ${pilot.specialName}`);
  hud.specialCount.textContent = 'x1';
  hud.redStarCount.textContent = '0/4';
  missionTrack = LEVELS[S.level].music;
  playMusic(missionTrack, .12);
  fadeMusic(.12, .75, 800);
  sfx('engine');
  banner(`NIVEAU ${stageLabel(S.level)} — ${LEVELS[S.level].name}`, 2);
  if (!first) showMsg('Nouvelle zone · spécial prêt', 1.4);
  refreshHud();
}

function startGame(fromLevel = 0, continueCampaign = false) {
  audio();
  nextMission = null;
  S.level = clampV(Math.trunc(fromLevel)||0, 0, LEVELS.length-1);
  if (!continueCampaign) {
    resetEquipment();
    S.score = 0;
    S.lives = 3;
  }
  releaseOldArt(S.level);
  loadLevelArt(S.level);
  S.running = true;
  S.paused = false;
  releaseInput();
  $('pauseOverlay').classList.remove('show');
  setupLevel(!continueCampaign);
  setScreen(null);
  last = 0;
}

function refreshHud() {
  hud.score.textContent = S.score;
  hud.level.textContent = stageLabel(S.level);
  hud.weapon.textContent = S.weapon;
  hud.timer.textContent = S.bossDeath ? 'VICTOIRE' : S.rewardCelebration ? 'BRAVO' : S.boss ? 'BOSS' :
    Math.max(0, Math.ceil(S.levelDuration - S.levelTime));
  hud.livesText.textContent = '♥'.repeat(Math.max(0,S.lives))+'♡'.repeat(Math.max(0,3-S.lives));
  hud.hpFill.style.width = (100*Math.max(0,S.player.hp)/S.player.maxHp)+'%';
}

function hitPlayer(ix, iy) {
  const p = S.player;
  if (!S.running || !p || p.dead) return;
  const x = ix ?? p.x, y = iy ?? p.y;
  if (S.invincible || p.shield > 0) {
    addImpact('shieldHit',x,y,.2,.35);
    sfx('shieldHit');
    return;
  }
  if (p.inv > 0) return;
  const damage = Math.min(p.hp, ship().damageTaken);
  S.stats.damage += damage;
  p.hp -= damage;
  p.inv = .95;
  S.shake = Math.max(S.shake,.19);
  addImpact('playerImpact',x,y,.29,.45);
  sfx('hit');
  refreshHud();
  if (p.hp > .001) return;
  S.lives--;
  resetEquipment();
  if (S.lives <= 0) {
    finish(false, 'Vos vies sont épuisées.');
    return;
  }
  addImpact('boom',p.x,p.y,.52,.65);
  p.dead = true;
  p.shield = 0;
  S.respawnTimer = .72;
  S.eBullets.length = 0;
  S.pBullets.length = 0;
  releaseInput();
  showMsg(`Vie perdue · arme de base · ${S.lives} restante${S.lives > 1 ? 's' : ''}`, 1.7);
}

function killEnemy(enemy) {
  S.score += (ENEMIES[enemy.type]?.score || 100) * (enemy.elite ? 2 : 1);
  S.stats.kills++;
  addImpact('boom', enemy.x, enemy.y, .44, enemy.type === 'bomber' ? .58 : .38);
  sfx('explode');
  if (Math.random() < .025 && !shieldAlreadyAvailable()) spawnDrop('shield',enemy.x,enemy.y);
}

function addImpact(type, x, y, life, scale) {
  const limit = [30,48,70][visualQuality()];
  if (S.fx.length >= limit) S.fx.shift();
  S.fx.push({type, x, y, life, maxLife:life, scale});
}

function updateDrops(dt,p) {
  if (!S.boss) {
    while (S.redStarsSpawned < 4 && S.levelTime >= S.redStarNext) {
      spawnRedStar();
      S.redStarNext += 12;
    }
    if (!S.shieldSpawned && S.levelTime >= S.shieldDropAt) {
      spawnDrop('shield', W*.5, -25);
      S.shieldSpawned = true;
    }
    S.dropSchedule -= dt;
    if (S.dropSchedule <= 0) {
      if (S.equipment.length < 4) spawnDrop('weapon', W*(.26+Math.random()*.48));
      S.dropSchedule = 12+Math.random()*3;
    }
  }
  for (let i=S.drops.length-1; i>=0; i--) {
    const d = S.drops[i];
    const star = d.kind === 'redstar';
    d.t += dt;
    d.y += d.vy*dt;
    d.x += Math.sin(d.t*(star ? 2.4 : 3)+(d.starIndex || 0))*20*dt;
    const dx = p.x-d.x, dy = p.y-d.y, distance = Math.hypot(dx,dy);
    if (!p.dead && star && distance > 1 && distance < 165) {
      const pull = (1-distance/165)*105*dt/distance;
      d.x += dx*pull;
      d.y += dy*pull;
    }
    if (!p.dead && distance < (star ? 45 : 35)) {
      S.stats.bonuses++;
      if (d.kind === 'weapon' && d.upgradeType && !S.equipment.includes(d.upgradeType)) {
        S.equipment.push(d.upgradeType);
        syncWeapon();
        showMsg(`Arme renforcée · niveau ${S.weapon}`, 1.4);
      } else if (d.kind === 'shield') {
        p.shield = 4.75;
        showMsg('Bouclier actif',1.2);
      } else if (star) {
        S.starsCollected++;
        S.score += 600;
        hud.redStarCount.textContent = `${S.starsCollected}/4`;
        if (S.starsCollected === 4) grantStarReward();
      } else {
        S.score += 250;
      }
      addImpact('pickup',d.x,d.y,.32,.7);
      sfx('pickup');
      S.drops.splice(i,1);
    } else if (d.y > H+48) {
      S.drops.splice(i,1);
    }
  }
}

function updateEffects(dt) {
  for (let i=S.fx.length-1; i>=0; i--) {
    S.fx[i].life -= dt;
    if (S.fx[i].life <= 0) S.fx.splice(i,1);
  }
  const cap = [36,56,82][visualQuality()];
  if (S.fx.length > cap) S.fx.splice(0,S.fx.length-cap);
}

function updateMovement(dt,p) {
  const direction = (plus, minus) => Number(plus.some(k=>keys.has(k))) - Number(minus.some(k=>keys.has(k)));
  const dx = direction(['ArrowRight','KeyD'], ['ArrowLeft','KeyA','KeyQ']);
  const dy = direction(['ArrowDown','KeyS'], ['ArrowUp','KeyW','KeyZ']);
  if (!S.touch && !p.dead) {
    const n = Math.hypot(dx,dy) || 1;
    p.vx = dx*p.speed/n;
    p.vy = dy*p.speed/n;
    p.x += p.vx*dt;
    p.y += p.vy*dt;
    S.bank += (p.vx-S.bank)*Math.min(1,dt*16);
  } else {
    S.bank *= Math.max(0,1-dt*8);
  }
  p.x = clampV(p.x,29,W-29);
  p.y = clampV(p.y,120,H-37);
}

function update(dt) {
  if (!S.running || S.paused || !S.player) return;
  const p = S.player;
  const level = LEVELS[S.level];
  S.levelTime += dt;
  S.bgY += level.scroll * dt;
  S.shake = Math.max(0,S.shake-dt);
  updateEffects(dt);
  if (S.bossDeath) {
    BossV6.updateDeath(dt);
    refreshHud();
    return;
  }
  if (S.rewardCelebration) {
    S.rewardCelebration.t += dt;
    if (S.rewardCelebration.t >= 4.15) {
      S.rewardCelebration = null;
      nextLevel();
    }
    refreshHud();
    return;
  }
  p.cool = Math.max(0,p.cool-dt);
  p.inv = Math.max(0,p.inv-dt);
  p.shield = Math.max(0,p.shield-dt);
  if (S.respawnTimer > 0) {
    S.respawnTimer -= dt;
    if (S.respawnTimer <= 0) {
      Object.assign(p,{dead:false,hp:p.maxHp,inv:2.5,x:W/2,y:H-125});
      sfx('engine');
    }
  }
  if (S.specialCooldown > 0) {
    S.specialCooldown = Math.max(0,S.specialCooldown-dt);
    const text = S.specialCooldown ? Math.ceil(S.specialCooldown)+'s' : 'x1';
    if (hud.specialCount.textContent !== text) hud.specialCount.textContent = text;
    if (!S.specialCooldown) {
      S.special = 1;
      hud.specialBtn.classList.remove('used');
      sfx('pickup');
    }
  }
  updateMovement(dt,p);
  if (!S.boss && S.levelTime >= S.levelDuration) {
    BossV6.spawn();
    boostBossMusic();
  }
  combat.updateActors(dt);
  if (S.boss) BossV6.update(dt,p);
  if (!p.dead) combat.firePlayer();
  combat.updateProjectiles(dt);
  if (S.running) updateDrops(dt,p);
  if (S.levelTime >= nextHudRefresh) {
    refreshHud();
    nextHudRefresh = S.levelTime+.095;
  }
}

function special() {
  if (!S.running || S.paused || S.bossDeath || S.rewardCelebration || S.player?.dead) return;
  combat.special();
}

function drawPlayerCraft() {
  const p = S.player;
  if (!p || p.dead) return;
  const pilot = ship();
  const stage = S.equipment.length;
  const rotation = clampV(S.bank*.00048,-.24,.24);
  const opacity = p.inv > 0 && !reducedEffects() ? .64 + .36*Math.abs(Math.sin(S.levelTime*20)) : 1;
  const flame = Scenery.flare(pilot.color);
  const boost = Math.sin(S.levelTime*39)*3 + Math.min(20,Math.abs(p.vy||0)*.04);
  ctx.save();
  ctx.translate(p.x,p.y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(flame,-23,17,46,52+boost);
  ctx.drawImage(flame,-8,23,16,37+boost);
  ctx.globalCompositeOperation = 'source-over';
  const image = imgs[`plane_${pilot.id}_${stage}`];
  const hover = Math.sin(S.levelTime*7.5)*1.5;
  if (image) drawImageCentered(image,0,hover,78+stage*4,94+stage*5);
  else drawSprite(imgs.players,pilot.frames.boost,0,hover,72,94);
  if (p.shield > 0) {
    ctx.strokeStyle = p.shield < .8 ? '#77e9ff88' : '#8befff';
    ctx.fillStyle = '#76ddf219';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0,0,40+Math.sin(S.levelTime*8)*1.4,0,Math.PI*2);
    ctx.stroke();
    ctx.fill();
  }
  ctx.restore();
}

function drawProjectile(b) {
  const color = SHIPS.find(pilot=>pilot.id===b.ship)?.color || '#55cfff';
  const tier = b.tier || 1;
  const flare = Scenery.flare(color);
  ctx.save();
  ctx.translate(b.x,b.y);
  ctx.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);
  const size = Math.max(3,(b.size || 7)*.5);
  if (visualQuality() > 0) ctx.drawImage(flare,-size*1.8,-size*4,size*3.6,size*8);
  ctx.fillStyle = color;
  ctx.fillRect(-size*.72,-12-tier*2,size*1.44,22+tier*2);
  ctx.fillStyle = '#fff8e6';
  ctx.fillRect(-size*.24,-12-tier*2,size*.48,19+tier*2);
  ctx.restore();
}

function drawImpacts() {
  for (const impact of S.fx) {
    const life = clampV(impact.life/(impact.maxLife || .43),0,1);
    const size = 32*(impact.scale || .4);
    if (impact.type === 'boom') {
      drawSprite(imgs.fx,FX.expl3,impact.x,impact.y,100*(impact.scale||.4)*(1.25-life*.25),
        88*(impact.scale||.4),0,Math.min(reducedEffects() ? .64 : 1,life*1.8));
      continue;
    }
    const color = impact.type === 'shieldHit' ? '#73eeff' : impact.type === 'pickup' ? '#ffe88d' : '#ffc17c';
    ctx.save();
    ctx.globalAlpha = life;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1,life*3);
    ctx.beginPath();
    ctx.arc(impact.x,impact.y,7+size*(1.1-life),0,Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
}

function draw() {
  const shake = reducedEffects() ? 0 : Math.min(S.shake*20,6);
  ctx.save();
  ctx.fillStyle = '#081926';
  ctx.fillRect(0,0,W,H);
  if (shake) ctx.translate(Math.sin(S.levelTime*85)*shake, Math.cos(S.levelTime*68)*shake*.65);
  Scenery.drawGround();
  combat.drawGround();
  combat.drawEnemies();
  BossV6.draw();
  Scenery.drawAir();
  combat.drawPlayerShots();
  for (const drop of S.drops) drawDrop(drop);
  combat.drawSpecial();
  drawPlayerCraft();
  combat.drawHostileShots();
  drawImpacts();
  combat.drawForeground();
  if (S.rewardCelebration) drawCongratulations();
  ctx.restore();
}

function requestLoop() {
  if (!frame && S.scene === 'play' && S.running && !S.paused) frame = requestAnimationFrame(loop);
}

function loop(timestamp) {
  frame = 0;
  if (S.scene !== 'play' || !S.running || S.paused) return;
  const elapsed = last ? (timestamp-last)/1000 : 0;
  last = timestamp;
  adaptGraphics(elapsed);
  const dt = Math.min(.05,elapsed);
  if (dt > 0) {
    const slow = S.hitStop > 0 && !reducedEffects() ? .36 : 1;
    S.hitStop = Math.max(0,S.hitStop-dt);
    const steps = dt > .023 ? 2 : 1;
    for (let i=0; i<steps; i++) update(dt*slow/steps);
  }
  draw();
  requestLoop();
}

function hideAlert() {
  clearTimeout(banner.t);
  clearTimeout(showMsg.t);
  $('levelBanner').classList.remove('show');
  $('message').classList.remove('show');
}

function finish(win, text, stagePassed = false) {
  S.running = false;
  S.paused = false;
  releaseInput();
  stopMusic();
  hideAlert();
  setScreen('end');
  $('endTitle').textContent = win ? 'Victoire totale' : stagePassed ? 'Mission accomplie' : 'Mission échouée';
  $('endText').textContent = text;
  $('nextMissionBtn').hidden = nextMission === null;
  $('retryBtn').classList.toggle('primary',nextMission === null);
  $('retryBtn').textContent = stagePassed || win ? 'Rejouer la mission' : 'Recommencer';
  const stats = S.stats;
  const values = [
    ['Score mission', (S.score-S.missionScore).toLocaleString('fr-FR')],
    ['Précision', `${stats.shots ? Math.min(100,Math.round(stats.hits/stats.shots*100)) : 0} %`],
    ['Ennemis abattus', stats.kills],
    ['Dégâts reçus', stats.damage.toLocaleString('fr-FR',{maximumFractionDigits:2})],
    ['Boss vaincu', stats.boss ? 'Oui' : 'Non'],
    ['Bonus récupérés', stats.bonuses],
  ];
  const list = $('resultStats');
  list.replaceChildren();
  for (const [label,value] of values) {
    const item = document.createElement('div');
    const name = document.createElement('dt');
    const number = document.createElement('dd');
    name.textContent = label;
    number.textContent = value;
    item.append(name,number);
    list.append(item);
  }
}

function nextLevel() {
  if (!S.running) return;
  markLevelComplete(S.level);
  S.stats.boss = true;
  if (S.level === LEVELS.length-1) {
    nextMission = null;
    sfx('victory');
    finish(true,'Les huit zones sont sécurisées.');
  } else {
    nextMission = S.level+1;
    loadLevelArt(nextMission);
    finish(false,`${LEVELS[S.level].name} · ${S.score.toLocaleString('fr-FR')} points cumulés`,true);
  }
}

const INTRO_VIDEO_URL = 'assets/video/intro.mp4';
const AFTER_BOSS11_VIDEO_URL = 'assets/video/after-stage-1-1.mp4';

const embedHost = (() => {
  if (parent === window) return null;
  const params = new URLSearchParams(location.search);
  if (params.get('embed') !== 'tmf') return null;
  try {
    const url = new URL(params.get('parentOrigin'));
    const secureHost = /^trouver-mon-film(?:-(?:[a-z0-9-]+-)?hugol-trading)?\.vercel\.app$/i.test(url.hostname);
    const loopback = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    return ((url.protocol === 'https:' && secureHost) || (loopback && /^https?:$/.test(url.protocol))) &&
      url.origin === params.get('parentOrigin') ? url.origin : null;
  } catch { return null; }
})();
let embedProgress = 0;

function sendToHost(type, data={}) {
  if (embedHost) parent.postMessage({channel:'tmf-games',type,...data},embedHost);
}

window.addEventListener('message', event => {
  if (!embedHost || event.source !== parent || event.origin !== embedHost || event.data?.channel !== 'tmf-games') return;
  const {type, progress} = event.data;
  if (type === 'restore' && Number.isInteger(progress)) {
    embedProgress = Math.max(embedProgress,clampV(progress,0,LEVELS.length));
    if (S.scene === 'progress') renderProgress(mapPage);
  } else if (type === 'save') sendToHost('progress',{progress:embedProgress});
  else if (type === 'pause') pauseGame();
});

function launchLevelReliable(level = 0, continueCampaign = false) {
  if (level < 0 || level >= LEVELS.length) return;
  const title = `Mission ${stageLabel(level)} · ${LEVELS[level].name}`;
  const fade = $('cinematicFade');
  clearTimeout(fadeTimeout);
  $('cinematicFadeTitle').textContent = title;
  $('cinematicFadeSub').textContent = level === 4 ? 'Chapitre 2 · front ennemi' : 'Autorisation de décollage';
  fade.classList.remove('hidden');
  requestAnimationFrame(() => fade.classList.add('show'));
  const token = ++launchToken;
  audio();
  loadLevelArt(level);
  document.activeElement?.blur();
  fadeTimeout = setTimeout(() => {
    if (token !== launchToken) return;
    nextMission = null;
    startGame(level,continueCampaign);
    fade.classList.remove('show');
    fadeTimeout = setTimeout(() => fade.classList.add('hidden'),440);
  },440);
}

function finishVideoOverlay() {
  if (!activeVideo) return;
  const playback = activeVideo;
  activeVideo = null;
  clearTimeout(playback.timer);
  const video = $('introVideo');
  video.pause();
  $('introOverlay').classList.remove('show');
  $('introOverlay').classList.add('hidden');
  video.removeAttribute('src');
  video.load();
  playback.done();
}

function playVideoOverlay(src, title, done) {
  if (activeVideo) return;
  audio();
  stopMusic();
  const video = $('introVideo');
  $('introTagText').textContent = title;
  $('introStatus').textContent = 'Chargement de la transmission…';
  $('introOverlay').classList.remove('hidden');
  $('introOverlay').classList.add('show');
  activeVideo = {done, started:false, timer:setTimeout(finishVideoOverlay,11500)};
  video.volume = Math.max(S.music ? S.musicVol : 0,S.sound ? S.soundVol*.75 : 0);
  video.src = src;
  loadLevelArt(nextMission ?? 0);
  requestVideoPlayback();
}

function requestVideoPlayback() {
  const playback = activeVideo;
  if (!playback) return;
  $('introVideo').play().catch(() => {
    if (activeVideo === playback && !playback.started) $('introStatus').textContent = 'Touchez la vidéo pour démarrer.';
  });
}

function pauseGame() {
  if (activeVideo) {
    $('introVideo').pause();
    return;
  }
  if (!S.running || S.paused || S.scene !== 'play') return;
  S.paused = true;
  S.pausedMusicTime = music.currentTime;
  releaseInput();
  $('pauseOverlay').classList.add('show');
  cancelAnimationFrame(musicFade);
  music.pause();
}

function resumeGame() {
  if (!S.running || !S.paused) return;
  audio();
  S.paused = false;
  $('pauseOverlay').classList.remove('show');
  if (!S.bossDeath && !S.rewardCelebration) playMusic(missionTrack, S.boss ? 1 : .75);
  $('pauseBtn').blur();
  last = 0;
  setScreen(null);
  requestLoop();
}

function updateOpts() {
  for (const [on,off,enabled] of [['soundOn','soundOff',S.sound],['musicOn','musicOff',S.music],['invOn','invOff',S.invincible]]) {
    for (const [id,pressed] of [[on,enabled],[off,!enabled]]) {
      $(id).classList.toggle('active',pressed);
      $(id).setAttribute('aria-pressed',pressed);
    }
  }
  for (const [id,volume] of [['soundVolume',S.soundVol],['musicVolume',S.musicVol]]) {
    $(id).value = Math.round(volume*100);
    $(id+'Val').textContent = Math.round(volume*100)+'%';
  }
  $('graphicsQuality').value = settings.graphics;
  $('reduceEffects').checked = reducedEffects();
}

releaseInput = () => {
  keys.clear();
  const pointer = S.touch?.id;
  S.touch = null;
  if (pointer !== undefined && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
  S.bank = 0;
};
const moveCodes = new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD','KeyZ','KeyQ']);
const specialCodes = new Set(['Space','KeyX']);
const pauseCodes = new Set(['Escape','KeyP']);
window.addEventListener('keydown', event => {
  if (S.scene !== 'play' || !S.running || activeVideo || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.tagName === 'BUTTON' && event.code === 'Space') return;
  if (moveCodes.has(event.code) && !S.paused) {
    event.preventDefault();
    keys.add(event.code);
  } else if (specialCodes.has(event.code) && !S.paused) {
    event.preventDefault();
    if (!event.repeat) special();
  } else if (pauseCodes.has(event.code) && !event.repeat) {
    event.preventDefault();
    if (S.paused) resumeGame();
    else pauseGame();
  }
});
window.addEventListener('keyup', event => keys.delete(event.code));
window.addEventListener('blur',releaseInput);
document.addEventListener('visibilitychange',() => {
  if (document.hidden) pauseGame();
});
canvas.addEventListener('pointerdown', event => {
  if (S.scene !== 'play' || S.paused || S.touch || event.button !== 0) return;
  canvas.setPointerCapture(event.pointerId);
  S.touch = {id:event.pointerId,x:event.clientX,y:event.clientY};
  event.preventDefault();
},{passive:false});
canvas.addEventListener('pointermove', event => {
  const p = S.player;
  const start = S.touch;
  if (!start || start.id !== event.pointerId || !p || p.dead) return;
  const rect = canvas.getBoundingClientRect();
  const dx = (event.clientX-start.x)*W/rect.width;
  const dy = (event.clientY-start.y)*H/rect.height;
  start.x = event.clientX;
  start.y = event.clientY;
  p.x = clampV(p.x+dx,29,W-29);
  p.y = clampV(p.y+dy,120,H-37);
  S.bank = clampV(dx*60,-600,600);
  event.preventDefault();
},{passive:false});
for (const name of ['pointerup','pointercancel','lostpointercapture']) {
  canvas.addEventListener(name, event => {
    if (S.touch?.id === event.pointerId) S.touch = null;
  });
}

$('specialBtn').addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  special();
},{passive:false});
$('specialBtn').onclick = event => { if (event.detail === 0) special(); };
$('pauseBtn').onclick = pauseGame;
$('resumeBtn').onclick = resumeGame;
$('quitBtn').onclick = () => {
  S.running = S.paused = false;
  stopMusic();
  $('pauseOverlay').classList.remove('show');
  setScreen('start');
};
$('pauseOpts').onclick = () => {
  $('pauseOverlay').classList.remove('show');
  setScreen('opts');
  updateOpts();
};
$('optsBack').onclick = () => {
  const playing = S.paused;
  if (S.previewing) {
    stopMusic();
    if (playing) {
      music.src = missionTrack;
      music.currentTime = S.pausedMusicTime || 0;
    }
    S.previewing = false;
    document.querySelectorAll('.track.active').forEach(track=>track.classList.remove('active'));
  }
  setScreen(playing ? null : 'start');
  $('pauseOverlay').classList.toggle('show',playing);
};
$('playBtn').onclick = () => setScreen('playMenu');
$('newGameBtn').onclick = () => playVideoOverlay(INTRO_VIDEO_URL,'Introduction Delta Force 0',() => launchLevelReliable(0));
$('progressBtn').onclick = openProgress;
$('playMenuBack').onclick = () => setScreen('start');
$('progressBack').onclick = () => setScreen('playMenu');
$('mapPrev').onclick = () => setScreen('playMenu');
$('mapNext').onclick = () => renderProgress(1);
$('mapPrevFuture').onclick = () => renderProgress(mapPage-1);
$('mapNextFuture').onclick = () => renderProgress(mapPage+1);
$('resumeProgressBtn').onclick = $('continueCampaignBtn').onclick = () => launchLevelReliable(Math.min(LEVELS.length-1,getProgress()));
$('shipsBtn').onclick = () => { setScreen('ships'); updateShipInfo(); };
$('shipPlayBtn').onclick = () => launchLevelReliable(0);
$('shipsBack').onclick = () => setScreen('start');
$('optsBtn').onclick = () => { setScreen('opts'); updateOpts(); };
$('retryBtn').onclick = () => launchLevelReliable(S.level);
$('menuBtn').onclick = () => setScreen('start');
$('nextMissionBtn').onclick = () => {
  if (nextMission === null) return;
  const level = nextMission;
  if (level === 1) playVideoOverlay(AFTER_BOSS11_VIDEO_URL,'Transmission 1.1',() => launchLevelReliable(level,true));
  else launchLevelReliable(level,true);
};
for (const [key,on,off,persist] of [
  ['sound','soundOn','soundOff','df0sound'],['music','musicOn','musicOff','df0music'],
  ['invincible','invOn','invOff','df0invincible'],
]) {
  for (const [id,enabled] of [[on,true],[off,false]]) {
    $(id).onclick = () => {
      S[key] = enabled;
      writeSetting(persist,enabled ? 1 : 0);
      if (key === 'sound' && enabled) sfx('pickup');
      if (key === 'music' && !enabled) music.pause();
      if (key === 'music' && enabled && S.previewing) music.play().catch(() => {});
      updateOpts();
    };
  }
}
for (const [id,key,persist] of [['soundVolume','soundVol','df0soundvol'],['musicVolume','musicVol','df0musicvol']]) {
  $(id).oninput = event => {
    S[key] = +event.target.value/100;
    writeSetting(persist,S[key]);
    if (key === 'musicVol') music.volume = S.musicVol;
    else sfx('shot');
    $(id+'Val').textContent = Math.round(S[key]*100)+'%';
  };
}
$('graphicsQuality').onchange = event => {
  settings.graphics = event.target.value;
  writeSetting('df0graphics',settings.graphics);
  resize();
};
$('reduceEffects').onchange = event => {
  settings.reduced = event.target.checked ? '1' : '0';
  writeSetting('df0reduced',settings.reduced);
};
$('introSkipBtn').onclick = finishVideoOverlay;
$('introVideo').addEventListener('click', requestVideoPlayback);
$('introVideo').addEventListener('ended',finishVideoOverlay);
$('introVideo').addEventListener('playing',() => {
  if (!activeVideo) return;
  activeVideo.started = true;
  clearTimeout(activeVideo.timer);
  $('introStatus').textContent = '';
});
$('introVideo').addEventListener('error',() => {
  if (!activeVideo) return;
  $('introStatus').textContent = 'Transmission indisponible.';
  clearTimeout(activeVideo.timer);
  activeVideo.timer = setTimeout(finishVideoOverlay,900);
});

const installButton = $('installGameBtn');
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  if (embedHost) return;
  deferredInstallPrompt = event;
  installButton.classList.toggle('show',S.scene === 'start');
});
window.addEventListener('appinstalled',() => {
  deferredInstallPrompt = null;
  installButton.classList.remove('show');
});
installButton.onclick = async () => {
  if (!deferredInstallPrompt) return;
  const prompt = deferredInstallPrompt;
  deferredInstallPrompt = null;
  installButton.classList.remove('show');
  try { await prompt.prompt(); } catch { /* Browser installation is optional. */ }
};
if ('serviceWorker' in navigator && !embedHost) {
  window.addEventListener('load',() => navigator.serviceWorker.register('./sw.js').catch(err => console.warn('PWA',err)));
}

resize();
window.addEventListener('resize',resize);
if (!matchMedia('(pointer: coarse)').matches) {
  $('controlHint').textContent = 'Flèches, ZQSD ou souris pour piloter · Espace pour le tir spécial';
}
$('campaignMenuArtImg').src = sources.campaignMenuArt;
$('campaignProgressArtImg').src = sources.campaignProgressArt;
initShips();
initTracks();
updateOpts();
setScreen('start');
loadLevelArt(0);
sendToHost('ready');
