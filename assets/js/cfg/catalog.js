/* DTT Tor-Studio · Produktkatalog Echtholz
   Quelle: Preisliste SECUR / SECURPLUS 08/2026 (Rev. 00), geprüft gegen die Sektorentabelle 08/2026 (xlsx), Produktseiten (Garagentore: Secur, Secur Plus,
   Sektionaltore SR, Seitensektionaltore SL, Basculap, Flügeltore). Alle Preise = Listenpreise netto ab Werk in EUR. */

export const TYPES = {
  secur: {
    label: 'SECUR Schwingtor', short: 'Schwingtor',
    desc: 'Einteiliges Echtholz-Tor mit seitlichen Gegengewichten, ohne Deckenschienen. Öffnet von Hand mit Selbstauslösung oder motorisiert.',
    facts: ['80 mm Torblatt, Meeresholz-Sandwich', 'Einbruchschutz Klasse 1 (SECUR) oder Klasse 3 (SECUR PLUS)', 'Combimatic-Antrieb serienmäßig', 'U = 2,5 W/m²K (1,3 mit Dämmkit)'],
    families: ['linee', 'bugne', 'design', 'materia', 'japan'], priced: true, kind: 'tilt',
  },
  sr: {
    label: 'SR Sektionaltor', short: 'Sektionaltor',
    desc: 'Echtholz-Sektionaltor aus unserer Manufaktur: läuft in Schienen unter die Decke, Platz vor und hinter dem Tor bleibt frei.',
    facts: ['Lamellen aus Echtholz, 80 mm', 'Läuft unter die Decke', 'Antrieb mit Handsender', 'Lichtausschnitte und Schlupftür möglich'],
    families: ['sr'], priced: false, kind: 'sectional',
  },
  sl: {
    label: 'SL Seitensektionaltor', short: 'Seitensektionaltor',
    desc: 'Die Lamellen laufen seitlich an der Garagenwand entlang. Decke bleibt frei, Tor lässt sich auch teilweise öffnen.',
    facts: ['Öffnet seitlich, Decke bleibt frei', 'Teilöffnung als Durchgang', 'Gleiche Echtholz-Lamellen wie SR'],
    families: ['sl'], priced: false, kind: 'side',
  },
  basculap: {
    label: 'Basculap Kipptor', short: 'Kipptor',
    desc: 'Kipptor mit Gegengewichten und lackierter Metall- oder Holzoptik. Die wirtschaftliche Alternative zum SECUR.',
    facts: ['Einteiliges Torblatt', 'Lackiert in RAL', 'Vier Ästhetiken: glatt, Multidoga, Bidoga, Veneziana'],
    families: ['basculap'], priced: false, kind: 'tilt',
  },
  steel: {
    label: 'Stahl-Sektionaltor', short: 'Stahl-Sektionaltor',
    desc: 'Sektionaltor aus Stahl mit 40 mm PUR-Paneel. Läuft unter die Decke, lackiert in jeder RAL- oder NCS-Farbe, mit Listenpreis nach Breite und Höhe.',
    facts: ['40 mm Paneel, beidseitig verzinkt, PUR-ausgeschäumt', 'Federbruchsicherung serienmäßig', 'Torsionsfedern 20.000 Zyklen, bis 100.000 möglich', 'Lackierung RAL oder NCS, Holzoptik, Fenster, Schlupftür'],
    families: ['steel'], priced: true, kind: 'sectional', steel: true,
  },
  wing: {
    label: 'Flügeltor', short: 'Flügeltor',
    desc: 'Zweiflügeliges Echtholz-Tor, öffnet nach außen. Klassisch oder modern, mit denselben Oberflächen wie das SECUR.',
    facts: ['Zwei Flügel, öffnen nach außen', 'Echtholz, 80 mm', 'Antrieb mit Drehflügel-Motoren möglich'],
    families: ['linee', 'bugne'], priced: false, kind: 'wing',
  },
};

