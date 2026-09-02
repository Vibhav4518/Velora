from django.urls import path
from apps.brands.views import BrandListCreateView, BrandDetailView

urlpatterns = [
    path('', BrandListCreateView.as_view(), name='brand-list-create'),
    path('<slug:slug>/', BrandDetailView.as_view(), name='brand-detail'),
]
