import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAcademicSection,
  getSchools,
} from "../../../services/academicsService";

const AddAcademicSection = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    school: "",
    name: "",
    code: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await getSchools();
        setSchools(data);
      } catch (err) {
        console.error("Failed to load schools:", err);
        setError("Failed to load schools.");
      } finally {
        setLoadingSchools(false);
      }
    };

    loadSchools();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.school) {
      setError("Please select a school.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter the section name.");
      return;
    }

    if (!formData.code.trim()) {
      setError("Please enter the section code.");
      return;
    }

    try {
      setSaving(true);

      await createAcademicSection({
        school: Number(formData.school),
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active,
      });

      navigate("/admin/academic-sections");
    } catch (err) {
      console.error(
        "Failed to create academic section:",
        err,
      );

      const responseData = err?.response?.data;

      if (responseData) {
        setError(
          Object.values(responseData).flat().join(" ") ||
            "Failed to create academic section.",
        );
      } else {
        setError("Failed to create academic section.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Add Academic Section
        </h1>

        <p className="text-sm text-slate-500">
          Create a new academic section.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* School */}
          <div>
            <label
              htmlFor="school"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              School
            </label>

            <select
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              disabled={loadingSchools || saving}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="">
                {loadingSchools
                  ? "Loading schools..."
                  : "Select school"}
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

          {/* Section Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Section Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={saving}
              placeholder="Example: Junior Secondary"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Code */}
          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Section Code
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              disabled={saving}
              placeholder="Example: JSS"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm uppercase outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Status */}
          <div className="flex items-center">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={saving}
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700">
                Active
              </span>
            </label>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={saving}
              rows={4}
              placeholder="Enter a description for this academic section..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/academic-sections")
            }
            disabled={saving}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || loadingSchools}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Academic Section"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAcademicSection;