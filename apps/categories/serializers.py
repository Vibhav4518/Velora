from rest_framework import serializers
from apps.categories.models import Category

class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image_url']

class CategorySerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True)
    subcategories = SubcategorySerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'parent', 'subcategories', 'product_count', 'is_active']

    def get_product_count(self, obj):
        return obj.products.count() if hasattr(obj, 'products') else 0
