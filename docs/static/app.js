const TIMEFRAMES     = ["1D", "1W", "1M", "3M", "6M", "YTD"];
const ETF_TIMEFRAMES = ["1D", "1W", "1M", "3M", "6M", "YTD"];
const SPARKLINE_ORDER = ["YTD", "6M", "3M", "1M", "1W", "1D"];

// --- i18n ---
const I18N = {
  de: {
    notLoaded:    "— noch nicht geladen —",
    xAxisLabel:   "X-Achse:",
    perfFilterLabel: "% Performance",
    perfFilterAll:   "alle",
    perfFilterReset: "Reset",
    perfFilterTitle: (axis) => `Nur Einträge zeigen, deren ${axis}-Performance über diesem Schwellenwert liegt. Ganz links = kein Filter.`,
    updated:      "Stand: ",
    loading:      "Daten werden geladen…",
    noData:       "Keine Daten.",
    topIndustry:  "Industry",
    tabHeatmap:   "Heatmap",
    tabTop10:     "Top 10",
    tabIndBubble: "🔵 Bubble",
    indBubbleTitle: "🔵 Industry Bubble Chart",
    tabIndRrg:    "🔄 RRG",
    indRrgTitle:  "🔄 Industry RRG",
    heatmapTitle: "Industry Heatmap",
    colIndustry:  "Industry",
    colScore:     "Score",
    colAccel:     "Accel",
    colTrend:     "Trend",
    exportJson:   "📤 JSON kopieren",
    top10Title:   "Top 10 per Zeitraum",
    moversTitle:  "Where is the Puck going?",
    moversSubtitle: "Rank-Veränderung seit dem gewählten Zeitraum. Je größer der Sprung, desto stärker das Momentum.",
    moversRising: "Rising — Puck kommt hier an",
    moversFading: "Cooling — Puck verlässt",
    moversNoData: (period) => `Noch nicht genug Daten für ${period}. Bitte warte bis genug tägliche Snapshots gesammelt wurden.`,
    moversCompare:(date) => `vs. ${date}`,
    viewCards:    "📊 Karten",
    viewBars:     "📈 Balken",
    tagInst:      "INST",
    infoScore:    "Gewichteter Rang-Score: 1M×70% + 1W×20% + 3M×10%. Niedriger = besser (Rang 1 = stärkstes).",
    infoAccel:    "Accel = 3M-Rang minus 1W-Rang. Hoch positiv = war vor 3M noch schwach, jetzt stark = erster Leg, nicht extended. Ideal fuer First-Flag-Setups.",
    hintHeatmap:  "Score sortieren: Marktüberblick — welche Industries aktuell führen.\nAccel sortieren: First Flag Suche — frisches Momentum (3M schwach + 1W stark = erster Leg, nicht extended).\nINST-Filter: zeigt nur institutionell bestätigte Industries (Top 40 in 1M und 3M).\nKlick auf Spaltenkopf = sortieren, nochmal klicken = umkehren.",
    hintIndBubble:"X-Achse: 3M-Performance, Y-Achse: 1M-Performance.\nGröße = Stärke (Score) — starke Industries bleiben groß, egal ob beschleunigend oder konsolidierend.\nFarbe = Accel (stabiler Rang3M−Rang1M): grün = beschleunigt, grau = konsolidiert, rot = fällt ab.\nINST-Filter (Heatmap-Toggle) wirkt auch hier. Klick auf Bubble öffnet Finviz-Screener.",
    hintIndRrg:   "X-Achse: RS-Ratio (3M relativ zum Industry-Schnitt), Y-Achse: RS-Momentum.\nRechts oben Leading, links oben Improving, links unten Lagging, rechts unten Weakening.\nTail = die letzten 10 Handelstage aus den Snapshots, Kopfpunkt = Live-Daten.\nBenchmark ist der Gleichgewichts-Schnitt aller Industries — ein Index liegt nicht mit Historie vor.\nDie beiden Buttons filtern auf die Top-30-%-Schnittmengen; beide aktiv = Vereinigung.\nMaus über eine Industry hebt sie samt Pfad hervor, Klick öffnet den Finviz-Screener.",
    hintTop10:    "Top 10 Performer pro Zeitraum — zeigt aktuelle Marktführer.\nKarten: kompakte Übersicht pro Zeitraum.\nBalken: alle Industries sortiert nach 1M und 3M Performance.\nINST-Badge zeigt institutionelles Interesse.",
    hintMovers:   "Rang-Veränderung seit dem gewählten Zeitraum.\nRising: Industries die am stärksten gestiegen sind — frisches Kapital fließt ein. Hier suchen!\nCooling: Industries die Ränge verloren haben — Kapital verlässt diesen Bereich. Meiden.\nZeitraum wählen: 1W / 2W / 1M / 3M (ausgegraut = noch nicht genug Daten).",
    tabEtfs:      "📈 Themes",
    etfTitle:     "Finviz Thematic Heatmap",
    etfViewThemes:"Themes",
    etfViewEtfs:  "Sub-Themes",
    etfColEtfs:   "Top Sub-Themes",
    etfColAccel:  "Accel",
    etfNoData:    "Theme-Daten werden geladen oder sind noch nicht verfügbar.",
    hintEtfs:     "Finviz Thematic Map — 40 Themes, 268 Sub-Themes (direkte Stock-Daten).\nThemes-Ansicht: Aggregierter Durchschnitt aller Sub-Nodes je Theme. Score = gewichteter Rank (1M×70%+1W×20%+3M×10%).\nSub-Themes: 268 granulare Segmente sortierbar nach beliebigem Zeitraum.\nNutzung: Themes mit starkem 1M UND 3M Score = institutionell bestätigtes Momentum (wie Ariel-Kriterium).",
    hintThemeAccel: "Accel = Differenz zwischen 3M-Rang und 1M-Rang aller Themes.\n\n🟢 Hoher positiver Wert (+10 bis +30): Theme war vor 3 Monaten noch schwach, hat aber im letzten Monat stark aufgeholt → frisches Momentum, ideale First-Flag-Zone. Noch Fleisch am Knochen!\n\n⚪ Nahe null (-5 bis +5): Theme läuft gleichmäßig — weder fresh noch extended.\n\n🔴 Negativer Wert: Theme lief schon vor 3 Monaten stark und ist seitdem abgeflacht → möglicherweise extended oder dreht bereits.",
    hintSubAccel:   "Accel = Differenz zwischen 3M-Rang und 1M-Rang aller 268 Sub-Themes.\n\n🟢 Stark positiv: Sub-Theme war vor 3M noch schwach, zieht jetzt an → frisches Momentum innerhalb des übergeordneten Themes. Ideal für First-Flag-Suche.\n\n⚪ Nahe null: gleichmäßige Bewegung.\n\n🔴 Negativ: Sub-Theme lief 3M schon stark, flacht ab → möglicherweise extended.\n\nTipp: Absteigend sortieren → die heißesten Sub-Theme-Pockets finden.",
    matrixFresh:    "🚀 First Flag Zone",
    matrixFreshSub: "3M schwach → 1M stark",
    matrixTrend:    "⚡ Trending (Extended)",
    matrixTrendSub: "3M stark → 1M stark",
    matrixFading:   "🔻 Cooling",
    matrixFadingSub:"3M stark → 1M schwach",
    matrixDead:     "💀 Dead",
    matrixDeadSub:  "beide schwach",
    vizTable:       "📋 Tabelle",
    top20Title:       "Top 30% der aktuellen Sortierung markieren (zum Kopieren)",
    top20IntersectTitle: "Schnittmenge der Top 30% nach 1W und 1M (nur die stärksten)",
    top20Intersect2Title: "Schnittmenge der Top 30% nach 1M und 3M (nur die stärksten)",
    regimeStale:      "DATEN VERALTET",
    regimeUnknown:    "REGIME ?",
    regimeEffectOn:      "Volle Size (1% Risk/Trade). Add-ons erlaubt.",
    regimeEffectNeutral: "Neue Trades nur mit 0,5% Risk statt 1%. Keine Add-ons.",
    regimeEffectOff:     "Keine neuen Entries. Bereits platzierte GTC-Orders bleiben. Nur Verwaltung offener Positionen.",
    regimeTipTitle:   (d) => `Regime-Gate (QQQ + T2108) — Stand ${d}`,
    regimeTipBreadth: (d) => `Stand ${d}`,
    regimeTipStale:   "⚠ Breadth-Daten älter als 3 Handelstage — Zustand eingefroren.",
    regimeTipNoData:  "Regime-Inputs unvollständig — Zustand nicht berechenbar.",
    regimeTipFooter:  "Schwellen: DEFAULT — UNVALIDIERT",
    saTipTitle:    (d) => `Situational Awareness (Stockbee) — Stand ${d}`,
    saTipIntro:    "Marktbreite-Ampel: In welchem Markt trade ich gerade? Liest die Breadth, um die Odds einzuschätzen, bevor ein Trade eingegangen wird.",
    saOversoldBody:   "Historisch überverkaufter Bereich und Bounce sehr wahrscheinlich. Markt kaufen, z.B. SPY, QQQ, TQQQ.",
    saOversoldAction: "Bedingung: T2108 ≤ 10",
    saGreenBody:   "Aufwärts-Surges dominieren, 5- & 10-Tage-Ratios halten über 1,0, und T2108 steigt durch die 50–65-Zone; 20%-Study-LOW-Count (<20) zeigt extremes Oversold.\nT2108 < 10: starkes bullisches Signal",
    saGreenAction: "Breakouts handeln · Size erhöhen",
    saYellowBody:  "Surges gemischt; 5- & 10-Tage-Ratios pendeln um 1,0; T2108 extended oder choppy. Momentum lässt nach; 20%-Study-HIGH-Count (>100) zeigt überkaufte Lage — Wahrscheinlichkeit eines baldigen Rücksetzers.",
    saYellowAction:"Nur beste Setups · Size reduzieren",
    saRedBody:     "Abwärts-Surges dominieren, 5- & 10-Tage-Ratios unter 1,0, T2108 fällt. Distribution läuft.",
    saRedAction:   "Abseits stehen · Kapital schützen",
    saValRatio5:   "5-Tage-Ratio",
    saValRatio10:  "10-Tage-Ratio",
    saVal4pct:     "4% up / down heute",
    saRising:      "steigend (über Ø der letzten 5 Tage)",
    saFalling:     "fallend (unter Ø der letzten 5 Tage)",
    saStale:       "DATEN VERALTET",
    saUnknown:     "BREADTH ?",
    saTipStale:    "⚠ Breadth-Daten älter als 3 Handelstage — Zustand nicht aktuell.",
    saTipNoData:   "Breadth-Inputs unvollständig — Zustand nicht berechenbar.",
    saRule:        "Regel: NEON-GRÜN = T2108 ≤ 10 (Vorrang) · GRÜN = beide Ratios > 1,0 und T2108 steigend · ROT = beide < 1,0 und T2108 fallend · sonst GELB.",
    // First Flag / Base Breakout (SPEC-first-flag-base-breakout)
    tabThemesOverview: "📊 Übersicht",
    tabFirstFlag:  "🚩 First Flag",
    tabBaseBreak:  "📦 Base Breakout",
    ffTitle:       "🚩 First Flag — Revier-Auswahl",
    bbTitle:       "📦 Base Breakout — Revier-Auswahl",
    ffSubtitle:    "Frische Re-Beschleunigung nach geordneter Korrektur im intakten Trend (Stage PULLBACK). Revier-Auswahl, kein Kaufsignal — die Kaufentscheidung fällt am Einzelchart.",
    bbSubtitle:    "Ausbruch aus flacher Basis (Stage BASE_BREAK). Revier-Auswahl, kein Kaufsignal — die Kaufentscheidung fällt am Einzelchart.",
    hintFirstFlag: "Kriterien: Stage = PULLBACK · Accel ≥ +10 · Frische 1W/1M im Band 0,15–0,65.\nDichte/Breite/Konzentration folgen in Phase 2 — bis dahin „n/v“, blockieren nicht.\nSegmente entschachtelt: m4_6 = Monate 4–6, m2_3 = Monate 2–3, m1 = letzter Monat.\nSchwellen kalibriert am 14.08.2026 (ein Datensatz) — Nachkalibrierung nach ~8 Wochen Snapshots.",
    hintBaseBreak: "Kriterien: Stage = BASE_BREAK · Frische 1W/1M im Band 0,15–0,65 — bewusst OHNE Accel-Kriterium (der Rang-Sprung ist beim Basis-Ausbruch Folge, nicht Vorbedingung).\nDichte/Breite/Konzentration folgen in Phase 2 — bis dahin „n/v“, blockieren nicht.\nSegmente entschachtelt: m4_6 = Monate 4–6, m2_3 = Monate 2–3, m1 = letzter Monat.",
    colStage:      "Stage",
    colDensity:    "Dichte",
    colFreshness:  "Frische",
    colDays:       "Tage",
    colSegments:   "m4_6 · m2_3 · m1",
    colFailsAt:    "Scheitert an",
    setupQualified: "QUALIFIZIERT",
    setupNearMiss:  "KNAPP DANEBEN",
    setupUnknown:   "OHNE KLASSIFIKATION",
    setupGroups:   (n) => `${n} Gruppe${n === 1 ? "" : "n"}`,
    setupEmptyFF:  "Diese Woche kein qualifizierter First Flag. Das ist ein Ergebnis, kein Fehler.",
    setupEmptyBB:  "Diese Woche kein qualifizierter Base Breakout. Das ist ein Ergebnis, kein Fehler.",
    setupEmptyNear: "→ Beinahe-Treffer stehen unter „Knapp daneben“.",
    setupFailsFmt: (label, actual, req) => `${label}: ${actual} (Soll: ${req})`,
    setupUnknownHint: "6M fehlt im Datensatz — Klassifikation nicht möglich.",
    setupMetricsFail: "Kennzahlen-Modul konnte nicht geladen werden — Tab ohne Funktion.",
    copyGroupTitle: "Ticker dieser Gruppe kopieren (kommagetrennt)",
    copyAllBtn:     "📋 Alle kopieren",
    copyAllTitle:   "Alle Gruppen dieser Liste als benannte TradingView-Sektionen kopieren (###Gruppe,TICK,…)",
    copiedSections: (g, tk) => `${g} Gruppe${g === 1 ? "" : "n"} · ${tk} Ticker als Sektionen kopiert!`,
    setupTipDamage: "Schaden (m2_3+m4_6)",
    setupTipConc:  "Konzentration",
    setupTipBreadth: "Breite",
    snapNone:      "Noch keine Snapshot-Historie — „Tage in Stage“ füllt sich ab dem ersten nächtlichen Lauf.",
    snapLast:      (d, n, g) => `Letzter Snapshot: ${d} · ${n} Zeilen · ${g} Lücke${g === 1 ? "" : "n"} (30 T)`,
    snapNotSettled: "vorläufig (Intraday-Lauf)",
    nv:            "n/v",

    // ── Tickers (Bubble-Chart Einzelaktien) ────────────────────────────────
    topTickers:    "🎯 Tickers",
    tickersTitle:  "🎯 Tickers Bubble Chart",
    hintTickers:   "Universum: Ticker aus den Industries UND Themes, die aktuell in der Top-30-%-Schnittmenge nach 1W UND 1M liegen (★ 1W∩1M).\nGefiltert: Market Cap > 1 Mrd. $ und ATR% (20 Tage) > 4 % — beides vollautomatisch, keine manuelle Liste.\nX-Achse: 3M- oder 1W-Performance, Y-Achse: 1M-Performance.\nGröße = Market Cap (log-skaliert). Farbe = Theme/Industry-Gruppe (siehe Legende unten) — gehört ein Ticker zu mehreren Gruppen, zählt die erste (Industries vor Themes), alle stehen im Tooltip.\n„Not Extended“-Toggle: blendet Ticker aus, die weit über ihrem SMA50 laufen (Jeff-Sun-Konvention, siehe eigener Tooltip).\n„Copy Tickers“: kopiert die aktuell sichtbaren Ticker als kommagetrennte Liste zum Einfügen in eine TradingView-Watchlist.\nRechnet einmal pro Handelstag nach US-Close (braucht settled Tageskerzen, wie der Experimental-Tab). Klick auf Bubble öffnet die Finviz-Aktienseite.",
    topLeaders:    "🏆 Leading Stocks",
    leadTitle:     "🏆 Leading Stocks",
    hintLeaders:   "Welche Einzelaktien führen die stärksten Themes an?\nKonstituenten: alle Finviz-Mitglieder des Themes, 1:1 wie Finviz sie zuordnet. „×N“ hinter dem Ticker = Finviz führt ihn in N Themes (z. B. AMZN in 21) — solche Ticker stecken in mehreren Baskets und bewegen deren Breadth gemeinsam. Datei: data/theme_constituents.json.\nOben: Leader-Watchlist nach der Performer Study — jede Aktie einmal, die alle Kriterien erfüllt (RS ≥ 90, 6M > +50 %, ≤ 20 % unter dem 52W-Hoch, über SMA50/SMA200, Preis ≥ 10 $, $-Vol ≥ 5 Mio). „In Play heute“ = zusätzlich der validierte Breakout-Trigger.\nDarunter je Theme: Breadth über alle Konstituenten und die qualifizierten Aktien nach RS vs. Theme. 👑 = Leader = bester qualifizierter Ticker; erfüllt keiner die Kriterien, hat das Theme keinen Leader.\nFilter (Dollarvolumen, ATR%) wirken nur auf die Tabelle, nicht auf die Breadth.\nFehlende Kursdaten = n/a, nie interpoliert. Alle Schwellen: static/config.js.\nRechnet einmal pro Handelstag nach US-Close.",
    leadSortLabel: "Sortierung",
    leadSortScore: "Theme-Score",
    leadSortGroupRs: "Gruppen-RS 3M",
    leadGroupPct:  (p) => `Pz ${p}`,
    leadState:     { rising: "▲ Rising", confirmed: "✔ Confirmed", cooling: "▼ Cooling" },
    leadStateTitle: (r3, r12, gap, n) => `Rang Gruppen-RS 3M #${r3} · 12M #${r12} (Gap ${gap > 0 ? "+" : ""}${gap}) von ${n} Themes`,
    leadSortBreadth: "Breadth",
    leadTopN:      "Top-N",
    leadMinDvol:   "Min $-Vol",
    leadAtr:       "ATR%",
    leadAll:       "alle",
    leadNoData:    "Noch keine Leading-Stocks-Daten — sie entstehen beim nächsten Post-Close-Lauf.",
    leadLoading:   "Lade Kursdaten…",
    leadMeta:      (date, n, uniq, themes) => `Stand ${date} · ${n} Finviz-Zuordnungen (${uniq} eindeutige Ticker) in ${themes} Themes · RS-Gewichtung IBD-Nachbildung (0,4·3M + 0,2·6M + 0,2·9M + 0,2·12M)`,
    leadTipDefault:"Tippe oder fahre über ein ⓘ für Definition und Evidenzbasis.",
    leadMembers:   (n, m) => `${n} Konstituenten${m < n ? ` · ${n - m} ohne Kursdaten` : ""}`,
    leadManual:    "manuell",
    leadThin:      "wenige Mitglieder",
    leadBasketLow: (d, dd) => `Basket-Tief ${d} (${dd} %)`,
    leadNoLow:     "kein Basket-Tief ≥ 10 % im Fenster",
    leadLowOld:    (d) => `Basket-Tief ${d} zu alt für 52W-Hoch-Vergleich`,
    leadEmptyRows: "Kein Ticker erfüllt die Filter.",
    leadEvidence:  { validated: "validiert", convention: "Konvention", overfit: "potenziell überangepasst" },
    leadEvidenceLabel: "Evidenz",
    leadMultiTitle: (n) => `Finviz führt diesen Ticker in ${n} Themes`,
    leadWlTitle:   "🎯 Leader-Watchlist",
    leadWlTable:   "📋 Tabelle",
    leadWlNew:     "Neu",
    leadNewBadge:  "NEU",
    leadNewWord:   "neu",
    leadRemoved:   "raus",
    leadDiffHead:  (d) => `Seit Freitag ${d}:`,
    leadNoRef:     (d) => d ? `„Neu“ startet nächste Woche — das Watchlist-Protokoll beginnt am ${d}` : "„Neu“ startet, sobald das tägliche Watchlist-Protokoll eine Vorwoche enthält.",
    leadWlCharts:  "📈 Charts",
    leadSizeTitle: { S: "Klein: Überblick, viele Charts nebeneinander (bisheriges Format)", M: "Mittel: Karten ab ~520 px, auf großen Bildschirmen 3 Spalten", L: "Groß: ein Chart pro Zeile, bis 1100 px breit" },
    leadChartsRange: "Zeitraum 6 Monate, Bild in Kartenbreite gerendert.",
    leadChartsRangeW: "Zeitraum 2 Jahre, Bild in Kartenbreite gerendert.",
    leadBarSize: "Größe", leadBarTf: "Zeitebene", leadBarOverlay: "Indikatoren",
    leadTfLabel: { d: "Täglich", w: "Wöchentlich" },
    leadTfTitle:   { d: "Tageschart (Kerzen = 1 Tag)", w: "Wochenchart (Kerzen = 1 Woche, Zeitraum 2 Jahre)" },
    leadEmaTitle:  "Blendet EMA8 (cyan) und EMA20 (grün) in die Charts ein — im Tages- wie im Wochenchart auf der jeweiligen Kerzenbasis.",
    leadChartsHintW: "Wochenchart mit SMA50 (orange) und SMA200 (braun), Quelle Finviz. Klick öffnet die Finviz-Aktienseite.",
    leadChartsHintEma: " Zusätzlich EMA8 (cyan) und EMA20 (grün).",
    leadCopy:      "📋 Ticker kopieren",
    leadThemesTvTitle: "Lädt die angezeigten Theme-Karten als .txt herunter (TradingView: Watchlist → Liste importieren): je Karte eine ###Theme-Sektion in der aktuellen Sortierung, darunter genau die Ticker der Karte (aufgeklappte Karten mit allen Zeilen). Ein Ticker kann in mehreren Sektionen stehen.",
    leadCopyTitle: "Kopiert genau die angezeigten Ticker als kommagetrennte EXCHANGE:SYMBOL-Liste — direkt in eine TradingView-Watchlist einfügbar.",
    leadCopied:    (n) => `${n} Ticker kopiert`,
    leadTaTitle:   "Finviz Technical Analysis: blendet SMA20 und die automatische Erkennung von Trendlinien und Chartmustern (Kanäle, Keile, Dreiecke …) in die Charts ein.",
    leadChartsHint:"Tageschart mit SMA50 (orange) und SMA200 (braun), Quelle Finviz. Klick öffnet die Finviz-Aktienseite.",
    leadChartsHintTa: "Technical Analysis aktiv: zusätzlich SMA20 (rosa) und Finviz-Mustererkennung (Trendlinien, Kanäle, Formationen). Die Muster zeichnet Finviz automatisch — sie sind ein Hinweis, kein geprüftes Signal.",
    leadWlCriteria:(W) => `RS ≥ ${W.RS_MIN} · 6M > +${W.P6M_MIN} % · ≤ ${W.DIST_MAX_PCT} % unter 52W-Hoch · über SMA50 und SMA200 · Preis ≥ ${W.MIN_PRICE} $ · Ø $-Vol 50T ≥ ${W.MIN_DVOL50 / 1e6} Mio — Kriterien aus der Performer Study. Themes sind Kontext, kein Filter.`,
    leadWlAll:     "Alle",
    leadWlInPlay:  "In Play heute",
    leadWlEp:      "EP 6T",
    leadWlEmpty:   "Keine Aktie erfüllt aktuell alle Kriterien.",
    leadWlNoUniverse: "RS-Rating nicht verfügbar: Die Kursdatei enthält noch kein RS-Universum (entsteht beim nächsten Post-Close-Lauf).",
    leadThemesTitle: "Themes und ihre Leader",
    leadTrigYes:   "Breakout",
    leadTrigWeak:  "⚠ Vol < 1×",
    leadSetupNone: "Nicht im Setup-Screener: außerhalb seines Universums (Top-Themes je 1W/1M/3M) oder OUT/EXTENDED.",
    leadQualified: (q, n) => `${q} von ${n} erfüllen die Leader-Kriterien`,
    leadShowAll:   (n) => `alle ${n} zeigen`,
    leadShowQualified: "nur qualifizierte",
    leadNoLeader:  "Kein qualifizierter Leader — keine Aktie dieses Themes erfüllt die Watchlist-Kriterien.",
    leadFailsTitle:(s) => `Verfehlt: ${s}`,
    leadFails:     { rs_rating: "RS", p6m: "6M-Performance", wl_dist: "Abstand 52W-Hoch", sma50: "SMA50", sma200: "SMA200", min_price: "Preis", dollar_vol_50d: "$-Vol 50T", no_data: "keine Kursdaten" },
    leadWatchlist: "📥 TradingView Watchlist",
    leadWatchlistTitle: "Lädt die angezeigte Leader-Watchlist als .txt herunter (TradingView: Watchlist → Liste importieren). Erst ###In Play heute, dann je Ticker sein stärkstes Theme als Sektion; jeder Ticker genau einmal, nach RS sortiert.",
    leadWatchlistDone: (n) => `Watchlist mit ${n} Tickern heruntergeladen`,
    leadCols: {
      pct_above_50ma: ["% > SMA50", "Anteil der Konstituenten mit Close über SMA50."],
      pct_near_high:  ["% nahe Hoch", "Anteil der Konstituenten höchstens 10 % unter dem 52W-Hoch (George/Hwang 2004: Nähe zum 52W-Hoch sagt Renditen voraus)."],
      new_highs_5d:   ["Neue Hochs 5T", "Anzahl Konstituenten mit neuem 52W-Hoch (High über dem Maximum der 251 Vortage) in den letzten 5 Handelstagen."],
      rank_change_4w: ["Rang Δ4W", "Veränderung des Theme-Rangs über 20 settled Snapshot-Tage. Positiv = aufgestiegen. n/a, solange die Historie zu kurz ist oder ein Datenloch enthält (Industrie-Momentum, Moskowitz/Grinblatt 1999)."],
      rs_vs_theme:    ["RS Theme", "3M-Performance der Aktie minus 3M-Performance des gleichgewichteten Theme-Baskets (alle Konstituenten), in %-Punkten."],
      rs_vs_spy:      ["RS SPY", "IBD-Nachbildung: 0,4·ROC(63) + 0,2·ROC(126) + 0,2·ROC(189) + 0,2·ROC(252) der Aktie minus derselbe Wert für SPY. IBD veröffentlicht die Formel nicht; Gewichte in config.js."],
      dist_52wh:      ["Abst. 52WH", "Abstand zum 52W-Hoch in ADR-Einheiten (Klammer: in %). −1 = eine durchschnittliche Tagesspanne unter dem Hoch."],
      first_to_high:  ["1. Hoch", "✓ = erster Konstituent mit neuem 52W-Hoch nach dem letzten Basket-Tief (≥ 10 % Drawdown). Datum = eigenes erstes neues Hoch nach dem Tief."],
      down_day_strength: ["Down-Day", "Ø Tagesrendite minus SPY an Tagen mit SPY < −1 % (letzte 60 Tage), in %-Punkten. Klammer = Anzahl solcher Tage — wenige Tage = schwache Aussage."],
      rvol_20d:       ["RVOL", "Heutiges Volumen ÷ Ø Volumen der 20 Tage davor."],
      adr_pct:        ["ADR%", "Ø (High − Low) ÷ Close über 20 Tage."],
      atr_pct:        ["ATR%", "Ø True Range ÷ Close über das gewählte Fenster (1W = 5, 14T = 14, 1M = 20 Tage)."],
      dollar_vol_20d: ["$-Vol", "Ø Close × Volumen über 20 Tage (Liquiditätsfilter)."],
      group_rs12:     ["Gruppen-RS 12M", "Median des RS-Ratings (IBD-Gewichtung 0,4·3M + 0,2·6M + 0,2·9M + 0,2·12M) aller Theme-Mitglieder; #n = Rang unter den Themes (1 = stärkstes). Gegenstück zur 3M-Spalte: zeigt, wo ein Theme langfristig steht."],
      state:          ["Rising / Confirmed / Cooling", "Rotations-Hinweis aus den Theme-Rängen (N = Themes mit beiden Werten, Top = N/4). Confirmed: 3M- und 12M-Rang in den Top-N/4. Rising: 3M-Rang mindestens N/4 Plätze besser als 12M-Rang. Cooling: 12M-Rang in den Top-N/4, 3M-Rang schlechter als N/2. Befund (Norgate, Russell 3000, 2011–2026): neue 3M-Top-10 erreichen die 12M-Top-10 in 60 Tagen zu 56 % (Basis 36 %), im Median nach 30 statt 65 Tagen — aber der Forward-Exzess ist von „alle Themes“ nicht unterscheidbar. Kein Kauf-/Verkaufssignal, Themes sind mit Hindsight gewählt. Details: docs/rs3m_analysis.md."],
      group_rs:       ["Gruppen-RS 3M", "Median des 3M-RS (Perzentil der 63-Tage-Rendite im RS-Universum) aller Theme-Mitglieder; Pz = Perzentil unter den 40 Themes. Gleichgewichtet, daher robust gegen einzelne Megacaps. Definition und Beleg aus der Performer Study (Gruppen-Rang ≥ 90: Lift 1,7 bei Leader-Breakouts) — dort GICS-Sub-Industries, die Übertragung auf Finviz-Themes ist Konvention. Sortierung „Theme-Score“ = Finviz-Rang (1M 70 % / 1W 20 % / 3M 10 %), „Breadth“ = Mittel aus % > SMA50 und % nahe Hoch."],
      rs_rating:      ["RS", "RS-Rating 1–99: IBD-Gewichtung (0,4·3M + 0,2·6M + 0,2·9M + 0,2·12M) als Perzentil gegen die 3.000 liquidesten Aktien der Finviz-Industries (Näherung an den Russell 3000 der Studie). Fett = RS ≥ 95. Studie: RS ≥ 90 validiert, RS ≥ 95 Trefferquote 20 % statt 12 %."],
      p6m:            ["6M", "Kursveränderung über 126 Handelstage. Studie: > +50 % verkleinert die Watchlist, ohne Gewinner zu verlieren."],
      wl_dist:        ["Abst. 52WH", "Abstand zum 52W-Hoch in %. Kriterium: höchstens 20 % darunter (Studie definiert Leader mit ≤ 15 %)."],
      rmv:            ["RMV", "ATR5 ÷ ATR50. Unter 1 (grün) = die Schwankung zieht sich zusammen (VCP). Studie: weniger Signale, aber besserer Erwartungswert — nur Spalte, kein Filter."],
      rvol_50d:       ["RVOL", "Heutiges Volumen ÷ Ø der 50 Vortage. Studie: ≥ 3× ist Teil des Triggers, < 1× am Ausbruch = meiden."],
      trigger:        ["Trigger", "In Play heute: Close über dem Hoch der 20 Vortage UND (RVOL ≥ 3 ODER Gap ≥ 4 %). Studie (RS-95-Variante): 29–31 % der Signale lagen in einem Top-100-Run, positiv in beiden Teilperioden. ⚠ = Volumen unter 1× (meiden)."],
      ep:             ["EP", "Episodic Pivot in den letzten 6 Tagen: Gap ≥ 4 % über dem Vortages-Close bei ≥ 3× Volumen (Earnings-Proxy der Studie). Stärkstes Einzelmerkmal: bei Leadern +0,95 % pro Trade; mit RS ≥ 90 die 6,4-fache Trefferquote."],
      setup:          ["Setup", "Urteil des Setup-Screeners (Experimental-Tab): READY / BREAKOUT / WATCH. — = nicht in dessen Universum oder OUT/EXTENDED."],
      dollar_vol_50d: ["$-Vol 50T", "Ø Close × Volumen über 50 Tage. Kriterium ≥ 5 Mio $ (Studie: Ersatz für die Russell-Mitgliedschaft)."],
      best_theme:     ["Themes", "Alle Finviz-Themes des Tickers, nach Theme-Rang. ★ = Leader dieses Themes. Studie: Gruppen-Rang nur als Kontext — als Filter halbiert er die Abdeckung ohne bessere Trefferquote."],
    },
    tickersNoData: "Noch keine tickers.json — die Datei entsteht beim nächsten Post-Close-Lauf.",
    tickersMeta:   (n, cap, atr, atrDays, date) => `${n} Ticker · Market Cap > $${cap} Mrd. · ATR% (${atrDays}T) > ${atr}% · Stand: ${date}`,
    tickersNotExtTitle: (x) => `Blendet Ticker aus, die mehr als ${x} ATR(20) über ihrem SMA50 liegen — Extension-Konvention (u.a. Jeff Sun): weit über der Norm entfernte Kurse = schlechtes Chance/Risiko für einen neuen Einstieg.\nFormel: (Close − SMA50) ÷ ATR(20). Schwelle ist ein UNVALIDIERTER Default.`,
    tickersCopyTitle: "Kopiert die aktuell angezeigten Ticker (X-Achse + „Not Extended“-Filter berücksichtigt) als kommagetrennte Liste — direkt einfügbar in eine TradingView-Watchlist (Symbol hinzufügen → Liste einfügen).",
    tickersCopied:  (n) => `${n} Ticker kopiert!`,

    // ── Experimental (Stufe 0 + Stufe 1) ──────────────────────────────────
    topExperimental: "🧪 Experimental",
    expTitle:      "🧪 Experimental",
    expSubtitle:   "Zwei unvalidierte Bausteine für Schritt 3 der Tages-Routine: gefilterte Finviz-Links und ein gerechneter Setup-Screener. Nichts hier ersetzt den Chartblick — es sortiert nur vor.",
    hintExp:       "Stufe 0 verändert die Finviz-Links der ganzen App: statt aller Aktien einer Gruppe nach 4-Wochen-Performance (= extended zuerst) nur die nahe am 20-Tage-Hoch, sortiert nach Nähe zum 50-Tage-Hoch.\nStufe 1 rechnet Base-Verengung, Pivot-Abstand und Volumen aus Tages-OHLCV der stärksten Gruppen — dieselben drei Fragen, die du sonst am Mini-Chart beantwortest.\nAlle Schwellen sind Defaults und NICHT backgetestet.",

    expS0Title:    "Stufe 0 — Finviz-Link-Filter",
    expS0Desc:     "Gilt für jeden Finviz-Link der App (Heatmap, Picks, Themes, Sub-Themes). Zwei Fragen, zwei Einstellungen: „Ganzes Revier“ + 3M-Perf beantwortet „wer führt dieses Revier an?“ — „Setup“ + Pivot-Nähe beantwortet „was ist heute kaufbar, ohne extended zu sein?“",
    expS0Off:      "Ganzes Revier",
    expS0Setup:    "Setup (0–5 %)",
    expS0Wide:     "Weit (0–10 %)",
    expS0OffDesc:  "Keine Setup-Vorauswahl — alle Namen der Gruppe mit Volatility 1M > 3 %. Beantwortet „wer führt dieses Revier an?“",
    expS0Strength: "Setup + Stärke",
    expSortLabel:  "Sortierung:",
    expSortPivot:  "Pivot-Nähe",
    expSort3M:     "3M-Perf ↓",
    expSort4W:     "4W-Perf ↓",
    expSortPivotDesc: "o=-high50d — am nächsten am 50-Tage-Hoch zuerst. Sortiert nach ORT (wo steht der Kurs jetzt), nicht nach Weg.",
    expSort3MDesc:    "o=-perf13w — stärkste 3-Monats-Performance zuerst. Sortiert nach WEG: die am weitesten Gelaufenen stehen vorn. Mit Spearman 0,11 gegenüber der Pivot-Nähe praktisch unkorreliert — anderer Blickwinkel, kein Ersatz.",
    expSort4WDesc:    "o=-perf4w — die Bestandssortierung. Stärkste 4-Wochen-Performance zuerst, also die am weitesten gelaufenen Namen ganz oben.",
    expS0SetupDesc:"0–5 % unter 20-T-Hoch · über SMA50 · Vol > 500K · Kurs > $5 · Volatility 1M > 3 % · sortiert nach Nähe zum 50-T-Hoch",
    expS0WideDesc: "wie Setup, aber 0–10 % unter dem 20-T-Hoch — mehr Treffer, mehr Arbeit am Chart",
    expS0StrengthDesc: "wie Setup, zusätzlich 3M-Perf > +20 % — Stärke als Eintrittskarte, Pivot-Nähe bleibt die Reihenfolge (Finviz erlaubt nur einen Sortierschlüssel)",
    expS0Preview:  "Beispiel-Link (stärkste Industry):",
    expBaseline:   "Grundbedingung im ganzen Tab: Volatility 1M > 3 % in jedem Link — und ADR ≥ 3 % als Pendant in der Tabelle. Ruhige Titel tauchen hier gar nicht erst auf.",

    expBubbleXTitle: "Bubble-Chart X-Achse — Default",
    expBubbleXDesc:  "Legt fest, welche Performance beim Laden als X-Achse in den Bubble-Charts (Themes + Industry) steht. Die 3M/1W-Buttons direkt am Chart wechseln nur für die aktuelle Ansicht, ohne diesen Default zu verändern.",
    expBubbleX3M:    "3M",
    expBubbleX1W:    "1W",

    expS1Title:    "Stufe 1 — Gerechneter Setup-Screener",
    expS1Desc:     "Aus Tages-OHLCV der Ticker der stärksten Gruppen. Pivot = höchstes Hoch der letzten 25 Tage ohne die letzten 3. Abstand = Kurs zum Pivot in %.",
    expS1NoData:   "Noch keine setups.json — die Datei entsteht beim nächsten Post-Close-Lauf.",
    expEod:        "EOD",
    expEodNote:    "Wird einmal pro Handelstag nach US-Close gerechnet (Post-Close-Lauf ab 21:30 UTC) — der Rest der App aktualisiert stündlich. Untertags bleibt dieser Stand bewusst stehen: Base, Pivot-Abstand und Volumen brauchen fertige Tageskerzen.",
    expS1Universe: (tk, th) => `${tk} Ticker aus ${th} Themes`,
    expUnivTitle:  "Universum — wie die „stärksten Themes“ bestimmt werden",
    expUnivCount:  (n, pool) => `${n} von ${pool} Themes`,
    expUnivColVia: "qualifiziert über",
    expColTheme:   "Theme",
    expUnivThemeRule: (n, tfs) => `Je Zeitraum (${tfs}) die ${n} Themes mit der höchsten Performance, danach vereinigt — Überschneidungen zählen einmal. Gerankt wird nach tatsächlicher Performance (Mittelwert der Sub-Nodes), NICHT nach dem Score der Themes-Tabelle: der ist ein gewichteter Rang über alle drei Zeiträume und würde die Zeitraum-Frage gerade verwischen. Industries spielen keine Rolle mehr.`,
    expUnivNotUsed: "Bewusst NICHT geprüft: Accel, INST-Badge, Regime-Gate, Weekend-Prep-Stage. Die Auswahl ist reine Momentan-Stärke über 1W/1M/3M — sie ist NICHT die Aufnahme-Formel der Wochenend-Routine (die zusätzlich Accel ≥ +10 und 1M > 0 % verlangt).",
    expUnivColTickers: "Ticker",
    expUnivFootnote: (tk, bars) => `Aus diesen Gruppen: ${tk} eindeutige Ticker, für ${bars} davon kamen Kursdaten zurück. Danach erst greifen ADR-, Liquiditäts- und Setup-Filter.`,
    expS1Empty:    "Keine Kandidaten in dieser Ansicht.",
    expViewTable:  "📋 Tabelle",
    expViewCharts: "🖼 Mini-Charts",
    expOnlyReady:  "Nur READY",
    expTradeable:  "READY + BREAKOUT",
    expAll:        "Alle",
    expCopyBtn:    "📋 Ticker kopieren",
    expTop20:      "Top 30 %",
    expTop20Title: () => `Die besten 30 % der aktuellen Ansicht nach Score markieren. Nochmal klicken hebt die Markierung auf. Einzelne Zeilen lassen sich auch direkt anklicken.`,
    expTop20Marked:(n, min) => `${n} Zeilen markiert (Top 30 %, Score ≥ ${min})`,
    expSelCount:   (n) => `${n} markiert`,
    expCopiedSel:  (n) => `${n} markierte Ticker kopiert!`,
    expCopyTitle:  "Markierte Ticker in die Zwischenablage (kommagetrennt, TradingView-Import) — ohne Markierung die komplette Ansicht",
    expCopied:     (n) => `${n} Ticker kopiert!`,
    expChartsHint: "Mini-Charts direkt von Finviz, vorsortiert nach Setup-Score — dieselben Bilder wie im Screener, nur in deiner Reihenfolge.",

    expColTicker:  "Ticker",
    expColGroup:   "Revier",
    expColVerdict: "Verdict",
    expColSetupSc: "Score",
    expColDist:    "Pivot %",
    expColBase:    "Base (T)",
    expColTight:   "Tight",
    expColDry:     "Dry-Up",
    expColRvol:    "RVOL",
    expColAdr:     "ADR %",
    expCol1M:      "1M %",
    expColPrice:   "Kurs",


    expTipDist:    "Kurs zum Pivot in %. Negativ = darunter, 0 = am Pivot, positiv = ausgebrochen. Über +8 % gilt als extended und fliegt raus.",
    expTipTight:   "ATR(5) ÷ ATR(20). Unter 1 = die Bewegung verengt sich — das ist die rechnerische Form von „saubere Base“.",
    expTipDry:     "Volumen der letzten 5 Tage ÷ 50-Tage-Schnitt. Unter 1 = Volumen trocknet in der Base aus.",
    expTipRvol:    "Heutiges Volumen ÷ 50-Tage-Schnitt. Über 1 am Pivot = Ausbruch mit Beteiligung.",
    expTipScore:   "0–100: Pivot-Nähe 40 · Verengung 25 · Dry-Up 15 · Base-Länge 10 · Trend 10. Reine Sortierhilfe, UNVALIDIERT.",
    expVerdictREADY:    "READY",
    expVerdictBREAKOUT: "BREAKOUT",
    expVerdictWATCH:    "WATCH",
    expReason_at_pivot:       "Am Pivot, Base verengt",
    expReason_running:        "Ausbruch läuft bereits",
    expReason_below_pivot:    "Noch unter dem Pivot",
    expReason_base_too_short: "Base zu kurz",
    expReason_no_contraction: "Keine Verengung",
    vizBubble:      "🔵 Bubble",
    vizMatrix:      "⊞ Matrix",
    vizRrg:         "🔄 RRG",
    rrgQ1:          "🚀 Improving",
    rrgQ2:          "⚡ Leading",
    rrgQ3:          "💤 Lagging",
    rrgQ4:          "🔻 Weakening",
    rrgAxisX:       "RS-Ratio: 3M relativ zum Theme-Schnitt →",
    rrgAxisXInd:    "RS-Ratio: 3M relativ zum Industry-Schnitt →",
    rrgAxisY:       "RS-Momentum ↑",
    rrgLegendBench: "Benchmark = Gleichgewichts-Schnitt aller Themes",
    rrgLegendBenchInd: "Benchmark = Gleichgewichts-Schnitt aller Industries",
    rrgLegendSize:  "Größe = Stärke (Score)",
    rrgLegendTail:  (n) => `Tail = letzte ${n} Tage (Snapshots + live)`,
    rrgNoHistory:   "Noch keine Snapshot-Historie — nur Positionen, keine Tails.",
    rrgFilterNote:  (labels, n, total, noun) => `Filter: ${labels} — ${n} von ${total} ${noun}`,
    rrgFilterEmpty: "Kein Theme erfüllt den gewählten Filter.",
    rrgTip2:        (rs, mom, p1, p3) =>
      `RS-Ratio: ${rs}  |  RS-Momentum: ${mom}
1M: ${p1}%  3M: ${p3}%`,
    expUnvalidated:"UNVALIDIERT — Schwellen sind Defaults, kein Backtest.",
  },
  en: {
    notLoaded:    "— not yet loaded —",
    xAxisLabel:   "X-axis:",
    perfFilterLabel: "% Performance",
    perfFilterAll:   "all",
    perfFilterReset: "Reset",
    perfFilterTitle: (axis) => `Only show entries whose ${axis} performance is above this threshold. Far left = no filter.`,
    updated:      "Updated: ",
    loading:      "Loading data…",
    noData:       "No data.",
    topIndustry:  "Industry",
    tabHeatmap:   "Heatmap",
    tabTop10:     "Top 10",
    tabIndBubble: "🔵 Bubble",
    indBubbleTitle: "🔵 Industry Bubble Chart",
    tabIndRrg:    "🔄 RRG",
    indRrgTitle:  "🔄 Industry RRG",
    heatmapTitle: "Industry Heatmap",
    colIndustry:  "Industry",
    colScore:     "Score",
    colAccel:     "Accel",
    colTrend:     "Trend",
    exportJson:   "📤 Copy JSON",
    top10Title:   "Top 10 per Timeframe",
    moversTitle:  "Where is the Puck going?",
    moversSubtitle: "Rank change since the selected period. The bigger the jump, the stronger the momentum.",
    moversRising: "Rising — Puck heading here",
    moversFading: "Cooling — Puck leaving",
    moversNoData: (period) => `Not enough data for ${period} yet. Wait until enough daily snapshots are collected.`,
    moversCompare:(date) => `vs. ${date}`,
    viewCards:    "📊 Cards",
    viewBars:     "📈 Bar Chart",
    tagInst:      "INST",
    infoScore:    "Weighted rank score: 1M×70% + 1W×20% + 3M×10%. Lower = better (rank 1 = strongest).",
    infoAccel:    "Accel = 3M rank minus 1W rank. High positive = was weak 3M ago, now strong = first leg, not extended. Ideal for First Flag setups.",
    hintHeatmap:  "Sort by Score: market overview — which industries are currently leading.\nSort by Accel: First Flag search — fresh momentum (weak 3M + strong 1W = first leg, not extended).\nINST filter: shows only institutionally confirmed industries (Top 40 in 1M and 3M).\nClick any column header to sort, click again to reverse.",
    hintIndBubble:"X-axis: 3M performance, Y-axis: 1M performance.\nSize = strength (Score) — strong industries stay big regardless of accelerating or consolidating.\nColor = Accel (stable Rank3M−Rank1M): green = accelerating, gray = consolidating, red = cooling.\nThe INST filter (Heatmap toggle) applies here too. Click a bubble to open the Finviz screener.",
    hintIndRrg:   "X axis: RS-Ratio (3M relative to the industry average), Y axis: RS-Momentum.\nTop right leading, top left improving, bottom left lagging, bottom right weakening.\nTail = the last 10 trading days from the snapshots, head = live data.\nBenchmark is the equal-weight average of all industries — no index is available with history.\nThe two buttons filter to the top-30% intersections; both active = union.\nHovering an industry highlights it and its path, clicking opens the Finviz screener.",
    hintTop10:    "Top 10 performers per timeframe — shows current market leaders.\nCards: compact overview per timeframe.\nBar chart: all industries sorted by 1M and 3M performance.\nINST badge shows institutional interest.",
    hintMovers:   "Rank change since the selected period.\nRising: industries that climbed most in ranking — fresh capital flowing in. Look here!\nCooling: industries that lost ranks — capital leaving. Avoid.\nSelect period: 1W / 2W / 1M / 3M (greyed out = not enough data yet).",
    tabEtfs:      "📈 Themes",
    etfTitle:     "Finviz Thematic Heatmap",
    etfViewThemes:"Themes",
    etfViewEtfs:  "Sub-Themes",
    etfColEtfs:   "Top Sub-Themes",
    etfColAccel:  "Accel",
    etfNoData:    "Theme data loading or not yet available.",
    hintEtfs:     "Finviz Thematic Map — 40 themes, 268 sub-themes (direct stock data).\nThemes view: averaged across all sub-nodes per theme. Score = weighted rank (1M×70%+1W×20%+3M×10%).\nSub-Themes: 268 granular segments sortable by any timeframe.\nUsage: themes with strong 1M AND 3M score = institutionally confirmed momentum (Ariel criterion).",
    hintThemeAccel: "Accel = difference between 3M rank and 1M rank across all themes.\n\n🟢 High positive (+10 to +30): theme was weak 3 months ago but surged in the last month → fresh momentum, ideal First Flag zone. Plenty of room to run!\n\n⚪ Near zero (-5 to +5): theme is moving steadily — neither fresh nor extended.\n\n🔴 Negative: theme was already strong 3 months ago and has since slowed → possibly extended or beginning to rotate out.",
    hintSubAccel:   "Accel = difference between 3M rank and 1M rank across all 268 sub-themes.\n\n🟢 High positive: sub-theme was weak 3M ago, now accelerating → fresh momentum within the parent theme. Ideal for First Flag search.\n\n⚪ Near zero: steady movement.\n\n🔴 Negative: sub-theme was already strong 3M ago, now slowing → possibly extended.\n\nTip: Sort descending → find the hottest sub-theme pockets.",
    matrixFresh:    "🚀 First Flag Zone",
    matrixFreshSub: "3M weak → 1M strong",
    matrixTrend:    "⚡ Trending (Extended)",
    matrixTrendSub: "3M strong → 1M strong",
    matrixFading:   "🔻 Cooling",
    matrixFadingSub:"3M strong → 1M weak",
    matrixDead:     "💀 Dead",
    matrixDeadSub:  "both weak",
    vizTable:       "📋 Table",
    top20Title:       "Select the top 30% of the current sort (for copying)",
    top20IntersectTitle: "Intersection of the top 30% by 1W and by 1M (strongest only)",
    top20Intersect2Title: "Intersection of the top 30% by 1M and by 3M (strongest only)",
    regimeStale:      "DATA STALE",
    regimeUnknown:    "REGIME ?",
    regimeEffectOn:      "Full size (1% risk/trade). Add-ons allowed.",
    regimeEffectNeutral: "New trades at 0.5% risk instead of 1%. No add-ons.",
    regimeEffectOff:     "No new entries. Existing GTC orders remain untouched. Manage open positions only.",
    regimeTipTitle:   (d) => `Regime gate (QQQ + T2108) — as of ${d}`,
    regimeTipBreadth: (d) => `as of ${d}`,
    regimeTipStale:   "⚠ Breadth data older than 3 trading days — state frozen.",
    regimeTipNoData:  "Regime inputs incomplete — state cannot be computed.",
    regimeTipFooter:  "Thresholds: DEFAULT — UNVALIDATED",
    saTipTitle:    (d) => `Situational Awareness (Stockbee) — as of ${d}`,
    saTipIntro:    "Market breadth traffic light: what kind of market are you trading in? Reads overall breadth to gauge the odds before you commit to any trade.",
    saOversoldBody:   "Historically oversold territory — a bounce is very likely. Buy the market, e.g. SPY, QQQ, TQQQ.",
    saOversoldAction: "Condition: T2108 ≤ 10",
    saGreenBody:   "Up-surges dominate, 5 & 10-day ratios hold above 1.0, and T2108 is rising through the 50-65 zone; 20% Study LOW Count (<20) indicating extreme oversold.\nT2108 < 10: Strong bullish signal",
    saGreenAction: "Take breakouts · size up",
    saYellowBody:  "Surges mixed; 5 & 10-day ratios hovering near 1.0; T2108 extended or choppy. Momentum is fading; 20% study HIGH count (>100), indicating overbought condition, probability of downturn soon.",
    saYellowAction:"Best setups only · trim size",
    saRedBody:     "Down-surges dominate, 5 & 10-day ratios below 1.0, T2108 falling. Distribution is underway.",
    saRedAction:   "Stand aside · protect capital",
    saValRatio5:   "5-day ratio",
    saValRatio10:  "10-day ratio",
    saVal4pct:     "4% up / down today",
    saRising:      "rising (above 5-day average)",
    saFalling:     "falling (below 5-day average)",
    saStale:       "DATA STALE",
    saUnknown:     "BREADTH ?",
    saTipStale:    "⚠ Breadth data older than 3 trading days — state not current.",
    saTipNoData:   "Breadth inputs incomplete — state cannot be computed.",
    saRule:        "Rule: NEON GREEN = T2108 ≤ 10 (takes precedence) · GREEN = both ratios > 1.0 and T2108 rising · RED = both < 1.0 and T2108 falling · else YELLOW.",
    // First Flag / Base Breakout (SPEC-first-flag-base-breakout)
    tabThemesOverview: "📊 Overview",
    tabFirstFlag:  "🚩 First Flag",
    tabBaseBreak:  "📦 Base Breakout",
    ffTitle:       "🚩 First Flag — hunting grounds",
    bbTitle:       "📦 Base Breakout — hunting grounds",
    ffSubtitle:    "Fresh re-acceleration after an orderly correction in an intact trend (stage PULLBACK). Group selection, not a buy signal — the entry decision is made on the individual chart.",
    bbSubtitle:    "Breakout from a flat base (stage BASE_BREAK). Group selection, not a buy signal — the entry decision is made on the individual chart.",
    hintFirstFlag: "Criteria: stage = PULLBACK · Accel ≥ +10 · freshness 1W/1M within 0.15–0.65.\nDensity/breadth/concentration arrive in phase 2 — “n/a” until then, never blocking.\nDe-nested segments: m4_6 = months 4–6, m2_3 = months 2–3, m1 = last month.\nThresholds calibrated on 2026-08-14 (a single dataset) — recalibrate after ~8 weeks of snapshots.",
    hintBaseBreak: "Criteria: stage = BASE_BREAK · freshness 1W/1M within 0.15–0.65 — deliberately WITHOUT the accel criterion (the rank jump follows a base breakout, it does not precede it).\nDensity/breadth/concentration arrive in phase 2 — “n/a” until then, never blocking.\nDe-nested segments: m4_6 = months 4–6, m2_3 = months 2–3, m1 = last month.",
    colStage:      "Stage",
    colDensity:    "Density",
    colFreshness:  "Freshness",
    colDays:       "Days",
    colSegments:   "m4_6 · m2_3 · m1",
    colFailsAt:    "Fails at",
    setupQualified: "QUALIFIED",
    setupNearMiss:  "NEAR MISS",
    setupUnknown:   "UNCLASSIFIED",
    setupGroups:   (n) => `${n} group${n === 1 ? "" : "s"}`,
    setupEmptyFF:  "No qualified First Flag this week. That is a result, not an error.",
    setupEmptyBB:  "No qualified Base Breakout this week. That is a result, not an error.",
    setupEmptyNear: "→ Near misses are listed under “Near miss”.",
    setupFailsFmt: (label, actual, req) => `${label}: ${actual} (required: ${req})`,
    setupUnknownHint: "6M missing from the dataset — classification not possible.",
    setupMetricsFail: "Metrics module could not be loaded — tab inactive.",
    copyGroupTitle: "Copy this group's tickers (comma-separated)",
    copyAllBtn:     "📋 Copy all",
    copyAllTitle:   "Copy every group in this list as named TradingView sections (###Group,TICK,…)",
    copiedSections: (g, tk) => `${g} group${g === 1 ? "" : "s"} · ${tk} tickers copied as sections!`,
    setupTipDamage: "Damage (m2_3+m4_6)",
    setupTipConc:  "Concentration",
    setupTipBreadth: "Breadth",
    snapNone:      "No snapshot history yet — “days in stage” fills up from the first nightly run.",
    snapLast:      (d, n, g) => `Last snapshot: ${d} · ${n} rows · ${g} gap${g === 1 ? "" : "s"} (30 d)`,
    snapNotSettled: "provisional (intraday run)",
    nv:            "n/a",

    // ── Tickers (single-stock bubble chart) ────────────────────────────────
    topTickers:    "🎯 Tickers",
    tickersTitle:  "🎯 Tickers Bubble Chart",
    hintTickers:   "Universe: tickers from the industries AND themes currently in the top-30% intersection by 1W AND 1M (★ 1W∩1M).\nFiltered: Market Cap > $1B and ATR% (20 days) > 4% — both fully automatic, no manual list.\nX-axis: 3M or 1W performance, Y-axis: 1M performance.\nSize = Market Cap (log-scaled). Color = Theme/Industry group (see legend below) — a ticker in several groups counts under the first (industries before themes), all of them show in the tooltip.\n\"Not Extended\" toggle: hides tickers running far above their SMA50 (Jeff Sun convention, see its own tooltip).\n\"Copy Tickers\": copies the currently visible tickers as a comma-separated list to paste into a TradingView watchlist.\nRuns once per trading day after US close (needs settled daily candles, like the Experimental tab). Click a bubble to open the Finviz stock page.",
    topLeaders:    "🏆 Leading Stocks",
    leadTitle:     "🏆 Leading Stocks",
    hintLeaders:   "Which single stocks lead the strongest themes?\nConstituents: all Finviz members of the theme, 1:1 as Finviz assigns them. “×N” after the ticker = Finviz lists it in N themes (e.g. AMZN in 21) — such tickers sit in several baskets and move their breadth together. File: data/theme_constituents.json.\nTop: leader watchlist per the Performer Study — each stock once that passes all criteria (RS ≥ 90, 6M > +50%, ≤ 20% below the 52W high, above SMA50/SMA200, price ≥ $10, $ vol ≥ $5M). “In play today” = plus the validated breakout trigger.\nBelow, per theme: breadth across all constituents and the qualified stocks by RS vs theme. 👑 = leader = best qualified ticker; if none qualifies, the theme has no leader.\nFilters (dollar volume, ATR%) only affect the table, not breadth.\nMissing price data = n/a, never interpolated. All thresholds: static/config.js.\nRuns once per trading day after US close.",
    leadSortLabel: "Sort",
    leadSortScore: "Theme score",
    leadSortGroupRs: "Group RS 3M",
    leadGroupPct:  (p) => `pct ${p}`,
    leadState:     { rising: "▲ Rising", confirmed: "✔ Confirmed", cooling: "▼ Cooling" },
    leadStateTitle: (r3, r12, gap, n) => `Rank group RS 3M #${r3} · 12M #${r12} (gap ${gap > 0 ? "+" : ""}${gap}) of ${n} themes`,
    leadSortBreadth: "Breadth",
    leadTopN:      "Top N",
    leadMinDvol:   "Min $ vol",
    leadAtr:       "ATR%",
    leadAll:       "all",
    leadNoData:    "No Leading Stocks data yet — it is created by the next post-close run.",
    leadLoading:   "Loading price data…",
    leadMeta:      (date, n, uniq, themes) => `As of ${date} · ${n} Finviz assignments (${uniq} unique tickers) in ${themes} themes · RS weighting IBD replica (0.4·3M + 0.2·6M + 0.2·9M + 0.2·12M)`,
    leadTipDefault:"Tap or hover an ⓘ for definition and evidence base.",
    leadMembers:   (n, m) => `${n} constituents${m < n ? ` · ${n - m} without price data` : ""}`,
    leadManual:    "manual",
    leadThin:      "few members",
    leadBasketLow: (d, dd) => `Basket low ${d} (${dd}%)`,
    leadNoLow:     "no basket low ≥ 10% in window",
    leadLowOld:    (d) => `Basket low ${d} too old for 52W-high check`,
    leadEmptyRows: "No ticker passes the filters.",
    leadEvidence:  { validated: "validated", convention: "convention", overfit: "potentially overfit" },
    leadEvidenceLabel: "Evidence",
    leadMultiTitle: (n) => `Finviz lists this ticker in ${n} themes`,
    leadWlTitle:   "🎯 Leader watchlist",
    leadWlTable:   "📋 Table",
    leadWlNew:     "New",
    leadNewBadge:  "NEW",
    leadNewWord:   "new",
    leadRemoved:   "out",
    leadDiffHead:  (d) => `Since Friday ${d}:`,
    leadNoRef:     (d) => d ? `“New” starts next week — the watchlist log begins on ${d}.` : "“New” starts once the daily watchlist log covers a prior week.",
    leadWlCharts:  "📈 Charts",
    leadSizeTitle: { S: "Small: overview, many charts side by side (previous format)", M: "Medium: cards from ~520 px, 3 columns on large screens", L: "Large: one chart per row, up to 1100 px wide" },
    leadChartsRange: "Range 6 months, image rendered at card width.",
    leadChartsRangeW: "Range 2 years, image rendered at card width.",
    leadBarSize: "Size", leadBarTf: "Timeframe", leadBarOverlay: "Indicators",
    leadTfLabel: { d: "Daily", w: "Weekly" },
    leadTfTitle:   { d: "Daily chart (1 candle = 1 day)", w: "Weekly chart (1 candle = 1 week, range 2 years)" },
    leadEmaTitle:  "Adds EMA8 (cyan) and EMA20 (green) to the charts — on the candle basis of the chosen daily or weekly view.",
    leadChartsHintW: "Weekly chart with SMA50 (orange) and SMA200 (brown), source Finviz. Click opens the Finviz stock page.",
    leadChartsHintEma: " Plus EMA8 (cyan) and EMA20 (green).",
    leadCopy:      "📋 Copy tickers",
    leadThemesTvTitle: "Downloads the shown theme cards as .txt (TradingView: watchlist → import list): one ###Theme section per card in the current sort order, with exactly the card's tickers (expanded cards with all rows). A ticker can appear in several sections.",
    leadCopyTitle: "Copies exactly the shown tickers as a comma-separated EXCHANGE:SYMBOL list — paste straight into a TradingView watchlist.",
    leadCopied:    (n) => `${n} tickers copied`,
    leadTaTitle:   "Finviz Technical Analysis: adds SMA20 and the automatic detection of trendlines and chart patterns (channels, wedges, triangles …) to the charts.",
    leadChartsHint:"Daily chart with SMA50 (orange) and SMA200 (brown), source Finviz. Click opens the Finviz stock page.",
    leadChartsHintTa: "Technical Analysis on: plus SMA20 (pink) and Finviz pattern recognition (trendlines, channels, formations). Finviz draws the patterns automatically — a hint, not a tested signal.",
    leadWlCriteria:(W) => `RS ≥ ${W.RS_MIN} · 6M > +${W.P6M_MIN}% · ≤ ${W.DIST_MAX_PCT}% below 52W high · above SMA50 and SMA200 · price ≥ $${W.MIN_PRICE} · avg $ vol 50d ≥ ${W.MIN_DVOL50 / 1e6}M — criteria from the Performer Study. Themes are context, not a filter.`,
    leadWlAll:     "All",
    leadWlInPlay:  "In play today",
    leadWlEp:      "EP 6d",
    leadWlEmpty:   "No stock currently passes all criteria.",
    leadWlNoUniverse: "RS rating unavailable: the price file has no RS universe yet (created by the next post-close run).",
    leadThemesTitle: "Themes and their leaders",
    leadTrigYes:   "Breakout",
    leadTrigWeak:  "⚠ Vol < 1×",
    leadSetupNone: "Not in the setup screener: outside its universe (top themes per 1W/1M/3M) or OUT/EXTENDED.",
    leadQualified: (q, n) => `${q} of ${n} pass the leader criteria`,
    leadShowAll:   (n) => `show all ${n}`,
    leadShowQualified: "qualified only",
    leadNoLeader:  "No qualified leader — no stock in this theme passes the watchlist criteria.",
    leadFailsTitle:(s) => `Fails: ${s}`,
    leadFails:     { rs_rating: "RS", p6m: "6M performance", wl_dist: "distance to 52W high", sma50: "SMA50", sma200: "SMA200", min_price: "price", dollar_vol_50d: "$ vol 50d", no_data: "no price data" },
    leadWatchlist: "📥 TradingView Watchlist",
    leadWatchlistTitle: "Downloads the shown leader watchlist as .txt (TradingView: watchlist → import list). First ###In play today, then each ticker under its strongest theme; every ticker exactly once, sorted by RS.",
    leadWatchlistDone: (n) => `Watchlist with ${n} tickers downloaded`,
    leadCols: {
      pct_above_50ma: ["% > SMA50", "Share of constituents closing above SMA50."],
      pct_near_high:  ["% near high", "Share of constituents at most 10% below the 52W high (George/Hwang 2004: 52W-high proximity predicts returns)."],
      new_highs_5d:   ["New highs 5d", "Constituents with a new 52W high (high above the max of the prior 251 days) within the last 5 trading days."],
      rank_change_4w: ["Rank Δ4W", "Theme rank change over 20 settled snapshot days. Positive = moved up. n/a while history is too short or has a data gap (industry momentum, Moskowitz/Grinblatt 1999)."],
      rs_vs_theme:    ["RS theme", "Stock 3M performance minus 3M performance of the equal-weight theme basket (all constituents), in %-points."],
      rs_vs_spy:      ["RS SPY", "IBD replica: 0.4·ROC(63) + 0.2·ROC(126) + 0.2·ROC(189) + 0.2·ROC(252) of the stock minus the same for SPY. IBD does not publish its formula; weights in config.js."],
      dist_52wh:      ["Dist 52WH", "Distance to the 52W high in ADR units (brackets: in %). −1 = one average daily range below the high."],
      first_to_high:  ["1st high", "✓ = first constituent to make a new 52W high after the last basket low (≥ 10% drawdown). Date = its own first new high after the low."],
      down_day_strength: ["Down day", "Avg daily return minus SPY on days with SPY < −1% (last 60 days), in %-points. Brackets = number of such days — few days = weak signal."],
      rvol_20d:       ["RVOL", "Today's volume ÷ avg volume of the 20 days before."],
      adr_pct:        ["ADR%", "Avg (high − low) ÷ close over 20 days."],
      atr_pct:        ["ATR%", "Avg true range ÷ close over the chosen window (1W = 5, 14D = 14, 1M = 20 days)."],
      dollar_vol_20d: ["$ vol", "Avg close × volume over 20 days (liquidity filter)."],
      group_rs12:     ["Group RS 12M", "Median RS rating (IBD weighting 0.4·3M + 0.2·6M + 0.2·9M + 0.2·12M) of all theme members; #n = rank among themes (1 = strongest). Counterpart to the 3M column: shows where a theme stands long term."],
      state:          ["Rising / Confirmed / Cooling", "Rotation hint from theme ranks (N = themes with both values, top = N/4). Confirmed: 3M and 12M rank both in the top N/4. Rising: 3M rank at least N/4 places better than 12M rank. Cooling: 12M rank in the top N/4, 3M rank worse than N/2. Finding (Norgate, Russell 3000, 2011–2026): new 3M top-10 themes reach the 12M top-10 within 60 days 56% of the time (base 36%), median 30 vs 65 days — but forward excess return is indistinguishable from all themes. Not a buy/sell signal; themes are chosen with hindsight. Details: docs/rs3m_analysis.md."],
      group_rs:       ["Group RS 3M", "Median 3M RS (percentile of the 63-day return in the RS universe) of all theme members; pct = percentile among the 40 themes. Equal-weighted, so robust against single megacaps. Definition and evidence from the Performer Study (group rank ≥ 90: lift 1.7 on leader breakouts) — there GICS sub-industries; transferring it to Finviz themes is a convention. Sort “Theme score” = Finviz rank (1M 70% / 1W 20% / 3M 10%), “Breadth” = mean of % > SMA50 and % near high."],
      rs_rating:      ["RS", "RS rating 1–99: IBD weighting (0.4·3M + 0.2·6M + 0.2·9M + 0.2·12M) as a percentile against the 3,000 most liquid stocks of the Finviz industries (approximating the study's Russell 3000). Bold = RS ≥ 95. Study: RS ≥ 90 validated, RS ≥ 95 hit rate 20% vs 12%."],
      p6m:            ["6M", "Price change over 126 trading days. Study: > +50% shrinks the watchlist without losing winners."],
      wl_dist:        ["Dist 52WH", "Distance to the 52W high in %. Criterion: at most 20% below (the study defines leaders as ≤ 15%)."],
      rmv:            ["RMV", "ATR5 ÷ ATR50. Below 1 (green) = volatility contracting (VCP). Study: fewer signals but better expectancy — column only, no filter."],
      rvol_50d:       ["RVOL", "Today's volume ÷ avg of the prior 50 days. Study: ≥ 3× is part of the trigger, < 1× on a breakout = avoid."],
      trigger:        ["Trigger", "In play today: close above the high of the prior 20 days AND (RVOL ≥ 3 OR gap ≥ 4%). Study (RS-95 variant): 29–31% of signals were in a top-100 run, positive in both sub-periods. ⚠ = volume below 1× (avoid)."],
      ep:             ["EP", "Episodic pivot within the last 6 days: gap ≥ 4% over the prior close on ≥ 3× volume (the study's earnings proxy). Strongest single feature: +0.95% per trade for leaders; 6.4× hit rate combined with RS ≥ 90."],
      setup:          ["Setup", "Verdict of the setup screener (Experimental tab): READY / BREAKOUT / WATCH. — = outside its universe or OUT/EXTENDED."],
      dollar_vol_50d: ["$ vol 50d", "Avg close × volume over 50 days. Criterion ≥ $5M (study: stand-in for Russell membership)."],
      best_theme:     ["Themes", "All Finviz themes of the ticker, by theme rank. ★ = leader of that theme. Study: group rank as context only — as a filter it halves coverage without a better hit rate."],
    },
    tickersNoData: "No tickers.json yet — the file appears after the next post-close run.",
    tickersMeta:   (n, cap, atr, atrDays, date) => `${n} tickers · Market Cap > $${cap}B · ATR% (${atrDays}D) > ${atr}% · as of: ${date}`,
    tickersNotExtTitle: (x) => `Hides tickers more than ${x} ATR(20) above their SMA50 — extension convention (a.o. Jeff Sun): stocks running far from the norm make for a poor risk/reward on a new entry.\nFormula: (Close − SMA50) ÷ ATR(20). The threshold is an UNVALIDATED default.`,
    tickersCopyTitle: "Copies the currently shown tickers (X-axis + \"Not Extended\" filter applied) as a comma-separated list — paste directly into a TradingView watchlist (Add symbol → paste list).",
    tickersCopied:  (n) => `${n} tickers copied!`,

    // ── Experimental (stage 0 + stage 1) ──────────────────────────────────
    topExperimental: "🧪 Experimental",
    expTitle:      "🧪 Experimental",
    expSubtitle:   "Two unvalidated building blocks for step 3 of the daily routine: filtered Finviz links and a computed setup screener. Neither replaces the chart check — they only pre-sort it.",
    hintExp:       "Stage 0 changes every Finviz link in the app: instead of all stocks of a group sorted by 4-week performance (= most extended first), only those near their 20-day high, sorted by proximity to the 50-day high.\nStage 1 computes base contraction, pivot distance and volume from daily OHLCV of the strongest groups — the same three questions you normally answer on the mini chart.\nAll thresholds are defaults and NOT backtested.",

    expS0Title:    "Stage 0 — Finviz link filter",
    expS0Desc:     "Applies to every Finviz link in the app (heatmap, picks, themes, sub-themes). Two questions, two settings: “Whole group” + 3M perf answers “who leads this group?” — “Setup” + pivot proximity answers “what is buyable today without being extended?”",
    expS0Off:      "Whole group",
    expS0Setup:    "Setup (0–5%)",
    expS0Wide:     "Wide (0–10%)",
    expS0OffDesc:  "No setup pre-selection — every name in the group with volatility 1M > 3%. Answers “who leads this group?”",
    expS0Strength: "Setup + strength",
    expSortLabel:  "Sort:",
    expSortPivot:  "Pivot proximity",
    expSort3M:     "3M perf ↓",
    expSort4W:     "4W perf ↓",
    expSortPivotDesc: "o=-high50d — closest to the 50-day high first. Sorts by POSITION (where price stands now), not by distance travelled.",
    expSort3MDesc:    "o=-perf13w — strongest 3-month performance first. Sorts by DISTANCE TRAVELLED: the furthest-run names come first. Practically uncorrelated with pivot proximity (Spearman 0.11) — a different angle, not a substitute.",
    expSort4WDesc:    "o=-perf4w — the legacy sort. Strongest 4-week performance first, i.e. the furthest-run names on top.",
    expS0SetupDesc:"0–5% below 20-day high · above SMA50 · vol > 500K · price > $5 · volatility 1M > 3% · sorted by proximity to the 50-day high",
    expS0WideDesc: "like Setup but 0–10% below the 20-day high — more hits, more chart work",
    expS0StrengthDesc: "like Setup plus 3M perf > +20% — strength as the entry ticket, pivot proximity stays the ordering (Finviz allows only one sort key)",
    expS0Preview:  "Sample link (strongest industry):",
    expBaseline:   "Baseline across the whole tab: volatility 1M > 3% in every link — and ADR ≥ 3% as its counterpart in the table. Quiet names never show up here.",

    expBubbleXTitle: "Bubble chart X-axis — default",
    expBubbleXDesc:  "Sets which performance timeframe the bubble charts (Themes + Industry) use as the X-axis on load. The 3M/1W buttons on the chart itself only switch the current view without changing this default.",
    expBubbleX3M:    "3M",
    expBubbleX1W:    "1W",

    expS1Title:    "Stage 1 — Computed setup screener",
    expS1Desc:     "From daily OHLCV of the tickers in the strongest groups. Pivot = highest high of the last 25 days excluding the last 3. Distance = price to pivot in %.",
    expS1NoData:   "No setups.json yet — the file appears after the next post-close run.",
    expEod:        "EOD",
    expEodNote:    "Computed once per trading day after the US close (post-close run from 21:30 UTC) — the rest of the app refreshes hourly. It deliberately stays put during the session: base, pivot distance and volume need settled daily candles.",
    expS1Universe: (tk, th) => `${tk} tickers from ${th} themes`,
    expUnivTitle:  "Universe — how the “strongest themes” are picked",
    expUnivCount:  (n, pool) => `${n} of ${pool} themes`,
    expUnivColVia: "qualified via",
    expColTheme:   "Theme",
    expUnivThemeRule: (n, tfs) => `Per timeframe (${tfs}) the ${n} themes with the highest performance, then unioned — overlaps count once. Ranked by actual performance (average of the sub-nodes), NOT by the themes table’s score: that is a weighted rank across all three timeframes and would blur the per-timeframe question. Industries no longer play a role.`,
    expUnivNotUsed: "Deliberately NOT checked: accel, INST badge, regime gate, weekend-prep stage. The pick is pure current strength over 1W/1M/3M — it is NOT the weekend routine’s inclusion formula (which also requires accel ≥ +10 and 1M > 0%).",
    expUnivColTickers: "Tickers",
    expUnivFootnote: (tk, bars) => `From these groups: ${tk} unique tickers, price data returned for ${bars} of them. Only then do the ADR, liquidity and setup filters apply.`,
    expS1Empty:    "No candidates in this view.",
    expViewTable:  "📋 Table",
    expViewCharts: "🖼 Mini charts",
    expOnlyReady:  "READY only",
    expTradeable:  "READY + BREAKOUT",
    expAll:        "All",
    expCopyBtn:    "📋 Copy tickers",
    expTop20:      "Top 30%",
    expTop20Title: () => `Mark the best 30% of the current view by score. Click again to clear. Single rows can be clicked directly too.`,
    expTop20Marked:(n, min) => `${n} rows marked (top 30%, score ≥ ${min})`,
    expSelCount:   (n) => `${n} marked`,
    expCopiedSel:  (n) => `${n} marked tickers copied!`,
    expCopyTitle:  "Copy marked tickers to the clipboard (comma-separated, TradingView import) — without a selection, the whole view",
    expCopied:     (n) => `${n} tickers copied!`,
    expChartsHint: "Mini charts straight from Finviz, pre-sorted by setup score — the same images as in the screener, just in your order.",

    expColTicker:  "Ticker",
    expColGroup:   "Group",
    expColVerdict: "Verdict",
    expColSetupSc: "Score",
    expColDist:    "Pivot %",
    expColBase:    "Base (d)",
    expColTight:   "Tight",
    expColDry:     "Dry-up",
    expColRvol:    "RVOL",
    expVerdictREADY:    "READY",
    expVerdictBREAKOUT: "BREAKOUT",
    expVerdictWATCH:    "WATCH",
    expReason_at_pivot:       "At pivot, base contracting",
    expReason_running:        "Breakout already running",
    expReason_below_pivot:    "Still below the pivot",
    expReason_base_too_short: "Base too short",
    expReason_no_contraction: "No contraction",
    vizBubble:      "🔵 Bubble",
    vizMatrix:      "⊞ Matrix",
    vizRrg:         "🔄 RRG",
    rrgQ1:          "🚀 Improving",
    rrgQ2:          "⚡ Leading",
    rrgQ3:          "💤 Lagging",
    rrgQ4:          "🔻 Weakening",
    rrgAxisX:       "RS-Ratio: 3M relative to the theme average →",
    rrgAxisXInd:    "RS-Ratio: 3M relative to the industry average →",
    rrgAxisY:       "RS-Momentum ↑",
    rrgLegendBench: "Benchmark = equal-weight average of all themes",
    rrgLegendBenchInd: "Benchmark = equal-weight average of all industries",
    rrgLegendSize:  "Size = strength (score)",
    rrgLegendTail:  (n) => `Tail = last ${n} days (snapshots + live)`,
    rrgNoHistory:   "No snapshot history yet — positions only, no tails.",
    rrgFilterNote:  (labels, n, total, noun) => `Filter: ${labels} — ${n} of ${total} ${noun}`,
    rrgFilterEmpty: "No theme matches the selected filter.",
    rrgTip2:        (rs, mom, p1, p3) =>
      `RS-Ratio: ${rs}  |  RS-Momentum: ${mom}
1M: ${p1}%  3M: ${p3}%`,
    expColAdr:     "ADR %",
    expCol1M:      "1M %",
    expColPrice:   "Price",


    expTipDist:    "Price to pivot in %. Negative = below, 0 = at pivot, positive = broken out. Above +8% counts as extended and drops out.",
    expTipTight:   "ATR(5) ÷ ATR(20). Below 1 = the move is contracting — the computed form of “clean base”.",
    expTipDry:     "Volume of the last 5 days ÷ 50-day average. Below 1 = volume drying up in the base.",
    expTipRvol:    "Today's volume ÷ 50-day average. Above 1 at the pivot = breakout with participation.",
    expTipScore:   "0–100: pivot proximity 40 · contraction 25 · dry-up 15 · base length 10 · trend 10. A sorting aid only, UNVALIDATED.",
    expUnvalidated:"UNVALIDATED — thresholds are defaults, no backtest.",
  },
};

