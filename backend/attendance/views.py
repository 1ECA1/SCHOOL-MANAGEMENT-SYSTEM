# from django.db.models import Count, Q

# from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response

# from students.models import Student

# from .models import (
#     AttendanceRecord,
#     SchoolAttendanceSetting,
# )

# from .serializers import (
#     AttendanceRecordSerializer,
#     AttendanceSummarySerializer,
#     SchoolAttendanceSettingSerializer,
# )


# # ============================================================
# # SCHOOL ATTENDANCE SETTINGS
# # ============================================================

# class SchoolAttendanceSettingListCreateView(
#     generics.ListCreateAPIView
# ):
#     """
#     List and create school-wide attendance settings.
#     """

#     queryset = SchoolAttendanceSetting.objects.select_related(
#         "school",
#         "academic_session",
#         "term",
#     )

#     serializer_class = SchoolAttendanceSettingSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]


# class SchoolAttendanceSettingDetailView(
#     generics.RetrieveUpdateDestroyAPIView
# ):
#     """
#     Retrieve, update or delete a school-wide attendance setting.
#     """

#     queryset = SchoolAttendanceSetting.objects.select_related(
#         "school",
#         "academic_session",
#         "term",
#     )

#     serializer_class = SchoolAttendanceSettingSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]


# # ============================================================
# # ATTENDANCE RECORDS
# # ============================================================

# class AttendanceRecordListCreateView(
#     generics.ListCreateAPIView
# ):

#     serializer_class = AttendanceRecordSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]

#     def get_queryset(self):

#         queryset = AttendanceRecord.objects.select_related(
#             "school",
#             "student",
#             "academic_session",
#             "term",
#             "class_level",
#             "subject",
#         )

#         class_level = self.request.query_params.get(
#             "class_level"
#         )

#         academic_session = self.request.query_params.get(
#             "academic_session"
#         )

#         term = self.request.query_params.get(
#             "term"
#         )

#         student = self.request.query_params.get(
#             "student"
#         )

#         date = self.request.query_params.get(
#             "date"
#         )

#         subject = self.request.query_params.get(
#             "subject"
#         )

#         if class_level:
#             queryset = queryset.filter(
#                 class_level_id=class_level
#             )

#         if academic_session:
#             queryset = queryset.filter(
#                 academic_session_id=academic_session
#             )

#         if term:
#             queryset = queryset.filter(
#                 term_id=term
#             )

#         if student:
#             queryset = queryset.filter(
#                 student_id=student
#             )

#         if date:
#             queryset = queryset.filter(
#                 date=date
#             )

#         if subject:
#             queryset = queryset.filter(
#                 subject_id=subject
#             )

#         return queryset

#     # --------------------------------------------------------
#     # CREATE ATTENDANCE
#     # --------------------------------------------------------

#     def perform_create(self, serializer):
#         """
#         Automatically assign the school from the selected student.

#         The frontend does NOT need to send the school ID.
#         """

#         student = serializer.validated_data[
#             "student"
#         ]

#         serializer.save(
#             school=student.school
#         )


# # ============================================================
# # ATTENDANCE RECORD DETAIL
# # ============================================================

# class AttendanceRecordDetailView(
#     generics.RetrieveUpdateDestroyAPIView
# ):

#     queryset = AttendanceRecord.objects.select_related(
#         "school",
#         "student",
#         "academic_session",
#         "term",
#         "class_level",
#         "subject",
#     )

#     serializer_class = AttendanceRecordSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]


# # ============================================================
# # ATTENDANCE SUMMARY
# # ============================================================

# class AttendanceSummaryView(
#     generics.GenericAPIView
# ):

#     permission_classes = [
#         IsAuthenticated
#     ]

#     serializer_class = AttendanceSummarySerializer

#     def get(
#         self,
#         request,
#         student_id,
#         academic_session_id,
#         term_id,
#         class_level_id,
#     ):

#         # --------------------------------------------------------
#         # GET STUDENT
#         # --------------------------------------------------------
#         #
#         # We get the school directly from the student.
#         #
#         # This is better than getting the school from attendance
#         # records because the student may have no attendance
#         # records yet.
#         #

#         try:

#             student = Student.objects.select_related(
#                 "school"
#             ).get(
#                 pk=student_id
#             )

#         except Student.DoesNotExist:

#             return Response(
#                 {
#                     "detail": "Student not found."
#                 },
#                 status=404,
#             )

#         school_id = student.school_id

#         # --------------------------------------------------------
#         # GET ATTENDANCE RECORDS
#         # --------------------------------------------------------

#         records = AttendanceRecord.objects.filter(
#             student_id=student_id,
#             academic_session_id=academic_session_id,
#             term_id=term_id,
#             class_level_id=class_level_id,
#         )

#         # --------------------------------------------------------
#         # GET SCHOOL OPENING SETTING
#         # --------------------------------------------------------

#         attendance_setting = (
#             SchoolAttendanceSetting.objects.filter(
#                 school_id=school_id,
#                 academic_session_id=academic_session_id,
#                 term_id=term_id,
#             )
#             .first()
#         )

#         # --------------------------------------------------------
#         # NUMBER OF TIMES SCHOOL OPENED
#         # --------------------------------------------------------

#         if attendance_setting:

#             times_school_opened = (
#                 attendance_setting.times_school_opened
#             )

#         else:

#             times_school_opened = 0

#         # --------------------------------------------------------
#         # DAILY ATTENDANCE
#         # --------------------------------------------------------
#         #
#         # IMPORTANT:
#         #
#         # AttendanceRecord can contain multiple records for the
#         # same student and same date because attendance may be
#         # recorded by subject.
#         #
#         # Example:
#         #
#         # 01/09 Mathematics = PRESENT
#         # 01/09 English     = PRESENT
#         # 01/09 Biology     = PRESENT
#         #
#         # This must count as ONE attendance day.
#         #
#         # We therefore group attendance by DATE.
#         #

