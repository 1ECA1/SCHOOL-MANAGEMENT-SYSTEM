import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  MapPin,
  Save,
} from "lucide-react";

import {
  getClassSubjects,
} from "../../../services/academicsService";

import {
  getExamination,
  getExaminationSubjects,
  createExaminationSubject,
} from "../../../services/examinationsService";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

// ============================================================
// GET CLASS LEVEL ID FROM CLASS SUBJECT
// ============================================================

const getClassLevelId = (classSubject) => {
  if (!classSubject) {
    return null;
  }

  if (classSubject.class_level !== undefined) {
    return Number(classSubject.class_level);
  }

  if (classSubject.class_level_id !== undefined) {
    return Number(classSubject.class_level_id);
  }

  if (classSubject.classLevel !== undefined) {
    if (typeof classSubject.classLevel === "object") {
      return Number(
        classSubject.classLevel?.id
      );
    }

    return Number(classSubject.classLevel);
  }

  return null;
};

// ============================================================
// GET SUBJECT ID FROM CLASS SUBJECT
// ============================================================

const getSubjectId = (classSubject) => {
  if (!classSubject) {
    return null;
  }

  if (classSubject.subject !== undefined) {
    if (typeof classSubject.subject === "object") {
      return Number(classSubject.subject?.id);
    }

    return Number(classSubject.subject);
  }

  if (classSubject.subject_id !== undefined) {
    return Number(classSubject.subject_id);
  }

  return null;
};

// ============================================================
// GET SUBJECT NAME
// ============================================================

const getSubjectName = (classSubject) => {
  if (!classSubject) {
    return "Unknown Subject";
  }

  // Direct serializer field
  if (classSubject.subject_name) {
    return classSubject.subject_name;
  }

  if (classSubject.subject_title) {
    return classSubject.subject_title;
  }

  if (classSubject.name) {
    return classSubject.name;
  }

  // Nested subject object
  if (
    classSubject.subject &&
    typeof classSubject.subject === "object"
  ) {
    return (
      classSubject.subject.name ||
      classSubject.subject.subject_name ||
      classSubject.subject.title ||
      `Subject #${classSubject.subject.id}`
    );
  }

  return `Subject #${getSubjectId(classSubject)}`;
};

// ============================================================
// GET SUBJECT CODE
// ============================================================

const getSubjectCode = (classSubject) => {
  if (!classSubject) {
    return "";
  }

  if (classSubject.subject_code) {
    return classSubject.subject_code;
  }

  if (classSubject.code) {
    return classSubject.code;
  }

  if (
    classSubject.subject &&
    typeof classSubject.subject === "object"
  ) {
    return (
      classSubject.subject.code ||
      classSubject.subject.subject_code ||
      ""
    );
  }

  return "";
};

// ============================================================
// COMPONENT
// ============================================================

