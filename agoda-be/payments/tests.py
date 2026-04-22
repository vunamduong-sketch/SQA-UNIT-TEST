from django.test import TestCase

from bookings.constants.service_type import ServiceType
from bookings.models import Booking
from payments.constants.payment_method import PaymentMethod
from payments.constants.payment_status import PaymentStatus
from payments.models import Payment


class PaymentModelTests(TestCase):
	def test_pay_tc_001_payment_defaults_to_pending_status(self):
		# TC ID: PAY-TC-001
		booking = Booking.objects.create(service_type=ServiceType.HOTEL)
		payment = Payment.objects.create(
			booking=booking,
			method=PaymentMethod.ONLINE,
			amount=1500000,
		)
		self.assertEqual(payment.status, PaymentStatus.PENDING)

	def test_pay_tc_002_payment_stores_method_and_amount(self):
		# TC ID: PAY-TC-002
		booking = Booking.objects.create(service_type=ServiceType.CAR)
		payment = Payment.objects.create(
			booking=booking,
			method=PaymentMethod.CASH,
			amount=320000,
			status=PaymentStatus.SUCCESS,
		)
		self.assertEqual(payment.method, PaymentMethod.CASH)
		self.assertEqual(payment.amount, 320000)
		self.assertEqual(payment.status, PaymentStatus.SUCCESS)

	def test_pay_tc_003_payment_stores_optional_transaction_id(self):
		# TC ID: PAY-TC-003
		booking = Booking.objects.create(service_type=ServiceType.HOTEL)
		payment = Payment.objects.create(
			booking=booking,
			method=PaymentMethod.ONLINE,
			amount=750000,
			transaction_id="TXN-AGODA-123456",
		)
		self.assertEqual(payment.transaction_id, "TXN-AGODA-123456")

	def test_pay_tc_004_multiple_payments_for_same_booking_are_independent(self):
		# TC ID: PAY-TC-004
		booking = Booking.objects.create(service_type=ServiceType.HOTEL)
		payment1 = Payment.objects.create(
			booking=booking,
			method=PaymentMethod.ONLINE,
			amount=500000,
		)
		payment2 = Payment.objects.create(
			booking=booking,
			method=PaymentMethod.CASH,
			amount=250000,
			status=PaymentStatus.SUCCESS,
		)
		self.assertEqual(payment1.amount, 500000)
		self.assertEqual(payment2.amount, 250000)
		self.assertEqual(payment1.status, PaymentStatus.PENDING)
		self.assertEqual(payment2.status, PaymentStatus.SUCCESS)
