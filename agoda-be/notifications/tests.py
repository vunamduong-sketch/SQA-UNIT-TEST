import json
from unittest.mock import AsyncMock, patch

from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import permissions
from rest_framework.test import APIRequestFactory

from notifications.consumers import NotificationConsumer
from notifications.models import Notification
from notifications.serializers import NotificationSerializer
from notifications.views import NotificationViewSet


class NotificationModelTests(TestCase):
	"""Test các chức năng của model Notification và cơ chế gửi email"""
	
	# TC ID: NOTI-TC-001
	def test_noti_tc_001_init_defaults_send_mail_flag_true(self):
		# Kiểm tra: Flag gửi email mặc định là True khi khởi tạo Notification
		# Mục đích: Đảm bảo mặc định sẽ gửi email thông báo cho người dùng
		# Kỳ vọng: _send_mail_flag=True
		notification = Notification(title="Welcome")
		self.assertTrue(notification._send_mail_flag)

	# TC ID: NOTI-TC-002
	def test_noti_tc_002_init_accepts_custom_send_mail_flag(self):
		# Kiểm tra: Có thể tùy chỉnh flag gửi email khi khởi tạo
		# Mục đích: Đảm bảo có thể tắt gửi email nếu cần (ví dụ: notification nội bộ)
		# Kỳ vọng: _send_mail_flag=False khi truyền send_mail_flag=False
		notification = Notification(title="Welcome", send_mail_flag=False)
		self.assertFalse(notification._send_mail_flag)

	# TC ID: NOTI-TC-003
	@patch("notifications.models.send_mail")
	def test_noti_tc_003_save_calls_send_mail_when_flag_true(self, mock_send_mail):
		# Kiểm tra: Gọi hàm send_mail khi lưu notification với flag=True
		# Mục đích: Đảm bảo email được gửi tự động khi tạo notification
		# Kỳ vọng: send_mail được gọi 1 lần
		notification = Notification(
			email="recipient@example.com",
			title="New Notification",
			message="Message",
			send_mail_flag=True,
		)

		notification.save()

		mock_send_mail.assert_called_once()

	# TC ID: NOTI-TC-004
	@patch("notifications.models.send_mail")
	def test_noti_tc_004_save_does_not_call_send_mail_when_flag_false(self, mock_send_mail):
		# Kiểm tra: Không gọi send_mail khi lưu notification với flag=False
		# Mục đích: Đảm bảo không gửi email khi flag bị tắt
		# Kỳ vọng: send_mail không được gọi
		notification = Notification(
			email="recipient@example.com",
			title="New Notification",
			message="Message",
			send_mail_flag=False,
		)

		notification.save()

		mock_send_mail.assert_not_called()


class NotificationSerializerAndViewSetTests(TestCase):
	"""Test các chức năng của Serializer và ViewSet cho Notification API"""
	
	def setUp(self):
		self.factory = APIRequestFactory()
		self.user_a = get_user_model().objects.create_user(
			username="noti_user_a",
			email="noti_a@example.com",
			password="pass12345",
		)
		self.user_b = get_user_model().objects.create_user(
			username="noti_user_b",
			email="noti_b@example.com",
			password="pass12345",
		)

	# TC ID: NOTI-TC-005
	def test_noti_tc_005_serializer_respects_schema_and_read_only_fields(self):
		# Kiểm tra: Serializer tuân thủ schema và bỏ qua các trường read-only
		# Mục đích: Đảm bảo id và created_at được tự động tạo, không thể ghi đè
		# Kỳ vọng: id khác 999, created_at được tự động tạo
		serializer = NotificationSerializer(
			data={
				"id": 999,
				"email": "schema@example.com",
				"title": "Schema Test",
				"message": "Hello",
				"created_at": "2000-01-01T00:00:00Z",
			}
		)

		self.assertTrue(serializer.is_valid(), serializer.errors)
		instance = serializer.save()

		self.assertNotEqual(instance.id, 999)
		self.assertIsNotNone(instance.created_at)

	# TC ID: NOTI-TC-006
	def test_noti_tc_006_get_queryset_returns_only_current_user_notifications(self):
		# Kiểm tra: Chỉ trả về notification của user hiện tại
		# Mục đích: Đảm bảo bảo mật, user chỉ thấy notification của mình
		# Kỳ vọng: User A chỉ thấy 2 notification của mình, không thấy của User B
		Notification.objects.create(user=self.user_a, title="A1")
		Notification.objects.create(user=self.user_a, title="A2")
		Notification.objects.create(user=self.user_b, title="B1")

		request = self.factory.get("/api/notifications/")
		request.user = self.user_a

		viewset = NotificationViewSet()
		viewset.request = request

		queryset = viewset.get_queryset()

		self.assertEqual(queryset.count(), 2)
		self.assertTrue(all(item.user_id == self.user_a.id for item in queryset))

	# TC ID: NOTI-TC-007
	def test_noti_tc_007_get_permissions_returns_allow_any_for_create(self):
		# Kiểm tra: Action "create" cho phép truy cập không cần xác thực
		# Mục đích: Đảm bảo hệ thống có thể tạo notification cho user chưa đăng nhập
		# Kỳ vọng: Permission là AllowAny cho action create
		viewset = NotificationViewSet()
		viewset.action = "create"

		permissions_list = viewset.get_permissions()

		self.assertEqual(len(permissions_list), 1)
		self.assertIsInstance(permissions_list[0], permissions.AllowAny)

	# TC ID: NOTI-TC-008
	def test_noti_tc_008_get_permissions_returns_authenticated_for_other_actions(self):
		# Kiểm tra: Các action khác yêu cầu xác thực
		# Mục đích: Đảm bảo chỉ user đã đăng nhập mới xem/quản lý notification
		# Kỳ vọng: Permission là IsAuthenticated cho action list
		viewset = NotificationViewSet()
		viewset.action = "list"

		permissions_list = viewset.get_permissions()

		self.assertEqual(len(permissions_list), 1)
		self.assertIsInstance(permissions_list[0], permissions.IsAuthenticated)


