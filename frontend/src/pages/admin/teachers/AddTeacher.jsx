import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";

const AddTeacher = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    school: "",
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
  // LOAD FORM DATA
  // =====================================================

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setDataLoading(true);
      setError("");

      const [schoolsResponse, departmentsResponse] =
        await Promise.all([
          api.get("/academics/schools/"),
          api.get("/academics/departments/"),
        ]);

      const schoolsData = Array.isArray(schoolsResponse.data)
        ? schoolsResponse.data
        : schoolsResponse.data?.results || [];

      const departmentsData = Array.isArray(departmentsResponse.data)
        ? departmentsResponse.data
        : departmentsResponse.data?.results || [];

      setSchools(schoolsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to load teacher form data:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load form data. Please check that the backend is running.",
      );
    } finally {
      setDataLoading(false);
    }
  };

  // =====================================================
  // HANDLE TEXT / SELECT / CHECKBOX INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
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

  // =====================================================
  // HANDLE PROFILE IMAGE
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be smaller than 5MB.");
      return;
    }

    setProfileImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setError("");
  };

  // =====================================================
  // REMOVE PROFILE IMAGE
  // =====================================================

  const removeProfileImage = () => {
    setProfileImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");

    // Reset file input
    const fileInput = document.getElementById("profile_image");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =====================================================
  // FORMAT API ERROR
  // =====================================================

  const formatApiError = (data) => {
    if (!data) {
      return "Failed to create teacher.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (typeof data === "object") {
      return Object.entries(data)
        .map(([key, value]) => {
          const message = Array.isArray(value)
            ? value.join(", ")
            : String(value);

          return `${key}: ${message}`;
        })
        .join(" | ");
    }

    return "Failed to create teacher.";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // ---------------------------------------------
      // BASIC VALIDATION
      // ---------------------------------------------

      if (!formData.school) {
        setError("Please select a school.");
        return;
      }

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

      // ---------------------------------------------
      // CREATE FORMDATA
      // ---------------------------------------------

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        // Department is optional
        if (key === "department" && !value) {
          return;
        }

        // Convert checkbox boolean to string
        if (typeof value === "boolean") {
          data.append(key, value ? "true" : "false");
          return;
        }

        // Don't send empty optional values
        if (value !== null && value !== undefined && value !== "") {
          data.append(key, value);
        }
      });

      // ---------------------------------------------
      // ADD PROFILE IMAGE
      // ---------------------------------------------

      if (profileImage) {
        data.append("profile_image", profileImage);
      }

      // ---------------------------------------------
      // SEND TO DJANGO
      // ---------------------------------------------

      await api.post("/teachers/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Teacher added successfully.");

      // ---------------------------------------------
      // REDIRECT
      // ---------------------------------------------

      setTimeout(() => {
        navigate("/admin/teachers");
      }, 1200);
    } catch (error) {
      console.error("Failed to create teacher:", error);
      console.error("Server response:", error.response?.data);

      setError(formatApiError(error.response?.data));
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (dataLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading form...
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Add Teacher
          </h1>

          <p className="text-sm text-gray-500">
            Add a new teacher to the school.
          </p>
        </div>

        <Link
          to="/admin/teachers"
          className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          ← Back to Teachers
        </Link>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="rounded-xl bg-white p-5 shadow md:p-8"
      >

        {/* =================================================
            PROFILE PICTURE
        ================================================= */}

        <div className="mb-8">

          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Profile Picture
          </h2>

          <div className="flex flex-col items-center gap-5 rounded-xl border border-gray-200 bg-gray-50 p-6 sm:flex-row">

            {/* Preview */}

            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow">

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Teacher preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-4xl">
                    👤
                  </div>

                  <p className="mt-1 text-xs">
                    No photo
                  </p>
                </div>
              )}

            </div>

            {/* Upload Controls */}

            <div className="flex-1">

              <label
                htmlFor="profile_image"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Teacher Profile Picture
              </label>

              <input
                id="profile_image"
                name="profile_image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-sm file:font-medium hover:file:bg-gray-200"
              />

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG or WebP. Maximum size: 5MB.
              </p>

              {profileImage && (
                <div className="mt-3 flex items-center gap-3">

                  <span className="text-sm text-gray-600">
                    {profileImage.name}
                  </span>

                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <div className="mb-8">

          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* School */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                School *
              </label>

              <select
                name="school"
                value={formData.school}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">
                  Select School
                </option>

                {schools.map((school) => (
                  <option
                    key={school.id}
                    value={school.id}
                  >
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee ID */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Employee ID *
              </label>

              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                required
                placeholder="e.g. TCH001"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* First Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                First Name *
              </label>

              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Middle Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Middle Name
              </label>

              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Last Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Last Name *
              </label>

              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Gender */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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

            {/* Date of Birth */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date of Birth
              </label>

              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

        </div>

        {/* =================================================
            CONTACT INFORMATION
        ================================================= */}

        <div className="mb-8">

          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* Address */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

        </div>

        {/* =================================================
            PROFESSIONAL INFORMATION
        ================================================= */}

        <div className="mb-8">

          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Professional Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* Department */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Department
              </label>

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">
                  Select Department
                </option>

                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </option>
                ))}

              </select>
            </div>

            {/* Qualification */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Qualification
              </label>

              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g. B.Sc Mathematics"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Specialization */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Specialization
              </label>

              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Mathematics Education"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Employment Date */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Employment Date
              </label>

              <input
                type="date"
                name="employment_date"
                value={formData.employment_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Employment Status */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Employment Status
              </label>

              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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

            {/* Class Teacher */}

            <div className="flex items-center">

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  name="is_class_teacher"
                  checked={formData.is_class_teacher}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300"
                />

                <span className="text-sm font-medium text-gray-700">
                  Class Teacher
                </span>

              </label>

            </div>

          </div>

        </div>

        {/* =================================================
            ADDITIONAL INFORMATION
        ================================================= */}

        <div className="mb-8">

          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Additional Information
          </h2>

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Bio
            </label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="5"
              placeholder="Write a short biography about the teacher..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

        </div>

        {/* =================================================
            SUBMIT BUTTONS
        ================================================= */}

        <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">

          <Link
            to="/admin/teachers"
            className="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Adding Teacher..." : "Add Teacher"}
          </button>

        </div>

      </form>
    </div>
  );
};

export default AddTeacher;