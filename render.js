'use strict';

const BOAT_ART = {
  patrol: [962,480,130,190],
  gunboat: [205,674,160,193],
  cutter: [962,480,130,190],
};
const PICKUP_EDGE = 43;
const PICKUP_ART = {
  shield: {key:'shield_icon',color:'#62cbff',symbol:'+'},
  u1: {key:'pickups',frames:[[45,643,86,84]],color:'#ff785b',symbol:'↑'},
  u2: {key:'pickups',frames:[[31,752,110,83]],color:'#72e689',symbol:'Ⅱ'},
  u3: {key:'bullet_spread',color:'#ffb164',symbol:'Ⅲ'},
  u4: {key:'bullet_elite',color:'#ffd465',symbol:'Ⅳ'},
  redstar: {
    key:'redStars',frames:[[56,130,265,261],[355,128,260,264],[641,130,264,261],[934,130,276,265]],
    color:'#ff765c',symbol:'★',
  },
  star: {key:'pickups',frames:[[47,862,84,78]],color:'#ffd465',symbol:'★'},
};

function turretRect(target) {
  const row = TURRET_ROWS[target.kind] ?? 0;
  const column = target.dead ? 4 : target.fireFlash > 0 ? 2 : target.hp < target.maxHp*.45 ? 3 : target.warn > .12 ? 1 : 0;
  return [column*289.6+4,row*271.5+3,281.6,265.5];
}

function drawNavalHull(target,width,height,heading,opacity,death) {
  ctx.save();
  ctx.rotate(heading);
  ctx.fillStyle = '#082e4868';
  ctx.beginPath();
  ctx.ellipse(4,8,width*.48,height*.47,0,0,Math.PI*2);
  ctx.fill();
  if (!target.dead) {
    ctx.strokeStyle = '#a8e3ed89';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const wake = 16+Math.sin(target.t*7)*5;
    for (const sign of [-1,1]) {
      ctx.beginPath();
      ctx.moveTo(sign*width*.14,-height*.32);
      ctx.quadraticCurveTo(sign*width*.25,-height*.55,sign*width*.57,-height*.56-wake);
      ctx.stroke();
    }
  }
  drawSprite(imgs.enemyChapter2,BOAT_ART[target.role],0,0,width,height,
    target.dead ? Math.min(.33,death*.3) : 0,opacity);
  if (target.role === 'cutter' && !target.dead) {
    ctx.fillStyle = '#eedb93';
    ctx.fillRect(-width*.26, 0, width*.52, 3);
    ctx.fillStyle = '#204f60';ctx.fillRect(-4, -4, 8, 12);
  }
  ctx.restore();
}

function drawGroundObject(target) {
  const width = (target.rx || 26)*2.25;
  const height = (target.ry || 25)*2.25;
  const death = target.deathAge || 0;
  const heading = target.angle || 0;
  const opacity = target.dead ? Math.max(0,1-death/(target.naval ? 3.4 : 3)) : 1;
  const aim = target.targetAngle ?? Math.PI*.5;
  ctx.save();
  ctx.translate(target.x,target.y + (target.naval ? death*6 : 0));
  ctx.globalAlpha = opacity;
  if (target.naval) drawNavalHull(target,width,height,heading,opacity,death);
  else drawSprite(imgs.turretAlt,turretRect(target),0,0,width*1.1,height*1.1,
    target.dead ? 0 : aim-Math.PI*.5,opacity);

  if (target.role === 'prism' && !target.dead) {
    ctx.save();ctx.rotate(aim);
    ctx.fillStyle = '#21425a';ctx.strokeStyle = '#a9f7ef';ctx.lineWidth = 2;
    ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(0,8);ctx.lineTo(-9,0);ctx.lineTo(0,-8);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.restore();
  }
  if (!target.dead && target.fireFlash > 0) {
    const distance = target.naval ? height*.30 : height*.41;
    const x = Math.cos(aim)*distance, y = Math.sin(aim)*distance;
    const flash = visualQuality() === 0 ? 13 : 21;
    ctx.globalAlpha = reducedEffects() ? .45 : .86;
    ctx.drawImage(Scenery.flare('#ff9a44'),x-flash/2,y-flash/2,flash,flash);
  }
  if (target.dead && target.naval) {
    ctx.globalAlpha = opacity*(reducedEffects() ? .25 : .58);
    ctx.drawImage(Scenery.flare('#ff874a'),-24-death*2,-26-death*4,48,45);
  }
  ctx.restore();

  if (target.dead || (target.hp === target.maxHp && !(target.warn > .04))) return;
  const y = target.y-height*.5-8;
  const bar = Math.max(24,width*.70);
  const left = target.x-bar*.5;
  ctx.fillStyle = '#07161cdb';
  ctx.fillRect(left-1,y-1,bar+2,5);
  ctx.fillStyle = target.warn > .04 ? '#ffb365' : '#aac088';
  ctx.fillRect(left,y,bar*Math.max(0,target.hp/target.maxHp),3);
}

