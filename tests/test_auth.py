import pytest
from rest_framework.test import APIClient
from apps.users.models import User, Role

@pytest.mark.django_db
class TestAuth:
    def setup_method(self):
        self.client = APIClient()

    def test_register_success(self):
        response = self.client.post('/api/auth/register/', {
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'testuser@example.com',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!'
        })
        assert response.status_code == 201
        assert response.data['success'] is True
        assert 'tokens' in response.data['data']

    def test_register_duplicate_email(self):
        User.objects.create_user(email='existing@example.com', password='Password123!')
        response = self.client.post('/api/auth/register/', {
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'existing@example.com',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!'
        })
        assert response.status_code == 400
        assert response.data['success'] is False

    def test_login_success(self):
        User.objects.create_user(email='login@example.com', password='Password123!')
        response = self.client.post('/api/auth/login/', {
            'email': 'login@example.com',
            'password': 'Password123!'
        })
        assert response.status_code == 200
        assert response.data['success'] is True
        assert 'access' in response.data['data']['tokens']

    def test_login_invalid_password(self):
        User.objects.create_user(email='login2@example.com', password='Password123!')
        response = self.client.post('/api/auth/login/', {
            'email': 'login2@example.com',
            'password': 'WrongPassword!'
        })
        assert response.status_code == 401
        assert response.data['success'] is False
