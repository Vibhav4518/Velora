from rest_framework import generics
from apps.brands.models import Brand
from apps.brands.serializers import BrandSerializer
from apps.brands.selectors import get_brand_list, get_brand_by_slug
from apps.users.permissions import IsAdminOrReadOnly
from apps.accounts.exceptions import custom_response
from apps.audit.services import AuditService

class BrandListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = BrandSerializer

    def get_queryset(self):
        is_staff = bool(self.request.user and self.request.user.is_authenticated and self.request.user.is_staff)
        return get_brand_list(is_staff=is_staff)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return custom_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        brand = serializer.save()

        AuditService.log_action(
            actor=request.user,
            action='CREATE_BRAND',
            resource='Brand',
            resource_id=str(brand.id)
        )

        return custom_response(data=serializer.data, message="Brand created successfully", status_code=201)


class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return custom_response(data=serializer.data)

    def update(self, request, *args, **kwargs):
        brand = self.get_object()
        serializer = self.get_serializer(brand, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        AuditService.log_action(
            actor=request.user,
            action='UPDATE_BRAND',
            resource='Brand',
            resource_id=str(brand.id)
        )

        return custom_response(data=serializer.data, message="Brand updated successfully")

    def destroy(self, request, *args, **kwargs):
        brand = self.get_object()
        brand_id = brand.id
        brand.delete()

        AuditService.log_action(
            actor=request.user,
            action='DELETE_BRAND',
            resource='Brand',
            resource_id=str(brand_id)
        )

        return custom_response(message="Brand deleted successfully")
