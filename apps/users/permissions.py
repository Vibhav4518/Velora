from rest_framework.permissions import BasePermission
from apps.users.models import Role

class HasPermission(BasePermission):
    def __init__(self, required_permission=None):
        self.required_permission = required_permission

    def __call__(self):
        return self

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        perm = getattr(view, 'required_permission', self.required_permission)
        if not perm:
            return True
        return request.user.has_role_permission(perm)


class IsAdminOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or (request.user.role and request.user.role.name in [Role.SUPER_ADMIN, Role.ADMIN])


class IsStaffOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff or (request.user.role and request.user.role.name in [Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF])


class IsSuperAdminOnly(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or (request.user.role and request.user.role.name == Role.SUPER_ADMIN)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or (request.user.role and request.user.role.name in [Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF])
        )
