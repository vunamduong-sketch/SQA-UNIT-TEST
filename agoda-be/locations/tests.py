from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory

from airports.models import Airport
from cities.models import City
from countries.models import Country
from hotels.models import Hotel
from locations.views import LocationSuggestionsView


class LocationSuggestionsTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.country = Country.objects.create(name="Vietnam")

    def test_loc_tc_001_returns_empty_results_when_q_missing(self):
        # TC ID: LOC-TC-001
        view = LocationSuggestionsView.as_view()
        request = self.factory.get("/api/locations/suggestions/", {"type": "hotel"})

        response = view(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    def test_loc_tc_002_returns_hotel_and_city_suggestions_for_hotel_type(self):
        # TC ID: LOC-TC-002
        city = City.objects.create(name="Hotel City", country=self.country)
        Airport.objects.create(city=city, code="HCT", name="Hotel City Airport")
        Hotel.objects.create(name="Hotel One", city=city)

        view = LocationSuggestionsView.as_view()
        request = self.factory.get(
            "/api/locations/suggestions/",
            {"q": "hotel", "type": "hotel"},
        )

        response = view(request)
        types = {item["type"] for item in response.data["results"]}

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("hotel", types)
        self.assertIn("city", types)

    def test_loc_tc_003_homestay_behaves_like_hotel_branch(self):
        # TC ID: LOC-TC-003
        city = City.objects.create(name="Homestay City", country=self.country)
        Airport.objects.create(city=city, code="HMS", name="Homestay Airport")
        Hotel.objects.create(name="Homestay Place", city=city)

        view = LocationSuggestionsView.as_view()
        request = self.factory.get(
            "/api/locations/suggestions/",
            {"q": "home", "type": "homestay"},
        )

        response = view(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data["results"]), 0)
        self.assertTrue(any(item["type"] == "hotel" for item in response.data["results"]))

    def test_loc_tc_004_returns_airport_and_city_for_flight_type(self):
        # TC ID: LOC-TC-004
        city = City.objects.create(name="Hanoi", country=self.country)
        Airport.objects.create(city=city, code="HAN", name="Noi Bai")

        view = LocationSuggestionsView.as_view()
        request = self.factory.get(
            "/api/locations/suggestions/",
            {"q": "han", "type": "flight"},
        )

        response = view(request)
        types = {item["type"] for item in response.data["results"]}

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("airport", types)

    def test_loc_tc_005_returns_empty_for_unsupported_type(self):
        # TC ID: LOC-TC-005
        city = City.objects.create(name="Other City", country=self.country)
        Hotel.objects.create(name="Other Hotel", city=city)

        view = LocationSuggestionsView.as_view()
        request = self.factory.get(
            "/api/locations/suggestions/",
            {"q": "other", "type": "other"},
        )

        response = view(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    def test_loc_tc_006_city_id_mapping_prioritizes_airport_then_fallback_city_id(self):
        # TC ID: LOC-TC-006
        city_with_airport = City.objects.create(name="Alpha City", country=self.country)
        city_without_airport = City.objects.create(name="Beta City", country=self.country)

        airport = Airport.objects.create(city=city_with_airport, code="ALP", name="Alpha Airport")
        hotel_with_airport = Hotel.objects.create(name="Map Hotel A", city=city_with_airport)
        hotel_without_airport = Hotel.objects.create(name="Map Hotel B", city=city_without_airport)

        view = LocationSuggestionsView.as_view()
        request = self.factory.get(
            "/api/locations/suggestions/",
            {"q": "Map Hotel", "type": "hotel"},
        )

        response = view(request)
        hotel_results = [item for item in response.data["results"] if item["type"] == "hotel"]
        hotel_map = {item["id"]: item for item in hotel_results}

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(hotel_map[hotel_with_airport.id]["city_id"], airport.id)
        self.assertEqual(hotel_map[hotel_without_airport.id]["city_id"], city_without_airport.id)
