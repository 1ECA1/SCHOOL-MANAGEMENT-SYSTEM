# from django.db import transaction
# from django.utils import timezone
# from rest_framework.exceptions import ValidationError

# from .models import (
#     Student,
#     StudentEnrollment,
#     PromotionRecord,
# )


# @transaction.atomic
# def graduate_student(
#     *,
#     student_id,
#     graduation_year=None,
#     remarks="",
# ):
#     """
#     Graduate one student.

#     Graduation performs three coordinated operations:

#     1. Creates a final PromotionRecord with
#        promotion_type = GRADUATED.

#     2. Marks the student's current enrollment as no longer current.

#     3. Updates the Student record to GRADUATED and stores
#        graduation session/year.

#     The student's final class/session/term are preserved in
#     the PromotionRecord by using the current enrollment for
#     both from_* and to_* fields.
#     """

#     # ---------------------------------------------------------
#     # GET STUDENT
#     # ---------------------------------------------------------

#     try:
#         student = (
#             Student.objects
#             .select_for_update()
#             .get(id=student_id)
#         )
#     except Student.DoesNotExist:
#         raise ValidationError(
#             {
#                 "student": "Student does not exist."
#             }
#         )

#     # ---------------------------------------------------------
#     # ALREADY GRADUATED
#     # ---------------------------------------------------------

#     if student.status == Student.Status.GRADUATED:
#         raise ValidationError(
#             {
#                 "student": (
#                     "This student has already been graduated."
#                 )
#             }
#         )

#     # ---------------------------------------------------------
#     # FIND CURRENT ENROLLMENT
#     # ---------------------------------------------------------

#     enrollment = (
#         StudentEnrollment.objects
#         .select_related(
#             "student",
#             "academic_session",
#             "term",
#             "class_level",
#         )
#         .select_for_update()
#         .filter(
#             student=student,
#             is_current=True,
#         )
#         .order_by(
#             "-academic_session_id",
#             "-term_id",
#             "-id",
#         )
#         .first()
#     )

#     if not enrollment:
#         raise ValidationError(
#             {
#                 "student": (
#                     "The student does not have a current "
#                     "enrollment and cannot be graduated."
#                 )
#             }
#         )

#     # ---------------------------------------------------------
#     # PREVENT DUPLICATE GRADUATION RECORD
#     # ---------------------------------------------------------

#     already_graduated = (
#         PromotionRecord.objects
#         .filter(
#             student=student,
#             promotion_type=PromotionRecord.PromotionType.GRADUATED,
#             is_final=True,
#         )
#         .exists()
#     )

#     if already_graduated:
#         raise ValidationError(
#             {
#                 "student": (
#                     "A final graduation record already exists "
#                     "for this student."
#                 )
#             }
#         )

#     # ---------------------------------------------------------
#     # GRADUATION YEAR
#     # ---------------------------------------------------------

#     if graduation_year is None:
#         graduation_year = enrollment.academic_session.end_date.year

#     # ---------------------------------------------------------
#     # CREATE GRADUATION HISTORY
#     #
#     # For graduation there is no next class.
#     #
#     # Therefore:
#     #
#     # from_* = final academic state
#     # to_*   = same final academic state
#     #
#     # This keeps PromotionRecord structurally valid while
#     # clearly marking the record as GRADUATED + FINAL.
#     # ---------------------------------------------------------

#     graduation_record = PromotionRecord.objects.create(
#         student=student,

#         from_session=enrollment.academic_session,
#         from_term=enrollment.term,
#         from_class=enrollment.class_level,

#         to_session=enrollment.academic_session,
#         to_term=enrollment.term,
#         to_class=enrollment.class_level,

#         promotion_type=(
#             PromotionRecord.PromotionType.GRADUATED
#         ),

#         graduation_year=graduation_year,

#         is_final=True,

#         remarks=remarks or "",
#     )

#     # ---------------------------------------------------------
#     # CLOSE CURRENT ENROLLMENT
#     # ---------------------------------------------------------

#     StudentEnrollment.objects.filter(
#         student=student,
#         is_current=True,
#     ).update(
#         is_current=False,
#     )

#     # ---------------------------------------------------------
#     # UPDATE STUDENT
#     # ---------------------------------------------------------

#     student.status = Student.Status.GRADUATED

