import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTerm,
  getSchools,
  getSessions,
  updateTerm,
} from "../../../services/academicsService";

const EditTerm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [schools, setSchools] = useState([]);

  const [formData, setFormData] = useState({
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

        const [termData, sessionData, schoolData] =
          await Promise.all([
            getTerm(id),
            getSessions(),
            getSchools(),
          ]);

        setSessions(sessionData);
        setSchools(schoolData);

        setFormData({
          academic_session:
            termData.academic_session || "",
          name: termData.name || "",
          start_date: termData.start_date || "",
          end_date: termData.end_date || "",
          is_current: Boolean(termData.is_current),
          is_active: Boolean(termData.is_active),
        });
      } catch (err) {
        console.error("Failed to load term:", err);
        setError("Failed to load term.");
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

  const selectedSession = sessions.find(
    (session) =>
      Number(session.id) ===
      Number(formData.academic_session),
  );

  const selectedSchool = schools.find(
    (school) =>
      Number(school.id) ===
      Number(selectedSession?.school),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.academic_session) {
      setError("Please select an academic session.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter the term name.");
      return;
    }

    if (!formData.start_date) {
      setError("Please select the start date.");
      return;
    }

    if (!formData.end_date) {
      setError("Please select the end date.");
      return;
    }

    if (formData.end_date < formData.start_date) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateTerm(id, {
        academic_session: Number(
          formData.academic_session,
        ),
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
        is_active: formData.is_active,
      });

      navigate(`/admin/terms/${id}`);
    } catch (err) {
      console.error("Failed to update term:", err);

      const responseData = err?.response?.data;

      if (responseData) {
        setError(
          typeof responseData === "string"
            ? responseData
            : JSON.stringify(responseData),
        );
      } else {
        setError("Failed to update term.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading term...
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            navigate(`/admin/terms/${id}`)
          }
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Term
        </button>

        <h1 className="text-2xl font-bold text-slate-800">
          Edit Term
        </h1>

        <p className="text-sm text-slate-500">
          Update academic term information.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* SCHOOL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              School
            </label>

            <input
              type="text"
              value={selectedSchool?.name || "—"}
              readOnly
              className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm text-slate-600 outline-none"
            />

            <p className="mt-1 text-xs text-slate-500">
              School is determined by the academic session.
            </p>
          </div>

          {/* ACADEMIC SESSION */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Academic Session
            </label>

            <select
              name="academic_session"
              value={formData.academic_session}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
              required
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

          {/* TERM NAME */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Term Name
            </label>

            <select
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
              required
            >
              <option value="">
                Select term
              </option>

              <option value="FIRST">FIRST</option>
              <option value="SECOND">SECOND</option>
              <option value="THIRD">THIRD</option>
            </select>
          </div>

          {/* START DATE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Start Date
            </label>

            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* END DATE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              End Date
            </label>

            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* CURRENT */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Current Term
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-300 px-4 py-3">
              <input
                type="checkbox"
                name="is_current"
                checked={formData.is_current}
                onChange={handleChange}
                className="h-4 w-4"
              />

              <span className="text-sm text-slate-700">
                Set as current term
              </span>
            </label>
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-300 px-4 py-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4"
              />

              <span className="text-sm text-slate-700">
                Active
              </span>
            </label>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(`/admin/terms/${id}`)
            }
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTerm;