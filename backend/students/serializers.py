from django.utils import timezone
from rest_framework import serializers

from .models import (
    ParentGuardian,
    Student,
    StudentEnrollment,
    StudentSubjectEnrollment,
    OptionalSubjectSelectionSetting,
    PromotionRecord,
)


# ============================================================
# PARENT → STUDENT
# Used when displaying a parent's children
# ============================================================

class ParentStudentSerializer(serializers.ModelSerializer):

    full_name = serializers.ReadOnlyField()

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
        allow_null=True,
    )

    current_enrollment = serializers.SerializerMethodField()

    current_session = serializers.SerializerMethodField()

    current_term = serializers.SerializerMethodField()

    current_class = serializers.SerializerMethodField()

    current_roll_number = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # CURRENT ENROLLMENT
    # --------------------------------------------------------

    def _get_current_enrollment(self, obj):
        return (
            StudentEnrollment.objects
            .filter(
                student=obj,
                is_current=True,
            )
            .select_related(
                "academic_session",
                "term",
                "class_level",
            )
            .order_by("-id")
            .first()
        )

    # --------------------------------------------------------
    # CURRENT SESSION
    # --------------------------------------------------------

    def get_current_session(self, obj):
        enrollment = self._get_current_enrollment(obj)

        if not enrollment:
            return None

        return enrollment.academic_session.name

    # --------------------------------------------------------
    # CURRENT TERM
    # --------------------------------------------------------

    def get_current_term(self, obj):
        enrollment = self._get_current_enrollment(obj)

        if not enrollment:
            return None

        return enrollment.term.get_name_display()

    # --------------------------------------------------------
    # CURRENT CLASS
    # --------------------------------------------------------

    def get_current_class(self, obj):
        enrollment = self._get_current_enrollment(obj)

        if not enrollment:
            return None

        return enrollment.class_level.name

    # --------------------------------------------------------
    # CURRENT ROLL NUMBER
    # --------------------------------------------------------

    def get_current_roll_number(self, obj):
        enrollment = self._get_current_enrollment(obj)

        if not enrollment:
            return None

        return enrollment.roll_number

    # --------------------------------------------------------
    # CURRENT ENROLLMENT
    # --------------------------------------------------------

    def get_current_enrollment(self, obj):
        enrollment = self._get_current_enrollment(obj)

        if not enrollment:
            return None

        return {
            "id": enrollment.id,

            "academic_session": (
                enrollment.academic_session_id
            ),

            "session_name": (
                enrollment.academic_session.name
            ),

            "term": enrollment.term_id,

            "term_name": (
                enrollment.term.get_name_display()
            ),

            "class_level": (
                enrollment.class_level_id
            ),

            "class_name": (
                enrollment.class_level.name
            ),

            "roll_number": enrollment.roll_number,

            "is_current": enrollment.is_current,
        }

    # --------------------------------------------------------
    # META
    # --------------------------------------------------------

    class Meta:
        model = Student

        fields = [
            "id",
            "full_name",
            "admission_number",
            "profile_image",
            "department",
            "department_name",
            "current_enrollment",
            "current_session",
            "current_term",
            "current_class",
            "current_roll_number",
            "status",
        ]


# ============================================================
# STUDENT → PARENT REFERENCE
# Used when displaying a student's parents
# ============================================================

class ParentReferenceSerializer(serializers.ModelSerializer):

    class Meta:
        model = ParentGuardian

        fields = [
            "id",
            "full_name",
            "relationship",
            "phone_number",
            "email",
            "profile_image",
            "address",
            "occupation",
            "emergency_contact",
            "is_active",
        ]


class ParentGuardianSerializer(serializers.ModelSerializer):
    students = ParentStudentSerializer(many=True, read_only=True)
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
            "profile_image",
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


# ============================================================
# STUDENT
# ============================================================

