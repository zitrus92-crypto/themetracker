import json
import re
import requests

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

URL = "https://finviz.com/groups.ashx?g=industry&v=210&o=name&st=d1"

TIMEFRAMES = ["1D", "1W", "1M", "3M", "YTD"]

PERF_FIELDS = {
    "1D":  "perfT",
    "1W":  "perfW",
    "1M":  "perfM",
    "3M":  "perfQ",
    "YTD": "perfYtd",
}


def fetch_all() -> dict:
    response = requests.get(URL, headers=HEADERS, timeout=15)
    response.raise_for_status()
    return parse_js_rows(response.text)


def parse_js_rows(html: str) -> dict:
    match = re.search(r"var rows\s*=\s*(\[.*?\]);", html, re.DOTALL)
    if not match:
        raise ValueError("Could not find data table on Finviz page")
    rows = json.loads(match.group(1).replace("\\u0026", "&"))
    data = {}
    for row in rows:
        name = row.get("label", "").strip()
        if not name:
            continue
        data[name] = {
            "ticker": row.get("ticker", ""),
            **{tf: row.get(field) for tf, field in PERF_FIELDS.items()},
        }
    return data
