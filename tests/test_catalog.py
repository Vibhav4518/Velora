import pytest
from rest_framework.test import APIClient
from apps.users.models import User, Role
from apps.catalog.models import Product
from apps.categories.models import Category
from decimal import Decimal

@pytest.mark.django_db
class TestCatalog:
    def setup_method(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Gadgets', slug='gadgets')
        self.product = Product.objects.create(
            sku='TEST-001',
            name='Test Phone',
            slug='test-phone',
            description='Test phone description',
            price=Decimal('500.00'),
            category=self.category,
            stock_quantity=10
        )
        admin_role, _ = Role.objects.get_or_create(name=Role.ADMIN)
        self.admin_user = User.objects.create_superuser(
            email='admin_test@example.com',
            password='AdminPassword123!',
            role=admin_role
        )

    def test_list_products(self):
        response = self.client.get('/api/products/')
        assert response.status_code == 200
        assert response.data['success'] is True
        assert 'results' in response.data['data']

    def test_search_product(self):
        response = self.client.get('/api/products/?search=Phone')
        assert response.status_code == 200
        assert len(response.data['data']['results']) >= 1

    def test_create_product_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/products/', {
            'sku': 'TEST-002',
            'name': 'New Tablet',
            'slug': 'new-tablet',
            'description': 'Description',
            'price': '300.00',
            'category': self.category.id,
            'stock_quantity': 15,
            'image_urls': ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80']
        }, format='json')
        assert response.status_code == 201
        assert response.data['success'] is True

    def test_create_product_unauthorized(self):
        response = self.client.post('/api/products/', {
            'sku': 'TEST-003',
            'name': 'Hacker Tablet',
            'description': 'Description',
            'price': '100.00'
        }, format='json')
        assert response.status_code in [401, 403]
