# from academics.models import (
#     ClassLevel,
#     ClassSubject,
# )

# from students.models import (
#     StudentEnrollment,
#     StudentSubjectEnrollment,
# )


# def student_can_access_assignment(student, assignment):
#     """
#     Determine whether a student is authorized to access an assignment.

#     Authorization rules:

#     PRIMARY / JSS
#         A student can access an assignment when the subject is assigned
#         to the student's current class.

#     SS GENERAL_COMPULSORY
#         Every student currently enrolled in that SS class can access it.

#     SS DEPARTMENT_COMPULSORY
#         Every student currently enrolled in that SS department/class
#         can access it.

#     SS OPTIONAL
#         The student must explicitly be enrolled in the subject through
#         StudentSubjectEnrollment.

#     The student's enrollment must match the assignment's:
#         - academic session
#         - term
#         - class level
#     """

#     # =========================================================
#     # 1. FIND THE STUDENT'S CURRENT ENROLLMENT
#     #    FOR THIS EXACT ASSIGNMENT
#     # =========================================================

#     enrollment = (
#         StudentEnrollment.objects
#         .filter(
#             student=student,
#             academic_session=assignment.academic_session,
#             term=assignment.term,
#             class_level=assignment.class_level,
#             is_current=True,
#         )
#         .select_related(
#             "student",
#             "class_level",
#         )
#         .first()
#     )

#     if enrollment is None:
#         return False

#     # =========================================================
#     # 2. FIND THE SUBJECT AS ASSIGNED TO THIS CLASS
#     # =========================================================

#     class_subject = (
#         ClassSubject.objects
#         .filter(
#             class_level=assignment.class_level,
#             subject=assignment.subject,
#             is_active=True,
#         )
#         .first()
#     )

#     if class_subject is None:
#         return False

#     # =========================================================
#     # 3. PRIMARY / JSS
#     #
#     # Every current student in the class takes every active
#     # subject assigned to that class.
#     # =========================================================

#     if assignment.class_level.education_level in [
#         ClassLevel.EducationLevel.PRIMARY,
#         ClassLevel.EducationLevel.JSS,
#     ]:
#         return True

#     # =========================================================
#     # 4. SENIOR SECONDARY
#     # =========================================================

#     if (
#         assignment.class_level.education_level
#         == ClassLevel.EducationLevel.SS
#     ):

#         # -----------------------------------------------------
#         # GENERAL COMPULSORY
#         #
#         # Every student in the SS class takes the subject.
#         # -----------------------------------------------------

#         if (
#             class_subject.assignment_type
#             == "GENERAL_COMPULSORY"
#         ):
#             return True

#         # -----------------------------------------------------
#         # DEPARTMENT COMPULSORY
#         #
#         # The ClassLevel already identifies the department.
#         #
#         # Example:
#         #
#         # SS1 Science
#         #     Physics
#         #     Chemistry
#         #     Biology
#         #
#         # Every current student enrolled in SS1 Science gets
#         # access to these subjects.
#         # -----------------------------------------------------

#         if (
#             class_subject.assignment_type
#             == "DEPARTMENT_COMPULSORY"
#         ):
#             return True

#         # -----------------------------------------------------
#         # OPTIONAL
#         #
#         # Student must have explicitly selected the subject.
#         # -----------------------------------------------------

#         if (
#             class_subject.assignment_type
#             == "OPTIONAL"
#         ):
#             return (
#                 StudentSubjectEnrollment.objects
#                 .filter(
#                     student_enrollment=enrollment,
#                     subject=assignment.subject,
#                     academic_session=assignment.academic_session,
#                     term=assignment.term,
#                     is_active=True,
#                 )
#                 .exists()
#             )

#     # =========================================================
#     # 5. SAFETY FALLBACK
#     # =========================================================

#     return False


from academics.models import (
    ClassLevel,
    ClassSubject,
)

from students.models import (
    Student,
    StudentEnrollment,
    StudentSubjectEnrollment,
)

from .models import Assignment, AssignmentSubmission
# =============================================================
# ASSIGNMENT TYPES
# =============================================================

