// Quelle: Hersteller-Preisliste Stahl-Sektionaltore Rev. 2635, gültig ab 14.09.2026
// Alle Preise in EUR als Listenpreis vor Rabatt, wie in der Preisliste ausgewiesen.
// Felder, für die die Liste keinen Wert nennt, fehlen bewusst.

export const META = {
  listName: 'Preisliste Rev. 2635',
  validFrom: '2026-09-14',
  priceBasis: 'Listenpreis laut Preisliste, vor Rabatt',
};

export const PANEL = {
  thickness: 40,
  fill: 'PUR',
  facts: [
    'Torblatt: 40 mm starkes Paneel aus beidseitig verzinktem Stahlblech, gefüllt mit Polyurethan-Schaum (PUR)',
    'Design laut aktuellem Paneelangebot',
    'Vertikale und horizontale Schienen aus 1,5 mm starken verzinkten Profilen',
    'Lackierte Torsionsfedern für 20 000 Bewegungszyklen, Zugfedern (EXT) für 25 000 Bewegungszyklen',
    'Laufrollen mit Kugellagern, Scharniere, Lagerkonsolen, Seiltrommeln, Seile und Verbindungsmaterial',
    'Serie: Federbruchsicherung',
    'Serie: Abhängen der horizontalen Schienen',
    'Serie: Querverbindung am Schienenende (C-Profil)',
    'Serie: Geteilte Welle mit Wellenkupplung (W > 3500 mm)',
    'Serie: Einseitiger Handgriff, Kunststoff',
    'Serie: Versteifungsprofil 65 mm, 1 Stk. (W > 4500 mm)',
    'Serie: Lackierte Endkassetten',
    'Serie: Lackierte Leiste unten und oben',
    'Serie: Lackierte Leisten der Schlupftür',
    'Serie: Lackierte Leisten der Blende',
    'Auf lackiertem Tor werden das Boden- und das obere Aluminiumprofil automatisch mitlackiert',
  ],
  optionsAtSurcharge: ['Lackierung', 'Fenster', 'Handgriffe, Klinken, Schlösser', 'Schlupftür', 'Schubriegel', 'Alu-Glas-Sektionen (FVE)', 'EXT Verkleidungsbleche "J" und "L"'],
};

// grid: 'std' = Preistabelle Seite 3, 'ext' = Preistabelle Seite 4
export const HARDWARE = [
  { id: 'EXT', label: 'EXT: Zugfedern in den senkrechten Zargen', headroom: '0-125 mm', headroomMin: 0, headroomMax: 125, sideRoom: '0-95 mm', sideRoomMin: 0, sideRoomMax: 95, grid: 'ext' },
  { id: 'LHR-C', label: 'LHR-C: Torsionsfedern hinten', headroom: '100-125 mm', headroomMin: 100, headroomMax: 125, sideRoom: '90 mm', sideRoomMin: 90, grid: 'std', surcharge: 69 },
  { id: 'LHF-C', label: 'LHF-C: Torsionsfedern vorne', headroom: '200 mm', headroomMin: 200, sideRoom: '90 mm', sideRoomMin: 90, grid: 'std' },
  { id: 'SL420', label: 'SL 420: Torsionsfedern vorne', headroom: '420 mm', headroomMin: 420, sideRoom: '125 mm', sideRoomMin: 125, grid: 'std' },
  { id: 'SL350', label: 'SL 350: Torsionsfedern vorne', headroom: '350 mm', headroomMin: 350, sideRoom: '125 mm', sideRoomMin: 125, grid: 'std' },
];

// Preistabelle Seite 3: Beschlagstypen LHF-C, SL 350, SL 420.
// Preise je Breite ab 2000 mm; rechts leere Zellen (nicht lieferbar laut Tabelle) sind null.
export const GRID_STD = {
  widths: [2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 4750, 5000, 5250, 5500],
  rows: [
    {h: 3000, prices: [1305, 1383, 1450, 1547, 1645, 1800, 1882, 1941, 2050, 2245, 2353, null, null, null, null], sections: 5},
    {h: 2960, prices: [1294, 1364, 1426, 1532, 1642, 1782, 1862, 1915, 2018, 2208, 2320, null, null, null, null], sections: 5},
    {h: 2850, prices: [1290, 1362, 1421, 1515, 1598, 1781, 1853, 1913, 2037, 2176, 2286, 2453, null, null, null], sections: 5},
    {h: 2740, prices: [1261, 1333, 1389, 1477, 1558, 1732, 1822, 1885, 1988, 2147, 2257, 2415, 2510, null, null], sections: 5},
    {h: 2630, prices: [1236, 1318, 1366, 1443, 1539, 1717, 1782, 1857, 1954, 2138, 2196, 2380, 2467, 2601, null], sections: 5},
    {h: 2520, prices: [1204, 1274, 1325, 1401, 1494, 1661, 1733, 1808, 1887, 2059, 2137, 2276, 2380, 2533, 2593], sections: 5},
    {h: 2460, prices: [1143, 1205, 1260, 1333, 1409, 1570, 1645, 1715, 1807, 1950, 2046, 2128, 2224, 2408, 2466], sections: 4},
    {h: 2350, prices: [1122, 1176, 1231, 1304, 1383, 1541, 1597, 1659, 1746, 1912, 1987, 2053, 2154, 2305, 2360], sections: 4},
    {h: 2240, prices: [1094, 1156, 1200, 1265, 1341, 1501, 1551, 1603, 1708, 1851, 1891, 2008, 2081, 2225, 2308], sections: 4},
    {h: 2130, prices: [1074, 1124, 1180, 1248, 1318, 1457, 1523, 1567, 1660, 1769, 1858, 1968, 2041, 2169, 2244], sections: 4},
    {h: 2020, prices: [1051, 1097, 1146, 1209, 1278, 1418, 1475, 1525, 1616, 1721, 1801, 1902, 1966, 2114, 2183], sections: 4}
  ],
};
export const springPreassembly = 32; // Vormontierung der Federwelle

