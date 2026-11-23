// Run inside an isolated browser game with a disposable campaign save.
module.exports = async function checkAircraftDamage() {
  const check=(condition,label)=>{if(!condition)throw Error(label);};
  const freeze=()=>{cancelAnimationFrame(frame);frame=0;};
  function pickup(kind,key) {
    const p=S.player;
    S.drops.push({kind,upgradeType:key,x:p.x,y:p.y,vy:0,t:0});
    updateDrops(0,p);
  }
  function shootAt(key,side) {
    const p=S.player, m=FlightArms.mounts[ship().id][key];
    const pos=FlightArms.mountPose(m,side,key,p);
    const point=FlightArms.muzzle(p,pos.x,pos.y,FlightArms.pose(S.bank,S.levelTime));
    combat.spawnHostile({x:point.x,y:point.y-75,angle:Math.PI/2,speed:7500,size:8});
    combat.updateProjectiles(.017);
  }
  function primaryCount() {
    S.pBullets.length=0;S.player.cool=0;combat.firePlayer();
    return S.pBullets.length;
  }
  function hullPixels() {
    ctx.clearRect(0,0,W,H);drawPlayerCraft();
    const p=S.player, scale=canvas.width/W;
    return ctx.getImageData(Math.round((p.x-11)*scale),Math.round((p.y-27)*scale),
      Math.round(22*scale),Math.round(49*scale)).data;
  }
  const reports=[];
  setProgress(11);
  S.invincible=false;S.music=false;S.sound=true;
  for (const id of ['blue','green','red','gold','libellule','grizzly']) {
    selectShip(SHIPS.find(model=>model.id===id));
    startGame(7);freeze();
    const p=S.player,pilot=ship();
    await loadLevelArt(7);
    pickup('weapon','u4');p.fitting=null;
    check(S.weapon===2 && primaryCount()===3,id+' twin stations');
    shootAt('u4',-1);
    check(p.hp===pilot.hp && S.missingSides.u4===undefined,'launch protection');
    p.inv=0;
    shootAt('u4',-1);
    check(Math.abs(p.hp-(pilot.hp-pilot.damageTaken))<.0001,id+' hull takes one hit');
    check(S.missingSides.u4===-1 && primaryCount()===2,id+' right wing still fires');
    const wreck=S.fx.find(f=>f.type==='mountWreck');
    check(wreck?.key==='u4'&&wreck.side===-1&&wreck.vx<0&&S.fx.some(f=>f.type==='boom'),id+' local detachment');
    const health=p.hp;
    shootAt('u4',-1);
    check(p.hp===health&&S.fx.filter(f=>f.type==='mountWreck').length===1,'empty socket');
    S.eBullets.length=0;
    pickup('weapon','u4');
    check(p.fitting.side===-1&&primaryCount()===3,id+' physical replacement');
    p.fitting=null;p.muzzleFlash=0;p.inv=0;
    settings.reduced='1';
    const ordinary=hullPixels();
    pickup('shield');
    const charged=hullPixels();
    let lit=0;
    for(let i=0;i<ordinary.length;i+=4) {
      if(ordinary[i+3]>160 && charged[i+1]+charged[i+2]>ordinary[i+1]+ordinary[i+2]+16) lit++;
    }
    check(lit>40,id+' luminous body');
    shootAt('u4',1);
    check(p.hp===health && !FlightArms.canFit(S,'u4') && p.shieldImpact>0,id+' shield intercepts');
    S.player.shield=.01;update(.02);
    check(p.shield===0,id+' expiry');
    shootAt('u4',1);
    check(p.hp<health && S.fx.filter(f=>f.type==='mountWreck').length===2,id+' vulnerability after expiry');
    reports.push({id,lit});
    startGame(8,true);freeze();
    check(S.weapon===1&&!S.equipment.length&&!Object.keys(S.missingSides).length&&!S.player.shield,'mission reset');
  }
  return reports;
};
