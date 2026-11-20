const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { createReadStream } = require('node:fs');
const { stat, mkdir } = require('node:fs/promises');
const { extname, resolve, sep } = require('node:path');

const { chromium, devices } = require(process.env.DF0_PLAYWRIGHT || 'playwright');
const root = resolve(__dirname, '..');
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webmanifest': 'application/manifest+json',
};

async function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = resolve(root, route === '/' ? 'index.html' : '.' + route);
      if (!file.startsWith(root + sep)) {
        response.writeHead(403).end();
        return;
      }
      const { size } = await stat(file);
      const headers = {
        'Content-Type': contentTypes[extname(file)] || 'application/octet-stream',
        'Accept-Ranges': 'bytes',
        'Content-Length': size,
        'Cache-Control': 'no-cache',
      };
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      let streamOptions;
      if (range) {
        const start = Number(range[1]);
        const end = Math.min(range[2] ? Number(range[2]) : size - 1, size - 1);
        if (start > end) {
          response.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
          return;
        }
        headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
        headers['Content-Length'] = end - start + 1;
        streamOptions = { start, end };
      }
      response.writeHead(range ? 206 : 200, headers);
      if (request.method === 'HEAD') {
        response.end();
        return;
      }
      const stream = createReadStream(file, streamOptions);
      response.on('close', () => stream.destroy());
      stream.pipe(response);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((ready, fail) => {
    server.on('error', fail);
    server.listen(0, '127.0.0.1', ready);
  });
  return server;
}

async function visible(page, selector) {
  await page.locator(selector).waitFor({ state: 'visible' });
}

async function boot(page, base) {
  await page.goto(base);
  await visible(page, '#start');
  await page.waitForFunction(() => document.querySelectorAll('#shipGrid button').length === 4);
}

function errorsFrom(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && message.text().includes('frame error')) {
      errors.push(message.text());
    }
  });
  return errors;
}

async function capture(page, name) {
  if (!process.env.DF0_ARTIFACT_DIR) return;
  const folder = resolve(process.env.DF0_ARTIFACT_DIR);
  await mkdir(folder, { recursive: true });
  await page.screenshot({ path: resolve(folder, name + '.png') });
}

