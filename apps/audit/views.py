from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.audit.models import AuditLog
from apps.audit.serializers import AuditLogSerializer
from apps.users.permissions import IsAdminOrSuperAdmin
from apps.accounts.exceptions import custom_response

class AuditLogListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        queryset = AuditLog.objects.all()
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action__icontains=action)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return custom_response(data=serializer.data)
