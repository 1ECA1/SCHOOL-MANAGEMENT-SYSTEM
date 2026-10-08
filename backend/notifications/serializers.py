from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework import serializers

from academics.models import ClassLevel, Subject
from students.models import (
    Student,
    ParentGuardian,
)
from teachers.models import (
    Teacher,
    TeacherSubject,
    ClassTeacher,
)

from .models import Notification


User = get_user_model()


# ============================================================
# INBOX SERIALIZER
# ============================================================

class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.SerializerMethodField()
    sender_name = serializers.SerializerMethodField()

    notification_type_display = serializers.CharField(
        source="get_notification_type_display",
        read_only=True,
    )

    class Meta:
        model = Notification

        fields = [
            "id",

            # ------------------------------------------------
            # BATCH INFORMATION
            # ------------------------------------------------

            "batch_id",
            "recipient_type",

            # ------------------------------------------------
            # SENDER
            # ------------------------------------------------

            "sender",
            "sender_name",

            # ------------------------------------------------
            # RECIPIENT
            # ------------------------------------------------

            "recipient",
            "recipient_name",

            # ------------------------------------------------
            # NOTIFICATION
            # ------------------------------------------------

            "notification_type",
            "notification_type_display",
            "title",
            "message",
            "link",

            # ------------------------------------------------
            # READ STATUS
            # ------------------------------------------------

            "is_read",
            "read_at",

            # ------------------------------------------------
            # DATE
            # ------------------------------------------------

            "created_at",
        ]

        read_only_fields = [
            "id",

            # ------------------------------------------------
            # BATCH INFORMATION
            # ------------------------------------------------

            "batch_id",
            "recipient_type",

            # ------------------------------------------------
            # SENDER
            # ------------------------------------------------

            "sender",
            "sender_name",

            # ------------------------------------------------
            # RECIPIENT
            # ------------------------------------------------

            "recipient",
            "recipient_name",

            # ------------------------------------------------
            # NOTIFICATION
            # ------------------------------------------------

            "notification_type_display",

            # ------------------------------------------------
            # DATE
            # ------------------------------------------------

            "read_at",
            "created_at",
        ]

    # ========================================================
    # SENDER NAME
    # ========================================================

    def get_sender_name(self, obj):
        if not obj.sender:
            return None

        return (
            obj.sender.get_full_name()
            or obj.sender.username
        )

    # ========================================================
    # RECIPIENT NAME
    # ========================================================

    def get_recipient_name(self, obj):
        if not obj.recipient:
            return None

        return (
            obj.recipient.get_full_name()
            or obj.recipient.username
        )

    # ========================================================
    # UPDATE READ STATUS
    # ========================================================

    def update(self, instance, validated_data):

        is_read = validated_data.get(
            "is_read",
            instance.is_read,
        )

        # ----------------------------------------------------
        # MARK AS READ
        # ----------------------------------------------------

        if is_read and not instance.is_read:

            validated_data["read_at"] = timezone.now()

        # ----------------------------------------------------
        # MARK AS UNREAD
        # ----------------------------------------------------

        elif not is_read:

            validated_data["read_at"] = None

        return super().update(
            instance,
            validated_data,
        )


# ============================================================
# SEND NOTIFICATION SERIALIZER
# ============================================================

