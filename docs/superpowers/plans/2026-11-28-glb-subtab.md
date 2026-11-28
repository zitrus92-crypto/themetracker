# GLB-Unterreiter (Dr. Eric Wish) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unterreiter „🟢 GLB“ im In-Play-Tab: Green Line Breakouts nach Dr. Eric Wish mit Status, RWB-/Stage-2-Filter, Blue-Dot-Markierung und TradingView-Export.

**Architecture:** Neues Python-Modul `glb.py` mit reinen Funktionen (Green Line, GLB-Ereignis, Wochenreihe, RWB, Stage 2, Blue Dot, Status). `leaders.py` lädt vor dem Tages-Download Monatsbalken mit voller Historie (isoliert), ruft `glb.analyze` je Ticker in `_absorb` (eigenes try) und schreibt `docs/data/glb.json` zuletzt und isoliert. `app.js` zeigt nur an und filtert.

**Tech Stack:** Python 3 + yfinance (unittest), Vanilla JS, statisches HTML/CSS.

**Spec:** `docs/superpowers/specs/2026-11-28-glb-subtab-design.md` (bindend; enthält Quellen-URLs und markierte eigene Auslegungen)

## Global Constraints

- `auto_adjust=False` für Monats- und Tagesdaten.
- Green Line: Monats-Intraday-High; gültig ab dem Monat ATH-Monat + 4 (3 abgeschlossene Monate dazwischen ohne höheres High). Entstehung: jedes höhere Intraday-High setzt ATH und Uhr neu. Gültige Line bleibt trotz Intraday-Durchstoß, bis ein **Tagesschluss** darüber liegt (= GLB).
- Status: `glb_today`, `glb_holds` (GLB in letzten 63 Handelstagen, Close > Line des jüngsten GLB), `near` (gültige Line, Close ≥ Line · 0,95), `glb_failed` (GLB in letzten 63 T, Close ≤ Line). Andere Ticker werden nicht ausgeliefert.
- GLB-Volumen: Wochenvolumen der GLB-Woche / Ø der 10 Vorwochen (nur Anzeige).
- RWB (Wochenschluss): EMAs 3,5,8,10,12,15 alle > EMAs 30,35,40,45,50,60 **und** jede kurze EMA > ihr Vorwochenwert.
- Stage 2: letzter abgeschlossener Wochenschluss > SMA30(Wochen) und SMA30 > SMA30 von vor 4 Wochen.
- Blue Dot: %K10 (ohne Glättung) heute > 20 und gestern < 20; Markierung wenn in den letzten 3 Handelstagen.
- Universum: Industry-Ticker ohne „Shell Companies“ (= vorhandenes `ipo_set`); ohne Industry-Daten keine `glb.json`.
- Isolation: Fehler in Monats-Abruf, GLB-Rechnung oder GLB-Schreiben kosten nie Leader-/IPO-/In-Play-Daten.
- UI-Defaults: $-Vol ≥ 20 Mio, ATR% ≥ 0, RWB/Stage 2 aus; Prefs `ip_glb_*`. DE/EN. Eigene Auslegungen im Erklärtext gekennzeichnet, Glossar-Link.
- Keine zusätzlichen Finviz-/Exchange-Abrufe; `EXCHANGE:SYMBOL` nur aus Theme-Konstituenten.

## Review Focus

1. **Aktie mit ATH vor dem 2y-Fenster** (z. B. GME, SMCI): Line muss aus der Monatshistorie kommen; Test in Task 1 (`line_from_history`).
2. **Intraday-Durchstoß ohne Schluss darüber** bei gültiger Line → Line bleibt, späterer Schluss darüber = GLB; Test Task 1.
3. **Lücken (None) in Tagesreihen / fehlende Monatsdaten eines Tickers** → Ticker übersprungen oder Lücke ignoriert, keine Exception; Test Task 1.
4. **Monats-Abruf wirft komplett** → Leader-Dateien trotzdem geschrieben, keine neue glb.json; Test Task 2.
5. **Letzte Woche unvollständig** (Daten nicht am Freitag) → RWB/Stage 2 nutzen die Vorwoche; Test Task 1.

---

### Task 1: `glb.py` (reine Logik) + Tests

**Files:** Create `glb.py`, `tests/test_glb.py`.

**Interfaces (Produces):**
- `GLB_CFG = {"LINE_MONTHS": 3, "HOLD_DAYS": 63, "NEAR_PCT": 5.0, "VOL_WEEKS": 10, "RWB_SHORT": [3,5,8,10,12,15], "RWB_LONG": [30,35,40,45,50,60], "SMA_WEEKS": 30, "SMA_SLOPE_WEEKS": 4, "STOCH_N": 10, "BLUE_LEVEL": 20, "BLUE_DAYS": 3}`
- `monthly_from_df(df) -> list[tuple[str, float|None, float|None]]` — `[(YYYY-MM, high, close)]` aus einem yfinance-Monats-DataFrame (NaN → None).
- `scan_green_line(monthly, dates, h, c, cfg) -> dict` — `monthly`: abgeschlossene + laufende Monate; `dates/h/c`: auf SPY ausgerichtete 2y-Tagesreihen (None = Lücke). Algorithmus:
  ```
  Monatsphase: alle Monate < erster *voller* Tagesmonat (Tagesmonat beginnt mit dem ersten Datum des Monats in dates)
    state: ath, ath_ym, line=None, line_since=None
    je Monat (ym, H, C), H None -> überspringen:
      if line is None and ath and months_between(ath_ym, ym) >= 4: line, line_since = ath, ath_ym
      if line is not None and C is not None and C > line:   # historischer GLB (Monatsschluss als Näherung)
          line = None; ath = max(ath, H); ath_ym = ym  (wenn H >= ath)
      elif H > (ath or -inf): ath, ath_ym = H, ym          # bei gültiger Line: Line bleibt
  Tagesphase: je Tag i ab erstem vollen Tagesmonat, h/c None -> überspringen:
      ym = dates[i][:7]
      if line is None and ath and months_between(ath_ym, ym) >= 4: line, line_since = ath, ath_ym
      if line is not None and c[i] > line: events.append({i, line, line_since}); line = None
      if h[i] > ath: ath, ath_ym = h[i], ym
  Rückgabe: {"line", "line_since", "ath", "ath_ym", "events": [...]}   # months_between("2026-03","2026-07") = 4
  ```
- `weekly(dates, c, v) -> (wk_close: list, wk_vol: list, last_complete: bool)` — Gruppierung nach ISO-Woche, letzter gültiger Close / Summe Volumen; `last_complete` = letztes Datum ist ein Freitag.
- `ema_series(x, n) -> list` (Seed = erster Wert), `rwb(wk_close, cfg) -> bool|None`, `stage2(wk_close, cfg) -> bool|None` (None bei zu wenig Wochen), beide auf abgeschlossenen Wochen.
- `blue_dot_recent(h, l, c, cfg) -> bool`.
- `analyze(monthly, dates, h, l, c, v, cfg=GLB_CFG) -> dict | None` — Zeile für `glb.json` oder None (kein relevanter Status): `{"gl", "gl_since", "close", "dist_pct", "status", "glb_date", "glb_volx", "rwb", "stage2", "blue_dot"}`. `gl` = Line des jüngsten GLB (bei `glb_*`) bzw. gültige Line (bei `near`); `dist_pct` = Close/gl − 1 in %.

- [ ] **Step 1: Failing tests** (`tests/test_glb.py`, unittest, synthetische Reihen):
  - `months_between`; `monthly_from_df` mit NaN.
  - Line-Bildung: ATH im März, April–Juni tiefer → Line gültig ab Juli, nicht im Juni.
  - Reset bei Entstehung: höheres High im Mai → Line erst ab September.
  - `line_from_history`: ATH 2022 (Monatsphase), 2y-Tagesdaten darunter, letzter Close 3 % unter Line → `near`, `gl` = ATH 2022.
  - Intraday-Durchstoß (High > Line, Close < Line) → Line bleibt; 3 Tage später Close > Line → GLB an diesem Tag, `status` `glb_today` wenn letzter Tag.
  - `glb_holds` (GLB vor 20 Tagen, Close über Line), `glb_failed` (Close darunter), GLB vor 70 Tagen → kein `glb_*` (ggf. None).
  - Wochen-Volumenfaktor: GLB-Woche 2× Ø → `glb_volx ≈ 2.0`.
  - `weekly` mit Nicht-Freitag-Ende → `last_complete False`; RWB/Stage 2 ignorieren die angebrochene Woche.
  - RWB true bei stetigem Anstieg, false bei Seitwärts/Abwärts, false wenn eine kurze EMA fällt.
  - Stage 2 true/false; None bei < 34 Wochen.
  - Blue Dot: %K von 15 auf 25 vorgestern → true; nur vor 5 Tagen → false.
  - Lücken: None-Tage überspringen ohne Exception; Ticker ohne Monatsdaten → `analyze` None.
- [ ] **Step 2:** `python -m unittest tests.test_glb -v` → FAIL (Modul fehlt).
- [ ] **Step 3: Implement** `glb.py` gemäß Interfaces.
- [ ] **Step 4:** `python -m unittest discover tests` → OK.
- [ ] **Step 5: Commit** `feat(glb): Green-Line-Logik nach Dr. Eric Wish + Tests`

### Task 2: Integration in `leaders.py`

**Files:** Modify `leaders.py`; Test `tests/test_leaders.py`.

