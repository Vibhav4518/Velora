from django.urls import path
from apps.coupons.views import CouponListCreateView, CouponDetailView, ValidateCouponView

urlpatterns = [
    path('', CouponListCreateView.as_view(), name='coupon-list-create'),
    path('validate/', ValidateCouponView.as_view(), name='coupon-validate'),
    path('<int:pk>/', CouponDetailView.as_view(), name='coupon-detail'),
]
