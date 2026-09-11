# DTT Deutsche Tor-Technik

Website für **DTT Deutsche Tor-Technik**, Idstein: maßgefertigte Garagentore, Hof- und
Gartentore, Industrietore, Spezialtore und Sicherheitstüren.
*„Tore, die zu Ihnen passen. Service, der Sie versteht.“*

- **Startseite** (`index.html`, Deutsch) nach Layout-Vorlage vom 11.09.2026: weiße Hero-Karte
  auf Vollbild-Foto, fünf Produktkarten, Kennzahlen-Leiste, dunkler Claim, Privatkunden /
  Industrie, Service-Schritte, Über uns, Referenzen, roter CTA-Streifen, Footer.
- **Marke**: Signalrot `#a4080b` auf Anthrazit `#1b1b1b`, Schrift Inter. Logo als Inline-SVG
  (DTT-Wortmarke, roter Balken) in `partials/header.html` und `partials/footer.html`.
- **Fotos**: Produkt- und Referenzfotos stammen von der Silvelox-Website (DTT ist
  Silvelox-Partner für Deutschland) plus eigene DTT-Aufnahmen (`gallery-1.jpg`, `gallery-2.jpg`).
  Vor dem Livegang Bildrechte mit Silvelox klären.
- Plain HTML/CSS/JS, kein Build-Schritt. Header/Footer als Partials via `assets/js/main.js`.

## Kontaktdaten (von deutsche-tor-technik.de übernommen)
Meilbachstraße 18 · 65510 Idstein · +49 (0) 6082 51 79 97 0 · info@deutsche-tor-technik.de

## Unterseiten
`products.html`, `products/*.html`, `pages/*.html` sind noch die englischen Platzhalterseiten
der ersten Version. Sie nutzen bereits den neuen Header, Footer und die neuen Farben.
Nächster Schritt: Inhalte auf Deutsch und auf die fünf Produktgruppen umstellen.

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
