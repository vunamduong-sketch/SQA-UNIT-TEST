from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory, force_authenticate

from cities.models import City
from cities.serializers import CityCreateSerializer, CitySerializer
from cities.views import (
	CityCreateView,
	CityDeleteView,
	CityDetailView,
	CityListView,
	CityPagination,
	CityUpdateView,
	TopAbroadCitiesView,
	TopVietnamCitiesView,
)
from countries.models import Country


class CityModelAndSerializerTests(TestCase):
	"""Test các chức năng của model City và Serializer"""
	
	def setUp(self):
		self.country = Country.objects.create(name="Vietnam")

	# TC ID: CITY-TC-001
	def test_city_tc_001_model_str_returns_city_and_country(self):
		# Kiểm tra: Phương thức __str__ của model City trả về "Tên thành phố, Tên quốc gia"
		# Mục đích: Đảm bảo hiển thị đầy đủ thông tin thành phố và quốc gia khi in ra
		# Kỳ vọng: str(city) trả về "Da Nang, Vietnam"		
		city = City.objects.create(name="Da Nang", country=self.country)
		self.assertEqual(str(city), "Da Nang, Vietnam")

	# TC ID: CITY-TC-002
	def test_city_tc_002_serializer_contains_nested_country(self):
		# Kiểm tra: Serializer trả về thông tin thành phố kèm thông tin quốc gia lồng nhau
		# Mục đích: Đảm bảo response chứa đầy đủ thông tin quốc gia (nested serializer)
		# Kỳ vọng: data chứa trường "country" với country.name = "Vietnam"		
		city = City.objects.create(name="Ha Noi", country=self.country)
		data = CitySerializer(city).data

		self.assertIn("country", data)
		self.assertEqual(data["country"]["name"], "Vietnam")

	# TC ID: CITY-TC-003
	def test_city_tc_003_create_serializer_validates_primary_key_country(self):
		# Kiểm tra: CreateSerializer chấp nhận country_id (primary key) thay vì nested object
		# Mục đích: Đảm bảo có thể tạo thành phố bằng cách truyền country_id
		# Kỳ vọng: Validation thành công, city.country_id = country.id
		serializer = CityCreateSerializer(
			data={
				"name": "Nha Trang",
				"description": "Beach city",
				"image": "nha-trang.jpg",
				"image_handbook": "nha-trang-hb.jpg",
				"country": self.country.id,
			}
		)

		self.assertTrue(serializer.is_valid(), serializer.errors)
		instance = serializer.save()
		self.assertEqual(instance.country_id, self.country.id)


