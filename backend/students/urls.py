from django.urls import path

from .views import (
    # =========================
    # Parent / Guardian
    # =========================
    ParentGuardianListCreateView,
    ParentGuardianDetailView,
    StudentParentListView,
    StudentParentAddView,
    StudentParentRemoveView,

    # =========================
    # Students
    # =========================
    StudentListCreateView,
    StudentDetailView,
    StudentClassmatesView,
    # =========================
    # Student Enrollment
    # =========================
    StudentEnrollmentListCreateView,
    StudentEnrollmentDetailView,

    # =========================
    # Student Subject Enrollment
    # =========================
    StudentSubjectEnrollmentListCreateView,
    StudentSubjectEnrollmentDetailView,

    # =========================
    # Student Subjects
    # =========================
    StudentSubjectsView,
    StudentOptionalSubjectSelectView,
    StudentOptionalSubjectRemoveView,

    # =========================
    # Student Term Progression
    # =========================
    StudentNextTermEligibilityView,
    ContinueStudentTermView,

    # =========================
    # Student Promotion
    # =========================
    StudentPromotionEligibilityView,
    PromoteStudentView,

    # =========================
    # Optional Subject Settings
    # =========================
    OptionalSubjectSelectionSettingListCreateView,
    OptionalSubjectSelectionSettingDetailView,


    GraduateStudentView,
    GraduationRecordListView,
    GraduationEligibleStudentListView,

    StudentAccountListView,
    StudentAccountCreateView,
    StudentAccountDetailView,
    StudentAccountActivateView,
    StudentAccountDeactivateView,
    StudentAccountResetPasswordView,

    
)


urlpatterns = [

    # =====================================================
    # Parent / Guardian
    # =====================================================

    path(
        "parents/",
        ParentGuardianListCreateView.as_view(),
        name="parent-list-create",
    ),

    path(
        "parents/<int:pk>/",
        ParentGuardianDetailView.as_view(),
        name="parent-detail",
    ),


    # =====================================================
    # Student Parent / Guardian
    # =====================================================

    path(
        "<int:student_id>/parents/",
        StudentParentListView.as_view(),
        name="student-parent-list",
    ),

    path(
        "<int:student_id>/parents/add/",
        StudentParentAddView.as_view(),
        name="student-parent-add",
    ),

    path(
        "<int:student_id>/parents/<int:parent_id>/",
        StudentParentRemoveView.as_view(),
        name="student-parent-remove",
    ),


    # =====================================================
    # Students
    # =====================================================

    path(
        "",
        StudentListCreateView.as_view(),
        name="student-list-create",
    ),

    path(
        "<int:pk>/",
        StudentDetailView.as_view(),
        name="student-detail",
    ),

    path(
        "<int:student_id>/classmates/",
        StudentClassmatesView.as_view(),
        name="student-classmates",
    ),


    # =====================================================
    # Student Enrollment
    # =====================================================

    path(
        "enrollments/<int:student_id>/next-term/",
        StudentNextTermEligibilityView.as_view(),
        name="student-next-term-eligibility",
    ),

    path(
        "enrollments/",
        StudentEnrollmentListCreateView.as_view(),
        name="student-enrollment-list-create",
    ),

    path(
        "enrollments/<int:pk>/",
        StudentEnrollmentDetailView.as_view(),
        name="student-enrollment-detail",
    ),

    path(
        "enrollments/continue-term/",
        ContinueStudentTermView.as_view(),
        name="student-continue-term",
    ),


    # =====================================================
    # Student Promotion
    # =====================================================

    # Check promotion eligibility
    #
    # GET:
    # /api/students/enrollments/<student_id>/promotion/
    path(
        "enrollments/<int:student_id>/promotion/",
        StudentPromotionEligibilityView.as_view(),
        name="student-promotion-eligibility",
    ),

    # Promote or graduate student
    #
    # POST:
    # /api/students/enrollments/promote/
    path(
        "enrollments/promote/",
        PromoteStudentView.as_view(),
        name="student-promote",
    ),


    # =====================================================
    # Student Subject Enrollment
    # =====================================================

    path(
        "subject-enrollments/",
        StudentSubjectEnrollmentListCreateView.as_view(),
        name="student-subject-enrollment-list-create",
    ),

    path(
        "subject-enrollments/<int:pk>/",
        StudentSubjectEnrollmentDetailView.as_view(),
        name="student-subject-enrollment-detail",
    ),


    # =====================================================
    # Student Subjects
    # =====================================================

    # Get all subjects for the student's current class
    #
    # Returns:
    # - General compulsory subjects
    # - Department compulsory subjects
    # - Selected optional subjects
    # - Available optional subjects
    #
    # GET:
    # /api/students/<student_id>/subjects/
    path(
        "<int:student_id>/subjects/",
        StudentSubjectsView.as_view(),
        name="student-subjects",
    ),

    # Select an optional subject
    #
    # POST:
    # /api/students/<student_id>/subjects/select/
    #
    # Body:
    # {
    #     "subject_id": 5
    # }
    path(
        "<int:student_id>/subjects/select/",
        StudentOptionalSubjectSelectView.as_view(),
        name="student-optional-subject-select",
    ),

    # Remove an optional subject
    #
    # DELETE:
    # /api/students/<student_id>/subjects/<subject_id>/remove/
    path(
        "<int:student_id>/subjects/<int:subject_id>/remove/",
        StudentOptionalSubjectRemoveView.as_view(),
        name="student-optional-subject-remove",
    ),


    # =====================================================
    # Optional Subject Selection Settings
    # =====================================================

    path(
        "optional-subject-settings/",
        OptionalSubjectSelectionSettingListCreateView.as_view(),
        name="optional-subject-settings",
    ),

    path(
        "optional-subject-settings/<int:pk>/",
        OptionalSubjectSelectionSettingDetailView.as_view(),
        name="optional-subject-setting-detail",
    ), # ========================================================
    # GRADUATION
    # ========================================================

    path(
        "graduation/",
        GraduateStudentView.as_view(),
        name="graduate-student",
    ),

    path(
        "graduation/history/",
        GraduationRecordListView.as_view(),
        name="graduation-history",
    ),

    path(
        "graduation/eligible/",
        GraduationEligibleStudentListView.as_view(),
        name="graduation-eligible-students",
    ),


    # =====================================================
    # STUDENT ACCOUNTS
    # =====================================================

    # -----------------------------------------------------
    # List student accounts
    #
    # GET:
    # /api/students/accounts/
    #
    # Examples:
    # /api/students/accounts/?search=Grace
    # /api/students/accounts/?account_status=HAS_ACCOUNT
    # /api/students/accounts/?account_status=NO_ACCOUNT
    # /api/students/accounts/?account_status=ACTIVE
    # /api/students/accounts/?account_status=INACTIVE
    # -----------------------------------------------------

    path(
        "accounts/",
        StudentAccountListView.as_view(),
        name="student-account-list",
    ),

    # -----------------------------------------------------
    # Create account for a student who has no account
    #
    # POST:
    # /api/students/accounts/create/
    #
    # Body:
    # {
    #     "student": 53,
    #     "email": "student@example.com"
    # }
    #
    # Password is generated automatically by the backend.
    # -----------------------------------------------------

    path(
        "accounts/create/",
        StudentAccountCreateView.as_view(),
        name="student-account-create",
    ),

    # -----------------------------------------------------
    # View one student's account
    #
    # GET:
    # /api/students/accounts/53/
    # -----------------------------------------------------

    path(
        "accounts/<int:student_id>/",
        StudentAccountDetailView.as_view(),
        name="student-account-detail",
    ),

    # -----------------------------------------------------
    # Activate account
    #
    # POST:
    # /api/students/accounts/53/activate/
    # -----------------------------------------------------

    path(
        "accounts/<int:student_id>/activate/",
        StudentAccountActivateView.as_view(),
        name="student-account-activate",
    ),

    # -----------------------------------------------------
    # Deactivate account
    #
    # POST:
    # /api/students/accounts/53/deactivate/
    # -----------------------------------------------------

    path(
        "accounts/<int:student_id>/deactivate/",
        StudentAccountDeactivateView.as_view(),
        name="student-account-deactivate",
    ),

    # -----------------------------------------------------
    # Reset password
    #
    # POST:
    # /api/students/accounts/53/reset-password/
    #
    # Body:
    # {
    #     "password": "NewPassword123"
    # }
    # -----------------------------------------------------

    path(
        "accounts/<int:student_id>/reset-password/",
        StudentAccountResetPasswordView.as_view(),
        name="student-account-reset-password",
    ),


]