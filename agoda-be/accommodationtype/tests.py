from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory

from accommodationtype.models import AccommodationType
from accommodationtype.serializers import AccommodationTypeSerializer
from accommodationtype.views import AccommodationTypeByCityView
from cities.models import City
from countries.models import Country


class AccommodationTypeTests(TestCase):
    """Test các chức năng của model AccommodationType và API"""
    
    def setUp(self):
        self.factory = APIRequestFactory()
        self.country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="Da Nang", country=self.country)

    # TC ID: ACM-TC-001
    def test_acm_tc_001_model_str_returns_expected_text(self):
        # Kiểm tra: Phương thức __str__ của model AccommodationType trả về "Tên loại, Tên thành phố"
        # Mục đích: Đảm bảo hiển thị đầy đủ thông tin loại chỗ ở và thành phố khi in ra
        # Kỳ vọng: str(item) trả về "Resort (Da Nang)"
        item = AccommodationType.objects.create(city=self.city, name="Resort")
        self.assertEqual(str(item), "Resort (Da Nang)")

    # TC ID: ACM-TC-002
    def test_acm_tc_002_serializer_returns_all_fields(self):
        # Kiểm tra: Serializer trả về đầy đủ các trường của AccommodationType
        # Mục đích: Đảm bảo tất cả thông tin loại chỗ ở được serialize đúng
        # Kỳ vọng: Trả về đầy đủ name, description, city, id, created_at
        item = AccommodationType.objects.create(
            city=self.city,
            name="Apartment",
            description="Serviced apartment",
        )
        data = AccommodationTypeSerializer(item).data

        self.assertEqual(data["name"], "Apartment")
        self.assertEqual(data["description"], "Serviced apartment")
        self.assertEqual(data["city"], self.city.id)
        self.assertIn("id", data)
        self.assertIn("created_at", data)

    # TC ID: ACM-TC-003
    def test_acm_tc_003_get_queryset_filters_by_city_id(self):
        # Kiểm tra: Lọc loại chỗ ở theo city_id
        # Mục đích: Đảm bảo chỉ trả về các loại chỗ ở thuộc thành phố được chỉ định
        # Kỳ vọng: Chỉ trả về AccommodationType của Da Nang, không trả về của Tokyo
        other_country = Country.objects.create(name="Japan")
        other_city = City.objects.create(name="Tokyo", country=other_country)

        target = AccommodationType.objects.create(city=self.city, name="Hotel")
        AccommodationType.objects.create(city=other_city, name="Hostel")

        view = AccommodationTypeByCityView()
        view.kwargs = {"city_id": self.city.id}

        queryset = view.get_queryset()
        self.assertEqual(queryset.count(), 1)
        self.assertEqual(queryset.first().id, target.id)

    # TC ID: ACM-TC-004
    def test_acm_tc_004_list_returns_wrapped_response(self):
        # Kiểm tra: API trả về danh sách loại chỗ ở theo thành phố với format chuẩn
        # Mục đích: Đảm bảo API trả về đúng định dạng response với isSuccess, message, data
        # Kỳ vọng: Trả về 200, isSuccess=True, data chứa 1 AccommodationType
        AccommodationType.objects.create(city=self.city, name="Resort")
        view = AccommodationTypeByCityView.as_view()

        request = self.factory.get(f"/api/accommodation-types/by-city/{self.city.id}/")
        response = view(request, city_id=self.city.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["isSuccess"])
        self.assertIn("message", response.data)
        self.assertIn("data", response.data)
        self.assertEqual(len(response.data["data"]), 1)
