import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAcademicSection,
  updateAcademicSection,
  getSchools,
} from "../../../services/academicsService";

const EditAcademicSection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [section, schoolData] = await Promise.all([
          getAcademicSection(id),
          getSchools(),
        ]);

        setSchools(schoolData);

        setFormData({
          school: section.school ?? "",
          name: section.name ?? "",
          code: section.code ?? "",
          description: section.description ?? "",
          is_active: section.is_active ?? true,
        });
      } catch (err) {
        console.error(
          "Failed to load academic section:",
          err,
        );

        setError("Failed to load academic section.");
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

      await updateAcademicSection(id, {
        school: Number(formData.school),
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active,
      });

      navigate(`/admin/academic-sections/${id}`);
    } catch (err) {
      console.error(
        "Failed to update academic section:",
        err,
      );

      const responseData = err?.response?.data;

      if (responseData) {
        setError(
          Object.values(responseData).flat().join(" ") ||
            "Failed to update academic section.",
        );
      } else {
        setError("Failed to update academic section.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading academic section...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Edit Academic Section
        </h1>

        <p className="text-sm text-slate-500">
          Update academic section information.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow"
      >
        <div className="grid gap-6 md:grid-cols-2">
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
              disabled={saving}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="">Select school</option>

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

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() =>
              navigate(`/admin/academic-sections/${id}`)
            }
            disabled={saving}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAcademicSection;