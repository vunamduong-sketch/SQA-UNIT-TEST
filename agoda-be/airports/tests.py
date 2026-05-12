from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory, force_authenticate

from airports.models import Airport
from airports.serializers import AirportCreateSerializer, AirportSerializer
from airports.views import (
	AirportCreateView,
	AirportDeleteView,
	AirportDetailView,
	AirportListView,
	AirportPagination,
	AirportUpdateView,
)
from cities.models import City
from countries.models import Country


class AirportModelSerializerTests(TestCase):
	"""Test các chức năng của model Airport và Serializer"""
	
	def setUp(self):
		self.country = Country.objects.create(name="Vietnam")
		self.city = City.objects.create(name="Ha Noi", country=self.country)

	# TC ID: AIRP-TC-001
	def test_airp_tc_001_model_str_returns_name(self):
		# Kiểm tra: Phương thức __str__ của model Airport trả về tên sân bay
		# Mục đích: Đảm bảo hiển thị đúng tên sân bay khi in ra hoặc debug
		# Kỳ vọng: str(airport) trả về "Noi Bai"
		airport = Airport.objects.create(name="Noi Bai")
		self.assertEqual(str(airport), "Noi Bai")

	# TC ID: AIRP-TC-002
	def test_airp_tc_002_airport_serializer_returns_expected_fields(self):
		# Kiểm tra: Serializer trả về đầy đủ các trường của Airport kèm thông tin city lồng nhau
		# Mục đích: Đảm bảo response chứa đầy đủ thông tin sân bay và thành phố (nested serializer)
		# Kỳ vọng: Trả về code, name, city với city.name="Ha Noi"
		airport = Airport.objects.create(city=self.city, code="HAN", name="Noi Bai")
		data = AirportSerializer(airport).data

		self.assertEqual(data["code"], "HAN")
		self.assertEqual(data["name"], "Noi Bai")
		self.assertIn("city", data)
		self.assertEqual(data["city"]["name"], "Ha Noi")

	# TC ID: AIRP-TC-003
	def test_airp_tc_003_create_serializer_accepts_valid_city_id(self):
		# Kiểm tra: CreateSerializer chấp nhận city_id (primary key) thay vì nested object
		# Mục đích: Đảm bảo có thể tạo Airport bằng cách truyền city_id
		# Kỳ vọng: Validation thành công, airport.city_id = city.id
		serializer = AirportCreateSerializer(
			data={
				"city": self.city.id,
				"code": "DAD",
				"name": "Da Nang International Airport",
			}
		)

		self.assertTrue(serializer.is_valid(), serializer.errors)
		airport = serializer.save()
		self.assertEqual(airport.city_id, self.city.id)


