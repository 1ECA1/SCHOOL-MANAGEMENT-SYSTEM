# from rest_framework.permissions import BasePermission

# from accounts.models import User
# from .models import School


# # ============================================================
# # ACADEMIC MANAGER
# # ============================================================

# class IsAcademicManager(BasePermission):
#     """
#     Allows authenticated Super Admins and School Admins
#     to manage academic data.

#     SUPER_ADMIN:
#         Can manage academic data for every school.

#     SCHOOL_ADMIN:
#         Can manage academic data only for their assigned school.

#     ACCOUNTANT:
#         Cannot manage academic data.
#     """

#     message = (
#         "You do not have permission to manage academic data."
#     )

#     def has_permission(self, request, view):
#         user = request.user

#         # ---------------------------------------------------------
#         # Authentication
#         # ---------------------------------------------------------
#         if not user or not user.is_authenticated:
#             return False

#         # ---------------------------------------------------------
#         # SUPER ADMIN
#         # ---------------------------------------------------------
#         if user.role == User.Role.SUPER_ADMIN:
#             return True

#         # ---------------------------------------------------------
#         # SCHOOL ADMIN
#         # ---------------------------------------------------------
#         if user.role == User.Role.SCHOOL_ADMIN:
#             return user.school_id is not None

#         # ---------------------------------------------------------
#         # ALL OTHER ROLES
#         # ---------------------------------------------------------
#         return False

#     def has_object_permission(self, request, view, obj):
#         user = request.user

#         # ---------------------------------------------------------
#         # SUPER ADMIN
#         # ---------------------------------------------------------
#         if user.role == User.Role.SUPER_ADMIN:
#             return True

#         # ---------------------------------------------------------
#         # SCHOOL ADMIN
#         # ---------------------------------------------------------
#         if user.role == User.Role.SCHOOL_ADMIN:

#             if not user.school_id:
#                 return False

#             # School object itself
#             if isinstance(obj, School):
#                 return obj.pk == user.school_id

#             # Other academic objects
#             school_id = self.get_school_id(obj)

#             return school_id == user.school_id

#         return False

#     @staticmethod
#     def get_school_id(obj):
#         """
#         Returns the school ID associated with an academic object.

#         Supported objects:

#         AcademicSession
#             → school_id

#         Department
#             → school_id

#         ClassLevel
#             → school_id

#         Subject
#             → school_id

#         AcademicSection
#             → school_id

#         Term
#             → academic_session.school_id

#         ClassSubject
#             → class_level.school_id
#         """

#         # ---------------------------------------------------------
#         # DIRECT SCHOOL RELATIONSHIP
#         # ---------------------------------------------------------
#         if hasattr(obj, "school_id"):
#             return obj.school_id

#         # ---------------------------------------------------------
#         # TERM
#         #
#         # Term → AcademicSession → School
#         # ---------------------------------------------------------
#         if hasattr(obj, "academic_session_id"):
#             if obj.academic_session_id:
#                 return obj.academic_session.school_id

#         # ---------------------------------------------------------
#         # CLASS SUBJECT
#         #
#         # ClassSubject → ClassLevel → School
#         # ---------------------------------------------------------
#         if hasattr(obj, "class_level_id"):
#             if obj.class_level_id:
#                 return obj.class_level.school_id

#         return None


# # ============================================================
# # ACADEMIC VIEWER
# # ============================================================

# # ============================================================
# # ACADEMIC VIEWER
# # ============================================================

# class IsAcademicViewer(BasePermission):
#     """
#     Allows users to READ academic data.

#     SUPER_ADMIN:
#         Can read academic data for every school.

#     SCHOOL_ADMIN:
#         Can read academic data for their assigned school.

#     ACCOUNTANT:
#         Can read academic data for the school assigned to
#         their active AccountantProfile.

#     PRINCIPAL:
#         Can read academic data for their assigned school.

#     ADMISSION_OFFICER:
#         Can read academic data for their assigned school.

#     EXAM_OFFICER:
#         Can read academic data for their assigned school.

#     IMPORTANT:
#         This permission is READ-ONLY.

#         It does NOT give users permission to create,
#         update, or delete academic records.
#     """

#     message = (
#         "You do not have permission to view academic data."
#     )

#     # Roles that can view academic data through user.school_id
#     SCHOOL_SCOPED_VIEW_ROLES = {
#         User.Role.SCHOOL_ADMIN,
#         User.Role.PRINCIPAL,
#         User.Role.ADMISSION_OFFICER,
#         User.Role.EXAM_OFFICER,
#     }

#     def has_permission(self, request, view):
#         user = request.user

#         # ---------------------------------------------------------
#         # Authentication
#         # ---------------------------------------------------------
#         if not user or not user.is_authenticated:
#             return False

