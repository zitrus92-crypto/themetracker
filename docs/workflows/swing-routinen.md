# Swing-Routine — Kompakt (WE ~15 Min · Tag ~5 Min)

**Ziel:** Die heißesten Themes finden → frische Base-Breakouts handeln → **nicht extended kaufen.**
**Ausführung:** 90 % End-of-Day (Watchlist → GTC-Buy-Stops über dem Pivot), 10 % Intraday-Zugriff — beides **nur innerhalb der Wochenfokus-Liste**.

> **🥇 Goldene Regel:** Theme/Industry-Ebene = **nur Revier-Auswahl** („hier schauen"), nie Kaufsignal. Ob ein Name kaufbar oder **extended** ist, entscheidet **ausschließlich der Einzelchart** (Pivot-Distanz).

**Kennzahlen-Cheatsheet (Kurzform):**
- **Score** = gewichteter Rang (1M×70 % + 1W×20 % + 3M×10 %). *Niedriger = stärker.*
- **Accel (Theme)** = Rang 3M − Rang 1M. Hoch positiv = war schwach, dreht frisch an = erster Leg. **Nur Accel ≥ +10 ist ein echtes Signal** (verifiziert: 83 % Signal-Stabilität am Folgetag; +1…+5 ist Rauschen).
- **Accel (Industry)** = Rang 3M − Rang **1W** (zwitschriger, frühere Erkennung). Nicht 1:1 mit Theme-Accel vergleichbar.
- **INST-Badge** = Top 40 in 1M UND 3M = institutionell bestätigt.
- **★-Buttons** = markieren automatisch die Schnittmenge der Top 20 % (1W∩1M = frisch angedreht · 1M∩3M = institutionell anhaltend).

---

## 🗓️ Wochenend-Routine (~15 Min, z. B. Samstag)

> **Ergebnis:** Fokusliste mit 3–5 Einträgen + fertige Watchlists in TradingView/Deepvue.

### 1 — Regime ablesen (1 Min)
- [ ] **Regime-Badge im Header** ablesen und notieren. Wirkung (mechanisch, keine Interpretation):
  - **RISK-ON** → 1 % Risk/Trade, Add-ons erlaubt.
  - **NEUTRAL** → 0,5 % Risk/Trade, keine Add-ons.
  - **RISK-OFF** → keine neuen Entries, nur Verwaltung. Bereits platzierte GTC-Buy-Stops bleiben (füllen nur bei Stärke).
  - **DATEN VERALTET (grau)** → wie NEUTRAL behandeln.

### 2 — Themes qualifizieren (5 Min)
- [ ] **Themes → 📋 Tabelle** öffnen, Spalte **Accel** absteigend sortieren.
- [ ] **★ 1W∩1M** klicken → markierte Zeilen durchgehen. **★ 1M∩3M** klicken → dito.
- [ ] **Aufnahme-Formel (alle 3 Bedingungen, stur abhaken):**
  1. Von **mindestens einem** ★-Button markiert (1W∩1M *oder* 1M∩3M)
  2. **Accel ≥ +10**
  3. **1M-Perf > 0 %**
- [ ] Qualifizierte Themes nach Accel absteigend → **Top 3–5 nehmen.** Fertig, keine weitere Abwägung.
- [ ] *(Optional, 30 Sek.:)* **⊞ Matrix** öffnen — Fokus-Themes sollten in 🚀 First-Flag/Trending liegen. Nur Info, **kein Veto.**

### 3 — Fallback: Auffüllen bei < 3 Treffern (2 Min)
- [ ] Qualifizieren weniger als 3 Themes → freie Slots mechanisch füllen mit **Industry → ★ Setup Picks** (vorgefilterte First-Flag-Liste): **INST-Badge zuerst, dann Listen-Reihenfolge.**
- [ ] Heiße Standalone-Industries ohne Theme-Bezug sind **voll gültiges Revier** (Confluence ist Bonus, kein Filter).
- [ ] **Bei RISK-OFF wird nicht aufgefüllt** — kurze Liste ist dann gewollt.

### 4 — Watchlists bauen (5 Min)
- [ ] Pro Fokus-Eintrag die Zeile in der Tabelle anhaken → **📋 Kopieren** → als eigene Watchlist in TradingView/Deepvue anlegen (Vorwochen-Liste überschreiben).
- [ ] **Gespeicherten Screener-Filter** auf den Watchlists prüfen/aktiv halten: *Kurs ≤ 5 % unter 20-Tage-Hoch + über SMA50 + Mindestvolumen.* Das ist der tägliche Vorfilter — ohne ihn ist die Tages-Routine nicht in 5 Min machbar.
- [ ] *(Optional für Ad-hoc-Analysen: **📤 JSON kopieren** liefert den gruppierten Kontext inkl. Regime-Stempel — kein Pflichtschritt.)*

### 5 — Fokusliste festschreiben (2 Min)

```
WOCHENFOKUS  KW__  | Regime: ____________
1. ______________  Accel:__  1M:__%  INST:__  Quelle: Theme/Pick
2. ______________  Accel:__  1M:__%  INST:__  Quelle: Theme/Pick
3. ______________  Accel:__  1M:__%  INST:__  Quelle: Theme/Pick
4. ______________  Accel:__  1M:__%  INST:__  Quelle: Theme/Pick
5. ______________  Accel:__  1M:__%  INST:__  Quelle: Theme/Pick
```

- Diese Liste ist die Woche über das **einzige Jagdrevier — harte Sperre.**
- **Hot-Swap max. 1× pro Woche:** Nur wenn ein Slot per Killswitch (unten) objektiv frei wird, darf genau ein neuer Name rein — und nur, wenn er die Aufnahme-Formel **am selben Tag** erfüllt.

---

## ☀️ Tages-Routine (~5 Min, nach US-Close)

> **Ergebnis:** GTC-Buy-Stop-Orders über den Pivots der frischen Setups. Kein Export, kein Claude-Schritt.

### 1 — Regime-Check (10 Sek.)
- [ ] Badge ablesen → bestimmt Size/Erlaubnis für heute (Tabelle oben). RISK-OFF → Schritt 3+4 entfallen, nur offene Positionen verwalten.

### 2 — Killswitch-Check (1 Min)
- [ ] Pro Fokus-Eintrag **nur eine Zahl** prüfen: die **1M-Perf** (Themes-Tabelle bzw. Industry-Heatmap/Setup Picks).
  - **1M < 0 %** → Eintrag ist **tot**: keine neuen Entries dort, offene GTC-Orders für neue Positionen in dem Revier löschen, Slot frei (Hot-Swap möglich, max. 1×/Woche).
  - Sonst: Eintrag bleibt. **Nichts anderes wird täglich geprüft** — kein Quadranten-, kein Accel-Geflatter.

### 3 — Setups finden (2–3 Min)
- [ ] Gespeicherten **Screener-Filter** über die Fokus-Watchlists laufen lassen (≤ 5 % unter 20-Tage-Hoch + über SMA50 + Volumen) → es bleiben typischerweise 5–15 Namen.
- [ ] Nur diese Namen bekommen den Chartblick. Pro Chart, hart:
  - **Base/Konsolidierung** vorhanden? (Flag, Range, Cup — saubere Verengung.)
  - **Frisch:** nicht mehr als ~5 % über dem Pivot / nicht schon Tage gelaufen → sonst **extended → skip.**
  - **Volumen** am Ausbruch erhöht bzw. am Pivot vorhanden?
  - ❌ Parabolisch / unter MAs / keine Base → raus.

### 4 — Orders platzieren (1–2 Min)
- [ ] **3–5 Setups max.** Pro Setup: GTC-**Buy-Stop knapp über dem Pivot**, Stop/Sizing nach eigenen Regeln, Risk nach Regime (1 % / 0,5 % / kein Entry).

```
WATCHLIST  ____.____  (Datum)
Ticker | Fokus-Bezug | Buy-Stop | Notiz
______ | ___________ | ____.___ | _______________
______ | ___________ | ____.___ | _______________
______ | ___________ | ____.___ | _______________
```

### Die 10 % — Intraday-Zugriff (Ausnahmeregel)
Bist du zufällig intraday am Markt und ein **Fokuslisten-Name** bricht frisch mit Volumen über den Pivot aus, darfst du manuell zugreifen — **gleiche Chart-Kriterien, gleiche Regime-Size, niemals außerhalb der Fokusliste.** Alles andere bleibt EOD.

---

### Goldene Regeln
1. **Gruppe = Revier, Chart = Entscheidung.** Extended entscheidet sich ausschließlich am Einzelchart (Pivot-Distanz), nie an Gruppe, Bubble oder Quadrant.
2. **Nicht extended kaufen.** Kaufbar ist nur, was im Chart nah am Pivot steht.
3. **Aufnahme nur per Formel.** ★-Treffer + Accel ≥ +10 + 1M > 0 %. Kein Bauchgefühl, kein „sieht heiß aus".
4. **Harte Sperre.** Gehandelt wird nur die Fokusliste. Genau 1 Hot-Swap/Woche, nur bei objektiv freiem Slot (1M < 0 %).
5. **Ein Killswitch, eine Zahl.** Täglich stirbt ein Eintrag nur durch 1M < 0 % — sonst bleibt die Liste in Ruhe.
6. **Regime steuert Size mechanisch.** RISK-ON 1 % · NEUTRAL 0,5 %, keine Add-ons · RISK-OFF keine neuen Entries (GTC-Stops bleiben) · grau = NEUTRAL.
7. **Leader pickst du am Chart.** Keine RS-Tabelle, kein Auto-Ranking — eine RS-Liste spült die am weitesten gelaufene Aktie nach oben, genau falsch für Fresh Breakouts.
8. **Eng halten.** 3–5 Fokus, 3–5 Setups. Lieber 3 saubere als 12 mittelmäßige.
