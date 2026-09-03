"""
tests/test_position_thesis.py — Diff-/Staleness-/Pruning-Logik von
position_thesis.update_position_thesis(), OHNE echten LLM-Aufruf (thesis_fn
wird durch einen Stub ersetzt — kein Netzwerk, kein API-Key noetig).
"""
import json
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

import position_thesis as pt


def qualifying_leader_themes():
    """Ein einzelnes klar qualifizierendes Theme (siehe test_position_metrics
    fuer die Herleitung von 'Chaser' gegen das accel==0/EXTENDED-Artefakt)."""
    themes = {
        "Leader": {"perfs": {"1W": 1, "1M": 5, "3M": 20, "6M": 40, "YTD": 45},
                   "tickers": ["AAA", "BBB"]},
        "Chaser": {"perfs": {"1W": 0, "1M": -5, "3M": 25, "6M": -10, "YTD": -10},
                   "tickers": []},
    }
    for i in range(8):
        themes[f"Filler{i}"] = {"perfs": {"1W": 0, "1M": 0, "3M": 0, "6M": 0, "YTD": 0}, "tickers": []}
    return themes


class UpdatePositionThesisTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.docs_dir = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def _read(self):
        return json.loads((self.docs_dir / pt.THESIS_FILENAME).read_text(encoding="utf-8"))

    def test_new_qualification_calls_llm_once(self):
        calls = []

        def stub(name, tickers):
            calls.append(name)
            return f"These für {name}."

        payload = pt.update_position_thesis(qualifying_leader_themes(), self.docs_dir, thesis_fn=stub)
        self.assertEqual(calls, ["Leader"])
        self.assertIn("Leader", payload["themes"])
        self.assertEqual(payload["themes"]["Leader"]["thesis"], "These für Leader.")

    def test_fresh_thesis_is_not_regenerated(self):
        calls = []
        stub = lambda name, tickers: calls.append(name) or "erste These"

        pt.update_position_thesis(qualifying_leader_themes(), self.docs_dir, thesis_fn=stub)
        self.assertEqual(len(calls), 1)

        # Zweiter Lauf, Theme weiterhin qualifiziert, These noch frisch -> kein neuer Call.
        pt.update_position_thesis(qualifying_leader_themes(), self.docs_dir, thesis_fn=stub)
        self.assertEqual(len(calls), 1, "sollte die gespeicherte, frische These wiederverwenden")

    def test_stale_thesis_is_refreshed(self):
        old = (datetime.now(timezone.utc) - timedelta(days=pt.REFRESH_DAYS + 1)).isoformat()
        (self.docs_dir / pt.THESIS_FILENAME).write_text(json.dumps({
            "generated_at": old,
            "themes": {"Leader": {"thesis": "alte These", "qualified_since": "2026-01-01",
                                   "generated_at": old, "model": pt.MODEL,
                                   "stage": "TREND", "pos_score": 1.0}},
        }), encoding="utf-8")

        calls = []
        stub = lambda name, tickers: calls.append(name) or "neue These"
        payload = pt.update_position_thesis(qualifying_leader_themes(), self.docs_dir, thesis_fn=stub)

        self.assertEqual(calls, ["Leader"])
        self.assertEqual(payload["themes"]["Leader"]["thesis"], "neue These")
        # qualified_since bleibt erhalten -> keine erfundene Neu-Qualifikation.
        self.assertEqual(payload["themes"]["Leader"]["qualified_since"], "2026-01-01")

    def test_dequalified_theme_is_dropped(self):
        (self.docs_dir / pt.THESIS_FILENAME).write_text(json.dumps({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "themes": {"ExTheme": {"thesis": "alte These", "qualified_since": "2026-01-01",
                                    "generated_at": datetime.now(timezone.utc).isoformat(),
                                    "model": pt.MODEL, "stage": "TREND", "pos_score": 1.0}},
        }), encoding="utf-8")

        # Universum ohne "ExTheme" und ohne irgendein qualifizierendes Theme.
        flat_themes = {f"Filler{i}": {"perfs": {"1W": 0, "1M": 0, "3M": 0, "6M": 0, "YTD": 0}, "tickers": []}
                       for i in range(10)}
        payload = pt.update_position_thesis(flat_themes, self.docs_dir, thesis_fn=lambda n, t: "x")

        self.assertEqual(payload["themes"], {})

    def test_failed_call_keeps_previous_thesis(self):
        old = datetime.now(timezone.utc).isoformat()
        (self.docs_dir / pt.THESIS_FILENAME).write_text(json.dumps({
            "generated_at": old,
            "themes": {"Leader": {"thesis": "bestehende These", "qualified_since": "2026-01-01",
                                   "generated_at": (datetime.now(timezone.utc)
                                                     - timedelta(days=pt.REFRESH_DAYS + 1)).isoformat(),
                                   "model": pt.MODEL, "stage": "TREND", "pos_score": 1.0}},
        }), encoding="utf-8")

        payload = pt.update_position_thesis(qualifying_leader_themes(), self.docs_dir,
                                             thesis_fn=lambda n, t: None)
        self.assertEqual(payload["themes"]["Leader"]["thesis"], "bestehende These")

    def test_no_qualified_themes_writes_empty_payload_without_calling_llm(self):
        calls = []
        flat_themes = {f"Filler{i}": {"perfs": {"1W": 0, "1M": 0, "3M": 0, "6M": 0, "YTD": 0}, "tickers": []}
                       for i in range(10)}
        payload = pt.update_position_thesis(flat_themes, self.docs_dir,
                                             thesis_fn=lambda n, t: calls.append(n))
        self.assertEqual(calls, [])
        self.assertEqual(payload["themes"], {})


if __name__ == "__main__":
    unittest.main()
