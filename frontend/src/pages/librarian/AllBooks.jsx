
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBooks,
  deleteBook,
} from "../../services/libraryService";

// =====================================================
// HELPERS
// =====================================================

function getCoverImageUrl(image) {
  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${image}`;
}

// =====================================================
// ALL BOOKS
// =====================================================

function AllBooks() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [deletingId, setDeletingId] =
    useState(null);

  // ===================================================
  // LOAD BOOKS
  // ===================================================

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBooks();

      setBooks(
        Array.isArray(data)
          ? data
          : data?.results || [],
      );
    } catch (err) {
      console.error("Failed to load books:", err);

      setError(
        "Unable to load books. Please refresh the page.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // ===================================================
  // FILTER BOOKS
  // ===================================================

  const filteredBooks = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        !searchValue ||
        book.title
          ?.toLowerCase()
          .includes(searchValue) ||
        book.isbn
          ?.toLowerCase()
          .includes(searchValue) ||
        book.author_name
          ?.toLowerCase()
          .includes(searchValue) ||
        book.category_name
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          book.is_active) ||
        (statusFilter === "INACTIVE" &&
          !book.is_active);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [books, search, statusFilter]);

  // ===================================================
  // DELETE BOOK
  // ===================================================

  const handleDelete = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`,
    );

    if (!confirmed) return;

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
        err.response?.data?.detail ||
          "Unable to delete this book.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ===================================================
  // STATS
  // ===================================================

  const totalBooks = books.length;

  const activeBooks = books.filter(
    (book) => book.is_active,
  ).length;

  const inactiveBooks = books.filter(
    (book) => !book.is_active,
  ).length;

  const totalCopies = books.reduce(
    (sum, book) =>
      sum + Number(book.total_copies || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold text-primary">
              Library
            </p>

            <h1 className="m-0 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              All Books
            </h1>

            <p className="mt-1 text-sm text-text/60">
              Manage books available in your school library.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/librarian/books/add")
            }
            className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          >
            + Add Book
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            {error}
          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            label="Total Titles"
            value={loading ? "..." : totalBooks}
            icon="📚"
          />

          <SummaryCard
            label="Active Titles"
            value={loading ? "..." : activeBooks}
            icon="✅"
          />

          <SummaryCard
            label="Inactive Titles"
            value={loading ? "..." : inactiveBooks}
            icon="⏸️"
          />

          <SummaryCard
            label="Total Copies"
            value={
              loading ? "..." : totalCopies
            }
            icon="📦"
          />

        </div>

        {/* =================================================
            BOOK TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-3xl border border-text/10 bg-card shadow-sm">

          {/* FILTER BAR */}

          <div className="border-b border-text/10 p-5 sm:p-6">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              {/* SEARCH */}

              <div className="relative w-full lg:max-w-md">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text/40">
                  🔎
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search title, ISBN, author or category..."
                  className="h-11 w-full rounded-xl border border-text/10 bg-background pl-11 pr-4 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* STATUS */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-11 rounded-xl border border-text/10 bg-background px-4 text-sm font-medium text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>

            </div>

            <div className="mt-4 text-xs text-text/40">
              Showing{" "}
              <span className="font-semibold text-text/70">
                {filteredBooks.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-text/70">
                {books.length}
              </span>{" "}
              books
            </div>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-text/10 border-t-primary" />

                <p className="text-sm text-text/40">
                  Loading books...
                </p>
              </div>
            </div>
          ) : filteredBooks.length === 0 ? (

            /* EMPTY */

            <div className="flex min-h-64 items-center justify-center p-6">
              <div className="text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                  📚
                </div>

                <h3 className="mt-4 text-base font-bold text-text">
                  {books.length === 0
                    ? "No books yet"
                    : "No books found"}
                </h3>

                <p className="mt-1 max-w-sm text-sm text-text/50">
                  {books.length === 0
                    ? "Your library does not have any books yet. Add your first book to get started."
                    : "Try changing your search or status filter."}
                </p>

                {books.length === 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/librarian/books/add",
                      )
                    }
                    className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    + Add First Book
                  </button>
                )}

              </div>
            </div>

          ) : (

            /* TABLE */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead>
                  <tr className="border-b border-text/10 bg-background">

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-text/50">
                      Book
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-text/50">
                      Author
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-text/50">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-text/50">
                      Copies
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-text/50">
                      Available
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-text/50">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-text/50">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredBooks.map((book) => {
                    const coverImage =
                      getCoverImageUrl(
                        book.cover_image,
                      );

                    return (
                      <tr
                        key={book.id}
                        className="border-b border-text/10 transition last:border-b-0 hover:bg-background"
                      >

                        {/* BOOK */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            {coverImage ? (
                              <img
                                src={coverImage}
                                alt={book.title}
                                className="h-14 w-11 rounded-lg border border-text/10 object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                                📖
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="max-w-[250px] truncate text-sm font-bold text-text">
                                {book.title}
                              </p>

                              <p className="mt-1 text-xs text-text/40">
                                ISBN:{" "}
                                {book.isbn ||
                                  "Not provided"}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* AUTHOR */}

                        <td className="px-5 py-4">
                          <span className="text-sm text-text/70">
                            {book.author_name ||
                              "—"}
                          </span>
                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                            {book.category_name ||
                              "—"}
                          </span>
                        </td>

                        {/* COPIES */}

                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-text/80">
                            {book.total_copies ??
                              0}
                          </span>
                        </td>

                        {/* AVAILABLE */}

                        <td className="px-5 py-4">
                          <span
                            className={`text-sm font-semibold ${
                              Number(
                                book.available_copies,
                              ) > 0
                                ? "text-secondary"
                                : "text-primary"
                            }`}
                          >
                            {book.available_copies ??
                              0}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              book.is_active
                                ? "bg-secondary/10 text-secondary"
                                : "bg-text/10 text-text/50"
                            }`}
                          >
                            {book.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/librarian/books/${book.id}`,
                                )
                              }
                              className="rounded-lg border border-text/10 bg-card px-3 py-2 text-xs font-semibold text-text/70 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/librarian/books/${book.id}/edit`,
                                )
                              }
                              className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                book.id
                              }
                              onClick={() =>
                                handleDelete(book)
                              }
                              className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              book.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-3xl border border-text/10 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-text/60">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-text">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl">
          {icon}
        </div>

      </div>
    </div>
  );
}

export default AllBooks;