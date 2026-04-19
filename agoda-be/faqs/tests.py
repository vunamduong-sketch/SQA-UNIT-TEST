from django.test import TestCase
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from cities.models import City
from countries.models import Country
from faqs.models import FAQ
from faqs.serializers import FAQSerializer
from faqs.views import FAQListView


class FAQTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="Ha Noi", country=self.country)

    def test_faq_tc_001_model_str_returns_first_50_chars(self):
        # TC ID: FAQ-TC-001
        question = "A" * 80
        faq = FAQ.objects.create(city=self.city, question=question, answer="Answer")
        self.assertEqual(str(faq), question[:50])

    def test_faq_tc_002_serializer_returns_all_fields(self):
        # TC ID: FAQ-TC-002
        faq = FAQ.objects.create(
            city=self.city,
            question="How to travel?",
            answer="By plane",
        )
        data = FAQSerializer(faq).data

        self.assertEqual(data["city"], self.city.id)
        self.assertEqual(data["question"], "How to travel?")
        self.assertEqual(data["answer"], "By plane")
        self.assertIn("id", data)
        self.assertIn("created_at", data)

    def test_faq_tc_003_get_queryset_filters_by_city_and_orders_by_id(self):
        # TC ID: FAQ-TC-003
        first = FAQ.objects.create(city=self.city, question="Q1", answer="A1")
        second = FAQ.objects.create(city=self.city, question="Q2", answer="A2")

        view = FAQListView()
        view.request = Request(
            self.factory.get("/api/faqs/by-city/", {"cityId": self.city.id})
        )

        queryset = view.get_queryset()
        self.assertEqual(list(queryset.values_list("id", flat=True)), [first.id, second.id])

    def test_faq_tc_004_get_queryset_returns_none_without_city_id(self):
        # TC ID: FAQ-TC-004
        FAQ.objects.create(city=self.city, question="Q1", answer="A1")

        view = FAQListView()
        view.request = Request(self.factory.get("/api/faqs/by-city/"))

        queryset = view.get_queryset()
        self.assertEqual(queryset.count(), 0)
