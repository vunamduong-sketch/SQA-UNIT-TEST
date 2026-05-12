from django.test import TestCase
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from cities.models import City
from countries.models import Country
from quick_info.models import QuickInfo
from quick_info.serializers import QuickInfoCreateSerializer, QuickInfoSerializer
from quick_info.views import QuickInfoByCityView


class QuickInfoTests(TestCase):
    """Test các chức năng của model QuickInfo và API"""
    
    def setUp(self):
        self.factory = APIRequestFactory()
        self.country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="Hanoi", country=self.country)

    # TC ID: QIF-TC-001
    def test_qif_tc_001_model_str_returns_expected_text(self):
        # Kiểm tra: Phương thức __str__ của model QuickInfo trả về "Label - Tên thành phố"
        # Mục đích: Đảm bảo hiển thị đầy đủ thông tin nhãn và thành phố khi in ra
        # Kỳ vọng: str(item) trả về "Price - Hanoi"
        item = QuickInfo.objects.create(label="Price", value="100", city=self.city)
        self.assertEqual(str(item), "Price - Hanoi")

    # TC ID: QIF-TC-002
    def test_qif_tc_002_serializer_contains_nested_city(self):
        # Kiểm tra: Serializer trả về thông tin QuickInfo kèm thông tin thành phố và quốc gia lồng nhau
        # Mục đích: Đảm bảo response chứa đầy đủ thông tin city và country (nested serializer)
        # Kỳ vọng: data chứa trường "city" với city.name="Hanoi", city.country.name="Vietnam"
        item = QuickInfo.objects.create(label="Price", value="100", city=self.city)
        data = QuickInfoSerializer(item).data

        self.assertIn("city", data)
        self.assertEqual(data["city"]["name"], "Hanoi")
        self.assertEqual(data["city"]["country"]["name"], "Vietnam")

    # TC ID: QIF-TC-003
    def test_qif_tc_003_create_serializer_accepts_valid_city_id(self):
        # Kiểm tra: CreateSerializer chấp nhận city_id (primary key) thay vì nested object
        # Mục đích: Đảm bảo có thể tạo QuickInfo bằng cách truyền city_id
        # Kỳ vọng: Validation thành công, instance.city_id = city.id
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

    # TC ID: QIF-TC-004
    def test_qif_tc_004_get_queryset_filters_by_city_id(self):
        # Kiểm tra: Lọc QuickInfo theo city_id
        # Mục đích: Đảm bảo chỉ trả về thông tin nhanh của thành phố được chỉ định
        # Kỳ vọng: Chỉ trả về QuickInfo của Hanoi, không trả về của Tokyo
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

    # TC ID: QIF-TC-005
    def test_qif_tc_005_get_queryset_returns_none_without_city_id(self):
        # Kiểm tra: Trả về queryset rỗng khi không có tham số city_id
        # Mục đích: Đảm bảo API yêu cầu bắt buộc phải có city_id để lọc QuickInfo
        # Kỳ vọng: queryset.count() = 0 khi không truyền city_id
        QuickInfo.objects.create(label="Price", value="100", city=self.city)

        view = QuickInfoByCityView()
        view.request = Request(self.factory.get("/api/quick-info/by-city/"))

        queryset = view.get_queryset()
        self.assertEqual(queryset.count(), 0)
