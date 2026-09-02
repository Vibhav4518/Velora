import pytest
from rest_framework.test import APIClient
from apps.users.models import User, Role
from apps.catalog.models import Product
from apps.categories.models import Category
from apps.shipping.models import Address
from apps.cart.services import CartService
from decimal import Decimal

@pytest.mark.django_db
class TestOrders:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='customer_order@example.com', password='Password123!')
        self.address = Address.objects.create(
            user=self.user,
            full_name='Test Name',
            phone='+1 555-1234',
            address_line_1='123 Main St',
            city='San Francisco',
            state='CA',
            postal_code='94107'
        )
        self.category = Category.objects.create(name='Shoes', slug='shoes')
        self.product = Product.objects.create(
            sku='SHOE-001',
            name='Running Shoes',
            slug='running-shoes',
            description='Best shoes',
            price=Decimal('100.00'),
            category=self.category,
            stock_quantity=5
        )

    def test_checkout_and_place_order(self):
        self.client.force_authenticate(user=self.user)

        # Add product to cart
        cart = CartService.get_or_create_cart(user=self.user)
        CartService.add_item(cart, product_id=self.product.id, quantity=2)

        # Checkout
        response = self.client.post('/api/orders/checkout/', {
            'address_id': self.address.id,
            'payment_method': 'CREDIT_CARD'
        }, format='json')

        assert response.status_code == 201
        assert response.data['success'] is True
        assert response.data['data']['order_status'] == 'CONFIRMED'
        assert response.data['data']['payment_status'] == 'PAID'

        # Check stock reduced
        self.product.refresh_from_db()
        assert self.product.stock_quantity == 3