async function testDesktop(browser, base) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: 'fr-FR' });
  try {
    // A save actually written by the V5.2 runtime, on the current origin.
    await context.addInitScript(() => {
      if (localStorage.getItem('df0qaSeeded')) return;
      Object.assign(localStorage, {
        df0qaSeeded: '1',
        df0progress: '3',
        df0ship: 'gold',
        df0music: '0',
        df0sound: '0',
        df0musicvol: '0.35',
        df0soundvol: '0.60',
      });
    });
    const page = await context.newPage();
    const errors = errorsFrom(page);
    await boot(page, base);
    await capture(page, 'desktop-menu');
    await page.locator('#optsBtn').click();
    assert.equal(await page.locator('#soundVolume').inputValue(), '60');
    assert.equal(await page.locator('#musicVolume').inputValue(), '35');
    await page.locator('#musicVolume').fill('45');
    await page.locator('#graphicsQuality').selectOption('medium');
    await page.locator('#reduceEffects').check();
    await page.locator('#optsBack').click();

    await page.locator('#shipsBtn').click();
    await visible(page, '#ships');
    assert.equal(await page.evaluate(() => S.selectedShip), 'gold');
    for (const [index, id] of ['blue', 'green', 'red', 'gold'].entries()) {
      await page.locator('#shipGrid button').nth(index).click();
      assert.equal(await page.evaluate(() => S.selectedShip), id);
      assert.equal(await page.evaluate(() => localStorage.df0ship), id);
    }
    await page.locator('#shipsBack').click();
    await page.locator('#playBtn').click();
    await page.locator('#progressBtn').click();
    await visible(page, '#progress');
    assert.equal(await page.locator('[class^="visualLevelNode"]').count(), 8);
    assert.equal(await page.locator('.visualNodeBadge').filter({ hasText: 'TERMINÉ' }).count(), 3);
    await page.locator('#mapNext').click();
    await visible(page, '#progressFuturePage');
    await page.locator('#mapPrevFuture').click();
    await page.locator('.visualLevelNode.current').click();
    await visible(page, '#hud');
    await page.waitForFunction(() => S.level === 3 && S.running && S.levelTime > 0.2);
    await page.locator('#cinematicFade').waitFor({ state: 'hidden' });
    await page.locator('#pauseBtn').click();
    const paused = await page.evaluate(() => S.levelTime);
    await page.locator('#pauseOpts').click();
    await visible(page, '#opts');
    await page.locator('#optsBack').click();
    await page.locator('#resumeBtn').click();
    await page.waitForFunction(before => S.levelTime > before + 0.15, paused);
    const x = await page.evaluate(() => S.player.x);
    await page.keyboard.down('ArrowRight');
    await page.waitForFunction(before => S.player.x > before + 12, x);
    await page.keyboard.up('ArrowRight');
    const canvas = await page.locator('#game').boundingBox();
    const afterKeys = await page.evaluate(() => S.player.x);
    await page.mouse.move(canvas.x + canvas.width * 0.55, canvas.y + canvas.height * 0.78);
    await page.mouse.down();
    await page.mouse.move(canvas.x + canvas.width * 0.42, canvas.y + canvas.height * 0.78, { steps: 4 });
    await page.mouse.up();
    await page.waitForFunction(before => S.player.x < before - 12, afterKeys);
    await capture(page, 'desktop-play');
    await page.locator('#pauseBtn').click();
    await page.locator('#quitBtn').click();
    await visible(page, '#start');

    await page.locator('#playBtn').click();
    await page.locator('#newGameBtn').click();
    await visible(page, '#introOverlay');
    await page.waitForFunction(() => document.querySelector('#introVideo').readyState >= 2);
    await page.locator('#introSkipBtn').click();
    await page.waitForFunction(() => S.level === 0 && S.running && S.levelTime > 0.2);
    assert.equal(await page.evaluate(() => localStorage.df0progress), '3');
    await page.reload();
    await page.waitForFunction(() => document.querySelectorAll('#shipGrid button').length === 4);
    assert.equal(await page.evaluate(() => localStorage.df0progress), '3');
    assert.equal(await page.evaluate(() => localStorage.df0musicvol), '0.45');
    assert.equal(await page.evaluate(() => reducedEffects()), true);
    assert.equal(await page.evaluate(() => visualQuality()), 1);
    assert.deepEqual(errors, []);
    console.log('PC : sélection des 4 avions, carte, reprise V5.2, options, pause, clavier, souris et cinématique.');
  } finally {
    await context.close();
  }
}

async function touch(session, type, x, y) {
  return session.send('Input.dispatchTouchEvent', {
    type,
    touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
  });
}

async function testAndroid(browser, base) {
  const context = await browser.newContext({ ...devices['Pixel 7'], locale: 'fr-FR' });
  try {
    const page = await context.newPage();
    const errors = errorsFrom(page);
    await boot(page, base);
    const session = await context.newCDPSession(page);
    const manifest = await page.evaluate(async () => (await fetch(
      document.querySelector('link[rel=manifest]').href,
    )).json());
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.orientation, 'portrait');
    assert.equal(manifest.icons.length >= 2, true);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await boot(page, base);
    await page.locator('#shipsBtn').tap();
    await page.locator('#shipGrid button').first().tap();
    await page.locator('#shipPlayBtn').tap();
    await visible(page, '#hud');
    await page.waitForFunction(() => S.running && S.levelTime > 0.2);
    await page.locator('#cinematicFade').waitFor({ state: 'hidden' });
    const canvas = await page.locator('#game').boundingBox();
    assert.ok(canvas.height > canvas.width, 'Le canevas garde son orientation verticale.');
    assert.ok(canvas.width <= page.viewportSize().width + 1);
    const x = canvas.x + canvas.width * 0.50;
    const y = canvas.y + canvas.height * 0.70;
    const before = await page.evaluate(() => S.player.x);
    await touch(session, 'touchStart', x, y);
    assert.ok(Math.abs(await page.evaluate(() => S.player.x) - before) < 3, 'Aucun saut au contact initial.');
    await touch(session, 'touchMove', x + canvas.width * 0.15, y);
    await touch(session, 'touchEnd');
    await page.waitForFunction(start => S.player.x > start + 24, before);
    await page.locator('#specialBtn').tap();
    await page.waitForFunction(() => S.special === 0 && S.specialCooldown > 0);
    await capture(page, 'android-play');
    await context.setOffline(true);
    await boot(page, base);
    assert.deepEqual(errors, []);
    console.log('Android émulé : portrait, glisser tactile, tir spécial et démarrage de la PWA hors ligne.');
  } finally {
    await context.close();
  }
}

