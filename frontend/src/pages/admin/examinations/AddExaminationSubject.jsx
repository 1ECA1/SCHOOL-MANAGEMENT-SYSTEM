import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getExamination,
  createExaminationSubject,
} from "../../../services/examinationsService";

import { getSubjects } from "../../../services/academicsService";

const AddExaminationSubject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examination, setExamination] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    subject: "",
    examination_date: "",
    start_time: "",
    end_time: "",
    maximum_score: "100",
    pass_mark: "40",
    venue: "",
  });

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [examinationData, subjectsData] =
          await Promise.all([
            getExamination(id),
            getSubjects(),
          ]);

        setExamination(examinationData);

        const subjectList = Array.isArray(subjectsData)
          ? subjectsData
          : subjectsData?.results || [];

        // Only subjects belonging to the examination school
        const filteredSubjects = subjectList.filter(
          (subject) =>
            String(subject.school) ===
            String(examinationData.school)
        );

        setSubjects(filteredSubjects);

        // Automatically use examination start date
        setFormData((prev) => ({
          ...prev,
          examination_date:
            examinationData.start_date || "",
        }));
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Failed to load examination information."
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
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.subject) {
      setError("Please select a subject.");
      return;
    }

    if (!formData.examination_date) {
      setError("Please select the examination date.");
      return;
    }

    if (
      formData.examination_date <
        examination.start_date ||
      formData.examination_date >
        examination.end_date
    ) {
      setError(
        "The subject examination date must be within the examination period."
      );
      return;
    }

    if (!formData.start_time) {
      setError("Please select the start time.");
      return;
    }

    if (!formData.end_time) {
      setError("Please select the end time.");
      return;
    }

    if (formData.end_time <= formData.start_time) {
      setError(
        "End time must be later than the start time."
      );
      return;
    }

    const maximumScore = Number(
      formData.maximum_score
    );

    const passMark = Number(formData.pass_mark);

    if (!maximumScore || maximumScore <= 0) {
      setError(
        "Maximum score must be greater than zero."
      );
      return;
    }

    if (passMark < 0) {
      setError("Pass mark cannot be negative.");
      return;
    }

    if (passMark > maximumScore) {
      setError(
        "Pass mark cannot be greater than the maximum score."
      );
      return;
    }

    try {
      setSaving(true);

      await createExaminationSubject({
        examination: id,
        subject: formData.subject,
        examination_date:
          formData.examination_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        maximum_score: maximumScore,
        pass_mark: passMark,
        venue: formData.venue.trim(),
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
              "Failed to add examination subject."
          );
        }
      } else {
        setError(
          "Failed to add examination subject."
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
            Loading examination information...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // EXAMINATION NOT FOUND
  // =====================================================

  if (!examination) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="mb-4 text-red-600">
            {error || "Examination not found."}
          </p>

          <button
            onClick={() =>
              navigate("/admin/examinations")
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Examinations
          </button>
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
            Add Examination Subject
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add a subject to {examination.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(`/admin/examinations/${id}`)
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back to Examination
        </button>
      </div>

      {/* EXAMINATION SUMMARY */}
      <div className="mb-6 rounded-xl bg-blue-50 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryItem
            label="Examination"
            value={examination.name}
          />

          <SummaryItem
            label="Class"
            value={
              examination.class_level_name || "—"
            }
          />

          <SummaryItem
            label="Session"
            value={
              examination.academic_session_name ||
              "—"
            }
          />

          <SummaryItem
            label="Term"
            value={examination.term_name || "—"}
          />
        </div>
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
        <h2 className="mb-5 text-lg font-semibold text-gray-800">
          Subject Schedule
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* SUBJECT */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            >
              <option value="">
                Select subject
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.name}
                  {subject.code
                    ? ` (${subject.code})`
                    : ""}
                </option>
              ))}
            </select>

            {subjects.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">
                No subjects are available for this
                examination's school.
              </p>
            )}
          </div>

          {/* DATE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Examination Date{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="examination_date"
              value={formData.examination_date}
              min={examination.start_date}
              max={examination.end_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-xs text-gray-400">
              Exam period:{" "}
              {examination.start_date} to{" "}
              {examination.end_date}
            </p>
          </div>

          {/* VENUE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Venue
            </label>

            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Hall A"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* START TIME */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Start Time{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* END TIME */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              End Time{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* MAX SCORE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Maximum Score{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="number"
              name="maximum_score"
              value={formData.maximum_score}
              onChange={handleChange}
              min="1"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-xs text-gray-400">
              Example: 100
            </p>
          </div>

          {/* PASS MARK */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Pass Mark{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="number"
              name="pass_mark"
              value={formData.pass_mark}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-xs text-gray-400">
              Must not exceed the maximum score.
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(`/admin/examinations/${id}`)
            }
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || subjects.length === 0}
            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Adding Subject..."
              : "Add Subject"}
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// SUMMARY ITEM
// =====================================================

const SummaryItem = ({ label, value }) => {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-500">
        {label}
      </p>

      <p className="text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
};

export default AddExaminationSubject;