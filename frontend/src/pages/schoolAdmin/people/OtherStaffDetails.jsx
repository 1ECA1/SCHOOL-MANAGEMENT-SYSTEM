import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";

const ROLE_LABELS = {
  ACCOUNTANT: "Finance Officer / Bursar",
  LIBRARIAN: "Librarian",
  ADMISSION_OFFICER: "Admission Officer",
  EXAM_OFFICER: "Exam / Assessment Officer",
};

function getRoleLabel(role, fallback = "") {
  return ROLE_LABELS[role] || fallback || role || "Staff";
}

function getInitials(firstName = "", lastName = "") {
  const first = firstName?.trim()?.charAt(0) || "";
  const last = lastName?.trim()?.charAt(0) || "";

  return `${first}${last}`.toUpperCase() || "ST";
}

function getProfileImageUrl(profileImage) {
  if (!profileImage) {
    return null;
  }

  if (
    profileImage.startsWith("http://") ||
    profileImage.startsWith("https://")
  ) {
    return profileImage;
  }

  const baseURL = api.defaults.baseURL || "";

  if (baseURL.endsWith("/api")) {
    return `${baseURL.slice(0, -4)}${profileImage}`;
  }

  return `${baseURL.replace(/\/$/, "")}${profileImage}`;
}

function formatDate(date) {
  if (!date) {
    return "Not provided";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      <span
        className={`mr-2 h-2 w-2 rounded-full ${
          isActive ? "bg-green-500" : "bg-red-500"
        }`}
      />

      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p
        className="mb-1 text-xs font-medium uppercase tracking-wide"
        style={{
          color: "var(--color-muted, #6b7280)",
        }}
      >
        {label}
      </p>

      <p
        className="text-sm font-medium"
        style={{
          color: "var(--color-text)",
        }}
      >
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default function OtherStaffDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/school-super-admin/users/${id}/`
      );

      setStaff(response.data);
    } catch (err) {
      console.error("Failed to load Other Staff:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load staff information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [id]);

  const handleStatusToggle = async () => {
    if (!staff) {
      return;
    }

    try {
      setChangingStatus(true);
      setError("");

      await api.patch(
        `/school-super-admin/users/${staff.id}/`,
        {
          is_active: !staff.is_active,
        }
      );

      await loadStaff();
    } catch (err) {
      console.error("Failed to update staff status:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to update staff status."
      );
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-[400px] items-center justify-center"
        style={{
          backgroundColor: "var(--color-background)",
        }}
      >
        <div className="text-sm text-gray-500">
          Loading staff information...
        </div>
      </div>
    );
  }

  if (error && !staff) {
    return (
      <div
        className="min-h-[400px] p-6"
        style={{
          backgroundColor: "var(--color-background)",
          color: "var(--color-text)",
        }}
      >
        <button
          type="button"
          onClick={() =>
            navigate("/school-admin/people/other-staff")
          }
          className="mb-6 text-sm font-medium"
          style={{
            color: "var(--color-primary)",
          }}
        >
          ← Back to Other Staff
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const profileImage = getProfileImageUrl(
    staff?.profile_image
  );

  const fullName =
    staff?.full_name ||
    `${staff?.first_name || ""} ${
      staff?.last_name || ""
    }`.trim() ||
    "Staff Member";

  const roleLabel = getRoleLabel(
    staff?.role,
    staff?.role_display
  );

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate("/school-admin/people/other-staff")
            }
            className="mb-3 text-sm font-medium"
            style={{
              color: "var(--color-primary)",
            }}
          >
            ← Back to Other Staff
          </button>

          <h1 className="text-2xl font-bold">
            Staff Details
          </h1>

          <p
            className="mt-1 text-sm"
            style={{
              color: "var(--color-muted, #6b7280)",
            }}
          >
            View complete information for this staff member.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/school-admin/people/other-staff/${staff.id}/edit`
              )
            }
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{
              backgroundColor: "var(--color-primary)",
            }}
          >
            Edit Staff
          </button>

          <button
            type="button"
            onClick={handleStatusToggle}
            disabled={changingStatus}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
              staff.is_active
                ? "border-red-200 text-red-600 hover:bg-red-50"
                : "border-green-200 text-green-600 hover:bg-green-50"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {changingStatus
              ? "Updating..."
              : staff.is_active
              ? "Deactivate"
              : "Activate"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* PROFILE CARD */}
      <div
        className="mb-6 overflow-hidden rounded-2xl border shadow-sm"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border, #e5e7eb)",
        }}
      >
        <div className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex-shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={fullName}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-gray-100"
                />
              ) : (
                <div
                  className="flex h-28 w-28 items-center justify-center rounded-full text-2xl font-bold text-white"
                  style={{
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  {getInitials(
                    staff?.first_name,
                    staff?.last_name
                  )}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h2 className="text-2xl font-bold">
                  {fullName}
                </h2>

                <StatusBadge
                  isActive={staff?.is_active}
                />
              </div>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--color-muted, #6b7280)",
                }}
              >
                {roleLabel}
              </p>

              <p
                className="mt-3 text-sm"
                style={{
                  color: "var(--color-muted, #6b7280)",
                }}
              >
                Username:{" "}
                <span
                  className="font-semibold"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  {staff?.username || "Not provided"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INFORMATION */}
      <div
        className="rounded-2xl border shadow-sm"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border, #e5e7eb)",
        }}
      >
        <div className="border-b p-6">
          <h2 className="text-lg font-bold">
            Staff Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="First Name"
            value={staff?.first_name}
          />

          <InfoItem
            label="Last Name"
            value={staff?.last_name}
          />

          <InfoItem
            label="Role"
            value={roleLabel}
          />

          <InfoItem
            label="Employee Number"
            value={staff?.employee_number}
          />

          <InfoItem
            label="Employment Date"
            value={formatDate(
              staff?.employment_date
            )}
          />

          <InfoItem
            label="Email Address"
            value={staff?.email}
          />

          <InfoItem
            label="Phone Number"
            value={staff?.phone_number}
          />

          <InfoItem
            label="Username"
            value={staff?.username}
          />

          <InfoItem
            label="School"
            value={
              staff?.school_name ||
              staff?.school?.name
            }
          />

          <InfoItem
            label="Account Status"
            value={
              staff?.is_active
                ? "Active"
                : "Inactive"
            }
          />
        </div>
      </div>
    </div>
  );
}