let _lang = "de";
const t = (key, ...args) => {
  const val = I18N[_lang][key];
  return typeof val === "function" ? val(...args) : (val ?? key);
};

function initSectionHints() {
  document.querySelectorAll(".section-hint[data-hint-key]").forEach(el => {
    el.setAttribute("data-tip", t(el.dataset.hintKey));
  });
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (key === "colScore") {
      const isActive = el.classList.contains("sort-active");
      const arrow = isActive ? (_sortState.dir === 1 ? " ▲" : " ▼") : (_sortState.col === "score" ? " ▲" : "");
      el.innerHTML = t(key) + arrow + ` <span class="col-info" title="${t('infoScore')}">i</span>`;
    } else {
      el.textContent = t(key);
    }
  });
  // Viz-toggle buttons are not handled via data-i18n (buttons reset textContent unreliably)
  const vizTableBtn = document.querySelector(".viz-btn[data-vizview='table']");
  if (vizTableBtn) vizTableBtn.textContent = _lang === "de" ? "📋 Tabelle" : "📋 Table";
  // Selection-bar copy buttons are hardcoded in HTML — update on language switch
  document.querySelectorAll(".selection-bar__copy-btn").forEach(btn => {
    btn.textContent = _lang === "de" ? "📋 Kopieren" : "📋 Copy";
  });
  document.querySelectorAll(".selection-bar__export-btn").forEach(btn => {
    btn.textContent = t("exportJson");
  });
  // Top 30% buttons: language-neutral label, localized tooltip
  ["ind-top20-btn", "theme-top20-btn"].forEach(id => {
    const b = document.getElementById(id); if (b) b.title = t("top20Title");
  });
  ["ind-top20i-btn", "theme-top20i-btn"].forEach(id => {
    const b = document.getElementById(id); if (b) b.title = t("top20IntersectTitle");
  });
  ["ind-top20i2-btn", "theme-top20i2-btn"].forEach(id => {
    const b = document.getElementById(id); if (b) b.title = t("top20Intersect2Title");
  });
  { const b = document.getElementById("tickers-notext-toggle"); if (b) b.title = t("tickersNotExtTitle", tickersExtAtrMax()); }
  { const b = document.getElementById("tickers-copy-btn"); if (b) b.title = t("tickersCopyTitle"); }
  document.documentElement.lang = _lang;
  document.getElementById("lang-btn").textContent = _lang === "de" ? "EN" : "DE";
  initSectionHints();
  if (_lastPayload) renderAll(_lastPayload);
  if (_lastHistory) renderMovers(_lastHistory, _activePeriodDays);
  if (_etfData) renderEtfTab();
  renderSetupTabs();
  renderExperimental();
  if (_leadersBars) renderLeadersTab();
  renderRegime();
  renderSituational();
}

// --- INST helper ---
function isInst(row) {
  return (row.ranks?.["1M"] ?? 999) <= 40 && (row.ranks?.["3M"] ?? 999) <= 40;
}
function instTag() {
  return `<span class="pick-tag tag-inst" style="font-size:10px;padding:1px 5px;vertical-align:middle">${t("tagInst")}</span>`;
}

// --- Finviz link ---
// Alle Finviz-Screener-Links der App laufen über fvScreenerUrl(), damit der
// Experimental-Schalter (Stufe 0) sie an EINER Stelle umstellen kann.
//
// "off" = Bestand: alle Aktien der Gruppe, sortiert nach 4-Wochen-Performance.
//         Das stellt die am weitesten gelaufenen Namen nach vorn — genau die,
//         die in Schritt 3 der Tages-Routine als extended aussortiert werden.
// "setup"/"wide" = der gespeicherte Vorfilter direkt im Link, sortiert nach
//         Nähe zum 50-Tage-Hoch (o=-high50d, Werte sind negativ = Abstand nach
//         unten, absteigend heißt also "am nächsten am Hoch zuerst").
//
// Filtercodes gegen die Finviz-Filterliste verifiziert (ft=4-Seite):
//   ta_highlow20d_b0to5h  = "0-5% below High" (20-Tage-Hoch)
//   ta_highlow20d_b0to10h = "0-10% below High"
//   ta_sma50_pa           = "Price above SMA50"
//   sh_avgvol_o500        = "Over 500K"
//   sh_price_o5           = "Over $5"
//   ta_volatility_mo3     = "Month - Over 3%"
//   ta_perf_13w20o        = "Quarter +20%"
//
// ta_volatility_mo3 ist Grundbedingung in JEDEM Modus: ohne Bewegungsbreite
// trägt kein Ausbruch. Das Tabellen-Pendant dazu ist MIN_ADR in setups.py.
//
// "strength" ergänzt 3M-Perf > +20 % als Filter statt als Sortierung: Finviz
// erlaubt nur einen Sortierschlüssel, und -perf13w und -high50d messen
// verschiedene Achsen (gemessen an 118 Kandidaten: Spearman 0,11, Top-10-
// Überschneidung 1/10). Stärke wird deshalb zur Eintrittskarte, die
// Reihenfolge bleibt die Pivot-Nähe.
const FV_BASE = "ta_volatility_mo3";
const FV_MODES = {
  // Standardmodus: ganzes Revier, keine Setup-Vorauswahl. Standardsortierung
  // 3M-Perf, weil dieser Modus die Frage "wer fuehrt dieses Revier an?"
  // beantwortet. Gemessen an 13 Gruppen x 24 Stichtagen (556 Ticker, 2 Jahre):
  // ein 3M-Ranking laeuft der Gruppe im Folgemonat um +0,89 % voraus, ein
  // 1M-Ranking nur um +0,15 %; von den Top-3 nach 1M sind einen Monat spaeter
  // nur 19 % noch Top-3 (3M: 53 %) - 1M-Fuehrerschaft ist ueberwiegend Rauschen.
  off:      { filters: FV_BASE, sort: "perf13w" },
  setup:    { filters: `ta_highlow20d_b0to5h,ta_sma50_pa,sh_avgvol_o500,sh_price_o5,${FV_BASE}`, sort: "high50d" },
  wide:     { filters: `ta_highlow20d_b0to10h,ta_sma50_pa,sh_avgvol_o500,sh_price_o5,${FV_BASE}`, sort: "high50d" },
  strength: { filters: `ta_highlow20d_b0to5h,ta_sma50_pa,sh_avgvol_o500,sh_price_o5,ta_perf_13w20o,${FV_BASE}`, sort: "high50d" },
};

// Sortierung ist von der Filterwahl getrennt — Finviz erlaubt genau einen
// Sortierschlüssel, und die drei messen verschiedene Dinge:
//   high50d = Ort (Abstand zum 50-Tage-Hoch, absteigend = am Hoch zuerst)
//   perf13w = Weg über 3 Monate, absteigend
//   perf4w  = Weg über 4 Wochen, absteigend (der Bestandslink)
// Gemessen an 118 Kandidaten: high50d und perf13w korrelieren praktisch nicht
// (Spearman 0,11) — sie sind kein Ersatz füreinander, sondern zwei Blickwinkel.
const FV_SORTS = {
  high50d: { o: "-high50d", labelKey: "expSortPivot", descKey: "expSortPivotDesc" },
  perf13w: { o: "-perf13w", labelKey: "expSort3M",    descKey: "expSort3MDesc" },
  perf4w:  { o: "-perf4w",  labelKey: "expSort4W",    descKey: "expSort4WDesc" },
};

// --- Einstellungs-Speicher (Cookie, localStorage als Rückfall) ---
// Cookie: funktionale Einstellung, die der Nutzer selbst gesetzt hat, ein Jahr
// haltbar. localStorage wird weiter gelesen, damit früher gesetzte Auswahlen
// nicht verlorengehen, und mitgeschrieben, falls Cookies blockiert sind.
function prefSet(key, value) {
  try {
    document.cookie = `${key}=${encodeURIComponent(value)}; max-age=31536000; path=/; SameSite=Lax`;
  } catch (e) { /* Cookies blockiert */ }
  try { localStorage.setItem(key, value); } catch (e) { /* Private Mode */ }
}
function prefGet(key) {
  const hit = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
  if (hit) return decodeURIComponent(hit[1]);
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

let _fvMode = prefGet("fvMode") || "off";
if (!FV_MODES[_fvMode]) _fvMode = "off";
// "auto" = die zum Modus gehörende Standardsortierung. Sobald der Nutzer eine
// Sortierung explizit wählt, bleibt sie über den Moduswechsel hinweg stehen.
let _fvSort = prefGet("fvSort") || "auto";
if (_fvSort !== "auto" && !FV_SORTS[_fvSort]) _fvSort = "auto";

function fvActiveSort() {
  return _fvSort === "auto" ? (FV_MODES[_fvMode] || FV_MODES.off).sort : _fvSort;
}

// groupFilter: "ind_<slug>" | "theme_<slug>" | "subtheme_<key>"
function fvScreenerUrl(groupFilter) {
  if (!groupFilter) return "";
  const mode = FV_MODES[_fvMode] || FV_MODES.off;
  const f = encodeURIComponent(`${groupFilter},${mode.filters}`);
  return `https://finviz.com/screener.ashx?v=211&f=${f}&o=${FV_SORTS[fvActiveSort()].o}`;
}

function finvizUrl(ticker) {
  return ticker ? fvScreenerUrl(`ind_${ticker}`) : "";
}

// Einzelchart wie im Screener (v=211), nur für einen Ticker — Tagesbasis,
// Candles, SMA50/SMA200. Ohne Referrer, damit der Hotlink nicht am
// Referer-Check hängen bleibt (siehe renderExpCharts).
// ta = Finviz "Technical Analysis": zusätzlich SMA20 und die automatische
// Muster-/Trendlinien-Erkennung (Overlay "patterns"). Parameter abgeleitet
// aus Finvizs eigener Weiterleitung des alten chart.ashx?ta=1-Links.
// size = {w, h, range}: freie Pixelgroesse + fester Zeitraum (r=m6 …) fuer
// die grossen Watchlist-Charts; ohne size bleibt alles wie bisher.
function finvizChartUrl(ticker, scale = 1, ta = false, size = null, opts = {}) {
  const w = size?.w ?? 466 * scale, h = size?.h ?? 219 * scale;
  const weekly = !!opts.weekly;
  // tm bleibt "d": mit tm=w zeichnet Finviz Overlays im Wochenchart nicht.
  const range = opts.range ?? size?.range;
  const base = `https://charts2-node.finviz.com/chart?w=${w}&h=${h}&bw=1&bm=1&bb=1&t=${encodeURIComponent(ticker)}`
       + `&tf=${weekly ? "w" : "d"}&s=linear&pm=240&am=1200&tl=1&ct=candle_stick&tm=d${range ? `&r=${range}` : ""}`;
  // Overlays: SMA50/200 immer; optional EMA8/EMA20 (RRGGBBAA), SMA20 + Muster bei ta.
  const ov = [["sma", 50, "FF8F33C6"], ["sma", 200, "DCB3326D"]];
  if (opts.ema) ov.push(["ema", 8, "33D6FFDD"], ["ema", 20, "5BE37DDD"]);
  if (ta) ov.push(["sma", 20, "DC32B363"], ["patterns", "", "000"]);
  return base + ov.map(([ot, op, oc], i) => `&o[${i}][ot]=${ot}&o[${i}][op]=${op}&o[${i}][oc]=${oc}`).join("");
}

function finvizQuoteUrl(ticker) {
  return `https://finviz.com/quote.ashx?t=${encodeURIComponent(ticker)}`;
}

// --- Color helpers ---
function perfClass(pct) {
  if (pct === null || pct === undefined) return "perf-0";
  if (pct >= 4)    return "perf-5";
  if (pct >= 2)    return "perf-4";
  if (pct >= 1)    return "perf-3";
  if (pct >= 0.25) return "perf-2";
  if (pct > 0)     return "perf-1";
  if (pct === 0)   return "perf-0";
  if (pct > -0.25) return "perf-n1";
  if (pct > -1)    return "perf-n2";
  if (pct > -2)    return "perf-n3";
  if (pct > -4)    return "perf-n4";
  return "perf-n5";
}

function fmtPct(v) {
  if (v === null || v === undefined) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// --- Sparkline ---
function buildSparkline(ranks, maxRank) {
  const W = 80, H = 28, pad = 4;
  const n = SPARKLINE_ORDER.length;
  const points = SPARKLINE_ORDER.map((tf, i) => {
    const x = pad + (i / (n - 1)) * (W - 2 * pad);
    const rank = ranks[tf] ?? maxRank;
    const y = pad + ((rank - 1) / (maxRank - 1)) * (H - 2 * pad);
    return [x, y];
  });
  const polyline = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const color = "#58a6ff";
  const dots = points.map(([x, y]) =>
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${color}"/>`
  ).join("");
  return `<svg class="sparkline" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
    ${dots}
  </svg>`;
}

// --- Heatmap ---
let _sortState = { col: "score", dir: 1 };
let _instFilter = false;
let _lastIndustries = null;
let _themeAccel = {}; // last computed theme acceleration map, for JSON export
let _lastPayload = null;

function sortedEntries(industries) {
  const entries = Object.entries(industries);
  const { col, dir } = _sortState;
  return entries.sort(([nameA, a], [nameB, b]) => {
    let va, vb;
    if (col === "score")         { va = a.composite;    vb = b.composite; }
    else if (col === "accel")    { va = a.acceleration; vb = b.acceleration; }
    else if (col === "industry") { return dir * nameA.localeCompare(nameB); }
    else                         { va = a.perfs[col] ?? -Infinity; vb = b.perfs[col] ?? -Infinity; }
    return dir * (va - vb);
  });
}

// Anteil für alle ★-Buttons (Top X %, 1W∩1M, 1M∩3M) in Industry, Themes und RRG.
// Muss mit TICKER_CONFIG["PCT"] in ticker_metrics.py übereinstimmen, sonst
// weicht das Tickers-Universum von der ★ 1W∩1M-Auswahl ab.
const TOP_PCT = 0.30;

// Check the top `pct` fraction of rows (current sort order) in a multi-select
// table body, replacing any existing selection, then refresh its selection bar.
function selectTopPercent(tbodyId, headerCheckId, updateFn, pct = TOP_PCT) {
  const checks = [...document.querySelectorAll(`#${tbodyId} .row-check`)];
  if (!checks.length) return;
  const cutoff = Math.max(1, Math.ceil(checks.length * pct));
  checks.forEach((cb, i) => { cb.checked = i < cutoff && !cb.disabled; });

  const header  = document.getElementById(headerCheckId);
  const enabled = checks.filter(cb => !cb.disabled);
  const checked = enabled.filter(cb => cb.checked).length;
  if (header) {
    header.indeterminate = checked > 0 && checked < enabled.length;
    header.checked       = checked > 0 && checked === enabled.length;
  }
  updateFn();
}

// Schnittmenge der Top-`pct` je Zeitfenster — reine Datenfunktion ohne DOM.
// Der RRG braucht sie ohne Tabelle: in dieser Ansicht wird das tbody gar nicht
// gerendert, es gibt also keine Checkbox-Zeilen, an denen man sich entlanghangeln
// könnte. entries: [[name, row], …] mit row.perfs.
function topIntersectionKeys(entries, tfs = ["1W", "1M"], pct = TOP_PCT) {
  if (!entries.length) return new Set();
  const cutoff = Math.max(1, Math.ceil(entries.length * pct));
  const topSets = tfs.map(tf => new Set(
    entries
      .filter(([, row]) => row?.perfs?.[tf] !== null && row?.perfs?.[tf] !== undefined)
      .sort(([, a], [, b]) => b.perfs[tf] - a.perfs[tf])
      .slice(0, cutoff)
      .map(([k]) => k)
  ));
  return topSets.reduce((acc, s) => new Set([...acc].filter(k => s.has(k))));
}

// Select rows that are in BOTH the top `pct` by each timeframe (intersection),
// among currently-displayed rows. dataFor(key) -> row object with .perfs.
// Replaces the current selection, then refreshes the selection bar.
function selectTopIntersection(tbodyId, headerCheckId, updateFn, dataFor, tfs = ["1W", "1M"], pct = TOP_PCT) {
  const checks = [...document.querySelectorAll(`#${tbodyId} .row-check`)];
  if (!checks.length) return;
  const inter = topIntersectionKeys(checks.map(cb => [cb.dataset.key, dataFor(cb.dataset.key)]), tfs, pct);

  checks.forEach(cb => { cb.checked = inter.has(cb.dataset.key) && !cb.disabled; });

  const header  = document.getElementById(headerCheckId);
  const enabled = checks.filter(cb => !cb.disabled);
  const checked = enabled.filter(cb => cb.checked).length;
  if (header) {
    header.indeterminate = checked > 0 && checked < enabled.length;
    header.checked       = checked > 0 && checked === enabled.length;
  }
  updateFn();
}

function initTop20Buttons() {
  const indBtn = document.getElementById("ind-top20-btn");
  if (indBtn) indBtn.onclick = () =>
    selectTopPercent("heatmap-body", "ind-select-all", updateIndSelectionBar);

  const themeBtn = document.getElementById("theme-top20-btn");
  if (themeBtn) themeBtn.onclick = () =>
    selectTopPercent("etf-themes-body", "theme-select-all", updateThemeSelectionBar);

  const indInterBtn = document.getElementById("ind-top20i-btn");
  if (indInterBtn) indInterBtn.onclick = () =>
    selectTopIntersection("heatmap-body", "ind-select-all", updateIndSelectionBar, k => _lastIndustries?.[k]);

  const themeInterBtn = document.getElementById("theme-top20i-btn");
  if (themeInterBtn) themeInterBtn.onclick = () => {
    if (_themeVizView === "rrg") return toggleRrgFilter("theme", "1W1M");
    selectTopIntersection("etf-themes-body", "theme-select-all", updateThemeSelectionBar, k => _etfData?.themes?.[k]);
  };

  const indRrgF1 = document.getElementById("ind-rrg-f1-btn");
  if (indRrgF1) indRrgF1.onclick = () => toggleRrgFilter("industry", "1W1M");

  const indRrgF2 = document.getElementById("ind-rrg-f2-btn");
  if (indRrgF2) indRrgF2.onclick = () => toggleRrgFilter("industry", "1M3M");

  const indInter2Btn = document.getElementById("ind-top20i2-btn");
  if (indInter2Btn) indInter2Btn.onclick = () =>
    selectTopIntersection("heatmap-body", "ind-select-all", updateIndSelectionBar, k => _lastIndustries?.[k], ["1M", "3M"]);

  const themeInter2Btn = document.getElementById("theme-top20i2-btn");
  if (themeInter2Btn) themeInter2Btn.onclick = () => {
    if (_themeVizView === "rrg") return toggleRrgFilter("theme", "1M3M");
    selectTopIntersection("etf-themes-body", "theme-select-all", updateThemeSelectionBar, k => _etfData?.themes?.[k], ["1M", "3M"]);
  };
}

// ── Industry heatmap multi-select ─────────────────────────────────────────
function updateIndSelectionBar() {
  const bar    = document.getElementById("ind-selection-bar");
  const checks = [...document.querySelectorAll("#heatmap-body .row-check:checked")];
  if (!checks.length) { bar.classList.add("hidden"); return; }

  const allTickers = checks.flatMap(cb => _lastIndustries?.[cb.dataset.key]?.tickers ?? []);
  const deduped    = [...new Set(allTickers)];
  bar.__deduped = deduped;

  const n = checks.length;
  bar.querySelector(".selection-bar__info").textContent = _lang === "de"
    ? `${n} Industr${n === 1 ? "y" : "ies"} ausgewählt · ${deduped.length} Ticker (dedupliziert)`
    : `${n} industr${n === 1 ? "y" : "ies"} selected · ${deduped.length} tickers (deduplicated)`;
  bar.classList.remove("hidden");
}

function renderHeatmap(industries) {
  _lastIndustries = industries; // always full dataset (Movers needs it)
  const tbody = document.getElementById("heatmap-body");
  let sorted = sortedEntries(industries);
  if (_instFilter) sorted = sorted.filter(([, row]) => isInst(row));

  document.querySelectorAll("#heatmap-table thead th[data-col]").forEach(th => {
    const col = th.dataset.col;
    const isActive = col === _sortState.col;
    th.classList.toggle("sort-active", isActive);
    const i18nKey = "col" + col.charAt(0).toUpperCase() + col.slice(1);
    const label = I18N[_lang][i18nKey] !== undefined ? t(i18nKey) : (th.dataset.label || col);
    const arrow = isActive ? (_sortState.dir === 1 ? " ▲" : " ▼") : "";
    const tipKey = col === "score" ? "infoScore" : col === "accel" ? "infoAccel" : null;
    const icon = tipKey ? ` <span class="col-info" title="${t(tipKey)}">i</span>` : "";
    th.innerHTML = label + arrow + icon;
  });

  const maxRank = sorted.length;
  const rows = sorted.map(([name, row], idx) => {
    const perfCells = TIMEFRAMES.map(tf => {
      const v = row.perfs[tf];
      return `<td class="${perfClass(v)}">${fmtPct(v)}</td>`;
    }).join("");
    const accelVal = row.acceleration;
    const accelCls = accelVal > 0 ? "accel-pos" : accelVal < 0 ? "accel-neg" : "accel-neu";
    const accelStr = accelVal > 0 ? `+${accelVal}` : `${accelVal}`;
    const url = finvizUrl(row.ticker);
    const nameCell = url
      ? `<a class="pick-link" href="${url}" target="_blank" rel="noopener">${name} ↗</a>`
      : name;
    const instMark = isInst(row) ? " " + instTag() : "";
    const hasTickers = row.tickers && row.tickers.length > 0;
    return `<tr>
      <td class="col-check"><input type="checkbox" class="row-check"${hasTickers ? '' : ' disabled'} data-key="${esc(name)}"></td>
      <td>${idx + 1}</td>
      <td title="${name}">${nameCell}${instMark}</td>
      ${perfCells}
      <td>${row.composite.toFixed(2)}</td>
      <td class="${accelCls}">${accelStr}</td>
      <td class="sparkline-cell">${buildSparkline(row.ranks, maxRank)}</td>
    </tr>`;
  });

  tbody.innerHTML = rows.join("") || `<tr><td colspan="12" class="empty-msg">${t("noData")}</td></tr>`;

  // ── Multi-select wiring ───────────────────────────────────────────────────
  const indHeaderCheck = document.getElementById("ind-select-all");
  const indRowChecks   = [...tbody.querySelectorAll(".row-check:not([disabled])")];

  function syncIndHeader() {
    const c = indRowChecks.filter(x => x.checked).length;
    indHeaderCheck.indeterminate = c > 0 && c < indRowChecks.length;
    indHeaderCheck.checked = c > 0 && c === indRowChecks.length;
  }

  indRowChecks.forEach(cb => cb.addEventListener("change", () => {
    syncIndHeader();
    updateIndSelectionBar();
  }));

  indHeaderCheck.onchange = () => {
    indRowChecks.forEach(cb => cb.checked = indHeaderCheck.checked);
    indHeaderCheck.indeterminate = false;
    updateIndSelectionBar();
  };

  const indBar = document.getElementById("ind-selection-bar");
  indBar.querySelector(".selection-bar__copy-btn").onclick = () => {
    const deduped = indBar.__deduped;
    if (!deduped || !deduped.length) return;
    navigator.clipboard.writeText(deduped.join(",")).then(() => {
      showToast(_lang === "de" ? `${deduped.length} Ticker kopiert!` : `${deduped.length} tickers copied!`);
    });
  };
  const indExportBtn = indBar.querySelector(".selection-bar__export-btn");
  if (indExportBtn) indExportBtn.onclick = () => {
    const checked = [...document.querySelectorAll("#heatmap-body .row-check:checked")];
    const rows = checked.map(cb => {
      const name = cb.dataset.key;
      const row  = _lastIndustries?.[name];
      if (!row) return null;
      return {
        type: "industry",
        name,
        score: row.composite,
        accel: row.acceleration,
        ranks: { "1W": row.ranks?.["1W"], "1M": row.ranks?.["1M"], "3M": row.ranks?.["3M"], "6M": row.ranks?.["6M"], "YTD": row.ranks?.["YTD"] },
        perfs: { "1W": row.perfs?.["1W"], "1M": row.perfs?.["1M"], "3M": row.perfs?.["3M"], "6M": row.perfs?.["6M"], "YTD": row.perfs?.["YTD"] },
        tickers: row.tickers ?? [],
      };
    }).filter(Boolean);
    exportSelectionJson(rows);
  };
  indBar.querySelector(".selection-bar__clear-btn").onclick = () => {
    indRowChecks.forEach(cb => cb.checked = false);
    indHeaderCheck.checked = false;
    indHeaderCheck.indeterminate = false;
    updateIndSelectionBar();
  };
}

function initInstToggle() {
  const btn = document.getElementById("inst-toggle");
  btn.addEventListener("click", () => {
    _instFilter = !_instFilter;
    btn.classList.toggle("active", _instFilter);
    if (_lastIndustries) {
      renderHeatmap(_lastIndustries);
      renderIndustryBubble(_lastIndustries);
      renderRrgChart("industry");
    }
  });
}

// Optionaler UI-Filter im Tickers-Tab: blendet Ticker aus, die weiter als
// EXT_ATR_MAX ATR-Einheiten über ihrem SMA50 laufen (siehe ticker_metrics.py).
function initTickersNotExtendedToggle() {
  const btn = document.getElementById("tickers-notext-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    _tickersNotExtended = !_tickersNotExtended;
    btn.classList.toggle("active", _tickersNotExtended);
    renderTickersTab();
  });
}

// Kopiert die aktuell im Bubble-Chart sichtbaren Ticker als kommagetrennte
// Liste — TradingView übernimmt das direkt beim Einfügen in eine Watchlist
// (Symbol hinzufügen -> Liste einfügen), keine Konvertierung nötig.
function initTickersCopyButton() {
  const btn = document.getElementById("tickers-copy-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const tickers = tickersVisibleRows().map(r => r.t);
    if (!tickers.length) return;
    navigator.clipboard.writeText(tickers.join(",")).then(() => {
      flashDone(btn);
      showToast(t("tickersCopied", tickers.length));
    });
  });
}

function initSortHeaders() {
  document.querySelectorAll("#heatmap-table thead th[data-col]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (_sortState.col === col) {
        _sortState.dir *= -1;
      } else {
        _sortState.col = col;
        _sortState.dir = (col === "score" || col === "industry") ? 1 : -1;
      }
      if (_lastIndustries) renderHeatmap(_lastIndustries);
    });
  });
}

// --- Top 10 cards ---
function renderCards(industries) {
  const container = document.getElementById("cards-row");
  const allEntries = Object.entries(industries);
  const cards = TIMEFRAMES.map(tf => {
    const sorted = allEntries
      .filter(([, row]) => row.perfs[tf] !== null && row.perfs[tf] !== undefined)
      .sort(([, a], [, b]) => b.perfs[tf] - a.perfs[tf])
      .slice(0, 10);
    const rows = sorted.map(([name, row], i) => {
      const v = row.perfs[tf];
      const url = finvizUrl(row.ticker);
      const nameEl = url
        ? `<a class="card-name pick-link" href="${url}" target="_blank" rel="noopener" title="${name}">${name}</a>`
        : `<span class="card-name" title="${name}">${name}</span>`;
      const instMark = isInst(row) ? " " + instTag() : "";
      const hasTk = row.tickers && row.tickers.length > 0;
      const copyBtn = hasTk
        ? `<button class="ind-copy-btn ind-copy-btn--inline" data-key="${esc(name)}" title="${_lang === 'de' ? 'Ticker dieser Industry kopieren' : "Copy this industry's tickers"}">📋</button>`
        : '';
      return `<div class="card-row">
        <span class="card-rank">${i + 1}</span>
        ${nameEl}${instMark}${copyBtn}
        <span class="badge ${v >= 0 ? "badge-pos" : "badge-neg"}">${fmtPct(v)}</span>
      </div>`;
    }).join("");
    return `<div class="card"><div class="card-header">${tf}</div>${rows}</div>`;
  });
  container.innerHTML = cards.join("");
  wireIndCopyButtons(container);
}

// --- Bar Chart View ---
let _top10View = "cards";

function renderBarChart(industries) {
  const container = document.getElementById("bars-view");
  const entries = Object.entries(industries);
  const TFS = ["1M", "3M"];

  const panels = TFS.map(tf => {
    const sorted = entries
      .filter(([, row]) => row.perfs[tf] != null)
      .sort(([, a], [, b]) => b.perfs[tf] - a.perfs[tf]);

    const maxVal = Math.max(...sorted.map(([, r]) => Math.abs(r.perfs[tf])), 0.01);

    const bars = sorted.map(([name, row]) => {
      const v = row.perfs[tf];
      const pct = Math.min(Math.abs(v) / maxVal * 100, 100).toFixed(1);
      const cls = v >= 0 ? "bar-fill-pos" : "bar-fill-neg";
      const url = finvizUrl(row.ticker);
      const nameEl = url
        ? `<a class="pick-link bar-label" href="${url}" target="_blank" rel="noopener">${name}</a>`
        : `<span class="bar-label">${name}</span>`;
      const instMark = isInst(row) ? " " + instTag() : "";
      const hasTk = row.tickers && row.tickers.length > 0;
      const copyBtn = hasTk
        ? `<button class="ind-copy-btn ind-copy-btn--inline" data-key="${esc(name)}" title="${_lang === 'de' ? 'Ticker dieser Industry kopieren' : "Copy this industry's tickers"}">📋</button>`
        : '';
      return `<div class="bar-row">
        <span class="bar-name-wrap">${nameEl}${instMark}${copyBtn}</span>
        <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
        <span class="bar-value ${v >= 0 ? "accel-pos" : "accel-neg"}">${fmtPct(v)}</span>
      </div>`;
    }).join("");

    const months = tf === "1M" ? "1 MONTH" : "3 MONTH";
    return `<div class="barchart-panel">
      <div class="barchart-title">${months} PERFORMANCE</div>
      <div class="barchart-body">${bars}</div>
    </div>`;
  });

  container.innerHTML = panels.join("");
  wireIndCopyButtons(container);
}

function renderTop10(industries) {
  if (_top10View === "bars") {
    document.getElementById("cards-row").classList.add("hidden");
    document.getElementById("bars-view").classList.remove("hidden");
    renderBarChart(industries);
  } else {
    document.getElementById("bars-view").classList.add("hidden");
    document.getElementById("cards-row").classList.remove("hidden");
    renderCards(industries);
  }
}

function initViewToggle() {
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      _top10View = btn.dataset.view;
      if (_lastIndustries) renderTop10(_lastIndustries);
    });
  });
}

// --- Movers ---
let _lastHistory = null;
let _activePeriodDays = 7;

function computeMovers(history, periodDays) {
  if (!history || history.length < 2) return null;

  const today = history[history.length - 1];
  const todayDate = new Date(today.date);
  const cutoff = new Date(todayDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

  // Find closest snapshot at or before cutoff
  let past = null;
  for (let i = history.length - 2; i >= 0; i--) {
    if (new Date(history[i].date) <= cutoff) {
      past = history[i];
      break;
    }
  }
  if (!past) return null;

  // Derive composite ranks (lower composite = better rank = lower number)
  const rankOf = (scores) => {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => a.c - b.c);
    return Object.fromEntries(sorted.map(([n], i) => [n, i + 1]));
  };

  const todayRanks = rankOf(today.scores);
  const pastRanks  = rankOf(past.scores);

  const deltas = Object.keys(todayRanks)
    .filter(n => pastRanks[n] !== undefined)
    .map(name => ({
      name,
      delta:     pastRanks[name] - todayRanks[name], // positive = rose in rank
      todayRank: todayRanks[name],
      ticker:    today.scores[name]?.t ?? "",
    }));

  return {
    rising:   [...deltas].sort((a, b) => b.delta - a.delta).slice(0, 10),
    fading:   [...deltas].sort((a, b) => a.delta - b.delta).slice(0, 10),
    pastDate: past.date,
  };
}

function moverRow(item) {
  const url = finvizUrl(item.ticker);
  const nameEl = url
    ? `<a class="pick-link mover-name" href="${url}" target="_blank" rel="noopener">${item.name} ↗</a>`
    : `<span class="mover-name">${item.name}</span>`;
  const instMark = (_lastIndustries?.[item.name] && isInst(_lastIndustries[item.name])) ? " " + instTag() : "";
  const sign = item.delta > 0 ? "+" : "";
  const cls  = item.delta > 0 ? "mover-delta-pos" : item.delta < 0 ? "mover-delta-neg" : "mover-delta-neu";
  return `<div class="mover-row">
    <span class="mover-rank">#${item.todayRank}</span>
    ${nameEl}${instMark}
    <span class="${cls}">${sign}${item.delta}</span>
  </div>`;
}

function renderMovers(history, periodDays) {
  const risingEl = document.getElementById("movers-rising");
  const fadingEl = document.getElementById("movers-fading");
  if (!risingEl || !fadingEl) return;

  const periodLabel = document.querySelector(`.period-btn[data-days="${periodDays}"]`)?.textContent || "";
  const result = computeMovers(history, periodDays);

  if (!result) {
    const msg = `<p class="pick-empty">${t("moversNoData", periodLabel)}</p>`;
    risingEl.innerHTML = msg;
    fadingEl.innerHTML = msg;
    return;
  }

  const compareNote = `<div class="mover-compare">${t("moversCompare", result.pastDate)}</div>`;
  risingEl.innerHTML = compareNote + result.rising.map(moverRow).join("");
  fadingEl.innerHTML = compareNote + result.fading.map(moverRow).join("");
}

function updatePeriodButtons(history) {
  const btns = document.querySelectorAll(".period-btn");
  let lastAvailable = null;

  btns.forEach(btn => {
    const days = parseInt(btn.dataset.days);
    const available = computeMovers(history, days) !== null;
    btn.disabled = !available;
    if (available) lastAvailable = btn;
  });

  // If current active period got disabled, switch to longest available
  const activeBtn = document.querySelector(".period-btn.active");
  if (activeBtn && activeBtn.disabled && lastAvailable) {
    document.querySelectorAll(".period-btn").forEach(b => b.classList.remove("active"));
    lastAvailable.classList.add("active");
    _activePeriodDays = parseInt(lastAvailable.dataset.days);
  }
}

function initPeriodSelector() {
  document.querySelectorAll(".period-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".period-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      _activePeriodDays = parseInt(btn.dataset.days);
      if (_lastHistory) renderMovers(_lastHistory, _activePeriodDays);
    });
  });
}

// --- Setup Picks ---


// Themes und Industries liegen in getrennten Datensätzen; scope wählt die Quelle.
// Fehlender scope = "industry" (Bestandsbuttons in Setup Picks / Top 10).
function tickersOf(scope, name) {
  const list = scope === "theme"
    ? _etfData?.themes?.[name]?.tickers
    : _lastIndustries?.[name]?.tickers;
  return Array.isArray(list) ? list : [];
}

function flashDone(btn) {
  const orig = btn.textContent;
  btn.textContent = "✓";
  btn.classList.add("ind-copy-btn--done");
  setTimeout(() => { btn.textContent = orig; btn.classList.remove("ind-copy-btn--done"); }, 2000);
}

// TradingView-Importformat: "###Sektion,TICK,TICK,###Sektion 2,TICK".
// Ein Komma im Gruppennamen würde das Format sprengen -> ersetzen.
function tvSections(groups) {
  return groups
    .map(g => [`###${String(g.name).replace(/,/g, " ")}`, ...g.tickers].join(","))
    .join(",");
}

// Sammel-Kopie: mehrere Gruppen als benannte TradingView-Sektionen.
function copyGroupsAsSections(btn, groups) {
  const withTickers = groups
    .map(g => ({ name: g.name, tickers: tickersOf(g.scope ?? "theme", g.name) }))
    .filter(g => g.tickers.length);
  if (!withTickers.length) return;
  const total = withTickers.reduce((sum, g) => sum + g.tickers.length, 0);
  navigator.clipboard.writeText(tvSections(withTickers)).then(() => {
    flashDone(btn);
    showToast(t("copiedSections", withTickers.length, total));
  });
}

// Wire all .ind-copy-btn inside a container to copy one group's tickers.
function wireIndCopyButtons(container) {
  container.querySelectorAll(".ind-copy-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      e.preventDefault();
      const tickers = tickersOf(btn.dataset.scope, btn.dataset.key);
      if (!tickers.length) return;
      navigator.clipboard.writeText(tickers.join(",")).then(() => {
        flashDone(btn);
        showToast(_lang === "de" ? `${tickers.length} Ticker kopiert!` : `${tickers.length} tickers copied!`);
      });
    });
  });
}

// --- Render ---
function updateTimestamp(iso) {
  const el = document.getElementById("fetch-time");
  if (!iso) { el.textContent = t("notLoaded"); return; }
  const d = new Date(iso);
  const locale = _lang === "de" ? "de-DE" : "en-US";
  el.textContent = t("updated") + d.toLocaleString(locale);
}

function renderAll(payload) {
  if (!payload || !payload.industries || Object.keys(payload.industries).length === 0) return;
  _lastPayload = payload;
  _lastIndustries = payload.industries;
  renderHeatmap(payload.industries);
  renderTop10(payload.industries);
  renderIndustryBubble(payload.industries);
  renderRrgChart("industry");
  updateTimestamp(payload.fetched_at);
}

// --- Lang toggle ---
document.getElementById("lang-btn").addEventListener("click", () => {
  _lang = _lang === "de" ? "en" : "de";
  applyTranslations();
});

// --- Two-level navigation ---
function showPanel(panelId) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
  document.querySelector(`[data-panel="${panelId}"]`)?.classList.remove("hidden");
}

function initTabs() {
  const subNav = document.getElementById("industry-subnav");
  const themesSubNav = document.getElementById("themes-subnav");

  const activeTab = (nav, fallback) =>
    nav?.querySelector(".sub-btn.active")?.dataset.tab ?? fallback;

  // Top-level: Industry | Themes | ETFs
  document.querySelectorAll(".top-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".top-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (btn.dataset.top === "experimental") {
        subNav.classList.add("hidden");
        themesSubNav.classList.add("hidden");
        showPanel("experimental");
        renderExperimental();
      } else if (btn.dataset.top === "leaders") {
        subNav.classList.add("hidden");
        themesSubNav.classList.add("hidden");
        showPanel("leaders");
        renderLeadersTab();
      } else if (btn.dataset.top === "tickers") {
        subNav.classList.add("hidden");
        themesSubNav.classList.add("hidden");
        showPanel("tickers");
        renderTickersTab();
      } else if (btn.dataset.top === "industry") {
        subNav.classList.remove("hidden");
        themesSubNav.classList.add("hidden");
        showPanel(activeTab(subNav, "heatmap"));
      } else if (btn.dataset.top === "themes") {
        subNav.classList.add("hidden");
        themesSubNav.classList.remove("hidden");
        const tab = activeTab(themesSubNav, "etfs");
        showPanel(tab);
        if (tab === "etfs" && _etfData) renderEtfTab();
        else if (tab === "firstflag" || tab === "basebreak") renderSetupTabs();
      }
    });
  });

  // Sub-level (beide Sub-Navs) — active-Zustand bleibt pro Nav erhalten,
  // damit der Top-Level-Wechsel zum zuletzt gewählten Untertab zurückkehrt.
  document.querySelectorAll(".sub-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".sub-nav").querySelectorAll(".sub-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showPanel(btn.dataset.tab);
      // Re-render with real measurements — the initial render may have
      // happened while the panel was hidden (autoscale fallback dims).
      if (btn.dataset.tab === "ind-bubble" && _lastIndustries) renderIndustryBubble(_lastIndustries);
      if (btn.dataset.tab === "ind-rrg" && _lastIndustries) renderRrgChart("industry");
      if (btn.dataset.tab === "etfs" && _etfData) renderEtfTab();
      if (btn.dataset.tab === "firstflag" || btn.dataset.tab === "basebreak") renderSetupTabs();
    });
  });
}

// ── ETF Themes Tab ────────────────────────────────────────────────────────────

let _etfData       = null;
let _etfView       = "themes";   // "themes" | "etfs"
let _etfThemeSort  = { col: "score", dir: 1 };
let _etfListSort   = { col: "score", dir: 1 };
let _themeVizView  = "bubble"; // "table" | "bubble" | "matrix"

// Default-X-Achse der Bubble-Charts, im Experimental-Tab einstellbar und per
// Cookie gemerkt (siehe prefSet/prefGet). Die Chart-eigenen 3M/1W-Buttons
// setzen sich davon ab, ohne den Default zu verändern — sie sind nur ein
// temporärer Blick, kein neues Speichern.
let _bubbleXAxisDefault = prefGet("bubbleXAxisDefault") || "3M";
if (_bubbleXAxisDefault !== "3M" && _bubbleXAxisDefault !== "1W") _bubbleXAxisDefault = "3M";
let _themeBubbleXAxis   = _bubbleXAxisDefault; // "3M" | "1W" — X-Achse des Themes-Bubble-Charts
let _indBubbleXAxis     = _bubbleXAxisDefault; // "3M" | "1W" — X-Achse des Industry-Bubble-Charts
let _tickersBubbleXAxis = _bubbleXAxisDefault; // "3M" | "1W" — X-Achse des Tickers-Bubble-Charts
let _tickersData        = null; // docs/tickers.json (einmal pro Handelstag, wie setups.json)
let _tickersNotExtended = false; // optionaler UI-Filter: nur Ticker <= EXT_ATR_MAX ATR-Einheiten über SMA50
// "% Performance"-Schwellwerte der Bubble-Charts (Schieberegler je Achse).
// null = kein Filter. xTf merkt sich, für welche X-Zeitebene der X-Wert galt —
// wechselt die X-Achse (1W-Werte sind nicht mit 3M-Werten vergleichbar), wird
// der X-Schwellwert verworfen, der Y-Wert (immer 1M) bleibt stehen.
const _perfFilter = {
  themes:  { x: null, y: null, xTf: null },
  ind:     { x: null, y: null, xTf: null },
  tickers: { x: null, y: null, xTf: null },
};

// Theme badge colours for all 40 Finviz themes
const THEME_COLORS = {
  "Artificial Intelligence":    { bg: "#0d2240", fg: "#58a6ff" },
  "Semiconductors":             { bg: "#1a2a4a", fg: "#79c0ff" },
  "Cybersecurity":              { bg: "#1a0d4a", fg: "#b794f4" },
  "Cloud Computing":            { bg: "#0d2830", fg: "#56d3d3" },
  "Clean Energy":               { bg: "#0d2a0d", fg: "#39d353" },
  "Defense & Aerospace":        { bg: "#2a1200", fg: "#ff8c42" },
  "Healthcare & Biotech":       { bg: "#2a0d1a", fg: "#f78ca0" },
  "Electric Vehicles":          { bg: "#002a1a", fg: "#26c084" },
  "Fintech":                    { bg: "#1a2a0d", fg: "#aed581" },
  "Crypto & Blockchain":        { bg: "#2a1a00", fg: "#ffd700" },
  "Software":                   { bg: "#0d1a30", fg: "#60a5fa" },
  "Hardware":                   { bg: "#201800", fg: "#d4a017" },
  "E-Commerce":                 { bg: "#2a0d2a", fg: "#d97bde" },
  "Industrial Automation":      { bg: "#1a2200", fg: "#8bc34a" },
  "Autonomous Systems":         { bg: "#002222", fg: "#4dd0e1" },
  "Space Tech":                 { bg: "#0d0d2a", fg: "#a5b4fc" },
  "Robotics":                   { bg: "#1a1a3a", fg: "#818cf8" },
  "Quantum Computing":          { bg: "#200d30", fg: "#c084fc" },
  "Internet of Things":         { bg: "#002a1a", fg: "#34d399" },
  "Big Data":                   { bg: "#1a2a30", fg: "#67e8f9" },
  "Telecommunications":         { bg: "#0d2030", fg: "#38bdf8" },
  "Transportation & Logistics": { bg: "#1a1400", fg: "#fbbf24" },
  "Energy Traditional":         { bg: "#2a1400", fg: "#f97316" },
  "Commodities — Metals":       { bg: "#2a2000", fg: "#d4a017" },
  "Commodities — Energy":       { bg: "#2a1000", fg: "#fb923c" },
  "Commodities — Agri":         { bg: "#1a2a00", fg: "#86efac" },
  "Digital Entertainment":      { bg: "#2a0d20", fg: "#fb7185" },
  "Social Media":               { bg: "#1a0030", fg: "#a78bfa" },
  "Consumer Goods":             { bg: "#2a1a10", fg: "#d4a57c" },
  "Agriculture & Food":         { bg: "#0a2000", fg: "#4ade80" },
  "VR & Augmented Reality":     { bg: "#0d0d2a", fg: "#c4b5fd" },
  "Wearables":                  { bg: "#2a1030", fg: "#e879f9" },
  "Smart Home":                 { bg: "#002030", fg: "#7dd3fc" },
  "Real Estate & REITs":        { bg: "#1a1a1a", fg: "#9ca3af" },
  "Nanotechnology":             { bg: "#1a001a", fg: "#f0abfc" },
  "Biometrics":                 { bg: "#001a30", fg: "#60a5fa" },
  "Environmental":              { bg: "#001a00", fg: "#4ade80" },
  "Education Tech":             { bg: "#1a1000", fg: "#fde68a" },
  "Aging Population":           { bg: "#2a1a1a", fg: "#d1d5db" },
  "Healthy Food & Nutrition":   { bg: "#001a10", fg: "#6ee7b7" },
};

// Finviz internal slugs that differ from auto-derived form (kept in sync with scraper.py)
const THEME_SLUG_OVERRIDES = {
  "Commodities — Agri":      "commoditiesagriculture",
  "Education Tech":          "educationtechnology",
  "Agriculture & Food":      "agriculturefoodtech",
  "Clean Energy":            "energyrenewable",
  "Environmental":           "environmentalsustainability",
  "Aging Population":        "agingpopulationlongevity",
  "VR & Augmented Reality":  "virtualaugmentedreality",
};

function themeScreenerUrl(theme) {
  const slug = THEME_SLUG_OVERRIDES[theme] ?? theme.toLowerCase().replace(/[^a-z0-9]/g, "");
  return fvScreenerUrl(`theme_${slug}`);
}

function themeBadge(theme) {
  const c = THEME_COLORS[theme] || { bg: "#1a1a2a", fg: "#8b949e" };
  return `<a href="${themeScreenerUrl(theme)}" target="_blank" rel="noopener" class="etf-theme-badge" style="background:${c.bg};color:${c.fg};text-decoration:none">${theme}</a>`;
}

function showToast(msg) {
  let toast = document.getElementById("copy-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "copy-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("copy-toast--visible");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("copy-toast--visible"), 2000);
}

// Build a structured JSON array for the currently selected rows and copy it to
// the clipboard. `rows` is an array of {name, score, accel, ranks?, perfs, tickers}
// objects (already shaped by the caller). Each row keeps its own ticker grouping.
// Eine Theme-Zeile des JSON-Exports (Themes-Tab UND Leading-Stocks-Tab).
// Felder bis "tickers" sind Schema v1 und bleiben unverändert; ab v2 kommen
// leading_breadth + leaders hinzu (null, solange die Leader-Daten nicht
// geladen sind — der Leading-Stocks-Tab lädt sie beim ersten Öffnen).
function themeExportRow(name) {
  const row  = _etfData?.themes?.[name];
  if (!row) return null;
  const m = _themeMetrics?.[name];
  return {
    type: "theme",
    name,
    score: row.score,
    accel: _themeAccel[name],
    // Themes only have a single overall rank, not per-timeframe ranks.
    ranks: { overall: row.rank },
    perfs: { "1W": row.perfs?.["1W"], "1M": row.perfs?.["1M"], "3M": row.perfs?.["3M"], "6M": row.perfs?.["6M"], "YTD": row.perfs?.["YTD"] },
    // Kennzahlen-Kern (SPEC §4.4) — null, falls das Modul nicht lud.
    segments: m?.segments ?? null,
    damage: m?.damage ?? null,
    freshness: m?.freshness ?? null,
    stage: m?.stage ?? null,
    daysInStage: m?.daysInStage ?? null,
    density: m?.density ?? null,
    breadth: m?.breadth ?? null,
    breadthDelta: m?.breadthDelta ?? null,
    concentration: m?.concentration ?? null,
    tickers: row.tickers ?? [],
    ...leadersExportFields(name),
  };
}

// Schema-Version jeder Export-Zeile. v1 = ohne Feld (bis 2026-10),
// v2 = Theme-Zeilen tragen leading_breadth + leaders (Leading-Stocks-Tab).
const EXPORT_SCHEMA_VERSION = 2;

function exportSelectionJson(rows) {
  if (!rows || !rows.length) return;
  // Aktuelles Regime in jede Zeile stempeln (Kontext für den Leader-Analyst).
  if (_regimeData?.state) rows.forEach(r => { r.regime = _regimeData.state; });
  rows.forEach(r => { r.schema_version = EXPORT_SCHEMA_VERSION; });
  const json = JSON.stringify(rows, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    const n = rows.length;
    showToast(_lang === "de"
      ? `JSON für ${n} ${n === 1 ? "Zeile" : "Zeilen"} kopiert!`
      : `JSON for ${n} ${n === 1 ? "row" : "rows"} copied!`);
  });
}

// Compute Accel = rank_3M - rank_1M for a themes or subnodes map.
// Returns { [key]: number } — positive = fresh momentum.
function computeAccel(entries) {
  const sorted1M = [...entries].sort(([,a],[,b]) => (b.perfs["1M"] ?? -999) - (a.perfs["1M"] ?? -999));
  const sorted3M = [...entries].sort(([,a],[,b]) => (b.perfs["3M"] ?? -999) - (a.perfs["3M"] ?? -999));
  const rank1M = {}, rank3M = {};
  sorted1M.forEach(([k], i) => rank1M[k] = i + 1);
  sorted3M.forEach(([k], i) => rank3M[k] = i + 1);
  const accel = {};
  entries.forEach(([k]) => { accel[k] = (rank3M[k] ?? entries.length) - (rank1M[k] ?? entries.length); });
  return accel;
}

// Rang je Zeitfenster innerhalb einer Gruppe (Themes ODER Industries) — exakt
// dieselbe Sortierung wie topIntersectionKeys() (Performance absteigend,
// Rang 1 = stärkstes). Reine Datenfunktion, {name -> rank}.
function rankMapFor(entries, tf) {
  const ranks = {};
  entries
    .filter(([, row]) => row?.perfs?.[tf] != null)
    .sort(([, a], [, b]) => b.perfs[tf] - a.perfs[tf])
    .forEach(([name], i) => { ranks[name] = i + 1; });
  return ranks;
}

// Render a 5-point sparkline SVG (YTD→6M→3M→1M→1W) colored by accel value.
function renderSparkline(perfs, accel) {
  const TFS = ["YTD", "6M", "3M", "1M", "1W"];
  const vals = TFS.map(tf => perfs[tf] ?? null);
  const defined = vals.filter(v => v !== null);
  if (defined.length < 2) return `<svg width="72" height="26" style="display:block"></svg>`;

  const min = Math.min(...defined);
  const max = Math.max(...defined);
  const range = max - min || 1;
  const W = 72, H = 26, PX = 5, PY = 4;

  const pts = vals.map((v, i) => {
    if (v === null) return null;
    const x = PX + (i / (TFS.length - 1)) * (W - 2 * PX);
    const y = H - PY - ((v - min) / range) * (H - 2 * PY);
    return [x.toFixed(1), y.toFixed(1)];
  });

  const polyPts = pts.filter(Boolean).map(p => p.join(",")).join(" ");
  const last = pts.filter(Boolean).pop();

  const color = accel >= 10 ? "#4ade80"
              : accel <= -10 ? "#f87171"
              : accel >= 5   ? "#86efac"
              : "#6b7280";

  const tooltipParts = TFS.map((tf, i) =>
    vals[i] !== null ? `${tf}: ${vals[i] > 0 ? "+" : ""}${vals[i].toFixed(1)}%` : `${tf}: —`
  ).join("  ");

  return `<svg width="72" height="26" style="display:block;cursor:help">
    <title>${tooltipParts}</title>
    <polyline points="${polyPts}" fill="none" stroke="${color}" stroke-width="1.8"
      stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="2.2" fill="${color}"/>
  </svg>`;
}

// ── Multi-select: Themes ──────────────────────────────────────────────────
function updateThemeSelectionBar() {
  const bar    = document.getElementById("theme-selection-bar");
  const checks = [...document.querySelectorAll("#etf-themes-body .row-check:checked")];
  if (!checks.length) { bar.classList.add("hidden"); return; }

  const allTickers = checks.flatMap(cb => _etfData?.themes?.[cb.dataset.key]?.tickers ?? []);
  const deduped    = [...new Set(allTickers)];
  bar.__deduped = deduped;

  const n = checks.length;
  bar.querySelector(".selection-bar__info").textContent = _lang === "de"
    ? `${n} Theme${n > 1 ? "s" : ""} ausgewählt · ${deduped.length} Ticker (dedupliziert)`
    : `${n} theme${n > 1 ? "s" : ""} selected · ${deduped.length} tickers (deduplicated)`;
  bar.classList.remove("hidden");
}

// --- Themes table (40 Finviz top-level themes) ---
function renderEtfThemes(data) {
  const tbody = document.getElementById("etf-themes-body");
  if (!data || !data.themes) {
    tbody.innerHTML = `<tr><td colspan="14" class="empty-msg">${t("etfNoData")}</td></tr>`;
    return;
  }

  // Must be computed before view-switch so bubble/matrix can use it
  let entries = Object.entries(data.themes);
  const themeAccel = computeAccel(entries);
  _themeAccel = themeAccel; // stash for JSON export

  // Show/hide the three view containers
  const tableScroll = document.querySelector("#etf-themes-view .table-scroll");
  if (tableScroll) tableScroll.classList.toggle("hidden", _themeVizView !== "table");
  document.getElementById("etf-bubble-view").classList.toggle("hidden", _themeVizView !== "bubble");
  document.getElementById("theme-bubble-xaxis-toggle").classList.toggle("hidden", _themeVizView !== "bubble");
  document.getElementById("etf-matrix-view").classList.toggle("hidden", _themeVizView !== "matrix");
  document.getElementById("etf-rrg-view").classList.toggle("hidden", _themeVizView !== "rrg");
  syncRrgFilterButtons();

  if (_themeVizView === "bubble") { renderBubbleChart(data, themeAccel); return; }
  if (_themeVizView === "matrix") { renderMomentumMatrix(data, themeAccel); return; }
  if (_themeVizView === "rrg")    { renderRrgChart("theme"); return; }

  // --- table view continues below ---

  document.querySelectorAll("#etf-themes-table thead th[data-etfcol]").forEach(th => {
    const col = th.dataset.etfcol;
    const isActive = col === _etfThemeSort.col;
    th.classList.toggle("sort-active", isActive);
    const arrow = isActive ? (_etfThemeSort.dir === 1 ? " ▲" : " ▼") : "";
    if (col === "score") th.innerHTML = t("colScore") + arrow + ` <span class="col-info" title="${t('infoScore')}">i</span>`;
    else if (col === "accel") th.innerHTML = t("etfColAccel") + arrow;
    else if (col === "stage") th.textContent = t("colStage") + arrow;
    else th.textContent = (col === "theme" ? "Theme" : col) + arrow;
  });

  const { col, dir } = _etfThemeSort;
  entries.sort(([na, a], [nb, b]) => {
    if (col === "theme") return dir * na.localeCompare(nb);
    if (col === "score") return dir * (a.score - b.score);
    if (col === "accel") return dir * (themeAccel[na] - themeAccel[nb]);
    if (col === "stage") return dir * (_themeMetrics?.[na]?.stage ?? "ZZ").localeCompare(_themeMetrics?.[nb]?.stage ?? "ZZ");
    return dir * ((a.perfs[col] ?? -Infinity) - (b.perfs[col] ?? -Infinity));
  });

  const accelTooltip = t("hintThemeAccel");

  const rows = entries.map(([theme, row], idx) => {
    const perfCells = ETF_TIMEFRAMES.map(tf =>
      `<td class="${perfClass(row.perfs[tf])}">${fmtPct(row.perfs[tf])}</td>`
    ).join("");

    // Top-3 sub-nodes by 1M as small chips (clickable → Finviz screener)
    const chips = (row.top3 || []).map(nodeKey => {
      const sub = data.subnodes?.[nodeKey];
      const label = sub ? sub.label : nodeKey;
      const url = fvScreenerUrl(`subtheme_${nodeKey}`);
      return `<a class="etf-ticker-chip etf-ticker-chip--link" href="${url}" target="_blank" rel="noopener" title="${label} → Finviz Screener">${label}</a>`;
    }).join(" ");

    const hasTickers = row.tickers && row.tickers.length > 0;
    const tickerCount = hasTickers ? row.tickers.length : 0;
    const tickerTooltip = _lang === "de"
      ? `${tickerCount} Aktien in diesem Theme (Quelle: Finviz Screener)`
      : `${tickerCount} stocks in this theme (source: Finviz Screener)`;
    const noTickerTooltip = _lang === "de"
      ? "Kein Finviz-Screener-Filter für dieses Theme verfügbar"
      : "No Finviz screener filter available for this theme";
    const tickerBadge = hasTickers
      ? `<span class="theme-stock-count" title="${tickerTooltip}">${tickerCount}</span>`
      : `<span class="theme-stock-count theme-stock-count--na" title="${noTickerTooltip}">—</span>`;

    const accel = themeAccel[theme];
    const accelSign = accel > 0 ? "+" : "";
    const accelClass = accel >= 10 ? "accel-fresh" : accel <= -10 ? "accel-extended" : accel >= 5 ? "accel-fresh-mild" : "accel-neutral";

    return `<tr>
      <td class="col-check"><input type="checkbox" class="row-check"${hasTickers ? '' : ' disabled'} data-key="${esc(theme)}"></td>
      <td>${idx + 1}</td>
      <td style="text-align:left">
        ${themeBadge(theme)}
        ${tickerBadge}
      </td>
      ${perfCells}
      <td>${row.score.toFixed(1)}</td>
      <td class="${accelClass}" title="${accelTooltip}" style="cursor:help;font-weight:700">${accelSign}${accel}</td>
      <td>${stageLabelHtml(_themeMetrics?.[theme]?.stage)}</td>
      <td style="text-align:left">${chips}</td>
      <td>${renderSparkline(row.perfs, themeAccel[theme] ?? 0)}</td>
    </tr>`;
  });

  tbody.innerHTML = rows.join("") || `<tr><td colspan="14" class="empty-msg">${t("etfNoData")}</td></tr>`;

  // ── Multi-select wiring ───────────────────────────────────────────────────
  const themeHeaderCheck = document.getElementById("theme-select-all");
  const themeRowChecks   = [...tbody.querySelectorAll(".row-check:not([disabled])")];

  function syncThemeHeader() {
    const n = themeRowChecks.filter(c => c.checked).length;
    themeHeaderCheck.indeterminate = n > 0 && n < themeRowChecks.length;
    themeHeaderCheck.checked = n > 0 && n === themeRowChecks.length;
  }

  themeRowChecks.forEach(cb => cb.addEventListener("change", () => {
    syncThemeHeader();
    updateThemeSelectionBar();
  }));

  themeHeaderCheck.onchange = () => {
    themeRowChecks.forEach(cb => cb.checked = themeHeaderCheck.checked);
    themeHeaderCheck.indeterminate = false;
    updateThemeSelectionBar();
  };

  const themeBar = document.getElementById("theme-selection-bar");
  themeBar.querySelector(".selection-bar__copy-btn").onclick = () => {
    const deduped = themeBar.__deduped;
    if (!deduped || !deduped.length) return;
    navigator.clipboard.writeText(deduped.join(",")).then(() => {
      showToast(_lang === "de" ? `${deduped.length} Ticker kopiert!` : `${deduped.length} tickers copied!`);
    });
  };
  const themeExportBtn = themeBar.querySelector(".selection-bar__export-btn");
  if (themeExportBtn) themeExportBtn.onclick = () => {
    const checked = [...document.querySelectorAll("#etf-themes-body .row-check:checked")];
    const rows = checked.map(cb => themeExportRow(cb.dataset.key)).filter(Boolean);
    exportSelectionJson(rows);
  };
  themeBar.querySelector(".selection-bar__clear-btn").onclick = () => {
    themeRowChecks.forEach(cb => cb.checked = false);
    themeHeaderCheck.checked = false;
    themeHeaderCheck.indeterminate = false;
    updateThemeSelectionBar();
  };
}

// ── Multi-select: Sub-Themes ──────────────────────────────────────────────
function updateSubSelectionBar() {
  const bar    = document.getElementById("sub-selection-bar");
  const checks = [...document.querySelectorAll("#etf-list-body .row-check:checked")];
  if (!checks.length) { bar.classList.add("hidden"); return; }

  const allTickers = checks.flatMap(cb => _etfData?.subnodes?.[cb.dataset.key]?.tickers ?? []);
  const deduped    = [...new Set(allTickers)];
  bar.__deduped = deduped;

  const n = checks.length;
  bar.querySelector(".selection-bar__info").textContent = _lang === "de"
    ? `${n} Sub-Theme${n > 1 ? "s" : ""} ausgewählt · ${deduped.length} Ticker (dedupliziert)`
    : `${n} sub-theme${n > 1 ? "s" : ""} selected · ${deduped.length} tickers (deduplicated)`;
  bar.classList.remove("hidden");
}

// --- Sub-Themes table (268 Finviz sub-nodes) ---
function renderEtfList(data) {
  const tbody = document.getElementById("etf-list-body");
  if (!data || !data.subnodes) {
    tbody.innerHTML = `<tr><td colspan="13" class="empty-msg">${t("etfNoData")}</td></tr>`;
    return;
  }

  document.querySelectorAll("#etf-list-table thead th[data-etflistcol]").forEach(th => {
    const col = th.dataset.etflistcol;
    const isActive = col === _etfListSort.col;
    th.classList.toggle("sort-active", isActive);
    const arrow = isActive ? (_etfListSort.dir === 1 ? " ▲" : " ▼") : "";
    if (col === "score") th.innerHTML = t("colScore") + arrow + ` <span class="col-info" title="${t('infoScore')}">i</span>`;
    else if (col === "accel") th.innerHTML = t("colAccel") + arrow;
    else th.textContent = th.textContent.replace(/ [▲▼]$/, "") + arrow;
  });

  const allEntries = Object.entries(data.subnodes);

  const subAccel = computeAccel(allEntries);

  const { col, dir } = _etfListSort;
  let entries = [...allEntries];
  entries.sort(([ka, a], [kb, b]) => {
    if (col === "label") return dir * a.label.localeCompare(b.label);
    if (col === "theme") return dir * a.theme.localeCompare(b.theme);
    if (col === "score") return dir * (a.score - b.score);
    if (col === "accel") return dir * (subAccel[ka] - subAccel[kb]);
    return dir * ((a.perfs[col] ?? -Infinity) - (b.perfs[col] ?? -Infinity));
  });

  const accelTooltip = t("hintSubAccel");
  const rows = entries.map(([key, row], idx) => {
    const perfCells = ETF_TIMEFRAMES.map(tf =>
      `<td class="${perfClass(row.perfs[tf])}">${fmtPct(row.perfs[tf])}</td>`
    ).join("");
    const subUrl = fvScreenerUrl(`subtheme_${key}`);
    const accel = subAccel[key] ?? 0;
    const accelSign = accel > 0 ? "+" : "";
    const accelClass = accel >= 20 ? "accel-fresh" : accel <= -20 ? "accel-extended" : accel >= 8 ? "accel-fresh-mild" : "accel-neutral";

    const hasTickers = row.tickers && row.tickers.length > 0;
    const tickerCount = hasTickers ? row.tickers.length : 0;
    const tickerTooltip = _lang === "de"
      ? `${tickerCount} Aktien in diesem Sub-Theme (Quelle: Finviz Screener)`
      : `${tickerCount} stocks in this sub-theme (source: Finviz Screener)`;
    const noTickerTooltip = _lang === "de"
      ? "Kein Finviz-Screener-Filter für dieses Sub-Theme verfügbar"
      : "No Finviz screener filter available for this sub-theme";
    const tickerBadge = hasTickers
      ? `<span class="theme-stock-count" title="${tickerTooltip}">${tickerCount}</span>`
      : `<span class="theme-stock-count theme-stock-count--na" title="${noTickerTooltip}">—</span>`;
    return `<tr>
      <td class="col-check"><input type="checkbox" class="row-check"${hasTickers ? '' : ' disabled'} data-key="${esc(key)}"></td>
      <td>${idx + 1}</td>
      <td style="text-align:left;font-weight:600">
        <a href="${subUrl}" target="_blank" rel="noopener" class="sub-theme-link">${row.label}</a>
        ${tickerBadge}
      </td>
      <td style="text-align:left">${themeBadge(row.theme)}</td>
      ${perfCells}
      <td>${row.score.toFixed(1)}</td>
      <td class="${accelClass}" title="${accelTooltip}" style="cursor:help;font-weight:700">${accelSign}${accel}</td>
      <td>${renderSparkline(row.perfs, subAccel[key] ?? 0)}</td>
    </tr>`;
  });

  tbody.innerHTML = rows.join("") || `<tr><td colspan="13" class="empty-msg">${t("etfNoData")}</td></tr>`;

  // ── Multi-select wiring ───────────────────────────────────────────────────
  const subHeaderCheck = document.getElementById("sub-select-all");
  const subRowChecks   = [...tbody.querySelectorAll(".row-check:not([disabled])")];

  function syncSubHeader() {
    const n = subRowChecks.filter(c => c.checked).length;
    subHeaderCheck.indeterminate = n > 0 && n < subRowChecks.length;
    subHeaderCheck.checked = n > 0 && n === subRowChecks.length;
  }

  subRowChecks.forEach(cb => cb.addEventListener("change", () => {
    syncSubHeader();
    updateSubSelectionBar();
  }));

  subHeaderCheck.onchange = () => {
    subRowChecks.forEach(cb => cb.checked = subHeaderCheck.checked);
    subHeaderCheck.indeterminate = false;
    updateSubSelectionBar();
  };

  const subBar = document.getElementById("sub-selection-bar");
  subBar.querySelector(".selection-bar__copy-btn").onclick = () => {
    const deduped = subBar.__deduped;
    if (!deduped || !deduped.length) return;
    navigator.clipboard.writeText(deduped.join(",")).then(() => {
      showToast(_lang === "de" ? `${deduped.length} Ticker kopiert!` : `${deduped.length} tickers copied!`);
    });
  };
  subBar.querySelector(".selection-bar__clear-btn").onclick = () => {
    subRowChecks.forEach(cb => cb.checked = false);
    subHeaderCheck.checked = false;
    subHeaderCheck.indeterminate = false;
    updateSubSelectionBar();
  };
}

function renderMomentumMatrix(data, themeAccel) {
  const container = document.getElementById("etf-matrix-view");
  const entries = Object.entries(data.themes);

  const all3M = entries.map(([,r]) => r.perfs["3M"]).filter(v => v !== null);
  const all1M = entries.map(([,r]) => r.perfs["1M"]).filter(v => v !== null);
  const med3M = [...all3M].sort((a,b)=>a-b)[Math.floor(all3M.length/2)];
  const med1M = [...all1M].sort((a,b)=>a-b)[Math.floor(all1M.length/2)];

  const q = { fresh: [], trending: [], fading: [], dead: [] };
  entries.forEach(([theme, row]) => {
    const p3 = row.perfs["3M"] ?? 0;
    const p1 = row.perfs["1M"] ?? 0;
    if      (p3 < med3M && p1 >= med1M) q.fresh.push(theme);
    else if (p3 >= med3M && p1 >= med1M) q.trending.push(theme);
    else if (p3 >= med3M && p1 < med1M)  q.fading.push(theme);
    else                                  q.dead.push(theme);
  });

  const chips = (themes) => themes.map(theme => {
    const c = THEME_COLORS[theme] || { bg: "#1a1a2a", fg: "#8b949e" };
    const accel = themeAccel[theme] ?? 0;
    const accelSign = accel > 0 ? "+" : "";
    const tip = `Accel: ${accelSign}${accel}`;
    return `<a href="${themeScreenerUrl(theme)}" target="_blank" rel="noopener"
      class="etf-theme-badge matrix-chip" title="${tip}"
      style="background:${c.bg};color:${c.fg};text-decoration:none">${theme}</a>`;
  }).join(" ");

  container.innerHTML = `
    <div class="momentum-matrix">
      <div class="matrix-cell matrix-fresh">
        <div class="matrix-cell-hdr">${t("matrixFresh")}<span class="matrix-sub">${t("matrixFreshSub")}</span></div>
        <div class="matrix-chips">${chips(q.fresh)}</div>
      </div>
      <div class="matrix-cell matrix-trending">
        <div class="matrix-cell-hdr">${t("matrixTrend")}<span class="matrix-sub">${t("matrixTrendSub")}</span></div>
        <div class="matrix-chips">${chips(q.trending)}</div>
      </div>
      <div class="matrix-cell matrix-dead">
        <div class="matrix-cell-hdr">${t("matrixDead")}<span class="matrix-sub">${t("matrixDeadSub")}</span></div>
        <div class="matrix-chips">${chips(q.dead)}</div>
      </div>
      <div class="matrix-cell matrix-fading">
        <div class="matrix-cell-hdr">${t("matrixFading")}<span class="matrix-sub">${t("matrixFadingSub")}</span></div>
        <div class="matrix-chips">${chips(q.fading)}</div>
      </div>
    </div>
    <p style="font-size:11px;color:var(--text-dim);margin-top:8px;padding:0 4px">
      ${_lang === "de"
        ? `Einteilung nach Median 3M (${med3M > 0 ? "+" : ""}${med3M.toFixed(1)}%) und Median 1M (${med1M > 0 ? "+" : ""}${med1M.toFixed(1)}%). Klick auf Theme öffnet Finviz.`
        : `Divided at median 3M (${med3M > 0 ? "+" : ""}${med3M.toFixed(1)}%) and median 1M (${med1M > 0 ? "+" : ""}${med1M.toFixed(1)}%). Click any theme to open Finviz.`}
    </p>`;
}

// ── Bubble chart shared core (Themes + Industry) ────────────────────────────
// Autoscale: the viewBox is computed from the container width and the
// remaining viewport height, so the chart fills the screen; a debounced
// window-resize listener re-renders. Labels are placed greedily
// (above/below/right/left, biggest bubble claims its spot first); when no
// free spot remains the label is dropped — the tooltip keeps the full name.

function bubbleChartDims(container) {
  const visible = container.clientWidth > 0;
  const W = Math.max(700, Math.round(
    visible ? container.clientWidth
            : (document.querySelector("main")?.clientWidth || window.innerWidth - 48)));
  // When rendered while hidden (e.g. initial load on another tab), estimate;
  // the tab-switch re-render fixes it up with real measurements.
  const top = visible ? container.getBoundingClientRect().top : 190;
  const LEGEND_SPACE = 60; // legend row + margins below the SVG
  const H = Math.min(1600, Math.max(420,
    Math.round(window.innerHeight - Math.max(top, 0) - LEGEND_SPACE)));
  return { W, H };
}

function placeBubbleLabels(pts, bounds) {
  const placed = [], out = [];
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `9px ${getComputedStyle(document.body).fontFamily}`;
  const LBL_H = 10, GAP = 1.5; // breathing room between label boxes
  for (const p of [...pts].sort((a, b) => b.r - a.r)) {
    const w = ctx.measureText(p.label).width;
    const cands = [
      { x: p.x, y: p.y - p.r - 4,  anchor: "middle" },
      { x: p.x, y: p.y + p.r + 11, anchor: "middle" },
      { x: p.x + p.r + 4, y: p.y + 3, anchor: "start" },
      { x: p.x - p.r - 4, y: p.y + 3, anchor: "end" },
    ];
    for (const c of cands) {
      const x0 = c.anchor === "middle" ? c.x - w / 2 : c.anchor === "start" ? c.x : c.x - w;
      const box = { x0: x0 - GAP, x1: x0 + w + GAP, y0: c.y - LBL_H + 2 - GAP, y1: c.y + 2 + GAP };
      if (box.x0 < bounds.x0 || box.x1 > bounds.x1 || box.y0 < bounds.y0 || box.y1 > bounds.y1) continue;
      if (placed.some(b => box.x1 > b.x0 && box.x0 < b.x1 && box.y1 > b.y0 && box.y0 < b.y1)) continue;
      placed.push(box);
      // data-rrg verbindet das Label mit Punkt und Tail desselben Themes
      // (nur im RRG gesetzt; die Bubble-Charts liefern keine rrgId).
      const rrgTag = p.rrgId === undefined ? "" : ` data-rrg="${p.rrgId}"`;
      // data-groups verbindet das Label mit Bubble und Legenden-Eintrag ALLER
      // Gruppen, zu denen der Ticker gehört (nicht nur der primären/Farb-
      // gebenden) — nur im Tickers-Chart gesetzt, siehe wireBubbleGroupHighlight.
      const groupTag = p.groups === undefined ? "" : ` data-groups="${esc(p.groups.join("||"))}"`;
      out.push(`<text x="${c.x.toFixed(1)}" y="${c.y.toFixed(1)}" text-anchor="${c.anchor}"
        font-size="9" fill="${p.color}"${rrgTag}${groupTag} style="pointer-events:none">${p.label}</text>`);
      break;
    }
  }
  return out.join("");
}

// Leichte, iterative Kollisionsauflösung: schiebt sich überlappende Bubbles
// paarweise minimal auseinander, bis keine mehr überlappen (oder das
// Iterationslimit erreicht ist). Die Achsen-Position bleibt näherungsweise
// erhalten — nur so viel Verschiebung wie nötig, um Überlappung aufzulösen,
// nicht um die Punkte "hübsch" zu verteilen. Kappt am Plot-Rand, damit nichts
// aus dem sichtbaren Bereich wandert.
function resolveBubbleCollisions(pts, bounds, iterations = 200) {
  const GAP = 1.5;
  for (let iter = 0; iter < iterations; iter++) {
    let moved = false;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        const minDist = a.r + b.r + GAP;
        if (dist >= minDist) continue;
        moved = true;
        if (dist < 0.01) { dx = 1; dy = 0; dist = 1; } // exakt übereinander -> künstlich trennen
        const push = (minDist - dist) / 2;
        const ux = dx / dist, uy = dy / dist;
        a.x -= ux * push; a.y -= uy * push;
        b.x += ux * push; b.y += uy * push;
      }
    }
    for (const p of pts) {
      p.x = Math.min(Math.max(p.x, bounds.x0 + p.r), Math.max(bounds.x1 - p.r, bounds.x0 + p.r));
      p.y = Math.min(Math.max(p.y, bounds.y0 + p.r), Math.max(bounds.y1 - p.r, bounds.y0 + p.r));
    }
    if (!moved) break;
  }
}

// Legenden-Hover/-Klick für Bubble-Charts mit Gruppen-Einfärbung: Hover hebt
// die Gruppe temporär hervor, Klick pinnt sie (bis erneuter Klick oder Klick
// auf eine andere Gruppe). Ein Ticker kann in mehreren Gruppen stecken (Bubble
// UND Label tragen data-groups = ALLE Gruppen, "||"-getrennt) — nur die
// EINE farbgebende Gruppe würde sonst z.B. bei einem Ticker mit drei Themes
// die anderen beiden unsichtbar für den Hover machen. No-op, wenn der Chart
// kein data-groups setzt (Themes-/Industry-Bubble-Charts) — dieselbe Mechanik
// wie der RRG-Hover (data-rrg/.rrg-hover), nur unter eigenem Klassennamen.
function wireBubbleGroupHighlight(container) {
  const svg = container.querySelector("svg");
  if (!svg) return;
  const marked = svg.querySelectorAll("[data-groups]");
  if (!marked.length) return;
  const legendItems = container.querySelectorAll(".bubble-legend-item[data-group]");
  let pinned = null;
  const setActive = (key) => {
    svg.classList.toggle("bubble-hover", key !== null);
    marked.forEach(el => el.classList.toggle("bubble-on", key !== null && el.dataset.groups.split("||").includes(key)));
    legendItems.forEach(el => el.classList.toggle("bubble-legend-item--active", el.dataset.group === key));
  };
  legendItems.forEach(el => {
    el.addEventListener("mouseenter", () => { if (pinned === null) setActive(el.dataset.group); });
    el.addEventListener("mouseleave", () => { if (pinned === null) setActive(null); });
    el.addEventListener("click", () => {
      pinned = pinned === el.dataset.group ? null : el.dataset.group;
      setActive(pinned);
    });
  });
}

