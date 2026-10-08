# from decimal import Decimal

# from django.db.models import Avg, Max, Min

# from rest_framework import serializers

# from .models import (
#     GradeScale,
#     StudentResult,
#     ReportCard,
# )


# # ============================================================
# # GRADE SCALE SERIALIZER
# # ============================================================

# class GradeScaleSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = GradeScale

#         fields = [
#             "id",
#             "name",
#             "minimum_score",
#             "maximum_score",
#             "grade",
#             "remark",
#             "grade_point",
#             "is_active",
#         ]

#         read_only_fields = [
#             "id",
#         ]

#     def validate(self, attrs):

#         minimum_score = attrs.get(
#             "minimum_score"
#         )

#         maximum_score = attrs.get(
#             "maximum_score"
#         )

#         if (
#             minimum_score is not None
#             and maximum_score is not None
#         ):

#             if minimum_score < 0:
#                 raise serializers.ValidationError({
#                     "minimum_score":
#                         "Minimum score cannot be negative."
#                 })

#             if maximum_score < minimum_score:
#                 raise serializers.ValidationError({
#                     "maximum_score":
#                         "Maximum score must be greater than or equal to minimum score."
#                 })

#         return attrs


# # ============================================================
# # STUDENT RESULT SERIALIZER
# # ============================================================

# class StudentResultSerializer(
#     serializers.ModelSerializer
# ):

#     student_name = serializers.CharField(
#         source="student.full_name",
#         read_only=True
#     )

#     subject_name = serializers.CharField(
#         source="examination_subject.subject.name",
#         read_only=True
#     )

#     examination_name = serializers.CharField(
#         source="examination_subject.examination.name",
#         read_only=True
#     )

#     academic_session = serializers.IntegerField(
#         source=(
#             "examination_subject.examination."
#             "academic_session.id"
#         ),
#         read_only=True
#     )

#     term = serializers.IntegerField(
#         source=(
#             "examination_subject.examination."
#             "term.id"
#         ),
#         read_only=True
#     )

#     class_level = serializers.IntegerField(
#         source=(
#             "examination_subject.examination."
#             "class_level.id"
#         ),
#         read_only=True
#     )

#     class Meta:
#         model = StudentResult

#         fields = [
#             "id",
#             "student",
#             "student_name",
#             "examination_subject",
#             "examination_name",
#             "subject_name",
#             "academic_session",
#             "term",
#             "class_level",
#             "ca_score",
#             "exam_score",
#             "total_score",
#             "grade",
#             "remark",
#             "grade_point",
#             "position",
#             "is_published",
#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "total_score",
#             "grade",
#             "remark",
#             "grade_point",
#             "created_at",
#             "updated_at",
#         ]

#     def validate(self, attrs):

#         instance = self.instance

#         student = attrs.get(
#             "student",
#             instance.student if instance else None
#         )

#         examination_subject = attrs.get(
#             "examination_subject",
#             (
#                 instance.examination_subject
#                 if instance
#                 else None
#             )
#         )

#         ca_score = attrs.get(
#             "ca_score",
#             (
#                 instance.ca_score
#                 if instance
#                 else Decimal("0.00")
#             )
#         )

#         exam_score = attrs.get(
#             "exam_score",
#             (
#                 instance.exam_score
#                 if instance
#                 else Decimal("0.00")
#             )
#         )

#         if ca_score is None:
#             ca_score = Decimal("0.00")

#         if exam_score is None:
#             exam_score = Decimal("0.00")

#         # --------------------------------------------------------
#         # SCORE VALIDATION
#         # --------------------------------------------------------

#         if ca_score < 0:
#             raise serializers.ValidationError({
#                 "ca_score":
#                     "CA score cannot be negative."
#             })

#         if exam_score < 0:
#             raise serializers.ValidationError({
#                 "exam_score":
#                     "Exam score cannot be negative."
#             })

#         # --------------------------------------------------------
#         # EXAMINATION SUBJECT VALIDATION
#         # --------------------------------------------------------

#         if examination_subject:

#             examination = (
#                 examination_subject.examination
#             )

#             subject = (
#                 examination_subject.subject
#             )

#             # ----------------------------------------------------
#             # SCHOOL VALIDATION
#             # ----------------------------------------------------

#             if (
#                 subject.school_id
#                 != examination.school_id
#             ):

#                 raise serializers.ValidationError({
#                     "examination_subject":
#                         "The subject does not belong to the examination school."
#                 })

#             # ----------------------------------------------------
#             # STUDENT SCHOOL VALIDATION
#             # ----------------------------------------------------

#             if student:

#                 if hasattr(student, "school_id"):

#                     if (
#                         student.school_id
#                         != examination.school_id
#                     ):

#                         raise serializers.ValidationError({
#                             "student":
#                                 "The student does not belong to the examination school."
#                         })

#             # ----------------------------------------------------
#             # MAXIMUM SCORE VALIDATION
#             # ----------------------------------------------------

#             maximum_score = Decimal(
#                 examination_subject.maximum_score
#             )

#             total_score = (
#                 Decimal(ca_score)
#                 + Decimal(exam_score)
#             )

#             if total_score > maximum_score:

#                 raise serializers.ValidationError({
#                     "exam_score":
#                         f"CA score + exam score cannot be greater than {maximum_score}."
#                 })

#         return attrs


# # ============================================================
# # REPORT CARD SERIALIZER
# # ============================================================

# class ReportCardSerializer(
#     serializers.ModelSerializer
# ):

#     student_name = serializers.CharField(
#         source="student.full_name",
#         read_only=True
#     )

#     session_name = serializers.CharField(
#         source="academic_session.name",
#         read_only=True
#     )

#     term_name = serializers.CharField(
#         source="term.name",
#         read_only=True
#     )

#     class_name = serializers.CharField(
#         source="class_level.name",
#         read_only=True
#     )

#     # --------------------------------------------------------
#     # DEPARTMENT
#     # --------------------------------------------------------

#     department_name = serializers.SerializerMethodField()

#     # --------------------------------------------------------
#     # CLASS STATISTICS
#     # --------------------------------------------------------

#     class_average = serializers.SerializerMethodField()

#     class_highest_score = serializers.SerializerMethodField()

#     class_lowest_score = serializers.SerializerMethodField()

#     # --------------------------------------------------------
#     # SUBJECT RESULTS
#     # --------------------------------------------------------

#     results = serializers.SerializerMethodField()

#     class Meta:
#         model = ReportCard

#         fields = [
#             "id",

#             # Student
#             "student",
#             "student_name",

#             # Academic information
#             "academic_session",
#             "session_name",
#             "term",
#             "term_name",
#             "class_level",
#             "class_name",
#             "department_name",

#             # Student summary
#             "total_score",
#             "average_score",
#             "overall_grade",
#             "position",
#             "total_students",

#             # Class statistics
#             "class_average",
#             "class_highest_score",
#             "class_lowest_score",

#             # Attendance
#             "attendance_percentage",

#             # Comments
#             "teacher_comment",
#             "principal_comment",

#             # Promotion
#             "promoted",

#             # Publication
#             "is_published",

#             # Subject results
#             "results",

#             # Dates
#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "total_score",
#             "average_score",
#             "overall_grade",
#             "position",
#             "total_students",
#             "class_average",
#             "class_highest_score",
#             "class_lowest_score",
#             "results",
#             "created_at",
#             "updated_at",
#         ]

#     # ========================================================
#     # DEPARTMENT NAME
#     # ========================================================

#     def get_department_name(self, obj):

#         if obj.student.department:
#             return obj.student.department.name

#         return None

#     # ========================================================
#     # CLASS REPORT CARDS
#     # ========================================================

#     def get_class_report_cards(self, obj):
#         """
#         Get report cards for students belonging to the
#         same academic session, term, class and department.
#         """

#         queryset = ReportCard.objects.filter(
#             academic_session=obj.academic_session,
#             term=obj.term,
#             class_level=obj.class_level,
#         )

#         # ----------------------------------------------------
#         # DEPARTMENT FILTER
#         # ----------------------------------------------------

#         if obj.student.department:

#             queryset = queryset.filter(
#                 student__department=obj.student.department
#             )

#         else:

#             queryset = queryset.filter(
#                 student__department__isnull=True
#             )

#         return queryset

#     # ========================================================
#     # CLASS AVERAGE
#     # ========================================================

#     def get_class_average(self, obj):
#         """
#         Class average is calculated from TOTAL SCORES,
#         not the students' individual average_score field.
#         """

#         stats = self.get_class_report_cards(
#             obj
#         ).aggregate(
#             average=Avg("total_score")
#         )

#         return stats["average"] or Decimal("0.00")

#     # ========================================================
#     # CLASS HIGHEST SCORE
#     # ========================================================

#     def get_class_highest_score(self, obj):
#         """
#         Highest student total score in the same
#         class and department.
#         """

#         stats = self.get_class_report_cards(
#             obj
#         ).aggregate(
#             highest=Max("total_score")
#         )

#         return stats["highest"] or Decimal("0.00")

#     # ========================================================
#     # CLASS LOWEST SCORE
#     # ========================================================

#     def get_class_lowest_score(self, obj):
#         """
#         Lowest student total score in the same
#         class and department.
#         """

#         stats = self.get_class_report_cards(
#             obj
#         ).aggregate(
#             lowest=Min("total_score")
#         )

#         return stats["lowest"] or Decimal("0.00")

#     # ========================================================
#     # STUDENT SUBJECT RESULTS
#     # ========================================================

#     def get_results(self, obj):

#         results = StudentResult.objects.filter(
#             student=obj.student,
#             examination_subject__examination__academic_session=(
#                 obj.academic_session
#             ),
#             examination_subject__examination__term=(
#                 obj.term
#             ),
#             examination_subject__examination__class_level=(
#                 obj.class_level
#             ),
#         ).select_related(
#             "examination_subject",
#             "examination_subject__subject",
#             "examination_subject__examination",
#         )

#         return StudentResultSerializer(
#             results,
#             many=True
#         ).data



# from decimal import Decimal

# from django.db.models import Avg, Max, Min

# from rest_framework import serializers

# from academics.models import School
# from attendance.models import AttendanceRecord, SchoolAttendanceSetting
# from students.models import Student, StudentEnrollment

# from .models import (
#     GradeScale,
#     StudentResult,
#     ReportCard,
# )


# # ============================================================
# # GRADE SCALE SERIALIZER
# # ============================================================

# class GradeScaleSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = GradeScale
#         fields = [
#             "id",
#             "name",
#             "minimum_score",
#             "maximum_score",
#             "grade",
#             "remark",
#             "grade_point",
#             "is_active",
#         ]

#     def validate(self, attrs):
#         minimum_score = attrs.get(
#             "minimum_score",
#             self.instance.minimum_score if self.instance else None
#         )

#         maximum_score = attrs.get(
#             "maximum_score",
#             self.instance.maximum_score if self.instance else None
#         )

#         if minimum_score is not None and minimum_score < 0:
#             raise serializers.ValidationError({
#                 "minimum_score": "Minimum score cannot be negative."
#             })

#         if (
#             minimum_score is not None
#             and maximum_score is not None
#             and maximum_score < minimum_score
#         ):
#             raise serializers.ValidationError({
#                 "maximum_score": "Maximum score cannot be less than minimum score."
#             })

#         return attrs


# # ============================================================
# # STUDENT RESULT SERIALIZER
# # ============================================================

# class StudentResultSerializer(serializers.ModelSerializer):
#     student_name = serializers.CharField(
#         source="student.full_name",
#         read_only=True
#     )

#     subject_name = serializers.CharField(
#         source="examination_subject.subject.name",
#         read_only=True
#     )

#     examination_name = serializers.CharField(
#         source="examination_subject.examination.name",
#         read_only=True
#     )

#     academic_session = serializers.IntegerField(
#         source="examination_subject.examination.academic_session_id",
#         read_only=True
#     )

#     term = serializers.IntegerField(
#         source="examination_subject.examination.term_id",
#         read_only=True
#     )

#     class_level = serializers.IntegerField(
#         source="examination_subject.examination.class_level_id",
#         read_only=True
#     )

#     class Meta:
#         model = StudentResult

#         fields = [
#             "id",

#             "student",
#             "student_name",

#             "examination_subject",
#             "examination_name",
#             "subject_name",

#             "academic_session",
#             "term",
#             "class_level",

#             "ca_score",
#             "exam_score",
#             "total_score",

#             "grade",
#             "remark",
#             "grade_point",

#             "position",
#             "is_published",

#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "student_name",
#             "examination_name",
#             "subject_name",
#             "academic_session",
#             "term",
#             "class_level",
#             "total_score",
#             "grade",
#             "remark",
#             "grade_point",
#             "created_at",
#             "updated_at",
#         ]

#     def validate(self, attrs):
#         student = attrs.get("student")

#         examination_subject = attrs.get("examination_subject")

#         ca_score = attrs.get(
#             "ca_score",
#             self.instance.ca_score if self.instance else Decimal("0")
#         )

#         exam_score = attrs.get(
#             "exam_score",
#             self.instance.exam_score if self.instance else Decimal("0")
#         )

#         # --------------------------------------------------------
#         # Score validation
#         # --------------------------------------------------------

#         if ca_score is not None and ca_score < 0:
#             raise serializers.ValidationError({
#                 "ca_score": "CA score cannot be negative."
#             })

#         if exam_score is not None and exam_score < 0:
#             raise serializers.ValidationError({
#                 "exam_score": "Exam score cannot be negative."
#             })

#         # --------------------------------------------------------
#         # Examination subject validation
#         # --------------------------------------------------------

#         if examination_subject:
#             examination = examination_subject.examination

#             # Student must belong to same school
#             if student and student.school_id != examination.school_id:
#                 raise serializers.ValidationError({
#                     "student": (
#                         "The student does not belong to the same school "
#                         "as the examination."
#                     )
#                 })

#             # Total score cannot exceed maximum score
#             total_score = Decimal(ca_score or 0) + Decimal(exam_score or 0)

#             if total_score > examination_subject.maximum_score:
#                 raise serializers.ValidationError({
#                     "exam_score": (
#                         f"CA score plus exam score cannot exceed "
#                         f"{examination_subject.maximum_score}."
#                     )
#                 })

#         return attrs


# # ============================================================
# # REPORT CARD SERIALIZER
# # ============================================================

# class ReportCardSerializer(serializers.ModelSerializer):

#     # --------------------------------------------------------
#     # Student information
#     # --------------------------------------------------------

#     student_name = serializers.CharField(
#         source="student.full_name",
#         read_only=True
#     )

#     student_admission_number = serializers.CharField(
#         source="student.admission_number",
#         read_only=True
#     )

#     student_date_of_birth = serializers.DateField(
#         source="student.date_of_birth",
#         read_only=True,
#         allow_null=True
#     )

#     # --------------------------------------------------------
#     # School information
#     # --------------------------------------------------------

#     school_name = serializers.CharField(
#         source="student.school.name",
#         read_only=True
#     )

#     school_phone = serializers.CharField(
#         source="student.school.phone",
#         read_only=True
#     )

#     school_address = serializers.CharField(
#         source="student.school.address",
#         read_only=True
#     )

#     school_email = serializers.EmailField(
#         source="student.school.email",
#         read_only=True,
#         allow_blank=True
#     )

#     school_website = serializers.CharField(
#         source="student.school.website",
#         read_only=True,
#         allow_blank=True
#     )

#     school_logo = serializers.SerializerMethodField()

#     # --------------------------------------------------------
#     # Student profile image
#     # --------------------------------------------------------

#     student_profile_image = serializers.SerializerMethodField()

#     # --------------------------------------------------------
#     # Session / Term / Class
#     # --------------------------------------------------------

#     session_name = serializers.CharField(
#         source="academic_session.name",
#         read_only=True
#     )

#     term_name = serializers.CharField(
#         source="term.name",
#         read_only=True
#     )

#     class_name = serializers.CharField(
#         source="class_level.name",
#         read_only=True
#     )

#     # --------------------------------------------------------
#     # Department
#     # --------------------------------------------------------

#     department_name = serializers.SerializerMethodField()

#     # --------------------------------------------------------
#     # Class statistics
#     # --------------------------------------------------------

#     class_average = serializers.SerializerMethodField()

#     class_highest_score = serializers.SerializerMethodField()

#     class_lowest_score = serializers.SerializerMethodField()

#     # --------------------------------------------------------
#     # Attendance
#     # --------------------------------------------------------

#     attendance_days = serializers.SerializerMethodField()

#     school_days_opened = serializers.SerializerMethodField()

#     # --------------------------------------------------------
#     # Student results
#     # --------------------------------------------------------

#     results = serializers.SerializerMethodField()

#     # ========================================================
#     # META
#     # ========================================================

#     class Meta:
#         model = ReportCard

#         fields = [
#             "id",

#             # ------------------------------------------------
#             # Student
#             # ------------------------------------------------

#             "student",
#             "student_name",
#             "student_admission_number",
#             "student_date_of_birth",
#             "student_profile_image",

