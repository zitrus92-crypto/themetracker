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
  // Leader-Rang: rs_vs_theme absteigend, Gleichstand -> rs_vs_spy.
  // Ausgegraut ("Mitlaeufer"): RS unter dem Theme UND weit vom Hoch.
  LAGGARD_RS_THEME_MAX: 0,    // rs_vs_theme < 0 …
  LAGGARD_DIST_ADR: -3,       // … und dist_52wh <= -3 ADR-Einheiten

  // -- Filter-Defaults + Auswahllisten -------------------------------------
  TOP_N: 8,
  TOP_N_OPTIONS: [3, 5, 8, 12, 20, 40],
  MIN_DOLLAR_VOL: 20e6,
  MIN_DOLLAR_VOL_OPTIONS: [0, 5e6, 20e6, 50e6, 100e6],
  // ATR% = Ø True Range / Close. 1M = 20 Tage wie im Tickers-Tab
  // (TICKER_CONFIG ATR_WINDOW), Default > 4 % ebenfalls wie dort.
  ATR_PERIODS: { "1W": 5, "14T": 14, "1M": 20 },
  ATR_PERIOD: "1M",
  MIN_ATR_PCT: 4,
  MIN_ATR_OPTIONS: [0, 2, 3, 4, 5, 6, 8],

  // Breadth-Sortierung: Mittel aus pct_above_50ma und pct_near_high
  BREADTH_SORT_KEYS: ["pct_above_50ma", "pct_near_high"],

  EVIDENCE: {
    pct_above_50ma:    "convention",
    pct_near_high:     "validated",
    new_highs_5d:      "convention",
    rank_change_4w:    "validated",
    rs_vs_theme:       "validated",
    rs_vs_spy:         "overfit",
    dist_52wh:         "validated",
    first_to_high:     "convention",
    down_day_strength: "convention",
    rvol_20d:          "convention",
    adr_pct:           "convention",
    dollar_vol_20d:    "convention",
    atr_pct:           "convention",
  },
};
