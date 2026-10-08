import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";

const AddSchoolAdmin = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    school: "",
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoadingSchools(true);
        setError("");

        const response = await api.get("/academics/schools/");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setSchools(data);
      } catch (err) {
        console.error("Failed to load schools:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load schools. Please try again.",
        );
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(null);

    if (!form.school) {
      setError("Please select a school.");
      return;
    }

    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!form.first_name.trim()) {
      setError("First name is required.");
      return;
    }

    if (!form.last_name.trim()) {
      setError("Last name is required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/school-super-admin/super-admin/school-admins/create/",
        {
          school: Number(form.school),
          username: form.username.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone_number: form.phone_number.trim(),
        },
      );

      setSuccess(response.data);

      setForm({
        school: "",
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
      });
    } catch (err) {
      console.error("Failed to create School Admin:", err);

      const responseData = err?.response?.data;

      if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData) {
        const firstError = Object.values(responseData)
          .flat()
          .find(Boolean);

        setError(
          firstError ||
            "Unable to create School Admin. Please check the form.",
        );
      } else {
        setError(
          "Unable to create School Admin. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-w-0">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/school-admins")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text/60 transition hover:text-primary"
        >
          <ArrowLeft size={18} />
          Back to School Admins
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck size={22} />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-text sm:text-2xl">
              Add School Admin
            </h1>

            <p className="text-sm text-text/60">
              Create a School Admin and assign them to a school.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl rounded-xl border border-card bg-card p-4 shadow-sm sm:p-6">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* School */}
            <div>
              <label
                htmlFor="school"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                School <span className="text-red-500">*</span>
              </label>

              <select
                id="school"
                name="school"
                value={form.school}
                onChange={handleChange}
                disabled={loadingSchools || submitting}
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

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Username <span className="text-red-500">*</span>
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. schooladmin3"
                disabled={submitting}
                autoComplete="off"
                className="h-11 w-full rounded-lg border border-card bg-background px-3 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-1.5 text-xs text-text/50">
                The username will be converted to uppercase when
                created.
              </p>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first_name"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  First Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  disabled={submitting}
                  className="h-11 w-full rounded-lg border border-card bg-background px-3 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  disabled={submitting}
                  className="h-11 w-full rounded-lg border border-card bg-background px-3 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email + Phone */}
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
                  placeholder="admin@example.com"
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
                  placeholder="Phone number"
                  disabled={submitting}
                  className="h-11 w-full rounded-lg border border-card bg-background px-3 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate("/admin/school-admins")
                }
                disabled={submitting}
                className="h-11 rounded-lg border border-card bg-background px-5 text-sm font-medium text-text transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || loadingSchools}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Create School Admin
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Success / Credentials */
          <div>
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                <CheckCircle2 size={30} />
              </div>

              <h2 className="text-lg font-semibold text-text">
                School Admin Created Successfully
              </h2>

              <p className="mt-1 text-sm text-text/60">
                The School Admin account has been created and
                assigned to{" "}
                <strong>
                  {success.school?.name || "the selected school"}
                </strong>
                .
              </p>
            </div>

            <div className="rounded-xl border border-card bg-background p-4">
              <h3 className="mb-4 text-sm font-semibold text-text">
                Login Credentials
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text/50">
                    Username
                  </p>

                  <div className="rounded-lg border border-card bg-card px-3 py-3 font-mono text-sm text-text">
                    {success.credentials?.username}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text/50">
                    Temporary Password
                  </p>

                  <div className="flex items-center gap-2 rounded-lg border border-card bg-card px-3 py-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={
                        success.credentials
                          ?.temporary_password || ""
                      }
                      readOnly
                      className="min-w-0 flex-1 bg-transparent font-mono text-sm text-text outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="shrink-0 rounded-md p-1.5 text-text/50 transition hover:bg-background hover:text-text"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-text/50">
                Keep these credentials secure and provide them to
                the School Admin.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setSuccess(null);
                  setShowPassword(false);
                }}
                className="h-11 rounded-lg border border-card bg-background px-5 text-sm font-medium text-text transition hover:bg-card"
              >
                Add Another
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/school-admins")
                }
                className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                View School Admins
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSchoolAdmin;