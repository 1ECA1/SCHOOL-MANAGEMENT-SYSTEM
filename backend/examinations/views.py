# from django.db import transaction

# from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.exceptions import PermissionDenied

# from .models import (
#     ExamOfficerProfile,
#     Examination,
#     ExaminationSubject,
# )

# from .serializers import (
#     ExamOfficerCreateSerializer,
#     ExamOfficerProfileSerializer,
#     ExaminationSerializer,
#     ExaminationSubjectSerializer,
# )


# class ExamOfficerListCreateView(generics.ListCreateAPIView):
#     queryset = ExamOfficerProfile.objects.select_related(
#         "user",
#         "school",
#     )
#     permission_classes = [IsAuthenticated]

#     def get_serializer_class(self):
#         if self.request.method == "POST":
#             return ExamOfficerCreateSerializer

#         return ExamOfficerProfileSerializer

#     @transaction.atomic
#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         exam_officer, username, password = serializer.save()

#         return Response(
#             {
#                 "message": "Exam Officer created successfully.",
#                 "exam_officer": {
#                     "id": exam_officer.id,
#                     "user_id": exam_officer.user.id,
#                     "username": username,
#                     "first_name": exam_officer.user.first_name,
#                     "last_name": exam_officer.user.last_name,
#                     "email": exam_officer.user.email,
#                     "phone_number": exam_officer.user.phone_number,
#                     "employee_number": exam_officer.employee_number,
#                     "school": exam_officer.school.id,
#                     "school_name": exam_officer.school.name,
#                     "employment_date": exam_officer.employment_date,
#                     "is_active": exam_officer.is_active,
#                     "profile_image": (
#                         request.build_absolute_uri(
#                             exam_officer.user.profile_image.url
#                         )
#                         if exam_officer.user.profile_image
#                         else None
#                     ),
#                 },
#                 "credentials": {
#                     "username": username,
#                     "password": password,
#                 },
#             },
#             status=status.HTTP_201_CREATED,
#         )


# class ExamOfficerDetailView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = ExamOfficerProfile.objects.select_related(
#         "user",
#         "school",
#     )
#     permission_classes = [IsAuthenticated]

#     serializer_class = ExamOfficerProfileSerializer


# class ExaminationListCreateView(generics.ListCreateAPIView):
#     serializer_class = ExaminationSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         if not hasattr(user, "exam_officer_profile"):
#             return Examination.objects.none()

#         school = user.exam_officer_profile.school

#         return (
#             Examination.objects
#             .filter(school=school)
#             .select_related(
#                 "school",
#                 "academic_session",
#                 "term",
#                 "class_level",
#             )
#         )

#     def perform_create(self, serializer):
#         user = self.request.user

#         if not hasattr(user, "exam_officer_profile"):
#             raise PermissionDenied(
#                 "You do not have an Exam Officer profile."
#             )

#         school = user.exam_officer_profile.school

#         serializer.save(school=school)


# class ExaminationDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = ExaminationSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         if not hasattr(user, "exam_officer_profile"):
#             return Examination.objects.none()

#         school = user.exam_officer_profile.school

#         return (
#             Examination.objects
#             .filter(school=school)
#             .select_related(
#                 "school",
#                 "academic_session",
#                 "term",
#                 "class_level",
#             )
#         )

#     def perform_update(self, serializer):
#         user = self.request.user

#         if not hasattr(user, "exam_officer_profile"):
#             raise PermissionDenied(
#                 "You do not have an Exam Officer profile."
#             )

#         school = user.exam_officer_profile.school

#         serializer.save(school=school)


# class ExaminationSubjectListCreateView(generics.ListCreateAPIView):
#     serializer_class = ExaminationSubjectSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         if not hasattr(user, "exam_officer_profile"):
#             return ExaminationSubject.objects.none()

#         school = user.exam_officer_profile.school

#         return (
#             ExaminationSubject.objects
#             .filter(examination__school=school)
#             .select_related(
#                 "examination",
#                 "subject",
#             )
#         )

#     def perform_create(self, serializer):
#         user = self.request.user

#         print("===== EXAM OFFICER DEBUG =====")
#         print("USER ID:", user.id)
#         print("USERNAME:", user.username)
#         print("ROLE:", user.role)
#         print(
#             "HAS PROFILE:",
#             hasattr(user, "exam_officer_profile")
#         )

#         if not hasattr(user, "exam_officer_profile"):
#             raise PermissionDenied(
#                 "You do not have an Exam Officer profile."
#             )

#         school = user.exam_officer_profile.school

#         serializer.save(school=school)


# class ExaminationSubjectDetailView(
#     generics.RetrieveUpdateDestroyAPIView
# ):
#     serializer_class = ExaminationSubjectSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         if not hasattr(user, "exam_officer_profile"):
#             return ExaminationSubject.objects.none()

#         school = user.exam_officer_profile.school

#         return (
#             ExaminationSubject.objects
#             .filter(examination__school=school)
#             .select_related(
#                 "examination",
#                 "subject",
#             )
#         )

#     def perform_update(self, serializer):
#         user = self.request.user

#         if not hasattr(user, "exam_officer_profile"):
#             raise PermissionDenied(
#                 "You do not have an Exam Officer profile."
#             )

#         school = user.exam_officer_profile.school

#         examination = serializer.validated_data.get(
#             "examination",
#             serializer.instance.examination,
#         )

#         if examination.school_id != school.id:
#             raise PermissionDenied(
#                 "You cannot move this subject to an examination "
#                 "belonging to another school."
#             )

#         serializer.save()



from django.db import transaction

from django.db.models import Exists, OuterRef
from students.models import StudentEnrollment

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import (
    ExamOfficerProfile,
    Examination,
    ExaminationSubject,
)

from .serializers import (
    ExamOfficerCreateSerializer,
    ExamOfficerProfileSerializer,
    ExaminationSerializer,
    ExaminationSubjectSerializer,
)


# ============================================================
# ROLE HELPERS
# ============================================================

EXAM_MANAGEMENT_ROLES = {
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "EXAM_OFFICER",
}

EXAM_VIEW_ROLES = {
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "EXAM_OFFICER",
    "PRINCIPAL",
    "TEACHER",
    "STUDENT",
    "PARENT",
}


def get_user_school_id(user):
    """
    Resolve the school associated with the authenticated user.

    School Admin:
        user.school_id

    Exam Officer:
        exam_officer_profile.school_id

    Principal:
        principal_profile.school_id

    Teacher:
        teacher_profile.school_id

    Student:
        student_profile.school_id

    Parent:
        parent_profile.school_id

    Super Admin:
        May have a school or may operate across schools.
    """

    if getattr(user, "school_id", None):
        return user.school_id

    profile_names = [
        "exam_officer_profile",
        "principal_profile",
        "teacher_profile",
        "student_profile",
        "parent_profile",
    ]

    for profile_name in profile_names:
        profile = getattr(user, profile_name, None)

        if profile is not None:
            school_id = getattr(
                profile,
                "school_id",
                None,
            )

            if school_id:
                return school_id

    return None


def get_user_role(user):
    return getattr(user, "role", None)


def user_can_manage_examinations(user):
    role = get_user_role(user)

    return role in EXAM_MANAGEMENT_ROLES


def user_can_view_examinations(user):
    role = get_user_role(user)

    return role in EXAM_VIEW_ROLES

