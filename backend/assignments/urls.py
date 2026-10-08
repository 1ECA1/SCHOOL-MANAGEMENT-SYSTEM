from django.urls import path

from .views import (
    AssignmentListCreateView,
    AssignmentDetailView,
    AssignmentSubmissionListCreateView,
    AssignmentSubmissionDetailView,

    StudentAssignmentListView,
    StudentAssignmentDetailView,
    StudentSubmissionListCreateView,
    StudentSubmissionDetailView,

    ParentAssignmentListView,
)


urlpatterns = [

    # ========================================================
    # STUDENT ASSIGNMENTS
    # ========================================================

    path(
        "student/",
        StudentAssignmentListView.as_view(),
        name="student-assignment-list",
    ),

    path(
        "student/<int:pk>/",
        StudentAssignmentDetailView.as_view(),
        name="student-assignment-detail",
    ),

    # ========================================================
    # STUDENT SUBMISSIONS
    # ========================================================

    path(
        "student/submissions/",
        StudentSubmissionListCreateView.as_view(),
        name="student-submission-list-create",
    ),

    path(
        "student/submissions/<int:pk>/",
        StudentSubmissionDetailView.as_view(),
        name="student-submission-detail",
    ),

    # ========================================================
    # ADMIN / TEACHER ASSIGNMENTS
    # ========================================================

    path(
        "",
        AssignmentListCreateView.as_view(),
        name="assignment-list-create",
    ),

    path(
        "<int:pk>/",
        AssignmentDetailView.as_view(),
        name="assignment-detail",
    ),

    # ========================================================
    # ADMIN / TEACHER SUBMISSIONS
    # ========================================================

    path(
        "submissions/",
        AssignmentSubmissionListCreateView.as_view(),
        name="assignment-submission-list-create",
    ),

    path(
        "submissions/<int:pk>/",
        AssignmentSubmissionDetailView.as_view(),
        name="assignment-submission-detail",
    ),

    path(
        "parent/",
        ParentAssignmentListView.as_view(),
        name="parent-assignments",
    ),
]