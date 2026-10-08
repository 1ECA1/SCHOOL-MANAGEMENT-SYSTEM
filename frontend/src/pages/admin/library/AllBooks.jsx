
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getBooks,
  deleteBook,
} from "../../../services/libraryService";

function AllBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // LOAD BOOKS
  // =====================================================

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBooks();

      setBooks(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to load books:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load library books.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${
      image.startsWith("/") ? image : `/${image}`
    }`;
  };

  // =====================================================
  // FILTER BOOKS
  // =====================================================

  const filteredBooks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        !searchValue ||
        book.title?.toLowerCase().includes(searchValue) ||
        book.isbn?.toLowerCase().includes(searchValue) ||
        book.author_name
          ?.toLowerCase()
          .includes(searchValue) ||
        book.category_name
          ?.toLowerCase()
          .includes(searchValue) ||
        book.publisher
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && book.is_active) ||
        (statusFilter === "INACTIVE" && !book.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [books, search, statusFilter]);

  // =====================================================
  // DELETE BOOK
  // =====================================================

  const handleDelete = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(book.id);
      setError("");

      await deleteBook(book.id);

      setBooks((currentBooks) =>
        currentBooks.filter(
          (item) => item.id !== book.id,
        ),
      );
    } catch (err) {
      console.error("Failed to delete book:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete this book.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalBooks = books.length;

  const activeBooks = books.filter(
    (book) => book.is_active,
  ).length;

  const totalCopies = books.reduce(
    (total, book) =>
      total + Number(book.total_copies || 0),
    0,
  );

  const availableCopies = books.reduce(
    (total, book) =>
      total + Number(book.available_copies || 0),
    0,
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-6">
        <div
          className="rounded-xl border p-8 text-center"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <p className="text-sm opacity-70">
            Loading library books...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      className="p-4 md:p-6 space-y-6"
      style={{ color: "var(--color-text)" }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Library Books
          </h1>

          <p className="mt-1 text-sm opacity-70">
            Manage books available in your school library.
          </p>
        </div>

        <Link
          to="/admin/library/books/add"
          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          style={{
            backgroundColor: "var(--color-primary)",
          }}
        >
          <span className="text-lg leading-none">+</span>
          Add Book
        </Link>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "#ef4444",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <p className="text-sm opacity-60">
            Book Titles
          </p>

          <p className="mt-2 text-2xl font-bold">
            {totalBooks}
          </p>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <p className="text-sm opacity-60">
            Active Books
          </p>

          <p className="mt-2 text-2xl font-bold">
            {activeBooks}
          </p>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <p className="text-sm opacity-60">
            Total Copies
          </p>

          <p className="mt-2 text-2xl font-bold">
            {totalCopies}
          </p>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <p className="text-sm opacity-60">
            Available Copies
          </p>

          <p className="mt-2 text-2xl font-bold">
            {availableCopies}
          </p>
        </div>
      </div>

      {/* =================================================
          SEARCH / FILTER
      ================================================= */}

      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="book-search"
              className="mb-1.5 block text-xs font-medium opacity-70"
            >
              Search books
            </label>

            <input
              id="book-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by title, ISBN, author, category..."
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                backgroundColor:
                  "var(--color-background)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="status-filter"
              className="mb-1.5 block text-xs font-medium opacity-70"
            >
              Status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                backgroundColor:
                  "var(--color-background)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              <option value="ALL">
                All Books
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* =================================================
          BOOKS TABLE
      ================================================= */}

      <div
        className="overflow-hidden rounded-xl border"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor:
                    "var(--color-border)",
                }}
              >
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                  Book
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                  Author
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                  Category
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                  Copies
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                  Available
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide opacity-60">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center"
                  >
                    <div className="text-4xl">
                      📚
                    </div>

                    <p className="mt-3 font-medium">
                      No books found
                    </p>

                    <p className="mt-1 text-sm opacity-60">
                      {search || statusFilter !== "ALL"
                        ? "Try changing your search or filter."
                        : "Start by adding a book to the library."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="border-b last:border-b-0"
                    style={{
                      borderColor:
                        "var(--color-border)",
                    }}
                  >
                    {/* BOOK */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-10 shrink-0 overflow-hidden rounded-md border bg-gray-100">
                          {book.cover_image ? (
                            <img
                              src={getImageUrl(
                                book.cover_image,
                              )}
                              alt={book.title}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg">
                              📖
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {book.title}
                          </p>

                          {book.isbn && (
                            <p className="mt-0.5 text-xs opacity-60">
                              ISBN: {book.isbn}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* AUTHOR */}

                    <td className="px-5 py-4 text-sm">
                      {book.author_name || "—"}
                    </td>

                    {/* CATEGORY */}

                    <td className="px-5 py-4 text-sm">
                      {book.category_name || "—"}
                    </td>

                    {/* COPIES */}

                    <td className="px-5 py-4 text-sm">
                      {book.total_copies ?? 0}
                    </td>

                    {/* AVAILABLE */}

                    <td className="px-5 py-4 text-sm font-medium">
                      {book.available_copies ?? 0}
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor:
                            book.is_active
                              ? "rgba(34, 197, 94, 0.12)"
                              : "rgba(239, 68, 68, 0.12)",
                          color: book.is_active
                            ? "#16a34a"
                            : "#dc2626",
                        }}
                      >
                        {book.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/library/books/${book.id}`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-70"
                          style={{
                            borderColor:
                              "var(--color-border)",
                          }}
                        >
                          View
                        </Link>

                        <Link
                          to={`/admin/library/books/${book.id}/edit`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-70"
                          style={{
                            borderColor:
                              "var(--color-border)",
                          }}
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(book)
                          }
                          disabled={
                            deletingId === book.id
                          }
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            borderColor:
                              "var(--color-border)",
                            color: "#dc2626",
                          }}
                        >
                          {deletingId === book.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}

        {filteredBooks.length > 0 && (
          <div
            className="border-t px-5 py-3 text-sm opacity-60"
            style={{
              borderColor:
                "var(--color-border)",
            }}
          >
            Showing {filteredBooks.length} of{" "}
            {books.length} book
            {books.length === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllBooks;
