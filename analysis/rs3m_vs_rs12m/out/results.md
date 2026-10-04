# RS3M vs. RS12M - Ergebnisse (automatisch erzeugt)

## 0. Datenbasis

|  | Wert |
|---|---|
| Kurse | 6818 Symbole mit Kursen, 6682 davon je R3000-Mitglied |
| Stichtage | 792 Stichtage (2011-01-05 bis 2026-09-29), jeder 5. Handelstag |
| Themes | 40 Themes, 1695 Zuordnungen, davon 1693 mit Kursdaten |
| Unbekannt | Theme-Ticker unbekannt bei Norgate (uebersprungen): CSAN, DBRG |
| Abdeckung | Themes mit >= 4 gerankten Mitgliedern: im Mittel 40.0 von 40 je Stichtag; mittlere Mitgliederzahl/Theme 28.2 |

## 1. Ueberschneidung RS3M vs. RS12M (Theme-Rang)

| Periode | Stichtage | Spearman (Mittel) | Spearman (Median) | Top-5 Schnittmenge (von 5) | Top-10 Schnittmenge (von 10) |
|---|---|---|---|---|---|
| 2011-2018 | 402.00 | 0.67 | 0.70 | 2.36 | 6.00 |
| 2019-heute | 390.00 | 0.69 | 0.72 | 2.62 | 6.26 |
| Gesamt | 792.00 | 0.68 | 0.71 | 2.49 | 6.13 |

## 2. Vorlauf: neu in RS3M-Top-10 (nicht in RS12M-Top-10) -> erreicht RS12M-Top-10 binnen 250 Handelstagen

| Periode | Gruppe | Faelle | versch. Themes | erreicht RS12-Top-10 in 250T (%) | erreicht in 60T (%) | Median Tage bis dahin | Hinweis |
|---|---|---|---|---|---|---|---|
| 2011-2018 | Neu in RS3M-Top-10 | 635.00 | 40.00 | 83.31 | 55.43 | 30.00 |  |
| 2011-2018 | Basis: alle Themes ausserhalb RS12M-Top-10 | 12029.00 | 40.00 | 74.52 | 36.77 | 65.00 |  |
| 2019-heute | Neu in RS3M-Top-10 | 482.00 | 40.00 | 85.89 | 57.05 | 30.00 |  |
| 2019-heute | Basis: alle Themes ausserhalb RS12M-Top-10 | 10166.00 | 40.00 | 73.80 | 34.99 | 70.00 |  |
| Gesamt | Neu in RS3M-Top-10 | 1117.00 | 40.00 | 84.42 | 56.13 | 30.00 |  |
| Gesamt | Basis: alle Themes ausserhalb RS12M-Top-10 | 22195.00 | 40.00 | 74.19 | 35.95 | 65.00 |  |

## 3. Persistenz / Vorhersagekraft (Forward-Exzess)


**Forward-Exzess nach Gruppe** (Exzess = Theme-Median-Return minus Median aller R3000-Aktien; KI = Block-Bootstrap, Blocklaenge 12 Stichtage)

