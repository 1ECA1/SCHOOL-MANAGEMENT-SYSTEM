from django.urls import path

from .views import (
    AttendanceRecordListCreateView,
    AttendanceRecordDetailView,
    AttendanceSummaryView,
)


urlpatterns = [
    path(
        "",
        AttendanceRecordListCreateView.as_view(),
        name="attendance-list-create",
    ),

    path(
        "<int:pk>/",
        AttendanceRecordDetailView.as_view(),
        name="attendance-detail",
    ),

    path(
        "summary/<int:student_id>/<int:academic_session_id>/<int:term_id>/<int:class_level_id>/",
        AttendanceSummaryView.as_view(),
        name="attendance-summary",
    ),
]