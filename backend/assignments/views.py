# from academics.models import ClassSubject
# from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.exceptions import ValidationError
# from rest_framework_simplejwt.authentication import JWTAuthentication

# from .permissions import IsAssignmentManager

# from students.models import (
#     Student,
#     StudentEnrollment,
# )

# from .models import (
#     Assignment,
#     AssignmentSubmission,
# )

# from .serializers import (
#     AssignmentSerializer,
#     AssignmentSubmissionSerializer,
#     StudentAssignmentSerializer,
#     StudentSubmissionSerializer,
# )

# from .services import (
#     student_can_access_assignment,
#     get_allowed_assignment_subject_ids,
# )


# # ============================================================
# # HELPER
# # ============================================================

# def get_logged_in_student(user):
#     """
#     Get the Student profile linked to the logged-in user.

#     The function receives a Django User object,
#     not a DRF request object.
#     """

#     if not user:
#         return None

#     if not user.is_authenticated:
#         return None

#     try:
#         return user.student_profile

#     except Student.DoesNotExist:
#         return None

#     except AttributeError:
#         return None


# def get_current_student_enrollment(student):
#     """
#     Get the student's current enrollment.

#     This function ONLY reads the existing enrollment.

#     It does not create, update, delete, or modify
#     enrollment records.
#     """

#     if not student:
#         return None

#     return (
#         StudentEnrollment.objects
#         .filter(
#             student=student,
#             is_current=True,
#         )
#         .select_related(
#             "student",
#             "academic_session",
#             "term",
#             "class_level",
#         )
#         .first()
#     )

# # ============================================================
# # ADMIN / TEACHER - ASSIGNMENTS
# # ============================================================

# class AssignmentListCreateView(generics.ListCreateAPIView):
#     """
#     Admin/Teacher:
#     List and create assignments.
#     """

#     authentication_classes = [
#         JWTAuthentication,
#     ]

#     permission_classes = [
#         IsAuthenticated,
#         IsAssignmentManager,
#     ]

#     serializer_class = AssignmentSerializer

#     def get_queryset(self):
#         return (
#             Assignment.objects
#             .select_related(
#                 "school",
#                 "academic_session",
#                 "term",
#                 "class_level",
#                 "subject",
#                 "teacher",
#             )
#             .all()
#             .order_by("-created_at")
#         )

#     def perform_create(self, serializer):
#         serializer.save()


# class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
#     """
#     Admin/Teacher:
#     Retrieve, update, or delete an assignment.
#     """

#     authentication_classes = [
#         JWTAuthentication,
#     ]

#     permission_classes = [
#         IsAuthenticated,
#         IsAssignmentManager,
#     ]

#     serializer_class = AssignmentSerializer

#     def get_queryset(self):
#         return (
#             Assignment.objects
#             .select_related(
#                 "school",
#                 "academic_session",
#                 "term",
#                 "class_level",
#                 "subject",
#                 "teacher",
#             )
#             .all()
#         )


# # ============================================================
# # ADMIN / TEACHER - SUBMISSIONS
# # ============================================================

# class AssignmentSubmissionListCreateView(
#     generics.ListCreateAPIView
# ):
#     """
#     Admin/Teacher:
#     List and create assignment submissions.
#     """

#     authentication_classes = [
#         JWTAuthentication,
#     ]

#     permission_classes = [
#         IsAuthenticated,
#         IsAssignmentManager,
#     ]

#     serializer_class = AssignmentSubmissionSerializer

#     def get_queryset(self):
#         queryset = (
#             AssignmentSubmission.objects
#             .select_related(
#                 "assignment",
#                 "assignment__school",
#                 "assignment__academic_session",
#                 "assignment__term",
#                 "assignment__class_level",
#                 "assignment__subject",
#                 "assignment__teacher",
#                 "student",
#                 "student__user",
#             )
#             .all()
#             .order_by("-submitted_at")
#         )

#         assignment_id = self.request.query_params.get(
#             "assignment"
#         )

#         if assignment_id:
#             queryset = queryset.filter(
#                 assignment_id=assignment_id
#             )

#         return queryset

#     def perform_create(self, serializer):
#         serializer.save()


# class AssignmentSubmissionDetailView(
#     generics.RetrieveUpdateDestroyAPIView
# ):
#     """
#     Admin/Teacher:
#     Retrieve, update, or delete a submission.
#     """

#     authentication_classes = [
#         JWTAuthentication,
#     ]

#     permission_classes = [
#         IsAuthenticated,
#         IsAssignmentManager,
#     ]

#     serializer_class = AssignmentSubmissionSerializer

#     def get_queryset(self):
#         return (
#             AssignmentSubmission.objects
#             .select_related(
#                 "assignment",
#                 "student",
#                 "student__user",
#             )
#             .all()
#         )


# # ============================================================
# # STUDENT - ASSIGNMENTS
# # ============================================================

# class StudentAssignmentListView(generics.ListAPIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]
#     serializer_class = StudentAssignmentSerializer

#     def get_queryset(self):
#         student = get_logged_in_student(
#             self.request.user
#         )

#         if not student:
#             return Assignment.objects.none()

#         if student.status != Student.Status.ACTIVE:
#             return Assignment.objects.none()

#         enrollment = get_current_student_enrollment(
#             student
#         )

#         if not enrollment:
#             return Assignment.objects.none()

#         allowed_subject_ids = (
#             get_allowed_assignment_subject_ids(
#                 enrollment
#             )
#         )

#         if not allowed_subject_ids:
#             return Assignment.objects.none()

#         queryset = (
#             Assignment.objects
#             .filter(
#                 school_id=student.school_id,
#                 academic_session_id=(
#                     enrollment.academic_session_id
#                 ),
#                 term_id=enrollment.term_id,
#                 class_level_id=enrollment.class_level_id,
#                 subject_id__in=allowed_subject_ids,
#                 status=Assignment.Status.PUBLISHED,
#             )
#             .select_related(
#                 "school",
#                 "academic_session",
#                 "term",
#                 "class_level",
#                 "subject",
#                 "teacher",
#                 "teacher__user",
#             )
#             .order_by(
#                 "-created_at",
#                 "-id",
#             )
#         )

#         return queryset


# # ============================================================
# # STUDENT - ASSIGNMENT DETAIL
# # ============================================================

# # ============================================================
# # STUDENT - ASSIGNMENT DETAIL
# # ============================================================

# class StudentAssignmentDetailView(
#     generics.RetrieveAPIView
# ):
#     """
#     Allow a student to retrieve an assignment only if
#     the student is actually entitled to access it.
#     """

#     authentication_classes = [
#         JWTAuthentication,
#     ]

#     permission_classes = [
#         IsAuthenticated,
#     ]

#     serializer_class = StudentAssignmentSerializer

#     def get_queryset(self):

#         student = get_logged_in_student(
#             self.request.user
#         )

#         if not student:
#             return Assignment.objects.none()

#         if student.status != Student.Status.ACTIVE:
#             return Assignment.objects.none()

#         enrollment = get_current_student_enrollment(
#             student
#         )

#         if not enrollment:
#             return Assignment.objects.none()

#         allowed_subject_ids = (
#             get_allowed_assignment_subject_ids(
#                 enrollment
#             )
#         )

#         if not allowed_subject_ids:
#             return Assignment.objects.none()

#         return (
#             Assignment.objects
#             .select_related(
#                 "school",
#                 "academic_session",
#                 "term",
#                 "class_level",
#                 "subject",
#                 "teacher",
#                 "teacher__user",
#             )
#             .filter(
#                 school_id=student.school_id,
#                 academic_session_id=(
#                     enrollment.academic_session_id
#                 ),
#                 term_id=enrollment.term_id,
#                 class_level_id=enrollment.class_level_id,
#                 subject_id__in=allowed_subject_ids,
#                 status=Assignment.Status.PUBLISHED,
#             )
#         )

#     def get_object(self):

#         assignment = super().get_object()

#         student = get_logged_in_student(
#             self.request.user
#         )

#         if not student:
#             raise ValidationError(
#                 "Student profile was not found."
#             )

#         if not student_can_access_assignment(
#             student,
#             assignment,
#         ):
#             raise ValidationError(
#                 "You do not have access to this assignment."
#             )

#         return assignment


# # ============================================================
# # STUDENT - SUBMISSIONS
# # ============================================================

# class StudentSubmissionListCreateView(
#     generics.ListCreateAPIView
# ):
#     """
#     Student:
#     View own submissions and submit assignments.
#     """

#     authentication_classes = [
#         JWTAuthentication,
#     ]

