import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTeacher } from "../../services/teachersService"

function TeacherProfile() {
  const { user } = useAuth();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTeacherProfile = async () => {
      if (!user?.teacher_id) {
        setError("No teacher profile is linked to this account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getTeacher(user.teacher_id);

        setTeacher(data);
      } catch (err) {
        console.error("Failed to load teacher profile:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load your teacher profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTeacherProfile();
  }, [user?.teacher_id]);

  const fullName =
    teacher?.full_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username ||
    "Teacher";

  const initials =
    teacher?.first_name?.charAt(0)?.toUpperCase() ||
    user?.first_name?.charAt(0)?.toUpperCase() ||
    user?.username?.charAt(0)?.toUpperCase() ||
    "T";

  const profileImage = teacher?.profile_image
    ? teacher.profile_image.startsWith("http")
      ? teacher.profile_image
      : `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${teacher.profile_image}`
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading teacher profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-800">
          Unable to load profile
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =================================================
          PAGE HEADER
      ================================================= */}
      <div>
        <p className="text-sm font-medium text-slate-500">
          Teacher Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View your account and professional information.
        </p>
      </div>

      {/* =================================================
          PROFILE HEADER
      ================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt={fullName}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
              {initials}
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {fullName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Teacher
            </p>

            {teacher?.employee_id && (
              <p className="mt-1 text-xs text-slate-400">
                Employee ID: {teacher.employee_id}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          ACCOUNT INFORMATION
      ================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Account Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <ProfileField
            label="First Name"
            value={teacher?.first_name || user?.first_name || "—"}
          />

          <ProfileField
            label="Middle Name"
            value={teacher?.middle_name || "—"}
          />

          <ProfileField
            label="Last Name"
            value={teacher?.last_name || user?.last_name || "—"}
          />

          <ProfileField
            label="Username"
            value={user?.username || "—"}
          />

          <ProfileField
            label="Email"
            value={teacher?.email || user?.email || "—"}
          />

          <ProfileField
            label="Phone Number"
            value={teacher?.phone_number || user?.phone_number || "—"}
          />

          <ProfileField
            label="Role"
            value="Teacher"
          />
        </div>
      </div>

      {/* =================================================
          PERSONAL INFORMATION
      ================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Personal Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileField
            label="Date of Birth"
            value={teacher?.date_of_birth || "—"}
          />

          <ProfileField
            label="Gender"
            value={formatValue(teacher?.gender)}
          />

          <ProfileField
            label="Address"
            value={teacher?.address || "—"}
          />
        </div>
      </div>

      {/* =================================================
          PROFESSIONAL INFORMATION
      ================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Professional Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileField
            label="Employee ID"
            value={teacher?.employee_id || "—"}
          />

          <ProfileField
            label="Department"
            value={teacher?.department_name || "—"}
          />

          <ProfileField
            label="Specialization"
            value={teacher?.specialization || "—"}
          />

          <ProfileField
            label="Qualification"
            value={teacher?.qualification || "—"}
          />

          <ProfileField
            label="Employment Status"
            value={formatValue(teacher?.employment_status)}
          />

          <ProfileField
            label="Employment Date"
            value={teacher?.employment_date || "—"}
          />

          <ProfileField
            label="Class Teacher"
            value={teacher?.is_class_teacher ? "Yes" : "No"}
          />
        </div>
      </div>

      {/* =================================================
          BIO
      ================================================= */}
      {teacher?.bio && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            About Me
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            {teacher.bio}
          </p>
        </div>
      )}
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function formatValue(value) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default TeacherProfile;