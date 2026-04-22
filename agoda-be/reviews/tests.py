from django.test import TestCase

from activities.models import Activity
from bookings.constants.service_type import ServiceType
from cities.models import City
from countries.models import Country
from hotels.models import Hotel
from reviews.models import Review


class ReviewModelTests(TestCase):
	def setUp(self):
		self.country = Country.objects.create(name="VN Review")
		self.city = City.objects.create(name="Review City", country=self.country)
		self.hotel = Hotel.objects.create(city=self.city, name="Review Hotel")
		self.activity = Activity.objects.create(
			name="Review Activity",
			city=self.city,
			category="journey",
			total_time=2,
		)

	def test_rvw_tc_001_service_type_name_returns_label(self):
		# TC ID: RVW-TC-001
		review = Review.objects.create(
			service_type=ServiceType.HOTEL,
			service_ref_id=self.hotel.id,
			rating=5,
		)
		self.assertEqual(review.service_type_name, "Hotel")

	def test_rvw_tc_002_get_service_instance_returns_hotel_or_activity(self):
		# TC ID: RVW-TC-002
		hotel_review = Review.objects.create(
			service_type=ServiceType.HOTEL,
			service_ref_id=self.hotel.id,
		)
		activity_review = Review.objects.create(
			service_type=ServiceType.ACTIVITY,
			service_ref_id=self.activity.id,
		)

		self.assertEqual(hotel_review.get_service_instance(), self.hotel)
		self.assertEqual(activity_review.get_service_instance(), self.activity)

	def test_rvw_tc_003_str_contains_service_type_label_and_ref_id(self):
		# TC ID: RVW-TC-003
		review = Review.objects.create(
			service_type=ServiceType.HOTEL,
			service_ref_id=self.hotel.id,
		)
		text = str(review)
		self.assertIn("Hotel", text)
		self.assertIn(f"#{self.hotel.id}", text)
