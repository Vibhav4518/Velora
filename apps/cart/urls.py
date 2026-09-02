from django.urls import path
from apps.cart.views import CartView, CartItemDetailView, ClearCartView

urlpatterns = [
    path('', CartView.as_view(), name='cart-detail'),
    path('items/<int:item_id>/', CartItemDetailView.as_view(), name='cart-item-detail'),
    path('clear/', ClearCartView.as_view(), name='cart-clear'),
]
