import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSchool } from "../../../services/academicsService";

const AddSchool = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    principal_name: "",
    established_year: "",
    is_active: true,
    logo: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files && files.length > 0 ? files[0] : null,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = new FormData();

      data.append("name", formData.name);
      data.append("code", formData.code);
      data.append("address", formData.address);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("website", formData.website);
      data.append("principal_name", formData.principal_name);

      if (formData.established_year) {
        data.append(
          "established_year",
          formData.established_year,
        );
      }

      data.append(
        "is_active",
        formData.is_active ? "true" : "false",
      );

      if (formData.logo) {
        data.append("logo", formData.logo);
      }

      await createSchool(data);

      navigate("/admin/academic/schools");
    } catch (err) {
      console.error("Failed to create school:", err);

      if (err.response?.data) {
        console.error(
          "Server response:",
          err.response.data,
        );
      }

      setError(
        "Failed to create school. Please check your information and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-6 text-[var(--color-text)]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Add School
          </h1>

          <p className="mt-1 text-sm text-[var(--color-text)]/60">
            Create a new school.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/academic/schools")
          }
          className="rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
        >
          Back
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-card)] p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* ==================================================
              SCHOOL NAME
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              School Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter school name"
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              SCHOOL CODE
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              School Code
            </label>

            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="e.g. EDU"
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 uppercase text-sm text-[var(--color-text)] placeholder:normal-case placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              PHONE
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              EMAIL
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter school email"
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              WEBSITE
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Website
            </label>

            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              PRINCIPAL
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Principal Name
            </label>

            <input
              type="text"
              name="principal_name"
              value={formData.principal_name}
              onChange={handleChange}
              placeholder="Enter principal name"
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              ESTABLISHED YEAR
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Established Year
            </label>

            <input
              type="number"
              name="established_year"
              value={formData.established_year}
              onChange={handleChange}
              placeholder="e.g. 2023"
              min="1800"
              max="2100"
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              SCHOOL LOGO
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              School Logo
            </label>

            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              className="w-full cursor-pointer rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-[var(--color-primary)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
            />

            <p className="mt-1 text-xs text-[var(--color-text)]/50">
              Upload JPG, JPEG, PNG, or another image format.
            </p>

            {formData.logo && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Selected: {formData.logo.name}
              </p>
            )}
          </div>

          {/* ==================================================
              ADDRESS
          ================================================== */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="4"
              placeholder="Enter school address"
              className="w-full resize-y rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              ACTIVE
          ================================================== */}

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 cursor-pointer rounded accent-[var(--color-primary)]"
              />

              <span className="text-sm font-medium text-[var(--color-text)]">
                School is active
              </span>
            </label>
          </div>
        </div>

        {/* ======================================================
            BUTTONS
        ====================================================== */}

        <div className="mt-8 flex flex-col items-stretch justify-end gap-3 border-t border-[var(--color-text)]/10 pt-6 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/academic/schools")
            }
            disabled={loading}
            className="rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create School"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSchool;