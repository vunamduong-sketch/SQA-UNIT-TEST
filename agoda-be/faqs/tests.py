from django.test import TestCase
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from cities.models import City
from countries.models import Country
from faqs.models import FAQ
from faqs.serializers import FAQSerializer
from faqs.views import FAQListView


class FAQTests(TestCase):
    """Test các chức năng của model FAQ và API"""
    
    def setUp(self):
        self.factory = APIRequestFactory()
        self.country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="Ha Noi", country=self.country)

    # TC ID: FAQ-TC-001
    def test_faq_tc_001_model_str_returns_first_50_chars(self):
        # Kiểm tra: Phương thức __str__ của model FAQ trả về 50 ký tự đầu của câu hỏi
        # Mục đích: Đảm bảo hiển thị ngắn gọn câu hỏi khi in ra (tránh quá dài)
        # Kỳ vọng: str(faq) trả về 50 ký tự đầu của question
        question = "A" * 80
        faq = FAQ.objects.create(city=self.city, question=question, answer="Answer")
        self.assertEqual(str(faq), question[:50])

    # TC ID: FAQ-TC-002
    def test_faq_tc_002_serializer_returns_all_fields(self):
        # Kiểm tra: Serializer trả về đầy đủ các trường của FAQ
        # Mục đích: Đảm bảo tất cả thông tin FAQ được serialize đúng
        # Kỳ vọng: Trả về đầy đủ city, question, answer, id, created_at
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

    # TC ID: FAQ-TC-003
    def test_faq_tc_003_get_queryset_filters_by_city_and_orders_by_id(self):
        # Kiểm tra: Lọc FAQ theo city_id và sắp xếp theo id tăng dần
        # Mục đích: Đảm bảo chỉ trả về FAQ của thành phố được chỉ định, theo thứ tự tạo
        # Kỳ vọng: Trả về FAQ theo đúng thứ tự id tăng dần (first.id, second.id)
        first = FAQ.objects.create(city=self.city, question="Q1", answer="A1")
        second = FAQ.objects.create(city=self.city, question="Q2", answer="A2")

        view = FAQListView()
        view.request = Request(
            self.factory.get("/api/faqs/by-city/", {"cityId": self.city.id})
        )

        queryset = view.get_queryset()
        self.assertEqual(list(queryset.values_list("id", flat=True)), [first.id, second.id])

    # TC ID: FAQ-TC-004
    def test_faq_tc_004_get_queryset_returns_none_without_city_id(self):
        # Kiểm tra: Trả về queryset rỗng khi không có tham số cityId
        # Mục đích: Đảm bảo API yêu cầu bắt buộc phải có cityId để lọc FAQ
        # Kỳ vọng: queryset.count() = 0 khi không truyền cityId
        FAQ.objects.create(city=self.city, question="Q1", answer="A1")

        view = FAQListView()
        view.request = Request(self.factory.get("/api/faqs/by-city/"))

        queryset = view.get_queryset()
        self.assertEqual(queryset.count(), 0)
