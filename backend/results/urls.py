from django.urls import path

from .views import (
    GradeScaleListCreateView,
    GradeScaleDetailView,
    StudentResultListCreateView,
    StudentResultDetailView,
    ReportCardListCreateView,
    ReportCardDetailView,
)


urlpatterns = [

    # =========================
    # Grade Scales
    # =========================

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

    # =========================
    # Student Results
    # =========================

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

    # =========================
    # Report Cards
    # =========================

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
]