#         daily_statuses = {}

#         for record in records:

#             date = record.date
#             status = record.status

#             # First record for this date
#             if date not in daily_statuses:

#                 daily_statuses[date] = status

#                 continue

#             current_status = daily_statuses[date]

#             # ----------------------------------------------------
#             # PRIORITY
#             # ----------------------------------------------------
#             #
#             # PRESENT has the highest priority.
#             # LATE comes next.
#             # EXCUSED comes next.
#             # ABSENT is lowest.
#             #
#             # This prevents multiple subject records from
#             # counting the same date more than once.
#             #

#             if status == AttendanceRecord.Status.PRESENT:

#                 daily_statuses[date] = (
#                     AttendanceRecord.Status.PRESENT
#                 )

#             elif (
#                 status == AttendanceRecord.Status.LATE
#                 and current_status
#                 != AttendanceRecord.Status.PRESENT
#             ):

#                 daily_statuses[date] = (
#                     AttendanceRecord.Status.LATE
#                 )

#             elif (
#                 status == AttendanceRecord.Status.EXCUSED
#                 and current_status not in [
#                     AttendanceRecord.Status.PRESENT,
#                     AttendanceRecord.Status.LATE,
#                 ]
#             ):

#                 daily_statuses[date] = (
#                     AttendanceRecord.Status.EXCUSED
#                 )

#         # --------------------------------------------------------
#         # STATUS COUNTS
#         # --------------------------------------------------------

#         present_days = 0
#         absent_days = 0
#         late_days = 0
#         excused_days = 0

#         for status in daily_statuses.values():

#             if status == AttendanceRecord.Status.PRESENT:

#                 present_days += 1

#             elif status == AttendanceRecord.Status.ABSENT:

#                 absent_days += 1

#             elif status == AttendanceRecord.Status.LATE:

#                 late_days += 1

#             elif status == AttendanceRecord.Status.EXCUSED:

#                 excused_days += 1

#         # --------------------------------------------------------
#         # ATTENDANCE PERCENTAGE
#         # --------------------------------------------------------
#         #
#         # PRESENT + LATE = ATTENDED
#         #
#         # The denominator is the number of times the school
#         # opened, entered by the administrator.
#         #

#         attended_days = (
#             present_days
#             + late_days
#         )

#         if times_school_opened > 0:

#             attendance_percentage = round(
#                 (
#                     attended_days
#                     / times_school_opened
#                 ) * 100,
#                 2,
#             )

#             # Prevent percentage from going above 100%.
#             if attendance_percentage > 100:

#                 attendance_percentage = 100

#         else:

#             attendance_percentage = 0

#         # --------------------------------------------------------
#         # RESPONSE DATA
#         # --------------------------------------------------------

#         data = {

#             "student":
#                 student_id,

#             "academic_session":
#                 academic_session_id,

#             "term":
#                 term_id,

#             "class_level":
#                 class_level_id,

#             "times_school_opened":
#                 times_school_opened,

#             "total_days":
#                 times_school_opened,

#             "present_days":
#                 present_days,

#             "absent_days":
#                 absent_days,

#             "late_days":
#                 late_days,

#             "excused_days":
#                 excused_days,

#             "attendance_percentage":
#                 attendance_percentage,
#         }

#         serializer = self.get_serializer(
#             data=data
#         )

#         serializer.is_valid(
#             raise_exception=True
#         )

#         return Response(
#             serializer.validated_data
#         )






from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from students.models import StudentEnrollment

from teachers.models import (
    Teacher,
    TeacherSubject,
    ClassTeacher,
)

from .models import (
    AttendanceRecord,
    SchoolAttendanceSetting,
)

from .serializers import (
    AttendanceRecordSerializer,
    AttendanceSummarySerializer,
    SchoolAttendanceSettingSerializer,
)


# ============================================================
# ROLE DEFINITIONS
# ============================================================

ATTENDANCE_MANAGEMENT_ROLES = {
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "PRINCIPAL",
    "TEACHER",
    "EXAM_OFFICER",
}


# ============================================================
# BASIC ROLE HELPERS
# ============================================================

def get_user_role(user):
    """
    Safely return the user's role.
    """
    return getattr(user, "role", None)


def is_super_admin(user):
    return get_user_role(user) == "SUPER_ADMIN"


def can_manage_attendance(user):
    """
    Users allowed to create/update/delete attendance.
    """
    return (
        user.is_authenticated
        and user.is_active
        and get_user_role(user) in ATTENDANCE_MANAGEMENT_ROLES
    )


def can_view_attendance(user):
    """
    All authenticated active users can view attendance.

    More restrictive object/queryset scoping is applied
    separately below for students, parents, teachers,
    and school-scoped users.
    """
    return (
        user.is_authenticated
        and user.is_active
    )


def get_user_school_id(user):
    """
    SUPER_ADMIN is not restricted to one school.

    Every other role is school-scoped through User.school.
    """
    if is_super_admin(user):
        return None

    return getattr(user, "school_id", None)


# ============================================================
# TEACHER ATTENDANCE HELPERS
# ============================================================

def get_teacher_profile(user):
    try:
        return user.teacher_profile
    except Teacher.DoesNotExist:
        return None


def get_teacher_subject_class_ids(teacher, subject_id):
    """
    Return all class levels where this teacher is assigned
    to teach the selected subject.
    """

    return list(
        TeacherSubject.objects.filter(
            teacher=teacher,
            subject_id=subject_id,
        ).values_list(
            "class_level_id",
            flat=True,
        )
    )


