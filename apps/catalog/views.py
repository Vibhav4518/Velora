from rest_framework import generics
from apps.catalog.models import Product
from apps.catalog.serializers import ProductSerializer
from apps.catalog.selectors import get_product_list, get_product_by_slug, get_related_products
from apps.users.permissions import IsAdminOrReadOnly
from apps.accounts.exceptions import custom_response
from apps.audit.services import AuditService

class ProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = ProductSerializer

    def get_queryset(self):
        req = self.request
        return get_product_list(
            category_slug=req.query_params.get('category'),
            brand_slug=req.query_params.get('brand'),
            min_price=req.query_params.get('min_price'),
            max_price=req.query_params.get('max_price'),
            rating=req.query_params.get('rating'),
            featured=req.query_params.get('featured'),
            discount=req.query_params.get('discount'),
            in_stock=req.query_params.get('in_stock'),
            search=req.query_params.get('search'),
            sort=req.query_params.get('sort', 'newest'),
            is_staff=bool(req.user and req.user.is_authenticated and req.user.is_staff),
            include_inactive=req.query_params.get('include_inactive', 'false').lower() == 'true'
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return custom_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        AuditService.log_action(
            actor=request.user,
            action='CREATE_PRODUCT',
            resource='Product',
            resource_id=str(product.id)
        )

        return custom_response(data=self.get_serializer(product).data, message="Product created successfully", status_code=201)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = ProductSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.select_related('category', 'brand').prefetch_related('images')

    def get_object(self):
        slug = self.kwargs.get('slug')
        product = get_product_by_slug(slug)
        if not product:
            from django.http import Http404
            raise Http404("Product not found.")
        self.check_object_permissions(self.request, product)
        return product

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return custom_response(data=serializer.data)

    def update(self, request, *args, **kwargs):
        product = self.get_object()
        serializer = self.get_serializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_product = serializer.save()

        AuditService.log_action(
            actor=request.user,
            action='UPDATE_PRODUCT',
            resource='Product',
            resource_id=str(product.id)
        )

        return custom_response(data=self.get_serializer(updated_product).data, message="Product updated successfully")

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        prod_id = product.id
        product.delete()

        AuditService.log_action(
            actor=request.user,
            action='DELETE_PRODUCT',
            resource='Product',
            resource_id=str(prod_id)
        )

        return custom_response(message="Product deleted successfully")


class RelatedProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def list(self, request, slug, *args, **kwargs):
        product = get_product_by_slug(slug)
        related = get_related_products(product, limit=8)
        serializer = self.get_serializer(related, many=True)
        return custom_response(data=serializer.data)
