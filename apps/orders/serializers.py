from rest_framework import serializers
from apps.orders.models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'sku', 'unit_price', 'quantity', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_email', 'customer_name',
            'shipping_address_data', 'subtotal', 'discount', 'shipping_fee',
            'tax', 'total', 'order_status', 'payment_status', 'coupon_code',
            'cancellation_reason', 'items', 'created_at', 'updated_at'
        ]


class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField(required=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.CharField(required=False, default='CREDIT_CARD')
