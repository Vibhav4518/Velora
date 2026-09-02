from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.wishlist.models import Wishlist, WishlistItem
from apps.wishlist.serializers import WishlistSerializer
from apps.catalog.models import Product
from apps.cart.services import CartService
from apps.accounts.exceptions import custom_response

class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        return custom_response(data=WishlistSerializer(wishlist).data)

    def post(self, request):
        product_id = request.data.get('product_id')
        product = Product.objects.filter(id=product_id).first()
        if not product:
            return custom_response(message="Product not found", status_code=404, success=False)

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)

        if not created:
            item.delete()
            message = "Removed from wishlist"
        else:
            message = "Added to wishlist"

        return custom_response(data=WishlistSerializer(wishlist).data, message=message)

class MoveToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        WishlistItem.objects.filter(wishlist=wishlist, product_id=product_id).delete()

        cart = CartService.get_or_create_cart(user=request.user)
        try:
            CartService.add_item(cart, product_id=product_id, quantity=1)
            return custom_response(data=WishlistSerializer(wishlist).data, message="Moved product to cart")
        except ValueError as e:
            return custom_response(message=str(e), status_code=400, success=False)
