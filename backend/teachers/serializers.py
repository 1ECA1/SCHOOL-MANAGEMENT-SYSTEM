from rest_framework import serializers

from accounts.models import User
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

        extra_kwargs = {
            # The authenticated School Admin's school is
            # assigned by the backend.
            "school": {"required": False},
        }

        read_only_fields = [
            "id",
            "full_name",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            user = request.user

            if user.role == User.Role.SCHOOL_ADMIN:
                if not user.school_id:
                    raise serializers.ValidationError({
                        "school": (
                            "Your administrator account "
                            "has no assigned school."
                        )
                    })

                # Never trust a school ID supplied by a
                # School Admin's browser.
                attrs["school"] = user.school

        # School is required for other roles unless they
        # already have an instance with a school.
        if not attrs.get("school") and not (
            self.instance and self.instance.school_id
        ):
            raise serializers.ValidationError({
                "school": "School is required."
            })

        return attrs


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