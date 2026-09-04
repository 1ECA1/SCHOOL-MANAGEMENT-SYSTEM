from rest_framework import serializers

from .models import Teacher, TeacherSubject, ClassTeacher


class TeacherSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )
    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    class Meta:
        model = Teacher

        fields = [
            "id",
            "school",
            "school_name",
            "user",
            "employee_id",
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "email",
            "phone_number",
            "date_of_birth",
            "gender",
            "profile_image",
            "address",
            "department",
            "department_name",
            "specialization",
            "qualification",
            "employment_date",
            "employment_status",
            "is_class_teacher",
            "bio",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "full_name",
            "created_at",
            "updated_at",
        ]


class TeacherSubjectSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source="teacher.full_name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    class Meta:
        model = TeacherSubject

        fields = [
            "id",
            "teacher",
            "teacher_name",
            "subject",
            "subject_name",
            "class_level",
            "class_level_name",
            "is_primary",
            "assigned_at",
        ]

        read_only_fields = [
            "id",
            "teacher_name",
            "subject_name",
            "class_level_name",
            "assigned_at",
        ]


class ClassTeacherSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source="teacher.full_name",
        read_only=True,
    )

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    academic_session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    class Meta:
        model = ClassTeacher

        fields = [
            "id",
            "teacher",
            "teacher_name",
            "class_level",
            "class_level_name",
            "academic_session",
            "academic_session_name",
            "assigned_at",
            "is_active",
        ]

        read_only_fields = [
            "id",
            "teacher_name",
            "class_level_name",
            "academic_session_name",
            "assigned_at",
        ]