// Preistabelle Seite 4: Beschlagstyp EXT. Leere Zellen laut Tabelle sind null.
// renovation: true = "Renovierungssets in RAL 9016 lackiert" (Höhe mit * in der Liste)
export const GRID_EXT = {
  widths: [2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000],
  rows: [
    {h: 2625, prices: [null, 1316, 1398, 1469, 1566, null, null, null], sections: 5},
    {h: 2500, prices: [1188, 1269, 1352, 1439, 1550, 1617, null, null], sections: 5},
    {h: 2375, prices: [1076, 1164, 1240, 1303, 1422, 1475, 1544, 1595], sections: 4},
    {h: 2250, prices: [1045, 1136, 1207, 1270, 1373, 1441, 1503, 1555], sections: 4},
    {h: 2125, prices: [1020, 1088, 1179, 1241, 1340, 1389, 1468, 1495], sections: 4},
    {h: 2080, prices: [1003, 1074, 1153, 1226, 1322, 1372, 1439, 1468], sections: 4, renovation: true},
    {h: 2000, prices: [976, 1052, 1122, 1203, 1303, 1353, 1414, 1444], sections: 4},
    {h: 1955, prices: [970, 1043, 1106, 1184, 1282, 1326, 1393, 1430], sections: 4, renovation: true},
    {h: 1875, prices: [959, 1025, 1087, 1159, 1253, 1303, 1373, 1414], sections: 4}
  ],
};

// Zuschläge je FVE-Sektion (Alurahmensektion), Seite 6 (ohne thermische Trennung)
// und Seite 7 (mit thermischer Trennung), jeweils für Breiten 2250..5500.
// artNo = Art.-Nr. der Preisliste.
export const GLAZING_WIDTHS = [2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 4750, 5000, 5250, 5500];
export const GLAZING = [
  {"id": "einfach-pmma", "artNo": "220", "label": "Einfachverglasung PMMA", "spec": "1×2,5 mm PMMA", "perWidth": [157, 160, 177, 180, 206, 208, 211, 226, 239, 242, 328, 338, 417, 420]},
  {"id": "einfach-polycarbonat", "artNo": "230", "label": "Einfachverglasung Polycarbonat", "spec": "1×3,0 mm Polycarbonat", "perWidth": [245, 250, 283, 290, 332, 338, 355, 380, 405, 413, 511, 527, 617, 624]},
  {"id": "einfach-glas", "artNo": "240", "label": "Einfachverglasung gehärtetes Glas", "spec": "1×4,0 mm gehärtetes Glas", "perWidth": [264, 283, 317, 336, 374, 393, 418, 447, 476, 495, 566, 580, 647, 666]},
  {"id": "doppelt-pmma", "artNo": "250", "label": "Doppelverglasung PMMA eloxiert", "spec": "2×2,5 mm PMMA", "perWidth": [200, 205, 229, 235, 271, 276, 289, 308, 329, 333, 419, 427, 507, 511], "perWidthThermal": [341, 349, 382, 388, 455, 463, 478, 504, 543, 549, 662, 677, 793, 801]},
  {"id": "doppelt-pmma-kratzfest-1x", "artNo": "251", "label": "Doppelverglasung PMMA kratzfest (1× Anti-Scratch)", "spec": "2×2,5 mm PMMA, 1× Anti-Scratch", "perWidth": [240, 249, 280, 290, 330, 339, 357, 381, 407, 417, 507, 517, 600, 611], "perWidthThermal": [388, 401, 440, 451, 525, 537, 557, 590, 634, 645, 765, 782, 905, 916]},
  {"id": "doppelt-pmma-kratzfest-2x", "artNo": "252", "label": "Doppelverglasung PMMA kratzfest (2× Anti-Scratch)", "spec": "2×2,5 mm PMMA, 2× Anti-Scratch", "perWidth": [280, 295, 330, 344, 388, 404, 426, 455, 486, 500, 594, 607, 695, 710], "perWidthThermal": [435, 453, 497, 516, 594, 611, 638, 675, 726, 743, 867, 886, 1015, 1033]},
  {"id": "doppelt-pmma-farbe", "artNo": "250.C", "label": "Doppelverglasung PMMA mit Farbscheiben", "spec": "2×2,5 mm PMMA", "perWidth": [259, 270, 302, 314, 357, 369, 388, 414, 442, 455, 546, 558, 644, 655], "perWidthThermal": [409, 425, 465, 480, 556, 571, 594, 628, 675, 690, 811, 828, 953, 969]},
  {"id": "doppelt-polycarbonat", "artNo": "260", "label": "Doppelverglasung Polycarbonat", "spec": "2×3,0 mm Polycarbonat", "perWidth": [315, 333, 372, 391, 441, 460, 487, 518, 553, 572, 672, 686, 778, 797], "perWidthThermal": [476, 498, 548, 570, 654, 676, 708, 750, 805, 827, 956, 978, 1110, 1133]},
  {"id": "alu-stucco", "artNo": "270", "label": "Isolierte Aluminium-Füllung stucco", "spec": "2×0,6 mm stucco Alu-Blech + 20 mm Styropor", "perWidth": [276, 290, 324, 338, 384, 398, 419, 446, 477, 491, 585, 598, 686, 700], "perWidthThermal": [430, 447, 492, 509, 586, 604, 629, 666, 715, 733, 857, 876, 1002, 1020]},
  {"id": "streckgitter-16-8", "artNo": "280", "label": "Streckgitter Lochgröße 16/8", "spec": "Alu-Streckmetall, Lochgröße 16/8", "perWidth": [149, 152, 166, 170, 193, 197, 205, 212, 222, 228, 310, 321, 397, 401]},
  {"id": "streckgitter-22-12", "artNo": "281", "label": "Streckgitter Lochgröße 22/12", "spec": "Alu-Streckmetall, Lochgröße 22/12", "perWidth": [149, 152, 166, 170, 193, 197, 205, 212, 222, 228, 310, 321, 397, 401]},
  {"id": "lochblech-10-10", "artNo": "282", "label": "Lochblech 10×10 mm", "spec": "Lochblech 10×10 mm", "perWidth": [191, 193, 218, 222, 253, 257, 261, 281, 298, 316, 391, 404, 490, 503]}
];

export const SURCHARGES = {
  panelDB703: 0.05,          // Anteil vom Grundpreis
  panelWoodLook: 0.15,       // Holzimitation, Anteil vom Grundpreis
  paintRalPerM2PerSide: 38,  // RAL oder NCS, je m² und Seite
  paintPearlPerM2: 106,      // Perlfarbe RAL, je m² und Seite
  paintRal9006_9007PerM2: 43,
  paintSandStructurePerM2: 43, // feine/grobe Sandstruktur
  pedestrianDoor: 935,       // Schlupftür inkl. Schloss, Drücker/Drücker, Türschließer mit Gleitarm
  pedestrianLowThreshold18: 220, // Extra-Niedrigschwelle 18 mm, nur W <= 5000 mm
  pedestrianLowThreshold80: 220, // Niedrigschwelle 80 mm, nur W <= 5000 mm
  ventGrillePlastic: 33,     // Lüftungsgitter Kunststoff, verschließbar
  springs: { 20000: 0, 25000: 77, 50000: 154, 100000: 410 }, // je Paar; 50 000 und 100 000: technische Machbarkeit klären
  stiffening65PerM: 12,      // Versteifungsprofil 65 mm je m Breite, nur W <= 4500 mm
  doubleHingesPerSection: 22, // nur W <= 5000 mm
  fasciaPerM: { h250: 76, h620: 94 }, // Blende je m Breite, max. W 8000 mm (h250: H <= 250 mm; h620: 250 < H < 620 mm)
  fveFasciaPerM: 176,        // FVE-Blende 250 < H < 620 mm, max. W 7000 mm
  extSeal: { verticalPerM: 14, topPerM: 7 }, // Dichtung EXT mit thermischer Trennung, je m Höhe bzw. Breite
  sideRoomKit95: 45,         // Kit für seitlichen Anschlag unter 95 mm
  panelCutCustom: 100,       // Torblattaufteilung nach Wahl, je Tor
  panelCutCustomExtraPiece: { perDoor: 100, perMWidth: 53 }, // mit zusätzlichem Paneelstück: 100 je Tor + 53 je lfd. m Torbreite
  bigManual: 12,
  manualStopperPair: 10,
  changeAfterOrder: 100,     // je Position
  sealBottomWithChamber: 10, // Bodengummi mit Innenkammer für Optoleiste, je m Breite
  sealTopDouble: 10,         // doppelte obere Dichtung (nur LHF, LHR, SL), je m Breite
  paintFveGlazingBeadPerM: 10,
  paintVentFillingPerSection: 76,
  paintBottomTopStripPerM: 19,
  paintFasciaStripsPerM: 19,
  paintGuideRal9016PerM: 56,
  packaging: { woodSides: 119, twoMan: 112, container: 255, ispm15: 35 },
};

// Abdeckbleche und Sturzblende (Seite 11): standardPrice = RAL 9010, ralPrice = Lackierung RAL nach Wahl
export const coverSheets = [
  { id: 'L-low', label: 'Alu-Verkleidungsblech "L", Allgemeine Höhe 1875; 2000; 2125 mm', standardPrice: 97, ralPrice: 152, unit: 'Paar' },
  { id: 'L-high', label: 'Alu-Verkleidungsblech "L", Allgemeine Höhe 2250; 2375; 2500; 2625 mm', standardPrice: 101, ralPrice: 141, unit: 'Paar' },
  { id: 'J-low', label: 'Alu-Verkleidungsblech "J", Allgemeine Höhe 1875; 2000; 2125 mm', standardPrice: 90, ralPrice: 117, unit: 'Paar' },
  { id: 'J-high', label: 'Alu-Verkleidungsblech "J", Allgemeine Höhe 2250; 2375; 2500; 2625 mm', standardPrice: 156, ralPrice: 204, unit: 'Paar' },
  { id: 'L-top-2225', label: 'Decksturzprofil "L", Breite bis 2225 mm', standardPrice: 51, ralPrice: 66, unit: 'Stk.' },
  { id: 'L-top-2725', label: 'Decksturzprofil "L", Breite 2226 bis 2725 mm', standardPrice: 76, ralPrice: 99, unit: 'Stk.' },
  { id: 'L-top-3000', label: 'Decksturzprofil "L", Breite 2726 bis 3000 mm', standardPrice: 91, ralPrice: 119, unit: 'Stk.' },
  { id: 'L-top-3001', label: 'Decksturzprofil "L", Breite ab 3001 mm', standardPrice: 102, ralPrice: 129, unit: 'Stk.' },
  { id: 'fascia', label: 'Sturzblende', standardPrice: 0, ralPrice: 21, unit: 'pro Meter Breite', note: 'Standard im Grundpreis' },
];

