from django.test import TestCase
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from cities.models import City
from countries.models import Country
from quick_info.models import QuickInfo
from quick_info.serializers import QuickInfoCreateSerializer, QuickInfoSerializer
from quick_info.views import QuickInfoByCityView


class QuickInfoTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="Hanoi", country=self.country)

    def test_qif_tc_001_model_str_returns_expected_text(self):
        # TC ID: QIF-TC-001
        item = QuickInfo.objects.create(label="Price", value="100", city=self.city)
        self.assertEqual(str(item), "Price - Hanoi")

    def test_qif_tc_002_serializer_contains_nested_city(self):
        # TC ID: QIF-TC-002
        item = QuickInfo.objects.create(label="Price", value="100", city=self.city)
        data = QuickInfoSerializer(item).data

        self.assertIn("city", data)
        self.assertEqual(data["city"]["name"], "Hanoi")
        self.assertEqual(data["city"]["country"]["name"], "Vietnam")

    def test_qif_tc_003_create_serializer_accepts_valid_city_id(self):
        # TC ID: QIF-TC-003
        serializer = QuickInfoCreateSerializer(
            data={
                "label": "Price",
                "value": "120",
                "highlight": True,
                "city": self.city.id,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        instance = serializer.save()
        self.assertEqual(instance.city_id, self.city.id)

    def test_qif_tc_004_get_queryset_filters_by_city_id(self):
        # TC ID: QIF-TC-004
        other_country = Country.objects.create(name="Japan")
        other_city = City.objects.create(name="Tokyo", country=other_country)

        target = QuickInfo.objects.create(label="Price", value="100", city=self.city)
        QuickInfo.objects.create(label="Area", value="Shibuya", city=other_city)

        view = QuickInfoByCityView()
        view.request = Request(
            self.factory.get("/api/quick-info/by-city/", {"city_id": self.city.id})
        )

        queryset = view.get_queryset()

        self.assertEqual(queryset.count(), 1)
        self.assertEqual(queryset.first().id, target.id)

    def test_qif_tc_005_get_queryset_returns_none_without_city_id(self):
        # TC ID: QIF-TC-005
        QuickInfo.objects.create(label="Price", value="100", city=self.city)

        view = QuickInfoByCityView()
        view.request = Request(self.factory.get("/api/quick-info/by-city/"))

        queryset = view.get_queryset()
        self.assertEqual(queryset.count(), 0)
