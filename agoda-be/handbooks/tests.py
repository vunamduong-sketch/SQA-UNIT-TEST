from django.test import TestCase

from accounts.models import CustomUser
from cities.models import City
from countries.models import Country
from handbooks.models import Handbook, UserHandbookInteraction


class HandbookModelTests(TestCase):
	def setUp(self):
		self.country = Country.objects.create(name="VN Handbook")
		self.city = City.objects.create(name="Da Nang Handbook", country=self.country)
		self.author = CustomUser.objects.create_user(
			username="hb_author",
			email="hb_author@example.com",
			password="pass12345",
		)

	def test_hb_tc_001_save_recomputes_total_weighted_score(self):
		# TC ID: HB-TC-001
		handbook = Handbook.objects.create(
			author=self.author,
			title="Guide Da Nang",
			city=self.city,
			avg_star=4.0,
			total_click=20,
			total_positive=10,
			total_negative=2,
			total_neutral=1,
		)
		self.assertAlmostEqual(handbook.total_weighted_score, handbook.calc_total_weighted_score, places=6)

	def test_hb_tc_002_update_total_weighted_score_persists(self):
		# TC ID: HB-TC-002
		handbook = Handbook.objects.create(
			author=self.author,
			title="Guide Hue",
			city=self.city,
		)
		handbook.total_click = 5
		handbook.save(update_fields=["total_click"])  # persist trước khi tính score
		handbook.update_total_weighted_score()
		handbook.refresh_from_db()
		self.assertAlmostEqual(handbook.total_weighted_score, handbook.calc_total_weighted_score, places=6)

	def test_hb_tc_003_user_handbook_interaction_update_weighted_score(self):
		# TC ID: HB-TC-003
		handbook = Handbook.objects.create(
			author=self.author,
			title="Guide Hoi An",
			city=self.city,
		)
		user = CustomUser.objects.create_user(
			username="hb_user",
			email="hb_user@example.com",
			password="pass12345",
		)
		interaction = UserHandbookInteraction.objects.create(
			user=user,
			handbook=handbook,
			click_count=4,
			positive_count=3,
			negative_count=1,
			neutral_count=0,
		)

		interaction.update_weighted_score()
		self.assertGreater(interaction.weighted_score, 0)
