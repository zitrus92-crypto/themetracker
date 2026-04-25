"""
Daily scrape script — run by GitHub Actions.
Fetches Finviz industry data, scores it, writes:
  docs/data.json    — current full snapshot (used by all tabs)
  docs/history.json — compact daily history (used by Movers)
"""
import json
from pathlib import Path
from datetime import datetime, timezone

import scraper
from scores import compute_scores

DOCS = Path(__file__).parent / "docs"
MAX_HISTORY = 95  # ~4.5 months of trading days


def main():
    print("Fetching Finviz industry data...")
    raw = scraper.fetch_all()
    print(f"  {len(raw)} industries fetched.")

    scored = compute_scores(raw)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # --- Write data.json (full snapshot for current tabs) ---
    payload = {
        "industries": scored,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }
    DOCS.mkdir(exist_ok=True)
    (DOCS / "data.json").write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    )
    print(f"  Saved data.json")

    # --- Append to history.json (compact, for Movers) ---
    history_path = DOCS / "history.json"
    history = json.loads(history_path.read_text()) if history_path.exists() else []

    # Remove any existing entry for today (idempotent re-runs)
    history = [e for e in history if e["date"] != today]

    history.append({
        "date": today,
        "scores": {
            name: {
                "c": row["composite"],
                "a": row["acceleration"],
                "t": row["ticker"],
            }
            for name, row in scored.items()
        },
    })

    # Keep only the most recent entries
    history = history[-MAX_HISTORY:]
    history_path.write_text(
        json.dumps(history, ensure_ascii=False, separators=(",", ":"))
    )
    print(f"  Saved history.json ({len(history)} entries)")


if __name__ == "__main__":
    main()
