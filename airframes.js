'use strict';

// Socket positions are measured in the same flight-space pixels as the painted aircraft.
const FlightArms = (() => {
  function station(name, shape, x, y, spread, speed, damage, size) {
    return {name, shape, x, y, spread, speed, damage, size};
  }
  const mounts = {
    blue: {
      u1:station('Canons jumelés','barrel',18,-15,8,830,.83,6),
      u2:station('Accélérateur axial','coil',0,-30,0,910,1.2,8),
      u3:station('Pods de couverture','pod',32,-5,92,784,.93,7),
      u4:station('Rails de poursuite','rail',41,5,13,860,1.04,7)
    }, green: {
      u1:station('Obusiers latéraux','pod',19,-14,14,735,1.00,8),
      u2:station('Culasse perforante','barrel',0,-31,0,805,1.45,11),
      u3:station('Batteries lourdes','barrel',30,-5,54,712,1.16,9),
      u4:station('Inducteurs de siège','coil',39,4,22,810,1.07,10)
    }, red: {
      u1:station('Mitrailleuses doubles','rail',16,-16,27,935,.69,5),
      u2:station('Ailettes de rafale','fin',24,-10,101,870,.66,6),
      u3:station('Canons obliques','barrel',34,-2,144,838,.69,6),
      u4:station('Rampes en éventail','pod',41,5,198,791,.67,7)
    }, gold: {
      u1:station('Prismes jumeaux','fin',15,-17,37,807,.88,8),
      u2:station('Lentille focale','coil',0,-31,0,870,1.40,10),
      u3:station('Émetteurs solaires','coil',29,-7,141,770,1.00,9),
      u4:station('Miroirs de flanc','fin',40,4,217,747,.94,8)
    }, libellule: {
      u1:station('Bobines latérales','coil',13,-16,12,930,.68,6),
      u2:station('Fourche ionique','fin',20,-11,61,905,.66,6),
      u3:station('Rails de déviation','rail',26,-6,117,874,.70,6),
      u4:station('Électrodes de flanc','coil',33,1,164,844,.74,7)
    }, grizzly: {
      u1:station('Tubes jumelés','barrel',18,-17,9,690,1.16,9),
      u2:station('Mortier ventral','pod',0,-27,0,663,1.89,12),
      u3:station('Nacelles de flanc','pod',28,-4,64,714,1.23,10),
      u4:station('Affûts lourds','barrel',36,4,103,732,1.27,10)
    }
  };
  // A twin upgrade occupies one tier. If one nacelle is lost, its partner still fires.
  function forEachMount(pilot, loadout, callback) {
    for (const key of loadout.equipment) {
      const mount = mounts[pilot][key];
      if (!mount) continue;
      const missing = loadout.missingSides?.[key];
      if (mount.x && missing !== -1) callback(mount,-1,key);
      if (missing !== 1) callback(mount,mount.x ? 1 : 0,key);
    }
  }
  function canFit(loadout,key) {
    return !loadout.equipment.includes(key) || loadout.missingSides?.[key] !== undefined;
  }
  function needsEquipment(loadout) {
    return loadout.equipment.length < 4 || Object.keys(loadout.missingSides || {}).length > 0;
  }
  function fit(loadout,key) {
    if (!canFit(loadout,key)) return false;
    const side = loadout.missingSides[key];
    if (side === undefined) loadout.equipment.push(key);
    else delete loadout.missingSides[key];
    loadout.player.fitting = {key,side,remaining:.40};
    loadout.weapon = 1+loadout.equipment.length;
    return true;
  }
  function detach(loadout,key,side) {
    const index = loadout.equipment.indexOf(key);
    if (index < 0 || loadout.missingSides[key] === side) return false;
    if (side && loadout.missingSides[key] === undefined) loadout.missingSides[key] = side;
    else {
      loadout.equipment.splice(index,1);
      delete loadout.missingSides[key];
    }
    loadout.weapon = 1+loadout.equipment.length;
    return true;
  }
  function pose(bank, time) {
    return {rotation:Math.max(-.24, Math.min(.24, (bank || 0)*.00048)), hover:Math.sin(time*7.5)*1.5};
  }
  function mountPose(mount, side, key, player) {
    const fit = player.fitting;
    const arriving = fit?.key === key && (fit.side === undefined || fit.side === side);
    const travel = arriving ? Math.max(0, fit.remaining / .40) ** 2 : 0;
    return {x:side*(mount.x + 13*travel), y:mount.y + 10*travel};
  }
  function muzzle(player, dx, dy, frame) {
    const x = dx, y = dy + frame.hover;
    const c = Math.cos(frame.rotation), s = Math.sin(frame.rotation);
    return {x:player.x + x*c - y*s, y:player.y + x*s + y*c};
  }
  function housingWidth(shape) { return shape === 'pod' ? 7 : shape === 'coil' ? 6 : 4.5; }
  function shieldBounds(pilot,player) {
    const travel = player.fitting ? 12*Math.max(0,player.fitting.remaining/.40)**2 : 0;
    return {rx:53+travel,ry:pilot.rotorcraft ? (pilot.id === 'grizzly' ? 73 : 62) : 61};
  }
  return {mounts, forEachMount, canFit, needsEquipment, fit, detach, pose, mountPose, muzzle, housingWidth, shieldBounds};
})();