| Gruppe | Horizont | Periode | Faelle | Exzess Mittel (%) | Exzess Median (%) | KI95 lo | KI95 hi | Trefferquote (%) | Hinweis |
|---|---|---|---|---|---|---|---|---|---|
| Alle Themes | 20T | 2011-2018 | 16080.00 | 0.47 | 0.45 | 0.23 | 0.69 | 57.73 |  |
| Alle Themes | 20T | 2019-heute | 15440.00 | 0.68 | 0.74 | 0.29 | 1.06 | 57.60 |  |
| Alle Themes | 20T | Gesamt | 31520.00 | 0.57 | 0.56 | 0.36 | 0.78 | 57.66 |  |
| Alle Themes | 60T | 2011-2018 | 16080.00 | 1.48 | 1.53 | 0.91 | 2.03 | 63.85 |  |
| Alle Themes | 60T | 2019-heute | 15120.00 | 1.93 | 1.65 | 0.77 | 2.97 | 58.97 |  |
| Alle Themes | 60T | Gesamt | 31200.00 | 1.70 | 1.57 | 1.10 | 2.35 | 61.49 |  |
| Nur RS3M-Top-10 | 20T | 2011-2018 | 1641.00 | 0.39 | 0.36 | 0.14 | 0.61 | 55.88 |  |
| Nur RS3M-Top-10 | 20T | 2019-heute | 1457.00 | 1.09 | 0.98 | 0.49 | 1.71 | 60.74 |  |
| Nur RS3M-Top-10 | 20T | Gesamt | 3098.00 | 0.72 | 0.63 | 0.42 | 1.04 | 58.17 |  |
| Nur RS3M-Top-10 | 60T | 2011-2018 | 1641.00 | 1.16 | 1.20 | 0.43 | 1.91 | 59.90 |  |
| Nur RS3M-Top-10 | 60T | 2019-heute | 1421.00 | 2.50 | 2.24 | 0.92 | 3.96 | 62.28 |  |
| Nur RS3M-Top-10 | 60T | Gesamt | 3062.00 | 1.78 | 1.53 | 0.97 | 2.66 | 61.01 |  |
| Nur RS12M-Top-10 | 20T | 2011-2018 | 1639.00 | 0.54 | 0.46 | 0.22 | 0.83 | 57.84 |  |
| Nur RS12M-Top-10 | 20T | 2019-heute | 1475.00 | 0.66 | 0.73 | 0.13 | 1.17 | 57.76 |  |
| Nur RS12M-Top-10 | 20T | Gesamt | 3114.00 | 0.60 | 0.58 | 0.30 | 0.87 | 57.80 |  |
| Nur RS12M-Top-10 | 60T | 2011-2018 | 1639.00 | 1.85 | 1.75 | 1.19 | 2.44 | 66.32 |  |
| Nur RS12M-Top-10 | 60T | 2019-heute | 1438.00 | 1.82 | 1.63 | 0.18 | 3.24 | 58.83 |  |
| Nur RS12M-Top-10 | 60T | Gesamt | 3077.00 | 1.84 | 1.71 | 1.03 | 2.64 | 62.82 |  |
| Beide Top-10 | 20T | 2011-2018 | 2412.00 | 0.59 | 0.57 | 0.27 | 0.95 | 59.37 |  |
| Beide Top-10 | 20T | 2019-heute | 2420.00 | 0.89 | 0.99 | 0.28 | 1.50 | 58.64 |  |
| Beide Top-10 | 20T | Gesamt | 4832.00 | 0.74 | 0.74 | 0.40 | 1.11 | 59.00 |  |
| Beide Top-10 | 60T | 2011-2018 | 2412.00 | 1.91 | 1.98 | 1.14 | 2.84 | 67.04 |  |
| Beide Top-10 | 60T | 2019-heute | 2376.00 | 2.65 | 2.27 | 1.29 | 3.99 | 60.61 |  |
| Beide Top-10 | 60T | Gesamt | 4788.00 | 2.28 | 2.06 | 1.47 | 3.16 | 63.85 |  |
| RS3M-Top-10 (gesamt) | 20T | 2011-2018 | 4053.00 | 0.51 | 0.51 | 0.21 | 0.78 | 57.96 |  |
| RS3M-Top-10 (gesamt) | 20T | 2019-heute | 3877.00 | 0.97 | 0.98 | 0.47 | 1.51 | 59.43 |  |
| RS3M-Top-10 (gesamt) | 20T | Gesamt | 7930.00 | 0.73 | 0.70 | 0.46 | 1.04 | 58.68 |  |
| RS3M-Top-10 (gesamt) | 60T | 2011-2018 | 4053.00 | 1.61 | 1.69 | 0.91 | 2.40 | 64.15 |  |
| RS3M-Top-10 (gesamt) | 60T | 2019-heute | 3797.00 | 2.60 | 2.26 | 1.37 | 3.94 | 61.23 |  |
| RS3M-Top-10 (gesamt) | 60T | Gesamt | 7850.00 | 2.09 | 1.87 | 1.40 | 2.86 | 62.74 |  |
| RS12M-Top-10 (gesamt) | 20T | 2011-2018 | 4051.00 | 0.57 | 0.54 | 0.29 | 0.85 | 58.75 |  |
| RS12M-Top-10 (gesamt) | 20T | 2019-heute | 3895.00 | 0.81 | 0.87 | 0.28 | 1.35 | 58.31 |  |
| RS12M-Top-10 (gesamt) | 20T | Gesamt | 7946.00 | 0.68 | 0.66 | 0.38 | 0.99 | 58.53 |  |
| RS12M-Top-10 (gesamt) | 60T | 2011-2018 | 4051.00 | 1.89 | 1.89 | 1.17 | 2.63 | 66.75 |  |
| RS12M-Top-10 (gesamt) | 60T | 2019-heute | 3814.00 | 2.34 | 2.04 | 0.95 | 3.63 | 59.94 |  |
| RS12M-Top-10 (gesamt) | 60T | Gesamt | 7865.00 | 2.11 | 1.93 | 1.36 | 2.90 | 63.45 |  |

**Differenzen (gepaart ueber Stichtage; Label = Bewertung ueber beide Teilperioden, steht in der Zeile 'Gesamt')**

| Differenz | Horizont | Periode | n (kleinere Gruppe) | Delta Exzess (%-Pkt) | KI95 lo | KI95 hi | Label |
|---|---|---|---|---|---|---|---|
| RS3M-Top-10 (gesamt) minus RS12M-Top-10 (gesamt) | 20T | 2011-2018 | 4051.00 | -0.06 | -0.17 | 0.06 |  |
| RS3M-Top-10 (gesamt) minus RS12M-Top-10 (gesamt) | 20T | 2019-heute | 3877.00 | 0.16 | -0.09 | 0.42 |  |
| RS3M-Top-10 (gesamt) minus RS12M-Top-10 (gesamt) | 20T | Gesamt | 7930.00 | 0.05 | -0.08 | 0.20 | deskriptiv |
| RS3M-Top-10 (gesamt) minus RS12M-Top-10 (gesamt) | 60T | 2011-2018 | 4051.00 | -0.28 | -0.57 | 0.07 |  |
| RS3M-Top-10 (gesamt) minus RS12M-Top-10 (gesamt) | 60T | 2019-heute | 3797.00 | 0.26 | -0.45 | 0.94 |  |
| RS3M-Top-10 (gesamt) minus RS12M-Top-10 (gesamt) | 60T | Gesamt | 7850.00 | -0.02 | -0.37 | 0.37 | deskriptiv |
| Nur RS3M-Top-10 minus Nur RS12M-Top-10 | 20T | 2011-2018 | 1639.00 | -0.15 | -0.40 | 0.17 |  |
| Nur RS3M-Top-10 minus Nur RS12M-Top-10 | 20T | 2019-heute | 1457.00 | 0.43 | -0.21 | 1.05 |  |
| Nur RS3M-Top-10 minus Nur RS12M-Top-10 | 20T | Gesamt | 3098.00 | 0.12 | -0.21 | 0.47 | deskriptiv |
| Nur RS3M-Top-10 minus Nur RS12M-Top-10 | 60T | 2011-2018 | 1639.00 | -0.69 | -1.43 | 0.11 |  |
| Nur RS3M-Top-10 minus Nur RS12M-Top-10 | 60T | 2019-heute | 1421.00 | 0.68 | -1.15 | 2.63 |  |
| Nur RS3M-Top-10 minus Nur RS12M-Top-10 | 60T | Gesamt | 3062.00 | -0.06 | -1.07 | 0.96 | deskriptiv |
| Beide Top-10 minus Alle Themes | 20T | 2011-2018 | 2412.00 | 0.12 | -0.12 | 0.38 |  |
| Beide Top-10 minus Alle Themes | 20T | 2019-heute | 2420.00 | 0.21 | -0.23 | 0.66 |  |
| Beide Top-10 minus Alle Themes | 20T | Gesamt | 4832.00 | 0.17 | -0.08 | 0.41 | deskriptiv |
| Beide Top-10 minus Alle Themes | 60T | 2011-2018 | 2412.00 | 0.43 | -0.04 | 1.03 |  |
| Beide Top-10 minus Alle Themes | 60T | 2019-heute | 2376.00 | 0.72 | -0.26 | 1.72 |  |
| Beide Top-10 minus Alle Themes | 60T | Gesamt | 4788.00 | 0.58 | 0.02 | 1.19 | deskriptiv |
| Nur RS3M-Top-10 minus Alle Themes | 20T | 2011-2018 | 1641.00 | -0.08 | -0.22 | 0.05 |  |
| Nur RS3M-Top-10 minus Alle Themes | 20T | 2019-heute | 1457.00 | 0.41 | -0.04 | 0.90 |  |
| Nur RS3M-Top-10 minus Alle Themes | 20T | Gesamt | 3098.00 | 0.15 | -0.09 | 0.38 | deskriptiv |
| Nur RS3M-Top-10 minus Alle Themes | 60T | 2011-2018 | 1641.00 | -0.33 | -0.70 | 0.10 |  |
| Nur RS3M-Top-10 minus Alle Themes | 60T | 2019-heute | 1421.00 | 0.57 | -0.61 | 1.72 |  |
| Nur RS3M-Top-10 minus Alle Themes | 60T | Gesamt | 3062.00 | 0.08 | -0.51 | 0.68 | deskriptiv |
| Nur RS12M-Top-10 minus Alle Themes | 20T | 2011-2018 | 1639.00 | 0.07 | -0.19 | 0.28 |  |
| Nur RS12M-Top-10 minus Alle Themes | 20T | 2019-heute | 1475.00 | -0.02 | -0.39 | 0.34 |  |
| Nur RS12M-Top-10 minus Alle Themes | 20T | Gesamt | 3114.00 | 0.02 | -0.20 | 0.23 | deskriptiv |
| Nur RS12M-Top-10 minus Alle Themes | 60T | 2011-2018 | 1639.00 | 0.37 | -0.20 | 0.92 |  |
| Nur RS12M-Top-10 minus Alle Themes | 60T | 2019-heute | 1438.00 | -0.11 | -1.13 | 0.86 |  |
| Nur RS12M-Top-10 minus Alle Themes | 60T | Gesamt | 3077.00 | 0.14 | -0.42 | 0.68 | deskriptiv |