async function testCampaign(browser, base) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 900 }, locale: 'fr-FR' });
  try {
    await context.addInitScript(() => {
      localStorage.df0invincible = '1';
      localStorage.df0music = '0';
      localStorage.df0sound = '0';
    });
    const page = await context.newPage();
    const errors = errorsFrom(page);
    await boot(page, base);
    await page.locator('#shipsBtn').click();
    await page.locator('#shipPlayBtn').click();
    const checked = [];
    for (let level = 0; level < 8; level++) {
      await page.waitForFunction(index => S.running && S.level === index, level);
      await page.locator('#cinematicFade').waitFor({ state: 'hidden' });
      const first = await page.evaluate(() => {
        if (S.level === 0) {
          const p = S.player;
          spawnDrop('weapon', p.x, p.y);
          update(1 / 60);
          spawnDrop('shield', p.x, p.y);
          update(1 / 60);
          if (S.weapon !== 2 || p.shield <= 0 || S.stats.bonuses < 2) {
            throw Error('La collecte du module d’arme ou du bouclier a échoué.');
          }
        }
        // Waits through the encounter with fixed game steps in the real browser.
        S.levelTime = S.levelDuration;
        for (let frame = 0; frame < 330 && (!S.boss || S.boss.entry); frame++) update(1 / 60);
        const boss = S.boss;
        if (!boss || boss.entry) throw Error('Le boss n’a pas terminé son entrée.');
        const node = boss.nodes[0];
        const point = { x: node.x, y: node.y };
        const shoot = (p, damage) => {
          S.pBullets.length = 0;
          S.pBullets.push({ x: p.x, y: p.y, vx: 0, vy: -650, damage,
            size: 7, ship: 'blue', kind: 'primary', ttl: 2 });
          combat.updateProjectiles(1 / 60);
        };
        shoot(point, 1);
        const damaged = node.hp < node.maxHp;
        shoot(point, node.maxHp);
        const detached = node.dead && !BossV6.targets().includes(node);
        const weaponTimer = node.shoot;
        for (let frame = 0; frame < 112; frame++) {
          S.player.cool = 100;
          update(1 / 60);
        }
        draw();
        return {
          name: boss.data.name, modules: boss.nodes.length, damaged, detached,
          weaponDisabled: node.shoot === weaponTimer,
        };
      });
      assert.ok(first.modules >= 4, first.name);
      assert.equal(first.damaged, true, `Impact sur le composant — ${first.name}`);
      assert.equal(first.detached, true, `Composant détaché — ${first.name}`);
      assert.equal(first.weaponDisabled, true, `Cycle du composant arrêté — ${first.name}`);
      if (level === 0 || level === 3) await capture(page, `boss-${level + 1}`);

      const final = await page.evaluate(() => {
        const boss = S.boss;
        const phases = new Set([boss.phase]);
        for (let shot = 0; shot < 75 && S.boss; shot++) {
          for (let frame = 0; frame < 105 && boss.morph > 0; frame++) {
            S.player.cool = 100;
            update(1 / 60);
          }
          S.enemies.length = 0;
          S.turrets.length = 0;
          const target = boss.nodes.find(node => !node.dead) || boss.core;
          S.pBullets.length = 0;
          S.pBullets.push({ x: target.x, y: target.y, vx: 0, vy: -650,
            damage: (target.maxHp || boss.maxHp) * .16, size: 6,
            ship: 'blue', kind: 'primary', ttl: 2 });
          combat.updateProjectiles(1 / 60);
          phases.add(boss.phase);
        }
        const wreck = S.bossDeath;
        if (!wreck) throw Error('Aucune séquence de destruction.');
        const rupture = wreck.data.wreck.events.find(([, part, power]) => part === 'core' && power >= 2);
        for (let frame = 0; frame < Math.ceil((rupture[0] + .22) * 60); frame++) update(1 / 60);
        draw();
        return {
          phases: [...phases], transformed: boss.transformed, mode: wreck.data.wreck.mode,
          events: wreck.deathEvent, debris: wreck.debris.length, hits: S.stats.hits,
        };
      });
      assert.deepEqual(final.phases, [1, 2, 3, 4], first.name);
      assert.equal(Boolean(final.transformed), level === 7, first.name);
      assert.ok(final.events >= 2 && final.debris > 0 && final.hits > 4, JSON.stringify({ name: first.name, ...final }));
      if (level === 7) await capture(page, 'boss-final-destruction');
      await page.evaluate(() => {
        for (let frame = 0; frame < 460 && S.running; frame++) update(1 / 60);
      });
      await visible(page, '#end');
      assert.equal(await page.locator('#resultStats dt').count(), 6);
      assert.equal(await page.evaluate(() => Number(localStorage.df0progress)), level + 1);
      checked.push({ ...first, ...final });
      if (level === 7) {
        assert.equal(await page.locator('#endTitle').textContent(), 'Victoire totale');
        await capture(page, 'campaign-victory');
        break;
      }
      assert.equal(await page.locator('#endTitle').textContent(), 'Mission accomplie');
      await page.locator('#nextMissionBtn').click();
      if (level === 0) {
        await visible(page, '#introOverlay');
        await page.waitForFunction(() => {
          const video = document.querySelector('#introVideo');
          return video.currentSrc.includes('after-stage-1-1.mp4') && video.readyState >= 2;
        });
        await page.locator('#introSkipBtn').click();
      }
    }
    assert.deepEqual(errors, []);
    console.log('Campagne accélérée dans Edge : ' + JSON.stringify(checked));
  } finally {
    await context.close();
  }
}

