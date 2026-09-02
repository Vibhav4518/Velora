from django.urls import path
from apps.orders.views import (
    CheckoutView, OrderListView, OrderDetailView,
    CancelOrderView, AdminUpdateOrderStatusView
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('checkout/', CheckoutView.as_view(), name='order-checkout'),
    path('<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),
    path('<str:order_number>/cancel/', CancelOrderView.as_view(), name='order-cancel'),
    path('<str:order_number>/status/', AdminUpdateOrderStatusView.as_view(), name='order-update-status'),
]
