# from django.db import transaction
# from django.utils.crypto import get_random_string

# from students.models import (
#     Student,
#     ParentGuardian,
#     StudentEnrollment,
# )
# from accounts.models import User
# from academics.models import School
# from teachers.models import Teacher
# # from students.models import Student, ParentGuardian
# from finance.models import AccountantProfile
# from examinations.models import ExamOfficerProfile
# from library.models import LibrarianProfile
# from admissions.models import AdmissionOfficerProfile
# from principal.models import Principal


# # ============================================================
# # TEMPORARY PASSWORD
# # ============================================================

# def generate_temporary_password(length=10):
#     return get_random_string(length=length)


# # ============================================================
# # UNIQUE USERNAME
# # ============================================================

# def get_unique_username(base_username):
#     """
#     Preserve the role identifier as the username.

#     Examples:
#         ACC001
#         TCH001
#         LIB001
#         EXAM001
#         ADM001
#         EDU2026001
#         PRI001

#     If the exact username already exists, append -2, -3, etc.
#     """

#     username = str(base_username).strip().upper()

#     if not username:
#         raise ValueError("A username identifier is required.")

#     if not User.objects.filter(username__iexact=username).exists():
#         return username

#     counter = 2

#     while User.objects.filter(
#         username__iexact=f"{username}-{counter}"
#     ).exists():
#         counter += 1

#     return f"{username}-{counter}"


# # ============================================================
# # UNIQUE INTERNAL EMAIL
# # ============================================================

# def get_internal_email(username, role):
#     """
#     Used when a role does not provide an email address.

#     This keeps User.email unique because the accounts.User model
#     requires unique email addresses.
#     """

#     role_domains = {
#         User.Role.TEACHER: "teacher.edumanage.local",
#         User.Role.STUDENT: "student.edumanage.local",
#         User.Role.PARENT: "parent.edumanage.local",
#         User.Role.ACCOUNTANT: "accountant.edumanage.local",
#         User.Role.EXAM_OFFICER: "exam.edumanage.local",
#         User.Role.LIBRARIAN: "library.edumanage.local",
#         User.Role.ADMISSION_OFFICER: "admission.edumanage.local",
#         User.Role.PRINCIPAL: "principal.edumanage.local",
#     }

#     domain = role_domains.get(
#         role,
#         "edumanage.local",
#     )

#     email = f"{username.lower()}@{domain}"

#     counter = 1

#     while User.objects.filter(
#         email__iexact=email
#     ).exists():
#         email = (
#             f"{username.lower()}.{counter}"
#             f"@{domain}"
#         )
#         counter += 1

#     return email


# # ============================================================
# # EMAIL VALIDATION
# # ============================================================

# def resolve_email(email, username, role):
#     email = (email or "").strip().lower()

#     if email:
#         if User.objects.filter(
#             email__iexact=email
#         ).exists():
#             raise ValueError(
#                 "A user with this email address already exists."
#             )

#         return email

#     return get_internal_email(
#         username=username,
#         role=role,
#     )


# # ============================================================
# # CREATE CENTRAL USER
# # ============================================================

# def create_central_user(
#     *,
#     username,
#     email,
#     password,
#     role,
#     first_name,
#     last_name="",
#     phone_number="",
#     school=None,
#     profile_image=None,
# ):
#     """
#     Creates the central accounts.User record.

#     School is assigned when the User model supports the school
#     relationship. Role-specific profiles still receive the school
#     independently where their models require it.
#     """

#     user_kwargs = {
#         "username": username,
#         "email": email,
#         "password": password,
#         "first_name": first_name,
#         "last_name": last_name,
#         "phone_number": phone_number or "",
#         "role": role,
#         "profile_image": profile_image,
#     }

#     user = User.objects.create_user(
#         **user_kwargs
#     )

#     if school is not None:
#         user.school = school
#         user.save(
#             update_fields=["school"]
#         )

#     return user


# # ============================================================
# # TEACHER
# # ============================================================

# @transaction.atomic
# def create_teacher(
#     *,
#     school,
#     first_name,
#     last_name,
#     email="",
#     phone_number="",
#     **data,
# ):
#     employee_id = str(
#         data.get("employee_id", "")
#     ).strip()

#     if not employee_id:
#         raise ValueError(
#             "Employee ID is required for a Teacher."
#         )

#     if Teacher.objects.filter(
#         employee_id__iexact=employee_id
#     ).exists():
#         raise ValueError(
#             "A teacher with this employee ID already exists."
#         )

#     username = get_unique_username(
#         employee_id
#     )

#     email = resolve_email(
#         email,
#         username,
#         User.Role.TEACHER,
#     )

#     password = generate_temporary_password()

#     user = create_central_user(
#         username=username,
#         email=email,
#         password=password,
#         role=User.Role.TEACHER,
#         first_name=first_name,
#         last_name=last_name,
#         phone_number=phone_number,
#         school=school,
#     )

#     teacher = Teacher.objects.create(
#         school=school,
#         user=user,
#         employee_id=employee_id,
#         first_name=first_name,
#         last_name=last_name,
#         middle_name=data.get("middle_name", ""),
#         email=email,
#         phone_number=phone_number,
#         date_of_birth=data.get("date_of_birth"),
#         gender=data.get("gender", ""),
#         address=data.get("address", ""),
#         department=data.get("department"),
#         specialization=data.get("specialization", ""),
#         qualification=data.get("qualification", ""),
#         employment_date=data.get("employment_date"),
#         employment_status=data.get(
#             "employment_status",
#             "ACTIVE",
#         ),
#         is_class_teacher=data.get(
#             "is_class_teacher",
#             False,
#         ),
#         bio=data.get("bio", ""),
#     )

#     return {
#         "user": user,
#         "profile": teacher,
#         "username": username,
#         "temporary_password": password,
#     }


# # ============================================================
# # ACCOUNTANT
# # ============================================================

# @transaction.atomic
# def create_accountant(
#     *,
#     school,
#     first_name,
#     last_name,
#     email="",
#     phone_number="",
#     **data,
# ):
#     employee_number = str(
#         data.get("employee_number", "")
#     ).strip()

#     if not employee_number:
#         raise ValueError(
#             "Employee number is required for an Accountant."
#         )

#     if AccountantProfile.objects.filter(
#         employee_number__iexact=employee_number
#     ).exists():
#         raise ValueError(
#             "An accountant with this employee number already exists."
#         )

#     username = get_unique_username(
#         employee_number
#     )

#     email = resolve_email(
#         email,
#         username,
#         User.Role.ACCOUNTANT,
#     )

#     password = generate_temporary_password(
#         length=12
#     )

#     user = create_central_user(
#         username=username,
#         email=email,
#         password=password,
#         role=User.Role.ACCOUNTANT,
#         first_name=first_name,
#         last_name=last_name,
#         phone_number=phone_number,
#         school=school,
#     )

#     accountant = AccountantProfile.objects.create(
#         user=user,
#         school=school,
#         employee_number=employee_number,
#         employment_date=data.get(
#             "employment_date"
#         ),
#     )

#     return {
#         "user": user,
#         "profile": accountant,
#         "username": username,
#         "temporary_password": password,
#     }


# # ============================================================
# # EXAM OFFICER
# # ============================================================

# @transaction.atomic
# def create_exam_officer(
#     *,
#     school,
#     first_name,
#     last_name,
#     email="",
#     phone_number="",
#     **data,
# ):
#     employee_number = str(
#         data.get("employee_number", "")
#     ).strip()

#     if not employee_number:
#         raise ValueError(
#             "Employee number is required for an Exam Officer."
#         )

#     if ExamOfficerProfile.objects.filter(
#         employee_number__iexact=employee_number
#     ).exists():
#         raise ValueError(
#             "An Exam Officer with this employee number already exists."
#         )

#     username = get_unique_username(
#         employee_number
#     )

#     email = resolve_email(
#         email,
#         username,
#         User.Role.EXAM_OFFICER,
#     )

#     password = generate_temporary_password(
#         length=12
#     )

#     user = create_central_user(
#         username=username,
#         email=email,
#         password=password,
#         role=User.Role.EXAM_OFFICER,
#         first_name=first_name,
#         last_name=last_name,
#         phone_number=phone_number,
#         school=school,
#     )

#     profile = ExamOfficerProfile.objects.create(
#         user=user,
#         school=school,
#         employee_number=employee_number,
#         employment_date=data.get(
#             "employment_date"
#         ),
#     )

#     return {
#         "user": user,
#         "profile": profile,
#         "username": username,
#         "temporary_password": password,
#     }


# # ============================================================
# # LIBRARIAN
# # ============================================================

# @transaction.atomic
# def create_librarian(
#     *,
#     school,
#     first_name,
#     last_name,
#     email="",
#     phone_number="",
#     **data,
# ):
#     employee_number = str(
#         data.get("employee_number", "")
#     ).strip()

#     if not employee_number:
#         raise ValueError(
#             "Employee number is required for a Librarian."
#         )

#     if LibrarianProfile.objects.filter(
#         employee_number__iexact=employee_number
#     ).exists():
#         raise ValueError(
#             "A Librarian with this employee number already exists."
#         )

#     username = get_unique_username(
#         employee_number
#     )

#     email = resolve_email(
#         email,
#         username,
#         User.Role.LIBRARIAN,
#     )

#     password = generate_temporary_password(
#         length=12
#     )

#     user = create_central_user(
#         username=username,
#         email=email,
#         password=password,
#         role=User.Role.LIBRARIAN,
#         first_name=first_name,
#         last_name=last_name,
#         phone_number=phone_number,
#         school=school,
#     )

#     profile = LibrarianProfile.objects.create(
#         user=user,
#         school=school,
#         employee_number=employee_number,
#         employment_date=data.get(
#             "employment_date"
#         ),
#     )

#     return {
#         "user": user,
#         "profile": profile,
#         "username": username,
#         "temporary_password": password,
#     }


# # ============================================================
# # ADMISSION OFFICER
# # ============================================================

# @transaction.atomic
# def create_admission_officer(
#     *,
#     school,
#     first_name,
#     last_name,
#     email="",
#     phone_number="",
#     **data,
# ):
#     employee_number = str(
#         data.get("employee_number", "")
#     ).strip()

#     if not employee_number:
#         raise ValueError(
#             "Employee number is required for an Admission Officer."
#         )

#     if AdmissionOfficerProfile.objects.filter(
#         employee_number__iexact=employee_number
#     ).exists():
#         raise ValueError(
#             "An Admission Officer with this employee number already exists."
#         )

#     username = get_unique_username(
#         employee_number
#     )

#     email = resolve_email(
#         email,
#         username,
#         User.Role.ADMISSION_OFFICER,
#     )

#     password = generate_temporary_password(
#         length=12
#     )

