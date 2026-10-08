# from decimal import Decimal

# from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated

# from .models import (
#     GradeScale,
#     StudentResult,
#     ReportCard,
# )

# from .serializers import (
#     GradeScaleSerializer,
#     StudentResultSerializer,
#     ReportCardSerializer,
# )

# from attendance.models import (
#     AttendanceRecord,
#     SchoolAttendanceSetting,
# )


# # ============================================================
# # GRADE SCALES
# # ============================================================

# class GradeScaleListCreateView(
#     generics.ListCreateAPIView
# ):

#     queryset = GradeScale.objects.all()

#     serializer_class = GradeScaleSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]


# class GradeScaleDetailView(
#     generics.RetrieveUpdateDestroyAPIView
# ):

#     queryset = GradeScale.objects.all()

#     serializer_class = GradeScaleSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]


# # ============================================================
# # STUDENT RESULTS
# # ============================================================

# class StudentResultListCreateView(
#     generics.ListCreateAPIView
# ):

#     queryset = StudentResult.objects.select_related(
#         "student",
#         "student__department",
#         "examination_subject",
#         "examination_subject__subject",
#         "examination_subject__examination",
#         "examination_subject__examination__academic_session",
#         "examination_subject__examination__term",
#         "examination_subject__examination__class_level",
#     )

#     serializer_class = StudentResultSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]

#     # --------------------------------------------------------
#     # CREATE RESULT
#     # --------------------------------------------------------

#     def perform_create(self, serializer):

#         # ----------------------------------------------------
#         # Save Student Result
#         # ----------------------------------------------------

#         result = serializer.save()

#         # ----------------------------------------------------
#         # Automatically update matching report card
#         # ----------------------------------------------------

#         recalculate_report_card_for_result(
#             result
#         )


# class StudentResultDetailView(
#     generics.RetrieveUpdateDestroyAPIView
# ):

#     queryset = StudentResult.objects.select_related(
#         "student",
#         "student__department",
#         "examination_subject",
#         "examination_subject__subject",
#         "examination_subject__examination",
#         "examination_subject__examination__academic_session",
#         "examination_subject__examination__term",
#         "examination_subject__examination__class_level",
#     )

#     serializer_class = StudentResultSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]

#     # --------------------------------------------------------
#     # UPDATE RESULT
#     # --------------------------------------------------------

#     def perform_update(self, serializer):

#         # ----------------------------------------------------
#         # Keep the old examination information.
#         #
#         # This matters if the result is moved to another
#         # examination subject.
#         # ----------------------------------------------------

#         old_result = self.get_object()

#         old_exam = (
#             old_result.examination_subject.examination
#         )

#         old_student = old_result.student

#         old_session = old_exam.academic_session
#         old_term = old_exam.term
#         old_class = old_exam.class_level
#         old_department = old_student.department

#         # ----------------------------------------------------
#         # Save updated result
#         # ----------------------------------------------------

#         result = serializer.save()

#         # ----------------------------------------------------
#         # Recalculate NEW matching report card
#         # ----------------------------------------------------

#         recalculate_report_card_for_result(
#             result
#         )

#         # ----------------------------------------------------
#         # If the result was moved from another examination,
#         # recalculate the OLD report card too.
#         # ----------------------------------------------------

#         new_exam = (
#             result.examination_subject.examination
#         )

#         if (
#             old_session.id != new_exam.academic_session_id
#             or old_term.id != new_exam.term_id
#             or old_class.id != new_exam.class_level_id
#             or old_student.id != result.student_id
#         ):

#             old_report_card = ReportCard.objects.filter(
#                 student=old_student,
#                 academic_session=old_session,
#                 term=old_term,
#                 class_level=old_class,
#             ).first()

#             if old_report_card:

#                 calculate_report_card_scores(
#                     old_report_card
#                 )

#                 recalculate_class_positions(
#                     old_report_card.academic_session,
#                     old_report_card.term,
#                     old_report_card.class_level,
#                     old_department,
#                 )

#     # --------------------------------------------------------
#     # DELETE RESULT
#     # --------------------------------------------------------

#     def perform_destroy(self, instance):

#         # ----------------------------------------------------
#         # Save information before deleting.
#         # ----------------------------------------------------

#         student = instance.student

#         examination = (
#             instance.examination_subject.examination
#         )

#         academic_session = (
#             examination.academic_session
#         )

#         term = examination.term

#         class_level = examination.class_level

#         department = student.department

#         # ----------------------------------------------------
#         # Delete result
#         # ----------------------------------------------------

#         instance.delete()

#         # ----------------------------------------------------
#         # Find matching report card
#         # ----------------------------------------------------

#         report_card = ReportCard.objects.filter(
#             student=student,
#             academic_session=academic_session,
#             term=term,
#             class_level=class_level,
#         ).first()

#         if report_card:

#             # ------------------------------------------------
#             # Recalculate totals after result deletion
#             # ------------------------------------------------

#             calculate_report_card_scores(
#                 report_card
#             )

#             # ------------------------------------------------
#             # Recalculate class position
#             # ------------------------------------------------

#             recalculate_class_positions(
#                 academic_session,
#                 term,
#                 class_level,
#                 department,
#             )


# # ============================================================
# # FIND REPORT CARD FOR STUDENT RESULT
# # ============================================================

# def recalculate_report_card_for_result(
#     result
# ):

#     # --------------------------------------------------------
#     # Examination
#     # --------------------------------------------------------

#     examination = (
#         result.examination_subject.examination
#     )

#     student = result.student

#     academic_session = (
#         examination.academic_session
#     )

#     term = examination.term

#     class_level = (
#         examination.class_level
#     )

#     # --------------------------------------------------------
#     # Find matching report card
#     #
#     # IMPORTANT:
#     # We intentionally DO NOT use is_current=True.
#     #
#     # This allows historical report cards to work.
#     # --------------------------------------------------------

#     report_card = ReportCard.objects.filter(
#         student=student,
#         academic_session=academic_session,
#         term=term,
#         class_level=class_level,
#     ).first()

#     # --------------------------------------------------------
#     # No report card yet
#     #
#     # The result can still exist.
#     # Once the admin creates the report card, its calculations
#     # will include this result.
#     # --------------------------------------------------------

#     if not report_card:

#         return None

#     # --------------------------------------------------------
#     # Recalculate:
#     #
#     # total score
#     # average
#     # grade
#     # attendance
#     # promotion flag
#     # --------------------------------------------------------

#     calculate_report_card_scores(
#         report_card
#     )

#     # --------------------------------------------------------
#     # Recalculate class position
#     # --------------------------------------------------------

#     recalculate_class_positions(
#         report_card.academic_session,
#         report_card.term,
#         report_card.class_level,
#         student.department,
#     )

#     return report_card


# # ============================================================
# # GET STUDENT RESULTS FOR REPORT CARD
# # ============================================================

# def get_student_results(
#     report_card
# ):

#     return StudentResult.objects.filter(
#         student=report_card.student,
#         examination_subject__examination__academic_session=(
#             report_card.academic_session
#         ),
#         examination_subject__examination__term=(
#             report_card.term
#         ),
#         examination_subject__examination__class_level=(
#             report_card.class_level
#         ),
#     ).select_related(
#         "examination_subject",
#         "examination_subject__subject",
#         "examination_subject__examination",
#     )


# # ============================================================
# # ATTENDANCE CALCULATION
# # ============================================================

# def calculate_attendance_percentage(
#     report_card
# ):

#     """
#     Calculate attendance for the exact:

#         Student
#         + Academic Session
#         + Term
#         + Class

#     PRESENT and LATE count as attended.

#     ABSENT and EXCUSED do not count.

#     School opening count comes from
#     SchoolAttendanceSetting.
#     """

#     student = report_card.student

#     academic_session = (
#         report_card.academic_session
#     )

#     term = report_card.term

#     class_level = report_card.class_level

#     # --------------------------------------------------------
#     # SCHOOL ATTENDANCE SETTING
#     # --------------------------------------------------------

#     setting = SchoolAttendanceSetting.objects.filter(
#         school=student.school,
#         academic_session=academic_session,
#         term=term,
#     ).first()

#     if not setting:

#         return Decimal("0.00")

#     times_school_opened = int(
#         setting.times_school_opened or 0
#     )

#     if times_school_opened <= 0:

#         return Decimal("0.00")

#     # --------------------------------------------------------
#     # ATTENDANCE RECORDS
#     # --------------------------------------------------------

#     records = AttendanceRecord.objects.filter(
#         school=student.school,
#         student=student,
#         academic_session=academic_session,
#         term=term,
#         class_level=class_level,
#     ).values(
#         "date",
#         "status",
#     )

#     # --------------------------------------------------------
#     # ONE STATUS PER DAY
#     # --------------------------------------------------------

#     daily_status = {}

#     status_priority = {
#         "PRESENT": 4,
#         "LATE": 3,
#         "EXCUSED": 2,
#         "ABSENT": 1,
#     }

#     for record in records:

#         date = record["date"]

#         status = str(
#             record["status"]
#         ).upper()

#         if date not in daily_status:

#             daily_status[date] = status

#         else:

#             current_status = (
#                 daily_status[date]
#             )

#             if (
#                 status_priority.get(
#                     status,
#                     0
#                 )
#                 >
#                 status_priority.get(
#                     current_status,
#                     0
#                 )
#             ):

#                 daily_status[date] = status

#     # --------------------------------------------------------
#     # ATTENDED DAYS
#     # --------------------------------------------------------

#     attended_days = sum(
#         1
#         for status in daily_status.values()
#         if status in [
#             "PRESENT",
#             "LATE",
#         ]
#     )

#     # --------------------------------------------------------
#     # PERCENTAGE
#     # --------------------------------------------------------

#     percentage = (
#         Decimal(attended_days)
#         /
#         Decimal(times_school_opened)
#     ) * Decimal("100")