function drawPickupArt(kind,x,y,size,time) {
  const art = PICKUP_ART[kind] || PICKUP_ART.star;
  const image = imgs[art.key];
  if (image) {
    const frames = art.frames;
    const rect = frames ? frames[Math.floor(time*6)%frames.length] : [0,0,image.width,image.height];
    const scale = size/Math.max(rect[2],rect[3]);
    const width = rect[2]*scale, height = rect[3]*scale;
    ctx.drawImage(image,...rect,x-width/2,y-height/2,width,height);
  } else {
    ctx.fillStyle = art.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 '+Math.round(size*.72)+'px system-ui';
    ctx.fillText(art.symbol,x,y);
  }
}

function pickupCenter(drop) {
  const halo = drop.kind === 'redstar' ? 32 : 28;
  const age = drop.t || 0;
  return {
    x: clampV(drop.x,PICKUP_EDGE,W-PICKUP_EDGE),
    y: clampV(drop.y+Math.sin(age*5)*2,halo+6,H-halo-24),
    halo, age,
  };
}

function drawDrop(drop) {
  const kind = drop.kind === 'weapon' ? drop.upgradeType || 'u1' : drop.kind;
  const art = PICKUP_ART[kind] || PICKUP_ART.star;
  const {x,y,halo,age} = pickupCenter(drop);
  const opacity = clampV(Math.min((drop.y+28)/62,(H+36-drop.y)/64),0,1);
  if (!opacity) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#09213abf';
  ctx.strokeStyle = art.color+'b5';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x,y,halo,0,Math.PI*2);
  ctx.fill();
  ctx.stroke();
  drawPickupArt(kind,x,y,halo*1.53+(reducedEffects()?0:Math.sin(age*7)*1.4),age);
  if (kind === 'redstar' || drop.kind === 'weapon') {
    const label = kind === 'redstar' ? drop.starIndex+'/4' : kind.toUpperCase();
    ctx.fillStyle = '#082032f0';
    ctx.beginPath();
    ctx.roundRect(x-17,y+halo-6,34,18,5);
    ctx.fill();
    ctx.fillStyle = '#fff4d5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 12px system-ui';
    ctx.fillText(label,x,y+halo+3);
  }
  ctx.restore();
}

function drawEnemyUnit(enemy) {
  const model = ENEMIES[enemy.type];
  const art = enemy.art;
  const heading = Number.isFinite(enemy.angle) ? enemy.angle : -Math.atan2(enemy.vx || 0,enemy.vyNow || enemy.vy || 160);
  const size = model.size*(enemy.elite ? 1.48 : 1.35);
  const source = art && imgs[art.key];
  const frames = art?.animatedFrames;
  const rect = source ? (frames?.[Math.floor(enemy.t*10)%frames.length] || art.rect) : enemyFrame(enemy);
  const facing = source ? art.facing : enemy.type === 'heli' ? 'down' : 'up';
  const proportion = source ? (art.aspect || rect[2]/rect[3]) : 1;
  const width = size*Math.sqrt(proportion);
  const height = size/Math.sqrt(proportion);
  ctx.save();
  ctx.translate(enemy.x,enemy.y);
  ctx.rotate(heading);
  if (enemy.type !== 'heli' && enemy.type !== 'bomber' && art?.jet !== false) {
    const flare = Scenery.flare(enemy.elite ? '#ffad50' : '#8ceeff');
    const length = 16+Math.sin(enemy.t*29)*3;
    ctx.globalAlpha = reducedEffects() ? .36 : .64;
    ctx.drawImage(flare,-8,-height*.39-length,16,length+9);
    ctx.globalAlpha = 1;
  }
  if (enemy.elite) {
    ctx.strokeStyle = '#ffcb7be0';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.ellipse(0,0,width*.53,height*.51,0,0,Math.PI*2);
    ctx.stroke();
  }
  drawSprite(source || imgs.enemy,rect,0,0,width,height,facing === 'up' ? Math.PI : 0);
  ctx.restore();
}

function drawCongratulations() {
  const reward = S.rewardCelebration;
  if (!reward) return;
  const t = reward.t;
  const x = W/2, y = H*.35;
  ctx.save();
  ctx.globalAlpha = Math.min(1,t*4);
  ctx.fillStyle = '#081a2bea';
  ctx.strokeStyle = '#ffbb6bba';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(58,y-63,W-116,195,14);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffdfa1';
  ctx.font = '800 25px system-ui';
  ctx.fillText('Quatre étoiles rouges',x,y-19);
  for (let i=0;i<4;i++) {
    const phase = clampV((t-i*.13)*4,0,1);
    if (phase > 0) drawPickupArt('redstar',x+(i-1.5)*71,y+35,55*phase,0);
  }
  ctx.fillStyle = '#dcefff';
  ctx.font = '650 17px system-ui';
  ctx.fillText('Spécial rechargé et une vie gagnée',x,y+101);
  ctx.restore();
}

// Cache small transparent hulls and their illuminated silhouettes at flight resolution.
const hullPlates = new Map();
const plateSize = 144;
function flightCanvas() {
  const image = document.createElement('canvas');
  image.width = image.height = plateSize*2;
  return image;
}
function hullPlate(pilot,stage) {
  const base = imgs['plane_'+pilot.id+'_0'];
  if (!base) return null;
  const upgrade = !pilot.rotorcraft && stage && imgs['plane_'+pilot.id+'_'+stage];
  const key = pilot.id+'-'+(upgrade ? stage : 0);
  if (hullPlates.has(key)) return hullPlates.get(key);
  const hull=flightCanvas(), brush=hull.getContext('2d');
  brush.setTransform(2,0,0,2,plateSize,plateSize);
  function paint(image,w,h) {
    const scale=Math.min(w/image.width,h/image.height);
    const width=image.width*scale,height=image.height*scale;
    brush.drawImage(image,-width/2,-height/2,width,height);
  }
  paint(base,pilot.rotorcraft?.width || 78,pilot.rotorcraft?.height || 94);
  if (upgrade) {
    // Keep the painted fuselage upgrades; every detachable wing station is drawn separately.
    brush.save();
    brush.beginPath();brush.moveTo(-3,-57);brush.lineTo(-8,-23);brush.lineTo(-10,29);
    brush.lineTo(-9,52);brush.lineTo(9,52);brush.lineTo(10,29);brush.lineTo(8,-23);
    brush.lineTo(3,-57);brush.closePath();brush.clip();
    paint(upgrade,78+stage*4,94+stage*5);
    brush.restore();
  }
  const plate = {hull,charge:null};
  hullPlates.set(key,plate);
  return plate;
}
function chargedHull(plate) {
  if (plate.charge) return plate.charge;
  const mask=flightCanvas(), brush=mask.getContext('2d');
  brush.drawImage(plate.hull,0,0);
  brush.globalCompositeOperation='source-in';
  const light=brush.createLinearGradient(54,24,234,258);
  light.addColorStop(0,'#eefeff');light.addColorStop(.42,'#54f6ff');light.addColorStop(1,'#579dff');
  brush.fillStyle=light;brush.fillRect(0,0,mask.width,mask.height);
  const aura=flightCanvas(), rim=aura.getContext('2d');
  rim.shadowColor='#35dcff';rim.shadowBlur=14;rim.drawImage(mask,0,0);
  rim.shadowBlur=0;
  for (const [x,y] of [[-3,0],[3,0],[0,-3],[0,3]]) rim.drawImage(mask,x,y);
  rim.globalCompositeOperation='destination-out';rim.drawImage(plate.hull,0,0);
  rim.globalCompositeOperation='source-over';rim.globalAlpha=.40;rim.drawImage(mask,0,0);
  plate.charge=aura;
  return aura;
}

function drawShieldSurface(pilot,player,front) {
  const {rx,ry}=FlightArms.shieldBounds(pilot,player), calm=reducedEffects();
  const pulse=calm ? .85 : .82+.13*Math.sin(S.levelTime*3.8);
  const strength=pulse*Math.min(1,.36+player.shield/.85);
  ctx.save();
  if (!front) {
    ctx.scale(rx,ry);
    const membrane=ctx.createRadialGradient(0,-.12,.12,0,0,1);
    membrane.addColorStop(0,'#5af1ff14');membrane.addColorStop(.72,'#4cbaff0b');
    membrane.addColorStop(.93,'#68eaff4d');membrane.addColorStop(1,'#69f2ff15');
    ctx.globalAlpha=strength;ctx.fillStyle=membrane;
    ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();
  } else {
    ctx.globalAlpha=strength;ctx.strokeStyle='#68e7ff';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='#c1ffff';ctx.lineWidth=2.6;
    const angle=calm ? -.72 : S.levelTime*.84;
    for (let i=0;i<3;i++) {
      const a=angle+i*Math.PI*2/3;
      ctx.beginPath();ctx.ellipse(0,0,rx-2,ry-2,0,a,a+.43);ctx.stroke();
    }
    if (player.shieldImpact > 0) {
      const life=player.shieldImpact/.36;
      const a=player.shieldAngle-FlightArms.pose(S.bank,S.levelTime).rotation;
      const spread=.21+(1-life)*.95;
      ctx.globalAlpha=life*(calm ? .57 : .95);ctx.strokeStyle='#e2ffff';ctx.lineWidth=2+life*2;
      ctx.beginPath();ctx.ellipse(0,0,rx-2,ry-2,0,a-spread,a+spread);ctx.stroke();
    }
  }
  ctx.restore();
}