class AirportPaginationAndListTests(TestCase):
	"""Test các chức năng phân trang, lọc và sắp xếp danh sách sân bay"""
	
	def setUp(self):
		self.factory = APIRequestFactory()
		self.country = Country.objects.create(name="Vietnam")
		self.city_ha_noi = City.objects.create(name="Ha Noi", country=self.country)
		self.city_da_nang = City.objects.create(name="Da Nang", country=self.country)

		Airport.objects.create(city=self.city_ha_noi, code="HAN", name="Noi Bai")
		Airport.objects.create(city=self.city_ha_noi, code="HNB", name="Ha Noi Backup")
		Airport.objects.create(city=self.city_da_nang, code="DAD", name="Da Nang Airport")

	# TC ID: AIRP-TC-004
	def test_airp_tc_004_get_page_size_parses_valid_params(self):
		# Kiểm tra: Phân tích các tham số pageSize, current, city_id từ request
		# Mục đích: Đảm bảo pagination đọc đúng các tham số từ query string
		# Kỳ vọng: page_size=20, currentPage=2, filters chứa city_id
		pagination = AirportPagination()
		request = Request(
			self.factory.get(
				"/api/airports/airports/",
				{"pageSize": "20", "current": "2", "city_id": str(self.city_ha_noi.id)},
			)
		)

		page_size = pagination.get_page_size(request)

		self.assertEqual(page_size, 20)
		self.assertEqual(pagination.currentPage, 2)
		self.assertEqual(pagination.filters.get("city_id"), str(self.city_ha_noi.id))
		pagination.filters.clear()

	# TC ID: AIRP-TC-005
	def test_airp_tc_005_get_page_size_fallbacks_for_invalid_params(self):
		# Kiểm tra: Sử dụng giá trị mặc định khi tham số không hợp lệ
		# Mục đích: Đảm bảo hệ thống không bị lỗi khi nhận tham số sai định dạng
		# Kỳ vọng: page_size=10 (mặc định), currentPage=1 (mặc định) khi tham số là "abc", "xyz"
		pagination = AirportPagination()
		request = Request(
			self.factory.get(
				"/api/airports/airports/",
				{"pageSize": "abc", "current": "xyz"},
			)
		)

		page_size = pagination.get_page_size(request)

		self.assertEqual(page_size, 10)
		self.assertEqual(pagination.currentPage, 1)

	# TC ID: AIRP-TC-006
	def test_airp_tc_006_get_paginated_response_returns_expected_meta(self):
		# Kiểm tra: Trả về response phân trang với đầy đủ metadata
		# Mục đích: Đảm bảo response chứa thông tin totalItems, currentPage, itemsPerPage, totalPages
		# Kỳ vọng: Trả về 200, isSuccess=True, meta chứa đầy đủ thông tin phân trang
		pagination = AirportPagination()
		pagination.page_size = 10
		pagination.currentPage = 1
		pagination.filters = {"city_id": self.city_ha_noi.id}

		response = pagination.get_paginated_response([{"id": 1}, {"id": 2}])

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(response.data["meta"]["totalItems"], 2)
		self.assertEqual(response.data["meta"]["currentPage"], 1)
		self.assertEqual(response.data["meta"]["itemsPerPage"], 10)
		self.assertEqual(response.data["meta"]["totalPages"], 1)
		self.assertEqual(pagination.filters, {})

	# TC ID: AIRP-TC-007
	def test_airp_tc_007_list_view_get_queryset_filters_by_city_id(self):
		# Kiểm tra: Lọc sân bay theo city_id
		# Mục đích: Đảm bảo chỉ trả về các sân bay thuộc thành phố được chỉ định
		# Kỳ vọng: Chỉ trả về sân bay của Ha Noi (HAN, HNB), không trả về của Da Nang
		view = AirportListView()
		view.request = Request(
			self.factory.get(
				"/api/airports/airports/",
				{
					"city_id": str(self.city_ha_noi.id),
					"current": "1",
					"pageSize": "10",
				},
			)
		)

		page = view.get_queryset()
		codes = set(page.object_list.values_list("code", flat=True))

		self.assertEqual(codes, {"HAN", "HNB"})

	# TC ID: AIRP-TC-008
	def test_airp_tc_008_list_view_get_queryset_filters_exact_code(self):
		# Kiểm tra: Lọc sân bay theo mã code chính xác
		# Mục đích: Đảm bảo có thể tìm kiếm sân bay theo mã code (exact match)
		# Kỳ vọng: Chỉ trả về sân bay có code="HAN"
		view = AirportListView()
		view.request = Request(
			self.factory.get(
				"/api/airports/airports/",
				{"code": "HAN", "current": "1", "pageSize": "10"},
			)
		)

		page = view.get_queryset()
		codes = list(page.object_list.values_list("code", flat=True))

		self.assertEqual(codes, ["HAN"])

	# TC ID: AIRP-TC-009
	def test_airp_tc_009_list_view_get_queryset_sorts_by_name(self):
		# Kiểm tra: Sắp xếp danh sách sân bay theo tên
		# Mục đích: Đảm bảo có thể sắp xếp theo name tăng/giảm dần
		# Kỳ vọng: Danh sách được sắp xếp theo name tăng dần khi sort="name-asc"
		Airport.objects.create(city=self.city_ha_noi, code="HAA", name="Airport A")
		Airport.objects.create(city=self.city_ha_noi, code="HZZ", name="Airport Z")

		view = AirportListView()
		view.request = Request(
			self.factory.get(
				"/api/airports/airports/",
				{
					"name": "Airport",
					"sort": "name-asc",
					"current": "1",
					"pageSize": "20",
				},
			)
		)

		page = view.get_queryset()
		names = list(page.object_list.values_list("name", flat=True))
		self.assertEqual(names, sorted(names))


