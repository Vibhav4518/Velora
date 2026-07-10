from multiprocessing import context

from django.shortcuts import get_object_or_404, redirect, render
from django.http import JsonResponse
from django.db.models import Sum, Q, Count
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

from .decorators import role_permission_required, has_role_permission
from .models import (
    Cart,
    Role,
    Permission,
    User,
    Category,
    Product,
    ProductImage,
    CartItem,
    Order,
    Wishlist,
    UserAddress,
)
from .forms import ProfileForm, UserAddressForm

#-----------------------------------------
from openpyxl import load_workbook
from django.conf import settings
from django.core.files import File
from pathlib import Path



# ==========================================================
# COMMON ADMIN QUERY HELPERS
# ==========================================================

def get_customers_queryset():
    """
    Common customer query.
    Use this everywhere: dashboard, customer page, reports, etc.
    """
    return (
        User.objects
        .filter(is_superuser=False)
        .exclude(is_staff=True)
        .select_related("role")
        .order_by("-date_joined")
    )


def get_admins_queryset():
    """
    Common admin users query.
    """
    return (
        User.objects
        .filter(is_staff=True)
        .select_related("role")
        .order_by("-date_joined")
    )


def get_products_queryset():
    """
    Common products query.
    """
    return Product.objects.select_related("category").prefetch_related("images")


def get_orders_queryset():
    """
    Common orders query.
    """
    return (
        Order.objects
        .select_related("user", "address")
        .prefetch_related("items")
        .order_by("-order_date")
    )


def get_admin_permissions_context(user):
    """
    Common sidebar permission context.
    Add this context to admin pages where sidebar permission menu is used.
    """
    return {
        "can_view_dashboard": has_role_permission(user, "Can View Dashboard"),
        "can_manage_admins": has_role_permission(user, "Can Manage Admins"),
        "can_manage_roles": has_role_permission(user, "Can Manage Roles"),
        "can_manage_products": has_role_permission(user, "Can Manage Products"),
        "can_manage_categories": has_role_permission(user, "Can Manage Categories"),
        "can_manage_orders": has_role_permission(user, "Can Manage Orders"),
        "can_manage_customers": has_role_permission(user, "Can Manage Customers"),
        "can_view_reports": has_role_permission(user, "Can View Reports"),
        "can_manage_payments": has_role_permission(user, "Can Manage Payments"),
    }


# ==========================================================
# WEBSITE PAGES
# ==========================================================

def home(request):
    categories = Category.objects.filter(is_active=True).annotate(
        product_count=Count("products")
    )[:8]

    featured_products = (
        Product.objects.filter(is_active=True)
        .prefetch_related("images")
        .select_related("category")
        .order_by("-created_at")[:8]
    )

    new_arrivals = (
        Product.objects.filter(is_active=True)
        .prefetch_related("images")
        .select_related("category")
        .order_by("-created_at")[:3]
    )

    context = {
        "categories": categories,
        "featured_products": featured_products,
        "new_arrivals": new_arrivals,
    }

    return render(request, "home.html", context)


def categories(request):
    return render(request, "categories.html")


def deals(request):
    return render(request, "deals.html")


def blog(request):
    return render(request, "blog.html")


def contact(request):
    return render(request, "contact.html")


def shop(request):
    products = Product.objects.filter(is_active=True).prefetch_related("images")
    return render(request, "shop.html", {"products": products})


def product_details(request, product_id):
    product = get_object_or_404(
        Product.objects.prefetch_related("images"),
        id=product_id
    )
    return render(request, "productDetails.html", {"product": product})


def product_list(request):
    products = Product.objects.filter(is_active=True)
    return render(request, "productList.html", {"products": products})


# ==========================================================
# AUTHENTICATION
# ==========================================================

def user_registration(request):
    if request.method == "POST":
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        email = request.POST.get("email")
        password = request.POST.get("password")
        mobile_no = request.POST.get("mobile_no")
        profile_image = request.FILES.get("profile_image")

        if not first_name or not last_name or not email or not password:
            messages.error(request, "All fields are required.")
            return render(request, "register.html")

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already exists.")
            return render(request, "register.html")

        username = email.split("@")[0]

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists.")
            return render(request, "register.html")

        role = Role.objects.filter(role_name="User").first()

        user = User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            email=email,
            username=username,
            password=password,
            role=role,
            mobile_no=mobile_no,
            is_staff=False,
            is_active=True,
        )

        if profile_image:
            user.profile_image = profile_image
            user.save()

        messages.success(request, "Registration successful. Please login.")
        return redirect("login_user")

    return render(request, "register.html")


