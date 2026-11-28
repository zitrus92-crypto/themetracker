# In Play → Unterreiter „IPOs“ (Neulinge, Basis-Ausbrüche, Risikoappetit)

Stand: 2026-11-28 · Status: Entwurf zur Freigabe (Builder-Check eingearbeitet)

## Absicht

Chris handelt IPOs bisher nicht. Er wartet auf eine **Basis-Bildung nach dem
IPO** und will dann den Ausbruch handeln. Der Reiter soll auf einen Blick
zeigen:

1. **Gibt es gerade Risikoappetit für IPOs?** (Ampel für das Segment)
2. **Welche Neulinge bilden eine Basis bzw. brechen aus?** (der systematische
   Edge: Ausbruch aus der ersten Basis nach dem IPO)

Referenzfall **SNDK 2025** (Spin-off von WDC, Handelsstart 13.02.2025;
split-bereinigte Kurse):

```
17.03.  IPO-Hoch            7.30
07.04.  Basis-Tief          3.49   −52 % (Zollschock; SPY im Fenster −12 %)
26.06.  Rechte Seite        6.23
01.08.  Henkel-Tief         5.01   ATR% 12 → 4
28.08.  Close > 6.23        6.36   Vol 1,2×  → Pivot A („früher Pivot“)
04.09.  Close > 7.30        7.81   Vol 4,0×  → Pivot B („IPO-Hoch-Ausbruch“)
        Basis 118 Handelstage
```

Erkenntnisse daraus (entschieden): Spin-offs zählen mit; **keine feste
Tiefen-Grenze** (hätte SNDK aussortiert); Basen können lang sein; **beide
Pivots A und B** werden gezeigt.

## Ziele

- Fünfter Unterreiter **„IPOs“** im Tab „🔥 In Play Stocks & Themes“ (neben
  Main / Day / Swing / Position).
- Ampel „IPO-Risikoappetit“ + Kontrollzeile.
- Liste aller Neulinge mit Pivots, Kennzahlen, Status; Export .txt +
  Zwischenablage wie die anderen Zeit-Reiter.

## Nicht-Ziele / Anti-Ziele

- Keine manuelle Pflege, keine Emissionspreise, keine IPO-Kalender-Quelle.
- Kein Backtest / Edge-Beweis — alle Schwellen tragen das Label
  **„Konvention, unvalidiert“** (ein Jahr Historie ist zu wenig).
- Keine Charts im Reiter (wie Day/Swing/Position: kompakt).
- Keine zusätzlichen Finviz-Abrufe.

## Universum „Neulinge“

- Alle Ticker des Industry-Universums (`data.json` industries → tickers), deren
  **erster Handelstag** (erster Bar mit Close in der yfinance-2y-Historie)
  innerhalb der letzten **365 Kalendertage** vor dem Datenstand liegt.
- Schließt IPOs und Spin-offs ein (aus Kursen nicht unterscheidbar — gewollt,
  siehe SNDK). Grenzen der Erkennung *(Builder-Check)*: De-SPACs und
  Uplistings behalten bei Yahoo oft die SPAC-/OTC-Historie und erscheinen dann
  nicht; Ticker-Umbenennungen mit neu startender Historie erscheinen
  fälschlich. Akzeptiert.
- **Industry „Shell Companies“ wird ausgeschlossen** *(meine Entscheidung)*:
  ~320 Ticker, frische SPACs kleben bei ~10 $ und würden Index, Breite und
  Liste verfälschen.
- Erster Handelstag wird angezeigt.

## Kennzahlen je Aktie

Basis-Größen (alle aus Tageskursen seit dem ersten Handelstag):

- **IPO-Hoch (Pivot B):** höchstes High seit dem ersten Handelstag (bis gestern
  für die Ausbruchsprüfung heute, s. u.).
- **Basis-Tief:** tiefstes Low nach dem IPO-Hoch.
- **Früher Pivot (A):** höchstes High seit dem Basis-Tief, sofern < IPO-Hoch;
  sonst entfällt A.
