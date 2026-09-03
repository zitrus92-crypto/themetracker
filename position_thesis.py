"""
Fundamental geprüfte These je qualifiziertem Position-Trend-Theme.

Qualifikation ist rein mechanisch (position_metrics.qualified_position_themes)
und passiert extrem selten (0-2 Themes gleichzeitig, siehe docs/static/
themeMetrics.js TAB.POSITION_TREND) — deshalb hier bewusst KEIN manuelles
Freitextfeld (das wurde im Regime-Gate-Grilling 2026-07-02 für die viel
häufigere Katalysator-Frage explizit verworfen: "kann ich nicht täglich
machen"), sondern ein LLM-Aufruf (Anthropic, mit Web-Suche) NUR für die
seltenen qualifizierten Kandidaten.

Kostenkontrolle über zwei Regeln:
  1. Ein Aufruf bei Neu-Qualifikation.
  2. Ein Re-Aufruf, wenn die gespeicherte These > REFRESH_DAYS alt ist, waehrend
     das Theme weiter qualifiziert bleibt.
Faellt ein Theme aus der Qualifikation, wird sein Eintrag entfernt (keine
erfundene Kontinuitaet — dieselbe Haltung wie computeDaysInStage im Frontend).
Ein einzelner LLM-Fehlschlag bricht den Scrape-Lauf nie ab: alte These bleibt
stehen, der Rest der Pipeline laeuft unveraendert weiter.

WICHTIG (nicht automatisierbar): dieses Modul braucht den GitHub-Actions-Secret
ANTHROPIC_API_KEY. Ohne Key wird die Generierung uebersprungen (Warnung, kein
Fehler) — siehe generate_thesis().
"""
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import position_metrics as pm

THESIS_FILENAME = "position_thesis.json"
MODEL = "claude-sonnet-5"
REFRESH_DAYS = 30          # Chris' Entscheidung: monatlich auffrischen, sonst nur bei Neu-Qualifikation.
MAX_TOKENS = 700
MAX_TICKERS_IN_PROMPT = 12

SYSTEM_PROMPT = (
    "Du bist Recherche-Assistent für einen Position-Trading-Ansatz "
    "(Halte-Dauer Monate bis 1+ Jahr, separates Sleeve neben einem kurzfristigeren "
    "Swing-System). Du bekommst ein Markt-Thema, das rein PREISBASIERT "
    "(mehrmonatiger intakter Trend, gleichzeitig Top-Rang über 3, 6 Monate und "
    "YTD) als Kandidat qualifiziert hat — das ist noch keine These, nur ein "
    "Preis-Signal.\n\n"
    "Deine Aufgabe: eine FUNDAMENTAL geprüfte, faktenbasierte These liefern, "
    "warum dieses Thema in den kommenden 6-18 Monaten strukturell stärker "
    "wahrgenommen werden könnte als heute (Druckenmiller-Prinzip: die "
    "Wahrnehmungsverschiebung ist der Kaufgrund, nicht der heutige Preis). "
    "Nutze Web-Suche für AKTUELLE, überprüfbare Fakten zu den genannten "
    "Kernwerten (Earnings-Entwicklung, Produktankündigungen, Kapitalflüsse, "
    "regulatorische Entwicklungen, Wettbewerbsdynamik). Nenne konkrete Fakten "
    "mit Datum, wo möglich mit Quelle.\n\n"
    "Harte Regeln: KEINE Kursprognose, KEINE Kauf-/Verkaufsempfehlung, keine "
    "Wahrscheinlichkeits- oder Kursziel-Angaben. Findest du fundamental nichts, "
    "das die These stützt, sag das explizit — erfinde nichts. Antwort auf "
    "Deutsch, 3-6 Sätze, Fließtext ohne Aufzählung."
)


def _build_prompt(theme_name: str, tickers: list) -> str:
    top = tickers[:MAX_TICKERS_IN_PROMPT]
    return (
        f"Thema: {theme_name}\n"
        f"Kernwerte (Auswahl): {', '.join(top) if top else '(keine Ticker hinterlegt)'}\n\n"
        "Liefere die fundamental geprüfte These."
    )


def generate_thesis(theme_name: str, tickers: list) -> str | None:
    """Ein LLM-Aufruf. None bei fehlendem Key oder Fehler — nie eine Exception
    nach außen, damit ein einzelner Ausfall nie den Scrape-Lauf mitreißt."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print(f"    WARNING: ANTHROPIC_API_KEY fehlt — keine These für '{theme_name}'.")
        return None
    try:
        import anthropic
    except ImportError:
        print("    WARNING: Paket 'anthropic' nicht installiert — keine These generiert.")
        return None

    try:
        client = anthropic.Anthropic(api_key=api_key)
        resp = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{"role": "user", "content": _build_prompt(theme_name, tickers)}],
        )
    except Exception as e:
        print(f"    WARNING: LLM-Aufruf für '{theme_name}' fehlgeschlagen: {e}")
        return None

    text = "".join(
        block.text for block in (resp.content or []) if getattr(block, "type", None) == "text"
    ).strip()
    if not text:
        print(f"    WARNING: LLM lieferte keinen Text für '{theme_name}'.")
        return None
    return text


def _is_stale(entry: dict, now: datetime) -> bool:
    generated_at = entry.get("generated_at")
    if not generated_at:
        return True
    try:
        gen = datetime.fromisoformat(generated_at)
    except ValueError:
        return True
    return (now - gen) > timedelta(days=REFRESH_DAYS)


def update_position_thesis(themes: dict, docs_dir: Path, thesis_fn=generate_thesis) -> dict:
    """Aktualisiert docs/position_thesis.json. thesis_fn ist injizierbar (Tests
    ersetzen sie durch einen Stub statt echte API-Aufrufe zu machen).

    Returns das geschriebene Payload-Dict (auch bei 0 qualifizierten Themen —
    dann {"generated_at": ..., "themes": {}})."""
    path = Path(docs_dir) / THESIS_FILENAME
    existing = {}
    if path.exists():
        try:
            existing = json.loads(path.read_text(encoding="utf-8")).get("themes", {})
        except Exception as e:
            print(f"    WARNING: {THESIS_FILENAME} nicht lesbar ({e}) — wird neu aufgebaut.")

    qualified = pm.qualified_position_themes(themes)
    now = datetime.now(timezone.utc)
    out = {}
    calls = 0

    for name, info in qualified.items():
        prev = existing.get(name)
        if prev and not _is_stale(prev, now):
            out[name] = prev
            continue

        thesis = thesis_fn(name, info["tickers"])
        calls += 1
        if thesis:
            out[name] = {
                "thesis": thesis,
                "qualified_since": (prev or {}).get("qualified_since", now.strftime("%Y-%m-%d")),
                "generated_at": now.isoformat(),
                "model": MODEL,
                "stage": info["stage"],
                "pos_score": info["pos_score"],
            }
        elif prev:
            # Aufruf gescheitert (Rate-Limit, Netzwerk, fehlender Key): alte
            # These behalten statt die Anzeige kommentarlos leerzuräumen.
            out[name] = prev

    payload = {"generated_at": now.isoformat(), "themes": out}
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=None, separators=(",", ":")),
                     encoding="utf-8")
    print(f"    Saved {THESIS_FILENAME} ({len(out)} These{'n' if len(out) != 1 else ''}, "
          f"{calls} LLM-Aufruf{'e' if calls != 1 else ''}, "
          f"{len(qualified) - len(out)} ohne verwertbare Antwort)")
    return payload
