from django.db.models import Q
from apps.users.models import User, Role, Permission

def get_user_list(search=None, role=None):
    queryset = User.objects.all().select_related('role').order_by('-date_joined')
    if search:
        queryset = queryset.filter(
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(phone__icontains=search)
        )
    if role:
        queryset = queryset.filter(role__name=role)
    return queryset

def get_user_by_id(user_id):
    return User.objects.filter(id=user_id).select_related('role').first()

def get_user_by_email(email):
    return User.objects.filter(email__iexact=email).select_related('role').first()

def get_role_list():
    return Role.objects.all().prefetch_related('permissions')

def get_permission_list():
    return Permission.objects.all()
