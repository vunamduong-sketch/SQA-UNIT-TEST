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
	def setUp(self):
		self.country = Country.objects.create(name="Vietnam")

	def test_city_tc_001_model_str_returns_city_and_country(self):
		# TC ID: CITY-TC-001
		city = City.objects.create(name="Da Nang", country=self.country)
		self.assertEqual(str(city), "Da Nang, Vietnam")

	def test_city_tc_002_serializer_contains_nested_country(self):
		# TC ID: CITY-TC-002
		city = City.objects.create(name="Ha Noi", country=self.country)
		data = CitySerializer(city).data

		self.assertIn("country", data)
		self.assertEqual(data["country"]["name"], "Vietnam")

	def test_city_tc_003_create_serializer_validates_primary_key_country(self):
		# TC ID: CITY-TC-003
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
	def setUp(self):
		self.factory = APIRequestFactory()
		self.country_vn = Country.objects.create(name="Vietnam")
		self.country_jp = Country.objects.create(name="Japan")

		self.city_hanoi = City.objects.create(name="Ha Noi", country=self.country_vn)
		self.city_halong = City.objects.create(name="Ha Long", country=self.country_vn)
		self.city_tokyo = City.objects.create(name="Tokyo", country=self.country_jp)

	def test_city_tc_004_get_page_size_parses_valid_values(self):
		# TC ID: CITY-TC-004
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

	def test_city_tc_005_get_paginated_response_returns_meta(self):
		# TC ID: CITY-TC-005
		pagination = CityPagination()
		pagination.page_size = 10
		pagination.currentPage = 1
		pagination.filters = {"country_id": self.country_vn.id}

		response = pagination.get_paginated_response([{"id": self.city_hanoi.id}])

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(response.data["meta"]["totalItems"], 2)
		self.assertEqual(response.data["meta"]["currentPage"], 1)
		self.assertEqual(response.data["meta"]["itemsPerPage"], 10)
		self.assertEqual(response.data["meta"]["totalPages"], 1)
		self.assertEqual(pagination.filters, {})

	def test_city_tc_006_get_queryset_filters_by_country_and_keyword(self):
		# TC ID: CITY-TC-006
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

	def test_city_tc_007_get_queryset_returns_none_on_invalid_country_id(self):
		# TC ID: CITY-TC-007
		view = CityListView()
		view.request = Request(
			self.factory.get(
				"/api/cities/cities/",
				{"country_id": "abc", "current": "1", "pageSize": "10"},
			)
		)

		queryset = view.get_queryset()

		self.assertEqual(queryset.count(), 0)

	def test_city_tc_008_get_queryset_sorts_by_sort_param(self):
		# TC ID: CITY-TC-008
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

	def test_city_tc_009_retrieve_returns_wrapped_response(self):
		# TC ID: CITY-TC-009
		view = CityDetailView.as_view()
		request = self.factory.get(f"/api/cities/cities/{self.city_vn.id}/")

		response = view(request, pk=self.city_vn.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(response.data["data"]["name"], "Da Nang")

	def test_city_tc_010_create_creates_city_successfully(self):
		# TC ID: CITY-TC-010
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

	def test_city_tc_011_update_updates_city_successfully(self):
		# TC ID: CITY-TC-011
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

	def test_city_tc_012_destroy_deletes_city_successfully(self):
		# TC ID: CITY-TC-012
		city = City.objects.create(name="Hue", country=self.country_vn)
		view = CityDeleteView.as_view()

		request = self.factory.delete(f"/api/cities/cities/{city.id}/delete/")
		force_authenticate(request, user=self.user)
		response = view(request, pk=city.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertFalse(City.objects.filter(id=city.id).exists())

	def test_city_tc_013_top_vietnam_returns_only_vietnam_cities(self):
		# TC ID: CITY-TC-013
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

	def test_city_tc_014_top_abroad_returns_non_vietnam_cities(self):
		# TC ID: CITY-TC-014
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
