import datetime as dt
import math
import unittest

import glb


def bdays(start: str, n: int) -> list:
    """n Werktage (Mo-Fr) ab start (inklusive, falls Werktag)."""
    d = dt.date.fromisoformat(start)
    out = []
    while len(out) < n:
        if d.weekday() < 5:
            out.append(d.isoformat())
        d += dt.timedelta(days=1)
    return out


def bdays_until(start: str, end: str) -> list:
    d, e = dt.date.fromisoformat(start), dt.date.fromisoformat(end)
    out = []
    while d <= e:
        if d.weekday() < 5:
            out.append(d.isoformat())
        d += dt.timedelta(days=1)
    return out


def months(start_ym: str, end_ym: str) -> list:
    y, m = int(start_ym[:4]), int(start_ym[5:])
    out = []
    while f"{y:04d}-{m:02d}" <= end_ym:
        out.append(f"{y:04d}-{m:02d}")
        m += 1
        if m == 13:
            y, m = y + 1, 1
    return out


def history_with_ath(ath_ym="2022-03", ath=200.0, other=150.0, end_ym="2026-11"):
    """Monatsreihe: steigende Hochs (jeden Monat neues ATH) bis zum ATH-Monat,
    danach alle Monate High=other."""
    out = []
    for j, ym in enumerate(months("2021-01", end_ym)):
        if ym < ath_ym:
            hi = 100.0 + j * 5          # jeden Monat neues Hoch -> keine Line
        elif ym == ath_ym:
            hi = ath
        else:
            hi = other
        out.append((ym, hi, hi - 5))
    return out


class TestHelpers(unittest.TestCase):
    def test_months_between(self):
        self.assertEqual(glb.months_between("2026-03", "2026-07"), 4)
        self.assertEqual(glb.months_between("2025-11", "2026-02"), 3)
        self.assertEqual(glb.months_between("2026-05", "2026-05"), 0)

    def test_monthly_from_df_nan(self):
        import pandas as pd
        idx = pd.to_datetime(["2026-09-01", "2026-10-01", "2026-11-01"])
        df = pd.DataFrame({"Open": [1, 2, 3], "High": [10.0, float("nan"), 12.5],
                           "Low": [1, 2, 3], "Close": [9.0, 8.0, float("nan")],
                           "Volume": [1, 2, 3]}, index=idx)
        out = glb.monthly_from_df(df)
        self.assertEqual(out, [("2026-09", 10.0, 9.0), ("2026-10", None, 8.0),
                               ("2026-11", 12.5, None)])

    def test_monthly_from_df_empty(self):
        self.assertEqual(glb.monthly_from_df(None), [])


class TestLineFormation(unittest.TestCase):
    def test_valid_from_july_not_june(self):
        base = [("2025-03", 100.0, 95.0), ("2025-04", 95.0, 90.0),
                ("2025-05", 96.0, 90.0), ("2025-06", 97.0, 90.0)]
        r = glb.scan_green_line(base, [], [], [], glb.GLB_CFG)
        self.assertIsNone(r["line"])
        r = glb.scan_green_line(base + [("2025-07", 98.0, 90.0)], [], [], [], glb.GLB_CFG)
        self.assertEqual(r["line"], 100.0)
        self.assertEqual(r["line_since"], "2025-03")

    def test_reset_on_higher_high_during_formation(self):
        base = [("2025-03", 100.0, 95.0), ("2025-04", 95.0, 90.0),
                ("2025-05", 101.0, 90.0), ("2025-06", 97.0, 90.0),
                ("2025-07", 97.0, 90.0), ("2025-08", 97.0, 90.0)]
        r = glb.scan_green_line(base, [], [], [], glb.GLB_CFG)
        self.assertIsNone(r["line"])
        self.assertEqual((r["ath"], r["ath_ym"]), (101.0, "2025-05"))
        r = glb.scan_green_line(base + [("2025-09", 97.0, 90.0)], [], [], [], glb.GLB_CFG)
        self.assertEqual((r["line"], r["line_since"]), (101.0, "2025-05"))

    def test_monthly_close_above_line_is_historic_glb(self):
        base = [("2025-03", 100.0, 95.0)] + [(ym, 95.0, 90.0) for ym in
                                              ("2025-04", "2025-05", "2025-06")]
        base += [("2025-07", 110.0, 105.0)]
        r = glb.scan_green_line(base, [], [], [], glb.GLB_CFG)
        self.assertIsNone(r["line"])
        self.assertEqual((r["ath"], r["ath_ym"]), (110.0, "2025-07"))