/* Modellfamilien und Modelle. pattern = Fräsbild für die 3D-Geometrie (siehe door.js). */
export const FAMILIES = {
  linee:    { label: 'Linee',         desc: 'Gefräste Linien in Holz: von fein bis markant.' },
  bugne:    { label: 'Bugne',         desc: 'Klassische Kassetten und Füllungen.' },
  design:   { label: 'Design',        desc: 'Lamellenbilder zwischen Rahmenprofilen.' },
  materia:  { label: 'Materia',       desc: 'Sandstein-Oberfläche auf Meeresholz.' },
  japan:    { label: 'Japanese Mood', desc: 'Verkohlte oder gealterte Fichtenbretter.' },
  sr:       { label: 'SR Designs',    desc: 'Lamellenbilder des Sektionaltors.' },
  sl:       { label: 'SL Designs',    desc: 'Lamellenbilder des Seitensektionaltors.' },
  basculap: { label: 'Basculap',      desc: 'Ästhetiken des Kipptors.' },
  steel:    { label: 'Stahl',         desc: 'Paneeloptik des Stahl-Sektionaltors.' },
};

export const MODELS = {
  // ---- Linee (Preisliste S. 18)
  flat:   { family: 'linee', label: 'FLAT',   pattern: 'flat',    grain: 'v', desc: 'Glatte Fläche, zwei vertikale Fugen.', table: 'linee', metalskin: true, maxH: 3180 },
  newman: { family: 'linee', label: 'NEWMAN', pattern: 'boards', grain: 'v', desc: 'Vertikale Bretter in wechselnden Breiten.', table: 'linee', metalskin: true },
  vip:    { family: 'linee', label: 'VIP',    pattern: 'vgroove', pitch: .2, grain: 'v', desc: 'Vertikale Nuten 9 × 5 mm, Raster etwa 200 mm.', table: 'linee', metalskin: true, maxH: 3180 },
  doc:    { family: 'linee', label: 'DOC',    pattern: 'vgroove', pitch: .11, grain: 'v', desc: 'Feine vertikale Nuten, Raster etwa 110 mm.', table: 'linee', metalskin: true },
  spi:    { family: 'linee', label: 'SPI',    pattern: 'chevron', pitch: .13, grain: 'd', desc: 'Fischgrät: Nuten im 45°-Winkel zur Mitte.', table: 'linee', metalskin: true },
  for:    { family: 'linee', label: 'FOR',    pattern: 'hboard',  pitch: .175, fields: 3, groove: .009, grain: 'h', desc: 'Horizontale Bretter in drei Feldern.', table: 'linee', metalskin: true },
  geo:    { family: 'linee', label: 'GEO',    pattern: 'geo', grain: 'h', desc: 'Geometrisches Fugenbild im Verband, mit Rahmen.', table: 'linee', metalskin: true, maxH: 3180 },
  // ---- Bugne (S. 19)
  big:    { family: 'bugne', label: 'BIG', pattern: 'grid',  desc: 'Drei Felder, je eine große und eine kleine Kassette.', table: 'bugne' },
  old:    { family: 'bugne', label: 'OLD', pattern: 'hboard', pitch: .21, fields: 3, groove: .009, grain: 'h', desc: 'Horizontale Bretter in drei Feldern, rustikal.', table: 'bugne', brushedOk: true },
  ego:    { family: 'bugne', label: 'EGO', pattern: 'ego',   desc: 'Drei Felder mit hoher Kassette, Band und Sockelkassette.', table: 'bugne' },
  arc:    { family: 'bugne', label: 'ARC', pattern: 'arc',   desc: 'Drei Felder mit Bogenkassetten und Sockel.', table: 'bugne' },
  // ---- Design (S. 20–21)
  slot:       { family: 'design', label: 'SLOT',       pattern: 'slot',   desc: 'Vertikale Leisten 70 mm, in der Mitte versetzt.', table: 'design1' },
  layer:      { family: 'design', label: 'LAYER',      pattern: 'layer',  desc: 'Vertikale Bretter 250 mm mit gestufter Kante.', table: 'design1', maxH: 3180 },
  // ---- Materia (S. 22): Sandstein-Matte auf Meeresholz
  belgium:     { family: 'materia', label: 'BELGIUM',      pattern: 'slab', stone: 'belgium',     desc: 'Sandstein, hellgrau.', table: 'materia', maxH: 2830 },
  greece:      { family: 'materia', label: 'GREECE',       pattern: 'slab', stone: 'greece',      desc: 'Sandstein, anthrazit.', table: 'materia', maxH: 2830 },
  india:       { family: 'materia', label: 'INDIA',        pattern: 'slab', stone: 'india',       desc: 'Sandstein, ocker-rost.', table: 'materia', maxH: 2830 },
  southafrica: { family: 'materia', label: 'SOUTH AFRICA', pattern: 'slab', stone: 'southafrica', desc: 'Sandstein, creme-weiß.', table: 'materia', maxH: 2830 },
  // ---- Japanese Mood (S. 23)
  sugi:     { family: 'japan', label: 'SUGI',      pattern: 'vboard', pitch: .14, wood: 'sugi',     desc: 'Verkohlte Fichtenbretter, weiß pigmentiert versiegelt.', table: 'japan' },
  wabisabi: { family: 'japan', label: 'WABI SABI', pattern: 'vboard', pitch: .14, wood: 'wabisabi', desc: 'Gealterte Fichtenbretter, hydro-geölt.', table: 'japan' },
  // ---- Sektionaltor SR / SL (Hersteller-Produktseiten)
  sr_piana:      { family: 'sr', label: 'Piana',      pattern: 'flat',    desc: 'Glatte Lamellen.' },
  sr_multidoga:  { family: 'sr', label: 'Multidoga',  pattern: 'hboard',  pitch: .07, desc: 'Mehrere Bretter je Lamelle.' },
  sr_bidoga:     { family: 'sr', label: 'Bidoga',     pattern: 'hgroove', pitch: .25, desc: 'Zwei Bretter je Lamelle.' },
  sr_veneziana:  { family: 'sr', label: 'Veneziana',  pattern: 'ribs',    pitch: .03, desc: 'Feine horizontale Lamellen.' , horizontal: true },
  sr_cassettata: { family: 'sr', label: 'Cassettata', pattern: 'grid',    desc: 'Kassetten je Lamelle.' },
  sr_madeira:    { family: 'sr', label: 'Madeira',    pattern: 'vgroove', pitch: .10, desc: 'Vertikale Nuten.' },
  sl_piana:      { family: 'sl', label: 'Piana',      pattern: 'flat',    desc: 'Glatte Lamellen.' },
  sl_multidoga:  { family: 'sl', label: 'Multidoga',  pattern: 'hboard',  pitch: .07, desc: 'Mehrere Bretter je Lamelle.' },
  sl_bidoga:     { family: 'sl', label: 'Bidoga',     pattern: 'hgroove', pitch: .25, desc: 'Zwei Bretter je Lamelle.' },
  sl_madeira:    { family: 'sl', label: 'Madeira',    pattern: 'vgroove', pitch: .10, desc: 'Vertikale Nuten.' },
  // ---- Basculap
  b_liscio:    { family: 'basculap', label: 'Liscio',    pattern: 'flat',    panels: .5, desc: 'Glatt, Sandwichpaneele 500 mm.' },
  b_multidoga: { family: 'basculap', label: 'Multidoga', pattern: 'hboard',  pitch: .07, desc: 'Horizontale Bretteroptik.' },
  b_bidoga:    { family: 'basculap', label: 'Bidoga',    pattern: 'hgroove', pitch: .25, desc: 'Zweiteilige Felder.' },
  b_veneziana: { family: 'basculap', label: 'Veneziana', pattern: 'ribs',    pitch: .03, desc: 'Feine horizontale Lamellen.', horizontal: true },
  // ---- Stahl-Sektionaltor (Preisliste Stahl-Sektionaltore Rev. 2635): 40 mm Paneel, Sektionen laut Preisraster
  st_glatt:   { family: 'steel', label: 'Glatt',          pattern: 'steel',  desc: 'Glatte Sektionen, lackiert.' },
  st_wood:    { family: 'steel', label: 'Holzoptik',      pattern: 'steel',  woodlook: true, desc: 'Paneel mit Holzimitation (+15 %).' },
};
export const modelsOf = (type) => Object.entries(MODELS).filter(([, m]) => TYPES[type].families.includes(m.family)).map(([id]) => id);

