# IPO-Unterreiter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fünfter Unterreiter „IPOs“ im In-Play-Tab: Ampel „IPO-Risikoappetit“ und eine Liste aller Neulinge (≤ 365 Tage) mit Pivot A/B, Basis-Kennzahlen, Status und TradingView-Export.

**Architecture:** `leaders.py` sammelt beim bestehenden Download die Tageskurse der Neulinge (ohne „Shell Companies“) plus SPY und den ETF `IPO` und schreibt `docs/data/ipo_bars.json`. Ein neues reines JS-Modul `ipoMetrics.js` rechnet Pivots, Status-Maschine, Index/Breite/Ausbruchs-Bilanz und Ampel. `app.js` rendert den Unterreiter (lazy geladen).

**Tech Stack:** Python 3 + yfinance (unittest), ES-Module mit `node --test`, statisches HTML/CSS.

**Spec:** `docs/superpowers/specs/2026-11-28-ipo-subtab-design.md`

## Global Constraints

- Neuling = erster Close-Bar innerhalb von 365 Kalendertagen vor dem letzten Datum; erster Bar der 2y-Historie (Index 0 der Master-Achse) ist **kein** Neuling.
- Industry „Shell Companies“ ausgeschlossen.
- Keine feste Tiefen-Grenze (nur Anzeige). Basis-Minimum 15 Handelstage. „Nahe Pivot“ ≤ 5 %. Ausbruchs-Status hält 5 Handelstage. Signal-Schwellen 50 % / 50 %, EMA 21, SMA 50 (bzw. alle vorhandenen Bars), „Ausbrüche halten“ braucht ≥ 3 Aktien.
- Ampel: grün ≥ 2 ✓, gelb 1, rot 0; „zu wenig Daten“ zählt nicht als ✓. ETF-Zeile nur Kontrolle.
- Filter $-Vol (Ø 50T, Default 20 Mio) und ATR% (14T, Default 5) wirken nur auf die Liste, nicht auf die Ampel; Prefs `ip_ipo_dvol`, `ip_ipo_atr`.
- Label „Konvention, unvalidiert“ sichtbar.
- Keine zusätzlichen Finviz- oder Exchange-Abrufe; `EXCHANGE:SYMBOL` nur aus Theme-Konstituenten.
- Fehler in der IPO-Sammlung dürfen nie RS-/In-Play-/Leader-Daten kosten.

## Review Focus

1. **`ipo_bars.json` fehlt** (vor dem ersten Lauf / 404) → Hinweis statt Fehler → Render-Pfad Task 3.
2. **Neuling mit < 15 Bars oder < 14 Bars vor dem Basis-Tief** → Status „zu frisch“, Verengung „—“, keine Exception → Test Task 2.
3. **Lücken (`null`) in Reihen** (Handelsstopp) → Funktionen überspringen sie, keine NaN in Anzeige → Test Task 2.
4. **Aktie macht täglich neue Hochs ohne Basis** → kein Ausbruch, zählt nicht in Signal 3 → Test Task 2.
5. **Weniger als 21 gemeinsame Tage für Index/EMA** → Signal 1 „zu wenig Daten“ → Test Task 2.

---

### Task 1: `ipo_bars.json` aus leaders.py

**Files:**
- Modify: `leaders.py` (Config, `fetch_bars_and_universe`, `build_leaders`, `write_leaders`)
- Test: `tests/test_leaders.py`

**Interfaces:**
- Produces: `first_bar_index(c: list) -> int | None` (erster Index mit Close ≠ None).
- Produces: `ipo_series(a: dict, master: list, cutoff: str, cfg) -> dict | None` — `a` = aligned `{c,h,o,l,v}`; liefert `{"first": "YYYY-MM-DD", "o","h","l","c","v"}` ab erstem Tag (Rundung wie `compact_series`), sonst None (kein Neuling, oder erster Index 0).
- Produces: Datei `docs/data/ipo_bars.json` = `{"schema_version":1, "date", "window_days":365, "dates":[...Master-Daten ab cutoff...], "bench":{"c":[...]}, "etf":{"symbol":"IPO","c":[...]}|null, "tickers":{SYM:{first,o,h,l,c,v}}}`. Ticker-Reihen enden am letzten Master-Datum; ihr Start = Index von `first` in `dates`.
- Produces: `build_leaders` gibt zusätzlich `ipo_out` zurück; `write_leaders` schreibt `IPO_PATH` und loggt Anzahl.

