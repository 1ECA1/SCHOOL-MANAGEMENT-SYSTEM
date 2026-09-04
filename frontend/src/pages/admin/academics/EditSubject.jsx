import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSubject,
  updateSubject,
  getSchools,
  getDepartments,
} from "../../../services/academicsService";

const EditSubject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    school: "",
    department: "",
    name: "",
    code: "",
    description: "",
    credit_units: 1,
    is_core: false,
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [subjectData, schoolData, departmentData] =
          await Promise.all([
            getSubject(id),
            getSchools(),
            getDepartments(),
          ]);

        setSchools(schoolData);
        setDepartments(departmentData);

        setFormData({
          school: subjectData.school ?? "",
          department: subjectData.department ?? "",
          name: subjectData.name ?? "",
          code: subjectData.code ?? "",
          description: subjectData.description ?? "",
          credit_units: subjectData.credit_units ?? 1,
          is_core: subjectData.is_core ?? false,
          is_active: subjectData.is_active ?? true,
        });
      } catch (err) {
        console.error("Failed to load subject:", err);
        setError("Failed to load subject.");
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
      setError("Please enter the subject name.");
      return;
    }

    if (!formData.code.trim()) {
      setError("Please enter the subject code.");
      return;
    }

    if (
      !formData.credit_units ||
      Number(formData.credit_units) < 1
    ) {
      setError("Credit units must be at least 1.");
      return;
    }

    try {
      setSaving(true);

      await updateSubject(id, {
        school: Number(formData.school),
        department: formData.department
          ? Number(formData.department)
          : null,
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        credit_units: Number(formData.credit_units),
        is_core: formData.is_core,
        is_active: formData.is_active,
      });

      navigate(`/admin/subjects/${id}`);
    } catch (err) {
      console.error("Failed to update subject:", err);

      const responseData = err?.response?.data;

      if (responseData) {
        setError(
          Object.values(responseData).flat().join(" ") ||
            "Failed to update subject.",
        );
      } else {
        setError("Failed to update subject.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading subject...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Edit Subject
        </h1>

        <p className="text-sm text-slate-500">
          Update subject information.
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
              htmlFor="department"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Department
            </label>

            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="">No department</option>

              {departments.map((department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Subject Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={saving}
              placeholder="Example: Mathematics"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Subject Code
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              disabled={saving}
              placeholder="Example: MTH"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm uppercase outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="credit_units"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Credit Units
            </label>

            <input
              id="credit_units"
              name="credit_units"
              type="number"
              min="1"
              value={formData.credit_units}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="flex flex-col justify-center gap-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_core"
                checked={formData.is_core}
                onChange={handleChange}
                disabled={saving}
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700">
                Core Subject
              </span>
            </label>

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
              placeholder="Enter a description for this subject..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() =>
              navigate(`/admin/subjects/${id}`)
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

export default EditSubject;