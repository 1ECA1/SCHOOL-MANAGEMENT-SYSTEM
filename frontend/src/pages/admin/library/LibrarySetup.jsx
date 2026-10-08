
import { useEffect, useState } from "react";

import {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../services/libraryService";

function LibrarySetup() {
  // =====================================================
  // AUTHORS
  // =====================================================

  const [authors, setAuthors] = useState([]);
  const [authorName, setAuthorName] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [savingAuthor, setSavingAuthor] = useState(false);
  const [deletingAuthor, setDeletingAuthor] = useState(null);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] =
    useState("");
  const [editingCategory, setEditingCategory] =
    useState(null);
  const [savingCategory, setSavingCategory] =
    useState(false);
  const [deletingCategory, setDeletingCategory] =
    useState(null);

  // =====================================================
  // PAGE STATE
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [authorsData, categoriesData] =
        await Promise.all([
          getAuthors(),
          getCategories(),
        ]);

      setAuthors(
        Array.isArray(authorsData)
          ? authorsData
          : authorsData?.results || [],
      );

      setCategories(
        Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.results || [],
      );
    } catch (err) {
      console.error(
        "Failed to load library setup:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load authors and categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // AUTHOR FORM
  // =====================================================

  const resetAuthorForm = () => {
    setAuthorName("");
    setAuthorBio("");
    setEditingAuthor(null);
  };

  const handleEditAuthor = (author) => {
    setEditingAuthor(author);
    setAuthorName(author.name || "");
    setAuthorBio(author.bio || "");
  };

  const handleAuthorSubmit = async (event) => {
    event.preventDefault();

    if (!authorName.trim()) {
      return;
    }

    try {
      setSavingAuthor(true);
      setError("");

      const payload = {
        name: authorName.trim(),
        bio: authorBio.trim(),
      };

      if (editingAuthor) {
        const updated = await updateAuthor(
          editingAuthor.id,
          payload,
        );

        setAuthors((current) =>
          current.map((author) =>
            author.id === editingAuthor.id
              ? updated
              : author,
          ),
        );
      } else {
        const created = await createAuthor(payload);

        setAuthors((current) =>
          [...current, created].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
      }

      resetAuthorForm();
    } catch (err) {
      console.error(
        "Failed to save author:",
        err,
      );

      const responseData =
        err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.entries(
          responseData,
        )
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" ");

        setError(
          messages ||
            "Unable to save the author.",
        );
      } else {
        setError(
          "Unable to save the author.",
        );
      }
    } finally {
      setSavingAuthor(false);
    }
  };

  const handleDeleteAuthor = async (author) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${author.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAuthor(author.id);
      setError("");

      await deleteAuthor(author.id);

      setAuthors((current) =>
        current.filter(
          (item) => item.id !== author.id,
        ),
      );

      if (
        editingAuthor?.id === author.id
      ) {
        resetAuthorForm();
      }
    } catch (err) {
      console.error(
        "Failed to delete author:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to delete this author. The author may already be linked to a book.",
      );
    } finally {
      setDeletingAuthor(null);
    }
  };

  // =====================================================
  // CATEGORY FORM
  // =====================================================

  const resetCategoryForm = () => {
    setCategoryName("");
    setCategoryDescription("");
    setEditingCategory(null);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name || "");
    setCategoryDescription(
      category.description || "",
    );
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    if (!categoryName.trim()) {
      return;
    }

    try {
      setSavingCategory(true);
      setError("");

      const payload = {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
      };

      if (editingCategory) {
        const updated = await updateCategory(
          editingCategory.id,
          payload,
        );

        setCategories((current) =>
          current.map((category) =>
            category.id ===
            editingCategory.id
              ? updated
              : category,
          ),
        );
      } else {
        const created =
          await createCategory(payload);

        setCategories((current) =>
          [...current, created].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
      }

      resetCategoryForm();
    } catch (err) {
      console.error(
        "Failed to save category:",
        err,
      );

      const responseData =
        err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.entries(
          responseData,
        )
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" ");

        setError(
          messages ||
            "Unable to save the category.",
        );
      } else {
        setError(
          "Unable to save the category.",
        );
      }
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (
    category,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCategory(category.id);
      setError("");

      await deleteCategory(category.id);

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id,
        ),
      );

      if (
        editingCategory?.id ===
        category.id
      ) {
        resetCategoryForm();
      }
    } catch (err) {
      console.error(
        "Failed to delete category:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to delete this category. The category may already be linked to a book.",
      );
    } finally {
      setDeletingCategory(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-6">
        <div
          className="rounded-xl border p-8 text-center"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
            color:
              "var(--color-text)",
          }}
        >
          <p className="text-sm opacity-70">
            Loading library setup...
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
      className="space-y-6 p-4 md:p-6"
      style={{
        color: "var(--color-text)",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-2xl font-bold">
          Library Setup
        </h1>

        <p className="mt-1 text-sm opacity-70">
          Manage authors and book categories.
        </p>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor: "#ef4444",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}

      {/* =================================================
          TWO COLUMNS
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* =================================================
            AUTHORS
        ================================================= */}

        <section
          className="overflow-hidden rounded-xl border"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
          }}
        >
          <div className="border-b p-5"
            style={{
              borderColor:
                "var(--color-border)",
            }}
          >
            <h2 className="text-lg font-semibold">
              Authors
            </h2>

            <p className="mt-1 text-sm opacity-60">
              Create and manage book authors.
            </p>
          </div>

          {/* AUTHOR FORM */}

          <form
            onSubmit={handleAuthorSubmit}
            className="space-y-4 border-b p-5"
            style={{
              borderColor:
                "var(--color-border)",
            }}
          >
            <div>
              <label
                htmlFor="author-name"
                className="mb-1.5 block text-sm font-medium"
              >
                Author Name
              </label>

              <input
                id="author-name"
                type="text"
                value={authorName}
                onChange={(event) =>
                  setAuthorName(
                    event.target.value,
                  )
                }
                placeholder="Enter author name"
                required
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor:
                    "var(--color-background)",
                  borderColor:
                    "var(--color-border)",
                  color:
                    "var(--color-text)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="author-bio"
                className="mb-1.5 block text-sm font-medium"
              >
                Biography
              </label>

              <textarea
                id="author-bio"
                rows="3"
                value={authorBio}
                onChange={(event) =>
                  setAuthorBio(
                    event.target.value,
                  )
                }
                placeholder="Optional biography"
                className="w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor:
                    "var(--color-background)",
                  borderColor:
                    "var(--color-border)",
                  color:
                    "var(--color-text)",
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={
                  savingAuthor ||
                  !authorName.trim()
                }
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor:
                    "var(--color-primary)",
                }}
              >
                {savingAuthor
                  ? "Saving..."
                  : editingAuthor
                    ? "Update Author"
                    : "Add Author"}
              </button>

              {editingAuthor && (
                <button
                  type="button"
                  onClick={resetAuthorForm}
                  disabled={savingAuthor}
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium"
                  style={{
                    borderColor:
                      "var(--color-border)",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* AUTHOR LIST */}

          <div>
            {authors.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-3xl">
                  ✍️
                </div>

                <p className="mt-2 text-sm opacity-60">
                  No authors added yet.
                </p>
              </div>
            ) : (
              authors.map((author) => (
                <div
                  key={author.id}
                  className="flex items-center justify-between gap-4 border-b p-4 last:border-b-0"
                  style={{
                    borderColor:
                      "var(--color-border)",
                  }}
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {author.name}
                    </p>

                    <p className="mt-1 text-xs opacity-60">
                      {author.book_count ?? 0}{" "}
                      {author.book_count === 1
                        ? "book"
                        : "books"}
                    </p>

                    {author.bio && (
                      <p className="mt-1 truncate text-xs opacity-50">
                        {author.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditAuthor(
                          author,
                        )
                      }
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                      style={{
                        borderColor:
                          "var(--color-border)",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteAuthor(
                          author,
                        )
                      }
                      disabled={
                        deletingAuthor ===
                        author.id
                      }
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      style={{
                        borderColor:
                          "var(--color-border)",
                        color: "#dc2626",
                      }}
                    >
                      {deletingAuthor ===
                      author.id
                        ? "..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* =================================================
            CATEGORIES
        ================================================= */}

        <section
          className="overflow-hidden rounded-xl border"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
          }}
        >
          <div
            className="border-b p-5"
            style={{
              borderColor:
                "var(--color-border)",
            }}
          >
            <h2 className="text-lg font-semibold">
              Categories
            </h2>

            <p className="mt-1 text-sm opacity-60">
              Organize books into categories.
            </p>
          </div>

          {/* CATEGORY FORM */}

          <form
            onSubmit={handleCategorySubmit}
            className="space-y-4 border-b p-5"
            style={{
              borderColor:
                "var(--color-border)",
            }}
          >
            <div>
              <label
                htmlFor="category-name"
                className="mb-1.5 block text-sm font-medium"
              >
                Category Name
              </label>

              <input
                id="category-name"
                type="text"
                value={categoryName}
                onChange={(event) =>
                  setCategoryName(
                    event.target.value,
                  )
                }
                placeholder="e.g. Mathematics"
                required
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor:
                    "var(--color-background)",
                  borderColor:
                    "var(--color-border)",
                  color:
                    "var(--color-text)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="category-description"
                className="mb-1.5 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="category-description"
                rows="3"
                value={categoryDescription}
                onChange={(event) =>
                  setCategoryDescription(
                    event.target.value,
                  )
                }
                placeholder="Optional description"
                className="w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor:
                    "var(--color-background)",
                  borderColor:
                    "var(--color-border)",
                  color:
                    "var(--color-text)",
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={
                  savingCategory ||
                  !categoryName.trim()
                }
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor:
                    "var(--color-primary)",
                }}
              >
                {savingCategory
                  ? "Saving..."
                  : editingCategory
                    ? "Update Category"
                    : "Add Category"}
              </button>

              {editingCategory && (
                <button
                  type="button"
                  onClick={
                    resetCategoryForm
                  }
                  disabled={savingCategory}
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium"
                  style={{
                    borderColor:
                      "var(--color-border)",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* CATEGORY LIST */}

          <div>
            {categories.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-3xl">
                  🏷️
                </div>

                <p className="mt-2 text-sm opacity-60">
                  No categories added yet.
                </p>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 border-b p-4 last:border-b-0"
                  style={{
                    borderColor:
                      "var(--color-border)",
                  }}
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {category.name}
                    </p>

                    <p className="mt-1 text-xs opacity-60">
                      {category.book_count ?? 0}{" "}
                      {category.book_count ===
                      1
                        ? "book"
                        : "books"}
                    </p>

                    {category.description && (
                      <p className="mt-1 truncate text-xs opacity-50">
                        {
                          category.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditCategory(
                          category,
                        )
                      }
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                      style={{
                        borderColor:
                          "var(--color-border)",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteCategory(
                          category,
                        )
                      }
                      disabled={
                        deletingCategory ===
                        category.id
                      }
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      style={{
                        borderColor:
                          "var(--color-border)",
                        color: "#dc2626",
                      }}
                    >
                      {deletingCategory ===
                      category.id
                        ? "..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default LibrarySetup;