// Fenster (Seiten 13-14). Maße in mm als [Breite, Höhe]; Preise je Fenster.
export const WINDOWS = [
  { code: '205', label: 'Rechteckig CLICK', price: 67, artNo: 'T09-010-40-0095', frame: 'schwarz, glatt', glazing: 'klar, doppelt, PMMA', click: true, outer: [680, 373], inner: [605, 298], img: 'guardy-window-205.png' },
  { code: '203', label: 'Oval CLICK', price: 69, artNo: 'T09-010-40-0001', frame: 'schwarz, glatt', glazing: 'klar, doppelt, PMMA', click: true, shape: 'oval', outer: [663, 343], inner: [580, 265], img: 'guardy-window-203.png' },
  { code: '207', label: 'Rechteckig 2', price: 91, artNo: 'T09-010-40-0087', frame: 'schwarz, glatt', glazing: 'klar, doppelt, PMMA', outer: [609, 146], inner: [540, 85], img: 'guardy-window-207.png' },
  { code: '204', label: 'Rechteckig 3', price: 71, artNo: 'T09-010-40-0072', frame: 'weiß, Holzmaserung', glazing: 'klar, doppelt, PMMA', outer: [490, 325], inner: [430, 260], img: 'guardy-window-204.png' },
  { code: '206', label: 'Rechteckig 4', price: 84, artNo: 'T09-010-40-0073', frame: 'weiß, Holzmaserung', glazing: 'Satin, PMMA', outer: [490, 325], inner: [430, 260], img: 'guardy-window-206.png' },
  { code: '208', label: 'Rechteckig 5', price: 71, artNo: 'T09-010-40-0088', frame: 'braun, Holzmaserung', glazing: 'klar, doppelt, PMMA', outer: [490, 325], inner: [430, 260], img: 'guardy-window-208.png' },
  { code: '216', label: 'Rechteckig 9', price: 80, artNo: 'T09-010-40-0053', frame: 'silbern, glatt', glazing: 'klar, doppelt, PMMA', outer: [637, 334], inner: [550, 247], img: 'guardy-window-216.png' },
  { code: '210', label: 'Rechteckig 7', price: 70, artNo: 'T09-010-40-0074', frame: 'schwarz, Holzmaserung', glazing: 'klar, doppelt, PMMA', outer: [490, 325], inner: [430, 260], img: 'guardy-window-210.png' },
  { code: '218', label: 'Rechteckig Edelstahl', price: 233, artNo: 'T09-010-40-0071', frame: 'Edelstahl', glazing: 'klar, doppelt, PMMA', outer: [230, 230], inner: [150, 150], img: 'guardy-window-218.png' },
  { code: '215', label: 'Rund Edelstahl', price: 262, artNo: 'T09-010-40-0070', frame: 'Edelstahl', glazing: 'klar, einfach, Sicherheitsglas', shape: 'round', outer: [330, 330], inner: [260, 260], img: 'guardy-window-215.png' },
  { code: '217', label: 'Rund', price: 102, artNo: 'T09-010-40-0010', frame: 'schwarz, glatt', glazing: 'klar, doppelt, PMMA', shape: 'round', outer: [330, 330], inner: [260, 260], img: 'guardy-window-217.png' },
  // Innenmaß steht in der Liste so gedruckt (230 x 30 mm), vermutlich Druckfehler; hier unverändert übernommen.
  { code: '219', label: 'Rechteckig Edelstahl', price: 341, artNo: 'T09-010-40-0069', frame: 'Edelstahl', glazing: 'klar, doppelt, PMMA', outer: [310, 310], inner: [230, 30], innerAsPrinted: true, img: 'guardy-window-219.png' },
];

// Schlupftür-Schlösser (Seiten 15-16). Preis = Aufpreis zur Standardkonfiguration KL01.
export const LOCKS_PEDESTRIAN = [
  { code: 'KL01', label: 'Drücker/Drücker, Standardkonfiguration', price: 0, outside: 'Drücker, Langschild', inside: 'Drücker, Langschild', note: 'Einsteckschloss, Schließzylinder mit 3 Schlüsseln' },
  { code: 'KL02', label: 'Festgriff/Drücker', price: 51, outside: 'Festgriff, Langschild', inside: 'Drücker, Langschild', note: 'Einsteckschloss, Schließzylinder mit 3 Schlüsseln. Von außen nur mit Schlüssel zu öffnen, von innen mit Drücker, falls nicht gesperrt' },
  { code: 'KL03', label: 'Drücker/Drücker mit Schließzylinder und Knopf', price: 67, outside: 'Drücker, Langschild', inside: 'Drücker, Langschild, Drehknopf', note: 'Einsteckschloss, Schließzylinder mit 3 Schlüsseln. Von innen durch Knopfdrehen zu sperren, von außen standardmäßig mit Schlüssel' },
  { code: 'KL04', label: 'Festgriff/Drücker mit Schließzylinder und Knopf', price: 78, outside: 'Festgriff, Langschild', inside: 'Drücker, Langschild, Drehknopf', note: 'Einsteckschloss, Schließzylinder mit 3 Schlüsseln. Von außen nur mit Schlüssel zu öffnen, von innen durch Knopfdrehen zu sperren' },
  { code: 'KL05', label: 'Panikschloss Drücker/Drücker', price: 165, outside: 'Drücker, Langschild', inside: 'Drücker, Langschild', note: 'Panikschloss Funktion D, Schließzylinder mit Freilauf, 3 Schlüssel. Von innen jederzeit mit Drücker zu öffnen' },
  { code: 'KL06', label: 'Panikschloss Festgriff/Drücker', price: 192, outside: 'Festgriff, Langschild', inside: 'Drücker, Langschild', note: 'Panikschloss Funktion E, Schließzylinder mit Freilauf, 3 Schlüssel. Von innen jederzeit mit Drücker zu öffnen' },
  { code: 'KL13', label: 'Panikschlossbeschlag Drücker/Stangengriff', price: 250, outside: 'Drücker, Langschild', inside: 'Stangengriff', note: 'Panikschloss Funktion D, Schließzylinder mit Freilauf, 3 Schlüssel. Durchfahrtslichte bei geöffnetem Tor mit Niedrigsturzbeschlag (LL): H - 40 mm' },
  { code: 'KL14', label: 'Panikschlossbeschlag Festgriff/Stangengriff', price: 300, outside: 'Festgriff, Langschild', inside: 'Stangengriff', note: 'Panikschloss Funktion E, Schließzylinder mit Freilauf, 3 Schlüssel. Von außen nur mit Schlüssel. Durchfahrtslichte bei geöffnetem Tor mit Niedrigsturzbeschlag (LL): H - 40 mm' },
  { code: 'KL17', label: 'Panikschloss Drücker/Drücker', price: 563, outside: 'Drücker, Langschild', inside: 'Drücker, Langschild', note: 'Panikschloss Funktion B, Schließzylinder mit Freilauf, 3 Schlüssel. Schlüsseldrehung von außen setzt das Schloss in den Daueröffnungszustand' },
  { code: 'KL18', label: 'Panikschlossbeschlag Drücker/Stangengriff', price: 710, outside: 'Drücker, Langschild', inside: 'Stangengriff', note: 'Panikschloss Funktion B, Schließzylinder mit Freilauf, 3 Schlüssel. Schlüsseldrehung von außen setzt das Schloss in den Daueröffnungszustand' },
  { code: 'BEFO2421', label: 'E-Öffner BEFO 2421', price: 300, artNo: 'T09-040-65-0107', note: 'Geeignet für Schlupftür, inkl. Einbau und Verkabelung, Spannung 24 V DC/AC' },
];

// Schubriegel und Zylinderschlösser am Torblatt (Seiten 17-18)
export const LOCKS_DOOR = [
  { code: '490', label: 'Schubriegel', price: 9, artNo: 'T09-040-65-0095', note: 'Verzinkt. Für FVE-Sektionen nicht empfohlen', positions: ['links', 'rechts', 'links + rechts'] },
  { code: '491', label: 'Schubriegel', price: 9, artNo: 'T09-040-65-0025', note: 'Verzinkt. Für FVE-Sektionen nicht empfohlen', positions: ['links', 'rechts', 'links + rechts'] },
  { code: '492B', label: 'Zylinderschloss', price: 184, artNo: 'T09-040-65-0079', note: 'Schwarz. Beidseitig bis W = 2500 mm; bei W > 2500 mm (bis 5000 mm) lange Schubriegel verwenden oder Schloss nur links oder rechts. Bei FVE-Sektionen und bei EXT nicht anwendbar. Min. Sturzhöhe 105 mm', positions: ['links', 'rechts', 'Mitte'], notForFve: true, notForExt: true },
  { code: '493B', label: 'Zylinderschloss', price: 171, artNo: 'T09-040-65-0081', note: 'Schwarz. Beidseitig bis W = 2500 mm, darüber nur einseitig. Nicht bei FVE-Sektionen, nur für SL. Min. Sturzhöhe 105 mm', positions: ['links', 'rechts', 'Mitte'], notForFve: true, onlySL: true },
  { code: '495', label: 'Zylinderschloss', price: 118, artNo: 'T09-005-0062', note: 'Schwarz. Bei FVE-Sektionen nicht anwendbar', positions: ['links', 'rechts'], notForFve: true },
  { code: '497B', label: 'Zylinderschloss', price: 150, artNo: 'T09-040-65-0028', note: 'Außen- und Innenseite schwarz, versenkter Griff außen. Bei FVE-Sektionen nicht anwendbar', positions: ['links', 'rechts', 'links + rechts'], notForFve: true },
  { code: '498', label: 'Zylinderschloss', price: 137, artNo: 'T09-040-65-0023', note: 'Schwarz. Bei FVE-Sektionen nicht anwendbar', positions: ['links', 'rechts', 'links + rechts'], notForFve: true },
  { code: '499B', label: 'Zylinderschloss', price: 204, artNo: 'T09-005-0064', note: 'Außenseite schwarz, Innenseite silbern, versenkter Griff außen. Bei FVE-Sektionen nicht anwendbar', positions: ['links', 'rechts', 'Mitte', 'links + rechts'], notForFve: true },
  { code: '499S', label: 'Zylinderschloss', price: 204, artNo: 'T09-005-0065', note: 'Außen- und Innenseite silbern, versenkter Griff außen. Bei FVE-Sektionen nicht anwendbar', positions: ['links', 'rechts', 'Mitte', 'links + rechts'], notForFve: true },
  { code: '492B-rod', label: 'Schlossstange zu 492B', price: 20, artNo: 'T09-040-65-0083', note: 'Zusätzliche Stange zum 492B, bei breiten Toren (W = 2500-5000 mm) und/oder exzentrischer Schlossposition. Verzinkter Stahl, 0,5 kg, L = 2450 mm', unit: 'Stk.' },
  { code: '499-rod', label: 'Schlossstange zu 499B und 499S', price: 20, artNo: 'T09-040-65-0143', note: 'Zusätzliche Stange zum 499B und 499S, bei breiten Toren (W = 2500-5000 mm) und/oder exzentrischer Schlossposition. Verzinkter Stahl, 0,5 kg, L = 1200-2350 mm', unit: 'Stk.' },
];

