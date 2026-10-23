/* Die Datenbank kennt die Lese-Funktionen noch nicht (so wie vor dem
   SQL-Nachtrag). Die App muss trotzdem synchronisieren: sie faellt auf das
   direkte Lesen der Tabelle zurueck. Liegen die Funktionen spaeter vor,
   nutzt sie wieder sie — ohne Codeaenderung.                                */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const BASE = process.env.EP_BASE || 'http://127.0.0.1:8199/';
const API = process.env.EP_API || 'http://127.0.0.1:8300';
const KEY = '7wvnlpqv';
const fails = [];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails.push(m); };

await fetch(API + '/__reset').catch(() => {});
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 414, height: 900 }, locale: 'de-DE' });
await ctx.route('**/tasks.js', async route => {
  const res = await route.fetch();
  route.fulfill({ response: res, body: (await res.text())
    .replace(/supabaseUrl: '[^']*'/, "supabaseUrl: '" + API + "'")
    .replace(/supabaseKey: '[^']*'/, "supabaseKey: 'sb_publishable_TEST'") });
});
await ctx.addInitScript((k) => {
  localStorage.setItem('ep.key', JSON.stringify(k));
  localStorage.setItem('ep.consent', JSON.stringify('x'));
  localStorage.setItem('ep.guest', JSON.stringify('Nadine'));
}, KEY);

const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(BASE, { waitUntil: 'networkidle' });
await p.waitForSelector('[data-task]');
ok(true, 'App startet trotz fehlender Funktionen');

// Foto hochladen — muss trotzdem in der Galerie landen
await p.click('[data-m="all"]');
await p.click('[data-task="b01"]');
await p.waitForSelector('#cam', { state: 'attached' });
await p.setInputFiles('#cam', new URL('../icons/icon-512.png', import.meta.url).pathname);
await p.waitForSelector('#send');
await p.click('#send');
await p.waitForFunction(() => window.EP && window.EP.state.photos.length === 1, null, { timeout: 15000 });
ok(true, 'Foto erscheint in der Galerie (Rueckfall auf direktes Lesen)');
ok(await p.evaluate(() => window.EP.state.fetchError) === '', 'Kein Fehler im Zustand');

// Fortschritt muss ebenfalls vom Server kommen
await p.click('[data-m="all"]');
ok(/1 von \d+/.test(await p.textContent('#hSub')), 'Fortschritt: ' + await p.textContent('#hSub'));

// Zweites Geraet sieht das Foto
const ctx2 = await b.newContext({ viewport: { width: 414, height: 900 }, locale: 'de-DE' });
await ctx2.route('**/tasks.js', async route => {
  const res = await route.fetch();
  route.fulfill({ response: res, body: (await res.text())
    .replace(/supabaseUrl: '[^']*'/, "supabaseUrl: '" + API + "'")
    .replace(/supabaseKey: '[^']*'/, "supabaseKey: 'sb_publishable_TEST'") });
});
await ctx2.addInitScript((k) => {
  localStorage.setItem('ep.key', JSON.stringify(k));
  localStorage.setItem('ep.consent', JSON.stringify('x'));
}, KEY);
const p2 = await ctx2.newPage();
await p2.goto(BASE + '#/gallery', { waitUntil: 'networkidle' });
await p2.waitForSelector('.grid figure', { timeout: 12000 });
ok(await p2.locator('.grid figure').count() === 1, 'Zweites Geraet sieht das Foto');
ok((await p2.locator('.grid .who').first().textContent()).includes('Nadine'), 'Mit Namen');

console.log('\nSeitenfehler:', errs.length ? errs : 'keine');
await b.close();
console.log(fails.length ? '\n❌ ' + fails.join(' | ') : '\n✅ Synchronisierung laeuft auch ohne die Funktionen.');
process.exit(fails.length ? 1 : 0);
