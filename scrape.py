"""
Daily scrape script — run by GitHub Actions.
Fetches Finviz industry data AND Finviz thematic map data in parallel, writes:
  docs/data.json     — industry snapshot (Heatmap, Picks, Top 10 tabs)
  docs/etf_data.json — thematic map snapshot (ETF Themes tab)
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


def fetch_themes():
    print("Fetching Finviz thematic map data...")
    return scraper.fetch_themes_data()


def fetch_etf_perf():
    print("Fetching Finviz ETF performance data...")
    result = scraper._fetch_etf_perf()
    print(f"  {len(result)} ETFs fetched.")
    return result


def main():
    DOCS.mkdir(exist_ok=True)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # ── Parallel fetch ────────────────────────────────────────────────────────
    scored = None
    etf_payload = None
    etf_perf_payload = None

    with ThreadPoolExecutor(max_workers=3) as pool:
        fut_ind      = pool.submit(fetch_industries)
        fut_etf      = pool.submit(fetch_themes)
        fut_etf_perf = pool.submit(fetch_etf_perf)

        for fut in as_completed([fut_ind, fut_etf, fut_etf_perf]):
            try:
                result = fut.result()
                if fut is fut_ind:
                    scored = result
                elif fut is fut_etf:
                    etf_payload = result
                else:
                    etf_perf_payload = result
            except Exception as e:
                if fut is fut_ind:
                    print(f"  ERROR: Industry fetch failed: {e}")
                elif fut is fut_etf:
                    print(f"  WARNING: ETF themes fetch failed: {e}")
                else:
                    print(f"  WARNING: ETF perf fetch failed: {e}")

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
        print(f"  Saved etf_data.json ({len(etf_payload['themes'])} themes, {len(etf_payload['subnodes'])} sub-nodes)")
    else:
        print("  SKIPPED etf_data.json (fetch failed)")

    # ── Write etf_perf.json ───────────────────────────────────────────────────
    if etf_perf_payload:
        payload_out = {
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "etfs": etf_perf_payload,
        }
        (DOCS / "etf_perf.json").write_text(
            json.dumps(payload_out, ensure_ascii=False, separators=(",", ":"))
        )
        print(f"  Saved etf_perf.json ({len(etf_perf_payload)} ETFs)")
    else:
        print("  SKIPPED etf_perf.json (fetch failed)")

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