GENERAL_COMPULSORY = "GENERAL_COMPULSORY"
DEPARTMENT_COMPULSORY = "DEPARTMENT_COMPULSORY"
OPTIONAL = "OPTIONAL"


# =============================================================
# GET STUDENT'S EXACT CURRENT ENROLLMENT FOR AN ASSIGNMENT
# =============================================================

def get_student_assignment_enrollment(student, assignment):
    """
    Return the student's current enrollment that exactly matches
    the assignment.

    This function is used ONLY by the assignments module.

    It does not change or redefine enrollment behavior anywhere
    else in the application.

    Returns None if the student is not enrolled in the
    assignment's school/class/session/term.
    """

    if not student:
        return None

    # ---------------------------------------------------------
    # SCHOOL SAFETY CHECK
    # ---------------------------------------------------------

    if student.school_id != assignment.school_id:
        return None

    # ---------------------------------------------------------
    # FIND EXACT CURRENT ENROLLMENT
    # ---------------------------------------------------------

    return (
        StudentEnrollment.objects
        .filter(
            student=student,
            academic_session=assignment.academic_session,
            term=assignment.term,
            class_level=assignment.class_level,
            is_current=True,
        )
        .select_related(
            "student",
            "class_level",
            "academic_session",
            "term",
        )
        .first()
    )


# =============================================================
# GET ALLOWED SUBJECT IDS FOR AN ENROLLMENT
# =============================================================

def get_allowed_assignment_subject_ids(enrollment):
    """
    Return the subject IDs that the student is allowed to access
    for assignments for this exact enrollment.

    Rules:

    PRIMARY / JSS
        Every active subject assigned to the class is accessible.

    SS GENERAL_COMPULSORY
        Every student in the class can access it.

    SS DEPARTMENT_COMPULSORY
        Every student in that department-specific class can
        access it.

    SS OPTIONAL
        Only students who explicitly selected/enrolled in the
        optional subject can access it.

    This helper is ONLY for assignment access.
    """

    if not enrollment:
        return set()

    class_level = enrollment.class_level

    # ---------------------------------------------------------
    # GET ACTIVE SUBJECTS ASSIGNED TO THIS CLASS
    # ---------------------------------------------------------

    class_subjects = ClassSubject.objects.filter(
        class_level=class_level,
        is_active=True,
    )

    education_level = class_level.education_level

    # =========================================================
    # PRIMARY / JSS
    # =========================================================

    if education_level in (
        ClassLevel.EducationLevel.PRIMARY,
        ClassLevel.EducationLevel.JSS,
    ):
        return set(
            class_subjects.values_list(
                "subject_id",
                flat=True,
            )
        )

    # =========================================================
    # SENIOR SECONDARY
    # =========================================================

    if education_level == ClassLevel.EducationLevel.SS:

        # -----------------------------------------------------
        # GENERAL + DEPARTMENT COMPULSORY
        # -----------------------------------------------------

        compulsory_subject_ids = set(
            class_subjects
            .filter(
                assignment_type__in=[
                    GENERAL_COMPULSORY,
                    DEPARTMENT_COMPULSORY,
                ]
            )
            .values_list(
                "subject_id",
                flat=True,
            )
        )

        # -----------------------------------------------------
        # OPTIONAL SUBJECTS AVAILABLE IN THIS CLASS
        # -----------------------------------------------------

        optional_subject_ids = set(
            class_subjects
            .filter(
                assignment_type=OPTIONAL,
            )
            .values_list(
                "subject_id",
                flat=True,
            )
        )

        # -----------------------------------------------------
        # OPTIONAL SUBJECTS ACTUALLY SELECTED BY THE STUDENT
        # -----------------------------------------------------

        selected_optional_subject_ids = set(
            StudentSubjectEnrollment.objects
            .filter(
                student_enrollment=enrollment,
                academic_session=enrollment.academic_session,
                term=enrollment.term,
                subject_id__in=optional_subject_ids,
                is_active=True,
            )
            .values_list(
                "subject_id",
                flat=True,
            )
        )

        # -----------------------------------------------------
        # FINAL ALLOWED SUBJECTS
        # -----------------------------------------------------

        return (
            compulsory_subject_ids
            | selected_optional_subject_ids
        )

    # =========================================================
    # UNKNOWN EDUCATION LEVEL
    # =========================================================

    return set()


