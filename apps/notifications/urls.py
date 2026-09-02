from django.urls import path
from apps.notifications.views import (
    NotificationListView, 
    MarkNotificationReadView, 
    MarkAllNotificationsReadView,
    ClearReadNotificationsView
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-read'),
    path('read-all/', MarkAllNotificationsReadView.as_view(), name='notification-read-all'),
    path('clear-read/', ClearReadNotificationsView.as_view(), name='notification-clear-read'),
]
