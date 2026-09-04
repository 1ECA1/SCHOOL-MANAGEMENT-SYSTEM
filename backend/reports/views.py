from collections import defaultdict

from django.db.models import Avg, Max, Min, Sum, Count

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from examinations.models import Examination, ExaminationSubject

from academics.models import (
    School,
    AcademicSession,
    Term,
    ClassLevel,
    Subject,
)

from students.models import Student
from teachers.models import Teacher

from results.models import StudentResult

from attendance.models import AttendanceRecord

from finance.models import (
    StudentInvoice,
    Payment,
    Expense,
)

from assignments.models import (
    Assignment,
    AssignmentSubmission,
)


# ============================================================
# REPORTS DASHBOARD
# ============================================================

class ReportsDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = {
            "schools": School.objects.count(),
            "students": Student.objects.count(),
            "teachers": Teacher.objects.count(),
            "academic_sessions": AcademicSession.objects.count(),
            "terms": Term.objects.count(),
            "class_levels": ClassLevel.objects.count(),
            "subjects": Subject.objects.count(),
        }

        return Response({
            "message": "Reports dashboard generated successfully.",
            "data": data,
        })


# ============================================================
# STUDENT REPORT
# ============================================================

class StudentReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        students = Student.objects.select_related(
            "school",
            "department",
        ).prefetch_related(
            "enrollments__academic_session",
            "enrollments__term",
            "enrollments__class_level",
        )

        report = []

        for student in students:

            current_enrollment = (
                student.enrollments
                .filter(is_current=True)
                .select_related(
                    "academic_session",
                    "term",
                    "class_level",
                )
                .first()
            )

            report.append({
                "id": student.id,
                "admission_number": student.admission_number,
                "full_name": student.full_name,
                "first_name": student.first_name,
                "middle_name": student.middle_name,
                "last_name": student.last_name,
                "gender": student.gender,
                "date_of_birth": student.date_of_birth,
                "email": student.email,
                "phone_number": student.phone_number,
                "school": student.school.name,

                "department": (
                    student.department.name
                    if student.department
                    else None
                ),

                "status": student.status,
                "admission_date": student.admission_date,

                "current_class": (
                    current_enrollment.class_level.name
                    if current_enrollment
                    else None
                ),

                "academic_session": (
                    current_enrollment.academic_session.name
                    if current_enrollment
                    else None
                ),

                "term": (
                    current_enrollment.term.get_name_display()
                    if current_enrollment
                    else None
                ),

                "roll_number": (
                    current_enrollment.roll_number
                    if current_enrollment
                    else None
                ),
            })

        return Response({
            "message": "Student report generated successfully.",
            "total_students": len(report),
            "students": report,
        })


# ============================================================
# ACADEMIC PERFORMANCE REPORT
# ============================================================

class AcademicPerformanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        results = (
            StudentResult.objects
            .select_related(
                "student",
                "examination_subject",
                "examination_subject__subject",
            )
            .filter(is_published=True)
        )

        total_results = results.count()

        if total_results == 0:

            return Response({
                "message": (
                    "Academic performance report "
                    "generated successfully."
                ),

                "data": {
                    "total_results": 0,
                    "average_score": 0,
                    "highest_score": 0,
                    "lowest_score": 0,
                    "pass_rate": 0,
                    "grade_distribution": {},
                },
            })

        statistics = results.aggregate(
            average_score=Avg("total_score"),
            highest_score=Max("total_score"),
            lowest_score=Min("total_score"),
        )

        passed_results = results.filter(
            total_score__gte=50
        ).count()

        pass_rate = (
            passed_results / total_results
        ) * 100

        grade_distribution = {}

        for result in results:

            grade = result.grade or "UNGRADED"

            grade_distribution[grade] = (
                grade_distribution.get(grade, 0) + 1
            )

        return Response({
            "message": (
                "Academic performance report "
                "generated successfully."
            ),

            "data": {
                "total_results": total_results,

                "average_score": round(
                    float(
                        statistics["average_score"] or 0
                    ),
                    2,
                ),

                "highest_score": float(
                    statistics["highest_score"] or 0
                ),

                "lowest_score": float(
                    statistics["lowest_score"] or 0
                ),

                "pass_rate": round(
                    pass_rate,
                    2,
                ),

                "grade_distribution": grade_distribution,
            },
        })


# ============================================================
# SUBJECT PERFORMANCE REPORT
# ============================================================

class SubjectPerformanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        results = (
            StudentResult.objects
            .select_related(
                "examination_subject",
                "examination_subject__subject",
            )
            .filter(is_published=True)
        )

        subjects = defaultdict(list)

        for result in results:

            subject = (
                result.examination_subject.subject
            )

            subjects[subject.id].append(result)

        report = []

        for subject_id, subject_results in subjects.items():

            subject = (
                subject_results[0]
                .examination_subject
                .subject
            )

            scores = [
                float(result.total_score)
                for result in subject_results
            ]

            total_results = len(scores)

            average_score = (
                sum(scores) / total_results
            )

            highest_score = max(scores)
            lowest_score = min(scores)

            passed_results = sum(
                1
                for score in scores
                if score >= 50
            )

            pass_rate = (
                passed_results / total_results
            ) * 100

            grade_distribution = {}

            for result in subject_results:

                grade = result.grade or "UNGRADED"

                grade_distribution[grade] = (
                    grade_distribution.get(grade, 0) + 1
                )

            report.append({
                "subject_id": subject.id,
                "subject": subject.name,
                "total_results": total_results,

                "average_score": round(
                    average_score,
                    2,
                ),

                "highest_score": highest_score,
                "lowest_score": lowest_score,

                "pass_rate": round(
                    pass_rate,
                    2,
                ),

                "grade_distribution": (
                    grade_distribution
                ),
            })

        report.sort(
            key=lambda item: item["subject"]
        )

        return Response({
            "message": (
                "Subject performance report "
                "generated successfully."
            ),

            "total_subjects": len(report),
            "subjects": report,
        })


# ============================================================
# ATTENDANCE REPORT
# ============================================================

class AttendanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        records = (
            AttendanceRecord.objects
            .select_related(
                "student",
                "academic_session",
                "term",
                "class_level",
                "subject",
            )
        )

        total_records = records.count()

        present_count = records.filter(
            status=AttendanceRecord.Status.PRESENT
        ).count()

        absent_count = records.filter(
            status=AttendanceRecord.Status.ABSENT
        ).count()

        late_count = records.filter(
            status=AttendanceRecord.Status.LATE
        ).count()

        excused_count = records.filter(
            status=AttendanceRecord.Status.EXCUSED
        ).count()

        attendance_days = (
            present_count
            + late_count
            + absent_count
            + excused_count
        )

        attendance_percentage = 0

        if attendance_days > 0:

            attendance_percentage = (
                (
                    present_count
                    + late_count
                )
                / attendance_days
            ) * 100

        student_data = {}

        for record in records:

            student_id = record.student.id

            if student_id not in student_data:

                student_data[student_id] = {
                    "student_id": student_id,

                    "admission_number": (
                        record.student.admission_number
                    ),

                    "student_name": (
                        record.student.full_name
                    ),

                    "class": record.class_level.name,

                    "total_records": 0,
                    "present": 0,
                    "absent": 0,
                    "late": 0,
                    "excused": 0,
                }

            student_data[
                student_id
            ]["total_records"] += 1

            if (
                record.status
                == AttendanceRecord.Status.PRESENT
            ):

                student_data[
                    student_id
                ]["present"] += 1

            elif (
                record.status
                == AttendanceRecord.Status.ABSENT
            ):

                student_data[
                    student_id
                ]["absent"] += 1

            elif (
                record.status
                == AttendanceRecord.Status.LATE
            ):

                student_data[
                    student_id
                ]["late"] += 1

            elif (
                record.status
                == AttendanceRecord.Status.EXCUSED
            ):

                student_data[
                    student_id
                ]["excused"] += 1

        students = []

        for student in student_data.values():

            total = student["total_records"]

            attended = (
                student["present"]
                + student["late"]
            )

            student["attendance_percentage"] = round(
                (
                    attended / total
                ) * 100
                if total > 0
                else 0,
                2,
            )

            students.append(student)

        students.sort(
            key=lambda item: item["student_name"]
        )

        return Response({
            "message": (
                "Attendance report "
                "generated successfully."
            ),

            "summary": {
                "total_records": total_records,
                "present": present_count,
                "absent": absent_count,
                "late": late_count,
                "excused": excused_count,

                "attendance_percentage": round(
                    attendance_percentage,
                    2,
                ),
            },

            "students": students,
        })


# ============================================================
# FINANCE REPORT
# ============================================================

class FinanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        invoices = (
            StudentInvoice.objects
            .select_related(
                "student",
                "academic_session",
                "term",
                "fee_category",
            )
        )

        successful_payments = Payment.objects.filter(
            status=Payment.Status.SUCCESSFUL
        )

        expenses = Expense.objects.filter(
            status=Expense.Status.PAID
        )

        total_invoices = invoices.count()

        total_invoiced = (
            invoices.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        total_discounts = (
            invoices.aggregate(
                total=Sum("discount")
            )["total"]
            or 0
        )

        total_expected = (
            total_invoiced
            - total_discounts
        )

        total_collected = (
            invoices.aggregate(
                total=Sum("amount_paid")
            )["total"]
            or 0
        )

        total_outstanding = (
            invoices.aggregate(
                total=Sum("balance")
            )["total"]
            or 0
        )

        payment_count = (
            successful_payments.count()
        )

        total_expenses = (
            expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        net_balance = (
            total_collected
            - total_expenses
        )

        collection_rate = 0

        if total_expected > 0:

            collection_rate = (
                total_collected
                / total_expected
            ) * 100

        invoice_status = {

            "paid": invoices.filter(
                status=StudentInvoice.Status.PAID
            ).count(),

            "partial": invoices.filter(
                status=StudentInvoice.Status.PARTIAL
            ).count(),

            "unpaid": invoices.filter(
                status=StudentInvoice.Status.UNPAID
            ).count(),

            "overdue": invoices.filter(
                status=StudentInvoice.Status.OVERDUE
            ).count(),

            "cancelled": invoices.filter(
                status=StudentInvoice.Status.CANCELLED
            ).count(),
        }

        student_data = {}

        for invoice in invoices:

            student_id = invoice.student.id

            if student_id not in student_data:

                student_data[student_id] = {
                    "student_id": student_id,

                    "admission_number": (
                        invoice.student.admission_number
                    ),

                    "student_name": (
                        invoice.student.full_name
                    ),

                    "total_invoiced": 0,
                    "total_discount": 0,
                    "total_paid": 0,
                    "total_balance": 0,
                }

            student_data[
                student_id
            ]["total_invoiced"] += float(
                invoice.amount
            )

            student_data[
                student_id
            ]["total_discount"] += float(
                invoice.discount
            )

            student_data[
                student_id
            ]["total_paid"] += float(
                invoice.amount_paid
            )

            student_data[
                student_id
            ]["total_balance"] += float(
                invoice.balance
            )

        students = list(
            student_data.values()
        )

        students.sort(
            key=lambda item: item["student_name"]
        )

        return Response({

            "message": (
                "Finance report generated successfully."
            ),

            "summary": {

                "total_invoices": total_invoices,

                "total_invoiced": float(
                    total_invoiced
                ),

                "total_discounts": float(
                    total_discounts
                ),

                "total_expected": float(
                    total_expected
                ),

                "total_collected": float(
                    total_collected
                ),

                "total_outstanding": float(
                    total_outstanding
                ),

                "collection_rate": round(
                    float(collection_rate),
                    2,
                ),

                "successful_payment_count": (
                    payment_count
                ),

                "total_expenses": float(
                    total_expenses
                ),

                "net_balance": float(
                    net_balance
                ),
            },

            "invoice_status": invoice_status,

            "students": students,
        })


# ============================================================
# ASSIGNMENT REPORT
# ============================================================

class AssignmentReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        assignments = Assignment.objects.select_related(
            "school",
            "academic_session",
            "term",
            "class_level",
            "subject",
            "teacher",
        )

        submissions = AssignmentSubmission.objects.select_related(
            "assignment",
            "student",
        )

        # ==========================================================
        # ASSIGNMENT COUNTS
        # ==========================================================

        total_assignments = assignments.count()

        published_assignments = assignments.filter(
            status=Assignment.Status.PUBLISHED
        ).count()

        draft_assignments = assignments.filter(
            status=Assignment.Status.DRAFT
        ).count()

        closed_assignments = assignments.filter(
            status=Assignment.Status.CLOSED
        ).count()

        # ==========================================================
        # SUBMISSION COUNTS
        # ==========================================================

        total_submissions = submissions.count()

        submitted_count = submissions.filter(
            status=AssignmentSubmission.Status.SUBMITTED
        ).count()

        late_count = submissions.filter(
            status=AssignmentSubmission.Status.LATE
        ).count()

        graded_count = submissions.filter(
            status=AssignmentSubmission.Status.GRADED
        ).count()

        returned_count = submissions.filter(
            status=AssignmentSubmission.Status.RETURNED
        ).count()

        # ==========================================================
        # AVERAGE ASSIGNMENT SCORE
        # ==========================================================

        graded_submissions = submissions.filter(
            score__isnull=False
        )

        total_scores = graded_submissions.count()

        average_score = 0

        if total_scores > 0:
            score_total = sum(
                float(submission.score)
                for submission in graded_submissions
            )

            average_score = score_total / total_scores

        # ==========================================================
        # EXPECTED SUBMISSIONS
        # ==========================================================

        expected_submissions = 0

        for assignment in assignments:

            student_count = Student.objects.filter(
                enrollments__academic_session=(
                    assignment.academic_session
                ),
                enrollments__term=assignment.term,
                enrollments__class_level=assignment.class_level,
                enrollments__is_current=True,
            ).distinct().count()

            expected_submissions += student_count

        # ==========================================================
        # MISSING SUBMISSIONS
        # ==========================================================

        missing_submissions = (
            expected_submissions - total_submissions
        )

        if missing_submissions < 0:
            missing_submissions = 0

        # ==========================================================
        # SUBMISSION RATE
        # ==========================================================

        submission_rate = 0

        if expected_submissions > 0:
            submission_rate = (
                total_submissions
                / expected_submissions
            ) * 100

        # ==========================================================
        # STUDENT-LEVEL PERFORMANCE
        # ==========================================================

        student_data = {}

        for submission in submissions:

            student_id = submission.student.id

            if student_id not in student_data:

                student_data[student_id] = {
                    "student_id": student_id,

                    "admission_number": (
                        submission.student.admission_number
                    ),

                    "student_name": (
                        submission.student.full_name
                    ),

                    "total_submissions": 0,

                    "submitted": 0,

                    "late": 0,

                    "graded": 0,

                    "returned": 0,

                    "scores": [],
                }

            student_data[
                student_id
            ]["total_submissions"] += 1

            # Submitted on time
            if submission.status == (
                AssignmentSubmission.Status.SUBMITTED
            ):

                student_data[
                    student_id
                ]["submitted"] += 1

            # Late
            elif submission.status == (
                AssignmentSubmission.Status.LATE
            ):

                student_data[
                    student_id
                ]["late"] += 1

            # Graded
            elif submission.status == (
                AssignmentSubmission.Status.GRADED
            ):

                student_data[
                    student_id
                ]["graded"] += 1

            # Returned
            elif submission.status == (
                AssignmentSubmission.Status.RETURNED
            ):

                student_data[
                    student_id
                ]["returned"] += 1

            # Store scores
            if submission.score is not None:

                student_data[
                    student_id
                ]["scores"].append(
                    float(submission.score)
                )

        students = []

        for student in student_data.values():

            scores = student.pop("scores")

            if scores:

                student["average_score"] = round(
                    sum(scores) / len(scores),
                    2,
                )

            else:

                student["average_score"] = 0

            students.append(student)

        students.sort(
            key=lambda item: item["student_name"]
        )

        # ==========================================================
        # RESPONSE
        # ==========================================================

        return Response({

            "message": (
                "Assignment report generated successfully."
            ),

            "summary": {

                "total_assignments": (
                    total_assignments
                ),

                "published_assignments": (
                    published_assignments
                ),

                "draft_assignments": (
                    draft_assignments
                ),

                "closed_assignments": (
                    closed_assignments
                ),

                "total_submissions": (
                    total_submissions
                ),

                "expected_submissions": (
                    expected_submissions
                ),

                "submitted_on_time": (
                    submitted_count
                ),

                "late_submissions": (
                    late_count
                ),

                "graded_submissions": (
                    graded_count
                ),

                "returned_submissions": (
                    returned_count
                ),

                "missing_submissions": (
                    missing_submissions
                ),

                "average_assignment_score": round(
                    average_score,
                    2,
                ),

                "submission_rate": round(
                    submission_rate,
                    2,
                ),
            },

            "students": students,
        })


class TeacherPerformanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        teachers = Teacher.objects.all()

        assignments = Assignment.objects.select_related(
            "teacher",
            "subject",
            "class_level",
            "academic_session",
            "term",
        )

        submissions = AssignmentSubmission.objects.select_related(
            "assignment",
            "student",
            "assignment__teacher",
        )

        total_teachers = teachers.count()

        # ==========================================================
        # TEACHER PERFORMANCE
        # ==========================================================

        teacher_data = {}

        for teacher in teachers:

            teacher_assignments = assignments.filter(
                teacher=teacher
            )

            teacher_submissions = submissions.filter(
                assignment__teacher=teacher
            )

            assignment_count = teacher_assignments.count()

            published_count = teacher_assignments.filter(
                status=Assignment.Status.PUBLISHED
            ).count()

            draft_count = teacher_assignments.filter(
                status=Assignment.Status.DRAFT
            ).count()

            closed_count = teacher_assignments.filter(
                status=Assignment.Status.CLOSED
            ).count()

            total_submissions = teacher_submissions.count()

            graded_submissions = teacher_submissions.filter(
                score__isnull=False
            )

            graded_count = graded_submissions.count()

            average_score = 0

            if graded_count > 0:

                score_total = sum(
                    float(submission.score)
                    for submission in graded_submissions
                )

                average_score = (
                    score_total / graded_count
                )

            # ------------------------------------------------------
            # SUBJECTS TAUGHT
            # ------------------------------------------------------

            subjects = {}

            for assignment in teacher_assignments:

                subject = assignment.subject

                if subject.id not in subjects:

                    subjects[subject.id] = {
                        "subject_id": subject.id,
                        "subject": subject.name,
                        "assignments": 0,
                        "submissions": 0,
                        "average_score": 0,
                        "scores": [],
                    }

                subjects[
                    subject.id
                ]["assignments"] += 1

            # Add submission information per subject
            for submission in teacher_submissions:

                subject = submission.assignment.subject

                if subject.id not in subjects:

                    subjects[subject.id] = {
                        "subject_id": subject.id,
                        "subject": subject.name,
                        "assignments": 0,
                        "submissions": 0,
                        "average_score": 0,
                        "scores": [],
                    }

                subjects[
                    subject.id
                ]["submissions"] += 1

                if submission.score is not None:

                    subjects[
                        subject.id
                    ]["scores"].append(
                        float(submission.score)
                    )

            subject_list = []

            for subject_data in subjects.values():

                scores = subject_data.pop("scores")

                if scores:

                    subject_data[
                        "average_score"
                    ] = round(
                        sum(scores) / len(scores),
                        2,
                    )

                subject_list.append(
                    subject_data
                )

            subject_list.sort(
                key=lambda item: item["subject"]
            )

            # ------------------------------------------------------
            # TEACHER DATA
            # ------------------------------------------------------

            teacher_data[teacher.id] = {

                "teacher_id": teacher.id,

                "teacher_name": (
                    teacher.full_name
                ),

                "total_assignments": (
                    assignment_count
                ),

                "published_assignments": (
                    published_count
                ),

                "draft_assignments": (
                    draft_count
                ),

                "closed_assignments": (
                    closed_count
                ),

                "total_submissions": (
                    total_submissions
                ),

                "graded_submissions": (
                    graded_count
                ),

                "average_score": round(
                    average_score,
                    2,
                ),

                "subjects": subject_list,
            }

        # ==========================================================
        # TEACHERS WITH ASSIGNMENTS
        # ==========================================================

        teachers_with_assignments = sum(
            1
            for teacher in teacher_data.values()
            if teacher["total_assignments"] > 0
        )

        # ==========================================================
        # TOTAL ASSIGNMENTS
        # ==========================================================

        total_assignments = assignments.count()

        published_assignments = assignments.filter(
            status=Assignment.Status.PUBLISHED
        ).count()

        draft_assignments = assignments.filter(
            status=Assignment.Status.DRAFT
        ).count()

        closed_assignments = assignments.filter(
            status=Assignment.Status.CLOSED
        ).count()

        # ==========================================================
        # TOTAL SUBMISSIONS
        # ==========================================================

        total_submissions = submissions.count()

        graded_submissions = submissions.filter(
            score__isnull=False
        ).count()

        # ==========================================================
        # OVERALL AVERAGE SCORE
        # ==========================================================

        scored_submissions = submissions.filter(
            score__isnull=False
        )

        overall_average_score = 0

        if scored_submissions.exists():

            scores = [
                float(submission.score)
                for submission in scored_submissions
            ]

            overall_average_score = (
                sum(scores) / len(scores)
            )

        # ==========================================================
        # RESPONSE
        # ==========================================================

        teacher_list = list(
            teacher_data.values()
        )

        teacher_list.sort(
            key=lambda item: item["teacher_name"]
        )

        return Response({

            "message": (
                "Teacher performance report generated successfully."
            ),

            "summary": {

                "total_teachers": (
                    total_teachers
                ),

                "teachers_with_assignments": (
                    teachers_with_assignments
                ),

                "total_assignments": (
                    total_assignments
                ),

                "published_assignments": (
                    published_assignments
                ),

                "draft_assignments": (
                    draft_assignments
                ),

                "closed_assignments": (
                    closed_assignments
                ),

                "total_submissions": (
                    total_submissions
                ),

                "graded_submissions": (
                    graded_submissions
                ),

                "average_assignment_score": round(
                    overall_average_score,
                    2,
                ),
            },

            "teachers": teacher_list,
        })


class ExaminationReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        examinations = Examination.objects.select_related(
            "school",
            "academic_session",
            "term",
            "class_level",
        ).prefetch_related(
            "subjects__subject",
        )

        examination_subjects = ExaminationSubject.objects.select_related(
            "examination",
            "subject",
        )

        results = StudentResult.objects.select_related(
            "student",
            "examination_subject",
            "examination_subject__examination",
            "examination_subject__subject",
        )

        # ==========================================================
        # EXAMINATION COUNTS
        # ==========================================================

        total_examinations = examinations.count()

        published_examinations = examinations.filter(
            is_published=True
        ).count()

        active_examinations = examinations.filter(
            is_active=True
        ).count()

        inactive_examinations = examinations.filter(
            is_active=False
        ).count()

        # ==========================================================
        # EXAMINATION SUBJECT COUNTS
        # ==========================================================

        total_examination_subjects = (
            examination_subjects.count()
        )

        # ==========================================================
        # RESULT COUNTS
        # ==========================================================

        total_results = results.count()

        published_results = results.filter(
            is_published=True
        ).count()

        # ==========================================================
        # SCORE STATISTICS
        # ==========================================================

        average_score = 0
        highest_score = 0
        lowest_score = 0

        if total_results > 0:

            statistics = results.aggregate(
                average=Avg("total_score"),
                highest=Max("total_score"),
                lowest=Min("total_score"),
            )

            average_score = float(
                statistics["average"] or 0
            )

            highest_score = float(
                statistics["highest"] or 0
            )

            lowest_score = float(
                statistics["lowest"] or 0
            )

        # ==========================================================
        # PASS RATE
        # ==========================================================

        passed_results = results.filter(
            total_score__gte=50
        ).count()

        pass_rate = 0

        if total_results > 0:
            pass_rate = (
                passed_results / total_results
            ) * 100

        # ==========================================================
        # GRADE DISTRIBUTION
        # ==========================================================

        grade_distribution = {}

        for result in results:

            grade = result.grade or "UNGRADED"

            grade_distribution[grade] = (
                grade_distribution.get(grade, 0) + 1
            )

        # ==========================================================
        # PERFORMANCE BY EXAMINATION
        # ==========================================================

        examination_data = {}

        for result in results:

            examination = (
                result.examination_subject.examination
            )

            examination_id = examination.id

            if examination_id not in examination_data:

                examination_data[examination_id] = {
                    "examination_id": examination_id,
                    "examination": examination.name,
                    "examination_type": (
                        examination.get_examination_type_display()
                    ),
                    "class_level": (
                        examination.class_level.name
                    ),
                    "total_subjects": (
                        examination.subjects.count()
                    ),
                    "total_results": 0,
                    "scores": [],
                    "passed": 0,
                    "grades": {},
                }

            data = examination_data[
                examination_id
            ]

            data["total_results"] += 1

            score = float(result.total_score)

            data["scores"].append(score)

            if score >= 50:
                data["passed"] += 1

            grade = result.grade or "UNGRADED"

            data["grades"][grade] = (
                data["grades"].get(grade, 0) + 1
            )

        examinations_report = []

        for data in examination_data.values():

            scores = data.pop("scores")

            if scores:

                data["average_score"] = round(
                    sum(scores) / len(scores),
                    2,
                )

                data["highest_score"] = max(scores)

                data["lowest_score"] = min(scores)

                data["pass_rate"] = round(
                    (
                        data["passed"]
                        / len(scores)
                    ) * 100,
                    2,
                )

            else:

                data["average_score"] = 0
                data["highest_score"] = 0
                data["lowest_score"] = 0
                data["pass_rate"] = 0

            data["grade_distribution"] = data.pop(
                "grades"
            )

            examinations_report.append(data)

        examinations_report.sort(
            key=lambda item: item["examination"]
        )

        # ==========================================================
        # PERFORMANCE BY SUBJECT
        # ==========================================================

        subject_data = {}

        for result in results:

            subject = (
                result.examination_subject.subject
            )

            subject_id = subject.id

            if subject_id not in subject_data:

                subject_data[subject_id] = {
                    "subject_id": subject_id,
                    "subject": subject.name,
                    "total_results": 0,
                    "scores": [],
                    "passed": 0,
                    "grades": {},
                }

            data = subject_data[subject_id]

            data["total_results"] += 1

            score = float(result.total_score)

            data["scores"].append(score)

            if score >= 50:
                data["passed"] += 1

            grade = result.grade or "UNGRADED"

            data["grades"][grade] = (
                data["grades"].get(grade, 0) + 1
            )

        subjects_report = []

        for data in subject_data.values():

            scores = data.pop("scores")

            if scores:

                data["average_score"] = round(
                    sum(scores) / len(scores),
                    2,
                )

                data["highest_score"] = max(scores)

                data["lowest_score"] = min(scores)

                data["pass_rate"] = round(
                    (
                        data["passed"]
                        / len(scores)
                    ) * 100,
                    2,
                )

            else:

                data["average_score"] = 0
                data["highest_score"] = 0
                data["lowest_score"] = 0
                data["pass_rate"] = 0

            data["grade_distribution"] = data.pop(
                "grades"
            )

            subjects_report.append(data)

        subjects_report.sort(
            key=lambda item: item["subject"]
        )

        # ==========================================================
        # STUDENT PERFORMANCE
        # ==========================================================

        student_data = {}

        for result in results:

            student = result.student

            student_id = student.id

            if student_id not in student_data:

                student_data[student_id] = {
                    "student_id": student_id,
                    "admission_number": (
                        student.admission_number
                    ),
                    "student_name": (
                        student.full_name
                    ),
                    "total_results": 0,
                    "scores": [],
                    "passed": 0,
                }

            data = student_data[student_id]

            data["total_results"] += 1

            score = float(result.total_score)

            data["scores"].append(score)

            if score >= 50:
                data["passed"] += 1

        students_report = []

        for data in student_data.values():

            scores = data.pop("scores")

            if scores:

                data["average_score"] = round(
                    sum(scores) / len(scores),
                    2,
                )

                data["highest_score"] = max(scores)

                data["lowest_score"] = min(scores)

                data["pass_rate"] = round(
                    (
                        data["passed"]
                        / len(scores)
                    ) * 100,
                    2,
                )

            else:

                data["average_score"] = 0
                data["highest_score"] = 0
                data["lowest_score"] = 0
                data["pass_rate"] = 0

            students_report.append(data)

        students_report.sort(
            key=lambda item: item["student_name"]
        )

        # ==========================================================
        # RESPONSE
        # ==========================================================

        return Response({

            "message": (
                "Examination report generated successfully."
            ),

            "summary": {

                "total_examinations": (
                    total_examinations
                ),

                "published_examinations": (
                    published_examinations
                ),

                "active_examinations": (
                    active_examinations
                ),

                "inactive_examinations": (
                    inactive_examinations
                ),

                "total_examination_subjects": (
                    total_examination_subjects
                ),

                "total_results": total_results,

                "published_results": (
                    published_results
                ),

                "average_score": round(
                    average_score,
                    2,
                ),

                "highest_score": highest_score,

                "lowest_score": lowest_score,

                "passed_results": passed_results,

                "pass_rate": round(
                    pass_rate,
                    2,
                ),

                "grade_distribution": (
                    grade_distribution
                ),
            },

            "examinations": (
                examinations_report
            ),

            "subjects": subjects_report,

            "students": students_report,
        })


class AcademicOverviewReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        schools = School.objects.all()
        sessions = AcademicSession.objects.all()
        terms = Term.objects.all()
        class_levels = ClassLevel.objects.all()
        subjects = Subject.objects.all()
        students = Student.objects.all()

        # ---------------------------------------------------------
        # BASIC COUNTS
        # ---------------------------------------------------------

        total_schools = schools.count()
        total_sessions = sessions.count()
        total_terms = terms.count()
        total_class_levels = class_levels.count()
        total_subjects = subjects.count()
        total_students = students.count()

        active_students = students.filter(
            status="ACTIVE"
        ).count()

        inactive_students = total_students - active_students

        # ---------------------------------------------------------
        # STUDENTS BY GENDER
        # ---------------------------------------------------------

        gender_distribution = defaultdict(int)

        for student in students:
            gender = student.gender or "UNKNOWN"
            gender_distribution[gender] += 1

        # ---------------------------------------------------------
        # STUDENTS BY CLASS
        # ---------------------------------------------------------

        class_data = {}

        enrollments = students.prefetch_related(
            "enrollments__class_level",
            "enrollments__academic_session",
            "enrollments__term",
        )

        for student in enrollments:

            enrollment = (
                student.enrollments
                .filter(is_current=True)
                .select_related(
                    "class_level",
                    "academic_session",
                    "term",
                )
                .first()
            )

            if not enrollment:
                continue

            class_id = enrollment.class_level.id

            if class_id not in class_data:
                class_data[class_id] = {
                    "class_level_id": class_id,
                    "class_level": enrollment.class_level.name,
                    "student_count": 0,
                }

            class_data[class_id]["student_count"] += 1

        classes = list(class_data.values())

        classes.sort(
            key=lambda item: item["class_level"]
        )

        # ---------------------------------------------------------
        # STUDENTS BY ACADEMIC SESSION
        # ---------------------------------------------------------

        session_data = {}

        for student in students:

            enrollments_for_student = (
                student.enrollments
                .select_related(
                    "academic_session"
                )
            )

            for enrollment in enrollments_for_student:

                session = enrollment.academic_session

                session_id = session.id

                if session_id not in session_data:
                    session_data[session_id] = {
                        "academic_session_id": session_id,
                        "academic_session": session.name,
                        "student_count": 0,
                    }

                session_data[
                    session_id
                ]["student_count"] += 1

        academic_sessions = list(
            session_data.values()
        )

        academic_sessions.sort(
            key=lambda item: item["academic_session"]
        )

        # ---------------------------------------------------------
        # STUDENTS BY TERM
        # ---------------------------------------------------------

        term_data = {}

        for student in students:

            enrollments_for_student = (
                student.enrollments
                .select_related(
                    "term",
                    "academic_session",
                )
            )

            for enrollment in enrollments_for_student:

                term = enrollment.term

                term_id = term.id

                if term_id not in term_data:
                    term_data[term_id] = {
                        "term_id": term_id,
                        "term": term.get_name_display(),
                        "student_count": 0,
                    }

                term_data[
                    term_id
                ]["student_count"] += 1

        terms_data = list(
            term_data.values()
        )

        terms_data.sort(
            key=lambda item: item["term"]
        )

        # ---------------------------------------------------------
        # SUBJECT INFORMATION
        # ---------------------------------------------------------

        subject_data = []

        for subject in subjects.select_related(
            "department"
        ):

            subject_data.append({
                "subject_id": subject.id,
                "subject": subject.name,
                "code": subject.code,
                "department": (
                    subject.department.name
                    if subject.department
                    else None
                ),
                "is_active": subject.is_active,
            })

        subject_data.sort(
            key=lambda item: item["subject"]
        )

        # ---------------------------------------------------------
        # FINAL RESPONSE
        # ---------------------------------------------------------

        return Response({
            "message": (
                "Academic overview report generated successfully."
            ),

            "summary": {
                "total_schools": total_schools,
                "total_academic_sessions": total_sessions,
                "total_terms": total_terms,
                "total_class_levels": total_class_levels,
                "total_subjects": total_subjects,
                "total_students": total_students,
                "active_students": active_students,
                "inactive_students": inactive_students,
            },

            "gender_distribution": dict(
                gender_distribution
            ),

            "classes": classes,

            "academic_sessions": academic_sessions,

            "terms": terms_data,

            "subjects": subject_data,
        })


class EnrollmentAnalyticsReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollments = Student.objects.prefetch_related(
            "enrollments__academic_session",
            "enrollments__term",
            "enrollments__class_level",
        )

        # ---------------------------------------------------------
        # GET ALL ENROLLMENTS
        # ---------------------------------------------------------

        all_enrollments = []

        for student in enrollments:
            for enrollment in student.enrollments.all():
                all_enrollments.append(
                    (student, enrollment)
                )

        total_enrollments = len(all_enrollments)

        # ---------------------------------------------------------
        # ENROLLMENT STATUS
        # ---------------------------------------------------------

        current_enrollments = 0
        completed_enrollments = 0
        withdrawn_enrollments = 0

        status_distribution = defaultdict(int)

        for student, enrollment in all_enrollments:

            if enrollment.is_current:
                current_enrollments += 1

            status = getattr(
                enrollment,
                "status",
                None,
            )

            if status:
                status_distribution[status] += 1

                if status == "COMPLETED":
                    completed_enrollments += 1

                elif status == "WITHDRAWN":
                    withdrawn_enrollments += 1

        # ---------------------------------------------------------
        # ENROLLMENTS BY CLASS
        # ---------------------------------------------------------

        class_data = defaultdict(
            lambda: {
                "class_level_id": None,
                "class_level": None,
                "total_enrollments": 0,
                "current_enrollments": 0,
            }
        )

        for student, enrollment in all_enrollments:

            class_level = enrollment.class_level

            data = class_data[class_level.id]

            data["class_level_id"] = class_level.id
            data["class_level"] = class_level.name
            data["total_enrollments"] += 1

            if enrollment.is_current:
                data["current_enrollments"] += 1

        classes = list(class_data.values())

        classes.sort(
            key=lambda item: item["class_level"]
        )

        # ---------------------------------------------------------
        # ENROLLMENTS BY ACADEMIC SESSION
        # ---------------------------------------------------------

        session_data = defaultdict(
            lambda: {
                "academic_session_id": None,
                "academic_session": None,
                "total_enrollments": 0,
                "current_enrollments": 0,
            }
        )

        for student, enrollment in all_enrollments:

            session = enrollment.academic_session

            data = session_data[session.id]

            data["academic_session_id"] = session.id
            data["academic_session"] = session.name
            data["total_enrollments"] += 1

            if enrollment.is_current:
                data["current_enrollments"] += 1

        sessions = list(
            session_data.values()
        )

        sessions.sort(
            key=lambda item: item["academic_session"]
        )

        # ---------------------------------------------------------
        # ENROLLMENTS BY TERM
        # ---------------------------------------------------------

        term_data = defaultdict(
            lambda: {
                "term_id": None,
                "term": None,
                "total_enrollments": 0,
            }
        )

        for student, enrollment in all_enrollments:

            term = enrollment.term

            data = term_data[term.id]

            data["term_id"] = term.id
            data["term"] = term.get_name_display()
            data["total_enrollments"] += 1

        terms = list(
            term_data.values()
        )

        terms.sort(
            key=lambda item: item["term"]
        )

        # ---------------------------------------------------------
        # ENROLLMENTS BY GENDER
        # ---------------------------------------------------------

        gender_data = defaultdict(
            lambda: {
                "gender": None,
                "total_enrollments": 0,
            }
        )

        for student, enrollment in all_enrollments:

            gender = student.gender or "UNKNOWN"

            data = gender_data[gender]

            data["gender"] = gender
            data["total_enrollments"] += 1

        genders = list(
            gender_data.values()
        )

        genders.sort(
            key=lambda item: item["gender"]
        )

        # ---------------------------------------------------------
        # CURRENT STUDENT DISTRIBUTION
        # ---------------------------------------------------------

        current_students = {}

        for student, enrollment in all_enrollments:

            if not enrollment.is_current:
                continue

            current_students[student.id] = {
                "student_id": student.id,
                "admission_number": (
                    student.admission_number
                ),
                "student_name": student.full_name,
                "class_level": (
                    enrollment.class_level.name
                ),
                "academic_session": (
                    enrollment.academic_session.name
                ),
                "term": (
                    enrollment.term.get_name_display()
                ),
                "roll_number": enrollment.roll_number,
            }

        students = list(
            current_students.values()
        )

        students.sort(
            key=lambda item: item["student_name"]
        )

        # ---------------------------------------------------------
        # FINAL RESPONSE
        # ---------------------------------------------------------

        return Response({
            "message": (
                "Enrollment analytics report "
                "generated successfully."
            ),

            "summary": {
                "total_enrollments": total_enrollments,
                "current_enrollments": current_enrollments,
                "completed_enrollments": (
                    completed_enrollments
                ),
                "withdrawn_enrollments": (
                    withdrawn_enrollments
                ),
                "current_students": len(
                    students
                ),
            },

            "status_distribution": dict(
                status_distribution
            ),

            "by_class": classes,

            "by_academic_session": sessions,

            "by_term": terms,

            "by_gender": genders,

            "current_students": students,
        })