#     # --------------------------------------------------------
#     # NEVER ABOVE 100%
#     # --------------------------------------------------------

#     if percentage > Decimal("100.00"):

#         percentage = Decimal("100.00")

#     return percentage.quantize(
#         Decimal("0.01")
#     )


# # ============================================================
# # CALCULATE REPORT CARD SCORES
# # ============================================================

# def calculate_report_card_scores(
#     report_card
# ):

#     results = get_student_results(
#         report_card
#     )

#     # --------------------------------------------------------
#     # TOTAL SCORE
#     # --------------------------------------------------------

#     total_score = sum(
#         (
#             Decimal(
#                 result.total_score or 0
#             )
#             for result in results
#         ),
#         Decimal("0.00"),
#     )

#     # --------------------------------------------------------
#     # NUMBER OF SUBJECT RESULTS
#     # --------------------------------------------------------

#     result_count = results.count()

#     # --------------------------------------------------------
#     # AVERAGE
#     # --------------------------------------------------------

#     if result_count:

#         average_score = (
#             total_score
#             /
#             Decimal(result_count)
#         ).quantize(
#             Decimal("0.01")
#         )

#     else:

#         average_score = Decimal(
#             "0.00"
#         )

#     # --------------------------------------------------------
#     # OVERALL GRADE
#     # --------------------------------------------------------

#     grade_scale = GradeScale.objects.filter(
#         minimum_score__lte=average_score,
#         maximum_score__gte=average_score,
#         is_active=True,
#     ).order_by(
#         "-minimum_score"
#     ).first()

#     if grade_scale:

#         overall_grade = (
#             grade_scale.grade
#         )

#     else:

#         overall_grade = ""

#     # --------------------------------------------------------
#     # PROMOTION
#     #
#     # Keep existing logic for now.
#     # Promotion will be properly handled later.
#     # --------------------------------------------------------

#     promoted = (
#         average_score
#         >= Decimal("50.00")
#     )

#     # --------------------------------------------------------
#     # ATTENDANCE
#     # --------------------------------------------------------

#     attendance_percentage = (
#         calculate_attendance_percentage(
#             report_card
#         )
#     )

#     # --------------------------------------------------------
#     # SAVE
#     # --------------------------------------------------------

#     report_card.total_score = (
#         total_score
#     )

#     report_card.average_score = (
#         average_score
#     )

#     report_card.overall_grade = (
#         overall_grade
#     )

#     report_card.attendance_percentage = (
#         attendance_percentage
#     )

#     report_card.promoted = (
#         promoted
#     )

#     report_card.save()

#     return report_card


# # ============================================================
# # RECALCULATE CLASS POSITIONS
# # ============================================================

# def recalculate_class_positions(
#     academic_session,
#     term,
#     class_level,
#     department=None,
# ):

#     report_cards_qs = ReportCard.objects.filter(
#         academic_session=academic_session,
#         term=term,
#         class_level=class_level,
#     ).select_related(
#         "student"
#     )

#     # --------------------------------------------------------
#     # DEPARTMENT
#     # --------------------------------------------------------

#     if department is not None:

#         report_cards_qs = report_cards_qs.filter(
#             student__department=department
#         )

#     else:

#         report_cards_qs = report_cards_qs.filter(
#             student__department__isnull=True
#         )

#     # --------------------------------------------------------
#     # ORDER BY TOTAL SCORE
#     # --------------------------------------------------------

#     report_cards = list(
#         report_cards_qs.order_by(
#             "-total_score",
#             "student__last_name",
#             "student__first_name",
#         )
#     )

#     total_students = len(
#         report_cards
#     )

#     # --------------------------------------------------------
#     # COMPETITION RANKING
#     #
#     # Example:
#     #
#     # 1
#     # 2
#     # 2
#     # 4
#     # --------------------------------------------------------

#     current_position = 0

#     previous_score = None

#     for index, report_card in enumerate(
#         report_cards,
#         start=1,
#     ):

#         if (
#             previous_score
#             != report_card.total_score
#         ):

#             current_position = (
#                 index
#             )

#         report_card.position = (
#             current_position
#         )

#         report_card.total_students = (
#             total_students
#         )

#         report_card.save(
#             update_fields=[
#                 "position",
#                 "total_students",
#                 "updated_at",
#             ]
#         )

#         previous_score = (
#             report_card.total_score
#         )


# # ============================================================
# # REPORT CARDS
# # ============================================================

# class ReportCardListCreateView(
#     generics.ListCreateAPIView
# ):

#     queryset = ReportCard.objects.select_related(
#         "student",
#         "student__department",
#         "academic_session",
#         "term",
#         "class_level",
#     )

#     serializer_class = (
#         ReportCardSerializer
#     )

#     permission_classes = [
#         IsAuthenticated
#     ]

#     # --------------------------------------------------------
#     # FILTER REPORT CARDS
#     # --------------------------------------------------------

#     def get_queryset(self):

#         queryset = super().get_queryset()

#         student = (
#             self.request.query_params.get(
#                 "student"
#             )
#         )

#         academic_session = (
#             self.request.query_params.get(
#                 "academic_session"
#             )
#         )

#         term = (
#             self.request.query_params.get(
#                 "term"
#             )
#         )

#         class_level = (
#             self.request.query_params.get(
#                 "class_level"
#             )
#         )

#         if student:

#             queryset = queryset.filter(
#                 student_id=student
#             )

#         if academic_session:

#             queryset = queryset.filter(
#                 academic_session_id=academic_session
#             )

#         if term:

#             queryset = queryset.filter(
#                 term_id=term
#             )

#         if class_level:

#             queryset = queryset.filter(
#                 class_level_id=class_level
#             )

#         return queryset

#     # --------------------------------------------------------
#     # CREATE REPORT CARD
#     # --------------------------------------------------------

#     def perform_create(
#         self,
#         serializer
#     ):

#         report_card = serializer.save()

#         # ----------------------------------------------------
#         # Calculate:
#         #
#         # total
#         # average
#         # grade
#         # attendance
#         # promotion flag
#         # ----------------------------------------------------

#         calculate_report_card_scores(
#             report_card
#         )

#         # ----------------------------------------------------
#         # Position
#         # ----------------------------------------------------

#         recalculate_class_positions(
#             report_card.academic_session,
#             report_card.term,
#             report_card.class_level,
#             report_card.student.department,
#         )


# # ============================================================
# # REPORT CARD DETAIL
# # ============================================================

# class ReportCardDetailView(
#     generics.RetrieveUpdateDestroyAPIView
# ):

#     serializer_class = ReportCardSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]

#     def get_queryset(self):

#         user = self.request.user

#         exam_officer_profile = getattr(
#             user,
#             "exam_officer_profile",
#             None,
#         )

#         if exam_officer_profile:

#             return (
#                 ReportCard.objects
#                 .filter(
#                     student__school=exam_officer_profile.school
#                 )
#                 .select_related(
#                     "student",
#                     "student__department",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#             )

#         return (
#             ReportCard.objects
#             .select_related(
#                 "student",
#                 "student__department",
#                 "academic_session",
#                 "term",
#                 "class_level",
#             )
#         )

#     # =========================================================
#     # UPDATE
#     # =========================================================

#     def perform_update(
#         self,
#         serializer
#     ):

#         user = self.request.user

#         exam_officer_profile = getattr(
#             user,
#             "exam_officer_profile",
#             None,
#         )

#         if exam_officer_profile:

#             school = exam_officer_profile.school

#             student = serializer.validated_data.get(
#                 "student",
#                 serializer.instance.student,
#             )

#             if student.school_id != school.id:

#                 from rest_framework.exceptions import PermissionDenied

#                 raise PermissionDenied(
#                     "You cannot move this report card to a student from another school."
#                 )

#         report_card = serializer.save()

#         calculate_report_card_scores(
#             report_card
#         )

#         recalculate_class_positions(
#             report_card.academic_session,
#             report_card.term,
#             report_card.class_level,
#             report_card.student.department,
#         )


# # ============================================================
# # STUDENT MY REPORT CARDS
# # ============================================================

# class MyReportCardListView(
#     generics.ListAPIView
# ):
#     """
#     Returns only published report cards belonging to
#     the currently authenticated student.

#     A student cannot see another student's report cards.
#     """

#     serializer_class = ReportCardSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]

#     def get_queryset(self):

#         # ----------------------------------------------------
#         # Get the Student profile linked to the logged-in user
#         # ----------------------------------------------------

#         student = getattr(
#             self.request.user,
#             "student_profile",
#             None,
#         )

#         if student is None:
#             return ReportCard.objects.none()

#         # ----------------------------------------------------
#         # Only return THIS student's published results
#         # ----------------------------------------------------

#         return (
#             ReportCard.objects
#             .filter(
#                 student=student,
#                 is_published=True,
#             )
#             .select_related(
#                 "student",
#                 "student__department",
#                 "student__school",
#                 "academic_session",
#                 "term",
#                 "class_level",
#             )
#             .order_by(
#                 "-academic_session__start_date",
#                 "-term__id",
#                 "-id",
#             )
#         )


# # ============================================================
# # STUDENT MY REPORT CARD DETAIL
# # ============================================================

# class MyReportCardDetailView(
#     generics.RetrieveAPIView
# ):
#     """
#     Returns one published report card belonging to the
#     currently authenticated student.

#     This prevents a student from changing the report-card ID
#     in the URL and viewing another student's result.
#     """

#     serializer_class = ReportCardSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]

#     def get_queryset(self):

#         # ----------------------------------------------------
#         # Get the Student profile linked to the logged-in user
#         # ----------------------------------------------------

#         student = getattr(
#             self.request.user,
#             "student_profile",
#             None,
#         )

#         if student is None:
#             return ReportCard.objects.none()