// Handgriffe (Seite 19)
export const HANDLES = [
  { code: '466', label: 'Handgriff einseitig', price: 3, includedPieces: 1, artNo: 'T09-040-65-0088', description: 'Gerundet, schwarz, Kunststoff. Wird separat im Karton geliefert. 1 Stk. ist im Grundpreis enthalten', positions: ['links', 'rechts', 'Mitte'], img: 'guardy-handle-466.png' },
  { code: '460', label: 'Handgriff beidseitig', price: 12, artNo: 'T09-040-65-0009', description: 'Schwarz, Kunststoff. Im Paneel vorgerichtete Bohröffnung. Nicht bei FVE-Sektionen', positions: ['links', 'rechts', 'Mitte', 'links + rechts'], img: 'guardy-handle-460.png' },
  { code: '463', label: 'Handgriff beidseitig', price: 20, artNo: 'T09-040-65-0106', description: 'Viereckig, schwarz, Kunststoff. Im Paneel eingebaut. Nicht bei FVE-Sektionen', positions: ['links', 'rechts', 'Mitte', 'links + rechts'], img: 'guardy-handle-463.png' },
  { code: '467', label: 'Handgriff beidseitig', price: 6, artNo: 'T09-040-70-0143', description: 'Gerundet, schwarz, Kunststoff. Wird separat im Karton geliefert', positions: ['links', 'rechts', 'Mitte'], img: 'guardy-handle-467.png' },
  { code: '468', label: 'Handgriff beidseitig', price: 37, artNo: 'T09-040-65-0087', description: 'Oval, schwarz, Kunststoff. Im Paneel vorgesehene Bohröffnung. Nicht bei FVE-Sektionen', positions: ['links', 'rechts', 'Mitte', 'links + rechts'], img: 'guardy-handle-468.png' },
  { code: '469B', label: 'Handgriff beidseitig', price: 40, artNo: 'T09-040-65-0141', description: 'Rund, Aluminium schwarz lackiert. Im Paneel vorgesehene Bohröffnung. Nicht bei FVE-Sektionen', positions: ['links', 'rechts', 'Mitte', 'links + rechts'], img: 'guardy-handle-469b.png' },
];

// Antriebe (Seiten 20, 24, 26). force = Zugkraft; maxArea in m², maxWeight in kg, maxH in mm.
export const DRIVES = [
  { id: 'WB800-ZS30', family: 'tormatic', label: 'Antrieb WB800 mit Zahnriemenschiene ZS30', price: 376, artNo: 'T09-051-10-0045', force: '800 N', voltage: '230 V', remotes: '2 Stk. 3-Kanal-Handsender, 868 MHz', maxH: 2375, img: 'guardy-drive-wb800.png' },
  { id: 'WB800-ZS40', family: 'tormatic', label: 'Antrieb WB800 mit Zahnriemenschiene ZS40', price: 395, artNo: 'T09-051-10-0046', force: '800 N', voltage: '230 V', remotes: '2 Stk. 3-Kanal-Handsender, 868 MHz', maxH: 3000, img: 'guardy-drive-wb800.png' },
  { id: 'BLACK1200-ZS30', family: 'tormatic', label: 'Antrieb BLACK 1200 mit Zahnriemenschiene ZS30', price: 876, artNo: 'T09-051-10-0042', force: '1000-1200 N', remotes: '2 Stk. 3-Kanal-Handsender, 433 MHz', maxH: 2375, note: 'Für Sammelgaragen (bis 50 Einstellplätze), automatischer Rücklauf, Anschluss für Ampelsteuerung des Verkehrs in beiden Richtungen möglich', img: 'guardy-drive-black1200.png' },
  { id: 'BLACK1200-ZS40', family: 'tormatic', label: 'Antrieb BLACK 1200 mit Zahnriemenschiene ZS40', price: 943, artNo: 'T09-051-10-0043', force: '1000-1200 N', remotes: '2 Stk. 3-Kanal-Handsender, 433 MHz', maxH: 3000, note: 'Für Sammelgaragen (bis 50 Einstellplätze), automatischer Rücklauf, Anschluss für Ampelsteuerung des Verkehrs in beiden Richtungen möglich', img: 'guardy-drive-black1200.png' },
  { id: 'CUBE1100-4000', family: 'cube', label: 'Antrieb Cube 1100N mit Führungsschiene 4000 mm', price: 297, artNo: 'T09-050-14-0002', force: '1100 N', voltage: '230 V', maxArea: 11, railLength: 4000, remotes: '2 Stk. Handsender, 868 MHz', maxH: 3000, img: 'guardy-drive-cube-1100n.png' },
  // Schienenlänge laut Liste "35000mm" gedruckt (vermutlich 3500 mm), deshalb hier nicht angegeben.
  { id: 'CUBE1100-2500', family: 'cube', label: 'Antrieb Cube 1100N, kurze Führungsschiene', price: 284, artNo: 'T09-050-14-0001', force: '1100 N', voltage: '230 V', maxArea: 11, remotes: '2 Stk. Handsender, 868 MHz', maxH: 2500, img: 'guardy-drive-cube-1100n.png' },
  { id: 'COMFORT260', family: 'marantec', label: 'Antrieb Comfort 260 Speed', price: 279, artNo: 'T09-051-20-0001', force: '650 N', voltage: '230 V', maxArea: 9, remotes: '1 Stk. 2-Kanal-Handsender', img: 'guardy-drive-comfort-260.png' },
  { id: 'COMFORT270', family: 'marantec', label: 'Antrieb Comfort 270 Speed', price: 314, artNo: 'T09-051-20-0002', force: '850 N', voltage: '230 V', maxArea: 14, remotes: '1 Stk. 2-Kanal-Handsender', img: 'guardy-drive-comfort-270.png' },
  { id: 'COMFORT280', family: 'marantec', label: 'Antrieb Comfort 280', price: 320, artNo: 'T09-051-20-0003', force: '1000 N', voltage: '230 V', maxWeight: 200, remotes: '1 Stk. 2-Kanal-Handsender', img: 'guardy-drive-comfort-280.png' },
];

