
from django.urls import path

from .views import (
    TimetableEntryListCreateView,
    TimetableEntryDetailView,
)


urlpatterns = [

    # =========================
    # Timetable Entries
    # =========================

    path(
        "",
        TimetableEntryListCreateView.as_view(),
        name="timetable-list-create",
    ),

    path(
        "<int:pk>/",
        TimetableEntryDetailView.as_view(),
        name="timetable-detail",
    ),
]
