import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getExamination,
  updateExamination,
} from "../../../services/examinationsService";

import {
  getSchools,
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

const EditExamination = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    school: "",
    academic_session: "",
    term: "",
    class_level: "",
    name: "",
    examination_type: "TERMINAL",
    start_date: "",
    end_date: "",
    description: "",
    is_published: false,
    is_active: true,
  });

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          examinationData,
          schoolsData,
          sessionsData,
          termsData,
          classLevelsData,
        ] = await Promise.all([
          getExamination(id),
          getSchools(),
          getSessions(),
          getTerms(),
          getClassLevels(),
        ]);

        setSchools(
          Array.isArray(schoolsData)
            ? schoolsData
            : schoolsData?.results || []
        );

        setSessions(
          Array.isArray(sessionsData)
            ? sessionsData
            : sessionsData?.results || []
        );

        setTerms(
          Array.isArray(termsData)
            ? termsData
            : termsData?.results || []
        );

        setClassLevels(
          Array.isArray(classLevelsData)
            ? classLevelsData
            : classLevelsData?.results || []
        );

        setFormData({
          school: examinationData.school || "",
          academic_session:
            examinationData.academic_session || "",
          term: examinationData.term || "",
          class_level:
            examinationData.class_level || "",
          name: examinationData.name || "",
          examination_type:
            examinationData.examination_type ||
            "TERMINAL",
          start_date:
            examinationData.start_date || "",
          end_date:
            examinationData.end_date || "",
          description:
            examinationData.description || "",
          is_published:
            examinationData.is_published || false,
          is_active:
            examinationData.is_active !== undefined
              ? examinationData.is_active
              : true,
        });
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Failed to load examination."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.school) {
      setError("Please select a school.");
      return;
    }

    if (!formData.academic_session) {
      setError(
        "Please select an academic session."
      );
      return;
    }

    if (!formData.term) {
      setError("Please select a term.");
      return;
    }

    if (!formData.class_level) {
      setError("Please select a class.");
      return;
    }

    if (!formData.name.trim()) {
      setError(
        "Please enter the examination name."
      );
      return;
    }

    if (!formData.start_date) {
      setError(
        "Please select the examination start date."
      );
      return;
    }

    if (!formData.end_date) {
      setError(
        "Please select the examination end date."
      );
      return;
    }

    if (
      formData.end_date <
      formData.start_date
    ) {
      setError(
        "Examination end date cannot be before the start date."
      );
      return;
    }

    try {
      setSaving(true);

      await updateExamination(id, {
        ...formData,
        name: formData.name.trim(),
      });

      navigate(`/admin/examinations/${id}`);
    } catch (err) {
      console.error(err);

      const data = err.response?.data;

      if (data) {
        if (typeof data === "string") {
          setError(data);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          const messages = Object.entries(data)
            .map(([field, message]) => {
              const text = Array.isArray(message)
                ? message.join(", ")
                : message;

              return `${field}: ${text}`;
            })
            .join(" | ");

          setError(
            messages ||
              "Failed to update examination."
          );
        }
      } else {
        setError(
          "Failed to update examination."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-gray-600">
            Loading examination...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Edit Examination
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update examination information.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/admin/examinations/${id}`
            )
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow"
      >
        {/* ACADEMIC INFORMATION */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Academic Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* SCHOOL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                School{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
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

            {/* SESSION */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Academic Session{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                name="academic_session"
                value={
                  formData.academic_session
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Term{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                name="term"
                value={formData.term}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="">
                  Select term
                </option>

                {terms.map((term) => (
                  <option
                    key={term.id}
                    value={term.id}
                  >
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CLASS */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Class{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                name="class_level"
                value={formData.class_level}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="">
                  Select class
                </option>

                {classLevels.map((classLevel) => (
                  <option
                    key={classLevel.id}
                    value={classLevel.id}
                  >
                    {classLevel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* EXAMINATION INFORMATION */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Examination Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* NAME */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Examination Name{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. First Term Examination 2026/2027"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* TYPE */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Examination Type{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                name="examination_type"
                value={
                  formData.examination_type
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="FIRST_CA">
                  First Continuous Assessment
                </option>

                <option value="SECOND_CA">
                  Second Continuous Assessment
                </option>

                <option value="MID_TERM">
                  Mid-Term Examination
                </option>

                <option value="MOCK">
                  Mock Examination
                </option>

                <option value="TERMINAL">
                  Terminal Examination
                </option>

                <option value="PROMOTION">
                  Promotion Examination
                </option>

                <option value="ENTRANCE">
                  Entrance Examination
                </option>
              </select>
            </div>

            {/* START DATE */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Start Date{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* END DATE */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                End Date{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Optional examination description..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Status
          </h2>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4"
              />

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Active
                </p>

                <p className="text-xs text-gray-500">
                  Keep this examination active.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_published"
                checked={
                  formData.is_published
                }
                onChange={handleChange}
                className="h-4 w-4"
              />

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Published
                </p>

                <p className="text-xs text-gray-500">
                  Make this examination published.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/examinations/${id}`
              )
            }
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving Changes..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExamination;