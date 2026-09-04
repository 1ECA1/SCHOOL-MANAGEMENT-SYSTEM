from rest_framework import serializers

from .models import (
    Examination,
    ExaminationSubject,
)


class ExaminationSerializer(serializers.ModelSerializer):

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

    examination_type_display = serializers.CharField(
        source="get_examination_type_display",
        read_only=True,
    )

    class Meta:
        model = Examination

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

            "name",
            "examination_type",
            "examination_type_display",

            "start_date",
            "end_date",

            "description",

            "is_published",
            "is_active",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class ExaminationSubjectSerializer(serializers.ModelSerializer):

    examination_name = serializers.CharField(
        source="examination.name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    subject_code = serializers.CharField(
        source="subject.code",
        read_only=True,
    )

    class Meta:
        model = ExaminationSubject

        fields = [
            "id",

            "examination",
            "examination_name",

            "subject",
            "subject_name",
            "subject_code",

            "examination_date",
            "start_time",
            "end_time",

            "maximum_score",
            "pass_mark",

            "venue",

            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]