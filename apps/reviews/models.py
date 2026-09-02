from django.db import models
from django.conf import settings
from apps.catalog.models import Product

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5)
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_product_rating()

    def update_product_rating(self):
        reviews = self.product.reviews.filter(is_approved=True)
        count = reviews.count()
        if count > 0:
            avg = sum(r.rating for r in reviews) / count
            self.product.rating = round(avg, 2)
            self.product.review_count = count
        else:
            self.product.rating = 0.00
            self.product.review_count = 0
        self.product.save()
