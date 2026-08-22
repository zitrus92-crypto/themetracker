import unittest
from datetime import datetime, timezone

from scrape import setups_due
from setups import (
    SETUP_CONFIG,
    analyze_series,
    build_universe,
    setup_score,
    verdict_for,
)


def series(bars):
    """bars: Liste von (high, low, close, volume) -> vier Spaltenlisten."""
    return (
        [b[0] for b in bars],
        [b[1] for b in bars],
        [b[2] for b in bars],
        [b[3] for b in bars],
    )


def make_bars(n=120, price=100.0, rng=2.0, vol=1_000_000):
    """Flache Basisreihe; einzelne Bars werden in den Tests gezielt ersetzt."""
    return [(price + rng / 2, price - rng / 2, price, vol) for _ in range(n)]


class TestAnalyzeSeries(unittest.TestCase):
    def test_too_few_bars_returns_none(self):
        h, l, c, v = series(make_bars(SETUP_CONFIG["MIN_BARS"] - 1))
        self.assertIsNone(analyze_series(h, l, c, v))

    def test_pivot_ignores_the_last_days(self):
        # Ausbruch in den letzten 2 Tagen darf nicht sein eigener Pivot werden.
        bars = make_bars()
        bars[-20] = (110.0, 108.0, 109.0, 1_000_000)   # Basis-Hoch (im Fenster)
        bars[-1] = (130.0, 126.0, 129.0, 3_000_000)    # frischer Ausbruch
        h, l, c, v = series(bars)
        m = analyze_series(h, l, c, v)
        self.assertEqual(m["pivot"], 110.0)
        self.assertGreater(m["dist"], 0)

    def test_base_days_counts_from_the_pivot_bar(self):
        bars = make_bars()
        bars[-15] = (112.0, 110.0, 111.0, 1_000_000)
        h, l, c, v = series(bars)
        self.assertEqual(analyze_series(h, l, c, v)["base_days"], 14)

    def test_contraction_is_detected(self):
        wide = make_bars(100, rng=6.0)
        tightend = [(100.5, 99.5, 100.0, 1_000_000)] * 10
        h, l, c, v = series(wide + tightend)
        self.assertLess(analyze_series(h, l, c, v)["tight"], 1.0)

    def test_volume_dryup_and_rvol(self):
        bars = make_bars(100, vol=1_000_000)
        for i in range(-5, 0):
            bars[i] = (100.5, 99.5, 100.0, 400_000)
        h, l, c, v = series(bars)
        m = analyze_series(h, l, c, v)
        self.assertLess(m["dryup"], 1.0)
        self.assertLess(m["rvol"], 1.0)


class TestVerdict(unittest.TestCase):
    def base_metrics(self, **over):
        m = {
            "price": 50.0, "pivot": 50.0, "dist": -1.0, "base_days": 10,
            "tight": 0.8, "dryup": 0.7, "rvol": 0.8, "ext20": 3.0,
            "sma50pct": 8.0, "above50": True, "above200": True,
            "sma20_up": True, "adr": 3.0, "perf1m": 6.0, "dvol": 20_000_000,
        }
        m.update(over)
        return m

    def test_ready_at_pivot(self):
        self.assertEqual(verdict_for(self.base_metrics())[0], "READY")

    def test_short_base_is_only_watch(self):
        v, reason = verdict_for(self.base_metrics(base_days=2))
        self.assertEqual((v, reason), ("WATCH", "base_too_short"))

    def test_no_contraction_is_only_watch(self):
        v, reason = verdict_for(self.base_metrics(tight=1.4))
        self.assertEqual((v, reason), ("WATCH", "no_contraction"))

    def test_running_is_breakout(self):
        self.assertEqual(verdict_for(self.base_metrics(dist=5.0))[0], "BREAKOUT")

    def test_far_above_pivot_is_extended(self):
        self.assertEqual(verdict_for(self.base_metrics(dist=12.0))[0], "EXTENDED")

    def test_parabolic_is_extended(self):
        self.assertEqual(verdict_for(self.base_metrics(ext20=25.0))[0], "EXTENDED")

    def test_below_sma50_is_out(self):
        self.assertEqual(verdict_for(self.base_metrics(above50=False))[0], "OUT")

    def test_illiquid_is_out(self):
        self.assertEqual(verdict_for(self.base_metrics(dvol=100_000))[0], "OUT")

    def test_too_quiet_is_out(self):
        # Grundbedingung des Tabs: ADR >= 3 % (Link-Pendant: ta_volatility_mo3).
        v, reason = verdict_for(self.base_metrics(adr=1.5))
        self.assertEqual((v, reason), ("OUT", "low_adr"))

    def test_adr_floor_beats_an_otherwise_perfect_setup(self):
        perfect = self.base_metrics(adr=2.9, dist=0.0, tight=0.6, base_days=20)
        self.assertEqual(verdict_for(perfect)[0], "OUT")

    def test_ladder_has_no_gaps(self):
        # Jeder Abstand bekommt genau ein Verdict — keine stille Lücke.
        for d in [x / 2 for x in range(-40, 41)]:
            v, _ = verdict_for(self.base_metrics(dist=d))
            self.assertIn(v, ("READY", "BREAKOUT", "WATCH", "EXTENDED", "OUT"))


class TestScore(unittest.TestCase):
    def test_at_pivot_beats_far_from_pivot(self):
        near = TestVerdict().base_metrics(dist=-0.5)
        far = TestVerdict().base_metrics(dist=-7.0)
        self.assertGreater(setup_score(near), setup_score(far))

    def test_tight_dry_base_beats_loose_one(self):
        good = TestVerdict().base_metrics(tight=0.7, dryup=0.5, base_days=15)
        bad = TestVerdict().base_metrics(tight=1.3, dryup=1.2, base_days=5)
        self.assertGreater(setup_score(good), setup_score(bad))

    def test_score_stays_in_range(self):
        best = TestVerdict().base_metrics(dist=0.0, tight=0.4, dryup=0.2, base_days=40)
        worst = TestVerdict().base_metrics(
            dist=-20.0, tight=2.0, dryup=2.0, base_days=0,
            above50=False, sma20_up=False,
        )
        self.assertLessEqual(setup_score(best), 100)
        self.assertGreaterEqual(setup_score(worst), 0)


class TestUniverse(unittest.TestCase):
    def test_takes_strongest_groups_and_dedupes(self):
        scored = {
            "Strong": {"composite": 1.0, "acceleration": 12, "perfs": {"1M": 8.0},
                       "tickers": ["AAA", "BBB"]},
            "Weak":   {"composite": 99.0, "tickers": ["ZZZ"]},
        }
        themes = {"Hot": {"score": 2.0, "rank": 1, "perfs": {"1M": 5.0},
                          "tickers": ["BBB", "CCC"]}}
        cfg = dict(SETUP_CONFIG, N_INDUSTRIES=1, N_THEMES=1)
        tickers, groups, meta = build_universe(scored, themes, cfg)

        self.assertEqual(tickers, ["AAA", "BBB", "CCC"])
        self.assertEqual([g["name"] for g in meta["industries"]], ["Strong"])
        self.assertEqual([g["name"] for g in meta["themes"]], ["Hot"])
        self.assertEqual(meta["pool"], {"industries": 2, "themes": 1})
        # BBB steckt in beiden Gruppen — beide Herkünfte bleiben erhalten.
        self.assertEqual(
            groups["BBB"],
            [{"name": "Strong", "type": "industry"}, {"name": "Hot", "type": "theme"}],
        )

    def test_meta_carries_the_numbers_that_caused_the_pick(self):
        # Die Auswahl muss im Tab nachvollziehbar sein, nicht nur der Name.
        scored = {"Strong": {"composite": 4.2, "acceleration": 17,
                             "ranks": {"1W": 3, "1M": 2, "3M": 40},
                             "perfs": {"1M": 9.5}, "tickers": ["AAA"]}}
        cfg = dict(SETUP_CONFIG, N_INDUSTRIES=1, N_THEMES=0)
        _, _, meta = build_universe(scored, {}, cfg)
        row = meta["industries"][0]
        self.assertEqual(row["score"], 4.2)
        self.assertEqual(row["accel"], 17)
        self.assertEqual(row["perf1m"], 9.5)
        self.assertEqual(row["tickers"], 1)
        self.assertEqual(row["ranks"]["1M"], 2)

    def test_max_tickers_caps_the_run(self):
        scored = {"S": {"composite": 1.0, "tickers": [f"T{i}" for i in range(50)]}}
        cfg = dict(SETUP_CONFIG, N_INDUSTRIES=1, N_THEMES=0, MAX_TICKERS=10)
        tickers, groups, _ = build_universe(scored, {}, cfg)
        self.assertEqual(len(tickers), 10)
        self.assertEqual(len(groups), 10)


class TestSetupsDue(unittest.TestCase):
    """Der Experimental-Tab läuft einmal pro Handelstag nach US-Close."""

    TODAY = "2026-08-20"

    def at(self, hour, minute=0):
        return datetime(2026, 8, 20, hour, minute, tzinfo=timezone.utc)

    def test_intraday_runs_do_not_recompute(self):
        # Die stündlichen Läufe 14–21 UTC lassen setups.json in Ruhe.
        for hour in range(14, 21):
            due, why = setups_due(self.at(hour), self.TODAY, True, None)
            self.assertFalse(due, f"{hour}:00 UTC")
            self.assertEqual(why, "vor US-Close")

    def test_post_close_run_computes(self):
        due, _ = setups_due(self.at(22), self.TODAY, True, None)
        self.assertTrue(due)

    def test_boundary_is_2130_utc(self):
        self.assertFalse(setups_due(self.at(21, 29), self.TODAY, True, None)[0])
        self.assertTrue(setups_due(self.at(21, 30), self.TODAY, True, None)[0])

    def test_second_late_run_does_not_recompute(self):
        # GitHub startet Läufe verspätet — der zweite nach Close fällt aus,
        # weil der Tageseintrag schon steht.
        existing = {"date": self.TODAY}
        due, why = setups_due(self.at(23, 15), self.TODAY, True, existing)
        self.assertFalse(due)
        self.assertEqual(why, "heute bereits gerechnet")

    def test_yesterdays_file_does_not_block_today(self):
        existing = {"date": "2026-08-19"}
        self.assertTrue(setups_due(self.at(22), self.TODAY, True, existing)[0])

    def test_non_trading_day_never_computes(self):
        due, why = setups_due(self.at(22), self.TODAY, False, None)
        self.assertFalse(due)
        self.assertEqual(why, "kein Handelstag")


if __name__ == "__main__":
    unittest.main()