export default function AddExamSubject() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ==========================================================
  // STATE
  // ==========================================================

  const [exam, setExam] = useState(null);

  // All class-subject records
  const [classSubjects, setClassSubjects] = useState([]);

  // Existing examination subjects
  const [scheduledSubjects, setScheduledSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    subject: "",
    examination_date: "",
    start_time: "",
    end_time: "",
    maximum_score: "100",
    pass_mark: "40",
    venue: "",
  });

  // ==========================================================
  // LOAD EXAM + CLASS SUBJECTS + SCHEDULED SUBJECTS
  // ==========================================================

  const loadData = useCallback(async () => {
    if (!id) {
      setError("No examination ID was provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // --------------------------------------------------------
      // Load examination first because we need its class_level.
      // --------------------------------------------------------

      const examData = await getExamination(id);

      setExam(examData);

      // --------------------------------------------------------
      // Load:
      // 1. ClassSubject records
      // 2. Existing examination subjects
      // --------------------------------------------------------

      const [classSubjectsData, existingSubjectsData] =
        await Promise.all([
          getClassSubjects(),
          getExaminationSubjects(),
        ]);

      const allClassSubjects = getArray(
        classSubjectsData
      );

      const allScheduledSubjects = getArray(
        existingSubjectsData
      );

      setClassSubjects(allClassSubjects);
      setScheduledSubjects(allScheduledSubjects);

      // --------------------------------------------------------
      // Default examination date to examination start date.
      // --------------------------------------------------------

      if (examData?.start_date) {
        setForm((previous) => ({
          ...previous,
          examination_date: examData.start_date,
        }));
      }
    } catch (err) {
      console.error(
        "Failed to load Add Exam Subject:",
        err
      );

      const status = err?.response?.status;

      if (status === 401) {
        setError(
          "Your session has expired. Please log in again and return to this page."
        );
      } else if (status === 403) {
        setError(
          "You do not have permission to add subjects to this examination."
        );
      } else if (status === 404) {
        setError(
          "The examination could not be found."
        );
      } else {
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load examination information."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // AVAILABLE SUBJECTS
  //
  // IMPORTANT:
  //
  // Only subjects assigned to the examination's class are shown.
  //
  // Example:
  // Examination class = SS1 Arts
  //
  // ClassSubjects:
  //   SS1 Arts -> English
  //   SS1 Arts -> Mathematics
  //   SS1 Arts -> Literature
  //   SS1 Science -> Biology
  //   JSS1 -> Basic Science
  //
  // Only the SS1 Arts records are displayed.
  // ==========================================================

  const availableSubjects = useMemo(() => {
    if (!exam?.class_level) {
      return [];
    }

    const examClassId = Number(
      exam.class_level
    );

    // --------------------------------------------------------
    // Subjects already scheduled for THIS examination.
    // --------------------------------------------------------

    const alreadyScheduled = new Set(
      scheduledSubjects
        .filter(
          (item) =>
            Number(item?.examination) ===
            Number(exam.id)
        )
        .map((item) => {
          if (
            item?.subject &&
            typeof item.subject === "object"
          ) {
            return Number(item.subject.id);
          }

          return Number(item?.subject);
        })
        .filter((value) => !Number.isNaN(value))
    );

    // --------------------------------------------------------
    // Keep only ClassSubjects belonging to this class.
    // --------------------------------------------------------

    const matchingClassSubjects =
      classSubjects.filter((classSubject) => {
        const classId =
          getClassLevelId(classSubject);

        return (
          classId !== null &&
          Number(classId) === examClassId
        );
      });

    // --------------------------------------------------------
    // Remove subjects already scheduled.
    // --------------------------------------------------------

    const available = matchingClassSubjects
      .filter((classSubject) => {
        const subjectId =
          getSubjectId(classSubject);

        if (
          subjectId === null ||
          Number.isNaN(subjectId)
        ) {
          return false;
        }

        return !alreadyScheduled.has(
          Number(subjectId)
        );
      })
      .map((classSubject) => {
        const subjectId =
          getSubjectId(classSubject);

        return {
          ...classSubject,
          _subjectId: subjectId,
          _subjectName:
            getSubjectName(classSubject),
          _subjectCode:
            getSubjectCode(classSubject),
        };
      });

    // --------------------------------------------------------
    // Remove duplicate subject IDs.
    //
    // This protects the dropdown if the backend happens to
    // return duplicate ClassSubject records.
    // --------------------------------------------------------

    const uniqueSubjects = [];
    const seen = new Set();

    available.forEach((subject) => {
      const key = Number(subject._subjectId);

      if (!seen.has(key)) {
        seen.add(key);
        uniqueSubjects.push(subject);
      }
    });

    // --------------------------------------------------------
    // Sort alphabetically.
    // --------------------------------------------------------

    uniqueSubjects.sort((a, b) =>
      String(a._subjectName).localeCompare(
        String(b._subjectName)
      )
    );

    return uniqueSubjects;
  }, [
    exam,
    classSubjects,
    scheduledSubjects,
  ]);

  // ==========================================================
  // FORM HANDLER
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (!form.subject) {
      return "Please select a subject.";
    }

    // --------------------------------------------------------
    // Make sure selected subject actually belongs to the class.
    // --------------------------------------------------------

    const selectedSubject = availableSubjects.find(
      (item) =>
        Number(item._subjectId) ===
        Number(form.subject)
    );

    if (!selectedSubject) {
      return "The selected subject is not assigned to this examination class.";
    }

    if (!form.examination_date) {
      return "Please select the examination date.";
    }

    if (!form.start_time) {
      return "Please enter the start time.";
    }

    if (!form.end_time) {
      return "Please enter the end time.";
    }

    if (!form.maximum_score) {
      return "Please enter the maximum score.";
    }

    if (!form.pass_mark) {
      return "Please enter the pass mark.";
    }

    const maximumScore =
      Number(form.maximum_score);

    const passMark =
      Number(form.pass_mark);

    if (
      Number.isNaN(maximumScore) ||
      maximumScore <= 0
    ) {
      return "Maximum score must be greater than 0.";
    }

    if (
      Number.isNaN(passMark) ||
      passMark < 0
    ) {
      return "Pass mark cannot be negative.";
    }

    if (passMark > maximumScore) {
      return "Pass mark cannot be greater than the maximum score.";
    }

    if (
      form.end_time <=
      form.start_time
    ) {
      return "End time must be later than start time.";
    }

    if (
      exam?.start_date &&
      form.examination_date <
        exam.start_date
    ) {
      return `Examination date cannot be before ${formatDate(
        exam.start_date
      )}.`;
    }

    if (
      exam?.end_date &&
      form.examination_date >
        exam.end_date
    ) {
      return `Examination date cannot be after ${formatDate(
        exam.end_date
      )}.`;
    }

    return "";
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        examination: Number(id),
        subject: Number(form.subject),
        examination_date:
          form.examination_date,
        start_time: form.start_time,
        end_time: form.end_time,
        maximum_score:
          Number(form.maximum_score),
        pass_mark:
          Number(form.pass_mark),
        venue: form.venue.trim(),
      };

      const createdSubject =
        await createExaminationSubject(
          payload
        );

      setSuccess(
        "Subject scheduled successfully."
      );

      const createdId =
        createdSubject?.id;

      if (createdId) {
        navigate(
          `/school-admin/examinations-results/exams/${id}`,
          {
            state: {
              subjectCreated: true,
            },
          }
        );
      } else {
        navigate(
          `/school-admin/examinations-results/exams/${id}`
        );
      }
    } catch (err) {
      console.error(
        "Failed to create examination subject:",
        err
      );

      const responseData =
        err?.response?.data;

      let message =
        responseData?.detail ||
        responseData?.message ||
        "Failed to schedule the subject.";

      // --------------------------------------------------------
      // Django REST Framework validation errors
      // --------------------------------------------------------

      if (
        responseData &&
        typeof responseData === "object" &&
        !responseData.detail &&
        !responseData.message
      ) {
        const validationMessages =
          Object.entries(responseData).flatMap(
            ([field, messages]) => {
              const list =
                Array.isArray(messages)
                  ? messages
                  : [messages];

              return list.map(
                (item) =>
                  `${field}: ${
                    typeof item === "string"
                      ? item
                      : JSON.stringify(item)
                  }`
              );
            }
          );

        if (
          validationMessages.length > 0
        ) {
          message =
            validationMessages.join(" ");
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel = () => {
    navigate(
      `/school-admin/examinations-results/exams/${id}`
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />

            <p className="text-sm text-text/60">
              Loading examination information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR WITHOUT EXAM
  // ==========================================================

  if (!exam) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 text-text sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/examinations-results/exams"
              )
            }
            className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text/70 transition hover:bg-card hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </button>

          <div className="rounded-2xl border border-red-200 bg-card p-8 shadow-sm dark:border-red-900/40">
            <div className="mx-auto flex max-w-lg flex-col items-center text-center">
              <AlertCircle className="mb-4 h-10 w-10 text-red-500" />

              <h1 className="text-xl font-semibold">
                Unable to Load Examination
              </h1>

              <p className="mt-2 text-sm text-text/60">
                {error ||
                  "The examination could not be found."}
              </p>

              <button
                type="button"
                onClick={loadData}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-text/10 bg-card transition hover:bg-background"
              title="Back to examination"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Add Exam Subject
              </h1>

              <p className="mt-1 text-sm text-text/60">
                Schedule a subject for{" "}
                <span className="font-semibold text-text">
                  {exam.name}
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            EXAM SUMMARY
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-text/10 bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold">
                {exam.name}
              </h2>

              <p className="text-sm text-text/50">
                Examination details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem
              label="Academic Session"
              value={
                exam.academic_session_name ||
                `Session #${exam.academic_session}`
              }
            />

            <SummaryItem
              label="Term"
              value={
                exam.term_name ||
                `Term #${exam.term}`
              }
            />

            <SummaryItem
              label="Class"
              value={
                exam.class_level_name ||
                exam.class_name ||
                `Class #${exam.class_level}`
              }
            />

            <SummaryItem
              label="Exam Period"
              value={`${formatDate(
                exam.start_date
              )} – ${formatDate(
                exam.end_date
              )}`}
            />
          </div>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-text/10 bg-card shadow-sm">

            {/* Form Header */}

            <div className="border-b border-text/10 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                  <BookOpen className="h-5 w-5 text-secondary" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Subject Schedule
                  </h2>

                  <p className="text-sm text-text/50">
                    Select a subject assigned to this
                    examination class and enter its schedule.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">

              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="font-semibold">
                      Unable to save
                    </p>

                    <p className="mt-1 opacity-90">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {success && (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="font-semibold">
                      Subject scheduled
                    </p>

                    <p className="mt-1 opacity-90">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  SUBJECT
              ================================================== */}

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold"
                >
                  Subject{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />

                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    disabled={
                      saving ||
                      availableSubjects.length === 0
                    }
                    className="w-full appearance-none rounded-lg border border-text/10 bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select subject for{" "}
                      {exam.class_level_name ||
                        exam.class_name ||
                        "this class"}
                    </option>

                    {availableSubjects.map(
                      (classSubject) => (
                        <option
                          key={
                            classSubject._subjectId
                          }
                          value={
                            classSubject._subjectId
                          }
                        >
                          {
                            classSubject._subjectName
                          }

                          {classSubject._subjectCode
                            ? ` (${classSubject._subjectCode})`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Subject information */}

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                    {exam.class_level_name ||
                      exam.class_name ||
                      `Class #${exam.class_level}`}
                  </span>

                  <span className="text-text/50">
                    Only subjects assigned to this class are
                    displayed.
                  </span>
                </div>

                {availableSubjects.length === 0 && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                    <p className="font-semibold">
                      No available subjects
                    </p>

                    <p className="mt-1">
                      There are no unscheduled subjects assigned
                      to{" "}
                      {exam.class_level_name ||
                        exam.class_name ||
                        "this class"}.
                    </p>

                    <p className="mt-1 text-xs opacity-80">
                      Check the Class Subjects section to make
                      sure subjects have been assigned to this
                      class.
                    </p>
                  </div>
                )}
              </div>

              {/* ==================================================
                  DATE
              ================================================== */}

              <div>
                <label
                  htmlFor="examination_date"
                  className="mb-2 block text-sm font-semibold"
                >
                  Examination Date{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />

                  <input
                    id="examination_date"
                    name="examination_date"
                    type="date"
                    value={
                      form.examination_date
                    }
                    min={
                      exam.start_date ||
                      undefined
                    }
                    max={
                      exam.end_date ||
                      undefined
                    }
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-lg border border-text/10 bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <p className="mt-1.5 text-xs text-text/50">
                  Must be between{" "}
                  {formatDate(
                    exam.start_date
                  )}{" "}
                  and{" "}
                  {formatDate(
                    exam.end_date
                  )}
                  .
                </p>
              </div>

              {/* ==================================================
                  TIME
              ================================================== */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="start_time"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Start Time{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />

                    <input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={form.start_time}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-text/10 bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="end_time"
                    className="mb-2 block text-sm font-semibold"
                  >
                    End Time{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />

                    <input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={form.end_time}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-text/10 bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {/* ==================================================
                  VENUE
              ================================================== */}

              <div>
                <label
                  htmlFor="venue"
                  className="mb-2 block text-sm font-semibold"
                >
                  Venue
                </label>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />

                  <input
                    id="venue"
                    name="venue"
                    type="text"
                    value={form.venue}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="e.g. Hall A, Room 12, CBT Centre"
                    className="w-full rounded-lg border border-text/10 bg-background py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-text/30 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <p className="mt-1.5 text-xs text-text/50">
                  Enter the physical examination venue or CBT
                  centre.
                </p>
              </div>

              {/* ==================================================
                  SCORING
              ================================================== */}

              <div className="border-t border-text/10 pt-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold">
                    Scoring
                  </h3>

                  <p className="mt-1 text-xs text-text/50">
                    Define the maximum score and pass mark for
                    this subject.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="maximum_score"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Maximum Score{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />

                      <input
                        id="maximum_score"
                        name="maximum_score"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={
                          form.maximum_score
                        }
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full rounded-lg border border-text/10 bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="pass_mark"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Pass Mark{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <CheckCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />

                      <input
                        id="pass_mark"
                        name="pass_mark"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.pass_mark}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full rounded-lg border border-text/10 bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-text/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-text/10 bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  availableSubjects.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Schedule Subject
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

// ============================================================
// SUMMARY ITEM
// ============================================================

function SummaryItem({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-text/10 bg-background/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-text/50">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value || "—"}
      </p>
    </div>
  );
}