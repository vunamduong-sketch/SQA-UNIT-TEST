from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from airlines.models import Aircraft, Airline
from airports.models import Airport
from bookings.constants.service_type import ServiceType
from bookings.models import Booking
from cities.models import City
from countries.models import Country
from flights.models import Flight, FlightBookingDetail, FlightLeg, SeatClassPricing
from flights.serializers import FlightBookingDetailCreateSerializer, FlightSerializer
from flights.views import FlightListView
from promotions.models import FlightPromotion, Promotion


class FlightModelTests(TestCase):
	def setUp(self):
		self.country = Country.objects.create(name="Vietnam")
		self.city_a = City.objects.create(name="Hanoi", country=self.country)
		self.city_b = City.objects.create(name="Danang", country=self.country)

		self.airport_a = Airport.objects.create(city=self.city_a, code="HAN", name="Noi Bai")
		self.airport_b = Airport.objects.create(city=self.city_b, code="DAD", name="Da Nang")
		self.airport_c = Airport.objects.create(city=self.city_b, code="DAN", name="Da Nang 2")

		self.airline = Airline.objects.create(name="Airline A", code="AA")

	def _create_flight_with_two_legs(self):
		now = timezone.now()
		flight = Flight.objects.create(airline=self.airline, base_price=100)
		FlightLeg.objects.create(
			flight=flight,
			departure_time=now.replace(hour=8, minute=0, second=0, microsecond=0),
			arrival_time=now.replace(hour=10, minute=0, second=0, microsecond=0),
			departure_airport=self.airport_a,
			arrival_airport=self.airport_b,
			flight_code="AA101",
			duration_minutes=0,
		)
		FlightLeg.objects.create(
			flight=flight,
			departure_time=now.replace(hour=11, minute=0, second=0, microsecond=0),
			arrival_time=now.replace(hour=13, minute=30, second=0, microsecond=0),
			departure_airport=self.airport_b,
			arrival_airport=self.airport_c,
			flight_code="AA102",
			duration_minutes=0,
		)
		return flight

	def test_fli_tc_001_calculate_values_when_multiple_legs(self):
		# TC ID: FLI-TC-001
		flight = self._create_flight_with_two_legs()

		flight.calculate_values()
		flight.refresh_from_db()

		self.assertEqual(flight.stops, 1)
		self.assertEqual(flight.total_duration, 330)

	def test_fli_tc_002_calculate_values_when_single_leg(self):
		# TC ID: FLI-TC-002
		now = timezone.now()
		flight = Flight.objects.create(airline=self.airline, base_price=100)
		FlightLeg.objects.create(
			flight=flight,
			departure_time=now,
			arrival_time=now + timedelta(minutes=90),
			departure_airport=self.airport_a,
			arrival_airport=self.airport_b,
			flight_code="AA201",
			duration_minutes=0,
		)

		flight.calculate_values()
		flight.refresh_from_db()

		self.assertEqual(flight.stops, 0)
		self.assertEqual(flight.total_duration, 90)

	def test_fli_tc_003_calculate_values_when_no_legs_keeps_current_values(self):
		# TC ID: FLI-TC-003
		flight = Flight.objects.create(
			airline=self.airline,
			base_price=100,
			stops=5,
			total_duration=999,
		)

		flight.calculate_values()
		flight.refresh_from_db()

		self.assertEqual(flight.stops, 5)
		self.assertEqual(flight.total_duration, 999)

	def test_fli_tc_004_get_active_promotion_returns_none_when_no_active(self):
		# TC ID: FLI-TC-004
		flight = Flight.objects.create(airline=self.airline, base_price=100)
		now = timezone.now()
		promo = Promotion.objects.create(
			title="Inactive Promo",
			discount_percent=10,
			discount_amount=0,
			start_date=now - timedelta(days=10),
			end_date=now - timedelta(days=1),
			is_active=False,
		)
		FlightPromotion.objects.create(
			flight=flight,
			promotion=promo,
			discount_percent=10,
			discount_amount=0,
		)

		self.assertIsNone(flight.get_active_promotion())

	def test_fli_tc_005_get_active_promotion_selects_highest_discount_percent(self):
		# TC ID: FLI-TC-005
		flight = Flight.objects.create(airline=self.airline, base_price=100)
		now = timezone.now()

		promo_10 = Promotion.objects.create(
			title="Promo 10",
			discount_percent=10,
			discount_amount=0,
			start_date=now - timedelta(days=1),
			end_date=now + timedelta(days=1),
			is_active=True,
		)
		promo_20 = Promotion.objects.create(
			title="Promo 20",
			discount_percent=20,
			discount_amount=0,
			start_date=now - timedelta(days=1),
			end_date=now + timedelta(days=1),
			is_active=True,
		)

		FlightPromotion.objects.create(
			flight=flight,
			promotion=promo_10,
			discount_percent=10,
			discount_amount=0,
		)
		FlightPromotion.objects.create(
			flight=flight,
			promotion=promo_20,
			discount_percent=20,
			discount_amount=0,
		)

		result = flight.get_active_promotion()

		self.assertIsNotNone(result)
		self.assertEqual(result["id"], promo_20.id)
		self.assertEqual(result["discount_percent"], 20)

	def test_fli_tc_006_get_active_promotion_fallback_discount_percent_from_promotion(self):
		# TC ID: FLI-TC-006
		flight = Flight.objects.create(airline=self.airline, base_price=100)
		now = timezone.now()

		promo = Promotion.objects.create(
			title="Fallback Promo",
			discount_percent=15,
			discount_amount=0,
			start_date=now - timedelta(days=1),
			end_date=now + timedelta(days=1),
			is_active=True,
		)

		FlightPromotion.objects.create(
			flight=flight,
			promotion=promo,
			discount_percent=0,
			discount_amount=0,
		)

		result = flight.get_active_promotion()

		self.assertIsNotNone(result)
		self.assertEqual(result["discount_percent"], 15)


class FlightLegModelTests(TestCase):
	def setUp(self):
		country = Country.objects.create(name="Vietnam")
		city_a = City.objects.create(name="Hanoi", country=country)
		city_b = City.objects.create(name="Danang", country=country)

		self.airport_a = Airport.objects.create(city=city_a, code="HNL", name="Hanoi Leg")
		self.airport_b = Airport.objects.create(city=city_b, code="DNL", name="Danang Leg")
		self.airline = Airline.objects.create(name="Airline Leg", code="AL")
		self.flight = Flight.objects.create(airline=self.airline, base_price=100)

	def test_fli_tc_007_flight_leg_save_auto_calculates_duration_when_empty(self):
		# TC ID: FLI-TC-007
		dep = timezone.now()
		arr = dep + timedelta(minutes=105)

		leg = FlightLeg.objects.create(
			flight=self.flight,
			departure_time=dep,
			arrival_time=arr,
			departure_airport=self.airport_a,
			arrival_airport=self.airport_b,
			flight_code="AL101",
		)

		self.assertEqual(leg.duration_minutes, 105)

	def test_fli_tc_008_flight_leg_save_keeps_provided_duration(self):
		# TC ID: FLI-TC-008
		dep = timezone.now()
		arr = dep + timedelta(minutes=120)

		leg = FlightLeg.objects.create(
			flight=self.flight,
			departure_time=dep,
			arrival_time=arr,
			departure_airport=self.airport_a,
			arrival_airport=self.airport_b,
			flight_code="AL102",
			duration_minutes=90,
		)

		self.assertEqual(leg.duration_minutes, 90)

	def test_fli_tc_009_flight_leg_save_calls_flight_calculate_values(self):
		# TC ID: FLI-TC-009
		dep = timezone.now()
		arr = dep + timedelta(minutes=60)

		with patch.object(Flight, "calculate_values") as mock_calculate:
			FlightLeg.objects.create(
				flight=self.flight,
				departure_time=dep,
				arrival_time=arr,
				departure_airport=self.airport_a,
				arrival_airport=self.airport_b,
				flight_code="AL103",
				duration_minutes=0,
			)

		mock_calculate.assert_called_once()


