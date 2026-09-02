from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from apps.cart.services import CartService
from apps.cart.serializers import CartSerializer, CartItemSerializer
from apps.accounts.exceptions import custom_response

class CartView(APIView):
    permission_classes = [AllowAny]

    def _get_cart(self, request):
        session_key = request.headers.get('X-Session-Key') or request.session.session_key
        if not session_key and not request.user.is_authenticated:
            request.session.create()
            session_key = request.session.session_key
        return CartService.get_or_create_cart(user=request.user if request.user.is_authenticated else None, session_key=session_key)

    def get(self, request):
        cart = self._get_cart(request)
        return custom_response(data=CartSerializer(cart).data)

    def post(self, request):
        cart = self._get_cart(request)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return custom_response(message="product_id is required", status_code=400, success=False)

        try:
            CartService.add_item(cart, product_id=product_id, quantity=quantity)
            return custom_response(data=CartSerializer(cart).data, message="Item added to cart")
        except ValueError as e:
            return custom_response(message=str(e), status_code=400, success=False)

class CartItemDetailView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, item_id):
        session_key = request.headers.get('X-Session-Key') or request.session.session_key
        cart = CartService.get_or_create_cart(user=request.user if request.user.is_authenticated else None, session_key=session_key)
        quantity = int(request.data.get('quantity', 1))
        try:
            CartService.update_item_quantity(cart, item_id, quantity)
            return custom_response(data=CartSerializer(cart).data, message="Cart updated")
        except ValueError as e:
            return custom_response(message=str(e), status_code=400, success=False)

    def delete(self, request, item_id):
        session_key = request.headers.get('X-Session-Key') or request.session.session_key
        cart = CartService.get_or_create_cart(user=request.user if request.user.is_authenticated else None, session_key=session_key)
        CartService.remove_item(cart, item_id)
        return custom_response(data=CartSerializer(cart).data, message="Item removed from cart")

class ClearCartView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request):
        session_key = request.headers.get('X-Session-Key') or request.session.session_key
        cart = CartService.get_or_create_cart(user=request.user if request.user.is_authenticated else None, session_key=session_key)
        CartService.clear_cart(cart)
        return custom_response(data=CartSerializer(cart).data, message="Cart cleared")
