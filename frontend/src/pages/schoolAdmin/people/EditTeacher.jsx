import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // DATA
  // =====================================================

  const [departments, setDepartments] = useState([]);

  // =====================================================
  // LOADING / MESSAGES
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // FORM
  // =====================================================

  const [formData, setFormData] = useState({
    employee_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    address: "",
    department: "",
    specialization: "",
    qualification: "",
    employment_date: "",
    employment_status: "ACTIVE",
    is_class_teacher: false,
    bio: "",
  });

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [removeProfileImage, setRemoveProfileImage] =
    useState(false);

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${BACKEND_URL}${image}`;
  };

  // =====================================================
  // LOAD TEACHER
  // =====================================================

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      setError("");

      const [
        teacherResponse,
        departmentsResponse,
      ] = await Promise.all([
        api.get(`/teachers/${id}/`),
        api.get("/academics/departments/"),
      ]);

      const teacherData = teacherResponse.data;

      const departmentsData = Array.isArray(
        departmentsResponse.data,
      )
        ? departmentsResponse.data
        : departmentsResponse.data?.results || [];

      setDepartments(departmentsData);

      // =================================================
      // FORM DATA
      // =================================================

      setFormData({
        employee_id: teacherData.employee_id || "",

        first_name: teacherData.first_name || "",

        middle_name: teacherData.middle_name || "",

        last_name: teacherData.last_name || "",

        email: teacherData.email || "",

        phone_number: teacherData.phone_number || "",

        date_of_birth:
          teacherData.date_of_birth || "",

        gender: teacherData.gender || "",

        address: teacherData.address || "",

        department: teacherData.department
          ? String(
              typeof teacherData.department === "object"
                ? teacherData.department.id
                : teacherData.department,
            )
          : "",

        specialization:
          teacherData.specialization || "",

        qualification:
          teacherData.qualification || "",

        employment_date:
          teacherData.employment_date || "",

        employment_status:
          teacherData.employment_status || "ACTIVE",

        is_class_teacher:
          teacherData.is_class_teacher || false,

        bio: teacherData.bio || "",
      });

      // =================================================
      // EXISTING PROFILE IMAGE
      // =================================================

      if (teacherData.profile_image) {
        setProfilePreview(
          getImageUrl(teacherData.profile_image),
        );
      } else {
        setProfilePreview("");
      }

      setProfileImage(null);
      setRemoveProfileImage(false);
    } catch (error) {
      console.error("Error loading teacher:", error);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load teacher information.",
      );
    } finally {
      setDataLoading(false);
    }
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // HANDLE PROFILE IMAGE
  // =====================================================

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // =================================================
    // FILE TYPE
    // =================================================

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file.",
      );

      e.target.value = "";
      return;
    }

    // =================================================
    // FILE SIZE
    // =================================================

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile image must be less than 5MB.",
      );

      e.target.value = "";
      return;
    }

    setError("");
    setSuccess("");

    setProfileImage(file);
    setRemoveProfileImage(false);

    // =================================================
    // PREVIEW
    // =================================================

    const previewUrl =
      URL.createObjectURL(file);

    setProfilePreview(previewUrl);
  };

  // =====================================================
  // REMOVE PROFILE IMAGE
  // =====================================================

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setProfilePreview("");
    setRemoveProfileImage(true);

    setError("");
    setSuccess("");

    const fileInput =
      document.querySelector(
        'input[type="file"]',
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =====================================================
  // FORMAT API ERROR
  // =====================================================

  const formatApiError = (data) => {
    if (!data) {
      return "Failed to update teacher.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (typeof data === "object") {
      const messages = Object.entries(data)
        .map(([key, value]) => {
          const message = Array.isArray(value)
            ? value.join(", ")
            : String(value);

          return `${key}: ${message}`;
        })
        .join(" | ");

      if (messages) {
        return messages;
      }
    }

    return "Failed to update teacher.";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =================================================
    // VALIDATION
    // =================================================

    if (!formData.employee_id.trim()) {
      setError("Employee ID is required.");
      return;
    }

    if (!formData.first_name.trim()) {
      setError("First name is required.");
      return;
    }

    if (!formData.last_name.trim()) {
      setError("Last name is required.");
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // FORM DATA
      // =================================================

      const teacherData = new FormData();

      teacherData.append(
        "employee_id",
        formData.employee_id.trim(),
      );

      teacherData.append(
        "first_name",
        formData.first_name.trim(),
      );

      teacherData.append(
        "middle_name",
        formData.middle_name.trim(),
      );

      teacherData.append(
        "last_name",
        formData.last_name.trim(),
      );

      teacherData.append(
        "email",
        formData.email.trim(),
      );

      teacherData.append(
        "phone_number",
        formData.phone_number.trim(),
      );

      teacherData.append(
        "date_of_birth",
        formData.date_of_birth,
      );

      teacherData.append(
        "gender",
        formData.gender,
      );

      teacherData.append(
        "address",
        formData.address.trim(),
      );

      teacherData.append(
        "department",
        formData.department,
      );

      teacherData.append(
        "specialization",
        formData.specialization.trim(),
      );

      teacherData.append(
        "qualification",
        formData.qualification.trim(),
      );

      teacherData.append(
        "employment_date",
        formData.employment_date,
      );

      teacherData.append(
        "employment_status",
        formData.employment_status,
      );

      teacherData.append(
        "is_class_teacher",
        formData.is_class_teacher
          ? "true"
          : "false",
      );

      teacherData.append(
        "bio",
        formData.bio.trim(),
      );

      // =================================================
      // PROFILE IMAGE
      // =================================================

      if (profileImage) {
        teacherData.append(
          "profile_image",
          profileImage,
        );
      }

      // =================================================
      // REMOVE IMAGE
      // =================================================

      if (removeProfileImage) {
        teacherData.append(
          "profile_image",
          "",
        );
      }

      // =================================================
      // UPDATE TEACHER
      // =================================================

      await api.patch(
        `/teachers/${id}/`,
        teacherData,
      );

      setSuccess(
        "Teacher updated successfully.",
      );

      // =================================================
      // REDIRECT
      // =================================================

      setTimeout(() => {
        navigate(
          `/school-admin/people/teachers/${id}`,
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Error updating teacher:",
        error,
      );

      console.error(
        "API response:",
        error.response?.data,
      );

      setError(
        formatApiError(
          error.response?.data,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FULL NAME
  // =====================================================

  const fullName = [
    formData.first_name,
    formData.middle_name,
    formData.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  // =====================================================
  // INITIAL
  // =====================================================

  const teacherInitial =
    fullName
      ?.charAt(0)
      ?.toUpperCase() || "T";

  // =====================================================
  // STYLES
  // =====================================================

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-gray-700";

  const labelClass =
    "mb-2 block text-sm font-medium text-[var(--color-text)]";

  // =====================================================
  // LOADING
  // =====================================================

  if (dataLoading) {
    return (
      <div className="min-h-[400px] bg-[var(--color-background)] p-6">
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Loading teacher information...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="mx-auto max-w-6xl bg-[var(--color-background)] p-4 md:p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Edit Teacher
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update teacher information and employment details.
          </p>
        </div>

        <Link
          to={`/school-admin/people/teachers/${id}`}
          className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2 text-center text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          ← Back to Teacher
        </Link>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-800 md:p-8"
      >

        {/* =================================================
            PROFILE PICTURE
        ================================================= */}

        <div className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-800">

          <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
            Profile Picture
          </h2>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* IMAGE */}

            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full bg-[var(--color-primary)] shadow-lg">

              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt={fullName || "Teacher"}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    const fallback =
                      event.currentTarget.nextElementSibling;

                    if (fallback) {
                      fallback.style.display =
                        "flex";
                    }
                  }}
                />
              ) : null}

              {/* FALLBACK */}

              <div
                className={`h-full w-full items-center justify-center text-4xl font-bold text-white ${
                  profilePreview
                    ? "hidden"
                    : "flex"
                }`}
              >
                {teacherInitial}
              </div>

            </div>

            {/* UPLOAD CONTROLS */}

            <div className="flex-1">

              <label className={labelClass}>
                Teacher Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleProfileImageChange
                }
                disabled={loading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90 disabled:opacity-50"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                JPG, JPEG, PNG or other image
                formats. Maximum size: 5MB.
              </p>

              {profileImage && (
                <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">
                  New image selected:{" "}
                  {profileImage.name}
                </p>
              )}

              {profilePreview && (
                <button
                  type="button"
                  onClick={
                    handleRemoveProfileImage
                  }
                  disabled={loading}
                  className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                >
                  Remove Profile Picture
                </button>
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <div className="mb-8">

          <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* EMPLOYEE ID */}

            <div>
              <label className={labelClass}>
                Employee ID *
              </label>

              <input
                type="text"
                name="employee_id"
                value={
                  formData.employee_id
                }
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* FIRST NAME */}

            <div>
              <label className={labelClass}>
                First Name *
              </label>

              <input
                type="text"
                name="first_name"
                value={
                  formData.first_name
                }
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* MIDDLE NAME */}

            <div>
              <label className={labelClass}>
                Middle Name
              </label>

              <input
                type="text"
                name="middle_name"
                value={
                  formData.middle_name
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* LAST NAME */}

            <div>
              <label className={labelClass}>
                Last Name *
              </label>

              <input
                type="text"
                name="last_name"
                value={
                  formData.last_name
                }
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* GENDER */}

            <div>
              <label className={labelClass}>
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select Gender
                </option>

                <option value="MALE">
                  Male
                </option>

                <option value="FEMALE">
                  Female
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            {/* DATE OF BIRTH */}

            <div>
              <label className={labelClass}>
                Date of Birth
              </label>

              <input
                type="date"
                name="date_of_birth"
                value={
                  formData.date_of_birth
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

          </div>

        </div>

        {/* =================================================
            CONTACT INFORMATION
        ================================================= */}

        <div className="mb-8">

          <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label className={labelClass}>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Phone Number
              </label>

              <input
                type="text"
                name="phone_number"
                value={
                  formData.phone_number
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

          </div>

          <div className="mt-5">

            <label className={labelClass}>
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className={inputClass}
            />

          </div>

        </div>

        {/* =================================================
            PROFESSIONAL INFORMATION
        ================================================= */}

        <div className="mb-8">

          <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
            Professional Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* DEPARTMENT */}

            <div>
              <label className={labelClass}>
                Department
              </label>

              <select
                name="department"
                value={
                  formData.department
                }
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select Department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  ),
                )}

              </select>
            </div>

            {/* QUALIFICATION */}

            <div>
              <label className={labelClass}>
                Qualification
              </label>

              <input
                type="text"
                name="qualification"
                value={
                  formData.qualification
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* SPECIALIZATION */}

            <div>
              <label className={labelClass}>
                Specialization
              </label>

              <input
                type="text"
                name="specialization"
                value={
                  formData.specialization
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* EMPLOYMENT DATE */}

            <div>
              <label className={labelClass}>
                Employment Date
              </label>

              <input
                type="date"
                name="employment_date"
                value={
                  formData.employment_date
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* EMPLOYMENT STATUS */}

            <div>
              <label className={labelClass}>
                Employment Status
              </label>

              <select
                name="employment_status"
                value={
                  formData.employment_status
                }
                onChange={handleChange}
                className={inputClass}
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="ON_LEAVE">
                  On Leave
                </option>

                <option value="SUSPENDED">
                  Suspended
                </option>

                <option value="RESIGNED">
                  Resigned
                </option>

                <option value="RETIRED">
                  Retired
                </option>
              </select>
            </div>

          </div>

          {/* CLASS TEACHER */}

          <label className="mt-5 flex cursor-pointer items-center gap-3">

            <input
              type="checkbox"
              name="is_class_teacher"
              checked={
                formData.is_class_teacher
              }
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />

            <span className="text-sm font-medium text-[var(--color-text)]">
              This teacher is a class teacher
            </span>

          </label>

        </div>

        {/* =================================================
            ADDITIONAL INFORMATION
        ================================================= */}

        <div className="mb-8">

          <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
            Additional Information
          </h2>

          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="5"
            placeholder="Write a short biography about the teacher..."
            className={inputClass}
          />

        </div>

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:justify-end">

          <Link
            to={`/school-admin/people/teachers/${id}`}
            className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-6 py-3 text-center font-medium text-[var(--color-text)] transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--color-primary)] px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Updating..."
              : "Update Teacher"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default EditTeacher;