def user_login(request):
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect("admin_dashboard")
        return redirect("home_page")

    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        if not email or not password:
            messages.error(request, "Email and password are required.")
            return render(request, "login.html")

        user_obj = User.objects.filter(email=email).first()

        if not user_obj:
            messages.error(request, "Email does not exist.")
            return render(request, "login.html")

        user = authenticate(
            request,
            username=user_obj.username,
            password=password
        )

        if user is None:
            messages.error(request, "Invalid password.")
            return render(request, "login.html")

        login(request, user)
        messages.success(request, "Login successful.")

        if user.is_staff:
            return redirect("admin_dashboard")

        return redirect("home_page")

    return render(request, "login.html")


def user_logout(request):
    logout(request)
    messages.success(request, "Logout successful.")
    return redirect("home_page")


# ==========================================================
# WISHLIST
# ==========================================================

@login_required
def add_to_wishlist(request, product_id):

    product = get_object_or_404(Product, id=product_id)

    wishlist, created = Wishlist.objects.get_or_create(
        user=request.user,
        product=product
    )

    if created:
        return JsonResponse({
            "status": "added"
        })

    wishlist.delete()

    return JsonResponse({
        "status": "removed"
    })

@login_required
def wishlist_page(request):

    wishlist_items = Wishlist.objects.filter(
        user=request.user
    ).select_related(
        "product",
        "product__category"
    ).prefetch_related(
        "product__images"
    )

    total_items = wishlist_items.count()

    context = {
        "wishlist_items": wishlist_items,
        "total_items": total_items,
    }

    return render(
        request,
        "wishlist.html",
        context
    )
    
@login_required
def remove_from_wishlist(request, item_id):

    item = get_object_or_404(
        Wishlist,
        id=item_id,
        user=request.user
    )

    item.delete()

    messages.success(request, "Removed from wishlist.")

    return redirect("wishlist_page")

@login_required
def move_to_cart(request, item_id):

    wishlist = get_object_or_404(
        Wishlist,
        id=item_id,
        user=request.user
    )

    cart, created = Cart.objects.get_or_create(
        user=request.user
    )

    CartItem.objects.get_or_create(
        cart=cart,
        product=wishlist.product,
        defaults={
            "quantity": 1,
            "price": wishlist.product.price,
        }
    )

    wishlist.delete()

    messages.success(request, "Moved to cart.")

    return redirect("wishlist_page")


@login_required
def clear_wishlist(request):

    Wishlist.objects.filter(
        user=request.user
    ).delete()

    messages.success(request, "Wishlist cleared.")

    return redirect("wishlist_page")

# ==========================================================
# PROFILE
# ==========================================================

def address_data(address):
    return {
        "id": str(address.id),
        "full_name": address.full_name,
        "mobile_no": address.mobile_no,
        "address_line1": address.address_line1,
        "address_line2": address.address_line2 or "",
        "city": address.city,
        "state_name": address.state_name,
        "country_name": address.country_name,
        "pincode": address.pincode,
        "is_default": address.is_default,
    }


@login_required
def my_profile(request):
    address_form = UserAddressForm()

    addresses = UserAddress.objects.filter(user=request.user).order_by("-is_default", "-id")
    default_address = addresses.filter(is_default=True).first()
    other_addresses = addresses.filter(is_default=False)

    orders = Order.objects.filter(user=request.user).order_by("-order_date")[:5]
    wishlist_items = Wishlist.objects.filter(user=request.user).select_related("product")[:4]

    return render(request, "myProfile.html", {
        "address_form": address_form,
        "default_address": default_address,
        "other_addresses": other_addresses,
        "orders": orders,
        "wishlist_items": wishlist_items,
    })


@login_required
def update_profile_ajax(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid request."})

    user = request.user

    user.first_name = request.POST.get("first_name", "").strip()
    user.last_name = request.POST.get("last_name", "").strip()
    user.username = request.POST.get("username", "").strip()
    user.email = request.POST.get("email", "").strip()
    user.mobile_no = request.POST.get("mobile_no", "").strip()

    if request.FILES.get("profile_image"):
        user.profile_image = request.FILES.get("profile_image")

    user.save()

    return JsonResponse({
        "status": "success",
        "message": "Profile updated successfully.",
        "user": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "email": user.email,
            "mobile_no": user.mobile_no or "",
            "profile_image": user.profile_image.url if user.profile_image else "",
        }
    })


