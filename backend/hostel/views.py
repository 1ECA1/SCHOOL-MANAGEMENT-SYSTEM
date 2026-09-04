from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import (
    Hostel,
    HostelRoom,
    Bed,
    HostelAllocation,
)

from .serializers import (
    HostelSerializer,
    HostelRoomSerializer,
    BedSerializer,
    HostelAllocationSerializer,
)


class HostelListCreateView(generics.ListCreateAPIView):
    queryset = Hostel.objects.select_related(
        "school"
    ).all()

    serializer_class = HostelSerializer
    permission_classes = [IsAuthenticated]


class HostelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Hostel.objects.select_related(
        "school"
    ).all()

    serializer_class = HostelSerializer
    permission_classes = [IsAuthenticated]


class HostelRoomListCreateView(generics.ListCreateAPIView):
    queryset = HostelRoom.objects.select_related(
        "hostel"
    ).all()

    serializer_class = HostelRoomSerializer
    permission_classes = [IsAuthenticated]


class HostelRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HostelRoom.objects.select_related(
        "hostel"
    ).all()

    serializer_class = HostelRoomSerializer
    permission_classes = [IsAuthenticated]


class BedListCreateView(generics.ListCreateAPIView):
    queryset = Bed.objects.select_related(
        "room",
        "room__hostel",
    ).all()

    serializer_class = BedSerializer
    permission_classes = [IsAuthenticated]


class BedDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bed.objects.select_related(
        "room",
        "room__hostel",
    ).all()

    serializer_class = BedSerializer
    permission_classes = [IsAuthenticated]


class HostelAllocationListCreateView(generics.ListCreateAPIView):
    queryset = HostelAllocation.objects.select_related(
        "student",
        "hostel",
        "room",
        "bed",
        "academic_session",
    ).all()

    serializer_class = HostelAllocationSerializer
    permission_classes = [IsAuthenticated]


class HostelAllocationDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = HostelAllocation.objects.select_related(
        "student",
        "hostel",
        "room",
        "bed",
        "academic_session",
    ).all()

    serializer_class = HostelAllocationSerializer
    permission_classes = [IsAuthenticated]