import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  GraduationCap,
  Loader2,
  Save,
  User,
} from "lucide-react";

import {
  getStudentResult,
  updateStudentResult,
} from "../../../services/resultsService";

import api from "../../../services/api";

// ============================================================
// HELPERS
// ============================================================

const formatNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);
};

const getStudentName = (result, student) => {
  return (
    result?.student_name ||
    result?.student_full_name ||
    result?.student?.name ||
    student?.full_name ||
    student?.name ||
    [student?.first_name, student?.last_name]
      .filter(Boolean)
      .join(" ") ||
    "Student"
  );
};

const getAdmissionNumber = (result, student) => {
  return (
    result?.student_admission_number ||
    result?.admission_number ||
    student?.admission_number ||
    student?.student_admission_number ||
    "—"
  );
};

const getSessionName = (result, examination) => {
  return (
    examination?.academic_session_name ||
    examination?.session_name ||
    result?.academic_session_name ||
    result?.session_name ||
    result?.academic_session_display ||
    "—"
  );
};

const getTermName = (result, examination) => {
  return (
    examination?.term_name ||
    examination?.term_display ||
    result?.term_name ||
    result?.term_display ||
    "—"
  );
};

const getClassName = (result, examination) => {
  return (
    examination?.class_level_name ||
    examination?.class_name ||
    examination?.class_level_display ||
    result?.class_level_name ||
    result?.class_name ||
    result?.class_level_display ||
    "—"
  );
};

const getExaminationName = (result, examination) => {
  return (
    result?.examination_name ||
    examination?.name ||
    "—"
  );
};

