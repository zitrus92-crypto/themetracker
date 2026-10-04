"""Gemeinsame Pfade/Helfer fuer die RS3M-vs-RS12M-Analyse."""
import json
import logging
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "data" / "norgate_cache"
OUT = ROOT / "analysis" / "rs3m_vs_rs12m" / "out"
THEMES_JSON = ROOT / "docs" / "data" / "theme_constituents.json"
START = "2010-01-01"
UNIVERSE_WL = "Russell 3000 Current & Past"
INDEX_NAME = "Russell 3000"
STEP = 5            # jeder 5. Handelstag
MIN_MEMBERS = 4     # Mindestzahl Theme-Mitglieder pro Tag
PERIODS = {"2011-2018": ("2011-01-01", "2018-12-31"), "2019-heute": ("2019-01-01", "2100-01-01")}
MIN_N = 30


def load_themes():
    """Theme -> Liste Roh-Ticker (ohne Boersenpraefix)."""
    d = json.loads(THEMES_JSON.read_text(encoding="utf-8"))
    return {t: [x.split(":", 1)[1] for x in v["tickers"]] for t, v in d["themes"].items()}


def quiet():
    logging.getLogger().setLevel(logging.WARNING)
