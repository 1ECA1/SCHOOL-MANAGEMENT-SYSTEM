from django.urls import path

from .views import (
    ParentGuardianListCreateView,
    ParentGuardianDetailView,
    StudentParentListView,
    StudentParentAddView,
    StudentParentRemoveView,
    StudentListCreateView,
    StudentDetailView,
    StudentEnrollmentListCreateView,
    StudentEnrollmentDetailView,
    StudentSubjectEnrollmentListCreateView,
    StudentSubjectEnrollmentDetailView,
)


urlpatterns = [
    # =========================
    # Parent / Guardian
    # =========================

    path(
        "parents/",
        ParentGuardianListCreateView.as_view(),
        name="parent-list-create",
    ),
    # =========================
# Student Parent / Guardian
# =========================

path(
    "<int:student_id>/parents/",
    StudentParentListView.as_view(),
    name="student-parent-list",
),

path(
    "<int:student_id>/parents/add/",
    StudentParentAddView.as_view(),
    name="student-parent-add",
),

path(
    "<int:student_id>/parents/<int:parent_id>/",
    StudentParentRemoveView.as_view(),
    name="student-parent-remove",
),
    path(
        "parents/<int:pk>/",
        ParentGuardianDetailView.as_view(),
        name="parent-detail",
    ),

    # =========================
    # Students
    # =========================

    path(
        "",
        StudentListCreateView.as_view(),
        name="student-list-create",
    ),
    path(
        "<int:pk>/",
        StudentDetailView.as_view(),
        name="student-detail",
    ),

    # =========================
    # Student Enrollment
    # =========================

    path(
        "enrollments/",
        StudentEnrollmentListCreateView.as_view(),
        name="student-enrollment-list-create",
    ),
    path(
        "enrollments/<int:pk>/",
        StudentEnrollmentDetailView.as_view(),
        name="student-enrollment-detail",
    ),

    # =========================
    # Student Subject Enrollment
    # =========================

    path(
        "subject-enrollments/",
        StudentSubjectEnrollmentListCreateView.as_view(),
        name="student-subject-enrollment-list-create",
    ),
    path(
        "subject-enrollments/<int:pk>/",
        StudentSubjectEnrollmentDetailView.as_view(),
        name="student-subject-enrollment-detail",
    ),
]