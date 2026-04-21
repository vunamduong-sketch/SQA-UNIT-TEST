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
	def test_noti_tc_001_init_defaults_send_mail_flag_true(self):
		# TC ID: NOTI-TC-001
		notification = Notification(title="Welcome")
		self.assertTrue(notification._send_mail_flag)

	def test_noti_tc_002_init_accepts_custom_send_mail_flag(self):
		# TC ID: NOTI-TC-002
		notification = Notification(title="Welcome", send_mail_flag=False)
		self.assertFalse(notification._send_mail_flag)

	@patch("notifications.models.send_mail")
	def test_noti_tc_003_save_calls_send_mail_when_flag_true(self, mock_send_mail):
		# TC ID: NOTI-TC-003
		notification = Notification(
			email="recipient@example.com",
			title="New Notification",
			message="Message",
			send_mail_flag=True,
		)

		notification.save()

		mock_send_mail.assert_called_once()

	@patch("notifications.models.send_mail")
	def test_noti_tc_004_save_does_not_call_send_mail_when_flag_false(self, mock_send_mail):
		# TC ID: NOTI-TC-004
		notification = Notification(
			email="recipient@example.com",
			title="New Notification",
			message="Message",
			send_mail_flag=False,
		)

		notification.save()

		mock_send_mail.assert_not_called()


class NotificationSerializerAndViewSetTests(TestCase):
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

	def test_noti_tc_005_serializer_respects_schema_and_read_only_fields(self):
		# TC ID: NOTI-TC-005
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

	def test_noti_tc_006_get_queryset_returns_only_current_user_notifications(self):
		# TC ID: NOTI-TC-006
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

	def test_noti_tc_007_get_permissions_returns_allow_any_for_create(self):
		# TC ID: NOTI-TC-007
		viewset = NotificationViewSet()
		viewset.action = "create"

		permissions_list = viewset.get_permissions()

		self.assertEqual(len(permissions_list), 1)
		self.assertIsInstance(permissions_list[0], permissions.AllowAny)

	def test_noti_tc_008_get_permissions_returns_authenticated_for_other_actions(self):
		# TC ID: NOTI-TC-008
		viewset = NotificationViewSet()
		viewset.action = "list"

		permissions_list = viewset.get_permissions()

		self.assertEqual(len(permissions_list), 1)
		self.assertIsInstance(permissions_list[0], permissions.IsAuthenticated)


class NotificationConsumerTests(TestCase):
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="consumer_user",
			email="consumer@example.com",
			password="pass12345",
		)

	def test_noti_tc_009_get_total_unseen_returns_correct_count(self):
		# TC ID: NOTI-TC-009
		Notification.objects.create(user=self.user, title="Unread 1", is_read=False)
		Notification.objects.create(user=self.user, title="Unread 2", is_read=False)
		Notification.objects.create(user=self.user, title="Read", is_read=True)

		consumer = NotificationConsumer()
		consumer.user = self.user

		total = async_to_sync(consumer.get_total_unseen)()

		self.assertEqual(total, 2)

	def test_noti_tc_010_get_notifications_page_returns_expected_page_data(self):
		# TC ID: NOTI-TC-010
		Notification.objects.create(user=self.user, title="N1", is_read=False)
		Notification.objects.create(user=self.user, title="N2", is_read=True)

		consumer = NotificationConsumer()
		consumer.user = self.user

		page_data = async_to_sync(consumer.get_notifications_page)(1)

		self.assertIn("items", page_data)
		self.assertIn("has_next", page_data)
		self.assertIn("total_unseen", page_data)
		self.assertEqual(page_data["total_unseen"], 1)

	def test_noti_tc_011_mark_as_read_db_marks_notification_and_returns_summary(self):
		# TC ID: NOTI-TC-011
		notification = Notification.objects.create(user=self.user, title="Unread", is_read=False)

		consumer = NotificationConsumer()
		consumer.user = self.user

		result = async_to_sync(consumer.mark_as_read_db)(notification.id)

		notification.refresh_from_db()
		self.assertTrue(notification.is_read)
		self.assertEqual(result["notification_id"], notification.id)
		self.assertEqual(result["total_unseen"], 0)

	def test_noti_tc_012_mark_as_read_db_returns_none_for_missing_notification(self):
		# TC ID: NOTI-TC-012
		consumer = NotificationConsumer()
		consumer.user = self.user

		result = async_to_sync(consumer.mark_as_read_db)(999999)

		self.assertIsNone(result)

	def test_noti_tc_013_new_notification_sends_expected_payload(self):
		# TC ID: NOTI-TC-013
		Notification.objects.create(user=self.user, title="Unread", is_read=False)

		consumer = NotificationConsumer()
		consumer.user = self.user
		consumer.send = AsyncMock()

		event = {
			"title": "Title",
			"message": "Message",
			"link": "/x",
			"created_at": "2026-01-01T00:00:00Z",
			"payload": {"notification_id": 1},
		}

		async_to_sync(consumer.new_notification)(event)

		consumer.send.assert_awaited_once()
		data = json.loads(consumer.send.call_args.kwargs["text_data"])
		self.assertEqual(data["type"], "new_notification")
		self.assertIn("total_unseen", data)

	def test_noti_tc_014_notification_read_sends_broadcast_payload(self):
		# TC ID: NOTI-TC-014
		consumer = NotificationConsumer()
		consumer.send = AsyncMock()

		event = {
			"type": "notification_read",
			"notification_id": 11,
			"total_unseen": 4,
		}

		async_to_sync(consumer.notification_read)(event)

		consumer.send.assert_awaited_once()
		data = json.loads(consumer.send.call_args.kwargs["text_data"])
		self.assertEqual(data["notification_id"], 11)
		self.assertEqual(data["total_unseen"], 4)
