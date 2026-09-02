from rest_framework import serializers
from apps.catalog.models import Product, ProductImage
from apps.categories.serializers import CategorySerializer
from apps.brands.serializers import BrandSerializer

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_primary', 'order']


class ProductSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    brand_detail = BrandSerializer(source='brand', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    image_url = serializers.URLField(write_only=True, required=False)
    image_urls = serializers.ListField(child=serializers.URLField(), write_only=True, required=False)
    current_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    primary_image_url = serializers.CharField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'slug', 'short_description', 'description',
            'price', 'discount_price', 'current_price', 'discount_percentage',
            'category', 'category_detail', 'brand', 'brand_detail',
            'stock_quantity', 'low_stock_threshold', 'is_featured', 'is_active',
            'rating', 'review_count', 'primary_image_url', 'images', 'image_url', 'image_urls',
            'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        image_urls = validated_data.pop('image_urls', [])
        single_image = validated_data.pop('image_url', None)
        if not image_urls and single_image:
            image_urls = [single_image]
        product = Product.objects.create(**validated_data)
        for idx, url in enumerate(image_urls):
            ProductImage.objects.create(
                product=product,
                image_url=url,
                is_primary=(idx == 0),
                order=idx
            )
        return product

    def update(self, instance, validated_data):
        image_urls = validated_data.pop('image_urls', None)
        single_image = validated_data.pop('image_url', None)
        if image_urls is None and single_image:
            image_urls = [single_image]
            
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if image_urls is not None:
            instance.images.all().delete()
            for idx, url in enumerate(image_urls):
                ProductImage.objects.create(
                    product=instance,
                    image_url=url,
                    is_primary=(idx == 0),
                    order=idx
                )
        return instance
