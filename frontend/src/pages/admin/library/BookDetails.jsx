
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getBook,
  deleteBook,
} from "../../../services/libraryService";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://127.0.0.1:8000${
      image.startsWith("/") ? image : `/${image}`
    }`;
  };

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBook(id);
        setBook(data);
      } catch (err) {
        console.error("Failed to load book:", err);

        setError(
          err?.response?.data?.detail ||
            "Failed to load book details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${book?.title}"?`
      )
    ) {
      return;
    }

    try {
      await deleteBook(id);
      navigate("/admin/library/books");
    } catch (err) {
      console.error("Failed to delete book:", err);

      alert(
        err?.response?.data?.detail ||
          "Failed to delete book."
      );
    }
  };

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
          Loading book details...
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="p-6">
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <p className="mb-4 text-red-500">
            {error || "Book not found."}
          </p>

          <Link
            to="/admin/library/books"
            className="inline-flex rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{
              backgroundColor: "var(--color-primary)",
            }}
          >
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  const availabilityPercentage =
    book.total_copies > 0
      ? Math.round(
          (book.available_copies / book.total_copies) * 100
        )
      : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2">
            <Link
              to="/admin/library/books"
              className="text-sm hover:underline"
              style={{
                color: "var(--color-primary)",
              }}
            >
              ← Back to Books
            </Link>
          </div>

          <h1
            className="text-2xl font-bold"
            style={{
              color: "var(--color-text)",
            }}
          >
            Book Details
          </h1>

          <p
            className="mt-1 text-sm opacity-70"
            style={{
              color: "var(--color-text)",
            }}
          >
            View complete information about this library book.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/admin/library/books/${book.id}/edit`}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{
              backgroundColor: "var(--color-primary)",
            }}
          >
            Edit Book
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-red-500"
            style={{
              borderColor: "var(--color-border)",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Main Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Book Cover */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex justify-center">
            {book.cover_image ? (
              <img
                src={getImageUrl(book.cover_image)}
                alt={book.title}
                className="h-80 w-56 rounded-lg object-cover shadow"
              />
            ) : (
              <div
                className="flex h-80 w-56 items-center justify-center rounded-lg border text-6xl"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                📚
              </div>
            )}
          </div>

          <div className="mt-5 text-center">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                book.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {book.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Book Information */}
        <div
          className="rounded-xl border p-6 lg:col-span-2"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2
            className="mb-6 text-xl font-semibold"
            style={{
              color: "var(--color-text)",
            }}
          >
            {book.title}
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoItem
              label="Author"
              value={book.author_name || "—"}
            />

            <InfoItem
              label="Category"
              value={book.category_name || "—"}
            />

            <InfoItem
              label="ISBN"
              value={book.isbn || "—"}
            />

            <InfoItem
              label="Publisher"
              value={book.publisher || "—"}
            />

            <InfoItem
              label="Publication Year"
              value={book.publication_year || "—"}
            />

            <InfoItem
              label="School"
              value={book.school_name || "—"}
            />

            <InfoItem
              label="Total Copies"
              value={book.total_copies}
            />

            <InfoItem
              label="Available Copies"
              value={book.available_copies}
            />

            <InfoItem
              label="Books Loaned"
              value={
                book.total_copies - book.available_copies
              }
            />

            <InfoItem
              label="Total Loan Records"
              value={book.loan_count ?? 0}
            />
          </div>

          {/* Availability */}
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <span
                className="text-sm font-medium"
                style={{
                  color: "var(--color-text)",
                }}
              >
                Availability
              </span>

              <span
                className="text-sm opacity-70"
                style={{
                  color: "var(--color-text)",
                }}
              >
                {availabilityPercentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${availabilityPercentage}%`,
                  backgroundColor:
                    "var(--color-primary)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <h2
          className="mb-3 text-lg font-semibold"
          style={{
            color: "var(--color-text)",
          }}
        >
          Description
        </h2>

        <p
          className="whitespace-pre-wrap text-sm leading-7 opacity-80"
          style={{
            color: "var(--color-text)",
          }}
        >
          {book.description || "No description provided."}
        </p>
      </div>

      {/* Record Information */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <h2
          className="mb-4 text-lg font-semibold"
          style={{
            color: "var(--color-text)",
          }}
        >
          Record Information
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <InfoItem
            label="Created"
            value={
              book.created_at
                ? new Date(book.created_at).toLocaleString()
                : "—"
            }
          />

          <InfoItem
            label="Last Updated"
            value={
              book.updated_at
                ? new Date(book.updated_at).toLocaleString()
                : "—"
            }
          />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p
        className="mb-1 text-xs font-medium uppercase tracking-wide opacity-60"
        style={{
          color: "var(--color-text)",
        }}
      >
        {label}
      </p>

      <p
        className="text-sm font-medium"
        style={{
          color: "var(--color-text)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

export default BookDetails;