class SeatClassPricingModelTests(TestCase):
	def setUp(self):
		country = Country.objects.create(name="Vietnam")
		city = City.objects.create(name="Hanoi", country=country)
		airport = Airport.objects.create(city=city, code="PRC", name="Price Airport")
		airline = Airline.objects.create(name="Airline Price", code="AP")

		self.flight = Flight.objects.create(airline=airline, base_price=100)
		now = timezone.now()
		FlightLeg.objects.create(
			flight=self.flight,
			departure_time=now,
			arrival_time=now + timedelta(minutes=120),
			departure_airport=airport,
			arrival_airport=airport,
			flight_code="AP101",
			duration_minutes=0,
		)

	def test_fli_tc_010_price_calculates_by_multiplier(self):
		# TC ID: FLI-TC-010
		pricing = SeatClassPricing.objects.create(
			flight=self.flight,
			seat_class="economy",
			multiplier=1.5,
			capacity=100,
			available_seats=80,
		)

		self.assertEqual(pricing.price(), 150.0)

	def test_fli_tc_011_price_with_default_multiplier(self):
		# TC ID: FLI-TC-011
		self.flight.base_price = 80
		self.flight.save(update_fields=["base_price"])

		pricing = SeatClassPricing.objects.create(
			flight=self.flight,
			seat_class="economy",
			capacity=100,
			available_seats=80,
		)

		self.assertEqual(pricing.price(), 80.0)

	def test_fli_tc_012_seats_sold_normal_case(self):
		# TC ID: FLI-TC-012
		pricing = SeatClassPricing.objects.create(
			flight=self.flight,
			seat_class="economy",
			capacity=180,
			available_seats=45,
		)

		self.assertEqual(pricing.seats_sold, 135)

	def test_fli_tc_013_seats_sold_zero_when_full_available(self):
		# TC ID: FLI-TC-013
		pricing = SeatClassPricing.objects.create(
			flight=self.flight,
			seat_class="economy",
			capacity=120,
			available_seats=120,
		)

		self.assertEqual(pricing.seats_sold, 0)


