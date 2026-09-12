# DTT Deutsche Tor-Technik

Website für **DTT Deutsche Tor-Technik**, Idstein: maßgefertigte Garagentore, Hof- und
Gartentore, Industrietore, Spezialtore und Sicherheitstüren.
*„Tore, die zu Ihnen passen. Service, der Sie versteht.“*

- **Startseite** (`index.html`, Deutsch) nach Layout-Vorlage vom 11.09.2026: weiße Hero-Karte
  auf Vollbild-Foto, fünf Produktkarten, Kennzahlen-Leiste, dunkler Claim, Privatkunden /
  Industrie, Service-Schritte, Über uns, Referenzen, roter CTA-Streifen, Footer.
- **Marke**: Original-DTT-Farben (Royalblau `#0018a8`, Navy `#000e28`, Orange `#f58220`, Cyan `#00a3e0`), Montserrat + Roboto. Original-Logo als `assets/img/logo-hd.png`
  (aus dem offiziellen Logo freigestellt) in Header und Footer.
- **Fotos**: Produkt- und Referenzfotos stammen von der Silvelox-Website (DTT ist
  Silvelox-Partner für Deutschland) plus eigene DTT-Aufnahmen (`gallery-1.jpg`, `gallery-2.jpg`).
  Vor dem Livegang Bildrechte mit Silvelox klären.
- **3D-Konfigurator** (`konfigurator.html`, `assets/js/konfigurator.js`, Three.js 0.170 per CDN-Importmap):
  prozedural gebautes Haus (Einzel-/Doppelgarage, Fassadenfarbe, Flach-/Satteldach), drei Torarten
  (Sektional-, Schwing-, Flügeltor) mit Öffnungsanimation, 7 Designs, 12 RAL-Farben, 6 Holzoberflächen,
  Verglasung, Antrieb, Kamera-Presets, Bild speichern, Link teilen (Konfiguration im URL-Hash),
  Anfrage-Button füllt das Kontaktformular vor. Modus „Ihr Foto“: eigenes Hausfoto laden (bleibt lokal),
  Tor per vier Eckpunkten perspektivisch in die Garagenöffnung ziehen, Export als JPG.
- Plain HTML/CSS/JS, kein Build-Schritt. Header/Footer als Partials via `assets/js/main.js`.

## Kontaktdaten (von deutsche-tor-technik.de übernommen)
Meilbachstraße 18 · 65510 Idstein · +49 (0) 6082 51 79 97 0 · info@deutsche-tor-technik.de

## Seiten
- `index.html` Startseite · `products.html` Produktübersicht · `konfigurator.html` 3D-Konfigurator · `404.html`
- `products/` garagentore, hoftore, industrietore, spezialtore, sicherheitstueren
- `pages/` service, ueber-uns, referenzen, kontakt (mailto-Formular, wird vom Konfigurator vorbefüllt), karriere, downloads, impressum, datenschutz, agb
- Gemeinsames Grundgerüst: `partials/header.html` + `partials/footer.html` (per `assets/js/main.js` eingebunden, `data-root` regelt relative Pfade), Komponenten in `assets/css/style.css`.
- Fonts (Montserrat, Roboto) und Three.js liegen lokal in `assets/fonts` und `assets/vendor` (keine Google/CDN-Requests, DSGVO-freundlich). `sitemap.xml` und `robots.txt` vorhanden.

## Lokal starten
Die Partials werden per `fetch` geladen, daher über HTTP ausliefern (nicht `file://`):

```bash
cd DTT && python3 -m http.server 8080
# http://localhost:8080
```

## Deploy (GitHub Pages)
Branch `main`, Root, `.nojekyll` vorhanden. Live: https://b777-7ao.github.io/DTT/

## Vor dem Livegang
- Impressum, Datenschutz, AGB mit echten Texten füllen (`pages/legal.html`, `privacy.html`, `terms.html`).
- Kontaktformular an E-Mail anbinden.
- Bildrechte für Silvelox-Fotos bestätigen.
