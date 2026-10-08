import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";

const SchoolAdmins = () => {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchSchoolAdmins = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(
        "/school-super-admin/super-admin/school-admins/",
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setAdmins(data);
    } catch (err) {
      console.error("Failed to load School Admins:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load School Admins. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchoolAdmins();
  }, []);

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return admins;
    }

    return admins.filter((admin) => {
      const name = `${admin.first_name || ""} ${
        admin.last_name || ""
      }`.trim();

      return [
        name,
        admin.full_name,
        admin.username,
        admin.email,
        admin.school_name,
        admin.phone_number,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        );
    });
  }, [admins, search]);

  const getName = (admin) => {
    const fullName = `${admin.first_name || ""} ${
      admin.last_name || ""
    }`.trim();

    return fullName || admin.username || "Unnamed Admin";
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="w-full min-w-0">
      {/* Header */}
      <div className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-text sm:text-2xl">
                School Admins
              </h1>

              <p className="text-sm text-text/60">
                Manage administrators assigned to your schools.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => fetchSchoolAdmins(true)}
            disabled={loading || refreshing}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-card bg-card px-3 text-sm font-medium text-text shadow-sm transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/school-admins/add")}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:flex-none"
          >
            <Plus size={18} />
            <span>Add School Admin</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 rounded-xl border border-card bg-card p-3 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, username, email or school..."
            className="h-11 w-full rounded-lg border border-card bg-background pl-10 pr-10 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary"
          />

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 transition hover:text-text"
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border border-card bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-card bg-background/60">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text/50">
                  Name
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text/50">
                  School Assigned To
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text/50">
                  Email
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text/50">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-text/50">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-text/50"
                  >
                    Loading School Admins...
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-text/50"
                  >
                    {search
                      ? "No School Admins match your search."
                      : "No School Admins found."}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b border-card last:border-b-0 hover:bg-background/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {getName(admin)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-text">
                            {getName(admin)}
                          </p>

                          <p className="truncate text-xs text-text/50">
                            @{admin.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-text">
                      {admin.school_name || "Not assigned"}
                    </td>

                    <td className="px-5 py-4 text-sm text-text/70">
                      {admin.email || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          admin.is_active
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {admin.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/school-admins/${admin.id}`,
                          )
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-card bg-background px-3 text-sm font-medium text-text transition hover:border-primary hover:text-primary"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile List */}
      <div className="space-y-2 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-card bg-card px-4 py-10 text-center text-sm text-text/50 shadow-sm">
            Loading School Admins...
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="rounded-xl border border-card bg-card px-4 py-10 text-center text-sm text-text/50 shadow-sm">
            {search
              ? "No School Admins match your search."
              : "No School Admins found."}
          </div>
        ) : (
          filteredAdmins.map((admin) => (
            <div
              key={admin.id}
              className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-card bg-card p-3 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {getName(admin).charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-text">
                    {getName(admin)}
                  </p>

                  <p className="truncate text-xs text-text/50">
                    @{admin.username}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/school-admins/${admin.id}`)
                }
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-card bg-background px-3 text-sm font-medium text-text transition hover:border-primary hover:text-primary"
              >
                <Eye size={16} />
                <span>View</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Count */}
      {!loading && filteredAdmins.length > 0 && (
        <p className="mt-3 text-xs text-text/50">
          Showing {filteredAdmins.length} of {admins.length} School Admin
          {admins.length === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
};

export default SchoolAdmins;