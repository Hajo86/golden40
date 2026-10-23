/* Der haeufigste Ausfall im Fest-Betrieb: das Supabase-Projekt schlaeft
   (kostenloser Tarif, eine Woche ohne Zugriff) und antwortet auf jede
   Anfrage mit einer HTML-Fehlerseite. Dann darf kein Foto verloren gehen:
   es wartet auf dem Geraet, uebersteht das Neuladen und geht von selbst
   raus, sobald der Server wieder da ist.                                  */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const BASE = process.env.EP_BASE || 'http://127.0.0.1:8199/';
const API = process.env.EP_API || 'http://127.0.0.1:8300';
const fails = [];
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails.push(m); };

await fetch(API + '/__reset').catch(() => {});
await fetch(API + '/__pause');                    // Projekt schlafen legen
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, locale: 'de-DE' });
await ctx.addInitScript((api) => {
  localStorage.setItem('golden40.ep.sb', JSON.stringify({ url: api, key: 'sb_publishable_X', bucket: 'eventpic' }));
  localStorage.setItem('golden40.ep.key', JSON.stringify('7wvnlpqv'));
  localStorage.setItem('golden40.ep.guest', JSON.stringify('Nadine'));
  localStorage.setItem('golden40.ep.consent', JSON.stringify('x'));
}, API);
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));

await p.goto(BASE, { waitUntil: 'networkidle' });
await p.waitForSelector('[data-task]');
ok(true, 'App startet, obwohl der Server schlaeft');

// --- Foto aufnehmen und absenden ---
await p.click('[data-m="all"]');
await p.click('[data-task="b01"]');
await p.waitForSelector('#cam', { state: 'attached' });
await p.setInputFiles('#cam', new URL('../icons/icon-512.png', import.meta.url).pathname);
await p.waitForSelector('#send');
await p.click('#send');

await p.waitForFunction(() => window.EP && window.EP.state.queue.length === 1, null, { timeout: 15000 });
ok(true, 'Foto liegt in der Warteschlange statt verloren zu gehen');

// Der Knopf darf nicht auf das Netz warten: die App ist sofort zurueck
// auf der Aufgabenliste, nicht auf "Wird gesendet" eingefroren.
await p.waitForSelector('[data-task]', { timeout: 8000 });
ok(!/Wird gesendet/.test(await p.evaluate(() => document.body.innerText)),
  'Kein haengender Absende-Knopf, obwohl der Server schlaeft');

const txt = await p.evaluate(() => document.body.innerText);
ok(/wartet auf Versand/.test(txt), 'Gast sieht den Hinweis auf den spaeteren Versand');
ok(!/undefined|NaN/.test(txt), 'Kein technischer Muell im Hinweis');

// Sobald der erste Versuch gescheitert ist, steht der Grund im Klartext dabei
await p.waitForFunction(() => window.EP && window.EP.state.queueError, null, { timeout: 15000 });
await p.evaluate(() => window.EP.render());
const txt2 = await p.evaluate(() => document.body.innerText);
ok(/Grund:/.test(txt2), 'Der Grund steht dabei: ' + (txt2.match(/Grund:[^\n]*/) || [''])[0]);

// --- Neuladen: die Warteschlange muss das uebersteuern ---
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForSelector('[data-task]', { timeout: 20000 });
await p.waitForFunction(() => window.EP && window.EP.state.queue.length === 1, null, { timeout: 15000 });
ok(true, 'Warteschlange uebersteht das Neuladen');

// --- Server aufwecken: der Versand muss von selbst nachlaufen ---
await fetch(API + '/__resume');
await p.evaluate(() => window.dispatchEvent(new Event('online')));
await p.waitForFunction(() => window.EP && window.EP.state.queue.length === 0, null, { timeout: 20000 });
ok(true, 'Warteschlange laeuft nach dem Aufwecken von selbst leer');

await p.waitForFunction(() => window.EP && window.EP.state.photos.length === 1, null, { timeout: 15000 });
const ph = await p.evaluate(() => window.EP.state.photos[0]);
ok(ph.guest_name === 'Nadine', 'Foto kommt mit Namen auf dem Server an');
ok(ph.task_id === 'b01', 'Richtige Aufgabe zugeordnet');
ok(/^golden40-7wvnlpqv\/b01\/.+\.jpg$/.test(ph.path), 'Storage-Pfad korrekt: ' + ph.path);

const after = await p.evaluate(() => document.body.innerText);
ok(!/wartet auf Versand/.test(after), 'Hinweis verschwindet wieder');

console.log('Seitenfehler: ' + (errs.length ? errs.join(' | ') : 'keine'));
await b.close();
if (fails.length || errs.length) { console.log('❌ ' + (fails.length + errs.length) + ' Fehler'); process.exit(1); }
console.log('✅ Schlafender Server verliert kein Foto.');
