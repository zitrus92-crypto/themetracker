const TIMEFRAMES     = ["1D", "1W", "1M", "3M", "6M", "YTD"];
const ETF_TIMEFRAMES = ["1D", "1W", "1M", "3M", "6M", "YTD"];
const SPARKLINE_ORDER = ["YTD", "6M", "3M", "1M", "1W", "1D"];

// --- i18n ---
const I18N = {
  de: {
    notLoaded:    "— noch nicht geladen —",
    updated:      "Stand: ",
    loading:      "Daten werden geladen…",
    noData:       "Keine Daten.",
    topIndustry:  "Industry",
    tabHeatmap:   "Heatmap",
    tabPicks:     "★ Setup Picks",
    tabTop10:     "Top 10",
    tabIndBubble: "🔵 Bubble",
    indBubbleTitle: "🔵 Industry Bubble Chart",
    heatmapTitle: "Industry Heatmap",
    colIndustry:  "Industry",
    colScore:     "Score",
    colAccel:     "Accel",
    colTrend:     "Trend",
    exportJson:   "📤 JSON kopieren",
    picksTitle:   "★ Setup Picks — First Flag",
    picksSubtitle:"Industries mit positivem Momentum-Profil für den First-Flag-Breakout-Trade.",
    picksColReason: "Setup-Begründung",
    picksEmpty:   "Aktuell keine Industries mit First-Flag-Profil gefunden.",
    top10Title:   "Top 10 per Zeitraum",
    tagHot:       "HOT",
    tagAccel:     "ACCEL ▲",
    tagFresh:     "FRISCH",
    reasonFresh:  (p3m, p1m) => `Schwache 3M-Basis (${p3m}%) aber 1M stark → erster Leg, nicht extended.`,
    reasonSolid:  ()         => `3M solide, 1W beschleunigt weiter → Trend intakt, Momentum nimmt zu.`,
    reasonSteady: ()         => `Gleichmäßig stark über 1W/1M — konsistentes Sektoren-Momentum.`,
    reasonAccel:  (acc)      => `Starke Beschleunigung (Accel +${acc}) deutet auf frisches institutionelles Interesse hin.`,
    reasonIntraday: (p1d)    => `Intraday +${p1d}% — Breakout läuft heute bereits.`,
    moversTitle:  "Where is the Puck going?",
    moversSubtitle: "Rank-Veränderung seit dem gewählten Zeitraum. Je größer der Sprung, desto stärker das Momentum.",
    moversRising: "Rising — Puck kommt hier an",
    moversFading: "Fading — Puck verlässt",
    moversNoData: (period) => `Noch nicht genug Daten für ${period}. Bitte warte bis genug tägliche Snapshots gesammelt wurden.`,
    moversCompare:(date) => `vs. ${date}`,
    viewCards:    "📊 Karten",
    viewBars:     "📈 Balken",
    tagInst:      "INST",
    infoScore:    "Gewichteter Rang-Score: 1M×70% + 1W×20% + 3M×10%. Niedriger = besser (Rang 1 = stärkstes).",
    infoAccel:    "Accel = 3M-Rang minus 1W-Rang. Hoch positiv = war vor 3M noch schwach, jetzt stark = erster Leg, nicht extended. Ideal fuer First-Flag-Setups.",
    hintHeatmap:  "Score sortieren: Marktüberblick — welche Industries aktuell führen.\nAccel sortieren: First Flag Suche — frisches Momentum (3M schwach + 1W stark = erster Leg, nicht extended).\nINST-Filter: zeigt nur institutionell bestätigte Industries (Top 40 in 1M und 3M).\nKlick auf Spaltenkopf = sortieren, nochmal klicken = umkehren.",
    hintPicks:    "Vorgefilterter First-Flag-Kandidatenliste: Score Top 40 + positiver Accel + 1W > 1% + 1M > 0%.\nSortierung: 60% Accel-Gewicht + 40% Score — frischeste Bewegungen zuerst.\nINST-Badge = institutionelles Kapital bestätigt die Industry = höchste Konfluenz.\nKlick auf Industry-Name öffnet Finviz-Screener mit passenden Filtern.",
    hintIndBubble:"X-Achse: 3M-Performance, Y-Achse: 1M-Performance.\nGröße = Stärke (Score) — starke Industries bleiben groß, egal ob beschleunigend oder konsolidierend.\nFarbe = Accel (stabiler Rang3M−Rang1M): grün = beschleunigt, grau = konsolidiert, rot = fällt ab.\nINST-Filter (Heatmap-Toggle) wirkt auch hier. Klick auf Bubble öffnet Finviz-Screener.",
    hintTop10:    "Top 10 Performer pro Zeitraum — zeigt aktuelle Marktführer.\nKarten: kompakte Übersicht pro Zeitraum.\nBalken: alle Industries sortiert nach 1M und 3M Performance.\nINST-Badge zeigt institutionelles Interesse.",
    hintMovers:   "Rang-Veränderung seit dem gewählten Zeitraum.\nRising: Industries die am stärksten gestiegen sind — frisches Kapital fließt ein. Hier suchen!\nFading: Industries die Ränge verloren haben — Kapital verlässt diesen Bereich. Meiden.\nZeitraum wählen: 1W / 2W / 1M / 3M (ausgegraut = noch nicht genug Daten).",
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
    matrixFading:   "🔻 Fading",
    matrixFadingSub:"3M stark → 1M schwach",
    matrixDead:     "💀 Dead",
    matrixDeadSub:  "beide schwach",
    vizTable:       "📋 Tabelle",
    vizBubble:      "🔵 Bubble",
    vizMatrix:      "⊞ Matrix",
    top20Title:       "Top 20% der aktuellen Sortierung markieren (zum Kopieren)",
    top20IntersectTitle: "Schnittmenge der Top 20% nach 1W und 1M (nur die stärksten)",
    top20Intersect2Title: "Schnittmenge der Top 20% nach 1M und 3M (nur die stärksten)",
    regimeStale:      "DATEN VERALTET",
    regimeUnknown:    "REGIME ?",
    regimeEffectOn:      "Volle Size (1% Risk/Trade). Add-ons erlaubt.",
    regimeEffectNeutral: "Neue Trades nur mit 0,5% Risk statt 1%. Keine Add-ons.",
    regimeEffectOff:     "Keine neuen Entries. Bereits platzierte GTC-Orders bleiben. Nur Verwaltung offener Positionen.",
    regimeBannerOff:  "🔴 RISK_OFF — keine neuen Entries. Nur Verwaltung offener Positionen.",
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
    topWeekend:    "📅 Weekend Prep",
    weekendTitle:  "📅 Weekend Prep — Wochenplan",
    hintWeekend:   "Konsolidiert Themes UND Industries zu EINER Revier-Rangfolge.\nStruktur-Score (0–100) = Stage 30 + Frische 25 + Schaden 25 + Accel 20.\nAccel wird als Perzentil innerhalb der eigenen Ebene gewertet — Theme- und Industry-Accel sind absolut nicht vergleichbar.\nHart aussortiert: BOUNCE, EXTENDED, 1M ≤ 0, fehlendes 6M.\nDubletten (gleicher Rohstoff-/Namenskomplex oder >30 % Ticker-Überschneidung) belegen keinen zweiten Fokus-Slot.\nRevier-Auswahl, kein Kaufsignal — die Kaufentscheidung fällt am Einzelchart.",
    wpFocusTitle:  "WOCHENFOKUS",
    wpFocusHint:   "max. 3 Reviere · Dubletten übersprungen",
    wpNoFocus:     "Kein Revier übersteht die harten Filter. Kurze Liste ist dann gewollt.",
    wpMoreTitle:   "WEITERE REVIERE",
    wpWatchTitle:  "WATCH — NÄCHSTE WOCHE",
    wpWatchHint:   "genau ein Kriterium verfehlt",
    wpExcludedTitle: "AUSSORTIERT",
    wpExcludedHint:  "harte Vetos — nicht handeln",
    wpColGroup:    "Gruppe",
    wpColScore:    "Score",
    wpColNote:     "Hinweis",
    wpColReason:   "Grund",
    wpTypeTheme:   "Theme",
    wpTypeIndustry:"Industry",
    wpTickers:     "Ticker",
    wpScoreTitle:  "Struktur-Score 0–100: Stage + Frische + Schaden + Accel",
    wpScoreAria:   (n) => `Struktur-Score ${n} von 100`,
    wpPart_stage:     "Stage",
    wpPart_freshness: "Frische",
    wpPart_damage:    "Basis-Gesundheit",
    wpPart_accel:     "Accel-Perzentil",
    wpBorderlineTag: "GRENZFALL",
    wpDuplicate:   (name, why) => `⚠ Gleicher Trade wie „${name}" (${why}) — belegt keinen eigenen Slot.`,
    wpDupReason_tickers: "Ticker-Überschneidung",
    wpDupReason_complex: "gleicher Rohstoff-Komplex",
    wpDupReason_name:    "gleicher Namens-Komplex",
    wpExcl_bounce:   "BOUNCE — Anstieg aus beschädigter Struktur (Schaden ≤ −15)",
    wpExcl_extended: "EXTENDED — Bewegung ausgelaufen, Momentum dreht",
    wpExcl_m1:       "1M ≤ 0 % — Killswitch",
    wpExcl_unknown:  "6M fehlt — nicht klassifizierbar",
    wpExcl_noTickers:"keine Ticker im Datensatz",
    wpWhyStage_pullback:   "Rücksetzer in intaktem Aufwärtstrend — klassischer First-Flag-Aufbau.",
    wpWhyStage_base_break: "Ausbruch aus flacher 6-Monats-Basis.",
    wpWhyStage_trend:      "Trend läuft, kein frischer Startpunkt.",
    wpWhyStage_neutral:    "Kein klares Strukturmuster — trägt sich nur über die anderen Faktoren.",
    wpWhyStageOther: (s) => `Stage ${s}.`,
    wpWhyFreshOk:    (v) => `Frische ${v} im Band: Bewegung über den Monat verteilt, Basen wahrscheinlich intakt.`,
    wpWhyFreshStale: (v) => `Frische ${v} unter dem Band: Der Move ist älter, letzte Woche kam wenig dazu — eher Konsolidierung als frischer Schub.`,
    wpWhyFreshHot:   (v) => `Frische ${v} über dem Band: Fast der ganze Monatsgewinn kam letzte Woche — viele Einzelwerte dürften extended sein, eher Pullback-Revier.`,
    wpWhyDamageOk:   (v) => `Basis gesund (Schaden ${v}).`,
    wpWhyDamageWeak: (v) => `Basis angeschlagen (Schaden ${v}) — knapp über dem Bounce-Veto.`,
    wpWhyQualFF:     "Qualifiziert zusätzlich im First-Flag-Tab.",
    wpWhyQualBB:     "Qualifiziert zusätzlich im Base-Breakout-Tab.",
    wpWhyBorderline: "Verfehlt ein Tab-Kriterium nur um Rundungsbreite.",
    wpCopyFocus:      "📋 Wochenfokus",
    wpCopyFocusTitle: "Die Fokus-Reviere als benannte TradingView-Sektionen kopieren",
    wpCopyWatch:      "📋 Watch-Liste",
    wpCopyWatchTitle: "Die Watch-Kandidaten für nächste Woche als TradingView-Sektionen kopieren",
    wpCopyReport:     "📄 Textreport",
    wpCopyReportTitle:"Kompletten Wochenplan als Text kopieren (Regime, Reviere, Begründungen, Ticker)",
    wpReportCopied:   "Wochenplan als Text kopiert!",
    wpRiskFor_RISK_ON:  "1 % Risk/Trade, Add-ons erlaubt",
    wpRiskFor_NEUTRAL:  "0,5 % Risk/Trade, keine Add-ons",
    wpRiskFor_RISK_OFF: "keine neuen Entries",
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

    // ── Experimental (Stufe 0 + Stufe 1) ──────────────────────────────────
    topExperimental: "🧪 Experimental",
    expTitle:      "🧪 Experimental",
    expSubtitle:   "Zwei unvalidierte Bausteine für Schritt 3 der Tages-Routine: gefilterte Finviz-Links und ein gerechneter Setup-Screener. Nichts hier ersetzt den Chartblick — es sortiert nur vor.",
    hintExp:       "Stufe 0 verändert die Finviz-Links der ganzen App: statt aller Aktien einer Gruppe nach 4-Wochen-Performance (= extended zuerst) nur die nahe am 20-Tage-Hoch, sortiert nach Nähe zum 50-Tage-Hoch.\nStufe 1 rechnet Base-Verengung, Pivot-Abstand und Volumen aus Tages-OHLCV der stärksten Gruppen — dieselben drei Fragen, die du sonst am Mini-Chart beantwortest.\nAlle Schwellen sind Defaults und NICHT backgetestet.",

    expS0Title:    "Stufe 0 — Finviz-Link-Filter",
    expS0Desc:     "Gilt für jeden Finviz-Link der App (Heatmap, Picks, Themes, Sub-Themes). Der Standardlink sortiert nach 4-Wochen-Performance und stellt damit die am weitesten gelaufenen Namen nach vorn — genau die, die du überspringst.",
    expS0Off:      "Aus (Original)",
    expS0Setup:    "Setup (0–5 %)",
    expS0Wide:     "Weit (0–10 %)",
    expS0OffDesc:  "ta_volatility_mo3 · sortiert nach Perf 4W",
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

    expS1Title:    "Stufe 1 — Gerechneter Setup-Screener",
    expS1Desc:     "Aus Tages-OHLCV der Ticker der stärksten Gruppen. Pivot = höchstes Hoch der letzten 25 Tage ohne die letzten 3. Abstand = Kurs zum Pivot in %.",
    expS1NoData:   "Noch keine setups.json — die Datei entsteht beim nächsten Post-Close-Lauf.",
    expEod:        "EOD",
    expEodNote:    "Wird einmal pro Handelstag nach US-Close gerechnet (Post-Close-Lauf ab 21:30 UTC) — der Rest der App aktualisiert stündlich. Untertags bleibt dieser Stand bewusst stehen: Base, Pivot-Abstand und Volumen brauchen fertige Tageskerzen.",
    expS1Universe: (tk, ind, th) => `${tk} Ticker aus ${ind} Industries + ${th} Themes`,
    expUnivTitle:  "Universum — wie die „stärksten Gruppen“ bestimmt werden",
    expUnivCount:  (i, ip, t2, tp) => `${i} von ${ip} Industries · ${t2} von ${tp} Themes`,
    expUnivIndRule: (n) => `Industry: die ${n} mit dem niedrigsten Score. Score = Rang1W × 0,20 + Rang1M × 0,70 + Rang3M × 0,10, Ränge über alle Industries (1 = stärkste). Exakt die Zahl aus der Heatmap-Spalte „Score“.`,
    expUnivThemeRule: (n) => `Theme: die ${n} mit dem niedrigsten Score. Score = Mittelwert der Sub-Node-Scores des Themes, je Sub-Node Rang1M × 0,70 + Rang1W × 0,20 + Rang3M × 0,10 über alle 268 Sub-Nodes. Exakt die Zahl aus der Themes-Tabelle.`,
    expUnivNotUsed: "Bewusst NICHT geprüft: Accel, INST-Badge, Regime-Gate, Weekend-Prep-Stage. Die Auswahl ist reine Momentan-Stärke über 1W/1M/3M — sie ist NICHT die Aufnahme-Formel der Wochenend-Routine (die zusätzlich Accel ≥ +10 und 1M > 0 % verlangt). Die Accel-Spalte unten steht nur zur Info.",
    expUnivColRank: "Rang",
    expUnivColTickers: "Ticker",
    expUnivFootnote: (tk, bars) => `Aus diesen Gruppen: ${tk} eindeutige Ticker, für ${bars} davon kamen Kursdaten zurück. Danach erst greifen ADR-, Liquiditäts- und Setup-Filter.`,
    expS1Empty:    "Keine Kandidaten in dieser Ansicht.",
    expViewTable:  "📋 Tabelle",
    expViewCharts: "🖼 Mini-Charts",
    expOnlyReady:  "Nur READY",
    expTradeable:  "READY + BREAKOUT",
    expAll:        "Alle",
    expCopyBtn:    "📋 Ticker kopieren",
    expTop20:      "Top 20 %",
    expTop20Title: (min) => `Alle Zeilen der aktuellen Ansicht mit Score ≥ ${min} markieren. Nochmal klicken hebt die Markierung auf. Einzelne Zeilen lassen sich auch direkt anklicken.`,
    expTop20Marked:(n, min) => `${n} Zeilen mit Score ≥ ${min} markiert`,
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
    expColPivotPx: "Pivot",

    expVerdictREADY:    "READY",
    expVerdictBREAKOUT: "BREAKOUT",
    expVerdictWATCH:    "WATCH",
    expReason_at_pivot:       "Am Pivot, Base verengt",
    expReason_running:        "Ausbruch läuft bereits",
    expReason_below_pivot:    "Noch unter dem Pivot",
    expReason_base_too_short: "Base zu kurz",
    expReason_no_contraction: "Keine Verengung",

    expTipDist:    "Kurs zum Pivot in %. Negativ = darunter, 0 = am Pivot, positiv = ausgebrochen. Über +8 % gilt als extended und fliegt raus.",
    expTipTight:   "ATR(5) ÷ ATR(20). Unter 1 = die Bewegung verengt sich — das ist die rechnerische Form von „saubere Base“.",
    expTipDry:     "Volumen der letzten 5 Tage ÷ 50-Tage-Schnitt. Unter 1 = Volumen trocknet in der Base aus.",
    expTipRvol:    "Heutiges Volumen ÷ 50-Tage-Schnitt. Über 1 am Pivot = Ausbruch mit Beteiligung.",
    expTipScore:   "0–100: Pivot-Nähe 40 · Verengung 25 · Dry-Up 15 · Base-Länge 10 · Trend 10. Reine Sortierhilfe, UNVALIDIERT.",
    expUnvalidated:"UNVALIDIERT — Schwellen sind Defaults, kein Backtest.",
  },
  en: {
    notLoaded:    "— not yet loaded —",
    updated:      "Updated: ",
    loading:      "Loading data…",
    noData:       "No data.",
    topIndustry:  "Industry",
    tabHeatmap:   "Heatmap",
    tabPicks:     "★ Setup Picks",
    tabTop10:     "Top 10",
    tabIndBubble: "🔵 Bubble",
    indBubbleTitle: "🔵 Industry Bubble Chart",
    heatmapTitle: "Industry Heatmap",
    colIndustry:  "Industry",
    colScore:     "Score",
    colAccel:     "Accel",
    colTrend:     "Trend",
    exportJson:   "📤 Copy JSON",
    picksTitle:   "★ Setup Picks — First Flag",
    picksSubtitle:"Industries with positive momentum profile for First Flag breakout trades.",
    picksColReason: "Setup Rationale",
    picksEmpty:   "No industries with First Flag profile found.",
    top10Title:   "Top 10 per Timeframe",
    tagHot:       "HOT",
    tagAccel:     "ACCEL ▲",
    tagFresh:     "FRESH",
    reasonFresh:  (p3m, p1m) => `Weak 3M base (${p3m}%) but 1M strong → first leg confirmed, not extended.`,
    reasonSolid:  ()         => `3M solid, 1W accelerating further → trend intact, momentum building.`,
    reasonSteady: ()         => `Consistently strong across 1W/1M — steady sector momentum.`,
    reasonAccel:  (acc)      => `Strong acceleration (Accel +${acc}) suggests fresh institutional interest.`,
    reasonIntraday: (p1d)    => `Intraday +${p1d}% — breakout already running today.`,
    moversTitle:  "Where is the Puck going?",
    moversSubtitle: "Rank change since the selected period. The bigger the jump, the stronger the momentum.",
    moversRising: "Rising — Puck heading here",
    moversFading: "Fading — Puck leaving",
    moversNoData: (period) => `Not enough data for ${period} yet. Wait until enough daily snapshots are collected.`,
    moversCompare:(date) => `vs. ${date}`,
    viewCards:    "📊 Cards",
    viewBars:     "📈 Bar Chart",
    tagInst:      "INST",
    infoScore:    "Weighted rank score: 1M×70% + 1W×20% + 3M×10%. Lower = better (rank 1 = strongest).",
    infoAccel:    "Accel = 3M rank minus 1W rank. High positive = was weak 3M ago, now strong = first leg, not extended. Ideal for First Flag setups.",
    hintHeatmap:  "Sort by Score: market overview — which industries are currently leading.\nSort by Accel: First Flag search — fresh momentum (weak 3M + strong 1W = first leg, not extended).\nINST filter: shows only institutionally confirmed industries (Top 40 in 1M and 3M).\nClick any column header to sort, click again to reverse.",
    hintPicks:    "Pre-filtered First Flag candidate list: Score Top 40 + positive Accel + 1W > 1% + 1M > 0%.\nSorted by: 60% Accel weight + 40% Score — freshest moves first.\nINST badge = institutional capital confirms the industry = highest confluence.\nClick any industry name to open Finviz screener with matching filters.",
    hintIndBubble:"X-axis: 3M performance, Y-axis: 1M performance.\nSize = strength (Score) — strong industries stay big regardless of accelerating or consolidating.\nColor = Accel (stable Rank3M−Rank1M): green = accelerating, gray = consolidating, red = fading.\nThe INST filter (Heatmap toggle) applies here too. Click a bubble to open the Finviz screener.",
    hintTop10:    "Top 10 performers per timeframe — shows current market leaders.\nCards: compact overview per timeframe.\nBar chart: all industries sorted by 1M and 3M performance.\nINST badge shows institutional interest.",
    hintMovers:   "Rank change since the selected period.\nRising: industries that climbed most in ranking — fresh capital flowing in. Look here!\nFading: industries that lost ranks — capital leaving. Avoid.\nSelect period: 1W / 2W / 1M / 3M (greyed out = not enough data yet).",
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
    matrixFading:   "🔻 Fading",
    matrixFadingSub:"3M strong → 1M weak",
    matrixDead:     "💀 Dead",
    matrixDeadSub:  "both weak",
    vizTable:       "📋 Table",
    vizBubble:      "🔵 Bubble",
    vizMatrix:      "⊞ Matrix",
    top20Title:       "Select the top 20% of the current sort (for copying)",
    top20IntersectTitle: "Intersection of the top 20% by 1W and by 1M (strongest only)",
    top20Intersect2Title: "Intersection of the top 20% by 1M and by 3M (strongest only)",
    regimeStale:      "DATA STALE",
    regimeUnknown:    "REGIME ?",
    regimeEffectOn:      "Full size (1% risk/trade). Add-ons allowed.",
    regimeEffectNeutral: "New trades at 0.5% risk instead of 1%. No add-ons.",
    regimeEffectOff:     "No new entries. Existing GTC orders remain untouched. Manage open positions only.",
    regimeBannerOff:  "🔴 RISK_OFF — no new entries. Manage open positions only.",
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
    topWeekend:    "📅 Weekend Prep",
    weekendTitle:  "📅 Weekend Prep — Weekly Plan",
    hintWeekend:   "Consolidates themes AND industries into ONE hunting-ground ranking.\nStructure score (0–100) = stage 30 + freshness 25 + damage 25 + accel 20.\nAccel counts as a percentile within its own level — theme and industry accel are not comparable in absolute terms.\nHard-excluded: BOUNCE, EXTENDED, 1M ≤ 0, missing 6M.\nDuplicates (same commodity/name complex or >30 % ticker overlap) never take a second focus slot.\nHunting-ground selection, not a buy signal — the chart decides.",
    wpFocusTitle:  "WEEKLY FOCUS",
    wpFocusHint:   "max. 3 grounds · duplicates skipped",
    wpNoFocus:     "No hunting ground survives the hard filters. A short list is the intended outcome.",
    wpMoreTitle:   "FURTHER GROUNDS",
    wpWatchTitle:  "WATCH — NEXT WEEK",
    wpWatchHint:   "exactly one criterion missed",
    wpExcludedTitle: "EXCLUDED",
    wpExcludedHint:  "hard vetoes — do not trade",
    wpColGroup:    "Group",
    wpColScore:    "Score",
    wpColNote:     "Note",
    wpColReason:   "Reason",
    wpTypeTheme:   "Theme",
    wpTypeIndustry:"Industry",
    wpTickers:     "tickers",
    wpScoreTitle:  "Structure score 0–100: stage + freshness + damage + accel",
    wpScoreAria:   (n) => `Structure score ${n} of 100`,
    wpPart_stage:     "Stage",
    wpPart_freshness: "Freshness",
    wpPart_damage:    "Base health",
    wpPart_accel:     "Accel percentile",
    wpBorderlineTag: "BORDERLINE",
    wpDuplicate:   (name, why) => `⚠ Same trade as “${name}” (${why}) — does not take its own slot.`,
    wpDupReason_tickers: "ticker overlap",
    wpDupReason_complex: "same commodity complex",
    wpDupReason_name:    "same name complex",
    wpExcl_bounce:   "BOUNCE — rising out of damaged structure (damage ≤ −15)",
    wpExcl_extended: "EXTENDED — move exhausted, momentum rolling over",
    wpExcl_m1:       "1M ≤ 0 % — killswitch",
    wpExcl_unknown:  "6M missing — cannot classify",
    wpExcl_noTickers:"no tickers in the dataset",
    wpWhyStage_pullback:   "Pullback within an intact uptrend — the classic First Flag setup.",
    wpWhyStage_base_break: "Breakout from a flat six-month base.",
    wpWhyStage_trend:      "Trend is running, no fresh starting point.",
    wpWhyStage_neutral:    "No clear structural pattern — carried by the other factors alone.",
    wpWhyStageOther: (s) => `Stage ${s}.`,
    wpWhyFreshOk:    (v) => `Freshness ${v} inside the band: the move is spread across the month, bases likely intact.`,
    wpWhyFreshStale: (v) => `Freshness ${v} below the band: the move is older, last week added little — consolidation rather than a fresh push.`,
    wpWhyFreshHot:   (v) => `Freshness ${v} above the band: nearly the whole monthly gain came last week — many names are likely extended, so treat it as pullback territory.`,
    wpWhyDamageOk:   (v) => `Base is healthy (damage ${v}).`,
    wpWhyDamageWeak: (v) => `Base is bruised (damage ${v}) — just above the bounce veto.`,
    wpWhyQualFF:     "Also qualifies in the First Flag tab.",
    wpWhyQualBB:     "Also qualifies in the Base Breakout tab.",
    wpWhyBorderline: "Misses a tab criterion by rounding width only.",
    wpCopyFocus:      "📋 Weekly focus",
    wpCopyFocusTitle: "Copy the focus grounds as named TradingView sections",
    wpCopyWatch:      "📋 Watch list",
    wpCopyWatchTitle: "Copy next week's watch candidates as TradingView sections",
    wpCopyReport:     "📄 Text report",
    wpCopyReportTitle:"Copy the full weekly plan as text (regime, grounds, rationale, tickers)",
    wpReportCopied:   "Weekly plan copied as text!",
    wpRiskFor_RISK_ON:  "1 % risk/trade, add-ons allowed",
    wpRiskFor_NEUTRAL:  "0.5 % risk/trade, no add-ons",
    wpRiskFor_RISK_OFF: "no new entries",
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

    // ── Experimental (stage 0 + stage 1) ──────────────────────────────────
    topExperimental: "🧪 Experimental",
    expTitle:      "🧪 Experimental",
    expSubtitle:   "Two unvalidated building blocks for step 3 of the daily routine: filtered Finviz links and a computed setup screener. Neither replaces the chart check — they only pre-sort it.",
    hintExp:       "Stage 0 changes every Finviz link in the app: instead of all stocks of a group sorted by 4-week performance (= most extended first), only those near their 20-day high, sorted by proximity to the 50-day high.\nStage 1 computes base contraction, pivot distance and volume from daily OHLCV of the strongest groups — the same three questions you normally answer on the mini chart.\nAll thresholds are defaults and NOT backtested.",

    expS0Title:    "Stage 0 — Finviz link filter",
    expS0Desc:     "Applies to every Finviz link in the app (heatmap, picks, themes, sub-themes). The default link sorts by 4-week performance and therefore puts the most extended names first — exactly the ones you skip.",
    expS0Off:      "Off (original)",
    expS0Setup:    "Setup (0–5%)",
    expS0Wide:     "Wide (0–10%)",
    expS0OffDesc:  "ta_volatility_mo3 · sorted by perf 4W",
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

    expS1Title:    "Stage 1 — Computed setup screener",
    expS1Desc:     "From daily OHLCV of the tickers in the strongest groups. Pivot = highest high of the last 25 days excluding the last 3. Distance = price to pivot in %.",
    expS1NoData:   "No setups.json yet — the file appears after the next post-close run.",
    expEod:        "EOD",
    expEodNote:    "Computed once per trading day after the US close (post-close run from 21:30 UTC) — the rest of the app refreshes hourly. It deliberately stays put during the session: base, pivot distance and volume need settled daily candles.",
    expS1Universe: (tk, ind, th) => `${tk} tickers from ${ind} industries + ${th} themes`,
    expUnivTitle:  "Universe — how the “strongest groups” are picked",
    expUnivCount:  (i, ip, t2, tp) => `${i} of ${ip} industries · ${t2} of ${tp} themes`,
    expUnivIndRule: (n) => `Industry: the ${n} with the lowest score. Score = rank1W × 0.20 + rank1M × 0.70 + rank3M × 0.10, ranks across all industries (1 = strongest). Exactly the number in the heatmap’s “Score” column.`,
    expUnivThemeRule: (n) => `Theme: the ${n} with the lowest score. Score = average of the theme’s sub-node scores, each sub-node rank1M × 0.70 + rank1W × 0.20 + rank3M × 0.10 across all 268 sub-nodes. Exactly the number in the themes table.`,
    expUnivNotUsed: "Deliberately NOT checked: accel, INST badge, regime gate, weekend-prep stage. The pick is pure current strength over 1W/1M/3M — it is NOT the weekend routine’s inclusion formula (which also requires accel ≥ +10 and 1M > 0%). The accel column below is informational only.",
    expUnivColRank: "Rank",
    expUnivColTickers: "Tickers",
    expUnivFootnote: (tk, bars) => `From these groups: ${tk} unique tickers, price data returned for ${bars} of them. Only then do the ADR, liquidity and setup filters apply.`,
    expS1Empty:    "No candidates in this view.",
    expViewTable:  "📋 Table",
    expViewCharts: "🖼 Mini charts",
    expOnlyReady:  "READY only",
    expTradeable:  "READY + BREAKOUT",
    expAll:        "All",
    expCopyBtn:    "📋 Copy tickers",
    expTop20:      "Top 20%",
    expTop20Title: (min) => `Mark every row of the current view with score ≥ ${min}. Click again to clear. Single rows can be clicked directly too.`,
    expTop20Marked:(n, min) => `${n} rows with score ≥ ${min} marked`,
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
    expColAdr:     "ADR %",
    expCol1M:      "1M %",
    expColPrice:   "Price",
    expColPivotPx: "Pivot",

    expVerdictREADY:    "READY",
    expVerdictBREAKOUT: "BREAKOUT",
    expVerdictWATCH:    "WATCH",
    expReason_at_pivot:       "At pivot, base contracting",
    expReason_running:        "Breakout already running",
    expReason_below_pivot:    "Still below the pivot",
    expReason_base_too_short: "Base too short",
    expReason_no_contraction: "No contraction",

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
  // Top 20% buttons: language-neutral label, localized tooltip
  ["ind-top20-btn", "theme-top20-btn"].forEach(id => {
    const b = document.getElementById(id); if (b) b.title = t("top20Title");
  });
  ["ind-top20i-btn", "theme-top20i-btn"].forEach(id => {
    const b = document.getElementById(id); if (b) b.title = t("top20IntersectTitle");
  });
  ["ind-top20i2-btn", "theme-top20i2-btn"].forEach(id => {
    const b = document.getElementById(id); if (b) b.title = t("top20Intersect2Title");
  });
  document.documentElement.lang = _lang;
  document.getElementById("lang-btn").textContent = _lang === "de" ? "EN" : "DE";
  initSectionHints();
  if (_lastPayload) renderAll(_lastPayload);
  if (_lastHistory) renderMovers(_lastHistory, _activePeriodDays);
  if (_etfData) renderEtfTab();
  renderSetupTabs();
  renderWeekendPrep();
  renderExperimental();
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
  off:      { filters: FV_BASE, sort: "perf4w" },
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
function finvizChartUrl(ticker, scale = 1) {
  const w = 466 * scale, h = 219 * scale;
  return `https://charts2-node.finviz.com/chart?w=${w}&h=${h}&bw=1&bm=1&bb=1&t=${encodeURIComponent(ticker)}`
       + `&tf=d&s=linear&pm=240&am=1200&tl=1&ct=candle_stick&tm=d`
       + `&o[0][ot]=sma&o[0][op]=50&o[0][oc]=FF8F33C6&o[1][ot]=sma&o[1][op]=200&o[1][oc]=DCB3326D`;
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

// Check the top `pct` fraction of rows (current sort order) in a multi-select
// table body, replacing any existing selection, then refresh its selection bar.
function selectTopPercent(tbodyId, headerCheckId, updateFn, pct = 0.20) {
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

// Select rows that are in BOTH the top `pct` by each timeframe (intersection),
// among currently-displayed rows. dataFor(key) -> row object with .perfs.
// Replaces the current selection, then refreshes the selection bar.
function selectTopIntersection(tbodyId, headerCheckId, updateFn, dataFor, tfs = ["1W", "1M"], pct = 0.20) {
  const checks = [...document.querySelectorAll(`#${tbodyId} .row-check`)];
  if (!checks.length) return;
  const keys = checks.map(cb => cb.dataset.key);
  const cutoff = Math.max(1, Math.ceil(keys.length * pct));

  const topSets = tfs.map(tf => new Set(
    keys
      .map(k => ({ k, v: dataFor(k)?.perfs?.[tf] }))
      .filter(o => o.v !== null && o.v !== undefined)
      .sort((a, b) => b.v - a.v)
      .slice(0, cutoff)
      .map(o => o.k)
  ));
  const inter = topSets.reduce((acc, s) => new Set([...acc].filter(k => s.has(k))));

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
  if (themeInterBtn) themeInterBtn.onclick = () =>
    selectTopIntersection("etf-themes-body", "theme-select-all", updateThemeSelectionBar, k => _etfData?.themes?.[k]);

  const indInter2Btn = document.getElementById("ind-top20i2-btn");
  if (indInter2Btn) indInter2Btn.onclick = () =>
    selectTopIntersection("heatmap-body", "ind-select-all", updateIndSelectionBar, k => _lastIndustries?.[k], ["1M", "3M"]);

  const themeInter2Btn = document.getElementById("theme-top20i2-btn");
  if (themeInter2Btn) themeInter2Btn.onclick = () =>
    selectTopIntersection("etf-themes-body", "theme-select-all", updateThemeSelectionBar, k => _etfData?.themes?.[k], ["1M", "3M"]);
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
    }
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
function buildReason(perfs, accel) {
  const tags = [];
  const lines = [];
  const p1d = perfs["1D"] ?? 0;
  const p1w = perfs["1W"] ?? 0;
  const p1m = perfs["1M"] ?? 0;
  const p3m = perfs["3M"] ?? 0;

  if (p1w >= 3 && p1m >= 5) tags.push(`<span class="pick-tag tag-hot">${t("tagHot")}</span>`);
  if (accel >= 20)           tags.push(`<span class="pick-tag tag-accel">${t("tagAccel")}</span>`);
  if (p3m < 5 && p1w >= 2 && p1m >= 3) tags.push(`<span class="pick-tag tag-fresh">${t("tagFresh")}</span>`);
  // INST: institutional confirmation — top 40 in both 1M and 3M (Ariel criterion)
  if ((perfs._rank1M ?? 999) <= 40 && (perfs._rank3M ?? 999) <= 40)
    tags.push(`<span class="pick-tag tag-inst">${t("tagInst")}</span>`);

  if (p3m < 5 && p1m >= 3)        lines.push(t("reasonFresh", (p3m >= 0 ? "+" : "") + p3m.toFixed(1), p1m.toFixed(1)));
  else if (p3m >= 5 && accel >= 10) lines.push(t("reasonSolid"));
  else                               lines.push(t("reasonSteady"));

  if (accel >= 30) lines.push(t("reasonAccel", accel));
  if (p1d >= 1)    lines.push(t("reasonIntraday", p1d.toFixed(2)));

  return `${tags.join("")}<br><span>${lines.join(" ")}</span>`;
}

function pickPriority(row, accelRankMap, compRankMap, name) {
  return 0.6 * (accelRankMap[name] ?? 999) + 0.4 * (compRankMap[name] ?? 999);
}

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

function renderPicks(industries) {
  const container = document.getElementById("picks-container");
  const entries = Object.entries(industries);

  const scoreRankMap = Object.fromEntries(
    [...entries].sort(([, a], [, b]) => a.composite - b.composite).map(([n], i) => [n, i + 1])
  );

  const filtered = entries.filter(([name, row]) => {
    const p1w = row.perfs["1W"] ?? 0;
    const p1m = row.perfs["1M"] ?? 0;
    return scoreRankMap[name] <= 40 && row.acceleration > 0 && p1w > 1 && p1m > 0;
  });

  const byAccel = [...filtered].sort(([, a], [, b]) => b.acceleration - a.acceleration);
  const byComp  = [...filtered].sort(([, a], [, b]) => a.composite - b.composite);
  const accelRankMap = Object.fromEntries(byAccel.map(([n], i) => [n, i + 1]));
  const compRankMap  = Object.fromEntries(byComp.map(([n], i)  => [n, i + 1]));

  const candidates = filtered
    .sort(([na, a], [nb, b]) =>
      pickPriority(a, accelRankMap, compRankMap, na) -
      pickPriority(b, accelRankMap, compRankMap, nb)
    )
    .slice(0, 15);

  if (!candidates.length) {
    container.innerHTML = `<p class="pick-empty">${t("picksEmpty")}</p>`;
    return;
  }

  const header = `<div class="pick-card" style="background:var(--bg3);font-size:11px;color:var(--text-dim);font-weight:600;">
    <div>${t("colIndustry")}</div><div style="text-align:right">1D</div><div style="text-align:right">1W</div>
    <div style="text-align:right">1M</div><div style="text-align:right">3M</div><div style="text-align:right">${t("colAccel")}</div>
    <div style="padding-left:12px">${t("picksColReason")}</div></div>`;

  const cards = candidates.map(([name, row]) => {
    // Attach 1M/3M ranks so buildReason can detect INST badge
    const p = { ...row.perfs, _rank1M: row.ranks["1M"], _rank3M: row.ranks["3M"] };
    const acc = row.acceleration;
    const accelCls = acc > 0 ? "accel-pos" : "accel-neg";
    const accelStr = acc > 0 ? `+${acc}` : `${acc}`;
    const stat = tf => `<div class="pick-stat ${perfClass(p[tf])}"><span>${tf}</span>${fmtPct(p[tf])}</div>`;
    const url = finvizUrl(row.ticker);
    const nameEl = url
      ? `<a class="pick-name pick-link" href="${url}" target="_blank" rel="noopener">${name} ↗</a>`
      : `<div class="pick-name">${name}</div>`;
    const hasTk = row.tickers && row.tickers.length > 0;
    const copyBtn = hasTk
      ? `<button class="ind-copy-btn" data-key="${esc(name)}" title="${_lang === 'de' ? 'Ticker dieser Industry kopieren' : "Copy this industry's tickers"}">📋</button>`
      : '';

    return `<div class="pick-card">
      ${nameEl}${copyBtn}
      ${stat("1D")}${stat("1W")}${stat("1M")}${stat("3M")}
      <div class="pick-stat ${accelCls}"><span>${t("colAccel")}</span>${accelStr}</div>
      <div class="pick-reason">${buildReason(p, acc)}</div>
    </div>`;
  }).join("");

  const copyAll = candidates.some(([name]) => tickersOf("industry", name).length)
    ? `<div class="picks-toolbar">
         <button class="setup-copyall-btn" title="${esc(t("copyAllTitle"))}">${t("copyAllBtn")}</button>
       </div>`
    : "";

  container.innerHTML = `${copyAll}<div class="picks-grid">${header}${cards}</div>`;
  wireIndCopyButtons(container);

  const copyAllBtn = container.querySelector(".picks-toolbar .setup-copyall-btn");
  if (copyAllBtn) copyAllBtn.onclick = () =>
    copyGroupsAsSections(copyAllBtn, candidates.map(([name]) => ({ name, scope: "industry" })));
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
  renderPicks(payload.industries);
  renderIndustryBubble(payload.industries);
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
      if (btn.dataset.top === "weekend") {
        subNav.classList.add("hidden");
        themesSubNav.classList.add("hidden");
        showPanel("weekend");
        renderWeekendPrep();
      } else if (btn.dataset.top === "experimental") {
        subNav.classList.add("hidden");
        themesSubNav.classList.add("hidden");
        showPanel("experimental");
        renderExperimental();
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
function exportSelectionJson(rows) {
  if (!rows || !rows.length) return;
  // Aktuelles Regime in jede Zeile stempeln (Kontext für den Leader-Analyst).
  if (_regimeData?.state) rows.forEach(r => { r.regime = _regimeData.state; });
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
  document.getElementById("etf-matrix-view").classList.toggle("hidden", _themeVizView !== "matrix");

  if (_themeVizView === "bubble") { renderBubbleChart(data, themeAccel); return; }
  if (_themeVizView === "matrix") { renderMomentumMatrix(data, themeAccel); return; }

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
    const rows = checked.map(cb => {
      const name = cb.dataset.key;
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
      };
    }).filter(Boolean);
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
      out.push(`<text x="${c.x.toFixed(1)}" y="${c.y.toFixed(1)}" text-anchor="${c.anchor}"
        font-size="9" fill="${p.color}" style="pointer-events:none">${p.label}</text>`);
      break;
    }
  }
  return out.join("");
}

function renderBubbleSvg(container, pts, neutralLabel) {
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
  // Radius range scales gently with the plot area.
  const rMax = Math.max(20, Math.min(30, Math.round(Math.sqrt(plotW * plotH) / 32)));
  const rMin = Math.max(6, Math.round(rMax * 0.28));
  const toR = s => rMax - ((s - minScore) / scoreRange) * (rMax - rMin);
  const toColor = a => a >= 10 ? "#4ade80" : a <= -10 ? "#f87171" : a >= 5 ? "#86efac" : "#6b7280";

  pts.forEach(p => {
    p.x = toX(p.x3m); p.y = toY(p.y1m); p.r = toR(p.score); p.color = toColor(p.accel);
  });

  const medX = toX(med3M).toFixed(1);
  const medY = toY(med1M).toFixed(1);

  const qLabels = [
    { x: PAD.left + 4,      y: PAD.top + 14,        text: "🚀 First Flag",  fill: "#4ade80" },
    { x: W - PAD.right - 4, y: PAD.top + 14,        text: "Extended ⚠️",    fill: "#f87171", anchor: "end" },
    { x: PAD.left + 4,      y: H - PAD.bottom - 6,  text: "💀 Dead",        fill: "#6b7280" },
    { x: W - PAD.right - 4, y: H - PAD.bottom - 6,  text: "🔻 Fading",      fill: "#f87171", anchor: "end" },
  ].map(q => `<text x="${q.x}" y="${q.y}" font-size="10" fill="${q.fill}"
    text-anchor="${q.anchor || "start"}" style="pointer-events:none">${q.text}</text>`).join("");

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
    const inner = `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}"
        fill="${p.color}" fill-opacity="0.72" stroke="${p.color}" stroke-width="0.8"><title>${p.tip}</title></circle>`;
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
          font-size="11" fill="#9ca3af">3M Performance →</text>
        <text x="12" y="${PAD.top + plotH / 2}" text-anchor="middle" font-size="11"
          fill="#9ca3af" transform="rotate(-90,12,${PAD.top + plotH / 2})">1M Performance ↑</text>
        ${qLabels}
        ${circles}
        ${labels}
      </svg>
      <div class="bubble-legend">
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#4ade80" fill-opacity="0.8"/></svg> Accel ≥ +10 (First Flag)</span>
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#86efac" fill-opacity="0.8"/></svg> Accel +5…+9</span>
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#6b7280" fill-opacity="0.8"/></svg> ${neutralLabel}</span>
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#f87171" fill-opacity="0.8"/></svg> Accel ≤ −10 (Extended/Fading)</span>
        <span class="bubble-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="6" fill="#9ca3af" fill-opacity="0.5"/></svg> Größe = Stärke (Score)</span>
      </div>
    </div>`;
}

function renderBubbleChart(data, themeAccel) {
  const container = document.getElementById("etf-bubble-view");
  const pts = Object.entries(data.themes)
    .filter(([,r]) => r.perfs["3M"] !== null && r.perfs["1M"] !== null)
    .map(([theme, row]) => {
      const accel = themeAccel[theme] ?? 0;
      const accelSign = accel > 0 ? "+" : "";
      const p3 = row.perfs["3M"] > 0 ? "+" : "";
      const p1 = row.perfs["1M"] > 0 ? "+" : "";
      return {
        x3m: row.perfs["3M"], y1m: row.perfs["1M"], score: row.score, accel,
        label: theme.length > 16 ? theme.slice(0, 14) + "…" : theme,
        tip: `${theme}\n3M: ${p3}${row.perfs["3M"]?.toFixed(1)}%  1M: ${p1}${row.perfs["1M"]?.toFixed(1)}%\nAccel: ${accelSign}${accel}  |  Score: ${row.score.toFixed(1)}  |  ${(row.tickers||[]).length} Aktien`,
        url: themeScreenerUrl(theme),
      };
    });
  renderBubbleSvg(container, pts, "Neutral");
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
  let entries = Object.entries(industries)
    .filter(([,r]) => r.perfs["3M"] !== null && r.perfs["1M"] !== null);
  if (_instFilter) entries = entries.filter(([,r]) => isInst(r));

  const pts = entries.map(([name, row]) => {
    const accel = (row.ranks?.["3M"] ?? 0) - (row.ranks?.["1M"] ?? 0);
    const accelSign = accel > 0 ? "+" : "";
    const p3 = row.perfs["3M"] > 0 ? "+" : "";
    const p1 = row.perfs["1M"] > 0 ? "+" : "";
    return {
      x3m: row.perfs["3M"], y1m: row.perfs["1M"], score: row.composite, accel,
      label: name.length > 16 ? name.slice(0, 14) + "…" : name,
      tip: `${name}\n3M: ${p3}${row.perfs["3M"]?.toFixed(1)}%  1M: ${p1}${row.perfs["1M"]?.toFixed(1)}%\nAccel: ${accelSign}${accel}  |  Score: ${row.composite.toFixed(1)}`,
      url: finvizUrl(row.ticker),
    };
  });
  renderBubbleSvg(container, pts, "Neutral / Konsolidierung");
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
      if (_TM) {
        for (const row of entry.rows) {
          if (row.type !== "theme") continue;
          stages[row.name] = _TM.classifyStage(_TM.segments(row.perfs), row.accel);
        }
      }
      days.push({
        date, gap: entry.gap, settled: entry.settled,
        fetchedAt: entry.fetched_at, rowCount: entry.rows.length, stages,
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

// ── Weekend Prep ──────────────────────────────────────────────────────────
// Konsolidiert Themes UND Industries zu einer Revier-Rangfolge. Die Tabs
// First Flag / Base Breakout beantworten "qualifiziert ja/nein"; dieser Tab
// beantwortet "wo jage ich diese Woche" — auch wenn nichts qualifiziert.

// Industry-Universum: Top 40 nach Composite. Ohne Vorfilter stünden 144
// Industries im Rennen, davon die meisten ohne Momentum.
const WEEKEND_IND_POOL = 40;

function buildWeekendGroups() {
  const groups = [];
  if (_etfData?.themes) {
    for (const [name, row] of Object.entries(_etfData.themes)) {
      groups.push({ name, type: "theme", score: row.score, accel: _themeAccel[name] ?? 0,
                    perfs: row.perfs, tickers: row.tickers ?? [] });
    }
  }
  if (_lastIndustries) {
    const entries = Object.entries(_lastIndustries);
    const rank = Object.fromEntries(
      [...entries].sort(([, a], [, b]) => a.composite - b.composite).map(([n], i) => [n, i + 1])
    );
    for (const [name, row] of entries) {
      if (rank[name] > WEEKEND_IND_POOL) continue;
      groups.push({ name, type: "industry", score: row.composite, accel: row.acceleration,
                    perfs: row.perfs, tickers: row.tickers ?? [] });
    }
  }
  return groups;
}

// Begründung in Klartext — jeder Satz hängt an genau einer Kennzahl,
// damit nachvollziehbar bleibt, warum die Gruppe hier steht.
function weekendReason(r) {
  const out = [];
  const f = _TM.THRESHOLDS.freshness;
  out.push(t("wpWhyStage_" + String(r.stage).toLowerCase()) || t("wpWhyStageOther", r.stage));
  if (r.freshness !== null) {
    if (r.freshness >= f.min && r.freshness <= f.max) out.push(t("wpWhyFreshOk", r.freshness.toFixed(2)));
    else if (r.freshness < f.min) out.push(t("wpWhyFreshStale", r.freshness.toFixed(2)));
    else out.push(t("wpWhyFreshHot", r.freshness.toFixed(2)));
  }
  if (r.damage !== null) {
    out.push(r.damage >= 0 ? t("wpWhyDamageOk", r.damage.toFixed(1)) : t("wpWhyDamageWeak", r.damage.toFixed(1)));
  }
  if (r.qualifiesFF) out.push(t("wpWhyQualFF"));
  if (r.qualifiesBB) out.push(t("wpWhyQualBB"));
  if (r.borderline)  out.push(t("wpWhyBorderline"));
  return out.join(" ");
}

function weekendScoreBar(parts, total) {
  const w = _TM.WEEKEND.scoreWeights;
  const seg = (key, cls) =>
    `<span class="wp-bar__seg ${cls}" style="width:${(parts[key] / (w.stage + w.freshness + w.damage + w.accel)) * 100}%"
       title="${esc(t("wpPart_" + key))}: ${parts[key].toFixed(1)} / ${w[key]}"></span>`;
  return `<div class="wp-bar" role="img" aria-label="${esc(t("wpScoreAria", total.toFixed(0)))}">
    ${seg("stage", "wp-bar--stage")}${seg("freshness", "wp-bar--fresh")}${seg("damage", "wp-bar--dmg")}${seg("accel", "wp-bar--accel")}
  </div>`;
}

function weekendCard(r, idx) {
  const typeLabel = r.type === "theme" ? t("wpTypeTheme") : t("wpTypeIndustry");
  const dup = r.duplicateOf
    ? `<div class="wp-dup">${t("wpDuplicate", esc(r.duplicateOf), t("wpDupReason_" + r.duplicateReason))}</div>` : "";
  return `<div class="wp-card">
    <div class="wp-card__head">
      <span class="wp-rank">${idx + 1}</span>
      <span class="wp-name">${esc(r.name)}</span>
      <span class="wp-type wp-type--${r.type}">${typeLabel}</span>
      ${stageLabelHtml(r.stage)}
      <span class="wp-score" title="${esc(t("wpScoreTitle"))}">${r.score.toFixed(0)}</span>
      <button class="ind-copy-btn" data-scope="${r.type}" data-key="${esc(r.name)}"
              title="${esc(t("copyGroupTitle"))}">📋 ${r.tickers.length}</button>
    </div>
    ${weekendScoreBar(r.scoreParts, r.score)}
    <div class="wp-why">${weekendReason(r)}</div>
    <div class="wp-metrics">
      <span>${t("colFreshness")} <b class="${r.freshness !== null && (r.freshness < _TM.THRESHOLDS.freshness.min || r.freshness > _TM.THRESHOLDS.freshness.max) ? "fresh-out" : ""}">${fmtOrDash(r.freshness)}</b></span>
      <span>${t("setupTipDamage")} <b>${fmtOrDash(r.damage, 1)}</b></span>
      <span>1M <b class="${perfClass(r.segments.m1)}">${fmtPct(r.segments.m1)}</b></span>
      <span>${t("colSegments")} <b>${segCell(r.segments.m4_6)} ${segCell(r.segments.m2_3)} ${segCell(r.segments.m1)}</b></span>
    </div>
    ${dup}
  </div>`;
}

// Veraltete Breadth-Daten werden wie NEUTRAL behandelt — dieselbe Regel wie
// im Header-Badge und in der Routine.
function effectiveRegime() {
  const r = _regimeData;
  if (!r?.state) return null;
  const stale = r.b1_stale || r.t1 === null || r.t2 === null || r.b1 === null;
  return { raw: r.state, effective: stale ? "NEUTRAL" : r.state, stale };
}

// Textreport fürs Journal — bewusst Klartext, nicht JSON.
function weekendReport(wp) {
  const L = [];
  const rg = effectiveRegime();
  const regime = rg?.effective ?? "?";
  L.push(`WEEKEND PREP — ${new Date().toLocaleDateString(_lang === "de" ? "de-DE" : "en-US")}`);
  L.push(`Regime: ${rg ? rg.raw : "?"}${rg?.stale ? " (" + t("regimeStale") + ")" : ""} · ${t("wpRiskFor_" + regime) || ""}`);
  L.push("");
  L.push(`${t("wpFocusTitle")}:`);
  wp.focus.forEach((r, i) => {
    L.push(`${i + 1}. ${r.name} [${r.type === "theme" ? t("wpTypeTheme") : t("wpTypeIndustry")}] · Score ${r.score.toFixed(0)} · ${r.stage}`);
    L.push(`   ${weekendReason(r)}`);
    L.push(`   ${t("colFreshness")} ${fmtOrDash(r.freshness)} · ${t("setupTipDamage")} ${fmtOrDash(r.damage, 1)} · 1M ${fmtPct(r.segments.m1)} · ${r.tickers.length} ${t("wpTickers")}`);
    L.push(`   ${r.tickers.join(",")}`);
    L.push("");
  });
  if (wp.watch.length) {
    L.push(`${t("wpWatchTitle")}: ${wp.watch.slice(0, 8).map(r => r.name + (r.borderline ? " (!)" : "")).join(" · ")}`);
    L.push("");
  }
  if (wp.excluded.length) {
    L.push(`${t("wpExcludedTitle")}: ${wp.excluded.slice(0, 8).map(r => `${r.name} (${t("wpExcl_" + r.exclusion)})`).join(" · ")}`);
  }
  return L.join("\n");
}

function renderWeekendPrep() {
  const box = document.getElementById("weekend-container");
  if (!box) return;
  if (!_TM || !_etfData?.themes) { box.innerHTML = `<div class="error">${t("setupMetricsFail")}</div>`; return; }

  const wp = _TM.buildWeekendPrep(buildWeekendGroups(), { focusSlots: 3 });

  // Label/Effekt spiegeln renderRegime — inkl. "veraltet wird wie NEUTRAL behandelt".
  const rg = effectiveRegime();
  const suffix = rg?.effective === "RISK_ON" ? "On" : rg?.effective === "RISK_OFF" ? "Off" : "Neutral";
  const label = !rg ? t("regimeUnknown")
    : rg.stale ? t("regimeStale")
    : rg.raw === "RISK_ON" ? "RISK-ON" : rg.raw === "NEUTRAL" ? "NEUTRAL" : "RISK-OFF";
  const regimeBlock = `<div class="wp-regime wp-regime--${String(rg?.effective ?? "unknown").toLowerCase()}">
    <span class="wp-regime__state">${label}</span>
    <span class="wp-regime__effect">${rg ? t("regimeEffect" + suffix) : ""}</span>
  </div>`;

  const more = wp.reviere.filter(r => !wp.focus.includes(r)).slice(0, 12);
  const moreRows = more.map((r, i) => `<tr>
      <td>${wp.focus.length + i + 1}</td>
      <td style="text-align:left" class="setup-name-cell">${esc(r.name)}
        <span class="wp-type wp-type--${r.type}">${r.type === "theme" ? t("wpTypeTheme") : t("wpTypeIndustry")}</span>
        <button class="ind-copy-btn" data-scope="${r.type}" data-key="${esc(r.name)}" title="${esc(t("copyGroupTitle"))}">📋</button></td>
      <td>${stageLabelHtml(r.stage)}</td>
      <td>${r.score.toFixed(0)}</td>
      <td>${fmtOrDash(r.freshness)}</td>
      <td>${fmtOrDash(r.damage, 1)}</td>
      <td class="${perfClass(r.segments.m1)}">${fmtPct(r.segments.m1)}</td>
      <td style="text-align:left" class="wp-dup-cell">${r.duplicateOf ? t("wpDuplicate", esc(r.duplicateOf), t("wpDupReason_" + r.duplicateReason)) : ""}</td>
    </tr>`).join("");

  const watchRows = wp.watch.slice(0, 10).map(r => `<tr>
      <td style="text-align:left" class="setup-name-cell">${esc(r.name)}
        <span class="wp-type wp-type--${r.type}">${r.type === "theme" ? t("wpTypeTheme") : t("wpTypeIndustry")}</span>
        <button class="ind-copy-btn" data-scope="${r.type}" data-key="${esc(r.name)}" title="${esc(t("copyGroupTitle"))}">📋</button></td>
      <td>${stageLabelHtml(r.stage)}</td>
      <td>${fmtOrDash(r.freshness)}</td>
      <td style="text-align:left" class="fails-at">
        <span class="wp-near-tab">${r.nearMissTab === _TM.TAB.FIRST_FLAG ? t("tabFirstFlag") : t("tabBaseBreak")}</span>
        ${r.borderline ? `<b>${t("wpBorderlineTag")}</b> ` : ""}${r.nearMissCriterion ? esc(setupCriterionText(r.nearMissCriterion)) : "—"}</td>
    </tr>`).join("");

  const exclRows = wp.excluded.slice(0, 12).map(r => `<tr>
      <td style="text-align:left">${esc(r.name)}
        <span class="wp-type wp-type--${r.type}">${r.type === "theme" ? t("wpTypeTheme") : t("wpTypeIndustry")}</span></td>
      <td>${stageLabelHtml(r.stage)}</td>
      <td style="text-align:left" class="wp-excl-reason">${t("wpExcl_" + r.exclusion)}</td>
      <td>${fmtOrDash(r.damage, 1)}</td>
    </tr>`).join("");

  box.innerHTML = `
    ${snapHealthHtml()}
    ${regimeBlock}
    <div class="wp-toolbar">
      <button class="setup-copyall-btn wp-copy-focus" title="${esc(t("wpCopyFocusTitle"))}">${t("wpCopyFocus")}</button>
      <button class="setup-copyall-btn wp-copy-watch" title="${esc(t("wpCopyWatchTitle"))}">${t("wpCopyWatch")}</button>
      <button class="setup-copyall-btn wp-copy-report" title="${esc(t("wpCopyReportTitle"))}">${t("wpCopyReport")}</button>
    </div>

    <div class="setup-section-hdr">${t("wpFocusTitle")}
      <span class="setup-count">${t("wpFocusHint")}</span></div>
    ${wp.focus.length ? `<div class="wp-cards">${wp.focus.map(weekendCard).join("")}</div>`
                      : `<div class="setup-empty">${t("wpNoFocus")}</div>`}

    <details class="setup-nearmiss wp-details">
      <summary class="setup-section-hdr">▸ ${t("wpMoreTitle")}
        <span class="setup-count">${t("setupGroups", more.length)}</span></summary>
      <div class="table-scroll"><table class="setup-table">
        <thead><tr><th>#</th><th style="text-align:left">${t("wpColGroup")}</th><th>${t("colStage")}</th>
          <th>${t("wpColScore")}</th><th>${t("colFreshness")}</th><th>${t("setupTipDamage")}</th><th>1M</th>
          <th style="text-align:left">${t("wpColNote")}</th></tr></thead>
        <tbody>${moreRows || `<tr><td colspan="8" class="empty-msg">—</td></tr>`}</tbody>
      </table></div>
    </details>

    <details class="setup-nearmiss wp-details" open>
      <summary class="setup-section-hdr">▸ ${t("wpWatchTitle")}
        <span class="setup-count">${t("setupGroups", wp.watch.length)} · ${t("wpWatchHint")}</span></summary>
      <div class="table-scroll"><table class="setup-table">
        <thead><tr><th style="text-align:left">${t("wpColGroup")}</th><th>${t("colStage")}</th>
          <th>${t("colFreshness")}</th><th style="text-align:left">${t("colFailsAt")}</th></tr></thead>
        <tbody>${watchRows || `<tr><td colspan="4" class="empty-msg">—</td></tr>`}</tbody>
      </table></div>
    </details>

    <details class="setup-nearmiss wp-details">
      <summary class="setup-section-hdr">▸ ${t("wpExcludedTitle")}
        <span class="setup-count">${t("setupGroups", wp.excluded.length)} · ${t("wpExcludedHint")}</span></summary>
      <div class="table-scroll"><table class="setup-table">
        <thead><tr><th style="text-align:left">${t("wpColGroup")}</th><th>${t("colStage")}</th>
          <th style="text-align:left">${t("wpColReason")}</th><th>${t("setupTipDamage")}</th></tr></thead>
        <tbody>${exclRows || `<tr><td colspan="4" class="empty-msg">—</td></tr>`}</tbody>
      </table></div>
    </details>`;

  wireIndCopyButtons(box);

  const focusBtn = box.querySelector(".wp-copy-focus");
  focusBtn.onclick = () => copyGroupsAsSections(focusBtn, wp.focus.map(r => ({ name: r.name, scope: r.type })));

  const watchBtn = box.querySelector(".wp-copy-watch");
  watchBtn.onclick = () => copyGroupsAsSections(watchBtn, wp.watch.slice(0, 10).map(r => ({ name: r.name, scope: r.type })));

  const reportBtn = box.querySelector(".wp-copy-report");
  reportBtn.onclick = () => navigator.clipboard.writeText(weekendReport(wp)).then(() => {
    flashDone(reportBtn);
    showToast(t("wpReportCopied"));
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

// Markierung für den Clipboard-Export. Der Top-20%-Button markiert alles mit
// Score >= 80 — gemessen an der READY+BREAKOUT-Ansicht sind das aktuell 18 von
// 90 Zeilen (20 %); in "Alle" sind es 13 %, in "Nur READY" 26 %. Die Grenze ist
// also ein fester Score-Schwellwert, kein gerechnetes Perzentil.
const EXP_TOP20_MIN = 80;
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
  const ind = u.industries ?? [], thm = u.themes ?? [];
  const pool = u.pool ?? {};

  const row = (g, type) => `<tr>
      <td class="exp-th-left"><span class="wp-type wp-type--${type}">${type === "theme" ? t("wpTypeTheme") : t("wpTypeIndustry")}</span>
        ${esc(g.name)}</td>
      <td><b>${fmtOrDash(g.score, 2)}</b></td>
      <!-- Industry und Theme haben verschiedene Ränge: Industry = Perf-Rang 1M
           unter allen Industries, Theme = Score-Rang unter den 40 Themes.
           Deshalb steht die Bedeutung in der Zelle, nicht nur im Kopf. -->
      <td class="exp-univ-rank">${type === "theme"
        ? (g.rank ? `${t("colScore")} #${g.rank}` : "—")
        : (g.ranks?.["1M"] ? `1M #${g.ranks["1M"]}` : "—")}</td>
      <td>${g.accel === undefined || g.accel === null ? "—" : (g.accel > 0 ? "+" : "") + g.accel}</td>
      <td class="${perfClass(g.perf1m)}">${fmtPct(g.perf1m)}</td>
      <td>${g.tickers}</td>
    </tr>`;

  return `
    <details class="setup-nearmiss wp-details exp-universe">
      <summary class="setup-section-hdr">▸ ${t("expUnivTitle")}
        <span class="setup-count">${t("expUnivCount", ind.length, pool.industries ?? 0, thm.length, pool.themes ?? 0)}</span></summary>
      <p class="exp-desc">${t("expUnivIndRule", cfg.N_INDUSTRIES ?? 0)}</p>
      <p class="exp-desc">${t("expUnivThemeRule", cfg.N_THEMES ?? 0)}</p>
      <p class="exp-note exp-univ-warn">${t("expUnivNotUsed")}</p>
      <div class="table-scroll"><table class="setup-table exp-table">
        <thead><tr>
          <th class="exp-th-left">${t("expColGroup")}</th>
          <th>${t("colScore")}</th><th>${t("expUnivColRank")}</th>
          <th>${t("colAccel")}</th><th>${t("expCol1M")}</th><th>${t("expUnivColTickers")}</th>
        </tr></thead>
        <tbody>
          ${ind.map(g => row(g, "industry")).join("")}
          ${thm.map(g => row(g, "theme")).join("")}
        </tbody>
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
        <span>${t("expS1Universe", u.tickers ?? 0, (u.industries ?? []).length, (u.themes ?? []).length)}</span>
        ${chip("READY")}${chip("BREAKOUT")}${chip("WATCH")}${chip("EXTENDED")}
      </div>
      ${expUniverseHtml()}
      <div class="exp-toolbar">
        ${scopeBtn("ready", t("expOnlyReady"))}${scopeBtn("trade", t("expTradeable"))}${scopeBtn("all", t("expAll"))}
        <span class="exp-toolbar-sep"></span>
        ${viewBtn("table", t("expViewTable"))}${viewBtn("charts", t("expViewCharts"))}
        <button class="exp-top20-btn${selCount ? " exp-top20-btn--active" : ""}"
                title="${esc(t("expTop20Title", EXP_TOP20_MIN))}">★ ${t("expTop20")}</button>
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
  box.innerHTML = expStage0Html() + expStage1Html();

  // Stufe-0-Schalter: wirkt app-weit, also alles neu zeichnen, was Links baut.
  const rerenderLinkViews = () => {
    if (_lastPayload) renderAll(_lastPayload);
    if (_etfData) renderEtfTab();
    renderSetupTabs();
    renderWeekendPrep();
    renderExperimental();
  };

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

  // Top 20 % = alles mit Score >= EXP_TOP20_MIN in der aktuellen Ansicht.
  // Sind die schon alle markiert, hebt ein zweiter Klick die Markierung auf.
  const topBtn = box.querySelector(".exp-top20-btn");
  if (topBtn) topBtn.onclick = () => {
    const hits = expRows().filter(r => r.score >= EXP_TOP20_MIN);
    const allSet = hits.length > 0 && hits.every(r => _expSelected.has(r.t));
    if (allSet) hits.forEach(r => _expSelected.delete(r.t));
    else hits.forEach(r => _expSelected.add(r.t));
    renderExperimental();
    if (!allSet) showToast(t("expTop20Marked", hits.length, EXP_TOP20_MIN));
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
  const badge  = document.getElementById("regime-badge");
  const banner = document.getElementById("regime-banner");
  if (!badge) return;
  const r = _regimeData;
  if (!r) {
    badge.classList.add("hidden");
    if (banner) banner.classList.add("hidden");
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

  // Banner immer bei RISK_OFF — auch eingefroren gilt: keine neuen Entries.
  if (banner) {
    if (state === "RISK_OFF") {
      banner.textContent = t("regimeBannerOff");
      banner.classList.remove("hidden");
    } else {
      banner.classList.add("hidden");
    }
  }
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
initSectionHints();
initPeriodSelector();
initViewToggle();
initEtfViewToggle();
initEtfSortHeaders();
initThemeVizToggle();
initTop20Buttons();

// --- Load data ---
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
    const [dataRes, histRes, etfRes, regimeRes, setupsRes] = await Promise.all([
      fetch("data.json" + bust),        // → dataRes   (index 0)
      fetch("history.json" + bust),     // → histRes   (index 1)
      fetch("etf_data.json" + bust),    // → etfRes    (index 2)
      fetch("regime.json" + bust),      // → regimeRes (index 3)
      fetch("setups.json" + bust),      // → setupsRes (index 4)
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
