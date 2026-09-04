from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    uploaded_by_name = serializers.SerializerMethodField()

    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
        allow_null=True,
    )

    staff_name = serializers.CharField(
        source="staff.full_name",
        read_only=True,
        allow_null=True,
    )

    document_type_display = serializers.CharField(
        source="get_document_type_display",
        read_only=True,
    )

    class Meta:
        model = Document

        fields = [
            "id",
            "school",
            "school_name",
            "uploaded_by",
            "uploaded_by_name",
            "title",
            "document_type",
            "document_type_display",
            "description",
            "file",
            "student",
            "student_name",
            "staff",
            "staff_name",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "school_name",
            "uploaded_by_name",
            "document_type_display",
            "student_name",
            "staff_name",
            "created_at",
            "updated_at",
        ]

    def get_uploaded_by_name(self, obj):
        user = obj.uploaded_by

        if not user:
            return None

        if hasattr(user, "get_full_name"):
            full_name = user.get_full_name()

            if full_name:
                return full_name

        return user.username