import csv
import io
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

TIMEFRAMES = ["1D", "1W", "1M", "3M", "6M", "YTD"]

PERF_FIELDS = {
    "1D":  "perfT",
    "1W":  "perfW",
    "1M":  "perfM",
    "3M":  "perfQ",
    "6M":  "perfH",
    "YTD": "perfYtd",
}

# Trading days per period (approximate)
_PERIOD_DAYS = {"1D": 1, "1W": 5, "1M": 21, "3M": 63, "6M": 126}


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

_TIMEFRAMES_ST = {"1D": "d1", "1W": "w1", "1M": "w4", "3M": "w13", "6M": "w26", "YTD": "ytd"}


# Finviz screener theme slugs that differ from the auto-derived form.
# Auto-derivation: display_name.lower() → remove non-alphanum.
# These overrides correct cases where Finviz uses a longer/different internal name,
# or where no screener filter exists (empty string → skip ticker fetch).
_THEME_SLUG_OVERRIDES: dict[str, str] = {
    # Finviz internal name differs from our display name
    "Commodities — Agri":      "commoditiesagriculture",   # Finviz: "Commodities - Agriculture"
    "Education Tech":          "educationtechnology",       # Finviz: "Education Technology"
    "Agriculture & Food":      "agriculturefoodtech",       # Finviz: "Agriculture & FoodTech"
    "Clean Energy":            "energyrenewable",           # Finviz: "Energy - Renewable"
    "Environmental":           "environmentalsustainability", # Finviz: "Environmental Sustainability"
    "Aging Population":        "agingpopulationlongevity", # Finviz: "Aging Population & Longevity"
    "VR & Augmented Reality":  "virtualaugmentedreality",  # Finviz: "Virtual & Augmented Reality"
}


def _theme_slug_for_screener(display_name: str) -> str:
    """
    Return the Finviz screener theme slug for a display name.
    Returns empty string if the theme has no screener filter.
    """
    if display_name in _THEME_SLUG_OVERRIDES:
        return _THEME_SLUG_OVERRIDES[display_name]
    return re.sub(r'[^a-z0-9]', '', display_name.lower())


def _fetch_tickers_for_slug(slug: str, filter_prefix: str = "theme") -> list[str]:
    """
    Fetch all stock tickers for a Finviz theme or sub-theme via the bubble-chart
    view (v=410). Server-rendered HTML, all tickers in one request via
    data-boxover-ticker attributes — no JS rendering required, no pagination.
    filter_prefix: "theme" for top-level themes, "subtheme" for sub-themes.
    Returns list of plain ticker symbols (e.g. ['NVDA', 'AMD', 'ASML', ...]).
    """
    MAX_RETRIES = 3
    url = f"https://finviz.com/screener.ashx?v=410&f={filter_prefix}_{slug}&r=1"

    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code == 429:
                wait = 8 * (attempt + 1)
                print(f"      429 rate-limit [{slug}], retrying in {wait}s…")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            tickers = re.findall(r'data-boxover-ticker="([A-Z]{1,6})"', resp.text)
            return list(dict.fromkeys(tickers))  # deduplicate, preserve order
        except Exception as e:
            if attempt == MAX_RETRIES - 1:
                print(f"      WARNING: ticker fetch failed [{slug}]: {e}")
            else:
                time.sleep(4)

    return []


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
    Fetch all 6 timeframes of Finviz thematic map data in parallel.
    Returns a dict ready to be serialised as etf_data.json.
    """
    print("  Fetching Finviz themes map (6 timeframes in parallel)…")

    # Parallel fetch all 6 timeframes
    tf_perfs: dict[str, dict[str, float]] = {}
    with ThreadPoolExecutor(max_workers=6) as pool:
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
        perfs = {tf: tf_perfs.get(tf, {}).get(node_key) for tf in ["1D", "1W", "1M", "3M", "6M", "YTD"]}
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
            "perfs":    {tf: avg_perf(tf) for tf in ["1D", "1W", "1M", "3M", "6M", "YTD"]},
            "score":    round(avg_score, 2),
            "subnodes": nodes,
            "top3":     top3,
            "count":    len(nodes),
        }

    # Theme-level rank (score ascending = rank 1 = best)
    sorted_themes = sorted(themes_out, key=lambda t: themes_out[t]["score"])
    for rank, theme in enumerate(sorted_themes, 1):
        themes_out[theme]["rank"] = rank

    # ── Fetch ticker lists for each theme sequentially (avoids 429 rate-limit) ─
    print(f"    Fetching ticker lists for {len(themes_out)} themes…")
    time.sleep(3)  # brief pause after the parallel timeframe fetches
    theme_list = list(themes_out.keys())
    for idx, theme in enumerate(theme_list):
        slug = _theme_slug_for_screener(theme)
        if not slug:
            themes_out[theme]["tickers"] = []
            print(f"      [{idx+1}/{len(theme_list)}] {theme}: no screener filter available")
            continue
        try:
            tickers = _fetch_tickers_for_slug(slug)
            themes_out[theme]["tickers"] = tickers
            print(f"      [{idx+1}/{len(theme_list)}] {theme}: {len(tickers)} tickers")
        except Exception as e:
            themes_out[theme]["tickers"] = []
            print(f"      WARNING: ticker fetch failed for {theme}: {e}")
        if idx < len(theme_list) - 1:
            time.sleep(1.2)  # polite gap between themes

    total_tickers = sum(len(themes_out[t]["tickers"]) for t in themes_out)
    print(f"    Theme tickers: {total_tickers} across {len(themes_out)} themes")

    # ── Fetch ticker lists for each sub-theme sequentially ─────────────────────
    print(f"    Fetching ticker lists for {len(subnodes)} sub-themes…")
    time.sleep(2)  # pause between theme and sub-theme fetches
    subnode_list = list(subnodes.keys())
    for idx, key in enumerate(subnode_list):
        try:
            tickers = _fetch_tickers_for_slug(key, filter_prefix="subtheme")
            subnodes[key]["tickers"] = tickers
            print(f"      [{idx+1}/{len(subnode_list)}] {key}: {len(tickers)} tickers")
        except Exception as e:
            subnodes[key]["tickers"] = []
            print(f"      WARNING: ticker fetch failed for sub-theme {key}: {e}")
        if idx < len(subnode_list) - 1:
            time.sleep(1.0)  # polite gap between sub-themes

    sub_total = sum(len(subnodes[k]["tickers"]) for k in subnodes)
    print(f"    Sub-theme tickers: {sub_total} across {len(subnodes)} sub-themes")
    return {
        "themes":     themes_out,
        "subnodes":   subnodes,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


# ── ETF Performance Tab ───────────────────────────────────────────────────────

ETF_UNIVERSE = [
    # Broad Market (5)
    {"ticker": "SPY",  "name": "SPDR S&P 500 ETF",              "category": "Broad Market"},
    {"ticker": "QQQ",  "name": "Invesco Nasdaq 100 ETF",         "category": "Broad Market"},
    {"ticker": "IWM",  "name": "iShares Russell 2000 ETF",       "category": "Broad Market"},
    {"ticker": "RSP",  "name": "Invesco S&P 500 Equal Weight",   "category": "Broad Market"},
    {"ticker": "QQQE", "name": "Direxion Nasdaq 100 Equal Wt",   "category": "Broad Market"},
    # US Sectors — SPDR Select Sector ETFs (11)
    {"ticker": "XLK",  "name": "Technology Select Sector",       "category": "US Sectors"},
    {"ticker": "XLV",  "name": "Health Care Select Sector",      "category": "US Sectors"},
    {"ticker": "XLF",  "name": "Financial Select Sector",        "category": "US Sectors"},
    {"ticker": "XLI",  "name": "Industrial Select Sector",       "category": "US Sectors"},
    {"ticker": "XLY",  "name": "Consumer Discret Select Sector", "category": "US Sectors"},
    {"ticker": "XLP",  "name": "Consumer Staples Select Sector", "category": "US Sectors"},
    {"ticker": "XLE",  "name": "Energy Select Sector",           "category": "US Sectors"},
    {"ticker": "XLU",  "name": "Utilities Select Sector",        "category": "US Sectors"},
    {"ticker": "XLB",  "name": "Materials Select Sector",        "category": "US Sectors"},
    {"ticker": "XLC",  "name": "Communication Svcs Select Sect", "category": "US Sectors"},
    {"ticker": "XLRE", "name": "Real Estate Select Sector",      "category": "US Sectors"},
    # Commodities (9)
    {"ticker": "GLD",  "name": "SPDR Gold Shares",               "category": "Commodities"},
    {"ticker": "SLV",  "name": "iShares Silver Trust",           "category": "Commodities"},
    {"ticker": "GDX",  "name": "VanEck Gold Miners ETF",         "category": "Commodities"},
    {"ticker": "GDXJ", "name": "VanEck Junior Gold Miners",      "category": "Commodities"},
    {"ticker": "USO",  "name": "United States Oil Fund",         "category": "Commodities"},
    {"ticker": "UNG",  "name": "United States Natural Gas Fund", "category": "Commodities"},
    {"ticker": "PDBC", "name": "Invesco Optimum Yield Cmdty",    "category": "Commodities"},
    {"ticker": "DBA",  "name": "Invesco DB Agriculture Fund",    "category": "Commodities"},
    {"ticker": "CPER", "name": "United States Copper Index Fund", "category": "Commodities"},
    # Crypto (7)
    {"ticker": "IBIT", "name": "iShares Bitcoin Trust",          "category": "Crypto"},
    {"ticker": "FBTC", "name": "Fidelity Wise Origin Bitcoin",   "category": "Crypto"},
    {"ticker": "GBTC", "name": "Grayscale Bitcoin Trust",        "category": "Crypto"},
    {"ticker": "ARKB", "name": "ARK 21Shares Bitcoin ETF",       "category": "Crypto"},
    {"ticker": "BITB", "name": "Bitwise Bitcoin ETF",            "category": "Crypto"},
    {"ticker": "ETHA", "name": "iShares Ethereum Trust",         "category": "Crypto"},
    {"ticker": "BITO", "name": "ProShares Bitcoin Strategy ETF", "category": "Crypto"},
]

ETF_TF_MAP = {"1D": "d1", "1W": "w1", "1M": "w4", "3M": "w13", "6M": "w26", "YTD": "ytd"}
KNOWN_TICKERS = {e["ticker"] for e in ETF_UNIVERSE}


def _fetch_etf_perf() -> dict:
    """Fetch ETF performance across 6 timeframes from Finviz map.ashx.

    URL pattern:  https://finviz.com/map.ashx?t=etf&st={d1,w1,w4,w13,w26,ytd}
    Data pattern: FinvizInitCanvas(..., initialPerf: {"nodes": {"SPY": 3.41, ...}}, ...)
    Note: the "nodes" wrapper is unique to ETF maps (themes map has flat initialPerf).
    """
    perfs_by_ticker: dict[str, dict] = {e["ticker"]: {} for e in ETF_UNIVERSE}

    for tf_label, st_param in ETF_TF_MAP.items():
        url = f"https://finviz.com/map.ashx?t=etf&st={st_param}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
        except Exception as e:
            print(f"  WARNING: ETF fetch failed for tf={tf_label}: {e}")
            continue

        canvas_match = re.search(r"FinvizInitCanvas\((.*?)\);", resp.text, re.DOTALL)
        if not canvas_match:
            print(f"  WARNING: FinvizInitCanvas not found for ETF tf={tf_label}")
            continue
        args = canvas_match.group(1)
        # Key difference from themes: wrapped in {"nodes": {...}}
        perf_match = re.search(r'initialPerf\s*:\s*\{"nodes":\{([^}]+)\}', args)
        if not perf_match:
            print(f"  WARNING: initialPerf nodes not found for ETF tf={tf_label}")
            continue
        try:
            nodes = json.loads("{" + perf_match.group(1) + "}")
        except json.JSONDecodeError as e:
            print(f"  WARNING: Failed to parse initialPerf nodes for ETF tf={tf_label}: {e}")
            continue
        for ticker in KNOWN_TICKERS:
            val = nodes.get(ticker)
            if val is not None:
                perfs_by_ticker[ticker][tf_label] = round(float(val), 2)
        time.sleep(0.5)

    result = {}
    for etf in ETF_UNIVERSE:
        t = etf["ticker"]
        result[t] = {
            "name":     etf["name"],
            "category": etf["category"],
            "perfs":    perfs_by_ticker.get(t, {}),
        }
    return result


# ── Industry ticker lists ─────────────────────────────────────────────────

def fetch_industry_tickers(scored: dict) -> dict:
    """Attach a `tickers` list to each scored industry via the Finviz ind_ filter.

    scored: output of compute_scores() — {industry_name: {..., "ticker": slug}}.
    Fetches in parallel (same proven path as themes). On failure for an industry,
    that industry gets tickers: [] and the run continues.
    Returns the same dict, each entry gaining a "tickers": [...] key.
    """
    names = list(scored.keys())
    print(f"    Fetching ticker lists for {len(names)} industries…")

    def _one(name: str) -> tuple[str, list[str]]:
        slug = scored[name].get("ticker", "")
        if not slug:
            return name, []
        try:
            return name, _fetch_tickers_for_slug(slug, filter_prefix="ind")
        except Exception as e:
            print(f"      WARNING: ticker fetch failed for industry {name}: {e}")
            return name, []

    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {pool.submit(_one, n): n for n in names}
        for fut in as_completed(futures):
            name, tickers = fut.result()
            scored[name]["tickers"] = tickers

    total = sum(len(scored[n].get("tickers", [])) for n in names)
    print(f"    Industry tickers: {total} across {len(names)} industries")
    return scored


# ── Regime-Gate (Modul A) ─────────────────────────────────────────────────
# Design: docs/superpowers/plans/2026-07-02-regime-gate-theme-id-empfehlung.md
# T1 = QQQ > SMA20 (Proxy für Spec-21-EMA — Finviz liefert keine EMA-Distanz),
# T2 = QQQ > SMA50, B1 = Stockbee-T2108 (% Aktien über 40-Tage-MA, Gesamtmarkt).
# Alle Schwellen: DEFAULT — UNVALIDIERT (Momentum-Konvention, nicht backgetestet).
REGIME_CONFIG = {
    "TREND_TICKER": "QQQ",   # schaltet das Gate
    "INFO_TICKER":  "IWM",   # nur Tooltip-Anzeige, schaltet nichts
    "B1_HEALTHY":   50.0,    # T2108 > 50 → gesunde Breadth      (UNVALIDIERT)
    "B1_WEAK":      40.0,    # T2108 < 40 → schwache Breadth     (UNVALIDIERT)
    # Hochstufung erst nach 2 EOD-Bestätigungen in Folge (fest verdrahtet in
    # apply_regime_hysteresis: raw == gestriges raw). Abstufung in RISK_OFF sofort.
}

STOCKBEE_MM_CSV = (
    "https://docs.google.com/spreadsheet/pub"
    "?key=0Am_cU8NLIU20dEhiQnVHN3Nnc3B1S3J6eGhKZFo0N3c&output=csv"
)


def _fetch_sma_distances(ticker: str) -> dict:
    """SMA20-/SMA50-Distanz in % von der Finviz-Quote-Seite (positiv = darüber).

    quote.ashx redirectet auf /stock?t=…; requests folgt automatisch.
    """
    url = f"https://finviz.com/quote.ashx?t={ticker}"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    out = {}
    for label in ("SMA20", "SMA50"):
        m = re.search(
            re.escape(label) + r"</div>\s*</td>.{0,500}?>\s*(-?\d+\.\d+)%\s*<",
            resp.text, re.DOTALL,
        )
        out[label] = float(m.group(1)) if m else None
    return out


def _fetch_stockbee_breadth() -> dict:
    """Jüngste Breadth-Zeile aus dem Stockbee-Market-Monitor-Sheet.

    Publiziertes Google Sheet als CSV; Zeile 0 = Gruppen-Header, Zeile 1 =
    Spalten-Header, danach Datenzeilen (neueste zuerst, Datum M/D/YYYY).
    Returns {"date", "value" (T2108), "sa": {up4, down4, ratio5d, ratio10d,
    t2108_avg5}} — "sa" speist die Situational-Awareness-Ampel
    (docs/superpowers/specs/2026-07-12-situational-awareness-design.md);
    t2108_avg5 = Schnitt der 5 Vortages-Werte, None bei zu wenig Historie.
    """
    resp = requests.get(STOCKBEE_MM_CSV, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    rows = list(csv.reader(io.StringIO(resp.text)))
    header = rows[1]

    def col(pred):
        return next((i for i, h in enumerate(header) if pred(h.lower())), None)

    t2108_idx = col(lambda h: "t2108" in h)
    up4_idx   = col(lambda h: "up 4%" in h)
    down4_idx = col(lambda h: "down 4%" in h)
    r5_idx    = col(lambda h: "5 day" in h and "ratio" in h and "10" not in h)
    r10_idx   = col(lambda h: "10 day" in h and "ratio" in h)
    if t2108_idx is None:
        raise ValueError("No T2108 column found in Stockbee sheet")

    def num(row, idx, cast=float):
        if idx is None or idx >= len(row):
            return None
        try:
            return cast(row[idx].replace(",", ""))
        except ValueError:
            return None

    latest = None
    prev_t2108 = []  # T2108 der 5 Zeilen vor der jüngsten (für den Trend)
    for row in rows[2:]:
        try:
            date = datetime.strptime(row[0].strip(), "%m/%d/%Y").date()
            value = float(row[t2108_idx])
        except (ValueError, IndexError):
            continue
        if latest is None:
            latest = {
                "date": date.isoformat(),
                "value": value,
                "sa": {
                    "up4":      num(row, up4_idx, int),
                    "down4":    num(row, down4_idx, int),
                    "ratio5d":  num(row, r5_idx),
                    "ratio10d": num(row, r10_idx),
                },
            }
        else:
            prev_t2108.append(value)
            if len(prev_t2108) == 5:
                break
    if latest is None:
        raise ValueError("No parsable T2108 row found in Stockbee sheet")
    latest["sa"]["t2108_avg5"] = (
        round(sum(prev_t2108) / len(prev_t2108), 2) if len(prev_t2108) == 5 else None
    )
    return latest


def compute_situational_state(ratio5d, ratio10d, t2108, t2108_avg5):
    """Stockbee Situational Awareness: OVERSOLD / GREEN / YELLOW / RED, None bei Lücken.

    OVERSOLD = T2108 <= 10 (extrem überverkauft, Bounce wahrscheinlich —
    hat Vorrang vor allen anderen Zuständen); GREEN = beide Ratios > 1.0
    und T2108 über dem Schnitt seiner letzten 5 Werte; RED = beide < 1.0
    und T2108 darunter; sonst YELLOW.
    """
    if t2108 is not None and t2108 <= 10.0:
        return "OVERSOLD"
    if None in (ratio5d, ratio10d, t2108, t2108_avg5):
        return None
    rising = t2108 > t2108_avg5
    if ratio5d > 1.0 and ratio10d > 1.0 and rising:
        return "GREEN"
    if ratio5d < 1.0 and ratio10d < 1.0 and not rising:
        return "RED"
    return "YELLOW"


def fetch_regime_inputs() -> dict:
    """Alle Regime-Inputs holen. Fehler pro Quelle → None, kein Abbruch."""
    out = {"trend": None, "info": None, "b1": None}
    try:
        out["trend"] = _fetch_sma_distances(REGIME_CONFIG["TREND_TICKER"])
    except Exception as e:
        print(f"  WARNING: regime trend fetch failed ({REGIME_CONFIG['TREND_TICKER']}): {e}")
    try:
        out["info"] = _fetch_sma_distances(REGIME_CONFIG["INFO_TICKER"])
    except Exception as e:
        print(f"  WARNING: regime info fetch failed ({REGIME_CONFIG['INFO_TICKER']}): {e}")
    try:
        out["b1"] = _fetch_stockbee_breadth()
    except Exception as e:
        print(f"  WARNING: regime breadth fetch failed (Stockbee): {e}")
    return out


def compute_regime_state(t1, t2, b1):
    """Roh-Zustand nach Spec-Tabelle. Fehlender Input → None (unbekannt)."""
    if t1 is None or t2 is None or b1 is None:
        return None
    if (not t2) or b1 < REGIME_CONFIG["B1_WEAK"]:
        return "RISK_OFF"
    if t1 and t2 and b1 > REGIME_CONFIG["B1_HEALTHY"]:
        return "RISK_ON"
    return "NEUTRAL"


def apply_regime_hysteresis(raw, prev_raw, prev_effective):
    """State-Wechsel erst nach 2 EOD-Bestätigungen; RISK_OFF gilt sofort."""
    if raw is None:
        return prev_effective  # kein Input → Zustand halten (Badge zeigt stale)
    if raw == "RISK_OFF":
        return "RISK_OFF"      # asymmetrisch defensiv (Spec)
    if prev_effective is None:
        return raw             # allererster Lauf
    if raw == prev_effective:
        return raw
    if raw == prev_raw:
        return raw             # zweite Bestätigung in Folge → Wechsel wirksam
    return prev_effective      # erste Abweichung → abwarten