#     student.graduation_session = (
#         enrollment.academic_session
#     )

#     student.graduation_year = graduation_year

#     student.save(
#         update_fields=[
#             "status",
#             "graduation_session",
#             "graduation_year",
#             "updated_at",
#         ]
#     )

#     return graduation_record


from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import (
    Student,
    StudentEnrollment,
    PromotionRecord,
)


@transaction.atomic
def graduate_student(
    *,
    student_id,
    graduation_year=None,
    remarks="",
):
    # ============================================================
    # GET STUDENT
    # ============================================================

    try:
        student = (
            Student.objects
            .select_for_update()
            .select_related(
                "school",
                "graduation_session",
            )
            .get(id=student_id)
        )

    except Student.DoesNotExist:
        raise ValidationError({
            "student": "Student does not exist."
        })

    # ============================================================
    # ALREADY GRADUATED
    # ============================================================

    if student.status == Student.Status.GRADUATED:
        raise ValidationError({
            "student": "This student has already been graduated."
        })

    # ============================================================
    # CURRENT ENROLLMENT
    # ============================================================

    enrollment = (
        StudentEnrollment.objects
        .select_related(
            "student",
            "academic_session",
            "term",
            "class_level",
            "class_level__school",
        )
        .select_for_update()
        .filter(
            student=student,
            is_current=True,
        )
        .order_by(
            "-academic_session_id",
            "-term_id",
            "-id",
        )
        .first()
    )

    if not enrollment:
        raise ValidationError({
            "student": (
                "The student does not have a current enrollment "
                "and cannot be graduated."
            )
        })

    # ============================================================
    # SCHOOL CONSISTENCY CHECKS
    # ============================================================

    if (
        enrollment.academic_session.school_id
        != student.school_id
    ):
        raise ValidationError({
            "student": (
                "The student's school does not match "
                "the enrollment academic session."
            )
        })

    if (
        enrollment.class_level.school_id
        != student.school_id
    ):
        raise ValidationError({
            "student": (
                "The student's school does not match "
                "the enrolled class."
            )
        })

    # ============================================================
    # MUST BE A GRADUATING CLASS
    # ============================================================

    if not enrollment.class_level.is_graduating_class:
        raise ValidationError({
            "student": (
                f"{student.full_name} is currently enrolled in "
                f"{enrollment.class_level.name}, which is not "
                "marked as a graduating class."
            )
        })

    # ============================================================
    # CHECK FOR EXISTING FINAL GRADUATION RECORD
    # ============================================================

    already_graduated = (
        PromotionRecord.objects
        .filter(
            student=student,
            promotion_type=PromotionRecord.PromotionType.GRADUATED,
            is_final=True,
        )
        .exists()
    )

    if already_graduated:
        raise ValidationError({
            "student": (
                "A final graduation record already exists "
                "for this student."
            )
        })

    # ============================================================
    # DETERMINE GRADUATION YEAR
    # ============================================================

    if graduation_year is None:
        graduation_year = (
            enrollment.academic_session.end_date.year
        )

    # ============================================================
    # CREATE GRADUATION RECORD
    # ============================================================

    graduation_record = PromotionRecord.objects.create(
        student=student,

        # Current academic state
        from_session=enrollment.academic_session,
        from_term=enrollment.term,
        from_class=enrollment.class_level,

        # PromotionRecord requires these fields.
        # For graduation, the final state remains the same
        # because there is no "next class" after graduation.
        to_session=enrollment.academic_session,
        to_term=enrollment.term,
        to_class=enrollment.class_level,

        promotion_type=(
            PromotionRecord.PromotionType.GRADUATED
        ),

        graduation_year=graduation_year,

        is_final=True,

        remarks=remarks or "",
    )

    # ============================================================
    # CLOSE CURRENT ENROLLMENT
    # ============================================================

    StudentEnrollment.objects.filter(
        student=student,
        is_current=True,
    ).update(
        is_current=False,
    )

    # ============================================================
    # UPDATE STUDENT
    # ============================================================

    student.status = Student.Status.GRADUATED
    student.graduation_session = (
        enrollment.academic_session
    )
    student.graduation_year = graduation_year

    student.save(
        update_fields=[
            "status",
            "graduation_session",
            "graduation_year",
            "updated_at",
        ]
    )

    return graduation_record