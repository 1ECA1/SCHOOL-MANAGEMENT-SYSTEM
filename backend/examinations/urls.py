from django.urls import path

from .views import (
    ExaminationListCreateView,
    ExaminationDetailView,
    ExaminationSubjectListCreateView,
    ExaminationSubjectDetailView,
)


urlpatterns = [

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