
import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  Loader2,
  RefreshCw,
  UserRound,
  CalendarDays,
  Hash,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

import api from "../../../services/api";

const SchoolInformation = () => {
  const [school, setSchool] = useState(null);
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
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD SCHOOL
  // =========================================================

  const loadSchool = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get(
        "/academics/schools/my-school/"
      );

      const data = response.data;

      setSchool(data);

      setFormData({
        name: data.name || "",
        code: data.code || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        principal_name: data.principal_name || "",
        established_year:
          data.established_year ?? "",
        is_active: data.is_active ?? true,
      });

      if (data.logo) {
        setLogoPreview(data.logo);
      } else {
        setLogoPreview("");
      }
    } catch (err) {
      console.error("Failed to load school:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load school information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchool();
  }, []);

  // =========================================================
  // INPUT HANDLER
  // =========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // LOGO
  // =========================================================

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setLogoFile(file);

    const previewUrl = URL.createObjectURL(file);

    setLogoPreview(previewUrl);
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = new FormData();

      payload.append(
        "name",
        formData.name.trim()
      );

      payload.append(
        "address",
        formData.address.trim()
      );

      payload.append(
        "phone",
        formData.phone.trim()
      );

      payload.append(
        "email",
        formData.email.trim()
      );

      payload.append(
        "website",
        formData.website.trim()
      );

      payload.append(
        "principal_name",
        formData.principal_name.trim()
      );

      if (
        formData.established_year !== "" &&
        formData.established_year !== null
      ) {
        payload.append(
          "established_year",
          formData.established_year
        );
      }

      payload.append(
        "is_active",
        formData.is_active
      );

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      const response = await api.patch(
        `/academics/schools/${school.id}/`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedSchool = response.data;

      setSchool(updatedSchool);

      setFormData({
        name: updatedSchool.name || "",
        code: updatedSchool.code || "",
        address: updatedSchool.address || "",
        phone: updatedSchool.phone || "",
        email: updatedSchool.email || "",
        website: updatedSchool.website || "",
        principal_name:
          updatedSchool.principal_name || "",
        established_year:
          updatedSchool.established_year ?? "",
        is_active:
          updatedSchool.is_active ?? true,
      });

      if (updatedSchool.logo) {
        setLogoPreview(updatedSchool.logo);
      }

      setLogoFile(null);

      setSuccess(
        "School information updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update school:",
        err
      );

      const responseData = err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.entries(
          responseData
        )
          .map(([field, message]) => {
            if (Array.isArray(message)) {
              return `${field}: ${message.join(", ")}`;
            }

            return `${field}: ${message}`;
          })
          .join(" ");

        setError(
          messages ||
            "Unable to update school information."
        );
      } else {
        setError(
          "Unable to update school information."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--color-text)]">
          <Loader2
            size={22}
            className="animate-spin"
          />
          <span>
            Loading school information...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR WITHOUT SCHOOL
  // =========================================================

  if (!school) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error ||
            "School information could not be loaded."}
        </div>

        <button
          type="button"
          onClick={loadSchool}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          <RefreshCw size={17} />
          Retry
        </button>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            School Information
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your school's basic information,
            contact details and profile.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSchool}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ===================================================
            SCHOOL PROFILE
        =================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Building2 size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-[var(--color-text)]">
                  School Profile
                </h2>

                <p className="text-sm text-gray-500">
                  Basic identification information
                  about the school.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            {/* SCHOOL NAME */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                School Name
              </label>

              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>

            {/* SCHOOL CODE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                School Code
              </label>

              <div className="relative">
                <Hash
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={formData.code}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-500"
                />
              </div>

              <p className="mt-1 text-xs text-gray-400">
                School code cannot be changed here.
              </p>
            </div>

            {/* ESTABLISHED YEAR */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Established Year
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="number"
                  name="established_year"
                  value={
                    formData.established_year
                  }
                  onChange={handleChange}
                  min="1800"
                  max="2100"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            CONTACT INFORMATION
        =================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Phone size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-[var(--color-text)]">
                  Contact Information
                </h2>

                <p className="text-sm text-gray-500">
                  Contact details parents and users
                  can use to reach the school.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            {/* PHONE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Phone
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>

            {/* WEBSITE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Website
              </label>

              <div className="relative">
                <Globe
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>

            {/* PRINCIPAL */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Principal Name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="principal_name"
                  value={
                    formData.principal_name
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>

            {/* ADDRESS */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Address
              </label>

              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            SCHOOL STATUS
        =================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="font-semibold text-[var(--color-text)]">
              School Status
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Control whether this school is active.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="font-medium text-[var(--color-text)]">
                Active School
              </p>

              <p className="mt-1 text-sm text-gray-500">
                An inactive school should not be
                treated as an active school in the
                system.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="peer sr-only"
              />

              <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/20" />
            </label>
          </div>
        </div>

        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <ImageIcon size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-[var(--color-text)]">
                  School Logo
                </h2>

                <p className="text-sm text-gray-500">
                  Upload the official logo of the
                  school.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="School logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImageIcon
                  size={36}
                  className="text-gray-300"
                />
              )}
            </div>

            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50">
                <ImageIcon size={17} />
                Choose Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-xs text-gray-400">
                Select an image file for the school
                logo.
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            SAVE BUTTON
        =================================================== */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
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
  );
};

export default SchoolInformation;
