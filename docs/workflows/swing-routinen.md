# Swing-Trading Routinen — Top-Down First-Flag Workflow

**Ziel:** Top-Down die heißesten Themes & Industries finden → Fokus auf *frische* Base-Breakouts / First Flags → **nicht extended kaufen.**

**Prinzip:** Themes (Narrativ) → Industries (tradeable Gruppe) → Stocks (Finviz/TradingView/Deepvue).
Qualität vor Quantität. Disziplin: Das Wochenende setzt die Fokusliste, der Tag arbeitet **nur** darin.

> **🥇 Goldene Regel (über allem):** Die **Gruppen-Ebene (Theme/Industry, Accel, Bubble) ist NUR Revier-Auswahl** — sie sagt „hier schauen", **nie** „kaufen". Ob etwas **extended** ist, entscheidet sich **ausschließlich am Einzelchart** (Pivot-Distanz). Eine heiße Gruppe oder eine grüne Bubble ist **kein** Kaufsignal — sie ist nur die Erlaubnis, im Chart nach einer frischen Base zu suchen.

**Cheatsheet — was die Kennzahlen bedeuten:**
- **Score** = gewichteter Rang (1M×70% + 1W×20% + 3M×10%). *Niedriger = stärker.* → Wer führt gerade.
- **Accel (Industry)** = 3M-Rang − **1W**-Rang. **Hoch positiv = war vor 3M schwach, jetzt stark = erster Leg, NICHT extended.** → First-Flag-Signal.
- **Accel (Theme)** = 3M-Rang − **1M**-Rang. Hoch positiv (+10…+30) = frisches Momentum, viel Luft nach oben.
- ⚠️ **Wichtig zu Accel — die beiden Formeln sind ABSICHTLICH unterschiedlich** (Per-View-Optimierung, kein Bug):
  - **Industry nutzt 1W** (zwitschriger, frühere Erkennung — enge tradeable Gruppe, 1W trägt Signal). **Theme nutzt 1M** (glatter — breites gemitteltes Aggregat, dort ist 1W rauschdominiert). *Hinweis: die Theme-Rausch-Annahme ist begründet, aber noch nicht empirisch gemessen — beide Varianten werden künftig mitgeloggt.*
  - **Industry- und Theme-Accel sind daher NICHT 1:1 vergleichbar.** „+15" auf einer Industry ≠ „+15" auf einem Theme. Industry-Accel immer als *frischer/kurzfristiger* lesen.
  - **Nur Accel ≥ ~10 ist ein echtes First-Flag-Signal.** Kleine positive Werte (+1…+5) sind Rauschen — am Code/History verifiziert: bei Accel ≥ 10 bleibt das Signal zu **83%** im nächsten Tag stark frisch und zu **90%** überhaupt positiv; darunter kippt das Vorzeichen täglich.
- **INST-Badge** = Top 40 in *1M UND 3M* = institutionell bestätigt = höchste Konfluenz.
- **Bubble-Zonen (= Revier-Hinweis, kein Kaufsignal):** 🚀 First Flag (frisch, links/Mitte) = hier schauen · ⚠️ Extended (rechts) = Gruppe gelaufen · 🔻 Fading = raus · 💀 Dead = ignorieren. *(Ob ein einzelner Stock kaufbar ist, sagt nur der Chart.)*

---

## 🗓️ Wochenend-Routine — Marktlage einordnen & Wochenfokus setzen

> **Ergebnis:** 3–5 „heiße" Themes/Industries als **Wochenfokus-Liste**. Mehr nicht — eng halten.
> **Zeit:** ~20–30 Min, einmal pro Woche (z.B. Samstag).

### Schritt 1 — Marktlage / Regime einordnen
- [ ] **Regime-Badge im Header ablesen** — der objektive Startwert (automatisch berechnet: QQQ > SMA20/SMA50 + T2108-Breadth von Stockbee, 2-Tage-Hysterese, Abstufung in RISK_OFF sofort). Tooltip zeigt die Inputs und die Wirkung:
  - **RISK_ON** → volle Sizing-Tiers, Add-ons erlaubt.
  - **NEUTRAL** → Tiers eine Stufe reduziert, keine Add-ons.
  - **RISK_OFF** → keine neuen Entries, nur Verwaltung offener Positionen (rotes Banner erscheint über den Setup-Picks).
  - Graues Badge „DATEN VERALTET" → Inputs stale, Zustand eingefroren — dann zählt der manuelle Gegencheck unten.
- [ ] **Themes → Bubble** als Gegencheck öffnen. Gesamtbild lesen: Wo ballt sich die Masse der Bubbles?
  - Wolke oben/rechts & viel Grün → bestätigt **Risk-On**, Breakouts haben Rückenwind.
  - Wolke unten/links, viel Rot, „Fading/Dead" stark besetzt → **Risk-Off / Korrektur** → diese Woche selektiver sein, kleinere Size, weniger Trades.
- [ ] **Industry → Bubble** zum Gegencheck: Bestätigt die Breite das Theme-Bild? (Breite Grün-Wolke = gesunder Markt.)
- [ ] Notiz machen: **Regime = Risk-On / Neutral / Risk-Off** (Badge-Wert, ggf. durch Bubble-Gegencheck geschärft — steuert deine Aggressivität für die Woche).

### Schritt 2 — Heiße Themes filtern (das Narrativ)
- [ ] **Themes → Matrix** öffnen: Quadranten-Ansicht. Der **🚀 First-Flag-Zone**-Quadrant (3M schwach + 1M stark = war schwach, dreht frisch an) ist dein Jagdrevier. **Fading/Dead** ignorieren.
- [ ] In der **Themes → Tabelle** die Toolbar-Buttons nutzen (sie markieren die passenden Zeilen automatisch):
  - **`1M∩3M`** → Themes in Top-20% nach **1M UND 3M** = institutionell bestätigtes, anhaltendes Momentum (Ariel-Kriterium).
  - **`1W∩1M`** → Themes in Top-20% nach **1W UND 1M** = frischer angedreht.
- [ ] **Themes → Bubble**: Im **🚀 First-Flag-Bereich** (oben-links: niedrige 3M-, hohe 1M-Perf, hoch positiver Accel, noch nicht extended/rechts) die grünen Bubbles markieren.
- [ ] **Auswahl-Regel Theme:** positiver **Accel** + **1M > 0%** + erscheint in `1M∩3M` **oder** `1W∩1M`. Extended-Bubbles (ganz rechts) **streichen**.
- [ ] → **2–4 Themes** notieren.

### Schritt 3 — Heiße Industries filtern (die tradeable Gruppe)
- [ ] **Industry → Setup Picks** öffnen. Das ist die vorgefilterte First-Flag-Liste
  (Score Top 40 + Accel > 0 + 1W > 1% + 1M > 0%, sortiert nach 60% Accel / 40% Score).
- [ ] **INST-Filter** mental gewichten: Industries mit **INST-Badge** zuerst (höchste Konfluenz).
- [ ] **Industry → Bubble** zum Gegencheck: Liegen die Setup-Picks-Industries wirklich im **🚀 First-Flag-Bereich** und **nicht** im Extended-Bereich?
- [ ] Optional in **Industry → Heatmap (Tabelle)**: dieselben **`1W∩1M`** / **`1M∩3M`**-Buttons markieren die in beiden Timeframes stärksten Industries automatisch.
- [ ] **Verzahnung mit Schritt 2 (Confluence = Nice-to-have, KEIN Filter):** Theme↔Industry-Überschneidung (gemeinsame Ticker) wird **nicht erzwungen**. Echte Daten zeigen: Confluence ist die **Ausnahme, nicht die Regel** — z.B. „Home Improvement Retail" mit Accel +68 überlappt Themes nur um **1 Ticker**, „Real Estate – Development" um **null**. Deshalb:
  - **Heiße Standalone-Industries ohne Theme-Überlappung bleiben voll gültiges Jagdrevier.** Nicht streichen, nur weil kein Theme dahinter liegt.
  - Confluence ist ein **Sortier-Bonus** (höhere Konfidenz, wenn vorhanden) → solche Industries nach oben sortieren. Aber sie ist **niemals** ein Ausschluss-Kriterium für heiße Namen.

