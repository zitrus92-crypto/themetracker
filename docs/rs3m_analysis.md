# RS 3M vs. RS 12M auf Theme-Ebene – Validierung

Reproduzierbar mit `python analysis/rs3m_vs_rs12m/run_all.py` (Norgate Data Updater muss beim ersten Lauf laufen; Rohdaten-Cache in `data/norgate_cache/`). Volle Tabellen: `analysis/rs3m_vs_rs12m/out/results.md` und `out/*.csv`.

Evidenz-Labels: **validiert** = in beiden Teilperioden (2011–2018, 2019–heute) stabil · **deskriptiv** = beobachtet, aber ohne Vorteil / definitionsabhängig · **fragil** = nur eine Periode, kleine Stichprobe oder potenziell overfit.

## Zusammenfassung

| Frage | Antwort | Evidenz |
|---|---|---|
| Lohnt RS 3M als zweite Spalte? | **Ja als Timing-/Rotations-Anzeige, nein als Renditesignal.** Theme-Rang-Korrelation nur 0,68, Top-10-Überlapp 6,1/10 → nicht redundant; neue RS3M-Top-10-Themes erreichen die RS12M-Top-10 in 60T zu 56 % (Basis 36 %), Median 30 statt 65 Tage. | validiert (Richtung, beide Perioden) |
| Bessere Forward-Rendite als RS12M? | **Nein.** RS3M-Top-10 minus RS12M-Top-10: Δ +0,05 %-Pkt (20T, KI −0,08…0,20), −0,02 (60T, KI −0,37…0,37). | deskriptiv (kein Vorteil) |
| Rang-Persistenz 60T | RS3M-Top-10 → Perzentil 53,2 (Basis 50), RS12M-Top-10 → 53,1. Wie in der Vorstudie. | validiert (schwach) |
| Rising (Rang-Gap RS12−RS3M ≥ 10 ≈ N/4) | Exzess +0,64 % (20T) / +1,56 % (60T), aber **gegenüber „alle Themes“ Δ +0,07 / −0,14, KI schließt 0 ein**; Vorzeichen wechselt zwischen Perioden. Als Marker nutzbar, nicht als Kaufsignal. | deskriptiv |
| Fading (RS12 Top-10, RS3M > 20) | Kein messbarer Nachteil: Exzess 60T +2,01 % vs. Confirmed +2,28 % (Δ −0,27, KI −1,26…0,66); Leader-Anteil bleibt (8,6 % → 9,0 %). Die Bezeichnung „Fading“ ist durch Daten nicht gedeckt. | deskriptiv |
| Confirmed (beide Top-10) | Bestes Bündel: 60T-Exzess +2,28 %, Trefferquote 63,9 %; Δ vs. alle Themes +0,58 (KI 0,02…1,19), in keiner Teilperiode einzeln signifikant. Leader-Anteil fällt 14,6 % → 11,1 % in 60T (beide Perioden). | deskriptiv (Rendite) / validiert (Leader-Rückgang, Richtung) |

**Wichtigster Vorbehalt:** Die Theme-Listen sind heutige Finviz-Zusammenstellungen (Hindsight). „Alle Themes“ schlagen den R3000-Median im Schnitt um +0,57 % (20T) bzw. +1,70 % (60T) – das ist die Signatur dieses Bias und kein Alpha. Belastbar sind daher nur **Differenzen zwischen Gruppen**, nicht absolute Exzesse.

Vergleich zur Vorstudie (GICS): Rangkorrelation 0,68 vs. 0,71 ✔, Top-10-Schnittmenge 6,1 vs. 5 (etwas höher), Persistenz 53 vs. 52–53 ✔. **Deutliche Abweichung:** Anteil neuer RS3M-Top-10, der die RS12M-Top-10 erreicht: 84 % (250T) vs. 61 %, Vorlauf 30 vs. 40 Tage. Gründe: (1) nur 40 Themes statt ~160 Sub-Industries → Top-10 sind 25 % des Universums, zufällige Rotation allein bringt 74 % Eintrittsquote (Basis, s. Analyse 2); (2) die Themes sind eng und stark korreliert (Median-Rang springt schneller); (3) Survivorship/Hindsight in der Theme-Auswahl; (4) Stichprobe 2011–2026 vs. kürzerer Zeitraum der Vorstudie.

## Setup

| Punkt | Wert |
|---|---|
| Theme-Datei | `docs/data/theme_constituents.json`, Schema v2: `themes: { <Name>: { source, members_total, thin, tickers: ["EXCHANGE:SYM", …] } }`, 40 Themes, 1 695 Zuordnungen (Tickers mehrfach möglich) |
| Kurse | Norgate TR-adjustiert, daily, ab 2010-01-01; 6 818 Symbole (R3000 „Current & Past“ + Theme-Ticker), Delistings enthalten |
| Unbekannt bei Norgate | `CSAN`, `DBRG` (übersprungen) |
| Universum | Russell-3000-Mitgliedschaft zeitpunktgenau (`index_constituent_timeseries`) |
| RS | RS12 = 0,4·r63 + 0,2·r126 + 0,2·r189 + 0,2·r252; RS3 = r63; Perzentil gegen R3000-Mitglieder des Tages, Wert vom Vortag |
| Theme-RS | Median der Mitglieder-Ränge, ≥ 4 Mitglieder (im Mittel 28 Mitglieder/Theme, immer 40 von 40 Themes qualifiziert) |
| Stichtage | jeder 5. Handelstag: 792 (2011-01-05 … 2026-09-29), 402 in 2011–2018, 390 in 2019–heute |
| Forward-Exzess | Median-Return der Theme-Mitglieder minus Median aller R3000-Aktien; Delistings werden zum letzten Kurs fortgeschrieben |
| Konfidenzintervall | Block-Bootstrap über Stichtage, Blocklänge 12, 2 000 Ziehungen |

## Bias-Kontrolle

| Punkt | Befund |
|---|---|
| Theme-Erstellungsdatum | **Nicht nachvollziehbar.** `theme_constituents.json` hat 3 Commits, alle am 2026-10-03 (Erstanlage; Quelle 1:1 aktuelle Finviz-Themes). `docs/history.json` führt nur GICS-Industries ab 2026-05-18, keine Themes. Ein „ab Erstellung“-Schnitt ist nicht möglich → **alle Ergebnisse tragen Hindsight-/Survivorship-Bias** (heutige Mitglieder, heutige Theme-Relevanz). |
| Mitglieder außerhalb R3000 | Fallen an Tagen ohne R3000-Mitgliedschaft heraus (Theme-Mediane basieren nur auf R3000-Mitgliedern). |
| Zellen < 30 Fälle | Keine betroffen (kleinste Zelle: Fading 20T/2019+ mit 511 Fällen). Fälle überlappen jedoch stark (5T-Raster, 20/60T Horizont) → effektives n deutlich kleiner; deshalb Block-Bootstrap. |
| Absolute Exzesse | „Alle Themes“ +0,57 % (20T) / +1,70 % (60T) > 0 = Bias-Signatur; nur Differenzen interpretieren. |

## Analyse 1 – Überschneidung

| Periode | Stichtage | Spearman Ø | Top-5 gemeinsam (von 5) | Top-10 gemeinsam (von 10) |
|---|---|---|---|---|
| 2011–2018 | 402 | 0,67 | 2,36 | 6,00 |
| 2019–heute | 390 | 0,69 | 2,62 | 6,26 |
| Gesamt | 792 | 0,68 | 2,49 | 6,13 |

Label: **validiert** (stabil in beiden Perioden).

## Analyse 2 – Vorlauf (neu in RS3M-Top-10, nicht in RS12M-Top-10)

| Periode | Gruppe | Fälle | erreicht RS12-Top-10 in 60T | in 250T | Median Tage |
|---|---|---|---|---|---|
| 2011–2018 | Neu in RS3M-Top-10 | 635 | 55,4 % | 83,3 % | 30 |
| 2011–2018 | Basis (alle außerhalb RS12-Top-10) | 12 029 | 36,8 % | 74,5 % | 65 |
| 2019–heute | Neu in RS3M-Top-10 | 482 | 57,1 % | 85,9 % | 30 |
| 2019–heute | Basis | 10 166 | 35,0 % | 73,8 % | 70 |
| Gesamt | Neu in RS3M-Top-10 | 1 117 | 56,1 % | 84,4 % | 30 |
| Gesamt | Basis | 22 195 | 36,0 % | 74,2 % | 65 |

Label: **validiert (Richtung)** – +19…22 %-Pkt in 60T in beiden Perioden. Der 250T-Wert (84 %) ist überwiegend Basisrate (74 %) → dort nur deskriptiv. Fälle sind je Theme geclustert; kein Bootstrap-KI.

## Analyse 3 – Persistenz / Vorhersagekraft

Forward-Exzess in % (Median-Mitglieder-Return minus R3000-Median); KI95 nur für Gesamt gezeigt, Teilperioden in `out/a3_forward.csv`.

| Gruppe | Periode | Fälle | 20T Mittel | 20T Treffer | 60T Mittel | 60T Treffer |
|---|---|---|---|---|---|---|
| Alle Themes | 2011–2018 | 16 080 | 0,47 | 57,7 % | 1,48 | 63,9 % |
| Alle Themes | 2019–heute | 15 440 | 0,68 | 57,6 % | 1,93 | 59,0 % |
| Nur RS3M-Top-10 | 2011–2018 | 1 641 | 0,39 | 55,9 % | 1,16 | 59,9 % |
| Nur RS3M-Top-10 | 2019–heute | 1 457 | 1,09 | 60,7 % | 2,50 | 62,3 % |
| Nur RS12M-Top-10 | 2011–2018 | 1 639 | 0,54 | 57,8 % | 1,85 | 66,3 % |
| Nur RS12M-Top-10 | 2019–heute | 1 475 | 0,66 | 57,8 % | 1,82 | 58,8 % |
| Beide Top-10 | 2011–2018 | 2 412 | 0,59 | 59,4 % | 1,91 | 67,0 % |
| Beide Top-10 | 2019–heute | 2 420 | 0,89 | 58,6 % | 2,65 | 60,6 % |

Differenzen (gepaart, Block-Bootstrap), %-Punkte:

| Vergleich | Horizont | 2011–2018 | 2019–heute | Gesamt [KI95] | Label |
|---|---|---|---|---|---|
| RS3M-Top-10 − RS12M-Top-10 | 20T | −0,06 | +0,16 | +0,05 [−0,08; 0,20] | deskriptiv |
| RS3M-Top-10 − RS12M-Top-10 | 60T | −0,28 | +0,26 | −0,02 [−0,37; 0,37] | deskriptiv (Vorzeichenwechsel) |
| Nur RS3M − nur RS12M | 20T | −0,15 | +0,43 | +0,12 [−0,21; 0,47] | deskriptiv |
| Nur RS3M − nur RS12M | 60T | −0,69 | +0,68 | −0,06 [−1,07; 0,96] | deskriptiv (Vorzeichenwechsel) |
| Beide Top-10 − alle Themes | 20T | +0,12 | +0,21 | +0,17 [−0,08; 0,41] | deskriptiv |
| Beide Top-10 − alle Themes | 60T | +0,43 | +0,72 | +0,58 [0,02; 1,19] | deskriptiv (Teilperioden KI ∋ 0) |

Rang-Persistenz (Theme-Perzentil 60T später): RS3M-Top-10 → RS3M-Rang 53,2 / RS12M-Rang 66,5; RS12M-Top-10 → 53,1 / 70,7; Beide → 54,7 / 74,5 (Basis 50). Der RS3M-Rang-Wert 53 entspricht der Vorstudie (52–53); der höhere RS12M-Wert ist teils mechanisch (überlappende 252T-Fenster).

## Analyse 4 – Rising / Confirmed / Fading

Bei 40 Themes ist X = N/4 = 10 identisch mit X = 10 (N ist konstant 40).

| Klasse | Periode | Fälle | 20T Mittel | 20T Treffer | 60T Mittel | 60T Treffer |
|---|---|---|---|---|---|---|
| Rising X=5 | 2011–2018 | 4 321 | 0,38 | 56,1 % | 1,31 | 62,2 % |
| Rising X=5 | 2019–heute | 3 970 | 0,75 | 58,0 % | 1,88 | 58,2 % |
| Rising X=10 (= N/4) | 2011–2018 | 2 158 | 0,33 | 55,3 % | 1,03 | 60,3 % |
| Rising X=10 (= N/4) | 2019–heute | 1 976 | 0,99 | 59,5 % | 2,16 | 59,5 % |
| Confirmed | 2011–2018 | 2 412 | 0,59 | 59,4 % | 1,91 | 67,0 % |
| Confirmed | 2019–heute | 2 420 | 0,89 | 58,6 % | 2,65 | 60,6 % |
| Fading | 2011–2018 | 602 | 0,57 | 56,0 % | 1,98 | 65,3 % |
| Fading | 2019–heute | 511 | 0,68 | 57,0 % | 2,05 | 60,0 % |
| Alle Themes | 2011–2018 | 16 080 | 0,47 | 57,7 % | 1,48 | 63,9 % |
| Alle Themes | 2019–heute | 15 440 | 0,68 | 57,6 % | 1,93 | 59,0 % |

Differenz zu „alle Themes“ (Gesamt, %-Pkt, KI95):

