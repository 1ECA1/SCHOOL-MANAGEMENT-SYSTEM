import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const OtherStaff = () => {
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [statusModal, setStatusModal] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // =========================================================
  // LOAD OTHER STAFF
  // =========================================================

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/school-super-admin/users/other-staff/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setStaff(data);
    } catch (err) {
      console.error("Failed to load other staff:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load other staff. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // =========================================================
  // FILTER STAFF
  // =========================================================

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((person) => {
      const matchesSearch =
        !query ||
        person.full_name?.toLowerCase().includes(query) ||
        person.employee_number?.toLowerCase().includes(query) ||
        person.email?.toLowerCase().includes(query) ||
        person.phone_number?.toLowerCase().includes(query) ||
        person.role_display?.toLowerCase().includes(query);

      const matchesRole = roleFilter === "ALL" || person.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && person.is_active === true) ||
        (statusFilter === "INACTIVE" && person.is_active === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staff, search, roleFilter, statusFilter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalStaff = staff.length;

  const activeStaff = staff.filter((person) => person.is_active).length;

  const inactiveStaff = staff.filter((person) => !person.is_active).length;

  const accountantCount = staff.filter(
    (person) => person.role === "ACCOUNTANT",
  ).length;

  const librarianCount = staff.filter(
    (person) => person.role === "LIBRARIAN",
  ).length;

  const admissionOfficerCount = staff.filter(
    (person) => person.role === "ADMISSION_OFFICER",
  ).length;

  const examOfficerCount = staff.filter(
    (person) => person.role === "EXAM_OFFICER",
  ).length;

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const handleToggleStatus = async () => {
    if (!statusModal) return;

    try {
      setUpdatingStatus(true);
      setError("");

      const newStatus = !statusModal.is_active;

      await api.patch(`/school-super-admin/users/${statusModal.user_id}/`, {
        is_active: newStatus,
      });

      setStaff((current) =>
        current.map((person) =>
          person.user_id === statusModal.user_id
            ? {
                ...person,
                is_active: newStatus,
              }
            : person,
        ),
      );

      setStatusModal(null);
    } catch (err) {
      console.error("Failed to update staff status:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to update staff status. Please try again.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const getProfileImage = (person) => {
    return person?.profile_image || null;
  };

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return "S";

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // =========================================================
  // ROLE BADGE
  // =========================================================

  const RoleBadge = ({ role, label }) => {
    let classes =
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

    if (role === "ACCOUNTANT") {
      classes =
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }

    if (role === "LIBRARIAN") {
      classes =
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    }

    if (role === "ADMISSION_OFFICER") {
      classes =
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    }

    if (role === "EXAM_OFFICER") {
      classes =
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
    }

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
      >
        {label || role}
      </span>
    );
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const StatusBadge = ({ active }) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
          active
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        }`}
      >
        <span
          className={`mr-1.5 h-2 w-2 rounded-full ${
            active ? "bg-green-500" : "bg-gray-400"
          }`}
        />

        {active ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Other Staff</h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage accountants, librarians, admission officers and examination
            officers in your school.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/school-admin/people/other-staff/add")}
          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <span className="mr-2 text-lg">+</span>
          Add Staff
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <span className="whitespace-pre-line">{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-4 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Staff
          </p>

          <p className="mt-2 text-2xl font-bold">{totalStaff}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>

          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {activeStaff}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Accountants
          </p>

          <p className="mt-2 text-2xl font-bold">{accountantCount}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Librarians</p>

          <p className="mt-2 text-2xl font-bold">{librarianCount}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Officers</p>

          <p className="mt-2 text-2xl font-bold">
            {admissionOfficerCount + examOfficerCount}
          </p>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-gray-700">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex-1">
            <label className="sr-only">Search staff</label>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, employee number, role, email or phone..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="ALL">All Roles</option>

            <option value="ACCOUNTANT">Accountant / Bursar</option>

            <option value="LIBRARIAN">Librarian</option>

            <option value="ADMISSION_OFFICER">Admission Officer</option>

            <option value="EXAM_OFFICER">Exam / Assessment Officer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="ALL">All Status</option>

            <option value="ACTIVE">Active</option>

            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading other staff...
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl dark:bg-gray-800">
              👥
            </div>

            <h3 className="text-lg font-semibold">No staff found</h3>

            <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
              {search || roleFilter !== "ALL" || statusFilter !== "ALL"
                ? "No staff members match your current search or filters."
                : "There are no other staff members registered yet."}
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/70">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Staff
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Employee Number
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Employment Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStaff.map((person) => {
                    const image = getProfileImage(person);

                    return (
                      <tr
                        key={person.user_id}
                        className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        {/* STAFF */}

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            {image ? (
                              <img
                                src={image}
                                alt={person.full_name}
                                className="h-11 w-11 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                                {getInitials(person.full_name)}
                              </div>
                            )}

                            <div className="ml-3">
                              <p className="font-semibold">
                                {person.full_name || "—"}
                              </p>

                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {person.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}

                        <td className="whitespace-nowrap px-6 py-4">
                          <RoleBadge
                            role={person.role}
                            label={person.role_display}
                          />
                        </td>

                        {/* EMPLOYEE NUMBER */}

                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {person.employee_number || "—"}
                        </td>

                        {/* EMPLOYMENT DATE */}

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {person.employment_date
                            ? new Date(
                                person.employment_date,
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* STATUS */}

                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge active={person.is_active} />
                        </td>

                        {/* ACTIONS */}

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/school-admin/people/other-staff/${person.user_id}`,
                                )
                              }
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/school-admin/people/other-staff/${person.user_id}/edit`,
                                )
                              }
                              className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => setStatusModal(person)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                person.is_active
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                              }`}
                            >
                              {person.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <div className="divide-y divide-gray-200 md:hidden dark:divide-gray-700">
              {filteredStaff.map((person) => {
                const image = getProfileImage(person);

                return (
                  <div key={person.user_id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center">
                        {image ? (
                          <img
                            src={image}
                            alt={person.full_name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                            {getInitials(person.full_name)}
                          </div>
                        )}

                        <div className="ml-3 min-w-0">
                          <h3 className="truncate font-semibold">
                            {person.full_name || "—"}
                          </h3>

                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                            {person.email || "—"}
                          </p>
                        </div>
                      </div>

                      <StatusBadge active={person.is_active} />
                    </div>

                    <div className="mt-4">
                      <RoleBadge
                        role={person.role}
                        label={person.role_display}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Employee Number
                        </p>

                        <p className="mt-1 font-medium">
                          {person.employee_number || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Employment Date
                        </p>

                        <p className="mt-1 font-medium">
                          {person.employment_date
                            ? new Date(
                                person.employment_date,
                              ).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Phone
                        </p>

                        <p className="mt-1 font-medium">
                          {person.phone_number || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/school-admin/people/other-staff/${staff.user_id}`,
                          )
                        }
                        className="..."
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/school-admin/people/other-staff/${staff.user_id}/edit`,
                          )
                        }
                        className="..."
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatusModal(person)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          person.is_active
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {person.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
            <h2 className="text-lg font-bold">
              {statusModal.is_active
                ? "Deactivate Staff Member"
                : "Activate Staff Member"}
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to{" "}
              {statusModal.is_active ? "deactivate" : "activate"}{" "}
              <strong className="text-[var(--color-text)]">
                {statusModal.full_name}
              </strong>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => setStatusModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-600"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={updatingStatus}
                onClick={handleToggleStatus}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {updatingStatus
                  ? "Updating..."
                  : statusModal.is_active
                    ? "Deactivate"
                    : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherStaff;