// Führungsschienen (Seiten 23, 26). Für die Comfort-Antriebe (Marantec).
export const DRIVE_RAILS = [
  { id: 'SZ11', family: 'marantec', label: 'Führungsschiene mit Zahnriemen SZ11', price: 108, artNo: 'T09-051-20-0010', length: 3080, maxH: 2250 },
  { id: 'SZ12', family: 'marantec', label: 'Führungsschiene mit Zahnriemen SZ12', price: 125, artNo: 'T09-051-20-0011', length: 3330, maxH: 2500 },
  { id: 'SZ13', family: 'marantec', label: 'Führungsschiene mit Zahnriemen SZ13', price: 158, artNo: 'T09-051-20-0012', length: 4090, maxH: 3000 },
  { id: 'ALU-TH-3000', family: 'tormatic', label: 'Aluminium-Laufschiene ALU TH mit integrierter Kettenführung', price: 259, artNo: 'T09-051-10-0018', maxH: 3000 },
  { id: 'ALU-TH-3750', family: 'tormatic', label: 'Aluminium-Laufschiene ALU TH mit integrierter Kettenführung', price: 352, artNo: 'T09-051-10-0017', maxH: 3750 },
  { id: 'ALU-TH-4750', family: 'tormatic', label: 'Aluminium-Laufschiene ALU TH mit integrierter Kettenführung', price: 402, artNo: 'T09-051-10-0015', maxH: 4750 },
];

// Antriebszubehör (Seiten 21-28)
export const ACCESSORIES = [
  { id: 'tm-aussenempfaenger', family: 'tormatic', label: 'Außenempfänger', price: 111, note: 'Empfänger im Gehäuse, 1-Kanal, Relaisausgang, KeeLoq-Wechselcode, 12-24 V. 868 MHz (T09-051-50-0019) oder 433 MHz (T09-051-50-0003)' },
  { id: 'tm-digicode', family: 'tormatic', label: 'Funk-Codetaster DigiCode', price: 154, note: 'Folientastatur, drahtlos, KeeLoq-Wechselcode. 868 MHz (T09-051-50-0020) oder 433 MHz (T09-051-50-0012)' },
  { id: 'tm-duocontrol', family: 'tormatic', label: 'Funk-Codetaster DuoControl', price: 74, note: '2-Kanal-Doppeltaster, drahtlos, KeeLoq-Wechselcode. 868 MHz (T09-051-50-0021) oder 433 MHz (T09-051-50-0014)' },
  { id: 'tm-extern-entriegelung-alu', family: 'tormatic', label: 'Extern-Entriegelung', price: 43, note: 'Externe Notentriegelung für Sektionaltore mit Deckenantrieb, mit Schließzylinder und Kappe, Schleifaluminium (T09-051-40-0006)' },
  { id: 'tm-extern-entriegelung-rund', family: 'tormatic', label: 'Extern-Entriegelung', price: 33, note: 'Externe Notentriegelung für Sektionaltore mit Deckenantrieb, mit rundem Schließzylinder ø 20 mm (T09-051-40-0007)' },
  { id: 'tm-df450', family: 'tormatic', label: 'DF 450 Verlängerte Schubstange für Normalbeschlag SL', price: 22, note: 'T09-051-40-0002' },
  { id: 'tm-lichtschranke', family: 'tormatic', label: 'Lichtschranke', price: 52, note: 'Reichweite 8 m, IP45, 24 V AC/DC, Autotest-Funktion (T09-051-60-0001)' },
  { id: 'tm-handsender', family: 'tormatic', label: 'Handsender', price: 38, note: '3-Kanal, KeeLoq-Wechselcode. 868 MHz (T09-051-50-0024) oder 433 MHz (T09-051-50-0025)' },
  { id: 'tm-kt31-ap', family: 'tormatic', label: 'Schlüsselschalter KT 3/1 AP', price: 51, note: 'Aufputz (T09-051-50-0005)' },
  { id: 'tm-kt31-up', family: 'tormatic', label: 'Schlüsselschalter KT 3/1 UP', price: 51, note: 'Unterputz (T09-051-50-0006)' },
  { id: 'tm-ampelsteuerung', family: 'tormatic', label: 'Ampelsteuerung', price: 548, note: 'Ampelsteuerung des Verkehrs in beiden Richtungen, für BLACK 1200 (T09-051-50-0008)' },
  { id: 'tm-spiralkabel', family: 'tormatic', label: 'Spiralkabel', price: 92, note: 'Spiralkabel 1000/350-900, einschließlich Anschlussdose und Stecker (T09-050-30-0003)' },
  { id: 'tm-ampel-gruen', family: 'tormatic', label: 'Ampel grün', price: 87, note: '230 V/50 Hz (T09-051-40-0004)' },
  { id: 'tm-ampel-rot', family: 'tormatic', label: 'Ampel rot', price: 87, note: '230 V/50 Hz (T09-051-40-0003)' },
  { id: 'cube-handsender', family: 'cube', label: 'Handsender Cube', price: 32, note: '868 MHz, 4-Kanal (T09-050-13-0004)' },
  { id: 'cube-codetaster', family: 'cube', label: 'Funk-Codetaster Cube', price: 67, note: '868 MHz (T09-050-14-0004)' },
  { id: 'cube-funkwandtaster', family: 'cube', label: 'Funkwandtaster 3-Kanal Cube', price: 31, note: '868 MHz, 3-Kanal (T09-050-14-0005)' },
  { id: 'cube-blinklicht', family: 'cube', label: 'Blinklicht Cube', price: 41, note: 'Gelbe Warnleuchte, 12-240 V AC/DC (T09-050-14-0007)' },
  { id: 'cube-fotozellen', family: 'cube', label: 'Fotozellen Cube', price: 66, note: 'Reichweite 15 m (T09-050-14-0006)' },
  { id: 'cube-extern-empfaenger', family: 'cube', label: 'Extern-Empfänger Cube', price: 62, note: '3-Kanal, 868 MHz (T09-050-14-0003)' },
  { id: 'cube-wifi', family: 'cube', label: 'Wifi-Modul Cube', price: 69, note: 'Für Bedienung per App (T09-050-14-0008)' },
  { id: 'mar-codetaster-526', family: 'marantec', label: 'Codetaster Digital 526', price: 85, note: '868 MHz (T09-051-20-0024)' },
  { id: 'mar-duocontrol-520', family: 'marantec', label: 'Codetaster DuoControl Digital 520', price: 43, note: '2-Kanal, 868 MHz (T09-051-20-0023)' },
  { id: 'mar-handsender-506', family: 'marantec', label: 'Handsender Digital 506', price: 75, note: '10-Kanal, 868 MHz (T09-051-20-0022)' },
  { id: 'mar-handsender-564', family: 'marantec', label: 'Handsender Digital 564', price: 45, note: '4-Kanal, 868 MHz (T09-051-20-0021)' },
  { id: 'mar-handsender-572', family: 'marantec', label: 'Handsender Digital 572', price: 43, note: '2-Kanal, 868 MHz (T09-051-20-0020)' },
  { id: 'mar-extern-empfaenger-992', family: 'marantec', label: 'Extern-Empfänger Digital 992', price: 75, note: '868 MHz (T09-051-20-0025)' },
  { id: 'mar-em171', family: 'marantec', label: 'EM171 Erweiterungskarte', price: 128, note: 'T09-051-20-0026' },
  { id: 'mar-verlaengerungsset', family: 'marantec', label: 'Verlängerungsset', price: 8, note: '104-204 mm (T09-051-20-0028)' },
];

// Aluminiumprofile (Seite 12). Preise je Laufmeter, max. Länge 6000 mm.
export const ALU_PROFILES = [
  { code: 'T09-010-60-0352', dims: '60 x 40 x 2', maxLength: 6000, rawPerM: 36, ralPerM: 12 },
  { code: 'T09-010-60-0353', dims: '80 x 40 x 2', maxLength: 6000, rawPerM: 41, ralPerM: 14 },
  { code: 'T09-010-60-0354', dims: '100 x 40 x 2,5', maxLength: 6000, rawPerM: 57, ralPerM: 19 },
  { code: 'T09-010-60-0355', dims: '120 x 40 x 2', maxLength: 6000, rawPerM: 54, ralPerM: 18 },
  { code: 'T09-010-60-0356', dims: '150 x 40 x 4', maxLength: 6000, rawPerM: 128, ralPerM: 43 },
  { code: 'T09-010-60-0357', dims: '80 x 40 x 40 x 2', maxLength: 6000, rawPerM: 51, ralPerM: 17 },
];

// ---- Hilfsfunktionen ----

// kleinste gelistete Zelle, die Breite w und Höhe h abdeckt (aufrunden); null außerhalb oder bei leerer Zelle
export function gridPrice(grid, w, h) {
  const g = grid === 'ext' ? GRID_EXT : grid === 'std' ? GRID_STD : grid;
  if (!g || !g.widths) return null;
  const wi = g.widths.findIndex((x) => x >= w);
  if (wi < 0) return null;
  const cands = g.rows.filter((r) => r.h >= h);
  if (!cands.length) return null;
  const row = cands.reduce((a, b) => (b.h < a.h ? b : a));
  const p = row.prices[wi];
  return p == null ? null : p;
}

export function glazingPrice(typeId, w, thermal = false) {
  const t = GLAZING.find((x) => x.id === typeId);
  if (!t) return null;
  const arr = thermal ? t.perWidthThermal : t.perWidth;
  if (!arr) return null;
  const wi = GLAZING_WIDTHS.findIndex((x) => x >= w);
  if (wi < 0) return null;
  return arr[wi] == null ? null : arr[wi];
}

// Fläche in m² (Breite/Höhe in mm) × Satz je m² × Anzahl Seiten, auf ganze Euro gerundet
export function paintPrice(w, h, ratePerM2, sides = 1) {
  return Math.round((w / 1000) * (h / 1000) * ratePerM2 * sides);
}