class NotificationConsumerTests(TestCase):
	"""Test các chức năng của WebSocket Consumer cho notification real-time"""
	
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="consumer_user",
			email="consumer@example.com",
			password="pass12345",
		)

	# TC ID: NOTI-TC-009
	def test_noti_tc_009_get_total_unseen_returns_correct_count(self):
		# Kiểm tra: Đếm đúng số notification chưa đọc
		# Mục đích: Đảm bảo hiển thị đúng số badge thông báo chưa đọc
		# Kỳ vọng: Trả về 2 (2 notification chưa đọc)
		Notification.objects.create(user=self.user, title="Unread 1", is_read=False)
		Notification.objects.create(user=self.user, title="Unread 2", is_read=False)
		Notification.objects.create(user=self.user, title="Read", is_read=True)

		consumer = NotificationConsumer()
		consumer.user = self.user

		total = async_to_sync(consumer.get_total_unseen)()

		self.assertEqual(total, 2)

	# TC ID: NOTI-TC-010
	def test_noti_tc_010_get_notifications_page_returns_expected_page_data(self):
		# Kiểm tra: Lấy trang notification với đầy đủ metadata
		# Mục đích: Đảm bảo phân trang notification hoạt động đúng
		# Kỳ vọng: Trả về items, has_next, total_unseen=1
		Notification.objects.create(user=self.user, title="N1", is_read=False)
		Notification.objects.create(user=self.user, title="N2", is_read=True)

		consumer = NotificationConsumer()
		consumer.user = self.user

		page_data = async_to_sync(consumer.get_notifications_page)(1)

		self.assertIn("items", page_data)
		self.assertIn("has_next", page_data)
		self.assertIn("total_unseen", page_data)
		self.assertEqual(page_data["total_unseen"], 1)

	# TC ID: NOTI-TC-011
	def test_noti_tc_011_mark_as_read_db_marks_notification_and_returns_summary(self):
		# Kiểm tra: Đánh dấu notification đã đọc và trả về tổng kết
		# Mục đích: Đảm bảo có thể đánh dấu đã đọc và cập nhật số chưa đọc
		# Kỳ vọng: is_read=True, trả về notification_id và total_unseen=0
		notification = Notification.objects.create(user=self.user, title="Unread", is_read=False)

		consumer = NotificationConsumer()
		consumer.user = self.user

		result = async_to_sync(consumer.mark_as_read_db)(notification.id)

		notification.refresh_from_db()
		self.assertTrue(notification.is_read)
		self.assertEqual(result["notification_id"], notification.id)
		self.assertEqual(result["total_unseen"], 0)

	# TC ID: NOTI-TC-012
	def test_noti_tc_012_mark_as_read_db_returns_none_for_missing_notification(self):
		# Kiểm tra: Trả về None khi notification không tồn tại
		# Mục đích: Đảm bảo xử lý an toàn khi đánh dấu notification không tồn tại
		# Kỳ vọng: Trả về None
		consumer = NotificationConsumer()
		consumer.user = self.user

		result = async_to_sync(consumer.mark_as_read_db)(999999)

		self.assertIsNone(result)
