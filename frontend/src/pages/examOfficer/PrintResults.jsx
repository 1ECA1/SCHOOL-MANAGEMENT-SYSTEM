import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getSessions,
  getTerms,
} from "../../services/academicsService";

import {
  getReportCards,
} from "../../services/resultsService";

const PrintResults = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [reportCards, setReportCards] = useState([]);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ACADEMIC SESSIONS
  // =====================================================

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSessions();

        const sessionList = Array.isArray(data)
          ? data
          : data?.results || [];

        setSessions(sessionList);

        // Select current session automatically if available
        const currentSession = sessionList.find(
          (session) => session.is_current === true
        );

        if (currentSession) {
          setSelectedSession(String(currentSession.id));
        }
      } catch (err) {
        console.error("Failed to load academic sessions:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load academic sessions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // =====================================================
  // LOAD TERMS
  // =====================================================

  useEffect(() => {
    const loadTerms = async () => {
      if (!selectedSession) {
        setTerms([]);
        setSelectedTerm("");
        return;
      }

      try {
        setLoadingTerms(true);
        setError("");
        setSelectedTerm("");

        const data = await getTerms();

        const termList = Array.isArray(data)
          ? data
          : data?.results || [];

        // Only show terms belonging to selected session
        const filteredTerms = termList.filter(
          (term) =>
            String(term.academic_session) ===
            String(selectedSession)
        );

        setTerms(filteredTerms);

        // Automatically select current term
        const currentTerm = filteredTerms.find(
          (term) => term.is_current === true
        );

        if (currentTerm) {
          setSelectedTerm(String(currentTerm.id));
        }
      } catch (err) {
        console.error("Failed to load terms:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load academic terms."
        );
      } finally {
        setLoadingTerms(false);
      }
    };

    loadTerms();
  }, [selectedSession]);

  // =====================================================
  // LOAD REPORT CARDS
  // =====================================================

  useEffect(() => {
    const loadReportCards = async () => {
      try {
        setError("");

        const data = await getReportCards();

        const reportCardList = Array.isArray(data)
          ? data
          : data?.results || [];

        setReportCards(reportCardList);
      } catch (err) {
        console.error("Failed to load report cards:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load report cards."
        );
      }
    };

    loadReportCards();
  }, []);

  // =====================================================
  // FILTER REPORT CARDS BY SESSION + TERM
  // =====================================================

  const filteredReportCards = useMemo(() => {
    if (!selectedSession || !selectedTerm) {
      return [];
    }

    return reportCards.filter(
      (reportCard) =>
        String(reportCard.academic_session) ===
          String(selectedSession) &&
        String(reportCard.term) === String(selectedTerm)
    );
  }, [reportCards, selectedSession, selectedTerm]);

  // =====================================================
  // UNIQUE STUDENTS
  // =====================================================

  const students = useMemo(() => {
    const studentMap = new Map();

    filteredReportCards.forEach((reportCard) => {
      if (!studentMap.has(reportCard.student)) {
        studentMap.set(reportCard.student, {
          id: reportCard.student,
          name:
            reportCard.student_name ||
            `Student ${reportCard.student}`,
          reportCardId: reportCard.id,
          className: reportCard.class_name || "",
          departmentName:
            reportCard.department_name || "",
        });
      }
    });

    return Array.from(studentMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [filteredReportCards]);

  // =====================================================
  // WHEN SESSION CHANGES
  // =====================================================

  const handleSessionChange = (event) => {
    const value = event.target.value;

    setSelectedSession(value);
    setSelectedStudent("");
  };

  // =====================================================
  // WHEN TERM CHANGES
  // =====================================================

  const handleTermChange = (event) => {
    const value = event.target.value;

    setSelectedTerm(value);
    setSelectedStudent("");
  };

  // =====================================================
  // VIEW RESULT
  // =====================================================

  const handleViewResult = () => {
    if (!selectedSession) {
      setError("Please select an academic session.");
      return;
    }

    if (!selectedTerm) {
      setError("Please select an academic term.");
      return;
    }

    if (!selectedStudent) {
      setError("Please select a student.");
      return;
    }

    const selectedReportCard = filteredReportCards.find(
      (reportCard) =>
        String(reportCard.student) ===
        String(selectedStudent)
    );

    if (!selectedReportCard) {
      setError(
        "No report card was found for this student."
      );
      return;
    }

    // Open the actual printable result page
    navigate(
      `/exam-officer/print-result/${selectedReportCard.id}`
    );
  };

  // =====================================================
  // GET SELECTED SESSION NAME
  // =====================================================

  const selectedSessionObject = sessions.find(
    (session) =>
      String(session.id) === String(selectedSession)
  );

  const selectedTermObject = terms.find(
    (term) =>
      String(term.id) === String(selectedTerm)
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">

        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Print Results
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Select an academic session, term and student
            to view and print the student's result.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            SELECTION CARD
        ================================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Result Selection
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose the academic period and student whose
              result you want to print.
            </p>
          </div>

          {/* =================================================
              SESSION + TERM
          ================================================== */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* SESSION */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Academic Session
              </label>

              <select
                value={selectedSession}
                onChange={handleSessionChange}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              >
                <option value="">
                  Select Academic Session
                </option>

                {sessions.map((session) => (
                  <option
                    key={session.id}
                    value={session.id}
                  >
                    {session.name}
                    {session.is_current
                      ? " (Current)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* TERM */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Academic Term
              </label>

              <select
                value={selectedTerm}
                onChange={handleTermChange}
                disabled={
                  !selectedSession ||
                  loadingTerms
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              >
                <option value="">
                  {loadingTerms
                    ? "Loading terms..."
                    : "Select Academic Term"}
                </option>

                {terms.map((term) => (
                  <option
                    key={term.id}
                    value={term.id}
                  >
                    {term.name}
                    {term.is_current
                      ? " (Current)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* =================================================
              SELECTED PERIOD
          ================================================== */}

          {selectedSessionObject &&
            selectedTermObject && (
              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">
                    Selected:
                  </span>{" "}
                  {selectedSessionObject.name} —{" "}
                  {selectedTermObject.name}
                </p>
              </div>
            )}

          {/* =================================================
              STUDENT
          ================================================== */}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Student
            </label>

            <select
              value={selectedStudent}
              onChange={(event) =>
                setSelectedStudent(event.target.value)
              }
              disabled={
                !selectedSession ||
                !selectedTerm ||
                students.length === 0
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            >
              <option value="">
                {!selectedSession
                  ? "Select an academic session first"
                  : !selectedTerm
                  ? "Select a term first"
                  : students.length === 0
                  ? "No students with results for this period"
                  : "Select Student"}
              </option>

              {students.map((student) => (
                <option
                  key={student.id}
                  value={student.id}
                >
                  {student.name}
                  {student.className
                    ? ` — ${student.className}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* =================================================
              STUDENT INFORMATION
          ================================================== */}

          {selectedStudent && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">

              {(() => {
                const student = students.find(
                  (item) =>
                    String(item.id) ===
                    String(selectedStudent)
                );

                if (!student) return null;

                return (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Student
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {student.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Class
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {student.className || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Department
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {student.departmentName || "—"}
                      </p>
                    </div>

                  </div>
                );
              })()}
            </div>
          )}

          {/* =================================================
              BUTTON
          ================================================== */}

          <div className="mt-8 flex justify-end">

            <button
              type="button"
              onClick={handleViewResult}
              disabled={
                !selectedSession ||
                !selectedTerm ||
                !selectedStudent
              }
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              View & Print Result
            </button>

          </div>
        </div>

        {/* =================================================
            INFORMATION
        ================================================== */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">

          <h3 className="text-sm font-semibold text-gray-800">
            How it works
          </h3>

          <div className="mt-3 space-y-2 text-sm text-gray-600">

            <p>
              <span className="font-medium text-gray-800">
                1.
              </span>{" "}
              Select the academic session.
            </p>

            <p>
              <span className="font-medium text-gray-800">
                2.
              </span>{" "}
              Select the academic term.
            </p>

            <p>
              <span className="font-medium text-gray-800">
                3.
              </span>{" "}
              Select the student.
            </p>

            <p>
              <span className="font-medium text-gray-800">
                4.
              </span>{" "}
              Click{" "}
              <span className="font-medium">
                View & Print Result
              </span>{" "}
              to open the student's result.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintResults;