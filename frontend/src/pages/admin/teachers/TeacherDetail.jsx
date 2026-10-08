import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(`/teachers/${id}/`);

      setTeacher(data);
    } catch (error) {
      console.error("Error fetching teacher:", error);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load teacher.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";

      case "ON_LEAVE":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";

      case "SUSPENDED":
        return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";

      case "RESIGNED":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

      case "RETIRED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";

      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getProfileImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${image}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 text-[var(--color-text)] md:p-6">
        <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:text-slate-400">
          Loading teacher...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 text-[var(--color-text)] md:p-6">
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/teachers")}
          className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-white transition hover:opacity-90"
        >
          Back to Teachers
        </button>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 text-[var(--color-text)] md:p-6">
        <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:text-slate-400">
          Teacher not found.
        </div>
      </div>
    );
  }

  const imageUrl = getProfileImageUrl(
    teacher.profile_image,
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 text-[var(--color-text)] md:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Teacher Details
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            View teacher information and academic details
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/teachers"
            className="rounded-xl border border-slate-200 bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ← Back
          </Link>

          <Link
            to={`/admin/teachers/${teacher.id}/edit`}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Edit Teacher
          </Link>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-700">
        <div className="flex flex-col items-center gap-5 md:flex-row">
          {/* PROFILE IMAGE */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={teacher.full_name}
              className="h-32 w-32 rounded-full object-cover ring-4 ring-[var(--color-primary)]/10"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-3xl font-bold text-[var(--color-primary)]">
              {teacher.first_name?.charAt(0)}
              {teacher.last_name?.charAt(0)}
            </div>
          )}

          {/* BASIC INFORMATION */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">
              {teacher.full_name}
            </h2>

            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Employee ID: {teacher.employee_id}
            </p>

            <div className="mt-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(
                  teacher.employment_status,
                )}`}
              >
                {teacher.employment_status?.replace(
                  "_",
                  " ",
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PERSONAL INFORMATION */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-700">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="First Name"
            value={teacher.first_name}
          />

          <InfoItem
            label="Middle Name"
            value={teacher.middle_name}
          />

          <InfoItem
            label="Last Name"
            value={teacher.last_name}
          />

          <InfoItem
            label="Date of Birth"
            value={teacher.date_of_birth}
          />

          <InfoItem
            label="Gender"
            value={teacher.gender}
          />

          <InfoItem
            label="Email"
            value={teacher.email}
          />

          <InfoItem
            label="Phone Number"
            value={teacher.phone_number}
          />

          <InfoItem
            label="Address"
            value={teacher.address}
          />
        </div>
      </div>

      {/* EMPLOYMENT INFORMATION */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-700">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Employment Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Employee ID"
            value={teacher.employee_id}
          />

          <InfoItem
            label="Department"
            value={
              teacher.department_name ||
              "Not assigned"
            }
          />

          <InfoItem
            label="Specialization"
            value={
              teacher.specialization ||
              "Not specified"
            }
          />

          <InfoItem
            label="Qualification"
            value={
              teacher.qualification ||
              "Not specified"
            }
          />

          <InfoItem
            label="Employment Date"
            value={
              teacher.employment_date ||
              "Not specified"
            }
          />

          <InfoItem
            label="Employment Status"
            value={
              teacher.employment_status?.replace(
                "_",
                " ",
              ) || "Active"
            }
          />

          <InfoItem
            label="Class Teacher"
            value={
              teacher.is_class_teacher
                ? "Yes"
                : "No"
            }
          />

          <InfoItem
            label="School"
            value={
              teacher.school_name ||
              "Not specified"
            }
          />
        </div>
      </div>

      {/* BIO */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-700">
        <h2 className="mb-4 text-lg font-bold text-[var(--color-text)]">
          Biography
        </h2>

        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
          {teacher.bio || "No biography provided."}
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-700">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Academic Assignments
        </h2>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/admin/teachers/${teacher.id}/subjects`}
            className="rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Manage Subjects
          </Link>

          <Link
            to={`/admin/teachers/${teacher.id}/class`}
            className="rounded-xl bg-[var(--color-secondary)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Manage Class
          </Link>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   INFORMATION ITEM
===================================================== */

const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>

      <p className="text-sm font-medium text-[var(--color-text)]">
        {value || "Not provided"}
      </p>
    </div>
  );
};

export default TeacherDetail;