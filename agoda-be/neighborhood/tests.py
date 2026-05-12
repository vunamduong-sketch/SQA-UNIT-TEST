from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory, force_authenticate

from cities.models import City
from countries.models import Country
from neighborhood.models import Neighborhood
from neighborhood.serializers import NeighborhoodCreateSerializer, NeighborhoodSerializer
from neighborhood.views import (
    NeighborhoodCreateView,
    NeighborhoodDeleteView,
    NeighborhoodDetailView,
    NeighborhoodListView,
    NeighborhoodUpdateView,
)


class NeighborhoodModelSerializerTests(TestCase):
    """Test các chức năng của model Neighborhood và Serializer"""
    
    def setUp(self):
        self.country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="HCM", country=self.country)

    # TC ID: NBH-TC-001
    def test_nbh_tc_001_model_str_returns_expected_format(self):
        # Kiểm tra: Phương thức __str__ trả về định dạng "name (city)"
        # Mục đích: Đảm bảo hiển thị đúng tên khu vực kèm thành phố khi in ra
        # Kỳ vọng: str(neighborhood) trả về "District 1 (HCM)"
        neighborhood = Neighborhood.objects.create(name="District 1", city=self.city)
        self.assertEqual(str(neighborhood), "District 1 (HCM)")

    # TC ID: NBH-TC-002
    def test_nbh_tc_002_serializer_contains_nested_city(self):
        # Kiểm tra: Serializer trả về thông tin city lồng nhau (nested)
        # Mục đích: Đảm bảo response chứa đầy đủ thông tin khu vực và thành phố
        # Kỳ vọng: data chứa city với city.name="HCM"
        neighborhood = Neighborhood.objects.create(name="District 1", city=self.city)
        data = NeighborhoodSerializer(neighborhood).data

        self.assertIn("city", data)
        self.assertEqual(data["city"]["name"], "HCM")

    # TC ID: NBH-TC-003
    def test_nbh_tc_003_create_serializer_validates_city_id(self):
        # Kiểm tra: CreateSerializer chấp nhận city_id hợp lệ
        # Mục đích: Đảm bảo có thể tạo Neighborhood bằng cách truyền city_id
        # Kỳ vọng: Validation thành công với city_id hợp lệ
        serializer = NeighborhoodCreateSerializer(
            data={"name": "District 3", "description": "Center", "city": self.city.id}
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)


class NeighborhoodListViewTests(TestCase):
    """Test các chức năng lọc và liệt kê danh sách khu vực"""
    
    def setUp(self):
        self.factory = APIRequestFactory()
        country = Country.objects.create(name="Vietnam")
        self.city1 = City.objects.create(name="HCM", country=country)
        self.city2 = City.objects.create(name="Da Nang", country=country)

        self.n1 = Neighborhood.objects.create(name="District 1", city=self.city1)
        self.n2 = Neighborhood.objects.create(name="District 2", city=self.city1)
        self.n3 = Neighborhood.objects.create(name="Hai Chau", city=self.city2)

    # TC ID: NBH-TC-004
    def test_nbh_tc_004_get_queryset_filters_by_city_id(self):
        # Kiểm tra: Lọc khu vực theo city_id
        # Mục đích: Đảm bảo chỉ trả về các khu vực thuộc thành phố được chỉ định
        # Kỳ vọng: Chỉ trả về 2 khu vực của HCM (District 1, District 2)
        view = NeighborhoodListView()
        view.request = Request(
            self.factory.get("/api/neighborhoods/", {"city_id": self.city1.id})
        )

        queryset = view.get_queryset()

        self.assertEqual(queryset.count(), 2)
        self.assertTrue(all(item.city_id == self.city1.id for item in queryset))

    # TC ID: NBH-TC-005
    def test_nbh_tc_005_get_queryset_returns_all_when_no_city_id(self):
        # Kiểm tra: Trả về tất cả khu vực khi không có city_id
        # Mục đích: Đảm bảo API trả về toàn bộ danh sách khi không lọc
        # Kỳ vọng: Trả về 3 khu vực (tất cả)
        view = NeighborhoodListView()
        view.request = Request(self.factory.get("/api/neighborhoods/"))

        queryset = view.get_queryset()

        self.assertEqual(queryset.count(), 3)


class NeighborhoodCrudViewTests(TestCase):
    """Test các chức năng CRUD của Neighborhood API"""
    
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = get_user_model().objects.create_user(
            username="neighborhood_tester",
            email="neighborhood_tester@example.com",
            password="pass12345",
        )

        country = Country.objects.create(name="Vietnam")
        self.city = City.objects.create(name="HCM", country=country)
        self.neighborhood = Neighborhood.objects.create(name="District 1", city=self.city)

    # TC ID: NBH-TC-006
    def test_nbh_tc_006_retrieve_returns_neighborhood_detail(self):
        # Kiểm tra: Lấy thông tin chi tiết một khu vực
        # Mục đích: Đảm bảo API trả về đúng thông tin khu vực
        # Kỳ vọng: Trả về 200, name="District 1"
        view = NeighborhoodDetailView.as_view()
        request = self.factory.get(f"/api/neighborhoods/{self.neighborhood.id}/")

        response = view(request, pk=self.neighborhood.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "District 1")

    # TC ID: NBH-TC-007
    def test_nbh_tc_007_create_creates_neighborhood_when_authenticated(self):
        # Kiểm tra: Tạo mới khu vực thành công khi đã xác thực
        # Mục đích: Đảm bảo có thể tạo khu vực mới với đầy đủ thông tin
        # Kỳ vọng: Trả về 201, khu vực được tạo trong database
        view = NeighborhoodCreateView.as_view()
        payload = {"name": "District 7", "description": "South", "city": self.city.id}

        request = self.factory.post("/api/neighborhoods/create/", payload, format="json")
        force_authenticate(request, user=self.user)
        response = view(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Neighborhood.objects.filter(name="District 7").exists())

    # TC ID: NBH-TC-008
    def test_nbh_tc_008_update_updates_neighborhood_successfully(self):
        # Kiểm tra: Cập nhật thông tin khu vực thành công
        # Mục đích: Đảm bảo có thể cập nhật một phần thông tin khu vực (partial update)
        # Kỳ vọng: Trả về 200, description được cập nhật
        view = NeighborhoodUpdateView.as_view()
        payload = {"description": "Updated"}

        request = self.factory.patch(
            f"/api/neighborhoods/{self.neighborhood.id}/update/", payload, format="json"
        )
        force_authenticate(request, user=self.user)
        response = view(request, pk=self.neighborhood.id)

        self.neighborhood.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.neighborhood.description, "Updated")

    # TC ID: NBH-TC-009
    def test_nbh_tc_009_delete_deletes_neighborhood_successfully(self):
        # Kiểm tra: Xóa khu vực thành công
        # Mục đích: Đảm bảo có thể xóa khu vực khỏi hệ thống
        # Kỳ vọng: Trả về 204, khu vực bị xóa khỏi database
        view = NeighborhoodDeleteView.as_view()

        request = self.factory.delete(f"/api/neighborhoods/{self.neighborhood.id}/delete/")
        force_authenticate(request, user=self.user)
        response = view(request, pk=self.neighborhood.id)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Neighborhood.objects.filter(id=self.neighborhood.id).exists())
