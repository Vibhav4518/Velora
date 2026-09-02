from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.invoices.models import Invoice
from apps.orders.models import Order
from apps.invoices.serializers import InvoiceSerializer
from apps.invoices.services import InvoiceService
from apps.accounts.exceptions import custom_response

class OrderInvoiceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        order = Order.objects.filter(order_number=order_number).first()
        if not order:
            return custom_response(message="Order not found", status_code=404, success=False)

        if not (request.user.is_staff or order.customer == request.user):
            return custom_response(message="Unauthorized to view this invoice", status_code=403, success=False)

        invoice = InvoiceService.generate_invoice(order)
        return custom_response(data=InvoiceSerializer(invoice).data)
