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


def _fetch_tickers_for_slug(slug: str) -> list[str]:
    """
    Fetch all stock tickers for a Finviz theme via the bubble-chart view (v=410).
    This view is server-rendered HTML and returns all tickers in one request via
    data-boxover-ticker attributes — no JS rendering required, no pagination.
    Returns list of plain ticker symbols (e.g. ['NVDA', 'AMD', 'ASML', ...]).
    """
    MAX_RETRIES = 3
    url = f"https://finviz.com/screener.ashx?v=410&f=theme_{slug}&r=1"

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
    print(f"    {len(themes_out)} themes, {len(subnodes)} sub-nodes, {total_tickers} tickers total")
    return {
        "themes":     themes_out,
        "subnodes":   subnodes,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }
