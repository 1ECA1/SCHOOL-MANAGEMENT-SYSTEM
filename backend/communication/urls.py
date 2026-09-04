from django.urls import path

from .views import (
    AnnouncementListCreateView,
    AnnouncementDetailView,
    MessageListCreateView,
    MessageDetailView,
    MarkMessageAsReadView,
)


urlpatterns = [
    path(
        "announcements/",
        AnnouncementListCreateView.as_view(),
        name="announcement-list-create",
    ),

    path(
        "announcements/<int:pk>/",
        AnnouncementDetailView.as_view(),
        name="announcement-detail",
    ),

    path(
        "messages/",
        MessageListCreateView.as_view(),
        name="message-list-create",
    ),

    path(
        "messages/<int:pk>/",
        MessageDetailView.as_view(),
        name="message-detail",
    ),

    path(
        "messages/<int:pk>/read/",
        MarkMessageAsReadView.as_view(),
        name="message-mark-read",
    ),
]