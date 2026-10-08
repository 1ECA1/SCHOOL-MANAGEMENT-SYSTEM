import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const AddOtherStaff = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "ACCOUNTANT",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    employee_number: "",
    employment_date: "",
  });

  const [profileImage, setProfileImage] =
    useState(null);

  const [previewImage, setPreviewImage] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE IMAGE
  // =========================================================

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      setProfileImage(null);
      setPreviewImage(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile image must not be larger than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setError("");
    setProfileImage(file);

    const imageUrl =
      URL.createObjectURL(file);

    setPreviewImage(imageUrl);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = new FormData();

      data.append(
        "role",
        formData.role
      );

      data.append(
        "first_name",
        formData.first_name
      );

      data.append(
        "last_name",
        formData.last_name
      );

      data.append(
        "email",
        formData.email
      );

      data.append(
        "phone_number",
        formData.phone_number
      );

      data.append(
        "employee_number",
        formData.employee_number
      );

      if (formData.employment_date) {
        data.append(
          "employment_date",
          formData.employment_date
        );
      }

      if (profileImage) {
        data.append(
          "profile_image",
          profileImage
        );
      }

      const response = await api.post(
        "/school-super-admin/users/create/",
        data
      );

      setSuccess(
        response.data?.message ||
          "Staff member created successfully."
      );

      setTimeout(() => {
        navigate(
          "/school-admin/people/other-staff"
        );
      }, 1200);
    } catch (err) {
      console.error(
        "Error creating staff member:",
        err
      );

      const responseData =
        err.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = [];

        Object.entries(responseData).forEach(
          ([field, value]) => {
            if (Array.isArray(value)) {
              messages.push(
                `${field}: ${value.join(", ")}`
              );
            } else if (
              typeof value === "string"
            ) {
              messages.push(
                `${field}: ${value}`
              );
            } else {
              messages.push(
                `${field}: ${JSON.stringify(
                  value
                )}`
              );
            }
          }
        );

        setError(
          messages.join("\n") ||
            "Failed to create staff member."
        );
      } else {
        setError(
          "Failed to create staff member. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    navigate(
      "/school-admin/people/other-staff"
    );
  };

  // =========================================================
  // ROLE LABEL
  // =========================================================

  const roleLabels = {
    ACCOUNTANT:
      "Accountant / Finance Officer / Bursar",
    LIBRARIAN: "Librarian",
    ADMISSION_OFFICER:
      "Admission Officer",
    EXAM_OFFICER:
      "Exam / Assessment Officer",
  };

  return (
    <div className="p-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6">
        <button
          type="button"
          onClick={handleCancel}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Other Staff
        </button>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Other Staff
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create an account for a non-teaching staff
          member in your school.
        </p>
      </div>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl rounded-xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]"
      >
        {/* =================================================
            ROLE
        ================================================= */}

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Staff Role
          </h2>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role *
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="ACCOUNTANT">
                {roleLabels.ACCOUNTANT}
              </option>

              <option value="LIBRARIAN">
                {roleLabels.LIBRARIAN}
              </option>

              <option value="ADMISSION_OFFICER">
                {roleLabels.ADMISSION_OFFICER}
              </option>

              <option value="EXAM_OFFICER">
                {roleLabels.EXAM_OFFICER}
              </option>
            </select>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              The selected role determines which staff
              profile is created.
            </p>
          </div>
        </div>

        {/* =================================================
            PROFILE IMAGE
        ================================================= */}

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Profile Image
          </h2>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-center text-sm text-gray-400">
                  No image
                </span>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Staff Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
              />

              <p className="mt-2 text-xs text-gray-500">
                Maximum 5 MB.
              </p>

              {profileImage && (
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Selected:{" "}
                  <span className="font-medium">
                    {profileImage.name}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name *
              </label>

              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name *
              </label>

              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="staff@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="08012345678"
              />
            </div>
          </div>
        </div>

        {/* =================================================
            EMPLOYMENT INFORMATION
        ================================================= */}

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Employment Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Employee Number *
              </label>

              <input
                type="text"
                name="employee_number"
                value={
                  formData.employee_number
                }
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="ACC001"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Employment Date
              </label>

              <input
                type="date"
                name="employment_date"
                value={
                  formData.employment_date
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating Staff..."
              : "Create Staff"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOtherStaff;