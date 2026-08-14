import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from snapshots import build_rows, write_snapshot


def _themes(n=3, perf=10.0):
    return {
        f"Theme {i}": {
            "score": 50.0 + i,
            "rank": i + 1,
            "tickers": [f"AA{i}", f"BB{i}"],
            "perfs": {"1D": 0.1, "1W": 1.0, "1M": perf, "3M": 5.0, "6M": 8.0, "YTD": 12.0},
        }
        for i in range(n)
    }


def _scored(n=5):
    return {
        f"Industry {i}": {
            "composite": 100.0 - i,
            "acceleration": i,
            "ranks": {"1W": i + 1},
            "perfs": {"1D": 0.1, "1W": 1.0, "1M": 2.0, "3M": 3.0, "6M": 4.0, "YTD": 5.0},
            "tickers": [f"T{i}"],
        }
        for i in range(n)
    }


class TestBuildRows(unittest.TestCase):
    def test_both_universes_with_type_and_hash(self):
        rows = build_rows(_scored(), _themes())
        self.assertEqual(len(rows), 8)
        types = {r["type"] for r in rows}
        self.assertEqual(types, {"theme", "industry"})
        for r in rows:
            self.assertEqual(set(r["perfs"].keys()), {"1W", "1M", "3M", "6M", "YTD"})
            self.assertIsNotNone(r["ticker_hash"])
            self.assertGreater(r["members"], 0)

    def test_ticker_hash_order_independent_and_none_when_empty(self):
        t1 = _themes(1)
        t2 = _themes(1)
        t2["Theme 0"]["tickers"] = list(reversed(t2["Theme 0"]["tickers"]))
        h1 = build_rows({}, t1)[0]["ticker_hash"]
        h2 = build_rows({}, t2)[0]["ticker_hash"]
        self.assertEqual(h1, h2)
        t1["Theme 0"]["tickers"] = []
        self.assertIsNone(build_rows({}, t1)[0]["ticker_hash"])


class TestWriteSnapshot(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self._tmp.name)
        self.now = datetime(2026, 8, 14, 22, 5, tzinfo=timezone.utc)

    def tearDown(self):
        self._tmp.cleanup()

    def _read(self, name="2026-08.json"):
        return json.loads((self.dir / name).read_text(encoding="utf-8"))

    def test_skips_non_trading_day(self):
        e = write_snapshot(_scored(), _themes(), "2026-08-15", self.now, self.dir)  # Samstag
        self.assertIsNone(e)
        self.assertFalse(any(self.dir.glob("*.json")))

    def test_writes_idempotent_and_settled(self):
        write_snapshot(_scored(), _themes(), "2026-08-14", self.now, self.dir)
        write_snapshot(_scored(), _themes(), "2026-08-14", self.now, self.dir)
        shard = self._read()
        self.assertEqual(list(shard.keys()), ["2026-08-14"])
        self.assertTrue(shard["2026-08-14"]["settled"])
        self.assertEqual(len(shard["2026-08-14"]["rows"]), 8)

    def test_intraday_run_not_settled(self):
        noon = datetime(2026, 8, 14, 15, 0, tzinfo=timezone.utc)
        write_snapshot(_scored(), _themes(), "2026-08-14", noon, self.dir)
        self.assertFalse(self._read()["2026-08-14"]["settled"])

    def test_gap_flags(self):
        # Erster Tag überhaupt -> gap None (Beginn der Aufzeichnung).
        write_snapshot(_scored(), _themes(), "2026-08-12", self.now, self.dir)
        self.assertIsNone(self._read()["2026-08-12"]["gap"])
        # Folgehandelstag vorhanden -> gap False.
        write_snapshot(_scored(), _themes(), "2026-08-13", self.now, self.dir)
        self.assertFalse(self._read()["2026-08-13"]["gap"])
        # 14.08. fehlt, 17.08. (Montag) geschrieben -> gap True.
        write_snapshot(_scored(), _themes(), "2026-08-17", self.now, self.dir)
        self.assertTrue(self._read()["2026-08-17"]["gap"])

    def test_gap_lookback_crosses_month_boundary(self):
        write_snapshot(_scored(), _themes(), "2026-07-31", self.now, self.dir)
        write_snapshot(_scored(), _themes(), "2026-08-03", self.now, self.dir)  # Montag
        self.assertFalse(self._read()["2026-08-03"]["gap"])

    def test_plausibility_rejects_row_count_deviation(self):
        write_snapshot(_scored(5), _themes(3), "2026-08-13", self.now, self.dir)
        # Nächster Tag mit nur 3 statt 8 Zeilen -> verwerfen.
        e = write_snapshot(_scored(0), _themes(3), "2026-08-14", self.now, self.dir)
        self.assertIsNone(e)
        self.assertNotIn("2026-08-14", self._read())

    def test_plausibility_rejects_null_perfs_and_keeps_existing_entry(self):
        write_snapshot(_scored(5), _themes(3), "2026-08-14", self.now, self.dir)
        broken_themes = _themes(3)
        broken_scored = _scored(5)
        for t in broken_themes.values():
            t["perfs"] = {k: None for k in t["perfs"]}
        for s in broken_scored.values():
            s["perfs"] = {k: None for k in s["perfs"]}
        e = write_snapshot(broken_scored, broken_themes, "2026-08-14", self.now, self.dir)
        self.assertIsNone(e)
        # Der gute Eintrag von vorher bleibt stehen.
        self.assertEqual(len(self._read()["2026-08-14"]["rows"]), 8)

    def test_skips_when_one_universe_missing(self):
        self.assertIsNone(write_snapshot({}, _themes(), "2026-08-14", self.now, self.dir))
        self.assertIsNone(write_snapshot(_scored(), {}, "2026-08-14", self.now, self.dir))


if __name__ == "__main__":
    unittest.main()