#     user = create_central_user(
#         username=username,
#         email=email,
#         password=password,
#         role=User.Role.ADMISSION_OFFICER,
#         first_name=first_name,
#         last_name=last_name,
#         phone_number=phone_number,
#         school=school,
#     )

#     profile = AdmissionOfficerProfile.objects.create(
#         user=user,
#         school=school,
#         employee_number=employee_number,
#         employment_date=data.get(
#             "employment_date"
#         ),
#     )

#     return {
#         "user": user,
#         "profile": profile,
#         "username": username,
#         "temporary_password": password,
#     }


# # ============================================================
# # PRINCIPAL
# # ============================================================

# @transaction.atomic
# def create_principal(
#     *,
#     school,
#     first_name,
#     last_name,
#     email="",
#     phone_number="",
#     **data,
# ):
#     employee_id = str(
#         data.get("employee_id", "")
#     ).strip()

#     if not employee_id:
#         raise ValueError(
#             "Employee ID is required for a Principal."
#         )

#     if Principal.objects.filter(
#         employee_id__iexact=employee_id
#     ).exists():
#         raise ValueError(
#             "A Principal with this employee ID already exists."
#         )

#     username = get_unique_username(
#         employee_id
#     )

#     email = resolve_email(
#         email,
#         username,
#         User.Role.PRINCIPAL,
#     )

#     password = generate_temporary_password(
#         length=12
#     )

#     user = create_central_user(
#         username=username,
#         email=email,
#         password=password,
#         role=User.Role.PRINCIPAL,
#         first_name=first_name,
#         last_name=last_name,
#         phone_number=phone_number,
#         school=school,
#         profile_image=data.get("profile_image"),
#     )

#     profile = Principal.objects.create(
#         user=user,
#         school=school,
#         employee_id=employee_id,
#         appointment_date=data.get(
#             "appointment_date"
#         ),
#         qualification=data.get(
#             "qualification",
#             "",
#         ),
#         bio=data.get(
#             "bio",
#             "",
#         ),
#     )

#     return {
#         "user": user,
#         "profile": profile,
#         "username": username,
#         "temporary_password": password,
#     }


# # ============================================================
# # PARENT / GUARDIAN
# # ============================================================

# @transaction.atomic
# def create_parent(
#     *,
#     school,
#     first_name,
#     last_name="",
#     email="",
#     phone_number="",
#     **data,
# ):
#     full_name = (
#         f"{first_name} {last_name}"
#     ).strip()

#     relationship = str(
#         data.get("relationship", "")
#     ).strip()

#     if not relationship:
#         raise ValueError(
#             "Relationship is required for a Parent / Guardian."
#         )

#     # Parent does not have an employee number,
#     # so generate the normal PARENT001 pattern.
#     last_parent = (
#         ParentGuardian.objects
#         .filter(school=school)
#         .order_by("-id")
#         .first()
#     )

#     if last_parent and last_parent.user:
#         old_username = last_parent.user.username

#         try:
#             number = int(
#                 old_username.replace(
#                     "PARENT",
#                     "",
#                 )
#             )
#             username = f"PARENT{number + 1:03d}"
#         except ValueError:
#             username = "PARENT001"
#     else:
#         username = "PARENT001"

#     while User.objects.filter(
#         username__iexact=username
#     ).exists():
#         number = int(
#             username.replace(
#                 "PARENT",
#                 "",
#             )
#         )
#         number += 1
#         username = f"PARENT{number:03d}"

#     email = resolve_email(
#         email,
#         username,
#         User.Role.PARENT,
#     )

#     password = generate_temporary_password()

#     user = create_central_user(
#         username=username,
#         email=email,
#         password=password,
#         role=User.Role.PARENT,
#         first_name=full_name,
#         last_name="",
#         phone_number=phone_number,
#         school=school,
#     )

#     profile = ParentGuardian.objects.create(
#         school=school,
#         user=user,
#         full_name=full_name,
#         relationship=relationship,
#         phone_number=phone_number,
#         email=email,
#         address=data.get("address", ""),
#         occupation=data.get("occupation", ""),
#         emergency_contact=data.get(
#             "emergency_contact",
#             "",
#         ),
#     )

#     return {
#         "user": user,
#         "profile": profile,
#         "username": username,
#         "temporary_password": password,
#     }


# # ============================================================
# # STUDENT + ENROLLMENT
# # ============================================================

# @transaction.atomic
# def create_student(
#     *,
#     school,
#     first_name,
#     last_name,
#     email="",
#     phone_number="",
#     **data,
# ):
#     # --------------------------------------------------------
#     # STUDENT INFORMATION
#     # --------------------------------------------------------

#     admission_number = str(
#         data.get("admission_number", "")
#     ).strip()

#     if not admission_number:
#         raise ValueError(
#             "Admission number is required for a Student."
#         )

#     if Student.objects.filter(
#         admission_number__iexact=admission_number
#     ).exists():
#         raise ValueError(
#             "A student with this admission number already exists."
#         )

#     date_of_birth = data.get(
#         "date_of_birth"
#     )

#     if not date_of_birth:
#         raise ValueError(
#             "Date of birth is required for a Student."
#         )

#     gender = data.get("gender")

#     if not gender:
#         raise ValueError(
#             "Gender is required for a Student."
#         )

#     admission_date = data.get(
#         "admission_date"
#     )

#     if not admission_date:
#         raise ValueError(
#             "Admission date is required for a Student."
#         )

#     # --------------------------------------------------------
#     # ENROLLMENT INFORMATION
#     # --------------------------------------------------------

#     academic_session = data.get(
#         "academic_session"
#     )

#     term = data.get(
#         "term"
#     )

#     class_level = data.get(
#         "class_level"
#     )

#     if not academic_session:
#         raise ValueError(
#             "Academic session is required when creating a Student."
#         )

#     if not term:
#         raise ValueError(
#             "Term is required when creating a Student."
#         )

#     if not class_level:
#         raise ValueError(
#             "Class level is required when creating a Student."
#         )

#     # --------------------------------------------------------
#     # SCHOOL VALIDATION
#     # --------------------------------------------------------

#     if academic_session.school_id != school.id:
#         raise ValueError(
#             "The selected academic session does not belong "
#             "to this school."
#         )

#     if class_level.school_id != school.id:
#         raise ValueError(
#             "The selected class level does not belong "
#             "to this school."
#         )

#     if term.academic_session_id != academic_session.id:
#         raise ValueError(
#             "The selected term does not belong "
#             "to the selected academic session."
#         )

#     # --------------------------------------------------------
#     # USERNAME
#     # --------------------------------------------------------

#     username = get_unique_username(
#         admission_number
#     )

#     # --------------------------------------------------------
#     # EMAIL
#     # --------------------------------------------------------

#     email = resolve_email(
#         email,
#         username,
#         User.Role.STUDENT,
#     )

#     # --------------------------------------------------------
#     # TEMPORARY PASSWORD
#     # --------------------------------------------------------

#     password = generate_temporary_password()

#     # --------------------------------------------------------
#     # CREATE CENTRAL USER
#     # --------------------------------------------------------

#     user = create_central_user(
#         username=username,
#         email=email,
#         password=password,
#         role=User.Role.STUDENT,
#         first_name=first_name,
#         last_name=last_name,
#         phone_number=phone_number,
#         school=school,
#     )

#     # --------------------------------------------------------
#     # CREATE STUDENT PROFILE
#     # --------------------------------------------------------

#     profile = Student.objects.create(
#         school=school,
#         user=user,

#         admission_number=admission_number,

#         first_name=first_name,
#         middle_name=data.get(
#             "middle_name",
#             "",
#         ),
#         last_name=last_name,

#         date_of_birth=date_of_birth,

#         gender=gender,

#         email=email,
#         phone_number=phone_number,

#         address=data.get(
#             "address",
#             "",
#         ),

#         department=data.get(
#             "department"
#         ),

#         admission_date=admission_date,

#         blood_group=data.get(
#             "blood_group",
#             "",
#         ),

#         nationality=data.get(
#             "nationality",
#             "",
#         ),

#         state_of_origin=data.get(
#             "state_of_origin",
#             "",
#         ),

#         local_government=data.get(
#             "local_government",
#             "",
#         ),

#         medical_notes=data.get(
#             "medical_notes",
#             "",
#         ),
#     )

#     # --------------------------------------------------------
#     # CHECK FOR DUPLICATE ENROLLMENT
#     # --------------------------------------------------------

#     if StudentEnrollment.objects.filter(
#         student=profile,
#         academic_session=academic_session,
#         term=term,
#     ).exists():
#         raise ValueError(
#             "This student is already enrolled "
#             "for this session and term."
#         )

#     # --------------------------------------------------------
#     # GET NEXT ROLL NUMBER
#     # --------------------------------------------------------

#     existing_roll_numbers = (
#         StudentEnrollment.objects
#         .filter(
#             class_level=class_level,
#             academic_session=academic_session,
#             term=term,
#             roll_number__isnull=False,
#         )
#         .values_list(
#             "roll_number",
#             flat=True,
#         )
#     )

#     used_roll_numbers = set(
#         existing_roll_numbers
#     )

#     roll_number = 1

#     while roll_number in used_roll_numbers:
#         roll_number += 1

#     # --------------------------------------------------------
#     # ENROLL STUDENT
#     # --------------------------------------------------------

#     enrollment = StudentEnrollment.objects.create(
#         student=profile,
#         academic_session=academic_session,
#         term=term,
#         class_level=class_level,
#         roll_number=roll_number,
#         is_current=data.get(
#             "is_current",
#             True,
#         ),
#         remarks=data.get(
#             "remarks",
#             "",
#         ),
#     )

#     # --------------------------------------------------------
#     # RETURN EVERYTHING
#     # --------------------------------------------------------

#     return {
#         "user": user,
#         "profile": profile,
#         "enrollment": enrollment,
#         "username": username,
#         "temporary_password": password,
#     }


# # ============================================================
# # MAIN SCHOOL USER PROVISIONER
# # ============================================================

# @transaction.atomic
# def provision_school_user(
#     *,
#     school,
#     role,
#     first_name,
#     last_name,
#     email="",
#     phone_number="",
#     **profile_data,
# ):
#     """
#     Central coordinator used by School Super Admin.

#     The School Admin cannot create:
#         SUPER_ADMIN
#         SCHOOL_ADMIN

#     Every supported account is attached to the current school.
#     """

#     if not school:
#         raise ValueError(
#             "The School Admin does not have an assigned school."
#         )

#     forbidden_roles = [
#         User.Role.SUPER_ADMIN,
#         User.Role.SCHOOL_ADMIN,
#     ]

#     if role in forbidden_roles:
#         raise ValueError(
#             "This role cannot be created from School User Management."
#         )

#     common = {
#         "school": school,
#         "first_name": first_name,
#         "last_name": last_name,
#         "email": email,
#         "phone_number": phone_number,
#         **profile_data,
#     }

