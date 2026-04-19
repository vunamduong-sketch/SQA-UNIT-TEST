from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.test import TestCase
from django.utils import timezone
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import CustomUser
from activities.models import Activity, ActivityDate, ActivityPackage
from bookings.constants.service_type import ServiceType
from bookings.models import Booking, GuestInfo
from bookings.serializers import BookingSerializer
from bookings.views import BookingViewSet
from cars.models import Car
from cities.models import City
from countries.models import Country


class BookingModelTests(TestCase):
	def test_bkg_tc_001_save_generates_booking_code_if_missing(self):
		# TC ID: BKG-TC-001
		booking = Booking.objects.create(service_type=ServiceType.HOTEL)

		self.assertTrue(booking.booking_code.startswith("AGD"))
		# Format: AGD + 6 ky tu
		self.assertEqual(len(booking.booking_code), 9)

	def test_bkg_tc_002_save_keeps_existing_booking_code(self):
		# TC ID: BKG-TC-002
		booking = Booking.objects.create(
			service_type=ServiceType.CAR,
			booking_code="AGDCUSTOM1",
		)
		booking.total_price = 123.45
		booking.save()

		booking.refresh_from_db()
		self.assertEqual(booking.booking_code, "AGDCUSTOM1")


class BookingSerializerTests(TestCase):
	def setUp(self):
		self.factory = APIRequestFactory()
		self.user = CustomUser.objects.create_user(
			username="serializer_user",
			email="serializer_user@example.com",
			password="pass12345",
		)

	def test_bkg_tc_003_get_room_details_returns_data_for_hotel(self):
		# TC ID: BKG-TC-003
		serializer = BookingSerializer()
		booking = SimpleNamespace(service_type=ServiceType.HOTEL, service_ref_ids=[11, 12])

		with patch("bookings.serializers.RoomBookingDetail.objects.filter") as mock_filter, patch(
			"bookings.serializers.RoomBookingDetailSerializer"
		) as mock_serializer:
			mock_filter.return_value = ["room1", "room2"]
			mock_serializer.return_value.data = [{"id": 11}, {"id": 12}]

			result = serializer.get_room_details(booking)

		mock_filter.assert_called_once_with(id__in=[11, 12])
		self.assertEqual(result, [{"id": 11}, {"id": 12}])

	def test_bkg_tc_004_get_room_details_returns_none_for_non_hotel_or_empty_refs(self):
		# TC ID: BKG-TC-004
		serializer = BookingSerializer()
		booking = SimpleNamespace(service_type=ServiceType.CAR, service_ref_ids=[11])
		self.assertIsNone(serializer.get_room_details(booking))

		booking_empty = SimpleNamespace(service_type=ServiceType.HOTEL, service_ref_ids=[])
		self.assertIsNone(serializer.get_room_details(booking_empty))

	def test_bkg_tc_005_get_car_detail_returns_data_for_car(self):
		# TC ID: BKG-TC-005
		serializer = BookingSerializer()
		booking = SimpleNamespace(service_type=ServiceType.CAR, service_ref_ids=[21])

		with patch("bookings.serializers.CarBookingDetail.objects.filter") as mock_filter, patch(
			"bookings.serializers.CarBookingDetailSerializer"
		) as mock_serializer:
			mock_filter.return_value = ["car_detail"]
			mock_serializer.return_value.data = [{"id": 21}]

			result = serializer.get_car_detail(booking)

		mock_filter.assert_called_once_with(id__in=[21])
		self.assertEqual(result, [{"id": 21}])

	def test_bkg_tc_006_get_car_detail_returns_none_for_non_car_or_empty_refs(self):
		# TC ID: BKG-TC-006
		serializer = BookingSerializer()
		booking = SimpleNamespace(service_type=ServiceType.HOTEL, service_ref_ids=[21])
		self.assertIsNone(serializer.get_car_detail(booking))

		booking_empty = SimpleNamespace(service_type=ServiceType.CAR, service_ref_ids=[])
		self.assertIsNone(serializer.get_car_detail(booking_empty))

	def test_bkg_tc_007_get_flight_detail_returns_data_for_flight(self):
		# TC ID: BKG-TC-007
		serializer = BookingSerializer()
		booking = MagicMock()
		booking.service_type = ServiceType.FLIGHT
		booking.service_ref_ids = [31]
		booking.flight_details.all.return_value = ["flight_detail"]

		with patch("bookings.serializers.FlightBookingDetailSerializer") as mock_serializer:
			mock_serializer.return_value.data = [{"id": 31}]

			result = serializer.get_flight_detail(booking)

		booking.flight_details.all.assert_called_once()
		self.assertEqual(result, [{"id": 31}])

	def test_bkg_tc_008_get_flight_detail_returns_none_for_non_flight_or_empty_refs(self):
		# TC ID: BKG-TC-008
		serializer = BookingSerializer()
		booking = SimpleNamespace(service_type=ServiceType.CAR, service_ref_ids=[31])
		self.assertIsNone(serializer.get_flight_detail(booking))

		booking_empty = SimpleNamespace(service_type=ServiceType.FLIGHT, service_ref_ids=[])
		self.assertIsNone(serializer.get_flight_detail(booking_empty))

	def test_bkg_tc_009_get_activity_date_detail_returns_data_for_activity(self):
		# TC ID: BKG-TC-009
		serializer = BookingSerializer()
		booking = SimpleNamespace(service_type=ServiceType.ACTIVITY, service_ref_ids=[41])

		with patch(
			"bookings.serializers.ActivityDateBookingDetail.objects.filter"
		) as mock_filter, patch(
			"bookings.serializers.ActivityDateBookingDetailSerializer"
		) as mock_serializer:
			mock_filter.return_value = ["activity_detail"]
			mock_serializer.return_value.data = [{"id": 41}]

			result = serializer.get_activity_date_detail(booking)

		mock_filter.assert_called_once_with(id__in=[41])
		self.assertEqual(result, [{"id": 41}])

	def test_bkg_tc_010_get_activity_date_detail_returns_none_for_non_activity_or_empty_refs(self):
		# TC ID: BKG-TC-010
		serializer = BookingSerializer()
		booking = SimpleNamespace(service_type=ServiceType.HOTEL, service_ref_ids=[41])
		self.assertIsNone(serializer.get_activity_date_detail(booking))

		booking_empty = SimpleNamespace(service_type=ServiceType.ACTIVITY, service_ref_ids=[])
		self.assertIsNone(serializer.get_activity_date_detail(booking_empty))

	def test_bkg_tc_011_create_assigns_authenticated_user(self):
		# TC ID: BKG-TC-011
		request = self.factory.post("/api/bookings/", {}, format="json")
		request.user = self.user

		serializer = BookingSerializer(
			data={"service_type": ServiceType.HOTEL},
			context={"request": request},
		)
		self.assertTrue(serializer.is_valid(), serializer.errors)
		booking = serializer.save()

		self.assertEqual(booking.user, self.user)

	def test_bkg_tc_012_create_creates_guest_info(self):
		# TC ID: BKG-TC-012
		serializer = BookingSerializer(
			data={
				"service_type": ServiceType.HOTEL,
				"guest_info": {
					"full_name": "Guest A",
					"email": "guesta@example.com",
					"phone": "0900000000",
					"country": "VN",
					"special_request": "Late check-in",
				},
			}
		)
		self.assertTrue(serializer.is_valid(), serializer.errors)
		booking = serializer.save()

		self.assertTrue(GuestInfo.objects.filter(booking=booking).exists())

	def test_bkg_tc_013_update_updates_booking_fields(self):
		# TC ID: BKG-TC-013
		booking = Booking.objects.create(service_type=ServiceType.HOTEL, total_price=10.0)

		serializer = BookingSerializer(
			instance=booking,
			data={"total_price": 99.9, "final_price": 88.8},
			partial=True,
		)
		self.assertTrue(serializer.is_valid(), serializer.errors)
		serializer.save()

		booking.refresh_from_db()
		self.assertEqual(booking.total_price, 99.9)
		self.assertEqual(booking.final_price, 88.8)

	def test_bkg_tc_014_update_upserts_guest_info(self):
		# TC ID: BKG-TC-014
		booking = Booking.objects.create(service_type=ServiceType.HOTEL)
		GuestInfo.objects.create(
			booking=booking,
			full_name="Old Name",
			email="old@example.com",
			phone="0900111000",
		)

		serializer = BookingSerializer(
			instance=booking,
			data={
				"guest_info": {
					"full_name": "New Name",
					"email": "new@example.com",
					"phone": "0999888777",
					"country": "VN",
					"special_request": "Updated",
				}
			},
			partial=True,
		)
		self.assertTrue(serializer.is_valid(), serializer.errors)
		serializer.save()

		guest = GuestInfo.objects.get(booking=booking)
		self.assertEqual(guest.full_name, "New Name")
		self.assertEqual(guest.email, "new@example.com")

	def test_bkg_tc_015_to_representation_hides_irrelevant_fields_for_hotel(self):
		# TC ID: BKG-TC-015
		booking = Booking.objects.create(service_type=ServiceType.HOTEL, service_ref_ids=[])
		data = BookingSerializer(instance=booking).data
		self.assertNotIn("car_detail", data)
		self.assertNotIn("flight_detail", data)
		self.assertNotIn("activity_date_detail", data)

	def test_bkg_tc_016_to_representation_hides_irrelevant_fields_for_car(self):
		# TC ID: BKG-TC-016
		booking = Booking.objects.create(service_type=ServiceType.CAR, service_ref_ids=[])
		data = BookingSerializer(instance=booking).data
		self.assertNotIn("room_details", data)
		self.assertNotIn("flight_detail", data)
		self.assertNotIn("activity_date_detail", data)

	def test_bkg_tc_017_to_representation_hides_irrelevant_fields_for_flight(self):
		# TC ID: BKG-TC-017
		booking = Booking.objects.create(service_type=ServiceType.FLIGHT, service_ref_ids=[])
		data = BookingSerializer(instance=booking).data
		self.assertNotIn("room_details", data)
		self.assertNotIn("car_detail", data)
		self.assertNotIn("activity_date_detail", data)

	def test_bkg_tc_018_to_representation_hides_irrelevant_fields_for_activity(self):
		# TC ID: BKG-TC-018
		booking = Booking.objects.create(service_type=ServiceType.ACTIVITY, service_ref_ids=[])
		data = BookingSerializer(instance=booking).data
		self.assertNotIn("room_details", data)
		self.assertNotIn("car_detail", data)
		self.assertNotIn("flight_detail", data)


