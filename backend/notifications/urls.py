from django.urls import path

from .views import (
    NotificationListCreateView,
    NotificationDetailView,
    UnreadNotificationListView,
    NotificationSendView,
    SentNotificationListView,
    SentNotificationDetailView,
)


urlpatterns = [

    # --------------------------------------------------------
    # INBOX
    # --------------------------------------------------------

    path(
        "",
        NotificationListCreateView.as_view(),
        name="notification-list-create",
    ),

    # --------------------------------------------------------
    # UNREAD
    # --------------------------------------------------------

    path(
        "unread/",
        UnreadNotificationListView.as_view(),
        name="notification-unread",
    ),

    # --------------------------------------------------------
    # SEND
    # --------------------------------------------------------

    path(
        "send/",
        NotificationSendView.as_view(),
        name="notification-send",
    ),

    # --------------------------------------------------------
    # SENT
    # --------------------------------------------------------

    path(
        "sent/",
        SentNotificationListView.as_view(),
        name="notification-sent",
    ),

    # --------------------------------------------------------
    # DETAIL
    # --------------------------------------------------------

    path(
        "<int:pk>/",
        NotificationDetailView.as_view(),
        name="notification-detail",
    ),

    path(
        "sent/",
        SentNotificationListView.as_view(),
        name="notification-sent-list",
    ),

    path(
        "sent/<int:pk>/",
        SentNotificationDetailView.as_view(),
        name="notification-sent-detail",
    ),
]