function renderBubbleSvg(container, pts, neutralLabel, xTf = "3M", legendHtml = null, opts = {}) {
  if (!pts.length) { container.innerHTML = '<p style="color:#6b7280;padding:16px">No data</p>'; return; }

  const xs = pts.map(p => p.x3m), ys = pts.map(p => p.y1m);
  const med3M = [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  const med1M = [...ys].sort((a, b) => a - b)[Math.floor(ys.length / 2)];
  const pad3M = (Math.max(...xs) - Math.min(...xs)) * 0.06 || 1;
  const pad1M = (Math.max(...ys) - Math.min(...ys)) * 0.08 || 1;
  const lo3M = Math.min(...xs) - pad3M, hi3M = Math.max(...xs) + pad3M;
  const lo1M = Math.min(...ys) - pad1M, hi1M = Math.max(...ys) + pad1M;

  const scores = pts.map(p => p.score);
  const minScore = Math.min(...scores);
  const scoreRange = (Math.max(...scores) - minScore) || 1;

  const { W, H } = bubbleChartDims(container);
  const PAD = { top: 28, right: 36, bottom: 48, left: 58 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const toX = v => PAD.left + ((v - lo3M) / (hi3M - lo3M)) * plotW;
  const toY = v => H - PAD.bottom - ((v - lo1M) / (hi1M - lo1M)) * plotH;
  // Size = strength (score, lower = stronger) — strongest themes stay biggest.
  // Radius range scales gently with the plot area. opts.sizeScale schrumpft
  // beide Enden gleichermaßen (Tickers-Chart: viel mehr Punkte, kleiner lesbarer).
  const sizeScale = opts.sizeScale ?? 1;
  const rMax = Math.max(20, Math.min(30, Math.round(Math.sqrt(plotW * plotH) / 32))) * sizeScale;
  const rMin = Math.max(6 * sizeScale, Math.round(rMax * 0.28));
  const toR = s => rMax - ((s - minScore) / scoreRange) * (rMax - rMin);
  const toColor = a => a >= 10 ? "#4ade80" : a <= -10 ? "#f87171" : a >= 5 ? "#86efac" : "#6b7280";

  // Callers can pre-set p.color (z.B. Gruppen-Einfärbung im Tickers-Tab) und
  // damit die Accel-Farblogik umgehen — sonst greift wie bisher toColor(accel).
  pts.forEach(p => {
    p.x = toX(p.x3m); p.y = toY(p.y1m); p.r = toR(p.score);
    if (p.color === undefined) p.color = toColor(p.accel);
  });

  // opts.declutter: überlappende Bubbles minimal auseinanderschieben (siehe
  // resolveBubbleCollisions) — bewusst NUR wenn angefordert, damit Themes-
  // und Industry-Bubble-Charts exakt ihre bisherigen, datentreuen Positionen behalten.
  if (opts.declutter) {
    resolveBubbleCollisions(pts, { x0: PAD.left, x1: W - PAD.right, y0: PAD.top, y1: H - PAD.bottom });
  }

  const medX = toX(med3M).toFixed(1);
  const medY = toY(med1M).toFixed(1);

  // Axis tick lines + labels — tick count scales with plot size
  function axisTicks(axis) {
    const isX = axis === "x";
    const lo = isX ? lo3M : lo1M, hi = isX ? hi3M : hi1M;
    const n = isX ? Math.max(5, Math.min(12, Math.round(plotW / 160)))
                  : Math.max(5, Math.min(10, Math.round(plotH / 90)));
    return Array.from({length: n}, (_, i) => {
      const v = lo + (i / (n - 1)) * (hi - lo);
      const coord = isX ? toX(v).toFixed(1) : toY(v).toFixed(1);
      const lbl = `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
      return isX
        ? `<line x1="${coord}" y1="${H - PAD.bottom}" x2="${coord}" y2="${H - PAD.bottom + 4}" stroke="#4b5563" stroke-width="1"/>
           ${i === 0 ? "" : `<text x="${coord}" y="${H - PAD.bottom + 15}" text-anchor="middle" font-size="9" fill="#6b7280">${lbl}</text>`}`
        : `<line x1="${PAD.left - 4}" y1="${coord}" x2="${PAD.left}" y2="${coord}" stroke="#4b5563" stroke-width="1"/>
           <text x="${PAD.left - 6}" y="${parseFloat(coord) + 3}" text-anchor="end" font-size="9" fill="#6b7280">${lbl}</text>`;
    }).join("");
  }

  const circles = pts.map(p => {
    const groupTag = p.groups === undefined ? "" : ` data-groups="${esc(p.groups.join("||"))}"`;
    const inner = `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}"
        fill="${p.color}" fill-opacity="0.72" stroke="${p.color}" stroke-width="0.8"${groupTag}><title>${p.tip}</title></circle>`;
    return p.url ? `<a href="${p.url}" target="_blank" rel="noopener">${inner}</a>` : inner;
  }).join("");

  const labels = placeBubbleLabels(pts, {
    x0: PAD.left + 2, x1: W - PAD.right - 2,
    y0: PAD.top + 2,  y1: H - PAD.bottom - 2,
  });

  container.innerHTML = `
    <div class="bubble-chart-wrap">
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
        <!-- Grid background -->
        <rect x="${PAD.left}" y="${PAD.top}" width="${plotW}" height="${plotH}"
          fill="#0d1117" rx="4"/>
        <!-- Quadrant divider lines -->
        <line x1="${medX}" y1="${PAD.top}" x2="${medX}" y2="${H - PAD.bottom}"
          stroke="#374151" stroke-width="1" stroke-dasharray="5,4"/>
        <line x1="${PAD.left}" y1="${medY}" x2="${W - PAD.right}" y2="${medY}"
          stroke="#374151" stroke-width="1" stroke-dasharray="5,4"/>
        ${axisTicks("x")}${axisTicks("y")}
        <text x="${PAD.left + plotW / 2}" y="${H - 4}" text-anchor="middle"
          font-size="11" fill="#9ca3af">${xTf} Performance →</text>
        <text x="12" y="${PAD.top + plotH / 2}" text-anchor="middle" font-size="11"
          fill="#9ca3af" transform="rotate(-90,12,${PAD.top + plotH / 2})">1M Performance ↑</text>
        ${circles}
        ${labels}
      </svg>
      <div class="bubble-legend">${legendHtml ?? `
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#4ade80" fill-opacity="0.8"/></svg> Accel ≥ +10 (First Flag)</span>
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#86efac" fill-opacity="0.8"/></svg> Accel +5…+9</span>
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#6b7280" fill-opacity="0.8"/></svg> ${neutralLabel}</span>
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#f87171" fill-opacity="0.8"/></svg> Accel ≤ −10 (Extended/Cooling)</span>
        <span class="bubble-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="6" fill="#9ca3af" fill-opacity="0.5"/></svg> Größe = Stärke (Score)</span>
      `}</div>
    </div>`;

  wireBubbleGroupHighlight(container);
}

// ── "% Performance"-Schieberegler (Themes-, Industry- und Tickers-Bubble) ────
// Je Achse ein stufenloser Regler; sichtbar bleibt nur, was ÜBER dem
// Schwellwert liegt. Der Reglerbereich kommt aus den UNGEFILTERTEN Punkten,
// damit er beim Ziehen nicht mitschrumpft. Ganz links = kein Filter.
const PERF_FILTER_RENDER = {
  themes:  () => { if (_etfData) renderEtfThemes(_etfData); },
  ind:     () => { if (_lastIndustries) renderIndustryBubble(_lastIndustries); },
  tickers: () => renderTickersTab(),
};

function fmtPerfThreshold(v) {
  return v == null ? t("perfFilterAll") : `≥ ${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function initPerfFilters() {
  document.querySelectorAll("[data-perf-filter]").forEach(box => {
    const key = box.dataset.perfFilter;
    box.innerHTML = `
      <span class="xaxis-toggle-label perf-filter__title"></span>
      ${["x", "y"].map(axis => `
        <label class="perf-filter__axis">
          <span class="perf-filter__axis-name" data-axis-name="${axis}"></span>
          <input type="range" class="perf-filter__range" data-axis="${axis}" step="0.1">
          <span class="perf-filter__value" data-axis-value="${axis}"></span>
        </label>`).join("")}
      <button class="xaxis-btn perf-filter__reset"></button>`;
    box.querySelectorAll(".perf-filter__range").forEach(input => {
      input.addEventListener("input", () => {
        const v = parseFloat(input.value);
        _perfFilter[key][input.dataset.axis] = v <= parseFloat(input.min) ? null : v;
        PERF_FILTER_RENDER[key]();
      });
    });
    box.querySelector(".perf-filter__reset").addEventListener("click", () => {
      _perfFilter[key].x = null;
      _perfFilter[key].y = null;
      PERF_FILTER_RENDER[key]();
    });
  });
}

// Gleicht die Regler (Bereich, Wert, Beschriftung) an die aktuellen, noch
// ungefilterten Einträge an und gibt die gefilterten Einträge zurück.
// getX/getY lesen X- bzw. 1M-Performance aus einem Eintrag.
function applyPerfFilter(key, items, xTf, getX, getY) {
  const st = _perfFilter[key];
  if (st.xTf !== xTf) { st.x = null; st.xTf = xTf; }
  const box = document.querySelector(`[data-perf-filter="${key}"]`);
  if (box && box.querySelector(".perf-filter__range")) {
    box.querySelector(".perf-filter__title").textContent = t("perfFilterLabel");
    box.querySelector(".perf-filter__reset").textContent = t("perfFilterReset");
    const names = { x: xTf, y: "1M" };
    const getters = { x: getX, y: getY };
    ["x", "y"].forEach(axis => {
      const input = box.querySelector(`.perf-filter__range[data-axis="${axis}"]`);
      const vals = items.map(getters[axis]).filter(v => v != null);
      const lo = vals.length ? Math.floor(Math.min(...vals) * 10) / 10 : 0;
      const hi = vals.length ? Math.ceil(Math.max(...vals) * 10) / 10 : 0;
      input.min = lo;
      input.max = hi;
      // Neuer Datenbereich (z. B. anderer Tag, Not-Extended) -> Schwellwert klemmen
      if (st[axis] != null && st[axis] > hi) st[axis] = hi;
      if (st[axis] != null && st[axis] <= lo) st[axis] = null;
      input.value = st[axis] ?? lo;
      input.title = t("perfFilterTitle", names[axis]);
      box.querySelector(`[data-axis-name="${axis}"]`).textContent = `${axis.toUpperCase()} (${names[axis]})`;
      const valEl = box.querySelector(`[data-axis-value="${axis}"]`);
      valEl.textContent = fmtPerfThreshold(st[axis]);
      valEl.classList.toggle("perf-filter__value--on", st[axis] != null);
    });
    box.querySelector(".perf-filter__reset").disabled = st.x == null && st.y == null;
  }
  return items.filter(p =>
    (st.x == null || getX(p) >= st.x) && (st.y == null || getY(p) >= st.y));
}

function renderBubbleChart(data, themeAccel) {
  const container = document.getElementById("etf-bubble-view");
  const xTf = _themeBubbleXAxis;
  const pts = Object.entries(data.themes)
    .filter(([,r]) => r.perfs[xTf] !== null && r.perfs["1M"] !== null)
    .map(([theme, row]) => {
      const accel = themeAccel[theme] ?? 0;
      const accelSign = accel > 0 ? "+" : "";
      const pX = row.perfs[xTf] > 0 ? "+" : "";
      const p1 = row.perfs["1M"] > 0 ? "+" : "";
      return {
        x3m: row.perfs[xTf], y1m: row.perfs["1M"], score: row.score, accel,
        label: theme.length > 16 ? theme.slice(0, 14) + "…" : theme,
        tip: `${theme}\n${xTf}: ${pX}${row.perfs[xTf]?.toFixed(1)}%  1M: ${p1}${row.perfs["1M"]?.toFixed(1)}%\nAccel: ${accelSign}${accel}  |  Score: ${row.score.toFixed(1)}  |  ${(row.tickers||[]).length} Aktien`,
        url: themeScreenerUrl(theme),
      };
    });
  renderBubbleSvg(container, applyPerfFilter("themes", pts, xTf, p => p.x3m, p => p.y1m), "Neutral", xTf);
}

// --- Industry Bubble Chart (analogous to Theme bubble chart) ---
// Size = strength (composite score, lower = stronger). Color = stable Accel
// (rank3M - rank1M, from row.ranks — NOT the rank1W-based heatmap Accel column,
// which churns its #1 spot ~43% of days). Keeps strong industries visually
// prominent and on the radar even while consolidating (gray), not just while
// actively accelerating (green).
function renderIndustryBubble(industries) {
  const container = document.getElementById("ind-bubble-view");
  if (!container) return;
  const xTf = _indBubbleXAxis;
  let entries = Object.entries(industries)
    .filter(([,r]) => r.perfs[xTf] !== null && r.perfs["1M"] !== null);
  if (_instFilter) entries = entries.filter(([,r]) => isInst(r));

  const pts = entries.map(([name, row]) => {
    const accel = (row.ranks?.["3M"] ?? 0) - (row.ranks?.["1M"] ?? 0);
    const accelSign = accel > 0 ? "+" : "";
    const pX = row.perfs[xTf] > 0 ? "+" : "";
    const p1 = row.perfs["1M"] > 0 ? "+" : "";
    return {
      x3m: row.perfs[xTf], y1m: row.perfs["1M"], score: row.composite, accel,
      label: name.length > 16 ? name.slice(0, 14) + "…" : name,
      tip: `${name}\n${xTf}: ${pX}${row.perfs[xTf]?.toFixed(1)}%  1M: ${p1}${row.perfs["1M"]?.toFixed(1)}%\nAccel: ${accelSign}${accel}  |  Score: ${row.composite.toFixed(1)}`,
      url: finvizUrl(row.ticker),
    };
  });
  renderBubbleSvg(container, applyPerfFilter("ind", pts, xTf, p => p.x3m, p => p.y1m), "Neutral / Konsolidierung", xTf);
}

// Schwellwert für den "Not Extended"-Toggle: aus tickers.json (config.EXT_ATR_MAX),
// mit Fallback auf den Backend-Default, solange die Datei noch nicht geladen ist.
function tickersExtAtrMax() {
  return _tickersData?.config?.EXT_ATR_MAX ?? 7;
}

// Basisreihen des Tickers-Bubble-Charts, inkl. optionalem "Not Extended"-Filter.
function tickersFilteredRows() {
  const rows = _tickersData?.rows || [];
  if (!_tickersNotExtended) return rows;
  const maxAtr = tickersExtAtrMax();
  return rows.filter(r => r.ext_atr != null && r.ext_atr <= maxAtr);
}

// Ticker mit gültigen Werten für die aktuelle X-Achse (inkl. Not-Extended-
// Filter), noch OHNE "% Performance"-Schwellwerte — Basis für den Reglerbereich.
function tickersAxisRows() {
  const xTf = _tickersBubbleXAxis;
  return tickersFilteredRows()
    .filter(r => r.perfs?.[xTf] != null && r.perfs?.["1M"] != null && r.market_cap);
}

// Genau die Ticker, die der Bubble-Chart gerade zeichnet (Not-Extended-Filter
// + gültige Werte für die aktuelle X-Achse + "% Performance"-Schwellwerte) —
// einzige Quelle für Chart UND Copy-Button, damit beide nie auseinanderlaufen.
function tickersVisibleRows() {
  const xTf = _tickersBubbleXAxis;
  return applyPerfFilter("tickers", tickersAxisRows(), xTf, r => r.perfs[xTf], r => r.perfs["1M"]);
}

// Stabile Farbe je Theme/Industry-Gruppe. Themes nutzen die app-weite
// THEME_COLORS-Palette (dieselben Farben wie die Theme-Badges anderswo).
// Für Industries existiert keine feste Palette (144 mögliche Namen) — deshalb
// ein deterministischer Hash-zu-Hue: derselbe Name liefert über Tage/Reloads
// hinweg immer dieselbe Farbe, ohne 144 Farben von Hand pflegen zu müssen.
function groupColorFor(name, type) {
  if (type === "theme" && THEME_COLORS[name]) return THEME_COLORS[name].fg;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return `hsl(${hash % 360}, 65%, 60%)`;
}

// ── Tickers Bubble Chart (Einzelaktien aus den 1W∩1M-Top-Industries/-Themes) ──
// Datengrundlage: docs/tickers.json (ticker_metrics.py, einmal pro Handelstag,
// wie setups.json). Size = Market Cap (log-skaliert, größer = größere Bubble).
// Color = primäre Gruppe (erster Eintrag in r.groups, siehe ticker_metrics.
// build_universe: Industries vor Themes, je alphabetisch) — NICHT Accel, damit
// auf einen Blick sichtbar ist, aus welchem Theme/welcher Industry ein Ticker
// stammt. Gehört ein Ticker zu mehreren Gruppen, zeigt der Tooltip alle.
function renderTickersBubble() {
  const container = document.getElementById("tickers-bubble-view");
  if (!container || !_tickersData) return;
  const xTf = _tickersBubbleXAxis;
  const rows = tickersVisibleRows();

  // Rang "Xtf∩1M" je Gruppe: das SCHWÄCHERE (höhere) der beiden Einzelränge,
  // denn genau dieser Wert entscheidet, ob eine Gruppe überhaupt in die
  // Top-30-%-Schnittmenge fällt (siehe topIntersectionKeys) — niedriger =
  // tiefer/stabiler in der Schnittmenge, wie überall sonst Rang 1 = stärkstes.
  // Folgt der X-Achse des Charts: 1W-Ansicht rankt nach 1W∩1M, 3M-Ansicht
  // nach 1M∩3M — die Datengrundlage der Legende wechselt mit dem X-Achse-Toggle.
  // _lastIndustries/_etfData sind beim Rendern immer schon geladen (loadData()
  // füllt sie vor dem tickers.json-Fetch), Fallback auf {} nur zur Sicherheit.
  const rankMaps = {
    industry: {
      [xTf]: rankMapFor(Object.entries(_lastIndustries || {}), xTf),
      "1M": rankMapFor(Object.entries(_lastIndustries || {}), "1M"),
    },
    theme: {
      [xTf]: rankMapFor(Object.entries(_etfData?.themes || {}), xTf),
      "1M": rankMapFor(Object.entries(_etfData?.themes || {}), "1M"),
    },
  };
  const intersectionRank = (name, type) => {
    const rX = rankMaps[type]?.[xTf]?.[name];
    const r1m = rankMaps[type]?.["1M"]?.[name];
    return (rX == null || r1m == null) ? Infinity : Math.max(rX, r1m);
  };

  const groupColors = new Map(); // "type|name" -> {key, name, type, color, count, rank}
  const registerGroup = (g) => {
    const key = `${g.type}|${g.name}`;
    if (!groupColors.has(key)) {
      groupColors.set(key, {
        key, name: g.name, type: g.type, color: groupColorFor(g.name, g.type),
        count: 0, rank: intersectionRank(g.name, g.type),
      });
    }
    const entry = groupColors.get(key);
    entry.count++;
    return entry;
  };

  const pts = rows.map(r => {
    const groups = r.groups || [];
    // ALLE Gruppen registrieren (Legenden-Count = echte Mitgliederzahl, nicht
    // nur "Ticker, deren erste Gruppe das ist") — nur die Bubble-Farbe bleibt
    // bei der ersten/primären Gruppe, eine Bubble hat nur eine Füllfarbe.
    const entries = groups.map(g => registerGroup(g));
    const primaryColor = entries[0] ? entries[0].color : "#6b7280";
    const pX = r.perfs[xTf] > 0 ? "+" : "";
    const p1 = r.perfs["1M"] > 0 ? "+" : "";
    const capB = (r.market_cap / 1e9).toFixed(1);
    const extTxt = r.ext_atr != null ? `${r.ext_atr > 0 ? "+" : ""}${r.ext_atr} ATR` : "—";
    const groupNames = groups.map(g => g.name).join(", ") || "—";
    return {
      x3m: r.perfs[xTf], y1m: r.perfs["1M"],
      score: -Math.log10(Math.max(r.market_cap, 1)), // negativ: größere Cap -> kleinerer Score -> größere Bubble
      color: primaryColor,
      groups: entries.map(e => e.key), // ALLE Gruppen des Tickers -> Legenden-Hover/-Klick (wireBubbleGroupHighlight)
      label: r.t,
      tip: `${r.t}\n${xTf}: ${pX}${r.perfs[xTf]?.toFixed(1)}%  1M: ${p1}${r.perfs["1M"]?.toFixed(1)}%\nMarket Cap: $${capB} Mrd.  |  ATR%: ${r.atr_pct}%  |  Extension (SMA50): ${extTxt}\nGruppen: ${groupNames}`,
      url: finvizQuoteUrl(r.t),
    };
  });

  // Legende: eine Zeile je Gruppe, sortiert nach Rang "1W∩1M" (stärkste
  // Gruppe der Schnittmenge zuerst — Rang 1 = stärkstes, wie überall sonst
  // in der App), plus Größen-Hinweis.
  // data-group macht jede Zeile per Hover/Klick zum Filter (siehe wireBubbleGroupHighlight).
  const legendHtml = [...groupColors.values()]
    .sort((a, b) => a.rank - b.rank)
    .map(g => `<span class="bubble-legend-item" data-group="${esc(g.key)}"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="${g.color}" fill-opacity="0.85"/></svg> ${esc(g.name)} (${g.count})</span>`)
    .join("")
    + `<span class="bubble-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="6" fill="#9ca3af" fill-opacity="0.5"/></svg> Größe = Market Cap</span>`;

  renderBubbleSvg(container, pts, "Neutral", xTf, legendHtml, { declutter: true, sizeScale: 0.6 });
}

function renderTickersTab() {
  const meta = document.getElementById("tickers-meta");
  const notExtBtn = document.getElementById("tickers-notext-toggle");
  if (notExtBtn) notExtBtn.title = t("tickersNotExtTitle", tickersExtAtrMax());
  if (!meta) return;
  if (!_tickersData || !_tickersData.rows) {
    meta.textContent = t("tickersNoData");
    const container = document.getElementById("tickers-bubble-view");
    if (container) container.innerHTML = "";
    return;
  }
  const cfg = _tickersData.config || {};
  const cap = Math.round((cfg.MIN_MARKET_CAP ?? 1_000_000_000) / 1e9);
  const total = _tickersData.rows.length;
  const pf = _perfFilter.tickers;
  const filtered = _tickersNotExtended || pf.x != null || pf.y != null;
  const n = filtered ? `${tickersVisibleRows().length}/${total}` : `${total}`;
  meta.textContent = t("tickersMeta", n, cap, cfg.MIN_ATR_PCT ?? 4, cfg.ATR_WINDOW ?? 20, _tickersData.date);
  renderTickersBubble();
}

// ── RRG (Relative Rotation Graph) ───────────────────────────────────────────
// Vierter Viz-View der Themes. Statt absoluter Performance zwei relative Achsen:
//   x  RS-Ratio    = 3M-Perf minus Benchmark
//   y  RS-Momentum = (1M-Perf minus Benchmark) − RS-Ratio/3
//        → monatliches Relativtempo gegen das Quartals-Durchschnittstempo.
//        Bewusst aus den verschachtelten Fenstern EINES Tages gerechnet, nicht
//        als Δ des RS-Ratio über N Tage: letzteres bewegt den Punkt auch dann,
//        wenn hinten nur etwas aus dem 3M-Fenster herausfällt.
// Benchmark = Gleichgewichts-Querschnitt der Themes selbst. Ein Index steht
// nicht zur Verfügung (etf_perf.json führt SPY ohne Historie), der Querschnitt
// dagegen liegt in jedem Snapshot und gilt damit auch rückwirkend.
// Tail = Snapshot-Tage (nur settled), Kopfpunkt = Live-Daten.
const RRG_TAIL_DAYS = 10;   // ~2 Handelswochen
const RRG_COLORS = { improving: "#4ade80", leading: "#38bdf8", weakening: "#fbbf24", lagging: "#f87171" };
// Die beiden Schnittmengen-Buttons wirken im RRG als Filter. Mehrere aktive
// Filter werden VEREINIGT (eine Gruppe reicht in einer der Mengen), sonst würde
// der zweite Button die Auswahl immer nur verkleinern statt zu ergänzen.
const RRG_FILTERS = {
  "1W1M": { tfs: ["1W", "1M"], label: "1W∩1M" },
  "1M3M": { tfs: ["1M", "3M"], label: "1M∩3M" },
};

// Zwei Ausprägungen desselben Charts. Sie unterscheiden sich nur in Datenquelle,
// Snapshot-Typ, Größen-Kennzahl, Ziel-Link und den beiden Filter-Buttons —
// Achsen, Benchmark, Tails, Hover und Filterlogik sind identisch.
// Jede führt ihren eigenen Filter-Zustand: eine Auswahl in den Themes soll die
// Industries nicht mitfiltern.
const RRG_VIEWS = {
  theme: {
    containerId: "etf-rrg-view",
    rows: () => _etfData?.themes,
    size: (row) => row.score,
    url: (name) => themeScreenerUrl(name),
    filters: new Set(),
    axisXKey: "rrgAxisX",
    noun: "Themes",
    benchKey: "rrgLegendBench",
    btns: { "1W1M": "theme-top20i-btn", "1M3M": "theme-top20i2-btn" },
    // Die Theme-Buttons liegen in der Viz-Leiste und markieren außerhalb des
    // RRG Tabellenzeilen — dort dürfen sie den Filterzustand nicht anzeigen.
    btnsActive: () => _themeVizView === "rrg",
  },
  industry: {
    containerId: "ind-rrg-view",
    rows: () => _lastIndustries,
    size: (row) => row.composite,
    url: (name, row) => finvizUrl(row.ticker),
    filters: new Set(),
    axisXKey: "rrgAxisXInd",
    noun: "Industries",
    benchKey: "rrgLegendBenchInd",
    btns: { "1W1M": "ind-rrg-f1-btn", "1M3M": "ind-rrg-f2-btn" },
    btnsActive: () => true,
  },
};
const RRG_Q_KEY = { improving: "rrgQ1", leading: "rrgQ2", lagging: "rrgQ3", weakening: "rrgQ4" };

function rrgQuadrant(rs, mom) {
  if (rs >= 0) return mom >= 0 ? "leading" : "weakening";
  return mom >= 0 ? "improving" : "lagging";
}

// Ein Tag → Koordinaten aller Themes. Null, wenn der Querschnitt zu dünn ist,
// um als Benchmark zu taugen.
function rrgDayCoords(perfMap) {
  const rows = Object.entries(perfMap)
    .filter(([, p]) => typeof p?.["1M"] === "number" && typeof p?.["3M"] === "number");
  if (rows.length < 5) return null;
  const m1 = rows.reduce((a, [, p]) => a + p["1M"], 0) / rows.length;
  const m3 = rows.reduce((a, [, p]) => a + p["3M"], 0) / rows.length;
  const out = {};
  for (const [name, p] of rows) {
    const rs = p["3M"] - m3;
    out[name] = { rs, mom: (p["1M"] - m1) - rs / 3 };
  }
  return out;
}

// Pfad je Theme: älteste Snapshot-Tage zuerst, Live-Punkt zuletzt.
// Aufeinanderfolgende identische Punkte fallen raus — ein Snapshot ohne neue
// Finviz-Daten soll keinen toten Tail-Knoten erzeugen.
function computeRrgSeries(rows, kind) {
  const livePerfs = {};
  for (const [name, row] of Object.entries(rows)) {
    livePerfs[name] = { "1M": row.perfs?.["1M"] ?? null, "3M": row.perfs?.["3M"] ?? null };
  }
  const live = rrgDayCoords(livePerfs);
  if (!live) return null;

  const hist = [];
  for (const day of (_snapDays || []).filter(d => d.settled === true && d.perfs?.[kind]).slice(-RRG_TAIL_DAYS)) {
    const coords = rrgDayCoords(day.perfs[kind]);
    if (coords) hist.push(coords);
  }

  const series = {};
  for (const [name, head] of Object.entries(live)) {
    const path = [];
    const push = (p) => {
      const prev = path[path.length - 1];
      if (prev && Math.abs(prev.rs - p.rs) < 0.01 && Math.abs(prev.mom - p.mom) < 0.01) return;
      path.push({ rs: p.rs, mom: p.mom });
    };
    for (const coords of hist) if (coords[name]) push(coords[name]);
    push(head);
    series[name] = path;
  }
  return series;
}

// Tail als weiche Kurve statt Polygonzug: zentripetales Catmull-Rom (alpha =
// 0.5), umgerechnet in kubische Bezier-Segmente. Die Kurve läuft exakt durch
// jeden Datenpunkt — geglättet wird nur der Weg dazwischen, es wird also nichts
// erfunden. Zentripetal und nicht uniform, weil uniforme Splines bei eng
// beieinanderliegenden Tagen Schleifen und Überschwinger produzieren.
// Erwartet Bildschirmkoordinaten, damit die Glättung dem Seitenverhältnis folgt.
function rrgSmoothPath(pts) {
  if (pts.length < 2) return "";
  const xy = (p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  let d = `M${xy(pts[0])}`;
  if (pts.length === 2) return `${d} L${xy(pts[1])}`;
  const EPS = 1e-6;
  for (let i = 0; i < pts.length - 1; i++) {
    // An den Enden fällt der Kontrollpunkt auf den Randpunkt zurück —
    // dadurch startet und endet der Tail ohne künstlichen Ausschlag.
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? pts[i + 1];
    // d1..d3 tragen den Exponenten alpha bereits, quadriert ergibt das d^(2·alpha).
    const d1 = Math.max(Math.sqrt(Math.hypot(p1.x - p0.x, p1.y - p0.y)), EPS);
    const d2 = Math.max(Math.sqrt(Math.hypot(p2.x - p1.x, p2.y - p1.y)), EPS);
    const d3 = Math.max(Math.sqrt(Math.hypot(p3.x - p2.x, p3.y - p2.y)), EPS);
    const ctrl = (k) => [
      (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) / (3 * d1 * (d1 + d2)),
      (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) / (3 * d3 * (d3 + d2)),
    ];
    const [c1x, c2x] = ctrl("x"), [c1y, c2y] = ctrl("y");
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${xy(p2)}`;
  }
  return d;
}

// Aktiver Filter = Button sieht aktiv aus. Außerhalb des RRG sind die beiden
// Buttons einmalige Aktionen auf der Tabelle und tragen deshalb nie den Zustand.
function syncRrgFilterButtons() {
  for (const view of Object.values(RRG_VIEWS)) {
    const live = view.btnsActive();
    for (const key of Object.keys(RRG_FILTERS)) {
      document.getElementById(view.btns[key])?.classList.toggle("active", live && view.filters.has(key));
    }
  }
}

function toggleRrgFilter(kind, key) {
  const view = RRG_VIEWS[kind];
  if (view.filters.has(key)) view.filters.delete(key); else view.filters.add(key);
  syncRrgFilterButtons();
  renderRrgChart(kind);
}

function renderRrgChart(kind) {
  const view = RRG_VIEWS[kind];
  const container = document.getElementById(view.containerId);
  if (!container) return;
  const rows = view.rows();
  const series = rows ? computeRrgSeries(rows, kind) : null;
  if (!series) { container.innerHTML = `<p style="color:#6b7280;padding:16px">${t("etfNoData")}</p>`; return; }

  let pts = Object.entries(series).map(([name, path], i) => {
    const head = path[path.length - 1];
    const q = rrgQuadrant(head.rs, head.mom);
    const row = rows[name];
    const sgn = v => `${v > 0 ? "+" : ""}${v.toFixed(1)}`;
    return {
      name, path, rs: head.rs, mom: head.mom, quadrant: q, color: RRG_COLORS[q],
      score: view.size(row),
      // Numerische ID statt Name: verbindet Punkt, Tail und Label beim Hover,
      // ohne dass Sonderzeichen in den Namen escaped werden müssten.
      rrgId: i,
      label: name.length > 16 ? name.slice(0, 14) + "…" : name,
      tip: `${name}\n${t(RRG_Q_KEY[q])}\n`
         + t("rrgTip2", sgn(head.rs), sgn(head.mom),
             row.perfs["1M"]?.toFixed(1), row.perfs["3M"]?.toFixed(1)),
      url: view.url(name, row),
    };
  });

  // Filtern NACH dem Berechnen aller Koordinaten: der Benchmark bleibt der
  // Querschnitt aller Gruppen, die Punkte wandern durch den Filter also nicht.
  const total = pts.length;
  if (view.filters.size) {
    const entries = Object.entries(rows);
    const keep = new Set();
    for (const key of view.filters) {
      for (const name of topIntersectionKeys(entries, RRG_FILTERS[key].tfs)) keep.add(name);
    }
    pts = pts.filter(p => keep.has(p.name));
  }
  if (!pts.length) {
    container.innerHTML = `<p style="color:#6b7280;padding:16px">${t("rrgFilterEmpty")}</p>`;
    return;
  }

  const maxPathLen = Math.max(...pts.map(p => p.path.length));

  // Domain über ALLE gezeichneten Punkte, damit kein Tail aus dem Bild läuft.
  const shown = pts.flatMap(p => p.path);
  const xsAll = shown.map(p => p.rs), ysAll = shown.map(p => p.mom);
  const padX = (Math.max(...xsAll) - Math.min(...xsAll)) * 0.06 || 1;
  const padY = (Math.max(...ysAll) - Math.min(...ysAll)) * 0.08 || 1;
  const loX = Math.min(...xsAll) - padX, hiX = Math.max(...xsAll) + padX;
  const loY = Math.min(...ysAll) - padY, hiY = Math.max(...ysAll) + padY;

  const { W, H } = bubbleChartDims(container);
  const PAD = { top: 28, right: 36, bottom: 48, left: 58 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const toX = v => PAD.left + ((v - loX) / (hiX - loX)) * plotW;
  const toY = v => H - PAD.bottom - ((v - loY) / (hiY - loY)) * plotH;

  const scores = pts.map(p => p.score);
  const minScore = Math.min(...scores);
  const scoreRange = (Math.max(...scores) - minScore) || 1;
  // Kleiner als im Bubble-Chart: die Tails brauchen den Platz.
  const rMax = Math.max(12, Math.min(20, Math.round(Math.sqrt(plotW * plotH) / 48)));
  const rMin = Math.max(4, Math.round(rMax * 0.35));
  pts.forEach(p => {
    p.x = toX(p.rs); p.y = toY(p.mom);
    p.r = rMax - ((p.score - minScore) / scoreRange) * (rMax - rMin);
  });

  const zeroX = Math.min(Math.max(toX(0), PAD.left), W - PAD.right);
  const zeroY = Math.min(Math.max(toY(0), PAD.top), H - PAD.bottom);
  const quadRects = [
    { x: PAD.left, y: PAD.top, w: zeroX - PAD.left, h: zeroY - PAD.top, fill: RRG_COLORS.improving },
    { x: zeroX, y: PAD.top, w: W - PAD.right - zeroX, h: zeroY - PAD.top, fill: RRG_COLORS.leading },
    { x: PAD.left, y: zeroY, w: zeroX - PAD.left, h: H - PAD.bottom - zeroY, fill: RRG_COLORS.lagging },
    { x: zeroX, y: zeroY, w: W - PAD.right - zeroX, h: H - PAD.bottom - zeroY, fill: RRG_COLORS.weakening },
  ].map(q => `<rect x="${q.x.toFixed(1)}" y="${q.y.toFixed(1)}" width="${Math.max(0, q.w).toFixed(1)}"
      height="${Math.max(0, q.h).toFixed(1)}" fill="${q.fill}" fill-opacity="0.05"/>`).join("");

  const qLabels = [
    { x: PAD.left + 4,      y: PAD.top + 14,       key: "rrgQ1", fill: RRG_COLORS.improving },
    { x: W - PAD.right - 4, y: PAD.top + 14,       key: "rrgQ2", fill: RRG_COLORS.leading, anchor: "end" },
    { x: PAD.left + 4,      y: H - PAD.bottom - 6, key: "rrgQ3", fill: RRG_COLORS.lagging },
    { x: W - PAD.right - 4, y: H - PAD.bottom - 6, key: "rrgQ4", fill: RRG_COLORS.weakening, anchor: "end" },
  ].map(q => `<text x="${q.x}" y="${q.y}" font-size="10" fill="${q.fill}"
    text-anchor="${q.anchor || "start"}" style="pointer-events:none">${t(q.key)}</text>`).join("");

  function axisTicks(isX) {
    const lo = isX ? loX : loY, hi = isX ? hiX : hiY;
    const n = isX ? Math.max(5, Math.min(12, Math.round(plotW / 160)))
                  : Math.max(5, Math.min(10, Math.round(plotH / 90)));
    return Array.from({ length: n }, (_, i) => {
      const v = lo + (i / (n - 1)) * (hi - lo);
      const coord = isX ? toX(v).toFixed(1) : toY(v).toFixed(1);
      const lbl = `${v > 0 ? "+" : ""}${v.toFixed(1)}`;
      return isX
        ? `<line x1="${coord}" y1="${H - PAD.bottom}" x2="${coord}" y2="${H - PAD.bottom + 4}" stroke="#4b5563" stroke-width="1"/>
           ${i === 0 ? "" : `<text x="${coord}" y="${H - PAD.bottom + 15}" text-anchor="middle" font-size="9" fill="#6b7280">${lbl}</text>`}`
        : `<line x1="${PAD.left - 4}" y1="${coord}" x2="${PAD.left}" y2="${coord}" stroke="#4b5563" stroke-width="1"/>
           <text x="${PAD.left - 6}" y="${parseFloat(coord) + 3}" text-anchor="end" font-size="9" fill="#6b7280">${lbl}</text>`;
    }).join("");
  }

  // Tails vor den Köpfen zeichnen, damit kein Pfad über einem Punkt liegt.
  // Jedem Tail liegt ein unsichtbarer, breiter Pfad unter: 1,4 px Strichbreite
  // trifft man mit der Maus nicht.
  const tails = pts.filter(p => p.path.length > 1).map(p => {
    const d = rrgSmoothPath(p.path.map(q => ({ x: toX(q.rs), y: toY(q.mom) })));
    const nodes = p.path.slice(0, -1).map(q =>
      `<circle class="rrg-node" cx="${toX(q.rs).toFixed(1)}" cy="${toY(q.mom).toFixed(1)}" r="1.8"
        fill="${p.color}" fill-opacity="0.22" data-rrg="${p.rrgId}"/>`).join("");
    return `<path class="rrg-hit" d="${d}" fill="none" stroke="transparent" stroke-width="12"
        data-rrg="${p.rrgId}" style="pointer-events:stroke"/>
      <path d="${d}" fill="none" stroke="${p.color}" stroke-width="1.4" stroke-opacity="0.28"
      stroke-linejoin="round" stroke-linecap="round" data-rrg="${p.rrgId}"
      style="pointer-events:none"/>${nodes}`;
  }).join("");

  const circles = pts.map(p => {
    const inner = `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}"
        data-rrg="${p.rrgId}"
        fill="${p.color}" fill-opacity="0.72"
        stroke="${p.color}" stroke-width="0.8"><title>${p.tip}</title></circle>`;
    return p.url ? `<a href="${p.url}" target="_blank" rel="noopener">${inner}</a>` : inner;
  }).join("");

  const labels = placeBubbleLabels(pts, {
    x0: PAD.left + 2, x1: W - PAD.right - 2,
    y0: PAD.top + 2,  y1: H - PAD.bottom - 2,
  });

  const legendDot = (c, txt) =>
    `<span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="${c}" fill-opacity="0.8"/></svg> ${txt}</span>`;
  const tailNote = maxPathLen > 1
    ? legendDot("#9ca3af", t("rrgLegendTail", maxPathLen))
    : `<span class="bubble-legend-item">${t("rrgNoHistory")}</span>`;

  container.innerHTML = `
    <div class="bubble-chart-wrap">
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
        <rect x="${PAD.left}" y="${PAD.top}" width="${plotW}" height="${plotH}" fill="#0d1117" rx="4"/>
        ${quadRects}
        <line x1="${zeroX.toFixed(1)}" y1="${PAD.top}" x2="${zeroX.toFixed(1)}" y2="${H - PAD.bottom}"
          stroke="#4b5563" stroke-width="1"/>
        <line x1="${PAD.left}" y1="${zeroY.toFixed(1)}" x2="${W - PAD.right}" y2="${zeroY.toFixed(1)}"
          stroke="#4b5563" stroke-width="1"/>
        ${axisTicks(true)}${axisTicks(false)}
        <text x="${PAD.left + plotW / 2}" y="${H - 4}" text-anchor="middle"
          font-size="11" fill="#9ca3af">${t(view.axisXKey)}</text>
        <text x="12" y="${PAD.top + plotH / 2}" text-anchor="middle" font-size="11"
          fill="#9ca3af" transform="rotate(-90,12,${PAD.top + plotH / 2})">${t("rrgAxisY")}</text>
        ${qLabels}
        ${tails}
        ${circles}
        ${labels}
      </svg>
      <div class="bubble-legend">
        ${legendDot(RRG_COLORS.improving, t("rrgQ1"))}
        ${legendDot(RRG_COLORS.leading, t("rrgQ2"))}
        ${legendDot(RRG_COLORS.weakening, t("rrgQ4"))}
        ${legendDot(RRG_COLORS.lagging, t("rrgQ3"))}
        ${legendDot("#9ca3af", t("rrgLegendSize"))}
        ${tailNote}
        <span class="bubble-legend-item">${t(view.benchKey)}</span>
        ${view.filters.size ? `<span class="bubble-legend-item" style="color:#fbbf24">${
          t("rrgFilterNote", [...view.filters].map(k => RRG_FILTERS[k].label).join(" + "), pts.length, total, view.noun)
        }</span>` : ""}
      </div>
    </div>`;

  // Hover: das Theme unter der Maus samt Tail und Label hervorheben, alles
  // andere zurücknehmen. Delegiert statt 40× einzeln registriert — und über
  // mouseover statt mouseenter, damit der Wechsel Punkt ↔ eigener Tail nicht
  // erst löscht und dann neu setzt (das flackert).
  const svg = container.querySelector("svg");
  if (svg) {
    const marked = svg.querySelectorAll("[data-rrg]");
    const setActive = (id) => {
      svg.classList.toggle("rrg-hover", id !== null);
      marked.forEach(el => el.classList.toggle("rrg-on", el.dataset.rrg === id));
    };
    svg.addEventListener("mouseover", (e) => {
      const el = e.target.closest?.("[data-rrg]");
      setActive(el ? el.dataset.rrg : null);
    });
    svg.addEventListener("mouseleave", () => setActive(null));
  }
}

// Autoscale: re-render whichever bubble chart is currently visible when the
// window resizes, so the SVG keeps filling the viewport.
let _bubbleResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(_bubbleResizeTimer);
  _bubbleResizeTimer = setTimeout(() => {
    const ind = document.getElementById("ind-bubble-view");
    if (ind && ind.clientWidth > 0 && _lastIndustries) renderIndustryBubble(_lastIndustries);
    const etf = document.getElementById("etf-bubble-view");
    if (etf && etf.clientWidth > 0 && _etfData?.themes && _themeVizView === "bubble")
      renderBubbleChart(_etfData, _themeAccel);
    const rrg = document.getElementById("etf-rrg-view");
    if (rrg && rrg.clientWidth > 0 && _etfData?.themes && _themeVizView === "rrg")
      renderRrgChart("theme");
    const indRrg = document.getElementById("ind-rrg-view");
    if (indRrg && indRrg.clientWidth > 0 && _lastIndustries) renderRrgChart("industry");
    const tickers = document.getElementById("tickers-bubble-view");
    if (tickers && tickers.clientWidth > 0 && _tickersData) renderTickersBubble();
  }, 150);
});

function renderEtfTab() {
  if (!_etfData) return;
  if (_etfView === "themes") {
    document.getElementById("etf-themes-view").classList.remove("hidden");
    document.getElementById("etf-etfs-view").classList.add("hidden");
    renderEtfThemes(_etfData);
  } else {
    document.getElementById("etf-themes-view").classList.add("hidden");
    document.getElementById("etf-etfs-view").classList.remove("hidden");
    renderEtfList(_etfData);
  }
}

function initEtfViewToggle() {
  document.querySelectorAll(".etf-view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".etf-view-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      _etfView = btn.dataset.etfview;
      renderEtfTab();
    });
  });
}

function initThemeVizToggle() {
  document.querySelectorAll(".viz-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".viz-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      _themeVizView = btn.dataset.vizview;
      renderEtfThemes(_etfData);
    });
  });
}

function initBubbleXAxisToggles() {
  const wire = (containerId, initial, apply) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    // Statisches HTML markiert immer "3M" aktiv — hier auf den geladenen
    // Default (Cookie) angleichen, sonst zeigt der Button nach Reload den
    // falschen Stand, obwohl die Daten schon korrekt gerendert werden.
    container.querySelectorAll(".xaxis-btn").forEach(b => b.classList.toggle("active", b.dataset.xaxis === initial));
    container.querySelectorAll(".xaxis-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) return;
        container.querySelectorAll(".xaxis-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        apply(btn.dataset.xaxis);
      });
    });
  };
  wire("theme-bubble-xaxis-toggle", _themeBubbleXAxis, tf => { _themeBubbleXAxis = tf; renderEtfThemes(_etfData); });
  wire("ind-bubble-xaxis-toggle",   _indBubbleXAxis,   tf => { _indBubbleXAxis = tf; if (_lastIndustries) renderIndustryBubble(_lastIndustries); });
  wire("tickers-bubble-xaxis-toggle", _tickersBubbleXAxis, tf => { _tickersBubbleXAxis = tf; renderTickersTab(); });
}

function initEtfSortHeaders() {
  // Theme table sort
  document.querySelectorAll("#etf-themes-table thead th[data-etfcol]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const col = th.dataset.etfcol;
      if (_etfThemeSort.col === col) {
        _etfThemeSort.dir *= -1;
      } else {
        _etfThemeSort.col = col;
        _etfThemeSort.dir = (col === "score" || col === "theme") ? 1 : col === "accel" ? -1 : -1;
      }
      renderEtfThemes(_etfData);
    });
  });

  // Sub-themes table sort
  document.querySelectorAll("#etf-list-table thead th[data-etflistcol]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const col = th.dataset.etflistcol;
      if (_etfListSort.col === col) {
        _etfListSort.dir *= -1;
      } else {
        _etfListSort.col = col;
        _etfListSort.dir = (col === "score" || col === "label" || col === "theme") ? 1 : -1;
      }
      renderEtfList(_etfData);
    });
  });
}

// ── Setup-Tabs: First Flag / Base Breakout ────────────────────────────────
// Rechenkern: static/themeMetrics.js (einzige Implementierung der Stage-Logik;
// Schwellen NUR dort in THRESHOLDS). Snapshot-Shards docs/snapshots/YYYY-MM.json
// liefern Rohwerte; stage/daysInStage werden hier clientseitig abgeleitet.
let _TM = null;            // dynamisch importiertes themeMetrics-Modul
let _themeMetrics = null;  // { themeName: groupMetrics(...) } — einmal pro Datenladung
let _snapDays = null;      // Snapshot-Tage aufsteigend: {date, gap, settled, rowCount, stages}

async function ensureMetricsModule() {
  if (_TM) return _TM;
  try {
    // import() in klassischen Skripten löst relativ zur Skript-URL auf.
    _TM = await import("./themeMetrics.js?v=" + Date.now());
  } catch (e) {
    console.error("themeMetrics.js konnte nicht geladen werden:", e);
    _TM = null;
  }
  return _TM;
}

// Die letzten 5 Monats-Shards decken die 90 Handelstage ab, die daysInStage
// laut SPEC §5 braucht. Fehlende Shards (404, Historienbeginn) sind ok.
function snapshotShardNames(count = 5) {
  const names = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    names.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1, 1);
  }
  return names.reverse();
}

async function loadSnapshots() {
  const bust = `?t=${Date.now()}`;
  const shards = await Promise.all(snapshotShardNames().map(async (name) => {
    try {
      const res = await fetch(`snapshots/${name}.json${bust}`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  }));
  const days = [];
  for (const shard of shards) {
    if (!shard) continue;
    for (const [date, entry] of Object.entries(shard)) {
      const stages = {};
      // Roh-Perfs mitnehmen: der RRG-Tail braucht 1M/3M je Tag — für Themes
      // UND Industries, beide Ansichten lesen aus demselben Shard.
      const perfs = { theme: {}, industry: {} };
      const ranks = {};  // Theme-Rang je Tag (Leading-Stocks: rank_change_4w)
      for (const row of entry.rows) {
        if (row.type === "theme" && row.rank != null) ranks[row.name] = row.rank;
        if (!perfs[row.type]) continue;
        if (row.type === "theme" && _TM) {
          stages[row.name] = _TM.classifyStage(_TM.segments(row.perfs), row.accel);
        }
        perfs[row.type][row.name] = { "1M": row.perfs?.["1M"] ?? null, "3M": row.perfs?.["3M"] ?? null };
      }
      days.push({
        date, gap: entry.gap, settled: entry.settled,
        fetchedAt: entry.fetched_at, rowCount: entry.rows.length, stages, perfs, ranks,
      });
    }
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  _snapDays = days;
}

// DECISIONS §4, Schreibregel 2: erreicht die Zählung ein Loch (gap), ist der
// Wert null — ein ehrliches Loch statt erfundener Kontinuität.
function computeDaysInStage(name, liveStage) {
  if (!_snapDays || !_snapDays.length || !liveStage || liveStage === "UNKNOWN") return null;
  let count = 0;
  for (let i = _snapDays.length - 1; i >= 0; i--) {
    const day = _snapDays[i];
    const stage = day.stages[name];
    if (stage === undefined) return count || null;  // Theme fehlt an dem Tag
    if (stage !== liveStage) return count;
    count++;
    if (day.gap === true) return null;
    if (day.gap === null) return count;             // Beginn der Aufzeichnung
  }
  return count;
}

// Die eine Normalisierungsstelle: groupMetrics() genau einmal pro Datenladung.
function computeThemeMetrics() {
  _themeMetrics = null;
  if (!_TM || !_etfData?.themes) return;
  const entries = Object.entries(_etfData.themes);
  const accel = computeAccel(entries);
  _themeMetrics = {};
  for (const [name, row] of entries) {
    const m = _TM.groupMetrics({
      name, type: "theme", score: row.score, accel: accel[name],
      perfs: row.perfs, tickers: row.tickers ?? [],
    });
    m.rank = row.rank;
    m.daysInStage = computeDaysInStage(name, m.stage);
    _themeMetrics[name] = m;
  }
}

// Pflicht-Indikator (DECISIONS §4): ein still gestorbener Snapshot-Job ist der
// wahrscheinlichste Fehlermodus dieses Vorhabens.
function snapHealthHtml() {
  if (!_snapDays || !_snapDays.length) {
    return `<div class="snap-health snap-health--none">${t("snapNone")}</div>`;
  }
  const last = _snapDays[_snapDays.length - 1];
  const gaps = _snapDays.slice(-30).filter(d => d.gap === true).length;
  const locale = _lang === "de" ? "de-DE" : "en-US";
  const when = last.fetchedAt ? new Date(last.fetchedAt).toLocaleString(locale) : last.date;
  const note = last.settled ? "" : ` · ${t("snapNotSettled")}`;
  const cls = gaps > 0 ? " snap-health--warn" : "";
  return `<div class="snap-health${cls}">${t("snapLast", when, last.rowCount, gaps)}${note}</div>`;
}

function stageLabelHtml(stage) {
  if (!stage) return "—";
  return `<span class="stage-label stage-${stage.toLowerCase()}">${stage.replace("_", " ")}</span>`;
}

const fmtOrDash = (v, digits = 2) =>
  (v === null || v === undefined) ? "—" : v.toFixed(digits);

function segCell(v) {
  if (v === null || v === undefined) return `<span class="seg-cell">—</span>`;
  const cls = v > 0 ? "seg-pos" : v < 0 ? "seg-neg" : "";
  return `<span class="seg-cell ${cls}">${v > 0 ? "+" : ""}${v.toFixed(1)}</span>`;
}

function buildSetupGroups() {
  const entries = Object.entries(_etfData.themes);
  const accel = computeAccel(entries);
  return entries.map(([name, row]) => ({
    name, type: "theme", score: row.score, accel: accel[name],
    perfs: row.perfs, tickers: row.tickers ?? [], rank: row.rank,
  }));
}

// Export nach SPEC §4.4: aktive Tab-Auswahl mit vollen Kennzahlen-Feldern.
function exportSetupJson(result) {
  const pickPerfs = (name) => {
    const p = _etfData?.themes?.[name]?.perfs ?? {};
    return { "1W": p["1W"], "1M": p["1M"], "3M": p["3M"], "6M": p["6M"], "YTD": p["YTD"] };
  };
  const rows = [...result.qualified, ...result.nearMiss].map(r => ({
    type: "theme",
    name: r.name,
    score: r.score,
    accel: r.accel,
    ranks: { overall: r.rank },
    perfs: pickPerfs(r.name),
    segments: r.segments,
    damage: r.damage,
    freshness: r.freshness,
    stage: r.stage,
    daysInStage: r.daysInStage,
    density: r.density,
    breadth: r.breadth,
    breadthDelta: r.breadthDelta,
    concentration: r.concentration,
    qualified: r.qualified,
    failed: r.failed.map(c => c.key),
    tickers: _etfData?.themes?.[r.name]?.tickers ?? [],
  }));
  exportSelectionJson(rows);
}

function setupCriterionText(c) {
  const fmt = (v) => v === null || v === undefined ? t("nv")
    : typeof v === "number" ? v.toFixed(2) : String(v);
  return t("setupFailsFmt", c.label, fmt(c.actual), c.required);
}

function renderSetupTab(tab, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!_TM || !_themeMetrics || !_etfData?.themes) {
    container.innerHTML = `<div class="error">${t("setupMetricsFail")}</div>`;
    return;
  }
  const isFF = tab === _TM.TAB.FIRST_FLAG;
  const result = _TM.buildTab(buildSetupGroups(), tab);
  [result.qualified, result.nearMiss, result.rejected].forEach(list =>
    list.forEach(r => { r.daysInStage = _themeMetrics[r.name]?.daysInStage ?? null; }));

  const fBand = _TM.THRESHOLDS.freshness;
  const unknown = result.rejected.filter(r => r.stage === _TM.STAGE.UNKNOWN);

  const headRow = (extraCol = "") => `<tr>
    <th>#</th><th style="text-align:left">Theme</th><th data-i18n="colStage">${t("colStage")}</th>
    <th>${t("colDensity")}</th><th>${t("colAccel")}</th><th>1M</th>
    <th>${t("colFreshness")}</th><th>${t("colDays")}</th><th>${t("colSegments")}</th>${extraCol}
  </tr>`;

  // Kopier-Button nur, wenn die Gruppe überhaupt Ticker mitbringt.
  const rowCopyBtn = (name) => tickersOf("theme", name).length
    ? `<button class="ind-copy-btn" data-scope="theme" data-key="${esc(name)}" title="${esc(t("copyGroupTitle"))}">📋</button>`
    : "";

  const bodyRow = (r, idx, extraCell = "", rowCls = "") => {
    const accelStr = r.accel === null ? "—" : (r.accel > 0 ? `+${r.accel}` : `${r.accel}`);
    const accelCls = r.accel > 0 ? "accel-pos" : r.accel < 0 ? "accel-neg" : "accel-neu";
    const freshOut = r.freshness !== null && (r.freshness < fBand.min || r.freshness > fBand.max);
    const daysCls = r.daysInStage !== null && r.daysInStage <= 4 ? "days-green" : "";
    const tip = [
      `${t("setupTipDamage")}: ${fmtOrDash(r.damage, 1)}`,
      `${t("setupTipBreadth")}: ${r.breadth === null ? t("nv") : fmtOrDash(r.breadth, 0) + " %"}`,
      `${t("setupTipConc")}: ${r.concentration === null ? t("nv") : fmtOrDash(r.concentration)}`,
      `Score: ${fmtOrDash(r.score, 1)}`,
    ].join(" · ");
    const density = r.density === null
      ? `<span class="nv">${t("nv")}</span>`
      : `${r.density.toFixed(0)} %`;
    return `<tr class="${rowCls}" title="${esc(tip)}">
      <td>${idx + 1}</td>
      <td style="text-align:left" class="setup-name-cell">${themeBadge(r.name)}${rowCopyBtn(r.name)}</td>
      <td>${stageLabelHtml(r.stage)}</td>
      <td>${density}</td>
      <td class="${accelCls}">${accelStr}</td>
      <td class="${perfClass(r.segments.m1)}">${fmtPct(r.segments.m1)}</td>
      <td class="${freshOut ? "fresh-out" : ""}">${fmtOrDash(r.freshness)}</td>
      <td class="${daysCls}">${r.daysInStage === null ? "—" : r.daysInStage}</td>
      <td>${segCell(r.segments.m4_6)} ${segCell(r.segments.m2_3)} ${segCell(r.segments.m1)}</td>
      ${extraCell}
    </tr>`;
  };

  const qualifiedHtml = result.qualified.length
    ? `<div class="table-scroll"><table class="setup-table">
        <thead>${headRow()}</thead>
        <tbody>${result.qualified.map((r, i) => bodyRow(r, i)).join("")}</tbody>
      </table></div>`
    : `<div class="setup-empty">${isFF ? t("setupEmptyFF") : t("setupEmptyBB")}
        ${result.nearMiss.length ? `<br>${t("setupEmptyNear")}` : ""}</div>`;

  const nearMissHtml = result.nearMiss.length
    ? `<div class="table-scroll"><table class="setup-table">
        <thead>${headRow(`<th style="text-align:left">${t("colFailsAt")}</th>`)}</thead>
        <tbody>${result.nearMiss.map((r, i) =>
          bodyRow(r, i, `<td style="text-align:left" class="fails-at">${esc(setupCriterionText(r.failed[0]))}</td>`)
        ).join("")}</tbody>
      </table></div>`
    : `<div class="setup-empty setup-empty--sub">—</div>`;

  const unknownHtml = unknown.length
    ? `<div class="setup-section">
        <div class="setup-section-hdr">${t("setupUnknown")}
          <span class="setup-count">${t("setupGroups", unknown.length)} · ${t("setupUnknownHint")}</span></div>
        <div class="setup-unknown-list">${unknown.map(r =>
          `<span class="setup-unknown-item">${themeBadge(r.name)} ${stageLabelHtml(r.stage)}</span>`).join(" ")}</div>
      </div>`
    : "";

  // Sammel-Button nur, wenn in der Liste überhaupt etwas zu kopieren ist.
  const copyAllBtn = (list, cls) => list.some(r => tickersOf("theme", r.name).length)
    ? `<button class="setup-copyall-btn ${cls}" title="${esc(t("copyAllTitle"))}">${t("copyAllBtn")}</button>`
    : "";

  container.innerHTML = `
    ${snapHealthHtml()}
    <div class="setup-section">
      <div class="setup-section-hdr">${t("setupQualified")}
        <span class="setup-count">${t("setupGroups", result.qualified.length)}</span>
        ${copyAllBtn(result.qualified, "setup-copyall-btn--qualified")}
        <button class="selection-bar__export-btn setup-export-btn">${t("exportJson")}</button>
      </div>
      ${qualifiedHtml}
    </div>
    <details class="setup-nearmiss"${result.qualified.length ? "" : " open"}>
      <summary class="setup-section-hdr">▸ ${t("setupNearMiss")}
        <span class="setup-count">${t("setupGroups", result.nearMiss.length)}</span>
        ${copyAllBtn(result.nearMiss, "setup-copyall-btn--nearmiss")}</summary>
      ${nearMissHtml}
    </details>
    ${unknownHtml}`;

  const exportBtn = container.querySelector(".setup-export-btn");
  if (exportBtn) exportBtn.onclick = () => exportSetupJson(result);

  wireIndCopyButtons(container);

  // Der Near-Miss-Button sitzt im <summary>; ohne stopPropagation klappt das <details> zu.
  [[".setup-copyall-btn--qualified", result.qualified],
   [".setup-copyall-btn--nearmiss", result.nearMiss]].forEach(([sel, list]) => {
    const btn = container.querySelector(sel);
    if (btn) btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      copyGroupsAsSections(btn, list.map(r => ({ name: r.name, scope: "theme" })));
    };
  });
}

// ── Experimental Tab ──────────────────────────────────────────────────────
// Stufe 0 = Finviz-Link-Filter (fvScreenerUrl oben, wirkt app-weit).
// Stufe 1 = gerechneter Setup-Screener aus docs/setups.json (setups.py).
// Beides bewusst getrennt vom Rest: hier stehen unvalidierte Schwellen.

let _setupsData = null;
let _expView    = "table";     // "table" | "charts"
let _expScope   = "trade";     // "ready" | "trade" | "all"
let _expSort    = { col: "score", dir: -1 };

const EXP_MAX_CHARTS = 48;     // Mini-Charts pro Ansicht (Ladezeit/Finviz-Last)

// Markierung für den Clipboard-Export. Der Top-30%-Button markiert die besten
// TOP_PCT der aktuellen Ansicht nach Score — gleicher Anteil wie die ★-Buttons
// in Industry/Themes. Früher fester Schwellwert Score >= 80 (≈ 20 %).
let _expSelected = new Set();

const EXP_COLS = [
  { col: "t",         key: "expColTicker",  left: true },
  { col: "verdict",   key: "expColVerdict", left: true },
  { col: "score",     key: "expColSetupSc", tip: "expTipScore" },
  { col: "dist",      key: "expColDist",    tip: "expTipDist" },
  { col: "base_days", key: "expColBase" },
  { col: "tight",     key: "expColTight",   tip: "expTipTight" },
  { col: "dryup",     key: "expColDry",     tip: "expTipDry" },
  { col: "rvol",      key: "expColRvol",    tip: "expTipRvol" },
  { col: "adr",       key: "expColAdr" },
  { col: "perf1m",    key: "expCol1M" },
  { col: "price",     key: "expColPrice" },
  { col: "groups",    key: "expColGroup",   left: true, nosort: true },
];

// Score der letzten Zeile innerhalb der Top TOP_PCT der aktuellen Ansicht
// (unabhängig von der gewählten Tabellen-Sortierung). null = keine Zeilen.
function expTopMinScore() {
  const scores = expRows().map(r => r.score).filter(v => v != null).sort((a, b) => b - a);
  if (!scores.length) return null;
  return scores[Math.max(1, Math.ceil(scores.length * TOP_PCT)) - 1];
}

function expRows() {
  const rows = _setupsData?.rows ?? [];
  const scoped = _expScope === "ready" ? rows.filter(r => r.verdict === "READY")
    : _expScope === "trade" ? rows.filter(r => r.verdict === "READY" || r.verdict === "BREAKOUT")
    : rows;
  const { col, dir } = _expSort;
  return [...scoped].sort((a, b) => {
    const x = a[col], y = b[col];
    if (typeof x === "string" || typeof y === "string") {
      return String(x ?? "").localeCompare(String(y ?? "")) * dir;
    }
    return ((x ?? -Infinity) - (y ?? -Infinity)) * dir;
  });
}

function expGroupsHtml(groups) {
  return (groups ?? []).slice(0, 2).map(g => {
    // Industry-Slug steht in data.json (ticker), Theme-Slug leitet
    // themeScreenerUrl selbst ab — beide Badges sind damit klickbar.
    const url = g.type === "theme"
      ? themeScreenerUrl(g.name)
      : finvizUrl(_lastIndustries?.[g.name]?.ticker ?? "");
    const label = `<span class="wp-type wp-type--${g.type}">${esc(g.name)}</span>`;
    return url ? `<a href="${url}" target="_blank" rel="noopener">${label}</a>` : label;
  }).join(" ");
}

function expBubbleXAxisHtml() {
  const btn = (tf) => `
    <button class="exp-mode-btn${_bubbleXAxisDefault === tf ? " exp-mode-btn--active" : ""}"
            data-bubblexaxis="${tf}">${t("expBubbleX" + tf)}</button>`;
  return `
    <div class="exp-block">
      <div class="setup-section-hdr">${t("expBubbleXTitle")}</div>
      <p class="exp-desc">${t("expBubbleXDesc")}</p>
      <div class="exp-modes">
        ${btn("3M")}
        ${btn("1W")}
      </div>
    </div>`;
}

function expStage0Html() {
  const strongest = Object.entries(_lastIndustries ?? {})
    .sort((a, b) => a[1].composite - b[1].composite)[0];
  const sample = strongest ? finvizUrl(strongest[1].ticker) : "";
  const btn = (mode, label, desc) => `
    <button class="exp-mode-btn${_fvMode === mode ? " exp-mode-btn--active" : ""}"
            data-fvmode="${mode}" title="${esc(desc)}">${label}</button>`;
  const modeKey = { off: "Off", setup: "Setup", wide: "Wide", strength: "Strength" }[_fvMode] ?? "Off";

  return `
    <div class="exp-block">
      <div class="setup-section-hdr">${t("expS0Title")}
        <span class="setup-count">${t("expUnvalidated")}</span></div>
      <p class="exp-desc">${t("expS0Desc")}</p>
      <div class="exp-modes">
        ${btn("off",      t("expS0Off"),      t("expS0OffDesc"))}
        ${btn("setup",    t("expS0Setup"),    t("expS0SetupDesc"))}
        ${btn("wide",     t("expS0Wide"),     t("expS0WideDesc"))}
        ${btn("strength", t("expS0Strength"), t("expS0StrengthDesc"))}
      </div>
      <p class="exp-mode-desc">${t("expS0" + modeKey + "Desc")}</p>
      <div class="exp-modes exp-sorts">
        <span class="exp-sort-label">${t("expSortLabel")}</span>
        ${Object.entries(FV_SORTS).map(([key, s]) => `
          <button class="exp-mode-btn${fvActiveSort() === key ? " exp-mode-btn--active" : ""}"
                  data-fvsort="${key}" title="${esc(t(s.descKey))}">${t(s.labelKey)}</button>`).join("")}
      </div>
      <p class="exp-mode-desc">${t(FV_SORTS[fvActiveSort()].descKey)}</p>
      ${sample ? `<p class="exp-sample">${t("expS0Preview")}
        <a href="${sample}" target="_blank" rel="noopener">${esc(strongest[0])} →</a>
        <code>${esc(sample.replace("https://finviz.com/screener.ashx?", ""))}</code></p>` : ""}
      <p class="exp-note">${t("expBaseline")}</p>
    </div>`;
}

// Offenlegung der Universums-Auswahl: welche Gruppen mit welchen Zahlen
// hineingekommen sind — und was dabei bewusst NICHT geprüft wird.
function expUniverseHtml() {
  const u = _setupsData?.universe;
  if (!u) return "";
  const cfg = _setupsData?.config ?? {};
  const thm = u.themes ?? [];
  const pool = u.pool ?? {};
  const tfs = cfg.THEME_TIMEFRAMES ?? ["1W", "1M", "3M"];

  const row = (g) => `<tr>
      <td class="exp-th-left">
        <a href="${themeScreenerUrl(g.name)}" target="_blank" rel="noopener">
          <span class="wp-type wp-type--theme">${esc(g.name)}</span></a></td>
      <td class="exp-th-left exp-univ-tfs">${(g.tfs ?? [])
        .map(tf => `<span class="exp-univ-tf">${tf}</span>`).join("")}</td>
      ${tfs.map(tf => `<td class="${perfClass(g.perfs?.[tf])}">${fmtPct(g.perfs?.[tf])}</td>`).join("")}
      <td>${fmtOrDash(g.score, 2)}</td>
      <td>${g.tickers}</td>
    </tr>`;

  return `
    <details class="setup-nearmiss wp-details exp-universe">
      <summary class="setup-section-hdr">▸ ${t("expUnivTitle")}
        <span class="setup-count">${t("expUnivCount", thm.length, pool.themes ?? 0)}</span></summary>
      <p class="exp-desc">${t("expUnivThemeRule", cfg.N_THEMES_PER_TF ?? 5, tfs.join(" · "))}</p>
      <p class="exp-note exp-univ-warn">${t("expUnivNotUsed")}</p>
      <div class="table-scroll"><table class="setup-table exp-table">
        <thead><tr>
          <th class="exp-th-left">${t("expColTheme")}</th>
          <th class="exp-th-left">${t("expUnivColVia")}</th>
          ${tfs.map(tf => `<th>${tf}</th>`).join("")}
          <th>${t("colScore")}</th><th>${t("expUnivColTickers")}</th>
        </tr></thead>
        <tbody>${thm.map(row).join("")}</tbody>
      </table></div>
      <p class="exp-note">${t("expUnivFootnote", u.tickers ?? 0, u.with_bars ?? 0)}</p>
    </details>`;
}

function expStage1Html() {
  const hdr = `<div class="setup-section-hdr">${t("expS1Title")}
      <span class="setup-count">${t("expUnvalidated")}</span></div>
    <p class="exp-desc">${t("expS1Desc")}</p>
    <p class="exp-note">${t("expBaseline")}</p>`;

  if (!_setupsData) return `<div class="exp-block">${hdr}<div class="setup-empty">${t("expS1NoData")}</div></div>`;

  const u = _setupsData.universe ?? {};
  const c = _setupsData.counts ?? {};
  const stamp = _setupsData.fetched_at
    ? new Date(_setupsData.fetched_at).toLocaleString(_lang === "de" ? "de-DE" : "en-US")
    : "—";
  const chip = (v) => `<span class="exp-chip exp-chip--${v.toLowerCase()}">${v} ${c[v] ?? 0}</span>`;
  const scopeBtn = (scope, label) => `
    <button class="exp-scope-btn${_expScope === scope ? " exp-scope-btn--active" : ""}"
            data-expscope="${scope}">${label}</button>`;
  const viewBtn = (view, label) => `
    <button class="exp-scope-btn${_expView === view ? " exp-scope-btn--active" : ""}"
            data-expview="${view}">${label}</button>`;

  const rows = expRows();
  const body = _expView === "charts" ? expChartsHtml(rows) : expTableHtml(rows);
  // Nur markierte Zeilen zählen, die in der aktuellen Ansicht auch sichtbar
  // sind — kopiert wird später genau diese Schnittmenge.
  const selCount = rows.filter(r => _expSelected.has(r.t)).length;

  return `
    <div class="exp-block">
      ${hdr}
      <div class="exp-meta">
        <span>${t("updated")}${stamp}</span>
        <span class="exp-chip exp-chip--eod" title="${esc(t("expEodNote"))}">${t("expEod")}</span>
        <span>${t("expS1Universe", u.tickers ?? 0, (u.themes ?? []).length)}</span>
        ${chip("READY")}${chip("BREAKOUT")}${chip("WATCH")}${chip("EXTENDED")}
      </div>
      ${expUniverseHtml()}
      <div class="exp-toolbar">
        ${scopeBtn("ready", t("expOnlyReady"))}${scopeBtn("trade", t("expTradeable"))}${scopeBtn("all", t("expAll"))}
        <span class="exp-toolbar-sep"></span>
        ${viewBtn("table", t("expViewTable"))}${viewBtn("charts", t("expViewCharts"))}
        <button class="exp-top20-btn${selCount ? " exp-top20-btn--active" : ""}"
                title="${esc(t("expTop20Title"))}">★ ${t("expTop20")}</button>
        ${selCount ? `<span class="exp-selcount">${t("expSelCount", selCount)}</span>` : ""}
        <button class="setup-copyall-btn exp-copy-btn" title="${esc(t("expCopyTitle"))}">${t("expCopyBtn")}</button>
      </div>
      ${body}
    </div>`;
}

function expTableHtml(rows) {
  if (!rows.length) return `<div class="setup-empty">${t("expS1Empty")}</div>`;

  const head = EXP_COLS.map(c => {
    const active = _expSort.col === c.col ? (_expSort.dir === 1 ? " ▲" : " ▼") : "";
    const info = c.tip ? ` <span class="col-info" title="${esc(t(c.tip))}">i</span>` : "";
    const cls = `${c.left ? "exp-th-left" : ""}${c.nosort ? "" : " exp-th-sort"}`.trim();
    const attr = c.nosort ? "" : ` data-expcol="${c.col}"`;
    return `<th class="${cls}"${attr}>${t(c.key)}${active}${info}</th>`;
  }).join("");

  const body = rows.map(r => `
    <tr class="exp-row${_expSelected.has(r.t) ? " exp-row--selected" : ""}" data-exprow="${esc(r.t)}">
      <td class="exp-th-left"><a class="exp-ticker" href="${finvizQuoteUrl(r.t)}" target="_blank" rel="noopener">${esc(r.t)}</a></td>
      <td class="exp-th-left"><span class="exp-chip exp-chip--${r.verdict.toLowerCase()}">${t("expVerdict" + r.verdict)}</span>
        <span class="exp-reason">${t("expReason_" + r.reason)}</span></td>
      <td><b>${r.score}</b></td>
      <td class="${r.dist > 0 ? "perf-2" : ""}">${r.dist > 0 ? "+" : ""}${fmtOrDash(r.dist, 1)}</td>
      <td>${r.base_days}</td>
      <td>${fmtOrDash(r.tight)}</td>
      <td>${fmtOrDash(r.dryup)}</td>
      <td>${fmtOrDash(r.rvol)}</td>
      <td>${fmtOrDash(r.adr, 1)}</td>
      <td class="${perfClass(r.perf1m)}">${fmtPct(r.perf1m)}</td>
      <td>${fmtOrDash(r.price)}</td>
      <td class="exp-th-left">${expGroupsHtml(r.groups)}</td>
    </tr>`).join("");

  return `<div class="table-scroll"><table class="setup-table exp-table">
    <thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function expChartsHtml(rows) {
  if (!rows.length) return `<div class="setup-empty">${t("expS1Empty")}</div>`;
  const shown = rows.slice(0, EXP_MAX_CHARTS);

  // referrerpolicy="no-referrer": Finviz liefert die Chart-PNGs an einen
  // normalen Browser aus, ein fremder Referer kann geblockt werden. Schlägt
  // ein Bild trotzdem fehl, bleibt die Karte mit Link zum Chart stehen.
  const cards = shown.map(r => `
    <figure class="exp-chart${_expSelected.has(r.t) ? " exp-chart--selected" : ""}" data-exprow="${esc(r.t)}">
      <figcaption>
        <a class="exp-ticker" href="${finvizQuoteUrl(r.t)}" target="_blank" rel="noopener">${esc(r.t)}</a>
        <span class="exp-chip exp-chip--${r.verdict.toLowerCase()}">${t("expVerdict" + r.verdict)}</span>
        <span class="exp-chart-nums">${r.score} · ${r.dist > 0 ? "+" : ""}${fmtOrDash(r.dist, 1)}% · ${r.base_days}T</span>
      </figcaption>
      <!-- Theme-Herkunft wie in der Tabellenspalte "Revier", damit die
           Chart-Ansicht dieselbe Zuordnung zeigt. Badges sind klickbar. -->
      <div class="exp-chart-groups">${expGroupsHtml(r.groups)}</div>
      <a href="${finvizQuoteUrl(r.t)}" target="_blank" rel="noopener">
        <img src="${finvizChartUrl(r.t)}" alt="${esc(r.t)}" loading="lazy" referrerpolicy="no-referrer"
             onerror="this.closest('.exp-chart').classList.add('exp-chart--failed')">
      </a>
    </figure>`).join("");

  const more = rows.length > shown.length
    ? `<p class="exp-note">+${rows.length - shown.length} ${_lang === "de" ? "weitere in der Tabellenansicht" : "more in the table view"}</p>`
    : "";
  return `<p class="exp-note">${t("expChartsHint")}</p><div class="exp-charts">${cards}</div>${more}`;
}

function renderExperimental() {
  const box = document.getElementById("exp-container");
  if (!box) return;
  box.innerHTML = expBubbleXAxisHtml() + expStage0Html() + expStage1Html();

  // Stufe-0-Schalter: wirkt app-weit, also alles neu zeichnen, was Links baut.
  const rerenderLinkViews = () => {
    if (_lastPayload) renderAll(_lastPayload);
    if (_etfData) renderEtfTab();
    renderSetupTabs();
      renderExperimental();
  };

  box.querySelectorAll("[data-bubblexaxis]").forEach(btn => {
    btn.onclick = () => {
      const tf = btn.dataset.bubblexaxis;
      if (tf === _bubbleXAxisDefault) return;
      _bubbleXAxisDefault = tf;
      prefSet("bubbleXAxisDefault", tf);
      _themeBubbleXAxis = tf;
      _indBubbleXAxis = tf;
      document.querySelectorAll("#theme-bubble-xaxis-toggle .xaxis-btn, #ind-bubble-xaxis-toggle .xaxis-btn")
        .forEach(b => b.classList.toggle("active", b.dataset.xaxis === tf));
      if (_etfData) renderEtfThemes(_etfData);
      if (_lastIndustries) renderIndustryBubble(_lastIndustries);
      renderExperimental();
    };
  });

  box.querySelectorAll("[data-fvmode]").forEach(btn => {
    btn.onclick = () => {
      _fvMode = btn.dataset.fvmode;
      prefSet("fvMode", _fvMode);
      rerenderLinkViews();
    };
  });

  box.querySelectorAll("[data-fvsort]").forEach(btn => {
    btn.onclick = () => {
      _fvSort = btn.dataset.fvsort;
      prefSet("fvSort", _fvSort);
      rerenderLinkViews();
    };
  });

  box.querySelectorAll("[data-expscope]").forEach(btn => {
    btn.onclick = () => { _expScope = btn.dataset.expscope; renderExperimental(); };
  });
  box.querySelectorAll("[data-expview]").forEach(btn => {
    btn.onclick = () => { _expView = btn.dataset.expview; renderExperimental(); };
  });
  box.querySelectorAll("[data-expcol]").forEach(th => {
    th.onclick = () => {
      const col = th.dataset.expcol;
      _expSort = _expSort.col === col
        ? { col, dir: -_expSort.dir }
        : { col, dir: col === "t" ? 1 : -1 };
      renderExperimental();
    };
  });

  // Zeile anklicken = markieren. Klick auf einen Link (Ticker, Revier-Badge)
  // bleibt Navigation und markiert nicht.
  box.querySelectorAll("[data-exprow]").forEach(el => {
    el.onclick = (ev) => {
      if (ev.target.closest("a")) return;
      const tk = el.dataset.exprow;
      if (_expSelected.has(tk)) _expSelected.delete(tk); else _expSelected.add(tk);
      renderExperimental();
    };
  });

  // Top 30 % = die besten TOP_PCT der aktuellen Ansicht nach Score; Gleichstand
  // an der Grenze kommt mit (Score >= Score der Cutoff-Zeile).
  // Sind die schon alle markiert, hebt ein zweiter Klick die Markierung auf.
  const topBtn = box.querySelector(".exp-top20-btn");
  if (topBtn) topBtn.onclick = () => {
    const minScore = expTopMinScore();
    const hits = minScore === null ? [] : expRows().filter(r => r.score >= minScore);
    const allSet = hits.length > 0 && hits.every(r => _expSelected.has(r.t));
    if (allSet) hits.forEach(r => _expSelected.delete(r.t));
    else hits.forEach(r => _expSelected.add(r.t));
    renderExperimental();
    if (!allSet) showToast(t("expTop20Marked", hits.length, minScore));
  };

  // Kopiert die Markierung (Schnittmenge mit der Ansicht); ohne Markierung
  // die komplette Ansicht. Format: kommagetrennt = TradingView-Import.
  const copyBtn = box.querySelector(".exp-copy-btn");
  if (copyBtn) copyBtn.onclick = () => {
    const rows = expRows();
    const sel = rows.filter(r => _expSelected.has(r.t));
    const tickers = (sel.length ? sel : rows).map(r => r.t);
    navigator.clipboard.writeText(tickers.join(",")).then(() => {
      flashDone(copyBtn);
      showToast(t(sel.length ? "expCopiedSel" : "expCopied", tickers.length));
    });
  };
}

function renderSetupTabs() {
  if (!_TM) return;
  renderSetupTab(_TM.TAB.FIRST_FLAG, "firstflag-container");
  renderSetupTab(_TM.TAB.BASE_BREAKOUT, "basebreak-container");
}

// ── Regime-Gate Badge (Modul A) ───────────────────────────────────────────
// Datenquelle: docs/regime.json (vom Scraper geschrieben, letzter Eintrag zählt).
// Design: docs/superpowers/plans/2026-07-02-regime-gate-theme-id-empfehlung.md
let _regimeData = null;

function fmtSma(v) {
  if (v === null || v === undefined) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}

function renderRegime() {
  const badge = document.getElementById("regime-badge");
  if (!badge) return;
  const r = _regimeData;
  if (!r) {
    badge.classList.add("hidden");
    return;
  }

  const inputsMissing = r.t1 === null || r.t2 === null || r.b1 === null;
  const stale = r.b1_stale || inputsMissing;
  const state = r.state;

  let cls, label;
  if (!state)                    { cls = "regime-stale";   label = t("regimeUnknown"); }
  else if (stale)                { cls = "regime-stale";   label = t("regimeStale"); }
  else if (state === "RISK_ON")  { cls = "regime-on";      label = "RISK-ON"; }
  else if (state === "NEUTRAL")  { cls = "regime-neutral"; label = "NEUTRAL"; }
  else                           { cls = "regime-off";     label = "RISK-OFF"; }

  const check = v => v === true ? "✓" : v === false ? "✗" : "?";
  const lines = [
    t("regimeTipTitle", r.date),
    `T1  QQQ > SMA20: ${check(r.t1)} (${fmtSma(r.qqq_sma20)})`,
    `T2  QQQ > SMA50: ${check(r.t2)} (${fmtSma(r.qqq_sma50)})`,
    `B1  T2108 Breadth: ${r.b1 != null ? r.b1 + "%" : "—"} (${t("regimeTipBreadth", r.b1_date ?? "—")})`,
    `IWM: SMA20 ${fmtSma(r.iwm_sma20)} · SMA50 ${fmtSma(r.iwm_sma50)}`,
  ];
  if (state === "RISK_ON")       lines.push(t("regimeEffectOn"));
  else if (state === "NEUTRAL")  lines.push(t("regimeEffectNeutral"));
  else if (state === "RISK_OFF") lines.push(t("regimeEffectOff"));
  if (inputsMissing)   lines.push(t("regimeTipNoData"));
  else if (r.b1_stale) lines.push(t("regimeTipStale"));
  if (state && stale)  lines.push(`(eingefroren: ${state})`);
  lines.push(t("regimeTipFooter"));

  badge.className = "regime-badge " + cls;
  badge.textContent = label;
  badge.title = lines.join("\n");
}

// ── Situational-Awareness-Ampel (Stockbee) ────────────────────────────────
// Datenquelle: regime.json → letzter Eintrag → "sa"-Block (vom Scraper).
// Spec: docs/superpowers/specs/2026-07-12-situational-awareness-design.md
const SA_STATES = [
  { key: "OVERSOLD", cls: "sa-oversold", label: "Oversold Bounce likely", body: "saOversoldBody", action: "saOversoldAction" },
  { key: "GREEN",  cls: "sa-green",  label: "Breakouts Work", body: "saGreenBody",  action: "saGreenAction" },
  { key: "YELLOW", cls: "sa-yellow", label: "Be Selective",   body: "saYellowBody", action: "saYellowAction" },
  { key: "RED",    cls: "sa-red",    label: "Breakouts Fail", body: "saRedBody",    action: "saRedAction" },
];

function renderSituational() {
  const badge = document.getElementById("sa-badge");
  if (!badge) return;
  const r = _regimeData;
  const sa = r?.sa;
  if (!sa) { badge.classList.add("hidden"); return; }

  const state  = sa.state;                       // GREEN | YELLOW | RED | null
  const stale  = r.b1_stale === true;
  const active = SA_STATES.find(s => s.key === state);

  let cls, label;
  if (!active)    { cls = "sa-stale"; label = t("saUnknown"); }
  else if (stale) { cls = "sa-stale"; label = t("saStale"); }
  else            { cls = active.cls; label = active.label; }

  const fmtRatio = v => v == null ? "—" : v.toFixed(2);
  const t2108Trend = (sa.t2108 != null && sa.t2108_avg5 != null)
    ? (sa.t2108 > sa.t2108_avg5 ? `↑ ${t("saRising")}` : `↓ ${t("saFalling")}`)
    : "";

  const cards = SA_STATES.map(s => `
    <div class="sa-tip-card ${s.cls} ${s === active && !stale ? "active" : ""}">
      <div class="sa-tip-head"><span class="sa-dot ${s.cls}"></span>${s.label}</div>
      <div class="sa-tip-body">${t(s.body).replace(/\n/g, "<br>")}</div>
      <div class="sa-tip-action">${t(s.action)}</div>
    </div>`).join("");

  const vals = [
    [t("saValRatio5"),  fmtRatio(sa.ratio5d)],
    [t("saValRatio10"), fmtRatio(sa.ratio10d)],
    ["T2108", sa.t2108 != null ? `${sa.t2108}% ${t2108Trend}` : "—"],
    [t("saVal4pct"), (sa.up4 != null && sa.down4 != null) ? `${sa.up4} / ${sa.down4}` : "—"],
  ].map(([k, v]) => `<div class="sa-tip-val"><span>${k}</span><span>${v}</span></div>`).join("");

  const notes = [];
  if (!state)     notes.push(t("saTipNoData"));
  else if (stale) notes.push(t("saTipStale"));

  badge.className = "sa-badge " + cls;
  badge.innerHTML = `
    <span class="sa-dot ${cls}"></span><span class="sa-label">${label}</span>
    <div class="sa-tooltip">
      <div class="sa-tip-title">${t("saTipTitle", sa.date ?? "—")}</div>
      <div class="sa-tip-intro">${t("saTipIntro")}</div>
      ${cards}
      <div class="sa-tip-vals">${vals}</div>
      ${notes.map(n => `<div class="sa-tip-note">${n}</div>`).join("")}
      <div class="sa-tip-foot">${t("saRule")}</div>
    </div>`;
  badge.classList.remove("hidden");
}

initTabs();
initSortHeaders();
initInstToggle();
initTickersNotExtendedToggle();
initTickersCopyButton();
initSectionHints();
initPeriodSelector();
initViewToggle();
initEtfViewToggle();
initEtfSortHeaders();
initThemeVizToggle();
initBubbleXAxisToggles();
initPerfFilters();
initTop20Buttons();

// --- Load data ---
// ── Leading Stocks Tab ──────────────────────────────────────────────────────
// Rechenkern: static/leadersMetrics.js, Schwellen: static/config.js.
// Daten: data/leaders_bars.json + data/theme_constituents.json (leaders.py,
// einmal pro Handelstag nach Close). Lazy: erst beim Öffnen des Tabs geladen,
// die Kursdatei ist ~2 MB. Liest Theme-Daten nur (Rang/Score aus etf_data.json,
// Rang-Historie aus den Snapshots) — bestehende Tabs bleiben unberührt.
let _LM = null;               // leadersMetrics-Modul
let _LCFG = null;             // LEADERS aus config.js
let _leadersBars = null;
let _leadersCons = null;
let _leadersLoad = null;      // laufendes Promise (Doppelklick-Schutz)
let _leadersFailed = false;
let _leadersCache = {};       // atrPeriod -> computeLeaders()-Ergebnis
let _leadersUi = null;        // {sort, topN, minDvol, minAtr, atrPeriod, wlView, wlMode, ta, chartSize}
let _leadersChartWidth = null;
let _leadersLog = {};          // data/watchlist_log/*.json — {date: {tickers, rs, …}} // Containerbreite beim letzten Chart-Rendern (Resize-Erkennung)

async function ensureLeadersData() {
  if (_leadersBars && _LM) return true;
  if (_leadersFailed) return false;
  if (!_leadersLoad) {
    _leadersLoad = (async () => {
      try {
        const v = Date.now();
        // Dieselbe URL wie der Import in leadersMetrics.js, damit config.js
        // genau einmal geladen wird.
        const [lm, cfg] = await Promise.all([
          import("./leadersMetrics.js?v=" + v),
          import("./config.js"),
        ]);
        const bust = `?t=${v}`;
        const [bRes, cRes] = await Promise.all([
          fetch("data/leaders_bars.json" + bust),
          fetch("data/theme_constituents.json" + bust),
        ]);
        if (!bRes.ok || !cRes.ok) { _leadersFailed = true; return; }
        _leadersBars = await bRes.json();
        _leadersCons = await cRes.json();
        // Watchlist-Protokoll fuer "neu seit letztem Freitag": Datenmonat + Vormonat
        const last = _leadersBars.dates[_leadersBars.dates.length - 1];
        const d = new Date(last.slice(0, 7) + "-15T12:00:00Z");
        const prev = new Date(d); prev.setUTCMonth(prev.getUTCMonth() - 1);
        const shards = await Promise.all([prev, d].map(async (m) => {
          try {
            const r = await fetch(`data/watchlist_log/${m.toISOString().slice(0, 7)}.json${bust}`);
            return r.ok ? await r.json() : {};
          } catch { return {}; }
        }));
        _leadersLog = Object.assign({}, ...shards);
        _LM = lm;
        _LCFG = cfg.LEADERS;
        const num = (k, d) => { const x = Number(prefGet(k)); return prefGet(k) !== null && Number.isFinite(x) ? x : d; };
        const per = prefGet("leadAtrPeriod");
        _leadersUi = {
          sort: ["group_rs", "score", "breadth"].includes(prefGet("leadSort")) ? prefGet("leadSort") : _LCFG.DEFAULT_SORT,
          topN: num("leadTopN", _LCFG.TOP_N),
          minDvol: num("leadMinDvol", _LCFG.MIN_DOLLAR_VOL),
          minAtr: num("leadMinAtr", _LCFG.MIN_ATR_PCT),
          atrPeriod: _LCFG.ATR_PERIODS[per] ? per : _LCFG.ATR_PERIOD,
          wlView: ["all", "strong", "inplay", "ep", "new"].includes(prefGet("leadWlView")) ? prefGet("leadWlView") : "all",
          wlMode: prefGet("leadWlMode") === "charts" ? "charts" : "table",
          ta: prefGet("leadTa") === "1",
          weekly: prefGet("leadTf") === "w",
          ema: prefGet("leadEma") === "1",
          chartSize: _LCFG.CHARTS.SIZES[prefGet("leadChartSize")] ? prefGet("leadChartSize") : _LCFG.CHARTS.DEFAULT_SIZE,
        };
      } catch (e) {
        console.error("Leading Stocks konnte nicht geladen werden:", e);
        _leadersFailed = true;
      }
    })();
  }
  await _leadersLoad;
  return !!(_leadersBars && _LM);
}

function leadersResult() {
  const key = _leadersUi.atrPeriod;
  if (!_leadersCache[key]) {
    _leadersCache[key] = _LM.computeLeaders(
      _leadersBars, _leadersCons, _etfData.themes, _snapDays || [], { atrPeriod: key });
  }
  return _leadersCache[key];
}

// Sichtbare Themes inkl. gefilterter Zeilen — Grundlage für Tabelle UND Export.
function leadersVisibleThemes() {
  const ui = _leadersUi;
  return _LM.orderThemes(leadersResult(), ui.sort).slice(0, ui.topN).map(t => ({
    ...t, rows: _LM.filterRows(t.rows, { minDollarVol: ui.minDvol, minAtrPct: ui.minAtr }),
  }));
}

const leadNa = () => `<span class="lead-na">n/a</span>`;
function leadNum(v, digits = 1, suffix = "", signed = true) {
  if (v === null || v === undefined || !Number.isFinite(v)) return leadNa();
  const cls = !signed ? "" : v > 0 ? "lead-pos" : v < 0 ? "lead-neg" : "";
  const txt = (signed && v > 0 ? "+" : "") + v.toFixed(digits) + suffix;
  return cls ? `<span class="${cls}">${txt}</span>` : txt;
}
function leadDvol(v) {
  if (v === null || v === undefined) return leadNa();
  if (v >= 1e9) return (v / 1e9).toFixed(1) + (_lang === "de" ? " Mrd" : "B");
  return Math.round(v / 1e6) + (_lang === "de" ? " Mio" : "M");
}
function leadDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return _lang === "de" ? `${d}.${m}.` : `${m}/${d}`;
}
// "×N" = Finviz führt den Ticker in N Themes (nur bei N > 1).
function leadMulti(tv) {
  const n = _leadersCons?.memberships?.[tv];
  return n > 1 ? ` <span class="lead-multi" title="${esc(t("leadMultiTitle", n))}">×${n}</span>` : "";
}

function leadInfo(key) {
  const col = t("leadCols")[key];
  const ev = _LCFG.EVIDENCE[key] || "convention";
  const tip = `${col[0]}: ${col[1]} · ${t("leadEvidenceLabel")}: ${t("leadEvidence")[ev]}`;
  return `<span class="lead-info lead-ev--${ev}" data-key="${key}" title="${esc(tip)}" tabindex="0">i</span>`;
}

// Setup-Urteil je Ticker aus setups.json (Experimental-Tab). Fehlt ein Ticker,
// ist er nicht im Screener-Universum oder OUT/EXTENDED — beides heißt "—".
function leadSetupMap() {
  const m = {};
  for (const r of _setupsData?.rows ?? []) m[r.t] = r.verdict;
  return m;
}
const leadSym = (tv) => (tv.includes(":") ? tv.split(":")[1] : tv);

// Leader-Watchlist (Performer Study): jeder qualifizierte Ticker einmal.
function leadersWatchlist() {
  const ui = _leadersUi;
  return _LM.buildWatchlist(leadersResult(), { minDollarVol: ui.minDvol, minAtrPct: ui.minAtr });
}
function leadersWatchlistShown(list) {
  const v = _leadersUi.wlView;
  return list.filter(e => v === "strong" ? e.strong : v === "inplay" ? e.trigger === true
    : v === "ep" ? e.ep === true : v === "new" ? e.is_new === true : true);
}

// Vergleich mit dem letzten Freitag (Wochen-Prep-Stand). Verglichen wird die
// UNGEFILTERTE Watchlist mit dem ungefilterten Protokoll — UI-Filter sollen
// keine Namen als "neu" erscheinen lassen.
function leadersWeekDiff() {
  const ref = _LM.weekReference(_leadersLog, leadersDataDate());
  if (!ref) return null;
  const all = _LM.buildWatchlist(leadersResult()).map(e => e.ticker);
  return { date: ref.date, ..._LM.diffWatchlist(all, ref.tickers) };
}

function leadersDiffHtml(diff) {
  if (!diff) {
    const first = Object.keys(_leadersLog).sort()[0];
    return `<p class="lead-dim lead-wl__criteria">${t("leadNoRef", first ? leadDate(first) : null)}</p>`;
  }
  const out = diff.removed.length
    ? ` · <span title="${esc(diff.removed.join(", "))}">−${diff.removed.length} ${t("leadRemoved")}: ${esc(diff.removed.map(leadSym).join(", "))}</span>`
    : "";
  return `<p class="lead-wl__criteria lead-diff">${t("leadDiffHead", leadDate(diff.date))} <b class="lead-new">+${diff.added.length} ${t("leadNewWord")}</b>${out}</p>`;
}

function leadersWatchlistHtml() {
  const ui = _leadersUi, W = _LCFG.WL;
  if (!_leadersBars.rs_universe) {
    return `<div class="lead-wl"><p class="pick-empty">${t("leadWlNoUniverse")}</p></div>`;
  }
  const list = leadersWatchlist();
  const diff = leadersWeekDiff();
  if (!diff && ui.wlView === "new") ui.wlView = "all";
  const added = new Set(diff?.added ?? []);
  for (const e of list) e.is_new = diff ? added.has(e.ticker) : null;
  const shown = leadersWatchlistShown(list);
  const n = {
    all: list.length, strong: list.filter(e => e.strong).length,
    inplay: list.filter(e => e.trigger === true).length, ep: list.filter(e => e.ep === true).length,
    new: list.filter(e => e.is_new === true).length,
  };
  const segItems = [["all", t("leadWlAll")], ["strong", `RS ≥ ${W.RS_STRONG}`], ["inplay", t("leadWlInPlay")], ["ep", t("leadWlEp")]];
  if (diff) segItems.push(["new", t("leadWlNew")]);
  const seg = segItems
    .map(([k, label]) => `<button class="xaxis-btn${ui.wlView === k ? " active" : ""}" data-lwl="${k}">${label} <span class="lead-count">${n[k]}</span></button>`).join("");
  const setups = leadSetupMap();
  const cols = ["rs_rating", "best_theme", "p6m", "wl_dist", "rmv", "rvol_50d", "trigger", "ep", "setup", "atr_pct", "dollar_vol_50d"];
  const head = `<th>#</th><th>Ticker</th>` + cols.map(k =>
    `<th>${t("leadCols")[k][0]}${k === "atr_pct" ? ` ${ui.atrPeriod}` : ""} ${leadInfo(k)}</th>`).join("");
  const body = shown.length ? shown.map((e, i) => {
    const sym = leadSym(e.ticker);
    const trig = e.trigger === null ? leadNa() : e.trigger
      ? `<span class="lead-pos" title="RVOL ${e.rvol_50d?.toFixed(1) ?? "n/a"} · Gap ${e.gap_pct?.toFixed(1) ?? "n/a"} %">▲ ${t("leadTrigYes")}</span>${e.weak_volume ? ` <span class="lead-warn">${t("leadTrigWeak")}</span>` : ""}`
      : "—";
    const ep = e.ep === null ? leadNa() : e.ep ? `<span class="lead-ep">⚡ ${leadDate(e.ep_date)}</span>` : "—";
    const setup = setups[sym] ? `<span class="lead-setup lead-setup--${setups[sym].toLowerCase()}">${setups[sym]}</span>`
      : `<span class="lead-dim" title="${esc(t("leadSetupNone"))}">—</span>`;
    const rmv = e.rmv === null ? leadNa()
      : `<span class="${e.rmv < _LCFG.RMV.CONTRACTION_MAX ? "lead-pos" : ""}">${e.rmv.toFixed(2)}</span>`;
    const chips = e.themes.slice(0, 2).map(th =>
      `<span class="lead-theme-chip${th.leader ? " lead-theme-chip--leader" : ""}">${th.leader ? "★ " : ""}${esc(th.name)} #${th.rank ?? "–"}</span>`).join("");
    const more = e.themes.length > 2
      ? ` <span class="lead-dim" title="${esc(e.themes.slice(2).map(th => `${th.name} #${th.rank}`).join(" · "))}">+${e.themes.length - 2}</span>` : "";
    return `<tr class="${e.trigger === true ? "lead-wl-row--inplay" : ""}">
      <td>${i + 1}</td>
      <td><a href="${finvizQuoteUrl(sym.replace(".", "-"))}" target="_blank" rel="noopener" class="lead-sym">${esc(e.ticker)}</a>${leadMulti(e.ticker)}${e.is_new ? ` <span class="lead-new-badge">${t("leadNewBadge")}</span>` : ""}</td>
      <td>${e.strong ? `<b class="lead-rs-strong">${e.rs_rating}</b>` : e.rs_rating}</td>
      <td class="lead-theme-cell">${chips}${more}</td>
      <td>${leadNum(e.p6m, 0, " %")}</td>
      <td>${leadNum(e.dist_52wh_pct, 1, " %")}</td>
      <td>${rmv}</td>
      <td>${e.rvol_50d === null ? leadNa() : e.rvol_50d.toFixed(1) + "×"}</td>
      <td>${trig}</td>
      <td>${ep}</td>
      <td>${setup}</td>
      <td>${leadNum(e.atr_pct, 1, "", false)}</td>
      <td>${leadDvol(e.dollar_vol_50d)}</td>
    </tr>`;
  }).join("") : `<tr><td colspan="13" class="empty-msg">${t("leadWlEmpty")}</td></tr>`;

  const mode = [["table", t("leadWlTable")], ["charts", t("leadWlCharts")]]
    .map(([k, label]) => `<button class="xaxis-btn${ui.wlMode === k ? " active" : ""}" data-lwlmode="${k}">${label}</button>`).join("");
  const grp = (label, btns) => `<span class="lead-group lead-chartbar__grp"><span class="lead-chartbar__label">${label}</span>${btns}</span>`;
  const chartBar = ui.wlMode !== "charts" ? "" : `<div class="lead-chartbar">
      ${grp(t("leadBarSize"), Object.keys(_LCFG.CHARTS.SIZES).map(k =>
        `<button class="xaxis-btn${ui.chartSize === k ? " active" : ""}" data-lsize="${k}" title="${esc(t("leadSizeTitle")[k])}">${k}</button>`).join(""))}
      ${grp(t("leadBarTf"), ["d", "w"].map(k =>
        `<button class="xaxis-btn${(ui.weekly ? "w" : "d") === k ? " active" : ""}" data-ltf="${k}" title="${esc(t("leadTfTitle")[k])}">${t("leadTfLabel")[k]}</button>`).join(""))}
      ${grp(t("leadBarOverlay"),
        `<button class="inst-toggle-btn${ui.ema ? " active" : ""}" data-lema="1" title="${esc(t("leadEmaTitle"))}">EMA 8/20</button>`
        + `<button class="inst-toggle-btn${ui.ta ? " active" : ""}" data-lta="1" title="${esc(t("leadTaTitle"))}">📐 Technical Analysis</button>`)}
    </div>`;
  return `<div class="lead-wl">
    <div class="lead-wl__head">
      <span class="lead-name">${t("leadWlTitle")}</span>
      <span class="lead-group">${seg}</span>
      <span class="lead-group lead-actions">
        ${mode}
        <button class="top20-btn lead-copy-btn" title="${esc(t("leadCopyTitle"))}">${t("leadCopy")}</button>
        <button class="top20-btn lead-tv-btn" title="${esc(t("leadWatchlistTitle"))}">${t("leadWatchlist")}</button>
      </span>
    </div>
    ${chartBar}
    <p class="lead-dim lead-wl__criteria">${t("leadWlCriteria", W)}</p>
    ${leadersDiffHtml(diff)}
    ${ui.wlMode === "charts" ? leadersChartsHtml(shown, setups)
      : `<div class="table-scroll"><table class="lead-table lead-wl-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`}
  </div>`;
}

// Pixelgroesse der Chart-Bilder fuer die gewaehlte Groesse: gleiche Spalten-
// rechnung wie das CSS-Raster (auto-fill, minmax), Bild = Kartenbreite.
// Bei S bleibt das alte feste Format (null).
const LEAD_CHART_GAP = 12, LEAD_CHART_PAD = 18;
function leadersChartSize() {
  const C = _LCFG.CHARTS, key = _leadersUi.chartSize, sz = C.SIZES[key];
  if (key === "S") return null;
  const box = document.getElementById("leaders-container");
  const avail = Math.max(280, (box?.clientWidth || 1000) - 30);   // Innenabstand der Watchlist-Box
  const width = Math.min(avail, sz.max ?? Infinity);
  const min = Math.min(sz.min, width);
  const cols = Math.max(1, Math.floor((width + LEAD_CHART_GAP) / (min + LEAD_CHART_GAP)));
  let w = Math.round((width - LEAD_CHART_GAP * (cols - 1)) / cols - LEAD_CHART_PAD);
  w = Math.min(Math.max(w, C.MIN_W), C.MAX_W);
  let h = Math.max(Math.round(w / C.ASPECT), C.MIN_H);
  if (w * h > C.MAX_AREA) h = Math.floor(C.MAX_AREA / w);
  return { w, h, range: C.RANGE };
}

// Lehnt Finviz die freie Groesse ab, einmal auf das Standardformat
// (466 x 219) zurueckfallen; erst wenn auch das scheitert, "chart n/a".
function leadChartFallback(img) {
  const fb = img.dataset.fallback;
  if (fb) {
    img.removeAttribute("data-fallback");
    img.removeAttribute("width"); img.removeAttribute("height");
    img.src = fb;
    return;
  }
  img.closest(".exp-chart")?.classList.add("exp-chart--failed");
}

// Mini-Charts der angezeigten Watchlist — Kartenformat wie im Experimental-Tab.
function leadersChartsHtml(list, setups) {
  if (!list.length) return `<p class="pick-empty">${t("leadWlEmpty")}</p>`;
  const ta = _leadersUi.ta;
  const size = leadersChartSize();
  const opts = { weekly: _leadersUi.weekly, ema: _leadersUi.ema, range: _leadersUi.weekly ? _LCFG.CHARTS.RANGE_W : undefined };
  _leadersChartWidth = document.getElementById("leaders-container")?.clientWidth ?? null;
  const cards = list.map((e, i) => {
    const sym = leadSym(e.ticker).replace(".", "-");
    const tags = [
      e.strong ? `<span class="lead-rs-strong">RS ${e.rs_rating}</span>` : `<span>RS ${e.rs_rating}</span>`,
      e.trigger ? `<span class="lead-pos">▲ ${t("leadTrigYes")}</span>` : "",
      e.ep ? `<span class="lead-ep">⚡ EP ${leadDate(e.ep_date)}</span>` : "",
      setups[leadSym(e.ticker)] ? `<span class="lead-setup lead-setup--${setups[leadSym(e.ticker)].toLowerCase()}">${setups[leadSym(e.ticker)]}</span>` : "",
    ].filter(Boolean).join(" ");
    const themes = e.themes.slice(0, 2).map(th =>
      `<span class="lead-theme-chip${th.leader ? " lead-theme-chip--leader" : ""}">${th.leader ? "★ " : ""}${esc(th.name)} #${th.rank ?? "–"}</span>`).join("")
      + (e.themes.length > 2 ? ` <span class="lead-dim" title="${esc(e.themes.slice(2).map(th => `${th.name} #${th.rank}`).join(" · "))}">+${e.themes.length - 2}</span>` : "");
    return `<figure class="exp-chart lead-chart${e.trigger ? " lead-chart--inplay" : ""}">
      <figcaption>
        <span class="lead-dim">${i + 1}</span>
        <a class="exp-ticker" href="${finvizQuoteUrl(sym)}" target="_blank" rel="noopener">${esc(e.ticker)}</a>${leadMulti(e.ticker)}${e.is_new ? ` <span class="lead-new-badge">${t("leadNewBadge")}</span>` : ""}
        ${tags}
        <span class="exp-chart-nums">${leadNum(e.p6m, 0, " %")} 6M · ${e.dist_52wh_pct.toFixed(1)} %</span>
      </figcaption>
      <div class="exp-chart-groups">${themes}</div>
      <a href="${finvizQuoteUrl(sym)}${ta ? "&ta=1" : ""}" target="_blank" rel="noopener">
        <img src="${finvizChartUrl(sym, 1, ta, size, opts)}" alt="${esc(e.ticker)}" loading="lazy" referrerpolicy="no-referrer"
             ${size ? `width="${size.w}" height="${size.h}" data-fallback="${esc(finvizChartUrl(sym, 1, ta, null, opts))}"` : ""}
             onerror="leadChartFallback(this)">
      </a>
    </figure>`;
  }).join("");
  return `<p class="lead-dim lead-wl__criteria">${t(ta ? "leadChartsHintTa" : _leadersUi.weekly ? "leadChartsHintW" : "leadChartsHint")}${_leadersUi.ema ? t("leadChartsHintEma") : ""}${size ? " " + t(_leadersUi.weekly ? "leadChartsRangeW" : "leadChartsRange") : ""}</p>
    <div class="exp-charts lead-charts lead-charts--${_leadersUi.chartSize}">${cards}</div>`;
}

let _leadersExpanded = new Set();

// Zeilen, die eine Theme-Karte gerade zeigt: nur qualifizierte, aufgeklappt alle.
function leadersCardRows(theme) {
  return _leadersExpanded.has(theme.name) ? theme.rows : theme.rows.filter(r => r.qualified);
}

// Oberer Export: die angezeigten Theme-Karten als TradingView-Watchlist —
// je Karte eine ###Theme-Sektion in der aktuellen Sortierung, Ticker wie in
// der Karte. Ein Ticker kann in mehreren Sektionen stehen (Finviz-Zuordnung).
function downloadThemeCardsWatchlist() {
  const themes = leadersVisibleThemes().map(th => ({ ...th, rows: leadersCardRows(th) }));
  const txt = _LM.tradingViewWatchlist(themes, { keepOrder: true });
  const n = (txt.match(/^[^#\n].*$/gm) || []).length;
  if (!n) { showToast(t("leadEmptyRows")); return; }
  const blob = new Blob([txt], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `leading_themes_${leadersDataDate()}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  showToast(t("leadWatchlistDone", n));
}   // Theme-Karten, die auch nicht-qualifizierte Zeilen zeigen

function leadersCardHtml(theme) {
  const b = theme.breadth;
  const pct = (v) => v === null ? leadNa() : Math.round(v) + " %";
  const rc = b.rank_change_4w;
  const rcTxt = rc === null ? leadNa()
    : `<span class="${rc > 0 ? "lead-pos" : rc < 0 ? "lead-neg" : ""}">${rc > 0 ? "▲ +" : rc < 0 ? "▼ " : ""}${rc}</span>`;
  const chip = (key, val) => `<span class="lead-chip">${t("leadCols")[key][0]} <b>${val}</b>${leadInfo(key)}</span>`;
  const lowTxt = theme.basket_low
    ? (theme.fth_reason === "low_too_old" ? t("leadLowOld", leadDate(theme.basket_low.date))
      : t("leadBasketLow", leadDate(theme.basket_low.date), theme.basket_low.drawdown.toFixed(1)))
    : t("leadNoLow");
  const stateTag = theme.state && theme.state !== "neutral"
    ? `<span class="lead-tag lead-state--${theme.state}" title="${esc(t("leadStateTitle", theme.rank_3m, theme.rank_12m, theme.rank_gap, theme.n_ranked))}">${t("leadState")[theme.state]}${leadInfo("state")}</span>` : "";
  const tags = [
    stateTag,
    theme.source === "manual" ? `<span class="lead-tag">${t("leadManual")}</span>` : "",
    theme.thin ? `<span class="lead-tag">${t("leadThin")}</span>` : "",
  ].join("");

  const expanded = _leadersExpanded.has(theme.name);
  const qualified = theme.rows.filter(r => r.qualified);
  const rows = leadersCardRows(theme);
  const failText = (r) => (r.wl_fails || []).map(k => t("leadFails")[k] ?? k).join(", ");

  const cols = ["rs_vs_theme", "rs_rating", "p6m", "dist_52wh", "first_to_high", "down_day_strength",
    "rvol_50d", "adr_pct", "atr_pct", "dollar_vol_20d"];
  const head = `<th>#</th><th>Ticker</th>` + cols.map(k =>
    `<th>${t("leadCols")[k][0]}${k === "atr_pct" ? ` ${_leadersUi.atrPeriod}` : ""} ${leadInfo(k)}</th>`).join("");
  const body = rows.map((r, i) => {
    const sym = leadSym(r.ticker);
    const cls = r.leader ? "lead-row--leader" : !r.qualified ? "lead-row--laggard" : "";
    const fth = r.first_to_high === null ? leadNa()
      : `${r.first_to_high ? `<span class="lead-pos">✓</span> ` : ""}${r.first_high_date ? leadDate(r.first_high_date) : "—"}`;
    const dist = r.dist_52wh_adr === null ? leadNa()
      : `${r.dist_52wh_adr.toFixed(1)} <span class="lead-dim">(${r.dist_52wh_pct.toFixed(1)} %)</span>`;
    const dd = r.down_day_strength === null ? leadNa()
      : `${leadNum(r.down_day_strength)} <span class="lead-dim">(${r.down_days})</span>`;
    const why = r.qualified ? "" : ` title="${esc(t("leadFailsTitle", failText(r)))}"`;
    return `<tr class="${cls}"${why}>
      <td>${i + 1}</td>
      <td>${r.leader ? "👑 " : ""}<a href="${finvizQuoteUrl(sym.replace(".", "-"))}" target="_blank" rel="noopener" class="lead-sym">${esc(r.ticker)}</a>${leadMulti(r.ticker)}</td>
      <td>${leadNum(r.rs_vs_theme)}</td>
      <td>${r.rs_rating ?? leadNa()}</td>
      <td>${leadNum(r.p6m, 0, " %")}</td>
      <td>${dist}</td>
      <td>${fth}</td>
      <td>${dd}</td>
      <td>${r.rvol_50d === null ? leadNa() : r.rvol_50d.toFixed(1) + "×"}</td>
      <td>${leadNum(r.adr_pct, 1, "", false)}</td>
      <td>${leadNum(r.atr_pct, 1, "", false)}</td>
      <td>${leadDvol(r.dollar_vol_20d)}</td>
    </tr>`;
  }).join("");
  const table = rows.length
    ? `<div class="table-scroll"><table class="lead-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
    : `<p class="lead-noleader">${theme.rows.length ? t("leadNoLeader") : t("leadEmptyRows")}</p>`;
  const toggle = theme.rows.length > qualified.length
    ? `<button class="xaxis-btn lead-expand" data-ltheme="${esc(theme.name)}">${expanded ? t("leadShowQualified") : t("leadShowAll", theme.rows.length)}</button>` : "";

  return `<div class="lead-card">
    <div class="lead-card__head">
      <span class="lead-rank">#${theme.rank ?? "–"}</span>
      <a class="lead-name" href="${themeScreenerUrl(theme.name)}" target="_blank" rel="noopener">${esc(theme.name)}</a>
      ${tags}
      <span class="lead-dim">${t("leadMembers", b.members, b.members_with_data)} · ${lowTxt}</span>
    </div>
    <div class="lead-chips">
      ${chip("group_rs", theme.group_rs_3m === null ? leadNa()
        : `${Math.round(theme.group_rs_3m)}<span class="lead-dim"> · ${t("leadGroupPct", theme.group_rs_pct)}${theme.rank_3m ? ` · #${theme.rank_3m}` : ""}</span>`)}
      ${chip("group_rs12", theme.group_rs_12m === null ? leadNa()
        : `${Math.round(theme.group_rs_12m)}<span class="lead-dim">${theme.rank_12m ? ` · #${theme.rank_12m}` : ""}</span>`)}
      ${chip("pct_above_50ma", pct(b.pct_above_50ma))}
      ${chip("pct_near_high", pct(b.pct_near_high))}
      ${chip("new_highs_5d", b.new_highs_5d ?? leadNa())}
      ${chip("rank_change_4w", rcTxt)}
    </div>
    <div class="lead-qual"><span class="lead-dim">${t("leadQualified", qualified.length, theme.rows.length)}</span> ${toggle}</div>
    ${table}
  </div>`;
}

function leadersBarHtml() {
  const ui = _leadersUi;
  const opt = (vals, cur, fmt) => vals.map(v => `<option value="${v}"${v === cur ? " selected" : ""}>${fmt(v)}</option>`).join("");
  const seg = (attr, items, cur) => items.map(([v, label]) =>
    `<button class="xaxis-btn${v === cur ? " active" : ""}" data-${attr}="${v}">${label}</button>`).join("");
  return `<div class="lead-bar">
    <span class="lead-group"><span class="xaxis-toggle-label">${t("leadSortLabel")}</span>
      ${seg("lsort", [["group_rs", t("leadSortGroupRs")], ["score", t("leadSortScore")], ["breadth", t("leadSortBreadth")]], ui.sort)}
      ${leadInfo("group_rs")}</span>
    <span class="lead-group"><span class="xaxis-toggle-label">${t("leadTopN")}</span>
      <select class="lead-select" data-lfilter="topN">${opt(_LCFG.TOP_N_OPTIONS, ui.topN, v => v)}</select></span>
    <span class="lead-group"><span class="xaxis-toggle-label">${t("leadMinDvol")}</span>
      <select class="lead-select" data-lfilter="minDvol">${opt(_LCFG.MIN_DOLLAR_VOL_OPTIONS, ui.minDvol, v => v ? leadDvol(v) : t("leadAll"))}</select></span>
    <span class="lead-group"><span class="xaxis-toggle-label">${t("leadAtr")}</span>
      ${seg("lperiod", Object.keys(_LCFG.ATR_PERIODS).map(k => [k, _lang === "de" ? k : k.replace("T", "D")]), ui.atrPeriod)}
      <select class="lead-select" data-lfilter="minAtr">${opt(_LCFG.MIN_ATR_OPTIONS, ui.minAtr, v => v ? "> " + v + " %" : t("leadAll"))}</select></span>
    <span class="lead-group lead-actions">
      <button class="selection-bar__export-btn lead-export-btn">${t("exportJson")}</button>
      <button class="top20-btn lead-tv-themes-btn" title="${esc(t("leadThemesTvTitle"))}">${t("leadWatchlist")}</button>
    </span>
  </div>`;
}

// Letzter Handelstag in den Kursdaten (nicht das Laufdatum: der Post-Close-
// Lauf kann nach Mitternacht UTC landen).
function leadersDataDate() {
  return _leadersBars?.dates?.[_leadersBars.dates.length - 1] ?? _leadersBars?.date ?? null;
}

// Export-Felder (Schema v2) für ein Theme. Gefiltert wie im Tab angezeigt.
function leadersExportFields(name) {
  if (!_leadersBars || !_LM || !_leadersUi || !_etfData?.themes) {
    return { leading_breadth: null, leaders: null };
  }
  const th = leadersResult()[name];
  if (!th) return { leading_breadth: null, leaders: null };
  const ui = _leadersUi;
  const r2 = (v) => (v === null || v === undefined || !Number.isFinite(v)) ? null : Math.round(v * 100) / 100;
  const b = th.breadth;
  return {
    leading_breadth: {
      pct_above_50ma: r2(b.pct_above_50ma),
      pct_near_high: r2(b.pct_near_high),
      new_highs_5d: b.new_highs_5d,
      rank_change_4w: b.rank_change_4w,
      members: b.members,
      members_with_data: b.members_with_data,
      qualified_count: th.qualified_count,
      group_rs_3m: r2(th.group_rs_3m),
      group_rs_pct: th.group_rs_pct,
      group_rs_12m: r2(th.group_rs_12m),
      rank_3m: th.rank_3m,
      rank_12m: th.rank_12m,
      rank_gap: th.rank_gap,
      n_ranked: th.n_ranked,
      state: th.state,
      basket_low: th.basket_low ? { date: th.basket_low.date, drawdown_pct: r2(th.basket_low.drawdown) } : null,
      constituents_source: th.source,
      data_date: leadersDataDate(),
      filters: { min_dollar_vol: ui.minDvol, min_atr_pct: ui.minAtr, atr_period: ui.atrPeriod },
    },
    leaders: _LM.filterRows(th.rows, { minDollarVol: ui.minDvol, minAtrPct: ui.minAtr }).map(r => ({
      rank: r.rank,
      ticker: r.ticker,
      theme_count: _leadersCons?.memberships?.[r.ticker] ?? null,
      leader: r.leader,
      qualified: r.qualified,
      wl_fails: r.wl_fails,
      laggard: r.laggard,
      rs_rating: r.rs_rating,
      rs_vs_theme: r2(r.rs_vs_theme),
      rs_vs_spy: r2(r.rs_vs_spy),
      p6m: r2(r.p6m),
      dist_52wh_pct: r2(r.dist_52wh_pct),
      dist_52wh_adr: r2(r.dist_52wh_adr),
      above_sma50: r.above_sma50,
      above_sma200: r.above_sma200,
      trigger: r.trigger,
      weak_volume: r.weak_volume,
      gap_pct: r2(r.gap_pct),
      ep: r.ep,
      ep_date: r.ep_date,
      rmv: r2(r.rmv),
      first_to_high: r.first_to_high,
      first_high_date: r.first_high_date,
      down_day_strength: r2(r.down_day_strength),
      down_days: r.down_days,
      rvol_20d: r2(r.rvol_20d),
      rvol_50d: r2(r.rvol_50d),
      adr_pct: r2(r.adr_pct),
      atr_pct: r2(r.atr_pct),
      dollar_vol_20d: r.dollar_vol_20d === null ? null : Math.round(r.dollar_vol_20d),
      dollar_vol_50d: r.dollar_vol_50d === null ? null : Math.round(r.dollar_vol_50d),
    })),
  };
}

function exportLeadersJson() {
  const rows = leadersVisibleThemes().map(t => themeExportRow(t.name)).filter(Boolean);
  exportSelectionJson(rows);
}

// Angezeigte Watchlist als kommagetrennte EXCHANGE:SYMBOL-Liste in die
// Zwischenablage — direkt in eine TradingView-Watchlist einfügbar.
function copyLeadersWatchlist(btn) {
  const shown = leadersWatchlistShown(leadersWatchlist());
  if (!shown.length) { showToast(t("leadWlEmpty")); return; }
  navigator.clipboard.writeText(shown.map(e => e.ticker).join(",")).then(() => {
    flashDone(btn);
    showToast(t("leadCopied", shown.length));
  });
}

// TradingView-Watchlist als .txt-Download (Import-Dialog von TradingView):
// exakt die angezeigte Leader-Watchlist, jeder Ticker genau einmal.
function downloadLeadersWatchlist() {
  const shown = leadersWatchlistShown(leadersWatchlist());
  if (!shown.length) { showToast(t("leadWlEmpty")); return; }
  const txt = _LM.tradingViewFromWatchlist(shown, t("leadWlInPlay"));
  const blob = new Blob([txt], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `leading_stocks_${leadersDataDate()}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  showToast(t("leadWatchlistDone", shown.length));
}

async function renderLeadersTab() {
  const box = document.getElementById("leaders-container");
  if (!box) return;
  if (!_leadersBars) box.innerHTML = `<p class="loading">${t("leadLoading")}</p>`;
  const ok = await ensureLeadersData();
  if (!ok) { box.innerHTML = `<p class="pick-empty">${t("leadNoData")}</p>`; return; }
  if (!_etfData?.themes) { box.innerHTML = `<p class="loading">${t("loading")}</p>`; return; }

  const themes = leadersVisibleThemes();
  const nCons = Object.values(_leadersCons.themes).reduce((s, c) => s + c.tickers.length, 0);
  const nUniq = new Set(Object.values(_leadersCons.themes).flatMap(c => c.tickers)).size;
  box.innerHTML = `${leadersBarHtml()}
    <p class="picks-subtitle lead-meta">${t("leadMeta", leadersDataDate(), nCons, nUniq, Object.keys(_leadersCons.themes).length)}</p>
    <p class="lead-tip" id="lead-tip">${t("leadTipDefault")}</p>
    ${leadersWatchlistHtml()}
    <h3 class="lead-section-title">${t("leadThemesTitle")}</h3>
    ${themes.map(leadersCardHtml).join("")}`;
  wireLeadersControls(box);
}

function wireLeadersControls(box) {
  const ui = _leadersUi;
  box.querySelector(".lead-export-btn").onclick = exportLeadersJson;
  box.querySelector(".lead-tv-btn").onclick = downloadLeadersWatchlist;
  box.querySelector(".lead-tv-themes-btn").onclick = downloadThemeCardsWatchlist;
  const copyBtn = box.querySelector(".lead-copy-btn");
  copyBtn.onclick = () => copyLeadersWatchlist(copyBtn);
  box.querySelectorAll("[data-lwlmode]").forEach(b => b.onclick = () => {
    ui.wlMode = b.dataset.lwlmode; prefSet("leadWlMode", ui.wlMode); renderLeadersTab();
  });
  box.querySelectorAll("[data-lta]").forEach(b => b.onclick = () => {
    ui.ta = !ui.ta; prefSet("leadTa", ui.ta ? "1" : "0"); renderLeadersTab();
  });
  box.querySelectorAll("[data-ltf]").forEach(b => b.onclick = () => {
    ui.weekly = b.dataset.ltf === "w"; prefSet("leadTf", ui.weekly ? "w" : "d"); renderLeadersTab();
  });
  box.querySelectorAll("[data-lema]").forEach(b => b.onclick = () => {
    ui.ema = !ui.ema; prefSet("leadEma", ui.ema ? "1" : "0"); renderLeadersTab();
  });
  box.querySelectorAll("[data-lsize]").forEach(b => b.onclick = () => {
    ui.chartSize = b.dataset.lsize; prefSet("leadChartSize", ui.chartSize); renderLeadersTab();
  });
  box.querySelectorAll("[data-lsort]").forEach(b => b.onclick = () => {
    ui.sort = b.dataset.lsort; prefSet("leadSort", ui.sort); renderLeadersTab();
  });
  box.querySelectorAll("[data-lwl]").forEach(b => b.onclick = () => {
    ui.wlView = b.dataset.lwl; prefSet("leadWlView", ui.wlView); renderLeadersTab();
  });
  box.querySelectorAll("[data-ltheme]").forEach(b => b.onclick = () => {
    const n = b.dataset.ltheme;
    if (_leadersExpanded.has(n)) _leadersExpanded.delete(n); else _leadersExpanded.add(n);
    renderLeadersTab();
  });
  box.querySelectorAll("[data-lperiod]").forEach(b => b.onclick = () => {
    ui.atrPeriod = b.dataset.lperiod; prefSet("leadAtrPeriod", ui.atrPeriod); renderLeadersTab();
  });
  box.querySelectorAll("[data-lfilter]").forEach(sel => sel.onchange = () => {
    const k = sel.dataset.lfilter;
    ui[k] = Number(sel.value);
    prefSet("lead" + k[0].toUpperCase() + k.slice(1), ui[k]);
    renderLeadersTab();
  });
  // Info-Icons: Hover (Desktop) und Tap (Mobil) schreiben in die Tipp-Zeile —
  // ein schwebender Tooltip würde im horizontal scrollenden Tabellen-Container
  // abgeschnitten.
  const tip = box.querySelector("#lead-tip");
  const show = (el) => { tip.textContent = el.getAttribute("title"); tip.classList.add("lead-tip--active"); };
  box.querySelectorAll(".lead-info").forEach(el => {
    el.addEventListener("mouseenter", () => show(el));
    el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); show(el); });
    el.addEventListener("focus", () => show(el));
  });
}

// Chart-Bilder werden in Kartenbreite angefordert -> bei spuerbar anderer
// Fensterbreite neu rendern (entprellt), sonst bleiben sie zu klein/zu gross.
let _leadersResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(_leadersResizeTimer);
  _leadersResizeTimer = setTimeout(() => {
    if (_leadersUi?.wlMode !== "charts" || _leadersUi.chartSize === "S") return;
    if (document.querySelector('[data-panel="leaders"]')?.classList.contains("hidden")) return;
    const w = document.getElementById("leaders-container")?.clientWidth;
    if (w && _leadersChartWidth && Math.abs(w - _leadersChartWidth) > 40) renderLeadersTab();
  }, 300);
});

async function loadData() {
  const loading = document.getElementById("loading");
  const errorEl = document.getElementById("error-msg");
  const refreshBtn = document.getElementById("refresh-btn");

  // Show loading state
  loading.classList.remove("hidden");
  errorEl.classList.add("hidden");
  if (refreshBtn) { refreshBtn.disabled = true; refreshBtn.textContent = "…"; }

  // Cache-bust so the browser always fetches fresh JSON
  const bust = `?t=${Date.now()}`;

  try {
    const [dataRes, histRes, etfRes, regimeRes, setupsRes, tickersRes] = await Promise.all([
      fetch("data.json" + bust),        // → dataRes    (index 0)
      fetch("history.json" + bust),     // → histRes    (index 1)
      fetch("etf_data.json" + bust),    // → etfRes     (index 2)
      fetch("regime.json" + bust),      // → regimeRes  (index 3)
      fetch("setups.json" + bust),      // → setupsRes  (index 4)
      fetch("tickers.json" + bust),     // → tickersRes (index 5)
    ]);

    if (!dataRes.ok) throw new Error(`data.json: HTTP ${dataRes.status}`);
    const payload = await dataRes.json();
    loading.classList.add("hidden");
    renderAll(payload);

    if (histRes.ok) {
      _lastHistory = await histRes.json();
      updatePeriodButtons(_lastHistory);
      renderMovers(_lastHistory, _activePeriodDays);
    }

    if (etfRes.ok) {
      _etfData = await etfRes.json();
      // Kennzahlen-Kern + Snapshot-Historie: einmal pro Datenladung, dann
      // stehen stage/daysInStage für Tabelle, Setup-Tabs und Export bereit.
      await ensureMetricsModule();
      await loadSnapshots();
      computeThemeMetrics();
      renderEtfTab();
      renderSetupTabs();
      // Leading Stocks: Kursdatei beim nächsten Öffnen frisch holen.
      _leadersBars = null; _leadersLoad = null; _leadersFailed = false; _leadersCache = {};
      if (!document.querySelector('[data-panel="leaders"]')?.classList.contains("hidden")) renderLeadersTab();
    } else {
      document.getElementById("etf-loading").classList.add("hidden");
      document.getElementById("etf-error").textContent = t("etfNoData");
      document.getElementById("etf-error").classList.remove("hidden");
    }

    if (setupsRes.ok) {
      // setups.json existiert erst nach dem ersten Scraper-Lauf — 404 ist ok,
      // der Experimental-Tab zeigt dann den Hinweis statt einer Tabelle.
      _setupsData = await setupsRes.json();
      renderExperimental();
    }

    if (tickersRes.ok) {
      // tickers.json existiert erst nach dem ersten Post-Close-Lauf — 404 ist ok,
      // der Tickers-Tab zeigt dann den Hinweis statt eines Bubble-Charts.
      _tickersData = await tickersRes.json();
      renderTickersTab();
    }

    if (regimeRes.ok) {
      // regime.json existiert erst nach dem ersten Scraper-Lauf — 404 ist ok.
      const regimeHist = await regimeRes.json();
      _regimeData = Array.isArray(regimeHist) && regimeHist.length
        ? regimeHist[regimeHist.length - 1] : null;
    }
    renderRegime();
    renderSituational();

  } catch (err) {
    loading.classList.add("hidden");
    errorEl.textContent = "Fehler beim Laden der Daten: " + err.message;
    errorEl.classList.remove("hidden");
  } finally {
    if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.textContent = "⟳"; }
  }
}

document.getElementById("refresh-btn")?.addEventListener("click", loadData);

loadData();
