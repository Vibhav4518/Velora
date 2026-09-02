from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.reviews.models import Review
from apps.reviews.serializers import ReviewSerializer
from apps.catalog.models import Product
from apps.orders.models import OrderItem
from apps.users.permissions import IsStaffOrAdmin
from apps.accounts.exceptions import custom_response

from apps.catalog.selectors import get_product_by_slug

class ProductReviewListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET': return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, slug):
        product = get_product_by_slug(slug)
        if not product:
            return custom_response(message="Product not found", status_code=404, success=False)
        reviews = Review.objects.filter(product=product, is_approved=True)
        return custom_response(data=ReviewSerializer(reviews, many=True).data)

    def post(self, request, slug):
        product = get_product_by_slug(slug)
        if not product:
            return custom_response(message="Product not found", status_code=404, success=False)

        rating = int(request.data.get('rating', 5))
        title = request.data.get('title', '')
        content = request.data.get('content', '')

        is_verified = OrderItem.objects.filter(
            order__customer=request.user,
            sku=product.sku,
            order__payment_status='PAID'
        ).exists()

        review = Review.objects.create(
            user=request.user,
            product=product,
            rating=rating,
            title=title,
            content=content,
            is_verified_purchase=is_verified,
            is_approved=True
        )

        return custom_response(data=ReviewSerializer(review).data, message="Review submitted successfully", status_code=201)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ModerateReviewView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def patch(self, request, pk):
        review = Review.objects.filter(id=pk).first()
        if not review:
            return custom_response(message="Review not found", status_code=404, success=False)
        is_approved = request.data.get('is_approved', True)
        review.is_approved = is_approved
        review.save()
        return custom_response(message="Review status updated")
