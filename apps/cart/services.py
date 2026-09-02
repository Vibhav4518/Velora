from apps.cart.models import Cart, CartItem
from apps.catalog.models import Product

class CartService:
    @staticmethod
    def get_or_create_cart(user=None, session_key=None):
        if user and user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=user)
            if session_key:
                guest_cart = Cart.objects.filter(session_key=session_key, user=None).first()
                if guest_cart:
                    CartService.merge_carts(guest_cart, cart)
            return cart
        elif session_key:
            cart, _ = Cart.objects.get_or_create(session_key=session_key)
            return cart
        return None

    @staticmethod
    def merge_carts(source_cart, target_cart):
        for item in source_cart.items.all():
            target_item, created = CartItem.objects.get_or_create(
                cart=target_cart,
                product=item.product,
                defaults={'quantity': item.quantity, 'unit_price': item.unit_price}
            )
            if not created:
                target_item.quantity += item.quantity
                target_item.save()
        source_cart.delete()

    @staticmethod
    def add_item(cart, product_id, quantity=1):
        product = Product.objects.get(id=product_id)
        if product.stock_quantity < quantity:
            raise ValueError(f"Only {product.stock_quantity} units available in stock.")

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity, 'unit_price': product.current_price}
        )
        if not created:
            new_qty = item.quantity + quantity
            if product.stock_quantity < new_qty:
                raise ValueError(f"Cannot add {quantity} more. Maximum stock reached.")
            item.quantity = new_qty
            item.save()
        return item

    @staticmethod
    def update_item_quantity(cart, item_id, quantity):
        item = CartItem.objects.get(id=item_id, cart=cart)
        if quantity <= 0:
            item.delete()
            return None
        if item.product.stock_quantity < quantity:
            raise ValueError(f"Only {item.product.stock_quantity} units available.")
        item.quantity = quantity
        item.save()
        return item

    @staticmethod
    def remove_item(cart, item_id):
        CartItem.objects.filter(id=item_id, cart=cart).delete()

    @staticmethod
    def clear_cart(cart):
        cart.items.all().delete()
