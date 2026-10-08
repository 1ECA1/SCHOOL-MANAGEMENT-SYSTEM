from django.urls import path


from .views import (
    AdmissionOfficerListCreateView,
    AdmissionOfficerDetailView,
    MyAdmissionOfficerProfileView,

    ApplicantListCreateView,
    ApplicantDetailView,
    ApplicantStatusView,
    ApplicantAdmitView,
)


urlpatterns = [

    # ========================================================
    # ADMISSION OFFICERS
    # ========================================================

    path(
        "officers/",
        AdmissionOfficerListCreateView.as_view(),
        name="admission-officer-list-create",
    ),

    path(
        "officers/<int:pk>/",
        AdmissionOfficerDetailView.as_view(),
        name="admission-officer-detail",
    ),

    path(
        "my-profile/",
        MyAdmissionOfficerProfileView.as_view(),
        name="my-admission-officer-profile",
    ),

    # ========================================================
    # APPLICANTS
    # ========================================================

   path(
    "applicants/",
    ApplicantListCreateView.as_view(),
    name="applicant-list-create",
),

path(
    "applicants/<int:pk>/",
    ApplicantDetailView.as_view(),
    name="applicant-detail",
),

path(
    "applicants/<int:pk>/status/",
    ApplicantStatusView.as_view(),
    name="applicant-status",
),

path(
    "applicants/<int:pk>/admit/",
    ApplicantAdmitView.as_view(),
    name="applicant-admit",
),
]