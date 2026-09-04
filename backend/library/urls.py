from django.urls import path

from .views import (
    AuthorListCreateView,
    AuthorDetailView,
    CategoryListCreateView,
    CategoryDetailView,
    BookListCreateView,
    BookDetailView,
    BookLoanListCreateView,
    BookLoanDetailView,
)


urlpatterns = [

    # Authors
    path(
        "authors/",
        AuthorListCreateView.as_view(),
        name="author-list-create",
    ),

    path(
        "authors/<int:pk>/",
        AuthorDetailView.as_view(),
        name="author-detail",
    ),

    # Categories
    path(
        "categories/",
        CategoryListCreateView.as_view(),
        name="category-list-create",
    ),

    path(
        "categories/<int:pk>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),

    # Books
    path(
        "books/",
        BookListCreateView.as_view(),
        name="book-list-create",
    ),

    path(
        "books/<int:pk>/",
        BookDetailView.as_view(),
        name="book-detail",
    ),

    # Book Loans
    path(
        "loans/",
        BookLoanListCreateView.as_view(),
        name="book-loan-list-create",
    ),

    path(
        "loans/<int:pk>/",
        BookLoanDetailView.as_view(),
        name="book-loan-detail",
    ),
]