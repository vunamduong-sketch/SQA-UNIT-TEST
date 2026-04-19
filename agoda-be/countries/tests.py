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
	def test_ctry_tc_001_model_str_returns_name(self):
		# TC ID: CTRY-TC-001
		country = Country.objects.create(name="Vietnam")
		self.assertEqual(str(country), "Vietnam")

	def test_ctry_tc_002_serializer_returns_all_fields(self):
		# TC ID: CTRY-TC-002
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
	def setUp(self):
		self.factory = APIRequestFactory()

	def test_ctry_tc_003_get_page_size_parses_valid_params(self):
		# TC ID: CTRY-TC-003
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

	def test_ctry_tc_004_get_paginated_response_returns_expected_meta(self):
		# TC ID: CTRY-TC-004
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
	def setUp(self):
		self.factory = APIRequestFactory()
		self.user = get_user_model().objects.create_user(
			username="country_tester",
			email="country_tester@example.com",
			password="pass12345",
		)

	def test_ctry_tc_005_get_queryset_filters_and_sorts(self):
		# TC ID: CTRY-TC-005
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

	def test_ctry_tc_006_retrieve_returns_wrapped_response(self):
		# TC ID: CTRY-TC-006
		country = Country.objects.create(name="Thailand")
		view = CountryDetailView.as_view()

		request = self.factory.get(f"/api/countries/countries/{country.id}/")
		response = view(request, pk=country.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertIn("message", response.data)
		self.assertEqual(response.data["data"]["name"], "Thailand")

	def test_ctry_tc_007_create_creates_country_successfully(self):
		# TC ID: CTRY-TC-007
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

	def test_ctry_tc_008_update_updates_country_with_partial_payload(self):
		# TC ID: CTRY-TC-008
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

	def test_ctry_tc_009_destroy_deletes_country_successfully(self):
		# TC ID: CTRY-TC-009
		country = Country.objects.create(name="Brunei")
		view = CountryDeleteView.as_view()

		request = self.factory.delete(f"/api/countries/countries/{country.id}/delete/")
		force_authenticate(request, user=self.user)
		response = view(request, pk=country.id)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["isSuccess"])
		self.assertEqual(response.data["data"], {})
		self.assertFalse(Country.objects.filter(id=country.id).exists())
