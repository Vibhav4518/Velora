from django.db import transaction
from decimal import Decimal
from apps.orders.models import Order, OrderItem
from apps.cart.services import CartService
from apps.shipping.models import Address
from apps.coupons.models import Coupon
from apps.inventory.services import InventoryService
from apps.invoices.services import InvoiceService
from apps.notifications.services import NotificationService
from apps.audit.services import AuditService

class OrderService:
    @staticmethod
    @transaction.atomic
    def place_order(user, address_id, coupon_code=None, payment_method='CREDIT_CARD'):
        cart = CartService.get_or_create_cart(user=user)
        cart_items = list(cart.items.select_related('product').all())

        if not cart_items:
            raise ValueError("Your cart is empty.")

        address = Address.objects.filter(user=user, id=address_id).first()
        if not address:
            raise ValueError("Invalid shipping address.")

        address_data = {
            'full_name': address.full_name,
            'phone': address.phone,
            'address_line_1': address.address_line_1,
            'address_line_2': address.address_line_2,
            'city': address.city,
            'state': address.state,
            'postal_code': address.postal_code,
            'country': address.country,
        }

        subtotal = sum(item.total_price for item in cart_items)
        discount = Decimal('0.00')
        applied_coupon_code = ''

        if coupon_code:
            coupon = Coupon.objects.filter(code=coupon_code.strip().upper(), is_active=True).first()
            if coupon and subtotal >= coupon.min_order_amount:
                discount = coupon.calculate_discount(subtotal)
                applied_coupon_code = coupon.code
                coupon.used_count += 1
                coupon.save()

        taxable_subtotal = max(Decimal('0.00'), subtotal - discount)
        shipping_fee = Decimal('0.00') if taxable_subtotal >= Decimal('100.00') else Decimal('10.00')
        tax = (taxable_subtotal * Decimal('0.08')).quantize(Decimal('0.01'))
        total = taxable_subtotal + shipping_fee + tax

        # Check stock and deduct atomically
        for item in cart_items:
            InventoryService.reduce_stock(item.product, item.quantity)

        order = Order.objects.create(
            customer=user,
            shipping_address_data=address_data,
            subtotal=subtotal,
            discount=discount,
            shipping_fee=shipping_fee,
            tax=tax,
            total=total,
            order_status=Order.CONFIRMED,
            payment_status=Order.PAYMENT_PAID,
            coupon_code=applied_coupon_code
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product_name=item.product.name,
                sku=item.product.sku,
                unit_price=item.unit_price,
                quantity=item.quantity,
                total_price=item.total_price
            )

        CartService.clear_cart(cart)
        InvoiceService.generate_invoice(order)

        NotificationService.notify_user(
            user=user,
            title=f"Order #{order.order_number} Confirmed",
            message=f"Thank you for your order! Total amount paid: ${total}. Track order status in your account dashboard.",
            notification_type='ORDER'
        )

        AuditService.log_action(
            actor=user,
            action="PLACE_ORDER",
            resource="Order",
            resource_id=str(order.id),
            metadata={'order_number': order.order_number, 'total': str(total)}
        )

        return order

    @staticmethod
    @transaction.atomic
    def cancel_order(user, order_id, reason="Customer Cancellation"):
        order = Order.objects.filter(id=order_id).first()
        if not order:
            raise ValueError("Order not found.")

        if not (user.is_staff or order.customer == user):
            raise ValueError("Unauthorized to cancel this order.")

        if order.order_status in [Order.DELIVERED, Order.CANCELLED]:
            raise ValueError(f"Order cannot be cancelled in status {order.order_status}.")

        order.order_status = Order.CANCELLED
        order.payment_status = Order.PAYMENT_REFUNDED
        order.cancellation_reason = reason
        order.save()

        # Restore inventory
        for item in order.items.all():
            from apps.catalog.models import Product
            prod = Product.objects.filter(sku=item.sku).first()
            if prod:
                InventoryService.restore_stock(prod, item.quantity)

        NotificationService.notify_user(
            user=order.customer,
            title=f"Order #{order.order_number} Cancelled",
            message=f"Your order #{order.order_number} has been cancelled. Any payments have been refunded.",
            notification_type='ORDER'
        )

        AuditService.log_action(
            actor=user,
            action="CANCEL_ORDER",
            resource="Order",
            resource_id=str(order.id),
            metadata={'reason': reason}
        )

        return order
