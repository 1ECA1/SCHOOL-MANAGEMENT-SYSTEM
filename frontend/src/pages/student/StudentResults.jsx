import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyReportCards,
} from "../../services/resultsService";


const StudentResults = () => {
  const navigate = useNavigate();

  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD RESULTS
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyReportCards();

        if (!mounted) return;

        const data = Array.isArray(response)
          ? response
          : response?.results || [];

        setReportCards(data);
      } catch (err) {
        console.error("Failed to load student results:", err);

        if (!mounted) return;

        setError(
          err?.response?.data?.detail ||
          "Unable to load your results."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResults();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // SORT RESULTS
  // ==========================================================

  const sortedReportCards = useMemo(() => {
    return [...reportCards].sort((a, b) => {
      const sessionA = String(
        a.session_name || ""
      );

      const sessionB = String(
        b.session_name || ""
      );

      if (sessionA !== sessionB) {
        return sessionB.localeCompare(sessionA);
      }

      return Number(b.term || 0) - Number(a.term || 0);
    });
  }, [reportCards]);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatScore = (score) => {
    if (
      score === null ||
      score === undefined ||
      score === ""
    ) {
      return "0.00";
    }

    return Number(score).toFixed(2);
  };

  const getTermName = (reportCard) => {
    return (
      reportCard.term_name ||
      "Term"
    );
  };

  const getPosition = (reportCard) => {
    if (
      reportCard.position === null ||
      reportCard.position === undefined
    ) {
      return "—";
    }

    return `${reportCard.position}${
      reportCard.position === 1
        ? "st"
        : reportCard.position === 2
        ? "nd"
        : reportCard.position === 3
        ? "rd"
        : "th"
    }`;
  };

  const getGradeBadge = (grade) => {
    if (!grade) {
      return "bg-slate-100 text-slate-600";
    }

    const value = String(grade).toUpperCase();

    if (value === "A") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (value === "B") {
      return "bg-blue-100 text-blue-700";
    }

    if (value === "C") {
      return "bg-amber-100 text-amber-700";
    }

    if (
      value === "D" ||
      value === "E"
    ) {
      return "bg-orange-100 text-orange-700";
    }

    if (value === "F") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  // ==========================================================
  // VIEW RESULT
  // ==========================================================

  const handleViewResult = (id) => {
    navigate(
      `/student/results/${id}`
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your results...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              !
            </div>

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load results
              </h2>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // EMPTY RESULTS
  // ==========================================================

  if (!sortedReportCards.length) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
            📊
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-800">
            No Results Available
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your published academic results will appear here
            once they have been released by the school.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          My Results
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your published academic results and report cards.
        </p>
      </div>

      {/* ====================================================
          SUMMARY
      ==================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL RESULTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Published Results
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {sortedReportCards.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              📚
            </div>
          </div>
        </div>

        {/* LATEST AVERAGE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Latest Average
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {formatScore(
                  sortedReportCards[0]?.average_score
                )}
                %
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
              📈
            </div>
          </div>
        </div>

        {/* LATEST GRADE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Latest Grade
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {sortedReportCards[0]?.overall_grade || "—"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
              🏆
            </div>
          </div>
        </div>

        {/* LATEST POSITION */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Latest Position
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {getPosition(
                  sortedReportCards[0]
                )}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl">
              🥇
            </div>
          </div>
        </div>

      </div>

      {/* ====================================================
          RESULTS
      ==================================================== */}

      <div className="space-y-4">

        {sortedReportCards.map(
          (reportCard) => {

            const subjectCount =
              Array.isArray(
                reportCard.results
              )
                ? reportCard.results.length
                : 0;

            return (
              <div
                key={reportCard.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >

                {/* CARD HEADER */}

                <div className="border-b border-slate-100 bg-slate-50/70 p-5">

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div className="flex items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
                        📄
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-800">
                          {reportCard.session_name ||
                            "Academic Session"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {getTermName(reportCard)}
                        </p>
                      </div>

                    </div>

                    <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Published
                    </span>

                  </div>

                </div>

                {/* CARD CONTENT */}

                <div className="p-5">

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">

                    {/* CLASS */}

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Class
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                        {reportCard.class_name || "—"}
                      </p>
                    </div>

                    {/* DEPARTMENT */}

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Department
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                        {reportCard.department_name || "—"}
                      </p>
                    </div>

                    {/* SUBJECTS */}

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Subjects
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {subjectCount}
                      </p>
                    </div>

                    {/* TOTAL */}

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Total Score
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatScore(
                          reportCard.total_score
                        )}
                      </p>
                    </div>

                    {/* AVERAGE */}

                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-xs text-blue-500">
                        Average
                      </p>

                      <p className="mt-1 text-sm font-bold text-blue-700">
                        {formatScore(
                          reportCard.average_score
                        )}
                        %
                      </p>
                    </div>

                    {/* GRADE */}

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Grade
                      </p>

                      <p
                        className={`mt-1 inline-flex rounded-lg px-2 py-1 text-sm font-bold ${getGradeBadge(
                          reportCard.overall_grade
                        )}`}
                      >
                        {reportCard.overall_grade || "—"}
                      </p>
                    </div>

                  </div>

                  {/* POSITION + ATTENDANCE */}

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">

                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="text-xs text-slate-400">
                        Class Position
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-800">
                        {getPosition(reportCard)}
                        {reportCard.total_students
                          ? (
                              <span className="ml-1 text-sm font-medium text-slate-400">
                                of{" "}
                                {reportCard.total_students}
                              </span>
                            )
                          : null}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="text-xs text-slate-400">
                        Attendance
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-800">
                        {formatScore(
                          reportCard.attendance_percentage
                        )}
                        %
                      </p>
                    </div>

                    <div className="flex items-center justify-start md:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleViewResult(
                            reportCard.id
                          )
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 md:w-auto"
                      >
                        View Result
                        <span>→</span>
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
};

export default StudentResults;