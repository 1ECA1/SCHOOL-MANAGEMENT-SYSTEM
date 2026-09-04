from rest_framework import serializers

from .models import Assignment, AssignmentSubmission


class AssignmentSerializer(serializers.ModelSerializer):
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

    teacher_name = serializers.CharField(
        source="teacher.full_name",
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = Assignment

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
            "title",
            "instructions",
            "attachment",
            "assigned_date",
            "due_date",
            "maximum_score",
            "allow_late_submission",
            "status",
            "status_display",
            "submission_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "school_name",
            "academic_session_name",
            "term_name",
            "class_level_name",
            "subject_name",
            "teacher_name",
            "status_display",
            "submission_count",
            "created_at",
            "updated_at",
        ]

    def get_submission_count(self, obj):
        return obj.submissions.count()


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(
        source="assignment.title",
        read_only=True,
    )

    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = AssignmentSubmission

        fields = [
            "id",
            "assignment",
            "assignment_title",
            "student",
            "student_name",
            "submission_file",
            "answer_text",
            "submitted_at",
            "score",
            "teacher_feedback",
            "status",
            "status_display",
            "graded_at",
        ]

        read_only_fields = [
            "id",
            "assignment_title",
            "student_name",
            "submitted_at",
            "status_display",
            "graded_at",
        ]

    def create(self, validated_data):
        submission = AssignmentSubmission.objects.create(
            **validated_data
        )

        return submission

    def update(self, instance, validated_data):
        new_status = validated_data.get(
            "status",
            instance.status,
        )

        if (
            new_status == AssignmentSubmission.Status.GRADED
            and instance.status != AssignmentSubmission.Status.GRADED
        ):
            from django.utils import timezone

            instance.graded_at = timezone.now()

        return super().update(
            instance,
            validated_data,
        )