const getSubjectName = (result, examinationSubject) => {
  return (
    result?.subject_name ||
    examinationSubject?.subject_name ||
    examinationSubject?.subject?.name ||
    examinationSubject?.subject_title ||
    "—"
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function EditResult() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ----------------------------------------------------------
  // DATA STATE
  // ----------------------------------------------------------

  const [result, setResult] = useState(null);
  const [student, setStudent] = useState(null);
  const [examination, setExamination] = useState(null);
  const [examinationSubject, setExaminationSubject] =
    useState(null);

  // ----------------------------------------------------------
  // FORM STATE
  // ----------------------------------------------------------

  const [caScore, setCaScore] = useState("");
  const [examScore, setExamScore] = useState("");

  // ----------------------------------------------------------
  // UI STATE
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // LOAD RESULT
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      setLoading(true);
      setError("");

      try {
        // ----------------------------------------------------
        // Load result
        // ----------------------------------------------------

        const data = await getStudentResult(id);

        if (!mounted) return;

        setResult(data);

        setCaScore(
          data?.ca_score !== null &&
            data?.ca_score !== undefined
            ? String(data.ca_score)
            : "0"
        );

        setExamScore(
          data?.exam_score !== null &&
            data?.exam_score !== undefined
            ? String(data.exam_score)
            : "0"
        );

        // ----------------------------------------------------
        // Load student
        //
        // ID is used internally only.
        // It is never displayed.
        // ----------------------------------------------------

        if (data?.student) {
          try {
            const studentResponse = await api.get(
              `/students/${data.student}/`
            );

            if (mounted) {
              setStudent(studentResponse.data);
            }
          } catch (studentError) {
            console.warn(
              "Could not load student details:",
              studentError
            );
          }
        }

        // ----------------------------------------------------
        // Load examination subject
        // ----------------------------------------------------

        if (data?.examination_subject) {
          try {
            const subjectResponse = await api.get(
              `/examinations/subjects/${data.examination_subject}/`
            );

            if (!mounted) return;

            const subjectData = subjectResponse.data;

            setExaminationSubject(subjectData);

            // ------------------------------------------------
            // Load examination
            // ------------------------------------------------

            if (subjectData?.examination) {
              try {
                const examinationResponse = await api.get(
                  `/examinations/${subjectData.examination}/`
                );

                if (mounted) {
                  setExamination(
                    examinationResponse.data
                  );
                }
              } catch (examinationError) {
                console.warn(
                  "Could not load examination details:",
                  examinationError
                );
              }
            }
          } catch (subjectError) {
            console.warn(
              "Could not load examination subject details:",
              subjectError
            );
          }
        }
      } catch (err) {
        console.error(
          "Failed to load result:",
          err
        );

        if (!mounted) return;

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.error ||
            "Failed to load this result."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadResult();
    } else {
      setError("No result was provided.");
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // ==========================================================
  // DERIVED INFORMATION
  // ==========================================================

  const studentName = useMemo(
    () => getStudentName(result, student),
    [result, student]
  );

  const admissionNumber = useMemo(
    () => getAdmissionNumber(result, student),
    [result, student]
  );

  const examinationName = useMemo(
    () => getExaminationName(result, examination),
    [result, examination]
  );

  const subjectName = useMemo(
    () =>
      getSubjectName(
        result,
        examinationSubject
      ),
    [result, examinationSubject]
  );

  const academicSessionName = useMemo(
    () =>
      getSessionName(
        result,
        examination
      ),
    [result, examination]
  );

  const termName = useMemo(
    () =>
      getTermName(
        result,
        examination
      ),
    [result, examination]
  );

  const className = useMemo(
    () =>
      getClassName(
        result,
        examination
      ),
    [result, examination]
  );

  const maximumScore = useMemo(() => {
    const value =
      examinationSubject?.maximum_score;

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 100;
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 100;
  }, [examinationSubject]);

  const currentTotal = useMemo(() => {
    const ca = Number(caScore || 0);
    const exam = Number(examScore || 0);

    return ca + exam;
  }, [caScore, examScore]);

  // ==========================================================
  // INPUT VALIDATION
  // ==========================================================

  const validateScores = () => {
    const ca = Number(caScore);
    const exam = Number(examScore);

    if (caScore === "" || examScore === "") {
      return "Please enter both CA and examination scores.";
    }

    if (!Number.isFinite(ca) || !Number.isFinite(exam)) {
      return "Scores must be valid numbers.";
    }

    if (ca < 0 || exam < 0) {
      return "Scores cannot be negative.";
    }

    if (ca + exam > maximumScore) {
      return `The combined score cannot be greater than ${formatNumber(
        maximumScore
      )}.`;
    }

    return "";
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateScores();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const updatedResult =
        await updateStudentResult(result.id, {
          ca_score: Number(caScore),
          exam_score: Number(examScore),
        });

      setResult(updatedResult);

      setCaScore(
        updatedResult?.ca_score !== null &&
          updatedResult?.ca_score !== undefined
          ? String(updatedResult.ca_score)
          : "0"
      );

      setExamScore(
        updatedResult?.exam_score !== null &&
          updatedResult?.exam_score !== undefined
          ? String(updatedResult.exam_score)
          : "0"
      );

      setSuccess(
        "Result updated successfully."
      );

      // ------------------------------------------------------
      // Give the user a moment to see the success message.
      // ------------------------------------------------------

      setTimeout(() => {
        navigate(
          `/school-admin/examinations-results/results/${result.id}`,
          {
            replace: true,
          }
        );
      }, 700);
    } catch (err) {
      console.error(
        "Failed to update result:",
        err
      );

      const backendError =
        err?.response?.data;

      if (
        backendError &&
        typeof backendError === "object"
      ) {
        const messages = [];

        Object.entries(backendError).forEach(
          ([field, value]) => {
            if (Array.isArray(value)) {
              value.forEach((message) => {
                messages.push(
                  `${formatFieldName(field)}: ${message}`
                );
              });
            } else if (
              typeof value === "string"
            ) {
              messages.push(
                `${formatFieldName(field)}: ${value}`
              );
            }
          }
        );

        if (messages.length > 0) {
          setError(messages.join(" "));
        } else {
          setError(
            "Failed to update this result."
          );
        }
      } else {
        setError(
          err?.message ||
            "Failed to update this result."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel = () => {
    navigate(
      `/school-admin/examinations-results/results/${id}`
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-background text-text flex items-center justify-center">
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
  // ERROR WITHOUT RESULT
  // ==========================================================

  if (error && !result) {
    return (
      <div className="min-h-screen bg-background text-text p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/examinations-results/results"
              )
            }
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </button>

          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-6">
            <div className="flex items-start gap-3">

              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />

              <div>
                <h2 className="font-semibold text-red-700 dark:text-red-300">
                  Unable to load result
                </h2>

                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Result
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold">
              Edit Result
            </h1>

            <p className="text-sm opacity-70 mt-1">
              Update the student's examination scores.
            </p>
          </div>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-300">

            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

            <div>
              <p className="font-semibold">
                Unable to save result
              </p>

              <p className="text-sm mt-1">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 p-4 text-green-700 dark:text-green-300">

            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />

            <div>
              <p className="font-semibold">
                Success
              </p>

              <p className="text-sm mt-1">
                {success}
              </p>
            </div>

          </div>
        )}

        {/* ==================================================
            STUDENT INFORMATION
        ================================================== */}

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">

          <div className="p-5 border-b border-black/5 dark:border-white/10">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Student Information
                </h2>

                <p className="text-sm opacity-60">
                  Student associated with this result.
                </p>
              </div>

            </div>

          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

            <InfoItem
              label="Student"
              value={studentName}
            />

            <InfoItem
              label="Admission Number"
              value={admissionNumber}
            />

          </div>

        </div>

        {/* ==================================================
            EXAMINATION INFORMATION
        ================================================== */}

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">

          <div className="p-5 border-b border-black/5 dark:border-white/10">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-secondary" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Examination Information
                </h2>

                <p className="text-sm opacity-60">
                  These details cannot be changed while editing this result.
                </p>
              </div>

            </div>

          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <InfoItem
              icon={BookOpen}
              label="Examination"
              value={examinationName}
            />

            <InfoItem
              icon={GraduationCap}
              label="Subject"
              value={subjectName}
            />

            <InfoItem
              icon={CalendarDays}
              label="Academic Session"
              value={academicSessionName}
            />

            <InfoItem
              label="Term"
              value={termName}
            />

            <InfoItem
              label="Class"
              value={className}
            />

          </div>

        </div>

        {/* ==================================================
            SCORE FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden"
        >

          <div className="p-5 border-b border-black/5 dark:border-white/10">

            <h2 className="text-lg font-semibold">
              Edit Scores
            </h2>

            <p className="text-sm opacity-60 mt-1">
              Enter the student's continuous assessment and examination scores.
            </p>

          </div>

          <div className="p-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* ==================================================
                  CA SCORE
              ================================================== */}

              <div>

                <label
                  htmlFor="ca_score"
                  className="block text-sm font-medium mb-2"
                >
                  CA Score
                </label>

                <input
                  id="ca_score"
                  name="ca_score"
                  type="number"
                  min="0"
                  step="0.01"
                  value={caScore}
                  onChange={(event) =>
                    setCaScore(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-background text-text px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
                  placeholder="Enter CA score"
                />

                <p className="text-xs opacity-50 mt-2">
                  Enter the continuous assessment score.
                </p>

              </div>

              {/* ==================================================
                  EXAMINATION SCORE
              ================================================== */}

              <div>

                <label
                  htmlFor="exam_score"
                  className="block text-sm font-medium mb-2"
                >
                  Examination Score
                </label>

                <input
                  id="exam_score"
                  name="exam_score"
                  type="number"
                  min="0"
                  step="0.01"
                  value={examScore}
                  onChange={(event) =>
                    setExamScore(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-background text-text px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
                  placeholder="Enter examination score"
                />

                <p className="text-xs opacity-50 mt-2">
                  Enter the examination score.
                </p>

              </div>

            </div>

            {/* ==================================================
                SCORE SUMMARY
            ================================================== */}

            <div className="mt-6 rounded-xl border border-black/5 dark:border-white/10 bg-background p-5">

              <div className="flex items-center justify-between gap-4 mb-4">

                <div>
                  <p className="text-sm font-semibold">
                    Score Summary
                  </p>

                  <p className="text-xs opacity-50 mt-1">
                    Maximum total score:{" "}
                    {formatNumber(maximumScore)}
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <ScorePreview
                  label="CA Score"
                  value={formatNumber(caScore)}
                />

                <ScorePreview
                  label="Examination Score"
                  value={formatNumber(examScore)}
                />

                <ScorePreview
                  label="Total Score"
                  value={formatNumber(currentTotal)}
                  highlighted
                />

              </div>

            </div>

            {/* ==================================================
                BACKEND CALCULATION NOTICE
            ================================================== */}

            <div className="mt-5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 p-4">

              <div className="flex items-start gap-3">

                <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />

                <div>

                  <p className="font-semibold text-blue-700 dark:text-blue-300">
                    Automatic grading
                  </p>

                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    After saving, the system will automatically
                    calculate the total score, grade, remark,
                    grade point, and update the student's report
                    card.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="p-5 border-t border-black/5 dark:border-white/10 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-background transition disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div>

      <div className="flex items-center gap-2">

        {Icon && (
          <Icon className="w-4 h-4 opacity-50" />
        )}

        <p className="text-xs uppercase tracking-wide opacity-50">
          {label}
        </p>

      </div>

      <p className="font-medium mt-1 break-words">
        {value}
      </p>

    </div>
  );
}

// ============================================================
// SCORE PREVIEW
// ============================================================

function ScorePreview({
  label,
  value,
  highlighted = false,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlighted
          ? "border-primary/30 bg-primary/5"
          : "border-black/5 dark:border-white/10"
      }`}
    >

      <p className="text-sm opacity-60">
        {label}
      </p>

      <p
        className={`text-2xl font-bold mt-2 ${
          highlighted
            ? "text-primary"
            : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
}

// ============================================================
// BACKEND FIELD NAME FORMATTER
// ============================================================

function formatFieldName(field) {
  const names = {
    ca_score: "CA Score",
    exam_score: "Examination Score",
    student: "Student",
    examination_subject: "Examination Subject",
    non_field_errors: "Error",
    detail: "Error",
  };

  return (
    names[field] ||
    field
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  );
}