**Rang-Persistenz: Theme-Perzentil 60 Handelstage spaeter (Vorstudie: 52-53 vs. 50,5)**

| Gruppe | Periode | Faelle | Perzentil RS3M-Rang +60T | Perzentil RS12M-Rang +60T | Basis |
|---|---|---|---|---|---|
| RS3M-Top-10 | 2011-2018 | 4053.00 | 52.58 | 65.51 | 50.00 |
| RS3M-Top-10 | 2019-heute | 3797.00 | 53.94 | 67.65 | 50.00 |
| RS3M-Top-10 | Gesamt | 7850.00 | 53.24 | 66.54 | 50.00 |
| RS12M-Top-10 | 2011-2018 | 4051.00 | 53.85 | 70.96 | 50.00 |
| RS12M-Top-10 | 2019-heute | 3814.00 | 52.23 | 70.42 | 50.00 |
| RS12M-Top-10 | Gesamt | 7865.00 | 53.06 | 70.70 | 50.00 |
| Beide | 2011-2018 | 2412.00 | 55.10 | 74.61 | 50.00 |
| Beide | 2019-heute | 2376.00 | 54.31 | 74.44 | 50.00 |
| Beide | Gesamt | 4788.00 | 54.71 | 74.53 | 50.00 |

## 4. Rising / Confirmed / Fading


**Forward-Exzess und Trefferquote nach Klasse** (Exzess = Theme-Median-Return minus Median aller R3000-Aktien; KI = Block-Bootstrap, Blocklaenge 12 Stichtage)