/* Oberflächen. kind: paint (Okoumé lackiert RAL) | stain (imprägniert) | wood (Essenz natur) | metal | stone | fixed */
export const RAL = [
  { id: '9016', name: 'Verkehrsweiß', hex: '#f4f3ef' }, { id: '9010', name: 'Reinweiß', hex: '#f5f2e8' }, { id: '9003', name: 'Signalweiß', hex: '#f1f0ea' },
  { id: '9001', name: 'Cremeweiß', hex: '#ebe4d2' }, { id: '9002', name: 'Grauweiß', hex: '#ddddd3' }, { id: '1013', name: 'Perlweiß', hex: '#f1ead8' },
  { id: '1019', name: 'Graubeige', hex: '#a69a81' }, { id: '7035', name: 'Lichtgrau', hex: '#d1d2d0' }, { id: '7044', name: 'Seidengrau', hex: '#c4c0b6' },
  { id: '7040', name: 'Fenstergrau', hex: '#9fa0a4' }, { id: '7036', name: 'Platingrau', hex: '#a29c9b' }, { id: '7001', name: 'Silbergrau', hex: '#a2a7af' },
  { id: '7000', name: 'Fehgrau', hex: '#7d8a92' }, { id: '7030', name: 'Steingrau', hex: '#96928a' }, { id: '7039', name: 'Quarzgrau', hex: '#6b665e' },
  { id: '7006', name: 'Beigegrau', hex: '#79685a' }, { id: '7013', name: 'Braungrau', hex: '#555040' }, { id: '7016', name: 'Anthrazitgrau', hex: '#383e3f' },
  { id: '9005', name: 'Tiefschwarz', hex: '#0d1113' }, { id: '9006', name: 'Weißaluminium', hex: '#a5a8a6' }, { id: '3003', name: 'Rubinrot', hex: '#8f3122' },
  { id: '3009', name: 'Oxidrot', hex: '#642c26' }, { id: '6005', name: 'Moosgrün', hex: '#164239' }, { id: '6009', name: 'Tannengrün', hex: '#0f2e21' },
  { id: '6013', name: 'Schilfgrün', hex: '#7e8a5a' }, { id: '6021', name: 'Blassgrün', hex: '#8fa58b' }, { id: '8017', name: 'Schokobraun', hex: '#42221b' },
  { id: '8019', name: 'Graubraun', hex: '#3e3b39' },
];
// Imprägnierungen (Standardfarben, 12 Jahre Garantie) auf Okoumé-Basis: Zielfarbe aus der Hersteller-Farbkarte
export const STAINS = [
  { id: 'douglas', name: 'Douglasie', hex: '#92562b', sw: 't_douglas' }, { id: 'miele', name: 'Honig', hex: '#a4743b', sw: 't_miele' },
  { id: 'noce', name: 'Nussbaum', hex: '#6c4422', sw: 't_noce' }, { id: 'noce_sc', name: 'Nussbaum dunkel', hex: '#402e20', sw: 't_noce_scuro' },
  { id: 't_rovere', name: 'Eiche', hex: '#956a3b', sw: 't_rovere' }, { id: 'wenge', name: 'Wengé', hex: '#2f2219', sw: 't_noce_scuro' },
];
// Essenzen (Preislistenspalten): Okoumé, Nordische Fichte, Eiche, Eiche gebürstet, Lärche gebürstet
export const ESSENCES = [
  { id: 'okoume', name: 'Okoumé', col: 'okoume', base: 'okoume', hex: '#c69464', sw: 'okoume', desc: 'Lackiert in RAL oder imprägniert' },
  { id: 'fir',    name: 'Nordische Fichte', col: 'fir', base: 'fir', hex: '#e2c39a', sw: 'fir', desc: 'Helles Nadelholz, natur oder imprägniert' },
  { id: 'oak',    name: 'Eiche', col: 'oak', base: 'oak', hex: '#c5a176', sw: 'rovere', desc: 'Edelholz-Furnier' },
  { id: 'oak_br', name: 'Eiche gebürstet', col: 'brushed', base: 'oak', hex: '#c09c74', sw: 'rovere_spazz', brushed: true, desc: 'Fühlbare Maserung' },
  { id: 'larch_br', name: 'Lärche gebürstet', col: 'brushed', base: 'larch', hex: '#d8a473', sw: 'larice_spazz', brushed: true, desc: 'Fühlbare Maserung' },
];
export const METAL = [
  { id: 'ms_steel', name: 'Pewter Stahl', hex: '#8c8f93', tex: 'metal_steel' }, { id: 'ms_bronze', name: 'Patina Bronze', hex: '#6b5238', tex: 'metal_bronze' },
  { id: 'ms_iron', name: 'Pewter Eisen', hex: '#4e5054', tex: 'metal_steel' }, { id: 'ms_rosegold', name: 'Pewter Roségold', hex: '#b08a78', tex: 'metal_bronze' },
  { id: 'ms_brass', name: 'Patina Messing', hex: '#a88a4f', tex: 'metal_bronze' },
];
export const STONES = {
  belgium: { name: 'Belgium', hex: '#b9b3a6', tex: 'stone_belgium' }, greece: { name: 'Greece', hex: '#5b5d5e', tex: 'stone_greece' },
  india: { name: 'India', hex: '#b58654', tex: 'stone_india' }, southafrica: { name: 'South Africa', hex: '#e2ddd0', tex: 'stone_southafrica' },
};
export const SPECIAL_WOOD = { sugi: { name: 'Sugi, verkohlt', hex: '#1a1816', tex: 'wood_sugi' }, wabisabi: { name: 'Wabi Sabi, gealtert', hex: '#9a8a74', tex: 'wood_wabisabi' } };
export const PAINT_FINISH = { matt: 'Matt', seide: 'Seidenglanz' };

/* Ausstattung (Preisliste S. 11–12, 25–29) */
export const OPTIONS = {
  securplus: { label: 'SECUR PLUS, Einbruchschutz Klasse 3', price: 2855, note: 'Verstärkter Rahmen, bis Sektor D' },
  nonprotruding: { label: 'Nicht ausschwenkendes Torblatt', price: 651, note: 'Torblatt bleibt beim Öffnen innerhalb der Rahmenhöhe' },
  pedestrian: { label: 'Schlupftür 800 mm', price: 1963, note: 'Durchgang 755 mm, öffnet nach außen' },
  windows_s: { label: 'Fenster 400 × 300 mm (Paar)', price: 749 * 2, note: 'Holzsprossen in Torfarbe, Sicherheitsglas' },
  windows_l: { label: 'Fenster 800 × 300 mm (Paar)', price: 962 * 2, note: 'Holzsprossen in Torfarbe, Sicherheitsglas' },
  transom_blind: { label: 'Blindes Oberlicht (bis 1,5 m²)', price: 1270, note: 'Panel im Tordesign, 80 mm' },
  transom_glass: { label: 'Verglastes Oberlicht (bis 1,5 m²)', price: 2611, note: 'Isolierglas 3+3.2/16 Argon' },
  grille: { label: 'Lüftungsgitter 400 × 200 mm', price: 735, note: 'Metall, anthrazit' },
  sildomo: { label: 'SILDOMO Smartphone-Öffnung', price: 130, note: 'Bis 4 Zugänge, 10 Nutzer' },
  sildomo_link: { label: 'SILDOMO LINK (WLAN, Alexa, Google Home)', price: 325 },
  keypad: { label: 'Funk-Codetastatur', price: 129 + 158, note: 'Beleuchtet, mit Unterputz-Empfänger' },
  remote: { label: 'Zusätzlicher 4-Kanal-Handsender', price: 56 },
  blockmatic: { label: 'BLOCKMATIC Verriegelungsantrieb', price: 637, note: 'Motorische Sicherheitsriegel' },
  insulation: { label: 'Dämmkit U = 1,3 W/m²K', price: null, note: 'Preis auf Anfrage (Code G20)' },
};
export const HANDLES = [
  { id: 'std', name: 'Muschelgriff anthrazit', price: 0, hex: '#3a3d40', note: 'Serie, bündig im Torblatt' },
  { id: 'ral', name: 'Muschelgriff in RAL-Farbe', price: 396, hex: null },
  { id: 'bronze', name: 'Muschelgriff Bronze', price: 297, hex: '#6e5a42' },
  { id: 'silver', name: 'Muschelgriff Silber', price: 297, hex: '#b9bcbf' },
  { id: 'band', name: 'Edelstahlband 300 mm horizontal', price: 705, hex: '#c9ccce', band: true },
];
export const DRIVES = [
  { id: 'combimatic', name: 'Combimatic Antrieb', price: 0, note: 'Serie beim SECUR: Steuerung, 2 Paar Lichtschranken, Blinkleuchte im Griff' },
  { id: 'manual', name: 'Manuell', price: null, note: 'Selbstauslösende Öffnung, Abzug vom Listenpreis auf Anfrage' },
];

/* Preistabellen: Listenpreis je Sektor (S. 18–23). Spalten: okoume | fir | oak | brushed */
const S = ['A0', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'P', 'R', 'V', 'X'];
const tbl = (cols, rows) => Object.fromEntries(S.map((s, i) => [s, Object.fromEntries(cols.map((c, j) => [c, rows[i][j]]))]));
export const PRICES = {
  linee: tbl(['okoume', 'fir', 'oak', 'brushed'], [[7640, 8666, 8496, 9018], [8436, 9650, 9448, 10068], [8914, 10406, 10160, 10920], [9324, 10928, 10662, 11480], [10048, 12020, 11694, 12700], [10368, 12186, 11884, 12812], [11240, 13476, 13106, 14248], [11640, 13702, 13360, 14412], [12438, 14974, 14552, 15848], [13768, 16052, 15674, 16838], [14918, 17698, 17236, 18654], [15428, 18042, 17608, 18942], [16576, 19688, 19172, 20762], [11370, 13658, 13280, 14448], [13786, 16724, 16236, 17736], [12110, 14706, 14274, 15600], [10360, 12092, 11804, 12688]]),
  bugne: tbl(['okoume', 'oak', 'brushed'], [[8242, 11644, 12314], [9332, 12723, 13484], [9806, 13482, 14411], [10196, 13955, 14946], [10884, 15035, 16243], [11186, 14607, 15675], [12034, 15567, 16846], [12422, 15838, 17016], [13190, 16222, 17595], [14518, 17408, 18643], [15628, 19023, 20526], [16120, 19398, 20812], [17230, 21016, 22700], [12160, 14913, 16151], [14498, 17965, 19554], [13340, 16434, 17839], [11186, 13388, 14325]]),
  design1: tbl(['okoume', 'oak', 'brushed'], [[9190, 12858, 13527], [9958, 13493, 14254], [10418, 14229, 15157], [10822, 14712, 15703], [11510, 15786, 16994], [11820, 15336, 16404], [12668, 16277, 17556], [13048, 16539, 17717], [13816, 16886, 18259], [15170, 18100, 19334], [16294, 19729, 21232], [16770, 20087, 21501], [17888, 21713, 23397], [12786, 15577, 16815], [15122, 18626, 20215], [13974, 17106, 18511], [11366, 13579, 14516]]),
  design2: tbl(['okoume', 'oak'], [[10282, 13364], [11074, 13899], [11550, 14075], [11960, 14627], [12674, 15751], [12992, 15959], [13864, 17302], [14258, 17575], [15050, 18194], [16476, 19484], [17632, 21147], [18124, 21522], [19282, 23191], [13990, 16853], [16398, 19979], [15210, 18416], [12992, 15302]]),
  materia: tbl(['stone'], [[10282], [11074], [11550], [11960], [12674], [12992], [13864], [14258], [15050], [16476], [17632], [18124], [19282], [13990], [16398], [15210], [12992]]),
  japan: tbl(['wood'], [[8260], [9316], [10950], [11538], [12930], [12902], [14524], [14526], [16196], [15780], [17710], [19012], [21044], [14746], [18208], [16456], [12718]]),
};
export const SURCHARGES = { metalskin_m2: 254, ral_special: 399, sample_colour: 628, wallconcept_m2: { linee: 712, design: 712, japan: 1476, metal: 1313 } };

/* Sektor aus Außenmaß Rahmen (Preisliste S. 16, ausschwenkend, Standard). Breitenbänder je Höhenband wie im Raster;
   das schwarze Treppenfeld rechts oben (nicht lieferbar) und die ausgesparte Ecke rechts unten sind als Grenzen hinterlegt. */
export function maxWidthFor(h) { if (h <= 2630) return 5970; return Math.max(2670, Math.floor((5770 - 2.5 * (h - 2680)) / 50) * 50); }
export function minHeightFor(w) { return w <= 4270 ? 1980 : w <= 4870 ? 2130 : 2230; }
export function sector(w, h) {
  if (w < 2070 || h < 1980 || h > 3480 || w > maxWidthFor(h) || h < minHeightFor(w)) return null;
  const band = (limits, names) => { for (let i = 0; i < limits.length; i++) if (w <= limits[i]) return names[i]; return null; };
  if (h <= 2280 && w <= 2670) return 'A0';
  if (h <= 2580) return band([3270, 3770, 3970, 4570, 5170, 5970], ['A', 'C', 'E', 'G', 'I', 'M']);
  if (h <= 2980) return band([2670, 3270, 3770, 4570, 5170, 5970], ['B', 'D', 'F', 'H', 'L', 'N']);
  return band([2670, 3270, 3770, 4570], ['X', 'P', 'V', 'R']);
}

/* Öffnungsbahn und Platzbedarf SECUR / SECUR PLUS (Preisliste 08/2026, S. 9 ausschwenkend, S. 10 nicht ausschwenkend).
   H = Bestellhöhe Außenkante Rahmen. aOut/aIn = Ausschwenken außen/innen bei ½ H, bOut/bIn bei ¾ H, s = Überstand des offenen Torblatts
   vor der Rahmenlinie, r = Platzbedarf nach innen ab Rahmenlinie, e = Durchfahrtshöhe bei offenem Tor. Alle Maße in mm. */
const TR = (rows, keys) => rows.map(r => Object.fromEntries(keys.map((k, i) => [k, r[i]])));
export const TRAJECTORY = {
  protruding: TR([
    [1980, 400, 990, 900, 1480, 190, 1700, 1750], [2030, 400, 1015, 900, 1520, 190, 1750, 1800], [2080, 400, 1040, 900, 1560, 240, 1750, 1840], [2130, 400, 1065, 900, 1600, 240, 1800, 1890],
    [2180, 400, 1090, 900, 1640, 290, 1800, 1935], [2230, 400, 1115, 900, 1670, 290, 1850, 1985], [2280, 400, 1140, 900, 1710, 340, 1850, 2030], [2330, 400, 1165, 900, 1750, 340, 1900, 2080],
    [2380, 400, 1190, 900, 1790, 390, 1900, 2125], [2430, 400, 1215, 900, 1820, 390, 1950, 2175], [2480, 400, 1240, 900, 1860, 440, 1950, 2220], [2530, 400, 1265, 900, 1900, 440, 2000, 2270],
    [2580, 400, 1290, 900, 1940, 490, 2000, 2315], [2630, 400, 1315, 900, 1970, 490, 2050, 2365], [2680, 400, 1340, 900, 2010, 540, 2050, 2410], [2730, 400, 1365, 900, 2050, 540, 2100, 2460],
    [2780, 400, 1390, 950, 2090, 590, 2100, 2505], [2830, 400, 1415, 950, 2120, 590, 2150, 2555], [2880, 400, 1440, 950, 2160, 640, 2150, 2600], [2930, 400, 1465, 950, 2200, 640, 2200, 2650],
    [2980, 400, 1490, 950, 2230, 690, 2200, 2695], [3030, 400, 1515, 950, 2270, 690, 2250, 2745], [3080, 400, 1540, 950, 2310, 740, 2250, 2790], [3130, 400, 1565, 1000, 2350, 740, 2300, 2840],
    [3180, 400, 1590, 1000, 2380, 790, 2300, 2885], [3230, 400, 1615, 1000, 2420, 790, 2350, 2935], [3280, 400, 1640, 1000, 2460, 840, 2350, 2980], [3330, 400, 1665, 1000, 2500, 840, 2400, 3030],
    [3380, 400, 1690, 1000, 2530, 890, 2400, 3075], [3430, 400, 1715, 1000, 2570, 890, 2450, 3125], [3480, 400, 1740, 1000, 2610, 940, 2450, 3170],
  ], ['h', 'aOut', 'aIn', 'bOut', 'bIn', 's', 'r', 'e']),
  nonprotruding: TR([
    [1980, 520, 990, 980, 1480, 1900, 1750], [2030, 530, 1015, 1005, 1520, 1950, 1800], [2080, 540, 1040, 1030, 1560, 2000, 1850], [2130, 550, 1065, 1055, 1600, 2050, 1900],
    [2180, 560, 1090, 1080, 1640, 2100, 1950], [2230, 570, 1115, 1105, 1670, 2150, 2000], [2280, 580, 1140, 1130, 1710, 2200, 2050], [2330, 590, 1165, 1155, 1750, 2250, 2100],
    [2380, 600, 1190, 1180, 1790, 2300, 2150], [2430, 610, 1215, 1205, 1820, 2350, 2200], [2480, 620, 1240, 1230, 1860, 2400, 2250], [2530, 630, 1265, 1255, 1900, 2450, 2300],
    [2580, 640, 1290, 1280, 1940, 2500, 2350],
  ], ['h', 'aOut', 'aIn', 'bOut', 'bIn', 'r', 'e']),
  headroom: { frameHead: 110, lossOpen: '230/310', rearDrop: 150 },
  options: { G31: { label: 'Vergrößerter Überstand 50/100/150 mm', price: 514 }, F01: { label: 'Nicht ausschwenkendes Torblatt', price: 651 }, F02: { label: 'Deckenführungen nach Vorgabe der Technik', price: 2259 }, G10: { label: 'Distanzleisten 25 mm zwischen Wand und Rahmen (Torblatt nicht über die Lichte hinaus)', price: 261 } },
};
/* row for an order height: the next listed height (table step 50 mm); null when the variant is not listed for this height */
export function trajectoryFor(h, nonprotruding = false) {
  const rows = nonprotruding ? TRAJECTORY.nonprotruding : TRAJECTORY.protruding;
  const row = rows.find(r => r.h >= h) || null;
  return row ? { ...row, exact: row.h === h, nonprotruding } : null;
}