#     permission_classes = [
#         IsAuthenticated,
#     ]

#     serializer_class = StudentSubmissionSerializer

#     def get_queryset(self):
#         student = get_logged_in_student(
#             self.request
#         )

#         if not student:
#             return AssignmentSubmission.objects.none()

#         return (
#             AssignmentSubmission.objects
#             .select_related(
#                 "assignment",
#                 "assignment__subject",
#                 "assignment__class_level",
#                 "student",
#             )
#             .filter(
#                 student=student,
#             )
#             .order_by("-submitted_at")
#         )

#     def perform_create(self, serializer):
#         serializer.save()


# class StudentSubmissionDetailView(
#     generics.RetrieveUpdateAPIView
# ):
#     """
#     Student:
#     View and update only their own submission.
#     """

#     authentication_classes = [
#         JWTAuthentication,
#     ]

#     permission_classes = [
#         IsAuthenticated,
#     ]

#     serializer_class = StudentSubmissionSerializer

#     def get_queryset(self):
#         student = get_logged_in_student(
#             self.request
#         )

#         if not student:
#             return AssignmentSubmission.objects.none()

#         return (
#             AssignmentSubmission.objects
#             .select_related(
#                 "assignment",
#                 "assignment__subject",
#                 "assignment__class_level",
#                 "student",
#             )
#             .filter(
#                 student=student,
#             )
#         )

#     def perform_update(self, serializer):
#         serializer.save()


from rest_framework import generics, permissions
from rest_framework.response import Response

from accounts.models import User
from students.models import ParentGuardian, Student, StudentEnrollment

from .models import Assignment, AssignmentSubmission
from .serializers import ParentAssignmentSerializer

from django.db.models import Q

from academics.models import ClassSubject

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.authentication import JWTAuthentication

from students.models import (
    Student,
    StudentEnrollment,
)

from .models import (
    Assignment,
    AssignmentSubmission,
)

from .permissions import (
    IsAssignmentViewer,
    IsAssignmentManager,
)

from .serializers import (
    AssignmentSerializer,
    AssignmentSubmissionSerializer,
    StudentAssignmentSerializer,
    StudentSubmissionSerializer,
)

from .services import (
    student_can_access_assignment,
    get_allowed_assignment_subject_ids,
)

from teachers.models import (
    Teacher,
    TeacherSubject,
    ClassTeacher,
)


# ============================================================
# HELPERS
# ============================================================

def get_logged_in_student(user):
    if not user:
        return None

    if not user.is_authenticated:
        return None

    try:
        return user.student_profile
    except Student.DoesNotExist:
        return None
    except AttributeError:
        return None


def get_logged_in_teacher(user):
    if not user:
        return None

    if not user.is_authenticated:
        return None

    try:
        return user.teacher_profile
    except Teacher.DoesNotExist:
        return None
    except AttributeError:
        return None


def get_current_student_enrollment(student):
    if not student:
        return None

    return (
        StudentEnrollment.objects
        .filter(
            student=student,
            is_current=True,
        )
        .select_related(
            "student",
            "academic_session",
            "term",
            "class_level",
        )
        .first()
    )


# ============================================================
# ASSIGNMENT QUERYSET
# ============================================================

