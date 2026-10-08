# from rest_framework import serializers

# from .models import (
#     AttendanceRecord,
#     SchoolAttendanceSetting,
# )


# # ============================================================
# # SCHOOL ATTENDANCE SETTING SERIALIZER
# # ============================================================

# class SchoolAttendanceSettingSerializer(
#     serializers.ModelSerializer
# ):

#     school_name = serializers.CharField(
#         source="school.name",
#         read_only=True,
#     )

#     session_name = serializers.CharField(
#         source="academic_session.name",
#         read_only=True,
#     )

#     term_name = serializers.CharField(
#         source="term.name",
#         read_only=True,
#     )

#     class Meta:
#         model = SchoolAttendanceSetting

#         fields = [
#             "id",
#             "school",
#             "school_name",
#             "academic_session",
#             "session_name",
#             "term",
#             "term_name",
#             "times_school_opened",
#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "school_name",
#             "session_name",
#             "term_name",
#             "created_at",
#             "updated_at",
#         ]

#     def validate_times_school_opened(self, value):

#         if value < 0:
#             raise serializers.ValidationError(
#                 "Number of times school opened cannot be negative."
#             )

#         return value

#     def validate(self, attrs):

#         school = attrs.get(
#             "school",
#             self.instance.school
#             if self.instance
#             else None,
#         )

#         academic_session = attrs.get(
#             "academic_session",
#             self.instance.academic_session
#             if self.instance
#             else None,
#         )

#         term = attrs.get(
#             "term",
#             self.instance.term
#             if self.instance
#             else None,
#         )

#         # --------------------------------------------------------
#         # SCHOOL / SESSION VALIDATION
#         # --------------------------------------------------------

#         if (
#             school
#             and academic_session
#             and academic_session.school_id != school.id
#         ):
#             raise serializers.ValidationError({
#                 "academic_session":
#                     "The academic session does not belong to the selected school."
#             })

#         # --------------------------------------------------------
#         # TERM / SESSION VALIDATION
#         # --------------------------------------------------------

#         if (
#             term
#             and academic_session
#             and term.academic_session_id
#             != academic_session.id
#         ):
#             raise serializers.ValidationError({
#                 "term":
#                     "The term does not belong to the selected academic session."
#             })

#         return attrs


# # ============================================================
# # ATTENDANCE RECORD SERIALIZER
# # ============================================================

# class AttendanceRecordSerializer(
#     serializers.ModelSerializer
# ):

#     student_name = serializers.CharField(
#         source="student.full_name",
#         read_only=True,
#     )

#     session_name = serializers.CharField(
#         source="academic_session.name",
#         read_only=True,
#     )

#     term_name = serializers.CharField(
#         source="term.name",
#         read_only=True,
#     )

#     class_name = serializers.CharField(
#         source="class_level.name",
#         read_only=True,
#     )

#     subject_name = serializers.CharField(
#         source="subject.name",
#         read_only=True,
#     )

#     status_display = serializers.CharField(
#         source="get_status_display",
#         read_only=True,
#     )

#     class Meta:
#         model = AttendanceRecord

#         fields = [
#             "id",
#             "school",
#             "student",
#             "student_name",
#             "academic_session",
#             "session_name",
#             "term",
#             "term_name",
#             "class_level",
#             "class_name",
#             "subject",
#             "subject_name",
#             "date",
#             "status",
#             "status_display",
#             "remarks",
#             "recorded_at",
#         ]

#         read_only_fields = [
#             "id",
#             "school",
#             "student_name",
#             "session_name",
#             "term_name",
#             "class_name",
#             "subject_name",
#             "status_display",
#             "recorded_at",
#         ]


# # ============================================================
# # ATTENDANCE SUMMARY SERIALIZER
# # ============================================================

# class AttendanceSummarySerializer(
#     serializers.Serializer
# ):

#     student = serializers.IntegerField()

#     academic_session = serializers.IntegerField()

#     term = serializers.IntegerField()

#     class_level = serializers.IntegerField()

#     # --------------------------------------------------------
#     # SCHOOL OPENING INFORMATION
#     # --------------------------------------------------------

#     times_school_opened = serializers.IntegerField()

#     # --------------------------------------------------------
#     # ATTENDANCE COUNTS
#     # --------------------------------------------------------

#     total_days = serializers.IntegerField()

#     present_days = serializers.IntegerField()

#     absent_days = serializers.IntegerField()

#     late_days = serializers.IntegerField()

#     excused_days = serializers.IntegerField()

#     attendance_percentage = serializers.FloatField()


from rest_framework import serializers

from .models import (
    AttendanceRecord,
    SchoolAttendanceSetting,
)

from students.models import StudentEnrollment


# ============================================================
# SCHOOL ATTENDANCE SETTINGS
# ============================================================

class SchoolAttendanceSettingSerializer(serializers.ModelSerializer):
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

    class Meta:
        model = SchoolAttendanceSetting

        fields = [
            "id",
            "school",
            "school_name",
            "academic_session",
            "academic_session_name",
            "term",
            "term_name",
            "times_school_opened",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "school_name",
            "academic_session_name",
            "term_name",
            "created_at",
            "updated_at",
        ]

    def validate_times_school_opened(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Times school opened cannot be negative."
            )

        return value

    def validate(self, attrs):
        school = attrs.get("school")
        academic_session = attrs.get("academic_session")
        term = attrs.get("term")

        if self.instance:
            school = school or self.instance.school
            academic_session = (
                academic_session
                or self.instance.academic_session
            )
            term = term or self.instance.term

        # ----------------------------------------------------
        # SESSION MUST BELONG TO SCHOOL
        # ----------------------------------------------------

        if (
            school
            and academic_session
            and academic_session.school_id != school.id
        ):
            raise serializers.ValidationError({
                "academic_session": (
                    "The academic session does not belong "
                    "to the selected school."
                )
            })

        # ----------------------------------------------------
        # TERM MUST BELONG TO SESSION
        # ----------------------------------------------------

        if (
            academic_session
            and term
            and term.academic_session_id != academic_session.id
        ):
            raise serializers.ValidationError({
                "term": (
                    "The selected term does not belong "
                    "to the selected academic session."
                )
            })

        return attrs


# ============================================================
# ATTENDANCE RECORD
# ============================================================

class AttendanceRecordSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="student.full_name",
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

    class_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = AttendanceRecord

        fields = [
            "id",

            "school",

            "student",
            "student_name",

            "academic_session",
            "academic_session_name",

            "term",
            "term_name",

            "class_level",
            "class_name",

            "subject",
            "subject_name",

            "date",

            "status",
            "status_display",

            "check_in_time",
            "check_out_time",

            "remarks",

            "recorded_at",
        ]

        read_only_fields = [
            "id",
            "school",
            "student_name",
            "academic_session_name",
            "term_name",
            "class_name",
            "subject_name",
            "status_display",
            "recorded_at",
        ]

    def validate(self, attrs):
        student = attrs.get("student")
        academic_session = attrs.get("academic_session")
        term = attrs.get("term")
        class_level = attrs.get("class_level")

        # ----------------------------------------------------
        # PATCH SUPPORT
        # ----------------------------------------------------

        if self.instance:
            student = student or self.instance.student

            academic_session = (
                academic_session
                or self.instance.academic_session
            )

            term = (
                term
                or self.instance.term
            )

            class_level = (
                class_level
                or self.instance.class_level
            )

        # ----------------------------------------------------
        # REQUIRED RELATIONSHIPS
        # ----------------------------------------------------

        if not student:
            raise serializers.ValidationError({
                "student": "Student is required."
            })

        if not academic_session:
            raise serializers.ValidationError({
                "academic_session": (
                    "Academic session is required."
                )
            })

        if not term:
            raise serializers.ValidationError({
                "term": "Term is required."
            })

        if not class_level:
            raise serializers.ValidationError({
                "class_level": (
                    "Class level is required."
                )
            })

        # ----------------------------------------------------
        # STUDENT / SCHOOL
        # ----------------------------------------------------

        if student.school_id != academic_session.school_id:
            raise serializers.ValidationError({
                "academic_session": (
                    "The academic session does not belong "
                    "to the student's school."
                )
            })

        if student.school_id != class_level.school_id:
            raise serializers.ValidationError({
                "class_level": (
                    "The class level does not belong "
                    "to the student's school."
                )
            })

        # ----------------------------------------------------
        # TERM / SESSION
        # ----------------------------------------------------

        if term.academic_session_id != academic_session.id:
            raise serializers.ValidationError({
                "term": (
                    "The selected term does not belong "
                    "to the selected academic session."
                )
            })

        # ----------------------------------------------------
        # STUDENT ENROLLMENT
        #
        # The attendance class must be the student's actual
        # class for the selected session and term.
        # ----------------------------------------------------

        enrollment_exists = StudentEnrollment.objects.filter(
            student=student,
            academic_session=academic_session,
            term=term,
            class_level=class_level,
            is_current=True,
        ).exists()

        if not enrollment_exists:
            raise serializers.ValidationError({
                "class_level": (
                    "The student is not currently enrolled "
                    "in this class for the selected "
                    "academic session and term."
                )
            })

        # ----------------------------------------------------
        # SUBJECT SCHOOL
        # ----------------------------------------------------

        subject = attrs.get("subject")

        if self.instance and "subject" not in attrs:
            subject = self.instance.subject

        if subject and subject.school_id != student.school_id:
            raise serializers.ValidationError({
                "subject": (
                    "The subject does not belong "
                    "to the student's school."
                )
            })

        return attrs


# ============================================================
# ATTENDANCE SUMMARY
# ============================================================

class AttendanceSummarySerializer(serializers.Serializer):

    student = serializers.IntegerField()

    academic_session = serializers.IntegerField()

    term = serializers.IntegerField()

    class_level = serializers.IntegerField()

    times_school_opened = serializers.IntegerField()

    total_days = serializers.IntegerField()

    present_days = serializers.IntegerField()

    absent_days = serializers.IntegerField()

    late_days = serializers.IntegerField()

    excused_days = serializers.IntegerField()

    attendance_percentage = serializers.FloatField()