@login_required
def add_address_ajax(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid request."})

    form = UserAddressForm(request.POST)

    if not form.is_valid():
        return JsonResponse({
            "status": "error",
            "message": "Please fill all address fields correctly."
        })

    address = form.save(commit=False)
    address.user = request.user

    has_address = UserAddress.objects.filter(user=request.user).exists()

    if not has_address:
        address.is_default = True

    if address.is_default:
        UserAddress.objects.filter(user=request.user).update(is_default=False)

    address.save()

    return JsonResponse({
        "status": "success",
        "message": "Address added successfully.",
        "address": address_data(address),
    })


@login_required
def edit_address_ajax(request, address_id):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid request."})

    address = get_object_or_404(UserAddress, id=address_id, user=request.user)
    form = UserAddressForm(request.POST, instance=address)

    if not form.is_valid():
        return JsonResponse({
            "status": "error",
            "message": "Please fill all address fields correctly."
        })

    updated_address = form.save(commit=False)

    if updated_address.is_default:
        UserAddress.objects.filter(user=request.user).exclude(id=address_id).update(is_default=False)

    updated_address.save()

    return JsonResponse({
        "status": "success",
        "message": "Address updated successfully.",
        "address": address_data(updated_address),
    })


@login_required
def set_default_address_ajax(request, address_id):
    address = get_object_or_404(UserAddress, id=address_id, user=request.user)

    UserAddress.objects.filter(user=request.user).update(is_default=False)
    address.is_default = True
    address.save()

    return JsonResponse({
        "status": "success",
        "message": "Default address updated.",
        "address": address_data(address),
    })


@login_required
def delete_address_ajax(request, address_id):
    address = get_object_or_404(UserAddress, id=address_id, user=request.user)

    was_default = address.is_default
    address.delete()

    new_default = None

    if was_default:
        new_default = UserAddress.objects.filter(user=request.user).first()

        if new_default:
            new_default.is_default = True
            new_default.save()

    return JsonResponse({
        "status": "success",
        "message": "Address deleted successfully.",
        "deleted_id": str(address_id),
        "new_default": address_data(new_default) if new_default else None,
    })


    
# ==========================================================
# CART
# ==========================================================

@login_required
def cart_page(request):
    cart, created = Cart.objects.get_or_create(user=request.user)

    cart_items = CartItem.objects.filter(cart=cart).select_related(
        "product", "product__category"
    ).prefetch_related("product__images")

    subtotal = 0

    for item in cart_items:
     item.subtotal = item.price * item.quantity
     subtotal += item.subtotal

    shipping = 0
    discount = 0
    total = subtotal + shipping - discount

    context = {
        "cart": cart,
        "cart_items": cart_items,
        "subtotal": subtotal,
        "shipping": shipping,
        "discount": discount,
        "total": total,
    }

    return render(request, "cart.html", context)


@login_required
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id, is_active=True)

    cart, created = Cart.objects.get_or_create(user=request.user)

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={
            "quantity": 1,
            "price": product.price,
        }
    )

    if not created:
        cart_item.quantity += 1
        cart_item.save()

    return JsonResponse({
        "status": "success",
        "message": "Product added to cart."
    })


@login_required
def remove_cart(request, product_id):
    cart = get_object_or_404(Cart, user=request.user)

    cart_item = get_object_or_404(
        CartItem,
        cart=cart,
        product_id=product_id
    )

    cart_item.delete()

    messages.success(request, "Product removed from cart.")
    return redirect("cart")

# ==========================================================
# CHECKOUT
# ==========================================================

@login_required
def checkout(request):
    cart = Cart.objects.filter(user=request.user).first()
    cart_items = CartItem.objects.filter(cart=cart).select_related("product") if cart else []

    subtotal = sum(item.price * item.quantity for item in cart_items)
    shipping = 0 if subtotal >= 999 and subtotal > 0 else 99
    total = subtotal + shipping if subtotal > 0 else 0

    addresses = UserAddress.objects.filter(user=request.user)
    selected_address = addresses.filter(is_default=True).first()

    return render(request, "checkout.html", {
        "cart_items": cart_items,
        "subtotal": subtotal,
        "shipping": shipping,
        "total": total,
        "addresses": addresses,
        "selected_address": selected_address,
    })