class TestLineFollowsHeldPierce(unittest.TestCase):
    """Ein Intraday-Pierce ohne Schluss darueber, der selbst >= 3 volle Monate
    ungebrochen bleibt, hebt die Line auf das neue ATH."""

    def pierce_history(self, end_ym):
        out = [("2019-01", 100.0, 95.0)]
        for ym in months("2019-02", end_ym):
            if ym == "2023-03":
                out.append((ym, 110.0, 95.0))     # Pierce, Schluss unter Line
            else:
                out.append((ym, 90.0, 85.0))
        return out

    def test_monthly_line_moves_up_after_three_months(self):
        r = glb.scan_green_line(self.pierce_history("2023-06"), [], [], [], glb.GLB_CFG)
        self.assertEqual((r["line"], r["line_since"]), (100.0, "2019-01"))
        self.assertEqual((r["ath"], r["ath_ym"]), (110.0, "2023-03"))
        r = glb.scan_green_line(self.pierce_history("2023-07"), [], [], [], glb.GLB_CFG)
        self.assertEqual((r["line"], r["line_since"]), (110.0, "2023-03"))

    def test_daily_close_between_old_and_new_line(self):
        monthly = self.pierce_history("2024-12")
        dates = bdays_until("2024-12-02", "2025-03-28")
        n = len(dates)
        h, c = [92.0] * n, [90.0] * n
        h[-5], c[-5] = 106.0, 105.0               # ueber alter Line 100, unter 110
        r = glb.scan_green_line(monthly, dates, h, c, glb.GLB_CFG)
        self.assertEqual(r["events"], [])
        self.assertEqual(r["line"], 110.0)
        h[-1], c[-1] = 112.0, 111.0
        r = glb.scan_green_line(monthly, dates, h, c, glb.GLB_CFG)
        self.assertEqual(len(r["events"]), 1)
        self.assertEqual(r["events"][0]["i"], n - 1)
        self.assertEqual((r["events"][0]["line"], r["events"][0]["line_since"]),
                         (110.0, "2023-03"))

    def test_daily_phase_pierce_moves_line(self):
        monthly = history_with_ath(end_ym="2026-11")      # Line 200 seit 2022-03
        dates = bdays_until("2025-01-02", "2025-12-31")
        n = len(dates)
        h, c = [150.0] * n, [148.0] * n
        k = dates.index("2025-03-10")
        h[k], c[k] = 210.0, 199.0                 # Pierce im Tagesmodus
        r = glb.scan_green_line(monthly, dates[:dates.index("2025-06-30") + 1],
                                h, c, glb.GLB_CFG)
        self.assertEqual((r["line"], r["line_since"]), (200.0, "2022-03"))
        r = glb.scan_green_line(monthly, dates[:dates.index("2025-07-01") + 1],
                                h, c, glb.GLB_CFG)
        self.assertEqual((r["line"], r["line_since"]), (210.0, "2025-03"))
        j = dates.index("2025-08-04")
        h[j], c[j] = 206.0, 205.0                 # zwischen 200 und 210: kein GLB
        r = glb.scan_green_line(monthly, dates, h, c, glb.GLB_CFG)
        self.assertEqual(r["events"], [])