#         # ----------------------------------------------------
#         # Only THIS student's published report cards
#         # ----------------------------------------------------

#         return (
#             ReportCard.objects
#             .filter(
#                 student=student,
#                 is_published=True,
#             )
#             .select_related(
#                 "student",
#                 "student__department",
#                 "student__school",
#                 "academic_session",
#                 "term",
#                 "class_level",
#             )
#         )




# from decimal import Decimal

# from django.db.models import Avg, Max, Min
# from rest_framework import generics, status
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response

# from academics.models import AcademicSession, Term, ClassLevel
# from students.models import Student
# from teachers.models import Teacher, TeacherSubject

# from .models import (
#     GradeScale,
#     StudentResult,
#     ReportCard,
# )
# from .serializers import (
#     GradeScaleSerializer,
#     StudentResultSerializer,
#     ReportCardSerializer,
# )


# # ============================================================
# # ROLE HELPERS
# # ============================================================

# FULL_RESULT_ROLES = {
#     "SUPER_ADMIN",
#     "SCHOOL_ADMIN",
#     "PRINCIPAL",
#     "EXAM_OFFICER",
# }


# def get_user_school_id(user):
#     """
#     Returns the school ID associated with the authenticated user.

#     Supports the existing project structure where:
#         - School Admin has user.school_id
#         - Principal/Teacher/etc. may have a related profile
#     """

#     if getattr(user, "school_id", None):
#         return user.school_id

#     teacher = getattr(user, "teacher_profile", None)
#     if teacher:
#         return teacher.school_id

#     exam_officer = getattr(user, "exam_officer_profile", None)
#     if exam_officer:
#         return exam_officer.school_id

#     principal = getattr(user, "principal_profile", None)
#     if principal:
#         return principal.school_id

#     student = getattr(user, "student_profile", None)
#     if student:
#         return getattr(student, "school_id", None)

#     parent = getattr(user, "parent_profile", None)
#     if parent:
#         return getattr(parent, "school_id", None)

#     return None


# def is_full_result_manager(user):
#     """
#     Users who can manage results across their school.
#     """

#     return (
#         user.is_authenticated
#         and getattr(user, "role", None) in FULL_RESULT_ROLES
#     )


# def is_teacher(user):
#     return (
#         user.is_authenticated
#         and getattr(user, "role", None) == "TEACHER"
#     )


# def is_student(user):
#     return (
#         user.is_authenticated
#         and getattr(user, "role", None) == "STUDENT"
#     )


# def is_parent(user):
#     return (
#         user.is_authenticated
#         and getattr(user, "role", None) == "PARENT"
#     )


# def teacher_can_access_result(user, result):
#     """
#     A teacher can access a result only when the teacher is assigned
#     to BOTH:

#         1. the result's class
#         2. the result's subject

#     through the existing TeacherSubject model.
#     """

#     teacher = getattr(user, "teacher_profile", None)

#     if not teacher:
#         return False

#     if teacher.school_id != result.examination_subject.examination.school_id:
#         return False

#     examination_subject = result.examination_subject
#     examination = examination_subject.examination

#     return TeacherSubject.objects.filter(
#         teacher=teacher,
#         subject_id=examination_subject.subject_id,
#         class_level_id=examination.class_level_id,
#     ).exists()


# def get_student_from_user(user):
#     """
#     Returns the Student profile belonging to the authenticated user.

#     The existing project uses user.student_profile.
#     """

#     return getattr(user, "student_profile", None)


# def get_parent_children_queryset(user):
#     """
#     Returns the students belonging to the authenticated parent.

#     The project's parent profile relationship is expected to expose
#     the parent's children/students.

#     This function supports the common existing relationship names
#     without changing any models.
#     """

#     parent = getattr(user, "parent_profile", None)

#     if not parent:
#         return Student.objects.none()

#     # Existing/common relationship possibilities.
#     if hasattr(parent, "children"):
#         try:
#             return parent.children.all()
#         except Exception:
#             pass

#     if hasattr(parent, "students"):
#         try:
#             return parent.students.all()
#         except Exception:
#             pass

#     # If Student has a direct parent relation.
#     try:
#         return Student.objects.filter(parent=parent)
#     except Exception:
#         pass

#     return Student.objects.none()


# def result_school_id(result):
#     """
#     Gets the school through:

#         StudentResult
#         -> ExaminationSubject
#         -> Examination
#         -> School
#     """

#     return result.examination_subject.examination.school_id


# # ============================================================
# # RESULT QUERYSET
# # ============================================================

# def get_result_queryset_for_user(user):
#     """
#     Central permission-filtered queryset for StudentResult.

#     FULL MANAGERS:
#         Super Admin
#         School Admin
#         Principal
#         Exam Officer

#     TEACHER:
#         Only assigned class + assigned subject.

#     STUDENT:
#         Own published results.

#     PARENT:
#         Child's published results.
#     """

#     base_queryset = (
#         StudentResult.objects
#         .select_related(
#             "student",
#             "examination_subject",
#             "examination_subject__subject",
#             "examination_subject__examination",
#             "examination_subject__examination__academic_session",
#             "examination_subject__examination__term",
#             "examination_subject__examination__class_level",
#         )
#     )

#     role = getattr(user, "role", None)

#     # --------------------------------------------------------
#     # SUPER ADMIN
#     # --------------------------------------------------------

#     if role == "SUPER_ADMIN":
#         return base_queryset

#     # --------------------------------------------------------
#     # SCHOOL ADMIN / PRINCIPAL / EXAM OFFICER
#     # --------------------------------------------------------

#     if role in {
#         "SCHOOL_ADMIN",
#         "PRINCIPAL",
#         "EXAM_OFFICER",
#     }:
#         school_id = get_user_school_id(user)

#         if not school_id:
#             return StudentResult.objects.none()

#         return base_queryset.filter(
#             examination_subject__examination__school_id=school_id
#         )

#     # --------------------------------------------------------
#     # TEACHER
#     # --------------------------------------------------------

#     if role == "TEACHER":
#         teacher = getattr(user, "teacher_profile", None)

#         if not teacher:
#             return StudentResult.objects.none()

#         return base_queryset.filter(
#             examination_subject__examination__school_id=teacher.school_id,
#             examination_subject__subject__teacher_assignments__teacher=teacher,
#             examination_subject__examination__class_level__teacher_subject_assignments__teacher=teacher,
#         ).distinct()

#     # --------------------------------------------------------
#     # STUDENT
#     # --------------------------------------------------------

#     if role == "STUDENT":
#         student = get_student_from_user(user)

#         if not student:
#             return StudentResult.objects.none()

#         return base_queryset.filter(
#             student=student,
#             is_published=True,
#         )

#     # --------------------------------------------------------
#     # PARENT
#     # --------------------------------------------------------

#     if role == "PARENT":
#         children = get_parent_children_queryset(user)

#         return base_queryset.filter(
#             student__in=children,
#             is_published=True,
#         )

#     return StudentResult.objects.none()


# # ============================================================
# # GRADE SCALE
# # ============================================================

# class GradeScaleListCreateView(generics.ListCreateAPIView):
#     serializer_class = GradeScaleSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         if not is_full_result_manager(user):
#             return GradeScale.objects.none()

#         return GradeScale.objects.all().order_by(
#             "-minimum_score"
#         )

#     def create(self, request, *args, **kwargs):
#         if not is_full_result_manager(request.user):
#             return Response(
#                 {
#                     "detail": (
#                         "You do not have permission to create "
#                         "grading scales."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         return super().create(
#             request,
#             *args,
#             **kwargs,
#         )


# class GradeScaleDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = GradeScaleSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         if not is_full_result_manager(user):
#             return GradeScale.objects.none()

#         return GradeScale.objects.all()

#     def update(self, request, *args, **kwargs):
#         if not is_full_result_manager(request.user):
#             return Response(
#                 {
#                     "detail": (
#                         "You do not have permission to modify "
#                         "grading scales."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         return super().update(
#             request,
#             *args,
#             **kwargs,
#         )

#     def destroy(self, request, *args, **kwargs):
#         if not is_full_result_manager(request.user):
#             return Response(
#                 {
#                     "detail": (
#                         "You do not have permission to delete "
#                         "grading scales."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         return super().destroy(
#             request,
#             *args,
#             **kwargs,
#         )


# # ============================================================
# # STUDENT RESULT HELPERS
# # ============================================================

# def get_student_results(
#     student,
#     academic_session=None,
#     term=None,
#     class_level=None,
# ):
#     """
#     Returns results belonging to one student.

#     Optional filters can be supplied for:
#         academic session
#         term
#         class
#     """

#     queryset = (
#         StudentResult.objects
#         .select_related(
#             "student",
#             "examination_subject",
#             "examination_subject__subject",
#             "examination_subject__examination",
#             "examination_subject__examination__academic_session",
#             "examination_subject__examination__term",
#             "examination_subject__examination__class_level",
#         )
#         .filter(student=student)
#     )

#     if academic_session:
#         queryset = queryset.filter(
#             examination_subject__examination__academic_session=academic_session
#         )

#     if term:
#         queryset = queryset.filter(
#             examination_subject__examination__term=term
#         )

#     if class_level:
#         queryset = queryset.filter(
#             examination_subject__examination__class_level=class_level
#         )

#     return queryset


# def calculate_attendance_percentage(
#     student,
#     academic_session,
#     term,
# ):
#     """
#     Calculates attendance percentage when attendance records exist.

#     Keeps the existing project behavior by safely returning 0 when
#     attendance data is unavailable.
#     """

#     try:
#         from attendance.models import Attendance

#         attendance_queryset = Attendance.objects.filter(
#             student=student,
#             academic_session=academic_session,
#             term=term,
#         )

#         total_days = attendance_queryset.count()

#         if total_days == 0:
#             return Decimal("0.00")

#         present_days = attendance_queryset.filter(
#             status="PRESENT"
#         ).count()

