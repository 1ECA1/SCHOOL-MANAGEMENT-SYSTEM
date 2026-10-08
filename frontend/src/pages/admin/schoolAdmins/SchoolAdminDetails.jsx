import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  Mail,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../services/api";

const SchoolAdminDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/school-super-admin/super-admin/school-admins/${id}/`,
        );

        setAdmin(response.data);
      } catch (err) {
        console.error("Failed to load School Admin:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load School Admin details.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdmin();
    }
  }, [id]);

  const getName = () => {
    if (!admin) return "";

    const fullName = `${admin.first_name || ""} ${
      admin.last_name || ""
    }`.trim();

    return fullName || admin.username || "School Admin";
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-text/50">
          Loading School Admin details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-w-0">
        <button
          type="button"
          onClick={() => navigate("/admin/school-admins")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-text/60 transition hover:text-primary"
        >
          <ArrowLeft size={18} />
          Back to School Admins
        </button>

        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="w-full min-w-0">
      {/* Top Actions */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/school-admins")}
          className="inline-flex h-10 items-center gap-2 text-sm font-medium text-text/60 transition hover:text-primary"
        >
          <ArrowLeft size={18} />
          Back to School Admins
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(`/admin/school-admins/${id}/edit`)
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <Edit size={17} />
          <span>Edit</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-card bg-card p-4 shadow-sm sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {getName().charAt(0).toUpperCase()}
          </div>

          {/* Name */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-xl font-semibold text-text sm:text-2xl">
                {getName()}
              </h1>

              <span
                className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  admin.is_active
                    ? "bg-green-500/10 text-green-600"
                    : "bg-red-500/10 text-red-600"
                }`}
              >
                {admin.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="mt-1 truncate text-sm text-text/50">
              @{admin.username}
            </p>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Account Information */}
        <div className="rounded-xl border border-card bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <User
              size={19}
              className="shrink-0 text-primary"
            />

            <h2 className="font-semibold text-text">
              Account Information
            </h2>
          </div>

          <div className="space-y-4">
            <InfoRow
              label="Username"
              value={admin.username}
            />

            <InfoRow
              label="Role"
              value={
                admin.role_display || "School Admin"
              }
            />

            <InfoRow
              label="First Name"
              value={admin.first_name || "—"}
            />

            <InfoRow
              label="Last Name"
              value={admin.last_name || "—"}
            />

            <InfoRow
              label="Status"
              value={
                admin.is_active
                  ? "Active"
                  : "Inactive"
              }
            />
          </div>
        </div>

        {/* School Assignment */}
        <div className="rounded-xl border border-card bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck
              size={19}
              className="shrink-0 text-primary"
            />

            <h2 className="font-semibold text-text">
              School Assignment
            </h2>
          </div>

          <div className="space-y-4">
            <InfoRow
              label="School"
              value={
                admin.school_name ||
                "Not assigned"
              }
            />

            <InfoRow
              label="School ID"
              value={
                admin.school !== null &&
                admin.school !== undefined
                  ? String(admin.school)
                  : "—"
              }
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-xl border border-card bg-card p-4 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Mail
              size={19}
              className="shrink-0 text-primary"
            />

            <h2 className="font-semibold text-text">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Email */}
            <div className="flex min-w-0 items-center gap-3 rounded-lg border border-card bg-background p-3">
              <Mail
                size={18}
                className="shrink-0 text-text/40"
              />

              <div className="min-w-0">
                <p className="text-xs text-text/50">
                  Email
                </p>

                <p className="truncate text-sm font-medium text-text">
                  {admin.email || "—"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex min-w-0 items-center gap-3 rounded-lg border border-card bg-background p-3">
              <Phone
                size={18}
                className="shrink-0 text-text/40"
              />

              <div className="min-w-0">
                <p className="text-xs text-text/50">
                  Phone Number
                </p>

                <p className="truncate text-sm font-medium text-text">
                  {admin.phone_number || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="rounded-xl border border-card bg-card p-4 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            {admin.is_active ? (
              <CheckCircle2
                size={19}
                className="shrink-0 text-green-600"
              />
            ) : (
              <XCircle
                size={19}
                className="shrink-0 text-red-600"
              />
            )}

            <h2 className="font-semibold text-text">
              Account Status
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow
              label="Created"
              value={formatDate(
                admin.created_at,
              )}
            />

            <InfoRow
              label="Last Updated"
              value={formatDate(
                admin.updated_at,
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 border-b border-card pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-sm text-text/50">
        {label}
      </span>

      <span className="min-w-0 truncate text-right text-sm font-medium text-text">
        {value || "—"}
      </span>
    </div>
  );
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

export default SchoolAdminDetails;