def teacher_can_manage_record(user, record):
    """
    Check whether a teacher is allowed to modify/delete
    a specific attendance record.
    """

    teacher = get_teacher_profile(user)

    if not teacher:
        return False

    # Teacher must belong to the same school as the record.
    if teacher.school_id != record.school_id:
        return False

    # --------------------------------------------------------
    # SUBJECT ATTENDANCE
    # --------------------------------------------------------

    if record.subject_id:
        return TeacherSubject.objects.filter(
            teacher=teacher,
            subject_id=record.subject_id,
            class_level_id=record.class_level_id,
        ).exists()

    # --------------------------------------------------------
    # GENERAL / CLASS ATTENDANCE
    # --------------------------------------------------------

    return ClassTeacher.objects.filter(
        teacher=teacher,
        class_level_id=record.class_level_id,
        academic_session_id=record.academic_session_id,
        is_active=True,
    ).exists()


def teacher_can_manage_class_attendance(
    user,
    *,
    class_level_id,
    academic_session_id,
):
    """
    Class attendance is controlled by ClassTeacher.

    A teacher must be the active class teacher for the
    selected class in the selected academic session.
    """

    teacher = get_teacher_profile(user)

    if not teacher:
        return False

    return ClassTeacher.objects.filter(
        teacher=teacher,
        class_level_id=class_level_id,
        academic_session_id=academic_session_id,
        is_active=True,
    ).exists()


def teacher_can_manage_subject_attendance(
    user,
    *,
    subject_id,
    class_level_id,
):
    """
    Subject attendance is controlled by TeacherSubject.

    The teacher must be assigned to teach the selected
    subject for the student's actual class.
    """

    teacher = get_teacher_profile(user)

    if not teacher:
        return False

    return TeacherSubject.objects.filter(
        teacher=teacher,
        subject_id=subject_id,
        class_level_id=class_level_id,
    ).exists()


def teacher_can_access_class(
    user,
    *,
    class_level_id,
    academic_session_id,
):
    """
    Allows a teacher to VIEW attendance for a class if:

    1. They are the active class teacher, OR
    2. They teach a subject in that class.
    """

    teacher = get_teacher_profile(user)

    if not teacher:
        return False

    # --------------------------------------------------------
    # CLASS TEACHER
    # --------------------------------------------------------

    class_teacher_exists = (
        ClassTeacher.objects.filter(
            teacher=teacher,
            class_level_id=class_level_id,
            academic_session_id=academic_session_id,
            is_active=True,
        ).exists()
    )

    # --------------------------------------------------------
    # SUBJECT TEACHER
    # --------------------------------------------------------

    subject_teacher_exists = (
        TeacherSubject.objects.filter(
            teacher=teacher,
            class_level_id=class_level_id,
        ).exists()
    )

    return (
        class_teacher_exists
        or subject_teacher_exists
    )

# ============================================================
# SCHOOL ATTENDANCE SETTINGS
# ============================================================

