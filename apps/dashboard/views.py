from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from apps.users.models import User
from apps.catalog.models import Product
from apps.orders.models import Order
from apps.categories.models import Category
from apps.users.permissions import IsStaffOrAdmin
from apps.accounts.exceptions import custom_response

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def get(self, request):
        total_users = User.objects.count()
        total_customers = User.objects.filter(role__name='CUSTOMER').count()
        total_products = Product.objects.count()
        total_categories = Category.objects.count()

        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(order_status='PENDING').count()
        completed_orders = Order.objects.filter(order_status='DELIVERED').count()

        revenue_agg = Order.objects.filter(payment_status='PAID').aggregate(total_rev=Sum('total'))
        total_revenue = float(revenue_agg['total_rev'] or 0.0)

        low_stock_products = Product.objects.filter(stock_quantity__lte=5).count()

        recent_orders = Order.objects.select_related('customer').order_by('-created_at')[:5]
        recent_orders_data = [
            {
                'id': o.id,
                'order_number': o.order_number,
                'customer_email': o.customer.email,
                'customer_name': o.customer.full_name,
                'total': float(o.total),
                'order_status': o.order_status,
                'created_at': o.created_at.isoformat()
            } for o in recent_orders
        ]

        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_users_data = [
            {
                'id': u.id,
                'email': u.email,
                'full_name': u.full_name,
                'role': u.role_name,
                'date_joined': u.date_joined.isoformat()
            } for u in recent_users
        ]

        return custom_response(data={
            'stats': {
                'total_users': total_users,
                'total_customers': total_customers,
                'total_products': total_products,
                'total_categories': total_categories,
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'completed_orders': completed_orders,
                'total_revenue': total_revenue,
                'low_stock_products': low_stock_products,
            },
            'recent_orders': recent_orders_data,
            'recent_users': recent_users_data
        })
