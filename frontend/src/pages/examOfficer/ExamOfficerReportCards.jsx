import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getReportCards,
  deleteReportCard,
} from "../../services/resultsService";

function ExamOfficerReportCards() {
  const navigate = useNavigate();

  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ============================================================
  // LOAD REPORT CARDS
  // ============================================================

  const loadReportCards = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReportCards();

      setReportCards(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load report cards."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportCards();
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredReportCards = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return reportCards;
    }

    return reportCards.filter((reportCard) => {
      return [
        reportCard.student_name,
        reportCard.admission_number,
        reportCard.academic_session_name,
        reportCard.term_name,
        reportCard.class_level_name,
        reportCard.teacher_comment,
        reportCard.principal_comment,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        );
    });
  }, [reportCards, search]);

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report card?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteReportCard(id);

      setReportCards((current) =>
        current.filter(
          (reportCard) =>
            reportCard.id !== id
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to delete report card."
      );
    }
  };

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getStudentName = (reportCard) => {
    if (reportCard.student_name) {
      return reportCard.student_name;
    }

    if (reportCard.student?.full_name) {
      return reportCard.student.full_name;
    }

    if (reportCard.student) {
      return `Student #${reportCard.student}`;
    }

    return "Unknown Student";
  };

  const getSessionName = (reportCard) => {
    return (
      reportCard.academic_session_name ||
      reportCard.academic_session_display ||
      reportCard.academic_session?.name ||
      reportCard.academic_session ||
      "—"
    );
  };

  const getTermName = (reportCard) => {
    return (
      reportCard.term_name ||
      reportCard.term_display ||
      reportCard.term?.name ||
      reportCard.term ||
      "—"
    );
  };

  const getClassName = (reportCard) => {
    return (
      reportCard.class_level_name ||
      reportCard.class_level_display ||
      reportCard.class_level?.name ||
      reportCard.class_level ||
      "—"
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-[var(--color-card)] border border-slate-200 rounded-3xl p-10 text-center">
          <p className="text-slate-500">
            Loading report cards...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Report Cards
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Create and manage student report cards.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/exam-officer/report-cards/add"
            )
          }
          className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:opacity-90 text-white px-5 py-3 rounded-xl font-medium transition"
        >
          <span className="text-lg">
            +
          </span>

          Create Report Card
        </button>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="bg-[var(--color-card)] border border-slate-200 rounded-3xl p-5 mb-6 shadow-sm">

        <div className="max-w-xl">

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search Report Cards
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search student, admission number, session, term..."
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />

        </div>

      </div>


      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="bg-[var(--color-card)] border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-50 border-b border-slate-200">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Session
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Term
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Class
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Attendance
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredReportCards.length > 0 ? (

                filteredReportCards.map(
                  (reportCard) => (

                    <tr
                      key={reportCard.id}
                      className="hover:bg-slate-50 transition"
                    >

                      {/* STUDENT */}

                      <td className="px-6 py-4">

                        <div className="font-medium text-[var(--color-text)]">
                          {getStudentName(
                            reportCard
                          )}
                        </div>

                        {reportCard.admission_number && (
                          <div className="text-xs text-slate-500 mt-1">
                            {reportCard.admission_number}
                          </div>
                        )}

                      </td>


                      {/* SESSION */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getSessionName(
                          reportCard
                        )}
                      </td>


                      {/* TERM */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getTermName(
                          reportCard
                        )}
                      </td>


                      {/* CLASS */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getClassName(
                          reportCard
                        )}
                      </td>


                      {/* ATTENDANCE */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {reportCard.attendance_percentage !==
                        undefined &&
                        reportCard.attendance_percentage !==
                        null
                          ? `${reportCard.attendance_percentage}%`
                          : "—"}
                      </td>


                      {/* STATUS */}

                      <td className="px-6 py-4">

                        {reportCard.is_published ? (

                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Published
                          </span>

                        ) : (

                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Draft
                          </span>

                        )}

                      </td>


                      {/* ACTIONS */}

                      <td className="px-6 py-4">

                        <div className="flex items-center justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/exam-officer/print-result/${reportCard.id}`
                              )
                            }
                            className="px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-blue-50 rounded-lg transition"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                reportCard.id
                              )
                            }
                            className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center"
                  >

                    <div className="text-4xl mb-3">
                      📄
                    </div>

                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      No report cards found
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {search
                        ? "Try a different search."
                        : "Create your first report card to get started."}
                    </p>

                    {!search && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/exam-officer/report-cards/add"
                          )
                        }
                        className="mt-5 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90"
                      >
                        Create Report Card
                      </button>
                    )}

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default ExamOfficerReportCards;