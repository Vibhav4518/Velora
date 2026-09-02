from rest_framework import serializers
from apps.invoices.models import Invoice
from apps.orders.serializers import OrderSerializer

class InvoiceSerializer(serializers.ModelSerializer):
    order_detail = OrderSerializer(source='order', read_only=True)
    store_name = serializers.SerializerMethodField()
    store_address = serializers.SerializerMethodField()
    store_email = serializers.SerializerMethodField()
    store_phone = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'pdf_url', 'issued_at',
            'order_detail', 'store_name', 'store_address',
            'store_email', 'store_phone'
        ]

    def get_store_name(self, obj): return "VELORA Atelier & Co."
    def get_store_address(self, obj): return "100 Luxury Tech Blvd, Suite 500, San Francisco, CA 94107"
    def get_store_email(self, obj): return "concierge@velora.com"
    def get_store_phone(self, obj): return "+1 (800) 555-VELORA"
