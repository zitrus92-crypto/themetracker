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
             "o": [1, 2, 3, 4.444, 5], "l": [1, 2, 3, 4, 5], "v": [1.0, 2.0, None, 4.0, 5.9]}
        out = leaders.compact_series(b, cfg)
        self.assertEqual(out["c"], [2.35, 3.46, 4.57, 15.68])
        self.assertEqual(len(out["h"]), 4)
        self.assertEqual(out["o"], [4.44, 5])
        self.assertEqual(out["l"], [4, 5])
        self.assertEqual(out["v"], [4, 5])
        self.assertEqual(leaders._round_px(0.123456), 0.1235)
        self.assertIsNone(leaders._round_px(None))


class TestRsSummary(unittest.TestCase):
    CFG = {**leaders.LEADERS_CONFIG, "RS_ROCS": [1, 2], "RS_DVOL_BARS": 2, "RS_MIN_PRICE": 1.0}

    def test_values(self):
        out = leaders.rs_summary([100, 110, 121], [1, 2, 3], self.CFG)
        self.assertEqual(out[:2], [10.0, 21.0])
        self.assertEqual(out[2], round((110 * 2 + 121 * 3) / 2))

    def test_missing_or_cheap_is_none(self):
        self.assertIsNone(leaders.rs_summary([100, 121], [1, 2], self.CFG))        # zu kurz
        self.assertIsNone(leaders.rs_summary([None, 110, 121], [1, 2, 3], self.CFG))
        self.assertIsNone(leaders.rs_summary([1, 1, 0.5], [1, 2, 3], self.CFG))    # < 1 $
        self.assertIsNone(leaders.rs_summary([100, 110, 121], [1, None, 3], self.CFG))


class TestInplaySummary(unittest.TestCase):
    def _bars(self, n, c=100.0, h=102.0, l=98.0, v=1_000_000):
        return [c] * n, [h] * n, [l] * n, [v] * n

    def test_values(self):
        c, h, l, v = self._bars(60)
        self.assertEqual(leaders.inplay_summary(c, h, l, v), [100_000_000, 4.0])

    def test_short_history_ok(self):
        self.assertIsNotNone(leaders.inplay_summary(*self._bars(50)))
        self.assertIsNone(leaders.inplay_summary(*self._bars(49)))

    def test_gap_in_window_is_none(self):
        for i in range(4):
            bars = [list(x) for x in self._bars(60)]
            bars[i][-10] = None
            self.assertIsNone(leaders.inplay_summary(*bars))

    def test_gap_before_window_is_ok(self):
        c, h, l, v = self._bars(60)
        c[0] = None
        self.assertIsNotNone(leaders.inplay_summary(c, h, l, v))

    def test_no_price_floor(self):
        out = leaders.inplay_summary(*self._bars(60, c=0.5, h=0.51, l=0.49))
        self.assertIsNotNone(out)
        self.assertEqual(out[1], 4.0)


class TestIpoSeries(unittest.TestCase):
    MASTER = [f"2026-{m:02d}-{d:02d}" for m in range(1, 13) for d in (1, 15)]  # 24 Daten

    def _a(self, start):
        n = len(self.MASTER)
        c = [None] * start + [10.0 + i for i in range(n - start)]
        return {"c": c, "h": [None if x is None else x + 1 for x in c],
                "o": list(c), "l": [None if x is None else x - 1 for x in c],
                "v": [None if x is None else 1000 for x in c]}

    def test_first_bar_index(self):
        self.assertEqual(leaders.first_bar_index([None, None, 3.0]), 2)
        self.assertIsNone(leaders.first_bar_index([None, None]))

    def test_newcomer(self):
        out = leaders.ipo_series(self._a(10), self.MASTER, "2026-03-01")
        self.assertEqual(out["first"], self.MASTER[10])
        self.assertEqual(len(out["c"]), len(self.MASTER) - 10)
        self.assertEqual(out["c"][0], 10.0)
        self.assertEqual(out["v"][0], 1000)

    def test_history_from_start_is_not_new(self):
        self.assertIsNone(leaders.ipo_series(self._a(0), self.MASTER, "2025-01-01"))

    def test_first_before_cutoff(self):
        self.assertIsNone(leaders.ipo_series(self._a(2), self.MASTER, "2026-06-01"))

    def test_all_none(self):
        a = {k: [None] * len(self.MASTER) for k in "chlov"}
        self.assertIsNone(leaders.ipo_series(a, self.MASTER, "2026-01-01"))


class TestWriteOrder(unittest.TestCase):
    def test_ipo_write_failure_keeps_leaders_files(self):
        import tempfile
        from pathlib import Path
        from unittest import mock
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            fake = ({"c": 1}, {"tickers": {}}, {"tickers": {}, "etf": None}, None)
            bad_ipo = mock.MagicMock()
            bad_ipo.write_text.side_effect = OSError("disk full")
            with mock.patch.object(leaders, "build_leaders", return_value=fake),                  mock.patch.object(leaders, "DATA_DIR", d),                  mock.patch.object(leaders, "CONSTITUENTS_PATH", d / "c.json"),                  mock.patch.object(leaders, "BARS_PATH", d / "b.json"),                  mock.patch.object(leaders, "IPO_PATH", bad_ipo):
                leaders.write_leaders({}, {})
            self.assertTrue((d / "c.json").exists())
            self.assertTrue((d / "b.json").exists())


class TestGlbIntegration(unittest.TestCase):
    def test_fetch_monthly_whole_failure_returns_none(self):
        import sys
        from unittest import mock
        fake_yf = mock.MagicMock()
        fake_yf.download.side_effect = RuntimeError("boom")
        with mock.patch.dict(sys.modules, {"yfinance": fake_yf}):
            self.assertIsNone(leaders.fetch_monthly(["AAA"], leaders.LEADERS_CONFIG))
        with mock.patch.dict(sys.modules, {"yfinance": None}):
            self.assertIsNone(leaders.fetch_monthly(["AAA"], leaders.LEADERS_CONFIG))

    def _fake_yf(self, frames):
        import sys
        from unittest import mock
        fake = mock.MagicMock()
        fake.download.side_effect = frames
        return mock.patch.dict(sys.modules, {"yfinance": fake})

    def test_fetch_monthly_empty_frame_returns_none(self):
        import pandas as pd
        with self._fake_yf([pd.DataFrame()]):
            self.assertIsNone(leaders.fetch_monthly(["AAA", "BBB"], leaders.LEADERS_CONFIG))

    def test_fetch_monthly_low_coverage_returns_none(self):
        import pandas as pd
        from unittest import mock
        idx = pd.to_datetime(["2026-01-01", "2026-02-01"])
        df = pd.DataFrame({("AAA", "Close"): [1.0, 2.0]}, index=idx)
        df.columns = pd.MultiIndex.from_tuples(df.columns)
        with self._fake_yf([df]), mock.patch.object(
                leaders.glb, "monthly_from_df", return_value=[{"x": 1}]):
            tks = ["AAA"] + [f"T{i}" for i in range(9)]
            self.assertIsNone(leaders.fetch_monthly(tks, leaders.LEADERS_CONFIG))

    def _write(self, glb_out, glb_path):
        import tempfile
        from pathlib import Path
        from unittest import mock
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            fake = ({"c": 1}, {"tickers": {}}, {"tickers": {}, "etf": None}, glb_out)
            with mock.patch.object(leaders, "build_leaders", return_value=fake),                  mock.patch.object(leaders, "DATA_DIR", d),                  mock.patch.object(leaders, "CONSTITUENTS_PATH", d / "c.json"),                  mock.patch.object(leaders, "BARS_PATH", d / "b.json"),                  mock.patch.object(leaders, "IPO_PATH", d / "i.json"),                  mock.patch.object(leaders, "GLB_PATH", glb_path(d)):
                leaders.write_leaders({}, {})
            return d, (d / "c.json").exists(), (d / "b.json").exists(), (d / "g.json").exists()

    def test_glb_none_writes_nothing(self):
        d, c, b, g = self._write(None, lambda d: d / "g.json")
        self.assertTrue(c and b)
        self.assertFalse(g)

    def test_glb_written_last(self):
        d, c, b, g = self._write({"rows": {}}, lambda d: d / "g.json")
        self.assertTrue(c and b and g)

    def test_glb_write_failure_keeps_leaders_files(self):
        from unittest import mock
        bad = mock.MagicMock()
        bad.write_text.side_effect = OSError("disk full")
        d, c, b, g = self._write({"rows": {}}, lambda d: bad)
        self.assertTrue(c and b)


class TestGlbFetchFlow(unittest.TestCase):
    """fetch_bars_and_universe mit Fake-yfinance (kein Netzwerk)."""
    N = 60

    def _fake_yf(self, data, calls):
        import sys
        import pandas as pd
        from unittest import mock
        nan = float("nan")
        base = {"Open": 100.0, "High": 102.0, "Low": 98.0, "Close": 100.0, "Volume": 1e6}

        def download(chunk, period=None, interval=None, **kw):
            calls.append(("daily", tuple(chunk)))
            idx = pd.bdate_range(end="2026-11-27", periods=self.N)
            cols = {}
            for tk in chunk:
                if tk not in data:
                    continue
                start, stop = data[tk]
                for f, val in base.items():
                    cols[(tk, f)] = [val if start <= i < stop else nan for i in range(self.N)]
            df = pd.DataFrame(cols, index=idx)
            if cols:
                df.columns = pd.MultiIndex.from_tuples(df.columns)
            return df

        fake = mock.MagicMock()
        fake.download.side_effect = download
        return mock.patch.dict(sys.modules, {"yfinance": fake})

    def test_monthly_fetch_after_bench_and_failure_is_isolated(self):
        calls = []
        data = {"SPY": (0, self.N), "AAA": (0, self.N)}

        def glb_fetch():
            calls.append("monthly")
            raise RuntimeError("Yahoo throttled")

        with self._fake_yf(data, calls):
            master, bars, universe, inplay, ipo, etf, glb_rows = \
                leaders.fetch_bars_and_universe(["AAA"], ["AAA"], leaders.LEADERS_CONFIG,
                                                ipo_set={"AAA"}, glb_fetch=glb_fetch)
        self.assertEqual(calls[0], ("daily", ("SPY",)))
        self.assertEqual(calls[1], "monthly")
        self.assertIn(("daily", ("AAA", leaders.LEADERS_CONFIG["IPO_ETF"])), calls[2:])
        self.assertEqual(len(master), self.N)
        self.assertIn("AAA", bars)
        self.assertIn("AAA", inplay)
        self.assertIsNone(glb_rows)

    def test_absorb_glb_branch(self):
        from unittest import mock
        calls = []
        n = self.N
        data = {"SPY": (0, n), "AAA": (0, n), "OLD": (0, n - 5), "THIN": (n - 20, n),
                "NOTIPO": (0, n)}
        monthly = {tk: [("2020-01", 1.0, 1.0)] for tk in ("AAA", "OLD", "THIN", "NOTIPO")}
        row = {"status": "near", "gl": 101.0}
        with self._fake_yf(data, calls), \
                mock.patch.object(leaders.glb, "analyze", return_value=dict(row)) as an:
            *_, glb_rows = leaders.fetch_bars_and_universe(
                ["AAA"], ["AAA", "OLD", "THIN", "NOTIPO"], leaders.LEADERS_CONFIG,
                ipo_set={"AAA", "OLD", "THIN"}, glb_fetch=lambda: monthly)
        self.assertEqual(set(glb_rows), {"AAA", "THIN"})   # OLD veraltet, NOTIPO kein Kandidat
        self.assertEqual(glb_rows["AAA"], {**row, "dvol50": 100_000_000, "atr14": 4.0})
        self.assertEqual(glb_rows["THIN"], {**row, "dvol50": None, "atr14": None})
        self.assertEqual(an.call_count, 2)

    def _build(self, glb_rows):
        from unittest import mock
        master = ["2026-11-26", "2026-11-27"]
        spy = {k: [100.0, 101.0] for k in "chlov"}
        seen = {}

        def fbu(keep, broad, cfg, ipo_set=None, glb_fetch=None):
            seen["monthly_calls_before"] = fm.call_count
            seen["glb_fetch"] = glb_fetch
            if glb_fetch is not None:
                glb_fetch()
            return master, {"SPY": spy}, {}, {}, {}, None, glb_rows

        industries = {"Software": {"tickers": ["AAA", "BBB"]}}
        with mock.patch.object(leaders, "fetch_monthly", return_value={}) as fm, \
                mock.patch.object(leaders, "fetch_bars_and_universe", side_effect=fbu), \
                mock.patch.object(leaders, "_read_json", return_value=None), \
                mock.patch.object(leaders, "fetch_exchanges", return_value={}), \
                mock.patch.object(leaders, "fetch_earnings", return_value={}):
            out = leaders.build_leaders({}, industries)
            seen["fm_args"] = fm.call_args
        return out, seen

    def test_build_leaders_defers_monthly_to_fetcher(self):
        (_, _, _, glb_out), seen = self._build({"AAA": {"status": "near"}})
        self.assertEqual(seen["monthly_calls_before"], 0)
        self.assertTrue(callable(seen["glb_fetch"]))
        self.assertEqual(seen["fm_args"].args[0], ["AAA", "BBB"])
        self.assertEqual(set(glb_out), {"schema_version", "date", "data_date", "source",
                                        "cfg", "rows"})
        self.assertEqual(glb_out["data_date"], "2026-11-27")
        self.assertEqual(glb_out["rows"], {"AAA": {"status": "near"}})
        self.assertEqual(glb_out["source"], leaders.GLB_SOURCE)

    def test_build_leaders_no_monthly_no_glb_out(self):
        (_, _, _, glb_out), _ = self._build(None)
        self.assertIsNone(glb_out)


if __name__ == "__main__":
    unittest.main()
