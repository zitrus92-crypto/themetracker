import unittest

import leaders


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


class TestAlign(unittest.TestCase):
    def test_missing_days_are_none(self):
        out = leaders.align(["d1", "d2", "d3"], ["d1", "d3"], [1.0, 3.0])
        self.assertEqual(out, [1.0, None, 3.0])


class TestSelect(unittest.TestCase):
    CFG = {**leaders.LEADERS_CONFIG, "MIN_CONSTITUENTS": 3}

    def test_one_to_one_with_multi_membership(self):
        themes = {
            "A": {"tickers": ["BIG", "PURE", "BIG", "NODATA"]},
            "B": {"tickers": ["BIG"]},
        }
        out = leaders.select_constituents(themes, {}, self.CFG)
        # Finviz-Reihenfolge, Duplikate innerhalb eines Themes entfernt,
        # Ticker ohne Kursdaten bleiben drin (UI zeigt n/a)
        self.assertEqual(out["A"]["tickers"], ["BIG", "PURE", "NODATA"])
        self.assertEqual(out["B"]["tickers"], ["BIG"])
        self.assertEqual(out["A"]["source"], "finviz_theme")
        self.assertFalse(out["A"]["thin"])
        self.assertTrue(out["B"]["thin"])

    def test_membership_counts(self):
        themes = {"A": {"tickers": ["X", "Y", "X"]}, "B": {"tickers": ["X"]}}
        self.assertEqual(leaders.membership_counts(themes), {"X": 2, "Y": 1})

    def test_override_wins(self):
        themes = {"A": {"tickers": ["X"]}}
        ov = {"A": {"tickers": ["NASDAQ:Q", "R"]}}
        out = leaders.select_constituents(themes, ov, self.CFG)
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
