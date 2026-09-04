
from rest_framework import serializers

from .models import TimetableEntry


class TimetableEntrySerializer(serializers.ModelSerializer):
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
    )

    teacher_name = serializers.SerializerMethodField()

    day_display = serializers.CharField(
        source="get_day_display",
        read_only=True,
    )

    class Meta:
        model = TimetableEntry

        fields = [
            "id",
            "school",
            "school_name",
            "academic_session",
            "academic_session_name",
            "term",
            "term_name",
            "class_level",
            "class_level_name",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "day",
            "day_display",
            "start_time",
            "end_time",
            "room",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "school_name",
            "academic_session_name",
            "term_name",
            "class_level_name",
            "subject_name",
            "teacher_name",
            "day_display",
        ]

    def get_teacher_name(self, obj):
        teacher = obj.teacher

        if not teacher:
            return None

        if hasattr(teacher, "full_name"):
            return teacher.full_name

        return str(teacher)