- [ ] **Step 1: Failing tests** (`TestIpoSeries`): erster Index; Neuling innerhalb cutoff → dict mit korrektem `first` und Längen; Historie ab Index 0 → None; erster Tag vor cutoff → None; alle Close None → None.
- [ ] **Step 2:** `python -m unittest tests.test_leaders -v` → FAIL (fehlende Funktionen).
- [ ] **Step 3: Implement.** Config `"IPO_WINDOW_DAYS": 365, "IPO_EXCLUDE_INDUSTRIES": ["Shell Companies"], "IPO_ETF": "IPO"`. In `build_leaders`: `ipo_set` = broad-Ticker ohne die der ausgeschlossenen Industries; an `fetch_bars_and_universe(keep, broad, cfg, ipo_set=...)` übergeben, `IPO_ETF` an die Download-Reihenfolge anhängen. In `_absorb`: IPO-Sammlung in **eigenem try/except je Ticker**; cutoff = `master[-1]` − 365 Tage; ETF-Reihe separat merken. Rückgabe von `fetch_bars_and_universe` um `ipo` und `etf` erweitern (Aufrufer anpassen). `IPO_PATH = DATA_DIR / "ipo_bars.json"`, kompakt geschrieben.
- [ ] **Step 4:** `python -m unittest discover tests` → OK.
- [ ] **Step 5: Commit** `feat(leaders): ipo_bars.json mit Neulingen, SPY und IPO-ETF`

### Task 2: `ipoMetrics.js`

**Files:**
- Create: `docs/static/ipoMetrics.js`, `docs/static/ipoMetrics.test.js`
- Modify: `package.json`, `.github/workflows/scrape.yml` (Testlisten)

**Interfaces:**
- Produces:
  - `IPO_CFG = { MIN_BASE: 15, NEAR_PCT: 5, HOLD_DAYS: 5, ATR_BARS: 14, SMA_BARS: 50, EMA_BARS: 21, BREADTH_MIN: 50, HOLD_MIN: 50, HOLD_MIN_N: 3, LOOKBACK: 20, VOL_BARS: 50 }`
  - `analyzeIpo(t, cfg = IPO_CFG) -> { first, bars, pivotB, pivotA, baseLow, baseLen, depthPct, distA, distB, atrNow, atrAtLow, status, near, breakout }` — `t = {first,o,h,l,c,v}`. `status ∈ "breakoutB"|"breakoutA"|"failed"|"near"|"base"|"fresh"`; `breakout = {kind:"A"|"B", day, pivot, volX, age} | null` (jüngster Ausbruch in den letzten `LOOKBACK` Bars, auch wenn bereits beendet — für Signal 3).
  - `riskAppetite(data, analyses, cfg) -> { signals: [{key:"index"|"breadth"|"hold", ok: true|false|null, value, detail}], score, light: "green"|"yellow"|"red", etf: {ok: true|false|null} }` — `data` = ipo_bars.json.
  - `buildIpoList(data, { minDvolM, minAtr, exchangeOf }) -> { rows: [{sym, tv, a: <analyzeIpo>, dvol, atr}], total, analyses }` sortiert: breakoutB, breakoutA, failed, near (Abstand aufsteigend), base, fresh; Filter dvol/atr über die letzten Bars (Ø c·v über min(50, n), ATR% 14).
  - `ipoTvText(rows) -> string` (`###Ausbruch` = breakoutA/B, `###Nahe Pivot`, `###Basis`; failed/fresh nicht exportiert; leer → `""`), `ipoClipboard(rows) -> string` (gleiche Ticker, kommasepariert).
- Status-Maschine `analyzeIpo` (Algorithmus, den die Signatur nicht festlegt) — Bars i = 0..n−1 vorwärts:
  ```
  hiB = h[0], hiIdx = 0, low = l[0], lowIdx = 0, hiA = null   // hiA = max High seit lowIdx
  bo = null (aktiver Ausbruch), last = null (jüngster Ausbruch), failedAt = null
  für i ≥ 1 (null-Bars überspringen):
    pivB = hiB; pivA = (hiA !== null && hiA < hiB) ? hiA : null   // Stand vor Bar i
    baseLen = i − hiIdx
    if bo:   bo.age++
             if c[i] < bo.pivot: failedAt = i; bo = null
             else if bo.kind === "A" && c[i] > pivB && baseLen ≥ MIN_BASE: bo = last = {kind:"B", day:i, pivot:pivB, volX, age:0}
             else if bo.age ≥ HOLD_DAYS: bo = null; hiB = max(h[hiIdx..i]); hiIdx = argmax; low = l[i]; lowIdx = i; hiA = null
    else if baseLen ≥ MIN_BASE:
             if c[i] > pivB:            bo = last = {kind:"B", ...pivot:pivB}
             else if pivA && c[i] > pivA: bo = last = {kind:"A", ...pivot:pivA}
    // Bar i in die Basis-Größen aufnehmen (nicht während aktivem Ausbruch: Pivots eingefroren)
    if !bo: if h[i] > hiB: hiB = h[i]; hiIdx = i; low = l[i]; lowIdx = i; hiA = null
            else: if l[i] < low: low = l[i]; lowIdx = i; hiA = null
                  else hiA = max(hiA ?? −∞, h[i])
  Status am letzten Bar: bo → "breakout"+bo.kind; failedAt ≥ n−HOLD_DAYS → "failed";
  baseLen < MIN_BASE → "fresh"; min(distA, distB) ≥ −NEAR_PCT → "near"; sonst "base".
  volX = v[i] / Ø v der bis zu VOL_BARS Bars vor i.
  ```
- [ ] **Step 1: Failing tests** mit synthetischem SNDK-Verlauf (Hilfsfunktion baut Bars aus Stützpunkten: Anstieg auf Hoch 7.30 an Tag 22, Fall auf 3.49 an Tag 37, Erholung auf 6.23 an Tag 94, Henkel 5.01 an Tag 119, Close 6.36 an Tag 138 mit 1.2× Vol, Close 7.81 an Tag 143 mit 4× Vol):
  - Abschnitt bis Tag 30 → `fresh`; bis Tag 120 → `base`, `pivotB = 7.30`, `pivotA = 6.23`, `depthPct ≈ −52.2`; Tag 137 (Close 6.10) → `near`; Tag 138 → `breakoutA`, `pivot 6.23`; Tag 143 → `breakoutB`, `pivot 7.30`, `volX ≈ 4`; Tag 146 mit neuem Hoch → weiterhin `breakoutB` mit gleichem Pivot; 6 Tage nach Tag 143 ohne Rückfall → nicht mehr breakout (Status `fresh`, neue Basis).
  - Fehlausbruch: Close fällt 2 Tage nach Ausbruch unter Pivot → `failed`.
  - Täglich neue Hochs ab Tag 1 → nie `breakout`, `breakout = null`.
  - `null`-Bar in der Basis → keine Exception, gleiche Pivots.
  - `atrAtLow` null, wenn Basis-Tief in den ersten 14 Bars.
  - `riskAppetite`: Index-Signal `null` bei < 21 gemeinsamen Tagen; Breite 2/3 über SMA → ok; „hold“ mit 2 Ausbrüchen → `null`; mit 3 (2 halten) → ok; Ampel-Zählung grün/gelb/rot.
  - `buildIpoList` Sortierung und Filter; `ipoTvText` Sektionen und `""` bei leer.
- [ ] **Step 2:** `node --test docs/static/ipoMetrics.test.js` → FAIL.
- [ ] **Step 3: Implement** in `docs/static/ipoMetrics.js` (keine Imports nötig; eigene kleine `atrPctAt(h,l,c,end,n)`).
- [ ] **Step 4:** `npm test` → alle PASS.
- [ ] **Step 5: Commit** `feat(ipo): ipoMetrics (Pivots, Status, Ampel) + Tests`

### Task 3: Unterreiter „IPOs“ in der App

**Files:**
- Modify: `docs/index.html` (Button `data-ipsub="ipo"` „🚀 IPOs“ in `#lab-subnav`), `docs/static/app.js` (IP_SUBS, `renderInPlay`, neuer Render-Block), `docs/static/style.css`

**Interfaces:**
- Consumes: Task 2 Exports; `ensureLeadersData()` (für `_leadersCons` → Exchange-Map), `prefGet/prefSet`, `leadDvol`, `esc`, `showToast`, `flashDone`.
- Produces: `renderIpoTab()`; `renderInPlay()` ruft sie für `sub === "ipo"`; `_ipoData` (lazy `fetch("data/ipo_bars.json?t=" + Date.now())`, Fehler → Hinweis „IPO-Daten folgen mit dem nächsten Post-Close-Lauf“).

- [ ] **Step 1:** Button + Dispatch; Lazy-Laden von Modul und Datei.
- [ ] **Step 2:** Render: Ampel-Kopf (Emoji + Text + Zählung, drei Signalzeilen mit ✓/✗/„zu wenig Daten“ und Werten, Kontrollzeile ETF, Label „Konvention, unvalidiert“); Reglerzeile ($-Vol, ATR%, .txt, Kopieren); Meta „Stand {data.dates.at(-1)} · {total} Neulinge · {n} nach Filter“; Tabelle mit Spalten Ticker, Erster Tag, B, A, Tiefe, Basis (T), Abst. A/B, Verengung (`atrAtLow → atrNow`), Status (inkl. „seit X T“, Vol-Faktor).
- [ ] **Step 3:** Export: Dateiname `inplay_ipo_{datum}.txt`; leere Liste → Toast.
- [ ] **Step 4: Verify im Browser** (`preview_start` „themetracker“, `/docs/?lab=1`): alle fünf Unterreiter schalten um, IPOs zeigt ohne Datei den Hinweis, mit Datei Ampel + Tabelle, keine Konsolenfehler (außer bekanntem Snapshot-404).
- [ ] **Step 5:** `npm test` + `python -m unittest discover tests` → grün. **Commit** `feat(ipo): Unterreiter IPOs mit Ampel und Basis-Liste`

### Task 4: Daten erzeugen und ausliefern

- [ ] **Step 1:** Leaders-Lauf lokal (Wochenende, Guard umgehen wie zuvor: `write_leaders(etf.themes, data.industries)`), Earnings aus dem vorigen `leaders_bars.json` übernehmen, falls der lokale Abruf leer bleibt.
- [ ] **Step 2:** Plausibilität: Anzahl Neulinge, Stichprobe einiger bekannter 2026-IPOs, Ampel-Werte; Ergebnis im Browser prüfen.
- [ ] **Step 3:** Commit Daten, `git fetch` + Fast-Forward-Check, `git push origin HEAD:main`, Live-Seite prüfen.
