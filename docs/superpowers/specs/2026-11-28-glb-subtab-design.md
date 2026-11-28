# In Play → Unterreiter „GLB“ (Green Line Breakout nach Dr. Eric Wish)

Stand: 2026-11-28 · Status: Entwurf zur Freigabe (Builder- und Konformitäts-Check eingearbeitet)

## Absicht

Chris will Green Line Breakouts (GLB) nach den Regeln von Dr. Eric Wish
(Wishing Wealth) systematisch finden und nach dem Ausbruch per **Blue Dot**
einsteigen. Qualität vor Menge: Wishs eigene Kombinationsfilter **RWB** und
**Stage 2** sind zuschaltbar. Hohe Regel-Konformität ist ausdrücklich
gewünscht.

## Primärquellen (Recherche 2026-11-28)

- Glossar: https://wishingwealthblog.com/glossary/
- „GLB explained“ (2021/05): https://wishingwealthblog.com/2021/05/blog-post-glb-green-line-break-out-explained-some-stocks-having-a-glb-last-week-mec-omp-tgls-flng-cubi/
- GLB-Beispiele/Volumen (2018/06): https://wishingwealthblog.com/2018/06/3-recent-glb-stocks-enva-gdot-tsg
- Verkaufsregel (2023/11): https://wishingwealthblog.com/2023/11/very-important-blog-post-explaining-glbs-day-15-of-qqq-short-term-up-trend-123-us-new-highs-and-2-lows-43-at-aths-pgr-is-an-example-of-a-successful-glb-see-its-monthly-and-daily-charts-and-a-l/
- Blue Dot / Scan (2025/05): https://wishingwealthblog.com/2025/05/blog-post-day-20-of-qqq-short-term-up-trend-thank-you-for-attending-my-presentation-to-the-boston-ibd-meetup-last-night-recording-is-coming-to-all-who-registered-see-my-tc2000-scan/

## Regeln (entschieden)

### Green Line

- Auf **Monatsbalken** (volle Historie): Allzeithoch = höchstes **Intraday-High**
  aller Monatsbalken. Die Green Line liegt auf diesem High.
- Gültig erst, wenn danach **mindestens 3 abgeschlossene Monatsbalken** folgen,
  deren High es **nicht** überschreitet (Glossar: „not penetrated … for three
  straight months (or 3 bars)“).
- **Reset per Intraday-High** (entschieden, Variante A): Jedes spätere High über
  der Line ist ein neues Allzeithoch; die 3-Monats-Uhr startet neu. Ein GLB ist
  damit immer ein Ausbruch auf ein echtes neues Allzeithoch.
- **Gültige Line bleibt bis zum Schluss darüber** (entschieden): Ist die Line
  gültig (3 Balken unberührt), töten Intraday-Durchstöße ohne Schlusskurs
  darüber sie **nicht**; sie bleibt, bis ein Tag über ihr schließt (= GLB).
  Die strenge Intraday-Reset-Regel gilt nur für die **Entstehung** der Line.
  Entspricht Wishs Praxis (Alarm beim ersten Trade über der Line, Kauf erst
  bei Schluss darüber).
- Der laufende (unvollständige) Monat zählt nicht als einer der 3 Balken, sein
  High setzt die Uhr aber zurück, falls es die Line überschreitet.
- Keine IPO-Ausnahme („ein paar Wochen“ bei Wish): frische IPOs deckt der
  IPO-Reiter ab. Ohne 3 volle Monatsbalken nach dem Hoch gibt es keine Line.

### GLB-Ereignis und Status

- **GLB** = erster **Tagesschluss** über einer zu diesem Zeitpunkt gültigen
  Green Line (Wish wartet auf „a close above the green line“).
- Volumen: wird angezeigt als **Wochenvolumen der GLB-Woche / Ø Wochenvolumen
  der 10 Vorwochen**, **kein** Filter (Wish 2021/05: „preferable … on above
  average weekly trading volume“) *(Konformitäts-Check)*.
