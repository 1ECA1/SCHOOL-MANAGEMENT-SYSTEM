import { useEffect, useMemo, useState } from "react";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

import {
  getEnrollments,
} from "../../../services/studentsService";

import {
  getAttendance,
} from "../../../services/attendanceService";

function AttendanceReports() {
  // =========================================================
  // FILTER STATE
  // =========================================================

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [form, setForm] = useState({
    academic_session: "",
    term: "",
    class_level: "",
    from_date: "",
    to_date: "",
  });

  // =========================================================
  // REPORT DATA
  // =========================================================

  const [enrollments, setEnrollments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // =========================================================
  // UI STATE
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD FILTER OPTIONS
  // =========================================================

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setError("");

        const [sessionsData, termsData, classLevelsData] =
          await Promise.all([
            getSessions(),
            getTerms(),
            getClassLevels(),
          ]);

        setSessions(
          Array.isArray(sessionsData)
            ? sessionsData
            : sessionsData?.results || [],
        );

        setTerms(
          Array.isArray(termsData)
            ? termsData
            : termsData?.results || [],
        );

        setClassLevels(
          Array.isArray(classLevelsData)
            ? classLevelsData
            : classLevelsData?.results || [],
        );
      } catch (err) {
        console.error("Failed to load attendance report options:", err);

        setError(
          err?.response?.data?.detail ||
            "Failed to load report filters.",
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // GENERATE REPORT
  // =========================================================

  const generateReport = async () => {
    if (
      !form.academic_session ||
      !form.term ||
      !form.class_level
    ) {
      setError(
        "Please select academic session, term, and class before generating the report.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------------
      // GET STUDENTS ENROLLED IN SELECTED CLASS
      // -------------------------------------------------------

      const enrollmentData = await getEnrollments({
        classLevel: form.class_level,
        academicSession: form.academic_session,
        term: form.term,
      });

      const enrollmentList = Array.isArray(enrollmentData)
        ? enrollmentData
        : enrollmentData?.results || [];

      setEnrollments(enrollmentList);

      // -------------------------------------------------------
      // GET ATTENDANCE
      // -------------------------------------------------------

      const attendanceData = await getAttendance({
        class_level: form.class_level,
        academic_session: form.academic_session,
        term: form.term,
      });

      const attendanceList = Array.isArray(attendanceData)
        ? attendanceData
        : attendanceData?.results || [];

      setAttendanceRecords(attendanceList);
    } catch (err) {
      console.error("Failed to generate attendance report:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to generate attendance report.",
      );

      setEnrollments([]);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FILTER ATTENDANCE BY DATE
  // =========================================================

  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((record) => {
      if (!record.date) {
        return false;
      }

      if (
        form.from_date &&
        record.date < form.from_date
      ) {
        return false;
      }

      if (
        form.to_date &&
        record.date > form.to_date
      ) {
        return false;
      }

      return true;
    });
  }, [
    attendanceRecords,
    form.from_date,
    form.to_date,
  ]);

  // =========================================================
  // BUILD STUDENT REPORT
  // =========================================================

  const studentReports = useMemo(() => {
    const reportMap = {};

    // -------------------------------------------------------
    // CREATE AN ENTRY FOR EVERY ENROLLED STUDENT
    // -------------------------------------------------------

    enrollments.forEach((enrollment) => {
      const studentId =
        enrollment.student ||
        enrollment.student_id;

      if (!studentId) {
        return;
      }

      reportMap[studentId] = {
        studentId,
        admissionNumber:
          enrollment.admission_number ||
          enrollment.student_admission_number ||
          "—",
        studentName:
          enrollment.student_name ||
          enrollment.full_name ||
          "Unknown Student",

        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      };
    });

    // -------------------------------------------------------
    // ADD ATTENDANCE RECORDS
    // -------------------------------------------------------

    filteredAttendance.forEach((record) => {
      const studentId =
        record.student ||
        record.student_id;

      if (!studentId) {
        return;
      }

      // If student wasn't returned in enrollment data,
      // create an entry anyway.
      if (!reportMap[studentId]) {
        reportMap[studentId] = {
          studentId,
          admissionNumber:
            record.admission_number || "—",
          studentName:
            record.student_name || "Unknown Student",

          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }

      const student = reportMap[studentId];

      student.total += 1;

      switch (record.status) {
        case "PRESENT":
          student.present += 1;
          break;

        case "ABSENT":
          student.absent += 1;
          break;

        case "LATE":
          student.late += 1;
          break;

        case "EXCUSED":
          student.excused += 1;
          break;

        default:
          break;
      }
    });

    // -------------------------------------------------------
    // CALCULATE PERCENTAGE
    // -------------------------------------------------------

    return Object.values(reportMap)
      .map((student) => {
        const attended =
          student.present + student.late;

        const percentage =
          student.total > 0
            ? (attended / student.total) * 100
            : 0;

        return {
          ...student,
          attendancePercentage: percentage,
        };
      })
      .sort((a, b) =>
        a.studentName.localeCompare(b.studentName),
      );
  }, [enrollments, filteredAttendance]);

  // =========================================================
  // OVERALL STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const total = filteredAttendance.length;

    const present = filteredAttendance.filter(
      (record) => record.status === "PRESENT",
    ).length;

    const absent = filteredAttendance.filter(
      (record) => record.status === "ABSENT",
    ).length;

    const late = filteredAttendance.filter(
      (record) => record.status === "LATE",
    ).length;

    const excused = filteredAttendance.filter(
      (record) => record.status === "EXCUSED",
    ).length;

    const attended = present + late;

    const percentage =
      total > 0
        ? (attended / total) * 100
        : 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      percentage,
    };
  }, [filteredAttendance]);

  // =========================================================
  // SELECTED NAMES
  // =========================================================

  const selectedSession = sessions.find(
    (session) =>
      String(session.id) ===
      String(form.academic_session),
  );

  const selectedTerm = terms.find(
    (term) =>
      String(term.id) ===
      String(form.term),
  );

  const selectedClass = classLevels.find(
    (classLevel) =>
      String(classLevel.id) ===
      String(form.class_level),
  );

  // =========================================================
  // PRINT REPORT
  // =========================================================

  const handlePrint = () => {
    window.print();
  };

  // =========================================================
  // RESET REPORT
  // =========================================================

  const handleReset = () => {
    setForm({
      academic_session: "",
      term: "",
      class_level: "",
      from_date: "",
      to_date: "",
    });

    setEnrollments([]);
    setAttendanceRecords([]);
    setError("");
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString();
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "PRESENT":
        return "Present";

      case "ABSENT":
        return "Absent";

      case "LATE":
        return "Late";

      case "EXCUSED":
        return "Excused";

      default:
        return status || "—";
    }
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "PRESENT":
        return "text-green-700 bg-green-50";

      case "ABSENT":
        return "text-red-700 bg-red-50";

      case "LATE":
        return "text-yellow-700 bg-yellow-50";

      case "EXCUSED":
        return "text-blue-700 bg-blue-50";

      default:
        return "text-gray-700 bg-gray-50";
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="print-hidden flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Attendance Reports
          </h1>

          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            Generate and print student attendance reports.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          disabled={studentReports.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          🖨️ Print Report
        </button>
      </div>

      {/* =====================================================
          FILTER CARD
      ====================================================== */}

      <div
        className="print-hidden rounded-xl border p-5 shadow-sm"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Academic Session */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Academic Session
            </label>

            <select
              name="academic_session"
              value={form.academic_session}
              onChange={handleChange}
              disabled={loadingOptions}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              <option value="">
                Select session
              </option>

              {sessions.map((session) => (
                <option
                  key={session.id}
                  value={session.id}
                >
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* Term */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Term
            </label>

            <select
              name="term"
              value={form.term}
              onChange={handleChange}
              disabled={loadingOptions}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
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

          {/* Class */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Class
            </label>

            <select
              name="class_level"
              value={form.class_level}
              onChange={handleChange}
              disabled={loadingOptions}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              <option value="">
                Select class
              </option>

              {classLevels.map((classLevel) => (
                <option
                  key={classLevel.id}
                  value={classLevel.id}
                >
                  {classLevel.name}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              From Date
            </label>

            <input
              type="date"
              name="from_date"
              value={form.from_date}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* To Date */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              To Date
            </label>

            <input
              type="date"
              name="to_date"
              value={form.to_date}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>
        </div>

        {/* Buttons */}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generateReport}
            disabled={loading}
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-primary)",
            }}
          >
            {loading
              ? "Generating..."
              : "Generate Report"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-black/[0.03]"
            style={{
              borderColor: "var(--color-border)",
            }}
          >
            Reset
          </button>
        </div>

        {/* Error */}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* =====================================================
          PRINTABLE REPORT
      ====================================================== */}

      {studentReports.length > 0 && (
        <div
          id="attendance-report"
          className="space-y-6"
        >
          {/* ===================================================
              REPORT HEADER
          ==================================================== */}

          <div
            className="rounded-xl border p-6 shadow-sm"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  Attendance Report
                </h2>

                <div
                  className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4"
                  style={{
                    color: "var(--color-muted)",
                  }}
                >
                  <div>
                    <span className="font-medium">
                      Session:
                    </span>{" "}
                    {selectedSession?.name || "—"}
                  </div>

                  <div>
                    <span className="font-medium">
                      Term:
                    </span>{" "}
                    {selectedTerm?.name || "—"}
                  </div>

                  <div>
                    <span className="font-medium">
                      Class:
                    </span>{" "}
                    {selectedClass?.name || "—"}
                  </div>

                  <div>
                    <span className="font-medium">
                      Period:
                    </span>{" "}
                    {form.from_date
                      ? formatDate(form.from_date)
                      : "Beginning"}{" "}
                    —{" "}
                    {form.to_date
                      ? formatDate(form.to_date)
                      : "Current"}
                  </div>
                </div>
              </div>

              <div className="print-hidden">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium hover:bg-black/[0.03]"
                >
                  🖨️ Print
                </button>
              </div>
            </div>
          </div>

          {/* ===================================================
              STATISTICS
          ==================================================== */}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {/* Total */}

            <div
              className="rounded-xl border p-4"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <p className="text-xs font-medium text-gray-500">
                Total Records
              </p>

              <p className="mt-2 text-2xl font-bold">
                {statistics.total}
              </p>
            </div>

            {/* Present */}

            <div
              className="rounded-xl border p-4"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <p className="text-xs font-medium text-gray-500">
                Present
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {statistics.present}
              </p>
            </div>

            {/* Absent */}

            <div
              className="rounded-xl border p-4"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <p className="text-xs font-medium text-gray-500">
                Absent
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {statistics.absent}
              </p>
            </div>

            {/* Late */}

            <div
              className="rounded-xl border p-4"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <p className="text-xs font-medium text-gray-500">
                Late
              </p>

              <p className="mt-2 text-2xl font-bold text-yellow-600">
                {statistics.late}
              </p>
            </div>

            {/* Excused */}

            <div
              className="rounded-xl border p-4"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <p className="text-xs font-medium text-gray-500">
                Excused
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {statistics.excused}
              </p>
            </div>

            {/* Percentage */}

            <div
              className="rounded-xl border p-4"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <p className="text-xs font-medium text-gray-500">
                Attendance
              </p>

              <p className="mt-2 text-2xl font-bold">
                {statistics.percentage.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* ===================================================
              STUDENT REPORT TABLE
          ==================================================== */}

          <div
            className="overflow-hidden rounded-xl border shadow-sm"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <th className="px-4 py-3 text-left font-semibold">
                      #
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Admission No.
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Student
                    </th>

                    <th className="px-4 py-3 text-center font-semibold">
                      Total
                    </th>

                    <th className="px-4 py-3 text-center font-semibold">
                      Present
                    </th>

                    <th className="px-4 py-3 text-center font-semibold">
                      Absent
                    </th>

                    <th className="px-4 py-3 text-center font-semibold">
                      Late
                    </th>

                    <th className="px-4 py-3 text-center font-semibold">
                      Excused
                    </th>

                    <th className="px-4 py-3 text-center font-semibold">
                      Attendance %
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {studentReports.map(
                    (student, index) => (
                      <tr
                        key={student.studentId}
                        className="border-b last:border-b-0"
                        style={{
                          borderColor:
                            "var(--color-border)",
                        }}
                      >
                        <td className="px-4 py-3">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3">
                          {student.admissionNumber}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {student.studentName}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {student.total}
                        </td>

                        <td className="px-4 py-3 text-center font-medium text-green-600">
                          {student.present}
                        </td>

                        <td className="px-4 py-3 text-center font-medium text-red-600">
                          {student.absent}
                        </td>

                        <td className="px-4 py-3 text-center font-medium text-yellow-600">
                          {student.late}
                        </td>

                        <td className="px-4 py-3 text-center font-medium text-blue-600">
                          {student.excused}
                        </td>

                        <td className="px-4 py-3 text-center font-semibold">
                          {student.attendancePercentage.toFixed(
                            1,
                          )}
                          %
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===================================================
              DETAILED ATTENDANCE RECORDS
          ==================================================== */}

          {filteredAttendance.length > 0 && (
            <div
              className="rounded-xl border shadow-sm"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="border-b px-5 py-4">
                <h3 className="font-semibold">
                  Attendance Details
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr
                      className="border-b"
                      style={{
                        borderColor:
                          "var(--color-border)",
                      }}
                    >
                      <th className="px-4 py-3 text-left font-semibold">
                        #
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Student
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Date
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Subject
                      </th>

                      <th className="px-4 py-3 text-center font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Remarks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAttendance.map(
                      (record, index) => (
                        <tr
                          key={record.id}
                          className="border-b last:border-b-0"
                          style={{
                            borderColor:
                              "var(--color-border)",
                          }}
                        >
                          <td className="px-4 py-3">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3 font-medium">
                            {record.student_name ||
                              "Unknown Student"}
                          </td>

                          <td className="px-4 py-3">
                            {formatDate(record.date)}
                          </td>

                          <td className="px-4 py-3">
                            {record.subject_name ||
                              "General"}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                record.status,
                              )}`}
                            >
                              {getStatusLabel(
                                record.status,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {record.remarks || "—"}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================
              PRINT FOOTER
          ==================================================== */}

          <div className="hidden print:block pt-6 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>
                Generated:{" "}
                {new Date().toLocaleString()}
              </span>

              <span>
                Attendance Management System
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {!loading &&
        enrollments.length === 0 &&
        attendanceRecords.length === 0 && (
          <div
            className="rounded-xl border p-10 text-center"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="text-4xl">📊</div>

            <h3 className="mt-3 text-lg font-semibold">
              No Report Generated
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Select a session, term, and class, then
              click "Generate Report".
            </p>
          </div>
        )}

      {/* =====================================================
          PRINT CSS
      ====================================================== */}

      <style>
        {`
          @media print {
            body {
              background: white !important;
              color: black !important;
            }

            nav,
            aside,
            header {
              display: none !important;
            }

            .print-hidden {
              display: none !important;
            }

            #root {
              width: 100% !important;
            }

            #attendance-report {
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            #attendance-report > div {
              box-shadow: none !important;
              border-color: #ddd !important;
            }

            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }

            th,
            td {
              border-bottom: 1px solid #ddd !important;
              color: black !important;
            }

            th {
              background: #f5f5f5 !important;
            }

            tr {
              page-break-inside: avoid !important;
            }

            h1,
            h2,
            h3 {
              page-break-after: avoid !important;
            }

            @page {
              size: A4 landscape;
              margin: 12mm;
            }
          }
        `}
      </style>
    </div>
  );
}

export default AttendanceReports;