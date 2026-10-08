import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBook,
  deleteBook,
} from "../../services/libraryService";

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

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    "en-NG",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBook(id);

        setBook(data);
      } catch (err) {
        console.error(
          "Failed to load book:",
          err,
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load this book.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  const handleDelete = async () => {
    if (!book) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deleteBook(book.id);

      navigate("/librarian/books");
    } catch (err) {
      console.error(
        "Failed to delete book:",
        err,
      );

      setError(
        err.response?.data?.detail ||
          "Unable to delete this book.",
      );

      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] p-6 lg:p-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-primary)]" />

            <p className="text-sm text-slate-400">
              Loading book...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate("/librarian/books")
            }
            className="mb-6 text-sm font-semibold text-slate-500 hover:text-[var(--color-primary)]"
          >
            ← Back to All Books
          </button>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-lg font-bold text-red-700">
              Book not found
            </h2>

            <p className="mt-2 text-sm text-red-500">
              {error ||
                "The requested book could not be found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const coverImage = getCoverImageUrl(
    book.cover_image,
  );

  const availableCopies = Number(
    book.available_copies || 0,
  );

  const totalCopies = Number(
    book.total_copies || 0,
  );

  const issuedCopies =
    totalCopies - availableCopies;

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/librarian/books")
              }
              className="mb-3 text-sm font-semibold text-slate-500 transition hover:text-[var(--color-primary)]"
            >
              ← Back to All Books
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Book Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View complete information about this library book.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/librarian/books/${book.id}/edit`,
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Edit Book
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* MAIN BOOK CARD */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">

            {/* COVER */}
            <div className="flex min-h-[360px] items-center justify-center bg-slate-50 p-8">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={book.title}
                  className="max-h-[340px] w-auto max-w-full rounded-2xl border border-slate-200 object-cover shadow-md"
                />
              ) : (
                <div className="flex h-64 w-48 items-center justify-center rounded-2xl border border-slate-200 bg-white text-6xl shadow-sm">
                  📖
                </div>
              )}
            </div>

            {/* INFORMATION */}
            <div className="p-6 sm:p-8">

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      book.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {book.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                    {book.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    ISBN:{" "}
                    {book.isbn || "Not provided"}
                  </p>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

                <InfoItem
                  label="Author"
                  value={book.author_name}
                />

                <InfoItem
                  label="Category"
                  value={book.category_name}
                />

                <InfoItem
                  label="Publisher"
                  value={book.publisher}
                />

                <InfoItem
                  label="Publication Year"
                  value={
                    book.publication_year ||
                    "Not provided"
                  }
                />

                <InfoItem
                  label="School"
                  value={book.school_name}
                />

                <InfoItem
                  label="Added"
                  value={formatDate(
                    book.created_at,
                  )}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
                  Description
                </h3>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {book.description ||
                    "No description has been provided for this book."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COPY STATISTICS */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <StatCard
            label="Total Copies"
            value={totalCopies}
            icon="📚"
          />

          <StatCard
            label="Available Copies"
            value={availableCopies}
            icon="✅"
          />

          <StatCard
            label="Currently Issued"
            value={issuedCopies}
            icon="🔄"
          />
        </div>

        {/* LOAN INFORMATION */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Loan Information
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Information about borrowing activity for this book.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
              📋
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-500">
              Total loan records
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {book.loan_count ?? 0}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-700">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default BookDetails;