async function testTmfEmbed(browser, gameBase, tmfBase) {
  const context = await browser.newContext({ ...devices['Pixel 7'], locale: 'fr-FR', serviceWorkers: 'block' });
  const gameOrigin = 'https://delta-force-0.vercel.app';
  try {
    if (new URL(gameBase).origin !== gameOrigin) {
      // Use the real local build while preserving its separate browser origin.
      await context.route(gameOrigin + '/**', async route => {
        const gameUrl = new URL(route.request().url());
        const source = new URL(gameUrl.pathname + gameUrl.search, gameBase);
        const response = await route.fetch({ url: source.href });
        await route.fulfill({ response });
      });
    }
    const page = await context.newPage();
    const errors = errorsFrom(page);
    await page.goto(new URL('/jeux', tmfBase).href);
    const tile = page.locator('article').nth(2);
    assert.equal(await tile.locator('h3').textContent(), 'Delta Force 0');
    await tile.getByRole('link', { name: 'Jouer à Delta Force 0' }).tap();
    const frameElement = await page.getByTitle('Delta Force 0 — jeu interactif').elementHandle();
    const game = await frameElement.contentFrame();
    await visible(game, '#start');
    await page.getByText('Préparation du décollage…').waitFor({ state: 'hidden' });
    assert.equal(await game.evaluate(() => getProgress()), 0);
    await game.locator('#shipsBtn').tap();
    await game.locator('#shipPlayBtn').tap();
    await game.waitForFunction(() => S.running);
    await page.getByRole('button', { name: 'Mettre en pause' }).tap();
    await visible(game, '#pauseOverlay');
    await game.evaluate(() => markLevelComplete(2));
    await page.waitForFunction(() => {
      const save = JSON.parse(localStorage.getItem('tmf:games:delta-force-0:default:v1') || 'null');
      return save?.progress?.completed === 3;
    });
    await page.reload();
    const reloadedElement = await page.getByTitle('Delta Force 0 — jeu interactif').elementHandle();
    const reloaded = await reloadedElement.contentFrame();
    await reloaded.waitForFunction(() => typeof getProgress === 'function' && getProgress() === 3);
    await capture(page, 'tmf-portrait');
    assert.deepEqual(errors, []);
    console.log('TMF : troisième carte, lancement embarqué en portrait, pause et sauvegarde restaurée entre deux origines.');
  } finally {
    await context.close();
  }
}

async function main() {
  const server = process.env.DF0_BASE_URL ? null : await startServer();
  const base = process.env.DF0_BASE_URL || `http://127.0.0.1:${server.address().port}/`;
  let browser;
  try {
    browser = await chromium.launch({ channel: process.env.DF0_BROWSER_CHANNEL, headless: true });
    await testDesktop(browser, base);
    await testAndroid(browser, base);
    await testCampaign(browser, base);
    if (process.env.DF0_TMF_URL) await testTmfEmbed(browser, base, process.env.DF0_TMF_URL);
  } finally {
    await browser?.close();
    server?.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
