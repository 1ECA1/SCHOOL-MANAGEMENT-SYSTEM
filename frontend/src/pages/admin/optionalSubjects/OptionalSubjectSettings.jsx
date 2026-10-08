
import { useEffect, useState } from "react";
import {
  getOptionalSubjectSettings,
  createOptionalSubjectSetting,
  updateOptionalSubjectSetting,
  deleteOptionalSubjectSetting,
} from "../../../services/studentsService";

import {
  getSchools,
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

const OptionalSubjectSettings = () => {
  const [settings, setSettings] = useState([]);

  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    school: "",
    academic_session: "",
    term: "",
    class_level: "",
    is_enabled: false,
    max_optional_subjects: 1,
    start_datetime: "",
    end_datetime: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        settingsData,
        schoolsData,
        sessionsData,
        termsData,
        classLevelsData,
      ] = await Promise.all([
        getOptionalSubjectSettings(),
        getSchools(),
        getSessions(),
        getTerms(),
        getClassLevels(),
      ]);

      setSettings(settingsData);
      setSchools(schoolsData);
      setSessions(sessionsData);
      setTerms(termsData);
      setClassLevels(classLevelsData);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to load optional subject settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      school: "",
      academic_session: "",
      term: "",
      class_level: "",
      is_enabled: false,
      max_optional_subjects: 1,
      start_datetime: "",
      end_datetime: "",
    });

    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        school: Number(formData.school),
        academic_session: Number(formData.academic_session),
        term: Number(formData.term),
        class_level: Number(formData.class_level),
        is_enabled: formData.is_enabled,
        max_optional_subjects: Number(formData.max_optional_subjects),
        start_datetime: formData.start_datetime
          ? new Date(formData.start_datetime).toISOString()
          : null,
        end_datetime: formData.end_datetime
          ? new Date(formData.end_datetime).toISOString()
          : null,
      };

      if (editingId) {
        await updateOptionalSubjectSetting(editingId, payload);
      } else {
        await createOptionalSubjectSetting(payload);
      }

      await loadData();

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);

      const responseData = err.response?.data;

      if (typeof responseData === "object") {
        setError(
          Object.entries(responseData)
            .map(([field, messages]) => {
              const message = Array.isArray(messages)
                ? messages.join(", ")
                : messages;

              return `${field}: ${message}`;
            })
            .join(" | ")
        );
      } else {
        setError("Failed to save optional subject settings.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (setting) => {
    const formatDateTime = (value) => {
      if (!value) return "";

      const date = new Date(value);

      const pad = (number) => String(number).padStart(2, "0");

      return `${date.getFullYear()}-${pad(
        date.getMonth() + 1
      )}-${pad(date.getDate())}T${pad(
        date.getHours()
      )}:${pad(date.getMinutes())}`;
    };

    setFormData({
      school: setting.school,
      academic_session: setting.academic_session,
      term: setting.term,
      class_level: setting.class_level,
      is_enabled: setting.is_enabled,
      max_optional_subjects: setting.max_optional_subjects,
      start_datetime: formatDateTime(setting.start_datetime),
      end_datetime: formatDateTime(setting.end_datetime),
    });

    setEditingId(setting.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this optional subject setting?"
    );

    if (!confirmed) return;

    try {
      await deleteOptionalSubjectSetting(id);
      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail || "Failed to delete setting."
      );
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400";

      case "NOT_STARTED":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400";

      case "CLOSED":
        return "bg-[var(--color-text)]/10 text-[var(--color-text)]/70";

      case "DISABLED":
        return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";

      default:
        return "bg-[var(--color-text)]/10 text-[var(--color-text)]/70";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-6 text-[var(--color-text)]">
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-sm text-[var(--color-text)]/60">
            Loading optional subject settings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6 text-[var(--color-text)]">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Optional Subject Selection
          </h1>

          <p className="mt-1 text-sm text-[var(--color-text)]/60">
            Configure when students can select optional subjects and how many
            they can choose.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
            setError("");
          }}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          + Add Setting
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8 rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-card)] p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-[var(--color-text)]/10 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {editingId
                  ? "Edit Optional Subject Setting"
                  : "Create Optional Subject Setting"}
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text)]/50">
                Configure the optional subject selection period and limit.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
                setError("");
              }}
              className="rounded-lg px-2 py-1 text-xl text-[var(--color-text)]/50 transition hover:bg-[var(--color-text)]/5 hover:text-[var(--color-text)]"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* School */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  School
                </label>

                <select
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="">Select school</option>

                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Session */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Academic Session
                </label>

                <select
                  name="academic_session"
                  value={formData.academic_session}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="">Select session</option>

                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Term */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Term
                </label>

                <select
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="">Select term</option>

                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name || term.term_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Class
                </label>

                <select
                  name="class_level"
                  value={formData.class_level}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="">Select class</option>

                  {classLevels.map((classLevel) => (
                    <option key={classLevel.id} value={classLevel.id}>
                      {classLevel.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Maximum Optional Subjects */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Maximum Optional Subjects
                </label>

                <select
                  name="max_optional_subjects"
                  value={formData.max_optional_subjects}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>

              {/* Enable */}
              <div className="flex items-center gap-3 md:mt-7">
                <input
                  type="checkbox"
                  name="is_enabled"
                  checked={formData.is_enabled}
                  onChange={handleChange}
                  className="h-5 w-5 accent-[var(--color-primary)]"
                />

                <label className="text-sm font-medium text-[var(--color-text)]">
                  Enable optional subject selection
                </label>
              </div>

              {/* Start */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Selection Start
                </label>

                <input
                  type="datetime-local"
                  name="start_datetime"
                  value={formData.start_datetime}
                  onChange={handleChange}
                  required={formData.is_enabled}
                  className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Selection Deadline
                </label>

                <input
                  type="datetime-local"
                  name="end_datetime"
                  value={formData.end_datetime}
                  onChange={handleChange}
                  required={formData.is_enabled}
                  className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--color-text)]/10 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Setting"
                  : "Save Setting"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  setError("");
                }}
                className="rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-text)]/5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settings Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-card)] shadow-sm">
        <div className="border-b border-[var(--color-text)]/10 p-5">
          <h2 className="font-semibold text-[var(--color-text)]">
            Selection Settings
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text)]/50">
            Manage optional subject selection periods for each class.
          </p>
        </div>

        {settings.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--color-text)]/50">
            No optional subject settings have been created.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-text)]/5">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                    School
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                    Session
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                    Term
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                    Class
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                    Maximum
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                    Start
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                    Deadline
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                    Status
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {settings.map((setting) => (
                  <tr
                    key={setting.id}
                    className="border-t border-[var(--color-text)]/10 transition hover:bg-[var(--color-text)]/[0.03]"
                  >
                    <td className="px-4 py-3 text-[var(--color-text)]">
                      {setting.school_name}
                    </td>

                    <td className="px-4 py-3 text-[var(--color-text)]">
                      {setting.academic_session_name}
                    </td>

                    <td className="px-4 py-3 text-[var(--color-text)]">
                      {setting.term_name}
                    </td>

                    <td className="px-4 py-3 text-[var(--color-text)]">
                      {setting.class_level_name}
                    </td>

                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                      {setting.max_optional_subjects}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[var(--color-text)]/70">
                      {setting.start_datetime
                        ? new Date(
                            setting.start_datetime
                          ).toLocaleString()
                        : "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[var(--color-text)]/70">
                      {setting.end_datetime
                        ? new Date(
                            setting.end_datetime
                          ).toLocaleString()
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                          setting.status
                        )}`}
                      >
                        {setting.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(setting)}
                          className="rounded-lg border border-[var(--color-primary)]/30 px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/10"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(setting.id)}
                          className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionalSubjectSettings;
