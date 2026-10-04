"""Reproduktion mit einem Befehl:  python analysis/rs3m_vs_rs12m/run_all.py [--refresh]
Voraussetzung: Norgate Data Updater laeuft (nur fuer den ersten Lauf bzw. --refresh)."""
import subprocess
import sys
from pathlib import Path

here = Path(__file__).parent
subprocess.run([sys.executable, str(here / "01_fetch.py"), *sys.argv[1:]], check=True, cwd=here)
subprocess.run([sys.executable, str(here / "02_analyze.py")], check=True, cwd=here)
