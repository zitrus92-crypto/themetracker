import unittest

import leaders


def _bars(close, vol, n=25):
    return {"c": [close] * n, "h": [close] * n, "l": [close] * n, "v_full": [vol] * n}


class TestExchange(unittest.TestCase):
    def test_mapping(self):
        self.assertEqual(leaders.tv_exchange("NMS"), "NASDAQ")
        self.assertEqual(leaders.tv_exchange("NYQ"), "NYSE")
        self.assertEqual(leaders.tv_exchange("PCX"), "AMEX")
        self.assertIsNone(leaders.tv_exchange("XYZ"))
        self.assertIsNone(leaders.tv_exchange(None))

    def test_symbol(self):
        self.assertEqual(leaders.tv_symbol("CRWD", "NASDAQ"), "NASDAQ:CRWD")
        self.assertEqual(leaders.tv_symbol("BRK-B", "NYSE"), "NYSE:BRK.B")
        # Unbekannte Boerse wird nie geraten
        self.assertEqual(leaders.tv_symbol("ABC", None), "ABC")


class TestDollarVol(unittest.TestCase):
    def test_mean(self):
        self.assertEqual(leaders.dollar_vol([10, 20], [1, 2], 2), (10 + 40) / 2)

    def test_gap_is_none(self):
        self.assertIsNone(leaders.dollar_vol([10, None], [1, 2], 2))
        self.assertIsNone(leaders.dollar_vol([10], [1], 2))


class TestAlign(unittest.TestCase):
    def test_missing_days_are_none(self):
        out = leaders.align(["d1", "d2", "d3"], ["d1", "d3"], [1.0, 3.0])
        self.assertEqual(out, [1.0, None, 3.0])


class TestSelect(unittest.TestCase):
    CFG = {**leaders.LEADERS_CONFIG, "MAX_CONSTITUENTS": 2, "MIN_CONSTITUENTS": 2,
           "SELECT_DVOL_DAYS": 20}

    def test_purity_weighted_ranking(self):
        themes = {
            "A": {"tickers": ["BIG", "PURE", "SMALL"]},
            "B": {"tickers": ["BIG"]},
            "C": {"tickers": ["BIG"]},
            "D": {"tickers": ["BIG"]},
        }
        bars = {"BIG": _bars(100, 30), "PURE": _bars(100, 10), "SMALL": _bars(100, 1)}
        out = leaders.select_constituents(themes, bars, {}, self.CFG)
        # BIG: 3000/4 = 750 < PURE 1000/1
        self.assertEqual(out["A"]["tickers"], ["PURE", "BIG"])
        self.assertEqual(out["A"]["source"], "finviz_theme")
        self.assertEqual(out["A"]["members_total"], 3)

    def test_membership_cap(self):
        themes = {"A": {"tickers": ["BIG", "PURE"]}, "B": {"tickers": ["BIG"]}}
        bars = {"BIG": _bars(100, 30), "PURE": _bars(100, 10)}
        cfg = {**self.CFG, "MAX_THEME_MEMBERSHIPS": 1}
        out = leaders.select_constituents(themes, bars, {}, cfg)
        self.assertEqual(out["A"]["tickers"], ["PURE"])
        self.assertTrue(out["A"]["thin"])

    def test_missing_bars_excluded(self):
        themes = {"A": {"tickers": ["X", "Y"]}}
        out = leaders.select_constituents(themes, {"X": _bars(10, 10)}, {}, self.CFG)
        self.assertEqual(out["A"]["tickers"], ["X"])

    def test_override_wins(self):
        themes = {"A": {"tickers": ["X"]}}
        ov = {"A": {"tickers": ["NASDAQ:Q", "R"]}}
        out = leaders.select_constituents(themes, {"X": _bars(10, 10)}, ov, self.CFG)
        self.assertEqual(out["A"]["tickers"], ["Q", "R"])
        self.assertEqual(out["A"]["source"], "manual")


class TestCompact(unittest.TestCase):
    def test_lengths_and_rounding(self):
        cfg = {**leaders.LEADERS_CONFIG, "LONG_BARS": 4, "SHORT_BARS": 2}
        b = {"c": [1.234, 2.345, 3.456, 4.567, 15.678], "h": [1, 2, 3, 4, 5],
             "l": [1, 2, 3, 4, 5], "v_full": [1.0, 2.0, None, 4.0, 5.9]}
        out = leaders.compact_series(b, cfg)
        self.assertEqual(out["c"], [2.35, 3.46, 4.57, 15.68])
        self.assertEqual(len(out["h"]), 4)
        self.assertEqual(out["l"], [4, 5])
        self.assertEqual(out["v"], [4, 5])
        self.assertEqual(leaders._round_px(0.123456), 0.1235)
        self.assertIsNone(leaders._round_px(None))


if __name__ == "__main__":
    unittest.main()