| Gruppe | Horizont | Periode | Faelle | Exzess Mittel (%) | Exzess Median (%) | KI95 lo | KI95 hi | Trefferquote (%) | Hinweis |
|---|---|---|---|---|---|---|---|---|---|
| Rising X=5 | 20T | 2011-2018 | 4321.00 | 0.38 | 0.36 | 0.16 | 0.60 | 56.14 |  |
| Rising X=5 | 20T | 2019-heute | 3970.00 | 0.75 | 0.74 | 0.28 | 1.22 | 57.96 |  |
| Rising X=5 | 20T | Gesamt | 8291.00 | 0.56 | 0.50 | 0.31 | 0.82 | 57.01 |  |
| Rising X=5 | 60T | 2011-2018 | 4321.00 | 1.31 | 1.42 | 0.67 | 1.94 | 62.21 |  |
| Rising X=5 | 60T | 2019-heute | 3878.00 | 1.88 | 1.58 | 0.52 | 3.19 | 58.23 |  |
| Rising X=5 | 60T | Gesamt | 8199.00 | 1.58 | 1.46 | 0.89 | 2.29 | 60.32 |  |
| Rising X=10 | 20T | 2011-2018 | 2158.00 | 0.33 | 0.32 | 0.06 | 0.58 | 55.28 |  |
| Rising X=10 | 20T | 2019-heute | 1976.00 | 0.99 | 0.87 | 0.43 | 1.53 | 59.46 |  |
| Rising X=10 | 20T | Gesamt | 4134.00 | 0.64 | 0.53 | 0.31 | 0.98 | 57.28 |  |
| Rising X=10 | 60T | 2011-2018 | 2158.00 | 1.03 | 1.27 | 0.17 | 1.81 | 60.33 |  |
| Rising X=10 | 60T | 2019-heute | 1915.00 | 2.16 | 1.93 | 0.32 | 3.80 | 59.48 |  |
| Rising X=10 | 60T | Gesamt | 4073.00 | 1.56 | 1.52 | 0.67 | 2.46 | 59.93 |  |
| Rising X=N/4 (=10 bei 40 Themes) | 20T | 2011-2018 | 2158.00 | 0.33 | 0.32 | 0.04 | 0.58 | 55.28 |  |
| Rising X=N/4 (=10 bei 40 Themes) | 20T | 2019-heute | 1976.00 | 0.99 | 0.87 | 0.42 | 1.54 | 59.46 |  |
| Rising X=N/4 (=10 bei 40 Themes) | 20T | Gesamt | 4134.00 | 0.64 | 0.53 | 0.32 | 0.97 | 57.28 |  |
| Rising X=N/4 (=10 bei 40 Themes) | 60T | 2011-2018 | 2158.00 | 1.03 | 1.27 | 0.12 | 1.81 | 60.33 |  |
| Rising X=N/4 (=10 bei 40 Themes) | 60T | 2019-heute | 1915.00 | 2.16 | 1.93 | 0.49 | 3.65 | 59.48 |  |
| Rising X=N/4 (=10 bei 40 Themes) | 60T | Gesamt | 4073.00 | 1.56 | 1.52 | 0.66 | 2.40 | 59.93 |  |
| Confirmed (beide Top-10) | 20T | 2011-2018 | 2412.00 | 0.59 | 0.57 | 0.26 | 0.92 | 59.37 |  |
| Confirmed (beide Top-10) | 20T | 2019-heute | 2420.00 | 0.89 | 0.99 | 0.28 | 1.49 | 58.64 |  |
| Confirmed (beide Top-10) | 20T | Gesamt | 4832.00 | 0.74 | 0.74 | 0.41 | 1.09 | 59.00 |  |
| Confirmed (beide Top-10) | 60T | 2011-2018 | 2412.00 | 1.91 | 1.98 | 1.17 | 2.80 | 67.04 |  |
| Confirmed (beide Top-10) | 60T | 2019-heute | 2376.00 | 2.65 | 2.27 | 1.31 | 4.11 | 60.61 |  |
| Confirmed (beide Top-10) | 60T | Gesamt | 4788.00 | 2.28 | 2.06 | 1.51 | 3.13 | 63.85 |  |
| Fading (RS12 Top-10, RS3M > 20) | 20T | 2011-2018 | 602.00 | 0.57 | 0.36 | 0.17 | 0.95 | 55.98 |  |
| Fading (RS12 Top-10, RS3M > 20) | 20T | 2019-heute | 511.00 | 0.68 | 0.74 | 0.07 | 1.21 | 56.95 |  |
| Fading (RS12 Top-10, RS3M > 20) | 20T | Gesamt | 1113.00 | 0.62 | 0.54 | 0.24 | 0.93 | 56.42 |  |
| Fading (RS12 Top-10, RS3M > 20) | 60T | 2011-2018 | 602.00 | 1.98 | 1.74 | 1.11 | 2.76 | 65.28 |  |
| Fading (RS12 Top-10, RS3M > 20) | 60T | 2019-heute | 488.00 | 2.05 | 2.01 | -0.04 | 3.55 | 60.04 |  |
| Fading (RS12 Top-10, RS3M > 20) | 60T | Gesamt | 1090.00 | 2.01 | 1.79 | 1.00 | 2.96 | 62.94 |  |
| Alle Themes | 20T | 2011-2018 | 16080.00 | 0.47 | 0.45 | 0.25 | 0.68 | 57.73 |  |
| Alle Themes | 20T | 2019-heute | 15440.00 | 0.68 | 0.74 | 0.29 | 1.05 | 57.60 |  |
| Alle Themes | 20T | Gesamt | 31520.00 | 0.57 | 0.56 | 0.36 | 0.81 | 57.66 |  |
| Alle Themes | 60T | 2011-2018 | 16080.00 | 1.48 | 1.53 | 0.90 | 2.05 | 63.85 |  |
| Alle Themes | 60T | 2019-heute | 15120.00 | 1.93 | 1.65 | 0.80 | 3.01 | 58.97 |  |
| Alle Themes | 60T | Gesamt | 31200.00 | 1.70 | 1.57 | 1.12 | 2.31 | 61.49 |  |