| Klasse | 20T | 60T | Label |
|---|---|---|---|
| Rising X=10 | +0,07 [−0,16; 0,32] (2011–18 −0,14 / 2019+ +0,31) | −0,14 [−0,85; 0,56] (−0,45 / +0,23) | deskriptiv (Vorzeichenwechsel) |
| Confirmed | +0,17 [−0,08; 0,42] | +0,58 [0,02; 1,17] | deskriptiv |
| Fading | +0,05 [−0,30; 0,34] | +0,31 [−0,52; 1,12] | deskriptiv |
| Fading − Confirmed | −0,12 [−0,55; 0,26] | −0,27 [−1,26; 0,66] | deskriptiv (kein Unterschied) |

## Analyse 5 – Leader-Bezug (Anteil Aktien mit RS12 ≥ 95 oder RS3M ≥ 95)

| Klasse | Periode | Fälle | heute | +60T | Δ |
|---|---|---|---|---|---|
| Rising X=10 | 2011–2018 | 2 158 | 5,3 % | 5,3 % | +0,0 |
| Rising X=10 | 2019–heute | 1 915 | 7,5 % | 8,2 % | +0,7 |
| Confirmed | 2011–2018 | 2 412 | 11,7 % | 9,3 % | −2,4 |
| Confirmed | 2019–heute | 2 376 | 17,6 % | 13,0 % | −4,6 |
| Fading | 2011–2018 | 602 | 7,9 % | 8,6 % | +0,8 |
| Fading | 2019–heute | 488 | 9,6 % | 9,5 % | −0,1 |
| Alle Themes | Gesamt | 31 200 | 7,7 % | 7,6 % | −0,1 |

Rising-Themes haben *weniger* Leader als der Schnitt und bauen keine auf; Confirmed-Themes verlieren in beiden Perioden Leader (Mean-Reversion der Spitzengruppe); Fading verliert keine. Label: Confirmed-Rückgang **validiert (Richtung)**, Rising/Fading **deskriptiv**.

## Umsetzungsvorschlag Theme Tracker (noch nichts implementiert)

**Felder pro Theme im JSON** (täglich, aus den vorhandenen Mitglieder-Kursen; RS-Perzentile gegen R3000 bzw. das bestehende Universum):

| Feld | Bedeutung |
|---|---|
| `rs12` | Median RS-12M-Rang (0–100) der Mitglieder (bestehender Wert) |
| `rs3` | Median RS-3M-Rang (r63-Perzentil) der Mitglieder |
| `rank12`, `rank3` | Rang der Themes untereinander (1 = stärkstes) |
| `rank_gap` | `rank12 − rank3` (positiv = RS3M stärker) |
| `state` | `rising` · `confirmed` · `fading` · `neutral` |
| `leaders95` | Anteil Mitglieder mit RS12 ≥ 95 oder RS3 ≥ 95 |
| `n_ranked` | Anzahl Mitglieder mit Rang (Mindestgröße 4) |

**Schwellen** (relativ zur Themes-Anzahl N, bei N = 40 wie getestet):

| Zustand | Regel | Begründung |
|---|---|---|
| `confirmed` | `rank3 ≤ N/4` **und** `rank12 ≤ N/4` | höchste Hit-Rate (64 % 60T), robustestes Bündel |
| `rising` | `rank_gap ≥ N/4` (= 10) und nicht `confirmed` | X=5 und X=10 liefern gleiche Rendite; 10 halbiert die Fälle und reduziert Rauschen; Vorlauf-Evidenz (Analyse 2) |
| `fading` | `rank12 ≤ N/4` und `rank3 > N/2` (> 20) | wie getestet; Hinweis-Tag, kein Verkaufssignal |
| `neutral` | sonst | |

**Wording/Kommunikation:**
- Rising ist ein *Rotations-/Timing-Hinweis* („RS3M zieht an“), kein Renditeversprechen – Forward-Exzess ist gegenüber allen Themes nicht unterscheidbar.
- Fading bitte nicht als „verlässt/Short“ framen: In den Daten fehlt der Nachteil; Leader-Anteil bleibt stabil. Alternative Bezeichnung: „Cooling“.
- Confirmed bekommt den Zusatz „Leader-Dichte hoch, tendenziell rückläufig“ (14,6 % → 11,1 %).

**Offen / Folgearbeit:**
1. Theme-Erstellungsdatum ab jetzt protokollieren (täglicher Snapshot der Mitgliederlisten) – erst dann ist ein hindsight-freier Out-of-sample-Test möglich.
2. Bei Änderung der Themes-Anzahl (N) die Schwellen relativ halten (N/4, N/2).
3. Test, ob Rising auf Basis *Median-RS3M-Wert* (statt Rang) oder Breadth-Maß (Anteil Mitglieder mit RS3M ≥ 80) stabiler ist, bevor Rising als Signal verwendet wird.
