from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import CustomUser
from bookings.constants.service_type import ServiceType
from bookings.models import Booking
from cars.constants.car_booking_status import CarBookingStatus
from cars.models import Car, CarBookingDetail, UserCarInteraction
from promotions.models import CarPromotion, Promotion, PromotionType


class CarModelTests(TestCase):
	def setUp(self):
		self.driver = CustomUser.objects.create_user(
			username="car_driver",
			email="car_driver@example.com",
			password="pass12345",
			role="driver",
			driver_status="idle",
		)
		self.car = Car.objects.create(
			user=self.driver,
			name="Toyota Vios",
			capacity=4,
			luggage=2,
			price_per_km=10000,
			avg_speed=35,
			total_booking_count=12,
		)

	def test_car_tc_001_calc_total_weighted_score_uses_booking_count(self):
		# TC ID: CAR-TC-001
		self.assertEqual(self.car.calc_total_weighted_score, 12)

	def test_car_tc_002_update_total_weighted_score_persists_value(self):
		# TC ID: CAR-TC-002
		self.car.update_total_weighted_score()
		self.car.refresh_from_db()
		self.assertEqual(self.car.total_weighted_score, 12)

	def test_car_tc_003_get_active_promotion_returns_highest_discount(self):
		# TC ID: CAR-TC-003
		now = timezone.now()
		promo = Promotion.objects.create(
			title="Car Deal",
			promotion_type=PromotionType.CAR,
			discount_percent=5,
			start_date=now - timedelta(days=1),
			end_date=now + timedelta(days=1),
			is_active=True,
		)
		CarPromotion.objects.create(
			promotion=promo,
			car=self.car,
			discount_percent=20,
		)

		active = self.car.get_active_promotion()
		self.assertIsNotNone(active)
		self.assertEqual(active["discount_percent"], 20)

	def test_car_tc_004_car_booking_detail_save_assigns_driver_and_total_price(self):
		# TC ID: CAR-TC-004
		booking = Booking.objects.create(service_type=ServiceType.CAR)
		detail = CarBookingDetail.objects.create(
			booking=booking,
			car=self.car,
			distance_km=10,
			passenger_quantity_booking=2,
		)
		booking.refresh_from_db()
		self.driver.refresh_from_db()

		self.assertEqual(detail.driver, self.driver)
		self.assertEqual(float(detail.total_price), 200000.0)
		self.assertEqual(detail.final_price, 200000.0)
		self.assertEqual(self.driver.driver_status, "busy")
		self.assertEqual(booking.total_price, 200000.0)

	def test_car_tc_005_car_booking_arrived_sets_driver_idle(self):
		# TC ID: CAR-TC-005
		booking = Booking.objects.create(service_type=ServiceType.CAR)
		CarBookingDetail.objects.create(
			booking=booking,
			car=self.car,
			distance_km=1,
			passenger_quantity_booking=1,
			status=CarBookingStatus.ARRIVED,
		)
		self.driver.refresh_from_db()
		self.assertEqual(self.driver.driver_status, "idle")

	def test_car_tc_006_user_car_interaction_updates_weighted_score(self):
		# TC ID: CAR-TC-006
		user = CustomUser.objects.create_user(
			username="car_customer",
			email="car_customer@example.com",
			password="pass12345",
		)
		interaction = UserCarInteraction.objects.create(
			user=user,
			car=self.car,
			booking_count=4,
		)
		interaction.update_weighted_score()
		self.assertEqual(interaction.weighted_score, 4)
