from django.urls import path
from apps.reviews.views import ProductReviewListCreateView, ReviewDetailView, ModerateReviewView

urlpatterns = [
    path('products/<path:slug>/reviews/', ProductReviewListCreateView.as_view(), name='product-reviews'),
    path('reviews/<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
    path('reviews/<int:pk>/moderate/', ModerateReviewView.as_view(), name='review-moderate'),
]