# =============================================================
# GET ACCESS ERROR
# =============================================================

def get_student_assignment_access_error(student, assignment):
    """
    Return None if the student is allowed to access the
    assignment.

    Otherwise return a human-readable reason why access is
    denied.

    This is the detailed version of
    student_can_access_assignment().
    """

    # =========================================================
    # 1. STUDENT MUST EXIST
    # =========================================================

    if not student:
        return "Student profile was not found."

    # =========================================================
    # 2. STUDENT MUST BE ACTIVE
    # =========================================================

    if student.status != Student.Status.ACTIVE:
        return "Your student account is not active."

    # =========================================================
    # 3. SCHOOL SAFETY CHECK
    # =========================================================

    if student.school_id != assignment.school_id:
        return "You do not have access to this assignment."

    # =========================================================
    # 4. EXACT CURRENT ENROLLMENT
    # =========================================================

    enrollment = get_student_assignment_enrollment(
        student,
        assignment,
    )

    if enrollment is None:
        return (
            "You are not currently enrolled in the class, "
            "academic session, and term for this assignment."
        )

    # =========================================================
    # 5. ASSIGNMENT TARGET CHECK
    #
    # WHOLE_CLASS:
    #     Any eligible student in the class can access it.
    #
    # SELECTED_STUDENTS:
    #     Only students explicitly selected by the creator
    #     can access it.
    # =========================================================

    if (
        assignment.target_type
        == Assignment.TargetType.SELECTED_STUDENTS
    ):
        is_selected = (
            assignment.target_students
            .filter(
                id=student.id
            )
            .exists()
        )

        if not is_selected:
            return (
                "You are not a selected student "
                "for this assignment."
            )

    # =========================================================
    # 6. SUBJECT MUST BELONG TO THIS CLASS
    # =========================================================

    class_subject = (
        ClassSubject.objects
        .filter(
            class_level=assignment.class_level,
            subject=assignment.subject,
            is_active=True,
        )
        .first()
    )

    if class_subject is None:
        return (
            "This subject is not currently assigned "
            "to your class."
        )

    # =========================================================
    # 7. PRIMARY / JSS
    # =========================================================

    if assignment.class_level.education_level in (
        ClassLevel.EducationLevel.PRIMARY,
        ClassLevel.EducationLevel.JSS,
    ):
        return None

    # =========================================================
    # 8. SENIOR SECONDARY
    # =========================================================

    if (
        assignment.class_level.education_level
        == ClassLevel.EducationLevel.SS
    ):

        # -----------------------------------------------------
        # GENERAL COMPULSORY
        # -----------------------------------------------------

        if (
            class_subject.assignment_type
            == GENERAL_COMPULSORY
        ):
            return None

        # -----------------------------------------------------
        # DEPARTMENT COMPULSORY
        # -----------------------------------------------------

        if (
            class_subject.assignment_type
            == DEPARTMENT_COMPULSORY
        ):
            return None

        # -----------------------------------------------------
        # OPTIONAL
        # -----------------------------------------------------

        if (
            class_subject.assignment_type
            == OPTIONAL
        ):
            selected = (
                StudentSubjectEnrollment.objects
                .filter(
                    student_enrollment=enrollment,
                    subject=assignment.subject,
                    academic_session=assignment.academic_session,
                    term=assignment.term,
                    is_active=True,
                )
                .exists()
            )

            if not selected:
                return (
                    "You are not enrolled in this optional subject."
                )

            return None

    # =========================================================
    # 9. UNKNOWN EDUCATION LEVEL / ASSIGNMENT TYPE
    # =========================================================

    return "You do not have access to this assignment."


# =============================================================
# SIMPLE BOOLEAN ACCESS CHECK
# =============================================================

def student_can_access_assignment(
    student,
    assignment,
):
    """
    Return True if the student can access the assignment.

    Return False otherwise.
    """

    return (
        get_student_assignment_access_error(
            student,
            assignment,
        )
        is None
    )