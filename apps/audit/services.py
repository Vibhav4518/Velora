from apps.audit.models import AuditLog

class AuditService:
    @staticmethod
    def log_action(actor, action, resource, resource_id='', metadata=None):
        actor_email = actor.email if actor and hasattr(actor, 'email') else 'anonymous'
        return AuditLog.objects.create(
            actor_email=actor_email,
            action=action,
            resource=resource,
            resource_id=str(resource_id),
            metadata=metadata or {}
        )
