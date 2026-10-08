import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const Principals = () => {
  const navigate = useNavigate();

  const [principals, setPrincipals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [statusModal, setStatusModal] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ---------------------------------------------------------
  // LOAD PRINCIPALS
  // ---------------------------------------------------------
  const loadPrincipals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/principals/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setPrincipals(data);
    } catch (err) {
      console.error("Failed to load principals:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load principals. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrincipals();
  }, []);

  // ---------------------------------------------------------
  // FILTER PRINCIPALS
  // ---------------------------------------------------------
  const filteredPrincipals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return principals.filter((principal) => {
      const matchesSearch =
        !query ||
        principal.full_name?.toLowerCase().includes(query) ||
        principal.employee_id?.toLowerCase().includes(query) ||
        principal.email?.toLowerCase().includes(query) ||
        principal.phone_number?.toLowerCase().includes(query) ||
        principal.qualification?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && principal.is_active === true) ||
        (statusFilter === "INACTIVE" && principal.is_active === false);

      return matchesSearch && matchesStatus;
    });
  }, [principals, search, statusFilter]);

  // ---------------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------------
  const totalPrincipals = principals.length;

  const activePrincipals = principals.filter(
    (principal) => principal.is_active
  ).length;

  const inactivePrincipals = principals.filter(
    (principal) => !principal.is_active
  ).length;

  // ---------------------------------------------------------
  // DELETE PRINCIPAL
  // ---------------------------------------------------------
  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      setDeleting(true);

      await api.delete(`/principals/${deleteModal.id}/`);

      setPrincipals((current) =>
        current.filter((principal) => principal.id !== deleteModal.id)
      );

      setDeleteModal(null);
    } catch (err) {
      console.error("Failed to delete principal:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete principal. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ---------------------------------------------------------
  // TOGGLE STATUS
  // ---------------------------------------------------------
  const handleToggleStatus = async () => {
    if (!statusModal) return;

    try {
      setUpdatingStatus(true);

      const newStatus = !statusModal.is_active;

      const response = await api.patch(`/principals/${statusModal.id}/`, {
        is_active: newStatus,
      });

      setPrincipals((current) =>
        current.map((principal) =>
          principal.id === statusModal.id
            ? response.data
            : principal
        )
      );

      setStatusModal(null);
    } catch (err) {
      console.error("Failed to update principal status:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to update principal status. Please try again."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ---------------------------------------------------------
  // PROFILE IMAGE
  // ---------------------------------------------------------
  const getProfileImage = (principal) => {
    if (!principal?.user_id) return null;

    return null;
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return "P";

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // ---------------------------------------------------------
  // STATUS BADGE
  // ---------------------------------------------------------
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
      {/* ---------------------------------------------------
          HEADER
      --------------------------------------------------- */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Principals
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage principals assigned to your school.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/school-admin/people/principals/add")}
          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <span className="mr-2 text-lg">+</span>
          Add Principal
        </button>
      </div>

      {/* ---------------------------------------------------
          ERROR
      --------------------------------------------------- */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-4 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* ---------------------------------------------------
          STATISTICS
      --------------------------------------------------- */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Principals
          </p>

          <p className="mt-2 text-2xl font-bold">
            {totalPrincipals}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {activePrincipals}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-500 dark:text-gray-400">
            {inactivePrincipals}
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------
          FILTERS
      --------------------------------------------------- */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-gray-700">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex-1">
            <label className="sr-only">
              Search principals
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, employee ID, email, phone or qualification..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* ---------------------------------------------------
          CONTENT
      --------------------------------------------------- */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading principals...
            </div>
          </div>
        ) : filteredPrincipals.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl dark:bg-gray-800">
              👤
            </div>

            <h3 className="text-lg font-semibold">
              No principals found
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
              {search || statusFilter !== "ALL"
                ? "No principals match your current search or filter."
                : "There are no principals registered yet."}
            </p>
          </div>
        ) : (
          <>
            {/* ------------------------------------------------
                DESKTOP TABLE
            ------------------------------------------------ */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/70">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Principal
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Employee ID
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Qualification
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Appointment Date
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
                  {filteredPrincipals.map((principal) => {
                    const image = getProfileImage(principal);

                    return (
                      <tr
                        key={principal.id}
                        className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        {/* Principal */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            {image ? (
                              <img
                                src={image}
                                alt={principal.full_name}
                                className="h-11 w-11 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                                {getInitials(
                                  principal.full_name
                                )}
                              </div>
                            )}

                            <div className="ml-3">
                              <p className="font-semibold">
                                {principal.full_name || "—"}
                              </p>

                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {principal.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Employee ID */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {principal.employee_id || "—"}
                        </td>

                        {/* Qualification */}
                        <td className="max-w-xs px-6 py-4 text-sm">
                          <span className="line-clamp-2 text-gray-700 dark:text-gray-300">
                            {principal.qualification || "—"}
                          </span>
                        </td>

                        {/* Appointment Date */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {principal.appointment_date
                            ? new Date(
                                principal.appointment_date
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge
                            active={principal.is_active}
                          />
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/school-admin/people/principals/${principal.id}`
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
                                  `/school-admin/people/principals/${principal.id}/edit`
                                )
                              }
                              className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setStatusModal(principal)
                              }
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                principal.is_active
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                              }`}
                            >
                              {principal.is_active
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteModal(principal)
                              }
                              className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ------------------------------------------------
                MOBILE CARDS
            ------------------------------------------------ */}
            <div className="divide-y divide-gray-200 md:hidden dark:divide-gray-700">
              {filteredPrincipals.map((principal) => {
                const image = getProfileImage(principal);

                return (
                  <div
                    key={principal.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center">
                        {image ? (
                          <img
                            src={image}
                            alt={principal.full_name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                            {getInitials(
                              principal.full_name
                            )}
                          </div>
                        )}

                        <div className="ml-3 min-w-0">
                          <h3 className="truncate font-semibold">
                            {principal.full_name || "—"}
                          </h3>

                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                            {principal.email || "—"}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        active={principal.is_active}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Employee ID
                        </p>

                        <p className="mt-1 font-medium">
                          {principal.employee_id || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Appointment
                        </p>

                        <p className="mt-1 font-medium">
                          {principal.appointment_date
                            ? new Date(
                                principal.appointment_date
                              ).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Qualification
                        </p>

                        <p className="mt-1 font-medium">
                          {principal.qualification || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/school-admin/people/principals/${principal.id}`
                          )
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/school-admin/people/principals/${principal.id}/edit`
                          )
                        }
                        className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setStatusModal(principal)
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          principal.is_active
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {principal.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteModal(principal)
                        }
                        className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* -----------------------------------------------------
          STATUS MODAL
      ----------------------------------------------------- */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
            <h2 className="text-lg font-bold">
              {statusModal.is_active
                ? "Deactivate Principal"
                : "Activate Principal"}
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to{" "}
              {statusModal.is_active
                ? "deactivate"
                : "activate"}{" "}
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

      {/* -----------------------------------------------------
          DELETE MODAL
      ----------------------------------------------------- */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
              Delete Principal
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to permanently delete{" "}
              <strong className="text-[var(--color-text)]">
                {deleteModal.full_name}
              </strong>
              ?
            </p>

            <p className="mt-2 text-xs text-red-500">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-600"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Principals;