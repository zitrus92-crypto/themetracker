import json
import re
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

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

# Trading days per period (approximate)
_PERIOD_DAYS = {"1D": 1, "1W": 5, "1M": 21, "3M": 63}


def fetch_all() -> dict:
    response = requests.get(URL, headers=HEADERS, timeout=15)
    response.raise_for_status()
    return parse_js_rows(response.text)


def parse_js_rows(html: str) -> dict:
    # New Finviz format (2026+): FinvizInitGroupsPerformance([...])
    match = re.search(r"FinvizInitGroupsPerformance\((\[.*?\])\)", html, re.DOTALL)
    if not match:
        # Fallback: old format var rows = [...]
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


# ── Finviz Thematic Map Data ─────────────────────────────────────────────────

# Top-level theme display names keyed by node prefix
THEME_LABELS = {
    "ai":             "Artificial Intelligence",
    "agriculture":    "Agriculture & Food",
    "automation":     "Industrial Automation",
    "autonomous":     "Autonomous Systems",
    "bigdata":        "Big Data",
    "biometrics":     "Biometrics",
    "blockchain":     "Crypto & Blockchain",
    "cloud":          "Cloud Computing",
    "commag":         "Commodities — Agri",
    "commenergy":     "Commodities — Energy",
    "commmetals":     "Commodities — Metals",
    "consumer":       "Consumer Goods",
    "cybersecurity":  "Cybersecurity",
    "defense":        "Defense & Aerospace",
    "ecommerce":      "E-Commerce",
    "education":      "Education Tech",
    "energybase":     "Energy Traditional",
    "energyclean":    "Clean Energy",
    "entertainment":  "Digital Entertainment",
    "environmental":  "Environmental",
    "evs":            "Electric Vehicles",
    "fintech":        "Fintech",
    "hardware":       "Hardware",
    "healthcare":     "Healthcare & Biotech",
    "iot":            "Internet of Things",
    "longevity":      "Aging Population",
    "nanotech":       "Nanotechnology",
    "nutrition":      "Healthy Food & Nutrition",
    "quantum":        "Quantum Computing",
    "realestate":     "Real Estate & REITs",
    "robotics":       "Robotics",
    "semis":          "Semiconductors",
    "smarthome":      "Smart Home",
    "social":         "Social Media",
    "software":       "Software",
    "space":          "Space Tech",
    "telecom":        "Telecommunications",
    "transportation": "Transportation & Logistics",
    "vareality":      "VR & Augmented Reality",
    "wearables":      "Wearables",
}

