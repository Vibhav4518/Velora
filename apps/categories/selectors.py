from apps.categories.models import Category

def get_category_list(is_staff=False):
    queryset = Category.objects.filter(parent=None).prefetch_related('subcategories')
    if not is_staff:
        queryset = queryset.filter(is_active=True)
    return queryset

def get_category_by_slug(slug):
    return Category.objects.filter(slug=slug).first()