### Schritt 4 — Wochenfokus-Liste festschreiben
- [ ] **3–5 Themes/Industries** als Wochenfokus festhalten (Datum, Regime, Liste).
- [ ] Pro Eintrag notieren: Name · Accel · 1M% · INST? · zugehöriges Theme.
- [ ] Diese Liste ist diese Woche dein **einziges Jagdrevier** — **harte Sperre**, kein Drift in Namen außerhalb der Liste.
- [ ] **Eine Ausnahme — der „Hot-Swap" (max. 1× pro Woche):** Genau **ein** kontrollierter Tausch ist erlaubt. Ein **klar frischer, neu aufgetauchter First-Flag-Name** darf einen toten Eintrag ersetzen — aber **nur**, wenn ein Platz objektiv frei wird (siehe Rauswurf-Trigger unten). Kein zweiter Swap, kein „spontanes Dazunehmen".
- [ ] **Objektiver Rauswurf-Trigger** (entscheidet, wann ein Slot frei wird — direkt im Tool ablesbar, kein Bauchgefühl):
  - Eine **Industry verlässt die Setup-Picks-Liste** → Kriterien (Score Top 40 + Accel > 0 + 1W > 1% + 1M > 0%) **nicht mehr** erfüllt.
  - Ein **Theme verlässt den „Fresh"-Quadranten** der Matrix.
  - Erst wenn ein Name so **verifizierbar rausfällt**, wird der Hot-Swap-Slot frei.

```
WOCHENFOKUS  KW__  | Regime: ____________
1. ______________  Accel:__  1M:__%  INST:__  Theme:________
2. ______________  Accel:__  1M:__%  INST:__  Theme:________
3. ______________  Accel:__  1M:__%  INST:__  Theme:________
4. ______________  Accel:__  1M:__%  INST:__  Theme:________
5. ______________  Accel:__  1M:__%  INST:__  Theme:________
```

---

## ☀️ Tages-Routine — Setups in den heißen Industries finden

> **Ergebnis:** 3–5 konkrete Stock-Setups auf der Watchlist.
> **Scope:** NUR Industries/Themes aus der Wochenfokus-Liste (harte Sperre). Neue Namen werden **nicht** spontan dazugejagt — höchstens **1× pro Woche** per kontrolliertem Hot-Swap (Rauswurf-Trigger erfüllt, siehe Wochenend-Routine Schritt 4).
> **Zeit:** ~10–15 Min, einmal täglich nach Close.
> **Cheatsheet Stock-Setup (einfach gehalten):** Ausbruch aus sauberer Konsolidierung/Base, **erhöhtes Volumen**, **nicht zu weit gelaufen** (nah am Pivot, nicht extended).

### Schritt 1 — Fokus-Check (30 Sek.)
- [ ] Wochenfokus-Liste daneben legen.
- [ ] **Industry → Setup Picks** kurz öffnen: Stehen deine Fokus-Industries noch in der First-Flag-Liste, oder sind welche ins Extended/Fading gerutscht?
  - Fokus-Name **nicht mehr** First Flag / jetzt Extended → für heute **kein neuer Entry** dort (Leg gelaufen).
  - Fokus-Name weiter frisch → **aktiv jagen.**
- [ ] **Rauswurf-Trigger prüfen** (objektiv, direkt im Tool): Hat eine Fokus-Industry die **Setup-Picks-Liste verlassen** (Score Top 40 + Accel > 0 + 1W > 1% + 1M > 0% nicht mehr erfüllt), oder hat ein Fokus-Theme den **„Fresh"-Quadranten** der Matrix verlassen? → Eintrag ist **tot**, ein **Hot-Swap-Slot** wird frei (max. 1× pro Woche). Sonst: Liste bleibt unverändert, **keine** neuen Namen.

### Schritt 2 — Vom Theme/Industry zur Stock-Liste

**Zweistufige Übergabe an Claude (separates Projekt).** Top-Down-Filter macht Claude, die Leader-Stock-Auswahl machst **du** am Chart. Klare Arbeitsteilung:

**Stufe 1 — Objektiver Top-Down-Filter (Claude):**
- [ ] In der jeweiligen Tabelle (Themes / Industry-Heatmap) die **aktiven Fokus-Zeilen selektieren** und per **JSON-Export** rauskopieren.
  - Der **JSON-Export** liefert pro Zeile gruppierten Kontext: `name · score · accel · ranks{1W,1M,3M} · perfs{1W,1M,3M} · tickers`.
  - *(Bei Themes können die Pro-Timeframe-Ränge eingeschränkt sein — das regelt das Export-Feature selbst, hier nicht weiter wichtig.)*
  - Die **flache „Ticker kopieren"-Funktion** (Clipboard) bleibt parallel bestehen — die ist für **TradingView/Deepvue** (Watchlist-Import).
- [ ] JSON ins **Claude-Projekt** geben → Claude liefert die **Top 5–7 heißesten Themes/Industries mit ihren gruppierten Tickern** zurück (rein objektiver Top-Down-Filter).

