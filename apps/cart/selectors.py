from apps.cart.models import Cart

def get_user_cart(user=None, session_key=None):
    if user and user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart
    elif session_key:
        cart, _ = Cart.objects.get_or_create(session_key=session_key)
        return cart
    return None
