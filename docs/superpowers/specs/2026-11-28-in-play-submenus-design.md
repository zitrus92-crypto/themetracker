# In Play Stocks & Themes — Unterreiter nach Haltehorizont

Stand: 2026-11-28 · Status: Entwurf zur Freigabe (Builder-Check eingearbeitet)

## Absicht

Chris will mit einem Klick den aktuell „heißen Bereich“ des Marktes für einen
bestimmten Haltehorizont eingrenzen und daraus eine strukturierte
TradingView-Watchlist ziehen. Das eigentliche Ranking der Einzelaktien macht er
selbst in TradingView. Die App soll nur:

1. die stärksten **Industries** (optional auch **Themes**) per Schnittmenge
   zweier Zeitfenster finden — gleiche Idee wie die ★-Buttons (1W∩1M, 1M∩3M),
2. darin die liquiden, volatilen Aktien per **$-Volumen** und **ATR%** filtern,
3. das Ergebnis gruppiert nach Industry/Theme (stärkste Gruppe oben) als
   Watchlist exportieren.

Themes allein sind zu lückenhaft — daher sind Industries die Hauptquelle.

## Ziele

- Tab „🔥 In Play Stocks & Themes“ bekommt vier Unterreiter:
  1. **Main** — exakt die heutige Ansicht, unverändert.
  2. **1T ∩ 1W** — Daytrade.
  3. **1W ∩ 1M** — Swingtrade.
  4. **1M ∩ 3M** — Positiontrade.
- Pro Zeit-Reiter: Export als `.txt` (TradingView-Import) und Kopieren in die
  Zwischenablage (kommaseparierte Tickerliste).

## Nicht-Ziele / Anti-Ziele

- **Kein Ranking/Scoring der Einzelaktien** (keine RS, kein Setup-Urteil, keine
  Charts) in den Zeit-Reitern. Aktien werden nur gefiltert und nach $-Volumen
  sortiert.
- Keine manuelle Pflege (siehe Memory „Automation only“) — alles automatisch.
- Keine neue externe Datenquelle / keine zusätzlichen Finviz-Requests.
- Main-Reiter darf sich nicht verändern.

## Fachliche Regeln (entschieden)

### Gruppenauswahl (Industries, optional Themes)

- Für jeden Zeit-Reiter gibt es zwei Zeitfenster (TF_a, TF_b):
  `1D/1W`, `1W/1M`, `1M/3M` (Datenschlüssel in `perfs`: `1D`, `1W`, `1M`, `3M`).
- Pro Zeitfenster wird je Gruppe ein **Perzentil** der Performance innerhalb
  ihres Universums berechnet (Industries gegen Industries, Themes gegen Themes).
- **Je Zeitfenster ein eigenes Dropdown**: Perzentil-Schwelle 50, 55, …, 95.
  Eine Gruppe kommt nur rein, wenn sie in **beiden** Fenstern ≥ Schwelle liegt.
  Beispiel 80 = Gruppe gehört in diesem Fenster zu den besten 20 %.
- **Default: 80 / 80** in allen drei Reitern (= Top 20 %, also strenger als die
  ★-Buttons mit Top 30 % = Perzentil 70).
- Gruppen ohne Wert in einem der beiden Fenster fallen raus.

### Reihenfolge der Gruppen

- Rang je Fenster = Platz nach Performance (1 = stärkste) im jeweiligen
  Universum.
- Sortierschlüssel = **schwächerer (höherer) der beiden Ränge**; bei Gleichstand
  der bessere (niedrigere) Rang; dann Name.
- Ist „Themes einbeziehen“ aktiv, werden Industries und Themes **gemeinsam**
  nach diesem Schlüssel einsortiert (Ränge jeweils im eigenen Universum).

### Themes (optional)

- Schalter „Themes einbeziehen“, Default **aus**.
- Gemeint sind die **40 Haupt-Themes** (entschieden) — dieselben wie im
  Main-Reiter: Performance aus `etf_data.themes`, Mitglieder aus
  `theme_constituents.json`. Unter-Themes (subnodes) bleiben außen vor.
- Themes durchlaufen dieselbe Schnittmenge mit denselben Schwellen.
- Themes erscheinen als **eigene Abschnitte**, gekennzeichnet als Theme
  (z. B. „Theme: Nuclear“).
- **Keine Duplikate:** Eine Aktie steht nur in der höchstplatzierten Gruppe, in
  der sie vorkommt. Industries überschneiden sich nie; eine Aktie kann also nur
  in einen höher platzierten Theme-Abschnitt „wandern“ und fehlt dann in ihrer
  Industry-Gruppe. *(Builder-Entscheidung, bestätigt die Regel oben.)*

### Perzentil-Universum *(Builder-Entscheidung)*

- Nenner = alle Gruppen des Universums mit einem Wert im jeweiligen Fenster —
  unabhängig davon, wie viele ihrer Aktien den Aktienfilter bestehen. Gleiche
  Grundgesamtheit wie bei den ★-Buttons.

### Aktienfilter

- Mitglieder einer Industry: Tickerliste der Industry aus `data.json`.
  Mitglieder eines Themes: `theme_constituents.json` (wie Main-Reiter).
- **$-Volumen** = Ø 50 Tage (`dvol50` aus `rs_universe`).
  Freitext in Mio $, Default **20**. Bedingung: ≥ Wert.
- **ATR%** = ATR 14 Tage in % vom Schlusskurs. Freitext, Default **5**.
  Bedingung: ≥ Wert.
- Aktien ohne $-Vol- oder ATR%-Wert fallen raus.
- Innerhalb einer Gruppe: absteigend nach $-Volumen.
- Gruppen, die nach dem Filter leer sind, werden nicht angezeigt (und nicht
  exportiert).

### Einstellungen

- Alle Regler (2 Schwellen, $-Vol, ATR%, Themes-Schalter) **pro Reiter**
  separat, im Browser gespeichert (localStorage), wie bei anderen Tabs.
- Änderungen wirken sofort (reine Client-Rechnung, kein neuer Lauf nötig).

## Anzeige (Zeit-Reiter)

Kompakte Liste, keine Charts:

```
[1W ▾80] [1M ▾80]  $-Vol ≥ [20] Mio  ATR% ≥ [5]  ☐ Themes   ⬇ .txt  ⧉ Kopieren
Stand 2026-11-27 · 42 Aktien in 6 Gruppen

#1 Semiconductors     (1W Rang 3 · 1M Rang 5)   NVDA $42B · 5.8%  AMD …  MU …
#2 Gold               (1W Rang 1 · 1M Rang 6)   NEM … AEM … KGC …
#3 Theme: <Name>      (…)                       …
```

Je Gruppe: Platz, Name, beide Einzelränge, dann die Aktien mit $-Vol und ATR%.
Unterreiter-Leiste im Stil der vorhandenen Toggle-Buttons (vgl. „Alle / RS ≥ 95 /
…“ der Leader-Watchlist).

## Export

- **.txt (TradingView-Watchlist-Import):** je Gruppe ein Abschnitt
  `###<Gruppenname>` (Themes mit Präfix „Theme: “), darunter die Ticker in
  Anzeige-Reihenfolge, komma-getrennt. Gruppen in Rang-Reihenfolge.
  Dateiname z. B. `inplay_swing_2026-11-27.txt` (`day` / `swing` / `position`).
  Datum = `leaders_bars.date` (Stand der Aktiendaten); dasselbe Datum steht in
  der „Stand“-Zeile. *(Builder-Entscheidung.)*
- **Zwischenablage:** dieselben Ticker in derselben Reihenfolge, nur
  kommasepariert, ohne Abschnitte. Kurzes Feedback („42 Ticker kopiert“).
- Ticker-Format: `EXCHANGE:SYMBOL`, wenn die Börse bereits bekannt ist, sonst
  nackter Symbolname (siehe Datenänderung).

## Ansätze (betrachtet)

- **A — Bestehende Pipeline erweitern (gewählt):** `leaders.py` schreibt in
  `rs_universe` zusätzlich ATR% 14T je Ticker (Kurse liegen dort bereits vor,
  kein Zusatz-Download). Alles Übrige rechnet der Browser aus `data.json`,
  `etf_data.json`, `theme_constituents.json`, `leaders_bars.json`. Passt zur
  Linie „Python liefert Rohdaten, JS rechnet“. Folge: Aktiendaten sind
  Post-Close-Stand, Gruppen-Performance intraday aktuell.
- **B — Eigener Finviz-Screener-Abruf:** liefert ATR/Volumen/Industry direkt,
  aber zusätzliche Requests, Rate-Limit-Risiko, doppelte Datenhaltung. Verworfen.
- **C — Nur vorhandene Theme-Aktien:** genau die Lücken, die vermieden werden
  sollen. Verworfen.

## Datenänderung

- **Junge Aktien bleiben drin** (entschieden): `rs_universe` verlangt 252 Bars,
  Lückenfreiheit am letzten Tag und Kurs ≥ 1 $ — damit fehlen ~1.100 der
  ~5.560 Industry-Ticker, darunter frische IPOs. Deshalb liefert `leaders.py`
  eine **eigene Zeilenmenge** (z. B. `inplay_universe`: `dvol50`, `atr14` in %)
  mit kurzer Mindesthistorie (~50 Bars; Ø-Volumen und ATR über die verfügbaren
  Bars, solange ≥ Minimum). `rs_universe` und damit das RS-Perzentil des
  Main-Reiters bleiben **unverändert**. `SCHEMA_VERSION` anheben, Client
  verträgt alte Dateien (fehlendes Feld → Zeit-Reiter zeigen Hinweis
  „ATR-Daten folgen mit dem nächsten Post-Close-Lauf“).
- Börsenkürzel (entschieden): **kein Nachladen**. Bekannte Präfixe (`x` der
  Theme-Konstituenten in `leaders_bars.tickers`) werden genutzt, alle anderen
  Ticker nackt exportiert. Keine zusätzlichen yfinance-Abfragen.

## Dem Builder überlassen

- Exakte Perzentil-Formel (empfohlen: Anteil der Gruppen mit schlechterer
  Performance, 0–100) und Umgang mit Gleichständen.
- Modulschnitt (eigenes JS-Modul analog `leadersMetrics.js` empfohlen) und Tests.
- Feinlayout, i18n-Strings (DE/EN wie im Rest der App).
- Ob das .txt das von TradingView exportierte Format exakt nachbildet
  (Abschnitte und Ticker kommagetrennt in einer Zeile) — muss beim Import in
  TradingView funktionieren.
