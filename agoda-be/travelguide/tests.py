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
    """Test các chức năng của model TravelGuide và API lọc theo khách sạn"""
    
    def setUp(self):
        self.factory = APIRequestFactory()
        country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="Da Nang", country=country)
        self.hotel = Hotel.objects.create(name="Hotel A", city=self.city)

    # TC ID: TGD-TC-001
    def test_tgd_tc_001_model_str_returns_expected_text(self):
        # Kiểm tra: Phương thức __str__ trả về định dạng "title - hotel"
        # Mục đích: Đảm bảo hiển thị đúng tên hướng dẫn kèm khách sạn khi in ra
        # Kỳ vọng: str(guide) trả về "Guide A - Hotel A"
        guide = TravelGuide.objects.create(
            hotel=self.hotel,
            title="Guide A",
            content="Guide content",
        )
        self.assertEqual(str(guide), "Guide A - Hotel A")

    # TC ID: TGD-TC-002
    def test_tgd_tc_002_serializer_returns_expected_schema(self):
        # Kiểm tra: Serializer trả về đầy đủ các trường của TravelGuide
        # Mục đích: Đảm bảo response chứa đầy đủ thông tin hướng dẫn du lịch (hotel, title, content, created_at)
        # Kỳ vọng: data chứa tất cả các trường với giá trị đúng
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

    # TC ID: TGD-TC-003
    def test_tgd_tc_003_get_queryset_filters_by_hotel_id(self):
        # Kiểm tra: Lọc hướng dẫn du lịch theo hotel_id
        # Mục đích: Đảm bảo chỉ trả về các hướng dẫn thuộc khách sạn được chỉ định
        # Kỳ vọng: Chỉ trả về hướng dẫn của Hotel A, không trả về của Hotel B
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

    # TC ID: TGD-TC-004
    def test_tgd_tc_004_list_returns_wrapped_response(self):
        # Kiểm tra: API trả về response với format chuẩn (isSuccess, message, data)
        # Mục đích: Đảm bảo response tuân thủ cấu trúc API chuẩn của hệ thống
        # Kỳ vọng: Trả về 200, isSuccess=True, có message và data
        TravelGuide.objects.create(hotel=self.hotel, title="Guide A", content="A")
        view = TravelGuideByHotelView.as_view()

        request = self.factory.get(f"/api/travel-guides/by-hotel/{self.hotel.id}/")
        response = view(request, hotel_id=self.hotel.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["isSuccess"])
        self.assertIn("message", response.data)
        self.assertIn("data", response.data)

    # TC ID: TGD-TC-005
    def test_tgd_tc_005_list_returns_empty_when_no_guide(self):
        # Kiểm tra: Trả về danh sách rỗng khi khách sạn không có hướng dẫn
        # Mục đích: Đảm bảo API xử lý đúng trường hợp không có dữ liệu
        # Kỳ vọng: Trả về 200, data=[]
        view = TravelGuideByHotelView.as_view()

        request = self.factory.get(f"/api/travel-guides/by-hotel/{self.hotel.id}/")
        response = view(request, hotel_id=self.hotel.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"], [])