#             # ------------------------------------------------
#             # School
#             # ------------------------------------------------

#             "school_name",
#             "school_logo",
#             "school_phone",
#             "school_address",
#             "school_email",
#             "school_website",

#             # ------------------------------------------------
#             # Academic session
#             # ------------------------------------------------

#             "academic_session",
#             "session_name",

#             # ------------------------------------------------
#             # Term
#             # ------------------------------------------------

#             "term",
#             "term_name",

#             # ------------------------------------------------
#             # Class
#             # ------------------------------------------------

#             "class_level",
#             "class_name",

#             # ------------------------------------------------
#             # Department
#             # ------------------------------------------------

#             "department_name",

#             # ------------------------------------------------
#             # Academic performance
#             # ------------------------------------------------

#             "total_score",
#             "average_score",
#             "overall_grade",
#             "position",
#             "total_students",

#             # ------------------------------------------------
#             # Class performance
#             # ------------------------------------------------

#             "class_average",
#             "class_highest_score",
#             "class_lowest_score",

#             # ------------------------------------------------
#             # Attendance
#             # ------------------------------------------------

#             "attendance_days",
#             "school_days_opened",
#             "attendance_percentage",

#             # ------------------------------------------------
#             # Comments
#             # ------------------------------------------------

#             "teacher_comment",
#             "principal_comment",

#             # ------------------------------------------------
#             # Promotion / publication
#             # ------------------------------------------------

#             "promoted",
#             "is_published",

#             # ------------------------------------------------
#             # Subject results
#             # ------------------------------------------------

#             "results",

#             # ------------------------------------------------
#             # Dates
#             # ------------------------------------------------

#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",

#             # Student information
#             "student_name",
#             "student_admission_number",
#             "student_date_of_birth",
#             "student_profile_image",

#             # School information
#             "school_name",
#             "school_logo",
#             "school_phone",
#             "school_address",
#             "school_email",
#             "school_website",

#             # Academic information
#             "session_name",
#             "term_name",
#             "class_name",
#             "department_name",

#             # Calculated performance
#             "total_score",
#             "average_score",
#             "overall_grade",
#             "position",
#             "total_students",

#             # Class statistics
#             "class_average",
#             "class_highest_score",
#             "class_lowest_score",

#             # Attendance
#             "attendance_days",
#             "school_days_opened",
#             "attendance_percentage",

#             # Subject results
#             "results",

#             "created_at",
#             "updated_at",
#         ]

#     # ========================================================
#     # IMAGE URL HELPER
#     # ========================================================

#     def _build_absolute_url(self, value):
#         """
#         Converts a media/file URL into an absolute URL when
#         a request is available in the serializer context.
#         """

#         if not value:
#             return None

#         try:
#             url = value.url
#         except AttributeError:
#             url = str(value)

#         if not url:
#             return None

#         request = self.context.get("request")

#         if request:
#             return request.build_absolute_uri(url)

#         return url

#     # ========================================================
#     # SCHOOL LOGO
#     # ========================================================

#     def get_school_logo(self, obj):
#         school = getattr(obj.student, "school", None)

#         if not school:
#             return None

#         logo = getattr(school, "logo", None)

#         if not logo:
#             return None

#         return self._build_absolute_url(logo)

#     # ========================================================
#     # STUDENT PROFILE IMAGE
#     # ========================================================

#     def get_student_profile_image(self, obj):
#         student = getattr(obj, "student", None)

#         if not student:
#             return None

#         profile_image = getattr(student, "profile_image", None)

#         if not profile_image:
#             return None

#         return self._build_absolute_url(profile_image)

#     # ========================================================
#     # DEPARTMENT
#     # ========================================================

#     def get_department_name(self, obj):
#         student = getattr(obj, "student", None)

#         if not student:
#             return None

#         department = getattr(student, "department", None)

#         if not department:
#             return None

#         return department.name

#     # ========================================================
#     # CLASS REPORT CARDS
#     # ========================================================

#     def get_class_report_cards(self, obj):
#         """
#         Returns report cards belonging to the same:

#         - Academic session
#         - Term
#         - Class
#         - Department

#         This is important because SS1/SS2/SS3 departments
#         should be ranked separately.
#         """

#         queryset = ReportCard.objects.filter(
#             academic_session=obj.academic_session,
#             term=obj.term,
#             class_level=obj.class_level,
#         ).select_related(
#             "student",
#             "student__department",
#         )

#         student_department_id = getattr(
#             obj.student,
#             "department_id",
#             None
#         )

#         if student_department_id is None:
#             queryset = queryset.filter(
#                 student__department__isnull=True
#             )
#         else:
#             queryset = queryset.filter(
#                 student__department_id=student_department_id
#             )

#         return queryset

#     # ========================================================
#     # CLASS AVERAGE
#     # ========================================================

#     def get_class_average(self, obj):
#         report_cards = self.get_class_report_cards(obj)

#         result = report_cards.aggregate(
#             average=Avg("average_score")
#         )

#         return result["average"] or Decimal("0.00")

#     # ========================================================
#     # CLASS HIGHEST SCORE
#     # ========================================================

#     def get_class_highest_score(self, obj):
#         report_cards = self.get_class_report_cards(obj)

#         result = report_cards.aggregate(
#             highest=Max("total_score")
#         )

#         return result["highest"] or Decimal("0.00")

#     # ========================================================
#     # CLASS LOWEST SCORE
#     # ========================================================

#     def get_class_lowest_score(self, obj):
#         report_cards = self.get_class_report_cards(obj)

#         result = report_cards.aggregate(
#             lowest=Min("total_score")
#         )

#         return result["lowest"] or Decimal("0.00")

#     # ========================================================
#     # ATTENDANCE DATA
#     # ========================================================

