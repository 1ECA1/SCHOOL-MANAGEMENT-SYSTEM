from rest_framework import serializers
from students.models import (
    StudentEnrollment,
    StudentSubjectEnrollment,
)

from .models import (
    School,
    AcademicSession,
    Term,
    ClassLevel,
    Department,
    Subject,
    AcademicSection,
    ClassSubject,
)

from teachers.models import TeacherSubject

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
    student_count = serializers.SerializerMethodField()
    students = serializers.SerializerMethodField()

    class Meta:
        model = ClassLevel

        fields = [
            "id",
            "school",
            "name",
            "code",
            "education_level",
            "description",
            "department",
            "capacity",
            "is_active",

            # Students enrolled in this class
            "student_count",
            "students",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student_count",
            "students",
            "created_at",
            "updated_at",
        ]

    # =====================================================
    # STUDENT COUNT
    # =====================================================
    def get_student_count(self, obj):
        return (
            StudentEnrollment.objects
            .filter(
                class_level=obj,
                is_current=True,
            )
            .values("student_id")
            .distinct()
            .count()
        )


    def get_students(self, obj):
        enrollments = (
            StudentEnrollment.objects
            .filter(
                class_level=obj,
                is_current=True,
            )
            .select_related("student")
            .order_by(
                "roll_number",
                "student__last_name",
                "student__first_name",
            )
        )

        students = []

        for enrollment in enrollments:
            student = enrollment.student

            students.append({
                "enrollment_id": enrollment.id,
                "student_id": student.id,
                "full_name": student.full_name,
                "admission_number": student.admission_number,
                "status": student.status,
                "roll_number": enrollment.roll_number,
            })

        return students

    # =====================================================
    # VALIDATION
    # =====================================================

    def validate(self, attrs):
        school = attrs.get(
            "school",
            getattr(
                self.instance,
                "school",
                None,
            ),
        )

        code = attrs.get(
            "code",
            getattr(
                self.instance,
                "code",
                None,
            ),
        )

        name = attrs.get(
            "name",
            getattr(
                self.instance,
                "name",
                None,
            ),
        )

        education_level = attrs.get(
            "education_level",
            getattr(
                self.instance,
                "education_level",
                None,
            ),
        )

        department = attrs.get(
            "department",
            getattr(
                self.instance,
                "department",
                None,
            ),
        )

        # =================================================
        # PRIMARY / JSS
        # =================================================

        if education_level in [
            ClassLevel.EducationLevel.PRIMARY,
            ClassLevel.EducationLevel.JSS,
        ]:
            if department is not None:
                raise serializers.ValidationError({
                    "department": (
                        "Department is not allowed for "
                        "Primary or JSS classes."
                    )
                })

        # =================================================
        # SENIOR SECONDARY
        # =================================================

        elif education_level == ClassLevel.EducationLevel.SS:
            if department is None:
                raise serializers.ValidationError({
                    "department": (
                        "Department is required for "
                        "Senior Secondary classes."
                    )
                })

        # =================================================
        # DEPARTMENT MUST BELONG TO SAME SCHOOL
        # =================================================

        if (
            department is not None
            and school is not None
        ):
            if department.school_id != school.id:
                raise serializers.ValidationError({
                    "department": (
                        "The selected department does not "
                        "belong to the selected school."
                    )
                })

        # =================================================
        # DUPLICATE SS CLASS CHECK
        # =================================================

        if (
            education_level
            == ClassLevel.EducationLevel.SS
            and school is not None
            and code
            and department is not None
        ):
            duplicate_query = ClassLevel.objects.filter(
                school=school,
                code=code,
                department=department,
                education_level=(
                    ClassLevel.EducationLevel.SS
                ),
            )

            if self.instance:
                duplicate_query = (
                    duplicate_query.exclude(
                        pk=self.instance.pk
                    )
                )

            if duplicate_query.exists():
                department_name = department.name
                class_display = name or code

                raise serializers.ValidationError({
                    "code": (
                        f"{class_display} already exists for "
                        f"the {department_name} department "
                        f"in this school."
                    )
                })

        # =================================================
        # DUPLICATE PRIMARY / JSS CLASS CHECK
        # =================================================

        if (
            education_level in [
                ClassLevel.EducationLevel.PRIMARY,
                ClassLevel.EducationLevel.JSS,
            ]
            and school is not None
            and code
        ):
            duplicate_query = ClassLevel.objects.filter(
                school=school,
                code=code,
                education_level=education_level,
            )

            if self.instance:
                duplicate_query = (
                    duplicate_query.exclude(
                        pk=self.instance.pk
                    )
                )

            if duplicate_query.exists():

                education_name = (
                    "Primary"
                    if education_level
                    == ClassLevel.EducationLevel.PRIMARY
                    else "JSS"
                )

                class_display = name or code

                raise serializers.ValidationError({
                    "code": (
                        f"{class_display} already exists "
                        f"as a {education_name} class "
                        f"in this school."
                    )
                })

        return attrs


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "school",
            "name",
            "code",
            "education_level",
            "department",
            "description",
            "is_core",
            "is_active",
            "student_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student_count",
            "created_at",
            "updated_at",
        ]

    def get_student_count(self, obj):
        return (
            obj.student_enrollments
            .filter(is_active=True)
            .values("student_enrollment__student")
            .distinct()
            .count()
        )

    def validate(self, attrs):
        school = attrs.get(
            "school",
            getattr(self.instance, "school", None),
        )

        education_level = attrs.get(
            "education_level",
            getattr(self.instance, "education_level", None),
        )

        department = attrs.get(
            "department",
            getattr(self.instance, "department", None),
        )

        code = attrs.get(
            "code",
            getattr(self.instance, "code", None),
        )

        if education_level in ["PRIMARY", "JSS"]:
            if department is not None:
                raise serializers.ValidationError({
                    "department": (
                        "Primary and JSS subjects cannot be assigned "
                        "to a department."
                    )
                })

        if education_level == "SS":
            if department is not None:
                if school is None:
                    raise serializers.ValidationError({
                        "school": (
                            "School is required when a department "
                            "is selected."
                        )
                    })

                if department.school_id != school.id:
                    raise serializers.ValidationError({
                        "department": (
                            "The selected department must belong "
                            "to the selected school."
                        )
                    })

                queryset = Subject.objects.filter(
                    school=school,
                    education_level="SS",
                    code=code,
                    department=department,
                )

                if self.instance:
                    queryset = queryset.exclude(
                        pk=self.instance.pk
                    )

                if queryset.exists():
                    raise serializers.ValidationError({
                        "code": (
                            "A subject with this code already exists "
                            "for this department."
                        )
                    })

            else:
                queryset = Subject.objects.filter(
                    school=school,
                    education_level="SS",
                    code=code,
                    department__isnull=True,
                )

                if self.instance:
                    queryset = queryset.exclude(
                        pk=self.instance.pk
                    )

                if queryset.exists():
                    raise serializers.ValidationError({
                        "code": (
                            "A general SS subject with this code "
                            "already exists."
                        )
                    })

        if department is not None:
            if school is None:
                raise serializers.ValidationError({
                    "school": (
                        "School is required when a department "
                        "is selected."
                    )
                })

            if department.school_id != school.id:
                raise serializers.ValidationError({
                    "department": (
                        "The selected department must belong "
                        "to the selected school."
                    )
                })

        return attrs


