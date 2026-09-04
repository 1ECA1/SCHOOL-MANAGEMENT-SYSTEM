import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTerm,
  getSchools,
  getSessions,
} from "../../../services/academicsService";

const AddTerm = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [formData, setFormData] = useState({
    school: "",
    academic_session: "",
    name: "",
    start_date: "",
    end_date: "",
    is_current: false,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [schoolData, sessionData] = await Promise.all([
          getSchools(),
          getSessions(),
        ]);

        setSchools(schoolData);
        setSessions(sessionData);
      } catch (err) {
        console.error("Failed to load term data:", err);
        setError("Failed to load schools and academic sessions.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await createTerm({
        school: Number(formData.school),
        academic_session: Number(formData.academic_session),
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
        is_active: formData.is_active,
      });

      navigate("/admin/terms");
    } catch (err) {
      console.error("Failed to create term:", err);

      const backendError =
        err.response?.data;

      if (backendError) {
        setError(
          typeof backendError === "object"
            ? Object.values(backendError)
                .flat()
                .join(" ")
            : String(backendError),
        );
      } else {
        setError("Failed to create term.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Add Term
        </h1>

        <p className="text-sm text-slate-500">
          Create a new academic term.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl bg-white p-6 shadow"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* School */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              School
            </label>

            <select
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
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

          {/* Academic Session */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Academic Session
            </label>

            <select
              name="academic_session"
              value={formData.academic_session}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
            >
              <option value="">
                Select academic session
              </option>

              {sessions.map((session) => (
                <option
                  key={session.id}
                  value={session.id}
                >
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* Term Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Term Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. FIRST"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Start Date
            </label>

            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              End Date
            </label>

            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Current Term */}
        <div className="mt-6 flex items-center gap-3">
          <input
            type="checkbox"
            id="is_current"
            name="is_current"
            checked={formData.is_current}
            onChange={handleChange}
            className="h-4 w-4"
          />

          <label
            htmlFor="is_current"
            className="text-sm font-medium text-slate-700"
          >
            Set as current term
          </label>
        </div>

        {/* Active */}
        <div className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4"
          />

          <label
            htmlFor="is_active"
            className="text-sm font-medium text-slate-700"
          >
            Active
          </label>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Term"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/terms")}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTerm;