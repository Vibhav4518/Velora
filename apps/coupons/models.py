from django.db import models
from decimal import Decimal

class Coupon(models.Model):
    PERCENTAGE = 'PERCENTAGE'
    FIXED = 'FIXED'
    DISCOUNT_TYPE_CHOICES = [(PERCENTAGE, 'Percentage'), (FIXED, 'Fixed Amount')]

    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.CharField(max_length=255, blank=True, default='')
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default=PERCENTAGE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    used_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_discount(self, order_subtotal):
        if not self.is_active or order_subtotal < self.min_order_amount:
            return Decimal('0.00')
        if self.discount_type == self.PERCENTAGE:
            discount = (order_subtotal * self.discount_value) / Decimal('100.00')
        else:
            discount = self.discount_value
        return min(discount, order_subtotal)