class AirportCrudViewTests(TestCase):
	"""Test các chức năng CRUD của Airport API"""
	
	def setUp(self):
		self.factory = APIRequestFactory()
		self.user = get_user_model().objects.create_user(
			username="airport_tester",
			email="airport_tester@example.com",
			password="pass12345",
		)
		self.country = Country.objects.create(name="Vietnam")
		self.city = City.objects.create(name="Ha Noi", country=self.country)
		self.airport = Airport.objects.create(city=self.city, code="HAN", name="Noi Bai")

	# TC ID: AIRP-TC-010
	def test_airp_tc_010_detail_view_retrieve_returns_wrapped_response(self):
		# Kiểm tra: Lấy thông tin chi tiết một sân bay
		# Mục đích: Đảm bảo API trả về đúng thông tin sân bay với format chuẩn
		# Kỳ vọng: Trả về 200, isSuccess=True, data chứa thông tin sân bay
		view = AirportDetailView.as_view()
		request = self.factory.get(f"/api/airports/airports/{self.airport.id}/")
		response = view(request, pk=self.airport.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertIn("message", response.data)
		self.assertEqual(response.data["data"]["name"], "Noi Bai")

	# TC ID: AIRP-TC-011
	def test_airp_tc_011_create_view_creates_airport_successfully(self):
		# Kiểm tra: Tạo mới sân bay thành công
		# Mục đích: Đảm bảo có thể tạo sân bay mới với đầy đủ thông tin
		# Kỳ vọng: Trả về 200, isSuccess=True, sân bay được tạo trong database		
		view = AirportCreateView.as_view()
		payload = {
			"city": self.city.id,
			"code": "CXR",
			"name": "Cam Ranh Airport",
			"description": "Airport test",
		}

		request = self.factory.post("/api/airports/airports/create/", payload, format="json")
		force_authenticate(request, user=self.user)
		response = view(request)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertTrue(Airport.objects.filter(code="CXR").exists())

	# TC ID: AIRP-TC-012
	def test_airp_tc_012_update_view_updates_airport_successfully(self):
		# Kiểm tra: Cập nhật thông tin sân bay thành công
		# Mục đích: Đảm bảo có thể cập nhật một phần thông tin sân bay (partial update)
		# Kỳ vọng: Trả về 200, isSuccess=True, description được cập nhật
		view = AirportUpdateView.as_view()
		payload = {"description": "Updated description"}

		request = self.factory.patch(
			f"/api/airports/airports/{self.airport.id}/update/", payload, format="json"
		)
		force_authenticate(request, user=self.user)
		response = view(request, pk=self.airport.id)

		self.airport.refresh_from_db()
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(self.airport.description, "Updated description")

	# TC ID: AIRP-TC-013
	def test_airp_tc_013_delete_view_deletes_airport_successfully(self):
		# Kiểm tra: Xóa sân bay thành công
		# Mục đích: Đảm bảo có thể xóa sân bay khỏi hệ thống
		# Kỳ vọng: Trả về 200, isSuccess=True, sân bay bị xóa khỏi database
		view = AirportDeleteView.as_view()

		request = self.factory.delete(f"/api/airports/airports/{self.airport.id}/delete/")
		force_authenticate(request, user=self.user)
		response = view(request, pk=self.airport.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(response.data["data"], {})
		self.assertFalse(Airport.objects.filter(id=self.airport.id).exists())
