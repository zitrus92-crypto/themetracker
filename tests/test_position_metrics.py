"""
tests/test_position_metrics.py — Paritaet gegen docs/static/themeMetrics.js.

Dieselben acht Fixture-Zeilen wie docs/static/themeMetrics.test.js (Stand
14.08.2026), damit ein Auseinanderlaufen der beiden Implementierungen (JS
fuers Frontend, Python fuer den Scraper) durch fehlschlagende Tests auffaellt,
statt still zwei verschiedene Definitionen von "qualifiziert" zu haben.
"""
import unittest

import position_metrics as pm


def P(w, m, m3, m6):
    return {"1W": w, "1M": m, "3M": m3, "6M": m6}


FIXTURES = {
    "Software":               {"accel": 1,  "perfs": P(6.54, 16.62, 24.90, 26.31), "stage": pm.STAGE_BASE_BREAK},
    "Cloud Computing":        {"accel": 2,  "perfs": P(6.45, 14.47, 23.00, 51.59), "stage": pm.STAGE_TREND},
    "Space Tech":             {"accel": 33, "perfs": P(5.34, 14.35, -5.71, 24.93), "stage": pm.STAGE_PULLBACK},
    "Agriculture & Food":     {"accel": 23, "perfs": P(3.37, 13.87, 2.03, -5.58),  "stage": pm.STAGE_BOUNCE},
    "Commodities — Metals":   {"accel": 34, "perfs": P(5.24, 12.67, -11.39, -12.38), "stage": pm.STAGE_BOUNCE},
    "VR & Augmented Reality": {"accel": 2,  "perfs": P(4.32, 12.56, 14.77, 33.78), "stage": pm.STAGE_TREND},
    "Big Data":               {"accel": -1, "perfs": P(5.76, 12.54, 19.46, 31.32), "stage": pm.STAGE_TREND},
    "Cybersecurity":          {"accel": -7, "perfs": P(8.04, 11.60, 51.65, 68.43), "stage": pm.STAGE_EXTENDED},
}


class ChainSegmentTest(unittest.TestCase):
    def test_denests_correctly(self):
        self.assertAlmostEqual(pm.chain_segment(14.35, -5.71), -17.54, delta=0.02)
        self.assertAlmostEqual(pm.chain_segment(-5.71, 24.93), 32.50, delta=0.02)

    def test_guards_division_by_zero(self):
        self.assertIsNone(pm.chain_segment(-100, 10))
        self.assertIsNone(pm.chain_segment(None, 10))


class ClassifyStageTest(unittest.TestCase):
    def test_all_eight_real_rows(self):
        for name, f in FIXTURES.items():
            seg = pm.segments(f["perfs"])
            stage = pm.classify_stage(seg, f["accel"])
            self.assertEqual(stage, f["stage"], f"{name}: erwartet {f['stage']}, war {stage}")

    def test_missing_6m_is_unknown(self):
        seg = pm.segments({"1W": 1, "1M": 2, "3M": 3})
        self.assertEqual(pm.classify_stage(seg, 5), pm.STAGE_UNKNOWN)


class QualifiedPositionThemesTest(unittest.TestCase):
    """Persistenz braucht YTD, das die JS-Fixtures nicht mitbringen — deshalb
    ein eigenes, kleines synthetisches Universum statt der obigen Fixtures."""

    def _themes(self, overrides=None):
        # 10 Themes: "Leader" fuehrt ueberall (persistent + TREND-Stage + Lauf
        # > 15%), "Chaser" liegt nur in 3M knapp vor Leader (sonst schwach) —
        # das erzeugt accel(Leader) > 0. Ohne Chaser waeren Leaders 1M- und
        # 3M-Rang beide exakt 1 (accel = 0), was classify_stage in den
        # EXTENDED-Zweig laufen laesst (der genau bei accel <= 0 UND
        # m1 < m2_3 greift) statt in TREND — ein Artefakt der Rang-Formel bei
        # einem einzelnen Ausreisser vor einem komplett flachen Rest, nicht
        # der hier zu testenden Position-Logik.
        themes = {
            "Leader": {
                "perfs": {"1W": 1, "1M": 5, "3M": 20, "6M": 40, "YTD": 45},
                "tickers": ["AAA", "BBB"],
            },
            "Chaser": {
                "perfs": {"1W": 0, "1M": -5, "3M": 25, "6M": -10, "YTD": -10},
                "tickers": [],
            },
        }
        for i in range(8):
            themes[f"Filler{i}"] = {
                "perfs": {"1W": 0, "1M": 0, "3M": 0, "6M": 0, "YTD": 0},
                "tickers": [],
            }
        if overrides:
            themes.update(overrides)
        return themes

    def test_clear_leader_qualifies(self):
        out = pm.qualified_position_themes(self._themes())
        self.assertIn("Leader", out)
        self.assertEqual(out["Leader"]["stage"], pm.STAGE_TREND)
        self.assertEqual(len(out), 1)

    def test_weak_run_does_not_qualify_despite_persistence(self):
        # Top-Rang ueberall, aber Lauf Monate 4-6 unter der Schwelle (15%).
        themes = self._themes({
            "Leader": {"perfs": {"1W": 1, "1M": 5, "3M": 10, "6M": 12, "YTD": 20},
                       "tickers": ["AAA"]},
        })
        out = pm.qualified_position_themes(themes)
        self.assertNotIn("Leader", out)

    def test_not_top_rank_in_all_three_horizons_does_not_qualify(self):
        # Starker Lauf und TREND-Stage, aber YTD-Rang schlecht -> Persistenz reisst.
        themes = self._themes({
            "Leader": {"perfs": {"1W": 1, "1M": 5, "3M": 20, "6M": 40, "YTD": -50},
                       "tickers": ["AAA"]},
            "Filler0": {"perfs": {"1W": 0, "1M": 0, "3M": 0, "6M": 0, "YTD": 50},
                        "tickers": []},
        })
        out = pm.qualified_position_themes(themes)
        self.assertNotIn("Leader", out)


if __name__ == "__main__":
    unittest.main()
