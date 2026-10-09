
import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle,
  GraduationCap,
  History,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

import {
  getGraduationEligibleStudents,
  graduateStudent,
  getGraduationHistory,
} from "../../../services/studentsService";

// ============================================================
// HELPERS
// ============================================================

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Something went wrong.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  const firstKey = Object.keys(data)[0];

  if (firstKey) {
    const value = data[firstKey];

    if (Array.isArray(value)) {
      return value[0];
    }

    if (typeof value === "string") {
      return value;
    }
  }

  return "Unable to complete the request.";
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ============================================================
// COMPONENT
// ============================================================

export default function Graduation() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [graduationHistory, setGraduationHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("eligible");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showGraduationModal, setShowGraduationModal] =
    useState(false);

  const [graduating, setGraduating] = useState(false);
  const [graduationYear, setGraduationYear] = useState("");
  const [remarks, setRemarks] = useState("");

  // ==========================================================
  // LOAD ELIGIBLE STUDENTS
  // ==========================================================

  const loadEligibleStudents = async ({ showRefresh = false } = {}) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getGraduationEligibleStudents();

      setEligibleStudents(normalizeList(data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================================
  // LOAD GRADUATION HISTORY
  // ==========================================================

  const loadGraduationHistory = async () => {
    try {
      setHistoryLoading(true);

      const data = await getGraduationHistory();

      setGraduationHistory(normalizeList(data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setHistoryLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadEligibleStudents();
    loadGraduationHistory();
  }, []);

  // ==========================================================
  // FILTER ELIGIBLE STUDENTS
  // ==========================================================

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return eligibleStudents;
    }

    return eligibleStudents.filter((student) => {
      return (
        student.full_name?.toLowerCase().includes(query) ||
        student.admission_number?.toLowerCase().includes(query) ||
        student.class_name?.toLowerCase().includes(query) ||
        student.academic_session_name?.toLowerCase().includes(query)
      );
    });
  }, [eligibleStudents, search]);

  // ==========================================================
  // OPEN GRADUATION MODAL
  // ==========================================================

  const openGraduationModal = (student) => {
    setSelectedStudent(student);

    // The backend uses the academic session end year
    // automatically when no graduation year is supplied.
    setGraduationYear("");
    setRemarks("");

    setError("");
    setSuccessMessage("");

    setShowGraduationModal(true);
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeGraduationModal = () => {
    if (graduating) {
      return;
    }

    setShowGraduationModal(false);
    setSelectedStudent(null);
    setGraduationYear("");
    setRemarks("");
  };

  // ==========================================================
  // GRADUATE STUDENT
  // ==========================================================

  const handleGraduate = async () => {
    if (!selectedStudent) {
      return;
    }

    try {
      setGraduating(true);
      setError("");
      setSuccessMessage("");

      const response = await graduateStudent({
        student: selectedStudent.id,
        graduation_year:
          graduationYear.trim() === ""
            ? undefined
            : graduationYear,
        remarks: remarks.trim(),
      });

      const message =
        response?.message ||
        `${selectedStudent.full_name} has been successfully graduated.`;

      setSuccessMessage(message);

      setShowGraduationModal(false);
      setSelectedStudent(null);
      setGraduationYear("");
      setRemarks("");

      // Refresh both lists after successful graduation.
      await Promise.all([
        loadEligibleStudents(),
        loadGraduationHistory(),
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGraduating(false);
    }
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    setSuccessMessage("");
    setError("");

    await Promise.all([
      loadEligibleStudents({ showRefresh: true }),
      loadGraduationHistory(),
    ]);
  };

  // ==========================================================
  // STATS
  // ==========================================================

  const eligibleCount = eligibleStudents.length;
  const graduatedCount = graduationHistory.length;

  const currentSessionNames = [
    ...new Set(
      eligibleStudents
        .map((student) => student.academic_session_name)
        .filter(Boolean)
    ),
  ];

  const currentSession =
    currentSessionNames.length === 1
      ? currentSessionNames[0]
      : currentSessionNames.length > 1
        ? "Multiple sessions"
        : "—";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap size={24} />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900">
                Graduation
              </h1>

              <p className="text-sm text-slate-500">
                Graduate students who have completed their final class.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* SUCCESS MESSAGE */}

        {successMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            <CheckCircle size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1 text-sm font-medium">
              {successMessage}
            </div>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss success message"
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1 text-sm font-medium">
              {error}
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error message"
              className="text-red-600 hover:text-red-800"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* STATS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Eligible students */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Eligible Students
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {eligibleCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Currently enrolled in graduating classes
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <UserCheck size={23} />
              </div>
            </div>
          </div>

          {/* Graduated students */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Graduation Records
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {graduatedCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Completed graduation records
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle size={23} />
              </div>
            </div>
          </div>

          {/* Session */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Eligible Session
                </p>

                <p className="mt-2 break-words text-xl font-bold text-slate-900">
                  {currentSession}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current graduating session
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ShieldCheck size={23} />
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}

        <div className="mb-5 overflow-x-auto border-b border-slate-200">
          <div className="flex min-w-max gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("eligible")}
              className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                activeTab === "eligible"
                  ? "text-indigo-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCheck size={17} />

              Eligible Students

              {eligibleCount > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                  {eligibleCount}
                </span>
              )}

              {activeTab === "eligible" && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-indigo-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                activeTab === "history"
                  ? "text-indigo-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <History size={17} />

              Graduation History

              {graduatedCount > 0 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {graduatedCount}
                </span>
              )}

              {activeTab === "history" && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {/* ======================================================
            ELIGIBLE STUDENTS
        ====================================================== */}

        {activeTab === "eligible" && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Search */}

            <div className="border-b border-slate-200 p-3 sm:p-4">
              <div className="relative w-full max-w-md">
                <Search
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student, admission number or class..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Loading */}

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2
                    size={30}
                    className="animate-spin text-indigo-600"
                  />

                  <p className="text-sm">
                    Loading eligible students...
                  </p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              /* Empty state */

              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <GraduationCap size={28} />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                  {search
                    ? "No students found"
                    : "No students are currently eligible"}
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  {search
                    ? "Try changing your search criteria."
                    : "Students become eligible when they have an active enrollment in a class marked as a graduating class."}
                </p>
              </div>
            ) : (
              /* Responsive table */

              <div className="w-full overflow-x-auto">
                <table className="w-full table-fixed text-left md:table-auto">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      {/* Visible on mobile and desktop */}

                      <th className="w-[65%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-auto md:px-5">
                        Student Name
                      </th>

                      {/* Desktop only */}

                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                        Admission No.
                      </th>

                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                        Class
                      </th>

                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                        Session
                      </th>

                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                        Term
                      </th>

                      {/* Visible on mobile and desktop */}

                      <th className="w-[35%] px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-auto md:px-5">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Student name: always visible */}

                        <td className="px-3 py-4 md:px-5">
                          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600 sm:h-10 sm:w-10">
                              {student.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                            </div>

                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold text-slate-800 sm:text-base">
                                {student.full_name || "Unnamed Student"}
                              </p>

                              <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-emerald-600">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Desktop only */}

                        <td className="hidden px-5 py-4 text-sm font-medium text-slate-700 md:table-cell">
                          {student.admission_number || "—"}
                        </td>

                        <td className="hidden px-5 py-4 md:table-cell">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                            {student.class_name || "—"}
                          </span>
                        </td>

                        <td className="hidden px-5 py-4 text-sm text-slate-600 md:table-cell">
                          {student.academic_session_name || "—"}
                        </td>

                        <td className="hidden px-5 py-4 text-sm text-slate-600 md:table-cell">
                          {student.term_name || "—"}
                        </td>

                        {/* Graduate action: always visible */}

                        <td className="px-3 py-4 text-right md:px-5">
                          <button
                            type="button"
                            onClick={() => openGraduationModal(student)}
                            aria-label={`Graduate ${student.full_name || "student"}`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-sm transition hover:bg-indigo-700 sm:gap-2 sm:px-3.5 sm:text-sm"
                          >
                            <GraduationCap size={16} />
                            <span>Graduate</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            GRADUATION HISTORY
        ====================================================== */}

        {activeTab === "history" && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {historyLoading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2
                    size={30}
                    className="animate-spin text-indigo-600"
                  />

                  <p className="text-sm">
                    Loading graduation history...
                  </p>
                </div>
              </div>
            ) : graduationHistory.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <History size={28} />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                  No graduation records
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Completed student graduations will appear here.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full table-fixed text-left md:table-auto">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      {/* Visible on mobile and desktop */}

                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:px-5">
                        Student Name
                      </th>

                      {/* Desktop only */}

                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                        Admission No.
                      </th>

                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                        Final Class
                      </th>

                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                        Session
                      </th>

                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                        Graduation Year
                      </th>

                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                        Date
                      </th>

                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {graduationHistory.map((record) => (
                      <tr
                        key={record.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Student name: always visible */}

                        <td className="break-words px-3 py-4 text-sm font-semibold text-slate-800 sm:text-base md:px-5">
                          {record.student_name || "Unnamed Student"}
                        </td>

                        {/* Desktop only */}

                        <td className="hidden px-5 py-4 text-sm text-slate-600 md:table-cell">
                          {record.admission_number || "—"}
                        </td>

                        <td className="hidden px-5 py-4 md:table-cell">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                            {record.from_class_name || "—"}
                          </span>
                        </td>

                        <td className="hidden px-5 py-4 text-sm text-slate-600 md:table-cell">
                          {record.from_session_name || "—"}
                        </td>

                        <td className="hidden px-5 py-4 text-sm font-semibold text-slate-700 md:table-cell">
                          {record.graduation_year || "—"}
                        </td>

                        <td className="hidden px-5 py-4 text-sm text-slate-600 md:table-cell">
                          {formatDate(record.promotion_date)}
                        </td>

                        <td className="hidden px-5 py-4 md:table-cell">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle size={13} />
                            Graduated
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          GRADUATION MODAL
      ====================================================== */}

      {showGraduationModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-4">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <GraduationCap size={21} />
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold text-slate-900">
                    Graduate Student
                  </h2>

                  <p className="text-xs text-slate-500">
                    Confirm final graduation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeGraduationModal}
                disabled={graduating}
                aria-label="Close graduation modal"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}

            <div className="space-y-5 p-4 sm:p-5">
              {/* Student summary */}

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                    {selectedStudent.full_name
                      ?.charAt(0)
                      ?.toUpperCase() || "S"}
                  </div>

                  <div className="min-w-0">
                    <p className="break-words font-bold text-slate-900">
                      {selectedStudent.full_name}
                    </p>

                    <p className="mt-0.5 break-words text-sm text-slate-600">
                      {selectedStudent.admission_number}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {selectedStudent.class_name}
                      </span>

                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {selectedStudent.academic_session_name}
                      </span>

                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {selectedStudent.term_name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}

              <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <p className="text-sm leading-6 text-amber-800">
                  Graduating this student will mark their status as{" "}
                  <strong>Graduated</strong> and close their current
                  enrollment. This action should only be performed for a
                  student who has completed the final graduating class.
                </p>
              </div>

              {/* Graduation Year */}

              <div>
                <label
                  htmlFor="graduation-year"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Graduation Year
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <input
                  id="graduation-year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={graduationYear}
                  onChange={(event) =>
                    setGraduationYear(event.target.value)
                  }
                  placeholder="Leave blank to use session end year"
                  disabled={graduating}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  If left blank, the system will automatically use the
                  academic session end year.
                </p>
              </div>

              {/* Remarks */}

              <div>
                <label
                  htmlFor="graduation-remarks"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Remarks
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="graduation-remarks"
                  rows={3}
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add any graduation remarks..."
                  disabled={graduating}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Modal Footer */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={closeGraduationModal}
                disabled={graduating}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGraduate}
                disabled={graduating}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {graduating ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Graduating...
                  </>
                ) : (
                  <>
                    <GraduationCap size={17} />
                    Confirm Graduation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
