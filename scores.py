WEIGHTS = {"1D": 0.15, "1W": 0.40, "1M": 0.35, "3M": 0.10, "YTD": 0.0}
TIMEFRAMES = ["1D", "1W", "1M", "3M", "YTD"]


def compute_scores(data: dict) -> dict:
    industries = list(data.keys())

    ranks = {industry: {} for industry in industries}
    for tf in TIMEFRAMES:
        tf_industries = [(ind, data[ind][tf]) for ind in industries if tf in data[ind] and data[ind][tf] is not None]
        tf_industries.sort(key=lambda x: x[1], reverse=True)
        for rank, (ind, _) in enumerate(tf_industries, start=1):
            ranks[ind][tf] = rank

    n = len(industries)
    for ind in industries:
        for tf in TIMEFRAMES:
            if tf not in ranks[ind]:
                ranks[ind][tf] = n + 1

    result = {}
    for ind in industries:
        composite = sum(WEIGHTS[tf] * ranks[ind][tf] for tf in TIMEFRAMES)
        acceleration = ranks[ind]["3M"] - ranks[ind]["1W"]
        result[ind] = {
            "composite": round(composite, 3),
            "acceleration": acceleration,
            "ranks": dict(ranks[ind]),
            "perfs": {tf: data[ind].get(tf) for tf in TIMEFRAMES},
            "ticker": data[ind].get("ticker", ""),
        }

    return result
