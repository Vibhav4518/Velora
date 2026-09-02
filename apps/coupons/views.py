from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from decimal import Decimal
from apps.coupons.models import Coupon
from apps.coupons.serializers import CouponSerializer
from apps.users.permissions import IsStaffOrAdmin
from apps.accounts.exceptions import custom_response

class CouponListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def list(self, request, *args, **kwargs):
        return custom_response(data=self.get_serializer(self.get_queryset(), many=True).data)

class CouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

class ValidateCouponView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        amount_str = request.data.get('subtotal', '0')
        try:
            subtotal = Decimal(str(amount_str))
        except:
            subtotal = Decimal('0.00')

        coupon = Coupon.objects.filter(code=code, is_active=True).first()
        if not coupon:
            return custom_response(message="Invalid or expired coupon code", status_code=400, success=False)

        if subtotal < coupon.min_order_amount:
            return custom_response(
                message=f"Minimum order amount for this coupon is ${coupon.min_order_amount}",
                status_code=400, success=False
            )

        discount = coupon.calculate_discount(subtotal)
        return custom_response(data={
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': str(coupon.discount_value),
            'discount_amount': str(discount)
        }, message="Coupon applied successfully")