def get_assignment_queryset_for_user(user):
    """
    Return assignments visible to the current user.
    """

    queryset = (
        Assignment.objects
        .select_related(
            "school",
            "academic_session",
            "term",
            "class_level",
            "subject",
            "teacher",
        )
        .all()
    )

    # --------------------------------------------------------
    # SUPER ADMIN
    # --------------------------------------------------------

    if user.role == user.Role.SUPER_ADMIN:
        return queryset

    # --------------------------------------------------------
    # SCHOOL ADMIN / PRINCIPAL
    # --------------------------------------------------------

    if user.role in {
        user.Role.SCHOOL_ADMIN,
        user.Role.PRINCIPAL,
    }:
        if not user.school_id:
            return Assignment.objects.none()

        return queryset.filter(
            school_id=user.school_id
        )

    # --------------------------------------------------------
    # TEACHER
    # --------------------------------------------------------

    if user.role == user.Role.TEACHER:

        teacher = get_logged_in_teacher(user)

        if not teacher:
            return Assignment.objects.none()

        # ----------------------------------------------------
        # Subject teacher assignments
        # ----------------------------------------------------

        subject_assignments = TeacherSubject.objects.filter(
            teacher=teacher,
        ).values(
            "subject_id",
            "class_level_id",
        )

        # ----------------------------------------------------
        # Class teacher assignments
        # ----------------------------------------------------

        class_teacher_assignments = ClassTeacher.objects.filter(
            teacher=teacher,
            is_active=True,
        ).values(
            "class_level_id",
            "academic_session_id",
        )

        # ----------------------------------------------------
        # Teacher sees:
        #
        # 1. Their own assignments
        # 2. Assignments for subjects/classes they teach
        # 3. Assignments for classes where they are class teacher
        # ----------------------------------------------------

        return queryset.filter(
            school_id=teacher.school_id
        ).filter(
            Q(teacher_id=teacher.id)
            |
            Q(
                subject_id__in=subject_assignments.values(
                    "subject_id"
                ),
                class_level_id__in=subject_assignments.values(
                    "class_level_id"
                ),
            )
            |
            Q(
                class_level_id__in=class_teacher_assignments.values(
                    "class_level_id"
                ),
                academic_session_id__in=class_teacher_assignments.values(
                    "academic_session_id"
                ),
            )
        ).distinct()

    return Assignment.objects.none()


# ============================================================
# ASSIGNMENT LIST / CREATE
# ============================================================

class AssignmentListCreateView(
    generics.ListCreateAPIView
):

    authentication_classes = [JWTAuthentication]
    serializer_class = AssignmentSerializer

    def get_permissions(self):

        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [
                IsAuthenticated(),
                IsAssignmentViewer(),
            ]

        return [
            IsAuthenticated(),
            IsAssignmentManager(),
        ]

    # --------------------------------------------------------
    # QUERYSET
    # --------------------------------------------------------

    def get_queryset(self):

        queryset = get_assignment_queryset_for_user(
            self.request.user
        )

        # ----------------------------------------------------
        # FILTER BY ACADEMIC SESSION
        # ----------------------------------------------------

        academic_session = (
            self.request.query_params.get(
                "academic_session"
            )
        )

        if academic_session:
            queryset = queryset.filter(
                academic_session_id=academic_session
            )

        # ----------------------------------------------------
        # FILTER BY TERM
        # ----------------------------------------------------

        term = self.request.query_params.get("term")

        if term:
            queryset = queryset.filter(
                term_id=term
            )

        # ----------------------------------------------------
        # FILTER BY CLASS
        # ----------------------------------------------------

        class_level = (
            self.request.query_params.get(
                "class_level"
            )
        )

        if class_level:
            queryset = queryset.filter(
                class_level_id=class_level
            )

        # ----------------------------------------------------
        # FILTER BY SUBJECT
        # ----------------------------------------------------

        subject = self.request.query_params.get("subject")

        if subject:
            queryset = queryset.filter(
                subject_id=subject
            )

        # ----------------------------------------------------
        # FILTER BY TEACHER
        # ----------------------------------------------------

        teacher = self.request.query_params.get("teacher")

        if teacher:
            queryset = queryset.filter(
                teacher_id=teacher
            )

        # ----------------------------------------------------
        # FILTER BY STATUS
        # ----------------------------------------------------

        status_value = (
            self.request.query_params.get("status")
        )

        if status_value:
            queryset = queryset.filter(
                status=status_value
            )

        # ----------------------------------------------------
        # SEARCH
        #
        # Searches:
        #   Assignment title
        #   Instructions
        #   Subject name
        #   Teacher name
        # ----------------------------------------------------

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                |
                Q(instructions__icontains=search)
                |
                Q(subject__name__icontains=search)
                |
                Q(teacher__first_name__icontains=search)
                |
                Q(teacher__middle_name__icontains=search)
                |
                Q(teacher__last_name__icontains=search)
            )

        return queryset.order_by(
            "-created_at",
            "-id",
        )

    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    def perform_create(self, serializer):
        serializer.save()


# ============================================================
# ASSIGNMENT DETAIL
# ============================================================

class AssignmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    authentication_classes = [JWTAuthentication]
    serializer_class = AssignmentSerializer

    def get_permissions(self):

        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [
                IsAuthenticated(),
                IsAssignmentViewer(),
            ]

        return [
            IsAuthenticated(),
            IsAssignmentManager(),
        ]

    def get_queryset(self):

        return get_assignment_queryset_for_user(
            self.request.user
        )


# ============================================================
# ASSIGNMENT SUBMISSIONS
# ============================================================

class AssignmentSubmissionListCreateView(
    generics.ListCreateAPIView
):

    authentication_classes = [JWTAuthentication]
    serializer_class = AssignmentSubmissionSerializer

    def get_permissions(self):

        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [
                IsAuthenticated(),
                IsAssignmentViewer(),
            ]

        return [
            IsAuthenticated(),
            IsAssignmentManager(),
        ]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            AssignmentSubmission.objects
            .select_related(
                "assignment",
                "assignment__school",
                "assignment__academic_session",
                "assignment__term",
                "assignment__class_level",
                "assignment__subject",
                "assignment__teacher",
                "student",
                "student__user",
            )
            .all()
        )

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if user.role == user.Role.SUPER_ADMIN:
            pass

        # ----------------------------------------------------
        # SCHOOL ADMIN / PRINCIPAL
        # ----------------------------------------------------

        elif user.role in {
            user.Role.SCHOOL_ADMIN,
            user.Role.PRINCIPAL,
        }:

            if not user.school_id:
                return AssignmentSubmission.objects.none()

            queryset = queryset.filter(
                assignment__school_id=user.school_id
            )

        # ----------------------------------------------------
        # TEACHER
        # ----------------------------------------------------

        elif user.role == user.Role.TEACHER:

            teacher = get_logged_in_teacher(user)

            if not teacher:
                return AssignmentSubmission.objects.none()

            allowed_assignments = (
                get_assignment_queryset_for_user(user)
            )

            queryset = queryset.filter(
                assignment__in=allowed_assignments
            )

        else:
            return AssignmentSubmission.objects.none()

        # ----------------------------------------------------
        # FILTER BY ASSIGNMENT
        # ----------------------------------------------------

        assignment_id = (
            self.request.query_params.get(
                "assignment"
            )
        )

        if assignment_id:
            queryset = queryset.filter(
                assignment_id=assignment_id
            )

        # ----------------------------------------------------
        # FILTER BY STUDENT
        # ----------------------------------------------------

        student_id = (
            self.request.query_params.get(
                "student"
            )
        )

        if student_id:
            queryset = queryset.filter(
                student_id=student_id
            )

        # ----------------------------------------------------
        # FILTER BY STATUS
        # ----------------------------------------------------

        status_value = (
            self.request.query_params.get(
                "status"
            )
        )

        if status_value:
            queryset = queryset.filter(
                status=status_value
            )

        return queryset.order_by(
            "-submitted_at",
            "-id",
        )

    def perform_create(self, serializer):
        serializer.save()


# ============================================================
# ASSIGNMENT SUBMISSION DETAIL
# ============================================================

class AssignmentSubmissionDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    authentication_classes = [JWTAuthentication]
    serializer_class = AssignmentSubmissionSerializer

    def get_permissions(self):

        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [
                IsAuthenticated(),
                IsAssignmentViewer(),
            ]

        return [
            IsAuthenticated(),
            IsAssignmentManager(),
        ]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            AssignmentSubmission.objects
            .select_related(
                "assignment",
                "assignment__school",
                "assignment__academic_session",
                "assignment__term",
                "assignment__class_level",
                "assignment__subject",
                "assignment__teacher",
                "student",
                "student__user",
            )
            .all()
        )

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if user.role == user.Role.SUPER_ADMIN:
            return queryset

        # ----------------------------------------------------
        # SCHOOL ADMIN / PRINCIPAL
        # ----------------------------------------------------

        if user.role in {
            user.Role.SCHOOL_ADMIN,
            user.Role.PRINCIPAL,
        }:

            if not user.school_id:
                return AssignmentSubmission.objects.none()

            return queryset.filter(
                assignment__school_id=user.school_id
            )

        # ----------------------------------------------------
        # TEACHER
        # ----------------------------------------------------

        if user.role == user.Role.TEACHER:

            teacher = get_logged_in_teacher(user)

            if not teacher:
                return AssignmentSubmission.objects.none()

            allowed_assignments = (
                get_assignment_queryset_for_user(user)
            )

            return queryset.filter(
                assignment__in=allowed_assignments
            )

        return AssignmentSubmission.objects.none()


# ============================================================
# STUDENT ASSIGNMENTS
# ============================================================

class StudentAssignmentListView(
    generics.ListAPIView
):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = StudentAssignmentSerializer

    def get_queryset(self):

        student = get_logged_in_student(
            self.request.user
        )

        if not student:
            return Assignment.objects.none()

        if student.status != Student.Status.ACTIVE:
            return Assignment.objects.none()

        enrollment = get_current_student_enrollment(
            student
        )

        if not enrollment:
            return Assignment.objects.none()

        allowed_subject_ids = (
            get_allowed_assignment_subject_ids(
                enrollment
            )
        )

        if not allowed_subject_ids:
            return Assignment.objects.none()

        return (
            Assignment.objects
           .filter(
                school_id=student.school_id,
                academic_session_id=enrollment.academic_session_id,
                term_id=enrollment.term_id,
                class_level_id=enrollment.class_level_id,
                subject_id__in=allowed_subject_ids,
                status=Assignment.Status.PUBLISHED,
            )
            .filter(
                Q(target_type="WHOLE_CLASS")
                |
                Q(
                    target_type="SELECTED_STUDENTS",
                    target_students=student,
                )
            )
            .select_related(
                "school",
                "academic_session",
                "term",
                "class_level",
                "subject",
                "teacher",
                "teacher__user",
            )
            .order_by(
                "-created_at",
                "-id",
            )
        )


# ============================================================
# STUDENT ASSIGNMENT DETAIL
# ============================================================

class StudentAssignmentDetailView(
    generics.RetrieveAPIView
):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = StudentAssignmentSerializer

    def get_queryset(self):

        student = get_logged_in_student(
            self.request.user
        )

        if not student:
            return Assignment.objects.none()

        if student.status != Student.Status.ACTIVE:
            return Assignment.objects.none()

        enrollment = get_current_student_enrollment(
            student
        )

        if not enrollment:
            return Assignment.objects.none()

        allowed_subject_ids = (
            get_allowed_assignment_subject_ids(
                enrollment
            )
        )

        if not allowed_subject_ids:
            return Assignment.objects.none()

        return (
            Assignment.objects
            .select_related(
                "school",
                "academic_session",
                "term",
                "class_level",
                "subject",
                "teacher",
                "teacher__user",
            )
            .filter(
                school_id=student.school_id,
                academic_session_id=(
                    enrollment.academic_session_id
                ),
                term_id=enrollment.term_id,
                class_level_id=enrollment.class_level_id,
                subject_id__in=allowed_subject_ids,
                status=Assignment.Status.PUBLISHED,
            )
            .filter(
                Q(target_type="WHOLE_CLASS")
                |
                Q(
                    target_type="SELECTED_STUDENTS",
                    target_students=student,
                )
            )
        )

    def get_object(self):

        assignment = super().get_object()

        student = get_logged_in_student(
            self.request.user
        )

        if not student:
            raise ValidationError(
                "Student profile was not found."
            )

        if not student_can_access_assignment(
            student,
            assignment,
        ):
            raise ValidationError(
                "You do not have access to this assignment."
            )

        return assignment


# ============================================================
# STUDENT SUBMISSIONS
# ============================================================

class StudentSubmissionListCreateView(
    generics.ListCreateAPIView
):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = StudentSubmissionSerializer

    def get_queryset(self):

        student = get_logged_in_student(
            self.request.user
        )

        if not student:
            return AssignmentSubmission.objects.none()

        return (
            AssignmentSubmission.objects
            .select_related(
                "assignment",
                "assignment__subject",
                "assignment__class_level",
                "assignment__academic_session",
                "assignment__term",
                "student",
            )
            .filter(
                student=student
            )
            .order_by(
                "-submitted_at",
                "-id",
            )
        )

    def perform_create(self, serializer):
        serializer.save()


# ============================================================
# STUDENT SUBMISSION DETAIL
# ============================================================

class StudentSubmissionDetailView(
    generics.RetrieveUpdateAPIView
):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = StudentSubmissionSerializer

    def get_queryset(self):

        student = get_logged_in_student(
            self.request.user
        )

        if not student:
            return AssignmentSubmission.objects.none()

        return (
            AssignmentSubmission.objects
            .select_related(
                "assignment",
                "assignment__subject",
                "assignment__class_level",
                "assignment__academic_session",
                "assignment__term",
                "student",
            )
            .filter(
                student=student
            )
        )

    def perform_update(self, serializer):
        serializer.save()