- **Basis-Länge:** Handelstage seit dem IPO-Hoch.
- **Tiefe:** Basis-Tief relativ zum IPO-Hoch in %. Nur Anzeige, kein Filter.
- **Abstand A / B:** letzter Close relativ zu A bzw. B in %.
- **Verengung:** ATR% 14T heute vs. ATR% 14T am Basis-Tief.
- **Volumen-Faktor** am Ausbruchstag: Volumen / Ø Volumen 50T (bzw. über alle
  vorhandenen Bars, wenn < 50).

Pivots werden aus den Bars **vor** dem heutigen Tag bestimmt, damit ein heutiger
Ausbruch den Pivot nicht selbst verschiebt.

## Status (Reihenfolge = Sortierung)

1. **Ausbruch B** — heutiger Close > Pivot B (Vol-Faktor angezeigt).
2. **Ausbruch A** — heutiger Close > Pivot A (und nicht > B).
3. **Nahe Pivot** — ≤ 5 % unter A oder B (näherer wird genannt); innerhalb
   nach Abstand aufsteigend.
4. **Basis** — ≥ 15 Handelstage seit dem IPO-Hoch, > 5 % unter beiden Pivots.
5. **Zu frisch** — < 15 Handelstage seit dem IPO-Hoch (ganz unten).

### Nach dem Ausbruch (entschieden)

- Ein Ausbruch zählt nur aus einer **Basis von ≥ 15 Handelstagen** seit dem
  IPO-Hoch. Neue Hochs ohne solche Basis sind keine Ausbrüche.
- Mit dem Ausbruch wird der jeweilige Pivot **eingefroren** (A und B getrennt).
- Status bleibt **5 Handelstage** „Ausbruch A/B (seit X Tagen)“, solange der
  Close über dem eingefrorenen Pivot liegt; schließt er darunter →
  **„Fehlausbruch“** (eigener Status, nach „Ausbruch“ einsortiert).
- Nach 5 Tagen über dem Pivot fällt die Aktie aus den Ausbruchs-Status; ihr
  neues Hoch ist dann das IPO-Hoch für eine mögliche nächste Basis.
- SNDK: 28.08. = Ausbruch A, 04.09. = Ausbruch B; die Folgetage mit neuen
  Hochs zählen nicht als neue Ausbrüche.

## Ampel „IPO-Risikoappetit“

Drei Signale, je ✓ / ✗ / „zu wenig Daten“:

1. **IPO-Index / SPY über 21-EMA:** gleichgewichteter Korb aller Neulinge
   (tägliche Renditen gemittelt, Index ab 100), geteilt durch SPY; Linie über
   ihrem 21-Tage-EMA.
2. **Breite:** ≥ 50 % der Neulinge über ihrem 50-Tage-Schnitt (bei < 50 Bars:
   Schnitt über alle vorhandenen Bars).
3. **Ausbrüche halten:** von allen Aktien mit einem A/B-Ausbruch in den
   letzten 20 Handelstagen (je Aktie einmal, jüngster Ausbruch) stehen heute
   ≥ 50 % noch über ihrem eingefrorenen Pivot. Bei < 3 Ausbrüchen: „zu wenig
   Daten“, zählt nicht.

Ampel: 🟢 grün = ≥ 2 Signale ✓ · 🟡 gelb = 1 · 🔴 rot = 0 (Signale mit „zu wenig
Daten“ zählen nicht als ✓). **Kontrollzeile:** Renaissance IPO ETF (`IPO`) / SPY
über 21-EMA — nur Anzeige, geht nicht in die Ampel ein.

## Filter & Export

- Filter **$-Vol** (Ø 50T, Freitext Mio, Default 20) und **ATR%** (14T,
  Freitext, Default 5) wie in den Zeit-Reitern; gespeichert pro Reiter.
  Filter wirken auf die **Liste**, nicht auf die Ampel (Ampel misst das ganze
  Segment).
- Export .txt: Sektionen `###Ausbruch`, `###Nahe Pivot`, `###Basis` (ohne
  „Zu frisch“), Ticker in Listenreihenfolge, `EXCHANGE:SYMBOL` wo bekannt.
  Zwischenablage: dieselben Ticker kommasepariert.

## Anzeige

```
IPO-Risikoappetit: 🟢 GRÜN (3/3)   Konvention, unvalidiert
  IPO-Index/SPY über 21-EMA ✓ · 64 % über 50T ✓ · Ausbrüche halten 5/7 ✓
  Kontrolle: Renaissance IPO ETF/SPY über 21-EMA ✓
$-Vol ≥ [20] Mio  ATR% ≥ [5]   ⬇ .txt  ⧉ Kopieren
Stand 2026-11-27 · 212 Neulinge · 38 nach Filter

Ticker  Erster Tag  B (IPO-Hoch)  A (früh)  Tiefe  Basis  Abst. A/B    Verengung  Status
WXYZ    2026-03-02  31.50         28.10     −34 %  92 T   +1 % / −9 %  9 → 4 %    Ausbruch A (1.8×)
```

Kompakte Tabelle; Symbol mit Finviz-Link wie in anderen Tabellen erlaubt.

## Ansätze

- **A — Rohdaten aus `leaders.py`, Rechnen im Browser (gewählt):** neue Datei
  `docs/data/ipo_bars.json` mit vollständigen Tageskursen (o/h/l/c/v) seit dem
  ersten Handelstag je Neuling, plus SPY und `IPO`-ETF über denselben Zeitraum
  (365 Tage). Ein neues JS-Modul rechnet alles; Datei wird erst beim Öffnen des
  Reiters geladen. ~1–2 MB.
- **B — Alles in Python:** winzige Datei, aber doppelte Mathematik und jede
  Schwellen-Änderung braucht einen Lauf. Verworfen.
- **C — Finviz-Screener „IPO-Datum“:** zusätzliche Abrufe, Spin-offs fehlen
  evtl. Verworfen.

## Daten

- `leaders.py`: beim bestehenden Download des Industry-Universums für jeden
  Ticker mit erstem Close-Bar innerhalb von 365 Kalendertagen die Reihen ab
  erstem Handelstag behalten (Speicher: nur Neulinge, nicht alle 5.600).
  `IPO` als zusätzlicher Ticker im Download. SPY ist Benchmark und schon da.
- Neue Datei `docs/data/ipo_bars.json`: Datum-Achse der letzten 365
  Kalendertage (SPY-Handelstage), je Ticker kompakte Reihen ab erstem Tag
  (`first`: Datum, `o/h/l/c/v`), plus `bench` (SPY) und `etf` (IPO).
  Gleiche Rundung wie `compact_series`.
- Gleiche Post-Close-Kadenz und Guard wie leaders. Die IPO-Logik in `_absorb`
  bekommt ein **eigenes try/except je Ticker**, damit ein Fehler dort nie einen
  ganzen 150er-Block der RS-/In-Play-Daten kostet *(Builder-Check)*.
- Börsenpräfixe: **kein Nachladen** (wie bei Day/Swing/Position entschieden);
  Neulinge ohne Theme-Zugehörigkeit werden nackt exportiert.

## Dem Builder überlassen

- SNDK (erster Tag 13.02.2025) liegt außerhalb des 365-Tage-Fensters — nur
  als synthetischer Testfall, nicht als Live-Check nutzbar.
- ATR% am Basis-Tief: eigene Berechnung auf dem Ausschnitt bis zum Basis-Tief;
  liegt das Tief in den ersten 14 Bars → „—“.
- Exakte JSON-Struktur und Modulschnitt (eigenes `ipoMetrics.js` mit
  `node --test`, analog `inPlayHorizon.js`), Tests anhand eines synthetischen
  SNDK-Verlaufs (Pivot A/B, Status je Phase).
- Wiederverwendung von `atrPct` / Hilfsfunktionen aus `leadersMetrics.js`.
- Feinlayout, DE/EN-Texte.