#         # ---------------------------------------------------------
#         # SUPER ADMIN
#         # ---------------------------------------------------------
#         if user.role == User.Role.SUPER_ADMIN:
#             return True

#         # ---------------------------------------------------------
#         # SCHOOL-SCOPED ROLES
#         #
#         # School Admin
#         # Principal
#         # Admission Officer
#         # Exam Officer
#         # ---------------------------------------------------------
#         if user.role in self.SCHOOL_SCOPED_VIEW_ROLES:
#             return user.school_id is not None

#         # ---------------------------------------------------------
#         # ACCOUNTANT
#         # ---------------------------------------------------------
#         if user.role == User.Role.ACCOUNTANT:
#             return self.has_active_accountant_profile(user)

#         # ---------------------------------------------------------
#         # ALL OTHER ROLES
#         # ---------------------------------------------------------
#         return False

#     def has_object_permission(self, request, view, obj):
#         user = request.user

#         # ---------------------------------------------------------
#         # SUPER ADMIN
#         # ---------------------------------------------------------
#         if user.role == User.Role.SUPER_ADMIN:
#             return True

#         # ---------------------------------------------------------
#         # SCHOOL-SCOPED ROLES
#         #
#         # SCHOOL_ADMIN
#         # PRINCIPAL
#         # ADMISSION_OFFICER
#         # EXAM_OFFICER
#         # ---------------------------------------------------------
#         if user.role in self.SCHOOL_SCOPED_VIEW_ROLES:

#             if not user.school_id:
#                 return False

#             # School object itself
#             if isinstance(obj, School):
#                 return obj.pk == user.school_id

#             school_id = self.get_school_id(obj)

#             return school_id == user.school_id

#         # ---------------------------------------------------------
#         # ACCOUNTANT
#         # ---------------------------------------------------------
#         if user.role == User.Role.ACCOUNTANT:

#             profile = getattr(
#                 user,
#                 "accountant_profile",
#                 None,
#             )

#             if not profile:
#                 return False

#             if not profile.is_active:
#                 return False

#             if not profile.school_id:
#                 return False

#             # School object itself
#             if isinstance(obj, School):
#                 return obj.pk == profile.school_id

#             school_id = self.get_school_id(obj)

#             return school_id == profile.school_id

#         return False

#     @staticmethod
#     def has_active_accountant_profile(user):
#         """
#         Checks that the accountant has an active AccountantProfile
#         linked to a school.
#         """

#         profile = getattr(
#             user,
#             "accountant_profile",
#             None,
#         )

#         if not profile:
#             return False

#         if not profile.is_active:
#             return False

#         if not profile.school_id:
#             return False

#         return True

#     @staticmethod
#     def get_school_id(obj):
#         """
#         Returns the school ID associated with an academic object.

#         Supported objects:

#         AcademicSession
#             → school_id

#         Department
#             → school_id

#         ClassLevel
#             → school_id

#         Subject
#             → school_id

#         AcademicSection
#             → school_id

#         Term
#             → academic_session.school_id

#         ClassSubject
#             → class_level.school_id
#         """

#         # ---------------------------------------------------------
#         # DIRECT SCHOOL RELATIONSHIP
#         # ---------------------------------------------------------
#         if hasattr(obj, "school_id"):
#             return obj.school_id

#         # ---------------------------------------------------------
#         # TERM
#         #
#         # Term → AcademicSession → School
#         # ---------------------------------------------------------
#         if hasattr(obj, "academic_session_id"):
#             if obj.academic_session_id:
#                 return obj.academic_session.school_id

#         # ---------------------------------------------------------
#         # CLASS SUBJECT
#         #
#         # ClassSubject → ClassLevel → School
#         # ---------------------------------------------------------
#         if hasattr(obj, "class_level_id"):
#             if obj.class_level_id:
#                 return obj.class_level.school_id

#         return None



from rest_framework.permissions import BasePermission

from accounts.models import User
from .models import School


# ============================================================
# ACADEMIC MANAGER
# ============================================================

