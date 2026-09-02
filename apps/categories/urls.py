from django.urls import path
from apps.categories.views import CategoryListCreateView, CategoryDetailView

urlpatterns = [
    path('', CategoryListCreateView.as_view(), name='category-list-create'),
    path('<slug:slug>/', CategoryDetailView.as_view(), name='category-detail'),
]
