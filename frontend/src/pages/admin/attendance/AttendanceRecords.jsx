import { useEffect, useMemo, useState } from "react";

import {
  getSessions,
  getTerms,
  getClassLevels,
  getSubjects,
} from "../../../services/academicsService";

import {
  getAttendance,
  updateAttendance,
  deleteAttendance,
} from "../../../services/attendanceService";


// =====================================================
// HELPERS
// =====================================================

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// =====================================================
// STATUS CONFIG
// =====================================================

const statusConfig = {
  PRESENT: {
    label: "Present",
    className:
      "bg-green-100 text-green-700 border border-green-200",
  },

  ABSENT: {
    label: "Absent",
    className:
      "bg-red-100 text-red-700 border border-red-200",
  },

  LATE: {
    label: "Late",
    className:
      "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },

  EXCUSED: {
    label: "Excused",
    className:
      "bg-blue-100 text-blue-700 border border-blue-200",
  },
};


// =====================================================
// COMPONENT
// =====================================================

function AttendanceRecords() {
  // ===================================================
  // ACADEMIC DATA
  // ===================================================

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);


  // ===================================================
  // ATTENDANCE DATA
  // ===================================================

  const [records, setRecords] = useState([]);


  // ===================================================
  // LOADING / ERROR
  // ===================================================

  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState("");


  // ===================================================
  // FILTERS
  // ===================================================

  const [filters, setFilters] = useState({
    academic_session: "",
    term: "",
    class_level: "",
    subject: "",
    date: "",
  });


  // ===================================================
  // EDITING
  // ===================================================

  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    status: "",
    remarks: "",
  });

  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);


  // ===================================================
  // LOAD ACADEMIC DATA
  // ===================================================

  useEffect(() => {
    loadAcademicData();
  }, []);


  const loadAcademicData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        sessionsData,
        termsData,
        classLevelsData,
        subjectsData,
      ] = await Promise.all([
        getSessions(),
        getTerms(),
        getClassLevels(),
        getSubjects(),
      ]);

      setSessions(
        Array.isArray(sessionsData)
          ? sessionsData
          : sessionsData?.results || []
      );

      setTerms(
        Array.isArray(termsData)
          ? termsData
          : termsData?.results || []
      );

      setClassLevels(
        Array.isArray(classLevelsData)
          ? classLevelsData
          : classLevelsData?.results || []
      );

      setSubjects(
        Array.isArray(subjectsData)
          ? subjectsData
          : subjectsData?.results || []
      );
    } catch (err) {
      console.error("Failed to load attendance filters:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load attendance information."
      );
    } finally {
      setLoading(false);
    }
  };


  // ===================================================
  // LOAD ATTENDANCE RECORDS
  // ===================================================

  useEffect(() => {
    if (!loading) {
      loadAttendance();
    }
  }, [filters]);


  const loadAttendance = async () => {
    try {
      setLoadingRecords(true);
      setError("");

      const params = {};

      if (filters.academic_session) {
        params.academic_session = filters.academic_session;
      }

      if (filters.term) {
        params.term = filters.term;
      }

      if (filters.class_level) {
        params.class_level = filters.class_level;
      }

      if (filters.subject) {
        params.subject = filters.subject;
      }

      if (filters.date) {
        params.date = filters.date;
      }

      const data = await getAttendance(params);

      const attendanceRecords = Array.isArray(data)
        ? data
        : data?.results || [];

      setRecords(attendanceRecords);
    } catch (err) {
      console.error("Failed to load attendance:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load attendance records."
      );

      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };


  // ===================================================
  // FILTER HANDLER
  // ===================================================

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ===================================================
  // RESET FILTERS
  // ===================================================

  const handleReset = () => {
    setFilters({
      academic_session: "",
      term: "",
      class_level: "",
      subject: "",
      date: "",
    });
  };


  // ===================================================
  // EDIT
  // ===================================================

  const handleEdit = (record) => {
    setEditingId(record.id);

    setEditForm({
      status: record.status || "PRESENT",
      remarks: record.remarks || "",
    });
  };


  // ===================================================
  // CANCEL EDIT
  // ===================================================

  const handleCancelEdit = () => {
    setEditingId(null);

    setEditForm({
      status: "",
      remarks: "",
    });
  };


  // ===================================================
  // EDIT FORM CHANGE
  // ===================================================

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ===================================================
  // SAVE EDIT
  // ===================================================

  const handleSaveEdit = async (record) => {
    try {
      setSavingId(record.id);
      setError("");

      const updatedRecord = await updateAttendance(record.id, {
        status: editForm.status,
        remarks: editForm.remarks,
      });

      setRecords((previous) =>
        previous.map((item) =>
          item.id === record.id
            ? {
                ...item,
                ...updatedRecord,
              }
            : item
        )
      );

      setEditingId(null);

      setEditForm({
        status: "",
        remarks: "",
      });
    } catch (err) {
      console.error("Failed to update attendance:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to update attendance record."
      );
    } finally {
      setSavingId(null);
    }
  };


  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = async (record) => {
    const studentName =
      record.student_name || "this student";

    const confirmed = window.confirm(
      `Are you sure you want to delete the attendance record for ${studentName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(record.id);
      setError("");

      await deleteAttendance(record.id);

      setRecords((previous) =>
        previous.filter(
          (item) => item.id !== record.id
        )
      );
    } catch (err) {
      console.error("Failed to delete attendance:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to delete attendance record."
      );
    } finally {
      setDeletingId(null);
    }
  };


  // ===================================================
  // STATISTICS
  // ===================================================

  const statistics = useMemo(() => {
    const total = records.length;

    const present = records.filter(
      (record) => record.status === "PRESENT"
    ).length;

    const absent = records.filter(
      (record) => record.status === "ABSENT"
    ).length;

    const late = records.filter(
      (record) => record.status === "LATE"
    ).length;

    const excused = records.filter(
      (record) => record.status === "EXCUSED"
    ).length;

    return {
      total,
      present,
      absent,
      late,
      excused,
    };
  }, [records]);


  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />

          <p className="text-sm text-[var(--color-text)] opacity-70">
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Attendance Records
          </h1>

          <p className="mt-1 text-sm opacity-70 text-[var(--color-text)]">
            View, filter and manage recorded student attendance.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAttendance}
          disabled={loadingRecords}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          <span>↻</span>

          {loadingRecords
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">

          <div>
            <p className="font-medium">
              Attendance Error
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* TOTAL */}

        <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

          <p className="text-sm opacity-70">
            Total Records
          </p>

          <p className="mt-2 text-2xl font-bold">
            {statistics.total}
          </p>
        </div>


        {/* PRESENT */}

        <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

          <p className="text-sm text-green-600">
            Present
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {statistics.present}
          </p>
        </div>


        {/* ABSENT */}

        <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

          <p className="text-sm text-red-600">
            Absent
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {statistics.absent}
          </p>
        </div>


        {/* LATE */}

        <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

          <p className="text-sm text-yellow-600">
            Late
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {statistics.late}
          </p>
        </div>


        {/* EXCUSED */}

        <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

          <p className="text-sm text-blue-600">
            Excused
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {statistics.excused}
          </p>
        </div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

        <div className="flex items-center justify-between mb-4">

          <div>
            <h2 className="font-semibold text-[var(--color-text)]">
              Filter Records
            </h2>

            <p className="text-xs opacity-60 mt-1">
              Narrow the attendance history.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Reset Filters
          </button>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* SESSION */}

          <div>
            <label className="block mb-1.5 text-sm font-medium">
              Academic Session
            </label>

            <select
              name="academic_session"
              value={filters.academic_session}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">
                All Sessions
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


          {/* TERM */}

          <div>
            <label className="block mb-1.5 text-sm font-medium">
              Term
            </label>

            <select
              name="term"
              value={filters.term}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">
                All Terms
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
            <label className="block mb-1.5 text-sm font-medium">
              Class
            </label>

            <select
              name="class_level"
              value={filters.class_level}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">
                All Classes
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


          {/* SUBJECT */}

          <div>
            <label className="block mb-1.5 text-sm font-medium">
              Subject
            </label>

            <select
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">
                All Subjects
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.name}
                </option>
              ))}
            </select>
          </div>


          {/* DATE */}

          <div>
            <label className="block mb-1.5 text-sm font-medium">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

        </div>

      </div>


      {/* =================================================
          RECORDS TABLE
      ================================================= */}

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">

        {/* TABLE HEADER */}

        <div className="px-5 py-4 border-b border-[var(--color-border)]">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <div>
              <h2 className="font-semibold">
                Attendance History
              </h2>

              <p className="text-xs opacity-60 mt-1">
                {records.length} record
                {records.length === 1 ? "" : "s"} found
              </p>
            </div>

            {filters.date && (
              <span className="text-sm opacity-70">
                {formatDate(filters.date)}
              </span>
            )}

          </div>

        </div>


        {/* LOADING */}

        {loadingRecords && (
          <div className="flex items-center justify-center py-12">

            <div className="text-center">

              <div className="w-8 h-8 mx-auto mb-3 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />

              <p className="text-sm opacity-60">
                Loading records...
              </p>

            </div>

          </div>
        )}


        {/* EMPTY */}

        {!loadingRecords && records.length === 0 && (
          <div className="py-16 text-center">

            <div className="text-4xl mb-3">
              📋
            </div>

            <h3 className="font-semibold">
              No attendance records found
            </h3>

            <p className="mt-1 text-sm opacity-60">
              Try changing your filters or take attendance first.
            </p>

          </div>
        )}


        {/* TABLE */}

        {!loadingRecords && records.length > 0 && (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">

                  <th className="px-5 py-3 font-medium opacity-70">
                    Student
                  </th>

                  <th className="px-5 py-3 font-medium opacity-70">
                    Class
                  </th>

                  <th className="px-5 py-3 font-medium opacity-70">
                    Subject
                  </th>

                  <th className="px-5 py-3 font-medium opacity-70">
                    Date
                  </th>

                  <th className="px-5 py-3 font-medium opacity-70">
                    Status
                  </th>

                  <th className="px-5 py-3 font-medium opacity-70">
                    Remarks
                  </th>

                  <th className="px-5 py-3 font-medium opacity-70 text-right">
                    Actions
                  </th>

                </tr>
              </thead>


              <tbody>

                {records.map((record) => {

                  const status =
                    statusConfig[record.status] ||
                    {
                      label:
                        record.status || "Unknown",
                      className:
                        "bg-gray-100 text-gray-700 border border-gray-200",
                    };


                  const isEditing =
                    editingId === record.id;

                  const isSaving =
                    savingId === record.id;

                  const isDeleting =
                    deletingId === record.id;


                  return (
                    <tr
                      key={record.id}
                      className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-black/[0.02]"
                    >

                      {/* STUDENT */}

                      <td className="px-5 py-4">

                        <div className="font-medium">
                          {record.student_name ||
                            "Unknown Student"}
                        </div>

                      </td>


                      {/* CLASS */}

                      <td className="px-5 py-4 opacity-80">
                        {record.class_name || "-"}
                      </td>


                      {/* SUBJECT */}

                      <td className="px-5 py-4 opacity-80">
                        {record.subject_name || "General"}
                      </td>


                      {/* DATE */}

                      <td className="px-5 py-4 whitespace-nowrap">
                        {formatDate(record.date)}
                      </td>


                      {/* STATUS */}

                      <td className="px-5 py-4">

                        {isEditing ? (
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-sm"
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
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        )}

                      </td>


                      {/* REMARKS */}

                      <td className="px-5 py-4 min-w-[180px]">

                        {isEditing ? (
                          <input
                            type="text"
                            name="remarks"
                            value={editForm.remarks}
                            onChange={handleEditChange}
                            placeholder="Optional remarks"
                            className="w-full min-w-[180px] px-3 py-2 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                        ) : (
                          <span className="opacity-70">
                            {record.remarks || "-"}
                          </span>
                        )}

                      </td>


                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleSaveEdit(record)
                              }
                              disabled={
                                isSaving
                              }
                              className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-medium hover:opacity-90 disabled:opacity-50"
                            >
                              {isSaving
                                ? "Saving..."
                                : "Save"}
                            </button>

                            <button
                              type="button"
                              onClick={
                                handleCancelEdit
                              }
                              disabled={
                                isSaving
                              }
                              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium hover:bg-black/[0.03]"
                            >
                              Cancel
                            </button>

                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(record)
                              }
                              disabled={
                                isDeleting
                              }
                              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium hover:bg-black/[0.03]"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(record)
                              }
                              disabled={
                                isDeleting
                              }
                              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                            >
                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default AttendanceRecords;