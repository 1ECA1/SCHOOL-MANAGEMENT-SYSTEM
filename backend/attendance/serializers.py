from rest_framework import serializers

from .models import AttendanceRecord


class AttendanceRecordSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    academic_session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
        allow_null=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = AttendanceRecord

        fields = [
            "id",
            "school",
            "school_name",
            "student",
            "student_name",
            "academic_session",
            "academic_session_name",
            "term",
            "term_name",
            "class_level",
            "class_level_name",
            "subject",
            "subject_name",
            "date",
            "status",
            "status_display",
            "check_in_time",
            "check_out_time",
            "remarks",
            "recorded_at",
        ]

        read_only_fields = [
            "id",
            "recorded_at",
        ]


class AttendanceSummarySerializer(serializers.Serializer):
    student = serializers.IntegerField()
    academic_session = serializers.IntegerField()
    term = serializers.IntegerField()
    class_level = serializers.IntegerField()

    total_days = serializers.IntegerField()
    present_days = serializers.IntegerField()
    absent_days = serializers.IntegerField()
    late_days = serializers.IntegerField()
    excused_days = serializers.IntegerField()

    attendance_percentage = serializers.FloatField()