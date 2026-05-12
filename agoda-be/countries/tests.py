from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory, force_authenticate

from countries.models import Country
from countries.serializers import CountrySerializer
from countries.views import (
	CountryCreateView,
	CountryDeleteView,
	CountryDetailView,
	CountryListView,
	CountryPagination,
	CountryUpdateView,
)


class CountryModelAndSerializerTests(TestCase):
	"""Test các chức năng của model Country và CountrySerializer"""
	
	# TC ID: CTRY-TC-001
	def test_ctry_tc_001_model_str_returns_name(self):
		# Kiểm tra: Phương thức __str__ của model Country trả về tên quốc gia
		# Mục đích: Đảm bảo hiển thị đúng tên quốc gia khi in ra hoặc debug
		# Kỳ vọng: str(country) trả về "Vietnam"
		country = Country.objects.create(name="Vietnam")
		self.assertEqual(str(country), "Vietnam")

	# TC ID: CTRY-TC-002
	def test_ctry_tc_002_serializer_returns_all_fields(self):
		# Kiểm tra: Serializer trả về đầy đủ các trường của Country
		# Mục đích: Đảm bảo tất cả thông tin quốc gia được serialize đúng
		# Kỳ vọng: Trả về đầy đủ name, description, calling_code, image_handbook, created_at, id
		country = Country.objects.create(
			name="Singapore",
			description="Island nation",
			calling_code="+65",
			image_handbook="handbook.jpg",
		)
		data = CountrySerializer(country).data

		self.assertEqual(data["name"], "Singapore")
		self.assertEqual(data["description"], "Island nation")
		self.assertEqual(data["calling_code"], "+65")
		self.assertEqual(data["image_handbook"], "handbook.jpg")
		self.assertIn("created_at", data)
		self.assertIn("id", data)


class CountryPaginationTests(TestCase):
	"""Test các chức năng phân trang và lọc dữ liệu quốc gia"""
	
	def setUp(self):
		self.factory = APIRequestFactory()

	# TC ID: CTRY-TC-003
	def test_ctry_tc_003_get_page_size_parses_valid_params(self):
		# Kiểm tra: Phân tích các tham số pageSize, current, name từ request
		# Mục đích: Đảm bảo hệ thống đọc đúng các tham số phân trang từ URL
		# Kỳ vọng: page_size=20, currentPage=2, filters chứa name__icontains="vi"
		pagination = CountryPagination()
		request = Request(
			self.factory.get(
				"/api/countries/countries/",
				{"pageSize": "20", "current": "2", "name": "vi"},
			)
		)

		size = pagination.get_page_size(request)

		self.assertEqual(size, 20)
		self.assertEqual(pagination.currentPage, 2)
		self.assertEqual(pagination.filters.get("name__icontains"), "vi")
		pagination.filters.clear()

	# TC ID: CTRY-TC-004
	def test_ctry_tc_004_get_paginated_response_returns_expected_meta(self):
		# Kiểm tra: Trả về response phân trang với đầy đủ metadata
		# Mục đích: Đảm bảo response chứa thông tin totalItems, currentPage, itemsPerPage, totalPages
		# Kỳ vọng: Trả về 200, isSuccess=True, meta chứa đầy đủ thông tin phân trang
		Country.objects.create(name="Vietnam")
		Country.objects.create(name="Vietland")

		pagination = CountryPagination()
		pagination.page_size = 10
		pagination.currentPage = 1
		pagination.filters = {"name__icontains": "vi"}

		response = pagination.get_paginated_response([{"id": 1}, {"id": 2}])

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(response.data["meta"]["totalItems"], 2)
		self.assertEqual(response.data["meta"]["currentPage"], 1)
		self.assertEqual(response.data["meta"]["itemsPerPage"], 10)
		self.assertEqual(response.data["meta"]["totalPages"], 1)
		self.assertEqual(response.data["data"], [{"id": 1}, {"id": 2}])
		self.assertEqual(pagination.filters, {})