class BookingViewSetQuerysetTests(TestCase):
	def setUp(self):
		self.factory = APIRequestFactory()

		self.user1 = CustomUser.objects.create_user(
			username="query_user_1",
			email="query_user_1@example.com",
			password="pass12345",
		)
		self.user2 = CustomUser.objects.create_user(
			username="query_user_2",
			email="query_user_2@example.com",
			password="pass12345",
		)

		self.booking1 = Booking.objects.create(
			service_type=ServiceType.HOTEL,
			user=self.user1,
		)
		self.booking2 = Booking.objects.create(
			service_type=ServiceType.CAR,
			user=self.user2,
		)
		self.booking3 = Booking.objects.create(
			service_type=ServiceType.CAR,
			user=self.user1,
		)

		GuestInfo.objects.create(
			booking=self.booking2,
			full_name="Guest 2",
			email="guest2@example.com",
			phone="0900111222",
		)

	def _queryset(self, params=None):
		request = Request(self.factory.get("/api/bookings/", params or {}))
		view = BookingViewSet()
		view.request = request
		return view.get_queryset()

	def test_bkg_tc_019_get_queryset_orders_desc_by_id(self):
		# TC ID: BKG-TC-019
		qs = self._queryset()
		self.assertEqual(
			list(qs.values_list("id", flat=True)),
			[self.booking3.id, self.booking2.id, self.booking1.id],
		)

	def test_bkg_tc_020_get_queryset_filters_by_user_email(self):
		# TC ID: BKG-TC-020
		qs = self._queryset({"email": "query_user_1@example.com"})
		self.assertEqual(
			list(qs.values_list("id", flat=True)),
			[self.booking3.id, self.booking1.id],
		)

	def test_bkg_tc_021_get_queryset_filters_by_guest_email(self):
		# TC ID: BKG-TC-021
		qs = self._queryset({"email": "guest2@example.com"})
		self.assertEqual(list(qs.values_list("id", flat=True)), [self.booking2.id])

	def test_bkg_tc_022_get_queryset_filters_by_service_type(self):
		# TC ID: BKG-TC-022
		qs = self._queryset({"service_type": str(ServiceType.CAR)})
		self.assertEqual(
			list(qs.values_list("id", flat=True)),
			[self.booking3.id, self.booking2.id],
		)

	def test_bkg_tc_023_get_queryset_filters_by_email_and_service_type(self):
		# TC ID: BKG-TC-023
		qs = self._queryset(
			{
				"email": "query_user_1@example.com",
				"service_type": str(ServiceType.CAR),
			}
		)
		self.assertEqual(list(qs.values_list("id", flat=True)), [self.booking3.id])


