from django.db.models import Count, Q

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import AttendanceRecord
from .serializers import (
    AttendanceRecordSerializer,
    AttendanceSummarySerializer,
)


# =========================
# Attendance Records
# =========================

# class AttendanceRecordListCreateView(
#     generics.ListCreateAPIView
# ):
#     queryset = AttendanceRecord.objects.select_related(
#         "school",
#         "student",
#         "academic_session",
#         "term",
#         "class_level",
#         "subject",
#     )

#     serializer_class = AttendanceRecordSerializer
#     permission_classes = [IsAuthenticated]


class AttendanceRecordListCreateView(generics.ListCreateAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AttendanceRecord.objects.select_related(
            "school", "student", "academic_session", "term", "class_level", "subject"
        )

        class_level = self.request.query_params.get("class_level")
        academic_session = self.request.query_params.get("academic_session")
        term = self.request.query_params.get("term")
        date = self.request.query_params.get("date")
        subject = self.request.query_params.get("subject")

        if class_level:
            queryset = queryset.filter(class_level_id=class_level)
        if academic_session:
            queryset = queryset.filter(academic_session_id=academic_session)
        if term:
            queryset = queryset.filter(term_id=term)
        if date:
            queryset = queryset.filter(date=date)
        if subject:
            queryset = queryset.filter(subject_id=subject)

        return queryset

class AttendanceRecordDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = AttendanceRecord.objects.select_related(
        "school",
        "student",
        "academic_session",
        "term",
        "class_level",
        "subject",
    )

    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]


# =========================
# Attendance Summary
# =========================

class AttendanceSummaryView(
    generics.RetrieveAPIView
):
    serializer_class = AttendanceSummarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AttendanceRecord.objects.select_related(
            "student",
            "academic_session",
            "term",
            "class_level",
        )

    def get_object(self):
        student_id = self.kwargs["student_id"]
        academic_session_id = self.kwargs[
            "academic_session_id"
        ]
        term_id = self.kwargs["term_id"]
        class_level_id = self.kwargs[
            "class_level_id"
        ]

        records = self.get_queryset().filter(
            student_id=student_id,
            academic_session_id=academic_session_id,
            term_id=term_id,
            class_level_id=class_level_id,
        )

        summary = records.aggregate(
            total_days=Count("id"),
            present_days=Count(
                "id",
                filter=Q(status="PRESENT"),
            ),
            absent_days=Count(
                "id",
                filter=Q(status="ABSENT"),
            ),
            late_days=Count(
                "id",
                filter=Q(status="LATE"),
            ),
            excused_days=Count(
                "id",
                filter=Q(status="EXCUSED"),
            ),
        )

        total_days = summary["total_days"]

        if total_days > 0:
            attendance_percentage = round(
                (
                    (
                        summary["present_days"]
                        + summary["late_days"]
                    )
                    / total_days
                )
                * 100,
                2,
            )
        else:
            attendance_percentage = 0

        return {
            "student": student_id,
            "academic_session": academic_session_id,
            "term": term_id,
            "class_level": class_level_id,
            "total_days": total_days,
            "present_days": summary["present_days"],
            "absent_days": summary["absent_days"],
            "late_days": summary["late_days"],
            "excused_days": summary["excused_days"],
            "attendance_percentage": attendance_percentage,
        }