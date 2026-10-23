/* ==========================================================================
   tasks.js — Event-Konfiguration + Fotoaufgaben  ·  THE GOLDEN 40
   --------------------------------------------------------------------------
   Inhalte nach dem Briefing „The Golden 40" (Helge & Nadine).

   Aufgabe ändern   : Text hinter "text:" anpassen.
   Aufgabe streichen: Zeile löschen ODER "off: true" ergänzen (behält die ID).
   Aufgabe ergänzen : neue Zeile nach dem gleichen Muster, mit NEUER id.
   Eine vorhandene id nie umbenennen — daran hängen die hochgeladenen Fotos.
   ========================================================================== */

window.EVENT = {
  // Die Event-Kennung setzt sich aus diesem Teil und dem Schlüssel aus der
  // Adresse zusammen (…/#k=SCHLÜSSEL). Der Schlüssel steht bewusst NICHT hier:
  // So lässt sich aus dem öffentlichen Quelltext nicht ableiten, unter welcher
  // Kennung die Fotos liegen.
  eventPrefix: 'golden40',

  title: 'The Golden 40',
  subtitle: 'Mach mit: {n} Fotoaufgaben',
  honoree: 'Helge',
  hosts: 'Helge & Nadine',
  dateLabel: 'Sa · 24.10.26 · 18:00 Uhr',
  place: 'Horster Landstraße 102 · 21220 Seevetal',
  dresscode: 'Smart Casual · Schwarz, Gold, Chrom — dazu ein roter Punkt',
  hashtag: '#thegolden40',

  // Farben der Einladung
  accent: '#D4AF37',            // Gold
  red: '#E2231A',               // der rote Punkt
  slideshowSeconds: 6,
  showLeaderboard: false,

  maxEdge: 1600,
  jpegQuality: 0.82,
  thumbEdge: 420,
  thumbQuality: 0.68,

  guestUrl: 'https://hajo86.github.io/golden40/#k=7wvnlpqv',

  // Dasselbe Supabase-Projekt wie bei Thomas — getrennt über die eventId oben.
  supabaseUrl: 'https://futdxrnvbdaofdhyaicy.supabase.co',
  supabaseKey: 'sb_publishable_sZiwf2UNYoFtVczGSSlJXQ_sATOiwCp',
  supabaseBucket: 'eventpic',

  welcome:
    'Schön, dass du da bist. Heute wird Helge 40, und du bist Teil davon. ' +
    'Fotografier den Abend, wie du ihn erlebst: die Golden Hour am Empfang, den ' +
    'Rodizio-Spieß, die Fotowand im Flur, den Dancefloor. Alles, was du hier ' +
    'hochlädst, landet im gemeinsamen Album und ist nach der Party für alle Gäste ' +
    'sichtbar. Also: Handy raus und los.',

  notes: [
    'Hochladen ohne Anmeldung — kein Konto, keine App-Installation.',
    'Die Fotowand steht im Flur: goldene Paillettenwand. Bitte mindestens ein Paar- oder Gruppenfoto dort.',
    'Das Album bleibt nach der Party online, Download für alle Gäste.',
    'Bitte keine Fotos von Kindern hochladen, ohne die Eltern zu fragen.',
  ],

  program: [
    { time: '18:00', text: 'Empfang mit Golden Hour an der Bar' },
    { time: '19:00', text: 'Dinner: Rodizio vom Spieß, Buffet' },
    { time: '21:00', text: 'Limoncello-Tiramisu-Tower „40" und Candy Bar im Wohnzimmer' },
    { time: '22:00', text: 'Dancefloor' },
    { time: '00:00', text: 'Mitternachtsanstoß' },
    { time: '00:30', text: 'Bar schließt' },
  ],

  // Barkarte und Menü erscheinen in der App unter „Karte"
  bar: [
    { group: 'Signature · zur Begrüßung', items: [
      { name: 'Golden Hour', glass: 'Coupe', desc: 'Gin, Zitrone, Honig, Crémant' },
    ] },
    { group: 'Mit Gin & Co.', items: [
      { name: 'Gin Basil Smash', glass: 'Tumbler', desc: 'Gin, Zitrone, Basilikum' },
      { name: 'Red Light', glass: 'Longdrink', desc: 'Gin, Erdbeere, Rosmarin, Tonic' },
      { name: 'Moscow Mule', glass: 'Longdrink', desc: 'Vodka, Limette, Ginger Beer, Gurke' },
      { name: "Dark 'n' Stormy", glass: 'Longdrink', desc: 'Dunkler Rum, Limette, Ginger Beer' },
    ] },
    { group: 'Spritz & Nordisch', items: [
      { name: 'Aperol Spritz', glass: 'Weinglas', desc: 'Aperol, Prosecco, Soda, Orange' },
      { name: 'Fako Royale', glass: 'Coupe', desc: 'Korn, Orangensorbet, Champagner' },
    ] },
    { group: 'Ohne Alkohol', items: [
      { name: 'Green Light', glass: 'Tumbler', desc: 'Basilikum, Zitrone, Soda' },
      { name: 'Red Light Zero', glass: 'Longdrink', desc: 'Erdbeere, Rosmarin, Zitrone, Tonic' },
      { name: 'Spritz Zero', glass: 'Weinglas', desc: 'Crodino, alkoholfreier Sekt, Orange' },
    ] },
  ],
  barFoot: 'Champagner, Crémant, Wein, Bier, Wasser, Cola und Coke Zero in Selbstbedienung.',
  // Drinks per App vorbestellen (Gag): Knopf an jedem Drink, Bar-Ansicht unter #/bar
  ordering: true,

  menu: [
    { group: 'Zur Begrüßung', text: 'Golden Hour · Champagner · Scampi · Merguez · Kräuterbaguette' },
    { group: 'Rodizio vom Spieß', text: 'Rind · Lamm · Hähnchen · Pute, frisch am Buffet geschnitten, ' +
      'dazu Folienkartoffeln mit Kräuterquark und Gemüsespieße' },
    { group: 'Salate', text: 'Brasilianischer Kartoffelsalat · Nudelsalat · Krautsalat · ' +
      'Tomate-Mozzarella · gemischte frische Salate' },
    { group: 'Vegetarisch', text: 'Gemüsespieße, Folienkartoffel mit Kräuterquark, Tomate-Mozzarella ' +
      'und alle Salate' },
    { group: 'Süß', text: 'Limoncello-Tiramisu-Tower „40" · Candy Bar im Wohnzimmer' },
  ],
};

window.CATEGORIES = [
  { id: 'free',    label: 'Eigene Fotos',     icon: '📷' },
  { id: 'golden',  label: 'Golden Hour',      icon: '🥂' },
  { id: 'bar',     label: 'An der Bar',       icon: '🍸' },
  { id: 'dinner',  label: 'Rodizio & Buffet', icon: '🔥', timed: true },
  { id: 'floor',   label: 'Dancefloor',       icon: '💃', timed: true },
  { id: 'guests',  label: 'Gäste',            icon: '🤝' },
  { id: 'helge',   label: 'Helge',            icon: '✳️' },
];

window.TASKS = [
  // ---- Eigene Fotos: alles, was zu keiner Aufgabe passt --------------------
  { id: 'x01', cat: 'free',   text: 'Einfach ein Foto vom Abend, das dir gefällt — so viele du willst.' },
  { id: 'x02', cat: 'free',   text: 'Dein Lieblingsmoment der Nacht.', icon: '✨' },

  // ---- Golden Hour / Fotowand (Challenges 1 und 5 aus dem Briefing) ------
  { id: 'g01', cat: 'golden', text: 'Dein Golden-Hour-Glas vor der Fotowand.' },
  { id: 'g02', cat: 'golden', text: 'Ein Paar- oder Gruppenfoto an der goldenen Fotowand im Flur.', icon: '📸' },

  // ---- An der Bar ---------------------------------------------------------
  { id: 'b01', cat: 'bar',    text: 'Bestelle ein Fako Royale und lass dich damit fotografieren.', icon: '🥂' },
  { id: 'b02', cat: 'bar',    text: 'Fotografiere einen Red Light so, dass man ihn sofort bestellen will.', icon: '🍓' },
  { id: 'b03', cat: 'bar',    text: 'Erwische die Barkeeperin beim Shaken.', icon: '🧊' },
  { id: 'b05', cat: 'bar',    text: 'Probiere einen Drink, den du noch nie getrunken hast — Beweisfoto.', icon: '🌿' },

  // ---- Rodizio & Buffet (Challenge 3) ------------------------------------
  { id: 'd01', cat: 'dinner', text: 'Der schönste Spieß vom Rodizio.' },
  { id: 'd02', cat: 'dinner', text: 'Fotografiere, wie am Buffet frisch vom Spieß geschnitten wird.', icon: '🔪' },
  { id: 'd04', cat: 'dinner', text: 'Der Limoncello-Tiramisu-Tower „40" — bevor er angeschnitten wird.', icon: '🍰' },

  // ---- Dancefloor (Challenge 4) ------------------------------------------
  { id: 'f01', cat: 'floor',  text: 'Beste Tanzpose nach 22 Uhr.' },
  { id: 'f02', cat: 'floor',  text: 'Ein Foto unter der Discokugel.', icon: '🪩' },
  { id: 'f03', cat: 'floor',  text: 'Der Mitternachtsanstoß um 00:00.', icon: '🕛' },

  // ---- Gäste (Challenge 5) ------------------------------------------------
  { id: 'n01', cat: 'guests', text: 'Gruppenfoto mit mindestens fünf Gästen.' },
  { id: 'n02', cat: 'guests', text: 'Stell dich jemandem vor, den du noch nicht kennst — Selfie zu zweit.', icon: '👋' },
  { id: 'n03', cat: 'guests', text: 'Das beste Outfit des Abends in Schwarz, Gold oder Chrom.', icon: '🖤' },

  // ---- Helge (Challenge 6) ------------------------------------------------
  { id: 'h01', cat: 'helge',  text: 'Das Geburtstagskind beim Anstoßen.' },
  { id: 'h02', cat: 'helge',  text: 'Mache ein Selfie mit Helge.' },
  { id: 'h03', cat: 'helge',  text: 'Helge und Nadine zusammen in einem Bild.' },
  { id: 'h05', cat: 'helge',  text: 'Ein Foto, das Helge auch mit 50 noch gerne anschaut.', icon: '🕰️' },
];
