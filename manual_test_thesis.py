"""
Manueller Einmal-Test für position_thesis.generate_thesis().

ACHTUNG: Macht GENAU EINEN echten, kostenpflichtigen Anthropic-API-Aufruf
(inkl. Web-Suche). Läuft NICHT automatisch mit den Unit-Tests — die nutzen
einen Stub statt echter API-Calls (siehe tests/test_position_thesis.py).
Dieses Skript hier ist bewusst der einzige Weg im Repo, der wirklich Geld
kostet, und wird deshalb nie von `python -m unittest discover` gefunden
(Dateiname passt nicht auf "test_*.py").

Zweck: pruefen, ob die API-Anbindung technisch funktioniert (Key, Web-Search-
Tool, Antwortformat) — unabhaengig davon, ob gerade irgendein Theme
qualifiziert. Fuer die Kostenkontrolle des AUTOMATISIERTEN Scrapers siehe die
Refresh-/Neu-Qualifikations-Logik in position_thesis.update_position_thesis().

Aufruf:
    ANTHROPIC_API_KEY=sk-... python manual_test_thesis.py
    ANTHROPIC_API_KEY=sk-... python manual_test_thesis.py "Artificial Intelligence" NVDA MSFT
"""
import sys

import position_thesis as pt


def main():
    if len(sys.argv) > 1:
        theme_name, tickers = sys.argv[1], sys.argv[2:]
    else:
        theme_name, tickers = "Test-Theme (Dummy, kein echtes Tracker-Theme)", ["AAPL", "MSFT"]

    print(f"Ein einzelner, kostenpflichtiger LLM-Aufruf fuer: {theme_name} "
          f"({', '.join(tickers) or 'keine Ticker'})")
    print("Strg+C zum Abbrechen, bevor der Request rausgeht ...\n")

    thesis = pt.generate_thesis(theme_name, tickers)
    if thesis is None:
        print("\nKein Text erhalten — siehe WARNING-Zeile oben "
              "(fehlender ANTHROPIC_API_KEY, falscher Tool-Name, Netzwerkfehler o.ae.).")
        sys.exit(1)

    print("\n--- Antwort ---")
    print(thesis)


if __name__ == "__main__":
    main()