class StudentSerializer(serializers.ModelSerializer):

    full_name = serializers.ReadOnlyField()

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    graduation_session_name = serializers.CharField(
        source="graduation_session.name",
        read_only=True,
    )

    parents = ParentReferenceSerializer(
        many=True,
        read_only=True,
    )

    # --------------------------------------------------------
    # CURRENT ENROLLMENT
    # --------------------------------------------------------

    current_enrollment = serializers.SerializerMethodField()

    current_session = serializers.SerializerMethodField()

    current_term = serializers.SerializerMethodField()

    current_class = serializers.SerializerMethodField()

    current_roll_number = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # CURRENT ENROLLMENT HELPER
    # --------------------------------------------------------

    def _get_current_enrollment(self, obj):
        """
        Get the student's actual current enrollment.

        The current enrollment is determined by:
            is_current=True

        We query StudentEnrollment directly instead of relying
        on Django's prefetched enrollment cache. This ensures
        that the serializer always returns the real current
        enrollment.
        """

        return (
            StudentEnrollment.objects
            .filter(
                student=obj,
                is_current=True,
            )
            .select_related(
                "academic_session",
                "term",
                "class_level",
            )
            .order_by("-id")
            .first()
        )

    # --------------------------------------------------------
    # CURRENT ENROLLMENT
    # --------------------------------------------------------

    def get_current_enrollment(self, obj):

        enrollment = self._get_current_enrollment(obj)

        if not enrollment:
            return None

        return {
            "id": enrollment.id,

            "academic_session": (
                enrollment.academic_session_id
            ),

            "session_name": (
                enrollment.academic_session.name
            ),

            "term": enrollment.term_id,

            "term_name": (
                enrollment.term.get_name_display()
            ),

            "class_level": (
                enrollment.class_level_id
            ),

            "class_name": (
                enrollment.class_level.name
            ),

            "roll_number": enrollment.roll_number,

            "is_current": enrollment.is_current,
        }

    # --------------------------------------------------------
    # CURRENT SESSION
    # --------------------------------------------------------

    def get_current_session(self, obj):

        enrollment = self._get_current_enrollment(obj)

        if not enrollment:
            return None

        return enrollment.academic_session.name

    # --------------------------------------------------------
    # CURRENT TERM
    # --------------------------------------------------------

    def get_current_term(self, obj):

        enrollment = self._get_current_enrollment(obj)

        if not enrollment:
            return None

        return enrollment.term.get_name_display()

    # --------------------------------------------------------
    # CURRENT CLASS
    # --------------------------------------------------------

    def get_current_class(self, obj):

        enrollment = self._get_current_enrollment(obj)

        if not enrollment:
            return None

        return enrollment.class_level.name

    # --------------------------------------------------------
    # CURRENT ROLL NUMBER
    # --------------------------------------------------------

    def get_current_roll_number(self, obj):

        enrollment = self._get_current_enrollment(obj)

        if not enrollment:
            return None

        return enrollment.roll_number

    # --------------------------------------------------------
    # META
    # --------------------------------------------------------

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
            "department_name",

            "parents",

            # CURRENT ENROLLMENT
            "current_enrollment",
            "current_session",
            "current_term",
            "current_class",
            "current_roll_number",

            "status",
            "admission_date",

            "blood_group",

            "nationality",
            "state_of_origin",
            "local_government",

            "medical_notes",

            "graduation_session",
            "graduation_session_name",
            "graduation_year",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "full_name",
            "user",
            "department_name",
            "school",
            "graduation_session_name",

            # CURRENT ENROLLMENT
            "current_enrollment",
            "current_session",
            "current_term",
            "current_class",
            "current_roll_number",

            "created_at",
            "updated_at",
        ]


# ============================================================
# STUDENT ENROLLMENT
# ============================================================