class CityPaginationAndListViewTests(TestCase):
	"""Test các chức năng phân trang, lọc và sắp xếp danh sách thành phố"""
	
	def setUp(self):
		self.factory = APIRequestFactory()
		self.country_vn = Country.objects.create(name="Vietnam")
		self.country_jp = Country.objects.create(name="Japan")

		self.city_hanoi = City.objects.create(name="Ha Noi", country=self.country_vn)
		self.city_halong = City.objects.create(name="Ha Long", country=self.country_vn)
		self.city_tokyo = City.objects.create(name="Tokyo", country=self.country_jp)

	# TC ID: CITY-TC-004
	def test_city_tc_004_get_page_size_parses_valid_values(self):
		# Kiểm tra: Phân tích các tham số pageSize, current, country_id từ request
		# Mục đích: Đảm bảo pagination đọc đúng các tham số từ query string
		# Kỳ vọng: page_size=15, currentPage=3, filters chứa country_id
		pagination = CityPagination()
		request = Request(
			self.factory.get(
				"/api/cities/cities/",
				{
					"pageSize": "15",
					"current": "3",
					"country_id": str(self.country_vn.id),
				},
			)
		)

		page_size = pagination.get_page_size(request)

		self.assertEqual(page_size, 15)
		self.assertEqual(pagination.currentPage, 3)
		self.assertEqual(pagination.filters.get("country_id"), str(self.country_vn.id))
		pagination.filters.clear()

	# TC ID: CITY-TC-005
	def test_city_tc_005_get_paginated_response_returns_meta(self):
		# Kiểm tra: Trả về response phân trang với đầy đủ metadata
		# Mục đích: Đảm bảo response chứa thông tin totalItems, currentPage, itemsPerPage, totalPages
		# Kỳ vọng: Trả về 200, isSuccess=True, meta chứa đầy đủ thông tin phân trang
		pagination = CityPagination()
		pagination.page_size = 10
		pagination.currentPage = 1
		pagination.filters = {"country_id": self.country_vn.id}

		response = pagination.get_paginated_response([
			{"id": self.city_hanoi.id},
			{"id": self.city_halong.id}
		])

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(response.data["meta"]["totalItems"], 2)
		self.assertEqual(response.data["meta"]["currentPage"], 1)
		self.assertEqual(response.data["meta"]["itemsPerPage"], 10)
		self.assertEqual(response.data["meta"]["totalPages"], 1)
		self.assertEqual(pagination.filters, {})

	# TC ID: CITY-TC-006
	def test_city_tc_006_get_queryset_filters_by_country_and_keyword(self):
		# Kiểm tra: Lọc thành phố theo country_id và tên thành phố
		# Mục đích: Đảm bảo có thể lọc thành phố theo quốc gia và tên (tìm kiếm gần đúng)
		# Kỳ vọng: Chỉ trả về các thành phố của Vietnam có tên chứa "ha"
		view = CityListView()
		view.request = Request(
			self.factory.get(
				"/api/cities/cities/",
				{
					"country_id": str(self.country_vn.id),
					"name": "ha",
					"current": "1",
					"pageSize": "10",
				},
			)
		)

		page = view.get_queryset()
		names = [obj.name for obj in page.object_list]

		self.assertEqual(sorted(names), ["Ha Long", "Ha Noi"])

	# TC ID: CITY-TC-007
	def test_city_tc_007_get_queryset_returns_none_on_invalid_country_id(self):
		# Kiểm tra: Trả về queryset rỗng khi country_id không hợp lệ
		# Mục đích: Đảm bảo xử lý an toàn khi nhận tham số sai định dạng
		# Kỳ vọng: queryset.count() = 0 khi country_id = "abc"
		view = CityListView()
		view.request = Request(
			self.factory.get(
				"/api/cities/cities/",
				{"country_id": "abc", "current": "1", "pageSize": "10"},
			)
		)

		queryset = view.get_queryset()

		self.assertEqual(queryset.count(), 0)

	# TC ID: CITY-TC-008
	def test_city_tc_008_get_queryset_sorts_by_sort_param(self):
		# Kiểm tra: Sắp xếp danh sách thành phố theo tham số sort
		# Mục đích: Đảm bảo có thể sắp xếp theo name tăng/giảm dần
		# Kỳ vọng: Danh sách được sắp xếp theo name tăng dần khi sort="name-asc"
		City.objects.create(name="A City", country=self.country_vn)
		City.objects.create(name="B City", country=self.country_vn)

		view = CityListView()
		view.request = Request(
			self.factory.get(
				"/api/cities/cities/",
				{"sort": "name-asc", "current": "1", "pageSize": "20"},
			)
		)

		page = view.get_queryset()
		names = [obj.name for obj in page.object_list]

		self.assertEqual(names, sorted(names))


