import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../services/api";

const EditSchoolAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    school: "",
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadingSchools(true);
        setError("");

        const [adminResponse, schoolsResponse] =
          await Promise.all([
            api.get(
              `/school-super-admin/super-admin/school-admins/${id}/`,
            ),
            api.get("/academics/schools/"),
          ]);

        const admin = adminResponse.data;

        const schoolData = Array.isArray(schoolsResponse.data)
          ? schoolsResponse.data
          : schoolsResponse.data?.results || [];

        setSchools(schoolData);

        setForm({
          first_name: admin.first_name || "",
          last_name: admin.last_name || "",
          email: admin.email || "",
          phone_number: admin.phone_number || "",
          school:
            admin.school !== null &&
            admin.school !== undefined
              ? String(admin.school)
              : "",
          is_active: admin.is_active ?? true,
        });
      } catch (err) {
        console.error(
          "Failed to load School Admin:",
          err,
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load School Admin details.",
        );
      } finally {
        setLoading(false);
        setLoadingSchools(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.first_name.trim()) {
      setError("First name is required.");
      return;
    }

    if (!form.last_name.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!form.school) {
      setError("Please select a school.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.patch(
        `/school-super-admin/super-admin/school-admins/${id}/edit/`,
        {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone_number: form.phone_number.trim(),
          school: Number(form.school),
          is_active: form.is_active,
        },
      );

      setSuccess(
        response.data?.message ||
          "School Admin updated successfully.",
      );

      setTimeout(() => {
        navigate(`/admin/school-admins/${id}`);
      }, 700);
    } catch (err) {
      console.error(
        "Failed to update School Admin:",
        err,
      );

      const responseData = err?.response?.data;

      if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData) {
        const firstError = Object.values(responseData)
          .flat()
          .find(Boolean);

        setError(
          firstError ||
            "Unable to update School Admin. Please check the form.",
        );
      } else {
        setError(
          "Unable to update School Admin. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-text/50">
          Loading School Admin...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            navigate(`/admin/school-admins/${id}`)
          }
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text/60 transition hover:text-primary"
        >
          <ArrowLeft size={18} />
          Back to School Admin
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck size={22} />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-text sm:text-2xl">
              Edit School Admin
            </h1>

            <p className="text-sm text-text/60">
              Update the School Admin account and school
              assignment.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl rounded-xl border border-card bg-card p-4 shadow-sm sm:p-6">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="school"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              School{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              id="school"
              name="school"
              value={form.school}
              onChange={handleChange}
              disabled={
                loadingSchools || submitting
              }
              className="h-11 w-full rounded-lg border border-card bg-background px-3 text-sm text-text outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {loadingSchools
                  ? "Loading schools..."
                  : "Select a school"}
              </option>

              {schools
                .filter(
                  (school) =>
                    school.is_active !== false,
                )
                .map((school) => (
                  <option
                    key={school.id}
                    value={school.id}
                  >
                    {school.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value="Current School Admin"
              readOnly
              className="h-11 w-full cursor-not-allowed rounded-lg border border-card bg-background px-3 text-sm text-text/50 outline-none"
            />

            <p className="mt-1.5 text-xs text-text/50">
              Username cannot be changed here.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first_name"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                First Name{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="first_name"
                name="first_name"
                type="text"
                value={form.first_name}
                onChange={handleChange}
                disabled={submitting}
                className="h-11 w-full rounded-lg border border-card bg-background px-3 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Last Name{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="last_name"
                name="last_name"
                type="text"
                value={form.last_name}
                onChange={handleChange}
                disabled={submitting}
                className="h-11 w-full rounded-lg border border-card bg-background px-3 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                className="h-11 w-full rounded-lg border border-card bg-background px-3 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="phone_number"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Phone Number
              </label>

              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={form.phone_number}
                onChange={handleChange}
                disabled={submitting}
                className="h-11 w-full rounded-lg border border-card bg-background px-3 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div className="rounded-xl border border-card bg-background p-4">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text">
                  Account Status
                </p>

                <p className="mt-1 text-xs text-text/50">
                  Inactive School Admins cannot log in.
                </p>
              </div>

              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                disabled={submitting}
                className="h-5 w-5 shrink-0 accent-primary"
              />
            </label>

            <p className="mt-3 text-sm font-medium text-text">
              {form.is_active
                ? "Active"
                : "Inactive"}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate(`/admin/school-admins/${id}`)
              }
              disabled={submitting}
              className="h-11 rounded-lg border border-card bg-background px-5 text-sm font-medium text-text transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting || loadingSchools
              }
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSchoolAdmin;