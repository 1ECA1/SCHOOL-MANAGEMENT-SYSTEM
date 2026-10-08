import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getExaminations,
  getExaminationSubjects,
} from "../../services/examinationsService";

import {
  createStudentResult,
  getStudentResults,
} from "../../services/resultsService";

import {
  getStudents,
  getEnrollments,
} from "../../services/studentsService";


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
      (exam) =>
        String(exam.id) === String(formData.examination)
    );
  }, [examinations, formData.examination]);

  // ============================================================
  // SELECTED EXAMINATION SUBJECT
  // ============================================================

  const selectedExaminationSubject = useMemo(() => {
    return examinationSubjects.find(
      (item) =>
        String(item.id) ===
        String(formData.examination_subject)
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
  // LOAD STUDENTS FOR SELECTED EXAMINATION
  //
  // Examination determines:
  // - Academic Session
  // - Term
  // - Class
  //
  // Then we retrieve enrollments matching those values.
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

        const enrollmentList =
          Array.isArray(enrollmentData)
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
  // Enrollment determines the students who belong to:
  // session + term + class of the examination.
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
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
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
      setError(
        "Please enter the examination score."
      );
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
      setError(
        "Examination score cannot be negative."
      );
      return;
    }

    if (
      selectedExaminationSubject &&
      totalScore > maximumScore
    ) {
      setError(
        `The total score (${totalScore}) cannot be greater than the maximum score (${maximumScore}).`
      );

      return;
    }

    if (existingResult) {
      setError(
        `This student already has a result for ${
          selectedExaminationSubject?.subject_name ||
          "this subject"
        }. Please edit the existing result instead.`
      );

      return;
    }

    // ----------------------------------------------------------
    // SAVE
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

        is_published:
          formData.is_published,
      };

      await createStudentResult(payload);

      setSuccess(
        "Student result was added successfully."
      );

      // Add temporary record locally so the same
      // student/subject cannot immediately be entered again.
      setExistingResults((prev) => [
        ...prev,
        {
          student: Number(formData.student),

          examination_subject: Number(
            formData.examination_subject
          ),
        },
      ]);

      // Clear only student and scores.
      // Keep examination and subject selected.
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

      const responseData =
        err.response?.data;

      if (responseData) {
        if (
          typeof responseData ===
          "string"
        ) {
          setError(responseData);
        } else if (
          responseData.detail
        ) {
          setError(
            responseData.detail
          );
        } else if (
          responseData.non_field_errors
        ) {
          const messages =
            Array.isArray(
              responseData.non_field_errors
            )
              ? responseData.non_field_errors
              : [
                  responseData.non_field_errors,
                ];

          setError(
            messages.join(" ")
          );
        } else {
          const messages =
            Object.entries(
              responseData
            ).map(
              ([field, message]) => {
                const text =
                  Array.isArray(
                    message
                  )
                    ? message.join(
                        ", "
                      )
                    : String(
                        message
                      );

                return `${field}: ${text}`;
              }
            );

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
      <div className="min-h-screen bg-background p-4 text-text sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-card p-10 text-center shadow-sm dark:border-slate-700">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-2xl">
              📝
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading result form...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-background p-4 text-text sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>Exam Officer</span>
              <span>/</span>
              <span>Results</span>
              <span>/</span>
              <span className="text-[var(--color-primary)]">
                Add Result
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Add Student Result
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select the examination and subject first,
              then enter the student's CA and examination
              scores.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/exam-officer/results")
            }
            className="rounded-xl border border-slate-200 bg-card px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            ← Back to Results
          </button>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <span className="text-lg">⚠️</span>

            <div>
              <p className="font-semibold">
                Unable to continue
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
            <span className="text-lg">✅</span>

            <div>
              <p className="font-semibold">
                Result saved
              </p>

              <p className="mt-1">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-sm dark:border-slate-700"
        >

          {/* ====================================================
              1. EXAMINATION
          ==================================================== */}

          <section className="border-b border-slate-200 p-5 dark:border-slate-700 sm:p-7">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-xl">
                📋
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Examination
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select the examination first.
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-semibold">
              Select Examination
            </label>

            <select
              name="examination"
              value={formData.examination}
              onChange={
                handleExaminationChange
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-slate-600 dark:bg-slate-900"
            >
              <option value="">
                Select examination
              </option>

              {examinations.map(
                (exam) => (
                  <option
                    key={exam.id}
                    value={exam.id}
                  >
                    {exam.name ||
                      exam.examination_name ||
                      `Examination ${exam.id}`}
                  </option>
                )
              )}
            </select>

            {/* EXAMINATION INFORMATION */}

            {selectedExamination && (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Academic Session
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedExamination.session_name ||
                      selectedExamination.academic_session_name ||
                      selectedExamination.academic_session ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Term
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedExamination.term_name ||
                      selectedExamination.term ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Class
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedExamination.class_name ||
                      selectedExamination.class_level_name ||
                      selectedExamination.class_level ||
                      "—"}
                  </p>
                </div>

              </div>
            )}
          </section>

          {/* ====================================================
              2. SUBJECT
          ==================================================== */}

          <section className="border-b border-slate-200 p-5 dark:border-slate-700 sm:p-7">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-xl">
                📚
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Subject
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Only subjects registered for the selected
                  examination are shown.
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-semibold">
              Examination Subject
            </label>

            <select
              name="examination_subject"
              value={
                formData.examination_subject
              }
              onChange={
                handleSubjectChange
              }
              disabled={
                !formData.examination
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:disabled:bg-slate-800"
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

            {formData.examination &&
              filteredExaminationSubjects.length ===
                0 && (
                <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                  No subjects have been registered
                  for this examination.
                </p>
              )}

            {/* SUBJECT INFORMATION */}

            {selectedExaminationSubject && (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Subject
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedExaminationSubject.subject_name ||
                      selectedExaminationSubject.subject?.name ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Maximum Score
                  </p>

                  <p className="mt-1 font-semibold">
                    {maximumScore}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Pass Mark
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedExaminationSubject.pass_mark ??
                      "—"}
                  </p>
                </div>

              </div>
            )}
          </section>

          {/* ====================================================
              3. STUDENT
          ==================================================== */}

          <section className="border-b border-slate-200 p-5 dark:border-slate-700 sm:p-7">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl">
                👨‍🎓
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Student
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Only students belonging to the examination
                  class are shown.
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-semibold">
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
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:disabled:bg-slate-800"
            >
              <option value="">
                {loadingStudents
                  ? "Loading students..."
                  : !formData.examination
                  ? "Select examination first"
                  : !formData.examination_subject
                  ? "Select subject first"
                  : eligibleStudents.length ===
                    0
                  ? "No students enrolled for this examination"
                  : "Select student"}
              </option>

              {eligibleStudents.map(
                (student) => (
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
                )
              )}
            </select>

            {formData.examination &&
              formData.examination_subject &&
              !loadingStudents &&
              eligibleStudents.length ===
                0 && (
                <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                  No student enrollment was found
                  for this examination's session,
                  term and class.
                </p>
              )}

            {/* EXISTING RESULT */}

            {existingResult && (
              <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-300">
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    ⚠️
                  </span>

                  <div>
                    <p className="font-semibold">
                      Result already exists
                    </p>

                    <p className="mt-1">
                      This student already has a
                      result for this subject.
                    </p>

                    {existingResult.id && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/exam-officer/results/student-results/${existingResult.id}/edit`
                          )
                        }
                        className="mt-2 font-semibold underline"
                      >
                        Edit existing result
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ====================================================
              4. SCORES
          ==================================================== */}

          <section className="border-b border-slate-200 p-5 dark:border-slate-700 sm:p-7">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-xl">
                🧮
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Scores
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enter the CA and examination scores.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* CA */}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  CA Score
                </label>

                <input
                  type="number"
                  name="ca_score"
                  value={
                    formData.ca_score
                  }
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter CA score"
                  disabled={
                    !formData.student
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:disabled:bg-slate-800"
                />
              </div>

              {/* EXAM */}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Examination Score
                </label>

                <input
                  type="number"
                  name="exam_score"
                  value={
                    formData.exam_score
                  }
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter examination score"
                  disabled={
                    !formData.student
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:disabled:bg-slate-800"
                />
              </div>

              {/* TOTAL */}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Total Score
                </label>

                <div className="flex min-h-[48px] items-center rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-bold dark:border-slate-600 dark:bg-slate-800">
                  {totalScore.toFixed(2)}

                  {selectedExaminationSubject && (
                    <span className="ml-1 font-normal text-slate-400">
                      /
                      {maximumScore.toFixed(
                        2
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* MAXIMUM SCORE WARNING */}

            {selectedExaminationSubject &&
              totalScore > maximumScore && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  Total score cannot exceed{" "}
                  {maximumScore}.
                </div>
              )}
          </section>

          {/* ====================================================
              5. PUBLISH
          ==================================================== */}

          <section className="border-b border-slate-200 p-5 dark:border-slate-700 sm:p-7">

            <label className="flex cursor-pointer items-start gap-3">

              <input
                type="checkbox"
                name="is_published"
                checked={
                  formData.is_published
                }
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />

              <span>
                <span className="block text-sm font-semibold">
                  Publish this result
                </span>

                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  Published results can be made
                  available to the appropriate student
                  and parent portals according to your
                  existing result permissions.
                </span>
              </span>

            </label>
          </section>

          {/* ====================================================
              ACTIONS
          ==================================================== */}

          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:justify-end sm:p-7">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/exam-officer/results"
                )
              }
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-card px-6 py-3 text-sm font-semibold text-text transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
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
              className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Result..."
                : formData.is_published
                ? "Save & Publish Result"
                : "Save Result"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResult;