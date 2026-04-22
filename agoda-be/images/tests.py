from django.test import TestCase

from images.models import Image


class ImageModelTests(TestCase):
	def test_img_tc_001_image_str_returns_image_name(self):
		# TC ID: IMG-TC-001
		image = Image.objects.create(image="uploads/images/test-image.jpg")
		self.assertEqual(str(image), "uploads/images/test-image.jpg")

	def test_img_tc_002_image_uploaded_at_is_auto_set(self):
		# TC ID: IMG-TC-002
		from django.utils import timezone

		before = timezone.now()
		image = Image.objects.create(image="uploads/images/timestamp-test.jpg")
		after = timezone.now()

		self.assertIsNotNone(image.uploaded_at)
		self.assertGreaterEqual(image.uploaded_at, before)
		self.assertLessEqual(image.uploaded_at, after)
