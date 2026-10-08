
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getParentChildren } from "../../services/parentService";
import api from "../../services/api";

export default function ParentAttendance() {
  const { user } = useAuth();

  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedChild, setSelectedChild] = useState("");

  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD PARENT'S CHILDREN
  // =====================================================

  useEffect(() => {
    const loadChildren = async () => {
      if (!user?.parent_id) {
        setError("No parent profile is linked to this account.");
        setLoadingChildren(false);
        return;
      }

      try {
        setLoadingChildren(true);
        setError("");

        const data = await getParentChildren(user.parent_id);

        setChildren(data);

        if (data.length > 0) {
          setSelectedChild(String(data[0].id));
        }
      } catch (err) {
        console.error("Failed to load children:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load your children."
        );
      } finally {
        setLoadingChildren(false);
      }
    };

    loadChildren();
  }, [user?.parent_id]);

  // =====================================================
  // LOAD ATTENDANCE
  // =====================================================

  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedChild) {
        setAttendance([]);
        return;
      }

      try {
        setLoadingAttendance(true);
        setError("");

        const { data } = await api.get("/attendance/", {
          params: {
            student: selectedChild,
          },
        });

        const records = Array.isArray(data)
          ? data
          : data?.results || [];

        setAttendance(records);
      } catch (err) {
        console.error("Failed to load attendance:", err);

        setAttendance([]);

        setError(
          err?.response?.data?.detail ||
            "Unable to load attendance records."
        );
      } finally {
        setLoadingAttendance(false);
      }
    };

    loadAttendance();
  }, [selectedChild]);

  // =====================================================
  // SELECTED CHILD
  // =====================================================

  const selectedChildData = useMemo(() => {
    return children.find(
      (child) =>
        String(child.id) === String(selectedChild)
    );
  }, [children, selectedChild]);

  // =====================================================
  // ATTENDANCE SUMMARY
  // =====================================================

  const summary = useMemo(() => {
    return attendance.reduce(
      (result, record) => {
        result.total += 1;

        switch (record.status) {
          case "PRESENT":
            result.present += 1;
            break;

          case "ABSENT":
            result.absent += 1;
            break;

          case "LATE":
            result.late += 1;
            break;

          case "EXCUSED":
            result.excused += 1;
            break;

          default:
            break;
        }

        return result;
      },
      {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      }
    );
  }, [attendance]);

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-secondary/10 text-secondary";

      case "ABSENT":
        return "bg-primary/10 text-primary";

      case "LATE":
        return "bg-secondary/20 text-secondary";

      case "EXCUSED":
        return "bg-primary/10 text-primary";

      default:
        return "bg-background text-text";
    }
  };

  const getStatusLabel = (record) => {
    if (record.status_display) {
      return record.status_display;
    }

    if (!record.status) {
      return "Unknown";
    }

    return (
      record.status.charAt(0) +
      record.status.slice(1).toLowerCase()
    );
  };

  // =====================================================
  // LOADING CHILDREN
  // =====================================================

  if (loadingChildren) {
    return (
      <div className="min-h-full bg-background p-6">
        <div className="rounded-xl bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-text/60">
            Loading your children...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // INITIAL ERROR
  // =====================================================

  if (error && children.length === 0) {
    return (
      <div className="min-h-full bg-background p-6">
        <div className="rounded-xl border border-primary/20 bg-card p-6">
          <h2 className="font-semibold text-primary">
            Unable to load attendance
          </h2>

          <p className="mt-2 text-sm text-text/60">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO CHILDREN
  // =====================================================

  if (children.length === 0) {
    return (
      <div className="min-h-full bg-background p-6">
        <div className="rounded-xl bg-card p-8 text-center shadow-sm">
          <div className="text-4xl">
            👨‍👩‍👧‍👦
          </div>

          <h2 className="mt-3 text-lg font-semibold text-text">
            No Children Found
          </h2>

          <p className="mt-2 text-sm text-text/60">
            There are currently no students linked to
            your parent account.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="min-h-full bg-background p-6">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-text/60">
          View attendance records for your children.
        </p>
      </div>

      {/* =================================================
          CHILD SELECTOR
      ================================================= */}

      <div className="mb-6 rounded-xl bg-card p-5 shadow-sm">
        <div className="max-w-md">
          <label className="mb-2 block text-sm font-medium text-text">
            Select Child
          </label>

          <select
            value={selectedChild}
            onChange={(e) =>
              setSelectedChild(e.target.value)
            }
            className="w-full rounded-lg border border-text/15 bg-card px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {children.map((child) => (
              <option
                key={child.id}
                value={child.id}
              >
                {child.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =================================================
          CHILD INFORMATION
      ================================================= */}

      {selectedChildData && (
        <div className="mb-6 rounded-xl bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-text">
                {selectedChildData.full_name}
              </h2>

              <p className="mt-1 text-sm text-text/60">
                {selectedChildData.admission_number ||
                  "No admission number"}

                {selectedChildData.current_class
                  ? ` • ${selectedChildData.current_class}`
                  : ""}
              </p>
            </div>

            {selectedChildData.current_term && (
              <div className="text-sm text-text/60">
                Current Term:{" "}
                <span className="font-medium text-text">
                  {selectedChildData.current_term}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-card p-4">
          <p className="text-sm text-primary">
            {error}
          </p>
        </div>
      )}

      {/* =================================================
          ATTENDANCE SUMMARY
      ================================================= */}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">

        {/* TOTAL */}

        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-text/60">
            Total
          </p>

          <p className="mt-1 text-2xl font-bold text-text">
            {summary.total}
          </p>
        </div>

        {/* PRESENT */}

        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-text/60">
            Present
          </p>

          <p className="mt-1 text-2xl font-bold text-secondary">
            {summary.present}
          </p>
        </div>

        {/* ABSENT */}

        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-text/60">
            Absent
          </p>

          <p className="mt-1 text-2xl font-bold text-primary">
            {summary.absent}
          </p>
        </div>

        {/* LATE */}

        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-text/60">
            Late
          </p>

          <p className="mt-1 text-2xl font-bold text-secondary">
            {summary.late}
          </p>
        </div>

        {/* EXCUSED */}

        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-text/60">
            Excused
          </p>

          <p className="mt-1 text-2xl font-bold text-primary">
            {summary.excused}
          </p>
        </div>
      </div>

      {/* =================================================
          ATTENDANCE RECORDS
      ================================================= */}

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">

        {/* TABLE HEADER */}

        <div className="border-b border-text/10 px-5 py-4">
          <h2 className="font-semibold text-text">
            Attendance Records
          </h2>

          <p className="mt-1 text-xs text-text/60">
            Class attendance and subject attendance
            records for the selected child.
          </p>
        </div>

        {/* LOADING */}

        {loadingAttendance ? (
          <div className="p-10 text-center">
            <p className="text-sm text-text/60">
              Loading attendance records...
            </p>
          </div>
        ) : attendance.length === 0 ? (

          /* NO RECORDS */

          <div className="p-10 text-center">
            <div className="text-4xl">
              📋
            </div>

            <h3 className="mt-3 font-medium text-text">
              No Attendance Records
            </h3>

            <p className="mt-1 text-sm text-text/60">
              No attendance records have been
              recorded for this child.
            </p>
          </div>

        ) : (

          /* TABLE */

          <div className="overflow-x-auto">
            <table className="min-w-full">

              <thead className="bg-background">
                <tr>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text/60">
                    Date
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text/60">
                    Type
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text/60">
                    Class
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text/60">
                    Subject
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text/60">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text/60">
                    Remarks
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-text/10">

                {attendance.map((record) => {

                  const isSubjectAttendance =
                    Boolean(record.subject);

                  return (
                    <tr
                      key={record.id}
                      className="transition hover:bg-background"
                    >

                      {/* DATE */}

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-text">
                        {formatDate(record.date)}
                      </td>

                      {/* TYPE */}

                      <td className="px-5 py-4 text-sm">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            isSubjectAttendance
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary/10 text-secondary"
                          }`}
                        >
                          {isSubjectAttendance
                            ? "Subject"
                            : "Class"}
                        </span>
                      </td>

                      {/* CLASS */}

                      <td className="px-5 py-4 text-sm text-text">
                        {record.class_name || "—"}
                      </td>

                      {/* SUBJECT */}

                      <td className="px-5 py-4 text-sm text-text">
                        {record.subject_name || "General"}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4 text-sm">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {getStatusLabel(record)}
                        </span>
                      </td>

                      {/* REMARKS */}

                      <td className="max-w-xs px-5 py-4 text-sm text-text/70">
                        {record.remarks || "—"}
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