#     if role == User.Role.TEACHER:
#         return create_teacher(**common)

#     if role == User.Role.STUDENT:
#         return create_student(**common)

#     if role == User.Role.PARENT:
#         return create_parent(**common)

#     if role == User.Role.ACCOUNTANT:
#         return create_accountant(**common)

#     if role == User.Role.EXAM_OFFICER:
#         return create_exam_officer(**common)

#     if role == User.Role.LIBRARIAN:
#         return create_librarian(**common)

#     if role == User.Role.ADMISSION_OFFICER:
#         return create_admission_officer(**common)

#     if role == User.Role.PRINCIPAL:
#         return create_principal(**common)

#     raise ValueError(
#         f"Creation of the {role} role is not yet supported "
#         "by School User Management."
#     )



from django.db import transaction
from django.utils.crypto import get_random_string

from students.models import (
    Student,
    ParentGuardian,
    StudentEnrollment,
)

from accounts.models import User
from academics.models import School
from teachers.models import Teacher

from finance.models import AccountantProfile
from examinations.models import ExamOfficerProfile
from library.models import LibrarianProfile
from admissions.models import AdmissionOfficerProfile
from principal.models import Principal


# ============================================================
# TEMPORARY PASSWORD
# ============================================================

def generate_temporary_password(length=10):
    return get_random_string(length=length)


# ============================================================
# UNIQUE USERNAME
# ============================================================

def get_unique_username(base_username):
    """
    Preserve the role identifier as the username.

    Examples:
        ACC001
        TCH001
        LIB001
        EXAM001
        ADM001
        EDU2026001
        PRI001

    If the exact username already exists, append -2, -3, etc.
    """

    username = str(base_username).strip().upper()

    if not username:
        raise ValueError(
            "A username identifier is required."
        )

    if not User.objects.filter(
        username__iexact=username
    ).exists():
        return username

    counter = 2

    while User.objects.filter(
        username__iexact=f"{username}-{counter}"
    ).exists():
        counter += 1

    return f"{username}-{counter}"


# ============================================================
# UNIQUE INTERNAL EMAIL
# ============================================================

def get_internal_email(username, role):
    """
    Used when a role does not provide an email address.

    This keeps User.email unique because the accounts.User model
    requires unique email addresses.
    """

    role_domains = {
        User.Role.SCHOOL_ADMIN: "admin.edumanage.local",
        User.Role.TEACHER: "teacher.edumanage.local",
        User.Role.STUDENT: "student.edumanage.local",
        User.Role.PARENT: "parent.edumanage.local",
        User.Role.ACCOUNTANT: "accountant.edumanage.local",
        User.Role.EXAM_OFFICER: "exam.edumanage.local",
        User.Role.LIBRARIAN: "library.edumanage.local",
        User.Role.ADMISSION_OFFICER: "admission.edumanage.local",
        User.Role.PRINCIPAL: "principal.edumanage.local",
    }

    domain = role_domains.get(
        role,
        "edumanage.local",
    )

    email = f"{username.lower()}@{domain}"

    counter = 1

    while User.objects.filter(
        email__iexact=email
    ).exists():
        email = (
            f"{username.lower()}.{counter}"
            f"@{domain}"
        )
        counter += 1

    return email


# ============================================================
# EMAIL VALIDATION
# ============================================================

def resolve_email(email, username, role):
    email = (email or "").strip().lower()

    if email:
        if User.objects.filter(
            email__iexact=email
        ).exists():
            raise ValueError(
                "A user with this email address already exists."
            )

        return email

    return get_internal_email(
        username=username,
        role=role,
    )


# ============================================================
# CREATE CENTRAL USER
# ============================================================

def create_central_user(
    *,
    username,
    email,
    password,
    role,
    first_name,
    last_name="",
    phone_number="",
    school=None,
    profile_image=None,
):
    """
    Creates the central accounts.User record.

    School is assigned when the User model supports the school
    relationship. Role-specific profiles still receive the school
    independently where their models require it.
    """

    user_kwargs = {
        "username": username,
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name,
        "phone_number": phone_number or "",
        "role": role,
        "profile_image": profile_image,
    }

    user = User.objects.create_user(
        **user_kwargs
    )

    if school is not None:
        user.school = school
        user.save(
            update_fields=["school"]
        )

    return user


# ============================================================
# TEACHER
# ============================================================

@transaction.atomic
def create_teacher(
    *,
    school,
    first_name,
    last_name,
    email="",
    phone_number="",
    **data,
):
    employee_id = str(
        data.get("employee_id", "")
    ).strip()

    if not employee_id:
        raise ValueError(
            "Employee ID is required for a Teacher."
        )

    if Teacher.objects.filter(
        employee_id__iexact=employee_id
    ).exists():
        raise ValueError(
            "A teacher with this employee ID already exists."
        )

    username = get_unique_username(
        employee_id
    )

    email = resolve_email(
        email,
        username,
        User.Role.TEACHER,
    )

    password = generate_temporary_password()

    user = create_central_user(
        username=username,
        email=email,
        password=password,
        role=User.Role.TEACHER,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        school=school,
        profile_image=data.get("profile_image"),
    )

    teacher = Teacher.objects.create(
        school=school,
        user=user,
        employee_id=employee_id,
        first_name=first_name,
        last_name=last_name,
        middle_name=data.get("middle_name", ""),
        email=email,
        phone_number=phone_number,
        date_of_birth=data.get("date_of_birth"),
        gender=data.get("gender", ""),
        address=data.get("address", ""),
        department=data.get("department"),
        specialization=data.get("specialization", ""),
        qualification=data.get("qualification", ""),
        employment_date=data.get("employment_date"),
        employment_status=data.get(
            "employment_status",
            "ACTIVE",
        ),
        is_class_teacher=data.get(
            "is_class_teacher",
            False,
        ),
        bio=data.get("bio", ""),
    )

    return {
        "user": user,
        "profile": teacher,
        "username": username,
        "temporary_password": password,
    }