class FlightBookingDetailModelTests(TestCase):
	def setUp(self):
		country = Country.objects.create(name="Vietnam")
		city_a = City.objects.create(name="Hanoi", country=country)
		city_b = City.objects.create(name="Danang", country=country)

		airport_a = Airport.objects.create(city=city_a, code="BKA", name="Book Airport A")
		airport_b = Airport.objects.create(city=city_b, code="BKB", name="Book Airport B")

		self.airline = Airline.objects.create(name="Airline Booking", code="AB")
		self.flight = Flight.objects.create(airline=self.airline, base_price=200)
		now = timezone.now()
		FlightLeg.objects.create(
			flight=self.flight,
			departure_time=now + timedelta(days=1),
			arrival_time=now + timedelta(days=1, hours=2),
			departure_airport=airport_a,
			arrival_airport=airport_b,
			flight_code="AB101",
			duration_minutes=0,
		)

		self.seat_class_pricing = SeatClassPricing.objects.create(
			flight=self.flight,
			seat_class="economy",
			multiplier=1.0,
			capacity=120,
			available_seats=10,
		)
		self.booking = Booking.objects.create(service_type=ServiceType.FLIGHT)

	def test_fli_tc_014_save_calculates_total_and_discount_with_cap(self):
		# TC ID: FLI-TC-014
		with patch.object(
			Flight,
			"get_active_promotion",
			return_value={"discount_percent": 20, "discount_amount": 150},
		):
			detail = FlightBookingDetail.objects.create(
				booking=self.booking,
				flight=self.flight,
				seat_class="economy",
				num_passengers=5,
			)

		self.assertEqual(detail.total_price, 1000)
		self.assertEqual(detail.discount_amount, 150)
		self.assertEqual(detail.final_price, 850)

	def test_fli_tc_015_save_calculates_when_only_discount_amount(self):
		# TC ID: FLI-TC-015
		self.flight.base_price = 300
		self.flight.save(update_fields=["base_price"])

		with patch.object(
			Flight,
			"get_active_promotion",
			return_value={"discount_percent": 0, "discount_amount": 500},
		):
			detail = FlightBookingDetail.objects.create(
				booking=self.booking,
				flight=self.flight,
				seat_class="economy",
				num_passengers=1,
			)

		self.assertEqual(detail.total_price, 300)
		self.assertEqual(detail.discount_amount, 300)
		self.assertEqual(detail.final_price, 0)

	def test_fli_tc_016_save_handles_missing_seat_class_pricing(self):
		# TC ID: FLI-TC-016
		with patch.object(Flight, "get_active_promotion", return_value=None):
			detail = FlightBookingDetail.objects.create(
				booking=self.booking,
				flight=self.flight,
				seat_class="business",
				num_passengers=3,
			)

		self.assertEqual(detail.total_price, 0)
		self.assertEqual(detail.discount_amount, 0)
		self.assertEqual(detail.final_price, 0)

	def test_fli_tc_017_save_reduces_available_seats_on_create(self):
		# TC ID: FLI-TC-017
		with patch.object(Flight, "get_active_promotion", return_value=None):
			FlightBookingDetail.objects.create(
				booking=self.booking,
				flight=self.flight,
				seat_class="economy",
				num_passengers=3,
			)

		self.seat_class_pricing.refresh_from_db()
		self.assertEqual(self.seat_class_pricing.available_seats, 7)

	def test_fli_tc_018_save_does_not_reduce_available_seats_on_update(self):
		# TC ID: FLI-TC-018
		with patch.object(Flight, "get_active_promotion", return_value=None):
			detail = FlightBookingDetail.objects.create(
				booking=self.booking,
				flight=self.flight,
				seat_class="economy",
				num_passengers=3,
			)

			detail.num_passengers = 1
			detail.save()

		self.seat_class_pricing.refresh_from_db()
		self.assertEqual(self.seat_class_pricing.available_seats, 7)

	def test_fli_tc_019_save_syncs_booking_totals_from_details(self):
		# TC ID: FLI-TC-019
		self.flight.base_price = 100
		self.flight.save(update_fields=["base_price"])

		with patch.object(
			Flight,
			"get_active_promotion",
			return_value={"discount_percent": 10, "discount_amount": 0},
		):
			FlightBookingDetail.objects.create(
				booking=self.booking,
				flight=self.flight,
				seat_class="economy",
				num_passengers=1,
			)
			FlightBookingDetail.objects.create(
				booking=self.booking,
				flight=self.flight,
				seat_class="economy",
				num_passengers=2,
			)

		self.booking.refresh_from_db()
		self.assertAlmostEqual(self.booking.total_price, 300.0)
		self.assertAlmostEqual(self.booking.discount_amount, 30.0)
		self.assertAlmostEqual(self.booking.final_price, 270.0)


class FlightSerializerCreateTests(TestCase):
	def setUp(self):
		country = Country.objects.create(name="Vietnam")
		city_a = City.objects.create(name="Hanoi", country=country)
		city_b = City.objects.create(name="Danang", country=country)
		city_c = City.objects.create(name="HCM", country=country)

		self.airport_a = Airport.objects.create(city=city_a, code="SRA", name="Serializer Airport A")
		self.airport_b = Airport.objects.create(city=city_b, code="SRB", name="Serializer Airport B")
		self.airport_c = Airport.objects.create(city=city_c, code="SRC", name="Serializer Airport C")

		self.airline = Airline.objects.create(name="Airline Serializer", code="AS")
		self.aircraft = Aircraft.objects.create(
			airline=self.airline,
			model="A321",
			registration_number="VN-A321-SR",
			total_seats=180,
			economy_seats=160,
			business_seats=20,
			first_class_seats=0,
		)

	def _payload_with_nested_data(self):
		now = timezone.now()
		return {
			"airline_id": self.airline.id,
			"aircraft_id": self.aircraft.id,
			"base_price": 100,
			"baggage_included": True,
			"legs_data": [
				{
					"departure_time": (now + timedelta(hours=1)).isoformat(),
					"arrival_time": (now + timedelta(hours=3)).isoformat(),
					"departure_airport_id": self.airport_a.id,
					"arrival_airport_id": self.airport_b.id,
					"flight_code": "AS101",
				},
				{
					"departure_time": (now + timedelta(hours=4)).isoformat(),
					"arrival_time": (now + timedelta(hours=6, minutes=30)).isoformat(),
					"departure_airport_id": self.airport_b.id,
					"arrival_airport_id": self.airport_c.id,
					"flight_code": "AS102",
				},
			],
			"seat_classes_data": [
				{
					"seat_class": "economy",
					"multiplier": 1.0,
					"capacity": 100,
					"available_seats": 100,
				},
				{
					"seat_class": "business",
					"multiplier": 1.8,
					"capacity": 20,
					"available_seats": 20,
				},
			],
		}

	def test_fli_tc_020_create_flight_with_nested_legs_and_seat_classes(self):
		# TC ID: FLI-TC-020
		serializer = FlightSerializer(data=self._payload_with_nested_data())

		self.assertTrue(serializer.is_valid(), serializer.errors)
		flight = serializer.save()

		self.assertEqual(Flight.objects.count(), 1)
		self.assertEqual(flight.legs.count(), 2)
		self.assertEqual(flight.seat_classes.count(), 2)

	def test_fli_tc_021_create_flight_without_nested_data(self):
		# TC ID: FLI-TC-021
		serializer = FlightSerializer(
			data={
				"airline_id": self.airline.id,
				"aircraft_id": self.aircraft.id,
				"base_price": 120,
			}
		)

		self.assertTrue(serializer.is_valid(), serializer.errors)
		flight = serializer.save()

		self.assertEqual(Flight.objects.count(), 1)
		self.assertEqual(flight.legs.count(), 0)
		self.assertEqual(flight.seat_classes.count(), 0)

	def test_fli_tc_022_create_recalculates_stops_and_total_duration_from_nested_legs(self):
		# TC ID: FLI-TC-022
		serializer = FlightSerializer(data=self._payload_with_nested_data())

		self.assertTrue(serializer.is_valid(), serializer.errors)
		flight = serializer.save()
		flight.refresh_from_db()

		self.assertEqual(flight.stops, 1)
		self.assertEqual(flight.total_duration, 330)


class FlightSerializerComputedFieldTests(TestCase):
	def setUp(self):
		country = Country.objects.create(name="Vietnam")
		city_a = City.objects.create(name="Hanoi", country=country)
		city_b = City.objects.create(name="Danang", country=country)
		city_c = City.objects.create(name="HCM", country=country)

		self.airport_a = Airport.objects.create(city=city_a, code="CMA", name="Computed Airport A")
		self.airport_b = Airport.objects.create(city=city_b, code="CMB", name="Computed Airport B")
		self.airport_c = Airport.objects.create(city=city_c, code="CMC", name="Computed Airport C")

		self.airline = Airline.objects.create(name="Airline Computed", code="AC")

	def _create_flight_with_legs(self):
		now = timezone.now()
		flight = Flight.objects.create(airline=self.airline, base_price=100)
		FlightLeg.objects.create(
			flight=flight,
			departure_time=now + timedelta(hours=1),
			arrival_time=now + timedelta(hours=3),
			departure_airport=self.airport_a,
			arrival_airport=self.airport_b,
			flight_code="AC101",
			duration_minutes=0,
		)
		FlightLeg.objects.create(
			flight=flight,
			departure_time=now + timedelta(hours=4),
			arrival_time=now + timedelta(hours=6),
			departure_airport=self.airport_b,
			arrival_airport=self.airport_c,
			flight_code="AC102",
			duration_minutes=0,
		)
		return flight

	def test_fli_tc_023_get_departure_time_returns_first_leg_time(self):
		# TC ID: FLI-TC-023
		flight = self._create_flight_with_legs()
		serializer = FlightSerializer()

		departure_time = serializer.get_departure_time(flight)
		expected = flight.legs.order_by("departure_time").first().departure_time

		self.assertEqual(departure_time, expected)

	def test_fli_tc_024_get_departure_time_returns_none_when_no_legs(self):
		# TC ID: FLI-TC-024
		flight = Flight.objects.create(airline=self.airline, base_price=100)
		serializer = FlightSerializer()

		self.assertIsNone(serializer.get_departure_time(flight))

	def test_fli_tc_025_get_arrival_time_returns_last_leg_time(self):
		# TC ID: FLI-TC-025
		flight = self._create_flight_with_legs()
		serializer = FlightSerializer()

		arrival_time = serializer.get_arrival_time(flight)
		expected = flight.legs.order_by("arrival_time").last().arrival_time

		self.assertEqual(arrival_time, expected)

	def test_fli_tc_026_get_arrival_time_returns_none_when_no_legs(self):
		# TC ID: FLI-TC-026
		flight = Flight.objects.create(airline=self.airline, base_price=100)
		serializer = FlightSerializer()

		self.assertIsNone(serializer.get_arrival_time(flight))

	def test_fli_tc_027_get_departure_airport_maps_from_first_leg(self):
		# TC ID: FLI-TC-027
		flight = self._create_flight_with_legs()
		serializer = FlightSerializer()

		airport_data = serializer.get_departure_airport(flight)

		self.assertEqual(airport_data["id"], self.airport_a.id)
		self.assertEqual(airport_data["code"], self.airport_a.code)

	def test_fli_tc_028_get_departure_airport_returns_none_when_no_legs(self):
		# TC ID: FLI-TC-028
		flight = Flight.objects.create(airline=self.airline, base_price=100)
		serializer = FlightSerializer()

		self.assertIsNone(serializer.get_departure_airport(flight))

	def test_fli_tc_029_get_arrival_airport_maps_from_last_leg(self):
		# TC ID: FLI-TC-029
		flight = self._create_flight_with_legs()
		serializer = FlightSerializer()

		airport_data = serializer.get_arrival_airport(flight)

		self.assertEqual(airport_data["id"], self.airport_c.id)
		self.assertEqual(airport_data["code"], self.airport_c.code)

	def test_fli_tc_030_get_arrival_airport_returns_none_when_no_legs(self):
		# TC ID: FLI-TC-030
		flight = Flight.objects.create(airline=self.airline, base_price=100)
		serializer = FlightSerializer()

		self.assertIsNone(serializer.get_arrival_airport(flight))


class FlightBookingDetailCreateSerializerTests(TestCase):
	def setUp(self):
		country = Country.objects.create(name="Vietnam")
		city_a = City.objects.create(name="Hanoi", country=country)
		city_b = City.objects.create(name="Danang", country=country)

		self.airport_a = Airport.objects.create(city=city_a, code="VLA", name="Validate Airport A")
		self.airport_b = Airport.objects.create(city=city_b, code="VLB", name="Validate Airport B")
		self.airline = Airline.objects.create(name="Airline Validate", code="AV")

	def _create_flight(self, is_past=False):
		flight = Flight.objects.create(airline=self.airline, base_price=120)
		now = timezone.now()
		dep = now - timedelta(hours=1) if is_past else now + timedelta(hours=2)
		arr = dep + timedelta(hours=2)

		FlightLeg.objects.create(
			flight=flight,
			departure_time=dep,
			arrival_time=arr,
			departure_airport=self.airport_a,
			arrival_airport=self.airport_b,
			flight_code=f"AV{flight.id}01",
			duration_minutes=0,
		)
		return flight

	def test_fli_tc_031_validate_rejects_unavailable_seat_class(self):
		# TC ID: FLI-TC-031
		flight = self._create_flight(is_past=False)
		SeatClassPricing.objects.create(
			flight=flight,
			seat_class="economy",
			multiplier=1.0,
			capacity=50,
			available_seats=10,
		)

		serializer = FlightBookingDetailCreateSerializer(
			data={
				"flight": flight.id,
				"seat_class": "business",
				"num_passengers": 1,
				"total_price": 0,
			}
		)

		self.assertFalse(serializer.is_valid())
		self.assertIn("Seat class 'business' not available", str(serializer.errors))

	def test_fli_tc_032_validate_rejects_when_passenger_exceeds_available_seats(self):
		# TC ID: FLI-TC-032
		flight = self._create_flight(is_past=False)
		SeatClassPricing.objects.create(
			flight=flight,
			seat_class="economy",
			multiplier=1.0,
			capacity=50,
			available_seats=1,
		)

		serializer = FlightBookingDetailCreateSerializer(
			data={
				"flight": flight.id,
				"seat_class": "economy",
				"num_passengers": 2,
				"total_price": 0,
			}
		)

		self.assertFalse(serializer.is_valid())
		self.assertIn("Only 1 seats available", str(serializer.errors))

	def test_fli_tc_033_validate_rejects_when_departure_time_in_past(self):
		# TC ID: FLI-TC-033
		flight = self._create_flight(is_past=True)
		SeatClassPricing.objects.create(
			flight=flight,
			seat_class="economy",
			multiplier=1.0,
			capacity=50,
			available_seats=10,
		)

		serializer = FlightBookingDetailCreateSerializer(
			data={
				"flight": flight.id,
				"seat_class": "economy",
				"num_passengers": 1,
				"total_price": 0,
			}
		)

		self.assertFalse(serializer.is_valid())
		self.assertIn("Flight departure time is in the past", str(serializer.errors))

	def test_fli_tc_034_validate_accepts_valid_payload(self):
		# TC ID: FLI-TC-034
		flight = self._create_flight(is_past=False)
		SeatClassPricing.objects.create(
			flight=flight,
			seat_class="economy",
			multiplier=1.0,
			capacity=50,
			available_seats=10,
		)

		serializer = FlightBookingDetailCreateSerializer(
			data={
				"flight": flight.id,
				"seat_class": "economy",
				"num_passengers": 2,
				"total_price": 0,
			}
		)

		self.assertTrue(serializer.is_valid(), serializer.errors)


class FlightListViewGetQuerysetTests(TestCase):
	def setUp(self):
		self.factory = APIRequestFactory()
		self.leg_counter = 0

		country = Country.objects.create(name="Vietnam")
		city_a = City.objects.create(name="Hanoi", country=country)
		city_b = City.objects.create(name="Danang", country=country)
		city_c = City.objects.create(name="HCM", country=country)

		self.airport_a = Airport.objects.create(city=city_a, code="QSA", name="Query Airport A")
		self.airport_b = Airport.objects.create(city=city_b, code="QSB", name="Query Airport B")
		self.airport_c = Airport.objects.create(city=city_c, code="QSC", name="Query Airport C")

		self.airline = Airline.objects.create(name="Airline Query", code="AQ")

	def _create_flight(self, base_price=100, baggage=True, legs=None):
		flight = Flight.objects.create(
			airline=self.airline,
			base_price=base_price,
			baggage_included=baggage,
		)

		for dep_time, arr_time, dep_airport, arr_airport in legs or []:
			self.leg_counter += 1
			FlightLeg.objects.create(
				flight=flight,
				departure_time=dep_time,
				arrival_time=arr_time,
				departure_airport=dep_airport,
				arrival_airport=arr_airport,
				flight_code=f"AQ{self.leg_counter:03d}",
				duration_minutes=0,
			)
		return flight

	def _get_queryset(self, params):
		view = FlightListView()
		view.request = Request(self.factory.get("/api/flights/list/", params))
		return view.get_queryset()

	def test_fli_tc_035_get_queryset_filters_by_first_departure_and_last_arrival_airport(self):
		# TC ID: FLI-TC-035
		now = timezone.now()
		flight_match = self._create_flight(
			base_price=200,
			legs=[
				(now + timedelta(hours=1), now + timedelta(hours=2), self.airport_a, self.airport_b),
				(now + timedelta(hours=3), now + timedelta(hours=4), self.airport_b, self.airport_c),
			],
		)
		self._create_flight(
			base_price=200,
			legs=[
				(now + timedelta(hours=1), now + timedelta(hours=2), self.airport_a, self.airport_b),
				(now + timedelta(hours=3), now + timedelta(hours=4), self.airport_b, self.airport_a),
			],
		)

		queryset = self._get_queryset(
			{
				"departure_airport_id": self.airport_a.id,
				"arrival_airport_id": self.airport_c.id,
			}
		)

		self.assertEqual(list(queryset.values_list("id", flat=True)), [flight_match.id])

	def test_fli_tc_036_get_queryset_filters_min_max_flight_leg_departure(self):
		# TC ID: FLI-TC-036
		now = timezone.now()
		min_dep = now + timedelta(hours=1)
		max_dep = now + timedelta(hours=6)

		flight_ok = self._create_flight(
			base_price=220,
			legs=[
				(now + timedelta(hours=2), now + timedelta(hours=3), self.airport_a, self.airport_b),
				(now + timedelta(hours=4), now + timedelta(hours=5), self.airport_b, self.airport_c),
			],
		)
		self._create_flight(
			base_price=220,
			legs=[
				(now - timedelta(hours=1), now + timedelta(hours=1), self.airport_a, self.airport_b),
				(now + timedelta(hours=3), now + timedelta(hours=4), self.airport_b, self.airport_c),
			],
		)

		queryset = self._get_queryset(
			{
				"min_flight_leg_departure": min_dep.isoformat(),
				"max_flight_leg_departure": max_dep.isoformat(),
			}
		)

		self.assertEqual(list(queryset.values_list("id", flat=True)), [flight_ok.id])

	def test_fli_tc_037_get_queryset_filters_duration_stops_price_baggage(self):
		# TC ID: FLI-TC-037
		now = timezone.now()
		flight_ok = self._create_flight(
			base_price=200,
			baggage=True,
			legs=[
				(now + timedelta(hours=1), now + timedelta(hours=2), self.airport_a, self.airport_b),
				(now + timedelta(hours=2, minutes=30), now + timedelta(hours=3), self.airport_b, self.airport_c),
			],
		)
		self._create_flight(
			base_price=120,
			baggage=True,
			legs=[
				(now + timedelta(hours=1), now + timedelta(hours=2), self.airport_a, self.airport_b),
				(now + timedelta(hours=2, minutes=30), now + timedelta(hours=3), self.airport_b, self.airport_c),
			],
		)
		self._create_flight(
			base_price=200,
			baggage=False,
			legs=[
				(now + timedelta(hours=1), now + timedelta(hours=2), self.airport_a, self.airport_b),
				(now + timedelta(hours=2, minutes=30), now + timedelta(hours=3), self.airport_b, self.airport_c),
			],
		)

		queryset = self._get_queryset(
			{
				"min_base_price": "150",
				"max_base_price": "250",
				"min_total_duration": "100",
				"max_total_duration": "140",
				"min_stops": "1",
				"max_stops": "1",
				"baggage_included": "True",
			}
		)

		self.assertEqual(list(queryset.values_list("id", flat=True)), [flight_ok.id])

	def test_fli_tc_038_get_queryset_sorts_by_multiple_fields(self):
		# TC ID: FLI-TC-038
		now = timezone.now()
		flight_1 = self._create_flight(
			base_price=500,
			legs=[(now + timedelta(hours=1), now + timedelta(hours=4), self.airport_a, self.airport_b)],
		)
		flight_2 = self._create_flight(
			base_price=300,
			legs=[(now + timedelta(hours=1), now + timedelta(hours=2, minutes=30), self.airport_a, self.airport_b)],
		)
		flight_3 = self._create_flight(
			base_price=300,
			legs=[(now + timedelta(hours=1), now + timedelta(hours=3, minutes=30), self.airport_a, self.airport_b)],
		)

		queryset = self._get_queryset({"sort": "base_price-desc,total_duration-asc"})

		self.assertEqual(
			list(queryset.values_list("id", flat=True)),
			[flight_1.id, flight_2.id, flight_3.id],
		)

	def test_fli_tc_039_get_queryset_ignores_invalid_sort_format_without_crash(self):
		# TC ID: FLI-TC-039
		now = timezone.now()
		self._create_flight(
			base_price=100,
			legs=[(now + timedelta(hours=1), now + timedelta(hours=2), self.airport_a, self.airport_b)],
		)
		self._create_flight(
			base_price=200,
			legs=[(now + timedelta(hours=1), now + timedelta(hours=3), self.airport_a, self.airport_b)],
		)

		queryset = self._get_queryset({"sort": "invalid_format"})

		self.assertEqual(queryset.count(), 2)
		self.assertEqual(len(list(queryset)), 2)
