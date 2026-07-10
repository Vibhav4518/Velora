from django.db import models

import uuid
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import Permission

# Create your models here.

# ==================================
# PERMISSIONS
# ==================================
class Permission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    permission_name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.permission_name

# ==================================
# ROLES
# ==================================
class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role_name = models.CharField(max_length=50, unique=True)

    permissions = models.ManyToManyField(
        Permission,
        blank=True,
        related_name="roles"
    )

    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.role_name
# ==================================
# USERS
# ==================================
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    mobile_no = models.CharField(max_length=20, blank=True, null=True)

    profile_image = models.ImageField(
        upload_to='profile_images/',
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


# ==================================
# CATEGORIES
# ==================================
class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    category_image = models.ImageField(
        upload_to="category_images/",
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.category_name


# ==================================
# PRODUCTS
# ==================================
class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products'
    )

    product_name = models.CharField(max_length=200)

    short_description = models.CharField(
        max_length=500,
        blank=True,
        null=True
    )

    long_description = models.TextField(
        blank=True,
        null=True
    )

    price = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    discount_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        blank=True,
        null=True
    )

    stock_quantity = models.IntegerField(default=0)

    sku = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product_name


# ==================================
# PRODUCT IMAGES
# ==================================
class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )

    image = models.ImageField(
        upload_to='products/'
    )

    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product.product_name
    


# ==================================
# USER ADDRESSES
# ==================================
class UserAddress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses'
    )

    full_name = models.CharField(max_length=150)

    mobile_no = models.CharField(max_length=20)

    address_line1 = models.CharField(max_length=300)

    address_line2 = models.CharField(
        max_length=300,
        blank=True,
        null=True
    )

    city = models.CharField(max_length=100)

    state_name = models.CharField(max_length=100)

    country_name = models.CharField(max_length=100)

    pincode = models.CharField(max_length=20)

    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.full_name} - {self.city}"


# ==================================
# CART
# ==================================
class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='cart'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


# ==================================
# CART ITEMS
# ==================================
class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(default=1)

    price = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    def __str__(self):
        return self.product.product_name


# ==================================
# ORDERS
# ==================================
class Order(models.Model):

    ORDER_STATUS = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders'
    )

    address = models.ForeignKey(
        UserAddress,
        on_delete=models.SET_NULL,
        null=True
    )

    order_number = models.CharField(
        max_length=50,
        unique=True
    )

    order_date = models.DateTimeField(auto_now_add=True)

    total_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    order_status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS,
        default='Pending'
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='Pending'
    )

    def __str__(self):
        return self.order_number


# ==================================
# ORDER ITEMS
# ==================================
class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    product_name = models.CharField(max_length=200)

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    total_price = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    def __str__(self):
        return self.product_name


# ==================================
# PAYMENTS
# ==================================
class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='payment'
    )

    payment_method = models.CharField(max_length=50)

    transaction_id = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    amount = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    payment_date = models.DateTimeField(
        blank=True,
        null=True
    )

    payment_status = models.CharField(max_length=50)

    def __str__(self):
        return self.payment_method


# ==================================
# WISHLIST
# ==================================
class Wishlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="wishlists"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="wishlisted"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")

    def __str__(self):
        return f"{self.user.username} - {self.product.product_name}"


# ==================================
# PRODUCT REVIEWS
# ==================================
class ProductReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    rating = models.PositiveSmallIntegerField()

    review_text = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.product_name} ({self.rating})"
    
    
@property
def total_price(self):
    return self.price * self.quantity