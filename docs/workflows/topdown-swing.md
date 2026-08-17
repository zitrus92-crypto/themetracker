# Top-Down-Swing-Workflow — 10–30 Tage (WE 60–90 Min · Tag 30 Min)

**Horizont:** Primär **10–30 Tage**. Die Haltedauer wird nicht vorab gewählt, sondern entsteht aus dem Exit-Schema: Teilgewinn nach 3–7 Tagen in Stärke, Rest wird getrailt. Ein Trade, der nicht trägt, ist nach 5–10 Tagen beendet; ein Trade im heißen Theme läuft 10–30 Tage.

**Warum dieser Horizont zu dieser App passt:**
- Alle Kennzahlen (Score, Accel, Stages, Frische) basieren auf **EOD-Daten und 1W/1M/3M/6M-Fenstern**. Was die App erkennt, sind Rotationen, die über Wochen laufen — nicht über 3 Tage.
- **Accel ≥ +10** markiert den ersten Leg einer Theme-Rotation; solche Legs tragen typischerweise mehrere Wochen. Das ist der Edge, den die App liefert.
- 1–3 Positionen + 30 Min/Tag: Der Engpass ist Entscheidungszeit. Längere Haltedauer = weniger Entries pro Woche = mehr Sorgfalt pro Entry.
- Für reine 3–5-Tage-Trades bräuchte man Intraday-Daten und mehr Screen-Zeit — dafür liefert die App keinen Vorteil. 3–5-Tage-Techniken (Momentum-Continuation) kommen nur als **Zusatz-Entry innerhalb der Fokusliste** vor (unten).

**Rahmen (fix):**
- Max. **1–3 offene Positionen**, max. **6–8 Namen** auf der Wochenliste.
- Risk/Trade nach Regime-Badge: **RISK-ON 1 %** · **NEUTRAL 0,5 %, keine Add-ons** · **RISK-OFF keine neuen Entries** · **grau/veraltet = wie NEUTRAL**.
- Gehandelt wird **nur** die Wochenliste (harte Sperre).
- Gruppe = Revier, Chart = Entscheidung. Ob ein Name kaufbar oder extended ist, entscheidet ausschließlich der Einzelchart.

---

## 🗓️ Wochenend-Analyse (60–90 Min)

> **Ergebnis:** 2–3 Reviere · A-Liste (Breakout-Ready) mit Pivots · B-Liste (Pullback-Watch) mit Levels · Alerts in TradingView gesetzt.

### Block A — Markt & Reviere (≈ 20 Min)

1. **Regime-Badge** im Header ablesen → Risk-Stufe für die Woche notieren. RISK-OFF: Analyse trotzdem machen (Watchlist pflegen), aber keine neuen Orders.
2. **Themes → 🚩 First Flag** öffnen → **qualifizierte Gruppen** notieren. Das sind frisch andrehende Themes (Stage PULLBACK + Accel ≥ +10 + Frische im Band) — das Kern-Revier für neue Legs.
3. **Themes → 📦 Base Breakout** öffnen → qualifizierte Gruppen notieren. Ausbrüche aus flacher 6-Monats-Basis — oft der Anfang großer Moves, ideal für den 10–30-Tage-Runner.
4. **Near-Miss-Listen** beider Tabs überfliegen (30 Sek.): Die UI zeigt an, *woran* eine Gruppe scheitert. Gruppen, denen nur die Frische fehlt, sind Kandidaten für nächste Woche — nur merken, nicht handeln.
5. **Industry → ★ Setup Picks** als Ergänzung: heiße Standalone-Industries ohne Theme-Bezug sind voll gültiges Revier.
6. **Top 2–3 Reviere festlegen.** Bei mehr Kandidaten: Reihenfolge der Tabs übernehmen (Sortierung ist Setup-Dichte → Accel → Score). Keine weitere Abwägung.

### Block B — Einzelwerte (≈ 40–60 Min, Kern der Wochenendzeit)

7. Ticker holen — zwei Wege, beide ein Klick:
   - **Eine Watchlist pro Revier:** das **📋** neben dem Theme- bzw. Industry-Namen → kommagetrennte Ticker → in TradingView einfügen (Vorwochen-Liste überschreiben).
   - **Alles auf einmal:** **📋 Alle kopieren** über der Liste (First Flag, Base Breakout, Setup Picks) → alle Gruppen als benannte TradingView-Sektionen (`###Gruppe,TICK,…`) → eine Watchlist, in der die Revier-Zuordnung als Abschnitt sichtbar bleibt.
8. **Chart-Triage** — jeder Name kommt in genau eine Schublade:
   - **A — Breakout-Ready:** saubere Base/Flag/Range mit Verengung, Pivot klar definierbar, Kurs nah am Pivot (Faustregel: max. ~1,5 ATR darunter, nicht > 5 % darüber). → Pivot notieren, **TradingView-Alert auf den Pivot**, optional GTC-Buy-Stop knapp darüber.
   - **B — Pullback-Watch:** klarer Leader des Themes, aber extended. → **Alert an 10/20-EMA** bzw. an das alte Ausbruchslevel. Wird erst handelbar, wenn der Rücksetzer konstruktiv ankommt.
   - **C — Rest:** parabolisch, unter den MAs, keine Base, Nachzügler ohne Struktur → raus, kein zweiter Blick.
9. **Deckel: 6–8 Namen gesamt** (A + B). Lieber wenige saubere als viele halbe.

### Block C — Wochenplan festschreiben (≈ 10 Min)

```
WOCHENFOKUS  KW__  | Regime: ________ | Risk/Trade: ____
Reviere: 1) ____________  2) ____________  3) ____________

A — Breakout-Ready          B — Pullback-Watch
Ticker | Pivot | Stop       Ticker | Level (EMA/Retest)
______ | _____ | _____      ______ | _____
______ | _____ | _____      ______ | _____
______ | _____ | _____      ______ | _____
```

- Diese Liste ist die Woche über das **einzige Jagdrevier**.
- **Hot-Swap max. 1×/Woche**, nur wenn ein Revier per Killswitch stirbt (unten).

---

## ☀️ Tagesroutine (30 Min, 21:30–22:15 — die letzte US-Handelsstunde)

> Das Zeitfenster ist ein echter Vorteil: Du siehst, **was bis zum Close hält**. Breakouts, die in die letzten 30 Minuten hinein gehalten werden, haben deutlich weniger Fehlsignale als Intraday-Käufe am Vormittag.

### 1 — Regime & Killswitch (≈ 3 Min)
- Regime-Badge ablesen → Risk heute.
- Pro Revier **eine Zahl**: die 1M-Perf (Themes-Tabelle / Heatmap). **1M < 0 % → Revier tot**: keine neuen Entries dort, offene Buy-Stops in dem Revier löschen, Slot frei. Sonst: nichts anpassen.

### 2 — A-Liste: Breakouts (≈ 10 Min)
- Ausgelöste TradingView-Alerts durchgehen. Pro Kandidat: Bricht der Name **heute mit erhöhtem Volumen** über den Pivot aus **und hält es in die Schlussphase**?
  - **Ja → Entry in den Schluss** (manuell, 21:30–22:00). Stop unter das Tief der Base bzw. des Ausbruchstages.
  - Ausbruch intraday abverkauft / Volumen fehlt → **kein Entry**, Alert bleibt.
- Namen, die noch in der Base stehen: GTC-Buy-Stop knapp über dem Pivot prüfen/platzieren (füllt morgen nur bei Stärke).

### 3 — B-Liste: Pullbacks (≈ 5 Min)
- Alert an EMA/Level ausgelöst? Konstruktiv = enge Tagesspanne, abnehmendes Volumen im Rücksetzer, Level hält.
  - **Entry am Close**, wenn der Tag am Level dreht — oder **Buy-Stop über das Tageshoch** für morgen (konservativer).
  - Rücksetzer mit hohem Volumen / Level verloren → Name auf C, raus.

### 4 — Offene Positionen (≈ 7 Min)
- **Initial-Stop:** unter Base-Tief bzw. Tief des Entry-Tages. Wird nie nach unten bewegt.
- **Teilgewinn:** nach 3–7 Tagen **in Stärke** (z. B. ≥ +2R oder mehrere Up-Tage in Folge) 1/3–1/2 verkaufen.
- **Rest trailen:** Standard **20-EMA** (Close darunter = raus), aggressiver 10-EMA. Das macht aus dem 5–10-Tage-Trade automatisch den 10–30-Tage-Runner, solange das Theme trägt.
- **Theme-Killswitch gilt auch hier:** Stirbt das Revier (1M < 0 %), Stops an den letzten Swing-Tief nachziehen — nicht panisch verkaufen, aber nichts mehr geben.

### 5 — App-Signale (≈ 5 Min)
- First-Flag- und Base-Breakout-Tab kurz auf **neue qualifizierte Gruppen** checken. Aufnahme ins Revier aber **nur am Wochenende** — Ausnahme: ein Slot ist durch Killswitch frei geworden und die Gruppe qualifiziert am selben Tag (Hot-Swap, max. 1×/Woche).

### Zusatz-Entry (optional): Momentum-Continuation, nur Fokusliste
Wenn ein **offener Position-** oder **A-Listen-Name** nach 2–4 engen Tagen (Inside Days / kleine Flagge über der 10-EMA) in der Schlussphase mit Volumen über das Verengungs-Hoch dreht: Entry erlaubt — gleiche Risk-Regeln, Stop unter die Verengung. Das ist der einzige 3–5-Tage-Trade im System und er findet **nie außerhalb der Fokusliste** statt.

---

## Entry-Stil ↔ App-Signal (Spickzettel)

| App-Signal | Typischer Entry | Erwartete Haltedauer |
|---|---|---|
| 📦 Base-Breakout-Tab (Stage BASE_BREAK) | Buy-Stop über Pivot der Einzel-Base | 10–30 Tage (Runner) |
| 🚩 First-Flag-Tab (Stage PULLBACK, Accel ≥ +10) | Frühe Namen: Breakout · Leader: Pullback an 10/20-EMA | 5–30 Tage |
| ★ Setup Picks (Industry) | wie First Flag | 5–30 Tage |
| Verengung über 10-EMA (nur Fokusliste) | Continuation über Verengungs-Hoch | 3–5 Tage |

## Goldene Regeln
1. **Revier per App-Formel, Entry per Chart.** Kein Bauchgefühl auf Gruppenebene, keine Gruppen-Entscheidung am Einzelchart.
2. **Nicht extended kaufen.** Kaufbar ist, was nah am Pivot oder konstruktiv am EMA steht.
3. **Der Close entscheidet.** Entries bevorzugt in die letzte halbe Stunde, wenn der Ausbruch gehalten wird — oder per GTC-Stop, der nur bei Stärke füllt.
4. **Haltedauer ist ein Ergebnis, kein Ziel.** Teilgewinn 3–7 Tage, Trail 20-EMA — der Markt bestimmt, ob es 5 oder 30 Tage werden.
5. **Ein Killswitch, eine Zahl.** 1M < 0 % tötet ein Revier. Sonst bleibt die Liste in Ruhe.
6. **Eng halten.** 2–3 Reviere, 6–8 Namen, 1–3 Positionen.