**Differenzen (gepaart ueber Stichtage; Label = Bewertung ueber beide Teilperioden, steht in der Zeile 'Gesamt')**

| Differenz | Horizont | Periode | n (kleinere Gruppe) | Delta Exzess (%-Pkt) | KI95 lo | KI95 hi | Label |
|---|---|---|---|---|---|---|---|
| Rising X=10 minus Alle Themes | 20T | 2011-2018 | 2158.00 | -0.14 | -0.35 | 0.05 |  |
| Rising X=10 minus Alle Themes | 20T | 2019-heute | 1976.00 | 0.31 | -0.12 | 0.76 |  |
| Rising X=10 minus Alle Themes | 20T | Gesamt | 4134.00 | 0.07 | -0.18 | 0.30 | deskriptiv |
| Rising X=10 minus Alle Themes | 60T | 2011-2018 | 2158.00 | -0.45 | -1.11 | 0.15 |  |
| Rising X=10 minus Alle Themes | 60T | 2019-heute | 1915.00 | 0.23 | -1.00 | 1.45 |  |
| Rising X=10 minus Alle Themes | 60T | Gesamt | 4073.00 | -0.14 | -0.83 | 0.50 | deskriptiv |
| Confirmed (beide Top-10) minus Alle Themes | 20T | 2011-2018 | 2412.00 | 0.12 | -0.11 | 0.39 |  |
| Confirmed (beide Top-10) minus Alle Themes | 20T | 2019-heute | 2420.00 | 0.21 | -0.20 | 0.65 |  |
| Confirmed (beide Top-10) minus Alle Themes | 20T | Gesamt | 4832.00 | 0.17 | -0.08 | 0.42 | deskriptiv |
| Confirmed (beide Top-10) minus Alle Themes | 60T | 2011-2018 | 2412.00 | 0.43 | -0.05 | 1.04 |  |
| Confirmed (beide Top-10) minus Alle Themes | 60T | 2019-heute | 2376.00 | 0.72 | -0.26 | 1.81 |  |
| Confirmed (beide Top-10) minus Alle Themes | 60T | Gesamt | 4788.00 | 0.58 | -0.01 | 1.18 | deskriptiv |
| Fading (RS12 Top-10, RS3M > 20) minus Alle Themes | 20T | 2011-2018 | 602.00 | 0.10 | -0.30 | 0.52 |  |
| Fading (RS12 Top-10, RS3M > 20) minus Alle Themes | 20T | 2019-heute | 511.00 | -0.00 | -0.55 | 0.44 |  |
| Fading (RS12 Top-10, RS3M > 20) minus Alle Themes | 20T | Gesamt | 1113.00 | 0.05 | -0.28 | 0.35 | deskriptiv |
| Fading (RS12 Top-10, RS3M > 20) minus Alle Themes | 60T | 2011-2018 | 602.00 | 0.50 | -0.45 | 1.43 |  |
| Fading (RS12 Top-10, RS3M > 20) minus Alle Themes | 60T | 2019-heute | 488.00 | 0.12 | -1.51 | 1.31 |  |
| Fading (RS12 Top-10, RS3M > 20) minus Alle Themes | 60T | Gesamt | 1090.00 | 0.31 | -0.53 | 1.10 | deskriptiv |
| Fading (RS12 Top-10, RS3M > 20) minus Confirmed (beide Top-10) | 20T | 2011-2018 | 602.00 | -0.02 | -0.49 | 0.44 |  |
| Fading (RS12 Top-10, RS3M > 20) minus Confirmed (beide Top-10) | 20T | 2019-heute | 511.00 | -0.21 | -0.96 | 0.36 |  |
| Fading (RS12 Top-10, RS3M > 20) minus Confirmed (beide Top-10) | 20T | Gesamt | 1113.00 | -0.12 | -0.57 | 0.26 | deskriptiv |
| Fading (RS12 Top-10, RS3M > 20) minus Confirmed (beide Top-10) | 60T | 2011-2018 | 602.00 | 0.07 | -1.13 | 1.06 |  |
| Fading (RS12 Top-10, RS3M > 20) minus Confirmed (beide Top-10) | 60T | 2019-heute | 488.00 | -0.60 | -2.41 | 1.00 |  |
| Fading (RS12 Top-10, RS3M > 20) minus Confirmed (beide Top-10) | 60T | Gesamt | 1090.00 | -0.27 | -1.23 | 0.70 | deskriptiv |

