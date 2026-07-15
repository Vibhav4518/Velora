import uuid
from decimal import Decimal

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone

from django.utils.text import slugify


# ==================================
# PERMISSIONS
# ==================================
class Permission(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    permission_name = models.CharField(
        max_length=100,
        unique=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.permission_name


# ==================================
# ROLES
# ==================================
class Role(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    role_name = models.CharField(
        max_length=50,
        unique=True
    )

    permissions = models.ManyToManyField(
        Permission,
        blank=True,
        related_name="roles"
    )

    is_default = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.role_name


# ==================================
# USERS
# ==================================
class User(AbstractUser):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users"
    )

    mobile_no = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.username


# ==================================
# CATEGORIES
# ==================================
class Category(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    category_name = models.CharField(
        max_length=100
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    category_image = models.ImageField(
        upload_to="category_images/",
        blank=True,
        null=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.category_name


# ==================================
# PRODUCTS
# ==================================
class Product(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products"
    )

    product_name = models.CharField(
        max_length=200
    )

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

    stock_quantity = models.IntegerField(
        default=0
    )

    sku = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    # ----------------------------------
    # Old manual deal fields
    # Kept temporarily for compatibility
    # ----------------------------------
    offer_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True,
        blank=True
    )

    is_deal = models.BooleanField(
        default=False
    )

    deal_end = models.DateTimeField(
        null=True,
        blank=True
    )

    def get_active_deals(self):
        """
        Returns all currently active deals that apply
        directly to this product or its category.
        """

        now = timezone.now()

        return Deal.objects.filter(
            Q(products=self) |
            Q(categories=self.category),
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        ).distinct()

    def get_active_deal(self):
        """
        Returns the deal that gives the customer
        the lowest final price.
        """

        best_deal = None
        lowest_price = self.price

        for deal in self.get_active_deals():
            calculated_price = deal.calculate_price(
                self.price
            )

            if calculated_price < lowest_price:
                lowest_price = calculated_price
                best_deal = deal

        return best_deal

    def get_final_price(self):
        """
        Returns the final product price.

        Priority:
        1. New Deal model
        2. Old manual offer
        3. Normal product price
        """

        active_deal = self.get_active_deal()

        if active_deal:
            return active_deal.calculate_price(
                self.price
            )

        if self.has_manual_deal:
            return self.offer_price

        if (
            self.discount_price is not None
            and self.discount_price < self.price
        ):
            return self.discount_price

        return self.price

    def get_discount_amount(self):
        """
        Returns the saving amount on one product.
        """

        discount = self.price - self.get_final_price()

        return max(
            discount,
            Decimal("0.00")
        )

    def get_discount_percentage(self):
        """
        Returns the percentage saved by the customer.
        """

        if not self.price or self.price <= 0:
            return 0

        discount_amount = self.get_discount_amount()

        if discount_amount <= 0:
            return 0

        percentage = (
            discount_amount
            / self.price
        ) * Decimal("100")

        return round(percentage)

    @property
    def has_manual_deal(self):
        """
        Supports your old product-level deal fields.
        """

        return (
            self.is_deal
            and self.offer_price is not None
            and self.offer_price < self.price
            and (
                self.deal_end is None
                or self.deal_end > timezone.now()
            )
        )

    @property
    def has_active_deal(self):
        """
        Kept for compatibility with your existing
        templates and views.
        """

        return (
            self.get_active_deal() is not None
            or self.has_manual_deal
            or (
                self.discount_price is not None
                and self.discount_price < self.price
            )
        )

    @property
    def current_price(self):
        """
        Existing templates can continue using:

        product.current_price
        """

        return self.get_final_price()

    @property
    def discount_percentage(self):
        """
        Existing templates can continue using:

        product.discount_percentage
        """

        return self.get_discount_percentage()

    def __str__(self):
        return self.product_name


# ==================================
# DEALS
# ==================================
class Deal(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ("percentage", "Percentage"),
        ("fixed", "Fixed Amount"),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    title = models.CharField(
        max_length=150
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES
    )

    discount_value = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.01")
            )
        ]
    )

    products = models.ManyToManyField(
        Product,
        blank=True,
        related_name="deals"
    )

    categories = models.ManyToManyField(
        Category,
        blank=True,
        related_name="deals"
    )

    banner_image = models.ImageField(
        upload_to="deal_banners/",
        blank=True,
        null=True
    )

    start_date = models.DateTimeField()

    end_date = models.DateTimeField()

    priority = models.PositiveIntegerField(
        default=0
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            "-priority",
            "-created_at"
        ]

    def __str__(self):
        return self.title

    @property
    def status(self):
        """
        Possible values:
        active
        scheduled
        expired
        inactive
        """

        now = timezone.now()

        if not self.is_active:
            return "inactive"

        if now < self.start_date:
            return "scheduled"

        if now > self.end_date:
            return "expired"

        return "active"

    @property
    def is_currently_active(self):
        now = timezone.now()

        return (
            self.is_active
            and self.start_date <= now <= self.end_date
        )

    def applies_to_product(self, product):
        """
        Checks whether this deal applies to a product.
        """

        direct_product = self.products.filter(
            id=product.id
        ).exists()

        category_product = self.categories.filter(
            id=product.category_id
        ).exists()

        return direct_product or category_product

    def calculate_price(self, original_price):
        """
        Calculates final price after applying the deal.
        """

        original_price = Decimal(original_price)

        if self.discount_type == "percentage":
            discount_amount = (
                original_price
                * self.discount_value
                / Decimal("100")
            )

        else:
            discount_amount = self.discount_value

        final_price = (
            original_price
            - discount_amount
        )

        return max(
            final_price,
            Decimal("0.00")
        )

    def discount_amount_for(self, original_price):
        """
        Returns saving amount for a given price.
        """

        original_price = Decimal(original_price)

        return (
            original_price
            - self.calculate_price(original_price)
        )

    def clean(self):
        """
        Model-level deal validation.
        """

        errors = {}

        if (
            self.start_date
            and self.end_date
            and self.end_date <= self.start_date
        ):
            errors["end_date"] = (
                "End date must be after the start date."
            )

        if (
            self.discount_type == "percentage"
            and self.discount_value is not None
            and self.discount_value > 100
        ):
            errors["discount_value"] = (
                "Percentage discount cannot be greater "
                "than 100."
            )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()

        super().save(
            *args,
            **kwargs
        )


# ==================================
# PRODUCT IMAGES
# ==================================
class ProductImage(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="products/"
    )

    is_primary = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.product.product_name


# ==================================
# USER ADDRESSES
# ==================================
class UserAddress(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="addresses"
    )

    full_name = models.CharField(
        max_length=150
    )

    mobile_no = models.CharField(
        max_length=20
    )

    address_line1 = models.CharField(
        max_length=300
    )

    address_line2 = models.CharField(
        max_length=300,
        blank=True,
        null=True
    )

    city = models.CharField(
        max_length=100
    )

    state_name = models.CharField(
        max_length=100
    )

    country_name = models.CharField(
        max_length=100
    )

    pincode = models.CharField(
        max_length=20
    )

    is_default = models.BooleanField(
        default=False
    )

    def __str__(self):
        return f"{self.full_name} - {self.city}"


# ==================================
# CART
# ==================================
class Cart(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cart"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.user.username


# ==================================
# CART ITEMS
# ==================================
class CartItem(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    price = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    @property
    def total_price(self):
        return self.price * self.quantity

    def __str__(self):
        return self.product.product_name


# ==================================
# ORDERS
# ==================================
class Order(models.Model):
    ORDER_STATUS = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    ]

    PAYMENT_STATUS = [
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Failed", "Failed"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="orders"
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

    order_date = models.DateTimeField(
        auto_now_add=True
    )

    total_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    order_status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS,
        default="Pending"
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="Pending"
    )

    def __str__(self):
        return self.order_number


# ==================================
# ORDER ITEMS
# ==================================
class OrderItem(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    product_name = models.CharField(
        max_length=200
    )

    quantity = models.PositiveIntegerField()

    original_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=0
    )

    price = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    discount_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=0
    )

    total_price = models.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    deal = models.ForeignKey(
        Deal,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items"
    )

    def save(self, *args, **kwargs):
        if not self.original_price:
            self.original_price = self.price

        self.discount_amount = max(
            self.original_price - self.price,
            Decimal("0.00")
        )

        self.total_price = (
            self.price
            * self.quantity
        )

        super().save(
            *args,
            **kwargs
        )

    def __str__(self):
        return self.product_name


# ==================================
# PAYMENTS
# ==================================
class Payment(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment"
    )

    payment_method = models.CharField(
        max_length=50
    )

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

    payment_status = models.CharField(
        max_length=50
    )

    def __str__(self):
        return self.payment_method


# ==================================
# WISHLIST
# ==================================
class Wishlist(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

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

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            "user",
            "product"
        )

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.product.product_name}"
        )




