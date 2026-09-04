from django.urls import path
from .views import (
    ReportsDashboardView,
    StudentReportView,
    EnrollmentAnalyticsReportView,
    AcademicPerformanceReportView,
    SubjectPerformanceReportView,
    AttendanceReportView,
    FinanceReportView,
    AcademicOverviewReportView,
    AssignmentReportView,
    TeacherPerformanceReportView,
    ExaminationReportView,
)
urlpatterns = [
    path(
        "dashboard/",
        ReportsDashboardView.as_view(),
        name="reports-dashboard",
    ),

    path(
    "enrollment-analytics/",
    EnrollmentAnalyticsReportView.as_view(),
),

    path(
    "academic-overview/",
    AcademicOverviewReportView.as_view(),
),

    path(
    "examinations/",
    ExaminationReportView.as_view(),
),

    path(
    "teachers/",
    TeacherPerformanceReportView.as_view(),
),

    path(
    "assignments/",
    AssignmentReportView.as_view(),
    name="assignment-report",
),

    path(
    "finance/",
    FinanceReportView.as_view(),
    name="finance-report",
),

    path(
    "attendance/",
    AttendanceReportView.as_view(),
    name="attendance-report",
),

    path(
    "subject-performance/",
    SubjectPerformanceReportView.as_view(),
    name="subject-performance-report",
),

    path(
    "academic-performance/",
    AcademicPerformanceReportView.as_view(),
    name="academic-performance-report",
),

    path(
        "students/",
        StudentReportView.as_view(),
        name="student-report",
    ),
]