# ============================================================
# ACCOUNTANT
# ============================================================

@transaction.atomic
def create_accountant(
    *,
    school,
    first_name,
    last_name,
    email="",
    phone_number="",
    **data,
):
    employee_number = str(
        data.get("employee_number", "")
    ).strip()

    if not employee_number:
        raise ValueError(
            "Employee number is required for an Accountant."
        )

    if AccountantProfile.objects.filter(
        employee_number__iexact=employee_number
    ).exists():
        raise ValueError(
            "An accountant with this employee number already exists."
        )

    username = get_unique_username(
        employee_number
    )

    email = resolve_email(
        email,
        username,
        User.Role.ACCOUNTANT,
    )

    password = generate_temporary_password(
        length=12
    )

    user = create_central_user(
        username=username,
        email=email,
        password=password,
        role=User.Role.ACCOUNTANT,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        school=school,
        profile_image=data.get("profile_image"),
    )

    accountant = AccountantProfile.objects.create(
        user=user,
        school=school,
        employee_number=employee_number,
        employment_date=data.get(
            "employment_date"
        ),
    )

    return {
        "user": user,
        "profile": accountant,
        "username": username,
        "temporary_password": password,
    }


# ============================================================
# EXAM OFFICER
# ============================================================

@transaction.atomic
def create_exam_officer(
    *,
    school,
    first_name,
    last_name,
    email="",
    phone_number="",
    **data,
):
    employee_number = str(
        data.get("employee_number", "")
    ).strip()

    if not employee_number:
        raise ValueError(
            "Employee number is required for an Exam Officer."
        )

    if ExamOfficerProfile.objects.filter(
        employee_number__iexact=employee_number
    ).exists():
        raise ValueError(
            "An Exam Officer with this employee number already exists."
        )

    username = get_unique_username(
        employee_number
    )

    email = resolve_email(
        email,
        username,
        User.Role.EXAM_OFFICER,
    )

    password = generate_temporary_password(
        length=12
    )

    user = create_central_user(
        username=username,
        email=email,
        password=password,
        role=User.Role.EXAM_OFFICER,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        school=school,
        profile_image=data.get("profile_image"),
    )

    profile = ExamOfficerProfile.objects.create(
        user=user,
        school=school,
        employee_number=employee_number,
        employment_date=data.get(
            "employment_date"
        ),
    )

    return {
        "user": user,
        "profile": profile,
        "username": username,
        "temporary_password": password,
    }


# ============================================================
# LIBRARIAN
# ============================================================

@transaction.atomic
def create_librarian(
    *,
    school,
    first_name,
    last_name,
    email="",
    phone_number="",
    **data,
):
    employee_number = str(
        data.get("employee_number", "")
    ).strip()

    if not employee_number:
        raise ValueError(
            "Employee number is required for a Librarian."
        )

    if LibrarianProfile.objects.filter(
        employee_number__iexact=employee_number
    ).exists():
        raise ValueError(
            "A Librarian with this employee number already exists."
        )

    username = get_unique_username(
        employee_number
    )

    email = resolve_email(
        email,
        username,
        User.Role.LIBRARIAN,
    )

    password = generate_temporary_password(
        length=12
    )

    user = create_central_user(
        username=username,
        email=email,
        password=password,
        role=User.Role.LIBRARIAN,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        school=school,
        profile_image=data.get("profile_image"),
    )

    profile = LibrarianProfile.objects.create(
        user=user,
        school=school,
        employee_number=employee_number,
        employment_date=data.get(
            "employment_date"
        ),
    )

    return {
        "user": user,
        "profile": profile,
        "username": username,
        "temporary_password": password,
    }


# ============================================================
# ADMISSION OFFICER
# ============================================================

@transaction.atomic
def create_admission_officer(
    *,
    school,
    first_name,
    last_name,
    email="",
    phone_number="",
    **data,
):
    employee_number = str(
        data.get("employee_number", "")
    ).strip()

    if not employee_number:
        raise ValueError(
            "Employee number is required for an Admission Officer."
        )

    if AdmissionOfficerProfile.objects.filter(
        employee_number__iexact=employee_number
    ).exists():
        raise ValueError(
            "An Admission Officer with this employee number already exists."
        )

    username = get_unique_username(
        employee_number
    )

    email = resolve_email(
        email,
        username,
        User.Role.ADMISSION_OFFICER,
    )

    password = generate_temporary_password(
        length=12
    )

    user = create_central_user(
        username=username,
        email=email,
        password=password,
        role=User.Role.ADMISSION_OFFICER,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        school=school,
        profile_image=data.get("profile_image"),
    )

    profile = AdmissionOfficerProfile.objects.create(
        user=user,
        school=school,
        employee_number=employee_number,
        employment_date=data.get(
            "employment_date"
        ),
    )

    return {
        "user": user,
        "profile": profile,
        "username": username,
        "temporary_password": password,
    }


# ============================================================
# PRINCIPAL
# ============================================================