#     def _get_attendance_data(self, obj):
#         """
#         Calculates attendance using the same daily priority
#         system used by the report-card backend:

#             PRESENT > LATE > EXCUSED > ABSENT

#         A student can have multiple attendance records for
#         one day, but that day counts only once.
#         """

#         student = obj.student
#         school = student.school

#         records = AttendanceRecord.objects.filter(
#             school=school,
#             student=student,
#             academic_session=obj.academic_session,
#             term=obj.term,
#             class_level=obj.class_level,
#         ).order_by(
#             "date",
#             "id"
#         )

#         daily_status = {}

#         priority = {
#             "PRESENT": 4,
#             "LATE": 3,
#             "EXCUSED": 2,
#             "ABSENT": 1,
#         }

#         for record in records:
#             date = record.date
#             status = record.status

#             if date not in daily_status:
#                 daily_status[date] = status
#             else:
#                 current_status = daily_status[date]

#                 if priority.get(status, 0) > priority.get(
#                     current_status,
#                     0
#                 ):
#                     daily_status[date] = status

#         present_count = sum(
#             1
#             for status in daily_status.values()
#             if status in ["PRESENT", "LATE"]
#         )

#         school_setting = SchoolAttendanceSetting.objects.filter(
#             school=school,
#             academic_session=obj.academic_session,
#             term=obj.term,
#         ).first()

#         school_days_opened = (
#             school_setting.times_school_opened
#             if school_setting
#             else 0
#         )

#         return {
#             "attendance_days": present_count,
#             "school_days_opened": school_days_opened,
#         }

#     # ========================================================
#     # NUMBER OF ATTENDANCE DAYS
#     # ========================================================

#     def get_attendance_days(self, obj):
#         data = self._get_attendance_data(obj)

#         return data["attendance_days"]

#     # ========================================================
#     # NUMBER OF SCHOOL DAYS OPENED
#     # ========================================================

#     def get_school_days_opened(self, obj):
#         data = self._get_attendance_data(obj)

#         return data["school_days_opened"]

#     # ========================================================
#     # STUDENT RESULTS
#     # ========================================================

#     def get_results(self, obj):
#         """
#         Returns only the results belonging to this exact:

#         Student
#         Academic Session
#         Term
#         Class
#         """

#         queryset = StudentResult.objects.filter(
#             student=obj.student,
#             examination_subject__examination__academic_session=obj.academic_session,
#             examination_subject__examination__term=obj.term,
#             examination_subject__examination__class_level=obj.class_level,
#         ).select_related(
#             "student",
#             "examination_subject",
#             "examination_subject__subject",
#             "examination_subject__examination",
#         ).order_by(
#             "examination_subject__subject__name"
#         )

#         return StudentResultSerializer(
#             queryset,
#             many=True,
#             context=self.context,
#         ).data

#     # ========================================================
#     # REPORT CARD VALIDATION
#     # ========================================================

#     def validate(self, attrs):
#         student = attrs.get(
#             "student",
#             self.instance.student if self.instance else None
#         )

#         academic_session = attrs.get(
#             "academic_session",
#             self.instance.academic_session
#             if self.instance
#             else None
#         )

#         term = attrs.get(
#             "term",
#             self.instance.term
#             if self.instance
#             else None
#         )

#         class_level = attrs.get(
#             "class_level",
#             self.instance.class_level
#             if self.instance
#             else None
#         )

#         # --------------------------------------------------------
#         # Required fields
#         # --------------------------------------------------------

#         if not student:
#             raise serializers.ValidationError({
#                 "student": "Student is required."
#             })

#         if not academic_session:
#             raise serializers.ValidationError({
#                 "academic_session": "Academic session is required."
#             })

#         if not term:
#             raise serializers.ValidationError({
#                 "term": "Term is required."
#             })

#         if not class_level:
#             raise serializers.ValidationError({
#                 "class_level": "Class is required."
#             })

#         # --------------------------------------------------------
#         # School consistency
#         # --------------------------------------------------------

#         if student.school_id != academic_session.school_id:
#             raise serializers.ValidationError({
#                 "academic_session": (
#                     "The academic session does not belong "
#                     "to the student's school."
#                 )
#             })

#         if student.school_id != class_level.school_id:
#             raise serializers.ValidationError({
#                 "class_level": (
#                     "The class does not belong "
#                     "to the student's school."
#                 )
#             })

#         # --------------------------------------------------------
#         # Term must belong to selected session
#         # --------------------------------------------------------

#         if term.academic_session_id != academic_session.id:
#             raise serializers.ValidationError({
#                 "term": (
#                     "The selected term does not belong "
#                     "to the selected academic session."
#                 )
#             })

#         # --------------------------------------------------------
#         # Historical enrollment validation
#         # --------------------------------------------------------
#         #
#         # IMPORTANT:
#         # We intentionally DO NOT require is_current=True.
#         #
#         # This allows old/historical report cards to remain
#         # accessible and printable.
#         #
#         # Example:
#         #
#         # 2025/2026 FIRST TERM -> old enrollment
#         # 2025/2026 SECOND TERM -> old enrollment
#         # 2026/2027 FIRST TERM -> current enrollment
#         #
#         # All three can have their own report cards.
#         # --------------------------------------------------------

#         enrollment_exists = StudentEnrollment.objects.filter(
#             student=student,
#             academic_session=academic_session,
#             term=term,
#             class_level=class_level,
#         ).exists()

#         if not enrollment_exists:
#             raise serializers.ValidationError({
#                 "class_level": (
#                     "The student does not have an enrollment "
#                     "for this academic session, term and class."
#                 )
#             })

#         # --------------------------------------------------------
#         # Duplicate report card
#         # --------------------------------------------------------