@login_required
def checkout_set_address(request, address_id):
    address = get_object_or_404(UserAddress, id=address_id, user=request.user)

    UserAddress.objects.filter(user=request.user).update(is_default=False)
    address.is_default = True
    address.save()

    return JsonResponse({
        "status": "success",
        "message": "Delivery address updated.",
        "address": {
            "id": str(address.id),
            "full_name": address.full_name,
            "mobile_no": address.mobile_no,
            "address_line1": address.address_line1,
            "address_line2": address.address_line2 or "",
            "city": address.city,
            "state_name": address.state_name,
            "country_name": address.country_name,
            "pincode": address.pincode,
        }
    })

# ==========================================================
# ADMIN DASHBOARD
# ==========================================================

@login_required
def admin_dashboard(request):
    if not request.user.is_staff:
        messages.error(request, "You are not allowed to access admin panel.")
        return redirect("home_page")

    if not has_role_permission(request.user, "Can View Dashboard"):
        messages.error(request, "You do not have permission to access dashboard.")
        return redirect("home_page")

    customers = get_customers_queryset()
    products = get_products_queryset()
    orders = get_orders_queryset()

    total_sales = orders.aggregate(total=Sum("total_amount"))["total"] or 0

    context = {
        "total_sales": total_sales,
        "total_orders": orders.count(),
        "total_customers": customers.count(),
        "total_products": products.count(),
        "recent_orders": orders[:5],
    }

    context.update(get_admin_permissions_context(request.user))

    return render(request, "adminDashboard.html", context)


# ==========================================================
# DEFAULT ROLES AND PERMISSIONS
# ==========================================================

def create_default_permissions_roles():
    permission_names = [
        "Can View Dashboard",

        "Can Manage Admins",
        "Can Manage Roles",
        "Can Manage Customers",

        "Can Manage Products",
        "Can Delete Products",
        "Can Manage Categories",

        "Can Manage Orders",
        "Can View Orders",
        "Can Manage Payments",

        "Can View Reports",

        "Can Buy Products",
        "Can Manage Wishlist",
    ]

    permissions = {}

    for name in permission_names:
        permission, created = Permission.objects.get_or_create(
            permission_name=name
        )
        permissions[name] = permission

    super_admin, created = Role.objects.get_or_create(
        role_name="Super Admin",
        defaults={"is_default": True}
    )
    super_admin.is_default = True
    super_admin.save()
    super_admin.permissions.set(Permission.objects.all())

    admin, created = Role.objects.get_or_create(
        role_name="Admin",
        defaults={"is_default": True}
    )
    admin.is_default = True
    admin.save()
    admin.permissions.set([
        permissions["Can View Dashboard"],
        permissions["Can Manage Products"],
        permissions["Can Delete Products"],
        permissions["Can Manage Categories"],
        permissions["Can Manage Orders"],
        permissions["Can View Orders"],
        permissions["Can ManageCustomers"] if "Can ManageCustomers" in permissions else permissions["Can Manage Customers"],
        permissions["Can Manage Payments"],
        permissions["Can View Reports"],
    ])

    user, created = Role.objects.get_or_create(
        role_name="User",
        defaults={"is_default": True}
    )
    user.is_default = True
    user.save()
    user.permissions.set([
        permissions["Can Buy Products"],
        permissions["Can Manage Wishlist"],
        permissions["Can View Orders"],
    ])

# ==========================================================
# ADMIN ROLE MANAGEMENT
# ==========================================================

@role_permission_required("Can Manage Roles")
@login_required
def admin_role_list(request):
    query = request.GET.get("q", "")

    roles = Role.objects.all().order_by("-created_at")

    if query:
        roles = roles.filter(role_name__icontains=query)

    context = {
        "roles": roles,
        "permissions": Permission.objects.all().order_by("permission_name"),
        "total_roles": Role.objects.count(),
        "default_roles": Role.objects.filter(is_default=True).count(),
        "total_permissions": Permission.objects.count(),
    }

    return render(request, "adminRoleList.html", context)

@role_permission_required("Can Manage Roles")
def admin_edit_role(request, role_id):
    role = get_object_or_404(Role, id=role_id)

    if role.is_default:
        messages.error(request, "Default role cannot be edited.")
        return redirect("admin_role_list")

    if request.method == "POST":
        role_name = request.POST.get("role_name")

        if not role_name:
            messages.error(request, "Role name is required.")
            return redirect("admin_role_list")

        if Role.objects.filter(role_name__iexact=role_name).exclude(id=role.id).exists():
            messages.error(request, "Role already exists.")
            return redirect("admin_role_list")

        role.role_name = role_name
        role.save()

        messages.success(request, "Role updated successfully.")
        return redirect("admin_role_list")

    return redirect("admin_role_list")

