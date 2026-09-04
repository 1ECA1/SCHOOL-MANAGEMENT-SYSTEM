import { useState, useEffect, useCallback } from "react";
import * as academicsService from "../../../services/academicsService";
import * as studentsService from "../../../services/studentsService";
import * as attendanceService from "../../../services/attendanceService";

const STATUS_OPTIONS = [
  {
    value: "PRESENT",
    label: "Present",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  {
    value: "ABSENT",
    label: "Absent",
    color: "bg-red-100 text-red-700 border-red-300",
  },
  {
    value: "LATE",
    label: "Late",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  {
    value: "EXCUSED",
    label: "Excused",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
];

function MarkAttendance() {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schoolId, setSchoolId] = useState(null);

  const [filters, setFilters] = useState({
    academic_session: "",
    term: "",
    class_level: "",
    subject: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [roster, setRoster] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [existingRecordsMap, setExistingRecordsMap] = useState({});

  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Load dropdown data + school id once
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [
          sessionsData,
          termsData,
          classLevelsData,
          subjectsData,
          schoolsData,
        ] = await Promise.all([
          academicsService.getSessions(),
          academicsService.getTerms(),
          academicsService.getClassLevels(),
          academicsService.getSubjects(),
          academicsService.getSchools(),
        ]);

        setSessions(sessionsData.results || sessionsData);
        setTerms(termsData.results || termsData);
        setClassLevels(classLevelsData.results || classLevelsData);
        setSubjects(subjectsData.results || subjectsData);

        const schoolsList = schoolsData.results || schoolsData;
        if (schoolsList.length > 0) {
          setSchoolId(schoolsList[0].id);
        }
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load academic data." });
      }
    }
    loadDropdowns();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setRoster([]);
    setMessage(null);
  };

  const loadRoster = useCallback(async () => {
    const { academic_session, term, class_level, date } = filters;
    if (!academic_session || !term || !class_level || !date) {
      setMessage({
        type: "error",
        text: "Select session, term, class, and date first.",
      });
      return;
    }

    setLoadingRoster(true);
    setMessage(null);
    try {
      const [enrollments, existingRecords] = await Promise.all([
        studentsService.getEnrollments({
          classLevel: class_level,
          academicSession: academic_session,
          term,
        }),
        attendanceService.getAttendanceRecords({
          classLevel: class_level,
          academicSession: academic_session,
          term,
          date,
          subject: filters.subject || undefined,
        }),
      ]);

      const rosterList = enrollments.results || enrollments;
      const recordsList = existingRecords.results || existingRecords;

      setRoster(rosterList);

      const initialStatus = {};
      const existingMap = {};
      rosterList.forEach((enr) => {
        const existing = recordsList.find((r) => r.student === enr.student);
        initialStatus[enr.student] = existing ? existing.status : "PRESENT";
        if (existing) existingMap[enr.student] = existing.id;
      });

      setStatusMap(initialStatus);
      setExistingRecordsMap(existingMap);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load class roster." });
    } finally {
      setLoadingRoster(false);
    }
  }, [filters]);

  const setStudentStatus = (studentId, status) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    roster.forEach((enr) => {
      updated[enr.student] = status;
    });
    setStatusMap(updated);
  };

  const handleSave = async () => {
    if (roster.length === 0) return;

    if (!schoolId) {
      setMessage({
        type: "error",
        text: "School not found. Cannot save attendance.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = roster.map((enr) => ({
      school: schoolId,
      student: enr.student,
      academic_session: filters.academic_session,
      term: filters.term,
      class_level: filters.class_level,
      subject: filters.subject || null,
      date: filters.date,
      status: statusMap[enr.student],
    }));

    try {
      await attendanceService.bulkMarkAttendance(payload, existingRecordsMap);
      setMessage({ type: "success", text: "Attendance saved successfully." });
      loadRoster();
    } catch (err) {
      setMessage({
        type: "error",
        text: "Failed to save attendance. Check required fields.",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700";
  const labelClass =
    "mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          Mark Attendance
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Select a class and date to record attendance.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className={labelClass}>Academic Session</label>
            <select
              name="academic_session"
              value={filters.academic_session}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">Select</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Term</label>
            <select
              name="term"
              value={filters.term}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">Select</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Class</label>
            <select
              name="class_level"
              value={filters.class_level}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">Select</option>
              {classLevels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Subject (optional)</label>
            <select
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className={inputClass}
            >
              <option value="">General</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={loadRoster}
          disabled={loadingRoster}
          className="mt-4 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:opacity-90 disabled:opacity-50"
        >
          {loadingRoster ? "Loading…" : "Load Roster"}
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-600 dark:bg-red-500/10"
              : "bg-green-50 text-green-600 dark:bg-green-500/10"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Roster */}
      {roster.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-800">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              {roster.length} student{roster.length !== 1 ? "s" : ""}
            </h3>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => markAll(opt.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${opt.color}`}
                >
                  Mark all {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {roster.map((enr) => (
              <div
                key={enr.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {enr.student_name || `Student #${enr.student}`}
                  </p>
                  {enr.roll_number && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Roll No: {enr.roll_number}
                    </p>
                  )}
                </div>

                <div className="flex gap-1.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStudentStatus(enr.student, opt.value)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        statusMap[enr.student] === opt.value
                          ? opt.color
                          : "border-slate-200 text-slate-400 hover:bg-slate-50 dark:border-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Attendance"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarkAttendance;
