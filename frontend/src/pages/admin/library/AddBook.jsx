
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createBook,
  getAuthors,
  getCategories,
} from "../../../services/libraryService";

import { getSchools } from "../../../services/academicsService";

function AddBook() {
  const navigate = useNavigate();

  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [schools, setSchools] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [coverPreview, setCoverPreview] = useState("");

  const [form, setForm] = useState({
    school: "",
    title: "",
    isbn: "",
    author: "",
    category: "",
    publisher: "",
    publication_year: "",
    description: "",
    cover_image: null,
    total_copies: 1,
    available_copies: 1,
    is_active: true,
  });

  // =====================================================
  // LOAD FORM DATA
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [authorsData, categoriesData, schoolsData] =
          await Promise.all([
            getAuthors(),
            getCategories(),
            getSchools(),
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

        setSchools(
          Array.isArray(schoolsData)
            ? schoolsData
            : schoolsData?.results || [],
        );
      } catch (err) {
        console.error(
          "Failed to load library form data:",
          err,
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load the information needed for this form.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // HANDLE COVER IMAGE
  // =====================================================

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0] || null;

    setForm((current) => ({
      ...current,
      cover_image: file,
    }));

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    if (file) {
      setCoverPreview(
        URL.createObjectURL(file),
      );
    } else {
      setCoverPreview("");
    }
  };

  // =====================================================
  // BUILD FORM DATA
  // =====================================================

  const buildFormData = () => {
    const formData = new FormData();

    formData.append(
      "school",
      form.school,
    );

    formData.append(
      "title",
      form.title.trim(),
    );

    formData.append(
      "isbn",
      form.isbn.trim(),
    );

    formData.append(
      "author",
      form.author,
    );

    formData.append(
      "category",
      form.category,
    );

    formData.append(
      "publisher",
      form.publisher.trim(),
    );

    if (form.publication_year) {
      formData.append(
        "publication_year",
        form.publication_year,
      );
    }

    formData.append(
      "description",
      form.description.trim(),
    );

    if (form.cover_image) {
      formData.append(
        "cover_image",
        form.cover_image,
      );
    }

    formData.append(
      "total_copies",
      form.total_copies,
    );

    formData.append(
      "available_copies",
      form.available_copies,
    );

    formData.append(
      "is_active",
      form.is_active ? "true" : "false",
    );

    return formData;
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.school) {
      setError("Please select a school.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter the book title.");
      return;
    }

    if (!form.author) {
      setError("Please select an author.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (
      Number(form.total_copies) < 1
    ) {
      setError(
        "Total copies must be at least 1.",
      );
      return;
    }

    if (
      Number(form.available_copies) < 0
    ) {
      setError(
        "Available copies cannot be negative.",
      );
      return;
    }

    if (
      Number(form.available_copies) >
      Number(form.total_copies)
    ) {
      setError(
        "Available copies cannot be greater than total copies.",
      );
      return;
    }

    try {
      setSaving(true);

      const formData = buildFormData();

      await createBook(formData);

      navigate("/admin/library/books");
    } catch (err) {
      console.error(
        "Failed to create book:",
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
            "Unable to create the book.",
        );
      } else {
        setError(
          "Unable to create the book. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CLEANUP PREVIEW
  // =====================================================

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingData) {
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
            Loading book form...
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
      className="p-4 md:p-6"
      style={{
        color: "var(--color-text)",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            navigate("/admin/library/books")
          }
          className="mb-3 text-sm font-medium opacity-70 hover:opacity-100"
        >
          ← Back to Books
        </button>

        <h1 className="text-2xl font-bold">
          Add Book
        </h1>

        <p className="mt-1 text-sm opacity-70">
          Add a new book to the school library.
        </p>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          className="mb-6 rounded-lg border px-4 py-3 text-sm"
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

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <div
          className="rounded-xl border p-5 md:p-6"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
          }}
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Book Information
            </h2>

            <p className="mt-1 text-sm opacity-60">
              Enter the basic information about the book.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* SCHOOL */}

            <div>
              <label
                htmlFor="school"
                className="mb-1.5 block text-sm font-medium"
              >
                School
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="school"
                name="school"
                value={form.school}
                onChange={handleChange}
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
              >
                <option value="">
                  Select school
                </option>

                {schools.map((school) => (
                  <option
                    key={school.id}
                    value={school.id}
                  >
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            {/* TITLE */}

            <div>
              <label
                htmlFor="title"
                className="mb-1.5 block text-sm font-medium"
              >
                Book Title
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter book title"
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

            {/* ISBN */}

            <div>
              <label
                htmlFor="isbn"
                className="mb-1.5 block text-sm font-medium"
              >
                ISBN
              </label>

              <input
                id="isbn"
                name="isbn"
                type="text"
                value={form.isbn}
                onChange={handleChange}
                placeholder="Enter ISBN"
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

            {/* AUTHOR */}

            <div>
              <label
                htmlFor="author"
                className="mb-1.5 block text-sm font-medium"
              >
                Author
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="author"
                name="author"
                value={form.author}
                onChange={handleChange}
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
              >
                <option value="">
                  Select author
                </option>

                {authors.map((author) => (
                  <option
                    key={author.id}
                    value={author.id}
                  >
                    {author.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}

            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium"
              >
                Category
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
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
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PUBLISHER */}

            <div>
              <label
                htmlFor="publisher"
                className="mb-1.5 block text-sm font-medium"
              >
                Publisher
              </label>

              <input
                id="publisher"
                name="publisher"
                type="text"
                value={form.publisher}
                onChange={handleChange}
                placeholder="Enter publisher"
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

            {/* PUBLICATION YEAR */}

            <div>
              <label
                htmlFor="publication_year"
                className="mb-1.5 block text-sm font-medium"
              >
                Publication Year
              </label>

              <input
                id="publication_year"
                name="publication_year"
                type="number"
                min="0"
                value={form.publication_year}
                onChange={handleChange}
                placeholder="e.g. 2024"
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

            {/* DESCRIPTION */}

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter a description of the book..."
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
          </div>
        </div>

        {/* =================================================
            COVER IMAGE
        ================================================= */}

        <div
          className="rounded-xl border p-5 md:p-6"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
          }}
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Book Cover
            </h2>

            <p className="mt-1 text-sm opacity-60">
              Upload an image for the book cover.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {/* PREVIEW */}

            <div
              className="flex h-48 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
              style={{
                backgroundColor:
                  "var(--color-background)",
                borderColor:
                  "var(--color-border)",
              }}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Book cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center opacity-50">
                  <div className="text-4xl">
                    📖
                  </div>

                  <p className="mt-2 text-xs">
                    No cover
                  </p>
                </div>
              )}
            </div>

            {/* FILE INPUT */}

            <div className="flex-1">
              <label
                htmlFor="cover_image"
                className="mb-1.5 block text-sm font-medium"
              >
                Cover Image
              </label>

              <input
                id="cover_image"
                name="cover_image"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="block w-full rounded-lg border p-2 text-sm"
                style={{
                  backgroundColor:
                    "var(--color-background)",
                  borderColor:
                    "var(--color-border)",
                  color:
                    "var(--color-text)",
                }}
              />

              <p className="mt-2 text-xs opacity-60">
                Recommended: JPG, PNG or WebP image.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            INVENTORY
        ================================================= */}

        <div
          className="rounded-xl border p-5 md:p-6"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
          }}
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Inventory
            </h2>

            <p className="mt-1 text-sm opacity-60">
              Set the number of copies currently owned by the library.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* TOTAL COPIES */}

            <div>
              <label
                htmlFor="total_copies"
                className="mb-1.5 block text-sm font-medium"
              >
                Total Copies
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="total_copies"
                name="total_copies"
                type="number"
                min="1"
                value={form.total_copies}
                onChange={handleChange}
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

            {/* AVAILABLE COPIES */}

            <div>
              <label
                htmlFor="available_copies"
                className="mb-1.5 block text-sm font-medium"
              >
                Available Copies
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="available_copies"
                name="available_copies"
                type="number"
                min="0"
                value={form.available_copies}
                onChange={handleChange}
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

            {/* ACTIVE */}

            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <span>
                  <span className="block text-sm font-medium">
                    Active Book
                  </span>

                  <span className="mt-0.5 block text-xs opacity-60">
                    Allow this book to be used in the library.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/library/books")
            }
            disabled={saving}
            className="rounded-lg border px-5 py-2.5 text-sm font-semibold transition hover:opacity-70 disabled:opacity-50"
            style={{
              borderColor:
                "var(--color-border)",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor:
                "var(--color-primary)",
            }}
          >
            {saving
              ? "Saving Book..."
              : "Save Book"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddBook;
