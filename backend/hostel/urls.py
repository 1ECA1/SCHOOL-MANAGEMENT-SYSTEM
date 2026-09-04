from django.urls import path

from .views import (
    HostelListCreateView,
    HostelDetailView,
    HostelRoomListCreateView,
    HostelRoomDetailView,
    BedListCreateView,
    BedDetailView,
    HostelAllocationListCreateView,
    HostelAllocationDetailView,
)


urlpatterns = [

    # Hostels
    path(
        "",
        HostelListCreateView.as_view(),
        name="hostel-list-create",
    ),

    path(
        "<int:pk>/",
        HostelDetailView.as_view(),
        name="hostel-detail",
    ),

    # Rooms
    path(
        "rooms/",
        HostelRoomListCreateView.as_view(),
        name="hostel-room-list-create",
    ),

    path(
        "rooms/<int:pk>/",
        HostelRoomDetailView.as_view(),
        name="hostel-room-detail",
    ),

    # Beds
    path(
        "beds/",
        BedListCreateView.as_view(),
        name="bed-list-create",
    ),

    path(
        "beds/<int:pk>/",
        BedDetailView.as_view(),
        name="bed-detail",
    ),

    # Allocations
    path(
        "allocations/",
        HostelAllocationListCreateView.as_view(),
        name="hostel-allocation-list-create",
    ),

    path(
        "allocations/<int:pk>/",
        HostelAllocationDetailView.as_view(),
        name="hostel-allocation-detail",
    ),
]