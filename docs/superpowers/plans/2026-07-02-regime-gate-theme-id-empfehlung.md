# Review-Ergebnis: Regime-Gate & Theme-Identifikation

**Datum:** 2026-07-02 (nach Grilling-Interview mit Chris finalisiert)
**Grundlage:** [regime-gate-theme-identifikation.md](../specs/regime-gate-theme-identifikation.md), vollständige Code-Durchsicht (scraper.py, scores.py, scrape.py, app.js, index.html, scrape.yml, swing-routinen.md, leader-analyst-prompt.md, alle vier JSON-Payloads) sowie Live-Verifikation der Datenquellen (Stockbee-Sheet, Finviz-Quote-Seiten).
**Status:** Vom Grilling-Interview bestätigter Scope — **nur das Regime-Gate (Modul A) wird gebaut, ganz Modul B ist gestrichen.** Implementierung wartet auf finale Freigabe.

---

## Schritt 1 — Bestandsaufnahme (kompakte Karte)

### Pipeline & Datenfluss

```
GitHub Actions (scrape.yml, 4× täglich um US-Close, Mo–Fr)
  └─ scrape.py → scraper.py (Finviz-Scraping) + scores.py (Rang-Score)
       ├─ docs/data.json      ~145 Industries: composite, acceleration(3M−1W),
       │                      ranks{5 TF}, perfs{5 TF}, tickers[]
       ├─ docs/etf_data.json  40 Themes + 268 Sub-Themes: perfs, score, rank,
       │                      top3, tickers[]
       ├─ docs/etf_perf.json  32 ETFs (inkl. QQQ, SPY): nur perfs{5 TF}
       └─ docs/history.json   95 Tage × Industries: {c: composite, a: accel, t: slug}
GitHub Pages (statisch) → docs/static/app.js rendert alles client-seitig
```

### Wo wird was berechnet vs. manuell gesetzt?

| Artefakt | Ort | Art |
|---|---|---|
| Composite-Score (1M×70+1W×20+3M×10, Rang-basiert) | scores.py (Industries), scraper.py (Themes), app.js (ETFs) | berechnet |
| Accel Industry (Rang3M−Rang1W) | scores.py | berechnet |
| Accel Theme/Sub/ETF (Rang3M−Rang1M) | app.js `computeAccel()` | berechnet, client-seitig |
| Matrix-Quadranten Fresh/Trending/Fading/Dead | app.js, Median-Split 3M/1M | berechnet, client-seitig |
| INST-Badge (Top 40 in 1M ∧ 3M) | app.js `isInst()` | berechnet |
| Setup-Picks-Filter (Score Top 40 + Accel>0 + 1W>1% + 1M>0%) | app.js `renderPicks()` | berechnet |
| Top-20%- & Schnittmengen-Buttons (1W∩1M, 1M∩3M) | app.js | berechnet |
| Movers Rising/Fading (Rang-Delta aus History) | app.js `computeMovers()` | berechnet |
| JSON-Export mit `type`-Stempel | app.js `exportSelectionJson()` | berechnet |
| **Regime-Einschätzung (Risk-On/Neutral/Risk-Off)** | swing-routinen.md, Wochenend-Schritt 1 | **manuell** (Bubble-Wolke lesen, Notiz auf Papier) |
| **Wochenfokus-Liste (3–5 Themes/Industries)** | swing-routinen.md, Papier-Template | **manuell** |
| **Leader-Auswahl** | Chart (TradingView/Deepvue), explizit NICHT im Tool | **manuell** |

### Zentrale Befunde

