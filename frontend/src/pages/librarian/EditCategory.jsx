import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCategory,
  updateCategory,
} from "../../services/libraryService";

function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const category = await getCategory(id);

        setForm({
          name: category.name || "",
          description: category.description || "",
        });
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
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateCategory(id, {
        name: form.name.trim(),
        description: form.description.trim(),
      });

      navigate(`/librarian/categories/${id}`);
    } catch (err) {
      console.error(
        "Failed to update category:",
        err,
      );

      const data = err.response?.data;

      if (
        data &&
        typeof data === "object"
      ) {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" ");

        setError(
          messages || "Failed to update category.",
        );
      } else {
        setError("Failed to update category.");
      }
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(`/librarian/categories/${id}`)
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            ← Back to Category
          </button>

          <p className="mb-1 text-sm font-semibold text-purple-600">
            Library
          </p>

          <h1 className="text-2xl font-bold text-slate-800">
            Edit Category
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update the category information.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
            <h2 className="text-lg font-bold text-slate-800">
              Category Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Make the required changes and save.
            </p>
          </div>

          <div className="space-y-6 px-5 py-6 sm:px-7">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category Name
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
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={8}
                placeholder="Describe this category..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={() =>
                navigate(`/librarian/categories/${id}`)
              }
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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

export default EditCategory;