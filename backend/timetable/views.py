
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import TimetableEntry
from .serializers import TimetableEntrySerializer


class TimetableEntryListCreateView(generics.ListCreateAPIView):
    """
    List all timetable entries and create a new timetable entry.
    """

    queryset = TimetableEntry.objects.select_related(
        "school",
        "academic_session",
        "term",
        "class_level",
        "subject",
        "teacher",
    )

    serializer_class = TimetableEntrySerializer
    permission_classes = [IsAuthenticated]


class TimetableEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a timetable entry.
    """

    queryset = TimetableEntry.objects.select_related(
        "school",
        "academic_session",
        "term",
        "class_level",
        "subject",
        "teacher",
    )

    serializer_class = TimetableEntrySerializer
    permission_classes = [IsAuthenticated]
