from django.urls import path
from apps.wishlist.views import WishlistView, MoveToCartView

urlpatterns = [
    path('', WishlistView.as_view(), name='wishlist-detail'),
    path('move-to-cart/<int:product_id>/', MoveToCartView.as_view(), name='wishlist-move-to-cart'),
]