class CountryViewTests(TestCase):
	"""Test các chức năng CRUD của Country API"""
	
	def setUp(self):
		self.factory = APIRequestFactory()
		self.user = get_user_model().objects.create_user(
			username="country_tester",
			email="country_tester@example.com",
			password="pass12345",
		)

	# TC ID: CTRY-TC-005
	def test_ctry_tc_005_get_queryset_filters_and_sorts(self):
		# Kiểm tra: Lọc và sắp xếp danh sách quốc gia
		# Mục đích: Đảm bảo có thể lọc theo tên và sắp xếp theo thứ tự tăng/giảm dần
		# Kỳ vọng: Chỉ trả về quốc gia có tên chứa "vi", được sắp xếp theo name tăng dần		
		Country.objects.create(name="Vietnam")
		Country.objects.create(name="Vietland")
		Country.objects.create(name="Japan")

		view = CountryListView()
		view.request = Request(
			self.factory.get(
				"/api/countries/countries/",
				{"name": "vi", "sort": "name-asc", "current": "1", "pageSize": "10"},
			)
		)

		page = view.get_queryset()
		names = [item.name for item in page.object_list]

		self.assertEqual(names, sorted(names))
		self.assertTrue(all("vi" in name.lower() for name in names))

	# TC ID: CTRY-TC-006
	def test_ctry_tc_006_retrieve_returns_wrapped_response(self):
		# Kiểm tra: Lấy thông tin chi tiết một quốc gia
		# Mục đích: Đảm bảo API trả về đúng thông tin quốc gia với format chuẩn
		# Kỳ vọng: Trả về 200, isSuccess=True, data chứa thông tin quốc gia		
		country = Country.objects.create(name="Thailand")
		view = CountryDetailView.as_view()

		request = self.factory.get(f"/api/countries/countries/{country.id}/")
		response = view(request, pk=country.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertIn("message", response.data)
		self.assertEqual(response.data["data"]["name"], "Thailand")

	# TC ID: CTRY-TC-007
	def test_ctry_tc_007_create_creates_country_successfully(self):
		# Kiểm tra: Tạo mới quốc gia thành công
		# Mục đích: Đảm bảo có thể tạo quốc gia mới với đầy đủ thông tin
		# Kỳ vọng: Trả về 200, isSuccess=True, quốc gia được tạo trong database
		view = CountryCreateView.as_view()
		payload = {
			"name": "Laos",
			"description": "Neighbor country",
			"calling_code": "+856",
		}

		request = self.factory.post("/api/countries/countries/create/", payload, format="json")
		force_authenticate(request, user=self.user)
		response = view(request)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertTrue(Country.objects.filter(name="Laos").exists())

	# TC ID: CTRY-TC-008
	def test_ctry_tc_008_update_updates_country_with_partial_payload(self):
		# Kiểm tra: Cập nhật một phần thông tin quốc gia (partial update)
		# Mục đích: Đảm bảo có thể cập nhật chỉ một số trường mà không cần gửi tất cả
		# Kỳ vọng: Trả về 200, isSuccess=True, chỉ trường description được cập nhật
		country = Country.objects.create(name="Indonesia", description="Old")
		view = CountryUpdateView.as_view()
		payload = {"description": "Updated"}

		request = self.factory.patch(
			f"/api/countries/countries/{country.id}/update/", payload, format="json"
		)
		force_authenticate(request, user=self.user)
		response = view(request, pk=country.id)

		country.refresh_from_db()
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(country.description, "Updated")

	# TC ID: CTRY-TC-009
	def test_ctry_tc_009_destroy_deletes_country_successfully(self):
		# Kiểm tra: Xóa quốc gia thành công
		# Mục đích: Đảm bảo có thể xóa quốc gia khỏi hệ thống
		# Kỳ vọng: Trả về 200, isSuccess=True, quốc gia bị xóa khỏi database
		country = Country.objects.create(name="Brunei")
		view = CountryDeleteView.as_view()

		request = self.factory.delete(f"/api/countries/countries/{country.id}/delete/")
		force_authenticate(request, user=self.user)
		response = view(request, pk=country.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(response.data["data"], {})
		self.assertFalse(Country.objects.filter(id=country.id).exists())
