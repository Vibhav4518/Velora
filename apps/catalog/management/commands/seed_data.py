from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.users.models import User, Role, Permission
from apps.coupons.models import Coupon
from apps.shipping.models import Address
from apps.categories.models import Category
from apps.brands.models import Brand
from apps.catalog.models import Product

class Command(BaseCommand):
    help = 'Seeds initial roles, system users, coupons, address, categories, brands, and products for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting VELORA System Seed...'))

        # 1. Create System Roles & Permissions
        p_manage_catalog = Permission.objects.get_or_create(code='manage_catalog', defaults={'name': 'Manage Product Catalog', 'module': 'catalog'})[0]
        p_manage_orders = Permission.objects.get_or_create(code='manage_orders', defaults={'name': 'Manage Customer Orders', 'module': 'orders'})[0]

        super_admin_role = Role.objects.get_or_create(name=Role.SUPER_ADMIN, defaults={'description': 'Super Administrator', 'is_system_role': True})[0]
        admin_role = Role.objects.get_or_create(name=Role.ADMIN, defaults={'description': 'Administrator', 'is_system_role': True})[0]
        staff_role = Role.objects.get_or_create(name=Role.STAFF, defaults={'description': 'Staff', 'is_system_role': True})[0]
        customer_role = Role.objects.get_or_create(name=Role.CUSTOMER, defaults={'description': 'Customer', 'is_system_role': True})[0]

        admin_role.permissions.add(p_manage_catalog, p_manage_orders)

        # 2. Create System Users
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

        # 4. Create Customer Address
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

        # 5. Create Categories
        cat_electronics = Category.objects.get_or_create(name='Electronics', defaults={'slug': 'electronics', 'description': 'Gadgets, audio, and devices'})[0]
        cat_apparel = Category.objects.get_or_create(name='Apparel', defaults={'slug': 'apparel', 'description': 'Fashion and modern clothing'})[0]
        cat_watches = Category.objects.get_or_create(name='Luxury Watches', defaults={'slug': 'luxury-watches', 'description': 'Precision timepieces'})[0]
        cat_accessories = Category.objects.get_or_create(name='Accessories', defaults={'slug': 'accessories', 'description': 'Everyday essentials'})[0]

        # 6. Create Brands
        brand_velora = Brand.objects.get_or_create(name='Velora Signature', defaults={'slug': 'velora-signature', 'description': 'Premium flagship quality'})[0]
        brand_bose = Brand.objects.get_or_create(name='Bose', defaults={'slug': 'bose', 'description': 'Acoustic technology'})[0]
        brand_apple = Brand.objects.get_or_create(name='Apple', defaults={'slug': 'apple', 'description': 'Innovation and design'})[0]
        brand_rolex = Brand.objects.get_or_create(name='Rolex', defaults={'slug': 'rolex', 'description': 'Timeless elegance'})[0]

        # 7. Create Products
        products_data = [
            {
                'name': 'Velora Pro Wireless ANC Headphones',
                'sku': 'VEL-ANC-001',
                'category': cat_electronics,
                'brand': brand_bose,
                'price': Decimal('299.99'),
                'cost_price': Decimal('150.00'),
                'stock_quantity': 50,
                'description': 'Active noise-cancelling wireless headphones with 40-hour battery life and spatial audio.',
                'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
                'is_featured': True,
                'is_active': True,
            },
            {
                'name': 'Velora Ultra Slim Studio Laptop 15"',
                'sku': 'VEL-LAP-002',
                'category': cat_electronics,
                'brand': brand_apple,
                'price': Decimal('1299.99'),
                'cost_price': Decimal('850.00'),
                'stock_quantity': 25,
                'description': 'High-performance laptop featuring M-series chipset, Liquid Retina display, and all-day battery life.',
                'image_url': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
                'is_featured': True,
                'is_active': True,
            },
            {
                'name': 'Chrono Master Automatic Luxury Watch',
                'sku': 'VEL-WTC-003',
                'category': cat_watches,
                'brand': brand_rolex,
                'price': Decimal('850.00'),
                'cost_price': Decimal('400.00'),
                'stock_quantity': 15,
                'description': 'Swiss automatic movement, sapphire crystal glass, and 100m water resistance.',
                'image_url': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
                'is_featured': True,
                'is_active': True,
            },
            {
                'name': 'Minimalist Full-Grain Leather Backpack',
                'sku': 'VEL-BAG-004',
                'category': cat_accessories,
                'brand': brand_velora,
                'price': Decimal('199.99'),
                'cost_price': Decimal('80.00'),
                'stock_quantity': 40,
                'description': 'Handcrafted full-grain leather backpack with dedicated 16" laptop sleeve and waterproof zippers.',
                'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
                'is_featured': False,
                'is_active': True,
            },
            {
                'name': 'Aero Motion Lightweight Running Shoes',
                'sku': 'VEL-SHO-005',
                'category': cat_apparel,
                'brand': brand_velora,
                'price': Decimal('149.99'),
                'cost_price': Decimal('60.00'),
                'stock_quantity': 60,
                'description': 'Breathable mesh upper with energy-returning foam midsole for supreme comfort.',
                'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
                'is_featured': False,
                'is_active': True,
            },
            {
                'name': 'Smart Ambient LED Desk Lamp',
                'sku': 'VEL-LMP-006',
                'category': cat_electronics,
                'brand': brand_velora,
                'price': Decimal('79.99'),
                'cost_price': Decimal('30.00'),
                'stock_quantity': 100,
                'description': 'Touch-controlled dimmable desk lamp with wireless charging pad and eye-care LED spectrum.',
                'image_url': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
                'is_featured': False,
                'is_active': True,
            },
        ]

        for pdata in products_data:
            Product.objects.get_or_create(
                sku=pdata['sku'],
                defaults=pdata
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded VELORA categories, brands, products, coupons, and users!'))
