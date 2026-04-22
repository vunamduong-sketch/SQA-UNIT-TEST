from django.test import TestCase

from accounts.models import CustomUser
from cities.models import City
from countries.models import Country
from hotels.models import Hotel, UserHotelInteraction
from rooms.models import Room


class HotelModelTests(TestCase):
	def setUp(self):
		self.country = Country.objects.create(name="VN Hotel")
		self.city = City.objects.create(name="Nha Trang Hotel", country=self.country)
		self.owner = CustomUser.objects.create_user(
			username="hotel_owner",
			email="hotel_owner@example.com",
			password="pass12345",
		)
		self.hotel = Hotel.objects.create(
			city=self.city,
			owner=self.owner,
			name="Blue Sea Hotel",
			avg_star=4.2,
			total_click=10,
			total_positive=9,
			total_negative=1,
			total_neutral=0,
		)

	def test_htl_tc_001_save_recomputes_total_weighted_score(self):
		# TC ID: HTL-TC-001
		self.assertAlmostEqual(self.hotel.total_weighted_score, self.hotel.calc_total_weighted_score, places=6)

	def test_htl_tc_002_update_min_price_uses_available_rooms_only(self):
		# TC ID: HTL-TC-002
		Room.objects.create(
			hotel=self.hotel,
			room_type="Standard",
			price_per_night=100,
			available_rooms=2,
		)
		Room.objects.create(
			hotel=self.hotel,
			room_type="Deluxe",
			price_per_night=300,
			available_rooms=0,
		)

		self.hotel.update_min_price()
		self.hotel.refresh_from_db()
		self.assertEqual(self.hotel.min_price, 100)

	def test_htl_tc_003_user_hotel_interaction_updates_weighted_score(self):
		# TC ID: HTL-TC-003
		user = CustomUser.objects.create_user(
			username="hotel_user",
			email="hotel_user@example.com",
			password="pass12345",
		)
		interaction = UserHotelInteraction.objects.create(
			user=user,
			hotel=self.hotel,
			click_count=5,
			positive_count=4,
			negative_count=1,
			neutral_count=0,
		)
		interaction.update_weighted_score()
		self.assertGreater(interaction.weighted_score, 0)
