import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getExamination,
  getExaminationSubject,
  updateExaminationSubject,
} from "../../../services/examinationsService";

import { getSubjects } from "../../../services/academicsService";

const EditExaminationSubject = () => {
  const { id, subjectId } = useParams();
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
    maximum_score: "",
    pass_mark: "",
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

        const [
          examinationData,
          examinationSubjectData,
          subjectsData,
        ] = await Promise.all([
          getExamination(id),
          getExaminationSubject(subjectId),
          getSubjects(),
        ]);

        setExamination(examinationData);

        const subjectList = Array.isArray(subjectsData)
          ? subjectsData
          : subjectsData?.results || [];

        const filteredSubjects = subjectList.filter(
          (subject) =>
            String(subject.school) ===
            String(examinationData.school)
        );

        setSubjects(filteredSubjects);

        setFormData({
          subject:
            examinationSubjectData.subject || "",
          examination_date:
            examinationSubjectData.examination_date || "",
          start_time:
            examinationSubjectData.start_time
              ? examinationSubjectData.start_time.slice(0, 5)
              : "",
          end_time:
            examinationSubjectData.end_time
              ? examinationSubjectData.end_time.slice(0, 5)
              : "",
          maximum_score:
            examinationSubjectData.maximum_score ?? "",
          pass_mark:
            examinationSubjectData.pass_mark ?? "",
          venue:
            examinationSubjectData.venue || "",
        });
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Failed to load examination subject."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, subjectId]);

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
        "Pass mark cannot be greater than maximum score."
      );
      return;
    }

    try {
      setSaving(true);

      await updateExaminationSubject(subjectId, {
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
              "Failed to update examination subject."
          );
        }
      } else {
        setError(
          "Failed to update examination subject."
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
            Loading examination subject...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // NOT FOUND
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
            Edit Examination Subject
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update the subject schedule for{" "}
            {examination.name}.
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
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Subject Schedule
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update the examination date, time, scores,
            and venue.
          </p>
        </div>

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
              placeholder="e.g. Examination Hall"
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

          {/* MAXIMUM SCORE */}
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

export default EditExaminationSubject;