# ============================================================
# PARENT ASSIGNMENTS
# ============================================================

class ParentAssignmentListView(generics.ListAPIView):
    """
    Returns assignments belonging ONLY to the authenticated
    parent's children.

    Security rules:

    1. The authenticated user must be a PARENT.
    2. The parent profile is obtained from request.user.parent_profile.
    3. Children are obtained from ParentGuardian.students.
    4. A parent cannot request arbitrary student IDs to bypass
       ownership.
    5. WHOLE_CLASS assignments are visible when the assignment
       matches the child's enrollment.
    6. SELECTED_STUDENTS assignments are visible only when the
       child is explicitly included in target_students.
    7. Only PUBLISHED assignments are visible.
    """

    serializer_class = ParentAssignmentSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_parent(self):
        user = self.request.user

        if user.role != User.Role.PARENT:
            return None

        return getattr(
            user,
            "parent_profile",
            None,
        )

    def get_children(self):
        parent = self.get_parent()

        if not parent:
            return Student.objects.none()

        return (
            Student.objects
            .filter(
                parents=parent,
                school_id=parent.school_id,
            )
            .select_related(
                "school",
                "department",
            )
            .prefetch_related(
                "enrollments__academic_session",
                "enrollments__term",
                "enrollments__class_level",
            )
            .distinct()
        )

    def get_queryset(self):
        parent = self.get_parent()

        if not parent:
            return Assignment.objects.none()

        children = self.get_children()

        if not children.exists():
            return Assignment.objects.none()

        # --------------------------------------------------------
        # OPTIONAL FILTERS
        # --------------------------------------------------------

        session_id = self.request.query_params.get(
            "academic_session"
        )

        term_id = self.request.query_params.get(
            "term"
        )

        student_id = self.request.query_params.get(
            "student"
        )

        # --------------------------------------------------------
        # IMPORTANT:
        #
        # If a student filter is supplied, it MUST belong to
        # the authenticated parent.
        # --------------------------------------------------------

        if student_id:

            try:
                student_id = int(student_id)
            except (TypeError, ValueError):
                return Assignment.objects.none()

            children = children.filter(
                id=student_id
            )

            if not children.exists():
                return Assignment.objects.none()

        # --------------------------------------------------------
        # GET VALID CHILD ENROLLMENTS
        # --------------------------------------------------------

        enrollments = (
            StudentEnrollment.objects
            .filter(
                student__in=children,
            )
            .select_related(
                "student",
                "academic_session",
                "term",
                "class_level",
            )
        )

        if session_id:
            enrollments = enrollments.filter(
                academic_session_id=session_id
            )

        if term_id:
            enrollments = enrollments.filter(
                term_id=term_id
            )

        # --------------------------------------------------------
        # BUILD CHILD-SPECIFIC ACCESS CONDITIONS
        # --------------------------------------------------------
        #
        # Each child may be in a different class.
        #
        # We therefore construct conditions based on the actual
        # enrollment records.
        # --------------------------------------------------------

        enrollment_conditions = Q()

        for enrollment in enrollments:

            # ----------------------------------------------------
            # WHOLE CLASS
            # ----------------------------------------------------

            enrollment_conditions |= Q(
                academic_session_id=(
                    enrollment.academic_session_id
                ),
                term_id=enrollment.term_id,
                class_level_id=enrollment.class_level_id,
                target_type=Assignment.TargetType.WHOLE_CLASS,
            )

            # ----------------------------------------------------
            # SELECTED STUDENT
            # ----------------------------------------------------

            enrollment_conditions |= Q(
                academic_session_id=(
                    enrollment.academic_session_id
                ),
                term_id=enrollment.term_id,
                class_level_id=enrollment.class_level_id,
                target_type=(
                    Assignment.TargetType.SELECTED_STUDENTS
                ),
                target_students=enrollment.student_id,
            )

        if not enrollment_conditions:
            return Assignment.objects.none()

        queryset = (
            Assignment.objects
            .filter(
                school_id=parent.school_id,
                status=Assignment.Status.PUBLISHED,
            )
            .filter(
                enrollment_conditions
            )
            .select_related(
                "school",
                "academic_session",
                "term",
                "class_level",
                "subject",
                "teacher",
            )
            .prefetch_related(
                "target_students",
                "submissions",
            )
            .distinct()
        )

        return queryset