def get_exam_queryset_for_user(user):
    """
    Returns the examination queryset visible to the user.

    Super Admin:
        Can see all examinations.

    Parent:
        Can only see published examinations for classes in which
        their children are enrolled for the same academic session,
        term, and class.

    Student:
        Can only see published examinations matching the student's
        current enrollment for the same academic session, term,
        and class.

    Other non-super-admin roles:
        School-scoped.
    """

    queryset = (
        Examination.objects
        .select_related(
            "school",
            "academic_session",
            "term",
            "class_level",
        )
    )

    role = get_user_role(user)

    # ========================================================
    # SUPER ADMIN
    # ========================================================

    if role == "SUPER_ADMIN":
        return queryset

    # ========================================================
    # PARENT
    # ========================================================

    if role == "PARENT":

        parent = getattr(
            user,
            "parent_profile",
            None,
        )

        if not parent:
            return queryset.none()

        children = parent.students.all()

        if not children.exists():
            return queryset.none()

        child_enrollment = StudentEnrollment.objects.filter(
            student_id__in=children.values("id"),
            academic_session_id=OuterRef(
                "academic_session_id"
            ),
            term_id=OuterRef(
                "term_id"
            ),
            class_level_id=OuterRef(
                "class_level_id"
            ),
            is_current=True,
        )

        return (
            queryset
            .filter(
                school_id=parent.school_id,
                is_published=True,
                is_active=True,
            )
            .annotate(
                child_enrolled=Exists(
                    child_enrollment
                )
            )
            .filter(
                child_enrolled=True
            )
        )

    # ========================================================
    # STUDENT
    # ========================================================

    if role == "STUDENT":

        student = getattr(
            user,
            "student_profile",
            None,
        )

        if not student:
            return queryset.none()

        current_enrollment = StudentEnrollment.objects.filter(
            student_id=student.id,
            academic_session_id=OuterRef(
                "academic_session_id"
            ),
            term_id=OuterRef(
                "term_id"
            ),
            class_level_id=OuterRef(
                "class_level_id"
            ),
            is_current=True,
        )

        return (
            queryset
            .filter(
                school_id=student.school_id,
                is_published=True,
                is_active=True,
            )
            .annotate(
                student_enrolled=Exists(
                    current_enrollment
                )
            )
            .filter(
                student_enrolled=True
            )
        )

    # ========================================================
    # ALL OTHER SCHOOL-SCOPED USERS
    # ========================================================

    school_id = get_user_school_id(user)

    if not school_id:
        return queryset.none()

    return queryset.filter(
        school_id=school_id
    )

def get_exam_subject_queryset_for_user(user):
    """
    Returns examination subjects visible to the user.

    Super Admin:
        All examination subjects.

    Parent:
        Only subjects belonging to published and active
        examinations matching their children's enrollment.

    Student:
        Only subjects belonging to published and active
        examinations matching the student's current enrollment.

    Other users:
        Their school only.
    """

    queryset = (
        ExaminationSubject.objects
        .select_related(
            "examination",
            "examination__school",
            "examination__academic_session",
            "examination__term",
            "examination__class_level",
            "subject",
        )
    )

    role = get_user_role(user)

    # ========================================================
    # SUPER ADMIN
    # ========================================================

    if role == "SUPER_ADMIN":
        return queryset

    # ========================================================
    # PARENT
    # ========================================================

    if role == "PARENT":

        parent = getattr(
            user,
            "parent_profile",
            None,
        )

        if not parent:
            return queryset.none()

        children = parent.students.all()

        if not children.exists():
            return queryset.none()

        child_enrollment = StudentEnrollment.objects.filter(
            student_id__in=children.values("id"),
            academic_session_id=OuterRef(
                "examination__academic_session_id"
            ),
            term_id=OuterRef(
                "examination__term_id"
            ),
            class_level_id=OuterRef(
                "examination__class_level_id"
            ),
            is_current=True,
        )

        return (
            queryset
            .filter(
                examination__school_id=parent.school_id,
                examination__is_published=True,
                examination__is_active=True,
            )
            .annotate(
                child_enrolled=Exists(
                    child_enrollment
                )
            )
            .filter(
                child_enrolled=True
            )
        )

    # ========================================================
    # STUDENT
    # ========================================================

    if role == "STUDENT":

        student = getattr(
            user,
            "student_profile",
            None,
        )

        if not student:
            return queryset.none()

        current_enrollment = StudentEnrollment.objects.filter(
            student_id=student.id,
            academic_session_id=OuterRef(
                "examination__academic_session_id"
            ),
            term_id=OuterRef(
                "examination__term_id"
            ),
            class_level_id=OuterRef(
                "examination__class_level_id"
            ),
            is_current=True,
        )

        return (
            queryset
            .filter(
                examination__school_id=student.school_id,
                examination__is_published=True,
                examination__is_active=True,
            )
            .annotate(
                student_enrolled=Exists(
                    current_enrollment
                )
            )
            .filter(
                student_enrolled=True
            )
        )

    # ========================================================
    # ALL OTHER SCHOOL-SCOPED USERS
    # ========================================================

    school_id = get_user_school_id(user)

    if not school_id:
        return queryset.none()

    return queryset.filter(
        examination__school_id=school_id
    )

    
