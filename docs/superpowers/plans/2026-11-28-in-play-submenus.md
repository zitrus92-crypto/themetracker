# In-Play-Unterreiter nach Haltehorizont — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Der Tab „🔥 In Play Stocks & Themes“ bekommt die Unterreiter Main / 1T∩1W / 1W∩1M / 1M∩3M. Die Zeit-Reiter zeigen heiße Industries (optional Themes) mit ihren liquiden, volatilen Aktien und exportieren sie als TradingView-Watchlist.

**Architecture:** `leaders.py` schreibt zusätzlich `inplay_universe` (Ø $-Vol 50T + ATR% 14T je Ticker, kurze Mindesthistorie) in `leaders_bars.json`. Ein neues reines JS-Modul `inPlayHorizon.js` rechnet Perzentile, Schnittmenge, Rang, Aktienfilter, Gruppierung und Export-Text. `app.js` rendert die Unterreiter und verdrahtet Regler und Export.

**Tech Stack:** Python 3 + yfinance (unittest), Vanilla-JS-ES-Module (`node --test`), statisches HTML/CSS (GitHub Pages aus `docs/`).

**Spec:** `docs/superpowers/specs/2026-11-28-in-play-submenus-design.md`

## Global Constraints

- Main-Reiter bleibt pixelgleich zur heutigen Ansicht (`renderLabTab()` unverändert).
- `rs_universe` (Felder, Gate, Werte) bleibt unverändert — RS-Perzentil darf sich nicht verschieben.
- Keine zusätzlichen Netzabrufe (kein yfinance-Exchange-Lookup für Industry-Ticker, kein Finviz).
- Schwellen-Dropdown: 50, 55, …, 95; Default 80 / 80 in allen drei Reitern.
- $-Vol: Ø 50 Tage, Freitext in Mio $, Default 20. ATR%: 14 Tage, Freitext, Default 5. Bedingung jeweils ≥.
- Themes-Schalter Default aus; Themes = die 40 Haupt-Themes (`_etfData.themes` + `theme_constituents.json`), keine Subnodes.
- Gruppen-Sortierung: schwächerer Rang aufsteigend, dann besserer Rang, dann Name.
- Einstellungen pro Reiter via `prefSet`/`prefGet` (vorhandene Helfer in `app.js`).
- UI-Strings DE + EN im vorhandenen i18n-Objekt.
- Datum in „Stand“ und Dateiname = `leadersDataDate()`.

## Review Focus

1. **Alte `leaders_bars.json` ohne `inplay_universe`** (bis zum nächsten Post-Close-Lauf): Zeit-Reiter zeigen einen Hinweis statt leerer Liste oder Exception → Test in Task 2 (`buildHorizon` mit `universe = null`), Render-Pfad in Task 3.
2. **Symbol-Schreibweisen:** Finviz/yfinance `BRK-B` vs. TradingView `BRK.B` vs. Theme-Konstituent `NYSE:BRK.B` müssen auf dieselbe Aktie zeigen und dürfen nicht doppelt erscheinen → Test in Task 2 (`normSym`/Dedupe).
3. **Freitext-Eingaben** leer, Komma als Dezimaltrenner („2,5“), negativ oder Text → fallen auf Default zurück bzw. „2,5“ = 2.5 → Test in Task 2 (`parseNum`).
4. **Gruppe ohne Perf-Wert in einem Fenster** (null/undefined) → fällt raus, zählt nicht im Nenner → Test in Task 2.
5. **Leeres Ergebnis** (Schwellen zu streng) → Export-Buttons zeigen Toast statt leerer Datei → Render-Pfad Task 3, Text-Funktion liefert `""` (Test Task 2).

---

### Task 1: `inplay_universe` in leaders.py

**Files:**
- Modify: `leaders.py` (LEADERS_CONFIG, neue Funktion neben `rs_summary`, `_absorb` in `fetch_bars_and_universe`, Rückgabe/Ausgabe in `build_leaders`, `SCHEMA_VERSION`)
- Test: `tests/test_leaders.py`

**Interfaces:**
- Produces: `leaders_bars.json["inplay_universe"] = {"fields": ["dvol50", "atr14"], "min_bars": 50, "rows": {"<yf-symbol>": [dvol50:int, atr14_pct:float(2 Nachkommastellen)]}}`. Schlüssel = yfinance-Symbol wie in `rs_universe.rows` (z. B. `BRK-B`). Enthält alle Ticker aus `broad ∪ keep` mit gültigem Wert.
- Produces: `inplay_summary(c, h, l, v, cfg=LEADERS_CONFIG) -> list | None`.

- [ ] **Step 1: Failing tests** in `tests/test_leaders.py`, neue Klasse `InplaySummaryTest`:
  - `test_values`: 60 Bars, c=100 konstant, h=102, l=98, v=1_000_000 → `[100_000_000, 4.0]`.
  - `test_short_history_ok`: genau 50 Bars → nicht None; 49 Bars → None.
  - `test_gap_in_window_is_none`: ein `None` in c/h/l/v innerhalb der letzten 50 Bars → None.
  - `test_no_price_floor`: c = 0.5 → nicht None (kein RS_MIN_PRICE-Gate; Filter macht der Client).
  - `test_rs_summary_unchanged`: bestehende `rs_summary`-Tests laufen unverändert.
- [ ] **Step 2:** `python -m unittest tests.test_leaders -v` → neue Tests FAIL (`AttributeError: inplay_summary`).
- [ ] **Step 3: Implement.** Config: `"INPLAY_MIN_BARS": 50, "INPLAY_DVOL_BARS": 50, "INPLAY_ATR_BARS": 14`. `inplay_summary`: nur die letzten `INPLAY_MIN_BARS` Bars betrachten, Lücken → None; dvol = Ø(c·v) über `INPLAY_DVOL_BARS`; ATR% = Ø True Range über `INPLAY_ATR_BARS` (mit Vortages-Close) / letzter Close · 100. In `_absorb` für jeden Ticker in `broad_set | keep_set` aufrufen und in neues Dict `inplay` schreiben; `fetch_bars_and_universe` gibt `(master, bars, universe, inplay)` zurück (Aufrufer anpassen). `bars_out["inplay_universe"]` wie oben. `SCHEMA_VERSION = 3` (Kommentar: v3 inplay_universe). Log-Zeile mit Anzahl.
- [ ] **Step 4:** `python -m unittest tests.test_leaders -v` → PASS (alle).
- [ ] **Step 5: Commit** `feat(leaders): inplay_universe mit dvol50/atr14 fuer In-Play-Unterreiter`

### Task 2: Reines JS-Modul `inPlayHorizon.js`

**Files:**
- Create: `docs/static/inPlayHorizon.js`
- Create: `docs/static/inPlayHorizon.test.js`
- Modify: `package.json` (`test`-Script), `.github/workflows/scrape.yml:98` und `:134` (Testliste um die neue Datei ergänzen)

**Interfaces:**
- Produces (alle `export`):
  - `HORIZONS = { day: {tfs:["1D","1W"], label:"1T ∩ 1W", file:"day"}, swing: {tfs:["1W","1M"], label:"1W ∩ 1M", file:"swing"}, position: {tfs:["1M","3M"], label:"1M ∩ 3M", file:"position"} }`
  - `DEFAULTS = { pct: [80, 80], minDvolM: 20, minAtr: 5, themes: false }`
  - `PCT_OPTIONS = [50,55,…,95]`
  - `parseNum(str, fallback) -> number` — trimmt, `,`→`.`, nicht endlich oder < 0 → fallback.
  - `normSym(s) -> string` — Präfix `EX:` entfernen, `.`→`-`, Großbuchstaben (Lookup-Schlüssel wie `inplay_universe.rows`).
  - `rankAndPct(groups, tf) -> Map<name, {rank, pct}>` — `groups: [{name, perfs}]`; nur Gruppen mit endlichem `perfs[tf]`; `rank = 1 + #(perf strikt größer)`; `pct = 100 * (n - rank) / n`.
  - `buildHorizon({ industries, themes, themeMembers, universe, exchangeOf, horizon, pct:[a,b], minDvolM, minAtr, includeThemes }) -> { groups: [{name, kind:"industry"|"theme", ranks:[r1,r2], key:[weak,best], rows:[{sym, tv, dvol, atr}]}], missingData: bool }`
    - `industries`: `{name: {perfs, tickers:[bare]}}` (data.json), `themes`: `{name: {perfs}}` (etf_data), `themeMembers`: `{name: ["EX:SYM"]}` (theme_constituents), `horizon`: Schlüssel aus `HORIZONS`.
    - `universe`: `inplay_universe` oder `null` → `{groups: [], missingData: true}`.
    - `exchangeOf(normSym) -> "EX:SYM" | null`; ohne Treffer `tv` = Symbol mit `-`→`.`.
    - Gruppe passiert, wenn `pct_tf1 ≥ a` und `pct_tf2 ≥ b`; Ränge im eigenen Universum (Industries/Themes getrennt).
    - Sortierung: `key = [max(r1,r2), min(r1,r2)]` aufsteigend, dann Name.
    - Aktien: `dvol ≥ minDvolM·1e6` und `atr ≥ minAtr`; je Gruppe absteigend nach dvol. Dedupe über `normSym`: Aktie bleibt nur in der ersten (höchstplatzierten) Gruppe. Leere Gruppen fallen weg.
  - `tvText(groups) -> string` — je Gruppe `###<Name>` (Theme: `###Theme: <Name>`, Kommas im Namen → Leerzeichen), dann ein Ticker (`tv`) pro Zeile; `""` wenn keine Gruppe. Format wie `tradingViewWatchlist` in `leadersMetrics.js`.
  - `clipboardText(groups) -> string` — alle `tv` in Anzeige-Reihenfolge, kommasepariert.

- [ ] **Step 1: Failing tests** in `inPlayHorizon.test.js` (Stil wie `leadersMetrics.test.js`, `node:test` + `assert/strict`):
  - `rankAndPct`: 5 Gruppen mit 1W = [10,8,8,5,null] → Ränge 1,2,2,4; null fehlt; pct der Besten = 75 (n=4).
  - `buildHorizon` Schnittmenge: 10 Industries, pct [80,80] → nur Gruppen mit pct ≥ 80 in beiden Fenstern.
  - Sortierung: X (1W 2, 1M 15) und Y (1W 6, 1M 7) → Y vor X; Gleichstand weak → besserer Rang zuerst.
  - Aktienfilter: dvol 19.9 Mio fällt bei 20 raus, 20.0 Mio bleibt; ATR 4.99 raus, 5.0 bleibt; Reihenfolge nach dvol absteigend; Ticker ohne universe-Eintrag fällt raus.
  - Dedupe/Symbole: Theme-Mitglied `NYSE:BRK.B` und Industry-Ticker `BRK-B` → nur einmal, in der höher platzierten Gruppe; `tv` = `NYSE:BRK.B` (Exchange bekannt), unbekannt → `XYZ`.
  - `includeThemes: false` → keine Theme-Gruppen.
  - `universe: null` → `{groups: [], missingData: true}`.
  - `parseNum`: `"2,5"`→2.5, `""`→fallback, `"-1"`→fallback, `"abc"`→fallback.
  - `tvText`: zwei Gruppen → `"###Semis\nNASDAQ:NVDA\nAMD\n###Theme: AI\nPLTR\n"`; leer → `""`. `clipboardText` → `"NASDAQ:NVDA,AMD,PLTR"`.
- [ ] **Step 2:** `npm test` → neue Tests FAIL (Modul fehlt).
- [ ] **Step 3: Implement** die Exports oben in `docs/static/inPlayHorizon.js` (keine Imports aus `config.js` nötig — Defaults stehen im Modul).
- [ ] **Step 4:** `npm test` → PASS (alle Dateien).
- [ ] **Step 5: Commit** `feat(inplay): Horizont-Logik (Perzentil-Schnittmenge, Filter, TV-Export) + Tests`

### Task 3: Unterreiter, Ansicht und Export in der App

**Files:**
- Modify: `docs/index.html:303-305` (Lab-Panel)
- Modify: `docs/static/app.js` (Tab-Dispatch ~1436, Lab-Bereich ~4207–4245, i18n DE ~150–240 / EN ~450–540)
- Modify: `docs/static/style.css` (wenige Regeln, vorhandene Klassen bevorzugen)

**Interfaces:**
- Consumes: alles aus Task 2; `inplay_universe` aus Task 1 via `_leadersBars.inplay_universe`; `_lastIndustries`, `_etfData.themes`, `_leadersCons.themes`, `ensureLeadersData()`, `leadersDataDate()`, `prefGet/prefSet`, `showToast`, `flashDone`, `esc`, `t()`.
- Produces: `renderInPlay()` (Einstieg beim Klick auf den Top-Tab, ersetzt den direkten `renderLabTab()`-Aufruf in `.top-btn`-Handler), `_inPlaySub` (`"main"|"day"|"swing"|"position"`, Pref-Key `ipSub`).

- [ ] **Step 1: Markup.** Im Lab-Panel vor `#lab-container` eine Unterreiter-Leiste `#lab-subnav` (gleiche Button-Klassen wie `#industry-subnav`, `data-ipsub="main|day|swing|position"`, Labels „Main“, „1T ∩ 1W · Day“, „1W ∩ 1M · Swing“, „1M ∩ 3M · Position“) und einen Container `#inplay-container` (anfangs `hidden`).
- [ ] **Step 2: Dispatch.** `renderInPlay()`: aktiven Unterreiter markieren; `main` → `#inplay-container` verstecken, `#lab-container` zeigen, `renderLabTab()`; sonst umgekehrt und `renderInPlayHorizon(sub)`. Modul per `import("./inPlayHorizon.js?v=" + Date.now())` lazy laden (wie `themeMetrics.js`).
- [ ] **Step 3: `renderInPlayHorizon(sub)`.** `await ensureLeadersData()`; Prefs je Reiter: `ip_<sub>_pa`, `ip_<sub>_pb`, `ip_<sub>_dvol`, `ip_<sub>_atr`, `ip_<sub>_themes` (Fallback `DEFAULTS`, Werte via `parseNum`). `themeMembers` aus `_leadersCons.themes[*].tickers`; `exchangeOf` aus diesen Tickern (`normSym` → `"EX:SYM"`). Ausgabe:
  - Reglerzeile: zwei `<select>` (Label = TF-Namen des Reiters), zwei `<input type="text" inputmode="decimal">` ($-Vol Mio, ATR%), Checkbox „Themes einbeziehen“, Buttons „⬇ .txt“ und „⧉ Kopieren“. `change`-Event → Pref speichern, neu rendern (Freitext auf `change`, nicht `input`).
  - Meta: „Stand {leadersDataDate()} · {n} Aktien in {g} Gruppen“.
  - `missingData` → Hinweis „ATR-Daten folgen mit dem nächsten Post-Close-Lauf“ (DE/EN).
  - Je Gruppe eine Zeile: `#Platz`, Name (Theme mit Präfix „Theme: “), „{tf1} Rang r1 · {tf2} Rang r2“, dann Aktien als kompakte Chips `SYM $xxM · y.y%` (Symbol ohne Börsenpräfix anzeigen). Keine Charts.
- [ ] **Step 4: Export.** `.txt`: `tvText(groups)` als Blob, Dateiname `inplay_${HORIZONS[sub].file}_${leadersDataDate()}.txt`, Toast mit Anzahl. Kopieren: `navigator.clipboard.writeText(clipboardText(groups))`, `flashDone(btn)`, Toast „{n} Ticker kopiert“. Leeres Ergebnis → Toast „Keine Aktien – Filter lockern“, kein Download.
- [ ] **Step 5: Verify im Browser.** `.claude/launch.json` mit statischem Server für `docs/` anlegen, falls nicht vorhanden (z. B. `python -m http.server 8000 --directory docs`), `preview_start`, `?lab=1` öffnen. Prüfen: Main unverändert (Screenshot-Vergleich mit vor der Änderung); jeder Zeit-Reiter rendert ohne Konsolenfehler; mit lokaler `leaders_bars.json` ohne `inplay_universe` erscheint der Hinweis; Umschalten der Regler ändert die Liste und bleibt nach Reload erhalten; `.txt`-Inhalt beginnt mit `###`.
- [ ] **Step 6:** `npm test` und `python -m unittest discover tests` → PASS.
- [ ] **Step 7: Commit** `feat(inplay): Unterreiter Day/Swing/Position mit TradingView-Export`

### Task 4: Ausliefern

- [ ] **Step 1:** Datenlauf lokal nicht nötig; nach Push auf `main` (Projektregel: direkt nach main, kein PR) den nächsten Post-Close-Lauf abwarten bzw. `scrape.yml` per `workflow_dispatch` anstoßen und prüfen, dass `docs/data/leaders_bars.json` `inplay_universe` mit > 4.500 Zeilen enthält.
- [ ] **Step 2:** Live-Seite mit `?lab=1` öffnen, Swing-Reiter: Liste erscheint, Export funktioniert.
