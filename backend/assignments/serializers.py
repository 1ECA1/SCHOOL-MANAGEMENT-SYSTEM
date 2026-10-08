
# from .models import (
#     Assignment,
#     AssignmentSubmission,
# )

# from .services import (
#     student_can_access_assignment, get_student_assignment_access_error,
# )

# from django.utils import timezone
# from rest_framework import serializers

# from teachers.models import TeacherSubject
# from students.models import Student


# # ============================================================
# # ASSIGNMENT SERIALIZER
# # ADMIN / TEACHER
# # ============================================================

# class AssignmentSerializer(serializers.ModelSerializer):
#     school_name = serializers.CharField(
#         source="school.name",
#         read_only=True,
#     )

#     academic_session_name = serializers.CharField(
#         source="academic_session.name",
#         read_only=True,
#     )

#     term_name = serializers.CharField(
#         source="term.name",
#         read_only=True,
#     )

#     class_level_name = serializers.CharField(
#         source="class_level.name",
#         read_only=True,
#     )

#     subject_name = serializers.CharField(
#         source="subject.name",
#         read_only=True,
#     )

#     teacher_name = serializers.CharField(
#         source="teacher.full_name",
#         read_only=True,
#     )

#     status_display = serializers.CharField(
#         source="get_status_display",
#         read_only=True,
#     )

#     submission_count = serializers.SerializerMethodField()
#     submitted_count = serializers.SerializerMethodField()
#     graded_count = serializers.SerializerMethodField()
#     pending_count = serializers.SerializerMethodField()
#     late_count = serializers.SerializerMethodField()

#     class Meta:
#         model = Assignment

#         fields = [
#             "id",

#             "school",
#             "school_name",

#             "academic_session",
#             "academic_session_name",

#             "term",
#             "term_name",

#             "class_level",
#             "class_level_name",

#             "subject",
#             "subject_name",

#             "teacher",
#             "teacher_name",

#             "title",
#             "instructions",
#             "attachment",

#             "assigned_date",
#             "due_date",

#             "maximum_score",
#             "allow_late_submission",

#             "status",
#             "status_display",

#             "submission_count",
#             "submitted_count",
#             "graded_count",
#             "pending_count",
#             "late_count",

#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",

#             "school_name",
#             "academic_session_name",
#             "term_name",
#             "class_level_name",
#             "subject_name",
#             "teacher_name",

#             "status_display",

#             "submission_count",
#             "submitted_count",
#             "graded_count",
#             "pending_count",
#             "late_count",

#             "created_at",
#             "updated_at",
#         ]

#     # ========================================================
#     # ASSIGNMENT COUNTS
#     # ========================================================

#     def get_submission_count(self, obj):
#         return obj.submissions.count()

#     def get_submitted_count(self, obj):
#         return obj.submissions.filter(
#             status__in=[
#                 AssignmentSubmission.Status.SUBMITTED,
#                 AssignmentSubmission.Status.LATE,
#                 AssignmentSubmission.Status.GRADED,
#                 AssignmentSubmission.Status.RETURNED,
#             ]
#         ).count()

#     def get_graded_count(self, obj):
#         return obj.submissions.filter(
#             status=AssignmentSubmission.Status.GRADED
#         ).count()

#     def get_pending_count(self, obj):
#         return obj.submissions.filter(
#             status__in=[
#                 AssignmentSubmission.Status.SUBMITTED,
#                 AssignmentSubmission.Status.LATE,
#             ]
#         ).count()

#     def get_late_count(self, obj):
#         return obj.submissions.filter(
#             status=AssignmentSubmission.Status.LATE
#         ).count()

#     # ========================================================
#     # VALIDATE ASSIGNMENT
#     # ========================================================

#     def validate(self, attrs):
#         maximum_score = attrs.get(
#             "maximum_score",
#             self.instance.maximum_score
#             if self.instance
#             else 100,
#         )

#         if maximum_score <= 0:
#             raise serializers.ValidationError(
#                 {
#                     "maximum_score": (
#                         "Maximum score must be greater than 0."
#                     )
#                 }
#             )

#         request = self.context.get("request")

#         if not request or not request.user.is_authenticated:
#             raise serializers.ValidationError(
#                 "Authentication is required."
#             )

#         user = request.user

#         # ----------------------------------------------------
#         # SUPER ADMIN
#         # ----------------------------------------------------

#         if user.role == user.Role.SUPER_ADMIN:
#             return attrs

#         # ----------------------------------------------------
#         # TEACHER
#         # ----------------------------------------------------

#         if user.role == user.Role.TEACHER:

#             try:
#                 teacher = user.teacher_profile
#             except Exception:
#                 raise serializers.ValidationError(
#                     "Your account is not linked to a teacher profile."
#                 )

#             if "teacher" in attrs:
#                 submitted_teacher = attrs["teacher"]

#                 if submitted_teacher != teacher:
#                     raise serializers.ValidationError(
#                         {
#                             "teacher": (
#                                 "You cannot change the teacher "
#                                 "assigned to this assignment."
#                             )
#                         }
#                     )

#             if "school" in attrs:
#                 submitted_school = attrs["school"]

#                 if submitted_school != teacher.school:
#                     raise serializers.ValidationError(
#                         {
#                             "school": (
#                                 "You cannot change the school "
#                                 "of an assignment."
#                             )
#                         }
#                     )

#             subject = attrs.get("subject")

#             if subject is None and self.instance:
#                 subject = self.instance.subject

#             class_level = attrs.get("class_level")

#             if class_level is None and self.instance:
#                 class_level = self.instance.class_level

#             if subject is None:
#                 raise serializers.ValidationError(
#                     {
#                         "subject": "Subject is required."
#                     }
#                 )

#             if class_level is None:
#                 raise serializers.ValidationError(
#                     {
#                         "class_level": "Class is required."
#                     }
#                 )

#             teacher_is_assigned = TeacherSubject.objects.filter(
#                 teacher=teacher,
#                 subject=subject,
#                 class_level=class_level,
#             ).exists()

#             if not teacher_is_assigned:
#                 raise serializers.ValidationError(
#                     {
#                         "subject": (
#                             "You are not assigned to teach this "
#                             "subject for this class."
#                         )
#                     }
#                 )

#             return attrs

#         raise serializers.ValidationError(
#             "You do not have permission to manage assignments."
#         )


# # ============================================================
# # ASSIGNMENT SUBMISSION SERIALIZER
# # ADMIN / TEACHER
# # ============================================================

# class AssignmentSubmissionSerializer(
#     serializers.ModelSerializer
# ):
#     assignment_title = serializers.CharField(
#         source="assignment.title",
#         read_only=True,
#     )

#     student_name = serializers.CharField(
#         source="student.full_name",
#         read_only=True,
#     )

#     student_admission_number = serializers.CharField(
#         source="student.admission_number",
#         read_only=True,
#     )

#     status_display = serializers.CharField(
#         source="get_status_display",
#         read_only=True,
#     )

#     maximum_score = serializers.DecimalField(
#         source="assignment.maximum_score",
#         max_digits=6,
#         decimal_places=2,
#         read_only=True,
#     )

#     class Meta:
#         model = AssignmentSubmission

#         fields = [
#             "id",

#             "assignment",
#             "assignment_title",

#             "student",
#             "student_name",
#             "student_admission_number",

#             "submission_file",
#             "answer_text",

#             "submitted_at",

#             "score",
#             "maximum_score",

#             "teacher_feedback",

#             "status",
#             "status_display",

#             "graded_at",
#         ]

#         read_only_fields = [
#             "id",

#             "assignment_title",

#             "student_name",
#             "student_admission_number",

#             "submitted_at",

#             "maximum_score",

#             "status_display",

#             "graded_at",
#         ]

#     def create(self, validated_data):
#         return AssignmentSubmission.objects.create(
#             **validated_data
#         )

#     def update(self, instance, validated_data):
#         new_status = validated_data.get(
#             "status",
#             instance.status,
#         )

#         new_score = validated_data.get(
#             "score",
#             instance.score,
#         )

#         if new_score is not None:
#             maximum_score = instance.assignment.maximum_score

#             if new_score < 0:
#                 raise serializers.ValidationError(
#                     {
#                         "score": "Score cannot be less than 0."
#                     }
#                 )

#             if new_score > maximum_score:
#                 raise serializers.ValidationError(
#                     {
#                         "score": (
#                             f"Score cannot be greater than "
#                             f"{maximum_score}."
#                         )
#                     }
#                 )

#         if (
#             new_status == AssignmentSubmission.Status.GRADED
#             and instance.status != AssignmentSubmission.Status.GRADED
#         ):
#             instance.graded_at = timezone.now()

#         if (
#             "score" in validated_data
#             and new_score is not None
#             and "status" not in validated_data
#         ):
#             validated_data["status"] = (
#                 AssignmentSubmission.Status.GRADED
#             )

#             instance.graded_at = timezone.now()

#         return super().update(
#             instance,
#             validated_data,
#         )


# # ============================================================
# # STUDENT ASSIGNMENT SERIALIZER
# # ============================================================

# class StudentSubmissionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AssignmentSubmission

#         fields = [
#             "id",
#             "assignment",
#             "submission_file",
#             "answer_text",
#             "submitted_at",
#             "score",
#             "teacher_feedback",
#             "status",
#             "graded_at",
#         ]

#         read_only_fields = [
#             "id",
#             "submitted_at",
#             "score",
#             "teacher_feedback",
#             "status",
#             "graded_at",
#         ]

#     def _get_student(self):
#         request = self.context.get("request")

#         if not request or not request.user.is_authenticated:
#             return None

#         return getattr(
#             request.user,
#             "student_profile",
#             None,
#         )

#     def validate_assignment(self, assignment):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         # Prevent changing an existing submission
#         # to another assignment.
#         if (
#             self.instance
#             and assignment.id != self.instance.assignment_id
#         ):
#             raise serializers.ValidationError(
#                 "You cannot change the assignment of a submission."
#             )

#         access_error = get_student_assignment_access_error(
#             student,
#             assignment,
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         if assignment.status != Assignment.Status.PUBLISHED:
#             raise serializers.ValidationError(
#                 "This assignment is not available for submission."
#             )

#         return assignment

#     def validate(self, attrs):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         if student.status != Student.Status.ACTIVE:
#             raise serializers.ValidationError(
#                 "Your student account is not active."
#             )

#         # For CREATE.
#         assignment = attrs.get("assignment")

#         # For UPDATE/PATCH, assignment may not be supplied.
#         # Therefore use the existing assignment.
#         if assignment is None and self.instance:
#             assignment = self.instance.assignment

#         if not assignment:
#             raise serializers.ValidationError({
#                 "assignment": "Assignment is required."
#             })

#         # CENTRAL ACCESS CHECK.
#         access_error = get_student_assignment_access_error(
#             student,
#             assignment,
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         if assignment.status != Assignment.Status.PUBLISHED:
#             raise serializers.ValidationError(
#                 "This assignment is not available for submission."
#             )

#         from django.utils import timezone

#         now = timezone.now()

#         if (
#             assignment.due_date
#             and now > assignment.due_date
#             and not assignment.allow_late_submission
#         ):
#             raise serializers.ValidationError(
#                 "The submission deadline has passed."
#             )