class NotificationSendSerializer(serializers.Serializer):

    # --------------------------------------------------------
    # NOTIFICATION TYPE
    # --------------------------------------------------------

    notification_type = serializers.ChoiceField(
        choices=Notification.NotificationType.choices,
        default=Notification.NotificationType.GENERAL,
    )

    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    title = serializers.CharField(
        max_length=255,
    )

    # --------------------------------------------------------
    # MESSAGE
    # --------------------------------------------------------

    message = serializers.CharField()

    # --------------------------------------------------------
    # OPTIONAL LINK
    # --------------------------------------------------------

    link = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
    )

    # --------------------------------------------------------
    # RECIPIENT TYPE
    # --------------------------------------------------------

    recipient_type = serializers.ChoiceField(
        choices=[

            # =================================================
            # SUPER ADMIN
            # =================================================

            (
                "ALL_SCHOOLS",
                "All Schools",
            ),

            (
                "SCHOOL",
                "School",
            ),

            # =================================================
            # SCHOOL-WIDE
            # =================================================

            (
                "ALL_ROLES",
                "All Roles",
            ),

            # =================================================
            # STUDENTS
            # =================================================

            (
                "ALL_STUDENTS",
                "All Students",
            ),

            (
                "STUDENTS",
                "Selected Students",
            ),

            # =================================================
            # PARENTS / GUARDIANS
            # =================================================

            (
                "ALL_PARENTS",
                "All Parents",
            ),

            (
                "PARENTS",
                "Selected Parents",
            ),

            # =================================================
            # TEACHERS
            # =================================================

            (
                "ALL_TEACHERS",
                "All Teachers",
            ),

            (
                "TEACHERS",
                "Selected Teachers",
            ),

            # =================================================
            # TEACHER-SPECIFIC
            # =================================================

            (
                "CLASS",
                "Class Students",
            ),

            (
                "SUBJECT",
                "Subject Students",
            ),
        ],
    )

    # --------------------------------------------------------
    # SCHOOL
    # --------------------------------------------------------

    school_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    # --------------------------------------------------------
    # STUDENTS
    # --------------------------------------------------------

    student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    # --------------------------------------------------------
    # PARENTS
    # --------------------------------------------------------

    parent_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    # --------------------------------------------------------
    # TEACHERS
    # --------------------------------------------------------

    teacher_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    # --------------------------------------------------------
    # CLASS
    # --------------------------------------------------------

    class_level_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    # --------------------------------------------------------
    # SUBJECT
    # --------------------------------------------------------

    subject_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    # ========================================================
    # VALIDATION
    # ========================================================

    def validate(self, attrs):

        request = self.context["request"]

        user = request.user

        recipient_type = attrs["recipient_type"]

        # ----------------------------------------------------
        # CHECK SENDER ROLE
        # ----------------------------------------------------

        if user.role not in {
            User.Role.SUPER_ADMIN,
            User.Role.SCHOOL_ADMIN,
            User.Role.PRINCIPAL,
            User.Role.TEACHER,
        }:

            raise serializers.ValidationError(
                "You are not authorized to send notifications."
            )

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if user.role == User.Role.SUPER_ADMIN:

            self._validate_super_admin(
                attrs,
                recipient_type,
            )

        # ----------------------------------------------------
        # SCHOOL ADMIN
        # ----------------------------------------------------

        elif user.role == User.Role.SCHOOL_ADMIN:

            self._validate_school_admin(
                attrs,
                recipient_type,
            )

        # ----------------------------------------------------
        # PRINCIPAL
        # ----------------------------------------------------

        elif user.role == User.Role.PRINCIPAL:

            self._validate_principal(
                attrs,
                recipient_type,
            )

        # ----------------------------------------------------
        # TEACHER
        # ----------------------------------------------------

        elif user.role == User.Role.TEACHER:

            self._validate_teacher(
                attrs,
                recipient_type,
            )

        return attrs

    # ========================================================
    # SUPER ADMIN VALIDATION
    # ========================================================

    def _validate_super_admin(
        self,
        attrs,
        recipient_type,
    ):

        allowed = {
            "ALL_SCHOOLS",
            "SCHOOL",

            # --------------------------------------------
            # ALL ROLES
            # --------------------------------------------

            "ALL_ROLES",

            # --------------------------------------------
            # STUDENTS
            # --------------------------------------------

            "ALL_STUDENTS",
            "STUDENTS",

            # --------------------------------------------
            # PARENTS / GUARDIANS
            # --------------------------------------------

            "ALL_PARENTS",
            "PARENTS",

            # --------------------------------------------
            # TEACHERS
            # --------------------------------------------

            "ALL_TEACHERS",
            "TEACHERS",
        }

        if recipient_type not in allowed:

            raise serializers.ValidationError(
                "This recipient type is not available to Super Admin."
            )

        # ----------------------------------------------------
        # SCHOOL
        # ----------------------------------------------------

        if recipient_type == "SCHOOL":

            self._require_school_id(attrs)

        # ----------------------------------------------------
        # SELECTED STUDENTS
        # ----------------------------------------------------

        if recipient_type == "STUDENTS":

            self._require_ids(
                attrs,
                "student_ids",
                "At least one student is required.",
            )

        # ----------------------------------------------------
        # SELECTED PARENTS
        # ----------------------------------------------------

        if recipient_type == "PARENTS":

            self._require_ids(
                attrs,
                "parent_ids",
                "At least one parent is required.",
            )

        # ----------------------------------------------------
        # SELECTED TEACHERS
        # ----------------------------------------------------

        if recipient_type == "TEACHERS":

            self._require_ids(
                attrs,
                "teacher_ids",
                "At least one teacher is required.",
            )

    # ========================================================
    # SCHOOL ADMIN VALIDATION
    # ========================================================

    def _validate_school_admin(
        self,
        attrs,
        recipient_type,
    ):

        allowed = {
            "ALL_ROLES",

            "ALL_STUDENTS",
            "STUDENTS",

            "ALL_PARENTS",
            "PARENTS",

            "ALL_TEACHERS",
            "TEACHERS",
        }

        if recipient_type not in allowed:

            raise serializers.ValidationError(
                "School Admin can only send notifications within their school."
            )

        # ----------------------------------------------------
        # ALL ROLES
        # ----------------------------------------------------

        if recipient_type == "ALL_ROLES":

            return

        # ----------------------------------------------------
        # SELECTED STUDENTS
        # ----------------------------------------------------

        if recipient_type == "STUDENTS":

            self._require_ids(
                attrs,
                "student_ids",
                "At least one student is required.",
            )

        # ----------------------------------------------------
        # SELECTED PARENTS
        # ----------------------------------------------------

        if recipient_type == "PARENTS":

            self._require_ids(
                attrs,
                "parent_ids",
                "At least one parent is required.",
            )

        # ----------------------------------------------------
        # SELECTED TEACHERS
        # ----------------------------------------------------

        if recipient_type == "TEACHERS":

            self._require_ids(
                attrs,
                "teacher_ids",
                "At least one teacher is required.",
            )

    # ========================================================
    # PRINCIPAL VALIDATION
    # ========================================================

    def _validate_principal(
        self,
        attrs,
        recipient_type,
    ):

        allowed = {
            "ALL_ROLES",

            "ALL_STUDENTS",
            "STUDENTS",

            "ALL_PARENTS",
            "PARENTS",

            "ALL_TEACHERS",
            "TEACHERS",
        }

        if recipient_type not in allowed:

            raise serializers.ValidationError(
                "Principal can only send notifications within their school."
            )

        # ----------------------------------------------------
        # ALL ROLES
        # ----------------------------------------------------

        if recipient_type == "ALL_ROLES":

            return

        # ----------------------------------------------------
        # SELECTED STUDENTS
        # ----------------------------------------------------

        if recipient_type == "STUDENTS":

            self._require_ids(
                attrs,
                "student_ids",
                "At least one student is required.",
            )

        # ----------------------------------------------------
        # SELECTED PARENTS
        # ----------------------------------------------------

        if recipient_type == "PARENTS":

            self._require_ids(
                attrs,
                "parent_ids",
                "At least one parent is required.",
            )

        # ----------------------------------------------------
        # SELECTED TEACHERS
        # ----------------------------------------------------

        if recipient_type == "TEACHERS":

            self._require_ids(
                attrs,
                "teacher_ids",
                "At least one teacher is required.",
            )

    # ========================================================
    # TEACHER VALIDATION
    # ========================================================

    def _validate_teacher(
        self,
        attrs,
        recipient_type,
    ):

        allowed = {
            "CLASS",
            "SUBJECT",
        }

        # ----------------------------------------------------
        # ONLY CLASS AND SUBJECT ARE AVAILABLE TO TEACHERS
        # ----------------------------------------------------

        if recipient_type not in allowed:

            raise serializers.ValidationError(
                "Teachers can only send notifications to a class or subject group."
            )

        request = self.context["request"]

        # ----------------------------------------------------
        # GET LOGGED-IN TEACHER PROFILE
        #
        # IMPORTANT:
        # Do NOT use request.user.school_id here.
        #
        # Teacher users in this project can have:
        #
        #     request.user.school_id = None
        #
        # while their Teacher profile correctly contains:
        #
        #     teacher.school_id
        #
        # ----------------------------------------------------

        teacher = getattr(
            request.user,
            "teacher_profile",
            None,
        )

        if not teacher:

            raise serializers.ValidationError(
                "Teacher profile was not found."
            )

        # ====================================================
        # ENTIRE CLASS
        # ====================================================

        if recipient_type == "CLASS":

            class_level_id = attrs.get(
                "class_level_id"
            )

            if not class_level_id:

                raise serializers.ValidationError({
                    "class_level_id": (
                        "Class is required."
                    )
                })

            # ------------------------------------------------
            # CLASS ASSIGNMENT
            #
            # Entire Class is controlled by ClassTeacher.
            #
            # Do NOT use TeacherSubject here.
            # ------------------------------------------------

            assignment_exists = (
                ClassTeacher.objects.filter(
                    teacher=teacher,
                    class_level_id=class_level_id,
                    is_active=True,
                ).exists()
            )

            if not assignment_exists:

                raise serializers.ValidationError({
                    "class_level_id": (
                        "You are not assigned to this class."
                    )
                })

        # ====================================================
        # SUBJECT GROUP
        # ====================================================

        elif recipient_type == "SUBJECT":

            subject_id = attrs.get(
                "subject_id"
            )

            if not subject_id:

                raise serializers.ValidationError({
                    "subject_id": (
                        "Subject is required."
                    )
                })

            # ------------------------------------------------
            # SUBJECT ASSIGNMENT
            #
            # Subject Group is controlled by TeacherSubject.
            #
            # IMPORTANT:
            # No class_level_id is required here.
            # ------------------------------------------------

            assignment_exists = (
                TeacherSubject.objects.filter(
                    teacher=teacher,
                    subject_id=subject_id,
                ).exists()
            )

            if not assignment_exists:

                raise serializers.ValidationError({
                    "subject_id": (
                        "You are not assigned to this subject."
                    )
                })

        return attrs

    # ========================================================
    # HELPERS
    # ========================================================

    @staticmethod
    def _require_school_id(attrs):

        if not attrs.get("school_id"):

            raise serializers.ValidationError(
                {
                    "school_id": (
                        "School is required."
                    )
                }
            )

    @staticmethod
    def _require_ids(
        attrs,
        field_name,
        message,
    ):

        if not attrs.get(field_name):

            raise serializers.ValidationError(
                {
                    field_name: message
                }
            )