/* DTT · Preise: Tabellen aus dem Katalog (Hersteller-Preisliste 08/2026) */
import * as C from './cfg/catalog.js';
const $ = id => document.getElementById(id);
const eur = n => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const COLS = { okoume: 'Okoumé', fir: 'Nordische Fichte', oak: 'Eiche', brushed: 'Eiche / Lärche gebürstet', stone: 'Sandstein', wood: 'Fichte' };
const FAM = [
  { id: 'linee', table: 'linee', label: 'Linee', models: 'FLAT, NEWMAN, VIP, DOC, SPI, FOR, GEO', col: 'okoume', desc: 'Gefräste Linien, Okoumé lackiert in RAL oder imprägniert' },
  { id: 'bugne', table: 'bugne', label: 'Bugne', models: 'BIG, OLD, EGO, ARC', col: 'okoume', desc: 'Kassetten, Okoumé lackiert' },
  { id: 'design1', table: 'design1', label: 'Design', models: 'SLOT, LAYER', col: 'okoume', desc: 'Lamellen, Okoumé lackiert' },
  { id: 'design2', table: 'design2', label: 'Design', models: 'MATRIX, MILLERIGHE, ONDULÉ, PLISSÉ, INTRECCIO', col: 'okoume', desc: 'Strukturen, Okoumé lackiert' },
  { id: 'materia', table: 'materia', label: 'Materia', models: 'BELGIUM, GREECE, INDIA, SOUTH AFRICA', col: 'stone', desc: 'Sandstein-Matte auf Meeresholz' },
  { id: 'japan', table: 'japan', label: 'Japanese Mood', models: 'SUGI, WABI SABI', col: 'wood', desc: 'Verkohlte oder gealterte Fichtenbretter' },
];
function cards() {
  const a = C.sector(3000, 2250);
  $('familyCards').innerHTML = FAM.map(f => {
    const p0 = C.PRICES[f.table].A0[f.col], p1 = C.PRICES[f.table][a][f.col];
    return `<article class="price-card"><h3>${f.label}<small>${f.models}</small></h3><p>${f.desc}</p><div class="price-card-rows"><div><span>Sektor A0, bis 2670 × 2280</span><strong>ab ${eur(p0)}</strong></div><div><span>Einzelgarage 3000 × 2250</span><strong>${eur(p1)}</strong></div></div><a class="text-link" href="../konfigurator.html#type=secur&amp;model=${f.table === 'linee' ? 'vip' : f.table === 'bugne' ? 'old' : f.table === 'design1' ? 'slot' : f.table === 'design2' ? 'matrix' : f.table === 'materia' ? 'greece' : 'sugi'}&amp;mode=studio">Im Tor-Studio ansehen <span aria-hidden="true">›</span></a></article>`;
  }).join('');
}
function sectorTable() {
  const w = +$('pw').value, h = +$('ph').value, sec = C.sector(w, h);
  if (!sec) { $('sectorText').innerHTML = `<strong>Außerhalb des Standard-Rasters.</strong> Für ${w} × ${h} mm prüfen wir die Machbarkeit und erstellen ein individuelles Angebot.`; $('sectorTable').innerHTML = ''; return; }
  $('sectorText').innerHTML = `<strong>Sektor ${sec}</strong> für ${w} × ${h} mm Außenmaß Rahmen, Rahmenpfosten ${C.pillarFor(w, h)} mm.`;
  const rows = FAM.map(f => { const t = C.PRICES[f.table][sec]; return `<tr><th scope="row">${f.label}<small>${f.models}</small></th>${['okoume', 'fir', 'oak', 'brushed', 'stone', 'wood'].map(c => `<td>${t[c] ? eur(t[c]) : '<span class="na">–</span>'}</td>`).join('')}</tr>`; });
  $('sectorTable').innerHTML = `<thead><tr><th>Familie</th>${['okoume', 'fir', 'oak', 'brushed', 'stone', 'wood'].map(c => `<th>${COLS[c]}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody>`;
  $('sectorNotes').textContent = [C.SECTOR_NOTES.certified, C.SECTOR_NOTES.tall, C.SECTOR_NOTES.plus, 'PLISSÉ und INTRECCIO nur in den Sektoren A0 und A, Materia bis 2830 mm Höhe.'].join(' ');
}
function options() {
  const rows = [];
  Object.values(C.OPTIONS).forEach(o => rows.push([o.label, o.price == null ? 'auf Anfrage' : eur(o.price), o.note || '']));
  C.HANDLES.filter(h => h.price).forEach(h => rows.push([h.name, eur(h.price), 'Griff']));
  rows.push(['Metal Skin Oberfläche', '254 € je m²', 'Linee-Modelle auf Okoumé']);
  rows.push(['Sonderfarbe außerhalb der RAL-Palette', eur(C.SURCHARGES.ral_special), '']);
  $('optionTable').innerHTML = `<thead><tr><th>Option</th><th>Aufpreis</th><th>Hinweis</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>`;
}
cards(); sectorTable(); options();
['pw', 'ph'].forEach(id => $(id).addEventListener('input', sectorTable));
