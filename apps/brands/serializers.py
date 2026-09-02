from rest_framework import serializers
from apps.brands.models import Brand

class BrandSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True)
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description', 'logo_url', 'product_count', 'is_active']

    def get_product_count(self, obj):
        return obj.products.count() if hasattr(obj, 'products') else 0
