from .models import AuditLog


def create_audit_log(
    *,
    user=None,
    action,
    model_name,
    object_id="",
    object_repr="",
    description="",
    ip_address=None,
):
    return AuditLog.objects.create(
        user=user,
        action=action,
        model_name=model_name,
        object_id=str(object_id) if object_id else "",
        object_repr=object_repr,
        description=description,
        ip_address=ip_address,
    )