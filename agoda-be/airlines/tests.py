from django.test import TestCase

from airlines.models import Airline, Aircraft


class AirlineModelTests(TestCase):
	def test_airl_tc_001_airline_str_returns_name_and_code(self):
		# TC ID: AIRL-TC-001
		airline = Airline.objects.create(name="Vietnam Airlines", code="VN")
		self.assertEqual(str(airline), "Vietnam Airlines (VN)")

	def test_airl_tc_002_aircraft_str_returns_expected_format(self):
		# TC ID: AIRL-TC-002
		airline = Airline.objects.create(name="VietJet Air", code="VJ")
		aircraft = Aircraft.objects.create(
			airline=airline,
			model="Airbus A321",
			registration_number="VN-A123",
		)
		self.assertEqual(str(aircraft), "VJ - Airbus A321 (VN-A123)")

	def test_airl_tc_003_aircraft_stores_seat_counts_correctly(self):
		# TC ID: AIRL-TC-003
		airline = Airline.objects.create(name="Bamboo Airways", code="QH")
		aircraft = Aircraft.objects.create(
			airline=airline,
			model="Boeing 787",
			registration_number="VN-B789",
			economy_seats=200,
			business_seats=28,
			first_class_seats=8,
			total_seats=236,
		)
		aircraft.refresh_from_db()
		self.assertEqual(aircraft.economy_seats, 200)
		self.assertEqual(aircraft.business_seats, 28)
		self.assertEqual(aircraft.first_class_seats, 8)
		self.assertEqual(aircraft.total_seats, 236)

	def test_airl_tc_004_aircraft_is_active_defaults_to_true(self):
		# TC ID: AIRL-TC-004
		airline = Airline.objects.create(name="Pacific Airlines", code="BL")
		aircraft = Aircraft.objects.create(
			airline=airline,
			model="Airbus A320",
			registration_number="VN-A320",
		)
		self.assertTrue(aircraft.is_active)
