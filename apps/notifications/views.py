from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer
from apps.accounts.exceptions import custom_response

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        unread_count = queryset.filter(is_read=False).count()
        serializer = self.get_serializer(queryset, many=True)
        return custom_response(data={
            'notifications': serializer.data,
            'unread_count': unread_count
        })

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        updated = Notification.objects.filter(user=request.user, id=pk).update(is_read=True)
        return custom_response(data={'success': bool(updated)}, message="Notification marked as read")

class MarkAllNotificationsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated_count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return custom_response(data={'updated_count': updated_count}, message="All notifications marked as read")

class ClearReadNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        deleted_count, _ = Notification.objects.filter(user=request.user, is_read=True).delete()
        return custom_response(data={'deleted_count': deleted_count}, message="Read notifications cleared")
