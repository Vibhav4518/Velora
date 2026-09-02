from django.db import models
from apps.catalog.models import Product

class InventoryLog(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_logs')
    change_amount = models.IntegerField()
    reason = models.CharField(max_length=255)
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