@role_permission_required("Can Manage Roles")
@login_required
def admin_add_role(request):
    if request.method == "POST":
        role_name = request.POST.get("role_name", "").strip()

        if not role_name:
            messages.error(request, "Role name is required.")

        elif Role.objects.filter(role_name__iexact=role_name).exists():
            messages.error(request, "Role already exists.")

        else:
            Role.objects.create(role_name=role_name)
            messages.success(request, "Role created successfully.")

    return redirect("admin_role_list")

@role_permission_required("Can Manage Roles")
def admin_delete_role(request, role_id):
    role = get_object_or_404(Role, id=role_id)

    if role.is_default:
        messages.error(request, "Default roles cannot be deleted.")
        return redirect("admin_role_list")

    role.delete()
    messages.success(request, "Role deleted successfully.")
    return redirect("admin_role_list")


@role_permission_required("Can Manage Roles")
def admin_role_permission(request, role_id):
    role = get_object_or_404(Role, id=role_id)
    permissions = Permission.objects.all().order_by("permission_name")

    if request.method == "POST":
        if role.is_default:
            messages.error(request, "Default role permissions cannot be modified.")
            return redirect("admin_role_list")

        permission_ids = request.POST.getlist("permissions")
        role.permissions.set(permission_ids)

        messages.success(request, "Permissions updated successfully.")
        return redirect("admin_role_list")

    return render(request, "adminRolePermission.html", {
        "role": role,
        "permissions": permissions,
    })


# ==========================================================
# ADMIN USERS
# ==========================================================

# ==========================================================
# ADMIN USERS
# ==========================================================

@role_permission_required("Can Manage Admins")
@login_required
def admin_users(request):
    query = request.GET.get("q", "")

    # Common Admin Query
    users = get_admins_queryset()

    if query:
        users = users.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query) |
            Q(mobile_no__icontains=query) |
            Q(role__role_name__icontains=query)
        )

    roles = Role.objects.all().order_by("role_name")

    # Common Query for Dashboard Cards
    admins = get_admins_queryset()

    context = {
        "users": users,
        "roles": roles,

        "total_admins": admins.count(),
        "active_admins": admins.filter(is_active=True).count(),
        "inactive_admins": admins.filter(is_active=False).count(),
        "total_roles": Role.objects.count(),
    }

    # Sidebar Permissions
    context.update(get_admin_permissions_context(request.user))

    return render(request, "adminUserList.html", context)

@role_permission_required("Can Manage Admins")
def add_admin_user(request):
    roles = Role.objects.exclude(role_name="User")

    if request.method == "POST":
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        username = request.POST.get("username")
        email = request.POST.get("email")
        mobile_no = request.POST.get("mobile_no")
        role_id = request.POST.get("role")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")
        is_active = request.POST.get("is_active") == "1"

        if password != confirm_password:
            messages.error(request, "Password and confirm password do not match.")
            return redirect("admin_users")

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists.")
            return redirect("admin_users")

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already exists.")
            return redirect("admin_users")

        role = get_object_or_404(Role, id=role_id)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            mobile_no=mobile_no,
            role=role,
            is_active=is_active,
            is_staff=True,
        )

        if request.FILES.get("profile_image"):
            user.profile_image = request.FILES.get("profile_image")
            user.save()

        messages.success(request, "Admin user created successfully.")
        return redirect("admin_users")

    return render(request, "adminAddUser.html", {"roles": roles})


@login_required
def edit_admin_user(request, id):

    admin = get_object_or_404(User, id=id)

    roles = Role.objects.all()

    if request.method == "POST":

        admin.first_name = request.POST.get("first_name")
        admin.last_name = request.POST.get("last_name")
        admin.username = request.POST.get("username")
        admin.email = request.POST.get("email")
        admin.mobile_no = request.POST.get("mobile_no")

        role_id = request.POST.get("role")

        if role_id:
            admin.role = Role.objects.get(id=role_id)

        if request.FILES.get("profile_image"):
            admin.profile_image = request.FILES.get("profile_image")

        admin.save()

        messages.success(request, "Admin updated successfully.")

        return redirect("admin_users")

    context = {
        "admin": admin,
        "roles": roles,
    }

    return render(request, "adminEditUser.html", context)


