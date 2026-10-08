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

  if (parts.length === 0) return "?";

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
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";

    case "GRADUATED":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";

    case "TRANSFERRED":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400";

    case "SUSPENDED":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";

    case "WITHDRAWN":
      return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";

    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}

function getImageUrl(image) {
  if (!image) return null;

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

export default function AllParents({
  basePath = "/admin/parents",
}) {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadParents();
  }, []);

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
      const aStatus =
        a.students?.[0]?.status || "WITHDRAWN";

      const bStatus =
        b.students?.[0]?.status || "WITHDRAWN";

      return (
        (STATUS_ORDER[aStatus] || 99) -
        (STATUS_ORDER[bStatus] || 99)
      );
    });

    return result;
  }, [parents, search]);

  const stats = useMemo(() => {
    const totalParents = parents.length;

    const parentsWithActiveStudents = parents.filter(
      (parent) =>
        (parent.students || []).some(
          (student) => student.status === "ACTIVE"
        )
    ).length;

    const emergencyContacts = parents.filter(
      (parent) => parent.emergency_contact
    ).length;

    return {
      totalParents,
      parentsWithActiveStudents,
      emergencyContacts,
    };
  }, [parents]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Loading parents...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-[var(--color-background)] p-4 text-[var(--color-text)] md:p-6">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            All Parents
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage parents and guardians of students.
          </p>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Parents
          </p>

          <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
            {stats.totalParents}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Parents With Active Students
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.parentsWithActiveStudents}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Emergency Contacts
          </p>

          <p className="mt-2 text-2xl font-bold text-[var(--color-primary)]">
            {stats.emergencyContacts}
          </p>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-700">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search parent, phone, email, student or admission number..."
          className="w-full rounded-xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-700"
        />
      </div>

      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-[var(--color-background)] dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Parent / Guardian
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Relationship
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Admission No.
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Contact
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Student Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredParents.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No parents found.
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => {
                  const student = parent.students?.[0];

                  const profileImage = getImageUrl(
                    parent.profile_image
                  );

                  const status =
                    student?.status || "WITHDRAWN";

                  return (
                    <tr
                      key={parent.id}
                      className="transition hover:bg-[var(--color-background)]"
                    >
                      {/* Parent */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt={parent.full_name}
                              className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
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
                            className={`h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)] ${
                              profileImage
                                ? "hidden"
                                : "flex"
                            }`}
                          >
                            {getInitials(
                              parent.full_name
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-[var(--color-text)]">
                              {parent.full_name}
                            </p>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {parent.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Relationship */}
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {parent.relationship || "-"}
                      </td>

                      {/* Student */}
                      <td className="px-6 py-4">
                        {student ? (
                          <div>
                            <p className="font-medium text-[var(--color-text)]">
                              {student.full_name}
                            </p>

                            {parent.student_count > 1 && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                +{parent.student_count - 1} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            No student
                          </span>
                        )}
                      </td>

                      {/* Admission */}
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {student?.admission_number || "-"}
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {parent.phone_number || "-"}
                        </p>

                        {parent.emergency_contact && (
                          <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
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
                          {STATUS_LABELS[status] || status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `${basePath}/${parent.id}`
                            )
                          }
                          className="rounded-xl border border-slate-200 bg-[var(--color-card)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:border-slate-700"
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
          <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:text-slate-400">
            No parents found.
          </div>
        ) : (
          filteredParents.map((parent) => {
            const student = parent.students?.[0];

            const profileImage = getImageUrl(
              parent.profile_image
            );

            const status =
              student?.status || "WITHDRAWN";

            return (
              <div
                key={parent.id}
                className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={parent.full_name}
                        className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
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
                      className={`h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)] ${
                        profileImage ? "hidden" : "flex"
                      }`}
                    >
                      {getInitials(parent.full_name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--color-text)]">
                        {parent.full_name}
                      </p>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
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

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-700">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Student
                    </span>

                    <span className="text-right text-sm font-medium text-[var(--color-text)]">
                      {student?.full_name || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Admission No.
                    </span>

                    <span className="text-right text-sm text-slate-600 dark:text-slate-300">
                      {student?.admission_number || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Phone
                    </span>

                    <span className="text-right text-sm text-slate-600 dark:text-slate-300">
                      {parent.phone_number || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Email
                    </span>

                    <span className="max-w-[65%] break-all text-right text-sm text-slate-600 dark:text-slate-300">
                      {parent.email || "-"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `${basePath}/${parent.id}`
                    )
                  }
                  className="mt-4 w-full rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  View Parent
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}