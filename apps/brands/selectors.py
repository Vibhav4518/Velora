from apps.brands.models import Brand

def get_brand_list(is_staff=False):
    queryset = Brand.objects.all()
    if not is_staff:
        queryset = queryset.filter(is_active=True)
    return queryset

def get_brand_by_slug(slug):
    return Brand.objects.filter(slug=slug).first()
