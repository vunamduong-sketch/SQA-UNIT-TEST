from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory

from cities.models import City
from countries.models import Country
from hotels.models import Hotel
from travelguide.models import TravelGuide
from travelguide.serializers import TravelGuideSerializer
from travelguide.views import TravelGuideByHotelView


class TravelGuideTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="Da Nang", country=country)
        self.hotel = Hotel.objects.create(name="Hotel A", city=self.city)

    def test_tgd_tc_001_model_str_returns_expected_text(self):
        # TC ID: TGD-TC-001
        guide = TravelGuide.objects.create(
            hotel=self.hotel,
            title="Guide A",
            content="Guide content",
        )
        self.assertEqual(str(guide), "Guide A - Hotel A")

    def test_tgd_tc_002_serializer_returns_expected_schema(self):
        # TC ID: TGD-TC-002
        guide = TravelGuide.objects.create(
            hotel=self.hotel,
            title="Guide A",
            content="Guide content",
        )
        data = TravelGuideSerializer(guide).data

        self.assertEqual(data["hotel"], self.hotel.id)
        self.assertEqual(data["title"], "Guide A")
        self.assertEqual(data["content"], "Guide content")
        self.assertIn("created_at", data)

    def test_tgd_tc_003_get_queryset_filters_by_hotel_id(self):
        # TC ID: TGD-TC-003
        target = TravelGuide.objects.create(
            hotel=self.hotel,
            title="Guide A",
            content="A",
        )

        other_hotel = Hotel.objects.create(name="Hotel B", city=self.city)
        TravelGuide.objects.create(hotel=other_hotel, title="Guide B", content="B")

        view = TravelGuideByHotelView()
        view.kwargs = {"hotel_id": self.hotel.id}

        queryset = view.get_queryset()

        self.assertEqual(queryset.count(), 1)
        self.assertEqual(queryset.first().id, target.id)

    def test_tgd_tc_004_list_returns_wrapped_response(self):
        # TC ID: TGD-TC-004
        TravelGuide.objects.create(hotel=self.hotel, title="Guide A", content="A")
        view = TravelGuideByHotelView.as_view()

        request = self.factory.get(f"/api/travel-guides/by-hotel/{self.hotel.id}/")
        response = view(request, hotel_id=self.hotel.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["isSuccess"])
        self.assertIn("message", response.data)
        self.assertIn("data", response.data)

    def test_tgd_tc_005_list_returns_empty_when_no_guide(self):
        # TC ID: TGD-TC-005
        view = TravelGuideByHotelView.as_view()

        request = self.factory.get(f"/api/travel-guides/by-hotel/{self.hotel.id}/")
        response = view(request, hotel_id=self.hotel.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"], [])
