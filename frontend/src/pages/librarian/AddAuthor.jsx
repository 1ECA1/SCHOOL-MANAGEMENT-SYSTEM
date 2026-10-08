import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAuthor,
} from "../../services/libraryService";

function AddAuthor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    bio: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Author name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createAuthor({
        name: form.name.trim(),
        bio: form.bio.trim(),
      });

      navigate("/librarian/authors");
    } catch (err) {
      console.error("Failed to create author:", err);

      const data = err.response?.data;

      if (typeof data === "object" && data !== null) {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" ");

        setError(
          messages || "Failed to create author.",
        );
      } else {
        setError("Failed to create author.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-6 text-[var(--color-text)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate("/librarian/authors")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[var(--color-primary)] dark:text-slate-400"
          >
            ← Back to Authors
          </button>

          <p className="mb-1 text-sm font-semibold text-[var(--color-primary)]">
            Library
          </p>

          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Add Author
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add an author to your library catalog.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700"
        >
          <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-700 sm:px-7">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Author Information
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter the author's basic information.
            </p>
          </div>

          <div className="space-y-6 px-5 py-6 sm:px-7">

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Author Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter author name"
                required
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-700"
              />
            </div>

            {/* Biography */}
            <div>
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Biography
              </label>

              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={7}
                placeholder="Enter a short biography about the author..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-700"
              />

              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Biography is optional.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-[var(--color-background)] px-5 py-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={() =>
                navigate("/librarian/authors")
              }
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-[var(--color-card)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Author"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAuthor;