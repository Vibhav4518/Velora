from django.contrib import admin

# Register your models here.

from .models import ProductImage, Role, Permission, User, Category, Product, Cart, CartItem

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'created_at')
    search_fields = ('role_name',)
    filter_horizontal = ('permissions',)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'mobile_no', 'created_at')
    search_fields = ('username', 'email')
    list_filter = ('role',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('category_name', 'description')
    search_fields = ('category_name',)

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'product_name',
        'category',
        'price',
        'stock_quantity'
    )
    search_fields = ('product_name',)
    list_filter = ('category',)

    inlines = [ProductImageInline]
    
@admin.register(Cart)
class AdminCart(admin.ModelAdmin):
    list_display=()

@admin.register(CartItem)
class AdminAddTocard(admin.ModelAdmin):
    list_display=('product', 'price', )
    
@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('permission_name', 'created_at')
    search_fields = ('permission_name',)