class TestAnalyze(unittest.TestCase):
    def setUp(self):
        self.dates = bdays_until("2024-12-02", "2026-11-27")   # endet Freitag
        self.n = len(self.dates)
        self.monthly = history_with_ath()

    def flat(self, close=150.0, high=None, vol=1000.0):
        n = self.n
        return ([high or close + 1] * n, [close - 1] * n, [close] * n, [vol] * n)

    def test_line_from_history_near(self):
        h, l, c, v = self.flat()
        c[-1] = 194.0
        h[-1] = 195.0
        row = glb.analyze(self.monthly, self.dates, h, l, c, v)
        self.assertEqual(row["status"], "near")
        self.assertEqual(row["gl"], 200.0)
        self.assertEqual(row["gl_since"], "2022-03")
        self.assertEqual(row["dist_pct"], -3.0)
        self.assertIsNone(row["glb_date"])
        self.assertIsNone(row["glb_volx"])

    def test_far_below_line_is_none(self):
        h, l, c, v = self.flat()
        self.assertIsNone(glb.analyze(self.monthly, self.dates, h, l, c, v))

    def test_intraday_pierce_keeps_line_then_glb_today(self):
        h, l, c, v = self.flat()
        k = self.n - 4
        h[k], c[k] = 205.0, 199.0           # Intraday ueber Line, Schluss darunter
        h[k + 1], c[k + 1] = 199.5, 198.0
        h[k + 2], c[k + 2] = 199.5, 198.0
        h[k + 3], c[k + 3] = 203.0, 201.0   # Schluss ueber Line = GLB
        r = glb.scan_green_line(self.monthly, self.dates, h, c, glb.GLB_CFG)
        self.assertEqual(len(r["events"]), 1)
        self.assertEqual(r["events"][0]["i"], k + 3)
        self.assertEqual(r["events"][0]["line"], 200.0)
        row = glb.analyze(self.monthly, self.dates, h, l, c, v)
        self.assertEqual(row["status"], "glb_today")
        self.assertEqual(row["glb_date"], self.dates[-1])
        self.assertEqual(row["gl"], 200.0)
        self.assertEqual(row["dist_pct"], 0.5)

    def _glb_at(self, k, last_close):
        h, l, c, v = self.flat()
        h[k], c[k] = 203.0, 201.0
        for j in range(k + 1, self.n):
            h[j], c[j] = 202.0, 201.0
        c[-1] = last_close
        return h, l, c, v

    def test_glb_holds(self):
        k = self.n - 1 - 20
        row = glb.analyze(self.monthly, self.dates, *self._glb_at(k, 202.0))
        self.assertEqual(row["status"], "glb_holds")
        self.assertEqual(row["glb_date"], self.dates[k])
        self.assertEqual(row["gl_since"], "2022-03")

    def test_glb_failed(self):
        k = self.n - 1 - 20
        row = glb.analyze(self.monthly, self.dates, *self._glb_at(k, 195.0))
        self.assertEqual(row["status"], "glb_failed")
        self.assertEqual(row["dist_pct"], -2.5)

    def test_glb_too_old(self):
        k = self.n - 1 - 70
        row = glb.analyze(self.monthly, self.dates, *self._glb_at(k, 202.0))
        self.assertTrue(row is None or not row["status"].startswith("glb_"))

    def test_weekly_volume_factor(self):
        h, l, c, v = self.flat()
        k = self.n - 1 - 12                 # Mitte einer Woche
        h[k], c[k] = 203.0, 201.0
        for j in range(k + 1, self.n):
            h[j], c[j] = 202.0, 201.0
        wk = dt.date.fromisoformat(self.dates[k]).isocalendar()[:2]
        for j, d in enumerate(self.dates):
            if dt.date.fromisoformat(d).isocalendar()[:2] == wk:
                v[j] = 2000.0
        row = glb.analyze(self.monthly, self.dates, h, l, c, v)
        self.assertEqual(row["status"], "glb_holds")
        self.assertAlmostEqual(row["glb_volx"], 2.0, places=2)

    def test_weekly_volume_factor_partial_week(self):
        dates = bdays_until("2024-12-02", "2026-11-30")    # endet Montag
        n = len(dates)
        h, l, c, v = [151.0] * n, [149.0] * n, [150.0] * n, [1000.0] * n
        h[-1], c[-1], v[-1] = 203.0, 201.0, 2000.0         # GLB am Montag, 2x Volumen
        row = glb.analyze(self.monthly, dates, h, l, c, v)
        self.assertEqual(row["status"], "glb_today")
        self.assertAlmostEqual(row["glb_volx"], 2.0, places=2)

    def test_gaps_and_no_monthly(self):
        h, l, c, v = self.flat()
        for j in range(0, self.n, 7):
            h[j] = l[j] = c[j] = v[j] = None
        c[-1], h[-1] = 194.0, 195.0
        row = glb.analyze(self.monthly, self.dates, h, l, c, v)
        self.assertEqual(row["status"], "near")
        self.assertIsNone(glb.analyze([], self.dates, h, l, c, v))
        self.assertIsNone(glb.analyze(self.monthly, self.dates, [None] * self.n,
                                      [None] * self.n, [None] * self.n, [None] * self.n))


