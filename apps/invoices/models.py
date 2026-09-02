from django.db import models
from apps.orders.models import Order

class Invoice(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=64, unique=True, db_index=True)
    pdf_url = models.URLField(max_length=1000, blank=True, default='')
    issued_at = models.DateTimeField(auto_now_add=True)
