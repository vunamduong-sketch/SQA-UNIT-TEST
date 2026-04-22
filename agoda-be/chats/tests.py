from django.test import TestCase

from accounts.models import CustomUser
from chats.models import Conversation, Message


class ChatModelTests(TestCase):
	def setUp(self):
		self.user1 = CustomUser.objects.create_user(
			username="chat_user_1",
			email="chat_user_1@example.com",
			password="pass12345",
		)
		self.user2 = CustomUser.objects.create_user(
			username="chat_user_2",
			email="chat_user_2@example.com",
			password="pass12345",
		)

	def test_chat_tc_001_conversation_str_returns_expected_text(self):
		# TC ID: CHAT-TC-001
		conversation = Conversation.objects.create(user1=self.user1, user2=self.user2)
		self.assertIn("Conversation between chat_user_1 and chat_user_2", str(conversation))

	def test_chat_tc_002_message_str_contains_sender_and_conversation_id(self):
		# TC ID: CHAT-TC-002
		conversation = Conversation.objects.create(user1=self.user1, user2=self.user2)
		message = Message.objects.create(
			conversation=conversation,
			sender=self.user1,
			text="Xin chao",
		)
		self.assertIn("Message from chat_user_1", str(message))
		self.assertIn(str(conversation.id), str(message))

	def test_chat_tc_003_message_seen_defaults_to_false(self):
		# TC ID: CHAT-TC-003
		conversation = Conversation.objects.create(user1=self.user1, user2=self.user2)
		message = Message.objects.create(
			conversation=conversation,
			sender=self.user1,
			text="Hello",
		)
		self.assertFalse(message.seen)

	def test_chat_tc_004_conversation_seen_defaults_to_false(self):
		# TC ID: CHAT-TC-004
		conversation = Conversation.objects.create(user1=self.user1, user2=self.user2)
		self.assertFalse(conversation.seen)
