import secrets
import string

from rest_framework import serializers

from accounts.models import User
from academics.models import School

from .models import (
    LibrarianProfile,
    Author,
    Category,
    Book,
    BookLoan,
)


class LibrarianCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(
        max_length=150,
    )

    last_name = serializers.CharField(
        max_length=150,
    )

    email = serializers.EmailField()

    phone_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )

    profile_image = serializers.ImageField(
        required=False,
        allow_null=True,
    )

    school = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
    )

    employee_number = serializers.CharField(
        max_length=50,
    )

    employment_date = serializers.DateField(
        required=False,
        allow_null=True,
    )

    def validate_employee_number(self, value):
        if LibrarianProfile.objects.filter(
            employee_number=value
        ).exists():
            raise serializers.ValidationError(
                "A librarian with this employee number already exists."
            )

        return value

    def validate_email(self, value):
        if User.objects.filter(
            email=value
        ).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def generate_username(self, employee_number):
        username = employee_number.strip().upper()

        if not User.objects.filter(
            username=username
        ).exists():
            return username

        counter = 2

        while User.objects.filter(
            username=f"{username}-{counter}"
        ).exists():
            counter += 1

        return f"{username}-{counter}"

    def generate_password(self):
        alphabet = (
            string.ascii_letters
            + string.digits
            + "!@#$%^&*"
        )

        return "".join(
            secrets.choice(alphabet)
            for _ in range(12)
        )

    def create(self, validated_data):
        profile_image = validated_data.pop(
            "profile_image",
            None,
        )

        school = validated_data.pop("school")

        employee_number = validated_data.pop(
            "employee_number"
        )

        employment_date = validated_data.pop(
            "employment_date",
            None,
        )

        first_name = validated_data.pop(
            "first_name"
        )

        last_name = validated_data.pop(
            "last_name"
        )

        phone_number = validated_data.pop(
            "phone_number",
            "",
        )

        email = validated_data.pop("email")

        username = self.generate_username(
            employee_number
        )

        password = self.generate_password()

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            role=User.Role.LIBRARIAN,
        )

        if profile_image:
            user.profile_image = profile_image
            user.save(
                update_fields=["profile_image"]
            )

        librarian = LibrarianProfile.objects.create(
            user=user,
            school=school,
            employee_number=employee_number,
            employment_date=employment_date,
        )

        return librarian, username, password



class LibrarianProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )
    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )
    phone_number = serializers.CharField(
        source="user.phone_number",
        read_only=True,
    )
    profile_image = serializers.ImageField(
        source="user.profile_image",
        read_only=True,
    )
    role = serializers.CharField(
        source="user.role",
        read_only=True,
    )

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    class Meta:
        model = LibrarianProfile

        fields = [
            "id",
            "user",
            "username",
            "full_name",
            "email",
            "phone_number",
            "profile_image",
            "role",
            "school",
            "school_name",
            "employee_number",
            "employment_date",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "full_name",
            "email",
            "phone_number",
            "profile_image",
            "role",
            "school_name",
            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj):
        return (
            obj.user.get_full_name()
            or obj.user.username
        )

class AuthorSerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Author

        fields = [
            "id",
            "name",
            "bio",
            "book_count",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "book_count",
            "created_at",
        ]

    def get_book_count(self, obj):
        return obj.books.count()


class CategorySerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Category

        fields = [
            "id",
            "name",
            "description",
            "book_count",
        ]

        read_only_fields = [
            "id",
            "book_count",
        ]

    def get_book_count(self, obj):
        return obj.books.count()


class BookSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    author_name = serializers.CharField(
        source="author.name",
        read_only=True,
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    loan_count = serializers.SerializerMethodField()

    class Meta:
        model = Book

        fields = [
            "id",
            "school",
            "school_name",
            "title",
            "isbn",
            "author",
            "author_name",
            "category",
            "category_name",
            "publisher",
            "publication_year",
            "description",
            "cover_image",
            "total_copies",
            "available_copies",
            "loan_count",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "school",
            "school_name",
            "author_name",
            "category_name",
            "loan_count",
            "created_at",
            "updated_at",
           
        ]

    def get_loan_count(self, obj):
        return obj.loans.count()


class BookLoanSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )


    book_title = serializers.CharField(
        source="book.title",
        read_only=True,
    )

    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
        allow_null=True,
    )

    student_admission_number = serializers.CharField(
        source="student.admission_number",
        read_only=True,
        allow_null=True,
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

    borrower_name = serializers.SerializerMethodField()

    class Meta:
        model = BookLoan

        fields = [
            "id",
            "school",
            "school_name",
            "book",
            "book_title",
            "student",
            "student_name",
            "student_admission_number",
            "teacher",
            "teacher_name",
            "borrower_name",
            "issue_date",
            "due_date",
            "return_date",
            "fine_amount",
            "status",
            "status_display",
            "notes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "school",
            "school_name",
            "book_title",
            "student_name",
            "student_admission_number",
            "teacher_name",
            "borrower_name",
            "status_display",
            "created_at",
            "updated_at",
        ]

    def get_borrower_name(self, obj):
        if obj.student:
            return obj.student.full_name

        if obj.teacher:
            return obj.teacher.full_name

        return None

    def validate(self, attrs):
        student = attrs.get(
            "student",
            getattr(self.instance, "student", None),
        )

        teacher = attrs.get(
            "teacher",
            getattr(self.instance, "teacher", None),
        )

        if not student and not teacher:
            raise serializers.ValidationError(
                {
                    "borrower": (
                        "A loan must belong to either "
                        "a student or teacher."
                    )
                }
            )

        if student and teacher:
            raise serializers.ValidationError(
                {
                    "borrower": (
                        "A loan cannot belong to both "
                        "a student and teacher."
                    )
                }
            )

        return attrs
