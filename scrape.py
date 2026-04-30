"""
Daily scrape script — run by GitHub Actions.
Fetches Finviz industry data AND thematic ETF data in parallel, writes:
  docs/data.json     — industry snapshot (Heatmap, Picks, Top 10 tabs)
  docs/etf_data.json — thematic ETF snapshot (ETF Themes tab)
  docs/history.json  — compact daily history (Movers tab)
"""
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from datetime import datetime, timezone

import scraper
from scores import compute_scores

DOCS = Path(__file__).parent / "docs"
MAX_HISTORY = 95  # ~4.5 months of trading days


def fetch_industries():
    print("Fetching Finviz industry data...")
    raw = scraper.fetch_all()
    print(f"  {len(raw)} industries fetched.")
    return compute_scores(raw)


def fetch_etfs():
    print("Fetching thematic ETF data...")
    return scraper.fetch_etf_data()


def main():
    DOCS.mkdir(exist_ok=True)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # ── Parallel fetch ────────────────────────────────────────────────────────
    scored = None
    etf_payload = None

    with ThreadPoolExecutor(max_workers=2) as pool:
        fut_ind = pool.submit(fetch_industries)
        fut_etf = pool.submit(fetch_etfs)

        for fut in as_completed([fut_ind, fut_etf]):
            try:
                result = fut.result()
                if fut is fut_ind:
                    scored = result
                else:
                    etf_payload = result
            except Exception as e:
                if fut is fut_ind:
                    print(f"  ERROR: Industry fetch failed: {e}")
                else:
                    print(f"  WARNING: ETF fetch failed: {e}")

    # ── Write data.json ───────────────────────────────────────────────────────
    if scored:
        payload = {
            "industries": scored,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }
        (DOCS / "data.json").write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        )
        print(f"  Saved data.json")
    else:
        print("  SKIPPED data.json (fetch failed)")

    # ── Write etf_data.json ───────────────────────────────────────────────────
    if etf_payload:
        (DOCS / "etf_data.json").write_text(
            json.dumps(etf_payload, ensure_ascii=False, separators=(",", ":"))
        )
        print(f"  Saved etf_data.json ({len(etf_payload['etfs'])} ETFs, {len(etf_payload['themes'])} themes)")
    else:
        print("  SKIPPED etf_data.json (fetch failed)")

    # ── Append to history.json ────────────────────────────────────────────────
    if scored:
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

        history = history[-MAX_HISTORY:]
        history_path.write_text(
            json.dumps(history, ensure_ascii=False, separators=(",", ":"))
        )
        print(f"  Saved history.json ({len(history)} entries)")


if __name__ == "__main__":
    main()
