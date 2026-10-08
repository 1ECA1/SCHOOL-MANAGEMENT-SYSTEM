import uuid

from django.db.models import Q
from django.contrib.auth import get_user_model
from django.db import transaction

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

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
from .permissions import CanSendNotification
from .serializers import (
    NotificationSerializer,
    NotificationSendSerializer,
)


User = get_user_model()


# ============================================================
# INBOX
# ============================================================

class NotificationListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related(
            "recipient"
        )

    def perform_create(self, serializer):

        serializer.save(
            recipient=self.request.user
        )


# ============================================================
# NOTIFICATION DETAIL
# ============================================================

class NotificationDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related(
            "recipient"
        )


# ============================================================
# UNREAD NOTIFICATIONS
# ============================================================

class UnreadNotificationListView(
    generics.ListAPIView
):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notification.objects.filter(
            recipient=self.request.user,
            is_read=False,
        ).select_related(
            "recipient"
        )


# ============================================================
# SEND NOTIFICATION
# ============================================================

class NotificationSendView(
    generics.CreateAPIView
):

    serializer_class = NotificationSendSerializer

    permission_classes = [
        IsAuthenticated,
        CanSendNotification,
    ]

    @transaction.atomic
    def create(
        self,
        request,
        *args,
        **kwargs,
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        recipients = self.get_recipients(
            serializer.validated_data
        )

        # ----------------------------------------------------
        # REMOVE DUPLICATES
        # ----------------------------------------------------

        recipients = recipients.distinct()

        recipient_count = recipients.count()

        if recipient_count == 0:

            return Response(
                {
                    "detail": (
                        "No valid recipients were found."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ====================================================
        # CREATE ONE BATCH ID FOR THIS ENTIRE SEND OPERATION
        #
        # IMPORTANT:
        #
        # If a notification is sent to 100 recipients,
        # the database will still contain 100 Notification
        # records because each recipient needs an individual
        # inbox notification.
        #
        # However, ALL 100 records will share this same
        # batch_id.
        #
        # Therefore the Sent Notifications page can display
        # them as ONE notification instead of 100 duplicates.
        # ====================================================

        batch_id = uuid.uuid4()

        # ----------------------------------------------------
        # NOTIFICATION DATA
        # ----------------------------------------------------

        notification_data = {
            "batch_id": batch_id,

            "recipient_type": (
                serializer.validated_data[
                    "recipient_type"
                ]
            ),

            "notification_type": (
                serializer.validated_data[
                    "notification_type"
                ]
            ),

            "title": (
                serializer.validated_data[
                    "title"
                ]
            ),

            "message": (
                serializer.validated_data[
                    "message"
                ]
            ),

            "link": (
                serializer.validated_data.get(
                    "link",
                    "",
                )
            ),
        }

        # ----------------------------------------------------
        # CREATE ONE NOTIFICATION PER RECIPIENT
        #
        # Every notification from this send operation gets
        # the SAME batch_id.
        # ----------------------------------------------------

        notification_objects = [
            Notification(
                sender=request.user,
                recipient=user,
                **notification_data,
            )
            for user in recipients
        ]

        Notification.objects.bulk_create(
            notification_objects
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "detail": (
                    "Notification sent successfully."
                ),
                "recipient_count": recipient_count,
                "batch_id": str(batch_id),
            },
            status=status.HTTP_201_CREATED,
        )

    # ========================================================
    # RECIPIENT RESOLUTION
    # ========================================================

    def get_recipients(self, data):

        user = self.request.user

        recipient_type = data[
            "recipient_type"
        ]

        # ----------------------------------------------------
        # SUPER ADMIN
        # ----------------------------------------------------

        if user.role == User.Role.SUPER_ADMIN:

            return self.get_super_admin_recipients(
                recipient_type,
                data,
            )

        # ----------------------------------------------------
        # SCHOOL ADMIN
        # ----------------------------------------------------

        if user.role == User.Role.SCHOOL_ADMIN:

            return self.get_school_recipients(
                school_id=user.school_id,
                recipient_type=recipient_type,
                data=data,
            )

        # ----------------------------------------------------
        # PRINCIPAL
        # ----------------------------------------------------

        if user.role == User.Role.PRINCIPAL:

            return self.get_school_recipients(
                school_id=user.school_id,
                recipient_type=recipient_type,
                data=data,
            )

        # ----------------------------------------------------
        # TEACHER
        # ----------------------------------------------------

        if user.role == User.Role.TEACHER:

            return self.get_teacher_recipients(
                recipient_type,
                data,
            )

        return User.objects.none()

    # ========================================================
    # SUPER ADMIN RECIPIENTS
    # ========================================================

    def get_super_admin_recipients(
        self,
        recipient_type,
        data,
    ):

        # ----------------------------------------------------
        # ALL USERS ACROSS ALL SCHOOLS
        #
        # A user's school can be stored either directly on
        # User.school or through their role profile.
        # ----------------------------------------------------

        if recipient_type == "ALL_SCHOOLS":

            return User.objects.filter(
                is_active=True,
            ).filter(

                # --------------------------------------------
                # SCHOOL-LINKED STAFF
                # --------------------------------------------

                Q(
                    school__isnull=False,
                )

                |

                # --------------------------------------------
                # STUDENTS
                # --------------------------------------------

                Q(
                    role=User.Role.STUDENT,
                    student_profile__school__isnull=False,
                    student_profile__status=Student.Status.ACTIVE,
                )

                |

                # --------------------------------------------
                # PARENTS / GUARDIANS
                # --------------------------------------------

                Q(
                    role=User.Role.PARENT,
                    parent_profile__school__isnull=False,
                    parent_profile__is_active=True,
                )

                |

                # --------------------------------------------
                # TEACHERS
                # --------------------------------------------

                Q(
                    role=User.Role.TEACHER,
                    teacher_profile__school__isnull=False,
                    teacher_profile__employment_status=(
                        Teacher.EmploymentStatus.ACTIVE
                    ),
                )
            ).distinct()

        # ----------------------------------------------------
        # ALL ROLES
        #
        # Every active user in the entire system.
        # ----------------------------------------------------

        if recipient_type == "ALL_ROLES":

            return User.objects.filter(
                is_active=True,
            )

        # ----------------------------------------------------
        # ALL USERS IN ONE SCHOOL
        #
        # School membership can come from User.school or
        # the user's role profile.
        # ----------------------------------------------------

        if recipient_type == "SCHOOL":

            school_id = data.get("school_id")

            if not school_id:
                return User.objects.none()

            return User.objects.filter(
                is_active=True,
            ).filter(

                # --------------------------------------------
                # SCHOOL-LINKED STAFF
                # --------------------------------------------

                Q(
                    school_id=school_id,
                )

                |

                # --------------------------------------------
                # STUDENTS
                # --------------------------------------------

                Q(
                    role=User.Role.STUDENT,
                    student_profile__school_id=school_id,
                    student_profile__status=Student.Status.ACTIVE,
                )

                |

                # --------------------------------------------
                # PARENTS / GUARDIANS
                # --------------------------------------------

                Q(
                    role=User.Role.PARENT,
                    parent_profile__school_id=school_id,
                    parent_profile__is_active=True,
                )

                |

                # --------------------------------------------
                # TEACHERS
                # --------------------------------------------

                Q(
                    role=User.Role.TEACHER,
                    teacher_profile__school_id=school_id,
                    teacher_profile__employment_status=(
                        Teacher.EmploymentStatus.ACTIVE
                    ),
                )
            ).distinct()

        # ----------------------------------------------------
        # ALL STUDENTS
        # ----------------------------------------------------

        if recipient_type == "ALL_STUDENTS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.STUDENT,
                student_profile__school__isnull=False,
                student_profile__status=Student.Status.ACTIVE,
            )

        # ----------------------------------------------------
        # SELECTED STUDENTS
        # ----------------------------------------------------

        if recipient_type == "STUDENTS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.STUDENT,
                student_profile__id__in=data[
                    "student_ids"
                ],
                student_profile__status=Student.Status.ACTIVE,
            )

        # ----------------------------------------------------
        # ALL PARENTS
        # ----------------------------------------------------

        if recipient_type == "ALL_PARENTS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.PARENT,
                parent_profile__school__isnull=False,
                parent_profile__is_active=True,
            )

        # ----------------------------------------------------
        # SELECTED PARENTS
        # ----------------------------------------------------

        if recipient_type == "PARENTS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.PARENT,
                parent_profile__id__in=data[
                    "parent_ids"
                ],
                parent_profile__is_active=True,
            )

        # ----------------------------------------------------
        # ALL TEACHERS
        # ----------------------------------------------------

        if recipient_type == "ALL_TEACHERS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.TEACHER,
                teacher_profile__school__isnull=False,
                teacher_profile__employment_status=(
                    Teacher.EmploymentStatus.ACTIVE
                ),
            )

        # ----------------------------------------------------
        # SELECTED TEACHERS
        # ----------------------------------------------------

        if recipient_type == "TEACHERS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.TEACHER,
                teacher_profile__id__in=data[
                    "teacher_ids"
                ],
                teacher_profile__employment_status=(
                    Teacher.EmploymentStatus.ACTIVE
                ),
            )

        return User.objects.none()

    # ========================================================
    # SCHOOL ADMIN / PRINCIPAL RECIPIENTS
    # ========================================================

    def get_school_recipients(
        self,
        school_id,
        recipient_type,
        data,
    ):

        # ====================================================
        # ALL ROLES
        # ====================================================

        if recipient_type == "ALL_ROLES":

            return User.objects.filter(
                is_active=True,
            ).filter(

                # ------------------------------------------------
                # SCHOOL-LINKED STAFF
                # ------------------------------------------------

                Q(
                    school_id=school_id,
                    role__in=[
                        User.Role.SCHOOL_ADMIN,
                        User.Role.PRINCIPAL,
                        User.Role.ACCOUNTANT,
                        User.Role.LIBRARIAN,
                        User.Role.ADMISSION_OFFICER,
                        User.Role.EXAM_OFFICER,
                        User.Role.COUNSELOR,
                        User.Role.HOSTEL_MANAGER,
                        User.Role.TRANSPORT_MANAGER,
                    ],
                )

                |

                # ------------------------------------------------
                # STUDENTS
                # ------------------------------------------------

                Q(
                    role=User.Role.STUDENT,
                    student_profile__school_id=school_id,
                    student_profile__status=Student.Status.ACTIVE,
                )

                |

                # ------------------------------------------------
                # PARENTS / GUARDIANS
                # ------------------------------------------------

                Q(
                    role=User.Role.PARENT,
                    parent_profile__school_id=school_id,
                    parent_profile__is_active=True,
                )

                |

                # ------------------------------------------------
                # TEACHERS
                # ------------------------------------------------

                Q(
                    role=User.Role.TEACHER,
                    teacher_profile__school_id=school_id,
                    teacher_profile__employment_status=(
                        Teacher.EmploymentStatus.ACTIVE
                    ),
                )
            ).distinct()

        # ----------------------------------------------------
        # ALL STUDENTS
        # ----------------------------------------------------

        if recipient_type == "ALL_STUDENTS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.STUDENT,
                student_profile__school_id=school_id,
                student_profile__status=Student.Status.ACTIVE,
            )

        # ----------------------------------------------------
        # SELECTED STUDENTS
        # ----------------------------------------------------

        if recipient_type == "STUDENTS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.STUDENT,
                student_profile__school_id=school_id,
                student_profile__status=Student.Status.ACTIVE,
                student_profile__id__in=data[
                    "student_ids"
                ],
            )

        # ----------------------------------------------------
        # ALL PARENTS
        # ----------------------------------------------------

        if recipient_type == "ALL_PARENTS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.PARENT,
                parent_profile__school_id=school_id,
                parent_profile__is_active=True,
            )

        # ----------------------------------------------------
        # SELECTED PARENTS
        # ----------------------------------------------------

        if recipient_type == "PARENTS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.PARENT,
                parent_profile__school_id=school_id,
                parent_profile__is_active=True,
                parent_profile__id__in=data[
                    "parent_ids"
                ],
            )

        # ----------------------------------------------------
        # ALL TEACHERS
        # ----------------------------------------------------

        if recipient_type == "ALL_TEACHERS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.TEACHER,
                teacher_profile__school_id=school_id,
                teacher_profile__employment_status=(
                    Teacher.EmploymentStatus.ACTIVE
                ),
            )

        # ----------------------------------------------------
        # SELECTED TEACHERS
        # ----------------------------------------------------

        if recipient_type == "TEACHERS":

            return User.objects.filter(
                is_active=True,
                role=User.Role.TEACHER,
                teacher_profile__school_id=school_id,
                teacher_profile__employment_status=(
                    Teacher.EmploymentStatus.ACTIVE
                ),
                teacher_profile__id__in=data[
                    "teacher_ids"
                ],
            )

        return User.objects.none()

    # ========================================================
    # TEACHER RECIPIENTS
    # ========================================================

    def get_teacher_recipients(
        self,
        recipient_type,
        data,
    ):

        # ----------------------------------------------------
        # GET LOGGED-IN TEACHER
        # ----------------------------------------------------

        teacher = getattr(
            self.request.user,
            "teacher_profile",
            None,
        )

        if not teacher:
            return User.objects.none()

        # ----------------------------------------------------
        # TEACHER SCHOOL
        #
        # Teacher users may have school_id=None.
        # The Teacher profile contains the actual school.
        # ----------------------------------------------------

        teacher_school_id = teacher.school_id

        if not teacher_school_id:
            return User.objects.none()

        # ====================================================
        # ENTIRE CLASS
        # ====================================================

        if recipient_type == "CLASS":

            class_level_id = data.get(
                "class_level_id"
            )

            if not class_level_id:
                return User.objects.none()

            # ------------------------------------------------
            # VERIFY CLASS TEACHER ASSIGNMENT
            # ------------------------------------------------

            assigned = ClassTeacher.objects.filter(
                teacher=teacher,
                class_level_id=class_level_id,
                is_active=True,
            ).exists()

            if not assigned:
                return User.objects.none()

            # ------------------------------------------------
            # FIND CURRENT ACTIVE STUDENTS IN THE CLASS
            # ------------------------------------------------

            student_ids = (
                Student.objects
                .filter(
                    school_id=teacher_school_id,
                    status=Student.Status.ACTIVE,
                    user__isnull=False,

                    enrollments__class_level_id=class_level_id,
                    enrollments__is_current=True,
                )
                .values_list(
                    "id",
                    flat=True,
                )
                .distinct()
            )

            # ------------------------------------------------
            # RETURN THEIR USER ACCOUNTS
            # ------------------------------------------------

            return (
                User.objects
                .filter(
                    is_active=True,
                    role=User.Role.STUDENT,
                    student_profile__school_id=teacher_school_id,
                    student_profile__id__in=student_ids,
                )
                .distinct()
            )

        # ====================================================
        # SUBJECT GROUP
        # ====================================================

        if recipient_type == "SUBJECT":

            subject_id = data.get(
                "subject_id"
            )

            if not subject_id:
                return User.objects.none()

            # ------------------------------------------------
            # FIND CLASSES WHERE THIS TEACHER TEACHES
            # THE SUBJECT
            # ------------------------------------------------

            assigned_class_ids = (
                TeacherSubject.objects
                .filter(
                    teacher=teacher,
                    subject_id=subject_id,
                )
                .values_list(
                    "class_level_id",
                    flat=True,
                )
                .distinct()
            )

            if not assigned_class_ids:
                return User.objects.none()

            # ------------------------------------------------
            # FIND CURRENT ACTIVE STUDENTS IN THOSE CLASSES
            #
            # IMPORTANT:
            #
            # We do NOT require StudentSubjectEnrollment here.
            #
            # The TeacherSubject assignment already establishes
            # that the teacher teaches this subject to this class.
            #
            # Therefore the recipient group is:
            #
            #   Teacher
            #      ↓
            #   Subject
            #      ↓
            #   Assigned Class(es)
            #      ↓
            #   Current Students
            # ------------------------------------------------

            student_ids = (
                Student.objects
                .filter(
                    school_id=teacher_school_id,
                    status=Student.Status.ACTIVE,
                    user__isnull=False,

                    enrollments__class_level_id__in=(
                        assigned_class_ids
                    ),

                    enrollments__is_current=True,
                )
                .values_list(
                    "id",
                    flat=True,
                )
                .distinct()
            )

            # ------------------------------------------------
            # RETURN STUDENT USER ACCOUNTS
            # ------------------------------------------------

            return (
                User.objects
                .filter(
                    is_active=True,
                    role=User.Role.STUDENT,
                    student_profile__school_id=teacher_school_id,
                    student_profile__id__in=student_ids,
                )
                .distinct()
            )

        # ====================================================
        # UNKNOWN RECIPIENT TYPE
        # ====================================================

        return User.objects.none()


# ============================================================
# SENT NOTIFICATIONS
# ============================================================

class SentNotificationListView(
    generics.ListAPIView
):

    serializer_class = NotificationSerializer

    permission_classes = [
        IsAuthenticated,
        CanSendNotification,
    ]

    def get_queryset(self):

        return Notification.objects.filter(
            sender_id=self.request.user.id
        ).select_related(
            "sender",
            "recipient",
        ).order_by(
            "-created_at"
        )


# ============================================================
# SENT NOTIFICATION DETAIL
# ============================================================

class SentNotificationDetailView(
    generics.RetrieveDestroyAPIView
):

    serializer_class = NotificationSerializer

    permission_classes = [
        IsAuthenticated,
        CanSendNotification,
    ]

    def get_queryset(self):

        return Notification.objects.filter(
            sender_id=self.request.user.id
        ).select_related(
            "sender",
            "recipient",
        )

    # ========================================================
    # DELETE SENT NOTIFICATION
    # ========================================================

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):

        notification = self.get_object()

        batch_id = notification.batch_id

        # ----------------------------------------------------
        # NEW NOTIFICATIONS
        #
        # New sends have a batch_id.
        #
        # Delete the entire send operation for this sender,
        # including all recipient notification rows.
        # ----------------------------------------------------

        if batch_id:

            deleted_count, _ = (
                Notification.objects.filter(
                    sender_id=request.user.id,
                    batch_id=batch_id,
                ).delete()
            )

            return Response(
                {
                    "detail": (
                        "Notification deleted successfully."
                    ),
                    "deleted_count": deleted_count,
                },
                status=status.HTTP_200_OK,
            )

        # ----------------------------------------------------
        # LEGACY NOTIFICATIONS
        #
        # Notifications created before batching do not have
        # a batch_id.
        #
        # Delete only the selected legacy notification.
        # ----------------------------------------------------

        notification.delete()

        return Response(
            {
                "detail": (
                    "Notification deleted successfully."
                )
            },
            status=status.HTTP_200_OK,
        )