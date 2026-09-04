from rest_framework import serializers

from .models import (
    ParentGuardian,
    Student,
    StudentEnrollment,
    StudentSubjectEnrollment,
)

class ParentStudentSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = [
            "id",
            "full_name",
            "admission_number",
        ]


class ParentGuardianSerializer(serializers.ModelSerializer):
    students = ParentStudentSerializer(
        # source="students",
        many=True,
        read_only=True,
    )

    student_count = serializers.SerializerMethodField()

    class Meta:
        model = ParentGuardian
        fields = [
            "id",
            "school",
            "user",
            "full_name",
            "relationship",
            "phone_number",
            "email",
            "address",
            "occupation",
            "emergency_contact",
            "is_active",
            "students",
            "student_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "school",
            "user",
            "students",
            "student_count",
            "created_at",
            "updated_at",
        ]

    def get_student_count(self, obj):
        return obj.students.count()

class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    parents = ParentGuardianSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Student
        fields = [
            "id",
            "school",
            "user",
            "admission_number",
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "date_of_birth",
            "gender",
            "email",
            "phone_number",
            "profile_image",
            "address",
            "department",
            "parents",
            "status",
            "admission_date",
            "blood_group",
            "nationality",
            "state_of_origin",
            "local_government",
            "medical_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "full_name",
            "created_at",
            "updated_at",
        ]


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    class_name = serializers.CharField(
        source="class_level.name",
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

    class Meta:
        model = StudentEnrollment
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
            "enrollment_date",
            "is_current",
            "roll_number",
            "remarks",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "enrollment_date",
            "created_at",
        ]


class StudentSubjectEnrollmentSerializer(
    serializers.ModelSerializer
):
    student_name = serializers.CharField(
        source="student_enrollment.student.full_name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    class Meta:
        model = StudentSubjectEnrollment
        fields = [
            "id",
            "student_enrollment",
            "student_name",
            "subject",
            "subject_name",
            "academic_session",
            "term",
            "is_core",
            "enrolled_at",
            "is_active",
        ]
        read_only_fields = [
            "id",
            "enrolled_at",
        ]