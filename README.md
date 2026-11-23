# Delta Force 0 — V7.1

Shoot’em up vertical avec seize missions, quatre avions de départ et deux hélicoptères à découvrir dans la campagne. Les cinématiques et les enregistrements de progression de la V5.2 sont repris.

- **Pilotage** par glissement tactile, souris (cliquer et glisser), flèches ou ZQSD/WASD.
- **Tir automatique** pendant le vol. Spécial avec Espace, X ou le bouton à l’écran. Pause avec Échap ou P.
- **Options** pour régler les volumes, choisir la qualité graphique ou réduire les flashs et secousses.
- **Installation** depuis un navigateur compatible sur HTTPS. Le premier secteur et le menu sont disponibles après mise en cache. Les cinématiques restent diffusées en ligne.

## Développement

Servir le dossier racine sur HTTP ou HTTPS. Le jeu ne nécessite aucune compilation.

- `game.js` orchestre le pilotage, les missions, la progression, les cinématiques et le bilan.
- `combat-v6.js` gère les vagues, les adversaires, les projectiles et les armes des vaisseaux.
- `bosses-v6.js` gère les composants, les phases et les destructions des seize boss.
- `campaign.js` définit les huit missions du front boréal et d’Égypte, leurs vagues et leurs boss.
- `airframes.js` décrit les greffes propres à chaque avion et la position de leurs sorties de tir. Chaque mission commence avec l’arme de base.
- `scenery.js` anime les décors d’origine et leurs plans de premier plan.
- `render.js` cadre les bonus et restitue l’orientation des unités dans leurs illustrations.
- `manifest.webmanifest` et `sw.js` assurent l’installation et la mise en cache.

Les tests de simulation s’exécutent avec `node --test tests/*.test.cjs`. Le scénario navigateur s’exécute avec `node tests/browser.cjs` après installation de Playwright et de Chromium. La variable `DF0_PLAYWRIGHT` accepte le chemin d’une installation existante de Playwright.

[Dépôt GitHub](https://github.com/aetherismanga/delta-force-0) · [Version web](https://delta-force-0.vercel.app)
