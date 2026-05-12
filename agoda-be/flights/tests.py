from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from airlines.models import Airline
from airports.models import Airport
from bookings.constants.service_type import ServiceType
from bookings.models import Booking
from cities.models import City
from countries.models import Country
from flights.models import Flight, FlightBookingDetail, FlightLeg, SeatClassPricing
from flights.serializers import FlightBookingDetailCreateSerializer


class SeatClassPricingModelTests(TestCase):
	"""Test các chức năng của model SeatClassPricing (giá vé theo hạng ghế)"""
	
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

	# TC ID: FLI-TC-001
	def test_fli_tc_001_price_calculates_by_multiplier(self):
		# Kiểm tra: Tính giá vé bằng cách nhân base_price với multiplier
		# Mục đích: Đảm bảo giá vé các hạng khác nhau được tính đúng (VD: business = economy * 1.5)
		# Kỳ vọng: Giá = 100 * 1.5 = 150.0
		pricing = SeatClassPricing.objects.create(
			flight=self.flight,
			seat_class="economy",
			multiplier=1.5,
			capacity=100,
			available_seats=80,
		)

		self.assertEqual(pricing.price(), 150.0)

	# TC ID: FLI-TC-002
	def test_fli_tc_002_price_with_default_multiplier(self):
		# Kiểm tra: Sử dụng multiplier mặc định (1.0) khi không cung cấp
		# Mục đích: Đảm bảo giá vé bằng base_price khi không có hệ số nhân
		# Kỳ vọng: Giá = 80 * 1.0 = 80.0
		self.flight.base_price = 80
		self.flight.save(update_fields=["base_price"])

		pricing = SeatClassPricing.objects.create(
			flight=self.flight,
			seat_class="economy",
			capacity=100,
			available_seats=80,
		)

		self.assertEqual(pricing.price(), 80.0)

	# TC ID: FLI-TC-003
	def test_fli_tc_003_seats_sold_normal_case(self):
		# Kiểm tra: Tính số ghế đã bán = tổng ghế - ghế còn trống
		# Mục đích: Đảm bảo theo dõi chính xác số ghế đã bán
		# Kỳ vọng: seats_sold = 180 - 45 = 135
		pricing = SeatClassPricing.objects.create(
			flight=self.flight,
			seat_class="economy",
			capacity=180,
			available_seats=45,
		)

		self.assertEqual(pricing.seats_sold, 135)

	# TC ID: FLI-TC-004
	def test_fli_tc_004_seats_sold_zero_when_full_available(self):
		# Kiểm tra: Số ghế đã bán = 0 khi tất cả ghế đều còn trống
		# Mục đích: Đảm bảo tính toán đúng khi chưa có ai đặt vé
		# Kỳ vọng: seats_sold = 120 - 120 = 0
		pricing = SeatClassPricing.objects.create(
			flight=self.flight,
			seat_class="economy",
			capacity=120,
			available_seats=120,
		)

		self.assertEqual(pricing.seats_sold, 0)


class FlightBookingDetailModelTests(TestCase):
	"""Test các chức năng của model FlightBookingDetail (đặt vé máy bay)"""
	
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

	# TC ID: FLI-TC-005
	def test_fli_tc_005_save_handles_missing_seat_class_pricing(self):
		# Kiểm tra: Xử lý khi không tìm thấy thông tin giá hạng ghế
		# Mục đích: Đảm bảo hệ thống không bị lỗi khi dữ liệu thiếu
		# Kỳ vọng: total=0, discount=0, final=0 khi không có SeatClassPricing		
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

	# TC ID: FLI-TC-006
	def test_fli_tc_006_save_reduces_available_seats_on_create(self):
		# Kiểm tra: Giảm số ghế còn trống khi tạo booking mới
		# Mục đích: Đảm bảo cập nhật số ghế khả dụng khi khách đặt vé
		# Kỳ vọng: available_seats giảm từ 10 xuống 7 (3 hành khách)		
		with patch.object(Flight, "get_active_promotion", return_value=None):
			FlightBookingDetail.objects.create(
				booking=self.booking,
				flight=self.flight,
				seat_class="economy",
				num_passengers=3,
			)

		self.seat_class_pricing.refresh_from_db()
		self.assertEqual(self.seat_class_pricing.available_seats, 7)

	# TC ID: FLI-TC-007
	def test_fli_tc_007_save_does_not_reduce_available_seats_on_update(self):
		# Kiểm tra: Không giảm ghế còn trống khi cập nhật booking đã tồn tại
		# Mục đích: Đảm bảo không trừ ghế 2 lần khi sửa thông tin booking
		# Kỳ vọng: available_seats vẫn là 7 sau khi update (không giảm thêm)
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


class FlightBookingDetailCreateSerializerTests(TestCase):
	"""Test validation khi tạo booking vé máy bay"""
	
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

	# TC ID: FLI-TC-008
	def test_fli_tc_008_validate_rejects_unavailable_seat_class(self):
		# Kiểm tra: Từ chối khi chọn hạng ghế không khả dụng
		# Mục đích: Đảm bảo không cho đặt hạng ghế không tồn tại (VD: đặt business nhưng chỉ có economy)
		# Kỳ vọng: Validation lỗi với message "Seat class 'business' not available"
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

	# TC ID: FLI-TC-009
	def test_fli_tc_009_validate_rejects_when_passenger_exceeds_available_seats(self):
		# Kiểm tra: Từ chối khi số hành khách vượt quá số ghế còn trống
		# Mục đích: Đảm bảo không overbooking (VD: chỉ còn 1 ghế nhưng đặt 2 người)
		# Kỳ vọng: Validation lỗi với message "Only 1 seats available"
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

	# TC ID: FLI-TC-010
	def test_fli_tc_010_validate_rejects_when_departure_time_in_past(self):
		# Kiểm tra: Từ chối khi giờ bay đã qua
		# Mục đích: Đảm bảo không cho đặt vé chuyến bay đã khởi hành
		# Kỳ vọng: Validation lỗi với message "Flight departure time is in the past"
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

	# TC ID: FLI-TC-011
	def test_fli_tc_011_validate_accepts_valid_payload(self):
		# Kiểm tra: Chấp nhận dữ liệu hợp lệ
		# Mục đích: Đảm bảo có thể đặt vé khi tất cả điều kiện đều thỏa mãn
		# Kỳ vọng: Validation thành công, is_valid() = True
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

	
