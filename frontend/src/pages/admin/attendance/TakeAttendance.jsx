import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  getSessions,
  getTerms,
  getClassLevels,
  getSubjects,
} from "../../../services/academicsService";

import { getEnrollments } from "../../../services/studentsService";

import {
  getAttendance,
  createAttendance,
  updateAttendance,
} from "../../../services/attendanceService";

// =====================================================
// HELPERS
// =====================================================

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

// =====================================================
// COMPONENT
// =====================================================

function TakeAttendance() {
  const [searchParams] = useSearchParams();

  // Values passed from Subject Details
  const presetSession = searchParams.get("academic_session") || "";
  const presetTerm = searchParams.get("term") || "";
  const presetClass = searchParams.get("class_level") || "";
  const presetSubject = searchParams.get("subject") || "";
  const presetDate = searchParams.get("date") || "";

  const fromSubjectDetails =
    Boolean(presetClass && presetSubject);

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [students, setStudents] = useState([]);
  const [existingAttendance, setExistingAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    academic_session: presetSession,
    term: presetTerm,
    class_level: presetClass,
    subject: presetSubject,
    date: presetDate || getToday(),
  });

  const [attendance, setAttendance] = useState({});

  // =====================================================
  // LOAD ACADEMIC DATA
  // =====================================================

  useEffect(() => {
    const loadAcademicData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          sessionsData,
          termsData,
          classesData,
          subjectsData,
        ] = await Promise.all([
          getSessions(),
          getTerms(),
          getClassLevels(),
          getSubjects(),
        ]);

        setSessions(normalizeList(sessionsData));
        setTerms(normalizeList(termsData));
        setClassLevels(normalizeList(classesData));
        setSubjects(normalizeList(subjectsData));
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.detail ||
            "Failed to load academic information.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAcademicData();
  }, []);

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  useEffect(() => {
    const loadStudents = async () => {
      if (
        !form.class_level ||
        !form.academic_session ||
        !form.term
      ) {
        setStudents([]);
        setAttendance({});
        setExistingAttendance([]);
        return;
      }

      try {
        setLoadingStudents(true);
        setError("");
        setSuccess("");

        const enrollmentData = await getEnrollments({
          classLevel: form.class_level,
          academicSession: form.academic_session,
          term: form.term,
        });

        const enrollments = normalizeList(
          enrollmentData,
        );

        let studentList = enrollments
          .map((enrollment) => {
            if (
              enrollment.student &&
              typeof enrollment.student === "object"
            ) {
              return enrollment.student;
            }

            return {
              id: enrollment.student,
              full_name:
                enrollment.student_name ||
                "Unknown Student",
              admission_number:
                enrollment.admission_number ||
                enrollment.student_admission_number ||
                "",
            };
          })
          .filter(
            (student, index, array) =>
              student?.id &&
              array.findIndex(
                (item) =>
                  item.id === student.id,
              ) === index,
          );

        // =================================================
        // SUBJECT-SPECIFIC ROSTER
        //
        // When opened from Subject Details, only students
        // taking that subject should appear.
        //
        // We obtain the subject roster from the existing
        // ClassSubject data through the class-level endpoint
        // only if the enrollment response doesn't already
        // provide the required information.
        // =================================================

        if (form.subject) {
          const subjectId = Number(form.subject);

          /*
           * Some enrollment responses may already contain
           * subject information. If they do, respect it.
           */
          const hasSubjectInformation = enrollments.some(
            (enrollment) =>
              enrollment.subjects ||
              enrollment.subject_enrollments ||
              enrollment.student_subjects,
          );

          if (hasSubjectInformation) {
            studentList = studentList.filter(
              (student) => {
                const enrollment =
                  enrollments.find(
                    (item) =>
                      String(
                        item.student?.id ??
                          item.student,
                      ) ===
                      String(student.id),
                  );

                const subjects =
                  enrollment?.subjects ||
                  enrollment?.subject_enrollments ||
                  enrollment?.student_subjects ||
                  [];

                return subjects.some(
                  (item) =>
                    Number(
                      item.subject ??
                        item.subject_id,
                    ) === subjectId,
                );
              },
            );
          }
        }

        setStudents(studentList);

        const initialAttendance = {};

        studentList.forEach((student) => {
          initialAttendance[student.id] =
            "PRESENT";
        });

        setAttendance(initialAttendance);

        // =================================================
        // LOAD EXISTING ATTENDANCE
        // =================================================

        if (form.date) {
          const existingData =
            await getAttendance({
              class_level:
                form.class_level,
              academic_session:
                form.academic_session,
              term: form.term,
              date: form.date,
              ...(form.subject
                ? {
                    subject: form.subject,
                  }
                : {}),
            });

          const records =
            normalizeList(existingData);

          setExistingAttendance(records);

          records.forEach((record) => {
            if (record.student) {
              initialAttendance[
                record.student
              ] = record.status;
            }
          });

          setAttendance({
            ...initialAttendance,
          });
        } else {
          setExistingAttendance([]);
        }
      } catch (err) {
        console.error(err);

        setStudents([]);
        setAttendance({});
        setExistingAttendance([]);

        setError(
          err?.response?.data?.detail ||
            "Failed to load students.",
        );
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [
    form.class_level,
    form.academic_session,
    form.term,
    form.date,
    form.subject,
  ]);

  // =====================================================
  // STATUS COUNTS
  // =====================================================

  const statusCounts = useMemo(() => {
    return {
      present: Object.values(
        attendance,
      ).filter(
        (status) => status === "PRESENT",
      ).length,

      absent: Object.values(
        attendance,
      ).filter(
        (status) => status === "ABSENT",
      ).length,

      late: Object.values(
        attendance,
      ).filter(
        (status) => status === "LATE",
      ).length,

      excused: Object.values(
        attendance,
      ).filter(
        (status) => status === "EXCUSED",
      ).length,
    };
  }, [attendance]);

  // =====================================================
  // CHANGE STUDENT STATUS
  // =====================================================

  const handleStatusChange = (
    studentId,
    status,
  ) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // MARK ALL
  // =====================================================

  const markAll = (status) => {
    const updated = {};

    students.forEach((student) => {
      updated[student.id] = status;
    });

    setAttendance(updated);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // SAVE ATTENDANCE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.academic_session) {
      setError(
        "Please select an academic session.",
      );
      return;
    }

    if (!form.term) {
      setError("Please select a term.");
      return;
    }

    if (!form.class_level) {
      setError("Please select a class.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    if (!students.length) {
      setError(
        "There are no students in the selected class.",
      );
      return;
    }

    try {
      setSaving(true);

      const existingByStudent = {};

      existingAttendance.forEach((record) => {
        if (record.student) {
          existingByStudent[
            record.student
          ] = record;
        }
      });

      const saveRequests = students.map(
        async (student) => {
          const payload = {
            student: student.id,
            academic_session: Number(
              form.academic_session,
            ),
            term: Number(form.term),
            class_level: Number(
              form.class_level,
            ),
            date: form.date,
            status:
              attendance[student.id] ||
              "PRESENT",
          };

          if (form.subject) {
            payload.subject = Number(
              form.subject,
            );
          }

          const existing =
            existingByStudent[
              student.id
            ];

          if (existing) {
            return updateAttendance(
              existing.id,
              payload,
            );
          }

          return createAttendance(payload);
        },
      );

      await Promise.all(saveRequests);

      setSuccess(
        "Attendance saved successfully.",
      );

      // =================================================
      // REFRESH ATTENDANCE
      // =================================================

      const refreshedData =
        await getAttendance({
          class_level: form.class_level,
          academic_session:
            form.academic_session,
          term: form.term,
          date: form.date,
          ...(form.subject
            ? {
                subject: form.subject,
              }
            : {}),
        });

      setExistingAttendance(
        normalizeList(refreshedData),
      );
    } catch (err) {
      console.error(
        "ATTENDANCE ERROR:",
        err,
      );

      console.error(
        "SERVER RESPONSE:",
        err?.response?.data,
      );

      const responseData =
        err?.response?.data;

      if (
        typeof responseData ===
        "object"
      ) {
        const firstError =
          Object.values(
            responseData,
          )?.[0];

        if (
          Array.isArray(firstError)
        ) {
          setError(firstError[0]);
        } else if (
          typeof firstError ===
          "string"
        ) {
          setError(firstError);
        } else {
          setError(
            "Failed to save attendance. Please check the browser console.",
          );
        }
      } else {
        setError(
          responseData ||
            "Failed to save attendance.",
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-[var(--color-text-muted)]">
          Loading attendance...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6 p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Take Attendance
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {fromSubjectDetails
                ? "Mark attendance for this subject class."
                : "Mark daily attendance for students in a class."}
            </p>
          </div>

          {fromSubjectDetails && (
            <span className="w-fit rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
              Subject Attendance
            </span>
          )}
        </div>
      </div>

      {/* =================================================
          MESSAGES
      ================================================= */}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-300">
          {success}
        </div>
      )}

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Attendance Details
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Select the academic period and class.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* SESSION */}

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
              Academic Session *
            </label>

            <select
              name="academic_session"
              value={
                form.academic_session
              }
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">
                Select session
              </option>

              {sessions.map(
                (session) => (
                  <option
                    key={session.id}
                    value={session.id}
                  >
                    {session.name}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* TERM */}

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
              Term *
            </label>

            <select
              name="term"
              value={form.term}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
            <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
              Class *
            </label>

            <select
              name="class_level"
              value={form.class_level}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">
                Select class
              </option>

              {classLevels.map(
                (classLevel) => (
                  <option
                    key={classLevel.id}
                    value={classLevel.id}
                  >
                    {classLevel.name}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* SUBJECT */}

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
              Subject
            </label>

            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">
                General Attendance
              </option>

              {subjects.map(
                (subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.name}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* DATE */}

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
              Date *
            </label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* =================================================
          ATTENDANCE AREA
      ================================================= */}

      {loadingStudents ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-10 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Loading students...
          </p>
        </div>
      ) : !form.class_level ||
        !form.academic_session ||
        !form.term ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-10 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Select session, term and class to load students.
          </p>
        </div>
      ) : !students.length ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-10 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            No students found in this class.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* SUMMARY */}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Present", statusCounts.present],
              ["Absent", statusCounts.absent],
              ["Late", statusCounts.late],
              ["Excused", statusCounts.excused],
            ].map(
              ([label, count]) => (
                <div
                  key={label}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
                >
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {label}
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                    {count}
                  </p>
                </div>
              ),
            )}
          </div>

          {/* MARK ALL */}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <div>
              <h2 className="font-semibold text-[var(--color-text)]">
                Students
              </h2>

              <p className="text-sm text-[var(--color-text-muted)]">
                {students.length} student
                {students.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  markAll("PRESENT")
                }
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background)]"
              >
                Mark All Present
              </button>

              <button
                type="button"
                onClick={() =>
                  markAll("ABSENT")
                }
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background)]"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* STUDENT TABLE */}

          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                    <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                      #
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                      Student
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                      Admission No.
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map(
                    (student, index) => {
                      const currentStatus =
                        attendance[
                          student.id
                        ] ||
                        "PRESENT";

                      return (
                        <tr
                          key={student.id}
                          className="border-b border-[var(--color-border)] last:border-b-0"
                        >
                          <td className="px-4 py-4 text-[var(--color-text-muted)]">
                            {index + 1}
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-medium text-[var(--color-text)]">
                              {student.full_name ||
                                `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
                                "Unknown Student"}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-[var(--color-text-muted)]">
                            {student.admission_number ||
                              "—"}
                          </td>

                          <td className="px-4 py-4">
                            <select
                              value={
                                currentStatus
                              }
                              onChange={(
                                event,
                              ) =>
                                handleStatusChange(
                                  student.id,
                                  event
                                    .target
                                    .value,
                                )
                              }
                              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm font-medium text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            >
                              <option value="PRESENT">
                                Present
                              </option>

                              <option value="ABSENT">
                                Absent
                              </option>

                              <option value="LATE">
                                Late
                              </option>

                              <option value="EXCUSED">
                                Excused
                              </option>
                            </select>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SAVE */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Attendance..."
                : existingAttendance.length
                  ? "Update Attendance"
                  : "Save Attendance"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TakeAttendance;