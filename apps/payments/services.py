from apps.payments.models import Payment
import uuid

class PaymentService:
    @staticmethod
    def process_payment(order, payment_method='CREDIT_CARD'):
        payment = Payment.objects.create(
            order=order,
            payment_method=payment_method,
            transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
            amount=order.total,
            status='SUCCESS'
        )
        return payment
