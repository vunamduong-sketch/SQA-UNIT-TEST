from django.test import TestCase
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from cities.models import City
from countries.models import Country
from travel_tips.models import TravelTip
from travel_tips.serializers import TravelTipSerializer
from travel_tips.views import TravelTipListView


class TravelTipTests(TestCase):
    """Test các chức năng của model TravelTip và API lọc theo thành phố"""
    
    def setUp(self):
        self.factory = APIRequestFactory()
        country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="Da Nang", country=country)

    # TC ID: TTP-TC-001
    def test_ttp_tc_001_model_str_returns_expected_text(self):
        # Kiểm tra: Phương thức __str__ trả về định dạng "title - city"
        # Mục đích: Đảm bảo hiển thị đúng tên mẹo du lịch kèm thành phố khi in ra
        # Kỳ vọng: str(tip) trả về "Best time - Da Nang"
        tip = TravelTip.objects.create(city=self.city, title="Best time")
        self.assertEqual(str(tip), "Best time - Da Nang")

    # TC ID: TTP-TC-002
    def test_ttp_tc_002_serializer_returns_all_fields(self):
        # Kiểm tra: Serializer trả về đầy đủ các trường của TravelTip
        # Mục đích: Đảm bảo response chứa đầy đủ thông tin mẹo du lịch (city, title, content, type, created_at)
        # Kỳ vọng: data chứa tất cả các trường với giá trị đúng
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

    # TC ID: TTP-TC-003
    def test_ttp_tc_003_get_queryset_filters_by_city_id(self):
        # Kiểm tra: Lọc mẹo du lịch theo cityId
        # Mục đích: Đảm bảo chỉ trả về các mẹo du lịch thuộc thành phố được chỉ định
        # Kỳ vọng: Chỉ trả về mẹo của Da Nang, không trả về của Tokyo
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

    # TC ID: TTP-TC-004
    def test_ttp_tc_004_get_queryset_orders_by_id_ascending(self):
        # Kiểm tra: Sắp xếp danh sách mẹo du lịch theo id tăng dần
        # Mục đích: Đảm bảo thứ tự hiển thị nhất quán (mẹo cũ trước, mới sau)
        # Kỳ vọng: Danh sách được sắp xếp theo id tăng dần
        first = TravelTip.objects.create(city=self.city, title="Tip A")
        second = TravelTip.objects.create(city=self.city, title="Tip B")

        view = TravelTipListView()
        view.request = Request(
            self.factory.get("/api/travel-tips/by-city/", {"cityId": self.city.id})
        )

        queryset = view.get_queryset()
        ids = list(queryset.values_list("id", flat=True))

        self.assertEqual(ids, [first.id, second.id])

    # TC ID: TTP-TC-005
    def test_ttp_tc_005_get_queryset_returns_none_without_city_id(self):
        # Kiểm tra: Trả về kết quả rỗng khi thiếu tham số cityId
        # Mục đích: Đảm bảo API yêu cầu cityId bắt buộc để lọc
        # Kỳ vọng: Trả về 0 kết quả khi không có cityId
        TravelTip.objects.create(city=self.city, title="Tip A")

        view = TravelTipListView()
        view.request = Request(self.factory.get("/api/travel-tips/by-city/"))

        queryset = view.get_queryset()

        self.assertEqual(queryset.count(), 0)
