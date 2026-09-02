from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.users.models import User, Role, Permission
from apps.coupons.models import Coupon
from apps.shipping.models import Address

class Command(BaseCommand):
    help = 'Seeds ONLY initial system roles, system users, coupons, and address for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting VELORA System Base Seed...'))

        # 1. Create System Roles & Permissions
        p_manage_catalog = Permission.objects.get_or_create(code='manage_catalog', defaults={'name': 'Manage Product Catalog', 'module': 'catalog'})[0]
        p_manage_orders = Permission.objects.get_or_create(code='manage_orders', defaults={'name': 'Manage Customer Orders', 'module': 'orders'})[0]

        super_admin_role = Role.objects.get_or_create(name=Role.SUPER_ADMIN, defaults={'description': 'Super Administrator', 'is_system_role': True})[0]
        admin_role = Role.objects.get_or_create(name=Role.ADMIN, defaults={'description': 'Administrator', 'is_system_role': True})[0]
        staff_role = Role.objects.get_or_create(name=Role.STAFF, defaults={'description': 'Staff', 'is_system_role': True})[0]
        customer_role = Role.objects.get_or_create(name=Role.CUSTOMER, defaults={'description': 'Customer', 'is_system_role': True})[0]

        admin_role.permissions.add(p_manage_catalog, p_manage_orders)

        # 2. Create the 3 System Users (Super Admin, Store Staff, Customer)
        admin_user, created = User.objects.get_or_create(
            email='admin@velora.com',
            defaults={
                'first_name': 'Velora',
                'last_name': 'Admin',
                'role': super_admin_role,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('Admin123!')
            admin_user.save()

        staff_user, created = User.objects.get_or_create(
            email='staff@velora.com',
            defaults={
                'first_name': 'Store',
                'last_name': 'Manager',
                'role': staff_role,
                'is_staff': True,
            }
        )
        if created:
            staff_user.set_password('Staff123!')
            staff_user.save()

        customer_user, created = User.objects.get_or_create(
            email='customer@velora.com',
            defaults={
                'first_name': 'Jane',
                'last_name': 'Doe',
                'role': customer_role,
                'phone': '+1 (555) 234-5678',
            }
        )
        if created:
            customer_user.set_password('Customer123!')
            customer_user.save()

        # 3. Create Coupons
        Coupon.objects.get_or_create(
            code='WELCOME10',
            defaults={
                'description': '10% off for new luxury clients',
                'discount_type': 'PERCENTAGE',
                'discount_value': Decimal('10.00'),
                'min_order_amount': Decimal('50.00'),
                'is_active': True
            }
        )

        Coupon.objects.get_or_create(
            code='VELORA50',
            defaults={
                'description': '$50 flat discount on orders over $300',
                'discount_type': 'FIXED',
                'discount_value': Decimal('50.00'),
                'min_order_amount': Decimal('300.00'),
                'is_active': True
            }
        )

        # 4. Create Shipping Address for Customer
        Address.objects.get_or_create(
            user=customer_user,
            is_default=True,
            defaults={
                'full_name': 'Jane Doe',
                'phone': '+1 (555) 234-5678',
                'address_line_1': '742 Evergreen Terrace',
                'address_line_2': 'Suite 4B',
                'city': 'San Francisco',
                'state': 'CA',
                'postal_code': '94107',
                'country': 'United States'
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded VELORA base system users (Admin, Staff, Customer)!'))
