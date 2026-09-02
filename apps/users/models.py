from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class Permission(models.Model):
    code = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    module = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.module}.{self.code}"


class Role(models.Model):
    SUPER_ADMIN = 'SUPER_ADMIN'
    ADMIN = 'ADMIN'
    STAFF = 'STAFF'
    CUSTOMER = 'CUSTOMER'

    ROLE_CHOICES = [
        (SUPER_ADMIN, 'Super Admin'),
        (ADMIN, 'Admin'),
        (STAFF, 'Staff'),
        (CUSTOMER, 'Customer'),
    ]

    name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES, db_index=True)
    description = models.TextField(blank=True, default='')
    permissions = models.ManyToManyField(Permission, blank=True, related_name='roles')
    is_system_role = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        super_admin_role, _ = Role.objects.get_or_create(
            name=Role.SUPER_ADMIN,
            defaults={'description': 'Super Administrator', 'is_system_role': True}
        )
        extra_fields['role'] = super_admin_role

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30, blank=True, default='')
    avatar_url = models.URLField(max_length=1000, blank=True, default='')
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    custom_permissions = models.ManyToManyField(Permission, blank=True, related_name='custom_user_permissions')

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        ordering = ['-date_joined']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def role_name(self):
        return self.role.name if self.role else 'CUSTOMER'

    def has_role_permission(self, perm_code):
        if self.is_superuser or (self.role and self.role.name == Role.SUPER_ADMIN):
            return True
        if self.custom_permissions.filter(code=perm_code).exists():
            return True
        if self.role and self.role.permissions.filter(code=perm_code).exists():
            return True
        return False

    def __str__(self):
        return f"{self.email} ({self.role_name})"
