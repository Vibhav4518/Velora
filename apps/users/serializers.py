from rest_framework import serializers
from apps.users.models import User, Role, Permission

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'code', 'name', 'module']


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions', 'is_system_role']


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role_name', read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'avatar_url', 'role', 'is_staff', 'is_active',
            'date_joined'
        ]
        read_only_fields = ['id', 'email', 'date_joined']