## 5. Leader-Bezug: Anteil Aktien mit RS12 >= 95 oder RS3M >= 95 (heute vs. +60 Handelstage)

| Klasse | Periode | Faelle | Anteil heute (%) | Anteil +60T (%) | Delta (%-Pkt) | Hinweis |
|---|---|---|---|---|---|---|
| Rising X=5 | 2011-2018 | 4321.00 | 5.82 | 5.82 | -0.01 |  |
| Rising X=5 | 2019-heute | 3878.00 | 7.75 | 8.03 | 0.28 |  |
| Rising X=5 | Gesamt | 8199.00 | 6.73 | 6.86 | 0.13 |  |
| Rising X=10 | 2011-2018 | 2158.00 | 5.31 | 5.34 | 0.03 |  |
| Rising X=10 | 2019-heute | 1915.00 | 7.52 | 8.21 | 0.69 |  |
| Rising X=10 | Gesamt | 4073.00 | 6.35 | 6.69 | 0.34 |  |
| Rising X=N/4 (=10 bei 40 Themes) | 2011-2018 | 2158.00 | 5.31 | 5.34 | 0.03 |  |
| Rising X=N/4 (=10 bei 40 Themes) | 2019-heute | 1915.00 | 7.52 | 8.21 | 0.69 |  |
| Rising X=N/4 (=10 bei 40 Themes) | Gesamt | 4073.00 | 6.35 | 6.69 | 0.34 |  |
| Confirmed (beide Top-10) | 2011-2018 | 2412.00 | 11.69 | 9.27 | -2.42 |  |
| Confirmed (beide Top-10) | 2019-heute | 2376.00 | 17.61 | 13.02 | -4.59 |  |
| Confirmed (beide Top-10) | Gesamt | 4788.00 | 14.63 | 11.13 | -3.50 |  |
| Fading (RS12 Top-10, RS3M > 20) | 2011-2018 | 602.00 | 7.85 | 8.61 | 0.76 |  |
| Fading (RS12 Top-10, RS3M > 20) | 2019-heute | 488.00 | 9.62 | 9.53 | -0.09 |  |
| Fading (RS12 Top-10, RS3M > 20) | Gesamt | 1090.00 | 8.64 | 9.02 | 0.38 |  |
| Alle Themes | 2011-2018 | 16080.00 | 6.47 | 6.45 | -0.02 |  |
| Alle Themes | 2019-heute | 15120.00 | 8.98 | 8.74 | -0.24 |  |
| Alle Themes | Gesamt | 31200.00 | 7.69 | 7.56 | -0.12 |  |

## Bias-Kontrolle

- **Survivorship / Look-ahead (Themes):** `docs/data/theme_constituents.json` wurde erstmals am 2026-10-03 committed (3 Commits, alle 2026-10-03); die Zusammenstellung stammt 1:1 von den heutigen Finviz-Themes. Ein Erstellungsdatum je Theme ist aus der Git-History **nicht nachvollziehbar** -> der Zeitraum ab Erstellung kann nicht separat gezeigt werden. **Alle Ergebnisse tragen den Hindsight-Bias** (heutige Mitglieder = oft heutige Gewinner; Theme-Auswahl nach heutiger Relevanz).
- **Preise:** Norgate TR-adjustiert inkl. Delistings; Mitgliedschaft Russell 3000 zeitpunktgenau. Delistete Titel werden im Forward-Return zum letzten Kurs gehalten.
- **Theme-Mitglieder** zaehlen nur an Tagen, an denen sie R3000-Mitglied sind und 252 Tage Historie haben (Theme-Aktien ausserhalb R3000 fallen heraus).
- **Mindestgroessen:** Zellen mit < 30 Faellen sind markiert; Faelle ueberlappen (Forward 20/60T bei 5T-Raster) -> KI per Block-Bootstrap (12 Stichtage).
- **Label-Regel:** validiert = in beiden Teilperioden n>=30, KI95 schliesst 0 aus, gleiches Vorzeichen; fragil = n<30 oder nur in einer Periode signifikant; sonst deskriptiv.