class IsAcademicManager(BasePermission):
    """
    Allows authenticated Super Admins and School Admins
    to manage academic data.

    SUPER_ADMIN:
        Can manage academic data for every school.

    SCHOOL_ADMIN:
        Can manage academic data only for their assigned school.

    ACCOUNTANT:
        Cannot manage academic data.

    TEACHER:
        Cannot manage academic data.
    """

    message = (
        "You do not have permission to manage academic data."
    )

    def has_permission(self, request, view):
        user = request.user

        # ---------------------------------------------------------
        # Authentication
        # ---------------------------------------------------------
        if not user or not user.is_authenticated:
            return False

        # ---------------------------------------------------------
        # SUPER ADMIN
        # ---------------------------------------------------------
        if user.role == User.Role.SUPER_ADMIN:
            return True

        # ---------------------------------------------------------
        # SCHOOL ADMIN
        # ---------------------------------------------------------
        if user.role == User.Role.SCHOOL_ADMIN:
            return user.school_id is not None

        # ---------------------------------------------------------
        # ALL OTHER ROLES
        # ---------------------------------------------------------
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        # ---------------------------------------------------------
        # SUPER ADMIN
        # ---------------------------------------------------------
        if user.role == User.Role.SUPER_ADMIN:
            return True

        # ---------------------------------------------------------
        # SCHOOL ADMIN
        # ---------------------------------------------------------
        if user.role == User.Role.SCHOOL_ADMIN:

            if not user.school_id:
                return False

            # School object itself
            if isinstance(obj, School):
                return obj.pk == user.school_id

            # Other academic objects
            school_id = self.get_school_id(obj)

            return school_id == user.school_id

        return False

    @staticmethod
    def get_school_id(obj):
        """
        Returns the school ID associated with an academic object.

        Supported objects:

        School
            → id

        AcademicSession
            → school_id

        Department
            → school_id

        ClassLevel
            → school_id

        Subject
            → school_id

        AcademicSection
            → school_id

        Term
            → academic_session.school_id

        ClassSubject
            → class_level.school_id
        """

        # ---------------------------------------------------------
        # DIRECT SCHOOL RELATIONSHIP
        # ---------------------------------------------------------
        if hasattr(obj, "school_id"):
            return obj.school_id

        # ---------------------------------------------------------
        # TERM
        #
        # Term → AcademicSession → School
        # ---------------------------------------------------------
        if hasattr(obj, "academic_session_id"):
            if obj.academic_session_id:
                return obj.academic_session.school_id

        # ---------------------------------------------------------
        # CLASS SUBJECT
        #
        # ClassSubject → ClassLevel → School
        # ---------------------------------------------------------
        if hasattr(obj, "class_level_id"):
            if obj.class_level_id:
                return obj.class_level.school_id

        return None


# ============================================================
# ACADEMIC VIEWER
# ============================================================

