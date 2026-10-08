import { useEffect, useState } from "react";

import {
  getAttendanceSettings,
  createAttendanceSetting,
  updateAttendanceSetting,
  deleteAttendanceSetting,
} from "../../../services/attendanceService";

import {
  getSchools,
  getSessions,
  getTerms,
} from "../../../services/academicsService";


function AttendanceSettings() {
  const [settings, setSettings] = useState([]);

  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    school: "",
    academic_session: "",
    term: "",
    times_school_opened: "",
  });


  // ==========================================================
  // LOAD DATA
  // ==========================================================

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
      ] = await Promise.all([
        getAttendanceSettings(),
        getSchools(),
        getSessions(),
        getTerms(),
      ]);

      setSettings(
        Array.isArray(settingsData)
          ? settingsData
          : settingsData.results || []
      );

      setSchools(
        Array.isArray(schoolsData)
          ? schoolsData
          : schoolsData.results || []
      );

      setSessions(
        Array.isArray(sessionsData)
          ? sessionsData
          : sessionsData.results || []
      );

      setTerms(
        Array.isArray(termsData)
          ? termsData
          : termsData.results || []
      );

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Failed to load attendance settings."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      school: "",
      academic_session: "",
      term: "",
      times_school_opened: "",
    });

    setError("");
  };


  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {

      const payload = {
        school: Number(formData.school),
        academic_session: Number(
          formData.academic_session
        ),
        term: Number(formData.term),
        times_school_opened: Number(
          formData.times_school_opened
        ),
      };


      if (editingId) {

        await updateAttendanceSetting(
          editingId,
          payload
        );

        setSuccess(
          "Attendance setting updated successfully."
        );

      } else {

        await createAttendanceSetting(
          payload
        );

        setSuccess(
          "Attendance setting created successfully."
        );
      }


      resetForm();

      await loadData();

    } catch (err) {

      console.error(err);

      const data = err.response?.data;

      if (data && typeof data === "object") {

        const messages = Object.entries(data)
          .map(([field, message]) => {
            if (Array.isArray(message)) {
              return `${field}: ${message.join(", ")}`;
            }

            return `${field}: ${message}`;
          })
          .join(" | ");

        setError(
          messages ||
          "Failed to save attendance setting."
        );

      } else {

        setError(
          "Failed to save attendance setting."
        );
      }

    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // EDIT
  // ==========================================================

  const handleEdit = (setting) => {

    setEditingId(setting.id);

    setFormData({
      school: String(setting.school),
      academic_session: String(
        setting.academic_session
      ),
      term: String(setting.term),
      times_school_opened: String(
        setting.times_school_opened
      ),
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance setting?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setError("");
      setSuccess("");

      await deleteAttendanceSetting(id);

      setSuccess(
        "Attendance setting deleted successfully."
      );

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Failed to delete attendance setting."
      );
    }
  };


  // ==========================================================
  // FILTER TERMS BY SESSION
  // ==========================================================

  const filteredTerms = formData.academic_session
    ? terms.filter(
        (term) =>
          String(term.academic_session) ===
          String(formData.academic_session)
      )
    : terms;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="p-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          Attendance Settings
        </h1>

        <p className="text-gray-500 mt-1">
          Set the number of times the school opened
          for each academic session and term.
        </p>

      </div>


      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}


      {/* ================================================== */}
      {/* SUCCESS */}
      {/* ================================================== */}

      {success && (
        <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-700">
          {success}
        </div>
      )}


      {/* ================================================== */}
      {/* FORM */}
      {/* ================================================== */}

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-lg font-semibold text-gray-800">
              {editingId
                ? "Edit Attendance Setting"
                : "Add Attendance Setting"}
            </h2>

            <p className="text-sm text-gray-500">
              This value applies to all students
              in the selected school, session and term.
            </p>

          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}

        </div>


        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >

          {/* SCHOOL */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              School
            </label>

            <select
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2.5"
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


          {/* ACADEMIC SESSION */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Session
            </label>

            <select
              name="academic_session"
              value={formData.academic_session}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2.5"
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


          {/* TERM */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term
            </label>

            <select
              name="term"
              value={formData.term}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2.5"
            >

              <option value="">
                Select term
              </option>

              {filteredTerms.map((term) => (
                <option
                  key={term.id}
                  value={term.id}
                >
                  {term.name}
                </option>
              ))}

            </select>

          </div>


          {/* TIMES SCHOOL OPENED */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Times School Opened
            </label>

            <input
              type="number"
              name="times_school_opened"
              value={formData.times_school_opened}
              onChange={handleChange}
              min="0"
              required
              placeholder="e.g. 68"
              className="w-full rounded-lg border px-3 py-2.5"
            />

          </div>


          {/* BUTTON */}

          <div className="md:col-span-2">

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >

              {saving
                ? "Saving..."
                : editingId
                  ? "Update Setting"
                  : "Save Setting"}

            </button>

          </div>

        </form>

      </div>


      {/* ================================================== */}
      {/* SETTINGS TABLE */}
      {/* ================================================== */}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        <div className="px-6 py-4 border-b">

          <h2 className="text-lg font-semibold text-gray-800">
            School Attendance Settings
          </h2>

        </div>


        {loading ? (

          <div className="p-8 text-center text-gray-500">
            Loading attendance settings...
          </div>

        ) : settings.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No attendance settings have been created yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    School
                  </th>

                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    Academic Session
                  </th>

                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    Term
                  </th>

                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                    School Opened
                  </th>

                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y">

                {settings.map((setting) => (

                  <tr
                    key={setting.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-6 py-4">
                      {setting.school_name}
                    </td>

                    <td className="px-6 py-4">
                      {setting.session_name}
                    </td>

                    <td className="px-6 py-4">
                      {setting.term_name}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {setting.times_school_opened}
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(setting)
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(setting.id)
                          }
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
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
}

export default AttendanceSettings;