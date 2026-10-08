
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    LibrarianProfile,
    Author,
    Category,
    Book,
    BookLoan,
)

from .serializers import (
    LibrarianProfileSerializer,
    LibrarianCreateSerializer,
    AuthorSerializer,
    CategorySerializer,
    BookSerializer,
    BookLoanSerializer,
)


# =====================================================
# LIBRARIANS
# =====================================================

class LibrarianListCreateView(generics.ListCreateAPIView):
    queryset = LibrarianProfile.objects.select_related(
        "user",
        "school",
    ).all()

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return LibrarianCreateSerializer

        return LibrarianProfileSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        librarian, username, password = serializer.save()

        output_serializer = LibrarianProfileSerializer(
            librarian
        )

        return Response(
            {
                "message": "Librarian created successfully.",
                "librarian": output_serializer.data,
                "credentials": {
                    "username": username,
                    "password": password,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LibrarianDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = LibrarianProfile.objects.select_related(
        "user",
        "school",
    ).all()

    serializer_class = LibrarianProfileSerializer
    permission_classes = [IsAuthenticated]


# =====================================================
# AUTHORS
# =====================================================

class AuthorListCreateView(generics.ListCreateAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticated]


class AuthorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticated]


# =====================================================
# CATEGORIES
# =====================================================

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


# =====================================================
# BOOKS
# =====================================================
class BookListCreateView(generics.ListCreateAPIView):

    queryset = Book.objects.select_related(
        "school",
        "author",
        "category",
    ).all()

    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        librarian_profile = self.request.user.librarian_profile

        serializer.save(
            school=librarian_profile.school
        )


class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.select_related(
        "school",
        "author",
        "category",
    ).all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]


# =====================================================
# BOOK LOANS
# =====================================================

class BookLoanListCreateView(generics.ListCreateAPIView):
    queryset = BookLoan.objects.select_related(
        "school",
        "book",
        "student",
        "teacher",
    ).all()

    serializer_class = BookLoanSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        book_id = serializer.validated_data["book"].id

        # Lock the book row while issuing.
        # This prevents two requests from taking the same
        # last available copy at the same time.
        book = get_object_or_404(
            Book.objects.select_for_update(),
            id=book_id,
        )

        # -------------------------------------------------
        # CHECK BOOK STATUS
        # -------------------------------------------------

        if not book.is_active:
            return Response(
                {
                    "detail": (
                        "This book is inactive and cannot be issued."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if book.available_copies <= 0:
            return Response(
                {
                    "detail": (
                        "This book is currently unavailable. "
                        "There are no available copies."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # GET BORROWER
        # -------------------------------------------------

        student = serializer.validated_data.get("student")
        teacher = serializer.validated_data.get("teacher")

        # The serializer already prevents both/no borrower,
        # but we keep the checks here for safety.

        if not student and not teacher:
            return Response(
                {
                    "detail": (
                        "Please select a student or teacher."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if student and teacher:
            return Response(
                {
                    "detail": (
                        "A loan cannot belong to both "
                        "a student and a teacher."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # SCHOOL VALIDATION
        # -------------------------------------------------

        if student and student.school_id != book.school_id:
            return Response(
                {
                    "detail": (
                        "The student does not belong to "
                        "this school."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if teacher and teacher.school_id != book.school_id:
            return Response(
                {
                    "detail": (
                        "The teacher does not belong to "
                        "this school."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # OPTIONAL: PREVENT SAME BORROWER HAVING THE SAME
        # BOOK ON MULTIPLE ACTIVE LOANS
        # -------------------------------------------------

        active_loans = BookLoan.objects.filter(
            book=book,
            status__in=[
                BookLoan.Status.BORROWED,
                BookLoan.Status.OVERDUE,
            ],
        )

        if student:
            already_borrowed = active_loans.filter(
                student=student
            ).exists()
        else:
            already_borrowed = active_loans.filter(
                teacher=teacher
            ).exists()

        if already_borrowed:
            return Response(
                {
                    "detail": (
                        "This borrower already has "
                        "this book on loan."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # CREATE LOAN
        # -------------------------------------------------

        loan = serializer.save(
            school=book.school,
            status=BookLoan.Status.BORROWED,
        )

        # -------------------------------------------------
        # REDUCE AVAILABLE COPIES
        # -------------------------------------------------

        book.available_copies -= 1

        book.save(
            update_fields=[
                "available_copies",
                "updated_at",
            ]
        )

        output_serializer = self.get_serializer(loan)

        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED,
        )


# =====================================================
# BOOK LOAN DETAIL
# =====================================================

class BookLoanDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = BookLoan.objects.select_related(
        "school",
        "book",
        "student",
        "teacher",
    ).all()

    serializer_class = BookLoanSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def update(self, request, *args, **kwargs):

        loan = get_object_or_404(
            BookLoan.objects.select_for_update(),
            pk=kwargs["pk"],
        )

        old_status = loan.status

        serializer = self.get_serializer(
            loan,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data.get(
            "status",
            old_status,
        )

        # =================================================
        # RETURN BOOK
        # =================================================

        if (
            old_status in [
                BookLoan.Status.BORROWED,
                BookLoan.Status.OVERDUE,
            ]
            and new_status == BookLoan.Status.RETURNED
        ):

            book = get_object_or_404(
                Book.objects.select_for_update(),
                id=loan.book_id,
            )

            # Return the physical copy to inventory.
            #
            # Never allow available_copies to become greater
            # than total_copies.
            book.available_copies = min(
                book.available_copies + 1,
                book.total_copies,
            )

            book.save(
                update_fields=[
                    "available_copies",
                    "updated_at",
                ]
            )

            loan = serializer.save(
                status=BookLoan.Status.RETURNED
            )

            output_serializer = self.get_serializer(loan)

            return Response(
                output_serializer.data,
                status=status.HTTP_200_OK,
            )

        # =================================================
        # PREVENT DOUBLE RETURN
        # =================================================

        if (
            old_status == BookLoan.Status.RETURNED
            and new_status == BookLoan.Status.RETURNED
        ):
            return Response(
                {
                    "detail": (
                        "This book has already been returned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # LOST BOOK
        # =================================================

        if (
            old_status in [
                BookLoan.Status.BORROWED,
                BookLoan.Status.OVERDUE,
            ]
            and new_status == BookLoan.Status.LOST
        ):
            loan = serializer.save(
                status=BookLoan.Status.LOST
            )

            output_serializer = self.get_serializer(loan)

            return Response(
                output_serializer.data,
                status=status.HTTP_200_OK,
            )

        # =================================================
        # NORMAL UPDATE
        # =================================================

        loan = serializer.save()

        output_serializer = self.get_serializer(loan)

        return Response(
            output_serializer.data,
            status=status.HTTP_200_OK,
        )

    # =====================================================
    # DELETE LOAN
    # =====================================================

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):

        loan = get_object_or_404(
            BookLoan.objects.select_for_update(),
            pk=kwargs["pk"],
        )

        # If an active loan is deleted, the book is assumed
        # to have been returned to the library.
        if loan.status in [
            BookLoan.Status.BORROWED,
            BookLoan.Status.OVERDUE,
        ]:

            book = get_object_or_404(
                Book.objects.select_for_update(),
                id=loan.book_id,
            )

            book.available_copies = min(
                book.available_copies + 1,
                book.total_copies,
            )

            book.save(
                update_fields=[
                    "available_copies",
                    "updated_at",
                ]
            )

        loan.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

