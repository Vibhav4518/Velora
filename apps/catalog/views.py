import csv
import io
import openpyxl
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.text import slugify
from apps.catalog.models import Product, ProductImage
from apps.categories.models import Category
from apps.brands.models import Brand
from apps.catalog.serializers import ProductSerializer
from apps.catalog.selectors import get_product_list, get_product_by_slug, get_related_products
from apps.users.permissions import IsAdminOrReadOnly
from apps.accounts.exceptions import custom_response
from apps.audit.services import AuditService

class BulkProductUploadView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return custom_response(error="No file uploaded. Please upload a .csv or .xlsx file.", status_code=400)

        file_name = uploaded_file.name.lower()
        rows = []

        if file_name.endswith('.csv'):
            try:
                decoded_file = uploaded_file.read().decode('utf-8-sig')
                io_string = io.StringIO(decoded_file)
                reader = csv.DictReader(io_string)
                for row in reader:
                    rows.append(row)
            except Exception as e:
                return custom_response(error=f"Error reading CSV file: {str(e)}", status_code=400)
        elif file_name.endswith('.xlsx') or file_name.endswith('.xls'):
            try:
                wb = openpyxl.load_workbook(uploaded_file, data_only=True)
                sheet = wb.active
                headers = [str(cell.value).strip() if cell.value is not None else '' for cell in sheet[1]]
                for row_cells in sheet.iter_rows(min_row=2, values_only=True):
                    if not any(row_cells):
                        continue
                    row_dict = {}
                    for idx, val in enumerate(row_cells):
                        if idx < len(headers) and headers[idx]:
                            row_dict[headers[idx]] = str(val).strip() if val is not None else ''
                    rows.append(row_dict)
            except Exception as e:
                return custom_response(error=f"Error reading Excel file: {str(e)}", status_code=400)
        else:
            return custom_response(error="Unsupported file format. Please upload a .csv or .xlsx file.", status_code=400)

        if not rows:
            return custom_response(error="The uploaded file contains no data rows.", status_code=400)

        created_count = 0
        updated_count = 0
        errors = []

        for idx, row in enumerate(rows, start=2):
            norm_row = {str(k).lower().strip().replace(' ', '_'): str(v).strip() for k, v in row.items() if k}
            
            name = norm_row.get('name') or norm_row.get('product_name') or norm_row.get('title')
            if not name:
                errors.append(f"Row {idx}: Missing product name")
                continue

            raw_price = norm_row.get('price', '0')
            try:
                price = float(raw_price.replace('$', '').replace(',', ''))
            except ValueError:
                errors.append(f"Row {idx} ({name}): Invalid price '{raw_price}'")
                continue

            sku = norm_row.get('sku')
            if not sku:
                sku = f"VEL-BULK-{slugify(name)[:20]}-{idx}"

            cat_name = norm_row.get('category') or norm_row.get('category_name')
            category_obj = None
            if cat_name:
                cat_slug = slugify(cat_name)
                category_obj, _ = Category.objects.get_or_create(
                    slug=cat_slug,
                    defaults={'name': cat_name}
                )

            brand_name = norm_row.get('brand') or norm_row.get('brand_name')
            brand_obj = None
            if brand_name:
                b_slug = slugify(brand_name)
                brand_obj, _ = Brand.objects.get_or_create(
                    slug=b_slug,
                    defaults={'name': brand_name}
                )

            image_urls = []
            raw_imgs = norm_row.get('image_urls') or norm_row.get('images')
            if raw_imgs:
                sep = '|' if '|' in raw_imgs else ','
                image_urls = [url.strip() for url in raw_imgs.split(sep) if url.strip()]
            
            single_img = norm_row.get('image_url') or norm_row.get('image') or norm_row.get('primary_image')
            if single_img and single_img not in image_urls:
                image_urls.insert(0, single_img)

            desc = norm_row.get('description') or norm_row.get('desc') or f"High-end {name}."
            short_desc = norm_row.get('short_description') or desc[:150]

            raw_stock = norm_row.get('stock_quantity') or norm_row.get('stock') or norm_row.get('quantity') or '25'
            try:
                stock = int(float(raw_stock))
            except ValueError:
                stock = 25

            raw_cost = norm_row.get('cost_price') or '0'
            try:
                cost_price = float(raw_cost.replace('$', '').replace(',', ''))
            except ValueError:
                cost_price = price * 0.6

            is_feat = norm_row.get('is_featured', 'false').lower() in ('true', '1', 'yes')

            prod, created = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': name,
                    'category': category_obj,
                    'brand': brand_obj,
                    'price': price,
                    'cost_price': cost_price,
                    'stock_quantity': stock,
                    'description': desc,
                    'short_description': short_desc,
                    'is_featured': is_feat,
                    'is_active': True
                }
            )

            if created:
                created_count += 1
            else:
                prod.name = name
                if category_obj: prod.category = category_obj
                if brand_obj: prod.brand = brand_obj
                prod.price = price
                prod.cost_price = cost_price
                prod.stock_quantity = stock
                prod.description = desc
                prod.short_description = short_desc
                prod.is_featured = is_feat
                prod.save()
                updated_count += 1

            if image_urls:
                prod.images.all().delete()
                for img_idx, url in enumerate(image_urls):
                    ProductImage.objects.create(
                        product=prod,
                        image_url=url,
                        is_primary=(img_idx == 0),
                        order=img_idx
                    )

        AuditService.log_action(
            actor=request.user if request.user and request.user.is_authenticated else None,
            action='BULK_IMPORT_PRODUCTS',
            resource='Product',
            resource_id=f"Created: {created_count}, Updated: {updated_count}"
        )

        return custom_response(
            data={
                "created_count": created_count,
                "updated_count": updated_count,
                "total_processed": created_count + updated_count,
                "errors": errors
            },
            message=f"Bulk upload complete. Created {created_count} new products, updated {updated_count} existing products."
        )


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
