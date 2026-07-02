# Spec: Regime-Gate & Theme-Identifikation (Druckenmiller-Adaption)

**Zweck dieses Dokuments:** Du (Claude Code) erhältst hiermit eine fachliche Spezifikation und einen Review-Auftrag. Deine Aufgabe ist NICHT, sofort Code zu schreiben. Deine Aufgabe ist: (1) den bestehenden Theme-Tracker-Code vollständig verstehen, (2) ihn gegen diese Spec abgleichen, (3) eine konkrete, priorisierte Empfehlung abgeben, was gebaut werden soll und was explizit nicht. Erst nach Freigabe durch Chris wird implementiert.

---

## 1. Systemkontext (unveränderliche Rahmenbedingungen)

- **Nutzer:** EOD-Swing-Trader, Kullamägi-Stil (EPs, Breakouts, Pullbacks). Vollzeitjob, keine Bildschirmzeit intraday.
- **Konto:** Sub-10k EUR, IBKR. Orders als GTC Buy-Stop-Limit, platziert ca. 21:00 CET. Risiko pro Trade ~1%.
- **Bestehendes System:** Theme Tracker (statische Web-App, GitHub Pages) mit:
  - Theme-States: `STRONG` / `PULLBACK` / `IMPROVING`
  - Vier-Quadranten-Aktionsmatrix: **1W∩1M** steuert Entry-Legitimität, **1M∩3M** steuert Trail-Legitimität
  - Sizing-Tiers, gemappt auf Theme-Quadranten-Logik
  - Drei-Horizont-Komposit-Momentum (3M/1M/1W) statt harter Momentum-Gates; Quality-/Tradeability-Gates
- **Datenquellen:** Deepvue, TradingView, ggf. Finviz-Export. Alles EOD. Keine Realtime-Abhängigkeiten einbauen. Kein Server-Backend annehmen — der Tracker ist statisch gehostet.

**Harte Constraints für jede Empfehlung:**
1. EOD-kompatibel (alles muss abends in <15 Min. Workflow passen).
2. Keine Abhängigkeit von Bezahldaten, die Chris nicht ohnehin hat (Deepvue/TradingView vorhanden).
3. Bestehende Quadranten-Logik nicht brechen — neue Module sitzen VOR oder NEBEN ihr, nicht darin.
4. Keine Prognose-Module. Alle Signale müssen aus beobachtbaren Preis-/Breadth-Daten oder aus manuellen Nutzer-Eingaben (Katalysator-Feld) stammen.

---

## 2. Modul A: Regime-Gate

### 2.1 Konzept

Ein globaler Schalter OBERHALB der Theme-Ebene, der beantwortet: *"Darf ich überhaupt aggressiv long sein?"* Er skaliert die bestehenden Sizing-Tiers global und schaltet Add-ons frei oder ab. Er ersetzt nichts — er multipliziert.

Herkunft: Druckenmillers Kernprinzip, dass Liquidität/Regime den Markt bewegt, nicht Einzeltitel-Qualität. EOD-Übersetzung: Trend + Breadth des Leitindex als Regime-Proxy.

### 2.2 Definition

**Referenzindex:** NDX (QQQ) primär, da das Universum growth-/momentum-lastig ist. SPX optional als Zweitprüfung.

**Inputs (alle EOD, in TradingView verfügbar):**
- `T1`: Index-Close > 21-EMA
- `T2`: Index-Close > 50-SMA
- `B1`: Breadth — Anteil der Aktien über ihrer 50-MA (TradingView-Symbole: `NDFI` für Nasdaq-100, `MMFI` für den Gesamtmarkt). Schwelle: > 50% = gesund, < 40% = schwach.

**Regime-States:**

| State | Bedingung | Wirkung |
|---|---|---|
| `RISK_ON` | T1 ∧ T2 ∧ B1 > 50% | Volle Sizing-Tiers. Add-ons erlaubt. Entries in IMPROVING-Themes erlaubt. |
| `NEUTRAL` | T2 ∧ (¬T1 ∨ B1 zwischen 40–50%) | Alle Tiers eine Stufe reduziert. Keine Add-ons. Entries nur in STRONG/PULLBACK-Themes. |
| `RISK_OFF` | ¬T2 ∨ B1 < 40% | Keine neuen Entries. Nur Verwaltung offener Positionen; Trails eine Stufe enger (z.B. 21-EMA → 10-EMA, sofern das Trail-System das hergibt). |