#         # Prevent changing assignment during update.
#         if (
#             self.instance
#             and "assignment" in attrs
#             and attrs["assignment"].id
#             != self.instance.assignment_id
#         ):
#             raise serializers.ValidationError({
#                 "assignment": (
#                     "You cannot change the assignment "
#                     "of an existing submission."
#                 )
#             })

#         return attrs

#     def create(self, validated_data):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         assignment = validated_data["assignment"]

#         # Run the access rule one more time immediately
#         # before creating the submission.
#         access_error = get_student_assignment_access_error(
#             student,
#             assignment,
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         from django.utils import timezone

#         now = timezone.now()

#         is_late = (
#             assignment.due_date
#             and now > assignment.due_date
#         )

#         submission, created = (
#             AssignmentSubmission.objects.get_or_create(
#                 assignment=assignment,
#                 student=student,
#                 defaults={
#                     "answer_text": validated_data.get(
#                         "answer_text",
#                         "",
#                     ),
#                     "submission_file": validated_data.get(
#                         "submission_file"
#                     ),
#                     "submitted_at": now,
#                     "status": (
#                         AssignmentSubmission.Status.LATE
#                         if is_late
#                         else AssignmentSubmission.Status.SUBMITTED
#                     ),
#                 },
#             )
#         )

#         if not created:

#             if submission.status in (
#                 AssignmentSubmission.Status.GRADED,
#                 AssignmentSubmission.Status.RETURNED,
#             ):
#                 raise serializers.ValidationError(
#                     "This submission can no longer be changed."
#                 )

#             submission.answer_text = (
#                 validated_data.get(
#                     "answer_text",
#                     submission.answer_text,
#                 )
#             )

#             if "submission_file" in validated_data:
#                 submission.submission_file = (
#                     validated_data["submission_file"]
#                 )

#             submission.submitted_at = now

#             submission.status = (
#                 AssignmentSubmission.Status.LATE
#                 if is_late
#                 else AssignmentSubmission.Status.SUBMITTED
#             )

#             submission.save()

#         return submission

#     def update(self, instance, validated_data):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         # Make absolutely sure the submission belongs
#         # to the logged-in student.
#         if instance.student_id != student.id:
#             raise serializers.ValidationError(
#                 "You cannot modify another student's submission."
#             )

#         assignment = instance.assignment