#         duplicate_queryset = ReportCard.objects.filter(
#             student=student,
#             academic_session=academic_session,
#             term=term,
#         )

#         if self.instance:
#             duplicate_queryset = duplicate_queryset.exclude(
#                 pk=self.instance.pk
#             )

#         if duplicate_queryset.exists():
#             raise serializers.ValidationError({
#                 "non_field_errors": [
#                     "A report card already exists for this student "
#                     "for the selected academic session and term."
#                 ]
#             })

#         return attrs



from decimal import Decimal

from django.db.models import Avg, Max, Min

from rest_framework import serializers

from academics.models import School
from attendance.models import AttendanceRecord, SchoolAttendanceSetting
from students.models import Student, StudentEnrollment

from .models import (
    GradeScale,
    StudentResult,
    ReportCard,
)


# ============================================================
# GRADE SCALE SERIALIZER
# ============================================================

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

    def validate(self, attrs):
        minimum_score = attrs.get(
            "minimum_score",
            self.instance.minimum_score if self.instance else None
        )

        maximum_score = attrs.get(
            "maximum_score",
            self.instance.maximum_score if self.instance else None
        )

        if minimum_score is not None and minimum_score < 0:
            raise serializers.ValidationError({
                "minimum_score": "Minimum score cannot be negative."
            })

        if (
            minimum_score is not None
            and maximum_score is not None
            and maximum_score < minimum_score
        ):
            raise serializers.ValidationError({
                "maximum_score": "Maximum score cannot be less than minimum score."
            })

        return attrs


# ============================================================
# STUDENT RESULT SERIALIZER
# ============================================================

class StudentResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="examination_subject.subject.name",
        read_only=True
    )

    examination_name = serializers.CharField(
        source="examination_subject.examination.name",
        read_only=True
    )

    academic_session = serializers.IntegerField(
        source="examination_subject.examination.academic_session_id",
        read_only=True
    )

    term = serializers.IntegerField(
        source="examination_subject.examination.term_id",
        read_only=True
    )

    class_level = serializers.IntegerField(
        source="examination_subject.examination.class_level_id",
        read_only=True
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
            "student_name",
            "examination_name",
            "subject_name",
            "academic_session",
            "term",
            "class_level",
            "total_score",
            "grade",
            "remark",
            "grade_point",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        student = attrs.get("student")

        examination_subject = attrs.get("examination_subject")

        ca_score = attrs.get(
            "ca_score",
            self.instance.ca_score if self.instance else Decimal("0")
        )

        exam_score = attrs.get(
            "exam_score",
            self.instance.exam_score if self.instance else Decimal("0")
        )

        # --------------------------------------------------------
        # Score validation
        # --------------------------------------------------------

        if ca_score is not None and ca_score < 0:
            raise serializers.ValidationError({
                "ca_score": "CA score cannot be negative."
            })

        if exam_score is not None and exam_score < 0:
            raise serializers.ValidationError({
                "exam_score": "Exam score cannot be negative."
            })

        # --------------------------------------------------------
        # Examination subject validation
        # --------------------------------------------------------

        if examination_subject:
            examination = examination_subject.examination

            # Student must belong to same school
            if student and student.school_id != examination.school_id:
                raise serializers.ValidationError({
                    "student": (
                        "The student does not belong to the same school "
                        "as the examination."
                    )
                })

            # Total score cannot exceed maximum score
            total_score = Decimal(ca_score or 0) + Decimal(exam_score or 0)

            if total_score > examination_subject.maximum_score:
                raise serializers.ValidationError({
                    "exam_score": (
                        f"CA score plus exam score cannot exceed "
                        f"{examination_subject.maximum_score}."
                    )
                })

        return attrs


# ============================================================
# REPORT CARD SERIALIZER
# ============================================================

class ReportCardSerializer(serializers.ModelSerializer):

    # --------------------------------------------------------
    # Student information
    # --------------------------------------------------------

    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True
    )

    student_admission_number = serializers.CharField(
        source="student.admission_number",
        read_only=True
    )

    student_date_of_birth = serializers.DateField(
        source="student.date_of_birth",
        read_only=True,
        allow_null=True
    )

    # --------------------------------------------------------
    # School information
    # --------------------------------------------------------

    school_name = serializers.CharField(
        source="student.school.name",
        read_only=True
    )

    school_phone = serializers.CharField(
        source="student.school.phone",
        read_only=True
    )

    school_address = serializers.CharField(
        source="student.school.address",
        read_only=True
    )

    school_email = serializers.EmailField(
        source="student.school.email",
        read_only=True,
        allow_blank=True
    )

    school_website = serializers.CharField(
        source="student.school.website",
        read_only=True,
        allow_blank=True
    )

    school_logo = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # Student profile image
    # --------------------------------------------------------

    student_profile_image = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # Session / Term / Class
    # --------------------------------------------------------

    session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True
    )

    term_name = serializers.CharField(
        source="term.name",
        read_only=True
    )

    class_name = serializers.CharField(
        source="class_level.name",
        read_only=True
    )

    # --------------------------------------------------------
    # Department
    # --------------------------------------------------------

    department_name = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # Class statistics
    # --------------------------------------------------------

    class_average = serializers.SerializerMethodField()

    class_highest_score = serializers.SerializerMethodField()

    class_lowest_score = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # Attendance
    # --------------------------------------------------------

    attendance_days = serializers.SerializerMethodField()

    school_days_opened = serializers.SerializerMethodField()

    attendance_percentage = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # Student results
    # --------------------------------------------------------

    results = serializers.SerializerMethodField()

    # ========================================================
    # META
    # ========================================================

    class Meta:
        model = ReportCard

        fields = [
            "id",

            # ------------------------------------------------
            # Student
            # ------------------------------------------------

            "student",
            "student_name",
            "student_admission_number",
            "student_date_of_birth",
            "student_profile_image",

            # ------------------------------------------------
            # School
            # ------------------------------------------------

            "school_name",
            "school_logo",
            "school_phone",
            "school_address",
            "school_email",
            "school_website",

            # ------------------------------------------------
            # Academic session
            # ------------------------------------------------

            "academic_session",
            "session_name",

            # ------------------------------------------------
            # Term
            # ------------------------------------------------

            "term",
            "term_name",

            # ------------------------------------------------
            # Class
            # ------------------------------------------------

            "class_level",
            "class_name",

            # ------------------------------------------------
            # Department
            # ------------------------------------------------

            "department_name",

            # ------------------------------------------------
            # Academic performance
            # ------------------------------------------------

            "total_score",
            "average_score",
            "overall_grade",
            "position",
            "total_students",

            # ------------------------------------------------
            # Class performance
            # ------------------------------------------------

            "class_average",
            "class_highest_score",
            "class_lowest_score",

            # ------------------------------------------------
            # Attendance
            # ------------------------------------------------

            "attendance_days",
            "school_days_opened",
            "attendance_percentage",

            # ------------------------------------------------
            # Comments
            # ------------------------------------------------

            "teacher_comment",
            "principal_comment",

            # ------------------------------------------------
            # Promotion / publication
            # ------------------------------------------------

            "promoted",
            "is_published",

            # ------------------------------------------------
            # Subject results
            # ------------------------------------------------

            "results",

            # ------------------------------------------------
            # Dates
            # ------------------------------------------------

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",

            # Student information
            "student_name",
            "student_admission_number",
            "student_date_of_birth",
            "student_profile_image",

            # School information
            "school_name",
            "school_logo",
            "school_phone",
            "school_address",
            "school_email",
            "school_website",

            # Academic information
            "session_name",
            "term_name",
            "class_name",
            "department_name",

            # Calculated performance
            "total_score",
            "average_score",
            "overall_grade",
            "position",
            "total_students",

            # Class statistics
            "class_average",
            "class_highest_score",
            "class_lowest_score",

            # Attendance
            "attendance_days",
            "school_days_opened",
            "attendance_percentage",

            # Subject results
            "results",

            "created_at",
            "updated_at",
        ]

    # ========================================================
    # IMAGE URL HELPER
    # ========================================================

    def _build_absolute_url(self, value):
        """
        Converts a media/file URL into an absolute URL when
        a request is available in the serializer context.
        """

        if not value:
            return None

        try:
            url = value.url
        except AttributeError:
            url = str(value)

        if not url:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(url)

        return url

    # ========================================================
    # SCHOOL LOGO
    # ========================================================

    def get_school_logo(self, obj):
        school = getattr(obj.student, "school", None)

        if not school:
            return None

        logo = getattr(school, "logo", None)

        if not logo:
            return None

        return self._build_absolute_url(logo)

    # ========================================================
    # STUDENT PROFILE IMAGE
    # ========================================================

    def get_student_profile_image(self, obj):
        student = getattr(obj, "student", None)

        if not student:
            return None

        profile_image = getattr(student, "profile_image", None)

        if not profile_image:
            return None

        return self._build_absolute_url(profile_image)

    # ========================================================
    # DEPARTMENT
    # ========================================================

    def get_department_name(self, obj):
        student = getattr(obj, "student", None)

        if not student:
            return None

        department = getattr(student, "department", None)

        if not department:
            return None

        return department.name

    # ========================================================
    # CLASS REPORT CARDS
    # ========================================================

    def get_class_report_cards(self, obj):
        """
        Returns report cards belonging to the same:

        - Academic session
        - Term
        - Class
        - Department

        This is important because SS1/SS2/SS3 departments
        should be ranked separately.
        """

        queryset = ReportCard.objects.filter(
            academic_session=obj.academic_session,
            term=obj.term,
            class_level=obj.class_level,
        ).select_related(
            "student",
            "student__department",
        )

        student_department_id = getattr(
            obj.student,
            "department_id",
            None
        )

        if student_department_id is None:
            queryset = queryset.filter(
                student__department__isnull=True
            )
        else:
            queryset = queryset.filter(
                student__department_id=student_department_id
            )

        return queryset

    # ========================================================
    # CLASS AVERAGE
    # ========================================================

    def get_class_average(self, obj):
        """
        Calculates the average percentage score of students
        in the same class, session, term and department.

        IMPORTANT:
        We use average_score rather than total_score.

        Example:

            Student 1 average = 76.40
            Student 2 average = 68.20

            Class average = (76.40 + 68.20) / 2
                          = 72.30
        """

        report_cards = self.get_class_report_cards(obj)

        result = report_cards.aggregate(
            average=Avg("average_score")
        )

        return result["average"] or Decimal("0.00")

    # ========================================================
    # CLASS HIGHEST SCORE
    # ========================================================

    def get_class_highest_score(self, obj):
        report_cards = self.get_class_report_cards(obj)

        result = report_cards.aggregate(
            highest=Max("average_score")
        )

        return result["highest"] or Decimal("0.00")


    # ========================================================
    # CLASS LOWEST SCORE
    # ========================================================

    def get_class_lowest_score(self, obj):
        report_cards = self.get_class_report_cards(obj)

        result = report_cards.aggregate(
            lowest=Min("average_score")
        )

        return result["lowest"] or Decimal("0.00")

    # ========================================================
    # ATTENDANCE DATA
    # ========================================================

    def _get_attendance_data(self, obj):
        """
        Calculates attendance using the same daily priority
        system used by the report-card backend:

            PRESENT > LATE > EXCUSED > ABSENT

        A student can have multiple attendance records for
        one day, but that day counts only once.
        """

        student = obj.student
        school = student.school

        records = AttendanceRecord.objects.filter(
            school=school,
            student=student,
            academic_session=obj.academic_session,
            term=obj.term,
            class_level=obj.class_level,
        ).order_by(
            "date",
            "id"
        )

        daily_status = {}

        priority = {
            "PRESENT": 4,
            "LATE": 3,
            "EXCUSED": 2,
            "ABSENT": 1,
        }

        for record in records:
            date = record.date
            status = record.status

            if date not in daily_status:
                daily_status[date] = status
            else:
                current_status = daily_status[date]

                if priority.get(status, 0) > priority.get(
                    current_status,
                    0
                ):
                    daily_status[date] = status

        present_count = sum(
            1
            for status in daily_status.values()
            if status in ["PRESENT", "LATE"]
        )

        school_setting = SchoolAttendanceSetting.objects.filter(
            school=school,
            academic_session=obj.academic_session,
            term=obj.term,
        ).first()

        school_days_opened = (
            school_setting.times_school_opened
            if school_setting
            else 0
        )

        return {
            "attendance_days": present_count,
            "school_days_opened": school_days_opened,
        }

    # ========================================================
    # NUMBER OF ATTENDANCE DAYS
    # ========================================================

    def get_attendance_days(self, obj):
        data = self._get_attendance_data(obj)

        return data["attendance_days"]

    # ========================================================
    # NUMBER OF SCHOOL DAYS OPENED
    # ========================================================

    def get_school_days_opened(self, obj):
        data = self._get_attendance_data(obj)

        return data["school_days_opened"]

    # ========================================================
    # ATTENDANCE PERCENTAGE
    # ========================================================

    def get_attendance_percentage(self, obj):
        """
        Calculates attendance percentage dynamically from:

            attendance_days / school_days_opened * 100

        PRESENT and LATE count as attendance days.

        Example:

            attendance_days = 5
            school_days_opened = 11

            5 / 11 * 100 = 45.45%
        """

        data = self._get_attendance_data(obj)

        attendance_days = data["attendance_days"]
        school_days_opened = data["school_days_opened"]

        if school_days_opened <= 0:
            return Decimal("0.00")

        percentage = (
            Decimal(attendance_days)
            / Decimal(school_days_opened)
            * Decimal("100")
        )

        return percentage.quantize(Decimal("0.01"))

    # ========================================================
    # STUDENT RESULTS
    # ========================================================

    def get_results(self, obj):
        """
        Returns only the results belonging to this exact:

        Student
        Academic Session
        Term
        Class
        """

        queryset = StudentResult.objects.filter(
            student=obj.student,
            examination_subject__examination__academic_session=obj.academic_session,
            examination_subject__examination__term=obj.term,
            examination_subject__examination__class_level=obj.class_level,
        ).select_related(
            "student",
            "examination_subject",
            "examination_subject__subject",
            "examination_subject__examination",
        ).order_by(
            "examination_subject__subject__name"
        )

        return StudentResultSerializer(
            queryset,
            many=True,
            context=self.context,
        ).data

    # ========================================================
    # REPORT CARD VALIDATION
    # ========================================================

    def validate(self, attrs):
        student = attrs.get(
            "student",
            self.instance.student if self.instance else None
        )

        academic_session = attrs.get(
            "academic_session",
            self.instance.academic_session
            if self.instance
            else None
        )

        term = attrs.get(
            "term",
            self.instance.term
            if self.instance
            else None
        )

        class_level = attrs.get(
            "class_level",
            self.instance.class_level
            if self.instance
            else None
        )

        # --------------------------------------------------------
        # Required fields
        # --------------------------------------------------------

        if not student:
            raise serializers.ValidationError({
                "student": "Student is required."
            })

        if not academic_session:
            raise serializers.ValidationError({
                "academic_session": "Academic session is required."
            })

        if not term:
            raise serializers.ValidationError({
                "term": "Term is required."
            })

        if not class_level:
            raise serializers.ValidationError({
                "class_level": "Class is required."
            })

        # --------------------------------------------------------
        # School consistency
        # --------------------------------------------------------

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
                    "The class does not belong "
                    "to the student's school."
                )
            })

        # --------------------------------------------------------
        # Term must belong to selected session
        # --------------------------------------------------------

        if term.academic_session_id != academic_session.id:
            raise serializers.ValidationError({
                "term": (
                    "The selected term does not belong "
                    "to the selected academic session."
                )
            })

        # --------------------------------------------------------
        # Historical enrollment validation
        # --------------------------------------------------------
        #
        # IMPORTANT:
        # We intentionally DO NOT require is_current=True.
        #
        # This allows old/historical report cards to remain
        # accessible and printable.
        #
        # Example:
        #
        # 2025/2026 FIRST TERM -> old enrollment
        # 2025/2026 SECOND TERM -> old enrollment
        # 2026/2027 FIRST TERM -> current enrollment
        #
        # All three can have their own report cards.
        # --------------------------------------------------------

        enrollment_exists = StudentEnrollment.objects.filter(
            student=student,
            academic_session=academic_session,
            term=term,
            class_level=class_level,
        ).exists()

        if not enrollment_exists:
            raise serializers.ValidationError({
                "class_level": (
                    "The student does not have an enrollment "
                    "for this academic session, term and class."
                )
            })

        # --------------------------------------------------------
        # Duplicate report card
        # --------------------------------------------------------

        duplicate_queryset = ReportCard.objects.filter(
            student=student,
            academic_session=academic_session,
            term=term,
        )

        if self.instance:
            duplicate_queryset = duplicate_queryset.exclude(
                pk=self.instance.pk
            )

        if duplicate_queryset.exists():
            raise serializers.ValidationError({
                "non_field_errors": [
                    "A report card already exists for this student "
                    "for the selected academic session and term."
                ]
            })

        return attrs