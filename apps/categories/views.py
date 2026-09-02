from rest_framework import generics
from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from apps.categories.selectors import get_category_list, get_category_by_slug
from apps.users.permissions import IsAdminOrReadOnly
from apps.accounts.exceptions import custom_response
from apps.audit.services import AuditService

class CategoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = CategorySerializer

    def get_queryset(self):
        is_staff = bool(self.request.user and self.request.user.is_authenticated and self.request.user.is_staff)
        return get_category_list(is_staff=is_staff)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return custom_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()

        AuditService.log_action(
            actor=request.user,
            action='CREATE_CATEGORY',
            resource='Category',
            resource_id=str(category.id)
        )

        return custom_response(data=serializer.data, message="Category created successfully", status_code=201)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return custom_response(data=serializer.data)

    def update(self, request, *args, **kwargs):
        category = self.get_object()
        serializer = self.get_serializer(category, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        AuditService.log_action(
            actor=request.user,
            action='UPDATE_CATEGORY',
            resource='Category',
            resource_id=str(category.id)
        )

        return custom_response(data=serializer.data, message="Category updated successfully")

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        cat_id = category.id
        category.delete()

        AuditService.log_action(
            actor=request.user,
            action='DELETE_CATEGORY',
            resource='Category',
            resource_id=str(cat_id)
        )

        return custom_response(message="Category deleted successfully")