- Status je Aktie (Reihenfolge = Sortierung):
  1. **GLB heute** — GLB am letzten Handelstag.
  2. **GLB hält** — GLB in den letzten **3 Monaten (~63 Handelstage)**, letzter
     Close über der damaligen Green Line. Mit Blue Dot zuerst.
  3. **Nahe Green Line** — gültige Line, letzter Close **≤ 5 %** darunter.
  4. **Fehl-GLB** — GLB in den letzten 3 Monaten, letzter Close wieder **unter**
     der Line (Wish: „I sell immediately if it closes back below the green
     line“). Ganz unten.
- Status wird jeden Tag neu als **letzter Close vs. die Line des jüngsten GLB**
  bestimmt; ein Zurückerobern nach Fehl-GLB wechselt also wieder zu „GLB hält“
  (Wish 2018/06: Wiederkauf erlaubt) *(Builder-Check)*.

### Qualitätsfilter (zuschaltbar, Default aus) und Markierung

- **RWB** (Glossar): auf **Wochenschlusskursen** — alle 6 kurzen EMAs
  (3, 5, 8, 10, 12, 15) liegen über allen 6 langen EMAs (30, 35, 40, 45, 50,
  60) **und alle 6 kurzen EMAs steigen** (über ihrem Wert der Vorwoche; Glossar:
  „rising above“) *(Konformitäts-Check)*. Wochen = letzter Handelstag der Woche
  aus den 2y Tagesdaten.
- **Stage 2:** **letzter abgeschlossener Wochenschluss** über dem
  **30-Wochen-Durchschnitt** und dieser **steigt** (Wish: „above its rising 30
  week average“, Signal auf Wochenschluss). *Eigene Festlegung:* SMA (wie
  Weinstein) und „steigt“ = heute > vor 4 Wochen.
- **Blue Dot 🔵** (2025/05-Post): tägliche Stochastik **10.1** (%K über 10 Tage,
  ohne Glättung) **heute > 20, gestern < 20**. Markiert, wenn in den **letzten
  3 Handelstagen** ein Blue Dot auftrat (wie in seinem Scan „over the last 3
  days“). Nur Markierung, kein Filter.

### Universum und Filter

- Alle Aktien des Industry-Universums (`data.json`), ohne „Shell Companies“.
- Ausgeliefert werden nur relevante Aktien: Status 1–4.
- UI-Filter: **$-Vol** (Ø 50T, Freitext Mio, Default 20), **ATR%** (14T,
  Freitext, Default **0** = aus; Wish filtert nicht nach Volatilität), Schalter
  **RWB** und **Stage 2**. Prefs pro Reiter.

### Eigene Auslegungen (nicht wörtlich bei Wish belegt)

Nur abgeschlossene Monatsbalken zählen für die 3 Monate; Tagesschluss als
GLB-Basis; 3-Monats-Fenster für „GLB hält“ (angelehnt an seinen Scan „within
last 3 months“); ≤ 5 % für „nahe“; SMA und 4-Wochen-Steigung beim 30-Wochen-
Schnitt; Ausschluss der IPO-Ausnahme (bewusste Abweichung, IPO-Reiter deckt
das ab); $-Vol-/ATR-Filter (Wish nutzt C > 15, V > 20.000 auf einer
IBD50-Liste). Werden im Erklärtext als Auslegung gekennzeichnet.

## Anzeige

```
🟢 In Play · GLB (Dr. Eric Wish)          Quelle: wishingwealthblog.com
$-Vol ≥ [20] Mio  ATR% ≥ [0]  ☐ nur RWB  ☐ nur Stage 2   ⬇ .txt  ⧉ Kopieren
Stand 2026-11-27 · 312 Kandidaten · 58 nach Filter

Ticker  Green Line  seit (Monat)  Close   Abstand  GLB am      Vol    RWB  St.2  🔵   Status
ABCD    48.20       2026-03       49.10   +1.9 %   2026-11-27  2.3×   ✓    ✓    —    GLB heute
WXYZ    31.50       2025-12       33.40   +6.0 %   2026-10-14  1.4×   ✓    ✓    🔵   GLB hält
```

Kurzer Erklärtext mit den Regeln und Quellen-Link (Glossar).

## Export

- .txt: `###GLB heute`, `###GLB hält · Blue Dot`, `###GLB hält`,
  `###Nahe Green Line` (Fehl-GLB nicht exportiert), Ticker in Listenreihenfolge,
  `EXCHANGE:SYMBOL` nur wo aus Theme-Konstituenten bekannt.
- Zwischenablage: dieselben Ticker kommasepariert.

## Ansätze

- **A — Alles in Python, kleine Ergebnisdatei (gewählt):** neuer Monats-Abruf
  `period="max", interval="1mo", auto_adjust=False` in 150er-Blöcken (gemessen:
  ~2,5 s/Block, ~2–5 min gesamt), Green Line daraus; GLB/Status/RWB/Stage 2/
  Blue Dot aus den vorhandenen 2y-Tagesdaten; Ausgabe `docs/data/glb.json`
  (< ~100 KB). Browser filtert/zeigt nur.
- **B — Python nur Green Line, JS rechnet Rest:** 3–5 MB Tagesdaten im Browser,
  RWB-Wochen in JS. Verworfen (Regeln sind fest, Ladezeit wichtiger).
- Finviz-Filter `ta_alltime_*` liefert weder Höhe noch Datum des ATH —
  ungeeignet.

## Daten / Pipeline

- `auto_adjust=False` für Monats- und Tagesdaten (gemessen: Monats-High =
  Tages-Max im 2y-Fenster; split-bereinigt, dividendenunbereinigt).
- Die 2y-Tagesreihen werden beim bestehenden Download nur kurz gehalten
  (Speicher): GLB-Kennzahlen je Ticker direkt in `_absorb` berechnen (eigenes
  try/except), Monatsdaten in einem separaten Durchlauf **vor** der
  Tagesberechnung laden, damit die Green Line bekannt ist.
- `glb.json` wird **zuletzt und isoliert** geschrieben (Fehler kosten nie
  Leader-/IPO-Daten). Gleiche Post-Close-Kadenz.
- **Monats-Abruf und GLB-Rechnung isoliert** *(Builder-Check)*: eigenes
  try/except um Abruf und Rechnung; scheitert es, gibt es heute keine neue
  `glb.json`, Leader-/IPO-Dateien werden trotzdem geschrieben. Reihenfolge
  ist frei: kurze Tagesausschnitte je Ticker (~120 Tage h/l/c/v + Wochen-
  schlüsse) in `_absorb` behalten, GLB nach dem Tages-Durchlauf rechnen.
- Den **laufenden Monat** aus den Tagesdaten bilden, nicht aus der letzten
  yfinance-Monatszeile (kann nachhinken/doppelt sein). Für die Line an einem
  vergangenen Tag d zählen abgeschlossene Monatsbalken + Tages-Highs des
  Monats von d bis d−1.
- Tages-Lücken (None, an SPY-Kalender ausgerichtet) werden übersprungen.
- Fehlt das Industry-Universum (Fallback auf Theme-Mitglieder), wird keine
  `glb.json` geschrieben.
- Felder je Ticker (Vorschlag): `gl`, `gl_month`, `close`, `dist_pct`,
  `status`, `glb_date`, `glb_volx`, `rwb`, `stage2`, `blue_dot`, `dvol50`,
  `atr14`.

## Nicht-Ziele

- Kein Green Dot, keine Yellowband-, BWR- oder RLC-Anzeige.
- Keine Backtests; Wishs Regeln werden umgesetzt, nicht validiert.
- Keine manuellen Watchlists (Wish pflegt seine ATH-Liste per Hand — hier
  automatisch).

## Dem Builder überlassen

- Exakte Wochenbildung (Freitag vs. letzter Handelstag), EMA-Seed.
- Modulschnitt in Python (eigenes `glb.py` empfohlen) und Tests mit
  synthetischen Monats-/Tagesreihen (Line-Bildung, Reset, GLB, Fehl-GLB,
  RWB, Stage 2, Blue Dot).
- Feinlayout, DE/EN-Texte.