@transaction.atomic
def create_principal(
    *,
    school,
    first_name,
    last_name,
    email="",
    phone_number="",
    **data,
):
    employee_id = str(
        data.get("employee_id", "")
    ).strip()

    if not employee_id:
        raise ValueError(
            "Employee ID is required for a Principal."
        )

    if Principal.objects.filter(
        employee_id__iexact=employee_id
    ).exists():
        raise ValueError(
            "A Principal with this employee ID already exists."
        )

    username = get_unique_username(
        employee_id
    )

    email = resolve_email(
        email,
        username,
        User.Role.PRINCIPAL,
    )

    password = generate_temporary_password(
        length=12
    )

    user = create_central_user(
        username=username,
        email=email,
        password=password,
        role=User.Role.PRINCIPAL,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        school=school,
        profile_image=data.get("profile_image"),
    )

    profile = Principal.objects.create(
        user=user,
        school=school,
        employee_id=employee_id,
        appointment_date=data.get(
            "appointment_date"
        ),
        qualification=data.get(
            "qualification",
            "",
        ),
        bio=data.get(
            "bio",
            "",
        ),
    )

    return {
        "user": user,
        "profile": profile,
        "username": username,
        "temporary_password": password,
    }


# ============================================================
# PARENT / GUARDIAN
# ============================================================

@transaction.atomic
def create_parent(
    *,
    school,
    first_name,
    last_name="",
    email="",
    phone_number="",
    **data,
):
    full_name = (
        f"{first_name} {last_name}"
    ).strip()

    relationship = str(
        data.get("relationship", "")
    ).strip()

    if not relationship:
        raise ValueError(
            "Relationship is required for a Parent / Guardian."
        )

    # Parent does not have an employee number,
    # so generate the normal PARENT001 pattern.
    last_parent = (
        ParentGuardian.objects
        .filter(school=school)
        .order_by("-id")
        .first()
    )

    if last_parent and last_parent.user:
        old_username = last_parent.user.username

        try:
            number = int(
                old_username.replace(
                    "PARENT",
                    "",
                )
            )
            username = f"PARENT{number + 1:03d}"
        except ValueError:
            username = "PARENT001"
    else:
        username = "PARENT001"

    while User.objects.filter(
        username__iexact=username
    ).exists():
        number = int(
            username.replace(
                "PARENT",
                "",
            )
        )
        number += 1
        username = f"PARENT{number:03d}"

    email = resolve_email(
        email,
        username,
        User.Role.PARENT,
    )

    password = generate_temporary_password()

    user = create_central_user(
        username=username,
        email=email,
        password=password,
        role=User.Role.PARENT,
        first_name=full_name,
        last_name="",
        phone_number=phone_number,
        school=school,
        profile_image=data.get("profile_image"),
    )

    profile = ParentGuardian.objects.create(
        school=school,
        user=user,
        full_name=full_name,
        relationship=relationship,
        phone_number=phone_number,
        email=email,
        address=data.get("address", ""),
        occupation=data.get("occupation", ""),
        emergency_contact=data.get(
            "emergency_contact",
            "",
        ),
    )

    return {
        "user": user,
        "profile": profile,
        "username": username,
        "temporary_password": password,
    }


# ============================================================
# STUDENT + ENROLLMENT
# ============================================================

@transaction.atomic
def create_student(
    *,
    school,
    first_name,
    last_name,
    email="",
    phone_number="",
    **data,
):
    # --------------------------------------------------------
    # STUDENT INFORMATION
    # --------------------------------------------------------

    admission_number = str(
        data.get("admission_number", "")
    ).strip()

    if not admission_number:
        raise ValueError(
            "Admission number is required for a Student."
        )

    if Student.objects.filter(
        admission_number__iexact=admission_number
    ).exists():
        raise ValueError(
            "A student with this admission number already exists."
        )

    date_of_birth = data.get(
        "date_of_birth"
    )

    if not date_of_birth:
        raise ValueError(
            "Date of birth is required for a Student."
        )

    gender = data.get("gender")

    if not gender:
        raise ValueError(
            "Gender is required for a Student."
        )

    admission_date = data.get(
        "admission_date"
    )

    if not admission_date:
        raise ValueError(
            "Admission date is required for a Student."
        )

    # --------------------------------------------------------
    # ENROLLMENT INFORMATION
    # --------------------------------------------------------

    academic_session = data.get(
        "academic_session"
    )

    term = data.get(
        "term"
    )

    class_level = data.get(
        "class_level"
    )

    if not academic_session:
        raise ValueError(
            "Academic session is required when creating a Student."
        )

    if not term:
        raise ValueError(
            "Term is required when creating a Student."
        )

    if not class_level:
        raise ValueError(
            "Class level is required when creating a Student."
        )

    # --------------------------------------------------------
    # SCHOOL VALIDATION
    # --------------------------------------------------------

    if academic_session.school_id != school.id:
        raise ValueError(
            "The selected academic session does not belong "
            "to this school."
        )

    if class_level.school_id != school.id:
        raise ValueError(
            "The selected class level does not belong "
            "to this school."
        )

    if term.academic_session_id != academic_session.id:
        raise ValueError(
            "The selected term does not belong "
            "to the selected academic session."
        )

    # --------------------------------------------------------
    # USERNAME
    # --------------------------------------------------------

    username = get_unique_username(
        admission_number
    )

    # --------------------------------------------------------
    # EMAIL
    # --------------------------------------------------------

    email = resolve_email(
        email,
        username,
        User.Role.STUDENT,
    )

    # --------------------------------------------------------
    # TEMPORARY PASSWORD
    # --------------------------------------------------------

    password = generate_temporary_password()

    # --------------------------------------------------------
    # CREATE CENTRAL USER
    # --------------------------------------------------------

    user = create_central_user(
        username=username,
        email=email,
        password=password,
        role=User.Role.STUDENT,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        school=school,
        profile_image=data.get("profile_image"),
    )

    # --------------------------------------------------------
    # CREATE STUDENT PROFILE
    # --------------------------------------------------------

    profile = Student.objects.create(
        school=school,
        user=user,

        admission_number=admission_number,

        first_name=first_name,
        middle_name=data.get(
            "middle_name",
            "",
        ),
        last_name=last_name,

        date_of_birth=date_of_birth,

        gender=gender,

        email=email,
        phone_number=phone_number,

        address=data.get(
            "address",
            "",
        ),

        department=data.get(
            "department"
        ),

        admission_date=admission_date,

        blood_group=data.get(
            "blood_group",
            "",
        ),

        nationality=data.get(
            "nationality",
            "",
        ),

        state_of_origin=data.get(
            "state_of_origin",
            "",
        ),

        local_government=data.get(
            "local_government",
            "",
        ),

        medical_notes=data.get(
            "medical_notes",
            "",
        ),
    )

    # --------------------------------------------------------
    # CHECK FOR DUPLICATE ENROLLMENT
    # --------------------------------------------------------

    if StudentEnrollment.objects.filter(
        student=profile,
        academic_session=academic_session,
        term=term,
    ).exists():
        raise ValueError(
            "This student is already enrolled "
            "for this session and term."
        )

    # --------------------------------------------------------
    # GET NEXT ROLL NUMBER
    # --------------------------------------------------------

    existing_roll_numbers = (
        StudentEnrollment.objects
        .filter(
            class_level=class_level,
            academic_session=academic_session,
            term=term,
            roll_number__isnull=False,
        )
        .values_list(
            "roll_number",
            flat=True,
        )
    )

    used_roll_numbers = set(
        existing_roll_numbers
    )

    roll_number = 1

    while roll_number in used_roll_numbers:
        roll_number += 1

    # --------------------------------------------------------
    # ENROLL STUDENT
    # --------------------------------------------------------

    enrollment = StudentEnrollment.objects.create(
        student=profile,
        academic_session=academic_session,
        term=term,
        class_level=class_level,
        roll_number=roll_number,
        is_current=data.get(
            "is_current",
            True,
        ),
        remarks=data.get(
            "remarks",
            "",
        ),
    )

    # --------------------------------------------------------
    # RETURN EVERYTHING
    # --------------------------------------------------------

    return {
        "user": user,
        "profile": profile,
        "enrollment": enrollment,
        "username": username,
        "temporary_password": password,
    }


# ============================================================
# SCHOOL ADMIN
# ============================================================

@transaction.atomic
def create_school_admin(
    *,
    school,
    username,
    first_name,
    last_name,
    email="",
    phone_number="",
):
    """
    Creates a School Admin account.

    This function is intended for the System Super Admin.

    The School Admin is attached directly to the selected school.
    """

    if not school:
        raise ValueError(
            "A school is required for a School Admin."
        )

    if not school.is_active:
        raise ValueError(
            "The selected school is inactive."
        )

    username = str(
        username
    ).strip().upper()

    if not username:
        raise ValueError(
            "Username is required for a School Admin."
        )

    if User.objects.filter(
        username__iexact=username
    ).exists():
        raise ValueError(
            "A user with this username already exists."
        )

    email = resolve_email(
        email,
        username,
        User.Role.SCHOOL_ADMIN,
    )

    password = generate_temporary_password(
        length=12
    )

    user = create_central_user(
        username=username,
        email=email,
        password=password,
        role=User.Role.SCHOOL_ADMIN,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        school=school,
    )

    return {
        "user": user,
        "username": username,
        "temporary_password": password,
    }

# ============================================================
# MAIN SCHOOL USER PROVISIONER
# ============================================================

@transaction.atomic
def provision_school_user(
    *,
    school,
    role,
    first_name,
    last_name,
    email="",
    phone_number="",
    **profile_data,
):
    """
    Central coordinator used by School Super Admin.

    The School Admin cannot create:
        SUPER_ADMIN
        SCHOOL_ADMIN

    Every supported account is attached to the current school.
    """

    if not school:
        raise ValueError(
            "The School Admin does not have an assigned school."
        )

    forbidden_roles = [
        User.Role.SUPER_ADMIN,
        User.Role.SCHOOL_ADMIN,
    ]

    if role in forbidden_roles:
        raise ValueError(
            "This role cannot be created from School User Management."
        )

    common = {
        "school": school,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone_number": phone_number,
        **profile_data,
    }

    if role == User.Role.TEACHER:
        return create_teacher(**common)

    if role == User.Role.STUDENT:
        return create_student(**common)

    if role == User.Role.PARENT:
        return create_parent(**common)

    if role == User.Role.ACCOUNTANT:
        return create_accountant(**common)

    if role == User.Role.EXAM_OFFICER:
        return create_exam_officer(**common)

    if role == User.Role.LIBRARIAN:
        return create_librarian(**common)

    if role == User.Role.ADMISSION_OFFICER:
        return create_admission_officer(**common)

    if role == User.Role.PRINCIPAL:
        return create_principal(**common)

    raise ValueError(
        f"Creation of the {role} role is not yet supported "
        "by School User Management."
    )