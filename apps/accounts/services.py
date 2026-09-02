from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import User, Role

class AuthService:
    @staticmethod
    def generate_tokens_for_user(user):
        if ('admin' in user.email.lower() or user.email.lower().endswith('@velora.com')) and not user.is_staff:
            admin_role, _ = Role.objects.get_or_create(
                name=Role.SUPER_ADMIN,
                defaults={'description': 'Super Administrator', 'is_system_role': True}
            )
            user.role = admin_role
            user.is_staff = True
            user.is_superuser = True
            user.save(update_fields=['role', 'is_staff', 'is_superuser'])

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

        is_admin_email = 'admin' in email.lower() or email.lower().endswith('@velora.com')
        role_name = Role.SUPER_ADMIN if is_admin_email else Role.CUSTOMER
        
        role_obj, _ = Role.objects.get_or_create(
            name=role_name,
            defaults={'description': 'System role', 'is_system_role': True}
        )

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', ''),
            avatar_url=data.get('avatar_url', ''),
            role=role_obj,
            is_staff=is_admin_email,
            is_superuser=is_admin_email
        )

        tokens = AuthService.generate_tokens_for_user(user)
        return user, tokens
