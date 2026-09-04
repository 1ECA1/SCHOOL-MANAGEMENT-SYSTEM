from django.contrib import admin

from .models import (
    Author,
    Category,
    Book,
    BookLoan,
)


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "created_at",
    )

    search_fields = (
        "name",
        "bio",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = ("name",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
    )

    search_fields = (
        "name",
        "description",
    )

    ordering = ("name",)


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "school",
        "author",
        "category",
        "isbn",
        "publication_year",
        "total_copies",
        "available_copies",
        "is_active",
        "created_at",
    )

    search_fields = (
        "title",
        "isbn",
        "author__name",
        "category__name",
        "school__name",
        "publisher",
    )

    list_filter = (
        "school",
        "category",
        "author",
        "is_active",
        "publication_year",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("title",)


@admin.register(BookLoan)
class BookLoanAdmin(admin.ModelAdmin):
    list_display = (
        "book",
        "borrower",
        "school",
        "issue_date",
        "due_date",
        "return_date",
        "fine_amount",
        "status",
    )

    search_fields = (
        "book__title",
        "student__first_name",
        "student__last_name",
        "student__admission_number",
        "teacher__first_name",
        "teacher__last_name",
        "teacher__employee_id",
        "school__name",
    )

    list_filter = (
        "school",
        "status",
        "issue_date",
        "due_date",
        "return_date",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("-issue_date",)

    @admin.display(description="Borrower")
    def borrower(self, obj):
        return obj.student or obj.teacher