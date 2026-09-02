from rest_framework import serializers
from apps.support.models import SupportTicket

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'user', 'name', 'email', 'subject', 'message',
            'status', 'admin_response', 'is_resolved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'is_resolved', 'created_at', 'updated_at']
