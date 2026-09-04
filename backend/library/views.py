from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import (
    Author,
    Category,
    Book,
    BookLoan,
)

from .serializers import (
    AuthorSerializer,
    CategorySerializer,
    BookSerializer,
    BookLoanSerializer,
)


class AuthorListCreateView(generics.ListCreateAPIView):
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticated]


class AuthorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticated]


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()

    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()

    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.select_related(
        "school",
        "author",
        "category",
    ).all()

    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]


class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.select_related(
        "school",
        "author",
        "category",
    ).all()

    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]


class BookLoanListCreateView(generics.ListCreateAPIView):
    queryset = BookLoan.objects.select_related(
        "school",
        "book",
        "student",
        "teacher",
    ).all()

    serializer_class = BookLoanSerializer
    permission_classes = [IsAuthenticated]


class BookLoanDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BookLoan.objects.select_related(
        "school",
        "book",
        "student",
        "teacher",
    ).all()

    serializer_class = BookLoanSerializer
    permission_classes = [IsAuthenticated]