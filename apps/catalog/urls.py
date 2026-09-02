from django.urls import path
from apps.catalog.views import ProductListCreateView, ProductDetailView, RelatedProductsView

urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product-list-create'),
    path('<path:slug>/related/', RelatedProductsView.as_view(), name='product-related'),
    path('<path:slug>/', ProductDetailView.as_view(), name='product-detail'),
]
