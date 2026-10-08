import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getExaminations,
  getExaminationSubjects,
} from "../../../services/examinationsService";

import {
  createStudentResult,
  getStudentResults,
} from "../../../services/resultsService";

import {
  getStudents,
  getEnrollments,
} from "../../../services/studentsService";

const AddResult = () => {
  const navigate = useNavigate();

  // ============================================================
  // DATA
  // ============================================================

  const [examinations, setExaminations] = useState([]);
  const [examinationSubjects, setExaminationSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [existingResults, setExistingResults] = useState([]);

  // ============================================================
  // UI STATE
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // FORM
  // ============================================================

  const [formData, setFormData] = useState({
    examination: "",
    examination_subject: "",
    student: "",
    ca_score: "",
    exam_score: "",
    is_published: false,
  });

  // ============================================================
  // LOAD INITIAL DATA
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          examinationsData,
          subjectsData,
          studentsData,
          resultsData,
        ] = await Promise.all([
          getExaminations(),
          getExaminationSubjects(),
          getStudents(),
          getStudentResults(),
        ]);

        setExaminations(
          Array.isArray(examinationsData)
            ? examinationsData
            : examinationsData?.results || []
        );

        setExaminationSubjects(
          Array.isArray(subjectsData)
            ? subjectsData
            : subjectsData?.results || []
        );

        setStudents(
          Array.isArray(studentsData)
            ? studentsData
            : studentsData?.results || []
        );

        setExistingResults(
          Array.isArray(resultsData)
            ? resultsData
            : resultsData?.results || []
        );
      } catch (err) {
        console.error("Failed to load result data:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load examinations, subjects or students."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ============================================================
  // SELECTED EXAMINATION
  // ============================================================

  const selectedExamination = useMemo(() => {
    return examinations.find(
      (exam) => String(exam.id) === String(formData.examination)
    );
  }, [examinations, formData.examination]);

  // ============================================================
  // SELECTED EXAMINATION SUBJECT
  // ============================================================

  const selectedExaminationSubject = useMemo(() => {
    return examinationSubjects.find(
      (item) =>
        String(item.id) === String(formData.examination_subject)
    );
  }, [
    examinationSubjects,
    formData.examination_subject,
  ]);

  // ============================================================
  // FILTER SUBJECTS BY EXAMINATION
  // ============================================================

  const filteredExaminationSubjects = useMemo(() => {
    if (!formData.examination) {
      return [];
    }

    return examinationSubjects.filter(
      (item) =>
        String(item.examination) ===
        String(formData.examination)
    );
  }, [
    examinationSubjects,
    formData.examination,
  ]);

  // ============================================================
  // LOAD STUDENTS FOR EXAMINATION
  //
  // Examination determines:
  // - Academic Session
  // - Term
  // - Class
  //
  // We then retrieve enrollments matching those three values.
  // ============================================================

  useEffect(() => {
    const loadEligibleStudents = async () => {
      if (!selectedExamination) {
        setEnrollments([]);
        return;
      }

      const academicSession =
        selectedExamination.academic_session;

      const term = selectedExamination.term;

      const classLevel =
        selectedExamination.class_level;

      if (
        !academicSession ||
        !term ||
        !classLevel
      ) {
        setEnrollments([]);
        setError(
          "This examination does not have a complete session, term and class assigned."
        );
        return;
      }

      try {
        setLoadingStudents(true);
        setError("");

        const enrollmentData = await getEnrollments({
          academicSession,
          term,
          classLevel,
        });

        const enrollmentList = Array.isArray(enrollmentData)
          ? enrollmentData
          : enrollmentData?.results || [];

        setEnrollments(enrollmentList);
      } catch (err) {
        console.error(
          "Failed to load examination students:",
          err
        );

        setEnrollments([]);

        setError(
          err.response?.data?.detail ||
            "Failed to load students for this examination."
        );
      } finally {
        setLoadingStudents(false);
      }
    };

    loadEligibleStudents();
  }, [selectedExamination]);

  // ============================================================
  // STUDENTS ELIGIBLE FOR THIS EXAMINATION
  //
  // Convert enrollment.student into actual student objects.
  // ============================================================

  const eligibleStudents = useMemo(() => {
    if (!enrollments.length) {
      return [];
    }

    const studentIds = new Set(
      enrollments.map((enrollment) =>
        String(
          enrollment.student ??
            enrollment.student_id
        )
      )
    );

    return students.filter((student) =>
      studentIds.has(String(student.id))
    );
  }, [enrollments, students]);

  // ============================================================
  // CURRENT SCORES
  // ============================================================

  const caScore =
    formData.ca_score === ""
      ? 0
      : Number(formData.ca_score);

  const examScore =
    formData.exam_score === ""
      ? 0
      : Number(formData.exam_score);

  const totalScore = caScore + examScore;

  const maximumScore = selectedExaminationSubject
    ? Number(
        selectedExaminationSubject.maximum_score || 0
      )
    : 0;

  // ============================================================
  // HANDLE EXAMINATION CHANGE
  // ============================================================

  const handleExaminationChange = (e) => {
    const examinationId = e.target.value;

    setFormData({
      examination: examinationId,
      examination_subject: "",
      student: "",
      ca_score: "",
      exam_score: "",
      is_published: false,
    });

    setSuccess("");
    setError("");
  };

  // ============================================================
  // HANDLE SUBJECT CHANGE
  // ============================================================

  const handleSubjectChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      examination_subject: e.target.value,
      student: "",
      ca_score: "",
      exam_score: "",
    }));

    setSuccess("");
    setError("");
  };

  // ============================================================
  // HANDLE GENERAL INPUT
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // FIND EXISTING RESULT
  // ============================================================

  const existingResult = useMemo(() => {
    if (
      !formData.student ||
      !formData.examination_subject
    ) {
      return null;
    }

    return (
      existingResults.find(
        (result) =>
          String(result.student) ===
            String(formData.student) &&
          String(result.examination_subject) ===
            String(formData.examination_subject)
      ) || null
    );
  }, [
    existingResults,
    formData.student,
    formData.examination_subject,
  ]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------------

    if (!formData.examination) {
      setError("Please select an examination.");
      return;
    }

    if (!formData.examination_subject) {
      setError("Please select an examination subject.");
      return;
    }

    if (!formData.student) {
      setError("Please select a student.");
      return;
    }

    if (formData.ca_score === "") {
      setError("Please enter the CA score.");
      return;
    }

    if (formData.exam_score === "") {
      setError("Please enter the examination score.");
      return;
    }

    if (
      Number.isNaN(caScore) ||
      Number.isNaN(examScore)
    ) {
      setError("Scores must be valid numbers.");
      return;
    }

    if (caScore < 0) {
      setError("CA score cannot be negative.");
      return;
    }

    if (examScore < 0) {
      setError("Examination score cannot be negative.");
      return;
    }

    // ----------------------------------------------------------
    // MAXIMUM SCORE
    // ----------------------------------------------------------

    if (
      selectedExaminationSubject &&
      totalScore > maximumScore
    ) {
      setError(
        `The total score (${totalScore}) cannot be greater than the maximum score (${maximumScore}).`
      );
      return;
    }

    // ----------------------------------------------------------
    // DUPLICATE RESULT CHECK
    // ----------------------------------------------------------

    if (existingResult) {
      setError(
        `This student already has a result for ${selectedExaminationSubject?.subject_name || "this subject"}. Please edit the existing result instead.`
      );
      return;
    }

    // ----------------------------------------------------------
    // SUBMIT
    // ----------------------------------------------------------

    try {
      setSaving(true);

      const payload = {
        student: Number(formData.student),
        examination_subject: Number(
          formData.examination_subject
        ),
        ca_score: caScore,
        exam_score: examScore,
        is_published: formData.is_published,
      };

      await createStudentResult(payload);

      setSuccess(
        "Student result was added successfully."
      );

      // --------------------------------------------------------
      // Update local existing-result list
      // so the same result cannot immediately be added again.
      // --------------------------------------------------------

      setExistingResults((prev) => [
        ...prev,
        {
          student: Number(formData.student),
          examination_subject: Number(
            formData.examination_subject
          ),
        },
      ]);

      // --------------------------------------------------------
      // Clear score/student fields but keep examination/subject
      // selected so another student can be entered quickly.
      // --------------------------------------------------------

      setFormData((prev) => ({
        ...prev,
        student: "",
        ca_score: "",
        exam_score: "",
      }));
    } catch (err) {
      console.error(
        "Failed to create student result:",
        err
      );

      const responseData = err.response?.data;

      // --------------------------------------------------------
      // Handle Django REST Framework validation errors
      // --------------------------------------------------------

      if (responseData) {
        if (typeof responseData === "string") {
          setError(responseData);
        } else if (responseData.detail) {
          setError(responseData.detail);
        } else if (responseData.non_field_errors) {
          const messages = Array.isArray(
            responseData.non_field_errors
          )
            ? responseData.non_field_errors
            : [responseData.non_field_errors];

          setError(messages.join(" "));
        } else {
          const messages = Object.entries(
            responseData
          ).map(([field, message]) => {
            const text = Array.isArray(message)
              ? message.join(", ")
              : String(message);

            return `${field}: ${text}`;
          });

          setError(
            messages.join(" | ") ||
              "Failed to save the student result."
          );
        }
      } else {
        setError(
          "Failed to save the student result."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          Loading result form...
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Add Student Result
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Enter CA and examination scores for a student.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/results")}
          className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5">
          {error}
        </div>
      )}

      {/* ======================================================
          SUCCESS
      ======================================================= */}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-5">
          {success}
        </div>
      )}

      {/* ======================================================
          FORM
      ======================================================= */}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl shadow-sm"
      >

        {/* ====================================================
            EXAMINATION
        ===================================================== */}

        <div className="p-6 border-b border-gray-200">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Examination
          </h2>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Examination
          </label>

          <select
            name="examination"
            value={formData.examination}
            onChange={handleExaminationChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Select examination
            </option>

            {examinations.map((exam) => (
              <option
                key={exam.id}
                value={exam.id}
              >
                {exam.name ||
                  exam.examination_name ||
                  `Examination ${exam.id}`}
              </option>
            ))}
          </select>

          {/* Examination Information */}

          {selectedExamination && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Academic Session
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {selectedExamination.session_name ||
                    selectedExamination.academic_session_name ||
                    selectedExamination.academic_session ||
                    "—"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Term
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {selectedExamination.term_name ||
                    selectedExamination.term ||
                    "—"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Class
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {selectedExamination.class_name ||
                    selectedExamination.class_level_name ||
                    selectedExamination.class_level ||
                    "—"}
                </p>
              </div>

            </div>
          )}
        </div>

        {/* ====================================================
            SUBJECT
        ===================================================== */}

        <div className="p-6 border-b border-gray-200">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Subject
          </h2>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Examination Subject
          </label>

          <select
            name="examination_subject"
            value={formData.examination_subject}
            onChange={handleSubjectChange}
            disabled={!formData.examination}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {formData.examination
                ? "Select subject"
                : "Select examination first"}
            </option>

            {filteredExaminationSubjects.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.subject_name ||
                    item.subject?.name ||
                    `Subject ${item.id}`}
                </option>
              )
            )}
          </select>

          {selectedExaminationSubject && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Subject
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {selectedExaminationSubject.subject_name ||
                    selectedExaminationSubject.subject?.name ||
                    "—"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Maximum Score
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {maximumScore}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Pass Mark
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {selectedExaminationSubject.pass_mark ??
                    "—"}
                </p>
              </div>

            </div>
          )}
        </div>

        {/* ====================================================
            STUDENT
        ===================================================== */}

        <div className="p-6 border-b border-gray-200">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Student
          </h2>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student
          </label>

          <select
            name="student"
            value={formData.student}
            onChange={handleChange}
            disabled={
              !formData.examination ||
              !formData.examination_subject ||
              loadingStudents
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingStudents
                ? "Loading students..."
                : !formData.examination
                ? "Select examination first"
                : !formData.examination_subject
                ? "Select subject first"
                : eligibleStudents.length === 0
                ? "No students enrolled for this examination"
                : "Select student"}
            </option>

            {eligibleStudents.map((student) => (
              <option
                key={student.id}
                value={student.id}
              >
                {student.full_name ||
                  `${student.first_name || ""} ${
                    student.last_name || ""
                  }`.trim() ||
                  `Student ${student.id}`}
                {student.admission_number
                  ? ` — ${student.admission_number}`
                  : ""}
              </option>
            ))}
          </select>

          {formData.examination &&
            formData.examination_subject &&
            !loadingStudents &&
            eligibleStudents.length === 0 && (
              <p className="text-sm text-orange-600 mt-2">
                No student enrollment was found for this
                examination's session, term and class.
              </p>
            )}

          {/* Duplicate warning */}

          {existingResult && (
            <div className="mt-4 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg">
              This student already has a result for this
              subject.
              {existingResult.id && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/results/student-results/${existingResult.id}/edit`
                    )
                  }
                  className="ml-2 font-semibold underline"
                >
                  Edit result
                </button>
              )}
            </div>
          )}
        </div>

        {/* ====================================================
            SCORES
        ===================================================== */}

        <div className="p-6 border-b border-gray-200">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Scores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* CA */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CA Score
              </label>

              <input
                type="number"
                name="ca_score"
                value={formData.ca_score}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter CA score"
                disabled={!formData.student}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* EXAM */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Examination Score
              </label>

              <input
                type="number"
                name="exam_score"
                value={formData.exam_score}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter examination score"
                disabled={!formData.student}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* TOTAL */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Score
              </label>

              <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 font-semibold text-gray-800">
                {totalScore.toFixed(2)}
                {selectedExaminationSubject && (
                  <span className="text-gray-400 font-normal">
                    {" "}
                    / {maximumScore.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Score warning */}

          {selectedExaminationSubject &&
            totalScore > maximumScore && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                Total score cannot exceed{" "}
                {maximumScore}.
              </div>
            )}
        </div>

        {/* ====================================================
            PUBLISH
        ===================================================== */}

        <div className="p-6 border-b border-gray-200">

          <label className="flex items-center gap-3 cursor-pointer">

            <input
              type="checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              className="w-4 h-4"
            />

            <span className="text-sm font-medium text-gray-700">
              Publish this result
            </span>

          </label>

          <p className="text-xs text-gray-500 mt-2">
            Leave unchecked if the result should remain a
            draft.
          </p>
        </div>

        {/* ====================================================
            ACTIONS
        ===================================================== */}

        <div className="p-6 flex flex-col sm:flex-row gap-3 justify-end">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/results")
            }
            disabled={saving}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              loadingStudents ||
              !!existingResult ||
              !formData.student ||
              !formData.examination_subject
            }
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {saving
              ? "Saving..."
              : "Save Result"}
          </button>

        </div>
      </form>
    </div>
  );
};

export default AddResult;