/* Rahmenpfosten: 110 mm im inneren Bereich des Rasters, 135 mm (X-Felder) bei größeren Toren oder mit Schlupftür */
export function pillarFor(w, h, pedestrian = false) {
  if (pedestrian) return 135;
  if ((w <= 3270 && h <= 2580) || (w <= 2670 && h <= 3480) || (w <= 3270 && h <= 2880)) return 110;
  return 135;
}
export const SECTOR_NOTES = { certified: 'Tore mit H > 2980 mm sind nicht nach Einbruchschutz-Klasse 1 zertifiziert.', tall: 'Höhen ab 3230 mm sind bei VIP, GEO, FLAT und LAYER nicht lieferbar.', plus: 'SECUR PLUS (Klasse 3) bis Sektor D, bei Breiten ab 3620 mm nur VIP, FOR, GEO, FLAT und LAYER.' };

export const PLUS_SECTORS = ['A0', 'A', 'B', 'C', 'D'];
export const SIZE_PRESETS = [{ label: 'Einzelgarage', w: 2500, h: 2125 }, { label: 'Einzel hoch', w: 3000, h: 2250 }, { label: 'Breit', w: 3500, h: 2250 }, { label: 'Doppelgarage', w: 5000, h: 2250 }];
export const LIMITS = { w: [2000, 6500], h: [1875, 3480] };
export const FACADE = [
  { id: 'weiss', name: 'Weiß', hex: '#efece5' }, { id: 'hellgrau', name: 'Hellgrau', hex: '#cdd1d3' },
  { id: 'sand', name: 'Sandstein', hex: '#d8c8a9' }, { id: 'anthrazit', name: 'Anthrazit', hex: '#4b4e51' },
  { id: 'klinker', name: 'Klinker', hex: '#8d4b3a', brick: true },
];
export const ROOF = { flat: 'Flachdach', gable: 'Satteldach' };

/* Schnellstart-Vorlagen */
export const PRESETS = [
  { id: 'vipoak', label: 'VIP Eiche', patch: { type: 'secur', model: 'vip', essence: 'oak', surface: 'natural', color: 'oak' } },
  { id: 'oldoak', label: 'OLD Eiche', patch: { type: 'secur', model: 'old', essence: 'oak', surface: 'natural', color: 'oak' } },
  { id: 'slotlarch', label: 'SLOT Lärche', patch: { type: 'secur', model: 'slot', essence: 'larch_br', surface: 'natural', color: 'larch_br' } },
  { id: 'greece', label: 'Materia Greece', patch: { type: 'secur', model: 'greece' } },
  { id: 'vip7016', label: 'VIP Anthrazit', patch: { type: 'secur', model: 'vip', essence: 'okoume', surface: 'paint', color: '7016' } },
  { id: 'srwhite', label: 'SR Piana Weiß', patch: { type: 'sr', model: 'sr_piana', essence: 'okoume', surface: 'paint', color: '9016' } },
  { id: 'steel7016', label: 'Stahl Anthrazit', patch: { type: 'steel', model: 'st_glatt', surface: 'paint', color: '7016' } },
];
