from rest_framework import serializers
from apps.coupons.models import Coupon

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'description', 'discount_type', 'discount_value', 'min_order_amount', 'used_count', 'is_active']