# Human-readable labels for each of the 268 sub-nodes
NODE_LABELS = {
    # Artificial Intelligence
    "aicompute": "Compute",          "aicloud": "Cloud",
    "aimodels": "Models",            "aidata": "Data",
    "aienterprise": "Enterprise",    "ainetworking": "Networking",
    "aisecurity": "Security",        "aiedge": "Edge",
    "airobotics": "Robotics",        "aiapplications": "Applications",
    "aiadssearch": "Ads & Search",   "aienergy": "Energy",
    "aiagi": "AGI",
    # Agriculture & Food
    "agriculturealtprotein": "Alt Protein",
    "agriculturecropinputs": "Crop Inputs",
    "agricultureindoorfarming": "Indoor Farming",
    "agricultureprocessing": "Processing",
    "agriculturesmartfarming": "Smart Farming",
    # Industrial Automation
    "automationautomation": "Automation",
    "automationdprinting": "3D Printing",
    "automationiot": "IoT",
    "automationlogistics": "Logistics",
    "automationmachinevision": "Machine Vision",
    "automationrobotics": "Robotics",
    "automationsoftware": "Software",
    # Autonomous Systems
    "autonomousavmobility": "AV & Mobility",
    "autonomousdefense": "Defense",
    "autonomousindustrial": "Industrial",
    "autonomousmachinevision": "Machine Vision",
    "autonomoussoftware": "Software",
    "autonomousspecialized": "Specialized",
    # Big Data
    "bigdataaiplatforms": "AI Platforms",
    "bigdataanalyticsbi": "Analytics & BI",
    "bigdatainfrastructure": "Infrastructure",
    "bigdataproviders": "Providers",
    # Biometrics
    "biometricsgovdefense": "Gov & Defense",
    "biometricshardware": "Hardware",
    "biometricsidentity": "Identity",
    "biometricssoftware": "Software",
    # Crypto & Blockchain
    "blockchainenterprise": "Enterprise",
    "blockchaininfrastructure": "Infrastructure",
    "blockchainmining": "Mining",
    "blockchainpayments": "Payments",
    "blockchainplatforms": "Platforms",
    "blockchaintokenization": "Tokenization",
    # Cloud Computing
    "clouddatabases": "Databases",
    "clouddatacenters": "Data Centers",
    "clouddevops": "DevOps",
    "cloudedge": "Edge",
    "cloudhardware": "Hardware",
    "cloudhsaas": "H-SaaS",
    "cloudhybridcloud": "Hybrid Cloud",
    "cloudhyperscalers": "Hyperscalers",
    "cloudmulticloud": "Multi-Cloud",
    "cloudpaas": "PaaS",
    "cloudsecurity": "Security",
    "cloudserverless": "Serverless",
    # Commodities — Agri
    "commagribiofuels": "Biofuels",
    "commagrifertilizers": "Fertilizers",
    "commagrigrains": "Grains",
    "commagrilivestock": "Livestock",
    "commagrisofts": "Softs",
    # Commodities — Energy
    "commenergybiofuels": "Biofuels",
    "commenergygaslng": "Gas & LNG",
    "commenergyoil": "Oil",
    "commenergyuranium": "Uranium",
    # Commodities — Metals
    "commmetalsbattery": "Battery Metals",
    "commmetalsgold": "Gold",
    "commmetalsindustrial": "Industrial",
    "commmetalsprecious": "Precious",
    "commmetalsrareearth": "Rare Earth",
    "commmetalsrecycling": "Recycling",
    "commmetalssilver": "Silver",
    # Consumer Goods
    "consumerapparel": "Apparel",
    "consumerfarmdirect": "Farm Direct",
    "consumerfood": "Food",
    "consumerhousehold": "Household",
    "consumerluxury": "Luxury",
    "consumersecondhand": "Secondhand",
    # Cybersecurity
    "cybersecurityappsecurity": "App Security",
    "cybersecuritycloud": "Cloud",
    "cybersecurityendpoint": "Endpoint",
    "cybersecurityidentityiam": "Identity & IAM",
    "cybersecuritynetwork": "Network",
    "cybersecuritysiem": "SIEM",
    "cybersecuritythreatops": "ThreatOps",
    "cybersecurityzerotrust": "Zero Trust",
    # Defense & Aerospace
    "defenseaviation": "Aviation",
    "defensecyberdefense": "Cyber Defense",
    "defensedrones": "Drones",
    "defensemanufacturing": "Manufacturing",
    "defensemissiles": "Missiles",
    "defensespacetech": "Space Tech",
    "defenseweapons": "Weapons",
    # E-Commerce
    "ecommerceadsmedia": "Ads & Media",
    "ecommercedtc": "DTC",
    "ecommercegrocery": "Grocery",
    "ecommercelogistics": "Logistics",
    "ecommercemarketplaces": "Marketplaces",
    "ecommerceomnichannel": "Omnichannel",
    "ecommerceplatforms": "Platforms",
    "ecommercesecondhand": "Secondhand",
    "ecommercesocial": "Social Commerce",
    # Education Tech
    "educationcurriculum": "Curriculum",
    "educationinfrastructure": "Infrastructure",
    "educationplatforms": "Platforms",
    "educationworkforce": "Workforce",
    # Energy Traditional
    "energybasemajors": "Majors",
    "energybasenuclear": "Nuclear",
    "energybaseoilproduction": "Oil Production",
    "energybaseoilrefining": "Oil Refining",
    "energybaseoilservices": "Oil Services",
    "energybasethermal": "Thermal",
    "energybaseutilities": "Utilities",
    # Clean Energy
    "energycleanbatteries": "Batteries",
    "energycleanbiofuels": "Biofuels",
    "energycleangeothermal": "Geothermal",
    "energycleanhydrogen": "Hydrogen",
    "energycleanmaterials": "Materials",
    "energycleansmartgrid": "Smart Grid",
    "energycleansolar": "Solar",
    "energycleanutilities": "Utilities",
    "energycleanwind": "Wind",
    # Digital Entertainment
    "entertainmentbetting": "Betting",
    "entertainmentgambling": "Gambling",
    "entertainmentgaming": "Gaming",
    "entertainmentinfrastructure": "Infrastructure",
    "entertainmentmusic": "Music",
    "entertainmentvideo": "Video",
    # Environmental
    "environmentalagriculture": "Agriculture",
    "environmentalairquality": "Air Quality",
    "environmentalclimate": "Climate",
    "environmentalwaste": "Waste",
    "environmentalwater": "Water",
    # Electric Vehicles
    "evsbatteries": "Batteries",
    "evscharging": "Charging",
    "evschips": "Chips",
    "evsfleets": "Fleets",
    "evsmanufacturers": "Manufacturers",
    "evsselfdriving": "Self-Driving",
    "evssuppliers": "Suppliers",
    # Fintech
    "fintechblockchain": "Blockchain",
    "fintechexchanges": "Exchanges",
    "fintechinsurance": "Insurance",
    "fintechlending": "Lending",
    "fintechneobanks": "Neobanks",
    "fintechpayments": "Payments",
    "fintechtrading": "Trading",
    # Hardware
    "hardwaredatacenters": "Data Centers",
    "hardwareelectronics": "Electronics",
    "hardwaregaming": "Gaming",
    "hardwareindustrialiot": "Industrial IoT",
    "hardwarenetworking": "Networking",
    "hardwarenextgen": "Next-Gen",
    "hardwarepcsdevices": "PCs & Devices",
    "hardwareprinting": "Printing",
    "hardwareservers": "Servers",
    "hardwarestorage": "Storage",
    "hardwaretelecom": "Telecom",
    # Healthcare & Biotech
    "healthcaredevices": "Devices",
    "healthcarediagnostics": "Diagnostics",
    "healthcaregenomics": "Genomics",
    "healthcareitdata": "IT & Data",
    "healthcaremetabolic": "Metabolic",
    "healthcarenextgen": "Next-Gen",
    "healthcareoncology": "Oncology",
    "healthcaretelemedicine": "Telemedicine",
    "healthcaretherapeutics": "Therapeutics",
    # Internet of Things
    "iotedgedevices": "Edge Devices",
    "iotenterprise": "Enterprise",
    "iothardware": "Hardware",
    "iotnetworking": "Networking",
    "iotsecurity": "Security",
    "iotsoftware": "Software",
    # Aging Population
    "longevityagingpharma": "Aging Pharma",
    "longevityhealthcare": "Healthcare",
    "longevityhealthyaging": "Healthy Aging",
    "longevityseniorliving": "Senior Living",
    # Nanotechnology
    "nanotechelectronics": "Electronics",
    "nanotechenergy": "Energy",
    "nanotechmaterials": "Materials",
    "nanotechmedicine": "Medicine",
    "nanotechproducts": "Products",
    "nanotechresearchtools": "Research Tools",
    # Healthy Food & Nutrition
    "nutritionaltprotein": "Alt Protein",
    "nutritionmealdelivery": "Meal Delivery",
    "nutritionretailers": "Retailers",
    "nutritionsupplements": "Supplements",
    # Quantum Computing
    "quantumapplications": "Applications",
    "quantumcloud": "Cloud",
    "quantumenablingtech": "Enabling Tech",
    "quantumhardware": "Hardware",
    "quantumnetworking": "Networking",
    "quantumsoftware": "Software",
    # Real Estate & REITs
    "realestatehealthcare": "Healthcare",
    "realestatehousing": "Housing",
    "realestateittelecom": "IT & Telecom",
    "realestateoffice": "Office",
    "realestateretail": "Retail",
    "realestatetourism": "Tourism",
    "realestatewarehousing": "Warehousing",
    # Robotics
    "roboticsautomation": "Automation",
    "roboticsavmobility": "AV & Mobility",
    "roboticsconsumer": "Consumer",
    "roboticslogistics": "Logistics",
    "roboticsmachinevision": "Machine Vision",
    "roboticsmedical": "Medical",
    # Semiconductors
    "semisanalog": "Analog",
    "semiscompute": "Compute",
    "semisdesigntools": "Design Tools",
    "semisfoundries": "Foundries",
    "semislithography": "Lithography",
    "semismemory": "Memory",
    "semisnextgen": "Next-Gen",
    "semispackaging": "Packaging",
    "semiswireless": "Wireless",
    # Smart Home
    "smarthomeautomation": "Automation",
    "smarthomedevices": "Devices",
    "smarthomeenergy": "Energy",
    "smarthomenetworking": "Networking",
    "smarthomesecurity": "Security",
    "smarthomevoiceai": "Voice & AI",
    # Social Media
    "socialadvertising": "Advertising",
    "socialgaming": "Gaming",
    "socialnetworks": "Networks",
    "socialniche": "Niche",
    "socialvisualcontent": "Visual Content",
    # Software
    "softwarecollaboration": "Collaboration",
    "softwarecrm": "CRM",
    "softwaredataanalytics": "Data Analytics",
    "softwaredesign": "Design",
    "softwaredevops": "DevOps",
    "softwareecommerce": "E-Commerce",
    "softwareenterprise": "Enterprise",
    "softwaregaming": "Gaming",
    "softwarehsaas": "H-SaaS",
    "softwareos": "OS",
    "softwaresecurity": "Security",
    "softwarevsaas": "V-SaaS",
    # Space Tech
    "spacedataanalytics": "Data Analytics",
    "spacedefense": "Defense",
    "spaceinfrastructure": "Infrastructure",
    "spacelaunch": "Launch",
    "spacesatellites": "Satellites",
    # Telecommunications
    "telecomcloudedge": "Cloud & Edge",
    "telecomenterprise": "Enterprise",
    "telecomg": "5G",
    "telecominfrastructure": "Infrastructure",
    "telecomsatcom": "Satcom",
    "telecomwireless": "Wireless",
    # Transportation & Logistics
    "transportationaircargo": "Air Cargo",
    "transportationairtravel": "Air Travel",
    "transportationinfrastructure": "Infrastructure",
    "transportationmaritime": "Maritime",
    "transportationnextgen": "Next-Gen",
    "transportationrail": "Rail",
    "transportationtrucking": "Trucking",
    "transportationwarehousing": "Warehousing",
    # VR & Augmented Reality
    "varealityapplications": "Applications",
    "varealityenterprise": "Enterprise",
    "varealityhardware": "Hardware",
    "varealityinfrastructure": "Infrastructure",
    "varealitysoftware": "Software",
    # Wearables
    "wearablesimmersive": "Immersive",
    "wearablesmedical": "Medical",
    "wearablessmartwatches": "Smartwatches",
    "wearablessoftware": "Software",
    "wearablessport": "Sport",
}

# Derive node_key → theme label from longest-prefix match
_sorted_prefixes = sorted(THEME_LABELS.keys(), key=len, reverse=True)
NODE_TO_THEME = {}
for _node in NODE_LABELS:
    for _prefix in _sorted_prefixes:
        if _node.startswith(_prefix):
            NODE_TO_THEME[_node] = THEME_LABELS[_prefix]
            break

_TIMEFRAMES_ST = {"1D": "d1", "1W": "w1", "1M": "w4", "3M": "w13", "YTD": "ytd"}


def _theme_slug_for_screener(display_name: str) -> str:
    """Convert theme display name to Finviz screener slug (all lowercase, alphanum only)."""
    return re.sub(r'[^a-z0-9]', '', display_name.lower())


def _parse_screener_page(html: str) -> list[str]:
    """
    Extract 'EXCHANGE:TICKER' (or plain 'TICKER') strings from a Finviz screener page.
    Tries new JS init format first, then old var-rows format, then HTML link fallback.
    """
    # --- New JS format: FinvizInitScreener([...], {...}) ---
    match = re.search(r'FinvizInitScreener\s*\(\s*(\[.*?\])\s*[,)]', html, re.DOTALL)
    if match:
        try:
            rows = json.loads(match.group(1))
            result = []
            for row in rows:
                if isinstance(row, dict):
                    ticker = (row.get('ticker') or row.get('t') or '').strip().upper()
                    exchange = (row.get('exchange') or row.get('ex') or row.get('e') or '').strip().upper()
                    if ticker:
                        result.append(f"{exchange}:{ticker}" if exchange else ticker)
                elif isinstance(row, list) and len(row) >= 2:
                    ticker = str(row[1]).strip().upper()
                    if re.fullmatch(r'[A-Z]{1,5}', ticker):
                        result.append(ticker)
            if result:
                return result
        except Exception:
            pass

    # --- Old JS format: var rows = [...] ---
    match = re.search(r'var rows\s*=\s*(\[.*?\]);', html, re.DOTALL)
    if match:
        try:
            rows = json.loads(match.group(1))
            result = []
            for row in rows:
                if isinstance(row, dict):
                    ticker = (row.get('ticker') or '').strip().upper()
                    exchange = (row.get('exchange') or '').strip().upper()
                    if ticker:
                        result.append(f"{exchange}:{ticker}" if exchange else ticker)
                elif isinstance(row, list) and len(row) >= 2:
                    ticker = str(row[1]).strip().upper()
                    if re.fullmatch(r'[A-Z]{1,5}', ticker):
                        result.append(ticker)
            if result:
                return result
        except Exception:
            pass

    # --- HTML fallback: find ticker links like quote.ashx?t=NVDA ---
    tickers = re.findall(r'quote\.ashx\?t=([A-Z]{1,5})', html)
    return list(dict.fromkeys(tickers))


def _get_screener_total(html: str) -> int:
    """Try to extract total stock count from Finviz screener HTML."""
    m = re.search(r'Total:\s*(\d+)', html)
    if m:
        return int(m.group(1))
    m = re.search(r'\d+\s*[-–]\s*\d+\s+of\s+(\d+)', html)
    if m:
        return int(m.group(1))
    return 0


def _fetch_tickers_for_slug(slug: str) -> list[str]:
    """
    Fetch all stock tickers for a Finviz theme screener slug.
    Paginates automatically (20 rows per page).
    Returns list of 'EXCHANGE:TICKER' (or 'TICKER') strings.
    """
    all_tickers: list[str] = []
    seen: set[str] = set()
    row_start = 1
    PAGE_SIZE = 20

    while True:
        url = f"https://finviz.com/screener.ashx?v=141&f=theme_{slug}&r={row_start}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            html = resp.text
        except Exception as e:
            print(f"      WARNING: screener fetch failed [{slug} r={row_start}]: {e}")
            break

        page = _parse_screener_page(html)
        new_on_page = 0
        for entry in page:
            base_ticker = entry.split(":")[-1]
            if base_ticker not in seen:
                seen.add(base_ticker)
                all_tickers.append(entry)
                new_on_page += 1

        if not new_on_page:
            break

        # Stop if we already have everything or page was incomplete
        total = _get_screener_total(html)
        if total > 0 and len(all_tickers) >= total:
            break
        if len(page) < PAGE_SIZE:
            break

        row_start += PAGE_SIZE
        time.sleep(0.35)   # be polite to Finviz between pages

    return all_tickers


def _fetch_one_timeframe(tf: str) -> tuple[str, dict]:
    """Fetch Finviz themes map for one timeframe. Returns (tf, {node_key: perf_%})."""
    st = _TIMEFRAMES_ST[tf]
    url = f"https://finviz.com/map?t=themes&st={st}"
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    canvas_match = re.search(r"FinvizInitCanvas\((.*?)\);", r.text, re.DOTALL)
    if not canvas_match:
        raise ValueError(f"FinvizInitCanvas not found for {tf}")
    args = canvas_match.group(1)
    perf_match = re.search(r"initialPerf:\s*(\{[^}]+\})", args)
    if not perf_match:
        raise ValueError(f"initialPerf not found for {tf}")
    pairs = re.findall(r'"(\w+)":(-?[\d.]+)', perf_match.group(1))
    return tf, {k: float(v) for k, v in pairs if k in NODE_LABELS}


def fetch_themes_data() -> dict:
    """
    Fetch all 5 timeframes of Finviz thematic map data in parallel.
    Returns a dict ready to be serialised as etf_data.json.
    """
    print("  Fetching Finviz themes map (5 timeframes in parallel)…")

    # Parallel fetch all 5 timeframes
    tf_perfs: dict[str, dict[str, float]] = {}
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {pool.submit(_fetch_one_timeframe, tf): tf for tf in _TIMEFRAMES_ST}
        for fut in as_completed(futures):
            try:
                tf, data = fut.result()
                tf_perfs[tf] = data
            except Exception as e:
                print(f"    WARNING: {e}")

    # Build per-node perf records
    subnodes = {}
    for node_key, label in NODE_LABELS.items():
        perfs = {tf: tf_perfs.get(tf, {}).get(node_key) for tf in ["1D", "1W", "1M", "3M", "YTD"]}
        subnodes[node_key] = {
            "label": label,
            "theme": NODE_TO_THEME.get(node_key, "Other"),
            "perfs": perfs,
        }

    # Score sub-nodes (rank_1M×70% + rank_1W×20% + rank_3M×10%, lower = better)
    def rank_col(field):
        vals = {k: row["perfs"][field] for k, row in subnodes.items()
                if row["perfs"].get(field) is not None}
        sorted_keys = sorted(vals, key=lambda k: vals[k], reverse=True)
        return {k: (i + 1) for i, k in enumerate(sorted_keys)}

    ranks_1m = rank_col("1M")
    ranks_1w = rank_col("1W")
    ranks_3m = rank_col("3M")
    n = len(subnodes)

    for node_key, row in subnodes.items():
        r1m = ranks_1m.get(node_key, n)
        r1w = ranks_1w.get(node_key, n)
        r3m = ranks_3m.get(node_key, n)
        row["score"] = round(r1m * 0.70 + r1w * 0.20 + r3m * 0.10, 2)

    # Aggregate to top-level themes (average of all sub-nodes)
    themes_out = {}
    for theme_label in THEME_LABELS.values():
        nodes = [k for k, row in subnodes.items() if row["theme"] == theme_label]
        if not nodes:
            continue

        def avg_perf(field):
            vals = [subnodes[k]["perfs"].get(field) for k in nodes
                    if subnodes[k]["perfs"].get(field) is not None]
            return round(sum(vals) / len(vals), 2) if vals else None

        avg_score = sum(subnodes[k]["score"] for k in nodes) / len(nodes)
        # Top-3 sub-nodes by 1M perf for the chips column
        top3 = sorted(nodes, key=lambda k: (subnodes[k]["perfs"].get("1M") or -999), reverse=True)[:3]

        themes_out[theme_label] = {
            "perfs":    {tf: avg_perf(tf) for tf in ["1D", "1W", "1M", "3M", "YTD"]},
            "score":    round(avg_score, 2),
            "subnodes": nodes,
            "top3":     top3,
            "count":    len(nodes),
        }

    # Theme-level rank (score ascending = rank 1 = best)
    sorted_themes = sorted(themes_out, key=lambda t: themes_out[t]["score"])
    for rank, theme in enumerate(sorted_themes, 1):
        themes_out[theme]["rank"] = rank

    # ── Fetch ticker lists for each theme from Finviz screener ───────────────
    print(f"    Fetching ticker lists for {len(themes_out)} themes…")
    slug_map = {_theme_slug_for_screener(theme): theme for theme in themes_out}
    with ThreadPoolExecutor(max_workers=3) as pool:
        fut_map = {
            pool.submit(_fetch_tickers_for_slug, slug): slug
            for slug in slug_map
        }
        for fut in as_completed(fut_map):
            slug = fut_map[fut]
            theme = slug_map[slug]
            try:
                tickers = fut.result()
                themes_out[theme]["tickers"] = tickers
            except Exception as e:
                themes_out[theme]["tickers"] = []
                print(f"      WARNING: ticker fetch failed for {theme}: {e}")

    total_tickers = sum(len(themes_out[t]["tickers"]) for t in themes_out)
    print(f"    {len(themes_out)} themes, {len(subnodes)} sub-nodes, {total_tickers} tickers total")
    return {
        "themes":     themes_out,
        "subnodes":   subnodes,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }
