from apps.notifications.models import Notification

class NotificationService:
    @staticmethod
    def notify_user(user, title, message, notification_type='SYSTEM'):
        return Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type
        )
