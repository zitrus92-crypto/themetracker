// Zentrale Schwellen und Gewichte des Leading-Stocks-Tabs.
//
// Einzige Stelle fuer Zahlen, die das Ranking beeinflussen: leadersMetrics.js
// liest sie, app.js liest die UI-Defaults. Python (leaders.py) liefert nur
// Rohdaten und kennt keine dieser Schwellen.
//
// Evidenz je Metrik steht in EVIDENCE und erscheint im Info-Tooltip:
//   "validated"  = in der Literatur belegt (Industrie-Momentum, 52W-Hoch-Naehe)
//   "convention" = verbreitete Praxis ohne belastbaren Backtest
//   "overfit"    = konkrete Gewichtung, potenziell ueberangepasst
//   "descriptive"= stabile Beobachtung, aber ohne belegten Erwartungswert
// Quelle der Labels fuer die Watchlist: Performer Study (Top-100-Performer
// 1996–2026, Russell 3000 inkl. Delistings, Norgate), Stand 02.10.2026.

export const LEADERS = {
  // -- Fenster (Handelstage) ------------------------------------------------
  HIGH_52W_BARS: 252,
  SMA_BREADTH: 50,
  NEAR_HIGH_PCT: 10,          // "nahe am Hoch" = hoechstens 10 % darunter
  NEW_HIGH_DAYS: 5,           // new_highs_5d
  RS_THEME_BARS: 63,          // rs_vs_theme = 3M-Perf minus Basket-3M
  ADR_BARS: 20,
  RVOL_BARS: 20,              // RVOL = heute / Ø der 20 Tage DAVOR
  DOLLAR_VOL_BARS: 20,
  RANK_CHANGE_DAYS: 20,       // rank_change_4w, gezaehlt in settled Snapshot-Tagen

  // -- RS vs. SPY: IBD-Nachbildung ------------------------------------------
  // IBD legt die Formel nicht offen. Verbreitete Nachbildung: 12-Monats-
  // Performance, juengstes Quartal doppelt gewichtet:
  //   0,4·ROC(63) + 0,2·ROC(126) + 0,2·ROC(189) + 0,2·ROC(252)
  // IBD rankt das als Perzentil gegen ~6.000 Aktien; das Universum hier ist
  // zu klein dafuer, deshalb Differenz Aktie minus SPY statt Perzentil.
  RS_WEIGHTS: [
    { bars: 63,  w: 0.4 },
    { bars: 126, w: 0.2 },
    { bars: 189, w: 0.2 },
    { bars: 252, w: 0.2 },
  ],

  // -- first_to_high --------------------------------------------------------
  BASKET_DRAWDOWN_PCT: 10,    // Basket-Tief zaehlt ab >= 10 % unter Vorhoch

  // -- down_day_strength ----------------------------------------------------
  DOWN_DAY_SPY_PCT: -1,       // SPY-Tagesveraenderung < -1 %
  DOWN_DAY_LOOKBACK: 60,

  // -- Ranking & Darstellung ------------------------------------------------
  // Reihenfolge in den Theme-Karten; Leader = erster Ticker, der die
  // Watchlist-Kriterien erfuellt. "rs_rating" (Default) sortiert wie die
  // Performer Study nach RS; "rs_vs_theme" nach 3M relativ zum Theme-Basket.
  LEADER_SORT: "rs_rating",
  // Ausgegraut ("Mitlaeufer"): RS unter dem Theme UND weit vom Hoch.
  LAGGARD_RS_THEME_MAX: 0,    // rs_vs_theme < 0 …
  LAGGARD_DIST_ADR: -3,       // … und dist_52wh <= -3 ADR-Einheiten

  // -- Filter-Defaults + Auswahllisten -------------------------------------
  TOP_N: 8,
  TOP_N_OPTIONS: [3, 5, 8, 12, 20, 40],
  // Default aus: die Watchlist prueft bereits Ø $-Vol 50T >= 5 Mio (Studie).
  MIN_DOLLAR_VOL: 0,
  MIN_DOLLAR_VOL_OPTIONS: [0, 5e6, 20e6, 50e6, 100e6],
  // ATR% = Ø True Range / Close. 1M = 20 Tage wie im Tickers-Tab.
  // Default AUS: Die Performer Study findet fuer Volatilitaets-Merkmale keinen
  // besseren Erwartungswert, und Leader haben im Median nur 4,4 % ATR - ein
  // 4-%-Filter strich am 02.10.2026 19 von 51 Watchlist-Namen.
  ATR_PERIODS: { "1W": 5, "14T": 14, "1M": 20 },
  ATR_PERIOD: "1M",
  MIN_ATR_PCT: 0,
  MIN_ATR_OPTIONS: [0, 2, 3, 4, 5, 6, 8],

  // -- Leader-Watchlist (Performer Study 1996–2026, Stufe 1) -----------------
  // RS-Perzentil wie in der Studie: IBD-Gewichtung (RS_WEIGHTS oben) gegen ein
  // breites Universum. Die Studie rankt gegen den Russell 3000; hier: die
  // RS_UNIVERSE_N liquidesten Aktien (Ø $-Vol 50T) der Finviz-Industry-Listen
  // als Naeherung (Konvention - Russell-Mitgliedschaft ist nicht verfuegbar).
  RS_UNIVERSE_N: 3000,
  WL: {
    RS_MIN: 90,            // Chris: RS > 90 (Studie: validiert)
    RS_STRONG: 95,         // hervorgehoben - Studie: Trefferquote 20 % statt 12 %
    P6M_BARS: 126,
    P6M_MIN: 50,           // 6M-Performance > +50 % (Studie: validiert)
    DIST_MAX_PCT: 20,      // <= 20 % unter 52W-Hoch (Chris; Studie: 15 %, Konvention)
    ABOVE_SMA50: true,     // Konvention
    ABOVE_SMA200: true,    // Konvention
    MIN_PRICE: 10,         // Studie: deskriptiv (+0,65 % statt +0,55 % pro Trade)
    MIN_DVOL50: 5e6,       // Studie: Ersatz fuer Russell-Mitgliedschaft, Konvention
  },
  // -- Stufe 2: Trigger am Breakout-Tag (Studie: validiert in der RS-95-Variante)
  TRIGGER: {
    PIVOT_BARS: 20,        // Close ueber dem Hoch der 20 Vortage
    RVOL_MIN: 3,           // Volumen >= 3x Ø der 50 Vortage …
    GAP_MIN_PCT: 4,        // … ODER Gap (Open vs. Vortages-Close) >= 4 %
    VOL_BASE_BARS: 50,
    WEAK_VOL_MAX: 1,       // Trigger mit Volumen < 1x = "meiden" (validiert)
  },
  // -- EP (Episodic Pivot, Earnings-Proxy der Studie): Gap >= 4 % bei >= 3x Volumen
  EP: { GAP_MIN_PCT: 4, VOL_MULT: 3, WINDOW: 6 },
  // -- RMV = ATR5 / ATR50: < 1 Kontraktion (nur Spalte, deskriptiv)
  RMV: { SHORT: 5, LONG: 50, CONTRACTION_MAX: 1 },

  // -- Gruppen-RS (Performer Study): Median des 3M-RS der Mitglieder ----------
  // 3M-RS je Aktie = Perzentil ihrer 63-Tage-Rendite im RS-Universum (wie
  // RS-Rating, nur 3M). Theme-Wert = Median, nur ab MIN_MEMBERS Werten.
  // Studie: Gruppen-Rang >= 90 bei Leader-Breakouts Lift 1,7, Erwartungswert
  // +0,40 % vs. +0,09 % bei Rang < 40 (validiert) - dort GICS-Sub-Industries.
  GROUP_RS: { BARS: 63, MIN_MEMBERS: 3 },

  // -- Rising / Confirmed / Cooling je Theme (docs/rs3m_analysis.md) ----------
  // Rang der Themes nach Gruppen-RS 3M (rank3) und Gruppen-RS 12M (rank12),
  // 1 = staerkstes. N = Themes mit beiden Werten. TOP = floor(N * TOP_FRAC).
  //   confirmed: rank3 <= TOP und rank12 <= TOP
  //   cooling:   rank12 <= TOP und rank3 > floor(N * COOL_FRAC)
  //   rising:    rank12 - rank3 >= TOP (und nicht confirmed)
  // Befund (Norgate, R3000, 2011-2026): Rising/Cooling sind Rotations-Hinweise,
  // kein Renditesignal - Forward-Exzess unterscheidet sich nicht von "alle Themes".
  GROUP_STATE: { TOP_FRAC: 0.25, COOL_FRAC: 0.5 },

  // Standard-Sortierung der Theme-Karten: "group_rs" | "score" | "breadth"
  DEFAULT_SORT: "group_rs",

  // -- Mini-Charts der Watchlist (Finviz chart API) ----------------------------
  // Finviz rendert jede Groesse von 250 x 180 bis Breite 2000 px / Flaeche 2 Mio. px
  // (getestet 03.10.2026), hat aber KEINEN Retina-Parameter: ein groesseres
  // Bild zeigt mehr Historie bei gleich kleiner Schrift. Deshalb wird das Bild
  // in der angezeigten Breite angefordert und der Zeitraum fest auf RANGE
  // gesetzt (Parameter r: m1/m3/m6/ytd/y1 …) - so wird aus Breite Lesbarkeit.
  // S = bisheriges Format (466 x 219, Finviz-Standardzeitraum).
  CHARTS: {
    DEFAULT_SIZE: "M",
    SIZES: {
      S: { min: 300 },
      M: { min: 520 },
      L: { min: 900, max: 1100 },
    },
    RANGE: "m6",
    ASPECT: 1.75,          // Breite : Hoehe
    MAX_W: 2000,
    MAX_AREA: 2e6,
    MIN_W: 250,            // darunter antwortet Finviz mit HTTP 400
    MIN_H: 180,
  },

  // Breadth-Sortierung: Mittel aus pct_above_50ma und pct_near_high
  BREADTH_SORT_KEYS: ["pct_above_50ma", "pct_near_high"],

  EVIDENCE: {
    pct_above_50ma:    "convention",
    pct_near_high:     "validated",
    new_highs_5d:      "convention",
    rank_change_4w:    "validated",
    group_rs12:        "convention",
    state:             "descriptive",
    rs_vs_theme:       "validated",
    rs_vs_spy:         "validated",   // IBD-Gewichtung, Performer Study
    rs_rating:         "validated",
    p6m:               "validated",
    wl_dist:           "convention",
    sma_trend:         "convention",
    min_price:         "descriptive",
    dollar_vol_50d:    "convention",
    trigger:           "validated",
    ep:                "validated",
    rmv:               "descriptive",
    rvol_50d:          "validated",
    group_rs:          "validated",     // Performer Study (GICS; Transfer auf Themes = Konvention)
    best_theme:        "descriptive",  // Studie: Gruppen-Rang nur als Spalte, als Filter fragil
    dist_52wh:         "validated",
    first_to_high:     "convention",
    down_day_strength: "convention",
    rvol_20d:          "convention",
    adr_pct:           "convention",
    dollar_vol_20d:    "convention",
    atr_pct:           "convention",
  },
};
