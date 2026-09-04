from rest_framework import serializers

from .models import (
    School,
    AcademicSession,
    Term,
    ClassLevel,
    Department,
    Subject,
    AcademicSection,
)


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = "__all__"


class AcademicSessionSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    class Meta:
        model = AcademicSession
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["school_name"] = (
            instance.school.name
            if instance.school
            else None
        )

        return data


class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = "__all__"


class ClassLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassLevel
        fields = "__all__"


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class AcademicSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSection
        fields = "__all__"