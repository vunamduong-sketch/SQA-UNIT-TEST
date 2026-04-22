from django.db import models
from django.test import TestCase

from chatbots import models as chatbot_models


class ChatbotModelTests(TestCase):
	def test_chatb_tc_001_chatbots_module_has_no_custom_model(self):
		# TC ID: CHATB-TC-001
		model_classes = [
			value
			for value in vars(chatbot_models).values()
			if isinstance(value, type)
			and issubclass(value, models.Model)
			and value is not models.Model
		]
		self.assertEqual(model_classes, [])
