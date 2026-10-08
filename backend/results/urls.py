
from django.urls import path

from .views import (
    GradeScaleListCreateView,
    GradeScaleDetailView,
    StudentResultListCreateView,
    StudentResultDetailView,
    ReportCardListCreateView,
    ReportCardDetailView,
    MyReportCardListView,
    MyReportCardDetailView,
)


urlpatterns = [

    # ========================================================
    # GRADE SCALES
    # ========================================================

    path(
        "grade-scales/",
        GradeScaleListCreateView.as_view(),
        name="grade-scale-list-create",
    ),

    path(
        "grade-scales/<int:pk>/",
        GradeScaleDetailView.as_view(),
        name="grade-scale-detail",
    ),

    # ========================================================
    # STUDENT RESULTS
    # ========================================================

    path(
        "student-results/",
        StudentResultListCreateView.as_view(),
        name="student-result-list-create",
    ),

    path(
        "student-results/<int:pk>/",
        StudentResultDetailView.as_view(),
        name="student-result-detail",
    ),

    # ========================================================
    # REPORT CARDS
    # ========================================================

    path(
        "report-cards/",
        ReportCardListCreateView.as_view(),
        name="report-card-list-create",
    ),

    path(
        "report-cards/<int:pk>/",
        ReportCardDetailView.as_view(),
        name="report-card-detail",
    ),

    # ========================================================
    # STUDENT RESULTS
    # ========================================================
    # These endpoints are ONLY for the logged-in student.
    #
    # They return published report cards belonging to
    # request.user.student_profile.
    # ========================================================

    path(
        "my-report-cards/",
        MyReportCardListView.as_view(),
        name="my-report-card-list",
    ),

    path(
        "my-report-cards/<int:pk>/",
        MyReportCardDetailView.as_view(),
        name="my-report-card-detail",
    ),
]