#         return (
#             Decimal(present_days)
#             / Decimal(total_days)
#             * Decimal("100")
#         ).quantize(Decimal("0.01"))

#     except Exception:
#         return Decimal("0.00")


# def calculate_report_card_scores(
#     student,
#     academic_session,
#     term,
#     class_level,
# ):
#     results = get_student_results(
#         student=student,
#         academic_session=academic_session,
#         term=term,
#         class_level=class_level,
#     )

#     total_score = sum(
#         (
#             Decimal(result.total_score or 0)
#             for result in results
#         ),
#         Decimal("0.00"),
#     )

#     result_count = results.count()

#     if result_count:
#         average_score = (
#             total_score / Decimal(result_count)
#         ).quantize(Decimal("0.01"))
#     else:
#         average_score = Decimal("0.00")

#     grade_scale = (
#         GradeScale.objects
#         .filter(
#             minimum_score__lte=average_score,
#             maximum_score__gte=average_score,
#             is_active=True,
#         )
#         .order_by("-minimum_score")
#         .first()
#     )

#     if grade_scale:
#         overall_grade = grade_scale.grade
#     else:
#         overall_grade = ""

#     attendance_percentage = calculate_attendance_percentage(
#         student,
#         academic_session,
#         term,
#     )

#     return {
#         "total_score": total_score,
#         "average_score": average_score,
#         "overall_grade": overall_grade,
#         "attendance_percentage": attendance_percentage,
#     }


# def recalculate_class_positions(
#     academic_session,
#     term,
#     class_level,
# ):
#     """
#     Recalculates positions based on report-card average scores.
#     """

#     report_cards = list(
#         ReportCard.objects.filter(
#             academic_session=academic_session,
#             term=term,
#             class_level=class_level,
#         ).order_by(
#             "-average_score",
#             "student__user__last_name",
#             "student__user__first_name",
#         )
#     )

#     previous_score = None
#     current_position = 0

#     for index, report_card in enumerate(
#         report_cards,
#         start=1,
#     ):
#         if (
#             previous_score is None
#             or report_card.average_score != previous_score
#         ):
#             current_position = index

#         report_card.position = current_position
#         previous_score = report_card.average_score

#     if report_cards:
#         ReportCard.objects.bulk_update(
#             report_cards,
#             ["position"],
#         )


# def recalculate_report_card_for_result(result):
#     """
#     Recalculates the student's report card after a result changes.
#     """

#     examination = result.examination_subject.examination

#     student = result.student
#     academic_session = examination.academic_session
#     term = examination.term
#     class_level = examination.class_level

#     scores = calculate_report_card_scores(
#         student=student,
#         academic_session=academic_session,
#         term=term,
#         class_level=class_level,
#     )

#     report_card, _ = ReportCard.objects.get_or_create(
#         student=student,
#         academic_session=academic_session,
#         term=term,
#         class_level=class_level,
#     )

#     report_card.total_score = scores["total_score"]
#     report_card.average_score = scores["average_score"]
#     report_card.overall_grade = scores["overall_grade"]
#     report_card.attendance_percentage = (
#         scores["attendance_percentage"]
#     )

#     report_card.save()

#     recalculate_class_positions(
#         academic_session=academic_session,
#         term=term,
#         class_level=class_level,
#     )

#     return report_card


# # ============================================================
# # STUDENT RESULTS
# # ============================================================

# class StudentResultListCreateView(
#     generics.ListCreateAPIView
# ):
#     """
#     Result access:

#     SUPER_ADMIN
#         Full access.

#     SCHOOL_ADMIN
#         Full access within school.

#     PRINCIPAL
#         Full access within school.

#     EXAM_OFFICER
#         Full access within school.

#     TEACHER
#         Only assigned class + assigned subject.

#     STUDENT
#         Own published results only.

#     PARENT
#         Child's published results only.
#     """

#     serializer_class = StudentResultSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return get_result_queryset_for_user(
#             self.request.user
#         )

#     def create(self, request, *args, **kwargs):
#         user = request.user

#         if not (
#             is_full_result_manager(user)
#             or is_teacher(user)
#         ):
#             return Response(
#                 {
#                     "detail": (
#                         "You do not have permission to create "
#                         "student results."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         serializer = self.get_serializer(
#             data=request.data
#         )
#         serializer.is_valid(raise_exception=True)

#         student = serializer.validated_data[
#             "student"
#         ]

#         examination_subject = (
#             serializer.validated_data[
#                 "examination_subject"
#             ]
#         )

#         examination = examination_subject.examination

#         # ----------------------------------------------------
#         # SCHOOL CHECK
#         # ----------------------------------------------------

#         school_id = get_user_school_id(user)

#         if (
#             getattr(user, "role", None) != "SUPER_ADMIN"
#             and school_id != examination.school_id
#         ):
#             return Response(
#                 {
#                     "detail": (
#                         "You cannot create a result "
#                         "outside your school."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         # ----------------------------------------------------
#         # TEACHER ASSIGNMENT CHECK
#         # ----------------------------------------------------

#         if is_teacher(user):
#             teacher = getattr(
#                 user,
#                 "teacher_profile",
#                 None,
#             )

#             if not teacher:
#                 return Response(
#                     {
#                         "detail": (
#                             "Your teacher profile could not "
#                             "be found."
#                         )
#                     },
#                     status=status.HTTP_403_FORBIDDEN,
#                 )

#             assignment_exists = (
#                 TeacherSubject.objects.filter(
#                     teacher=teacher,
#                     subject_id=(
#                         examination_subject.subject_id
#                     ),
#                     class_level_id=(
#                         examination.class_level_id
#                     ),
#                 ).exists()
#             )

#             if not assignment_exists:
#                 return Response(
#                     {
#                         "detail": (
#                             "You can only enter results for "
#                             "subjects and classes assigned "
#                             "to you."
#                         )
#                     },
#                     status=status.HTTP_403_FORBIDDEN,
#                 )

#         # ----------------------------------------------------
#         # STUDENT MUST BELONG TO EXAM CLASS
#         # ----------------------------------------------------

#         student_class_matches = False

#         try:
#             student_class_matches = (
#                 student.enrollments.filter(
#                 class_level=examination.class_level,
#                 academic_session=examination.academic_session,
#                 term=examination.term,
#             ).exists()
#             )
#         except Exception:
#             pass

#         if not student_class_matches:
#             try:
#                 student_class_matches = (
#                     student.enrollment_history.filter(
#                         class_level=examination.class_level,
#                         academic_session=(
#                             examination.academic_session
#                         ),
#                     ).exists()
#                 )
#             except Exception:
#                 pass

#         if not student_class_matches:
#             return Response(
#                 {
#                     "detail": (
#                         "The selected student is not enrolled "
#                         "in this class for the examination "
#                         "academic session."
#                     )
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         # ----------------------------------------------------
#         # SAVE RESULT
#         # ----------------------------------------------------

#         self.perform_create(serializer)

#         headers = self.get_success_headers(
#             serializer.data
#         )

#         return Response(
#             serializer.data,
#             status=status.HTTP_201_CREATED,
#             headers=headers,
#         )

#     def perform_create(self, serializer):
#         result = serializer.save()

#         recalculate_report_card_for_result(
#             result
#         )


# class StudentResultDetailView(
#     generics.RetrieveUpdateDestroyAPIView
# ):
#     serializer_class = StudentResultSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return get_result_queryset_for_user(
#             self.request.user
#         )

#     def retrieve(self, request, *args, **kwargs):
#         result = self.get_object()

#         return Response(
#             self.get_serializer(result).data
#         )

#     def update(self, request, *args, **kwargs):
#         user = request.user
#         result = self.get_object()

#         # Student and Parent queryset filtering already prevents
#         # access to unpublished/unauthorized results.
#         if not (
#             is_full_result_manager(user)
#             or is_teacher(user)
#         ):
#             return Response(
#                 {
#                     "detail": (
#                         "You do not have permission to modify "
#                         "student results."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         # ----------------------------------------------------
#         # TEACHER ASSIGNMENT CHECK
#         # ----------------------------------------------------

#         if is_teacher(user):
#             if not teacher_can_access_result(
#                 user,
#                 result,
#             ):
#                 return Response(
#                     {
#                         "detail": (
#                             "You can only modify results for "
#                             "subjects and classes assigned "
#                             "to you."
#                         )
#                     },
#                     status=status.HTTP_403_FORBIDDEN,
#                 )

#         # ----------------------------------------------------
#         # SCHOOL CHECK
#         # ----------------------------------------------------

#         if (
#             getattr(user, "role", None) != "SUPER_ADMIN"
#             and get_user_school_id(user)
#             != result_school_id(result)
#         ):
#             return Response(
#                 {
#                     "detail": (
#                         "You cannot modify a result "
#                         "outside your school."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         partial = kwargs.pop(
#             "partial",
#             False,
#         )

#         serializer = self.get_serializer(
#             result,
#             data=request.data,
#             partial=partial,
#         )

#         serializer.is_valid(
#             raise_exception=True
#         )

#         updated_result = serializer.save()

#         recalculate_report_card_for_result(
#             updated_result
#         )

#         return Response(
#             self.get_serializer(
#                 updated_result
#             ).data
#         )

#     def partial_update(self, request, *args, **kwargs):
#         kwargs["partial"] = True

#         return self.update(
#             request,
#             *args,
#             **kwargs,
#         )

#     def destroy(self, request, *args, **kwargs):
#         user = request.user
#         result = self.get_object()

#         if not (
#             is_full_result_manager(user)
#             or is_teacher(user)
#         ):
#             return Response(
#                 {
#                     "detail": (
#                         "You do not have permission to "
#                         "delete student results."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         if is_teacher(user):
#             if not teacher_can_access_result(
#                 user,
#                 result,
#             ):
#                 return Response(
#                     {
#                         "detail": (
#                             "You can only delete results for "
#                             "subjects and classes assigned "
#                             "to you."
#                         )
#                     },
#                     status=status.HTTP_403_FORBIDDEN,
#                 )