from django.core.exceptions import ValidationError as DjangoValidationError


from django.core.exceptions import ValidationError as DjangoValidationError


class ClassSubjectSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    class_level_education_level = serializers.CharField(
        source="class_level.education_level",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    subject_education_level = serializers.CharField(
        source="subject.education_level",
        read_only=True,
    )

    teacher_count = serializers.SerializerMethodField()
    teachers = serializers.SerializerMethodField()

    student_count = serializers.SerializerMethodField()
    students = serializers.SerializerMethodField()

    class Meta:
        model = ClassSubject

        fields = [
            "id",

            # Class
            "class_level",
            "class_level_name",
            "class_level_education_level",

            # Subject
            "subject",
            "subject_name",
            "subject_education_level",

            # Assignment
            "assignment_type",
            "is_core",
            "is_active",

            # Teachers
            "teacher_count",
            "teachers",

            # Students
            "student_count",
            "students",

            # Timestamps
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "class_level_name",
            "class_level_education_level",
            "subject_name",
            "subject_education_level",
            "teacher_count",
            "teachers",
            "student_count",
            "students",
            "created_at",
            "updated_at",
        ]

    # ---------------------------------------------------------
    # TEACHERS
    # ---------------------------------------------------------

    def get_teachers(self, obj):
        """
        TeacherSubject already connects:

            Teacher + Subject + Class

        Therefore we do not need to add a teacher FK to
        ClassSubject.
        """

        assignments = (
            TeacherSubject.objects
            .filter(
                subject=obj.subject,
                class_level=obj.class_level,
            )
            .select_related("teacher")
            .order_by("-is_primary", "teacher__last_name")
        )

        return [
            {
                "id": assignment.teacher.id,
                "name": assignment.teacher.full_name,
                "employee_id": assignment.teacher.employee_id,
                "is_primary": assignment.is_primary,
            }
            for assignment in assignments
        ]

    def get_teacher_count(self, obj):
        return TeacherSubject.objects.filter(
            subject=obj.subject,
            class_level=obj.class_level,
        ).count()

    # ---------------------------------------------------------
    # STUDENTS
    # ---------------------------------------------------------

    def _get_student_enrollments(self, obj):
        """
        Get the students who should actually be doing this
        subject for this class-subject assignment.
        """

        class_level = obj.class_level
        subject = obj.subject

        # -----------------------------------------------------
        # PRIMARY / JSS
        #
        # Every student in the class does the subject.
        # -----------------------------------------------------

        if class_level.education_level in [
            ClassLevel.EducationLevel.PRIMARY,
            ClassLevel.EducationLevel.JSS,
        ]:
            return (
                StudentEnrollment.objects
                .filter(
                    class_level=class_level,
                    is_current=True,
                )
                .select_related("student")
                .order_by(
                    "roll_number",
                    "student__last_name",
                    "student__first_name",
                )
            )

        # -----------------------------------------------------
        # SENIOR SECONDARY
        # -----------------------------------------------------

        if class_level.education_level == ClassLevel.EducationLevel.SS:

            # -------------------------------------------------
            # GENERAL COMPULSORY
            #
            # Everyone in the class does the subject.
            # -------------------------------------------------

            if obj.assignment_type == "GENERAL_COMPULSORY":
                return (
                    StudentEnrollment.objects
                    .filter(
                        class_level=class_level,
                        is_current=True,
                    )
                    .select_related("student")
                    .order_by(
                        "roll_number",
                        "student__last_name",
                        "student__first_name",
                    )
                )

            # -------------------------------------------------
            # DEPARTMENT COMPULSORY
            #
            # Everyone in the department/class does it.
            #
            # Example:
            #
            # SS3 ART
            #     -> Government
            #     -> Literature in English
            #
            # All students currently enrolled in SS3 ART
            # are considered students doing the subject.
            # -------------------------------------------------

            if obj.assignment_type == "DEPARTMENT_COMPULSORY":
                return (
                    StudentEnrollment.objects
                    .filter(
                        class_level=class_level,
                        is_current=True,
                    )
                    .select_related("student")
                    .order_by(
                        "roll_number",
                        "student__last_name",
                        "student__first_name",
                    )
                )

            # -------------------------------------------------
            # OPTIONAL
            #
            # Only students who explicitly enrolled in the
            # subject should be counted.
            # -------------------------------------------------

            if obj.assignment_type == "OPTIONAL":

                enrollment_ids = (
                    StudentSubjectEnrollment.objects
                    .filter(
                        subject=subject,
                        is_active=True,
                        student_enrollment__class_level=class_level,
                        student_enrollment__is_current=True,
                    )
                    .values_list(
                        "student_enrollment_id",
                        flat=True,
                    )
                    .distinct()
                )

                return (
                    StudentEnrollment.objects
                    .filter(
                        id__in=enrollment_ids,
                        class_level=class_level,
                        is_current=True,
                    )
                    .select_related("student")
                    .order_by(
                        "roll_number",
                        "student__last_name",
                        "student__first_name",
                    )
                )

        # -----------------------------------------------------
        # SAFETY FALLBACK
        # -----------------------------------------------------

        return StudentEnrollment.objects.none()

    def get_student_count(self, obj):
        return self._get_student_enrollments(obj).values(
            "student_id"
        ).distinct().count()

    def get_students(self, obj):
        enrollments = self._get_student_enrollments(obj)

        return [
            {
                "student_id": enrollment.student.id,
                "full_name": enrollment.student.full_name,
                "admission_number": enrollment.student.admission_number,
                "roll_number": enrollment.roll_number,
            }
            for enrollment in enrollments
        ]

    # ---------------------------------------------------------
    # VALIDATION
    # ---------------------------------------------------------

    def validate(self, attrs):
        """
        Keep the existing ClassSubject model validation.

        The model's clean() method already validates:

        - same school
        - same education level
        - Primary/JSS restrictions
        - SS department rules
        - assignment type rules
        """

        instance = self.instance

        class_level = attrs.get(
            "class_level",
            getattr(instance, "class_level", None),
        )

        subject = attrs.get(
            "subject",
            getattr(instance, "subject", None),
        )

        assignment_type = attrs.get(
            "assignment_type",
            getattr(instance, "assignment_type", None),
        )

        if class_level and subject:
            temp_instance = ClassSubject(
                class_level=class_level,
                subject=subject,
                assignment_type=assignment_type,
                is_core=attrs.get(
                    "is_core",
                    getattr(instance, "is_core", False),
                ),
                is_active=attrs.get(
                    "is_active",
                    getattr(instance, "is_active", True),
                ),
            )

            try:
                temp_instance.full_clean(
                    exclude=["id"]
                )
            except DjangoValidationError as exc:
                raise serializers.ValidationError(exc.message_dict)

        return attrs

class AcademicSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSection
        fields = "__all__"