# ==========================================================
# BLOG CATEGORY
# ==========================================================

class BlogCategory(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    category_name = models.CharField(
        max_length=100,
        unique=True
    )

    slug = models.SlugField(
        max_length=130,
        unique=True,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["category_name"]
        verbose_name_plural = "Blog Categories"

    def save(self, *args, **kwargs):

        if not self.slug:
            base_slug = slugify(
                self.category_name
            ) or "blog-category"

            slug = base_slug
            counter = 1

            while BlogCategory.objects.filter(
                slug=slug
            ).exclude(
                id=self.id
            ).exists():

                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    @property
    def published_posts_count(self):
        return self.posts.filter(
            is_published=True
        ).count()

    def __str__(self):
        return self.category_name


# ==========================================================
# BLOG POST
# ==========================================================

class BlogPost(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    category = models.ForeignKey(
        BlogCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts"
    )

    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="blog_posts"
    )

    title = models.CharField(
        max_length=220
    )

    slug = models.SlugField(
        max_length=260,
        unique=True,
        blank=True
    )

    short_description = models.TextField(
        max_length=400
    )

    content = models.TextField()

    image = models.ImageField(
        upload_to="blog/",
        null=True,
        blank=True
    )

    is_featured = models.BooleanField(
        default=False
    )

    is_published = models.BooleanField(
        default=True
    )

    views_count = models.PositiveIntegerField(
        default=0
    )

    published_at = models.DateTimeField(
        default=timezone.now
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-published_at"]

    def save(self, *args, **kwargs):

        if not self.slug:
            base_slug = slugify(
                self.title
            ) or "blog-post"

            slug = base_slug
            counter = 1

            while BlogPost.objects.filter(
                slug=slug
            ).exclude(
                id=self.id
            ).exists():

                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    @property
    def status_text(self):
        if not self.is_published:
            return "Draft"

        if self.published_at > timezone.now():
            return "Scheduled"

        return "Published"

    def __str__(self):
        return self.title
    
# ==========================================================
# CONTACT MESSAGE
# ==========================================================

class ContactMessage(models.Model):

    STATUS_CHOICES = [
        ("New", "New"),
        ("In Progress", "In Progress"),
        ("Resolved", "Resolved"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    name = models.CharField(
        max_length=120
    )

    email = models.EmailField()

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    subject = models.CharField(
        max_length=220
    )

    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="New"
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            "-created_at"
        ]

    def __str__(self):
        return f"{self.name} - {self.subject}"
    

# ==========================================================
# PRODUCT REVIEW AND RATING
# ==========================================================

class ProductReview(models.Model):

    RATING_CHOICES = [
        (1, "1 Star"),
        (2, "2 Stars"),
        (3, "3 Stars"),
        (4, "4 Stars"),
        (5, "5 Stars"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="product_reviews"
    )

    rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES
    )

    title = models.CharField(
        max_length=150,
        blank=True
    )

    comment = models.TextField()

    is_verified_purchase = models.BooleanField(
        default=False
    )

    is_approved = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        ordering = [
            "-created_at"
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product",
                    "user"
                ],
                name="unique_product_review_per_user"
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.product.product_name} - "
            f"{self.rating}"
        )