**Stufe 2 — Leader-Stocks wählst DU am Chart:**
- [ ] Aus den von Claude gelieferten Gruppen die **konkreten Leader-Stocks selbst** am Chart picken (TradingView / Deepvue):
  - **sauberste Base** · **größtes Volumen am Pivot** · **am nächsten am Ausbruch**.
- [ ] ⚠️ **Claude bewertet KEINE Leader.** Eine Finviz-RS-Tabelle würde die **bereits am weitesten gelaufene** Aktie als „Leader" oben anzeigen — genau falsch für einen Fresh-Breakout-Stil. Das Stock-Picking bleibt am Chart, bei dir.
- [ ] Für den **Watchlist-Import** zusätzlich die flache Ticker-Liste (Clipboard) nach TradingView/Deepvue übernehmen.

### Schritt 3 — Charts prüfen (TradingView / Deepvue)
**Hier — und nur hier — entscheidet sich „extended".** Die Gruppe/Bubble hat dich nur ins Revier gebracht; ob ein einzelner Name kaufbar oder schon gelaufen ist, lest du **ausschließlich an der Pivot-Distanz im Einzelchart** ab. Eine grüne Bubble rettet keinen extended Chart.

Für die Top-Kandidaten der Gruppe, der Reihe nach:
- [ ] **Base / Konsolidierung** vorhanden? (Seitwärts-Range, Flag, Cup — irgendeine saubere Verengung, kein Chaos.)
- [ ] **Frischer Ausbruch** oder unmittelbar davor? (Nicht schon mehrere Tage/>~5% über dem Pivot = sonst **extended → skip** — **das ist die einzige gültige Extended-Entscheidung, nicht die Bubble**.)
- [ ] **Volumen** beim Ausbruch erhöht? (Bestätigt echte Nachfrage.)
- [ ] Über den steigenden gleitenden Durchschnitten, Trend intakt?
- [ ] ❌ **Aussortieren:** schon weit gelaufen / parabolisch / unter MAs / kein Volumen / keine erkennbare Base.

### Schritt 4 — Watchlist schreiben
- [ ] **3–5 Setups** notieren, die *heute frisch* sind (eng halten).
- [ ] Pro Setup: Ticker · Industry/Theme (Fokus-Bezug) · Pivot/Trigger-Level · kurze Notiz (z.B. „Flat Base, Vol ok").
- [ ] Fertig — Entry/Stop/Sizing nach deinen eigenen Regeln (nicht Teil dieser Routine).

```
WATCHLIST  ____.____  (Datum)
Ticker | Industry/Theme | Trigger | Notiz
______ | ______________ | ____.__ | _______________
______ | ______________ | ____.__ | _______________
______ | ______________ | ____.__ | _______________
______ | ______________ | ____.__ | _______________
______ | ______________ | ____.__ | _______________
```

---

### Goldene Regeln
1. **Gruppe = nur Revier, Chart = Entscheidung.** Theme/Industry-Accel und Bubble sagen nur „hier schauen", nie „kaufen". **Extended entscheidet sich ausschließlich am Einzelchart (Pivot-Distanz)** — nie an Gruppe oder Bubble.
2. **Nicht extended kaufen.** Hoch positiver Accel + First-Flag-Zone = frisches Revier. Aber kaufbar ist nur, was im **Chart** nah am Pivot steht.
3. **Top-Down bleiben.** Erst Theme/Industry-Revier, dann Stock. **Aber:** heiße **Standalone-Industries ohne Theme-Überlappung sind voll gültig** — Confluence ist Nice-to-have-Bonus, kein Filter.
4. **Im Revier bleiben — harte Sperre.** Der Tag jagt nur in der Wochenfokus-Liste. Genau **1 Hot-Swap pro Woche** erlaubt, und nur wenn ein Name **objektiv** rausfällt (Industry verlässt Setup-Picks ODER Theme verlässt „Fresh"-Quadrant). Sonst: notieren fürs nächste Wochenende.
5. **Claude filtert, du pickst.** Claude liefert (aus dem JSON-Export) die heißesten Gruppen + Ticker; die **Leader-Stocks wählst du selbst am Chart**. Claude bewertet keine Leader.
6. **Regime respektiert Size.** Risk-Off-Woche = weniger Trades, kleinere Positionen.
7. **Eng halten.** 3–5 Fokus, 3–5 Setups. Lieber 3 saubere als 12 mittelmäßige.
