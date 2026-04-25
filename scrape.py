"""
Daily scrape script — run by GitHub Actions.
Fetches Finviz industry data, scores it, writes docs/data.json.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

import scraper
from scores import compute_scores


def main():
    print("Fetching Finviz industry data...")
    raw = scraper.fetch_all()
    print(f"  {len(raw)} industries fetched.")

    scored = compute_scores(raw)

    payload = {
        "industries": scored,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }

    out = Path(__file__).parent / "docs" / "data.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")))
    print(f"  Saved to {out}")


if __name__ == "__main__":
    main()
