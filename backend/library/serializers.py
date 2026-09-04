from rest_framework import serializers

from .models import (
    Author,
    Category,
    Book,
    BookLoan,
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
            "school_name",
            "book_title",
            "student_name",
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
                "A loan must belong to either a student or a teacher."
            )

        if student and teacher:
            raise serializers.ValidationError(
                "A loan cannot belong to both a student and a teacher."
            )

        return attrs