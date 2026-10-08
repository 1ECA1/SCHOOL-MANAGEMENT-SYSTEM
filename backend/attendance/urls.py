from django.urls import path

from .views import (
    SchoolAttendanceSettingListCreateView,
    SchoolAttendanceSettingDetailView,
    AttendanceRecordListCreateView,
    AttendanceRecordDetailView,
    AttendanceSummaryView,
    TeacherAttendanceStudentsView,
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

    path(
    "settings/",
    SchoolAttendanceSettingListCreateView.as_view(),
    name="school-attendance-setting-list-create",
),

path(
    "settings/<int:pk>/",
    SchoolAttendanceSettingDetailView.as_view(),
    name="school-attendance-setting-detail",
),
path(
    "teacher-students/",
    TeacherAttendanceStudentsView.as_view(),
    name="teacher-attendance-students",
),
]