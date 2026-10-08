
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCategories,
  deleteCategory,
} from "../../services/libraryService";

function AllCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCategories();

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load categories:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter(
      (category) =>
        category.name
          ?.toLowerCase()
          .includes(query) ||
        category.description
          ?.toLowerCase()
          .includes(query),
    );
  }, [categories, search]);

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(category.id);
      setError("");

      await deleteCategory(category.id);

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id,
        ),
      );
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
      setDeletingId(null);
    }
  };

  const totalCategories = categories.length;

  const totalBooks = categories.reduce(
    (total, category) =>
      total +
      Number(
        category.book_count ??
          category.books_count ??
          0,
      ),
    0,
  );

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold text-primary">
              Library
            </p>

            <h1 className="text-2xl font-bold text-text">
              Categories
            </h1>

            <p className="mt-1 text-sm text-text/60">
              Organize your library books by category.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/librarian/categories/add",
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
          >
            <span className="text-lg">+</span>
            Add Category
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-text/10 bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-text/60">
              Total Categories
            </p>

            <p className="mt-2 text-3xl font-bold text-text">
              {totalCategories}
            </p>
          </div>

          <div className="rounded-2xl border border-text/10 bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-text/60">
              Books in Categories
            </p>

            <p className="mt-2 text-3xl font-bold text-text">
              {totalBooks}
            </p>

            <p className="mt-1 text-xs text-text/40">
              Based on category book counts returned by the API
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5 rounded-2xl border border-text/10 bg-card p-4 shadow-sm">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text/40">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search categories..."
              className="w-full rounded-xl border border-text/10 bg-background py-3 pl-11 pr-4 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {error}
          </div>
        )}

        {/* Categories */}
        <div className="overflow-hidden rounded-2xl border border-text/10 bg-card shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-sm font-medium text-text/60">
                Loading categories...
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 text-4xl">
                🗂️
              </div>

              <h3 className="text-lg font-semibold text-text">
                {search
                  ? "No categories found"
                  : "No categories yet"}
              </h3>

              <p className="mt-1 max-w-md text-sm text-text/60">
                {search
                  ? "Try a different search term."
                  : "Create your first category to organize your library books."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/librarian/categories/add",
                    )
                  }
                  className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Add Category
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-text/10 bg-background">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-text/60">
                        Category
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-text/60">
                        Description
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-text/60">
                        Books
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-text/60">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCategories.map(
                      (category) => (
                        <tr
                          key={category.id}
                          className="border-b border-text/10 last:border-b-0 hover:bg-background"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
                                🗂️
                              </div>

                              <div>
                                <p className="font-semibold text-text">
                                  {category.name}
                                </p>

                                <p className="text-xs text-text/40">
                                  ID #{category.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="max-w-md px-5 py-4">
                            <p className="line-clamp-2 text-sm text-text/70">
                              {category.description ||
                                "No description provided."}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-semibold text-secondary">
                              {category.book_count ??
                                category.books_count ??
                                0}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/librarian/categories/${category.id}`,
                                  )
                                }
                                className="rounded-lg border border-text/10 bg-card px-3 py-2 text-xs font-semibold text-text/70 transition hover:bg-background"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/librarian/categories/${category.id}/edit`,
                                  )
                                }
                                className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={
                                  deletingId ===
                                  category.id
                                }
                                onClick={() =>
                                  handleDelete(
                                    category,
                                  )
                                }
                                className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId ===
                                category.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-text/10 md:hidden">
                {filteredCategories.map(
                  (category) => (
                    <div
                      key={category.id}
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
                          🗂️
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-text">
                            {category.name}
                          </h3>

                          <p className="mt-1 text-xs text-text/40">
                            {category.book_count ??
                              category.books_count ??
                              0}{" "}
                            book(s)
                          </p>

                          <p className="mt-3 line-clamp-3 text-sm text-text/70">
                            {category.description ||
                              "No description provided."}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/librarian/categories/${category.id}`,
                                )
                              }
                              className="rounded-lg border border-text/10 bg-card px-3 py-2 text-xs font-semibold text-text/70 transition hover:bg-background"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/librarian/categories/${category.id}/edit`,
                                )
                              }
                              className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                category.id
                              }
                              onClick={() =>
                                handleDelete(
                                  category,
                                )
                              }
                              className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
                            >
                              {deletingId ===
                              category.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-4 text-sm text-text/60">
          Showing{" "}
          <span className="font-semibold text-text">
            {filteredCategories.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-text">
            {categories.length}
          </span>{" "}
          category(s)
        </div>
      </div>
    </div>
  );
}

export default AllCategories;
