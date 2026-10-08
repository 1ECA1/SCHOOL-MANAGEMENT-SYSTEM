from django.urls import path

from .views import (
    ExamOfficerListCreateView,
    ExamOfficerDetailView,
    ExaminationListCreateView,
    ExaminationDetailView,
    ExaminationSubjectListCreateView,
    ExaminationSubjectDetailView,
)

urlpatterns = [

    path(
    "officers/",
    ExamOfficerListCreateView.as_view(),
    name="exam-officer-list-create",
),
path(
    "officers/<int:pk>/",
    ExamOfficerDetailView.as_view(),
    name="exam-officer-detail",
),

    # Examinations
    path(
        "",
        ExaminationListCreateView.as_view(),
        name="examination-list-create",
    ),

    path(
        "<int:pk>/",
        ExaminationDetailView.as_view(),
        name="examination-detail",
    ),

    # Examination Subjects
    path(
        "subjects/",
        ExaminationSubjectListCreateView.as_view(),
        name="examination-subject-list-create",
    ),

    path(
        "subjects/<int:pk>/",
        ExaminationSubjectDetailView.as_view(),
        name="examination-subject-detail",
    ),
]