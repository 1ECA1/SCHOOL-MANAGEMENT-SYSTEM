

from django.urls import path

from .views import (
    NotificationListCreateView,
    NotificationDetailView,
    UnreadNotificationListView,
)


urlpatterns = [

    path(
        "",
        NotificationListCreateView.as_view(),
        name="notification-list-create",
    ),

    path(
        "unread/",
        UnreadNotificationListView.as_view(),
        name="notification-unread",
    ),

    path(
        "<int:pk>/",
        NotificationDetailView.as_view(),
        name="notification-detail",
    ),
]