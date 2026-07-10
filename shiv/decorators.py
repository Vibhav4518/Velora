from functools import wraps
from django.shortcuts import redirect
from django.contrib import messages


def has_role_permission(user, permission_name):
    if not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    if user.role and user.role.role_name == "Super Admin":
        return True

    if user.role and user.role.permissions.filter(permission_name=permission_name).exists():
        return True

    return False


def role_permission_required(permission_name):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):

            if not request.user.is_authenticated:
                return redirect("login_user")

            if not request.user.is_staff:
                messages.error(request, "You are not allowed to access admin panel.")
                return redirect("home_page")

            if not has_role_permission(request.user, permission_name):
                messages.error(request, "You do not have permission to access this section.")
                return redirect("admin_dashboard")

            return view_func(request, *args, **kwargs)

        return wrapper
    return decorator