@login_required
def change_admin_role(request, id):
    admin_user = get_object_or_404(User, id=id)
    roles = Role.objects.all()

    if request.method == "POST":
        role_id = request.POST.get("role")

        if role_id:
            admin_user.role = get_object_or_404(Role, id=role_id)
            admin_user.save()
            messages.success(request, "Role changed successfully.")
            return redirect("admin_users")

        messages.error(request, "Please select a role.")

    return render(request, "adminChangeRole.html", {
        "admin_user": admin_user,
        "roles": roles,
    })


@login_required
def reset_admin_password(request, id):
    admin_user = get_object_or_404(User, id=id)

    if request.method == "POST":
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")

        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return redirect("reset_admin_password", id=id)

        admin_user.set_password(password)
        admin_user.save()

        messages.success(request, "Password reset successfully.")
        return redirect("admin_users")

    return render(request, "adminResetPassword.html", {
        "admin_user": admin_user,
    })
    



@role_permission_required("Can Manage Admins")
def delete_admin_user(request, id):
    user = get_object_or_404(User, id=id, is_staff=True)

    if request.user.id == user.id:
        messages.error(request, "You cannot delete your own account.")
        return redirect("admin_users")

    user.delete()
    messages.success(request, "Admin user deleted successfully.")
    return redirect("admin_users")


# ==========================================================
# ADMIN PROFILE
# ==========================================================

@login_required
def admin_profile(request):
    if not request.user.is_staff:
        messages.error(request, "You are not allowed to access admin profile.")
        return redirect("home_page")

    if request.method == "POST":
        user = request.user

        user.first_name = request.POST.get("first_name")
        user.last_name = request.POST.get("last_name")
        user.username = request.POST.get("username")
        user.email = request.POST.get("email")
        user.mobile_no = request.POST.get("mobile_no")

        if request.FILES.get("profile_image"):
            user.profile_image = request.FILES.get("profile_image")

        user.save()

        messages.success(request, "Profile updated successfully.")
        return redirect("admin_profile")

    return render(request, "adminProfile.html")



# ==========================================================
# ADMIN CATALOG
# ==========================================================

@role_permission_required("Can Manage Categories")
@login_required
def add_category(request):

    if request.method == "POST":

        category_name = request.POST.get("category_name")
        description = request.POST.get("description")
        is_active = request.POST.get("is_active") == "True"
        image = request.FILES.get("category_image")

        if Category.objects.filter(category_name__iexact=category_name).exists():
            messages.error(request, "Category already exists.")
            return redirect("category_list")

        category = Category.objects.create(
            category_name=category_name,
            description=description,
            is_active=is_active,
            category_image=image
        )

        messages.success(request, "Category added successfully.")

    return redirect("category_list")

@role_permission_required("Can Manage Categories")
@login_required
def edit_category_admin(request, id):
    category = get_object_or_404(Category, id=id)

    if request.method == "POST":
        category.category_name = request.POST.get("category_name")
        category.description = request.POST.get("description")
        category.is_active = request.POST.get("is_active") == "True"

        if request.FILES.get("category_image"):
            category.category_image = request.FILES.get("category_image")

        category.save()
        messages.success(request, "Category updated successfully.")
        return redirect("category_list")

    return redirect("category_list")


@role_permission_required("Can Manage Categories")
@login_required
def delete_category_admin(request, id):
    category = get_object_or_404(Category, id=id)
    category.delete()

    messages.success(request, "Category deleted successfully.")
    return redirect("category_list")

@role_permission_required("Can Manage Categories")
def category_list(request):

    categories = Category.objects.annotate(
        total_products=Count("products")
    )

    context = {
        "categories": categories,
        "total_products": Product.objects.count(),
    }

    return render(request,"adminCategoryList.html",context)

@role_permission_required("Can Manage Products")
def add_product(request):
    categories = Category.objects.filter(is_active=True)

    if request.method == "POST":
        product_name = request.POST.get("product_name")
        short_description = request.POST.get("short_description")
        long_description = request.POST.get("long_description")
        price = request.POST.get("price")
        stock_quantity = request.POST.get("stock_quantity")
        category_id = request.POST.get("category_id")
        product_image = request.FILES.get("product_image")

        if not product_name or not price or not stock_quantity or not category_id:
            messages.error(request, "All required fields must be filled.")
            return render(request, "adminAddProducts.html", {"categories": categories})

        if Product.objects.filter(product_name__iexact=product_name).exists():
            messages.error(request, "Product already exists.")
            return render(request, "adminAddProducts.html", {"categories": categories})

        category = get_object_or_404(Category, id=category_id)

        product = Product.objects.create(
            product_name=product_name,
            short_description=short_description,
            long_description=long_description,
            price=price,
            stock_quantity=stock_quantity,
            category=category
        )

        if product_image:
            ProductImage.objects.create(
                product=product,
                image=product_image,
                is_primary=True
            )

        messages.success(request, "Product added successfully.")
        return redirect("admin_products")

    return render(request, "adminAddProducts.html", {"categories": categories})

@login_required
def admin_products(request):
    query = request.GET.get("q", "")

    products = Product.objects.all().order_by("-created_at")

    if query:
        products = products.filter(product_name__icontains=query)

    context = {
    "products": products,
    "categories": Category.objects.filter(is_active=True),
    "total_products": Product.objects.count(),
    "active_products": Product.objects.filter(is_active=True).count(),
    "total_categories": Category.objects.count(),
}

    return render(request, "adminProducts.html", context)

@role_permission_required("Can Manage Products")
@login_required
def edit_product_admin(request, id):
    product = get_object_or_404(Product, id=id)

    if request.method == "POST":
        product.product_name = request.POST.get("product_name")
        product.short_description = request.POST.get("short_description")
        product.long_description = request.POST.get("long_description")
        product.price = request.POST.get("price")
        product.stock_quantity = request.POST.get("stock_quantity")
        product.is_active = request.POST.get("is_active") == "True"

        category_id = request.POST.get("category_id")
        if category_id:
            product.category = get_object_or_404(Category, id=category_id)

        product.save()

        product_image = request.FILES.get("product_image")
        if product_image:
            ProductImage.objects.create(
                product=product,
                image=product_image,
                is_primary=True
            )

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({
                "status": "success",
                "message": "Product updated successfully.",
                "product": {
                    "id": str(product.id),
                    "name": product.product_name,
                    "category": product.category.category_name,
                    "price": str(product.price),
                    "stock": product.stock_quantity,
                    "status": "Active" if product.is_active else "Inactive",
                }
            })
        
        messages.success(request, "Product updated successfully.")
        return redirect("admin_products")
        
        
        
@role_permission_required("Can Delete Products")
@login_required
def delete_product_admin(request, id):
    product = get_object_or_404(Product, id=id)
    product.delete()

    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return JsonResponse({
            "status": "success",
            "message": "Product deleted successfully."
        })

    messages.success(request, "Product deleted successfully.")
    return redirect("admin_products")

# ==========================================================
# ADMIN SALES
# ==========================================================

@role_permission_required("Can Manage Orders")
@login_required
def admin_orders(request):
    query = request.GET.get("q", "")

    orders = Order.objects.all().order_by("-order_date")

    if query:
        orders = orders.filter(
            Q(order_number__icontains=query) |
            Q(user__username__icontains=query) |
            Q(user__email__icontains=query)
        )

    context = {
        "orders": orders,
        "total_orders": Order.objects.count(),
        "pending_orders": Order.objects.filter(order_status__iexact="Pending").count(),
        "completed_orders": Order.objects.filter(order_status__iexact="Completed").count(),
        "total_revenue": Order.objects.aggregate(total=Sum("total_amount"))["total"] or 0,
    }

    return render(request, "adminOrders.html", context)

@login_required
def admin_payments(request):
    query = request.GET.get("q", "")

    orders = Order.objects.all().order_by("-order_date")

    if query:
        orders = orders.filter(
            Q(order_number__icontains=query) |
            Q(user__username__icontains=query) |
            Q(user__email__icontains=query)
        )

    context = {
        "orders": orders,
        "total_payments": Order.objects.count(),
        "paid_payments": Order.objects.filter(payment_status__iexact="Paid").count(),
        "pending_payments": Order.objects.filter(payment_status__iexact="Pending").count(),
        "total_amount": Order.objects.aggregate(total=Sum("total_amount"))["total"] or 0,
    }

    return render(request, "adminPayments.html", context)

# ==========================================================
# ADMIN CUSTOMERS
# ==========================================================

