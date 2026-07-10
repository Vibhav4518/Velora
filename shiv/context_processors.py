from .decorators import has_role_permission


def admin_permissions(request):
    if not request.user.is_authenticated:
        return {}

    return {
        "can_view_dashboard": has_role_permission(request.user, "Can View Dashboard"),

        "can_manage_admins": has_role_permission(request.user, "Can Manage Admins"),
        "can_manage_roles": has_role_permission(request.user, "Can Manage Roles"),
        "can_manage_customers": has_role_permission(request.user, "Can Manage Customers"),

        "can_manage_products": has_role_permission(request.user, "Can Manage Products"),
        "can_manage_categories": has_role_permission(request.user, "Can Manage Categories"),

        "can_manage_orders": has_role_permission(request.user, "Can Manage Orders"),
        "can_manage_payments": has_role_permission(request.user, "Can Manage Payments"),

        "can_view_reports": has_role_permission(request.user, "Can View Reports"),
    }