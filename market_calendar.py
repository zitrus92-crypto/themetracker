"""US-Börsenkalender (NYSE) — statisch, ohne Bibliothek.

Verhindert Phantom-Handelstage in der Snapshot-Historie: an Feiertagen liefert
Finviz die Vortagsdaten unter neuem Datum, und days-in-stage würde Geistertage
zählen. Halbtage (Tag nach Thanksgiving, Heiligabend) sind reguläre Handelstage.
"""

from datetime import date, timedelta


def _easter(year: int) -> date:
    """Ostersonntag (gregorianisch), Butcher-Algorithmus."""
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month, day = divmod(h + l - 7 * m + 114, 31)
    return date(year, month, day + 1)


def _nth_weekday(year: int, month: int, weekday: int, n: int) -> date:
    d = date(year, month, 1)
    offset = (weekday - d.weekday()) % 7
    return d + timedelta(days=offset + 7 * (n - 1))


def _last_weekday(year: int, month: int, weekday: int) -> date:
    d = date(year + (month == 12), (month % 12) + 1, 1) - timedelta(days=1)
    return d - timedelta(days=(d.weekday() - weekday) % 7)


def _observed(d: date) -> date | None:
    """Sa -> Fr davor, So -> Mo danach. None, wenn die Beobachtung ins Vorjahr
    fiele (NYSE beobachtet den 1.1. nicht am 31.12. des Vorjahres)."""
    if d.weekday() == 5:
        obs = d - timedelta(days=1)
        return None if obs.year != d.year else obs
    if d.weekday() == 6:
        return d + timedelta(days=1)
    return d


def nyse_holidays(year: int) -> set[date]:
    days = [
        _observed(date(year, 1, 1)),                # New Year's Day
        _nth_weekday(year, 1, 0, 3),                # MLK Day (3. Montag Jan)
        _nth_weekday(year, 2, 0, 3),                # Washington's Birthday
        _easter(year) - timedelta(days=2),          # Good Friday
        _last_weekday(year, 5, 0),                  # Memorial Day
        _nth_weekday(year, 9, 0, 1),                # Labor Day
        _nth_weekday(year, 11, 3, 4),               # Thanksgiving (4. Donnerstag)
        _observed(date(year, 7, 4)),                # Independence Day
        _observed(date(year, 12, 25)),              # Christmas
    ]
    if year >= 2022:
        days.append(_observed(date(year, 6, 19)))   # Juneteenth
    return {d for d in days if d is not None}


def is_trading_day(d: date) -> bool:
    return d.weekday() < 5 and d not in nyse_holidays(d.year)


def previous_trading_day(d: date) -> date:
    while True:
        d -= timedelta(days=1)
        if is_trading_day(d):
            return d