class BookingViewSetCreateTests(TestCase):
	def setUp(self):
		self.factory = APIRequestFactory()
		self.customer = CustomUser.objects.create_user(
			username="booking_customer",
			email="booking_customer@example.com",
			password="pass12345",
		)

		self.busy_driver = CustomUser.objects.create_user(
			username="busy_driver",
			email="busy_driver@example.com",
			password="pass12345",
			role="driver",
			driver_status="busy",
		)
		self.busy_car = Car.objects.create(
			user=self.busy_driver,
			name="Busy Car",
			capacity=4,
			luggage=2,
			price_per_km=10000,
			avg_speed=40,
		)

		self.idle_driver = CustomUser.objects.create_user(
			username="idle_driver",
			email="idle_driver@example.com",
			password="pass12345",
			role="driver",
			driver_status="idle",
		)
		self.idle_car = Car.objects.create(
			user=self.idle_driver,
			name="Idle Car",
			capacity=4,
			luggage=2,
			price_per_km=12000,
			avg_speed=42,
		)

		country = Country.objects.create(name="VN Booking")
		city = City.objects.create(name="HCM Booking", country=country)
		activity = Activity.objects.create(
			name="Activity Booking",
			city=city,
			category="experience",
			total_time=2,
		)
		activity_package = ActivityPackage.objects.create(activity=activity, name="Package")

		self.activity_date = ActivityDate.objects.create(
			activity_package=activity_package,
			price_adult=100,
			price_child=50,
			max_participants=5,
			participants_available=5,
			date_launch=timezone.now() + timedelta(days=3),
		)

	def _post_create(self, payload):
		view = BookingViewSet.as_view({"post": "create"})
		request = self.factory.post("/api/bookings/", payload, format="json")
		force_authenticate(request, user=self.customer)
		return view(request)

	def test_bkg_tc_024_create_hotel_success_with_room_details(self):
		# TC ID: BKG-TC-024
		room_payload = {
			"room": 1001,
			"check_in": (timezone.now() + timedelta(days=1)).isoformat(),
			"check_out": (timezone.now() + timedelta(days=2)).isoformat(),
			"num_guests": 2,
			"room_type": "Deluxe",
			"room_count": 1,
		}

		with patch("bookings.views.RoomBookingDetailCreateSerializer") as mock_create_cls, patch(
			"bookings.views.RoomBookingDetailSerializer"
		) as mock_out_cls:
			mock_create = mock_create_cls.return_value
			mock_create.is_valid.return_value = True
			mock_detail = SimpleNamespace(id=901)
			mock_create.save.return_value = mock_detail
			mock_out_cls.return_value.data = {"id": 901}

			response = self._post_create(
				{
					"service_type": ServiceType.HOTEL,
					"room_details": room_payload,
				}
			)

		self.assertEqual(response.status_code, 201)
		self.assertTrue(response.data["isSuccess"])
		booking = Booking.objects.get(id=response.data["booking_id"])
		self.assertEqual(booking.service_ref_ids, [901])

	def test_bkg_tc_025_create_car_returns_400_when_car_missing(self):
		# TC ID: BKG-TC-025
		response = self._post_create(
			{
				"service_type": ServiceType.CAR,
				"car_detail": {"pickup_location": "No car id"},
			}
		)

		self.assertEqual(response.status_code, 400)
		self.assertFalse(response.data["isSuccess"])
		self.assertEqual(response.data["message"], "No car selected")

	def test_bkg_tc_026_create_car_returns_400_when_driver_busy(self):
		# TC ID: BKG-TC-026
		response = self._post_create(
			{
				"service_type": ServiceType.CAR,
				"car_detail": {"car": self.busy_car.id},
			}
		)

		self.assertEqual(response.status_code, 400)
		self.assertFalse(response.data["isSuccess"])
		self.assertEqual(response.data["message"], "Driver is busy")

	def test_bkg_tc_027_create_car_success_when_driver_idle(self):
		# TC ID: BKG-TC-027
		car_payload = {
			"car": self.idle_car.id,
			"pickup_location": "A",
			"dropoff_location": "B",
			"passenger_quantity_booking": 1,
		}

		with patch("bookings.views.CarBookingDetailCreateSerializer") as mock_create_cls, patch(
			"bookings.views.CarBookingDetailSerializer"
		) as mock_out_cls:
			mock_create = mock_create_cls.return_value
			mock_create.is_valid.return_value = True
			mock_detail = SimpleNamespace(id=902)
			mock_create.save.return_value = mock_detail
			mock_out_cls.return_value.data = {"id": 902}

			response = self._post_create(
				{
					"service_type": ServiceType.CAR,
					"car_detail": car_payload,
				}
			)

		self.assertEqual(response.status_code, 201)
		self.assertTrue(response.data["isSuccess"])
		booking = Booking.objects.get(id=response.data["booking_id"])
		self.assertEqual(booking.service_ref_ids, [902])

	def test_bkg_tc_028_create_flight_success(self):
		# TC ID: BKG-TC-028
		flight_payload = {
			"flight": 2001,
			"seat_class": "economy",
			"num_passengers": 1,
			"total_price": 1000000,
		}

		with patch("bookings.views.FlightBookingDetailCreateSerializer") as mock_create_cls, patch(
			"bookings.views.FlightBookingDetailSerializer"
		) as mock_out_cls:
			mock_create = mock_create_cls.return_value
			mock_create.is_valid.return_value = True
			mock_detail = SimpleNamespace(id=903)
			mock_create.save.return_value = mock_detail
			mock_out_cls.return_value.data = {"id": 903}

			response = self._post_create(
				{
					"service_type": ServiceType.FLIGHT,
					"flight_detail": flight_payload,
				}
			)

		self.assertEqual(response.status_code, 201)
		self.assertTrue(response.data["isSuccess"])
		booking = Booking.objects.get(id=response.data["booking_id"])
		self.assertEqual(booking.service_ref_ids, [903])

	def test_bkg_tc_029_create_activity_returns_400_when_activity_date_missing(self):
		# TC ID: BKG-TC-029
		response = self._post_create(
			{
				"service_type": ServiceType.ACTIVITY,
				"activity_date_detail": {
					"adult_quantity_booking": 1,
					"child_quantity_booking": 0,
				},
			}
		)

		self.assertEqual(response.status_code, 400)
		self.assertFalse(response.data["isSuccess"])
		self.assertEqual(response.data["message"], "No activity date selected")

	def test_bkg_tc_030_create_activity_returns_400_when_slot_unavailable(self):
		# TC ID: BKG-TC-030
		self.activity_date.participants_available = 1
		self.activity_date.save(update_fields=["participants_available"])

		response = self._post_create(
			{
				"service_type": ServiceType.ACTIVITY,
				"activity_date_detail": {
					"activity_date": self.activity_date.id,
					"adult_quantity_booking": 1,
					"child_quantity_booking": 1,
				},
			}
		)

		self.assertEqual(response.status_code, 400)
		self.assertFalse(response.data["isSuccess"])
		self.assertEqual(
			response.data["message"],
			"Unavailable slot for booking activity date",
		)

	def test_bkg_tc_031_create_activity_success_when_slot_available(self):
		# TC ID: BKG-TC-031
		activity_payload = {
			"activity_date": self.activity_date.id,
			"adult_quantity_booking": 1,
			"child_quantity_booking": 1,
			"price_adult": 100,
			"price_child": 50,
			"date_launch": (timezone.now() + timedelta(days=3)).isoformat(),
			"activity_package_name": "Package",
			"activity_name": "Activity Booking",
			"activity_image": "/media/a.png",
			"avg_price": 120,
			"avg_star": 4.5,
			"city_name": "HCM",
		}

		with patch("bookings.views.ActivityDateBookingCreateSerializer") as mock_create_cls, patch(
			"bookings.views.ActivityDateBookingDetailSerializer"
		) as mock_out_cls:
			mock_create = mock_create_cls.return_value
			mock_create.is_valid.return_value = True
			mock_detail = SimpleNamespace(id=904)
			mock_create.save.return_value = mock_detail
			mock_out_cls.return_value.data = {"id": 904}

			response = self._post_create(
				{
					"service_type": ServiceType.ACTIVITY,
					"activity_date_detail": activity_payload,
				}
			)

		self.assertEqual(response.status_code, 201)
		self.assertTrue(response.data["isSuccess"])
		booking = Booking.objects.get(id=response.data["booking_id"])
		self.assertEqual(booking.service_ref_ids, [904])

