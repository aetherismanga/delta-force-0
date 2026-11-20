'use strict';

const Scenery = (() => {
  const BLEND_HEIGHT = 132;
  const profiles = [
    {water:'#96f1f1', cloud:.31, peaks:[[56,270],[443,610],[61,785]]},
    {water:'#d1f9fc', cloud:.24, falls:[[70,250],[435,335],[88,493],[442,637],[91,743]], peaks:[[32,499],[477,674]]},
    {water:'#e7fcff', cloud:.36, snow:true, peaks:[[40,245],[493,592],[90,769]]},
    {water:'#89eaff', cloud:.22, lights:[[471,396],[440,468],[426,553],[479,589]], peaks:[[35,438],[84,779]]},
    {water:'#86f4ea', cloud:.24, peaks:[[54,213],[459,441],[57,651],[470,792]], lights:[[452,144],[70,318],[478,662]]},
    {water:'#83ffe1', cloud:.23, peaks:[[57,232],[481,408],[70,660]], lights:[[451,282],[488,574],[87,762]]},
    {water:'#92e4fa', cloud:.25, ash:true, fires:[[56,209],[468,273],[63,467],[477,609],[53,773],[481,804]]},
    {water:'#68abde', cloud:.24, night:true, lights:[[89,152],[474,296],[66,455],[482,590],[69,741],[459,796]]}
  ];
  const sprites = new Map();
  let level = 0;
  let profile = profiles[0];
  let terrainSource;
  let terrainTile;
  let terrainArt;
  let waterGlints = [];
  let atmosphere = [];
  let clouds = [];

  function canvasSprite(width,height) {
    const image = document.createElement('canvas');
    image.width = width;
    image.height = height;
    return image;
  }

  function hash(value) {
    const n = Math.sin(value*91.13+13.6)*43758.5453;
    return n-Math.floor(n);
  }

  function modulo(n,m) {
    return ((n%m)+m)%m;
  }

  function flare(color) {
    if (sprites.has(color)) return sprites.get(color);
    const image = canvasSprite(64,64);
    const brush = image.getContext('2d');
    const glow = brush.createRadialGradient(32,27,1,32,30,31);
    glow.addColorStop(0,'#fff9eb');
    glow.addColorStop(.2,color);
    glow.addColorStop(.6,color+'44');
    glow.addColorStop(1,color+'00');
    brush.fillStyle = glow;
    brush.fillRect(0,0,64,64);
    sprites.set(color,image);
    return image;
  }

  function vapor(shadow) {
    const key = shadow ? 'shade' : 'vapor';
    if (sprites.has(key)) return sprites.get(key);
    const image = canvasSprite(220,110);
    const brush = image.getContext('2d');
    for (let i=0; i<21; i++) {
      const x = 110+(hash(i+2)-.5)*142, y = 55+(hash(i+23)-.5)*43;
      const radius = 14+hash(i+40)*23;
      const gradient = brush.createRadialGradient(x,y,1,x,y,radius);
      gradient.addColorStop(0,shadow ? '#031a3295' : '#dbeefa9a');
      gradient.addColorStop(.5,shadow ? '#04172b5f' : '#adcbe95a');
      gradient.addColorStop(1,shadow ? '#0a253800' : '#b2daee00');
      brush.fillStyle = gradient;
      brush.fillRect(x-radius,y-radius,radius*2,radius*2);
    }
    sprites.set(key,image);
    return image;
  }

  function reset(nextLevel) {
    level = nextLevel;
    profile = profiles[level];
    terrainTile = terrainArt = terrainSource = null;
    waterGlints = Array.from({length:70}, (_,i) => ({
      x:138+hash(i+level*111)*264,
      y:hash(i+41)*H,
      length:5+hash(i+97)*21,
      phase:hash(i+246)*Math.PI*2
    }));
    atmosphere = Array.from({length:46}, (_,i) => ({
      x:hash(i+level*1001)*W, y:hash(i+76)*H, speed:20+hash(i+218)*66, size:1+hash(i+348)*2.3
    }));
    clouds = Array.from({length:7}, (_,i) => ({
      x:(i%2===0 ? -34 : W-70)+(hash(i+17+level)-.5)*112,
      y:i*(H+240)/7, width:175+hash(i+23)*156, offset:hash(i+120)*2.4
    }));
  }

  function getTerrain() {
    const original = imgs['bg'+level];
    if (!original || terrainSource === original) return terrainTile;
    terrainSource = original;
    terrainArt = canvasSprite(W,H);
    terrainArt.getContext('2d').drawImage(original,0,0,W,H);
    const period = H-BLEND_HEIGHT;
    const incoming = canvasSprite(W,BLEND_HEIGHT);
    const feather = incoming.getContext('2d');
    feather.drawImage(terrainArt,0,0);
    const fade = feather.createLinearGradient(0,0,0,BLEND_HEIGHT);
    fade.addColorStop(0,'#0000');
    fade.addColorStop(.16,'#0000');
    fade.addColorStop(.84,'#000');
    fade.addColorStop(1,'#000');
    feather.globalCompositeOperation = 'destination-in';
    feather.fillStyle = fade;
    feather.fillRect(0,0,W,BLEND_HEIGHT);

    // Join the bottom of the preceding upright tile to the top of the next one.
    terrainTile = canvasSprite(W,period);
    const brush = terrainTile.getContext('2d');
    brush.drawImage(terrainArt,0,0);
    brush.drawImage(terrainArt,0,period,W,BLEND_HEIGHT,0,0,W,BLEND_HEIGHT);
    brush.drawImage(incoming,0,0);
    return terrainTile;
  }

  function eachTerrainRow(callback) {
    const period = H-BLEND_HEIGHT;
    const shift = modulo(S.bgY,period);
    for (let y=shift-period*2; y<H+8; y+=period) {
      if (y+period < -8) continue;
      callback(y,period);
    }
  }

  function animateWater(quality) {
    const time = S.levelTime;
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.65;
    ctx.strokeStyle = profile.water;
    for (let group=0; group<3; group++) {
      ctx.globalAlpha = (profile.night ? .12 : .23) + group*.045;
      ctx.beginPath();
      const count = [24,48,70][quality];
      for (let i=group; i<count; i+=3) {
        const signal = waterGlints[i];
        const life = Math.sin(signal.phase+time*.98);
        if (life <= .12) continue;
        const x = signal.x+Math.cos(signal.phase+time*1.45)*5;
        const y = modulo(signal.y+S.bgY*.94,H);
        const length = signal.length*life;
        ctx.moveTo(x-length*.5,y);
        ctx.quadraticCurveTo(x,y-2.6,x+length*.5,y-.5);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function paintLand(quality) {
    const t = S.levelTime;
    eachTerrainRow(offset => {
      ctx.save();
      ctx.translate(0,offset);
      if (quality && profile.peaks && terrainArt) {
        for (const [x,y] of profile.peaks) {
          const scale = 1+Math.sin(t*2.4+y)*.026;
          ctx.save();
          ctx.translate(x,y);
          ctx.scale(scale,scale);
          ctx.beginPath();
          ctx.ellipse(0,0,24,21,0,0,Math.PI*2);
          ctx.clip();
          ctx.drawImage(terrainArt,x-27,y-25,54,50,-27,-25,54,50);
          ctx.restore();
        }
      }
      for (const [x,y] of profile.falls || []) {
        ctx.strokeStyle = '#e5fbff';
        ctx.lineWidth = 1.45;
        for (let i=0; i<5; i++) {
          const age = modulo(t*2.2+i*.22,1);
          const stream = (x<200 ? 1 : -1)*(4+i);
          ctx.globalAlpha = Math.sin(age*Math.PI)*.56;
          ctx.beginPath();
          ctx.moveTo(x+stream*age,y+22*age);
          ctx.lineTo(x+stream*age+2,y+22*age+6);
          ctx.stroke();
        }
      }
      for (const [x,y] of profile.lights || []) {
        ctx.globalAlpha = .23 + .11*Math.sin(t*2+y);
        ctx.drawImage(flare(profile.night ? '#ffc16a' : '#9cfaff'),x-19,y-18,38,36);
      }
      for (const [x,y] of profile.fires || []) {
        ctx.globalAlpha = .27+.16*Math.sin(t*3.4+y);
        ctx.drawImage(flare('#ff7136'),x-27,y-25,54,48);
      }
      ctx.restore();
    });
  }

  function drawClouds(shadow,quality) {
    const t = S.levelTime;
    const texture = vapor(shadow);
    const ratio = shadow ? .64 : 1.26;
    const count = [3,5,7][quality];
    ctx.globalAlpha = profile.cloud*(shadow ? 1 : .78)*(reducedEffects() ? .7 : 1);
    for (let i=0; i<count; i++) {
      const c = clouds[i];
      const x = c.x+Math.sin(t*.16+c.offset)*75+(shadow ? 34 : 0);
      const y = modulo(c.y+S.bgY*ratio,H+240)-120;
      ctx.drawImage(texture,x-c.width/2,y-c.width*.24,c.width,c.width*.48);
    }
    ctx.globalAlpha = 1;
  }

  function drawGround() {
    const terrain = getTerrain();
    const quality = visualQuality();
    ctx.save();
    if (terrain) eachTerrainRow((y,height) => ctx.drawImage(terrain,-8,y,W+16,height+.65));
    ctx.fillStyle = profile.night ? '#0618312e' : '#102c411f';
    ctx.fillRect(-8,-8,W+16,H+16);
    animateWater(quality);
    paintLand(quality);
    drawClouds(true,quality);
    ctx.restore();
  }

  function drawAir() {
    const quality = visualQuality();
    const t = S.levelTime;
    ctx.save();
    drawClouds(false,quality);
    if (profile.snow || profile.ash || profile.night) {
      const count = [12,24,46][quality];
      ctx.fillStyle = profile.snow ? '#e4f4ff' : profile.ash ? '#ffc495' : '#aedbfc';
      ctx.globalAlpha = reducedEffects() ? .26 : .46;
      for (let i=0; i<count; i++) {
        const p = atmosphere[i];
        const x = modulo(p.x+Math.sin(t*.55+i)*22+t*(profile.snow ? 19 : 6),W);
        const y = modulo(p.y+t*p.speed*(profile.ash ? -.6 : 1)+S.bgY*.32,H);
        ctx.fillRect(x,y,p.size,profile.ash ? p.size*1.4 : p.size*1.9);
      }
    }
    if (profile.ash) {
      const texture = vapor(true);
      ctx.globalAlpha = reducedEffects() ? .19 : .3;
      eachTerrainRow(offset => {
        for (const [x,y] of profile.fires) {
          const rise = modulo(t*23+y,100);
          ctx.drawImage(texture,x-35+Math.sin(t*.4+y)*18,offset+y-rise-36,104,58);
        }
      });
    }
    ctx.restore();
  }

  return {reset, drawGround, drawAir, flare, terrainPeriod:()=>H-BLEND_HEIGHT};
})();
