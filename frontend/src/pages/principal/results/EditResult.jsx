import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Save,
} from "lucide-react";

import api from "../../../services/api";

import {
  getExaminations,
  getExaminationSubjects,
} from "../../../services/examinationsService";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

// ============================================================
// HELPERS
// ============================================================

const getArray = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const formatScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
};

const getStudentName = (student) => {
  if (!student) {
    return "";
  }

  return (
    student.full_name ||
    student.student_name ||
    student.name ||
    `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
    student.admission_number ||
    ""
  );
};

const getStudentClass = (student) => {
  if (!student) {
    return null;
  }

  return (
    student.class_level ??
    student.current_class_level ??
    student.class ??
    student.current_class ??
    null
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function EditResult() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [students, setStudents] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [examinationSubjects, setExaminationSubjects] =
    useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  // ----------------------------------------------------------
  // FORM
  // ----------------------------------------------------------

  const [form, setForm] = useState({
    student: "",
    examination_subject: "",
    ca_score: "",
    exam_score: "",
  });

  // ----------------------------------------------------------
  // ORIGINAL RESULT
  // ----------------------------------------------------------

  const [originalResult, setOriginalResult] = useState(null);

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ----------------------------------------------------------
  // FILTERS
  // ----------------------------------------------------------

  const [sessionFilter, setSessionFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [examinationFilter, setExaminationFilter] =
    useState("");

  // ==========================================================
  // ROUTES
  // ==========================================================

  const RESULTS_ROUTE = "/principal/results";

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          resultResponse,
          studentsResponse,
          examinationsResponse,
          subjectsResponse,
          sessionsResponse,
          termsResponse,
          classesResponse,
        ] = await Promise.all([
          api.get(`/results/student-results/${id}/`),
          api.get("/students/"),
          getExaminations(),
          getExaminationSubjects(),
          getSessions(),
          getTerms(),
          getClassLevels(),
        ]);

        if (!mounted) {
          return;
        }

        const result = resultResponse.data;

        setOriginalResult(result);

        setStudents(
          getArray(studentsResponse.data)
        );

        setExaminations(
          getArray(examinationsResponse)
        );

        setExaminationSubjects(
          getArray(subjectsResponse)
        );

        setSessions(
          getArray(sessionsResponse)
        );

        setTerms(
          getArray(termsResponse)
        );

        setClassLevels(
          getArray(classesResponse)
        );

        // ----------------------------------------------------
        // RESULT VALUES
        // ----------------------------------------------------

        const resultStudent =
          result.student;

        const resultExaminationSubject =
          result.examination_subject;

        const resultExamination =
          result.examination ||
          resultExaminationSubject?.examination;

        const resultSession =
          result.academic_session ||
          resultExamination?.academic_session;

        const resultTerm =
          result.term ||
          resultExamination?.term;

        const resultClass =
          result.class_level ||
          resultExamination?.class_level;

        setSessionFilter(
          resultSession
            ? String(
                typeof resultSession === "object"
                  ? resultSession.id
                  : resultSession
              )
            : ""
        );

        setTermFilter(
          resultTerm
            ? String(
                typeof resultTerm === "object"
                  ? resultTerm.id
                  : resultTerm
              )
            : ""
        );

        setClassFilter(
          resultClass
            ? String(
                typeof resultClass === "object"
                  ? resultClass.id
                  : resultClass
              )
            : ""
        );

        setExaminationFilter(
          resultExamination
            ? String(
                typeof resultExamination ===
                "object"
                  ? resultExamination.id
                  : resultExamination
              )
            : ""
        );

        setForm({
          student:
            resultStudent !== undefined &&
            resultStudent !== null
              ? String(
                  typeof resultStudent ===
                  "object"
                    ? resultStudent.id
                    : resultStudent
                )
              : "",

          examination_subject:
            resultExaminationSubject !==
              undefined &&
            resultExaminationSubject !== null
              ? String(
                  typeof resultExaminationSubject ===
                  "object"
                    ? resultExaminationSubject.id
                    : resultExaminationSubject
                )
              : "",

          ca_score: formatScore(
            result.ca_score
          ),

          exam_score: formatScore(
            result.exam_score
          ),
        });
      } catch (err) {
        console.error(
          "Failed to load Principal Edit Result data:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.error ||
            "Failed to load the result for editing."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (!id) {
      setError("No result ID was provided.");
      setLoading(false);
      return;
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ==========================================================
  // SELECTED EXAMINATION
  // ==========================================================

  const selectedExamination = useMemo(() => {
    return examinations.find(
      (exam) =>
        String(exam.id) ===
        String(examinationFilter)
    );
  }, [
    examinations,
    examinationFilter,
  ]);

  // ==========================================================
  // SELECTED SUBJECT
  // ==========================================================

  const selectedSubject = useMemo(() => {
    return examinationSubjects.find(
      (item) =>
        String(item.id) ===
        String(form.examination_subject)
    );
  }, [
    examinationSubjects,
    form.examination_subject,
  ]);

  // ==========================================================
  // FILTER EXAMINATIONS
  // ==========================================================

  const filteredExaminations = useMemo(() => {
    return examinations.filter((exam) => {
      const sessionMatches =
        !sessionFilter ||
        String(exam.academic_session) ===
          String(sessionFilter);

      const termMatches =
        !termFilter ||
        String(exam.term) ===
          String(termFilter);

      const classMatches =
        !classFilter ||
        String(exam.class_level) ===
          String(classFilter);

      return (
        sessionMatches &&
        termMatches &&
        classMatches
      );
    });
  }, [
    examinations,
    sessionFilter,
    termFilter,
    classFilter,
  ]);

  // ==========================================================
  // FILTER SUBJECTS
  // ==========================================================

  const filteredSubjects = useMemo(() => {
    if (!examinationFilter) {
      return [];
    }

    return examinationSubjects.filter(
      (item) =>
        String(item.examination) ===
        String(examinationFilter)
    );
  }, [
    examinationSubjects,
    examinationFilter,
  ]);

  // ==========================================================
  // FILTER STUDENTS
  // ==========================================================

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (selectedExamination?.class_level) {
      const classId = String(
        selectedExamination.class_level
      );

      const studentsWithClass =
        result.filter((student) => {
          const studentClass =
            getStudentClass(student);

          return (
            studentClass !== null &&
            studentClass !== undefined
          );
        });

      if (studentsWithClass.length > 0) {
        result = studentsWithClass.filter(
          (student) => {
            const studentClass =
              getStudentClass(student);

            return (
              String(studentClass) ===
              classId
            );
          }
        );
      }
    }

    // --------------------------------------------------------
    // Make sure the student currently attached to the result
    // remains available while editing.
    // --------------------------------------------------------

    if (form.student) {
      const existingStudent =
        students.find(
          (student) =>
            String(student.id) ===
            String(form.student)
        );

      if (
        existingStudent &&
        !result.some(
          (student) =>
            String(student.id) ===
            String(existingStudent.id)
        )
      ) {
        result = [
          existingStudent,
          ...result,
        ];
      }
    }

    return result;
  }, [
    students,
    selectedExamination,
    form.student,
  ]);

  // ==========================================================
  // MAXIMUM SCORE
  // ==========================================================

  const maximumScore = useMemo(() => {
    if (!selectedSubject) {
      return null;
    }

    const value = Number(
      selectedSubject.maximum_score
    );

    return Number.isFinite(value)
      ? value
      : null;
  }, [selectedSubject]);

  // ==========================================================
  // SCORE TOTAL
  // ==========================================================

  const combinedScore = useMemo(() => {
    return (
      Number(form.ca_score || 0) +
      Number(form.exam_score || 0)
    );
  }, [
    form.ca_score,
    form.exam_score,
  ]);

  // ==========================================================
  // HANDLE FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // SESSION CHANGE
  // ==========================================================

  const handleSessionChange = (event) => {
    const value = event.target.value;

    setSessionFilter(value);

    setExaminationFilter("");

    setForm((previous) => ({
      ...previous,
      examination_subject: "",
      student: "",
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // TERM CHANGE
  // ==========================================================

  const handleTermChange = (event) => {
    const value = event.target.value;

    setTermFilter(value);

    setExaminationFilter("");

    setForm((previous) => ({
      ...previous,
      examination_subject: "",
      student: "",
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // CLASS CHANGE
  // ==========================================================

  const handleClassChange = (event) => {
    const value = event.target.value;

    setClassFilter(value);

    setExaminationFilter("");

    setForm((previous) => ({
      ...previous,
      examination_subject: "",
      student: "",
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // EXAMINATION CHANGE
  // ==========================================================

  const handleExaminationChange = (
    event
  ) => {
    const value = event.target.value;

    setExaminationFilter(value);

    setForm((previous) => ({
      ...previous,
      examination_subject: "",
      student: "",
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (!form.student) {
      return "Please select a student.";
    }

    if (!form.examination_subject) {
      return "Please select an examination subject.";
    }

    const ca = Number(
      form.ca_score || 0
    );

    const exam = Number(
      form.exam_score || 0
    );

    if (
      !Number.isFinite(ca) ||
      ca < 0
    ) {
      return "CA score must be a valid non-negative number.";
    }

    if (
      !Number.isFinite(exam) ||
      exam < 0
    ) {
      return "Exam score must be a valid non-negative number.";
    }

    if (
      maximumScore !== null &&
      ca + exam > maximumScore
    ) {
      return `The combined CA and examination score cannot exceed ${maximumScore}.`;
    }

    return "";
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        student: Number(form.student),

        examination_subject:
          Number(
            form.examination_subject
          ),

        ca_score: Number(
          form.ca_score || 0
        ),

        exam_score: Number(
          form.exam_score || 0
        ),
      };

      const response = await api.put(
        `/results/student-results/${id}/`,
        payload
      );

      console.log(
        "Updated result:",
        response.data
      );

      setSuccess(
        "Student result was updated successfully."
      );

      setTimeout(() => {
        navigate(
          `${RESULTS_ROUTE}/${id}`
        );
      }, 700);
    } catch (err) {
      console.error(
        "Failed to update Principal student result:",
        err
      );

      const responseData =
        err?.response?.data;

      let message =
        responseData?.detail ||
        responseData?.error ||
        "Failed to update the student result.";

      if (
        typeof responseData ===
          "object" &&
        responseData &&
        !responseData?.detail &&
        !responseData?.error
      ) {
        const fieldErrors =
          Object.entries(
            responseData
          )
            .map(
              ([
                field,
                messages,
              ]) => {
                const text =
                  Array.isArray(
                    messages
                  )
                    ? messages.join(
                        " "
                      )
                    : String(
                        messages
                      );

                return `${field}: ${text}`;
              }
            )
            .join(" ");

        if (fieldErrors) {
          message = fieldErrors;
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background text-text">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />

          <p className="text-sm opacity-70">
            Loading result...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                `${RESULTS_ROUTE}/${id}`
              )
            }
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Result
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold">
            Edit Student Result
          </h1>

          <p className="text-sm opacity-70 mt-1">
            Update the student's CA and examination scores.
          </p>
        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to update result
              </p>

              <p className="text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 p-4 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />

            <p className="text-sm font-medium">
              {success}
            </p>
          </div>
        )}

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden"
        >

          {/* ==================================================
              EXAMINATION CONTEXT
          ================================================== */}

          <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10">
            <h2 className="text-lg font-semibold">
              Examination
            </h2>

            <p className="text-sm opacity-60 mt-1">
              Select the academic context and examination.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

              {/* SESSION */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Academic Session
                </label>

                <select
                  value={sessionFilter}
                  onChange={
                    handleSessionChange
                  }
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    All Sessions
                  </option>

                  {sessions.map(
                    (session) => (
                      <option
                        key={session.id}
                        value={session.id}
                      >
                        {session.name ||
                          session.session_name ||
                          `Session ${session.id}`}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* TERM */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Term
                </label>

                <select
                  value={termFilter}
                  onChange={
                    handleTermChange
                  }
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    All Terms
                  </option>

                  {terms.map(
                    (term) => (
                      <option
                        key={term.id}
                        value={term.id}
                      >
                        {term.name ||
                          term.term_name ||
                          term.term_display ||
                          `Term ${term.id}`}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* CLASS */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Class
                </label>

                <select
                  value={classFilter}
                  onChange={
                    handleClassChange
                  }
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    All Classes
                  </option>

                  {classLevels.map(
                    (classLevel) => (
                      <option
                        key={classLevel.id}
                        value={classLevel.id}
                      >
                        {classLevel.name ||
                          classLevel.class_name ||
                          classLevel.code ||
                          `Class ${classLevel.id}`}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* EXAMINATION */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Examination
                </label>

                <select
                  value={
                    examinationFilter
                  }
                  onChange={
                    handleExaminationChange
                  }
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    Select Examination
                  </option>

                  {filteredExaminations.map(
                    (exam) => (
                      <option
                        key={exam.id}
                        value={exam.id}
                      >
                        {exam.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* ==================================================
              STUDENT & SUBJECT
          ================================================== */}

          <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10">
            <h2 className="text-lg font-semibold">
              Student & Subject
            </h2>

            <p className="text-sm opacity-60 mt-1">
              Select the student and examination subject.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

              {/* STUDENT */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Student
                </label>

                <select
                  name="student"
                  value={form.student}
                  onChange={handleChange}
                  disabled={
                    !examinationFilter
                  }
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">
                    {!examinationFilter
                      ? "Select examination first"
                      : "Select Student"}
                  </option>

                  {filteredStudents.map(
                    (student) => (
                      <option
                        key={student.id}
                        value={student.id}
                      >
                        {getStudentName(
                          student
                        )}

                        {student.admission_number
                          ? ` — ${student.admission_number}`
                          : ""}
                      </option>
                    )
                  )}
                </select>

                {examinationFilter &&
                  filteredStudents.length ===
                    0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      No students were returned for this examination class.
                    </p>
                  )}
              </div>

              {/* SUBJECT */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Examination Subject
                </label>

                <select
                  name="examination_subject"
                  value={
                    form.examination_subject
                  }
                  onChange={handleChange}
                  disabled={
                    !examinationFilter
                  }
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">
                    {!examinationFilter
                      ? "Select examination first"
                      : "Select Subject"}
                  </option>

                  {filteredSubjects.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.subject_name ||
                          item.subject?.name ||
                          item.subject ||
                          `Subject ${item.id}`}
                      </option>
                    )
                  )}
                </select>

                {examinationFilter &&
                  filteredSubjects.length ===
                    0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      No subjects have been added to this examination.
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* ==================================================
              SCORES
          ================================================== */}

          <div className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold">
              Scores
            </h2>

            <p className="text-sm opacity-60 mt-1">
              Update the CA and examination scores.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

              {/* CA */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  CA Score
                </label>

                <input
                  type="number"
                  name="ca_score"
                  min="0"
                  step="0.01"
                  value={formatScore(
                    form.ca_score
                  )}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                />

                <p className="text-xs opacity-50 mt-2">
                  Enter 0 if there is no CA score.
                </p>
              </div>

              {/* EXAM */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Examination Score
                </label>

                <input
                  type="number"
                  name="exam_score"
                  min="0"
                  step="0.01"
                  value={formatScore(
                    form.exam_score
                  )}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                />

                <p className="text-xs opacity-50 mt-2">
                  Enter 0 if there is no examination score.
                </p>
              </div>
            </div>

            {/* ==================================================
                SCORE PREVIEW
            ================================================== */}

            {selectedSubject && (
              <div className="mt-5 rounded-xl bg-background border border-black/5 dark:border-white/10 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div>
                    <p className="text-sm font-medium">
                      Score Preview
                    </p>

                    <p className="text-xs opacity-60 mt-1">
                      Maximum score:{" "}
                      {maximumScore ??
                        "—"}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold text-primary">
                      {combinedScore.toFixed(
                        2
                      )}
                    </p>

                    <p className="text-xs opacity-60">
                      Combined Score
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `${RESULTS_ROUTE}/${id}`
                  )
                }
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-background transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Result
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}