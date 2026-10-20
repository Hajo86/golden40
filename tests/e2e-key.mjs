/* Zugang nur mit Schluessel: Ohne #k=… darf weder Galerie noch Upload
   erreichbar sein, und der Server darf unter der Kurzkennung nichts
   herausgeben. Mit Schluessel laeuft alles normal.                          */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const BASE = process.env.EP_BASE || 'http://127.0.0.1:8199/';
const API = process.env.EP_API || 'http://127.0.0.1:8300';
const KEY = '7wvnlpqv';
const fails = [];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails.push(m); };

await fetch(API + '/__reset').catch(() => {});
const b = await chromium.launch();
const mk = () => b.newContext({ viewport: { width: 414, height: 900 }, locale: 'de-DE' });

// --- 1. Fremder ohne Schluessel ---
const c1 = await mk();
await c1.route('**/tasks.js', async route => {
  const res = await route.fetch();
  route.fulfill({ response: res, body: (await res.text())
    .replace(/supabaseUrl: '[^']*'/, "supabaseUrl: '" + API + "'")
    .replace(/supabaseKey: '[^']*'/, "supabaseKey: 'sb_publishable_TEST'") });
});
const p1 = await c1.newPage();
const errs = []; p1.on('pageerror', e => errs.push(e.message));
await p1.goto(BASE, { waitUntil: 'networkidle' });
await p1.waitForSelector('#kin');
ok(await p1.locator('[data-task]').count() === 0, 'Keine Aufgaben ohne Schluessel');
ok(await p1.locator('nav.tabs').isHidden(), 'Keine Fussleiste ohne Schluessel');
ok(/privaten? Feier/.test(await p1.content()), 'Erklaerender Hinweis statt leerer Seite');
await p1.goto(BASE + '#/gallery');
await p1.waitForTimeout(500);
ok(await p1.locator('.grid').count() === 0, 'Galerie auch ueber die Adresse nicht erreichbar');

// --- 2. Mit Schluessel in der Adresse ---
const c2 = await mk();
await c2.route('**/tasks.js', async route => {
  const res = await route.fetch();
  route.fulfill({ response: res, body: (await res.text())
    .replace(/supabaseUrl: '[^']*'/, "supabaseUrl: '" + API + "'")
    .replace(/supabaseKey: '[^']*'/, "supabaseKey: 'sb_publishable_TEST'") });
});
const p2 = await c2.newPage();
p2.on('pageerror', e => errs.push(e.message));
await p2.goto(BASE + '#k=' + KEY, { waitUntil: 'networkidle' });
await p2.waitForSelector('#gname');
ok(true, 'Mit Schluessel oeffnet die Begruessung');
ok(!/[#&]k=/.test(p2.url()), 'Schluessel steht nicht mehr in der Adresszeile: ' + p2.url());
ok(await p2.evaluate(() => JSON.parse(localStorage.getItem('ep.key'))) === KEY, 'Schluessel ist gemerkt');
const ev = await p2.evaluate(() => window.EP.cfg().eventId);
ok(ev.endsWith('-' + KEY), 'Event-Kennung enthaelt den Schluessel: ' + ev);

// Weiterklicken und Neuladen duerfen den Zugang nicht verlieren
await p2.fill('#gname', 'Lea'); await p2.click('#go');
await p2.waitForSelector('[data-task]');
await p2.reload({ waitUntil: 'networkidle' });
await p2.waitForSelector('[data-task]', { timeout: 10000 });
ok(true, 'Zugang ueberlebt Neuladen');

// Upload und Galerie funktionieren
await p2.click('[data-m="all"]');
await p2.click('[data-task="b01"]');
await p2.waitForSelector('#cam', { state: 'attached' });
await p2.setInputFiles('#cam', new URL('../icons/icon-512.png', import.meta.url).pathname);
await p2.waitForSelector('#send');
await p2.click('#send');
await p2.waitForFunction(() => window.EP && window.EP.state.photos.length === 1, null, { timeout: 15000 });
ok(true, 'Upload mit Schluessel funktioniert');

// --- 3. Server gibt unter der Kurzkennung nichts heraus ---
const short = await (await fetch(API + '/rest/v1/rpc/ep_list_photos', {
  method: 'POST', headers: { apikey: 'x', 'content-type': 'application/json' },
  body: JSON.stringify({ p_event: 'golden40', p_limit: 400 }) })).json();
ok(Array.isArray(short) && short.length === 0, 'Ohne vollstaendige Kennung liefert der Server nichts');
const full = await (await fetch(API + '/rest/v1/rpc/ep_list_photos', {
  method: 'POST', headers: { apikey: 'x', 'content-type': 'application/json' },
  body: JSON.stringify({ p_event: 'golden40-' + KEY, p_limit: 400 }) })).json();
ok(full.length === 1, 'Mit vollstaendiger Kennung kommt das Foto (' + full.length + ')');
ok(full[0] && full[0].owner_token === undefined, 'Auch hier kein owner_token nach aussen');

// --- 4. Schluessel von Hand nachtragen ---
await p1.goto(BASE);
await p1.waitForSelector('#kin');
await p1.fill('#kin', KEY);
await p1.click('#kgo');
await p1.waitForSelector('#gname', { timeout: 10000 });
ok(true, 'Schluessel laesst sich von Hand eintragen');

console.log('\nSeitenfehler:', errs.length ? errs : 'keine');
await b.close();
console.log(fails.length ? '\n❌ ' + fails.join(' | ') : '\n✅ Zugang nur mit Schluessel.');
process.exit(fails.length ? 1 : 0);
