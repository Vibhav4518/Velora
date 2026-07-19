from functools import wraps

from django.contrib import messages
from django.shortcuts import redirect


def has_role_permission(user, permission_name):
    if not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    role = getattr(user, "role", None)

    if not role:
        return False

    if role.role_name == "Super Admin":
        return True

    return role.permissions.filter(
        permission_name=permission_name
    ).exists()


def role_permission_required(permission_name):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user = request.user

            if not user.is_authenticated:
                return redirect("login_user")

            if not user.is_staff:
                messages.error(
                    request,
                    "You are not allowed to access the admin panel.",
                )
                return redirect("home_page")

            if not has_role_permission(user, permission_name):
                messages.error(
                    request,
                    "You do not have permission to access this section.",
                )
                return redirect("admin_dashboard")

            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator