from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import CustomUser
from activities.models import (
	Activity,
	ActivityDate,
	ActivityDateBookingDetail,
	ActivityPackage,
	UserActivityInteraction,
)
from bookings.constants.service_type import ServiceType
from bookings.models import Booking
from cities.models import City
from countries.models import Country
from promotions.models import ActivityPromotion, Promotion, PromotionType


class ActivityModelTests(TestCase):
	def setUp(self):
		self.country = Country.objects.create(name="VN Activity")
		self.city = City.objects.create(name="HCM Activity", country=self.country)
		self.organizer = CustomUser.objects.create_user(
			username="activity_org",
			email="activity_org@example.com",
			password="pass12345",
		)

	def test_act_tc_001_activity_save_updates_weighted_score(self):
		# TC ID: ACT-TC-001
		activity = Activity.objects.create(
			name="Saigon Tour",
			city=self.city,
			category="journey",
			total_time=4,
			avg_star=4.5,
			total_click=9,
			total_positive=8,
			total_negative=2,
			total_neutral=0,
		)
		self.assertAlmostEqual(activity.total_weighted_score, activity.calc_total_weighted_score, places=6)

	def test_act_tc_002_user_activity_interaction_update_weighted_score(self):
		# TC ID: ACT-TC-002
		activity = Activity.objects.create(
			name="Mekong Tour",
			city=self.city,
			category="experience",
			total_time=6,
		)
		user = CustomUser.objects.create_user(
			username="activity_user",
			email="activity_user@example.com",
			password="pass12345",
		)
		interaction = UserActivityInteraction.objects.create(
			user=user,
			activity=activity,
			click_count=3,
			positive_count=4,
			negative_count=1,
			neutral_count=1,
		)

		interaction.update_weighted_score()
		self.assertGreater(interaction.weighted_score, 0)

	def test_act_tc_003_activity_date_get_active_promotion_returns_best_discount(self):
		# TC ID: ACT-TC-003
		activity = Activity.objects.create(
			name="City Walk",
			city=self.city,
			event_organizer=self.organizer,
			category="journey",
			total_time=2,
		)
		package = ActivityPackage.objects.create(activity=activity, name="Standard")
		activity_date = ActivityDate.objects.create(
			activity_package=package,
			price_adult=200,
			price_child=100,
			date_launch=timezone.now() + timedelta(days=3),
		)

		now = timezone.now()
		promo = Promotion.objects.create(
			title="Activity Sale",
			promotion_type=PromotionType.ACTIVITY,
			discount_percent=5,
			start_date=now - timedelta(days=1),
			end_date=now + timedelta(days=1),
			is_active=True,
		)
		ActivityPromotion.objects.create(
			promotion=promo,
			activity_date=activity_date,
			discount_percent=15,
		)

		active = activity_date.get_active_promotion()
		self.assertIsNotNone(active)
		self.assertEqual(active["discount_percent"], 15)

	def test_act_tc_004_activity_booking_detail_save_calculates_prices(self):
		# TC ID: ACT-TC-004
		activity = Activity.objects.create(
			name="Boat Trip",
			city=self.city,
			event_organizer=self.organizer,
			category="moving",
			total_time=3,
		)
		package = ActivityPackage.objects.create(activity=activity, name="Premium")
		activity_date = ActivityDate.objects.create(
			activity_package=package,
			price_adult=300,
			price_child=120,
			participants_available=20,
			date_launch=timezone.now() + timedelta(days=2),
		)
		booking = Booking.objects.create(service_type=ServiceType.ACTIVITY)

		detail = ActivityDateBookingDetail.objects.create(
			booking=booking,
			activity_date=activity_date,
			price_adult=300,
			price_child=120,
			adult_quantity_booking=2,
			child_quantity_booking=1,
			date_launch=timezone.now() + timedelta(days=2),
		)

		activity_date.refresh_from_db()
		booking.refresh_from_db()
		self.assertEqual(float(detail.total_price), 720.0)
		self.assertEqual(detail.final_price, 720.0)
		self.assertEqual(activity_date.participants_available, 17)
		self.assertEqual(detail.event_organizer_activity, self.organizer)
		self.assertEqual(booking.total_price, 720.0)
