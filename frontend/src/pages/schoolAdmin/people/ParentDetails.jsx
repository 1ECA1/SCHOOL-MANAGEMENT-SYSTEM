import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getParent,
  updateParent,
  removeStudentParent,
  deleteParent,
} from "../../../services/studentsService";

// =====================================================
// HELPERS
// =====================================================

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "P";

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

const getImageUrl = (image) => {
  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";

  return `${baseUrl
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "")}${image.startsWith("/") ? image : `/${image}`}`;
};

// =====================================================
// COMPONENT
// =====================================================

const ParentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [editing, setEditing] = useState(false);

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [removeProfileImage, setRemoveProfileImage] =
    useState(false);
  const [imageError, setImageError] = useState(false);

  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState({
    full_name: "",
    relationship: "",
    phone_number: "",
    email: "",
    address: "",
    occupation: "",
    emergency_contact: false,
    is_active: true,
  });

  // =====================================================
  // LOAD PARENT
  // =====================================================

  const loadParent = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getParent(id);

      setParent(data);

      setForm({
        full_name: data.full_name || "",
        relationship: data.relationship || "",
        phone_number: data.phone_number || "",
        email: data.email || "",
        address: data.address || "",
        occupation: data.occupation || "",
        emergency_contact: data.emergency_contact || false,
        is_active: data.is_active !== false,
      });

      setProfileImage(null);
      setProfilePreview(getImageUrl(data.profile_image));
      setRemoveProfileImage(false);
      setImageError(false);
    } catch (err) {
      console.error("Failed to load parent:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load parent details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParent();
  }, [id]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError(
        "Profile picture must be smaller than 5MB."
      );
      return;
    }

    setSaveError("");
    setProfileImage(file);
    setRemoveProfileImage(false);
    setImageError(false);

    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfilePreview(null);
    setRemoveProfileImage(true);
    setImageError(false);
  };

  // =====================================================
  // START EDITING
  // =====================================================

  const handleEdit = () => {
    setSaveError("");

    setForm({
      full_name: parent.full_name || "",
      relationship: parent.relationship || "",
      phone_number: parent.phone_number || "",
      email: parent.email || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      emergency_contact:
        parent.emergency_contact || false,
      is_active: parent.is_active !== false,
    });

    setProfileImage(null);
    setProfilePreview(getImageUrl(parent.profile_image));
    setRemoveProfileImage(false);
    setImageError(false);

    setEditing(true);
  };

  // =====================================================
  // CANCEL EDITING
  // =====================================================

  const handleCancel = () => {
    setSaveError("");

    setForm({
      full_name: parent.full_name || "",
      relationship: parent.relationship || "",
      phone_number: parent.phone_number || "",
      email: parent.email || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      emergency_contact:
        parent.emergency_contact || false,
      is_active: parent.is_active !== false,
    });

    setProfileImage(null);
    setProfilePreview(getImageUrl(parent.profile_image));
    setRemoveProfileImage(false);
    setImageError(false);

    setEditing(false);
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSaveError("");

      const formData = new FormData();

      formData.append("full_name", form.full_name);
      formData.append("relationship", form.relationship);
      formData.append("phone_number", form.phone_number);
      formData.append("email", form.email);
      formData.append("address", form.address);
      formData.append("occupation", form.occupation);
      formData.append(
        "emergency_contact",
        form.emergency_contact
      );
      formData.append("is_active", form.is_active);

      // New profile image
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      // Remove existing image
      if (removeProfileImage) {
        formData.append("profile_image", "");
      }

      const updatedParent = await updateParent(
        id,
        formData
      );

      setParent(updatedParent);

      setForm({
        full_name: updatedParent.full_name || "",
        relationship:
          updatedParent.relationship || "",
        phone_number:
          updatedParent.phone_number || "",
        email: updatedParent.email || "",
        address: updatedParent.address || "",
        occupation:
          updatedParent.occupation || "",
        emergency_contact:
          updatedParent.emergency_contact || false,
        is_active:
          updatedParent.is_active !== false,
      });

      setProfileImage(null);

      setProfilePreview(
        getImageUrl(updatedParent.profile_image)
      );

      setRemoveProfileImage(false);
      setImageError(false);

      setEditing(false);
    } catch (err) {
      console.error(
        "Failed to update parent:",
        err
      );

      const responseData = err.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const firstError = Object.values(responseData)[0];

        if (Array.isArray(firstError)) {
          setSaveError(firstError[0]);
        } else if (typeof firstError === "string") {
          setSaveError(firstError);
        } else {
          setSaveError(
            "Unable to update parent information. Please try again."
          );
        }
      } else {
        setSaveError(
          "Unable to update parent information. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE PARENT
  // =====================================================

  const handleDeleteParent = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${parent.full_name}?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await deleteParent(parent.id);

      alert("Parent successfully deleted.");

      navigate("/school-admin/people/parents");
    } catch (err) {
      console.error(
        "Failed to delete parent:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Unable to delete parent. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TOGGLE PARENT STATUS
  // =====================================================

  const handleToggleStatus = async () => {
    const newStatus = !parent.is_active;

    const action = newStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${parent.full_name}?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const updatedParent = await updateParent(
        parent.id,
        {
          full_name: parent.full_name,
          relationship: parent.relationship,
          phone_number: parent.phone_number,
          email: parent.email,
          address: parent.address,
          occupation: parent.occupation,
          emergency_contact:
            parent.emergency_contact,
          is_active: newStatus,
        }
      );

      setParent(updatedParent);

      setForm({
        full_name:
          updatedParent.full_name || "",
        relationship:
          updatedParent.relationship || "",
        phone_number:
          updatedParent.phone_number || "",
        email:
          updatedParent.email || "",
        address:
          updatedParent.address || "",
        occupation:
          updatedParent.occupation || "",
        emergency_contact:
          updatedParent.emergency_contact || false,
        is_active:
          updatedParent.is_active !== false,
      });
    } catch (err) {
      console.error(
        "Failed to change parent status:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Unable to change parent status. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UNLINK STUDENT
  // =====================================================

  const handleUnlinkStudent = async (
    studentId,
    studentName
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to unlink ${studentName} from this parent?`
    );

    if (!confirmed) return;

    try {
      await removeStudentParent(
        studentId,
        parent.id
      );

      await loadParent();

      alert(
        "Student successfully unlinked from parent."
      );
    } catch (err) {
      console.error(
        "Failed to unlink student:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Unable to unlink student. Please try again."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading parent details...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          ← Back
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}

          <button
            type="button"
            onClick={loadParent}
            className="ml-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          ← Back
        </button>

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-8 text-center shadow-sm dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Parent not found.
          </p>
        </div>
      </div>
    );
  }

  const students = parent.students || [];

  const studentCount =
    parent.student_count ?? students.length;

  // =====================================================
  // DISPLAY IMAGE
  // =====================================================

  const parentImage =
    getImageUrl(parent.profile_image);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate("/school-admin/people/parents")
            }
            className="mb-3 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            ← Back to Parents
          </button>

          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Parent Details
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage parent/guardian information.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {!editing && (
            <>
              <button
                type="button"
                onClick={loadParent}
                className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Refresh
              </button>

              <button
                type="button"
                onClick={handleEdit}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              >
                Edit Parent
              </button>

              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={saving}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  parent.is_active
                    ? "border-orange-200 bg-[var(--color-card)] text-orange-600 hover:bg-orange-50 dark:border-orange-900 dark:hover:bg-orange-950/30"
                    : "border-green-200 bg-[var(--color-card)] text-green-600 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-950/30"
                }`}
              >
                {parent.is_active
                  ? "Deactivate"
                  : "Activate"}
              </button>

              <button
                type="button"
                onClick={handleDeleteParent}
                disabled={saving}
                className="rounded-lg border border-red-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:hover:bg-red-950/30"
              >
                Delete Parent
              </button>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          EDIT FORM
      ===================================================== */}

      {editing ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Edit Parent Information
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update the parent's information below.
            </p>
          </div>

          {saveError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {saveError}
            </div>
          )}

          {/* =====================================================
              PROFILE IMAGE
          ===================================================== */}

          <div className="mb-8 flex flex-col items-center border-b border-gray-200 pb-8 sm:flex-row sm:items-start sm:gap-6 dark:border-gray-700">
            <div className="relative">
              {profilePreview && !imageError ? (
                <img
                  src={profilePreview}
                  alt={form.full_name}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800"
                  onError={() => {
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gray-100 text-3xl font-bold text-gray-600 ring-4 ring-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-900">
                  {getInitials(form.full_name)}
                </div>
              )}
            </div>

            <div className="mt-4 text-center sm:mt-0 sm:text-left">
              <h3 className="font-semibold text-[var(--color-text)]">
                Profile Picture
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                JPG, PNG or WEBP. Maximum size 5MB.
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                <label className="cursor-pointer rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                  {profilePreview
                    ? "Change Picture"
                    : "Upload Picture"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {profilePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="rounded-lg border border-red-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                  >
                    Remove Picture
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              FORM FIELDS
          ===================================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Full Name
              </label>

              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-900"
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Relationship
              </label>

              <input
                type="text"
                name="relationship"
                value={form.relationship}
                onChange={handleChange}
                placeholder="Father, Mother, Guardian..."
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-900"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Phone Number
              </label>

              <input
                type="text"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-900"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-900"
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Occupation
              </label>

              <input
                type="text"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-900"
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-900"
              />
            </div>
          </div>

          {/* =====================================================
              CHECKBOXES
          ===================================================== */}

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="emergency_contact"
                checked={form.emergency_contact}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />

              <span className="text-sm text-gray-700 dark:text-gray-200">
                Emergency Contact
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />

              <span className="text-sm text-gray-700 dark:text-gray-200">
                Parent is Active
              </span>
            </label>
          </div>

          {/* =====================================================
              FORM BUTTONS
          ===================================================== */}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* =====================================================
              PARENT PROFILE
          ===================================================== */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">

              {/* PROFILE IMAGE */}

              <div className="shrink-0">
                {parentImage ? (
                  <img
                    src={parentImage}
                    alt={parent.full_name}
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";

                      if (
                        e.currentTarget.nextElementSibling
                      ) {
                        e.currentTarget.nextElementSibling.style.display =
                          "flex";
                      }
                    }}
                  />
                ) : null}

                <div
                  className={`h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-3xl font-bold text-gray-600 ring-4 ring-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-900 ${
                    parentImage
                      ? "hidden"
                      : "flex"
                  }`}
                >
                  {getInitials(parent.full_name)}
                </div>
              </div>

              {/* INFORMATION */}

              <div className="flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-text)]">
                      {parent.full_name || "—"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {parent.relationship ||
                        "Parent / Guardian"}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      parent.is_active === false
                        ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                        : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                    }`}
                  >
                    {parent.is_active === false
                      ? "Inactive"
                      : "Active"}
                  </span>
                </div>

                {/* DETAILS */}

                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-[var(--color-text)]">
                      {parent.phone_number || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Email
                    </p>

                    <p className="mt-1 break-words text-sm text-[var(--color-text)]">
                      {parent.email || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Occupation
                    </p>

                    <p className="mt-1 text-sm text-[var(--color-text)]">
                      {parent.occupation || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Address
                    </p>

                    <p className="mt-1 text-sm text-[var(--color-text)]">
                      {parent.address || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Emergency Contact
                    </p>

                    <p
                      className={`mt-1 text-sm font-medium ${
                        parent.emergency_contact
                          ? "text-orange-600"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {parent.emergency_contact
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Assigned Students
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                      {studentCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              ASSIGNED STUDENTS
          ===================================================== */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="font-semibold text-[var(--color-text)]">
                Assigned Students
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Students connected to this parent or guardian.
              </p>
            </div>

            {students.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No students are currently assigned
                  to this parent.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">
                        {student.full_name || "—"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Admission No:{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          {student.admission_number ||
                            "—"}
                        </span>
                      </p>

                      {student.status && (
                        <span className="mt-2 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {student.status}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/school-admin/people/students/${student.id}`
                          )
                        }
                        className="w-fit rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        View Student
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUnlinkStudent(
                            student.id,
                            student.full_name ||
                              "this student"
                          )
                        }
                        className="w-fit rounded-lg border border-red-200 bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                      >
                        Unlink
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentDetails;