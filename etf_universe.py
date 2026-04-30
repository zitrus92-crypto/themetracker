# encoding: utf-8
"""
Thematic ETF Universe — shared across scraper and frontend.
Priority 1 = core signal ETFs (used for theme aggregation)
Priority 2/3 = supplementary (shown in detail view)
"""

THEMATIC_ETFS = [
    # ── AI & TECH ──────────────────────────────────────────────
    {"ticker": "AIQ",  "name": "Global X AI & Technology",               "theme": "AI & Tech",        "priority": 1},
    {"ticker": "BOTZ", "name": "Global X Robotics & AI",                 "theme": "AI & Tech",        "priority": 1},
    {"ticker": "ROBO", "name": "ROBO Global Robotics & Automation",      "theme": "AI & Tech",        "priority": 1},
    {"ticker": "BAI",  "name": "iShares A.I. Innovation & Tech Active",  "theme": "AI & Tech",        "priority": 2},
    {"ticker": "ARTY", "name": "iShares Future AI & Tech Active",        "theme": "AI & Tech",        "priority": 2},
    {"ticker": "IVES", "name": "Dan Ives Wedbush AI Revolution",         "theme": "AI & Tech",        "priority": 2},
    {"ticker": "CHAT", "name": "Roundhill Generative AI & Tech",         "theme": "AI & Tech",        "priority": 2},
    {"ticker": "HUMN", "name": "Tema Humanoid Robotics & AI",            "theme": "AI & Tech",        "priority": 2},
    {"ticker": "IRBO", "name": "iShares Robotics & AI",                  "theme": "AI & Tech",        "priority": 3},
    {"ticker": "THNQ", "name": "ROBO Global Artificial Intelligence",    "theme": "AI & Tech",        "priority": 3},

    # ── SEMICONDUCTORS ─────────────────────────────────────────
    {"ticker": "SMH",  "name": "VanEck Semiconductor",                   "theme": "Semiconductors",   "priority": 1},
    {"ticker": "SOXX", "name": "iShares Semiconductor",                  "theme": "Semiconductors",   "priority": 1},
    {"ticker": "PSI",  "name": "Invesco Dynamic Semiconductors",         "theme": "Semiconductors",   "priority": 1},
    {"ticker": "FTXL", "name": "First Trust Nasdaq Semiconductor",       "theme": "Semiconductors",   "priority": 2},
    {"ticker": "SOXQ", "name": "Invesco PHLX Semiconductor",             "theme": "Semiconductors",   "priority": 2},

    # ── CYBERSECURITY ──────────────────────────────────────────
    {"ticker": "CIBR", "name": "First Trust Nasdaq Cybersecurity",       "theme": "Cybersecurity",    "priority": 1},
    {"ticker": "HACK", "name": "ETFMG Prime Cyber Security",             "theme": "Cybersecurity",    "priority": 1},
    {"ticker": "BUG",  "name": "Global X Cybersecurity",                 "theme": "Cybersecurity",    "priority": 2},
    {"ticker": "IHAK", "name": "iShares Cybersecurity & Tech",           "theme": "Cybersecurity",    "priority": 2},

    # ── DIGITAL INFRASTRUCTURE ─────────────────────────────────
    {"ticker": "DTCR", "name": "Global X Data Center & Digital Infra",   "theme": "Digital Infra",    "priority": 1},
    {"ticker": "VPN",  "name": "Global X Data Center REITs & Digital",   "theme": "Digital Infra",    "priority": 2},

    # ── CLOUD & SAAS ───────────────────────────────────────────
    {"ticker": "CLOU", "name": "Global X Cloud Computing",               "theme": "Cloud & SaaS",     "priority": 1},
    {"ticker": "WCLD", "name": "WisdomTree Cloud Computing",             "theme": "Cloud & SaaS",     "priority": 1},
    {"ticker": "SKYY", "name": "First Trust Cloud Computing",            "theme": "Cloud & SaaS",     "priority": 1},

    # ── NUCLEAR ────────────────────────────────────────────────
    {"ticker": "NLR",  "name": "VanEck Uranium & Nuclear",               "theme": "Nuclear",          "priority": 1},
    {"ticker": "NUKZ", "name": "Range Nuclear Renaissance Index",         "theme": "Nuclear",          "priority": 1},
    {"ticker": "URA",  "name": "Global X Uranium",                       "theme": "Nuclear",          "priority": 1},
    {"ticker": "URNM", "name": "Sprott Uranium Miners",                  "theme": "Nuclear",          "priority": 2},

    # ── CLEAN ENERGY ───────────────────────────────────────────
    {"ticker": "ICLN", "name": "iShares Global Clean Energy",            "theme": "Clean Energy",     "priority": 1},
    {"ticker": "QCLN", "name": "First Trust Nasdaq Clean Edge Energy",   "theme": "Clean Energy",     "priority": 1},
    {"ticker": "CNRG", "name": "SPDR S&P Kensho Clean Power",            "theme": "Clean Energy",     "priority": 2},
    {"ticker": "ACES", "name": "ALPS Clean Energy",                      "theme": "Clean Energy",     "priority": 2},

    # ── INFRASTRUCTURE ─────────────────────────────────────────
    {"ticker": "PAVE", "name": "Global X U.S. Infrastructure Dev.",      "theme": "Infrastructure",   "priority": 1},
    {"ticker": "IFRA", "name": "iShares U.S. Infrastructure",            "theme": "Infrastructure",   "priority": 1},
    {"ticker": "GRID", "name": "First Trust Nasdaq Clean Edge Grid",     "theme": "Infrastructure",   "priority": 2},
    {"ticker": "AMPS", "name": "Pacer American Energy Independence",     "theme": "Infrastructure",   "priority": 2},

    # ── DEFENSE & SPACE ────────────────────────────────────────
    {"ticker": "SHLD", "name": "Global X Defense Tech",                  "theme": "Defense",          "priority": 1},
    {"ticker": "ITA",  "name": "iShares U.S. Aerospace & Defense",       "theme": "Defense",          "priority": 1},
    {"ticker": "XAR",  "name": "SPDR S&P Aerospace & Defense",           "theme": "Defense",          "priority": 1},
    {"ticker": "UFO",  "name": "Procure Space",                          "theme": "Defense",          "priority": 2},
    {"ticker": "ARKX", "name": "ARK Space Exploration & Innovation",     "theme": "Defense",          "priority": 2},

    # ── BIOTECH & GENOMICS ─────────────────────────────────────
    {"ticker": "ARKG", "name": "ARK Genomic Revolution",                 "theme": "Biotech",          "priority": 1},
    {"ticker": "IBB",  "name": "iShares Biotechnology",                  "theme": "Biotech",          "priority": 1},
    {"ticker": "XBI",  "name": "SPDR S&P Biotech",                       "theme": "Biotech",          "priority": 1},
    {"ticker": "GNOM", "name": "Global X Genomics & Biotechnology",      "theme": "Biotech",          "priority": 2},
    {"ticker": "IDNA", "name": "iShares Genomics Immunology Healthcare", "theme": "Biotech",          "priority": 2},

    # ── EV & MOBILITY ──────────────────────────────────────────
    {"ticker": "DRIV", "name": "Global X Autonomous & Electric Vehicles","theme": "EV & Mobility",    "priority": 1},
    {"ticker": "IDRV", "name": "iShares Self-Driving EV & Tech",         "theme": "EV & Mobility",    "priority": 1},
    {"ticker": "LIT",  "name": "Global X Lithium & Battery Tech",        "theme": "EV & Mobility",    "priority": 1},
    {"ticker": "KARS", "name": "KraneShares Electric Vehicles",          "theme": "EV & Mobility",    "priority": 2},

    # ── FINTECH & BLOCKCHAIN ───────────────────────────────────
    {"ticker": "FINX", "name": "Global X FinTech",                       "theme": "Fintech",          "priority": 1},
    {"ticker": "ARKF", "name": "ARK Fintech Innovation",                 "theme": "Fintech",          "priority": 1},
    {"ticker": "BLOK", "name": "Amplify Transformational Data Sharing",  "theme": "Fintech",          "priority": 2},
    {"ticker": "BKCH", "name": "Global X Blockchain",                    "theme": "Fintech",          "priority": 2},

    # ── MATERIALS & METALS ─────────────────────────────────────
    {"ticker": "REMX", "name": "VanEck Rare Earth & Strategic Metals",   "theme": "Materials",        "priority": 1},
    {"ticker": "COPX", "name": "Global X Copper Miners",                 "theme": "Materials",        "priority": 1},
    {"ticker": "GDX",  "name": "VanEck Gold Miners",                     "theme": "Materials",        "priority": 1},
    {"ticker": "GDXJ", "name": "VanEck Junior Gold Miners",              "theme": "Materials",        "priority": 1},
    {"ticker": "SIL",  "name": "Global X Silver Miners",                 "theme": "Materials",        "priority": 2},
    {"ticker": "SILJ", "name": "ETFMG Prime Junior Silver Miners",       "theme": "Materials",        "priority": 2},
    {"ticker": "PICK", "name": "iShares MSCI Global Metals & Mining",    "theme": "Materials",        "priority": 2},

    # ── MOMENTUM FACTOR ────────────────────────────────────────
    {"ticker": "MTUM", "name": "iShares MSCI USA Momentum Factor",       "theme": "Momentum",         "priority": 1},
    {"ticker": "FDMO", "name": "Fidelity Momentum Factor",               "theme": "Momentum",         "priority": 2},

    # ── CRYPTO ─────────────────────────────────────────────────
    {"ticker": "IBIT", "name": "iShares Bitcoin Trust",                  "theme": "Crypto",           "priority": 1},
    {"ticker": "GBTC", "name": "Grayscale Bitcoin Trust",                "theme": "Crypto",           "priority": 1},
    {"ticker": "ARKK", "name": "ARK Innovation",                         "theme": "Crypto",           "priority": 2},
]

# Quick lookups
ETF_BY_TICKER = {e["ticker"]: e for e in THEMATIC_ETFS}
ALL_TICKERS   = [e["ticker"] for e in THEMATIC_ETFS]
P1_TICKERS    = [e["ticker"] for e in THEMATIC_ETFS if e["priority"] == 1]
ALL_THEMES    = list(dict.fromkeys(e["theme"] for e in THEMATIC_ETFS))  # order-preserving unique
