from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import CustomUser
from bookings.constants.service_type import ServiceType
from bookings.models import Booking
from cities.models import City
from countries.models import Country
from hotels.models import Hotel
from promotions.models import Promotion, PromotionType, RoomPromotion
from rooms.models import Room, RoomBookingDetail


class RoomModelTests(TestCase):
	def setUp(self):
		self.country = Country.objects.create(name="VN Room")
		self.city = City.objects.create(name="Room City", country=self.country)
		self.owner = CustomUser.objects.create_user(
			username="room_owner",
			email="room_owner@example.com",
			password="pass12345",
		)
		self.hotel = Hotel.objects.create(city=self.city, owner=self.owner, name="Room Hotel")
		self.room = Room.objects.create(
			hotel=self.hotel,
			room_type="Standard",
			price_per_night=100,
			price_per_day=80,
			adults_capacity=2,
			children_capacity=1,
			available_rooms=3,
			total_rooms=3,
		)

	def test_room_tc_001_capacity_returns_adults_plus_children(self):
		# TC ID: ROOM-TC-001
		self.assertEqual(self.room.capacity, 3)

	def test_room_tc_002_save_marks_unavailable_when_available_rooms_zero(self):
		# TC ID: ROOM-TC-002
		self.room.available_rooms = 0
		self.room.save()
		self.room.refresh_from_db()
		self.assertFalse(self.room.available)

	def test_room_tc_003_decrease_available_rooms_not_below_zero(self):
		# TC ID: ROOM-TC-003
		self.room.decrease_available_rooms(5)
		self.room.refresh_from_db()
		self.assertEqual(self.room.available_rooms, 0)

	def test_room_tc_004_get_active_promotion_returns_best_discount(self):
		# TC ID: ROOM-TC-004
		now = timezone.now()
		promo = Promotion.objects.create(
			title="Room Flash Sale",
			promotion_type=PromotionType.HOTEL,
			discount_percent=5,
			start_date=now - timedelta(days=1),
			end_date=now + timedelta(days=1),
			is_active=True,
		)
		RoomPromotion.objects.create(
			promotion=promo,
			room=self.room,
			discount_percent=25,
		)
		active = self.room.get_active_promotion()
		self.assertIsNotNone(active)
		self.assertEqual(active["discount_percent"], 25)

	def test_room_tc_005_room_booking_detail_save_for_overnight(self):
		# TC ID: ROOM-TC-005
		booking = Booking.objects.create(service_type=ServiceType.HOTEL)
		now = timezone.now()
		detail = RoomBookingDetail.objects.create(
			booking=booking,
			room=self.room,
			check_in=now,
			check_out=now + timedelta(days=2),
			num_guests=2,
			room_count=2,
		)
		booking.refresh_from_db()
		self.room.refresh_from_db()

		self.assertEqual(detail.room_type, "Standard")
		self.assertEqual(detail.owner_hotel, self.owner)
		self.assertEqual(detail.total_price, 400.0)
		self.assertEqual(detail.final_price, 400.0)
		self.assertEqual(booking.total_price, 400.0)
		self.assertEqual(self.room.available_rooms, 1)

	def test_room_tc_006_room_booking_detail_save_for_dayuse(self):
		# TC ID: ROOM-TC-006
		dayuse_room = Room.objects.create(
			hotel=self.hotel,
			room_type="Dayuse",
			stay_type="dayuse",
			price_per_day=150,
			price_per_night=999,
			available_rooms=2,
			total_rooms=2,
		)
		booking = Booking.objects.create(service_type=ServiceType.HOTEL)
		now = timezone.now()
		detail = RoomBookingDetail.objects.create(
			booking=booking,
			room=dayuse_room,
			check_in=now,
			check_out=now + timedelta(hours=6),
			num_guests=1,
			room_count=1,
		)
		self.assertEqual(detail.total_price, 150.0)
