from academics.models import ClassLevel, ClassSubject
from students.models import (
    Student,
    StudentEnrollment,
    StudentSubjectEnrollment,
)


GENERAL_COMPULSORY = "GENERAL_COMPULSORY"
DEPARTMENT_COMPULSORY = "DEPARTMENT_COMPULSORY"
OPTIONAL = "OPTIONAL"


def get_current_student_enrollment(student, assignment):
    """
    Return the student's current enrollment that exactly matches
    the assignment's academic session, term, and class.
    """

    return (
        StudentEnrollment.objects
        .filter(
            student_id=student.id,
            academic_session_id=assignment.academic_session_id,
            term_id=assignment.term_id,
            class_level_id=assignment.class_level_id,
            is_current=True,
        )
        .first()
    )


def get_allowed_subject_ids(student_enrollment):
    """
    Return the subject IDs the student is allowed to access
    for this exact enrollment.

    Rules:

    PRIMARY/JSS:
        Every active ClassSubject is accessible.

    SS:
        GENERAL_COMPULSORY -> everyone in the class
        DEPARTMENT_COMPULSORY -> everyone in the class
        OPTIONAL -> only students who selected/enrolled in it
    """

    class_level = student_enrollment.class_level

    class_subjects = ClassSubject.objects.filter(
        class_level_id=class_level.id,
        is_active=True,
    )

    education_level = class_level.education_level

    # Primary and JSS:
    # Every subject assigned to the class is available.
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

    # Senior Secondary School
    if education_level == ClassLevel.EducationLevel.SS:

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

        selected_optional_subject_ids = set(
            StudentSubjectEnrollment.objects
            .filter(
                student_enrollment_id=student_enrollment.id,
                academic_session_id=student_enrollment.academic_session_id,
                term_id=student_enrollment.term_id,
                subject_id__in=optional_subject_ids,
                is_active=True,
            )
            .values_list(
                "subject_id",
                flat=True,
            )
        )

        return (
            compulsory_subject_ids
            | selected_optional_subject_ids
        )

    return set()


def get_student_assignment_access_error(student, assignment):
    """
    Return None when the student is allowed to access the assignment.

    Otherwise return a useful error message.
    """

    if not student:
        return "Student profile was not found."

    if student.status != Student.Status.ACTIVE:
        return "Your student account is not active."

    # Assignment must belong to the student's school.
    if assignment.school_id != student.school_id:
        return "You do not have access to this assignment."

    enrollment = get_current_student_enrollment(
        student,
        assignment,
    )

    if not enrollment:
        return (
            "You are not currently enrolled in the class, "
            "academic session, and term for this assignment."
        )

    # The subject must actually belong to this class.
    class_subject = (
        ClassSubject.objects
        .filter(
            class_level_id=assignment.class_level_id,
            subject_id=assignment.subject_id,
            is_active=True,
        )
        .first()
    )

    if not class_subject:
        return (
            "This subject is not currently assigned "
            "to your class."
        )

    education_level = assignment.class_level.education_level

    # Primary and JSS:
    # All active subjects assigned to the class are accessible.
    if education_level in (
        ClassLevel.EducationLevel.PRIMARY,
        ClassLevel.EducationLevel.JSS,
    ):
        return None

    # SS:
    # General compulsory and department compulsory
    # are available to everyone in that class.
    if education_level == ClassLevel.EducationLevel.SS:

        if class_subject.assignment_type in (
            GENERAL_COMPULSORY,
            DEPARTMENT_COMPULSORY,
        ):
            return None

        # Optional subject:
        # The student MUST have selected/enrolled in it.
        if class_subject.assignment_type == OPTIONAL:

            selected = (
                StudentSubjectEnrollment.objects
                .filter(
                    student_enrollment_id=enrollment.id,
                    academic_session_id=assignment.academic_session_id,
                    term_id=assignment.term_id,
                    subject_id=assignment.subject_id,
                    is_active=True,
                )
                .exists()
            )

            if not selected:
                return (
                    "You are not enrolled in this optional subject."
                )

            return None

    return "You do not have access to this assignment."


def student_can_access_assignment(student, assignment):
    """
    Simple boolean version of the central access rule.
    """

    return (
        get_student_assignment_access_error(
            student,
            assignment,
        )
        is None
    )