@role_permission_required("Can Manage Customers")
@login_required
def admin_customers(request):
    query = request.GET.get("q", "")

    customers = get_customers_queryset()

    if query:
        customers = customers.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query) |
            Q(mobile_no__icontains=query)
        )

    context = {
        "customers": customers,
        "total_customers": get_customers_queryset().count(),
        "active_customers": get_customers_queryset().filter(is_active=True).count(),
        "inactive_customers": get_customers_queryset().filter(is_active=False).count(),
    }

    context.update(get_admin_permissions_context(request.user))

    return render(request, "adminCustomers.html", context)

@role_permission_required("Can Manage Customers")
def edit_customer(request, id):
    customer = get_object_or_404(User, id=id)

    if request.method == "POST":
        customer.first_name = request.POST.get("first_name")
        customer.last_name = request.POST.get("last_name")
        customer.username = request.POST.get("username")
        customer.email = request.POST.get("email")
        customer.mobile_no = request.POST.get("mobile_no")

        customer.is_active = request.POST.get("is_active") == "True"

        if request.FILES.get("profile_image"):
            customer.profile_image = request.FILES.get("profile_image")

        customer.save()
        messages.success(request, "Customer updated successfully.")
        return redirect("admin_customers")

    return redirect("admin_customers")


@role_permission_required("Can Manage Customers")
def delete_customer(request, id):
    customer = get_object_or_404(User, id=id)
    customer.delete()

    messages.success(request, "Customer deleted successfully.")
    return redirect("admin_customers")



#-------------------------------------------------------------------

def clean_cell(value):
    if value is None:
        return ""
    return str(value).strip()


def create_product_image(product, image_name, missing_images, primary=False):
    image_name = clean_cell(image_name)

    if not image_name:
        return

    image_path = Path(settings.MEDIA_ROOT) / "products" / image_name

    if not image_path.exists():
        missing_images.append(image_name)
        return

    with open(image_path, "rb") as img:
        ProductImage.objects.create(
            product=product,
            image=File(img, name=f"products/{image_name}"),
            is_primary=primary
        )


@role_permission_required("Can Manage Products")
@login_required
def import_products(request):

    if request.method != "POST":
        return redirect("admin_products")

    excel_file = request.FILES.get("excel_file")

    if not excel_file:
        messages.error(request, "Please upload an Excel file.")
        return redirect("admin_products")

    try:
        workbook = load_workbook(excel_file)
        sheet = workbook.active
    except Exception:
        messages.error(request, "Invalid Excel file.")
        return redirect("admin_products")

    created_count = 0
    skipped_count = 0
    missing_images = []
    errors = []

    for index, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):

        category_name = clean_cell(row[0] if len(row) > 0 else "")
        product_name = clean_cell(row[1] if len(row) > 1 else "")
        price = row[2] if len(row) > 2 and row[2] else 0
        stock = row[4] if len(row) > 4 and row[4] else 0
        short_description = clean_cell(row[5] if len(row) > 5 else "")
        description = clean_cell(row[6] if len(row) > 6 else "")

        if not category_name and not product_name:
            continue

        if not category_name:
            errors.append(f"Row {index}: Category is missing")
            continue

        if not product_name:
            errors.append(f"Row {index}: Product name is missing")
            continue

        if Product.objects.filter(product_name__iexact=product_name).exists():
            skipped_count += 1
            continue

        try:
            category, created = Category.objects.get_or_create(
                category_name=category_name,
                defaults={
                    "description": f"{category_name} products",
                    "is_active": True,
                }
            )

            product = Product.objects.create(
                product_name=product_name,
                category=category,
                price=price,
                stock_quantity=stock,
                short_description=short_description,
                long_description=description,
                is_active=True,
            )

            image_columns = row[7:12]

            for img_index, image_name in enumerate(image_columns):
                create_product_image(
                    product,
                    image_name,
                    missing_images,
                    primary=True if img_index == 0 else False
                )

            created_count += 1

        except Exception as e:
            errors.append(f"Row {index}: {str(e)}")

    msg = f"Import completed. Created: {created_count}, Skipped: {skipped_count}, Missing Images: {len(missing_images)}"

    if errors:
        msg += f", Errors: {len(errors)}"

    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return JsonResponse({
            "status": "error" if errors else "success",
            "message": errors[0] if errors else msg,
            "created": created_count,
            "skipped": skipped_count,
            "missing_images": missing_images,
            "errors": errors,
        })

    if errors:
        messages.error(request, errors[0])
    else:
        messages.success(request, msg)
    return redirect("admin_products")