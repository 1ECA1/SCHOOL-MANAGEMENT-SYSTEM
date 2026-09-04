from rest_framework import serializers

from .models import (
    GradeScale,
    StudentResult,
    ReportCard,
)


class GradeScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeScale
        fields = [
            "id",
            "name",
            "minimum_score",
            "maximum_score",
            "grade",
            "remark",
            "grade_point",
            "is_active",
        ]
        read_only_fields = ["id"]


class StudentResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="examination_subject.subject.name",
        read_only=True,
    )

    examination_name = serializers.CharField(
        source="examination_subject.examination.name",
        read_only=True,
    )

    academic_session = serializers.IntegerField(
        source="examination_subject.examination.academic_session.id",
        read_only=True,
    )

    term = serializers.IntegerField(
        source="examination_subject.examination.term.id",
        read_only=True,
    )

    class_level = serializers.IntegerField(
        source="examination_subject.examination.class_level.id",
        read_only=True,
    )

    class Meta:
        model = StudentResult
        fields = [
            "id",
            "student",
            "student_name",
            "examination_subject",
            "examination_name",
            "subject_name",
            "academic_session",
            "term",
            "class_level",
            "ca_score",
            "exam_score",
            "total_score",
            "grade",
            "remark",
            "grade_point",
            "position",
            "is_published",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "total_score",
            "grade",
            "remark",
            "grade_point",
            "created_at",
            "updated_at",
        ]


class ReportCardSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )

    class_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    class Meta:
        model = ReportCard
        fields = [
            "id",
            "student",
            "student_name",
            "academic_session",
            "session_name",
            "term",
            "term_name",
            "class_level",
            "class_name",
            "total_score",
            "average_score",
            "overall_grade",
            "position",
            "total_students",
            "attendance_percentage",
            "teacher_comment",
            "principal_comment",
            "promoted",
            "is_published",
            "created_at",
            "updated_at",
        ]
    
read_only_fields = [
    "id",
    "total_score",
    "average_score",
    "overall_grade",
    "position",
    "total_students",
    "created_at",
    "updated_at",
]