#         if (
#             getattr(user, "role", None) != "SUPER_ADMIN"
#             and get_user_school_id(user)
#             != result_school_id(result)
#         ):
#             return Response(
#                 {
#                     "detail": (
#                         "You cannot delete a result "
#                         "outside your school."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         examination = (
#             result.examination_subject.examination
#         )

#         student = result.student

#         response = super().destroy(
#             request,
#             *args,
#             **kwargs,
#         )

#         # Recalculate after deletion.
#         try:
#             scores = calculate_report_card_scores(
#                 student=student,
#                 academic_session=(
#                     examination.academic_session
#                 ),
#                 term=examination.term,
#                 class_level=(
#                     examination.class_level
#                 ),
#             )

#             report_card = ReportCard.objects.filter(
#                 student=student,
#                 academic_session=(
#                     examination.academic_session
#                 ),
#                 term=examination.term,
#                 class_level=(
#                     examination.class_level
#                 ),
#             ).first()

#             if report_card:
#                 report_card.total_score = (
#                     scores["total_score"]
#                 )
#                 report_card.average_score = (
#                     scores["average_score"]
#                 )
#                 report_card.overall_grade = (
#                     scores["overall_grade"]
#                 )
#                 report_card.attendance_percentage = (
#                     scores["attendance_percentage"]
#                 )
#                 report_card.save()

#                 recalculate_class_positions(
#                     academic_session=(
#                         examination.academic_session
#                     ),
#                     term=examination.term,
#                     class_level=(
#                         examination.class_level
#                     ),
#                 )

#         except Exception:
#             pass

#         return response


# # ============================================================
# # REPORT CARDS
# # ============================================================

# class ReportCardListCreateView(
#     generics.ListCreateAPIView
# ):
#     serializer_class = ReportCardSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         role = getattr(user, "role", None)

#         # ----------------------------------------------------
#         # FULL MANAGERS
#         # ----------------------------------------------------

#         if role == "SUPER_ADMIN":
#             queryset = (
#                 ReportCard.objects
#                 .select_related(
#                     "student",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#                 .all()
#             )

#         elif role in {
#             "SCHOOL_ADMIN",
#             "PRINCIPAL",
#             "EXAM_OFFICER",
#         }:
#             school_id = get_user_school_id(user)

#             if not school_id:
#                 return ReportCard.objects.none()

#             queryset = (
#                 ReportCard.objects
#                 .select_related(
#                     "student",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#                 .filter(
#                     class_level__school_id=school_id
#                 )
#             )

#         # ----------------------------------------------------
#         # TEACHER
#         # ----------------------------------------------------

#         elif role == "TEACHER":
#             teacher = getattr(
#                 user,
#                 "teacher_profile",
#                 None,
#             )

#             if not teacher:
#                 return ReportCard.objects.none()

#             # A teacher can see report cards for classes where
#             # they have at least one subject assignment.
#             assigned_classes = (
#                 TeacherSubject.objects
#                 .filter(
#                     teacher=teacher
#                 )
#                 .values_list(
#                     "class_level_id",
#                     flat=True,
#                 )
#             )

#             queryset = (
#                 ReportCard.objects
#                 .select_related(
#                     "student",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#                 .filter(
#                     class_level_id__in=assigned_classes,
#                     class_level__school_id=teacher.school_id,
#                 )
#             )

#         # ----------------------------------------------------
#         # STUDENT
#         # ----------------------------------------------------

#         elif role == "STUDENT":
#             student = get_student_from_user(user)

#             if not student:
#                 return ReportCard.objects.none()

#             queryset = (
#                 ReportCard.objects
#                 .select_related(
#                     "student",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#                 .filter(
#                     student=student,
#                     is_published=True,
#                 )
#             )

#         # ----------------------------------------------------
#         # PARENT
#         # ----------------------------------------------------

#         elif role == "PARENT":
#             children = get_parent_children_queryset(user)

#             queryset = (
#                 ReportCard.objects
#                 .select_related(
#                     "student",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#                 .filter(
#                     student__in=children,
#                     is_published=True,
#                 )
#             )

#         else:
#             return ReportCard.objects.none()

#         # ----------------------------------------------------
#         # OPTIONAL FILTERS
#         # ----------------------------------------------------

#         student_id = self.request.query_params.get(
#             "student"
#         )

#         academic_session_id = (
#             self.request.query_params.get(
#                 "academic_session"
#             )
#         )

#         term_id = self.request.query_params.get(
#             "term"
#         )

#         class_level_id = self.request.query_params.get(
#             "class_level"
#         )

#         if student_id:
#             queryset = queryset.filter(
#                 student_id=student_id
#             )

#         if academic_session_id:
#             queryset = queryset.filter(
#                 academic_session_id=academic_session_id
#             )

#         if term_id:
#             queryset = queryset.filter(
#                 term_id=term_id
#             )

#         if class_level_id:
#             queryset = queryset.filter(
#                 class_level_id=class_level_id
#             )

#         return queryset.order_by(
#             "student__user__last_name",
#             "student__user__first_name",
#         )

#     def create(self, request, *args, **kwargs):
#         user = request.user

#         if not (
#             is_full_result_manager(user)
#         ):
#             return Response(
#                 {
#                     "detail": (
#                         "Only Super Admin, School Admin, "
#                         "Principal, or Exam Officer can "
#                         "create report cards."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         serializer = self.get_serializer(
#             data=request.data
#         )

#         serializer.is_valid(
#             raise_exception=True
#         )

#         student = serializer.validated_data[
#             "student"
#         ]

#         school_id = get_user_school_id(user)

#         if (
#             getattr(user, "role", None) != "SUPER_ADMIN"
#             and student.school_id != school_id
#         ):
#             return Response(
#                 {
#                     "detail": (
#                         "You cannot create a report card "
#                         "outside your school."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         report_card = serializer.save()

#         return Response(
#             self.get_serializer(
#                 report_card
#             ).data,
#             status=status.HTTP_201_CREATED,
#         )


# class ReportCardDetailView(
#     generics.RetrieveUpdateDestroyAPIView
# ):
#     serializer_class = ReportCardSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         role = getattr(user, "role", None)

#         # ----------------------------------------------------
#         # SUPER ADMIN
#         # ----------------------------------------------------

#         if role == "SUPER_ADMIN":
#             return (
#                 ReportCard.objects
#                 .select_related(
#                     "student",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#                 .all()
#             )

#         # ----------------------------------------------------
#         # SCHOOL ADMIN / PRINCIPAL / EXAM OFFICER
#         # ----------------------------------------------------

#         if role in {
#             "SCHOOL_ADMIN",
#             "PRINCIPAL",
#             "EXAM_OFFICER",
#         }:
#             school_id = get_user_school_id(user)

#             if not school_id:
#                 return ReportCard.objects.none()

#             return (
#                 ReportCard.objects
#                 .select_related(
#                     "student",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#                 .filter(
#                     class_level__school_id=school_id
#                 )
#             )

#         # ----------------------------------------------------
#         # TEACHER
#         # ----------------------------------------------------

#         if role == "TEACHER":
#             teacher = getattr(
#                 user,
#                 "teacher_profile",
#                 None,
#             )

#             if not teacher:
#                 return ReportCard.objects.none()

#             assigned_classes = (
#                 TeacherSubject.objects
#                 .filter(
#                     teacher=teacher
#                 )
#                 .values_list(
#                     "class_level_id",
#                     flat=True,
#                 )
#             )

#             return (
#                 ReportCard.objects
#                 .select_related(
#                     "student",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#                 .filter(
#                     class_level_id__in=assigned_classes,
#                     class_level__school_id=teacher.school_id,
#                 )
#             )

#         # ----------------------------------------------------
#         # STUDENT
#         # ----------------------------------------------------

#         if role == "STUDENT":
#             student = get_student_from_user(user)

#             if not student:
#                 return ReportCard.objects.none()

#             return (
#                 ReportCard.objects
#                 .select_related(
#                     "student",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#                 .filter(
#                     student=student,
#                     is_published=True,
#                 )
#             )

#         # ----------------------------------------------------
#         # PARENT
#         # ----------------------------------------------------

#         if role == "PARENT":
#             children = get_parent_children_queryset(user)

#             return (
#                 ReportCard.objects
#                 .select_related(
#                     "student",
#                     "academic_session",
#                     "term",
#                     "class_level",
#                 )
#                 .filter(
#                     student__in=children,
#                     is_published=True,
#                 )
#             )

#         return ReportCard.objects.none()

#     def update(self, request, *args, **kwargs):
#         user = request.user

#         if not is_full_result_manager(user):
#             return Response(
#                 {
#                     "detail": (
#                         "Only Super Admin, School Admin, "
#                         "Principal, or Exam Officer can "
#                         "modify report cards."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         report_card = self.get_object()

#         if (
#             getattr(user, "role", None) != "SUPER_ADMIN"
#             and report_card.class_level.school_id
#             != get_user_school_id(user)
#         ):
#             return Response(
#                 {
#                     "detail": (
#                         "You cannot modify a report card "
#                         "outside your school."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         partial = kwargs.pop(
#             "partial",
#             False,
#         )

#         serializer = self.get_serializer(
#             report_card,
#             data=request.data,
#             partial=partial,
#         )

#         serializer.is_valid(
#             raise_exception=True
#         )

#         updated_report_card = serializer.save()

#         # Recalculate scores from actual results.
#         scores = calculate_report_card_scores(
#             student=updated_report_card.student,
#             academic_session=(
#                 updated_report_card.academic_session
#             ),
#             term=updated_report_card.term,
#             class_level=(
#                 updated_report_card.class_level
#             ),
#         )

#         updated_report_card.total_score = (
#             scores["total_score"]
#         )
#         updated_report_card.average_score = (
#             scores["average_score"]
#         )
#         updated_report_card.overall_grade = (
#             scores["overall_grade"]
#         )
#         updated_report_card.attendance_percentage = (
#             scores["attendance_percentage"]
#         )

#         updated_report_card.save()

#         recalculate_class_positions(
#             academic_session=(
#                 updated_report_card.academic_session
#             ),
#             term=updated_report_card.term,
#             class_level=(
#                 updated_report_card.class_level
#             ),
#         )

#         return Response(
#             self.get_serializer(
#                 updated_report_card
#             ).data
#         )

#     def partial_update(self, request, *args, **kwargs):
#         kwargs["partial"] = True

#         return self.update(
#             request,
#             *args,
#             **kwargs,
#         )

#     def destroy(self, request, *args, **kwargs):
#         user = request.user

#         if not is_full_result_manager(user):
#             return Response(
#                 {
#                     "detail": (
#                         "Only Super Admin, School Admin, "
#                         "Principal, or Exam Officer can "
#                         "delete report cards."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         report_card = self.get_object()

#         if (
#             getattr(user, "role", None) != "SUPER_ADMIN"
#             and report_card.class_level.school_id
#             != get_user_school_id(user)
#         ):
#             return Response(
#                 {
#                     "detail": (
#                         "You cannot delete a report card "
#                         "outside your school."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         return super().destroy(
#             request,
#             *args,
#             **kwargs,
#         )


# # ============================================================
# # STUDENT: MY REPORT CARDS
# # ============================================================

# class MyReportCardListView(
#     generics.ListAPIView
# ):
#     serializer_class = ReportCardSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         if getattr(user, "role", None) != "STUDENT":
#             return ReportCard.objects.none()

#         student = get_student_from_user(user)

#         if not student:
#             return ReportCard.objects.none()

#         return (
#             ReportCard.objects
#             .select_related(
#                 "student",
#                 "academic_session",
#                 "term",
#                 "class_level",
#             )
#             .filter(
#                 student=student,
#                 is_published=True,
#             )
#             .order_by(
#                 "-academic_session__start_date",
#                 "-term__start_date",
#             )
#         )


# class MyReportCardDetailView(
#     generics.RetrieveAPIView
# ):
#     serializer_class = ReportCardSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         if getattr(user, "role", None) != "STUDENT":
#             return ReportCard.objects.none()

#         student = get_student_from_user(user)

#         if not student:
#             return ReportCard.objects.none()

#         return (
#             ReportCard.objects
#             .select_related(
#                 "student",
#                 "academic_session",
#                 "term",
#                 "class_level",
#             )
#             .filter(
#                 student=student,
#                 is_published=True,
#             )
#         )




from decimal import Decimal

from django.db.models import Avg, Exists, OuterRef, Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response



from academics.models import AcademicSession, Term, ClassLevel
from students.models import Student
from teachers.models import Teacher, TeacherSubject

from .models import (
    GradeScale,
    StudentResult,
    ReportCard,
)
from .serializers import (
    GradeScaleSerializer,
    StudentResultSerializer,
    ReportCardSerializer,
)


# ============================================================
# ROLE HELPERS
# ============================================================

FULL_RESULT_ROLES = {
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "PRINCIPAL",
    "EXAM_OFFICER",
}


def get_user_school_id(user):
    """
    Returns the school ID associated with the authenticated user.

    Supports the existing project structure where:
        - School Admin has user.school_id
        - Principal/Teacher/etc. may have a related profile
    """

    if getattr(user, "school_id", None):
        return user.school_id

    teacher = getattr(user, "teacher_profile", None)
    if teacher:
        return teacher.school_id

    exam_officer = getattr(user, "exam_officer_profile", None)
    if exam_officer:
        return exam_officer.school_id

    principal = getattr(user, "principal_profile", None)
    if principal:
        return principal.school_id

    student = getattr(user, "student_profile", None)
    if student:
        return getattr(student, "school_id", None)

    parent = getattr(user, "parent_profile", None)
    if parent:
        return getattr(parent, "school_id", None)

    return None


def is_full_result_manager(user):
    """
    Users who can manage results across their school.
    """

    return (
        user.is_authenticated
        and getattr(user, "role", None) in FULL_RESULT_ROLES
    )


def is_teacher(user):
    return (
        user.is_authenticated
        and getattr(user, "role", None) == "TEACHER"
    )


def is_student(user):
    return (
        user.is_authenticated
        and getattr(user, "role", None) == "STUDENT"
    )


def is_parent(user):
    return (
        user.is_authenticated
        and getattr(user, "role", None) == "PARENT"
    )


def teacher_can_access_result(user, result):
    """
    A teacher can access a result only when the teacher is assigned
    to BOTH:

        1. the result's class
        2. the result's subject

    through the existing TeacherSubject model.
    """

    teacher = getattr(user, "teacher_profile", None)

    if not teacher:
        return False

    if teacher.school_id != result.examination_subject.examination.school_id:
        return False

    examination_subject = result.examination_subject
    examination = examination_subject.examination

    return TeacherSubject.objects.filter(
        teacher=teacher,
        subject_id=examination_subject.subject_id,
        class_level_id=examination.class_level_id,
    ).exists()


def get_student_from_user(user):
    """
    Returns the Student profile belonging to the authenticated user.

    The existing project uses user.student_profile.
    """

    return getattr(user, "student_profile", None)


def get_parent_children_queryset(user):
    """
    Returns the students belonging to the authenticated parent.

    The project's parent profile relationship is expected to expose
    the parent's children/students.

    This function supports the common existing relationship names
    without changing any models.
    """

    parent = getattr(user, "parent_profile", None)

    if not parent:
        return Student.objects.none()

    return Student.objects.filter(parents=parent)


def result_school_id(result):
    """
    Gets the school through:

        StudentResult
        -> ExaminationSubject
        -> Examination
        -> School
    """

    return result.examination_subject.examination.school_id


# ============================================================
# RESULT QUERYSET
# ============================================================

def get_result_queryset_for_user(user):
    """
    Central permission-filtered queryset for StudentResult.

    FULL MANAGERS:
        Super Admin
        School Admin
        Principal
        Exam Officer

    TEACHER:
        Only assigned class + assigned subject.

    STUDENT:
        Own published results.

    PARENT:
        Child's published results.
    """

    base_queryset = (
        StudentResult.objects
        .select_related(
            "student",
            "examination_subject",
            "examination_subject__subject",
            "examination_subject__examination",
            "examination_subject__examination__academic_session",
            "examination_subject__examination__term",
            "examination_subject__examination__class_level",
        )
    )

    role = getattr(user, "role", None)

    # --------------------------------------------------------
    # SUPER ADMIN
    # --------------------------------------------------------

    if role == "SUPER_ADMIN":
        return base_queryset

    # --------------------------------------------------------
    # SCHOOL ADMIN / PRINCIPAL / EXAM OFFICER
    # --------------------------------------------------------

    if role in {
        "SCHOOL_ADMIN",
        "PRINCIPAL",
        "EXAM_OFFICER",
    }:
        school_id = get_user_school_id(user)

        if not school_id:
            return StudentResult.objects.none()

        return base_queryset.filter(
            examination_subject__examination__school_id=school_id
        )

    # --------------------------------------------------------
    # TEACHER
    # --------------------------------------------------------

    if role == "TEACHER":
        teacher = getattr(user, "teacher_profile", None)

        if not teacher:
            return StudentResult.objects.none()

        teacher_assignments = TeacherSubject.objects.filter(
            teacher=teacher,
            subject_id=OuterRef("examination_subject__subject_id"),
            class_level_id=OuterRef(
                "examination_subject__examination__class_level_id"
            ),
        )

        return base_queryset.filter(
            examination_subject__examination__school_id=teacher.school_id,
        ).filter(
            Exists(teacher_assignments)
        )

    # --------------------------------------------------------
    # STUDENT
    # --------------------------------------------------------

    if role == "STUDENT":
        student = get_student_from_user(user)

        if not student:
            return StudentResult.objects.none()

        return base_queryset.filter(
            student=student,
            is_published=True,
        )

    # --------------------------------------------------------
    # PARENT
    # --------------------------------------------------------

    if role == "PARENT":
        children = get_parent_children_queryset(user)

        return base_queryset.filter(
            student__in=children,
            is_published=True,
        )

    return StudentResult.objects.none()


# ============================================================
# GRADE SCALE
# ============================================================

class GradeScaleListCreateView(generics.ListCreateAPIView):
    serializer_class = GradeScaleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not is_full_result_manager(user):
            return GradeScale.objects.none()

        return GradeScale.objects.all().order_by(
            "-minimum_score"
        )

    def create(self, request, *args, **kwargs):
        if not is_full_result_manager(request.user):
            return Response(
                {
                    "detail": (
                        "You do not have permission to create "
                        "grading scales."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().create(
            request,
            *args,
            **kwargs,
        )


class GradeScaleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GradeScaleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not is_full_result_manager(user):
            return GradeScale.objects.none()

        return GradeScale.objects.all()

    def update(self, request, *args, **kwargs):
        if not is_full_result_manager(request.user):
            return Response(
                {
                    "detail": (
                        "You do not have permission to modify "
                        "grading scales."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(
            request,
            *args,
            **kwargs,
        )

    def destroy(self, request, *args, **kwargs):
        if not is_full_result_manager(request.user):
            return Response(
                {
                    "detail": (
                        "You do not have permission to delete "
                        "grading scales."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(
            request,
            *args,
            **kwargs,
        )


# ============================================================
# STUDENT RESULT HELPERS
# ============================================================

def get_student_results(
    student,
    academic_session=None,
    term=None,
    class_level=None,
):
    """
    Returns results belonging to one student.

    Optional filters can be supplied for:
        academic session
        term
        class
    """

    queryset = (
        StudentResult.objects
        .select_related(
            "student",
            "examination_subject",
            "examination_subject__subject",
            "examination_subject__examination",
            "examination_subject__examination__academic_session",
            "examination_subject__examination__term",
            "examination_subject__examination__class_level",
        )
        .filter(student=student)
    )

    if academic_session:
        queryset = queryset.filter(
            examination_subject__examination__academic_session=academic_session
        )

    if term:
        queryset = queryset.filter(
            examination_subject__examination__term=term
        )

    if class_level:
        queryset = queryset.filter(
            examination_subject__examination__class_level=class_level
        )

    return queryset


def calculate_attendance_percentage(
    student,
    academic_session,
    term,
):
    """
    Calculates attendance percentage when attendance records exist.

    Keeps the existing project behavior by safely returning 0 when
    attendance data is unavailable.
    """

    try:
        from attendance.models import Attendance

        attendance_queryset = Attendance.objects.filter(
            student=student,
            academic_session=academic_session,
            term=term,
        )

        total_days = attendance_queryset.count()

        if total_days == 0:
            return Decimal("0.00")

        present_days = attendance_queryset.filter(
            status="PRESENT"
        ).count()

        return (
            Decimal(present_days)
            / Decimal(total_days)
            * Decimal("100")
        ).quantize(Decimal("0.01"))

    except Exception:
        return Decimal("0.00")


def calculate_report_card_scores(
    student,
    academic_session,
    term,
    class_level,
):
    results = get_student_results(
        student=student,
        academic_session=academic_session,
        term=term,
        class_level=class_level,
    )

    total_score = sum(
        (
            Decimal(result.total_score or 0)
            for result in results
        ),
        Decimal("0.00"),
    )

    result_count = results.count()

    if result_count:
        average_score = (
            total_score / Decimal(result_count)
        ).quantize(Decimal("0.01"))
    else:
        average_score = Decimal("0.00")

    grade_scale = (
        GradeScale.objects
        .filter(
            minimum_score__lte=average_score,
            maximum_score__gte=average_score,
            is_active=True,
        )
        .order_by("-minimum_score")
        .first()
    )

    if grade_scale:
        overall_grade = grade_scale.grade
    else:
        overall_grade = ""

    attendance_percentage = calculate_attendance_percentage(
        student,
        academic_session,
        term,
    )

    return {
        "total_score": total_score,
        "average_score": average_score,
        "overall_grade": overall_grade,
        "attendance_percentage": attendance_percentage,
    }


def recalculate_class_positions(
    academic_session,
    term,
    class_level,
):
    """
    Recalculates positions based on report-card average scores.
    """

    report_cards = list(
        ReportCard.objects.filter(
            academic_session=academic_session,
            term=term,
            class_level=class_level,
        ).order_by(
            "-average_score",
            "student__last_name",
            "student__first_name",
        )
    )

    previous_score = None
    current_position = 0

    for index, report_card in enumerate(
        report_cards,
        start=1,
    ):
        if (
            previous_score is None
            or report_card.average_score != previous_score
        ):
            current_position = index

        report_card.position = current_position
        previous_score = report_card.average_score

    if report_cards:
        ReportCard.objects.bulk_update(
            report_cards,
            ["position"],
        )


def recalculate_report_card_for_result(result):
    """
    Recalculates the student's report card after a result changes.
    """

    examination = result.examination_subject.examination

    student = result.student
    academic_session = examination.academic_session
    term = examination.term
    class_level = examination.class_level

    scores = calculate_report_card_scores(
        student=student,
        academic_session=academic_session,
        term=term,
        class_level=class_level,
    )

    report_card, _ = ReportCard.objects.get_or_create(
        student=student,
        academic_session=academic_session,
        term=term,
        class_level=class_level,
    )

    report_card.total_score = scores["total_score"]
    report_card.average_score = scores["average_score"]
    report_card.overall_grade = scores["overall_grade"]
    report_card.attendance_percentage = (
        scores["attendance_percentage"]
    )

    report_card.save()

    recalculate_class_positions(
        academic_session=academic_session,
        term=term,
        class_level=class_level,
    )

    return report_card


# ============================================================
# STUDENT RESULTS
# ============================================================

class StudentResultListCreateView(
    generics.ListCreateAPIView
):
    """
    Result access:

    SUPER_ADMIN
        Full access.

    SCHOOL_ADMIN
        Full access within school.

    PRINCIPAL
        Full access within school.

    EXAM_OFFICER
        Full access within school.

    TEACHER
        Only assigned class + assigned subject.

    STUDENT
        Own published results only.

    PARENT
        Child's published results only.
    """

    serializer_class = StudentResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_result_queryset_for_user(
            self.request.user
        )

    def create(self, request, *args, **kwargs):
        user = request.user

        if not (
            is_full_result_manager(user)
            or is_teacher(user)
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission to create "
                        "student results."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        student = serializer.validated_data[
            "student"
        ]

        examination_subject = (
            serializer.validated_data[
                "examination_subject"
            ]
        )

        examination = examination_subject.examination

        # ----------------------------------------------------
        # SCHOOL CHECK
        # ----------------------------------------------------

        school_id = get_user_school_id(user)

        if (
            getattr(user, "role", None) != "SUPER_ADMIN"
            and school_id != examination.school_id
        ):
            return Response(
                {
                    "detail": (
                        "You cannot create a result "
                        "outside your school."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ----------------------------------------------------
        # TEACHER ASSIGNMENT CHECK
        # ----------------------------------------------------

        if is_teacher(user):
            teacher = getattr(
                user,
                "teacher_profile",
                None,
            )

            if not teacher:
                return Response(
                    {
                        "detail": (
                            "Your teacher profile could not "
                            "be found."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            assignment_exists = (
                TeacherSubject.objects.filter(
                    teacher=teacher,
                    subject_id=(
                        examination_subject.subject_id
                    ),
                    class_level_id=(
                        examination.class_level_id
                    ),
                ).exists()
            )

            if not assignment_exists:
                return Response(
                    {
                        "detail": (
                            "You can only enter results for "
                            "subjects and classes assigned "
                            "to you."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # ----------------------------------------------------
        # STUDENT MUST BELONG TO EXAM CLASS
        # ----------------------------------------------------

        student_class_matches = student.enrollments.filter(
            class_level=examination.class_level,
            academic_session=examination.academic_session,
            term=examination.term,
            is_current=True,
        ).exists()

        if not student_class_matches:
            return Response(
                {
                    "detail": (
                        "The selected student is not enrolled "
                        "in this class for the examination "
                        "academic session."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # SAVE RESULT
        # ----------------------------------------------------

        self.perform_create(serializer)

        headers = self.get_success_headers(
            serializer.data
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def perform_create(self, serializer):
        result = serializer.save()

        recalculate_report_card_for_result(
            result
        )


class StudentResultDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = StudentResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_result_queryset_for_user(
            self.request.user
        )

    def retrieve(self, request, *args, **kwargs):
        result = self.get_object()

        return Response(
            self.get_serializer(result).data
        )

    def update(self, request, *args, **kwargs):
        user = request.user
        result = self.get_object()

        # Student and Parent queryset filtering already prevents
        # access to unpublished/unauthorized results.
        if not (
            is_full_result_manager(user)
            or is_teacher(user)
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission to modify "
                        "student results."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ----------------------------------------------------
        # TEACHER ASSIGNMENT CHECK
        # ----------------------------------------------------

        if is_teacher(user):
            if not teacher_can_access_result(
                user,
                result,
            ):
                return Response(
                    {
                        "detail": (
                            "You can only modify results for "
                            "subjects and classes assigned "
                            "to you."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # ----------------------------------------------------
        # SCHOOL CHECK
        # ----------------------------------------------------

        if (
            getattr(user, "role", None) != "SUPER_ADMIN"
            and get_user_school_id(user)
            != result_school_id(result)
        ):
            return Response(
                {
                    "detail": (
                        "You cannot modify a result "
                        "outside your school."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        partial = kwargs.pop(
            "partial",
            False,
        )

        serializer = self.get_serializer(
            result,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        updated_result = serializer.save()

        recalculate_report_card_for_result(
            updated_result
        )

        return Response(
            self.get_serializer(
                updated_result
            ).data
        )

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True

        return self.update(
            request,
            *args,
            **kwargs,
        )

    def destroy(self, request, *args, **kwargs):
        user = request.user
        result = self.get_object()

        if not (
            is_full_result_manager(user)
            or is_teacher(user)
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "delete student results."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if is_teacher(user):
            if not teacher_can_access_result(
                user,
                result,
            ):
                return Response(
                    {
                        "detail": (
                            "You can only delete results for "
                            "subjects and classes assigned "
                            "to you."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        if (
            getattr(user, "role", None) != "SUPER_ADMIN"
            and get_user_school_id(user)
            != result_school_id(result)
        ):
            return Response(
                {
                    "detail": (
                        "You cannot delete a result "
                        "outside your school."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        examination = (
            result.examination_subject.examination
        )

        student = result.student

        response = super().destroy(
            request,
            *args,
            **kwargs,
        )

        # Recalculate after deletion.
        try:
            scores = calculate_report_card_scores(
                student=student,
                academic_session=(
                    examination.academic_session
                ),
                term=examination.term,
                class_level=(
                    examination.class_level
                ),
            )

            report_card = ReportCard.objects.filter(
                student=student,
                academic_session=(
                    examination.academic_session
                ),
                term=examination.term,
                class_level=(
                    examination.class_level
                ),
            ).first()

            if report_card:
                report_card.total_score = (
                    scores["total_score"]
                )
                report_card.average_score = (
                    scores["average_score"]
                )
                report_card.overall_grade = (
                    scores["overall_grade"]
                )
                report_card.attendance_percentage = (
                    scores["attendance_percentage"]
                )
                report_card.save()

                recalculate_class_positions(
                    academic_session=(
                        examination.academic_session
                    ),
                    term=examination.term,
                    class_level=(
                        examination.class_level
                    ),
                )

        except Exception:
            pass

        return response


# ============================================================
# REPORT CARDS
# ============================================================

class ReportCardListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = ReportCardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        role = getattr(user, "role", None)

        # ----------------------------------------------------
        # FULL MANAGERS
        # ----------------------------------------------------

        if role == "SUPER_ADMIN":
            queryset = (
                ReportCard.objects
                .select_related(
                    "student",
                    "academic_session",
                    "term",
                    "class_level",
                )
                .all()
            )

        elif role in {
            "SCHOOL_ADMIN",
            "PRINCIPAL",
            "EXAM_OFFICER",
        }:
            school_id = get_user_school_id(user)

            if not school_id:
                return ReportCard.objects.none()

            queryset = (
                ReportCard.objects
                .select_related(
                    "student",
                    "academic_session",
                    "term",
                    "class_level",
                )
                .filter(
                    class_level__school_id=school_id
                )
            )

        # ----------------------------------------------------
        # TEACHER
        # ----------------------------------------------------

        elif role == "TEACHER":
            teacher = getattr(
                user,
                "teacher_profile",
                None,
            )

            if not teacher:
                return ReportCard.objects.none()

            # A teacher can see report cards for classes where
            # they have at least one subject assignment.
            assigned_classes = (
                TeacherSubject.objects
                .filter(
                    teacher=teacher
                )
                .values_list(
                    "class_level_id",
                    flat=True,
                )
            )

            queryset = (
                ReportCard.objects
                .select_related(
                    "student",
                    "academic_session",
                    "term",
                    "class_level",
                )
                .filter(
                    class_level_id__in=assigned_classes,
                    class_level__school_id=teacher.school_id,
                )
            )

        # ----------------------------------------------------
        # STUDENT
        # ----------------------------------------------------

        elif role == "STUDENT":
            student = get_student_from_user(user)

            if not student:
                return ReportCard.objects.none()

            queryset = (
                ReportCard.objects
                .select_related(
                    "student",
                    "academic_session",
                    "term",
                    "class_level",
                )
                .filter(
                    student=student,
                    is_published=True,
                )
            )

        # ----------------------------------------------------
        # PARENT
        # ----------------------------------------------------

        elif role == "PARENT":
            children = get_parent_children_queryset(user)

            queryset = (
                ReportCard.objects
                .select_related(
                    "student",
                    "academic_session",
                    "term",
                    "class_level",
                )
                .filter(
                    student__in=children,
                    is_published=True,
                )
            )

        else:
            return ReportCard.objects.none()

        # ----------------------------------------------------
        # OPTIONAL FILTERS
        # ----------------------------------------------------

        student_id = self.request.query_params.get(
            "student"
        )

        academic_session_id = (
            self.request.query_params.get(
                "academic_session"
            )
        )

        term_id = self.request.query_params.get(
            "term"
        )

        class_level_id = self.request.query_params.get(
            "class_level"
        )

        if student_id:
            queryset = queryset.filter(
                student_id=student_id
            )

        if academic_session_id:
            queryset = queryset.filter(
                academic_session_id=academic_session_id
            )

        if term_id:
            queryset = queryset.filter(
                term_id=term_id
            )

        if class_level_id:
            queryset = queryset.filter(
                class_level_id=class_level_id
            )

        return queryset.order_by(
            "student__last_name",
            "student__first_name",
        )

    def create(self, request, *args, **kwargs):
        user = request.user

        if not (
            is_full_result_manager(user)
        ):
            return Response(
                {
                    "detail": (
                        "Only Super Admin, School Admin, "
                        "Principal, or Exam Officer can "
                        "create report cards."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        student = serializer.validated_data[
            "student"
        ]

        school_id = get_user_school_id(user)

        if (
            getattr(user, "role", None) != "SUPER_ADMIN"
            and student.school_id != school_id
        ):
            return Response(
                {
                    "detail": (
                        "You cannot create a report card "
                        "outside your school."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        report_card = serializer.save()

        return Response(
            self.get_serializer(
                report_card
            ).data,
            status=status.HTTP_201_CREATED,
        )


class ReportCardDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ReportCardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", None)

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if role == "SUPER_ADMIN":
            return (
                ReportCard.objects
                .select_related(
                    "student",
                    "academic_session",
                    "term",
                    "class_level",
                )
                .all()
            )

        # ----------------------------------------------------
        # SCHOOL ADMIN / PRINCIPAL / EXAM OFFICER
        # ----------------------------------------------------

        if role in {
            "SCHOOL_ADMIN",
            "PRINCIPAL",
            "EXAM_OFFICER",
        }:
            school_id = get_user_school_id(user)

            if not school_id:
                return ReportCard.objects.none()

            return (
                ReportCard.objects
                .select_related(
                    "student",
                    "academic_session",
                    "term",
                    "class_level",
                )
                .filter(
                    class_level__school_id=school_id
                )
            )

        # ----------------------------------------------------
        # TEACHER
        # ----------------------------------------------------

        if role == "TEACHER":
            teacher = getattr(
                user,
                "teacher_profile",
                None,
            )

            if not teacher:
                return ReportCard.objects.none()

            assigned_classes = (
                TeacherSubject.objects
                .filter(
                    teacher=teacher
                )
                .values_list(
                    "class_level_id",
                    flat=True,
                )
            )

            return (
                ReportCard.objects
                .select_related(
                    "student",
                    "academic_session",
                    "term",
                    "class_level",
                )
                .filter(
                    class_level_id__in=assigned_classes,
                    class_level__school_id=teacher.school_id,
                )
            )

        # ----------------------------------------------------
        # STUDENT
        # ----------------------------------------------------

        if role == "STUDENT":
            student = get_student_from_user(user)

            if not student:
                return ReportCard.objects.none()

            return (
                ReportCard.objects
                .select_related(
                    "student",
                    "academic_session",
                    "term",
                    "class_level",
                )
                .filter(
                    student=student,
                    is_published=True,
                )
            )

        # ----------------------------------------------------
        # PARENT
        # ----------------------------------------------------

        if role == "PARENT":
            children = get_parent_children_queryset(user)

            return (
                ReportCard.objects
                .select_related(
                    "student",
                    "academic_session",
                    "term",
                    "class_level",
                )
                .filter(
                    student__in=children,
                    is_published=True,
                )
            )

        return ReportCard.objects.none()

    def update(self, request, *args, **kwargs):
        user = request.user

        if not is_full_result_manager(user):
            return Response(
                {
                    "detail": (
                        "Only Super Admin, School Admin, "
                        "Principal, or Exam Officer can "
                        "modify report cards."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        report_card = self.get_object()

        if (
            getattr(user, "role", None) != "SUPER_ADMIN"
            and report_card.class_level.school_id
            != get_user_school_id(user)
        ):
            return Response(
                {
                    "detail": (
                        "You cannot modify a report card "
                        "outside your school."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        partial = kwargs.pop(
            "partial",
            False,
        )

        serializer = self.get_serializer(
            report_card,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        updated_report_card = serializer.save()

        # Recalculate scores from actual results.
        scores = calculate_report_card_scores(
            student=updated_report_card.student,
            academic_session=(
                updated_report_card.academic_session
            ),
            term=updated_report_card.term,
            class_level=(
                updated_report_card.class_level
            ),
        )

        updated_report_card.total_score = (
            scores["total_score"]
        )
        updated_report_card.average_score = (
            scores["average_score"]
        )
        updated_report_card.overall_grade = (
            scores["overall_grade"]
        )
        updated_report_card.attendance_percentage = (
            scores["attendance_percentage"]
        )

        updated_report_card.save()

        recalculate_class_positions(
            academic_session=(
                updated_report_card.academic_session
            ),
            term=updated_report_card.term,
            class_level=(
                updated_report_card.class_level
            ),
        )

        return Response(
            self.get_serializer(
                updated_report_card
            ).data
        )

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True

        return self.update(
            request,
            *args,
            **kwargs,
        )

    def destroy(self, request, *args, **kwargs):
        user = request.user

        if not is_full_result_manager(user):
            return Response(
                {
                    "detail": (
                        "Only Super Admin, School Admin, "
                        "Principal, or Exam Officer can "
                        "delete report cards."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        report_card = self.get_object()

        if (
            getattr(user, "role", None) != "SUPER_ADMIN"
            and report_card.class_level.school_id
            != get_user_school_id(user)
        ):
            return Response(
                {
                    "detail": (
                        "You cannot delete a report card "
                        "outside your school."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(
            request,
            *args,
            **kwargs,
        )


# ============================================================
# STUDENT: MY REPORT CARDS
# ============================================================

class MyReportCardListView(
    generics.ListAPIView
):
    serializer_class = ReportCardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if getattr(user, "role", None) != "STUDENT":
            return ReportCard.objects.none()

        student = get_student_from_user(user)

        if not student:
            return ReportCard.objects.none()

        return (
            ReportCard.objects
            .select_related(
                "student",
                "academic_session",
                "term",
                "class_level",
            )
            .filter(
                student=student,
                is_published=True,
            )
            .order_by(
                "-academic_session__start_date",
                "-term__start_date",
            )
        )


class MyReportCardDetailView(
    generics.RetrieveAPIView
):
    serializer_class = ReportCardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if getattr(user, "role", None) != "STUDENT":
            return ReportCard.objects.none()

        student = get_student_from_user(user)

        if not student:
            return ReportCard.objects.none()

        return (
            ReportCard.objects
            .select_related(
                "student",
                "academic_session",
                "term",
                "class_level",
            )
            .filter(
                student=student,
                is_published=True,
            )
        )