**Interfaces:**
- Consumes: `glb.monthly_from_df`, `glb.analyze`, `inplay_summary` (für `dvol50`, `atr14`).
- Produces: `fetch_monthly(tickers, cfg) -> dict | None` (150er-Blöcke, `period="max", interval="1mo", auto_adjust=False`; Ausnahme im Ganzen → None, einzelner Blockfehler → Block fehlt); `fetch_bars_and_universe(..., glb_monthly=None)` liefert zusätzlich `glb_rows` (dict); `build_leaders` erzeugt `glb_out` oder None; `write_leaders` schreibt `GLB_PATH = DATA_DIR / "glb.json"` zuletzt in eigenem try.
- `glb_out = {"schema_version": 1, "date", "data_date": master[-1], "source": "https://wishingwealthblog.com/glossary/", "cfg": GLB_CFG, "rows": {SYM: {...analyze-Zeile, "dvol50", "atr14"}}}`.

- [ ] **Step 1: Failing tests:** `fetch_monthly` mit gemocktem `yf.download`, das wirft → None; `write_leaders` mit `glb_out=None` schreibt Leader-Dateien und keine glb.json; GLB-Schreibfehler (gemockter Pfad) → Leader-Dateien existieren (analog `TestWriteOrder`).
- [ ] **Step 2:** Tests laufen → FAIL.
- [ ] **Step 3: Implement.** In `build_leaders`: `glb_monthly = fetch_monthly(sorted(ipo_set), cfg)` in try (Log mit Dauer/Anzahl); an `fetch_bars_and_universe` übergeben; in `_absorb` für `tk in ipo_set and glb_monthly and tk in glb_monthly` → `glb.analyze(...)` in eigenem try; Zeile + `inplay_summary`-Werte in `glb_rows`. `glb_out` nur wenn `glb_monthly` nicht None und Industries vorhanden.
- [ ] **Step 4:** `python -m unittest discover tests` → OK.
- [ ] **Step 5: Commit** `feat(leaders): glb.json aus Monats-Historie + Tagesdaten, isoliert`

### Task 3: Unterreiter „🟢 GLB“

**Files:** Modify `docs/index.html` (Button `data-ipsub="glb"`), `docs/static/app.js` (`IP_SUBS`, `renderInPlay`, `renderInPlaySub`, neuer Block `renderGlbTab`, Export), `docs/static/style.css` (falls nötig).

**Interfaces:** Consumes `data/glb.json` (lazy fetch, 404 → Hinweis „GLB-Daten folgen mit dem nächsten Post-Close-Lauf“), `ensureLeadersData()` für Exchange-Map, `prefGet/prefSet`, `leadDvol`, `esc`, `showToast`, `flashDone`. Produces `renderGlbTab()`.

- [ ] **Step 1:** Button + Dispatch (wie IPO-Reiter, inkl. `renderInPlaySub` und Daten-Reset in loadData).
- [ ] **Step 2:** Render: Titel „🟢 In Play · GLB (Dr. Eric Wish)“, Erklärtext mit Regeln, Kennzeichnung eigener Auslegungen, Link Glossar; Reglerzeile ($-Vol, ATR%, Checkbox „nur RWB“, „nur Stage 2“, .txt, Kopieren); Meta „Stand {data_date} · {n} Kandidaten · {m} nach Filter“; Tabelle: Ticker (Finviz-Link), Green Line, seit, Close, Abstand, GLB am, Vol (Woche), RWB ✓/✗/—, Stage 2, 🔵, Status. Sortierung: glb_today; glb_holds mit Blue Dot; glb_holds; near (Abstand absteigend = am nächsten zuerst); glb_failed.
- [ ] **Step 3:** Export .txt `###GLB heute`, `###GLB hält · Blue Dot`, `###GLB hält`, `###Nahe Green Line` (ohne Fehl-GLB), Clipboard gleiche Ticker; leer → Toast; Dateiname `inplay_glb_{data_date}.txt`.
- [ ] **Step 4: Verify im Browser** (`preview_start` „themetracker“, `/docs/?lab=1`): alle sechs Unterreiter schalten; GLB ohne Datei → Hinweis; mit Datei → Tabelle, Filter wirken, keine neuen Konsolenfehler.
- [ ] **Step 5:** `npm test`, `python -m unittest discover tests` → grün. **Commit** `feat(glb): Unterreiter GLB mit RWB/Stage-2-Filter und Blue Dot`

### Task 4: Daten erzeugen, Plausibilität, ausliefern

- [ ] **Step 1:** Leaders-Lauf lokal (wie zuvor), Earnings aus dem vorigen `leaders_bars.json` übernehmen, falls leer.
- [ ] **Step 2:** Plausibilität: Anzahl je Status; 3–5 Stichproben (mind. eine Aktie mit ATH vor 2y-Fenster) gegen Monatschart prüfen; Größe `glb.json`.
- [ ] **Step 3:** Commit Daten, Fast-Forward-Check, `git push origin HEAD:main`, Live prüfen.