#         # IMPORTANT:
#         # Re-check subject/class/optional-subject access
#         # during resubmission/update too.
#         access_error = get_student_assignment_access_error(
#             student,
#             assignment,
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         if instance.status in (
#             AssignmentSubmission.Status.GRADED,
#             AssignmentSubmission.Status.RETURNED,
#         ):
#             raise serializers.ValidationError(
#                 "This submission can no longer be changed."
#             )

#         if assignment.status != Assignment.Status.PUBLISHED:
#             raise serializers.ValidationError(
#                 "This assignment is not available for submission."
#             )

#         from django.utils import timezone

#         now = timezone.now()

#         if (
#             assignment.due_date
#             and now > assignment.due_date
#             and not assignment.allow_late_submission
#         ):
#             raise serializers.ValidationError(
#                 "The submission deadline has passed."
#             )

#         validated_data.pop("assignment", None)

#         instance.answer_text = validated_data.get(
#             "answer_text",
#             instance.answer_text,
#         )

#         if "submission_file" in validated_data:
#             instance.submission_file = (
#                 validated_data["submission_file"]
#             )

#         instance.submitted_at = now

#         if (
#             assignment.due_date
#             and now > assignment.due_date
#         ):
#             instance.status = (
#                 AssignmentSubmission.Status.LATE
#             )
#         else:
#             instance.status = (
#                 AssignmentSubmission.Status.SUBMITTED
#             )

#         instance.save()

#         return instance

# # ============================================================
# # STUDENT SUBMISSION SERIALIZER
# # ============================================================

# # ============================================================
# # STUDENT SUBMISSION SERIALIZER
# # ============================================================

# class StudentSubmissionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AssignmentSubmission

#         fields = [
#             "id",
#             "assignment",
#             "submission_file",
#             "answer_text",
#             "submitted_at",
#             "score",
#             "teacher_feedback",
#             "status",
#             "graded_at",
#         ]

#         read_only_fields = [
#             "id",
#             "submitted_at",
#             "score",
#             "teacher_feedback",
#             "status",
#             "graded_at",
#         ]

#     def _get_student(self):
#         request = self.context.get("request")

#         if not request or not request.user.is_authenticated:
#             return None

#         return getattr(
#             request.user,
#             "student_profile",
#             None,
#         )

#     def validate_assignment(self, assignment):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         # Prevent changing an existing submission
#         # to another assignment.
#         if (
#             self.instance
#             and assignment.id != self.instance.assignment_id
#         ):
#             raise serializers.ValidationError(
#                 "You cannot change the assignment of a submission."
#             )

#         access_error = get_student_assignment_access_error(
#             student,
#             assignment,
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         if assignment.status != Assignment.Status.PUBLISHED:
#             raise serializers.ValidationError(
#                 "This assignment is not available for submission."
#             )

#         return assignment

#     def validate(self, attrs):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         if student.status != Student.Status.ACTIVE:
#             raise serializers.ValidationError(
#                 "Your student account is not active."
#             )

#         # For CREATE.
#         assignment = attrs.get("assignment")

#         # For UPDATE/PATCH, assignment may not be supplied.
#         # Therefore use the existing assignment.
#         if assignment is None and self.instance:
#             assignment = self.instance.assignment

#         if not assignment:
#             raise serializers.ValidationError({
#                 "assignment": "Assignment is required."
#             })

#         # CENTRAL ACCESS CHECK.
#         access_error = get_student_assignment_access_error(
#             student,
#             assignment,
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         if assignment.status != Assignment.Status.PUBLISHED:
#             raise serializers.ValidationError(
#                 "This assignment is not available for submission."
#             )

#         from django.utils import timezone

#         now = timezone.now()

#         if (
#             assignment.due_date
#             and now > assignment.due_date
#             and not assignment.allow_late_submission
#         ):
#             raise serializers.ValidationError(
#                 "The submission deadline has passed."
#             )

#         # Prevent changing assignment during update.
#         if (
#             self.instance
#             and "assignment" in attrs
#             and attrs["assignment"].id
#             != self.instance.assignment_id
#         ):
#             raise serializers.ValidationError({
#                 "assignment": (
#                     "You cannot change the assignment "
#                     "of an existing submission."
#                 )
#             })

#         return attrs

#     def create(self, validated_data):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         assignment = validated_data["assignment"]

#         # Run the access rule one more time immediately
#         # before creating the submission.
#         access_error = get_student_assignment_access_error(
#             student,
#             assignment,
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         from django.utils import timezone

#         now = timezone.now()

#         is_late = (
#             assignment.due_date
#             and now > assignment.due_date
#         )

#         submission, created = (
#             AssignmentSubmission.objects.get_or_create(
#                 assignment=assignment,
#                 student=student,
#                 defaults={
#                     "answer_text": validated_data.get(
#                         "answer_text",
#                         "",
#                     ),
#                     "submission_file": validated_data.get(
#                         "submission_file"
#                     ),
#                     "submitted_at": now,
#                     "status": (
#                         AssignmentSubmission.Status.LATE
#                         if is_late
#                         else AssignmentSubmission.Status.SUBMITTED
#                     ),
#                 },
#             )
#         )

#         if not created:

#             if submission.status in (
#                 AssignmentSubmission.Status.GRADED,
#                 AssignmentSubmission.Status.RETURNED,
#             ):
#                 raise serializers.ValidationError(
#                     "This submission can no longer be changed."
#                 )

#             submission.answer_text = (
#                 validated_data.get(
#                     "answer_text",
#                     submission.answer_text,
#                 )
#             )

#             if "submission_file" in validated_data:
#                 submission.submission_file = (
#                     validated_data["submission_file"]
#                 )

#             submission.submitted_at = now

#             submission.status = (
#                 AssignmentSubmission.Status.LATE
#                 if is_late
#                 else AssignmentSubmission.Status.SUBMITTED
#             )

#             submission.save()

#         return submission

#     def update(self, instance, validated_data):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         # Make absolutely sure the submission belongs
#         # to the logged-in student.
#         if instance.student_id != student.id:
#             raise serializers.ValidationError(
#                 "You cannot modify another student's submission."
#             )

#         assignment = instance.assignment

#         # IMPORTANT:
#         # Re-check subject/class/optional-subject access
#         # during resubmission/update too.
#         access_error = get_student_assignment_access_error(
#             student,
#             assignment,
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         if instance.status in (
#             AssignmentSubmission.Status.GRADED,
#             AssignmentSubmission.Status.RETURNED,
#         ):
#             raise serializers.ValidationError(
#                 "This submission can no longer be changed."
#             )

#         if assignment.status != Assignment.Status.PUBLISHED:
#             raise serializers.ValidationError(
#                 "This assignment is not available for submission."
#             )

#         from django.utils import timezone

#         now = timezone.now()

#         if (
#             assignment.due_date
#             and now > assignment.due_date
#             and not assignment.allow_late_submission
#         ):
#             raise serializers.ValidationError(
#                 "The submission deadline has passed."
#             )

#         validated_data.pop("assignment", None)

#         instance.answer_text = validated_data.get(
#             "answer_text",
#             instance.answer_text,
#         )

#         if "submission_file" in validated_data:
#             instance.submission_file = (
#                 validated_data["submission_file"]
#             )

#         instance.submitted_at = now

#         if (
#             assignment.due_date
#             and now > assignment.due_date
#         ):
#             instance.status = (
#                 AssignmentSubmission.Status.LATE
#             )
#         else:
#             instance.status = (
#                 AssignmentSubmission.Status.SUBMITTED
#             )

#         instance.save()

#         return instance
# from rest_framework import serializers

# from teachers.models import TeacherSubject
# from students.models import Student

# from .models import (
#     Assignment,
#     AssignmentSubmission,
# )

# from .services import (
#     student_can_access_assignment,
#     get_student_assignment_access_error,
# )


# # ============================================================
# # ASSIGNMENT SERIALIZER
# # ADMIN / TEACHER
# # ============================================================

# class AssignmentSerializer(serializers.ModelSerializer):
#     school_name = serializers.CharField(
#         source="school.name",
#         read_only=True,
#     )

#     academic_session_name = serializers.CharField(
#         source="academic_session.name",
#         read_only=True,
#     )

#     term_name = serializers.CharField(
#         source="term.name",
#         read_only=True,
#     )

#     class_level_name = serializers.CharField(
#         source="class_level.name",
#         read_only=True,
#     )

#     subject_name = serializers.CharField(
#         source="subject.name",
#         read_only=True,
#     )

#     teacher_name = serializers.CharField(
#         source="teacher.full_name",
#         read_only=True,
#     )

#     status_display = serializers.CharField(
#         source="get_status_display",
#         read_only=True,
#     )

#     submission_count = serializers.SerializerMethodField()
#     submitted_count = serializers.SerializerMethodField()
#     graded_count = serializers.SerializerMethodField()
#     pending_count = serializers.SerializerMethodField()
#     late_count = serializers.SerializerMethodField()

#     class Meta:
#         model = Assignment

#         fields = [
#             "id",

#             "school",
#             "school_name",

#             "academic_session",
#             "academic_session_name",

#             "term",
#             "term_name",

#             "class_level",
#             "class_level_name",

#             "subject",
#             "subject_name",

#             "teacher",
#             "teacher_name",

#             "title",
#             "instructions",
#             "attachment",

#             "assigned_date",
#             "due_date",

#             "maximum_score",
#             "allow_late_submission",

#             "status",
#             "status_display",

#             "submission_count",
#             "submitted_count",
#             "graded_count",
#             "pending_count",
#             "late_count",

#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",

#             "school_name",
#             "academic_session_name",
#             "term_name",
#             "class_level_name",
#             "subject_name",
#             "teacher_name",

#             "status_display",

#             "submission_count",
#             "submitted_count",
#             "graded_count",
#             "pending_count",
#             "late_count",

#             "created_at",
#             "updated_at",
#         ]

#     # ========================================================
#     # ASSIGNMENT COUNTS
#     # ========================================================

#     def get_submission_count(self, obj):
#         return obj.submissions.count()

#     def get_submitted_count(self, obj):
#         return obj.submissions.filter(
#             status__in=[
#                 AssignmentSubmission.Status.SUBMITTED,
#                 AssignmentSubmission.Status.LATE,
#                 AssignmentSubmission.Status.GRADED,
#                 AssignmentSubmission.Status.RETURNED,
#             ]
#         ).count()

#     def get_graded_count(self, obj):
#         return obj.submissions.filter(
#             status=AssignmentSubmission.Status.GRADED
#         ).count()

#     def get_pending_count(self, obj):
#         return obj.submissions.filter(
#             status__in=[
#                 AssignmentSubmission.Status.SUBMITTED,
#                 AssignmentSubmission.Status.LATE,
#             ]
#         ).count()

#     def get_late_count(self, obj):
#         return obj.submissions.filter(
#             status=AssignmentSubmission.Status.LATE
#         ).count()

#     # ========================================================
#     # VALIDATE ASSIGNMENT
#     # ========================================================

#     def validate(self, attrs):
#         maximum_score = attrs.get(
#             "maximum_score",
#             self.instance.maximum_score
#             if self.instance
#             else 100,
#         )

#         if maximum_score <= 0:
#             raise serializers.ValidationError(
#                 {
#                     "maximum_score": (
#                         "Maximum score must be greater than 0."
#                     )
#                 }
#             )

#         request = self.context.get("request")

#         if not request or not request.user.is_authenticated:
#             raise serializers.ValidationError(
#                 "Authentication is required."
#             )

#         user = request.user

#         # ----------------------------------------------------
#         # SUPER ADMIN
#         # ----------------------------------------------------

#         if user.role == user.Role.SUPER_ADMIN:
#             return attrs

#         # ----------------------------------------------------
#         # TEACHER
#         # ----------------------------------------------------

#         if user.role == user.Role.TEACHER:

#             try:
#                 teacher = user.teacher_profile
#             except Exception:
#                 raise serializers.ValidationError(
#                     "Your account is not linked to a teacher profile."
#                 )

#             # ------------------------------------------------
#             # TEACHER SAFETY
#             # ------------------------------------------------

#             if "teacher" in attrs:
#                 submitted_teacher = attrs["teacher"]

#                 if submitted_teacher != teacher:
#                     raise serializers.ValidationError(
#                         {
#                             "teacher": (
#                                 "You cannot change the teacher "
#                                 "assigned to this assignment."
#                             )
#                         }
#                     )

#             if "school" in attrs:
#                 submitted_school = attrs["school"]

#                 if submitted_school != teacher.school:
#                     raise serializers.ValidationError(
#                         {
#                             "school": (
#                                 "You cannot change the school "
#                                 "of an assignment."
#                             )
#                         }
#                     )

#             # ------------------------------------------------
#             # GET SUBJECT
#             # ------------------------------------------------

#             subject = attrs.get("subject")

#             if subject is None and self.instance:
#                 subject = self.instance.subject

#             # ------------------------------------------------
#             # GET CLASS
#             # ------------------------------------------------

#             class_level = attrs.get("class_level")

#             if class_level is None and self.instance:
#                 class_level = self.instance.class_level

#             if subject is None:
#                 raise serializers.ValidationError(
#                     {
#                         "subject": "Subject is required."
#                     }
#                 )

#             if class_level is None:
#                 raise serializers.ValidationError(
#                     {
#                         "class_level": "Class is required."
#                     }
#                 )

#             # ------------------------------------------------
#             # TEACHER SUBJECT ASSIGNMENT
#             # ------------------------------------------------

#             teacher_is_assigned = TeacherSubject.objects.filter(
#                 teacher=teacher,
#                 subject=subject,
#                 class_level=class_level,
#             ).exists()

#             if not teacher_is_assigned:
#                 raise serializers.ValidationError(
#                     {
#                         "subject": (
#                             "You are not assigned to teach this "
#                             "subject for this class."
#                         )
#                     }
#                 )

#             return attrs

#         raise serializers.ValidationError(
#             "You do not have permission to manage assignments."
#         )


# # ============================================================
# # ASSIGNMENT SUBMISSION SERIALIZER
# # ADMIN / TEACHER
# # ============================================================

# class AssignmentSubmissionSerializer(
#     serializers.ModelSerializer
# ):
#     assignment_title = serializers.CharField(
#         source="assignment.title",
#         read_only=True,
#     )

#     student_name = serializers.CharField(
#         source="student.full_name",
#         read_only=True,
#     )

#     student_admission_number = serializers.CharField(
#         source="student.admission_number",
#         read_only=True,
#     )

#     status_display = serializers.CharField(
#         source="get_status_display",
#         read_only=True,
#     )

#     maximum_score = serializers.DecimalField(
#         source="assignment.maximum_score",
#         max_digits=6,
#         decimal_places=2,
#         read_only=True,
#     )

#     class Meta:
#         model = AssignmentSubmission

#         fields = [
#             "id",

#             "assignment",
#             "assignment_title",

#             "student",
#             "student_name",
#             "student_admission_number",

#             "submission_file",
#             "answer_text",

#             "submitted_at",

#             "score",
#             "maximum_score",

#             "teacher_feedback",

#             "status",
#             "status_display",

#             "graded_at",
#         ]

#         read_only_fields = [
#             "id",

#             "assignment_title",

#             "student_name",
#             "student_admission_number",

#             "submitted_at",

#             "maximum_score",

#             "status_display",

#             "graded_at",
#         ]

#     def create(self, validated_data):
#         return AssignmentSubmission.objects.create(
#             **validated_data
#         )

#     def update(self, instance, validated_data):
#         new_status = validated_data.get(
#             "status",
#             instance.status,
#         )

#         new_score = validated_data.get(
#             "score",
#             instance.score,
#         )

#         # ----------------------------------------------------
#         # SCORE VALIDATION
#         # ----------------------------------------------------

#         if new_score is not None:
#             maximum_score = instance.assignment.maximum_score

#             if new_score < 0:
#                 raise serializers.ValidationError(
#                     {
#                         "score": "Score cannot be less than 0."
#                     }
#                 )

#             if new_score > maximum_score:
#                 raise serializers.ValidationError(
#                     {
#                         "score": (
#                             f"Score cannot be greater than "
#                             f"{maximum_score}."
#                         )
#                     }
#                 )

#         # ----------------------------------------------------
#         # GRADING DATE
#         # ----------------------------------------------------

#         if (
#             new_status == AssignmentSubmission.Status.GRADED
#             and instance.status
#             != AssignmentSubmission.Status.GRADED
#         ):
#             instance.graded_at = timezone.now()

#         # ----------------------------------------------------
#         # SCORE WITHOUT STATUS
#         # ----------------------------------------------------

#         if (
#             "score" in validated_data
#             and new_score is not None
#             and "status" not in validated_data
#         ):
#             validated_data["status"] = (
#                 AssignmentSubmission.Status.GRADED
#             )

#             instance.graded_at = timezone.now()

#         return super().update(
#             instance,
#             validated_data,
#         )


# # ============================================================
# # STUDENT ASSIGNMENT SERIALIZER
# # ============================================================

# class StudentAssignmentSerializer(serializers.ModelSerializer):
#     """
#     Serializer used when a student views assignments.

#     The queryset in the student assignment views should already
#     restrict assignments to subjects the student can access.

#     We ALSO check access here so the serializer itself does not
#     accidentally expose an unauthorized assignment.
#     """

#     school_name = serializers.CharField(
#         source="school.name",
#         read_only=True,
#     )

#     academic_session_name = serializers.CharField(
#         source="academic_session.name",
#         read_only=True,
#     )

#     term_name = serializers.CharField(
#         source="term.name",
#         read_only=True,
#     )

#     class_level_name = serializers.CharField(
#         source="class_level.name",
#         read_only=True,
#     )

#     subject_name = serializers.CharField(
#         source="subject.name",
#         read_only=True,
#     )

#     teacher_name = serializers.SerializerMethodField()

#     has_submitted = serializers.SerializerMethodField()

#     my_submission = serializers.SerializerMethodField()

#     is_overdue = serializers.SerializerMethodField()

#     can_submit = serializers.SerializerMethodField()

#     class Meta:
#         model = Assignment

#         fields = [
#             "id",

#             "school",
#             "school_name",

#             "academic_session",
#             "academic_session_name",

#             "term",
#             "term_name",

#             "class_level",
#             "class_level_name",

#             "subject",
#             "subject_name",

#             "teacher",
#             "teacher_name",

#             "title",
#             "instructions",
#             "attachment",

#             "assigned_date",
#             "due_date",

#             "maximum_score",
#             "allow_late_submission",

#             "status",

#             "created_at",
#             "updated_at",

#             "has_submitted",
#             "my_submission",
#             "is_overdue",
#             "can_submit",
#         ]

#         read_only_fields = [
#             "id",

#             "school",
#             "school_name",

#             "academic_session",
#             "academic_session_name",

#             "term",
#             "term_name",

#             "class_level",
#             "class_level_name",

#             "subject",
#             "subject_name",

#             "teacher",
#             "teacher_name",

#             "title",
#             "instructions",
#             "attachment",

#             "assigned_date",
#             "due_date",

#             "maximum_score",
#             "allow_late_submission",

#             "status",

#             "created_at",
#             "updated_at",

#             "has_submitted",
#             "my_submission",
#             "is_overdue",
#             "can_submit",
#         ]

#     # ========================================================
#     # GET LOGGED-IN STUDENT
#     # ========================================================

#     def _get_student(self):
#         request = self.context.get("request")

#         if not request:
#             return None

#         if not request.user.is_authenticated:
#             return None

#         return getattr(
#             request.user,
#             "student_profile",
#             None,
#         )

#     # ========================================================
#     # TEACHER NAME
#     # ========================================================

#     def get_teacher_name(self, obj):
#         if not obj.teacher:
#             return None

#         return obj.teacher.full_name

#     # ========================================================
#     # HAS SUBMITTED
#     # ========================================================

#     def get_has_submitted(self, obj):
#         student = self._get_student()

#         if not student:
#             return False

#         # Safety check.
#         if not student_can_access_assignment(
#             student,
#             obj,
#         ):
#             return False

#         return AssignmentSubmission.objects.filter(
#             assignment=obj,
#             student=student,
#         ).exists()

#     # ========================================================
#     # MY SUBMISSION
#     # ========================================================

#     def get_my_submission(self, obj):
#         student = self._get_student()

#         if not student:
#             return None

#         # Safety check.
#         if not student_can_access_assignment(
#             student,
#             obj,
#         ):
#             return None

#         submission = (
#             AssignmentSubmission.objects
#             .filter(
#                 assignment=obj,
#                 student=student,
#             )
#             .first()
#         )

#         if not submission:
#             return None

#         return {
#             "id": submission.id,
#             "answer_text": submission.answer_text,
#             "submission_file": (
#                 submission.submission_file.url
#                 if submission.submission_file
#                 else None
#             ),
#             "submitted_at": submission.submitted_at,
#             "score": submission.score,
#             "teacher_feedback": submission.teacher_feedback,
#             "status": submission.status,
#             "graded_at": submission.graded_at,
#         }

#     # ========================================================
#     # IS OVERDUE
#     # ========================================================

#     def get_is_overdue(self, obj):
#         if not obj.due_date:
#             return False

#         return timezone.now() > obj.due_date

#     # ========================================================
#     # CAN SUBMIT
#     # ========================================================

#     def get_can_submit(self, obj):
#         student = self._get_student()

#         if not student:
#             return False

#         # ----------------------------------------------------
#         # CENTRAL ASSIGNMENT ACCESS CHECK
#         # ----------------------------------------------------

#         if not student_can_access_assignment(
#             student,
#             obj,
#         ):
#             return False

#         # ----------------------------------------------------
#         # ASSIGNMENT MUST BE PUBLISHED
#         # ----------------------------------------------------

#         if obj.status != Assignment.Status.PUBLISHED:
#             return False

#         # ----------------------------------------------------
#         # CHECK DEADLINE
#         # ----------------------------------------------------

#         now = timezone.now()

#         if not obj.due_date:
#             return True

#         if now <= obj.due_date:
#             return True

#         # ----------------------------------------------------
#         # LATE SUBMISSION
#         # ----------------------------------------------------

#         return obj.allow_late_submission


# # ============================================================
# # STUDENT SUBMISSION SERIALIZER
# # ============================================================

# class StudentSubmissionSerializer(serializers.ModelSerializer):
#     """
#     Serializer used by students to create and update their
#     assignment submissions.

#     Assignment access is checked here as well as in the views.

#     This is important because hiding an assignment from the list
#     is NOT enough security. A student must also be prevented from
#     submitting directly against a guessed assignment ID.
#     """

#     class Meta:
#         model = AssignmentSubmission

#         fields = [
#             "id",
#             "assignment",
#             "submission_file",
#             "answer_text",
#             "submitted_at",
#             "score",
#             "teacher_feedback",
#             "status",
#             "graded_at",
#         ]

#         read_only_fields = [
#             "id",
#             "submitted_at",
#             "score",
#             "teacher_feedback",
#             "status",
#             "graded_at",
#         ]

#     # ========================================================
#     # GET LOGGED-IN STUDENT
#     # ========================================================

#     def _get_student(self):
#         request = self.context.get("request")

#         if not request:
#             return None

#         if not request.user.is_authenticated:
#             return None

#         return getattr(
#             request.user,
#             "student_profile",
#             None,
#         )

#     # ========================================================
#     # VALIDATE ASSIGNMENT
#     # ========================================================

#     def validate_assignment(self, assignment):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         # ----------------------------------------------------
#         # DO NOT ALLOW CHANGING ASSIGNMENT ON UPDATE
#         # ----------------------------------------------------

#         if (
#             self.instance
#             and assignment.id
#             != self.instance.assignment_id
#         ):
#             raise serializers.ValidationError(
#                 "You cannot change the assignment of a submission."
#             )

#         # ----------------------------------------------------
#         # CENTRAL ACCESS CHECK
#         # ----------------------------------------------------

#         access_error = (
#             get_student_assignment_access_error(
#                 student,
#                 assignment,
#             )
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         # ----------------------------------------------------
#         # ASSIGNMENT MUST BE PUBLISHED
#         # ----------------------------------------------------

#         if assignment.status != Assignment.Status.PUBLISHED:
#             raise serializers.ValidationError(
#                 "This assignment is not available for submission."
#             )

#         return assignment

#     # ========================================================
#     # GENERAL VALIDATION
#     # ========================================================

#     def validate(self, attrs):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         if student.status != Student.Status.ACTIVE:
#             raise serializers.ValidationError(
#                 "Your student account is not active."
#             )

#         # ----------------------------------------------------
#         # CREATE
#         # ----------------------------------------------------

#         assignment = attrs.get("assignment")

#         # ----------------------------------------------------
#         # UPDATE / PATCH
#         # ----------------------------------------------------

#         if assignment is None and self.instance:
#             assignment = self.instance.assignment

#         if not assignment:
#             raise serializers.ValidationError(
#                 {
#                     "assignment": "Assignment is required."
#                 }
#             )

#         # ----------------------------------------------------
#         # CENTRAL ACCESS CHECK
#         # ----------------------------------------------------

#         access_error = (
#             get_student_assignment_access_error(
#                 student,
#                 assignment,
#             )
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         # ----------------------------------------------------
#         # PUBLISHED CHECK
#         # ----------------------------------------------------

#         if assignment.status != Assignment.Status.PUBLISHED:
#             raise serializers.ValidationError(
#                 "This assignment is not available for submission."
#             )

#         # ----------------------------------------------------
#         # DEADLINE
#         # ----------------------------------------------------

#         now = timezone.now()

#         if (
#             assignment.due_date
#             and now > assignment.due_date
#             and not assignment.allow_late_submission
#         ):
#             raise serializers.ValidationError(
#                 "The submission deadline has passed."
#             )

#         # ----------------------------------------------------
#         # DO NOT ALLOW ASSIGNMENT SWITCHING
#         # ----------------------------------------------------

#         if (
#             self.instance
#             and "assignment" in attrs
#             and attrs["assignment"].id
#             != self.instance.assignment_id
#         ):
#             raise serializers.ValidationError(
#                 {
#                     "assignment": (
#                         "You cannot change the assignment "
#                         "of an existing submission."
#                     )
#                 }
#             )

#         return attrs

#     # ========================================================
#     # CREATE SUBMISSION
#     # ========================================================

#     def create(self, validated_data):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         assignment = validated_data["assignment"]

#         # ----------------------------------------------------
#         # FINAL ACCESS CHECK
#         # ----------------------------------------------------

#         access_error = (
#             get_student_assignment_access_error(
#                 student,
#                 assignment,
#             )
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         # ----------------------------------------------------
#         # PUBLISHED CHECK
#         # ----------------------------------------------------

#         if assignment.status != Assignment.Status.PUBLISHED:
#             raise serializers.ValidationError(
#                 "This assignment is not available for submission."
#             )

#         now = timezone.now()

#         # ----------------------------------------------------
#         # DETERMINE LATE STATUS
#         # ----------------------------------------------------

#         is_late = (
#             assignment.due_date
#             and now > assignment.due_date
#         )

#         # ----------------------------------------------------
#         # CREATE OR GET EXISTING SUBMISSION
#         # ----------------------------------------------------

#         submission, created = (
#             AssignmentSubmission.objects.get_or_create(
#                 assignment=assignment,
#                 student=student,
#                 defaults={
#                     "answer_text": validated_data.get(
#                         "answer_text",
#                         "",
#                     ),
#                     "submission_file": validated_data.get(
#                         "submission_file"
#                     ),
#                     "submitted_at": now,
#                     "status": (
#                         AssignmentSubmission.Status.LATE
#                         if is_late
#                         else AssignmentSubmission.Status.SUBMITTED
#                     ),
#                 },
#             )
#         )

#         # ====================================================
#         # EXISTING SUBMISSION = RESUBMISSION
#         # ====================================================

#         if not created:

#             # ------------------------------------------------
#             # GRADED / RETURNED CANNOT BE CHANGED
#             # ------------------------------------------------

#             if submission.status in (
#                 AssignmentSubmission.Status.GRADED,
#                 AssignmentSubmission.Status.RETURNED,
#             ):
#                 raise serializers.ValidationError(
#                     "This submission can no longer be changed."
#                 )

#             # ------------------------------------------------
#             # UPDATE ANSWER
#             # ------------------------------------------------

#             submission.answer_text = (
#                 validated_data.get(
#                     "answer_text",
#                     submission.answer_text,
#                 )
#             )

#             # ------------------------------------------------
#             # UPDATE FILE IF PROVIDED
#             # ------------------------------------------------

#             if "submission_file" in validated_data:
#                 submission.submission_file = (
#                     validated_data["submission_file"]
#                 )

#             submission.submitted_at = now

#             submission.status = (
#                 AssignmentSubmission.Status.LATE
#                 if is_late
#                 else AssignmentSubmission.Status.SUBMITTED
#             )

#             submission.save()

#         return submission

#     # ========================================================
#     # UPDATE / RESUBMIT
#     # ========================================================

#     def update(self, instance, validated_data):
#         student = self._get_student()

#         if not student:
#             raise serializers.ValidationError(
#                 "Student profile was not found."
#             )

#         # ----------------------------------------------------
#         # STUDENT OWNERSHIP CHECK
#         # ----------------------------------------------------

#         if instance.student_id != student.id:
#             raise serializers.ValidationError(
#                 "You cannot modify another student's submission."
#             )

#         assignment = instance.assignment

#         # ----------------------------------------------------
#         # RE-CHECK ASSIGNMENT ACCESS
#         # ----------------------------------------------------

#         access_error = (
#             get_student_assignment_access_error(
#                 student,
#                 assignment,
#             )
#         )

#         if access_error:
#             raise serializers.ValidationError(
#                 access_error
#             )

#         # ----------------------------------------------------
#         # GRADED / RETURNED
#         # ----------------------------------------------------

#         if instance.status in (
#             AssignmentSubmission.Status.GRADED,
#             AssignmentSubmission.Status.RETURNED,
#         ):
#             raise serializers.ValidationError(
#                 "This submission can no longer be changed."
#             )

#         # ----------------------------------------------------
#         # ASSIGNMENT MUST BE PUBLISHED
#         # ----------------------------------------------------

#         if assignment.status != Assignment.Status.PUBLISHED:
#             raise serializers.ValidationError(
#                 "This assignment is not available for submission."
#             )

#         # ----------------------------------------------------
#         # DEADLINE
#         # ----------------------------------------------------

#         now = timezone.now()

#         if (
#             assignment.due_date
#             and now > assignment.due_date
#             and not assignment.allow_late_submission
#         ):
#             raise serializers.ValidationError(
#                 "The submission deadline has passed."
#             )

#         # ----------------------------------------------------
#         # DO NOT ALLOW ASSIGNMENT TO BE CHANGED
#         # ----------------------------------------------------

#         validated_data.pop(
#             "assignment",
#             None,
#         )

#         # ----------------------------------------------------
#         # UPDATE ANSWER
#         # ----------------------------------------------------

#         instance.answer_text = validated_data.get(
#             "answer_text",
#             instance.answer_text,
#         )

#         # ----------------------------------------------------
#         # UPDATE FILE
#         # ----------------------------------------------------

#         if "submission_file" in validated_data:
#             instance.submission_file = (
#                 validated_data["submission_file"]
#             )

#         # ----------------------------------------------------
#         # UPDATE SUBMISSION TIME
#         # ----------------------------------------------------

#         instance.submitted_at = now

#         # ----------------------------------------------------
#         # UPDATE STATUS
#         # ----------------------------------------------------

#         if (
#             assignment.due_date
#             and now > assignment.due_date
#         ):
#             instance.status = (
#                 AssignmentSubmission.Status.LATE
#             )
#         else:
#             instance.status = (
#                 AssignmentSubmission.Status.SUBMITTED
#             )

#         instance.save()

#         return instance



from django.utils import timezone
from rest_framework import serializers

from accounts.models import User
from academics.models import ClassSubject
from teachers.models import (
    Teacher,
    TeacherSubject,
    ClassTeacher,
)
from students.models import Student

from .models import (
    Assignment,
    AssignmentSubmission,
)

from .services import (
    student_can_access_assignment,
    get_student_assignment_access_error,
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_teacher_profile(user):
    """
    Return the Teacher profile connected to the logged-in user.
    """

    if not user:
        return None

    try:
        return user.teacher_profile
    except (Teacher.DoesNotExist, AttributeError):
        return None


def teacher_is_subject_teacher(
    teacher,
    subject,
    class_level,
):
    """
    Check whether a teacher is assigned to teach this
    subject for this class.
    """

    if not teacher or not subject or not class_level:
        return False

    return TeacherSubject.objects.filter(
        teacher=teacher,
        subject=subject,
        class_level=class_level,
    ).exists()


def teacher_is_class_teacher(
    teacher,
    class_level,
    academic_session,
):
    """
    Check whether this teacher is the active class teacher
    for this class during this academic session.
    """

    if not teacher or not class_level or not academic_session:
        return False

    return ClassTeacher.objects.filter(
        teacher=teacher,
        class_level=class_level,
        academic_session=academic_session,
        is_active=True,
    ).exists()


def teacher_can_manage_assignment(
    teacher,
    assignment,
):
    """
    A teacher can manage an assignment when they are:

        1. The teacher assigned to the assignment, OR
        2. The subject teacher for that subject/class, OR
        3. The class teacher for that class/session.
    """

    if not teacher or not assignment:
        return False

    # --------------------------------------------------------
    # Same school is mandatory
    # --------------------------------------------------------

    if teacher.school_id != assignment.school_id:
        return False

    # --------------------------------------------------------
    # Assignment teacher
    # --------------------------------------------------------

    if assignment.teacher_id == teacher.id:
        return True

    # --------------------------------------------------------
    # Subject teacher
    # --------------------------------------------------------

    if teacher_is_subject_teacher(
        teacher=teacher,
        subject=assignment.subject,
        class_level=assignment.class_level,
    ):
        return True

    # --------------------------------------------------------
    # Class teacher
    # --------------------------------------------------------

    if teacher_is_class_teacher(
        teacher=teacher,
        class_level=assignment.class_level,
        academic_session=assignment.academic_session,
    ):
        return True

    return False


# ============================================================
# ASSIGNMENT SERIALIZER
# ============================================================
class AssignmentSerializer(serializers.ModelSerializer):

    # =========================================================
    # DISPLAY FIELDS
    # =========================================================

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    academic_session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    teacher_name = serializers.CharField(
        source="teacher.full_name",
        read_only=True,
        allow_null=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    # =========================================================
    # SUBMISSION COUNTS
    # =========================================================

    submission_count = serializers.SerializerMethodField()
    submitted_count = serializers.SerializerMethodField()
    graded_count = serializers.SerializerMethodField()
    pending_count = serializers.SerializerMethodField()
    late_count = serializers.SerializerMethodField()

    # =========================================================
    # TARGET STUDENTS
    # =========================================================
    #
    # Principal assignments can target:
    #
    #   WHOLE_CLASS
    #       target_students = []
    #
    #   SELECTED_STUDENTS
    #       target_students = [student IDs]
    #
    # =========================================================

    target_students = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Student.objects.all(),
        required=False,
    )

    # =========================================================
    # META
    # =========================================================

    class Meta:
        model = Assignment

        fields = [
            "id",

            # -------------------------------------------------
            # SCHOOL
            # -------------------------------------------------

            "school",
            "school_name",

            # -------------------------------------------------
            # ACADEMIC STRUCTURE
            # -------------------------------------------------

            "academic_session",
            "academic_session_name",

            "term",
            "term_name",

            "class_level",
            "class_level_name",

            "subject",
            "subject_name",

            # -------------------------------------------------
            # TEACHER
            # -------------------------------------------------

            "teacher",
            "teacher_name",

            # -------------------------------------------------
            # TARGETING
            # -------------------------------------------------

            "target_type",
            "target_students",

            # -------------------------------------------------
            # ASSIGNMENT DATA
            # -------------------------------------------------

            "title",
            "instructions",
            "attachment",

            "assigned_date",
            "due_date",

            "maximum_score",
            "allow_late_submission",

            "status",
            "status_display",

            # -------------------------------------------------
            # STATISTICS
            # -------------------------------------------------

            "submission_count",
            "submitted_count",
            "graded_count",
            "pending_count",
            "late_count",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "created_at",
            "updated_at",

            "school_name",
            "academic_session_name",
            "term_name",
            "class_level_name",
            "subject_name",
            "teacher_name",
            "status_display",

            "submission_count",
            "submitted_count",
            "graded_count",
            "pending_count",
            "late_count",
        ]

        extra_kwargs = {
            "school": {
                "required": False,
                "allow_null": True,
            },

            "teacher": {
                "required": False,
                "allow_null": True,
            },

            "target_type": {
                "required": False,
            },
        }

    # =========================================================
    # STATISTICS
    # =========================================================

    def get_submission_count(self, obj):
        return obj.submissions.count()

    def get_submitted_count(self, obj):
        return obj.submissions.filter(
            status__in=[
                AssignmentSubmission.Status.SUBMITTED,
                AssignmentSubmission.Status.LATE,
            ]
        ).count()

    def get_graded_count(self, obj):
        return obj.submissions.filter(
            status=AssignmentSubmission.Status.GRADED
        ).count()

    def get_pending_count(self, obj):
        return obj.submissions.filter(
            status__in=[
                AssignmentSubmission.Status.SUBMITTED,
                AssignmentSubmission.Status.LATE,
            ]
        ).count()

    def get_late_count(self, obj):
        return obj.submissions.filter(
            status=AssignmentSubmission.Status.LATE
        ).count()

    # =========================================================
    # VALIDATION
    # =========================================================

    def validate(self, attrs):

        request = self.context.get("request")

        if not request or not request.user:
            raise serializers.ValidationError(
                "Authenticated user information is required."
            )

        user = request.user

        # =====================================================
        # BASIC VALIDATION
        # =====================================================

        maximum_score = attrs.get(
            "maximum_score",
            getattr(
                self.instance,
                "maximum_score",
                None,
            ),
        )

        if maximum_score is not None and maximum_score <= 0:
            raise serializers.ValidationError({
                "maximum_score": (
                    "Maximum score must be greater than zero."
                )
            })

        # =====================================================
        # RELATIONSHIP VALUES
        # =====================================================

        school = attrs.get(
            "school",
            getattr(
                self.instance,
                "school",
                None,
            ),
        )

        academic_session = attrs.get(
            "academic_session",
            getattr(
                self.instance,
                "academic_session",
                None,
            ),
        )

        term = attrs.get(
            "term",
            getattr(
                self.instance,
                "term",
                None,
            ),
        )

        class_level = attrs.get(
            "class_level",
            getattr(
                self.instance,
                "class_level",
                None,
            ),
        )

        subject = attrs.get(
            "subject",
            getattr(
                self.instance,
                "subject",
                None,
            ),
        )

        teacher = attrs.get(
            "teacher",
            getattr(
                self.instance,
                "teacher",
                None,
            ),
        )

        target_type = attrs.get(
            "target_type",
            getattr(
                self.instance,
                "target_type",
                Assignment.TargetType.WHOLE_CLASS,
            ),
        )

        # -----------------------------------------------------
        # IMPORTANT:
        #
        # We need to distinguish between:
        #
        #   target_students omitted
        #
        # and:
        #
        #   target_students explicitly sent as []
        #
        # This matters during PATCH.
        # -----------------------------------------------------

        target_students_supplied = (
            "target_students" in attrs
        )

        if target_students_supplied:
            target_students = attrs.get(
                "target_students"
            ) or []
        elif self.instance:
            target_students = list(
                self.instance.target_students.all()
            )
        else:
            target_students = []

        # =====================================================
        # VALID TARGET TYPE
        # =====================================================

        valid_target_types = {
            Assignment.TargetType.WHOLE_CLASS,
            Assignment.TargetType.SELECTED_STUDENTS,
        }

        if target_type not in valid_target_types:
            raise serializers.ValidationError({
                "target_type": (
                    "Invalid assignment target type."
                )
            })

        # =====================================================
        # WHOLE CLASS
        # =====================================================

        if target_type == Assignment.TargetType.WHOLE_CLASS:

            if target_students_supplied and target_students:
                raise serializers.ValidationError({
                    "target_students": (
                        "Target students must be empty when "
                        "the assignment target is WHOLE_CLASS."
                    )
                })

            # Always keep whole-class assignments clean.
            attrs["target_students"] = []

        # =====================================================
        # SELECTED STUDENTS
        # =====================================================

        elif target_type == Assignment.TargetType.SELECTED_STUDENTS:

            if not target_students:
                raise serializers.ValidationError({
                    "target_students": (
                        "At least one student must be selected "
                        "for a SELECTED_STUDENTS assignment."
                    )
                })

        # =====================================================
        # TEACHER
        # =====================================================
        #
        # Teacher-created assignments continue to use the
        # authenticated teacher profile.
        #
        # Teacher targeting remains WHOLE_CLASS.
        #
        # Principal targeting supports both modes.
        # =====================================================

        if user.role == User.Role.TEACHER:

            current_teacher = get_teacher_profile(user)

            if not current_teacher:
                raise serializers.ValidationError(
                    "Your teacher profile was not found."
                )

            if not current_teacher.school_id:
                raise serializers.ValidationError(
                    "Your teacher profile is not linked "
                    "to a school."
                )

            # -------------------------------------------------
            # Force authenticated teacher
            # -------------------------------------------------

            school = current_teacher.school
            teacher = current_teacher

            # -------------------------------------------------
            # Teachers create whole-class assignments.
            # -------------------------------------------------

            if target_type != Assignment.TargetType.WHOLE_CLASS:
                raise serializers.ValidationError({
                    "target_type": (
                        "Teachers can only create "
                        "WHOLE_CLASS assignments."
                    )
                })

            attrs["target_type"] = (
                Assignment.TargetType.WHOLE_CLASS
            )

            attrs["target_students"] = []

            # -------------------------------------------------
            # REQUIRED ACADEMIC RELATIONSHIPS
            # -------------------------------------------------

            if not academic_session:
                raise serializers.ValidationError({
                    "academic_session": (
                        "Academic session is required."
                    )
                })

            if not term:
                raise serializers.ValidationError({
                    "term": (
                        "Term is required."
                    )
                })

            if not class_level:
                raise serializers.ValidationError({
                    "class_level": (
                        "Class level is required."
                    )
                })

            if not subject:
                raise serializers.ValidationError({
                    "subject": (
                        "Subject is required."
                    )
                })

            # -------------------------------------------------
            # SESSION SCHOOL
            # -------------------------------------------------

            if (
                academic_session.school_id
                != current_teacher.school_id
            ):
                raise serializers.ValidationError({
                    "academic_session": (
                        "You cannot create an assignment "
                        "for an academic session outside "
                        "your school."
                    )
                })

            # -------------------------------------------------
            # CLASS SCHOOL
            # -------------------------------------------------

            if (
                class_level.school_id
                != current_teacher.school_id
            ):
                raise serializers.ValidationError({
                    "class_level": (
                        "You cannot create an assignment "
                        "for a class outside your school."
                    )
                })

            # -------------------------------------------------
            # SUBJECT SCHOOL
            # -------------------------------------------------

            if (
                subject.school_id
                != current_teacher.school_id
            ):
                raise serializers.ValidationError({
                    "subject": (
                        "You cannot create an assignment "
                        "for a subject outside your school."
                    )
                })

            # -------------------------------------------------
            # TERM SESSION
            # -------------------------------------------------

            if (
                term.academic_session_id
                != academic_session.id
            ):
                raise serializers.ValidationError({
                    "term": (
                        "The selected term does not belong "
                        "to the selected academic session."
                    )
                })

            # -------------------------------------------------
            # CLASS SUBJECT
            # -------------------------------------------------

            if not ClassSubject.objects.filter(
                class_level=class_level,
                subject=subject,
                is_active=True,
            ).exists():
                raise serializers.ValidationError({
                    "subject": (
                        "This subject is not assigned to the "
                        "selected class."
                    )
                })

            # -------------------------------------------------
            # UPDATE ACCESS
            # -------------------------------------------------

            if self.instance:

                if not teacher_can_manage_assignment(
                    current_teacher,
                    self.instance,
                ):
                    raise serializers.ValidationError(
                        "You are not authorized to manage "
                        "this assignment."
                    )

            # -------------------------------------------------
            # SUBJECT TEACHER / CLASS TEACHER
            # -------------------------------------------------

            is_subject_teacher = (
                teacher_is_subject_teacher(
                    teacher=current_teacher,
                    subject=subject,
                    class_level=class_level,
                )
            )

            is_class_teacher = (
                teacher_is_class_teacher(
                    teacher=current_teacher,
                    class_level=class_level,
                    academic_session=academic_session,
                )
            )

            if (
                not is_subject_teacher
                and not is_class_teacher
            ):
                raise serializers.ValidationError({
                    "teacher": (
                        "You are not authorized to create "
                        "or manage assignments for this "
                        "class and subject. You must be "
                        "assigned as the subject teacher "
                        "or class teacher."
                    )
                })

            # -------------------------------------------------
            # FORCE VALUES
            # -------------------------------------------------

            attrs["school"] = current_teacher.school
            attrs["teacher"] = current_teacher

            return attrs

        # =====================================================
        # PRINCIPAL
        # =====================================================

        if user.role == User.Role.PRINCIPAL:

            if not user.school_id:
                raise serializers.ValidationError(
                    "Your principal account is not linked "
                    "to a school."
                )

            # -------------------------------------------------
            # SCHOOL
            # -------------------------------------------------

            if not school:
                raise serializers.ValidationError({
                    "school": (
                        "School is required."
                    )
                })

            if school.id != user.school_id:
                raise serializers.ValidationError({
                    "school": (
                        "You can only manage assignments "
                        "belonging to your school."
                    )
                })

            # -------------------------------------------------
            # REQUIRED ACADEMIC RELATIONSHIPS
            # -------------------------------------------------

            if not academic_session:
                raise serializers.ValidationError({
                    "academic_session": (
                        "Academic session is required."
                    )
                })

            if not term:
                raise serializers.ValidationError({
                    "term": (
                        "Term is required."
                    )
                })

            if not class_level:
                raise serializers.ValidationError({
                    "class_level": (
                        "Class level is required."
                    )
                })

            if not subject:
                raise serializers.ValidationError({
                    "subject": (
                        "Subject is required."
                    )
                })

            # -------------------------------------------------
            # SESSION SCHOOL
            # -------------------------------------------------

            if (
                academic_session.school_id
                != user.school_id
            ):
                raise serializers.ValidationError({
                    "academic_session": (
                        "The selected academic session "
                        "does not belong to your school."
                    )
                })

            # -------------------------------------------------
            # CLASS SCHOOL
            # -------------------------------------------------

            if (
                class_level.school_id
                != user.school_id
            ):
                raise serializers.ValidationError({
                    "class_level": (
                        "The selected class does not belong "
                        "to your school."
                    )
                })

            # -------------------------------------------------
            # SUBJECT SCHOOL
            # -------------------------------------------------

            if (
                subject.school_id
                != user.school_id
            ):
                raise serializers.ValidationError({
                    "subject": (
                        "The selected subject does not belong "
                        "to your school."
                    )
                })

            # -------------------------------------------------
            # TERM SESSION
            # -------------------------------------------------

            if (
                term.academic_session_id
                != academic_session.id
            ):
                raise serializers.ValidationError({
                    "term": (
                        "The selected term does not belong "
                        "to the selected academic session."
                    )
                })

            # -------------------------------------------------
            # CLASS/SUBJECT MAPPING
            # -------------------------------------------------

            if not ClassSubject.objects.filter(
                class_level=class_level,
                subject=subject,
                is_active=True,
            ).exists():
                raise serializers.ValidationError({
                    "subject": (
                        "This subject is not assigned to the "
                        "selected class."
                    )
                })

            # -------------------------------------------------
            # PRINCIPAL DOES NOT SELECT A TEACHER
            # -------------------------------------------------
            #
            # New Principal assignments have no teacher.
            #
            # If updating an existing teacher assignment,
            # we preserve its teacher unless the request
            # explicitly supplies teacher=null.
            #
            # This prevents a Principal editing an old teacher
            # assignment from accidentally removing its teacher.
            # -------------------------------------------------

            if self.instance is None:
                attrs["teacher"] = None

            elif "teacher" in attrs:
                # Principal is not allowed to assign a teacher.
                #
                # Explicit teacher values are rejected.
                supplied_teacher = attrs.get("teacher")

                if supplied_teacher is not None:
                    raise serializers.ValidationError({
                        "teacher": (
                            "Principals do not assign teachers "
                            "to assignments."
                        )
                    })

                attrs["teacher"] = None

            # -------------------------------------------------
            # SELECTED STUDENTS
            # -------------------------------------------------
            #
            # Validate every selected student against the same
            # assignment eligibility rules already used by the
            # student assignment system.
            # -------------------------------------------------

            if (
                target_type
                == Assignment.TargetType.SELECTED_STUDENTS
            ):

                invalid_students = []

                # -------------------------------------------------
                # Temporary assignment object used only for
                # eligibility checking.
                #
                # It does not save anything to the database.
                # -------------------------------------------------

                eligibility_assignment = Assignment(
                    school=school,
                    academic_session=academic_session,
                    term=term,
                    class_level=class_level,
                    subject=subject,
                )

                for student in target_students:

                    # -------------------------------------------------
                    # School safety
                    # -------------------------------------------------

                    if (
                        student.school_id
                        != user.school_id
                    ):
                        invalid_students.append(
                            {
                                "id": student.id,
                                "name": student.full_name,
                                "reason": (
                                    "Student does not belong "
                                    "to your school."
                                ),
                            }
                        )
                        continue

                    # -------------------------------------------------
                    # Existing assignment eligibility rules
                    # -------------------------------------------------

                    if not student_can_access_assignment(
                        student,
                        eligibility_assignment,
                    ):
                        error = (
                            get_student_assignment_access_error(
                                student,
                                eligibility_assignment,
                            )
                        )

                        invalid_students.append(
                            {
                                "id": student.id,
                                "name": student.full_name,
                                "reason": (
                                    error
                                    or
                                    "Student is not eligible "
                                    "for this assignment."
                                ),
                            }
                        )

                if invalid_students:
                    raise serializers.ValidationError({
                        "target_students": (
                            "One or more selected students "
                            "are not eligible for this "
                            "assignment."
                        ),
                        "invalid_students": invalid_students,
                    })

            # -------------------------------------------------
            # WHOLE CLASS
            # -------------------------------------------------

            elif (
                target_type
                == Assignment.TargetType.WHOLE_CLASS
            ):
                attrs["target_students"] = []

            # -------------------------------------------------
            # FORCE PRINCIPAL SCHOOL
            # -------------------------------------------------

            attrs["school"] = school

            return attrs

        # =====================================================
        # OTHER ROLES
        # =====================================================

        raise serializers.ValidationError(
            "You do not have permission to manage assignments."
        )

    # =========================================================
    # CREATE
    # =========================================================

    def create(self, validated_data):

        target_students = validated_data.pop(
            "target_students",
            [],
        )

        assignment = Assignment.objects.create(
            **validated_data
        )

        # -----------------------------------------------------
        # Save target students
        # -----------------------------------------------------

        if (
            assignment.target_type
            == Assignment.TargetType.SELECTED_STUDENTS
        ):
            assignment.target_students.set(
                target_students
            )
        else:
            assignment.target_students.clear()

        return assignment

    # =========================================================
    # UPDATE
    # =========================================================

    def update(self, instance, validated_data):

        target_students_supplied = (
            "target_students" in validated_data
        )

        target_students = validated_data.pop(
            "target_students",
            None,
        )

        # -----------------------------------------------------
        # Update normal fields
        # -----------------------------------------------------

        for attr, value in validated_data.items():
            setattr(
                instance,
                attr,
                value,
            )

        instance.save()

        # -----------------------------------------------------
        # Update target students only when supplied
        # -----------------------------------------------------

        if target_students_supplied:

            if (
                instance.target_type
                == Assignment.TargetType.SELECTED_STUDENTS
            ):
                instance.target_students.set(
                    target_students or []
                )

            else:
                instance.target_students.clear()

        return instance

# ============================================================
# ASSIGNMENT SUBMISSION SERIALIZER
# ============================================================

class AssignmentSubmissionSerializer(
    serializers.ModelSerializer
):

    maximum_score = serializers.DecimalField(
        source="assignment.maximum_score",
        max_digits=6,
        decimal_places=2,
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = AssignmentSubmission

        fields = [
            "id",
            "assignment",
            "student",
            "submission_file",
            "answer_text",
            "submitted_at",
            "score",
            "maximum_score",
            "teacher_feedback",
            "status",
            "status_display",
            "graded_at",
        ]

        read_only_fields = [
            "submitted_at",
            "maximum_score",
            "status_display",
        ]

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    def validate(self, attrs):
        request = self.context.get("request")

        if not request or not request.user:
            raise serializers.ValidationError(
                "Authenticated user information is required."
            )

        user = request.user

        assignment = attrs.get(
            "assignment",
            getattr(
                self.instance,
                "assignment",
                None,
            ),
        )

        student = attrs.get(
            "student",
            getattr(
                self.instance,
                "student",
                None,
            ),
        )

        if not assignment:
            raise serializers.ValidationError({
                "assignment": "Assignment is required."
            })

        if not student:
            raise serializers.ValidationError({
                "student": "Student is required."
            })

        # ----------------------------------------------------
        # PRINCIPAL
        # ----------------------------------------------------

        if user.role == User.Role.PRINCIPAL:

            if not user.school_id:
                raise serializers.ValidationError(
                    "Your principal account is not linked "
                    "to a school."
                )

            if assignment.school_id != user.school_id:
                raise serializers.ValidationError(
                    "You cannot manage submissions outside "
                    "your school."
                )

        # ----------------------------------------------------
        # TEACHER
        # ----------------------------------------------------

        elif user.role == User.Role.TEACHER:

            teacher = get_teacher_profile(user)

            if not teacher:
                raise serializers.ValidationError(
                    "Your teacher profile was not found."
                )

            if teacher.school_id != assignment.school_id:
                raise serializers.ValidationError(
                    "You cannot manage submissions outside "
                    "your school."
                )

            if not teacher_can_manage_assignment(
                teacher,
                assignment,
            ):
                raise serializers.ValidationError(
                    "You are not authorized to manage "
                    "submissions for this assignment."
                )

        else:
            raise serializers.ValidationError(
                "You do not have permission to manage "
                "assignment submissions."
            )

        # ----------------------------------------------------
        # SCORE
        # ----------------------------------------------------

        score = attrs.get(
            "score",
            getattr(self.instance, "score", None),
        )

        if score is not None:

            if score < 0:
                raise serializers.ValidationError({
                    "score": "Score cannot be negative."
                })

            if score > assignment.maximum_score:
                raise serializers.ValidationError({
                    "score": (
                        f"Score cannot exceed the assignment "
                        f"maximum score of "
                        f"{assignment.maximum_score}."
                    )
                })

        return attrs

    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    def create(self, validated_data):
        return AssignmentSubmission.objects.create(
            **validated_data
        )

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    def update(self, instance, validated_data):

        score = validated_data.get(
            "score",
            instance.score,
        )

        status = validated_data.get(
            "status",
            instance.status,
        )

        # ----------------------------------------------------
        # SCORE PROVIDED => AUTOMATICALLY GRADED
        # ----------------------------------------------------

        if score is not None:

            if score < 0:
                raise serializers.ValidationError({
                    "score": "Score cannot be negative."
                })

            if score > instance.assignment.maximum_score:
                raise serializers.ValidationError({
                    "score": (
                        "Score cannot exceed the assignment "
                        "maximum score."
                    )
                })

            if "status" not in validated_data:
                validated_data["status"] = (
                    AssignmentSubmission.Status.GRADED
                )

                validated_data["graded_at"] = (
                    timezone.now()
                )

        # ----------------------------------------------------
        # EXPLICITLY GRADED
        # ----------------------------------------------------

        if (
            status == AssignmentSubmission.Status.GRADED
            and instance.graded_at is None
        ):
            validated_data["graded_at"] = timezone.now()

        return super().update(
            instance,
            validated_data,
        )


# ============================================================
# STUDENT ASSIGNMENT SERIALIZER
# ============================================================

class StudentAssignmentSerializer(
    serializers.ModelSerializer
):

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    academic_session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    teacher_name = serializers.CharField(
        source="teacher.full_name",
        read_only=True,
    )

    has_submitted = serializers.SerializerMethodField()
    my_submission = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    can_submit = serializers.SerializerMethodField()

    class Meta:
        model = Assignment

        fields = [
            "id",

            "school",
            "school_name",

            "academic_session",
            "academic_session_name",

            "term",
            "term_name",

            "class_level",
            "class_level_name",

            "subject",
            "subject_name",

            "teacher",
            "teacher_name",

            "title",
            "instructions",
            "attachment",

            "assigned_date",
            "due_date",

            "maximum_score",
            "allow_late_submission",

            "status",

            "has_submitted",
            "my_submission",
            "is_overdue",
            "can_submit",

            "created_at",
            "updated_at",
        ]

    # --------------------------------------------------------
    # STUDENT
    # --------------------------------------------------------

    def _get_student(self):
        request = self.context.get("request")

        if not request or not request.user:
            return None

        try:
            return request.user.student_profile
        except (AttributeError, Exception):
            return None

    # --------------------------------------------------------
    # HAS SUBMITTED
    # --------------------------------------------------------

    def get_has_submitted(self, obj):

        student = self._get_student()

        if not student:
            return False

        if not student_can_access_assignment(
            student,
            obj,
        ):
            return False

        return AssignmentSubmission.objects.filter(
            assignment=obj,
            student=student,
        ).exists()

    # --------------------------------------------------------
    # MY SUBMISSION
    # --------------------------------------------------------

    def get_my_submission(self, obj):

        student = self._get_student()

        if not student:
            return None

        if not student_can_access_assignment(
            student,
            obj,
        ):
            return None

        submission = (
            AssignmentSubmission.objects
            .filter(
                assignment=obj,
                student=student,
            )
            .first()
        )

        if not submission:
            return None

        return {
            "id": submission.id,
            "answer_text": submission.answer_text,
            "submission_file": (
                submission.submission_file.url
                if submission.submission_file
                else None
            ),
            "submitted_at": submission.submitted_at,
            "score": submission.score,
            "teacher_feedback": (
                submission.teacher_feedback
            ),
            "status": submission.status,
            "status_display": (
                submission.get_status_display()
            ),
            "graded_at": submission.graded_at,
        }

    # --------------------------------------------------------
    # OVERDUE
    # --------------------------------------------------------

    def get_is_overdue(self, obj):
        return timezone.now() > obj.due_date

    # --------------------------------------------------------
    # CAN SUBMIT
    # --------------------------------------------------------

    def get_can_submit(self, obj):

        student = self._get_student()

        if not student:
            return False

        if not student_can_access_assignment(
            student,
            obj,
        ):
            return False

        if obj.status != Assignment.Status.PUBLISHED:
            return False

        submission = (
            AssignmentSubmission.objects
            .filter(
                assignment=obj,
                student=student,
            )
            .first()
        )

        if not submission:
            return True

        if submission.status in [
            AssignmentSubmission.Status.GRADED,
            AssignmentSubmission.Status.RETURNED,
        ]:
            return False

        if timezone.now() <= obj.due_date:
            return True

        return obj.allow_late_submission



# ============================================================
# PARENT ASSIGNMENT SERIALIZER
# ============================================================

class ParentAssignmentSerializer(serializers.ModelSerializer):
    """
    Assignment serializer specifically for parents.

    Important:
        This serializer NEVER exposes target_students.

    The parent receives the assignment together with the child
    that the assignment applies to.
    """

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    academic_session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    teacher_name = serializers.SerializerMethodField()

    child_id = serializers.SerializerMethodField()

    child_name = serializers.SerializerMethodField()

    child_admission_number = serializers.SerializerMethodField()

    has_submitted = serializers.SerializerMethodField()

    submission = serializers.SerializerMethodField()

    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Assignment

        fields = [
            "id",

            # ------------------------------------------------
            # CHILD
            # ------------------------------------------------
            "child_id",
            "child_name",
            "child_admission_number",

            # ------------------------------------------------
            # ASSIGNMENT
            # ------------------------------------------------
            "school",
            "school_name",

            "academic_session",
            "academic_session_name",

            "term",
            "term_name",

            "class_level",
            "class_level_name",

            "subject",
            "subject_name",

            "teacher",
            "teacher_name",

            "title",
            "instructions",
            "attachment",

            "assigned_date",
            "due_date",

            "maximum_score",
            "allow_late_submission",

            "status",

            # ------------------------------------------------
            # CHILD SUBMISSION
            # ------------------------------------------------
            "has_submitted",
            "submission",
            "is_overdue",

            "created_at",
            "updated_at",
        ]

        read_only_fields = fields

    # ========================================================
    # PARENT
    # ========================================================

    def get_parent(self):
        request = self.context.get(
            "request"
        )

        if not request:
            return None

        user = request.user

        if not user.is_authenticated:
            return None

        if user.role != User.Role.PARENT:
            return None

        return getattr(
            user,
            "parent_profile",
            None,
        )

    # ========================================================
    # CHILD
    # ========================================================

    def get_child(self, obj):
        """
        Determines which child this assignment is being returned
        for.

        The view only returns assignments that belong to the
        authenticated parent's children.
        """

        parent = self.get_parent()

        if not parent:
            return None

        children = (
            Student.objects
            .filter(
                parents=parent,
                school_id=parent.school_id,
            )
            .filter(
                Q(
                    enrollments__academic_session_id=(
                        obj.academic_session_id
                    ),
                    enrollments__term_id=obj.term_id,
                    enrollments__class_level_id=(
                        obj.class_level_id
                    ),
                )
            )
            .distinct()
        )

        # ----------------------------------------------------
        # SELECTED STUDENTS
        # ----------------------------------------------------

        if (
            obj.target_type
            == Assignment.TargetType.SELECTED_STUDENTS
        ):
            children = children.filter(
                id__in=obj.target_students.values_list(
                    "id",
                    flat=True,
                )
            )

        return children.first()

    def get_child_id(self, obj):
        child = self.get_child(obj)

        if not child:
            return None

        return child.id

    def get_child_name(self, obj):
        child = self.get_child(obj)

        if not child:
            return None

        return child.full_name

    def get_child_admission_number(self, obj):
        child = self.get_child(obj)

        if not child:
            return None

        return child.admission_number

    # ========================================================
    # TEACHER
    # ========================================================

    def get_teacher_name(self, obj):

        if not obj.teacher:
            return None

        teacher = obj.teacher

        # -----------------------------------------------
        # Try common full_name property first
        # -----------------------------------------------

        full_name = getattr(
            teacher,
            "full_name",
            None,
        )

        if full_name:
            return full_name

        # -----------------------------------------------
        # Fall back to linked user
        # -----------------------------------------------

        user = getattr(
            teacher,
            "user",
            None,
        )

        if user:
            name = (
                f"{user.first_name} "
                f"{user.last_name}"
            ).strip()

            if name:
                return name

            return user.username

        return str(teacher)

    # ========================================================
    # CHILD SUBMISSION
    # ========================================================

    def get_submission(self, obj):

        child = self.get_child(obj)

        if not child:
            return None

        submission = (
            AssignmentSubmission.objects
            .filter(
                assignment=obj,
                student=child,
            )
            .first()
        )

        if not submission:
            return None

        return {
            "id": submission.id,
            "status": submission.status,
            "submitted_at": submission.submitted_at,
            "score": submission.score,
            "teacher_feedback": (
                submission.teacher_feedback
            ),
            "graded_at": submission.graded_at,
            "submission_file": (
                submission.submission_file.url
                if submission.submission_file
                else None
            ),
        }

    def get_has_submitted(self, obj):

        child = self.get_child(obj)

        if not child:
            return False

        return AssignmentSubmission.objects.filter(
            assignment=obj,
            student=child,
        ).exists()

    # ========================================================
    # OVERDUE
    # ========================================================

    def get_is_overdue(self, obj):

        if obj.status != Assignment.Status.PUBLISHED:
            return False

        return (
            timezone.now()
            > obj.due_date
        )



# ============================================================
# STUDENT SUBMISSION SERIALIZER
# ============================================================

class StudentSubmissionSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = AssignmentSubmission

        fields = [
            "id",
            "assignment",
            "submission_file",
            "answer_text",
            "submitted_at",
            "score",
            "teacher_feedback",
            "status",
            "graded_at",
        ]

        read_only_fields = [
            "submitted_at",
            "score",
            "teacher_feedback",
            "status",
            "graded_at",
        ]

    # --------------------------------------------------------
    # STUDENT
    # --------------------------------------------------------

    def _get_student(self):
        request = self.context.get("request")

        if not request or not request.user:
            return None

        try:
            return request.user.student_profile
        except (AttributeError, Exception):
            return None

    # --------------------------------------------------------
    # ASSIGNMENT VALIDATION
    # --------------------------------------------------------

    def validate_assignment(self, assignment):

        student = self._get_student()

        if not student:
            raise serializers.ValidationError(
                "Student profile was not found."
            )

        if self.instance:
            if (
                self.instance.assignment_id
                != assignment.id
            ):
                raise serializers.ValidationError(
                    "You cannot change the assignment "
                    "for an existing submission."
                )

        access_error = get_student_assignment_access_error(
            student,
            assignment,
        )

        if access_error:
            raise serializers.ValidationError(
                access_error
            )

        if assignment.status != Assignment.Status.PUBLISHED:
            raise serializers.ValidationError(
                "This assignment is not currently published."
            )

        return assignment

    # --------------------------------------------------------
    # GENERAL VALIDATION
    # --------------------------------------------------------

    def validate(self, attrs):

        student = self._get_student()

        if not student:
            raise serializers.ValidationError(
                "Student profile was not found."
            )

        assignment = attrs.get(
            "assignment",
            getattr(
                self.instance,
                "assignment",
                None,
            ),
        )

        if not assignment:
            raise serializers.ValidationError({
                "assignment": "Assignment is required."
            })

        access_error = get_student_assignment_access_error(
            student,
            assignment,
        )

        if access_error:
            raise serializers.ValidationError(
                access_error
            )

        if assignment.status != Assignment.Status.PUBLISHED:
            raise serializers.ValidationError(
                "This assignment is not currently published."
            )

        # ----------------------------------------------------
        # EXISTING SUBMISSION
        # ----------------------------------------------------

        if self.instance:

            if self.instance.student_id != student.id:
                raise serializers.ValidationError(
                    "You can only modify your own submission."
                )

            if self.instance.status in [
                AssignmentSubmission.Status.GRADED,
                AssignmentSubmission.Status.RETURNED,
            ]:
                raise serializers.ValidationError(
                    "This submission can no longer be modified."
                )

        # ----------------------------------------------------
        # DEADLINE
        # ----------------------------------------------------

        if timezone.now() > assignment.due_date:

            if not assignment.allow_late_submission:
                raise serializers.ValidationError(
                    "The submission deadline has passed."
                )

        return attrs

    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    def create(self, validated_data):

        student = self._get_student()

        if not student:
            raise serializers.ValidationError(
                "Student profile was not found."
            )

        assignment = validated_data["assignment"]

        access_error = get_student_assignment_access_error(
            student,
            assignment,
        )

        if access_error:
            raise serializers.ValidationError(
                access_error
            )

        if assignment.status != Assignment.Status.PUBLISHED:
            raise serializers.ValidationError(
                "This assignment is not currently published."
            )

        is_late = timezone.now() > assignment.due_date

        if is_late and not assignment.allow_late_submission:
            raise serializers.ValidationError(
                "The submission deadline has passed."
            )

        submission, created = (
            AssignmentSubmission.objects.get_or_create(
                assignment=assignment,
                student=student,
                defaults={
                    "answer_text": validated_data.get(
                        "answer_text",
                        "",
                    ),
                    "submission_file": validated_data.get(
                        "submission_file"
                    ),
                    "status": (
                        AssignmentSubmission.Status.LATE
                        if is_late
                        else AssignmentSubmission.Status.SUBMITTED
                    ),
                },
            )
        )

        if not created:

            if submission.status in [
                AssignmentSubmission.Status.GRADED,
                AssignmentSubmission.Status.RETURNED,
            ]:
                raise serializers.ValidationError(
                    "This submission can no longer be modified."
                )

            submission.answer_text = validated_data.get(
                "answer_text",
                submission.answer_text,
            )

            if "submission_file" in validated_data:
                submission.submission_file = (
                    validated_data["submission_file"]
                )

            submission.submitted_at = timezone.now()

            submission.status = (
                AssignmentSubmission.Status.LATE
                if is_late
                else AssignmentSubmission.Status.SUBMITTED
            )

            submission.save()

        return submission

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    def update(self, instance, validated_data):

        student = self._get_student()

        if not student:
            raise serializers.ValidationError(
                "Student profile was not found."
            )

        if instance.student_id != student.id:
            raise serializers.ValidationError(
                "You can only modify your own submission."
            )

        if instance.status in [
            AssignmentSubmission.Status.GRADED,
            AssignmentSubmission.Status.RETURNED,
        ]:
            raise serializers.ValidationError(
                "This submission can no longer be modified."
            )

        assignment = instance.assignment

        access_error = get_student_assignment_access_error(
            student,
            assignment,
        )

        if access_error:
            raise serializers.ValidationError(
                access_error
            )

        if assignment.status != Assignment.Status.PUBLISHED:
            raise serializers.ValidationError(
                "This assignment is not currently published."
            )

        is_late = timezone.now() > assignment.due_date

        if is_late and not assignment.allow_late_submission:
            raise serializers.ValidationError(
                "The submission deadline has passed."
            )

        validated_data.pop(
            "assignment",
            None,
        )

        if "answer_text" in validated_data:
            instance.answer_text = validated_data[
                "answer_text"
            ]

        if "submission_file" in validated_data:
            instance.submission_file = validated_data[
                "submission_file"
            ]

        instance.submitted_at = timezone.now()

        instance.status = (
            AssignmentSubmission.Status.LATE
            if is_late
            else AssignmentSubmission.Status.SUBMITTED
        )

        instance.save()

        return instance




# ============================================================
# PARENT ASSIGNMENT SERIALIZER
# ============================================================

class ParentAssignmentSerializer(serializers.ModelSerializer):
    """
    Assignment representation for parents.

    Only assignments belonging to the authenticated parent's
    children are returned by ParentAssignmentListView.

    target_students is intentionally NOT exposed because a
    parent must never see the identities of other students
    targeted by an assignment.
    """

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    academic_session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    teacher_name = serializers.SerializerMethodField()

    child_id = serializers.SerializerMethodField()

    child_name = serializers.SerializerMethodField()

    child_admission_number = serializers.SerializerMethodField()

    has_submitted = serializers.SerializerMethodField()

    submission = serializers.SerializerMethodField()

    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Assignment

        fields = [
            "id",

            # Child
            "child_id",
            "child_name",
            "child_admission_number",

            # School
            "school",
            "school_name",

            # Academic information
            "academic_session",
            "academic_session_name",

            "term",
            "term_name",

            "class_level",
            "class_level_name",

            "subject",
            "subject_name",

            # Teacher
            "teacher",
            "teacher_name",

            # Assignment
            "title",
            "instructions",
            "attachment",
            "assigned_date",
            "due_date",
            "maximum_score",
            "allow_late_submission",
            "status",

            # Submission
            "has_submitted",
            "submission",
            "is_overdue",

            "created_at",
            "updated_at",
        ]

        read_only_fields = fields

    # ========================================================
    # PARENT
    # ========================================================

    def get_parent(self):

        request = self.context.get(
            "request"
        )

        if not request:
            return None

        user = request.user

        if not user.is_authenticated:
            return None

        if user.role != User.Role.PARENT:
            return None

        return getattr(
            user,
            "parent_profile",
            None,
        )

    # ========================================================
    # CHILD
    # ========================================================

    def get_child(self, obj):

        parent = self.get_parent()

        if not parent:
            return None

        children = (
            Student.objects
            .filter(
                parents=parent,
                school_id=parent.school_id,
            )
            .filter(
                enrollments__academic_session_id=(
                    obj.academic_session_id
                ),
                enrollments__term_id=(
                    obj.term_id
                ),
                enrollments__class_level_id=(
                    obj.class_level_id
                ),
            )
            .distinct()
        )

        # ----------------------------------------------------
        # SELECTED STUDENT ASSIGNMENT
        # ----------------------------------------------------

        if (
            obj.target_type
            == Assignment.TargetType.SELECTED_STUDENTS
        ):
            children = children.filter(
                id__in=obj.target_students.values_list(
                    "id",
                    flat=True,
                )
            )

        return children.first()

    # ========================================================
    # CHILD ID
    # ========================================================

    def get_child_id(self, obj):

        child = self.get_child(obj)

        if not child:
            return None

        return child.id

    # ========================================================
    # CHILD NAME
    # ========================================================

    def get_child_name(self, obj):

        child = self.get_child(obj)

        if not child:
            return None

        return child.full_name

    # ========================================================
    # ADMISSION NUMBER
    # ========================================================

    def get_child_admission_number(self, obj):

        child = self.get_child(obj)

        if not child:
            return None

        return child.admission_number

    # ========================================================
    # TEACHER
    # ========================================================

    def get_teacher_name(self, obj):

        if not obj.teacher:
            return None

        teacher = obj.teacher

        full_name = getattr(
            teacher,
            "full_name",
            None,
        )

        if full_name:
            return full_name

        user = getattr(
            teacher,
            "user",
            None,
        )

        if user:

            name = (
                f"{user.first_name} "
                f"{user.last_name}"
            ).strip()

            if name:
                return name

            return user.username

        return str(teacher)

    # ========================================================
    # SUBMISSION
    # ========================================================

    def get_submission(self, obj):

        child = self.get_child(obj)

        if not child:
            return None

        submission = (
            AssignmentSubmission.objects
            .filter(
                assignment=obj,
                student=child,
            )
            .first()
        )

        if not submission:
            return None

        return {
            "id": submission.id,
            "status": submission.status,
            "submitted_at": (
                submission.submitted_at
            ),
            "score": submission.score,
            "teacher_feedback": (
                submission.teacher_feedback
            ),
            "graded_at": submission.graded_at,
            "submission_file": (
                submission.submission_file.url
                if submission.submission_file
                else None
            ),
        }

    # ========================================================
    # HAS SUBMITTED
    # ========================================================

    def get_has_submitted(self, obj):

        child = self.get_child(obj)

        if not child:
            return False

        return AssignmentSubmission.objects.filter(
            assignment=obj,
            student=child,
        ).exists()

    # ========================================================
    # OVERDUE
    # ========================================================

    def get_is_overdue(self, obj):

        if (
            obj.status
            != Assignment.Status.PUBLISHED
        ):
            return False

        return (
            timezone.now()
            > obj.due_date
        )