# ============================================================
# EXAM OFFICERS
# ============================================================

class ExamOfficerListCreateView(
    generics.ListCreateAPIView
):
    queryset = ExamOfficerProfile.objects.select_related(
        "user",
        "school",
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_serializer_class(self):

        if self.request.method == "POST":
            return ExamOfficerCreateSerializer

        return ExamOfficerProfileSerializer

    def get_queryset(self):

        user = self.request.user
        role = get_user_role(user)

        queryset = (
            ExamOfficerProfile.objects
            .select_related(
                "user",
                "school",
            )
        )

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if role == "SUPER_ADMIN":
            return queryset

        # ----------------------------------------------------
        # SCHOOL ADMIN
        # ----------------------------------------------------

        if role == "SCHOOL_ADMIN":

            school_id = get_user_school_id(user)

            if not school_id:
                return queryset.none()

            return queryset.filter(
                school_id=school_id
            )

        # ----------------------------------------------------
        # EXAM OFFICER
        # ----------------------------------------------------

        if role == "EXAM_OFFICER":

            school_id = get_user_school_id(user)

            if not school_id:
                return queryset.none()

            return queryset.filter(
                school_id=school_id
            )

        return queryset.none()

    @transaction.atomic
    def create(
        self,
        request,
        *args,
        **kwargs,
    ):

        user = request.user
        role = get_user_role(user)

        if role not in {
            "SUPER_ADMIN",
            "SCHOOL_ADMIN",
        }:

            raise PermissionDenied(
                "You do not have permission to create an Exam Officer."
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        exam_officer, username, password = (
            serializer.save()
        )

        return Response(
            {
                "message": (
                    "Exam Officer created successfully."
                ),
                "exam_officer": {
                    "id": exam_officer.id,
                    "user_id": exam_officer.user.id,
                    "username": username,
                    "first_name": (
                        exam_officer.user.first_name
                    ),
                    "last_name": (
                        exam_officer.user.last_name
                    ),
                    "email": exam_officer.user.email,
                    "phone_number": (
                        exam_officer.user.phone_number
                    ),
                    "employee_number": (
                        exam_officer.employee_number
                    ),
                    "school": exam_officer.school.id,
                    "school_name": (
                        exam_officer.school.name
                    ),
                    "employment_date": (
                        exam_officer.employment_date
                    ),
                    "is_active": (
                        exam_officer.is_active
                    ),
                    "profile_image": (
                        request.build_absolute_uri(
                            exam_officer.user.profile_image.url
                        )
                        if exam_officer.user.profile_image
                        else None
                    ),
                },
                "credentials": {
                    "username": username,
                    "password": password,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class ExamOfficerDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        ExamOfficerProfileSerializer
    )

    def get_queryset(self):

        user = self.request.user
        role = get_user_role(user)

        queryset = (
            ExamOfficerProfile.objects
            .select_related(
                "user",
                "school",
            )
        )

        if role == "SUPER_ADMIN":
            return queryset

        if role in {
            "SCHOOL_ADMIN",
            "EXAM_OFFICER",
        }:

            school_id = get_user_school_id(user)

            if not school_id:
                return queryset.none()

            return queryset.filter(
                school_id=school_id
            )

        return queryset.none()


# ============================================================
# EXAMINATIONS
# ============================================================

class ExaminationListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = ExaminationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not user_can_view_examinations(user):
            return Examination.objects.none()

        return get_exam_queryset_for_user(
            user
        )

    def perform_create(
        self,
        serializer,
    ):

        user = self.request.user

        if not user_can_manage_examinations(
            user
        ):

            raise PermissionDenied(
                "You do not have permission to manage examinations."
            )

        role = get_user_role(user)

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if role == "SUPER_ADMIN":

            school_id = (
                serializer.validated_data
                .get("school")
            )

            if not school_id:

                raise PermissionDenied(
                    "A school must be selected when creating an examination."
                )

            serializer.save(
                school=school_id
            )

            return

        # ----------------------------------------------------
        # SCHOOL ADMIN / EXAM OFFICER
        # ----------------------------------------------------

        school_id = get_user_school_id(
            user
        )

        if not school_id:

            raise PermissionDenied(
                "Your account is not linked to a school."
            )

        serializer.save(
            school_id=school_id
        )


class ExaminationDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = ExaminationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not user_can_view_examinations(
            user
        ):
            return Examination.objects.none()

        return get_exam_queryset_for_user(
            user
        )

    def perform_update(
        self,
        serializer,
    ):

        user = self.request.user

        if not user_can_manage_examinations(
            user
        ):

            raise PermissionDenied(
                "You do not have permission to modify examinations."
            )

        role = get_user_role(user)

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if role == "SUPER_ADMIN":

            serializer.save()

            return

        # ----------------------------------------------------
        # SCHOOL ADMIN / EXAM OFFICER
        # ----------------------------------------------------

        school_id = get_user_school_id(
            user
        )

        if not school_id:

            raise PermissionDenied(
                "Your account is not linked to a school."
            )

        serializer.save(
            school_id=school_id
        )

    def perform_destroy(
        self,
        instance,
    ):

        user = self.request.user

        if not user_can_manage_examinations(
            user
        ):

            raise PermissionDenied(
                "You do not have permission to delete examinations."
            )

        instance.delete()


# ============================================================
# EXAMINATION SUBJECTS
# ============================================================

class ExaminationSubjectListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = (
        ExaminationSubjectSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not user_can_view_examinations(
            user
        ):

            return ExaminationSubject.objects.none()

        return get_exam_subject_queryset_for_user(
            user
        )

    def perform_create(
        self,
        serializer,
    ):

        user = self.request.user

        if not user_can_manage_examinations(
            user
        ):

            raise PermissionDenied(
                "You do not have permission to manage examination subjects."
            )

        examination = (
            serializer.validated_data
            .get("examination")
        )

        if not examination:

            raise PermissionDenied(
                "An examination is required."
            )

        role = get_user_role(user)

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if role == "SUPER_ADMIN":

            serializer.save()

            return

        # ----------------------------------------------------
        # SCHOOL ADMIN / EXAM OFFICER
        # ----------------------------------------------------

        school_id = get_user_school_id(
            user
        )

        if not school_id:

            raise PermissionDenied(
                "Your account is not linked to a school."
            )

        if examination.school_id != school_id:

            raise PermissionDenied(
                "You cannot add a subject to an examination "
                "belonging to another school."
            )

        serializer.save()


class ExaminationSubjectDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = (
        ExaminationSubjectSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not user_can_view_examinations(
            user
        ):

            return ExaminationSubject.objects.none()

        return get_exam_subject_queryset_for_user(
            user
        )

    def perform_update(
        self,
        serializer,
    ):

        user = self.request.user

        if not user_can_manage_examinations(
            user
        ):

            raise PermissionDenied(
                "You do not have permission to modify "
                "examination subjects."
            )

        examination = (
            serializer.validated_data.get(
                "examination",
                serializer.instance.examination,
            )
        )

        role = get_user_role(user)

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if role == "SUPER_ADMIN":

            serializer.save()

            return

        # ----------------------------------------------------
        # SCHOOL ADMIN / EXAM OFFICER
        # ----------------------------------------------------

        school_id = get_user_school_id(
            user
        )

        if not school_id:

            raise PermissionDenied(
                "Your account is not linked to a school."
            )

        if examination.school_id != school_id:

            raise PermissionDenied(
                "You cannot move this subject to an "
                "examination belonging to another school."
            )

        serializer.save()

    def perform_destroy(
        self,
        instance,
    ):

        user = self.request.user

        if not user_can_manage_examinations(
            user
        ):

            raise PermissionDenied(
                "You do not have permission to delete "
                "examination subjects."
            )

        instance.delete()