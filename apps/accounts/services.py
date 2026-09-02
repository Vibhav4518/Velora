from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import User, Role

class AuthService:
    @staticmethod
    def generate_tokens_for_user(user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    @staticmethod
    def register_user(data):
        email = data.get('email')
        password = data.get('password')

        if User.objects.filter(email__iexact=email).exists():
            raise ValueError("A user with this email address already exists.")

        customer_role, _ = Role.objects.get_or_create(
            name=Role.CUSTOMER,
            defaults={'description': 'Standard customer account', 'is_system_role': True}
        )

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', ''),
            avatar_url=data.get('avatar_url', ''),
            role=customer_role
        )

        tokens = AuthService.generate_tokens_for_user(user)
        return user, tokens