class StudentEnrollmentSerializer(serializers.ModelSerializer):

        student_name = serializers.CharField(
            source="student.full_name",
            read_only=True,
        )

        session_name = serializers.CharField(
            source="academic_session.name",
            read_only=True,
        )

        term_name = serializers.CharField(
            source="term.get_name_display",
            read_only=True,
        )

        class_name = serializers.CharField(
            source="class_level.name",
            read_only=True,
        )

        admission_number = serializers.CharField(
            source="student.admission_number",
            read_only=True,
        )

        class Meta:
            model = StudentEnrollment

            fields = [
                "id",

                "student",
                "student_name",
                "admission_number",

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
                "student_name",
                "admission_number",
                "session_name",
                "term_name",
                "class_name",
                "enrollment_date",
                "created_at",
            ]

        def validate(self, attrs):

            student = attrs.get("student")
            academic_session = attrs.get("academic_session")
            term = attrs.get("term")
            class_level = attrs.get("class_level")

            # ----------------------------------------------------
            # STUDENT / SESSION SCHOOL CHECK
            # ----------------------------------------------------

            if student and academic_session:

                if student.school_id != academic_session.school_id:
                    raise serializers.ValidationError(
                        "Student and academic session must belong to the same school."
                    )

            # ----------------------------------------------------
            # STUDENT / CLASS SCHOOL CHECK
            # ----------------------------------------------------

            if student and class_level:

                if student.school_id != class_level.school_id:
                    raise serializers.ValidationError(
                        "Student and class must belong to the same school."
                    )

            # ----------------------------------------------------
            # TERM / SESSION CHECK
            # ----------------------------------------------------

            if term and academic_session:

                if term.academic_session_id != academic_session.id:
                    raise serializers.ValidationError(
                        "The selected term does not belong to the selected academic session."
                    )

            # ----------------------------------------------------
            # DUPLICATE ENROLLMENT CHECK
            # ----------------------------------------------------

            if (
                student
                and academic_session
                and term
                and StudentEnrollment.objects.filter(
                    student=student,
                    academic_session=academic_session,
                    term=term,
                ).exists()
            ):
                raise serializers.ValidationError(
                    "This student is already enrolled for this session and term."
                )

            return attrs

# ============================================================
# PROMOTION RECORD
# ============================================================

class PromotionRecordSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    admission_number = serializers.CharField(
        source="student.admission_number",
        read_only=True,
    )

    from_session_name = serializers.CharField(
        source="from_session.name",
        read_only=True,
    )

    from_term_name = serializers.CharField(
        source="from_term.get_name_display",
        read_only=True,
    )

    from_class_name = serializers.CharField(
        source="from_class.name",
        read_only=True,
    )

    to_session_name = serializers.CharField(
        source="to_session.name",
        read_only=True,
    )

    to_term_name = serializers.CharField(
        source="to_term.get_name_display",
        read_only=True,
    )

    to_class_name = serializers.CharField(
        source="to_class.name",
        read_only=True,
    )

    promotion_type_display = serializers.CharField(
        source="get_promotion_type_display",
        read_only=True,
    )

    class Meta:
        model = PromotionRecord

        fields = [
            "id",

            "student",
            "student_name",
            "admission_number",

            "from_session",
            "from_session_name",

            "from_term",
            "from_term_name",

            "from_class",
            "from_class_name",

            "to_session",
            "to_session_name",

            "to_term",
            "to_term_name",

            "to_class",
            "to_class_name",

            "promotion_type",
            "promotion_type_display",

            "promotion_date",

            "graduation_year",

            "is_final",

            "remarks",

            "created_at",
        ]

        read_only_fields = [
            "id",
            "student_name",
            "admission_number",

            "from_session_name",
            "from_term_name",
            "from_class_name",

            "to_session_name",
            "to_term_name",
            "to_class_name",

            "promotion_type_display",

            "promotion_date",
            "created_at",
        ]


# ============================================================
# STUDENT SUBJECT ENROLLMENT
# ============================================================

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

    session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    term_name = serializers.CharField(
        source="term.get_name_display",
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
            "session_name",

            "term",
            "term_name",

            "is_core",
            "enrolled_at",
            "is_active",
        ]

        read_only_fields = [
            "id",
            "student_name",
            "subject_name",
            "session_name",
            "term_name",
            "enrolled_at",
        ]


