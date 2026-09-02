from django.db.models import Q
from apps.catalog.models import Product

def get_product_list(category_slug=None, brand_slug=None, min_price=None, max_price=None,
                     rating=None, featured=None, discount=None, in_stock=None,
                     search=None, sort='newest', is_staff=False, include_inactive=False):
    queryset = Product.objects.select_related('category', 'brand').prefetch_related('images')

    if not (include_inactive and is_staff):
        queryset = queryset.filter(is_active=True)

    if category_slug:
        queryset = queryset.filter(Q(category__slug=category_slug) | Q(category__parent__slug=category_slug))
    if brand_slug:
        queryset = queryset.filter(brand__slug=brand_slug)
    if min_price:
        try: queryset = queryset.filter(price__gte=float(min_price))
        except ValueError: pass
    if max_price:
        try: queryset = queryset.filter(price__lte=float(max_price))
        except ValueError: pass
    if rating:
        try: queryset = queryset.filter(rating__gte=float(rating))
        except ValueError: pass
    if featured and str(featured).lower() == 'true':
        queryset = queryset.filter(is_featured=True)
    if discount and str(discount).lower() == 'true':
        queryset = queryset.filter(discount_price__isnull=False)
    if in_stock and str(in_stock).lower() == 'true':
        queryset = queryset.filter(stock_quantity__gt=0)

    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) |
            Q(sku__icontains=search) |
            Q(description__icontains=search) |
            Q(category__name__icontains=search) |
            Q(brand__name__icontains=search)
        )

    if sort == 'price_asc':
        queryset = queryset.order_by('price')
    elif sort == 'price_desc':
        queryset = queryset.order_by('-price')
    elif sort == 'rating':
        queryset = queryset.order_by('-rating')
    elif sort == 'popularity':
        queryset = queryset.order_by('-review_count')
    else:
        queryset = queryset.order_by('-created_at')

    return queryset

def get_product_by_slug(slug):
    if not slug:
        return None
    qs = Product.objects.select_related('category', 'brand').prefetch_related('images')
    product = qs.filter(slug__iexact=slug).first()
    if not product:
        slug_hyphenated = slug.replace(' ', '-').lower()
        product = qs.filter(slug__iexact=slug_hyphenated).first()
    if not product:
        product = qs.filter(name__iexact=slug).first()
    return product

def get_related_products(product, limit=8):
    if not product:
        return Product.objects.none()
    return Product.objects.filter(
        category=product.category, is_active=True
    ).exclude(id=product.id).order_by('-rating')[:limit]
