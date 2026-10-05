/* DTT Tor-Studio · Produktkatalog
   Quelle: Silvelox Preisliste SECUR / SECURPLUS 08/2026 (Rev. 00), Silvelox Produktseiten (Garagentore: Secur, Secur Plus,
   Sektionaltore SR, Seitensektionaltore SL, Basculap, Flügeltore). Alle Preise = Silvelox Listenpreise netto ab Werk in EUR. */

export const TYPES = {
  secur: {
    label: 'SECUR Schwingtor', short: 'Schwingtor',
    desc: 'Einteiliges Echtholz-Tor mit seitlichen Gegengewichten, ohne Deckenschienen. Öffnet von Hand mit Selbstauslösung oder motorisiert.',
    facts: ['80 mm Torblatt, Meeresholz-Sandwich', 'Einbruchschutz Klasse 1 (SECUR) oder Klasse 3 (SECUR PLUS)', 'Combimatic-Antrieb serienmäßig', 'U = 2,5 W/m²K (1,3 mit Dämmkit)'],
    families: ['linee', 'bugne', 'design', 'materia', 'japan'], priced: true, kind: 'tilt',
  },
  sr: {
    label: 'SR Sektionaltor', short: 'Sektionaltor',
    desc: 'Echtholz-Sektionaltor von Silvelox: läuft in Schienen unter die Decke, Platz vor und hinter dem Tor bleibt frei.',
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
  design:   { label: 'Design',        desc: 'Lamellen, Wellen und Flechtstrukturen.' },
  materia:  { label: 'Materia',       desc: 'Sandstein-Oberfläche auf Meeresholz.' },
  japan:    { label: 'Japanese Mood', desc: 'Verkohlte oder gealterte Fichtenbretter.' },
  sr:       { label: 'SR Designs',    desc: 'Lamellenbilder des Sektionaltors.' },
  sl:       { label: 'SL Designs',    desc: 'Lamellenbilder des Seitensektionaltors.' },
  basculap: { label: 'Basculap',      desc: 'Ästhetiken des Kipptors.' },
};

export const MODELS = {
  // ---- Linee (Preisliste S. 18)
  flat:   { family: 'linee', label: 'FLAT',   pattern: 'flat',    grain: 'v', desc: 'Glatte Fläche, zwei vertikale Fugen.', table: 'linee', metalskin: true, maxH: 3180 },
  newman: { family: 'linee', label: 'NEWMAN', pattern: 'vgroove', pitch: .05, grain: 'v', desc: 'Feine vertikale Linien im Abstand 50 mm.', table: 'linee', metalskin: true },
  vip:    { family: 'linee', label: 'VIP',    pattern: 'vgroove', pitch: .10, grain: 'v', desc: 'Vertikale Nuten 9 × 5 mm, Raster 100 mm.', table: 'linee', metalskin: true, maxH: 3180 },
  doc:    { family: 'linee', label: 'DOC',    pattern: 'hgroove', pitch: .14, grain: 'v', desc: 'Horizontale Nuten, Raster 140 mm.', table: 'linee', metalskin: true },
  spi:    { family: 'linee', label: 'SPI',    pattern: 'chevron', pitch: .11, grain: 'd', desc: 'Fischgrät: Nuten im 45°-Winkel.', table: 'linee', metalskin: true },
  for:    { family: 'linee', label: 'FOR',    pattern: 'hboard',  pitch: .07, grain: 'h', desc: 'Horizontale Bretter 70 mm.', table: 'linee', metalskin: true },
  geo:    { family: 'linee', label: 'GEO',    pattern: 'hgroove', pitch: .25, grain: 'h', desc: 'Horizontale Nuten, Raster 250 mm.', table: 'linee', metalskin: true, maxH: 3180 },
  // ---- Bugne (S. 19)
  big:    { family: 'bugne', label: 'BIG', pattern: 'grid',  desc: 'Großes Kassettenraster über die ganze Fläche.', table: 'bugne' },
  old:    { family: 'bugne', label: 'OLD', pattern: 'old',   desc: 'Drei Felder mit klassischen Kassetten.', table: 'bugne', brushedOk: true },
  ego:    { family: 'bugne', label: 'EGO', pattern: 'ego',   desc: 'Drei Felder mit horizontalem Band.', table: 'bugne' },
  arc:    { family: 'bugne', label: 'ARC', pattern: 'arc',   desc: 'Drei Felder mit Bogenkassetten.', table: 'bugne' },
  // ---- Design (S. 20–21)
  slot:       { family: 'design', label: 'SLOT',       pattern: 'slot',   desc: 'Vertikale Lamellen zwischen Rahmenprofilen.', table: 'design1' },
  layer:      { family: 'design', label: 'LAYER',      pattern: 'layer',  desc: 'Versetzte Lamellen in drei Feldern.', table: 'design1', maxH: 3180 },
  matrix:     { family: 'design', label: 'MATRIX',     pattern: 'matrix', desc: 'Gerasterte Lamellenstruktur.', table: 'design2' },
  millerighe: { family: 'design', label: 'MILLERIGHE', pattern: 'ribs',   pitch: .012, desc: 'Feinste Rillen, 12 mm.', table: 'design2' },
  ondule:     { family: 'design', label: 'ONDULÉ',     pattern: 'wave',   desc: 'Gewellte Oberfläche, Radius 10 mm.', table: 'design2' },
  plisse:     { family: 'design', label: 'PLISSÉ',     pattern: 'plisse', desc: 'Plissee-Falten, nur lackiert.', table: 'design2', lacquerOnly: true, sectors: ['A0', 'A'] },
  intreccio:  { family: 'design', label: 'INTRECCIO',  pattern: 'weave',  desc: 'Geflochtene Struktur, nur lackiert.', table: 'design2', lacquerOnly: true, sectors: ['A0', 'A'] },
  // ---- Materia (S. 22): Sandstein-Matte auf Meeresholz
  belgium:     { family: 'materia', label: 'BELGIUM',      pattern: 'slab', stone: 'belgium',     desc: 'Sandstein, hellgrau.', table: 'materia', maxH: 2830 },
  greece:      { family: 'materia', label: 'GREECE',       pattern: 'slab', stone: 'greece',      desc: 'Sandstein, anthrazit.', table: 'materia', maxH: 2830 },
  india:       { family: 'materia', label: 'INDIA',        pattern: 'slab', stone: 'india',       desc: 'Sandstein, ocker-rost.', table: 'materia', maxH: 2830 },
  southafrica: { family: 'materia', label: 'SOUTH AFRICA', pattern: 'slab', stone: 'southafrica', desc: 'Sandstein, creme-weiß.', table: 'materia', maxH: 2830 },
  // ---- Japanese Mood (S. 23)
  sugi:     { family: 'japan', label: 'SUGI',      pattern: 'vboard', pitch: .14, wood: 'sugi',     desc: 'Verkohlte Fichtenbretter, weiß pigmentiert versiegelt.', table: 'japan' },
  wabisabi: { family: 'japan', label: 'WABI SABI', pattern: 'vboard', pitch: .14, wood: 'wabisabi', desc: 'Gealterte Fichtenbretter, hydro-geölt.', table: 'japan' },
  // ---- Sektionaltor SR / SL (Silvelox Produktseiten)
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
  b_liscio:    { family: 'basculap', label: 'Liscio',    pattern: 'flat',    desc: 'Glatt.' },
  b_multidoga: { family: 'basculap', label: 'Multidoga', pattern: 'hboard',  pitch: .07, desc: 'Horizontale Bretteroptik.' },
  b_bidoga:    { family: 'basculap', label: 'Bidoga',    pattern: 'hgroove', pitch: .25, desc: 'Zweiteilige Felder.' },
  b_veneziana: { family: 'basculap', label: 'Veneziana', pattern: 'ribs',    pitch: .03, desc: 'Feine horizontale Lamellen.', horizontal: true },
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
// Imprägnierungen (Standardfarben, 12 Jahre Garantie) auf Okoumé-Basis: Zielfarbe aus der Silvelox-Farbkarte
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
export const SURCHARGES = { metalskin_m2: 254, ral_special: 399, wallconcept_m2: { linee: 712, design: 712, japan: 1476, metal: 1313 } };

/* Sektor aus Außenmaß Rahmen (Preisliste S. 16, ausschwenkend, Standard). Außerhalb des abgebildeten Rasters: Preis auf Anfrage. */
export function sector(w, h) {
  if (h <= 2280 && w <= 2670) return 'A0';
  if (h <= 2580 && w <= 3270) return 'A';
  if (h <= 2580 && w <= 3770) return 'C';
  if (h <= 2580 && w <= 3970) return 'E';
  return null;
}
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
  { id: 'vip7016', label: 'VIP Anthrazit', patch: { type: 'secur', model: 'vip', essence: 'okoume', surface: 'paint', color: '7016' } },
  { id: 'oldoak', label: 'OLD Eiche', patch: { type: 'secur', model: 'old', essence: 'oak', surface: 'natural', color: 'oak' } },
  { id: 'slotlarch', label: 'SLOT Lärche', patch: { type: 'secur', model: 'slot', essence: 'larch_br', surface: 'natural', color: 'larch_br' } },
  { id: 'sugi', label: 'SUGI schwarz', patch: { type: 'secur', model: 'sugi' } },
  { id: 'greece', label: 'Materia Greece', patch: { type: 'secur', model: 'greece' } },
  { id: 'srwhite', label: 'SR Piana Weiß', patch: { type: 'sr', model: 'sr_piana', essence: 'okoume', surface: 'paint', color: '9016' } },
];