function drawHelicopterFallback(pilot) {
  const {width,height} = pilot.rotorcraft;
  ctx.fillStyle = pilot.id === 'libellule' ? '#625274' : '#416368';
  ctx.fillRect(-2,2,4,height*.42);ctx.fillRect(-width*.28,-9,width*.56,8);
  ctx.beginPath();ctx.ellipse(0,-5,width*.16,height*.35,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle = '#82ced9';ctx.beginPath();ctx.ellipse(0,-height*.23,width*.10,height*.10,0,0,Math.PI*2);ctx.fill();
}

function drawRotors(pilot,shielded) {
  const {height,rotors} = pilot.rotorcraft;
  for (const rotor of rotors) {
    const {radius,blades,rate} = rotor, small = radius < 15;
    ctx.save();
    ctx.translate(0,(rotor.y-.5)*height);
    ctx.rotate(S.levelTime*rate + rotor.y*3);
    for (let i=0; i<blades; i++) {
      ctx.rotate(2*Math.PI/blades);
      if (visualQuality() > 0 && !small) {
        ctx.fillStyle = 'rgba(183,205,215,.10)';
        ctx.beginPath();ctx.moveTo(3,0);ctx.arc(0,0,radius,-.25,0);ctx.closePath();ctx.fill();
      }
      ctx.fillStyle = 'rgba(27,42,52,.71)';
      ctx.beginPath();ctx.moveTo(2,-1);ctx.lineTo(radius*.60,-2);
      ctx.lineTo(radius,small ? -.8 : -2.8);ctx.lineTo(radius-.7,1);ctx.lineTo(3,1.6);ctx.closePath();ctx.fill();
      ctx.strokeStyle = shielded ? '#a6f7ff' : 'rgba(218,234,240,.64)';ctx.lineWidth = small ? .55 : 1.05;
      ctx.beginPath();ctx.moveTo(4,-.8);ctx.lineTo(radius,-1.9);ctx.stroke();
      if (!small) { ctx.fillStyle=shielded ? '#c7ffff' : pilot.color;ctx.fillRect(radius-5,-1.9,3,1.8); }
    }
    ctx.fillStyle='#d0e0e0';ctx.beginPath();ctx.arc(0,0,small ? 1.4 : 2.6,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}

const mountMetals = {blue:'#91afbd',green:'#8d9f78',red:'#bf8176',gold:'#c6ad74',libellule:'#ad91c4',grizzly:'#90a8a9'};
function drawMount(pilot,mount,side,attached,shielded,firing) {
    const fin = mount.shape === 'fin', pod = mount.shape === 'pod', coil = mount.shape === 'coil';
    const width = FlightArms.housingWidth(mount.shape);
    // A steel pylon bridges the fuselage and each outboard housing.
    if (side && attached) {
      ctx.fillStyle = '#233241'; ctx.fillRect(-10,1,11,5);
      ctx.fillStyle = mountMetals[pilot.id]; ctx.fillRect(-10,1,10,1.5);
    }
    ctx.strokeStyle = shielded ? '#a4f8ff' : '#15242f';ctx.lineWidth = 2;
    ctx.fillStyle = mountMetals[pilot.id];
    ctx.beginPath();ctx.moveTo(-width,-5);ctx.lineTo(-width*.6,-11);ctx.lineTo(width*.55,-11);
    ctx.lineTo(fin ? width+4 : width,-2);ctx.lineTo(width,8);ctx.lineTo(-width*.7,10);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle = '#dae5e7';ctx.fillRect(-width*.62,-9,1.5,12);
    ctx.fillStyle = '#132735';ctx.fillRect(-2,-14,4,11);
    if (mount.shape === 'rail') ctx.fillRect(2.8,-13,1.6,8);
    if (pod) { ctx.fillRect(-4.8,-10,2.5,5);ctx.fillRect(2.4,-10,2.5,5); }
    ctx.fillStyle = pilot.color;
    if (coil) { for (let y=-6;y<=4;y+=4) ctx.fillRect(-4,y,8,1.8); }
    else ctx.fillRect(-2.5,3,5,2.5);
    if (firing) {
      ctx.globalAlpha = reducedEffects() ? .5 : .82;
      ctx.drawImage(Scenery.flare(pilot.color),-4.5,-18,9,11);
    }
}
function drawMountedWeapons(pilot,player) {
  FlightArms.forEachMount(pilot.id,S,(mount,side,key) => {
    const socket=FlightArms.mountPose(mount,side,key,player);
    ctx.save();ctx.translate(socket.x,socket.y);
    if (side < 0) ctx.scale(-1,1);
    drawMount(pilot,mount,side,true,player.shield>0,player.muzzleFlash>.035);
    ctx.restore();
  });
}

function drawMountWreck(wreck,life) {
  const t=wreck.maxLife-wreck.life;
  const x=wreck.x+wreck.vx*t, y=wreck.y+wreck.vy*t+170*t*t;
  const pilot=SHIPS.find(p=>p.id===wreck.pilot);
  ctx.save();
  const sparks=reducedEffects() ? 3 : 6;
  for (let i=0;i<sparks;i++) {
    const delay=(i+1)*.035;
    if (delay>t) continue;
    const age=t-delay, r=1.8+i*.55;
    ctx.globalAlpha=life*(1-i/(sparks+1))*.68;
    ctx.fillStyle=i<2?'#ffb654':'#897c70';
    ctx.beginPath();ctx.arc(wreck.x+wreck.vx*age+Math.sin(age*13+i)*2,wreck.y+wreck.vy*age+170*age*age,r,0,Math.PI*2);ctx.fill();
  }
  ctx.translate(x,y);ctx.rotate(wreck.rotation+wreck.spin*t);
  if (wreck.side<0) ctx.scale(-1,1);
  ctx.globalAlpha=Math.min(1,life*3);
  drawMount(pilot,FlightArms.mounts[pilot.id][wreck.key],wreck.side,false,false,false);
  ctx.fillStyle='#ffb65f';ctx.fillRect(-2,5,4,2);ctx.restore();
}
