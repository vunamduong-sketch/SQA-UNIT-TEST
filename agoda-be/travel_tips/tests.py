from django.test import TestCase
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from cities.models import City
from countries.models import Country
from travel_tips.models import TravelTip
from travel_tips.serializers import TravelTipSerializer
from travel_tips.views import TravelTipListView


class TravelTipTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="Da Nang", country=country)

    def test_ttp_tc_001_model_str_returns_expected_text(self):
        # TC ID: TTP-TC-001
        tip = TravelTip.objects.create(city=self.city, title="Best time")
        self.assertEqual(str(tip), "Best time - Da Nang")

    def test_ttp_tc_002_serializer_returns_all_fields(self):
        # TC ID: TTP-TC-002
        tip = TravelTip.objects.create(
            city=self.city,
            title="Best time",
            content="Visit in spring",
            type="tips",
        )
        data = TravelTipSerializer(tip).data

        self.assertEqual(data["city"], self.city.id)
        self.assertEqual(data["title"], "Best time")
        self.assertEqual(data["content"], "Visit in spring")
        self.assertEqual(data["type"], "tips")
        self.assertIn("created_at", data)

    def test_ttp_tc_003_get_queryset_filters_by_city_id(self):
        # TC ID: TTP-TC-003
        TravelTip.objects.create(city=self.city, title="Tip 1")

        other_country = Country.objects.create(name="Japan")
        other_city = City.objects.create(name="Tokyo", country=other_country)
        TravelTip.objects.create(city=other_city, title="Tip 2")

        view = TravelTipListView()
        view.request = Request(
            self.factory.get("/api/travel-tips/by-city/", {"cityId": self.city.id})
        )

        queryset = view.get_queryset()

        self.assertEqual(queryset.count(), 1)
        self.assertEqual(queryset.first().city_id, self.city.id)

    def test_ttp_tc_004_get_queryset_orders_by_id_ascending(self):
        # TC ID: TTP-TC-004
        first = TravelTip.objects.create(city=self.city, title="Tip A")
        second = TravelTip.objects.create(city=self.city, title="Tip B")

        view = TravelTipListView()
        view.request = Request(
            self.factory.get("/api/travel-tips/by-city/", {"cityId": self.city.id})
        )

        queryset = view.get_queryset()
        ids = list(queryset.values_list("id", flat=True))

        self.assertEqual(ids, [first.id, second.id])

    def test_ttp_tc_005_get_queryset_returns_none_without_city_id(self):
        # TC ID: TTP-TC-005
        TravelTip.objects.create(city=self.city, title="Tip A")

        view = TravelTipListView()
        view.request = Request(self.factory.get("/api/travel-tips/by-city/"))

        queryset = view.get_queryset()

        self.assertEqual(queryset.count(), 0)
