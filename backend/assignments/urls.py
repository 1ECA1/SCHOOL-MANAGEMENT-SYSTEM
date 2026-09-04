from django.urls import path

from .views import (
    AssignmentListCreateView,
    AssignmentDetailView,
    AssignmentSubmissionListCreateView,
    AssignmentSubmissionDetailView,
)


urlpatterns = [

    # =========================
    # Assignments
    # =========================

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

    # =========================
    # Assignment Submissions
    # =========================

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
]