from .models import AuditLog


def get_client_ip(request):
    """
    Get the client's IP address from the request.

    Supports deployments where a reverse proxy/load balancer
    provides X-Forwarded-For.
    """
    if not request:
        return None

    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return request.META.get("REMOTE_ADDR")


def log_audit(
    *,
    request=None,
    action,
    model_name="",
    object_id="",
    object_repr="",
    description="",
    user=None,
):
    """
    Centralized helper for creating AuditLog records.

    Example:

        log_audit(
            request=request,
            action=AuditLog.Action.CREATE,
            model_name="Student",
            object_id=student.id,
            object_repr=str(student),
            description="Created a new student.",
        )
    """

    # -------------------------------------------------
    # DETERMINE USER
    # -------------------------------------------------
    if user is None and request is not None:
        request_user = getattr(request, "user", None)

        if request_user is not None and request_user.is_authenticated:
            user = request_user

    # -------------------------------------------------
    # DETERMINE IP
    # -------------------------------------------------
    ip_address = get_client_ip(request)

    # -------------------------------------------------
    # CREATE AUDIT RECORD
    # -------------------------------------------------
    return AuditLog.objects.create(
        user=user,
        action=action,
        model_name=str(model_name or ""),
        object_id=str(object_id or ""),
        object_repr=str(object_repr or "")[:255],
        description=str(description or ""),
        ip_address=ip_address,
    )