**Hysterese-Regel (wichtig gegen Whipsaws):** Ein State-Wechsel wird erst nach 2 aufeinanderfolgenden EOD-Bestätigungen wirksam. Ausnahme: Wechsel NACH UNTEN in `RISK_OFF` gilt sofort (asymmetrisch defensiv).

### 2.3 Evidenz-Kennzeichnung

- **Belegt (Druckenmiller):** Liquidität/Regime vor Einzeltitel; Technik als Timing-Instrument. Quellen: Schwager-Interview (New Market Wizards), diverse Konferenz-Auftritte.
- **Rekonstruktion/Konvention:** Die konkreten Schwellen (21-EMA, 50-SMA, 50%/40% Breadth, 2-Tages-Hysterese) sind NICHT von Druckenmiller und NICHT backgetestet. Sie sind plausible Startwerte aus der Momentum-Trading-Konvention. Im Tracker als `DEFAULT — UNVALIDIERT` kennzeichnen und konfigurierbar halten.

---

## 3. Modul B: Theme-Identifikation nach Druckenmiller (operationalisiert)

### 3.1 Das Prinzip in einem Satz

Ein Theme ist eine bevorstehende **Wahrnehmungsverschiebung**: Kaufe nicht, was heute gut aussieht, sondern was in 6–18 Monaten von der Masse als überlegen wahrgenommen werden wird — und lasse den Preis den Startschuss geben.

### 3.2 Der vierstufige Identifikationsprozess

**Stufe 1 — Emergenz-Detektion (preisbasiert, automatisierbar):**
Ein neues oder wiedererwachendes Theme kündigt sich als **Cluster** an, nie als Einzeltitel. Operationale Definition:
- ≥ 3 Aktien desselben Themes erreichen innerhalb eines rollierenden 10-Handelstage-Fensters neue 20-Tage- oder 52-Wochen-Hochs, ODER
- ≥ 3 Aktien desselben Themes befinden sich gleichzeitig im obersten RS-Dezil (bzw. RS ≥ 90, je nach vorhandener RS-Metrik), ODER
- ≥ 2 Earnings-Gaps > 8% im selben Theme innerhalb von 15 Handelstagen (EP-Dichte).
Jedes erfüllte Kriterium erzeugt ein `EMERGENZ`-Flag am Theme. Zwei oder mehr Flags gleichzeitig = `EMERGENZ_STARK`.

**Stufe 2 — Leader-Identifikation innerhalb des Themes:**
Druckenmillers Frage an Managements lautet sinngemäß: *"Welchen Wettbewerber fürchtet ihr?"* — die genannte Firma ist der Kauf. Der EOD-Preis-Proxy dafür, in Prioritätsreihenfolge:
1. **Erster am neuen Hoch:** Welche Aktie des Themes erreichte das neue Hoch zuerst?
2. **Flachster Pullback:** Geringster Drawdown vom Theme-relevanten Swing-High während der letzten Marktschwäche.
3. **Höchstes Komposit-Momentum:** Bestehende 3M/1M/1W-Komposit-Rangfolge.
Der Leader bekommt ein `LEADER`-Tag. Es gibt pro Theme maximal 2 Leader-Tags. Zusätzlich ein manuelles Freitextfeld `FEARED_BY` (optional): Wenn Chris aus Earnings-Calls/News weiß, wen die Konkurrenz nennt, wird das hier dokumentiert — das Feld überstimmt den Preis-Proxy nicht, es ergänzt ihn.

**Stufe 3 — Katalysator-Pflichtfeld (manuell, nicht automatisierbar):**
Jedes Theme mit `EMERGENZ`-Flag verlangt eine Antwort auf genau eine Frage:
> *"Warum wird dieses Theme in 6–18 Monaten stärker wahrgenommen als heute?"*
- Antwort vorhanden → Theme-Typ `THESE` → volle Trail-Legitimität nach bestehender 1M∩3M-Logik, Add-ons erlaubt (regime-abhängig).
- Keine Antwort → Theme-Typ `MOMENTUM_ONLY` → legitim handelbar, aber: engerer Trail, keine Add-ons, kleinere Tier-Stufe.
Das Feld ist bewusst ein Zwang zur Ehrlichkeit, kein Prognose-Instrument.

**Stufe 4 — Erschöpfungs-Erkennung (Spiegelbild von Stufe 1):**
Druckenmillers "never invest in the present" invertiert: Wenn das Theme im Konsens angekommen ist, ist die Wahrnehmungsverschiebung vorbei. Operationale Warnsignale (jedes erzeugt ein `EXHAUSTION`-Flag):
- **Nachzügler-Rallye:** Die RS-schwächsten 30% des Themes outperformen die Leader über 10 Tage.
- **Breadth-Extrem:** > 90% der Theme-Mitglieder über ihrer 50-MA (nichts mehr zu konvertieren).
- **Leader-Bruch:** Ein `LEADER`-Titel verliert seine 50-MA auf Schlusskursbasis, während das Theme noch `STRONG` getaggt ist.
Zwei gleichzeitige Flags → Theme-Vorschlag `EXHAUSTED` (manuell zu bestätigen, nicht automatisch umtaggen).

### 3.3 Abgrenzung zum Bestehenden

Die bestehenden States (STRONG/PULLBACK/IMPROVING) beschreiben den **aktuellen Momentum-Zustand**. Modul B fügt zwei orthogonale Dimensionen hinzu:
- **Lebenszyklus-Position:** EMERGENZ → (bestehende States) → EXHAUSTED
- **These-Qualität:** THESE vs. MOMENTUM_ONLY
Nichts am bestehenden State-Modell wird ersetzt.

### 3.4 Evidenz-Kennzeichnung

- **Belegt (Druckenmiller):** Wahrnehmungsverschiebung als Kaufgrund ("never invest in the present", 18-Monats-Horizont); die Wettbewerber-Furcht-Frage zur Leader-Identifikation; Themes vor Einzeltiteln.
- **Rekonstruktion:** Sämtliche numerischen Schwellen (3 Aktien / 10 Tage / 8%-Gaps / 90%-Breadth / 30%-Nachzügler) sind Übersetzungen in EOD-Mechanik, stammen NICHT von Druckenmiller und sind unvalidiert. Konfigurierbar halten, als `DEFAULT — UNVALIDIERT` markieren.
- **Bewusst weggelassen:** Druckenmillers Macro-/Liquiditätsanalyse im Detail (Fed-Flows etc.) — nicht EOD-tauglich replizierbar; das Regime-Gate (Modul A) ist der bewusst grobe Ersatz.

---

## 4. Dein Review-Auftrag (Claude Code)

Arbeite die folgenden Schritte in dieser Reihenfolge ab und liefere am Ende EINE konsolidierte Empfehlung.

### Schritt 1 — Bestandsaufnahme
Lies den gesamten Theme-Tracker-Code. Erstelle eine kompakte Karte: Welche Datenstrukturen existieren für Themes und Ticker? Wo werden States berechnet vs. manuell gesetzt? Welche Daten fließen woher ein (manueller Paste, CSV-Import, hartcodiert)? Wo sitzt die Quadranten- und Sizing-Logik?

### Schritt 2 — Gap-Analyse gegen diese Spec
Für Modul A und jede der vier Stufen von Modul B einzeln: Existiert etwas Vergleichbares schon (ganz/teilweise/gar nicht)? Welche Datenfelder fehlen? Was ist mit den vorhandenen Datenquellen (manueller EOD-Input, Deepvue/TradingView-Exporte) realistisch berechenbar und was würde Daten erfordern, die der Tracker heute nicht bekommt? Sei hier brutal ehrlich: Ein Feature, dessen Input-Daten Chris jeden Abend manuell zusammensuchen müsste, ist ein schlechtes Feature.

### Schritt 3 — Empfehlung
Liefere maximal **3 Erweiterungen**, gerankt nach Nutzen-pro-Aufwand, jeweils mit: Was genau, welche Dateien/Strukturen betroffen, welcher Daten-Input nötig, geschätzter Umfang, und was das im Abend-Workflow konkret ändert. Liefere außerdem eine explizite **Nicht-bauen-Liste**: Teile dieser Spec, die du für den aktuellen Stand als Overengineering einstufst, mit einem Satz Begründung. Wenn du zu dem Schluss kommst, dass Teile von Modul B als reine Checkliste/Formularfelder besser aufgehoben sind als als Berechnungslogik — sag das.

### Schritt 4 — Stopp
Implementiere nichts ohne explizite Freigabe. Stelle offene Fragen gesammelt am Ende, nicht verstreut.

### Leitplanken für deine Bewertung
- Einfachheit schlägt Vollständigkeit. Der Tracker ist ein Ein-Personen-Abend-Tool, kein Produkt.
- Manuelle Eingabefelder (Katalysator, FEARED_BY) sind vollwertige Features — nicht alles muss berechnet werden.
- Jede automatische Berechnung braucht eine realistische EOD-Datenquelle. "Chris könnte das täglich exportieren" zählt nur, wenn es < 2 Minuten kostet.
- Schwellenwerte immer als konfigurierbare Konstanten mit `UNVALIDIERT`-Kommentar, nie hartcodiert verstreut.
