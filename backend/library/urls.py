from django.urls import path

from .views import (
    LibrarianListCreateView,
    LibrarianDetailView,
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

    # =====================================================
    # LIBRARIANS
    # =====================================================

    path(
        "librarians/",
        LibrarianListCreateView.as_view(),
        name="librarian-list-create",
    ),

    path(
        "librarians/<int:pk>/",
        LibrarianDetailView.as_view(),
        name="librarian-detail",
    ),

    # =====================================================
    # AUTHORS
    # =====================================================

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

    # =====================================================
    # CATEGORIES
    # =====================================================

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

    # =====================================================
    # BOOKS
    # =====================================================

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

    # =====================================================
    # BOOK LOANS
    # =====================================================

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