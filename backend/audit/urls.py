from django.urls import path

from .views import (
    AuditLogListCreateView,
    AuditLogDetailView,
)


urlpatterns = [
    path(
        "",
        AuditLogListCreateView.as_view(),
        name="audit-log-list-create",
    ),

    path(
        "<int:pk>/",
        AuditLogDetailView.as_view(),
        name="audit-log-detail",
    ),
]