class CityCrudAndTopViewsTests(TestCase):
	"""Test các chức năng CRUD và danh sách thành phố nổi bật"""
	
	def setUp(self):
		self.factory = APIRequestFactory()
		self.user = get_user_model().objects.create_user(
			username="city_tester",
			email="city_tester@example.com",
			password="pass12345",
		)

		self.country_vn = Country.objects.create(name="Vietnam")
		self.country_jp = Country.objects.create(name="Japan")

		self.city_vn = City.objects.create(name="Da Nang", country=self.country_vn)
		self.city_jp = City.objects.create(name="Tokyo", country=self.country_jp)

	# TC ID: CITY-TC-009
	def test_city_tc_009_retrieve_returns_wrapped_response(self):
		# Kiểm tra: Lấy thông tin chi tiết một thành phố
		# Mục đích: Đảm bảo API trả về đúng thông tin thành phố với format chuẩn
		# Kỳ vọng: Trả về 200, isSuccess=True, data chứa thông tin thành phố
		view = CityDetailView.as_view()
		request = self.factory.get(f"/api/cities/cities/{self.city_vn.id}/")

		response = view(request, pk=self.city_vn.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(response.data["data"]["name"], "Da Nang")

	# TC ID: CITY-TC-010
	def test_city_tc_010_create_creates_city_successfully(self):
		# Kiểm tra: Tạo mới thành phố thành công
		# Mục đích: Đảm bảo có thể tạo thành phố mới với đầy đủ thông tin
		# Kỳ vọng: Trả về 200, isSuccess=True, thành phố được tạo trong database		
		view = CityCreateView.as_view()
		payload = {
			"name": "Can Tho",
			"description": "Mekong city",
			"image": "can-tho.jpg",
			"image_handbook": "can-tho-hb.jpg",
			"country": self.country_vn.id,
		}

		request = self.factory.post("/api/cities/cities/create/", payload, format="json")
		force_authenticate(request, user=self.user)
		response = view(request)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertTrue(City.objects.filter(name="Can Tho").exists())

	# TC ID: CITY-TC-011
	def test_city_tc_011_update_updates_city_successfully(self):
		# Kiểm tra: Cập nhật thông tin thành phố thành công
		# Mục đích: Đảm bảo có thể cập nhật một phần thông tin thành phố (partial update)
		# Kỳ vọng: Trả về 200, isSuccess=True, description được cập nhật
		view = CityUpdateView.as_view()
		payload = {"description": "Updated desc"}

		request = self.factory.patch(
			f"/api/cities/cities/{self.city_vn.id}/update/", payload, format="json"
		)
		force_authenticate(request, user=self.user)
		response = view(request, pk=self.city_vn.id)

		self.city_vn.refresh_from_db()
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(self.city_vn.description, "Updated desc")

	# TC ID: CITY-TC-012
	def test_city_tc_012_destroy_deletes_city_successfully(self):
		# Kiểm tra: Xóa thành phố thành công
		# Mục đích: Đảm bảo có thể xóa thành phố khỏi hệ thống
		# Kỳ vọng: Trả về 200, isSuccess=True, thành phố bị xóa khỏi database
		city = City.objects.create(name="Hue", country=self.country_vn)
		view = CityDeleteView.as_view()

		request = self.factory.delete(f"/api/cities/cities/{city.id}/delete/")
		force_authenticate(request, user=self.user)
		response = view(request, pk=city.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertFalse(City.objects.filter(id=city.id).exists())

	# TC ID: CITY-TC-013
	def test_city_tc_013_top_vietnam_returns_only_vietnam_cities(self):
		# Kiểm tra: Lấy danh sách thành phố nổi bật ở Việt Nam
		# Mục đích: Đảm bảo chỉ trả về các thành phố Việt Nam kèm số lượng booking và khách sạn
		# Kỳ vọng: Trả về 200, isSuccess=True, tất cả thành phố thuộc Vietnam, có bookingCount và hotelCount
		view = TopVietnamCitiesView.as_view()
		request = self.factory.get("/api/cities/cities/top-vietnam/", {"limit": 5})

		response = view(request)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertIn("data", response.data)
		for item in response.data["data"]:
			self.assertIn(item["country"]["name"], ["Vietnam", "Việt Nam"])
			self.assertIn("bookingCount", item)
			self.assertIn("hotelCount", item)

	# TC ID: CITY-TC-014
	def test_city_tc_014_top_abroad_returns_non_vietnam_cities(self):
		# Kiểm tra: Lấy danh sách thành phố nổi bật nước ngoài (không phải Việt Nam)
		# Mục đích: Đảm bảo chỉ trả về các thành phố không thuộc Việt Nam kèm số lượng booking và khách sạn
		# Kỳ vọng: Trả về 200, isSuccess=True, không có thành phố nào thuộc Vietnam, có bookingCount và hotelCount		
		view = TopAbroadCitiesView.as_view()
		request = self.factory.get("/api/cities/cities/top-abroad/", {"limit": 5})

		response = view(request)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertIn("data", response.data)
		for item in response.data["data"]:
			self.assertNotIn(item["country"]["name"], ["Vietnam", "Việt Nam"])
			self.assertIn("bookingCount", item)
			self.assertIn("hotelCount", item)