class IsAcademicViewer(BasePermission):
    """
    Allows authenticated users to READ academic data.

    SUPER_ADMIN:
        Can read academic data for every school.

    SCHOOL_ADMIN:
        Can read academic data for their assigned school.

    PRINCIPAL:
        Can read academic data for their assigned school.

    ADMISSION_OFFICER:
        Can read academic data for their assigned school.

    EXAM_OFFICER:
        Can read academic data for their assigned school.

    ACCOUNTANT:
        Can read academic data for the school assigned to
        their active AccountantProfile.

    TEACHER:
        Can read academic data for the school assigned to
        their Teacher profile.

    IMPORTANT:
        This permission is READ-ONLY.

        It does NOT allow users to create, update,
        or delete academic records.
    """

    message = (
        "You do not have permission to view academic data."
    )

    # ---------------------------------------------------------
    # Roles that use User.school_id
    # ---------------------------------------------------------
    SCHOOL_SCOPED_VIEW_ROLES = {
        User.Role.SCHOOL_ADMIN,
        User.Role.PRINCIPAL,
        User.Role.ADMISSION_OFFICER,
        User.Role.EXAM_OFFICER,
    }

    def has_permission(self, request, view):
        user = request.user

        # ---------------------------------------------------------
        # Authentication
        # ---------------------------------------------------------
        if not user or not user.is_authenticated:
            return False

        # ---------------------------------------------------------
        # READ ONLY
        #
        # AcademicViewer must never be used to grant write access.
        # ---------------------------------------------------------
        if request.method not in (
            "GET",
            "HEAD",
            "OPTIONS",
        ):
            return False

        # ---------------------------------------------------------
        # SUPER ADMIN
        # ---------------------------------------------------------
        if user.role == User.Role.SUPER_ADMIN:
            return True

        # ---------------------------------------------------------
        # SCHOOL-SCOPED ROLES
        #
        # SCHOOL_ADMIN
        # PRINCIPAL
        # ADMISSION_OFFICER
        # EXAM_OFFICER
        # ---------------------------------------------------------
        if user.role in self.SCHOOL_SCOPED_VIEW_ROLES:
            return user.school_id is not None

        # ---------------------------------------------------------
        # ACCOUNTANT
        # ---------------------------------------------------------
        if user.role == User.Role.ACCOUNTANT:
            return self.has_active_accountant_profile(user)

        # ---------------------------------------------------------
        # TEACHER
        # ---------------------------------------------------------
        if user.role == User.Role.TEACHER:
            return self.has_active_teacher_profile(user)

        # ---------------------------------------------------------
        # ALL OTHER ROLES
        # ---------------------------------------------------------
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        # ---------------------------------------------------------
        # READ ONLY
        # ---------------------------------------------------------
        if request.method not in (
            "GET",
            "HEAD",
            "OPTIONS",
        ):
            return False

        # ---------------------------------------------------------
        # SUPER ADMIN
        # ---------------------------------------------------------
        if user.role == User.Role.SUPER_ADMIN:
            return True

        # ---------------------------------------------------------
        # SCHOOL-SCOPED ROLES
        #
        # SCHOOL_ADMIN
        # PRINCIPAL
        # ADMISSION_OFFICER
        # EXAM_OFFICER
        # ---------------------------------------------------------
        if user.role in self.SCHOOL_SCOPED_VIEW_ROLES:

            if not user.school_id:
                return False

            # School object itself
            if isinstance(obj, School):
                return obj.pk == user.school_id

            school_id = self.get_school_id(obj)

            return school_id == user.school_id

        # ---------------------------------------------------------
        # ACCOUNTANT
        # ---------------------------------------------------------
        if user.role == User.Role.ACCOUNTANT:

            profile = getattr(
                user,
                "accountant_profile",
                None,
            )

            if not profile:
                return False

            if not profile.is_active:
                return False

            if not profile.school_id:
                return False

            # School object itself
            if isinstance(obj, School):
                return obj.pk == profile.school_id

            school_id = self.get_school_id(obj)

            return school_id == profile.school_id

        # ---------------------------------------------------------
        # TEACHER
        # ---------------------------------------------------------
        if user.role == User.Role.TEACHER:

            teacher = getattr(
                user,
                "teacher_profile",
                None,
            )

            if not teacher:
                return False

            if not teacher.school_id:
                return False

            # School object itself
            if isinstance(obj, School):
                return obj.pk == teacher.school_id

            school_id = self.get_school_id(obj)

            return school_id == teacher.school_id

        return False

    # ============================================================
    # ACCOUNTANT PROFILE CHECK
    # ============================================================

    @staticmethod
    def has_active_accountant_profile(user):
        """
        Checks that the accountant has an active AccountantProfile
        linked to a school.
        """

        profile = getattr(
            user,
            "accountant_profile",
            None,
        )

        if not profile:
            return False

        if not profile.is_active:
            return False

        if not profile.school_id:
            return False

        return True

    # ============================================================
    # TEACHER PROFILE CHECK
    # ============================================================

    @staticmethod
    def has_active_teacher_profile(user):
        """
        Checks that the teacher has a Teacher profile
        linked to a school.
        """

        teacher = getattr(
            user,
            "teacher_profile",
            None,
        )

        if not teacher:
            return False

        if not teacher.school_id:
            return False

        return True

    # ============================================================
    # SCHOOL RESOLUTION
    # ============================================================

    @staticmethod
    def get_school_id(obj):
        """
        Returns the school ID associated with an academic object.

        Supported objects:

        School
            → id

        AcademicSession
            → school_id

        Department
            → school_id

        ClassLevel
            → school_id

        Subject
            → school_id

        AcademicSection
            → school_id

        Term
            → academic_session.school_id

        ClassSubject
            → class_level.school_id
        """

        # ---------------------------------------------------------
        # DIRECT SCHOOL RELATIONSHIP
        # ---------------------------------------------------------
        if hasattr(obj, "school_id"):
            return obj.school_id

        # ---------------------------------------------------------
        # TERM
        #
        # Term → AcademicSession → School
        # ---------------------------------------------------------
        if hasattr(obj, "academic_session_id"):

            if obj.academic_session_id:
                return obj.academic_session.school_id

        # ---------------------------------------------------------
        # CLASS SUBJECT
        #
        # ClassSubject → ClassLevel → School
        # ---------------------------------------------------------
        if hasattr(obj, "class_level_id"):

            if obj.class_level_id:
                return obj.class_level.school_id

        return None




# ============================================================
# PUBLIC ACADEMIC VIEWER
# ============================================================

class IsPublicAcademicViewer(BasePermission):
    """
    Allows public users to READ limited academic data needed
    by the public admission application form.

    IMPORTANT:
        This permission is READ-ONLY.

        Unauthenticated users can only perform:
            GET
            HEAD
            OPTIONS

        They cannot:
            POST
            PUT
            PATCH
            DELETE

    Authenticated users are also allowed to read through this
    permission.
    """

    message = (
        "You do not have permission to view this academic data."
    )

    def has_permission(self, request, view):
        # --------------------------------------------------------
        # READ ONLY
        # --------------------------------------------------------
        if request.method in (
            "GET",
            "HEAD",
            "OPTIONS",
        ):
            return True

        # --------------------------------------------------------
        # NEVER allow writes
        # --------------------------------------------------------
        return False