class TestWeekly(unittest.TestCase):
    def test_last_complete_and_grouping(self):
        dates = bdays_until("2026-11-16", "2026-11-25")   # Mo..Mi der Folgewoche
        c = [float(i) for i in range(len(dates))]
        v = [1.0] * len(dates)
        wc, wv, done = glb.weekly(dates, c, v)
        self.assertEqual(wc, [4.0, 7.0])
        self.assertEqual(wv, [5.0, 3.0])
        self.assertFalse(done)
        wc, wv, done = glb.weekly(dates[:5], c[:5], v[:5])
        self.assertTrue(done)

    def test_partial_week_ignored(self):
        # 70 Wochen stetiger Anstieg bis Freitag, dann Montag Crash
        dates = bdays_until("2025-06-02", "2026-11-27")
        c = [100.0 * 1.003 ** i for i in range(len(dates))]
        v = [1.0] * len(dates)
        wc, _, done = glb.weekly(dates, c, v)
        self.assertTrue(done)
        self.assertTrue(glb.rwb(wc, glb.GLB_CFG))
        self.assertTrue(glb.stage2(wc, glb.GLB_CFG))
        d2 = dates + ["2026-11-30"]
        c2 = c + [1.0]
        wc2, _, done2 = glb.weekly(d2, c2, v + [1.0])
        self.assertFalse(done2)
        self.assertTrue(glb.analyze_weeks(d2, c2, v + [1.0], glb.GLB_CFG)["rwb"])
        self.assertTrue(glb.analyze_weeks(d2, c2, v + [1.0], glb.GLB_CFG)["stage2"])
        # Mit Crash an einem Freitag (abgeschlossen) faellt beides
        c3 = c[:-1] + [1.0]
        res = glb.analyze_weeks(dates, c3, v, glb.GLB_CFG)
        self.assertFalse(res["rwb"])
        self.assertFalse(res["stage2"])


class TestIndicators(unittest.TestCase):
    def test_ema_series(self):
        e = glb.ema_series([10.0, 20.0, 20.0], 3)
        self.assertEqual(e[0], 10.0)
        self.assertAlmostEqual(e[1], 15.0)
        self.assertAlmostEqual(e[2], 17.5)

    def test_rwb(self):
        rising = [100.0 * 1.01 ** i for i in range(100)]
        self.assertTrue(glb.rwb(rising, glb.GLB_CFG))
        self.assertFalse(glb.rwb([100.0] * 100, glb.GLB_CFG))
        self.assertFalse(glb.rwb([100.0 * 0.99 ** i for i in range(100)], glb.GLB_CFG))
        dip = rising[:-1] + [rising[-2] * 0.95]   # EMA3 faellt, bleibt ueber den langen
        self.assertFalse(glb.rwb(dip, glb.GLB_CFG))
        self.assertIsNone(glb.rwb(rising[:60], glb.GLB_CFG))

    def test_stage2(self):
        self.assertTrue(glb.stage2([100.0 + i for i in range(40)], glb.GLB_CFG))
        self.assertFalse(glb.stage2([200.0 - i for i in range(40)], glb.GLB_CFG))
        self.assertIsNone(glb.stage2([100.0 + i for i in range(33)], glb.GLB_CFG))
        self.assertIsNotNone(glb.stage2([100.0 + i for i in range(34)], glb.GLB_CFG))

    def _stoch_series(self, k_at):
        # h=100, l=0 ueber alles -> %K = Close; Close 15 vor dem Cross, 25 danach
        n = 30
        h, l, c = [100.0] * n, [0.0] * n, [10.0] * n
        c[k_at - 1] = 15.0
        c[k_at] = 25.0
        for j in range(k_at + 1, n):
            c[j] = 30.0
        return h, l, c

    def test_blue_dot(self):
        self.assertTrue(glb.blue_dot_recent(*self._stoch_series(30 - 3), glb.GLB_CFG))
        self.assertFalse(glb.blue_dot_recent(*self._stoch_series(30 - 6), glb.GLB_CFG))
        h, l, c = self._stoch_series(30 - 3)
        h[-5] = l[-5] = c[-5] = None
        self.assertTrue(glb.blue_dot_recent(h, l, c, glb.GLB_CFG))
        self.assertFalse(glb.blue_dot_recent([], [], [], glb.GLB_CFG))


if __name__ == "__main__":
    unittest.main()
