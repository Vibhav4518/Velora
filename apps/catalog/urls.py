from django.urls import path
from apps.catalog.views import ProductListCreateView, ProductDetailView, RelatedProductsView, BulkProductUploadView

urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product-list-create'),
    path('bulk-upload/', BulkProductUploadView.as_view(), name='product-bulk-upload'),
    path('<path:slug>/related/', RelatedProductsView.as_view(), name='product-related'),
    path('<path:slug>/', ProductDetailView.as_view(), name='product-detail'),
]
