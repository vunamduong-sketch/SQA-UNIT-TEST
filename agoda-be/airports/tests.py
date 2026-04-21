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
	def setUp(self):
		self.country = Country.objects.create(name="Vietnam")
		self.city = City.objects.create(name="Ha Noi", country=self.country)

	def test_airp_tc_001_model_str_returns_name(self):
		# TC ID: AIRP-TC-001
		airport = Airport.objects.create(name="Noi Bai")
		self.assertEqual(str(airport), "Noi Bai")

	def test_airp_tc_002_airport_serializer_returns_expected_fields(self):
		# TC ID: AIRP-TC-002
		airport = Airport.objects.create(city=self.city, code="HAN", name="Noi Bai")
		data = AirportSerializer(airport).data

		self.assertEqual(data["code"], "HAN")
		self.assertEqual(data["name"], "Noi Bai")
		self.assertIn("city", data)
		self.assertEqual(data["city"]["name"], "Ha Noi")

	def test_airp_tc_003_create_serializer_accepts_valid_city_id(self):
		# TC ID: AIRP-TC-003
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
	def setUp(self):
		self.factory = APIRequestFactory()
		self.country = Country.objects.create(name="Vietnam")
		self.city_ha_noi = City.objects.create(name="Ha Noi", country=self.country)
		self.city_da_nang = City.objects.create(name="Da Nang", country=self.country)

		Airport.objects.create(city=self.city_ha_noi, code="HAN", name="Noi Bai")
		Airport.objects.create(city=self.city_ha_noi, code="HNB", name="Ha Noi Backup")
		Airport.objects.create(city=self.city_da_nang, code="DAD", name="Da Nang Airport")

	def test_airp_tc_004_get_page_size_parses_valid_params(self):
		# TC ID: AIRP-TC-004
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

	def test_airp_tc_005_get_page_size_fallbacks_for_invalid_params(self):
		# TC ID: AIRP-TC-005
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

	def test_airp_tc_006_get_paginated_response_returns_expected_meta(self):
		# TC ID: AIRP-TC-006
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

	def test_airp_tc_007_list_view_get_queryset_filters_by_city_id(self):
		# TC ID: AIRP-TC-007
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

	def test_airp_tc_008_list_view_get_queryset_filters_exact_code(self):
		# TC ID: AIRP-TC-008
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

	def test_airp_tc_009_list_view_get_queryset_sorts_by_name(self):
		# TC ID: AIRP-TC-009
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

	def test_airp_tc_010_detail_view_retrieve_returns_wrapped_response(self):
		# TC ID: AIRP-TC-010
		view = AirportDetailView.as_view()
		request = self.factory.get(f"/api/airports/airports/{self.airport.id}/")
		response = view(request, pk=self.airport.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertIn("message", response.data)
		self.assertEqual(response.data["data"]["name"], "Noi Bai")

	def test_airp_tc_011_create_view_creates_airport_successfully(self):
		# TC ID: AIRP-TC-011
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

	def test_airp_tc_012_update_view_updates_airport_successfully(self):
		# TC ID: AIRP-TC-012
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

	def test_airp_tc_013_delete_view_deletes_airport_successfully(self):
		# TC ID: AIRP-TC-013
		view = AirportDeleteView.as_view()

		request = self.factory.delete(f"/api/airports/airports/{self.airport.id}/delete/")
		force_authenticate(request, user=self.user)
		response = view(request, pk=self.airport.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(response.data["data"], {})
		self.assertFalse(Airport.objects.filter(id=self.airport.id).exists())
