
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getBook,
  updateBook,
} from "../../../services/libraryService";

import {
  getAuthors,
  getCategories,
} from "../../../services/libraryService";

import { getSchools } from "../../../services//academicsService";

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [schools, setSchools] = useState([]);

  const [formData, setFormData] = useState({
    school: "",
    title: "",
    isbn: "",
    author: "",
    category: "",
    publisher: "",
    publication_year: "",
    description: "",
    total_copies: 1,
    available_copies: 1,
    is_active: true,
  });

  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getImageUrl = (image) => {
    if (!image) return "";

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          bookData,
          authorsData,
          categoriesData,
          schoolsData,
        ] = await Promise.all([
          getBook(id),
          getAuthors(),
          getCategories(),
          getSchools(),
        ]);

        setBook(bookData);
        setAuthors(authorsData);
        setCategories(categoriesData);
        setSchools(schoolsData);

        setFormData({
          school: bookData.school || "",
          title: bookData.title || "",
          isbn: bookData.isbn || "",
          author: bookData.author || "",
          category: bookData.category || "",
          publisher: bookData.publisher || "",
          publication_year:
            bookData.publication_year || "",
          description: bookData.description || "",
          total_copies: bookData.total_copies ?? 1,
          available_copies:
            bookData.available_copies ?? 1,
          is_active: bookData.is_active ?? true,
        });

        if (bookData.cover_image) {
          setPreview(
            getImageUrl(bookData.cover_image)
          );
        }
      } catch (err) {
        console.error("Failed to load edit data:", err);

        setError(
          err?.response?.data?.detail ||
            "Failed to load book information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setCoverImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.school) {
      setError("Please select a school.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter the book title.");
      return;
    }

    if (!formData.author) {
      setError("Please select an author.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    const totalCopies = Number(
      formData.total_copies
    );

    const availableCopies = Number(
      formData.available_copies
    );

    if (totalCopies < 1) {
      setError(
        "Total copies must be at least 1."
      );
      return;
    }

    if (availableCopies < 0) {
      setError(
        "Available copies cannot be negative."
      );
      return;
    }

    if (availableCopies > totalCopies) {
      setError(
        "Available copies cannot be greater than total copies."
      );
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("school", formData.school);
      data.append("title", formData.title.trim());
      data.append("isbn", formData.isbn.trim());
      data.append("author", formData.author);
      data.append("category", formData.category);
      data.append(
        "publisher",
        formData.publisher.trim()
      );

      if (formData.publication_year) {
        data.append(
          "publication_year",
          formData.publication_year
        );
      }

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "total_copies",
        totalCopies
      );

      data.append(
        "available_copies",
        availableCopies
      );

      data.append(
        "is_active",
        formData.is_active
      );

      if (coverImage) {
        data.append(
          "cover_image",
          coverImage
        );
      }

      await updateBook(id, data);

      setSuccess(
        "Book updated successfully."
      );

      setTimeout(() => {
        navigate(
          `/admin/library/books/${id}`
        );
      }, 700);
    } catch (err) {
      console.error(
        "Failed to update book:",
        err
      );

      const responseData =
        err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.entries(
          responseData
        )
          .map(([field, message]) => {
            const text = Array.isArray(message)
              ? message.join(", ")
              : message;

            return `${field}: ${text}`;
          })
          .join(" ");

        setError(
          messages ||
            "Failed to update book."
        );
      } else {
        setError(
          "Failed to update book."
        );
      }
    } finally {
      setSaving(false);
    }
  };

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
            color: "var(--color-text)",
          }}
        >
          Loading book...
        </div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="p-6">
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <p className="mb-4 text-red-500">
            {error}
          </p>

          <Link
            to="/admin/library/books"
            className="inline-flex rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{
              backgroundColor:
                "var(--color-primary)",
            }}
          >
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <Link
          to={`/admin/library/books/${id}`}
          className="text-sm hover:underline"
          style={{
            color: "var(--color-primary)",
          }}
        >
          ← Back to Book Details
        </Link>

        <h1
          className="mt-3 text-2xl font-bold"
          style={{
            color: "var(--color-text)",
          }}
        >
          Edit Book
        </h1>

        <p
          className="mt-1 text-sm opacity-70"
          style={{
            color: "var(--color-text)",
          }}
        >
          Update the information for this library book.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-600">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
          }}
        >
          <h2
            className="mb-6 text-lg font-semibold"
            style={{
              color: "var(--color-text)",
            }}
          >
            Book Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* School */}
            <Field label="School" required>
              <select
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="input-field"
                required
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
            </Field>

            {/* Title */}
            <Field
              label="Book Title"
              required
            >
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter book title"
                className="input-field"
                required
              />
            </Field>

            {/* ISBN */}
            <Field label="ISBN">
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Enter ISBN"
                className="input-field"
              />
            </Field>

            {/* Author */}
            <Field
              label="Author"
              required
            >
              <select
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="input-field"
                required
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
            </Field>

            {/* Category */}
            <Field
              label="Category"
              required
            >
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            {/* Publisher */}
            <Field label="Publisher">
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                placeholder="Enter publisher"
                className="input-field"
              />
            </Field>

            {/* Publication Year */}
            <Field label="Publication Year">
              <input
                type="number"
                name="publication_year"
                value={
                  formData.publication_year
                }
                onChange={handleChange}
                placeholder="e.g. 2024"
                className="input-field"
                min="1000"
                max="9999"
              />
            </Field>
          </div>

          {/* Description */}
          <div className="mt-5">
            <Field label="Description">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter book description"
                rows={5}
                className="input-field"
              />
            </Field>
          </div>
        </div>

        {/* Inventory */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
          }}
        >
          <h2
            className="mb-6 text-lg font-semibold"
            style={{
              color: "var(--color-text)",
            }}
          >
            Inventory
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label="Total Copies"
              required
            >
              <input
                type="number"
                name="total_copies"
                value={
                  formData.total_copies
                }
                onChange={handleChange}
                min="1"
                className="input-field"
                required
              />
            </Field>

            <Field
              label="Available Copies"
              required
            >
              <input
                type="number"
                name="available_copies"
                value={
                  formData.available_copies
                }
                onChange={handleChange}
                min="0"
                className="input-field"
                required
              />
            </Field>
          </div>
        </div>

        {/* Cover Image */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
          }}
        >
          <h2
            className="mb-5 text-lg font-semibold"
            style={{
              color: "var(--color-text)",
            }}
          >
            Book Cover
          </h2>

          {preview && (
            <div className="mb-5">
              <img
                src={preview}
                alt="Book cover preview"
                className="h-64 w-44 rounded-lg object-cover border"
                style={{
                  borderColor:
                    "var(--color-border)",
                }}
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="block w-full text-sm"
          />

          <p
            className="mt-2 text-xs opacity-60"
            style={{
              color: "var(--color-text)",
            }}
          >
            Select a new image only if you want to replace
            the current cover.
          </p>
        </div>

        {/* Status */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
          }}
        >
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4"
            />

            <span
              className="text-sm font-medium"
              style={{
                color:
                  "var(--color-text)",
              }}
            >
              Book is active
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            to={`/admin/library/books/${id}`}
            className="rounded-lg border px-5 py-2.5 text-center text-sm font-medium"
            style={{
              borderColor:
                "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor:
                "var(--color-primary)",
            }}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Local input styling */}
      <style>{`
        .input-field {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.5rem;
          padding: 0.65rem 0.75rem;
          background-color: var(--color-card);
          color: var(--color-text);
          outline: none;
        }

        .input-field:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
        }

        textarea.input-field {
          resize: vertical;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium"
        style={{
          color: "var(--color-text)",
        }}
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

export default EditBook;
