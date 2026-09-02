from django.db.models import Q
from apps.orders.models import Order

def get_order_list(user, search=None, status_param=None, payment_status=None):
    queryset = Order.objects.prefetch_related('items').select_related('customer')
    if not (user.is_staff or user.is_superuser):
        queryset = queryset.filter(customer=user)

    if search:
        queryset = queryset.filter(
            Q(order_number__icontains=search) |
            Q(customer__email__icontains=search) |
            Q(customer__first_name__icontains=search) |
            Q(customer__last_name__icontains=search)
        )
    if status_param:
        queryset = queryset.filter(order_status=status_param)
    if payment_status:
        queryset = queryset.filter(payment_status=payment_status)

    return queryset

def get_order_by_number(user, order_number):
    queryset = Order.objects.all() if (user.is_staff or user.is_superuser) else Order.objects.filter(customer=user)
    return queryset.prefetch_related('items').select_related('customer').filter(order_number=order_number).first()
