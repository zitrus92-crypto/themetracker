import unittest
from datetime import date

from market_calendar import is_trading_day, nyse_holidays, previous_trading_day


class TestNyseHolidays(unittest.TestCase):
    def test_2026_holidays(self):
        h = nyse_holidays(2026)
        expected = {
            date(2026, 1, 1),    # New Year (Donnerstag)
            date(2026, 1, 19),   # MLK
            date(2026, 2, 16),   # Washington's Birthday
            date(2026, 4, 3),    # Good Friday (Ostern = 5.4.2026)
            date(2026, 5, 25),   # Memorial Day
            date(2026, 6, 19),   # Juneteenth (Freitag)
            date(2026, 7, 3),    # Independence Day (4.7. = Samstag -> Freitag)
            date(2026, 9, 7),    # Labor Day
            date(2026, 11, 26),  # Thanksgiving
            date(2026, 12, 25),  # Christmas
        }
        self.assertEqual(h, expected)

    def test_phantom_days_from_history_are_holidays(self):
        # Genau die Daten, die als Phantom-Zeilen in history.json gefunden wurden.
        for d in (date(2026, 5, 25), date(2026, 6, 19), date(2026, 7, 3)):
            self.assertFalse(is_trading_day(d), d)

    def test_weekend_and_regular_day(self):
        self.assertFalse(is_trading_day(date(2026, 8, 15)))  # Samstag
        self.assertFalse(is_trading_day(date(2026, 8, 16)))  # Sonntag
        self.assertTrue(is_trading_day(date(2026, 8, 14)))   # Freitag, kein Feiertag

    def test_half_days_are_trading_days(self):
        self.assertTrue(is_trading_day(date(2026, 11, 27)))  # Tag nach Thanksgiving
        self.assertTrue(is_trading_day(date(2026, 12, 24)))  # Heiligabend (Donnerstag)

    def test_new_year_on_saturday_not_observed_prior_year(self):
        # 1.1.2022 war ein Samstag -> NYSE war am 31.12.2021 GEÖFFNET.
        self.assertTrue(is_trading_day(date(2021, 12, 31)))
        self.assertNotIn(date(2021, 12, 31), nyse_holidays(2021))

    def test_sunday_observance(self):
        # 4.7.2027 ist ein Sonntag -> Montag 5.7.2027 ist zu.
        self.assertIn(date(2027, 7, 5), nyse_holidays(2027))

    def test_previous_trading_day_skips_weekend_and_holiday(self):
        # Di 26.05.2026: Montag war Memorial Day, davor Wochenende -> Fr 22.05.
        self.assertEqual(previous_trading_day(date(2026, 5, 26)), date(2026, 5, 22))
        # Regulärer Dienstag -> Montag.
        self.assertEqual(previous_trading_day(date(2026, 8, 12)), date(2026, 8, 11))


if __name__ == "__main__":
    unittest.main()
