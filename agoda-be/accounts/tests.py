from django.test import TestCase

from accounts.models import CustomUser


class AccountModelTests(TestCase):
	def test_acc_tc_001_custom_user_str_returns_username(self):
		# TC ID: ACC-TC-001
		user = CustomUser.objects.create_user(
			username="acc_user",
			email="acc_user@example.com",
			password="pass12345",
		)
		self.assertEqual(str(user), "acc_user")

	def test_acc_tc_002_defaults_role_and_driver_status(self):
		# TC ID: ACC-TC-002
		user = CustomUser.objects.create_user(
			username="acc_default_user",
			email="acc_default_user@example.com",
			password="pass12345",
		)
		self.assertEqual(user.role, "customer")
		self.assertEqual(user.driver_status, "idle")

	def test_acc_tc_003_can_assign_driver_role_and_status(self):
		# TC ID: ACC-TC-003
		user = CustomUser.objects.create_user(
			username="acc_driver_user",
			email="acc_driver_user@example.com",
			password="pass12345",
			role="driver",
			driver_status="busy",
		)
		self.assertEqual(user.role, "driver")
		self.assertEqual(user.driver_status, "busy")

	def test_acc_tc_004_register_serializer_creates_user_with_hashed_password(self):
		# TC ID: ACC-TC-004
		from accounts.serializers import RegisterSerializer

		data = {
			"username": "acc_reg_user",
			"email": "acc_reg_user@example.com",
			"first_name": "Acc",
			"last_name": "Reg",
			"password": "SecurePass123",
			"phone_number": "0123456789",
			"gender": "male",
			"role": "customer",
		}
		serializer = RegisterSerializer(data=data)
		self.assertTrue(serializer.is_valid(), serializer.errors)
		user = serializer.save()

		self.assertEqual(user.username, "acc_reg_user")
		self.assertNotEqual(user.password, "SecurePass123")  # password must be hashed
		self.assertTrue(user.check_password("SecurePass123"))

	def test_acc_tc_005_custom_user_manager_fk_can_be_assigned(self):
		# TC ID: ACC-TC-005
		from accounts.models import CustomUser

		manager = CustomUser.objects.create_user(
			username="acc_manager",
			email="acc_manager@example.com",
			password="pass12345",
		)
		staff = CustomUser.objects.create_user(
			username="acc_staff",
			email="acc_staff@example.com",
			password="pass12345",
			manager=manager,
		)
		self.assertEqual(staff.manager, manager)