class SchoolAttendanceSettingListCreateView(
    generics.ListCreateAPIView
):
    """
    Attendance settings.

    VIEW:
        All authenticated active users.

    CREATE:
        SUPER_ADMIN
        SCHOOL_ADMIN
        PRINCIPAL
        TEACHER
        EXAM_OFFICER

    School restrictions:
        SUPER_ADMIN -> all schools
        Others -> own school

    Teachers may manage attendance settings because they are
    attendance management roles, but they are still restricted
    to their own school.
    """

    serializer_class = SchoolAttendanceSettingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not can_view_attendance(user):
            return SchoolAttendanceSetting.objects.none()

        queryset = SchoolAttendanceSetting.objects.select_related(
            "school",
            "academic_session",
            "term",
        ).all()

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if is_super_admin(user):
            school_id = self.request.query_params.get("school")

            if school_id:
                queryset = queryset.filter(
                    school_id=school_id
                )

            return queryset

        # ----------------------------------------------------
        # SCHOOL-SCOPED USERS
        # ----------------------------------------------------

        school_id = get_user_school_id(user)

        if not school_id:
            return SchoolAttendanceSetting.objects.none()

        return queryset.filter(
            school_id=school_id
        )

    def create(self, request, *args, **kwargs):

        if not can_manage_attendance(request.user):
            raise PermissionDenied(
                "You do not have permission to manage "
                "attendance settings."
            )

        data = request.data.copy()

        school_id = data.get("school")

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if is_super_admin(request.user):

            if not school_id:
                raise ValidationError({
                    "school": (
                        "School is required for "
                        "Super Admin."
                    )
                })

        # ----------------------------------------------------
        # SCHOOL-SCOPED USER
        # ----------------------------------------------------

        else:

            user_school_id = get_user_school_id(
                request.user
            )

            if not user_school_id:
                raise PermissionDenied(
                    "Your account is not linked to a school."
                )

            if school_id and int(school_id) != user_school_id:
                raise PermissionDenied(
                    "You can only manage attendance "
                    "settings for your own school."
                )

            data["school"] = user_school_id

        serializer = self.get_serializer(
            data=data
        )

        serializer.is_valid(
            raise_exception=True
        )

        self.perform_create(serializer)

        headers = self.get_success_headers(
            serializer.data
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class SchoolAttendanceSettingDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Retrieve/update/delete attendance settings.
    """

    serializer_class = SchoolAttendanceSettingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not can_view_attendance(user):
            return SchoolAttendanceSetting.objects.none()

        queryset = SchoolAttendanceSetting.objects.select_related(
            "school",
            "academic_session",
            "term",
        ).all()

        if is_super_admin(user):
            return queryset

        school_id = get_user_school_id(user)

        if not school_id:
            return SchoolAttendanceSetting.objects.none()

        return queryset.filter(
            school_id=school_id
        )

    def update(self, request, *args, **kwargs):

        if not can_manage_attendance(request.user):
            raise PermissionDenied(
                "You do not have permission to modify "
                "attendance settings."
            )

        instance = self.get_object()

        # ----------------------------------------------------
        # SCHOOL RESTRICTION
        # ----------------------------------------------------

        if not is_super_admin(request.user):

            user_school_id = get_user_school_id(
                request.user
            )

            if instance.school_id != user_school_id:
                raise PermissionDenied(
                    "You can only modify attendance settings "
                    "for your own school."
                )

        return super().update(
            request,
            *args,
            **kwargs,
        )

    def destroy(self, request, *args, **kwargs):

        if not can_manage_attendance(request.user):
            raise PermissionDenied(
                "You do not have permission to delete "
                "attendance settings."
            )

        instance = self.get_object()

        if not is_super_admin(request.user):

            user_school_id = get_user_school_id(
                request.user
            )

            if instance.school_id != user_school_id:
                raise PermissionDenied(
                    "You can only delete attendance settings "
                    "for your own school."
                )

        return super().destroy(
            request,
            *args,
            **kwargs,
        )



# ============================================================
# TEACHER ATTENDANCE STUDENTS
# ============================================================

class TeacherAttendanceStudentsView(
    generics.ListAPIView
):
    """
    Return students available to the logged-in teacher
    for attendance recording.

    CLASS ATTENDANCE:

        academic_session
        term
        class_level

        Students are taken from StudentEnrollment.

        Teacher must be the active ClassTeacher.

    SUBJECT ATTENDANCE:

        academic_session
        term
        subject

        The teacher's TeacherSubject assignments determine
        the allowed class levels.

        The teacher does NOT select a class.
    """

    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):

        user = request.user

        if not can_manage_attendance(user):
            raise PermissionDenied(
                "You do not have permission to record "
                "attendance."
            )

        if get_user_role(user) != "TEACHER":
            raise PermissionDenied(
                "This endpoint is for teachers."
            )

        teacher = get_teacher_profile(user)

        if not teacher:
            raise PermissionDenied(
                "Teacher profile not found."
            )

        attendance_type = request.query_params.get(
            "attendance_type"
        )

        academic_session_id = request.query_params.get(
            "academic_session"
        )

        term_id = request.query_params.get(
            "term"
        )

        class_level_id = request.query_params.get(
            "class_level"
        )

        subject_id = request.query_params.get(
            "subject"
        )

        # ====================================================
        # COMMON VALIDATION
        # ====================================================

        if not attendance_type:
            raise ValidationError({
                "attendance_type": (
                    "Attendance type is required. "
                    "Use CLASS or SUBJECT."
                )
            })

        if attendance_type not in {
            "CLASS",
            "SUBJECT",
        }:
            raise ValidationError({
                "attendance_type": (
                    "Attendance type must be CLASS "
                    "or SUBJECT."
                )
            })

        if not academic_session_id:
            raise ValidationError({
                "academic_session": (
                    "Academic session is required."
                )
            })

        if not term_id:
            raise ValidationError({
                "term": "Term is required."
            })

        # ====================================================
        # CLASS ATTENDANCE
        # ====================================================

        if attendance_type == "CLASS":

            if not class_level_id:
                raise ValidationError({
                    "class_level": (
                        "Class level is required for "
                        "class attendance."
                    )
                })

            if subject_id:
                raise ValidationError({
                    "subject": (
                        "Subject must not be supplied "
                        "for class attendance."
                    )
                })

            allowed = teacher_can_manage_class_attendance(
                user,
                class_level_id=class_level_id,
                academic_session_id=academic_session_id,
            )

            if not allowed:
                raise PermissionDenied(
                    "You are not the active class teacher "
                    "for this class and academic session."
                )

            enrollments = (
                StudentEnrollment.objects
                .filter(
                    student__school_id=teacher.school_id,
                    academic_session_id=academic_session_id,
                    term_id=term_id,
                    class_level_id=class_level_id,
                    is_current=True,
                )
                .select_related(
                    "student",
                    "class_level",
                )
                .order_by(
                    "student__last_name",
                    "student__first_name",
                )
            )

        # ====================================================
        # SUBJECT ATTENDANCE
        # ====================================================

        else:

            if not subject_id:
                raise ValidationError({
                    "subject": (
                        "Subject is required for "
                        "subject attendance."
                    )
                })

            if class_level_id:
                raise ValidationError({
                    "class_level": (
                        "Class level must not be supplied "
                        "for subject attendance."
                    )
                })

            allowed_class_ids = (
                get_teacher_subject_class_ids(
                    teacher,
                    subject_id,
                )
            )

            if not allowed_class_ids:
                raise PermissionDenied(
                    "You are not assigned to teach "
                    "this subject."
                )

            enrollments = (
                StudentEnrollment.objects
                .filter(
                    student__school_id=teacher.school_id,
                    academic_session_id=academic_session_id,
                    term_id=term_id,
                    class_level_id__in=allowed_class_ids,
                    is_current=True,
                )
                .select_related(
                    "student",
                    "class_level",
                )
                .order_by(
                    "class_level__name",
                    "student__last_name",
                    "student__first_name",
                )
            )

        # ====================================================
        # RESPONSE
        # ====================================================

        students = []

        for enrollment in enrollments:

            student = enrollment.student

            students.append({
                "id": student.id,
                "student_id": student.id,
                "first_name": student.first_name,
                "middle_name": student.middle_name,
                "last_name": student.last_name,
                "full_name": student.full_name,
                "class_level": enrollment.class_level_id,
                "class_name": enrollment.class_level.name,
                "enrollment_id": enrollment.id,
            })

        return Response(students)



# ============================================================
# ATTENDANCE RECORD LIST / CREATE
# ============================================================

class AttendanceRecordListCreateView(
    generics.ListCreateAPIView
):
    """
    Attendance records.

    VIEW:
        All authenticated active users.

    CREATE:
        SUPER_ADMIN
        SCHOOL_ADMIN
        PRINCIPAL
        TEACHER
        EXAM_OFFICER

    Teacher creation rules:
        - subject provided:
            matching TeacherSubject required.

        - subject omitted:
            active ClassTeacher required.
    """

    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if not can_view_attendance(user):
            return AttendanceRecord.objects.none()

        queryset = AttendanceRecord.objects.select_related(
            "school",
            "student",
            "academic_session",
            "term",
            "class_level",
            "subject",
        ).all()

        role = get_user_role(user)

        # ====================================================
        # SUPER ADMIN
        # ====================================================

        if role == "SUPER_ADMIN":

            school_id = self.request.query_params.get(
                "school"
            )

            if school_id:
                queryset = queryset.filter(
                    school_id=school_id
                )

        # ====================================================
        # STUDENT
        # ====================================================

        elif role == "STUDENT":

            try:
                student = user.student_profile
            except Exception:
                return AttendanceRecord.objects.none()

            queryset = queryset.filter(
                student=student
            )

            # Student cannot override own scope.
            queryset = self._apply_filters(
                queryset,
                allow_student_filter=False,
            )

            return queryset

        # ====================================================
        # PARENT
        # ====================================================

        elif role == "PARENT":

            try:
                parent = user.parent_profile
            except Exception:
                return AttendanceRecord.objects.none()

            queryset = queryset.filter(
                student__parents=parent
            )

            # Parent cannot override children scope.
            queryset = self._apply_filters(
                queryset,
                allow_student_filter=False,
            )

            return queryset

        # ====================================================
        # TEACHER
        # ====================================================

        elif role == "TEACHER":

            teacher = get_teacher_profile(user)

            if not teacher:
                return AttendanceRecord.objects.none()

            queryset = queryset.filter(
                school_id=teacher.school_id
            )

            # --------------------------------------------------------
            # SUBJECT ATTENDANCE
            # --------------------------------------------------------

            subject_assignments = (
                TeacherSubject.objects
                .filter(
                    teacher=teacher
                )
                .values_list(
                    "subject_id",
                    "class_level_id",
                )
            )

            subject_q = Q(pk__in=[])

            for subject_id, class_level_id in subject_assignments:

                subject_q |= Q(
                    subject_id=subject_id,
                    class_level_id=class_level_id,
                )

            # --------------------------------------------------------
            # CLASS ATTENDANCE
            # --------------------------------------------------------

            class_assignments = (
                ClassTeacher.objects
                .filter(
                    teacher=teacher,
                    is_active=True,
                )
                .values(
                    "class_level_id",
                    "academic_session_id",
                )
            )

            class_q = Q(pk__in=[])

            for assignment in class_assignments:

                class_q |= Q(
                    subject__isnull=True,
                    class_level_id=assignment[
                        "class_level_id"
                    ],
                    academic_session_id=assignment[
                        "academic_session_id"
                    ],
                )

            queryset = queryset.filter(
                subject_q | class_q
            )


        # ====================================================
        # ALL OTHER SCHOOL-SCOPED ROLES
        # ====================================================

        else:

            school_id = get_user_school_id(user)

            if not school_id:
                return AttendanceRecord.objects.none()

            queryset = queryset.filter(
                school_id=school_id
            )

        # ====================================================
        # COMMON FILTERS
        # ====================================================

        queryset = self._apply_filters(
            queryset,
            allow_student_filter=role
            not in {"STUDENT", "PARENT"},
        )

        return queryset

    def _apply_filters(
        self,
        queryset,
        allow_student_filter=True,
    ):
        """
        Apply supported attendance query parameters.

        Supported:
            school
            student
            class_level
            academic_session
            term
            subject
            date
            date_from
            date_to
            status
        """

        params = self.request.query_params

        # ----------------------------------------------------
        # SCHOOL
        # ----------------------------------------------------

        school_id = params.get("school")

        if (
            school_id
            and is_super_admin(self.request.user)
        ):
            queryset = queryset.filter(
                school_id=school_id
            )

        # ----------------------------------------------------
        # STUDENT
        # ----------------------------------------------------

        student_id = params.get("student")

        if (
            student_id
            and allow_student_filter
        ):
            queryset = queryset.filter(
                student_id=student_id
            )

        # ----------------------------------------------------
        # CLASS
        # ----------------------------------------------------

        class_level_id = params.get(
            "class_level"
        )

        if class_level_id:
            queryset = queryset.filter(
                class_level_id=class_level_id
            )

        # ----------------------------------------------------
        # ACADEMIC SESSION
        # ----------------------------------------------------

        academic_session_id = params.get(
            "academic_session"
        )

        if academic_session_id:
            queryset = queryset.filter(
                academic_session_id=academic_session_id
            )

        # ----------------------------------------------------
        # TERM
        # ----------------------------------------------------

        term_id = params.get("term")

        if term_id:
            queryset = queryset.filter(
                term_id=term_id
            )

        # ----------------------------------------------------
        # SUBJECT
        # ----------------------------------------------------

        subject_id = params.get("subject")

        if subject_id:
            queryset = queryset.filter(
                subject_id=subject_id
            )

        # ----------------------------------------------------
        # DATE
        # ----------------------------------------------------

        date = params.get("date")

        if date:
            queryset = queryset.filter(
                date=date
            )

        # ----------------------------------------------------
        # DATE FROM
        # ----------------------------------------------------

        date_from = params.get("date_from")

        if date_from:
            queryset = queryset.filter(
                date__gte=date_from
            )

        # ----------------------------------------------------
        # DATE TO
        # ----------------------------------------------------

        date_to = params.get("date_to")

        if date_to:
            queryset = queryset.filter(
                date__lte=date_to
            )

        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        attendance_status = params.get(
            "status"
        )

        if attendance_status:
            queryset = queryset.filter(
                status=attendance_status
            )

        return queryset

    def create(self, request, *args, **kwargs):

        user = request.user

        if not can_manage_attendance(user):
            raise PermissionDenied(
                "You do not have permission to record "
                "attendance."
            )

        data = request.data.copy()

        student_id = data.get("student")

        if not student_id:
            raise ValidationError({
                "student": "Student is required."
            })

        # --------------------------------------------------------
        # GET STUDENT
        # --------------------------------------------------------

        from students.models import Student

        student = get_object_or_404(
            Student,
            pk=student_id,
        )

        # --------------------------------------------------------
        # SCHOOL IS ALWAYS DETERMINED SERVER-SIDE
        # --------------------------------------------------------

        data["school"] = student.school_id

        # --------------------------------------------------------
        # SCHOOL RESTRICTION
        # --------------------------------------------------------

        
        # --------------------------------------------------------
        # SCHOOL RESTRICTION
        # --------------------------------------------------------

        if not is_super_admin(user):

            # Teachers get their school through Teacher profile.
            if get_user_role(user) == "TEACHER":

                teacher = get_teacher_profile(user)

                if not teacher:
                    raise PermissionDenied(
                        "Teacher profile not found."
                    )

                user_school_id = teacher.school_id

            else:
                user_school_id = get_user_school_id(user)

                if not user_school_id:
                    raise PermissionDenied(
                        "Your account is not linked to a school."
                    )

            if student.school_id != user_school_id:
                raise PermissionDenied(
                    "You can only record attendance "
                    "for students in your own school."
                )

        # --------------------------------------------------------
        # TEACHER RESTRICTION
        # --------------------------------------------------------

        if get_user_role(user) == "TEACHER":

            teacher = get_teacher_profile(user)

            if not teacher:
                raise PermissionDenied(
                    "Teacher profile not found."
                )

            academic_session_id = data.get(
                "academic_session"
            )

            term_id = data.get("term")

            subject_id = data.get("subject")

            if not academic_session_id:
                raise ValidationError({
                    "academic_session": (
                        "Academic session is required."
                    )
                })

            if not term_id:
                raise ValidationError({
                    "term": "Term is required."
                })

            # ====================================================
            # SUBJECT ATTENDANCE
            # ====================================================

            if subject_id:

                # -----------------------------------------------
                # Teacher must actually teach this subject.
                # -----------------------------------------------

                allowed_class_ids = (
                    get_teacher_subject_class_ids(
                        teacher,
                        subject_id,
                    )
                )

                if not allowed_class_ids:
                    raise PermissionDenied(
                        "You are not assigned to teach "
                        "this subject."
                    )

                # -----------------------------------------------
                # Find student's current enrollment.
                #
                # The frontend does NOT provide class_level
                # for subject attendance.
                # -----------------------------------------------

                enrollment = (
                    StudentEnrollment.objects
                    .filter(
                        student=student,
                        academic_session_id=academic_session_id,
                        term_id=term_id,
                        class_level_id__in=allowed_class_ids,
                        is_current=True,
                    )
                    .select_related(
                        "class_level",
                    )
                    .first()
                )

                if not enrollment:
                    raise PermissionDenied(
                        "This student is not enrolled in a "
                        "class where you teach this subject "
                        "for the selected academic session "
                        "and term."
                    )

                # -----------------------------------------------
                # Backend determines class_level.
                # -----------------------------------------------

                data["class_level"] = enrollment.class_level_id

            # ====================================================
            # CLASS / GENERAL ATTENDANCE
            # ====================================================

            else:

                class_level_id = data.get(
                    "class_level"
                )

                if not class_level_id:
                    raise ValidationError({
                        "class_level": (
                            "Class level is required for "
                            "class attendance."
                        )
                    })

                allowed = (
                    teacher_can_manage_class_attendance(
                        user,
                        class_level_id=class_level_id,
                        academic_session_id=academic_session_id,
                    )
                )

                if not allowed:
                    raise PermissionDenied(
                        "You are not the active class teacher "
                        "for this class and academic session."
                    )

                # Make absolutely sure class attendance
                # has no subject.
                data["subject"] = None

        # --------------------------------------------------------
        # SERIALIZE
        # --------------------------------------------------------

        serializer = self.get_serializer(
            data=data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save(school_id=student.school_id)

        headers = self.get_success_headers(
            serializer.data
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

# ============================================================
# ATTENDANCE DETAIL
# ============================================================

class AttendanceRecordDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Retrieve/update/delete one attendance record.

    Viewing:
        All authenticated active users subject to scope.

    Modifying:
        Management roles only.

    Teacher modification:
        Teacher must have the appropriate
        TeacherSubject or ClassTeacher assignment.
    """

    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if not can_view_attendance(user):
            return AttendanceRecord.objects.none()

        queryset = AttendanceRecord.objects.select_related(
            "school",
            "student",
            "academic_session",
            "term",
            "class_level",
            "subject",
        ).all()

        role = get_user_role(user)

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if role == "SUPER_ADMIN":
            return queryset

        # ----------------------------------------------------
        # STUDENT
        # ----------------------------------------------------

        if role == "STUDENT":

            try:
                student = user.student_profile
            except Exception:
                return AttendanceRecord.objects.none()

            return queryset.filter(
                student=student
            )

        # ----------------------------------------------------
        # PARENT
        # ----------------------------------------------------

        if role == "PARENT":

            try:
                parent = user.parent_profile
            except Exception:
                return AttendanceRecord.objects.none()

            return queryset.filter(
                student__parents=parent
            )

        # ----------------------------------------------------
        # TEACHER
        # ----------------------------------------------------

        if role == "TEACHER":

            teacher = get_teacher_profile(user)

            if not teacher:
                return AttendanceRecord.objects.none()

            subject_assignments = (
                TeacherSubject.objects.filter(
                    teacher=teacher
                ).values(
                    "subject_id",
                    "class_level_id",
                )
            )

            class_assignments = (
                ClassTeacher.objects.filter(
                    teacher=teacher,
                    is_active=True,
                ).values(
                    "class_level_id",
                    "academic_session_id",
                )
            )

            subject_q = Q(pk__in=[])

            for assignment in subject_assignments:
                subject_q |= Q(
                    subject_id=assignment["subject_id"],
                    class_level_id=assignment[
                        "class_level_id"
                    ],
                )

            class_q = Q(pk__in=[])

            for assignment in class_assignments:
                class_q |= Q(
                    subject__isnull=True,
                    class_level_id=assignment[
                        "class_level_id"
                    ],
                    academic_session_id=assignment[
                        "academic_session_id"
                    ],
                )

            return queryset.filter(
                school_id=teacher.school_id
            ).filter(
                subject_q | class_q
            )

        # ----------------------------------------------------
        # OTHER SCHOOL-SCOPED ROLES
        # ----------------------------------------------------

        school_id = get_user_school_id(user)

        if not school_id:
            return AttendanceRecord.objects.none()

        return queryset.filter(
            school_id=school_id
        )

    def update(self, request, *args, **kwargs):

        user = request.user

        if not can_manage_attendance(user):
            raise PermissionDenied(
                "You do not have permission to modify "
                "attendance."
            )

        instance = self.get_object()

        data = request.data.copy()

        # --------------------------------------------------------
        # SCHOOL CANNOT BE CHANGED
        # --------------------------------------------------------

        data["school"] = instance.school_id

        # --------------------------------------------------------
        # TEACHER RESTRICTION
        # --------------------------------------------------------

        if get_user_role(user) == "TEACHER":

            teacher = get_teacher_profile(user)

            if not teacher:
                raise PermissionDenied(
                    "Teacher profile not found."
                )

            # ----------------------------------------------------
            # Determine resulting values.
            #
            # If a field is not supplied, keep the existing value.
            # ----------------------------------------------------

            academic_session_id = data.get(
                "academic_session",
                instance.academic_session_id,
            )

            term_id = data.get(
                "term",
                instance.term_id,
            )

            subject_id = data.get(
                "subject",
                instance.subject_id,
            )

            student_id = data.get(
                "student",
                instance.student_id,
            )

            # ----------------------------------------------------
            # Convert empty subject to None.
            # ----------------------------------------------------

            if subject_id in ("", None):
                subject_id = None
                data["subject"] = None

            # ====================================================
            # SUBJECT ATTENDANCE
            # ====================================================

            if subject_id:

                # -----------------------------------------------
                # Teacher must teach this subject.
                # -----------------------------------------------

                allowed_class_ids = (
                    get_teacher_subject_class_ids(
                        teacher,
                        subject_id,
                    )
                )

                if not allowed_class_ids:
                    raise PermissionDenied(
                        "You are not assigned to teach "
                        "this subject."
                    )

                # -----------------------------------------------
                # Find the student's current enrollment.
                #
                # Class is determined by enrollment.
                # -----------------------------------------------

                enrollment = (
                    StudentEnrollment.objects
                    .filter(
                        student_id=student_id,
                        academic_session_id=academic_session_id,
                        term_id=term_id,
                        class_level_id__in=allowed_class_ids,
                        is_current=True,
                    )
                    .select_related(
                        "class_level",
                    )
                    .first()
                )

                if not enrollment:
                    raise PermissionDenied(
                        "This student is not enrolled in a "
                        "class where you teach this subject "
                        "for the selected academic session "
                        "and term."
                    )

                # -----------------------------------------------
                # Backend determines class.
                # -----------------------------------------------

                data["class_level"] = (
                    enrollment.class_level_id
                )

            # ====================================================
            # CLASS / GENERAL ATTENDANCE
            # ====================================================

            else:

                class_level_id = data.get(
                    "class_level",
                    instance.class_level_id,
                )

                if not class_level_id:
                    raise ValidationError({
                        "class_level": (
                            "Class level is required for "
                            "class attendance."
                        )
                    })

                allowed = (
                    teacher_can_manage_class_attendance(
                        user,
                        class_level_id=class_level_id,
                        academic_session_id=academic_session_id,
                    )
                )

                if not allowed:
                    raise PermissionDenied(
                        "You are not the active class teacher "
                        "for this class and academic session."
                    )

                data["class_level"] = class_level_id
                data["subject"] = None

        # ========================================================
        # NON-TEACHER SCHOOL RESTRICTION
        # ========================================================

        elif not is_super_admin(user):

            user_school_id = get_user_school_id(user)

            if not user_school_id:
                raise PermissionDenied(
                    "Your account is not linked to a school."
                )

            if instance.school_id != user_school_id:
                raise PermissionDenied(
                    "You can only modify attendance "
                    "for your own school."
                )

        # --------------------------------------------------------
        # SERIALIZE
        # --------------------------------------------------------

        serializer = self.get_serializer(
            instance,
            data=data,
            partial=kwargs.pop(
                "partial",
                False,
            ),
        )

        serializer.is_valid(
            raise_exception=True
        )

        self.perform_update(serializer)

        return Response(
            serializer.data
        )

    def destroy(self, request, *args, **kwargs):

        user = request.user

        if not can_manage_attendance(user):
            raise PermissionDenied(
                "You do not have permission to delete "
                "attendance."
            )

        instance = self.get_object()

        # ----------------------------------------------------
        # TEACHER RESTRICTION
        # ----------------------------------------------------

        if get_user_role(user) == "TEACHER":

            if not teacher_can_manage_record(
                user,
                instance,
            ):
                raise PermissionDenied(
                    "You are not assigned to manage "
                    "this attendance record."
                )

        # ----------------------------------------------------
        # OTHER SCHOOL-SCOPED ROLES
        # ----------------------------------------------------

        elif not is_super_admin(user):

            user_school_id = get_user_school_id(
                user
            )

            if instance.school_id != user_school_id:
                raise PermissionDenied(
                    "You can only delete attendance "
                    "for your own school."
                )

        return super().destroy(
            request,
            *args,
            **kwargs,
        )


# ============================================================
# ATTENDANCE SUMMARY
# ============================================================

class AttendanceSummaryView(
    generics.RetrieveAPIView
):
    """
    Attendance summary for one student/session/term/class.

    URL:
        /attendance/summary/
        <student_id>/
        <academic_session_id>/
        <term_id>/
        <class_level_id>/

    Viewing:
        SUPER_ADMIN -> any student

        STUDENT -> own record only

        PARENT -> own children only

        Other roles -> their school only

        TEACHER -> only if the teacher is connected to
                   the requested class through either
                   TeacherSubject or active ClassTeacher.
    """

    serializer_class = AttendanceSummarySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):

        user = self.request.user

        if not can_view_attendance(user):
            raise PermissionDenied(
                "You do not have permission to view attendance."
            )

        student_id = self.kwargs[
            "student_id"
        ]

        academic_session_id = self.kwargs[
            "academic_session_id"
        ]

        term_id = self.kwargs[
            "term_id"
        ]

        class_level_id = self.kwargs[
            "class_level_id"
        ]

        from students.models import Student

        student = get_object_or_404(
            Student,
            pk=student_id,
        )

        role = get_user_role(user)

        # ====================================================
        # STUDENT
        # ====================================================

        if role == "STUDENT":

            try:
                own_student = user.student_profile
            except Exception:
                raise PermissionDenied(
                    "Student profile not found."
                )

            if own_student.id != student.id:
                raise PermissionDenied(
                    "You can only view your own attendance."
                )

        # ====================================================
        # PARENT
        # ====================================================

        elif role == "PARENT":

            try:
                parent = user.parent_profile
            except Exception:
                raise PermissionDenied(
                    "Parent profile not found."
                )

            if not student.parents.filter(
                id=parent.id
            ).exists():
                raise PermissionDenied(
                    "You can only view attendance "
                    "for your children."
                )

        # ====================================================
        # TEACHER
        # ====================================================

        elif role == "TEACHER":

            teacher = get_teacher_profile(user)

            if not teacher:
                raise PermissionDenied(
                    "Teacher profile not found."
                )

            if student.school_id != teacher.school_id:
                raise PermissionDenied(
                    "You can only view attendance "
                    "for students in your school."
                )

            allowed = teacher_can_access_class(
                user,
                class_level_id=class_level_id,
                academic_session_id=academic_session_id,
            )

            if not allowed:
                raise PermissionDenied(
                    "You are not assigned to this class "
                    "for the selected academic session."
                )

        # ====================================================
        # OTHER SCHOOL-SCOPED ROLES
        # ====================================================

        elif role != "SUPER_ADMIN":

            school_id = get_user_school_id(user)

            if not school_id:
                raise PermissionDenied(
                    "Your account is not linked to a school."
                )

            if student.school_id != school_id:
                raise PermissionDenied(
                    "You can only view attendance "
                    "for your own school."
                )

        # ====================================================
        # VERIFY ENROLLMENT
        # ====================================================

        enrollment = (
            StudentEnrollment.objects.filter(
                student=student,
                academic_session_id=academic_session_id,
                term_id=term_id,
                class_level_id=class_level_id,
                is_current=True,
            )
            .select_related(
                "academic_session",
                "term",
                "class_level",
            )
            .first()
        )

        if not enrollment:
            raise ValidationError(
                "The student is not currently enrolled "
                "in this class for the selected "
                "academic session and term."
            )

        # ====================================================
        # SCHOOL ATTENDANCE SETTING
        # ====================================================

        setting = (
            SchoolAttendanceSetting.objects.filter(
                school_id=student.school_id,
                academic_session_id=academic_session_id,
                term_id=term_id,
            )
            .first()
        )

        times_school_opened = (
            setting.times_school_opened
            if setting
            else 0
        )

        # ====================================================
        # GET ATTENDANCE RECORDS
        # ====================================================

        records = AttendanceRecord.objects.filter(
            student=student,
            school_id=student.school_id,
            academic_session_id=academic_session_id,
            term_id=term_id,
            class_level_id=class_level_id,
        ).order_by(
            "date",
            "id",
        )

        # ====================================================
        # GROUP RECORDS BY DATE
        # ====================================================

        # A student may have multiple subject attendance
        # records on the same day.
        #
        # Therefore one calendar day must count only once
        # toward the summary.
        daily_statuses = {}

        status_priority = {
            AttendanceRecord.Status.PRESENT: 4,
            AttendanceRecord.Status.LATE: 3,
            AttendanceRecord.Status.EXCUSED: 2,
            AttendanceRecord.Status.ABSENT: 1,
        }

        for record in records:

            current_status = daily_statuses.get(
                record.date
            )

            if (
                current_status is None
                or status_priority.get(
                    record.status,
                    0,
                )
                > status_priority.get(
                    current_status,
                    0,
                )
            ):
                daily_statuses[
                    record.date
                ] = record.status

        # ====================================================
        # COUNT DAYS
        # ====================================================

        total_days = len(
            daily_statuses
        )

        present_days = sum(
            1
            for value in daily_statuses.values()
            if value
            == AttendanceRecord.Status.PRESENT
        )

        absent_days = sum(
            1
            for value in daily_statuses.values()
            if value
            == AttendanceRecord.Status.ABSENT
        )

        late_days = sum(
            1
            for value in daily_statuses.values()
            if value
            == AttendanceRecord.Status.LATE
        )

        excused_days = sum(
            1
            for value in daily_statuses.values()
            if value
            == AttendanceRecord.Status.EXCUSED
        )

        # ====================================================
        # ATTENDANCE PERCENTAGE
        # ====================================================

        attended_days = (
            present_days
            + late_days
        )

        if times_school_opened > 0:

            attendance_percentage = (
                attended_days
                / times_school_opened
            ) * 100

            attendance_percentage = min(
                attendance_percentage,
                100,
            )

        else:
            attendance_percentage = 0.0

        # ====================================================
        # RESPONSE
        # ====================================================

        return {
            "student": student.id,
            "academic_session": int(
                academic_session_id
            ),
            "term": int(
                term_id
            ),
            "class_level": int(
                class_level_id
            ),
            "times_school_opened": (
                times_school_opened
            ),
            "total_days": total_days,
            "present_days": present_days,
            "absent_days": absent_days,
            "late_days": late_days,
            "excused_days": excused_days,
            "attendance_percentage": round(
                attendance_percentage,
                2,
            ),
        }