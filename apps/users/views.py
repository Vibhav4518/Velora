from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.users.models import User, Role, Permission
from apps.users.serializers import UserSerializer, RoleSerializer, PermissionSerializer
from apps.users.permissions import IsAdminOrSuperAdmin, IsSuperAdminOnly
from apps.users.selectors import get_user_list, get_role_list, get_permission_list
from apps.accounts.exceptions import custom_response
from apps.audit.services import AuditService

class UserListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOnly]
    serializer_class = UserSerializer

    def get_queryset(self):
        req = self.request
        return get_user_list(
            search=req.query_params.get('search'),
            role=req.query_params.get('role')
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return custom_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        role_id = request.data.get('role_id')
        email = request.data.get('email')
        password = request.data.get('password', 'DefaultPassword123!')

        if User.objects.filter(email__iexact=email).exists():
            return custom_response(message="User with this email already exists", status_code=400, success=False)

        role = Role.objects.filter(id=role_id).first() if role_id else Role.objects.filter(name=Role.CUSTOMER).first()

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
            phone=request.data.get('phone', ''),
            role=role
        )

        AuditService.log_action(
            actor=request.user,
            action='CREATE_USER',
            resource='User',
            resource_id=str(user.id)
        )

        return custom_response(data=UserSerializer(user).data, message="User created successfully", status_code=201)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOnly]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if user.role_name == Role.SUPER_ADMIN and request.user.role_name != Role.SUPER_ADMIN:
            return custom_response(message="Only Super Admin can modify another Super Admin", status_code=403, success=False)

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        role_id = request.data.get('role_id')
        if role_id:
            role = Role.objects.filter(id=role_id).first()
            if role:
                user.role = role
                user.save()

        AuditService.log_action(
            actor=request.user,
            action='UPDATE_USER',
            resource='User',
            resource_id=str(user.id)
        )

        return custom_response(data=UserSerializer(user).data, message="User updated successfully")

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.role_name == Role.SUPER_ADMIN:
            return custom_response(message="Super Admin user cannot be deleted", status_code=400, success=False)

        user_id = user.id
        user.delete()

        AuditService.log_action(
            actor=request.user,
            action='DELETE_USER',
            resource='User',
            resource_id=str(user_id)
        )

        return custom_response(message="User deleted successfully")


class RoleListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOnly]
    serializer_class = RoleSerializer

    def get_queryset(self):
        return get_role_list()

    def list(self, request, *args, **kwargs):
        roles = self.get_queryset()
        return custom_response(data=RoleSerializer(roles, many=True).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()

        AuditService.log_action(
            actor=request.user,
            action='CREATE_ROLE',
            resource='Role',
            resource_id=str(role.id)
        )

        return custom_response(data=RoleSerializer(role).data, message="Role created successfully", status_code=201)


class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOnly]
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    def destroy(self, request, *args, **kwargs):
        role = self.get_object()
        if role.is_system_role:
            return custom_response(message="System roles cannot be deleted", status_code=400, success=False)
        role.delete()
        return custom_response(message="Role deleted successfully")


class PermissionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOnly]
    serializer_class = PermissionSerializer

    def get_queryset(self):
        return get_permission_list()

    def list(self, request, *args, **kwargs):
        perms = self.get_queryset()
        return custom_response(data=PermissionSerializer(perms, many=True).data)
