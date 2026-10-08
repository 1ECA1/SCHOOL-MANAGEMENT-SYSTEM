import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getParents } from "../../../services/studentsService";

const STATUS_ORDER = {
  ACTIVE: 1,
  GRADUATED: 2,
  TRANSFERRED: 3,
  SUSPENDED: 4,
  WITHDRAWN: 5,
};

const STATUS_LABELS = {
  ACTIVE: "Active",
  GRADUATED: "Graduated",
  TRANSFERRED: "Transferred",
  SUSPENDED: "Suspended",
  WITHDRAWN: "Withdrawn",
};

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function getStatusClass(status) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

    case "GRADUATED":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";

    case "TRANSFERRED":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";

    case "SUSPENDED":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";

    case "WITHDRAWN":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  }
}

function getImageUrl(image) {
  if (!image) {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";

  return `${baseUrl
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "")}${
    image.startsWith("/") ? image : `/${image}`
  }`;
}

export default function Parents() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // =====================================================
  // LOAD PARENTS
  // =====================================================

  const loadParents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getParents();

      const parentList = Array.isArray(data)
        ? data
        : data?.results || [];

      setParents(parentList);
    } catch (err) {
      console.error("Failed to load parents:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load parents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParents();
  }, []);

  // =====================================================
  // SEARCH + SORT
  // =====================================================

  const filteredParents = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = [...parents];

    if (query) {
      result = result.filter((parent) => {
        const studentText = (parent.students || [])
          .map((student) =>
            [
              student.full_name,
              student.admission_number,
              student.status,
            ]
              .filter(Boolean)
              .join(" ")
          )
          .join(" ");

        const searchableText = [
          parent.full_name,
          parent.relationship,
          parent.phone_number,
          parent.email,
          parent.occupation,
          studentText,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    result.sort((a, b) => {
      const aStatus = String(
        a.students?.[0]?.status || "WITHDRAWN"
      ).toUpperCase();

      const bStatus = String(
        b.students?.[0]?.status || "WITHDRAWN"
      ).toUpperCase();

      return (
        (STATUS_ORDER[aStatus] || 99) -
        (STATUS_ORDER[bStatus] || 99)
      );
    });

    return result;
  }, [parents, search]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const stats = useMemo(() => {
    const totalParents = parents.length;

    const parentsWithActiveStudents = parents.filter(
      (parent) =>
        (parent.students || []).some(
          (student) =>
            String(student.status || "").toUpperCase() ===
            "ACTIVE"
        )
    ).length;

    const emergencyContacts = parents.filter(
      (parent) => parent.emergency_contact === true
    ).length;

    return {
      totalParents,
      parentsWithActiveStudents,
      emergencyContacts,
    };
  }, [parents]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading parents...
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Parents & Guardians
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage parents and guardians of students in your school.
          </p>
        </div>

        <button
          type="button"
          onClick={loadParents}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadParents}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Parents */}

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Parents
          </p>

          <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
            {stats.totalParents}
          </p>
        </div>

        {/* Parents With Active Students */}

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Parents With Active Students
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.parentsWithActiveStudents}
          </p>
        </div>

        {/* Emergency Contacts */}

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Emergency Contacts
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.emergencyContacts}
          </p>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-gray-800">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search parent, phone, email, student or admission number..."
          className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-blue-900/30"
        />
      </div>

      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}

      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-800 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Parent / Guardian
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Relationship
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Admission No.
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Contact
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Student Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredParents.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {search
                      ? "No parents found matching your search."
                      : "No parents found."}
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => {
                  const student = parent.students?.[0];

                  const profileImage = getImageUrl(
                    parent.profile_image
                  );

                  const status = String(
                    student?.status || "WITHDRAWN"
                  ).toUpperCase();

                  return (
                    <tr
                      key={parent.id}
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      {/* Parent */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt={parent.full_name}
                              className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";

                                if (
                                  e.currentTarget
                                    .nextElementSibling
                                ) {
                                  e.currentTarget.nextElementSibling.style.display =
                                    "flex";
                                }
                              }}
                            />
                          ) : null}

                          <div
                            className={`h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300 ${
                              profileImage
                                ? "hidden"
                                : "flex"
                            }`}
                          >
                            {getInitials(
                              parent.full_name
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--color-text)]">
                              {parent.full_name || "—"}
                            </p>

                            <p className="max-w-[220px] truncate text-xs text-gray-500 dark:text-gray-400">
                              {parent.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Relationship */}

                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {parent.relationship || "-"}
                      </td>

                      {/* Student */}

                      <td className="px-6 py-4">
                        {student ? (
                          <div>
                            <p className="font-medium text-[var(--color-text)]">
                              {student.full_name || "—"}
                            </p>

                            {parent.student_count > 1 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                +{parent.student_count - 1} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No student
                          </span>
                        )}
                      </td>

                      {/* Admission */}

                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {student?.admission_number || "-"}
                      </td>

                      {/* Contact */}

                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {parent.phone_number || "-"}
                        </p>

                        {parent.emergency_contact && (
                          <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            Emergency
                          </span>
                        )}
                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            status
                          )}`}
                        >
                          {STATUS_LABELS[status] ||
                            status}
                        </span>
                      </td>

                      {/* Action */}

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/school-admin/people/parents/${parent.id}`
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          MOBILE CARDS
      ===================================================== */}

      <div className="space-y-4 md:hidden">
        {filteredParents.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            {search
              ? "No parents found matching your search."
              : "No parents found."}
          </div>
        ) : (
          filteredParents.map((parent) => {
            const student = parent.students?.[0];

            const profileImage = getImageUrl(
              parent.profile_image
            );

            const status = String(
              student?.status || "WITHDRAWN"
            ).toUpperCase();

            return (
              <div
                key={parent.id}
                className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-gray-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={parent.full_name}
                        className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";

                          if (
                            e.currentTarget
                              .nextElementSibling
                          ) {
                            e.currentTarget.nextElementSibling.style.display =
                              "flex";
                          }
                        }}
                      />
                    ) : null}

                    <div
                      className={`h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300 ${
                        profileImage ? "hidden" : "flex"
                      }`}
                    >
                      {getInitials(parent.full_name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--color-text)]">
                        {parent.full_name || "—"}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {parent.relationship || "-"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                      status
                    )}`}
                  >
                    {STATUS_LABELS[status] || status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Student
                    </span>

                    <span className="text-right text-sm font-medium text-[var(--color-text)]">
                      {student?.full_name || "-"}
                    </span>
                  </div>

                  {parent.student_count > 1 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Other Students
                      </span>

                      <span className="text-right text-sm text-gray-700 dark:text-gray-300">
                        +{parent.student_count - 1}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Admission No.
                    </span>

                    <span className="text-right text-sm text-gray-700 dark:text-gray-300">
                      {student?.admission_number || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Phone
                    </span>

                    <span className="text-right text-sm text-gray-700 dark:text-gray-300">
                      {parent.phone_number || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </span>

                    <span className="break-all text-right text-sm text-gray-700 dark:text-gray-300">
                      {parent.email || "-"}
                    </span>
                  </div>
                </div>

                {parent.emergency_contact && (
                  <div className="mt-3">
                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Emergency Contact
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/school-admin/people/parents/${parent.id}`
                    )
                  }
                  className="mt-4 w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  View Parent
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* =====================================================
          RESULT COUNT
      ===================================================== */}

      {filteredParents.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredParents.length} of{" "}
          {parents.length} parent
          {parents.length === 1 ? "" : "s"}.
        </p>
      )}
    </div>
  );
}