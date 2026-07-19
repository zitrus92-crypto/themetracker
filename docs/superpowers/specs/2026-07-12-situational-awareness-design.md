# Situational-Awareness-Ampel (Stockbee) — Design

**Datum:** 2026-07-12 · **Status:** freigegeben (Chris)

## Ziel

Der Stockbee-„Situational Awareness"-Indikator (Pradeep Bonde) als Grün/Gelb/Rot-Badge
im Header: *Breakouts Work* / *Be Selective* / *Breakouts Fail*. Tooltip zeigt die
exakten Folien-Erklärungen aller drei Farben (aktive hervorgehoben) plus Live-Werte.
Vollautomatisch aus dem Stockbee-Market-Monitor-Sheet — kein manueller Pflegeaufwand.

## Entscheidungen (Interview)

| Frage | Entscheidung |
|---|---|
| Platzierung | Kompaktes Header-Badge (Punkt + Label des aktiven Zustands) |
| Logik | Ratios primär (s. u.), 20%-Study nur informativ nicht implementiert |
| Tooltips | DE + EN über bestehende i18n; EN = Original-Folientext |
| Verhältnis zum Regime-Gate | Ersetzt es sichtbar; interne Regime-Logik (RISK_OFF-Banner) bleibt |
| Tooltip-Inhalt | Alle 3 Erklärungen + Handlungszeile + Live-Werte |
| T2108-Trend | steigend = heutiger Wert > Schnitt der letzten 5 Werte |

## Regel (exakt)

- **NEON-GRÜN „Oversold Bounce likely"** — T2108 ≤ 10 (Vorrang vor allen
  anderen Zuständen; Nachtrag Chris 2026-07-19). Tooltip: „Historisch
  überverkaufter Bereich und Bounce sehr wahrscheinlich. Markt kaufen,
  z.B. SPY, QQQ, TQQQ."
- **GRÜN** — 5d-Ratio > 1,0 **und** 10d-Ratio > 1,0 **und** T2108 > Ø(letzte 5)
- **ROT** — 5d-Ratio < 1,0 **und** 10d-Ratio < 1,0 **und** T2108 < Ø(letzte 5)
- **GELB** — alles andere (gemischte Signale)
- Fehlende Inputs oder Breadth älter als 3 Handelstage → graues „?"-Badge (stale)

## Datenpfad

`scraper._fetch_stockbee_breadth()` liest zusätzlich zu T2108 die Spalten
„up 4% today", „down 4% today", „5 day ratio", „10 day ratio" sowie die letzten
6 gültigen Zeilen (für den T2108-5-Tage-Schnitt). Neu:
`scraper.compute_situational_state()`. `scrape.write_regime()` hängt an jeden
regime.json-Eintrag einen Block:

```json
"sa": {"state": "YELLOW", "ratio5d": 0.81, "ratio10d": 1.33,
       "t2108": 52.02, "t2108_avg5": 50.1, "t2108_rising": true,
       "up4": 129, "down4": 181, "date": "2026-07-10"}
```

## UI

- `docs/index.html`: neues `#sa-badge` im Header (das alte `#regime-badge` bleibt
  per CSS ausgeblendet, sein RISK_OFF-Banner-Pfad unverändert).
- `docs/static/app.js`: `renderSituational()` — Badge (farbiger Punkt + Label)
  und HTML-Tooltip (CSS-Hover): drei Karten mit Titel, Folien-Erklärung und
  Handlungszeile, aktive Karte farbig hervorgehoben; darunter Live-Werte
  (5d/10d-Ratio, T2108 ↑/↓, 4%-Up/Down-Counts, Datenstand).
- `docs/static/style.css`: `.sa-badge`, `.sa-dot`, `.sa-tooltip`, Zustandsfarben
  analog zur bestehenden Regime-Palette.

Kein Backfill, keine Historien-Anzeige — nur der aktuelle Zustand.