# ============================================================
# STUDENT SUBJECT OVERVIEW
# ============================================================

class StudentSubjectOverviewSerializer(
    serializers.Serializer
):

    id = serializers.IntegerField()

    subject_id = serializers.IntegerField()

    subject_name = serializers.CharField()

    subject_code = serializers.CharField(
        allow_blank=True
    )

    is_core = serializers.BooleanField()

    is_active = serializers.BooleanField()

    teacher_name = serializers.CharField(
        allow_blank=True,
        allow_null=True,
    )

    teacher_id = serializers.IntegerField(
        allow_null=True,
    )


# ============================================================
# OPTIONAL SUBJECT SELECTION SETTING
# ============================================================

class OptionalSubjectSelectionSettingSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = OptionalSubjectSelectionSetting

        fields = [
            "id",
            "school",
            "academic_session",
            "term",
            "class_level",
            "is_enabled",
            "max_optional_subjects",
            "start_datetime",
            "end_datetime",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):

        start_datetime = attrs.get(
            "start_datetime"
        )

        end_datetime = attrs.get(
            "end_datetime"
        )

        if (
            start_datetime
            and end_datetime
            and end_datetime <= start_datetime
        ):
            raise serializers.ValidationError(
                {
                    "end_datetime":
                    "End date/time must be after start date/time."
                }
            )

        max_optional_subjects = attrs.get(
            "max_optional_subjects"
        )

        if (
            max_optional_subjects is not None
            and max_optional_subjects < 1
        ):
            raise serializers.ValidationError(
                {
                    "max_optional_subjects":
                    "Maximum optional subjects must be at least 1."
                }
            )

        school = attrs.get("school")

        academic_session = attrs.get(
            "academic_session"
        )

        term = attrs.get(
            "term"
        )

        class_level = attrs.get(
            "class_level"
        )

        if school and academic_session:

            if academic_session.school_id != school.id:
                raise serializers.ValidationError(
                    "Academic session does not belong to the selected school."
                )

        if term and academic_session:

            if term.academic_session_id != academic_session.id:
                raise serializers.ValidationError(
                    "Term does not belong to the selected academic session."
                )

        if class_level and school:

            if class_level.school_id != school.id:
                raise serializers.ValidationError(
                    "Class does not belong to the selected school."
                )

        return attrs


from rest_framework import serializers

from .models import (
    Student,
    PromotionRecord,
)


class GraduateStudentSerializer(serializers.Serializer):
    """
    Input serializer for graduating a student.
    """

    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all()
    )

    graduation_year = serializers.IntegerField(
        required=False,
        min_value=2000,
        max_value=2100,
    )

    remarks = serializers.CharField(
        required=False,
        allow_blank=True,
    )


class GraduationRecordSerializer(
    serializers.ModelSerializer
):
    """
    Read-only representation of a completed graduation.
    """

    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    admission_number = serializers.CharField(
        source="student.admission_number",
        read_only=True,
    )

    from_session_name = serializers.CharField(
        source="from_session.name",
        read_only=True,
    )

    from_term_name = serializers.CharField(
        source="from_term.get_name_display",
        read_only=True,
    )

    from_class_name = serializers.CharField(
        source="from_class.name",
        read_only=True,
    )

    promotion_type_display = serializers.CharField(
        source="get_promotion_type_display",
        read_only=True,
    )

    class Meta:
        model = PromotionRecord

        fields = [
            "id",

            "student",
            "student_name",
            "admission_number",

            "from_session",
            "from_session_name",

            "from_term",
            "from_term_name",

            "from_class",
            "from_class_name",

            "promotion_type",
            "promotion_type_display",

            "promotion_date",

            "graduation_year",

            "is_final",

            "remarks",

            "created_at",
        ]

        read_only_fields = fields