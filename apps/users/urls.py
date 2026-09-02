from django.urls import path
from apps.users.views import (
    UserListView, UserDetailView, RoleListCreateView,
    RoleDetailView, PermissionListView
)

urlpatterns = [
    path('', UserListView.as_view(), name='user-list-create'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('roles/', RoleListCreateView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', RoleDetailView.as_view(), name='role-detail'),
    path('permissions/', PermissionListView.as_view(), name='permission-list'),
]
