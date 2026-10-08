import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBook,
  getAuthors,
  getCategories,
  updateBook,
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

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    isbn: "",
    author: "",
    category: "",
    publisher: "",
    publication_year: "",
    description: "",
    total_copies: 1,
    is_active: true,
    cover_image: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [bookData, authorsData, categoriesData] =
          await Promise.all([
            getBook(id),
            getAuthors(),
            getCategories(),
          ]);

        setBook(bookData);

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

        setForm({
          title: bookData.title || "",
          isbn: bookData.isbn || "",
          author: bookData.author || "",
          category: bookData.category || "",
          publisher: bookData.publisher || "",
          publication_year:
            bookData.publication_year || "",
          description: bookData.description || "",
          total_copies:
            bookData.total_copies || 1,
          is_active:
            bookData.is_active ?? true,
          cover_image: null,
        });
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

    loadData();
  }, [id]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = event.target;

    if (type === "file") {
      setForm((current) => ({
        ...current,
        [name]: files?.[0] || null,
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Book title is required.");
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

    const newTotalCopies = Number(
      form.total_copies,
    );

    if (newTotalCopies < 1) {
      setError(
        "Total copies must be at least 1.",
      );
      return;
    }

    const currentTotalCopies = Number(
      book?.total_copies || 0,
    );

    const currentAvailableCopies = Number(
      book?.available_copies || 0,
    );

    const currentlyIssued =
      currentTotalCopies -
      currentAvailableCopies;

    if (newTotalCopies < currentlyIssued) {
      setError(
        `You cannot set total copies below ${currentlyIssued} because ${currentlyIssued} ${currentlyIssued === 1 ? "copy is" : "copies are"} currently issued.`,
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

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

      formData.append(
        "total_copies",
        newTotalCopies,
      );

      /*
       * Preserve currently issued copies.
       *
       * Example:
       * Total = 11
       * Available = 8
       * Issued = 3
       *
       * Change total to 15:
       * Available becomes 12
       */
      const newAvailableCopies =
        newTotalCopies - currentlyIssued;

      formData.append(
        "available_copies",
        newAvailableCopies,
      );

      formData.append(
        "is_active",
        form.is_active ? "true" : "false",
      );

      if (form.cover_image) {
        formData.append(
          "cover_image",
          form.cover_image,
        );
      }

      await updateBook(id, formData);

      navigate(`/librarian/books/${id}`);
    } catch (err) {
      console.error(
        "Failed to update book:",
        err,
      );

      const responseData =
        err.response?.data;

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
            "Unable to update the book.",
        );
      } else {
        setError(
          "Unable to update the book. Please try again.",
        );
      }
    } finally {
      setSaving(false);
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
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const coverImage = getCoverImageUrl(
    book.cover_image,
  );

  const currentlyIssued =
    Number(book.total_copies || 0) -
    Number(book.available_copies || 0);

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(`/librarian/books/${id}`)
            }
            className="mb-4 text-sm font-semibold text-slate-500 transition hover:text-[var(--color-primary)]"
          >
            ← Back to Book Details
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit Book
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update the information for this library book.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* BOOK INFORMATION */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">
              Book Information
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

              <Field
                label="Book Title"
                required
              >
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <Field label="ISBN">
                <input
                  name="isbn"
                  value={form.isbn}
                  onChange={handleChange}
                  placeholder="Enter ISBN"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Author"
                required
              >
                <select
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  className={inputClass}
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

              <Field
                label="Category"
                required
              >
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
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
              </Field>

              <Field label="Publisher">
                <input
                  name="publisher"
                  value={form.publisher}
                  onChange={handleChange}
                  placeholder="Enter publisher"
                  className={inputClass}
                />
              </Field>

              <Field label="Publication Year">
                <input
                  type="number"
                  name="publication_year"
                  value={form.publication_year}
                  onChange={handleChange}
                  min="1000"
                  max="9999"
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* COPIES */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">
              Copies
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Change the total number of physical copies.
            </p>

            <div className="mt-6 max-w-sm">
              <Field
                label="Total Copies"
                required
              >
                <input
                  type="number"
                  name="total_copies"
                  value={form.total_copies}
                  onChange={handleChange}
                  min={Math.max(
                    1,
                    currentlyIssued,
                  )}
                  className={inputClass}
                />
              </Field>

              <div className="mt-3 rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Currently issued
                </p>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {currentlyIssued}{" "}
                  {currentlyIssued === 1
                    ? "copy"
                    : "copies"}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Issued copies cannot be removed from the library's total until they are returned.
                </p>
              </div>
            </div>
          </section>

          {/* DESCRIPTION & COVER */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">
              Additional Information
            </h2>

            <div className="mt-6 space-y-6">

              {coverImage && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Current Cover
                  </p>

                  <img
                    src={coverImage}
                    alt={book.title}
                    className="h-40 w-28 rounded-xl border border-slate-200 object-cover"
                  />
                </div>
              )}

              <Field label="Replace Book Cover">
                <input
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />

                {form.cover_image && (
                  <p className="mt-2 text-xs text-slate-400">
                    Selected:{" "}
                    {form.cover_image.name}
                  </p>
                )}
              </Field>

              <Field label="Description">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter a short description..."
                  className={`${inputClass} h-auto py-3`}
                />
              </Field>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-700">
                    Active book
                  </span>

                  <span className="block text-xs text-slate-400">
                    Active books can be issued to library members.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate(`/librarian/books/${id}`)
              }
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white";

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
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