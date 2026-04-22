from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import CustomUser
from activities.models import Activity, ActivityDate, ActivityPackage
from cars.models import Car
from cities.models import City
from countries.models import Country
from hotels.models import Hotel
from promotions.models import (
	ActivityPromotion,
	CarPromotion,
	Promotion,
	PromotionType,
	RoomPromotion,
)
from rooms.models import Room


class PromotionModelTests(TestCase):
	def setUp(self):
		now = timezone.now()
		self.promotion = Promotion.objects.create(
			title="Mega Sale",
			promotion_type=PromotionType.HOTEL,
			discount_percent=10,
			start_date=now - timedelta(days=1),
			end_date=now + timedelta(days=1),
			is_active=True,
		)
		self.country = Country.objects.create(name="VN Promo")
		self.city = City.objects.create(name="Promo City", country=self.country)
		self.owner = CustomUser.objects.create_user(
			username="promo_owner",
			email="promo_owner@example.com",
			password="pass12345",
		)

	def test_prm_tc_001_promotion_str_returns_title_and_type(self):
		# TC ID: PRM-TC-001
		self.assertEqual(str(self.promotion), "Mega Sale (Chỗ ở)")

	def test_prm_tc_002_room_promotion_str_returns_room_type(self):
		# TC ID: PRM-TC-002
		hotel = Hotel.objects.create(city=self.city, owner=self.owner, name="Promo Hotel")
		room = Room.objects.create(hotel=hotel, room_type="Suite", price_per_night=500)
		room_promo = RoomPromotion.objects.create(promotion=self.promotion, room=room)
		self.assertEqual(str(room_promo), "Mega Sale -> Room: Suite")

	def test_prm_tc_003_car_promotion_str_handles_nullable_car(self):
		# TC ID: PRM-TC-003
		car_promo = CarPromotion.objects.create(promotion=self.promotion, car=None)
		self.assertEqual(str(car_promo), "Mega Sale -> Car: N/A")

	def test_prm_tc_004_activity_promotion_str_returns_activity_date_id(self):
		# TC ID: PRM-TC-004
		activity = Activity.objects.create(
			name="Promo Activity",
			city=self.city,
			category="journey",
			total_time=2,
		)
		package = ActivityPackage.objects.create(activity=activity, name="Basic")
		activity_date = ActivityDate.objects.create(
			activity_package=package,
			date_launch=timezone.now() + timedelta(days=5),
		)
		activity_promo = ActivityPromotion.objects.create(
			promotion=self.promotion,
			activity_date=activity_date,
		)
		self.assertIn(f"ActivityDate: {activity_date.id}", str(activity_promo))

	def test_prm_tc_005_car_promotion_str_returns_car_name(self):
		# TC ID: PRM-TC-005
		car = Car.objects.create(
			user=self.owner,
			name="Promo Car",
			capacity=4,
			luggage=2,
			price_per_km=8000,
			avg_speed=40,
		)
		car_promo = CarPromotion.objects.create(promotion=self.promotion, car=car)
		self.assertEqual(str(car_promo), "Mega Sale -> Car: Promo Car")