1. **Die in der Spec als „bestehend" beschriebenen Theme-States `STRONG`/`PULLBACK`/`IMPROVING`, die „Vier-Quadranten-Aktionsmatrix" als Entry-/Trail-Steuerung und die Sizing-Tiers existieren nirgends im Repo-Code.** Was tatsächlich existiert: die Median-basierte Fresh/Trending/Fading/Dead-Matrix, die 1W∩1M-/1M∩3M-Schnittmengen-Buttons und die Regeln in swing-routinen.md (Papier-/Kopf-Ebene). Die Empfehlungen unten mappen deshalb auf die realen Artefakte. Spec-Constraint 3 („Quadranten-Logik nicht brechen") wird als „Matrix + Schnittmengen-Buttons + Accel nicht anfassen" gelesen.
2. **Es gibt keinerlei Per-Stock-Daten.** `tickers` sind reine Symbol-Listen. Keine Kurse, keine MAs, keine RS-Werte, keine Hochs, keine Earnings-Daten pro Aktie. Alle Kennzahlen sind Gruppen-Ebene.
3. **Es gibt keinen Persistenz-Layer im Frontend.** Kein localStorage, keine Eingabefelder. Alles ist read-only-Rendering der Scraper-JSONs.
4. **Architektur-Grundkonflikt für Modul B:** Manuelle Felder müssten client-seitig leben (localStorage), Berechnungen leben im Scraper (GitHub Actions). Die beiden sehen einander nicht. Jedes Feature, das manuelle Tags mit berechneten Signalen *verknüpft* (Leader-Bruch-Flag, EXHAUSTED-Bestätigung, THESE→Trail-Legitimität), ist strukturell teuer. Manuelle Felder funktionieren gut als Checkliste/Notiz — nicht als Input für Scraper-Logik.
5. **Datenquellen sind ausschließlich Finviz-Scraping.** Kein Deepvue-/TradingView-Import existiert. Der Scrape ist bereits lang (~310 sequenzielle Ticker-Requests mit Höflichkeits-Sleeps) und rate-limit-sensibel — jede Erweiterung muss mit Requests geizen.

---

## Schritt 2 — Gap-Analyse

### Modul A: Regime-Gate — **gar nicht vorhanden** (nur manueller Routine-Schritt)

| Input laut Spec | Verfügbar? | Realistische Quelle |
|---|---|---|
| T1: Close > 21-EMA (QQQ) | ❌ | Finviz `quote.ashx?t=QQQ` Snapshot enthält SMA20/SMA50/SMA200-Distanz. **Kein EMA verfügbar → SMA20 als Proxy** (Abweichung kennzeichnen). 1 Request. |
| T2: Close > 50-SMA | ❌ | dito, exakt verfügbar (SMA50-Distanz). Gleicher Request. |
| B1: Breadth %>50-MA (`NDFI`/`MMFI`) | ❌ | TradingView-Symbole sind nicht scrapebar. **Proxy: Finviz-Screener-Count** (`f=idx_ndx,ta_sma50_pa` → „Total"-Zahl / 100 = NDX-Breadth). 1–2 Requests. Alternativ manuelles Tagesfeld (~10 Sek. Ablesen in TradingView). |
| Hysterese (2 EOD-Bestätigungen) | ❌ | Braucht Regime-History → neues Feld im Scrape-Output (z. B. `regime`-Block in history.json-Einträgen oder separates regime.json). Trivial. |

**Fazit:** Vollständig machbar mit 2–3 zusätzlichen Finviz-Requests, komplett im bestehenden Scraper-Muster. Bestes Nutzen-pro-Aufwand-Verhältnis der ganzen Spec. Die „Wirkung" (Tiers reduzieren, Add-ons sperren) kann nur Text/Anzeige sein — der Tracker kennt keine Positionen oder Orders.

### Modul B, Stufe 1 — Emergenz-Detektion: **teilweise vorhanden (funktionales Äquivalent)**

Accel ≥ 10, First-Flag-Quadrant und Movers-Rising *sind* bereits Emergenz-Detektoren auf Gruppen-Ebene — rang-basiert statt cluster-basiert, aber dieselbe Frage („war schwach, dreht frisch an").

Die drei Spec-Kriterien im Einzelnen:
- **≥3 Aktien am neuen 20T/52W-Hoch:** Per-Stock-Hochs fehlen. Screener-Count-Proxy möglich (`theme_X` + `ta_highlow20d_nh` → Zähler pro Theme): +40 Requests für Themes machbar, +268 Sub-Themes / +145 Industries reißt das Rate-Limit. → 1 Kriterium teilweise machbar.
- **≥3 Aktien im obersten RS-Dezil:** Finviz hat kein RS-Rating (das ist IBD/Deepvue). Per-Stock-Perf-Ranking würde Screener-Exporte pro Theme erfordern → nicht realistisch. ❌
- **≥2 Earnings-Gaps >8% in 15 Tagen:** Braucht Earnings-Daten + Gap-Erkennung pro Aktie. Keine realistische EOD-Quelle im Tracker. ❌

### Modul B, Stufe 2 — Leader-Identifikation: **gar nicht — und bewusst nicht**

„Erster am Hoch" und „flachster Pullback" brauchen Per-Stock-Zeitreihen, die es nicht gibt. Wichtiger: swing-routinen.md (Goldene Regel 5) und der Leader-Analyst-Prompt legen die Leader-Auswahl *explizit* auf den Chart und auf Chris — „Claude bewertet KEINE Leader", weil eine RS-Tabelle die am weitesten gelaufene Aktie nach oben spült (genau falsch für Fresh-Breakout-Stil). Eine Auto-Leader-Logik würde eine bewusste Design-Entscheidung des bestehenden Systems rückgängig machen.
`FEARED_BY` als manuelles Freitextfeld ist dagegen billig — gehört als Formularfeld ins Fokus-Panel (siehe Empfehlung 2), nicht als Berechnung.

### Modul B, Stufe 3 — Katalysator-Pflichtfeld: **gar nicht vorhanden, voll machbar**

Rein manuell, kein Daten-Input nötig. Braucht nur client-seitige Persistenz (localStorage). Passt exakt auf die bestehende Wochenfokus-Liste, die heute als Papier-Template in swing-routinen.md lebt. `THESE` vs. `MOMENTUM_ONLY` ist ein abgeleitetes Anzeige-Tag (Feld ausgefüllt ja/nein) — die Konsequenzen (engerer Trail, keine Add-ons) bleiben Text-Hinweis, keine Logik.

### Modul B, Stufe 4 — Erschöpfungs-Erkennung: **gar nicht; 1 von 3 Flags machbar**

- **Breadth-Extrem (>90% über 50-MA):** machbar per Screener-Count je Theme (gleicher Mechanismus wie Regime-B1, +40 Requests). ✅
- **Nachzügler-Rallye (RS-schwächste 30% outperformen Leader über 10 Tage):** braucht Per-Stock-RS-Zeitreihen. ❌
- **Leader-Bruch (Leader verliert 50-MA):** braucht Leader-Tags, die im localStorage leben und für den Scraper unsichtbar sind → Architektur-Konflikt (Befund 4). Der tägliche Chart-Blick auf 3–5 Fokus-Namen ist schneller als jede Lösung dieses Konflikts. ❌

---

## Schritt 3 — Finalisierte Empfehlung (nach Grilling-Interview)

### Bauen: Regime-Gate-Badge (Modul A) — alle Design-Entscheidungen getroffen

**Was:** Scraper berechnet täglich `RISK_ON`/`NEUTRAL`/`RISK_OFF` aus drei automatischen Inputs, Frontend zeigt Badge + situatives Banner. Null manueller Abend-Aufwand.

**Inputs (alle live verifiziert am 2026-07-02):**

| Input | Quelle | Details |
|---|---|---|
| T1: QQQ > SMA20 | Finviz `quote.ashx?t=QQQ` (redirectet auf `/stock?t=QQQ`) | Snapshot-Tabelle enthält SMA20/SMA50-Distanz in %, positiv = darüber. Verifiziert: SMA20 +0,34 %, SMA50 +2,46 %. **SMA20 als Proxy für die Spec-21-EMA** (Finviz bietet keine EMA) — Entscheidung Chris. 1 Request. |
| T2: QQQ > SMA50 | gleicher Request | exakt wie Spec. |
| B1: Breadth | **Stockbee Market Monitor** (Entscheidung Chris) — publiziertes Google Sheet, als CSV ziehbar: `docs.google.com/spreadsheet/pub?key=0Am_cU8NLIU20dEhiQnVHN3Nnc3B1S3J6eGhKZFo0N3c&output=csv` | Spalte **T2108** = % Aktien über 40-Tage-MA, Worden-Universum ~6.500 Aktien. Verifiziert: tagesaktuell gepflegt (Zeile 1.7.2026: T2108 = 50,51). Abweichung zur Spec (50-MA, NDX) von Chris akzeptiert; Schwellen 50 %/40 % bleiben UNVALIDIERT-Defaults. Bonus: Sheet liefert 4 %-Up/Down-Zähler und 5/10-Tages-Ratios für spätere Erweiterungen. 1 Request. |
| IWM-Status (nur Info) | Finviz-Quote IWM | Wird **nicht** ins Gate gerechnet, nur im Tooltip angezeigt (Entscheidung Chris: „QQQ-Gate + IWM im Tooltip"). Begründung: T2108 deckt die Average-Stock-Dimension bereits ab; IWM als Gate hätte in engen Growth-Märkten falsche RISK_OFF-Signale erzeugt. 1 Request. |

**State-Logik:** Wie Spec-Tabelle (RISK_ON = T1 ∧ T2 ∧ B1 > 50; NEUTRAL = T2 ∧ (¬T1 ∨ B1 40–50); RISK_OFF = ¬T2 ∨ B1 < 40). Hysterese: Hochstufung erst nach 2 aufeinanderfolgenden EOD-Bestätigungen, Wechsel in RISK_OFF sofort. Alle Schwellen in einem CONFIG-Block in scraper.py mit `# DEFAULT — UNVALIDIERT`.

**Stale-Daten-Regel (Entscheidung Chris):** Gate rechnet mit der jüngsten verfügbaren T2108-Zeile, Tooltip zeigt deren Datum („Breadth: Stand 1.7."). Ist die Zeile älter als 3 Handelstage → Badge grau „DATEN VERALTET", kein stilles Weiterlaufen. Ehrlicher Nebeneffekt: Bei staler Breadth kann sich die Sofort-Abstufung nach RISK_OFF um einen Tag verzögern — akzeptiert. Scheitert der Finviz-Quote-Fetch, gilt dieselbe Grau-Regel.

**UI (Entscheidung Chris):** Dauerhaftes Badge im Header (Farbe + Zustand; Tooltip mit T1/T2/B1-Werten, Datenständen, IWM-Status und Wirkungstext „Tiers −1, keine Add-ons" etc.). Zusätzlich **nur bei RISK_OFF** ein schmales Banner über den Setup-Picks: „RISK_OFF — keine neuen Entries". Keine Dämpfung/Ausgrauung der Picks-Liste (bleibt für Positions-Verwaltung lesbar).

**Persistenz & Export:** Neues `docs/regime.json` mit Tages-Einträgen `{date, t1, t2, b1, b1_date, raw_state, effective_state}` (Hysterese läuft über die Datums-Reihe; idempotente Re-Runs überschreiben den Tageseintrag wie bei history.json). Aktuelles Regime wird in den JSON-Export gestempelt, damit der Leader-Analyst es sieht.

- **Dateien:** scraper.py (+~120 Z.: QQQ/IWM-Quote-Fetch, Stockbee-CSV-Fetch, State-Maschine, CONFIG-Block), scrape.py (Aufruf + regime.json), app.js/index.html/style.css (+~80 Z.: Badge, Banner, Export-Stempel), requirements.txt unverändert (requests reicht, CSV per stdlib).
- **Daten-Input:** 3 zusätzliche Requests (QQQ, IWM, Stockbee-CSV), null manueller Aufwand.
- **Umfang:** klein (halber Tag inkl. Fehlerpfade).
- **Abend-Workflow-Änderung:** Wochenend-Schritt 1 („Bubble-Wolke lesen, Regime notieren") bekommt einen objektiven täglichen Wert; die Tages-Routine sieht die Ampel beim Öffnen. Kein neuer Handgriff.

### Nicht-bauen-Liste (final, inkl. Grilling-Streichungen)

| Spec-Teil | Begründung (ein Satz) |
|---|---|
| **Stufe 2: Leader-Auto-Identifikation** (erster am Hoch, flachster Pullback, Komposit-Rang) | Braucht Per-Stock-Zeitreihen, die es nicht gibt, und widerspricht der bewussten Design-Entscheidung „Claude filtert, du pickst — Leader entscheidet der Chart" (swing-routinen.md Regel 5, Leader-Analyst-Prompt). |
| **Stufe 2: FEARED_BY-Feld** *(im Grilling gestrichen)* | Chris: ohne Zugang zu Management-Aussagen aus Earnings-Calls ist das Feld totes Gewicht — es gäbe schlicht nichts einzutragen. |
| **Stufe 3: Katalysator-Feld / THESE vs. MOMENTUM_ONLY** *(im Grilling gestrichen)* | Chris kann Katalysatoren nicht zuverlässig beschaffen (keine tägliche Recherche-Zeit); die Alternative Leader-Analyst-Recherche wurde angeboten und abgelehnt — Stufe 3 entfällt komplett. |
| **Wochenfokus-Panel mit Rauswurf-Check** *(im Grilling gestrichen)* | Nach Wegfall von Katalysator/FEARED_BY blieb nur Fokus-Liste + ✓/✗-Check; Chris bewertet das den Aufwand nicht wert — Papier-Template bleibt. |
| **Breadth-Spalte je Theme (Ex-Empfehlung 3)** | Nice-to-have hinter Fading-Quadrant; nicht im freigegebenen Scope (1+2 gewählt, 2 später gestrichen → nur 1). |
| **Stufe 1: RS-Dezil- und Earnings-Gap-Kriterien** | Keine realistische Datenquelle (Finviz hat kein RS-Rating, keine Gap-Historie); Accel ≥ 10 + First-Flag-Quadrant leisten die Gruppen-Emergenz bereits. |
| **Stufe 1: New-High-Cluster-Zählung** | Nur für 40 Themes ohne Rate-Limit-Risiko machbar und dann weitgehend redundant zu Accel/Matrix — Grenznutzen rechtfertigt die Scrape-Fragilität nicht. |
| **Stufe 4: Nachzügler-Rallye & Leader-Bruch-Flags** | Brauchen Per-Stock-RS-Zeitreihen bzw. die Verknüpfung manueller localStorage-Tags mit dem Scraper (Architektur-Konflikt); der tägliche Chart-Blick auf 3–5 Fokus-Namen ist schneller. |
| **EXHAUSTED-State-Maschine mit Bestätigungs-Workflow** | Ein weiterer State-Layer über der Matrix ist Overengineering für ein Ein-Personen-Abend-Tool. |
| **Sizing-Tier-Automatik / Trail-Umschaltung** | Der Tracker kennt weder Positionen noch Orders; Sizing/Trails leben in Chris' IBKR-Regeln — Text-Hinweis am Regime-Badge genügt. |
| **SPX-Zweitprüfung / IWM als zweites Gate** | QQQ + T2108 decken Leadership und Breite komplementär ab; IWM läuft nur informativ im Tooltip mit (Entscheidung Chris). |
| **News-Aggregation im Tracker** | Verletzt Spec-Constraint 4 (keine Prognose-Module) und lieferte ohne LLM nur rohe Headline-Listen statt Thesen. |

**Fazit zu Modul B:** Nach dem Grilling ist Modul B vollständig gestrichen — kein Teil davon überlebt weder die Datenlage (Stufen 1, 2, 4) noch den Praxistest des Abend-Workflows (Stufe 3, Panel). Die Emergenz-/Erschöpfungs-Fragen bleiben durch die vorhandenen Artefakte (Accel, First-Flag-/Fading-Quadrant, Movers) auf Gruppen-Ebene abgedeckt.

---

## Schritt 4 — Entscheidungs-Log des Grilling-Interviews (2026-07-02)

Alle ursprünglich offenen Fragen sind entschieden:

| # | Frage | Entscheidung Chris |
|---|---|---|
| 1 | States-Diskrepanz (STRONG/PULLBACK/IMPROVING nicht im Code) | Auf reale Artefakte mappen; kein States-Modell in den Tracker. |
| 2 | Scope | Zunächst 1+2; nach Streichung von Katalysator/FEARED_BY/Panel: **nur Empfehlung 1**. |
| 3 | Breadth-Quelle | **Stockbee Market Monitor** (T2108 via publiziertem Google-Sheet-CSV) — von Chris eingebracht, Scrapebarkeit live verifiziert. Abweichung 40-MA/Gesamtmarkt akzeptiert. |
| 4 | T1-Proxy | SMA20 statt 21-EMA akzeptiert. |
| 5 | Referenzindex | QQQ schaltet das Gate, IWM nur informativ im Tooltip. |
| 6 | Stale-Daten | Jüngste verfügbare Zeile + Datumsanzeige; > 3 Handelstage alt → Badge grau „DATEN VERALTET". |
| 7 | Regime-UI | Badge im Header + RISK_OFF-Banner über den Setup-Picks; keine Dämpfung der Picks. |
| 8 | FEARED_BY | Gestrichen (keine Management-Aussagen verfügbar). |
| 9 | Katalysator-Beschaffung | Weder manuell noch via Leader-Analyst — Stufe 3 komplett gestrichen. |
| 10 | Wochenfokus-Panel (Restumfang) | Nicht bauen; Papier-Template bleibt. |

**Nächster Schritt:** Finale Freigabe durch Chris, dann Implementierung des Regime-Gate-Badge exakt nach Abschnitt „Schritt 3 — Finalisierte Empfehlung".

---

## Nachtrag: Validierung & Praxis-Regeln (Backtest + zweites Grilling, 2026-07-02)

Implementiert, gepusht, live. Danach mit `backtest_regime.py` (QQQ 2015–heute via yfinance, exakt die implementierte Logik inkl. Hysterese; Stockbee-Fenster Dez 2025–Jul 2026 mit echtem T2108) validiert:

**Befunde:**
- Vor **80 %** der 40 schlimmsten QQQ-Tage stand das Gate am Vorabend auf RISK_OFF (72 %) oder NEUTRAL (8 %). Die restlichen 20 % sind der strukturell unvermeidbare „erste Crash-Tag" — dafür sind Stops zuständig, nicht das Gate.
- **Tiefe Drawdowns (>15 %):** praktisch 100 % RISK_OFF-Abdeckung (Dez 2018, COVID 2020, Anfang 2022, April 2025) — **außer** im langen 2022er-Bär (277 Tage): dort nur 49 % RISK_OFF / 41 % RISK_ON, weil Bärenrallyes die Trend-Beine reaktivieren.
- **T2108 liefert echten Mehrwert:** Vor den zwei schlimmsten Tagen 2026 (−4,8 % am 4.6., −3,3 % am 22.6.) sagten die Trend-Beine noch RISK_ON, das volle Gate stand auf RISK_OFF/NEUTRAL.
- **Kostenseite:** RISK_OFF-Phasen enthalten die besten Folgetage (V-Bottoms) — das Gate ist eine Tail-Risk-Versicherung (RISK_ON: 3,2 % Tail-Tage vs. RISK_OFF: 12,3 %), keine Renditequelle. ~32 % aller Tage gesperrt, ~19 Zustandswechsel/Jahr.
- **SMA200-Variante durchgerechnet:** RISK_ON zusätzlich an QQQ > SMA200 zu knüpfen halbiert die Vollgas-Zeit im 2022er-Bär (41 %→23 %) bei sonst fast identischen Kennzahlen (2023-Wiedereinstieg +15 Tage).

**Entscheidungen Chris (zweites Grilling):**

| # | Frage | Entscheidung |
|---|---|---|
| 11 | Trade-off (verpasste V-Bottoms gegen 4× weniger Tail-Risk) | Akzeptiert — Versicherung gewollt. |
| 12 | SMA200-Sperre für RISK_ON | **Nein, Spec-treu bleiben.** Variante bleibt nur in backtest_regime.py dokumentiert; Neubewertung beim nächsten echten Bär möglich. |
| 13 | Bereits platzierte GTC-Buy-Stops bei RISK_OFF | **Bleiben unberührt** — das EOD-Signal steuert nur neue Orders; ein Buy-Stop füllt nur bei Stärke. |
| 14 | NEUTRAL konkret | **0,5 % Risk pro neuem Trade statt 1 %, keine Add-ons.** Tooltip + Routine entsprechend präzisiert. |
