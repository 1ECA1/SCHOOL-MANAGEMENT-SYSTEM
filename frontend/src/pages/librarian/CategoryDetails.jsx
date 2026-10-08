import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCategory,
  deleteCategory,
} from "../../services/libraryService";

function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCategory(id);
        setCategory(data);
      } catch (err) {
        console.error(
          "Failed to load category:",
          err,
        );

        setError(
          err.response?.data?.detail ||
            "Failed to load category.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id]);

  const handleDelete = async () => {
    if (!category) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deleteCategory(category.id);

      navigate("/librarian/categories");
    } catch (err) {
      console.error(
        "Failed to delete category:",
        err,
      );

      const data = err.response?.data;

      let message =
        "Unable to delete this category.";

      if (data?.detail) {
        message = data.detail;
      } else if (data?.error) {
        message = data.error;
      } else if (
        data &&
        typeof data === "object"
      ) {
        message = Object.entries(data)
          .map(([field, value]) => {
            const text = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${text}`;
          })
          .join(" ");
      }

      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-sm font-medium text-slate-500">
          Loading category...
        </p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error || "Category not found."}
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/librarian/categories")
            }
            className="mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  const bookCount =
    category.book_count ??
    category.books_count ??
    category.books?.length ??
    0;

  return (
    <div className="min-h-screen bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate("/librarian/categories")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            ← Back to Categories
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold text-purple-600">
                Library
              </p>

              <h1 className="text-2xl font-bold text-slate-800">
                Category Details
              </h1>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/librarian/categories/${category.id}/edit`,
                  )
                }
                className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                Edit Category
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Category summary */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-4xl">
                🗂️
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-slate-800">
                  {category.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Category ID #{category.id}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 p-6 sm:p-8">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Books
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {bookCount}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Books in this category
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <h2 className="text-lg font-bold text-slate-800">
              Description
            </h2>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {category.description ||
                "No description has been provided for this category."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryDetails;