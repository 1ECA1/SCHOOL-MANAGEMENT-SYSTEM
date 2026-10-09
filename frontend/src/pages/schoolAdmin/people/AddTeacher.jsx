

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";

const AddTeacher = () => {
const navigate = useNavigate();

const [departments, setDepartments] = useState([]);
const [loading, setLoading] = useState(false);
const [dataLoading, setDataLoading] = useState(true);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [credentials, setCredentials] = useState(null);
const [copyMessage, setCopyMessage] = useState("");

const [profileImage, setProfileImage] = useState(null);
const [imagePreview, setImagePreview] = useState("");

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

useEffect(() => {
let mounted = true;


const fetchFormData = async () => {
  try {
    setDataLoading(true);
    setError("");

    const response = await api.get("/academics/departments/");

    const departmentsData = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    if (mounted) {
      setDepartments(departmentsData);
    }
  } catch (err) {
    console.error("Failed to load teacher form data:", err);

    if (mounted) {
      setError(
        err.response?.data?.detail ||
          "Failed to load departments. Please check your connection and permissions.",
      );
    }
  } finally {
    if (mounted) {
      setDataLoading(false);
    }
  }
};

fetchFormData();

return () => {
  mounted = false;
};


}, []);

useEffect(() => {
return () => {
if (imagePreview) {
URL.revokeObjectURL(imagePreview);
}
};
}, [imagePreview]);

const handleChange = (e) => {
const { name, value, type, checked } = e.target;


setFormData((previous) => ({
  ...previous,
  [name]: type === "checkbox" ? checked : value,
}));

setError("");
setSuccess("");
setCredentials(null);
setCopyMessage("");


};

const handleImageChange = (e) => {
const file = e.target.files?.[0];


if (!file) return;

if (!file.type.startsWith("image/")) {
  setError("Please select a valid image file.");
  e.target.value = "";
  return;
}

if (file.size > 5 * 1024 * 1024) {
  setError("Profile picture must be smaller than 5MB.");
  e.target.value = "";
  return;
}

if (imagePreview) {
  URL.revokeObjectURL(imagePreview);
}

setProfileImage(file);
setImagePreview(URL.createObjectURL(file));
setError("");
setSuccess("");
setCredentials(null);
setCopyMessage("");


};

const removeProfileImage = () => {
setProfileImage(null);


if (imagePreview) {
  URL.revokeObjectURL(imagePreview);
}

setImagePreview("");

const fileInput = document.getElementById("profile_image");

if (fileInput) {
  fileInput.value = "";
}


};

const formatApiError = (data) => {
if (!data) {
return "Failed to create teacher. Please try again.";
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
        ? value
            .map((item) =>
              typeof item === "string"
                ? item
                : JSON.stringify(item),
            )
            .join(", ")
        : typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value);

      return `${key}: ${message}`;
    })
    .join(" | ");
}

return "Failed to create teacher. Please try again.";


};

const handleCopyCredentials = async () => {
if (!credentials?.username || !credentials?.password) {
return;
}


const text = [
  "EduManageERP Teacher Login",
  `Username: ${credentials.username}`,
  `Temporary Password: ${credentials.password}`,
].join("\n");

try {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    setCopyMessage("Credentials copied successfully.");
  } else {
    throw new Error("Clipboard unavailable");
  }
} catch {
  setCopyMessage(
    "Automatic copying failed. Select and copy the credentials manually.",
  );
}


};

const handleSubmit = async (e) => {
e.preventDefault();


if (loading) return;

setError("");
setSuccess("");
setCredentials(null);
setCopyMessage("");

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

  const data = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (key === "department" && !value) return;

    if (typeof value === "boolean") {
      data.append(key, value ? "true" : "false");
      return;
    }

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      data.append(
        key,
        typeof value === "string" ? value.trim() : value,
      );
    }
  });

  if (profileImage) {
    data.append("profile_image", profileImage);
  }

  // Do not send a school ID from the browser.
  // The backend should assign the authenticated
  // School Admin's school.
  const response = await api.post("/teachers/", data);

  const returnedCredentials = response.data?.login_credentials;

  setCredentials(
    returnedCredentials?.username && returnedCredentials?.password
      ? {
          username: returnedCredentials.username,
          password: returnedCredentials.password,
        }
      : null,
  );

  setSuccess(
    "Teacher added successfully. The teacher profile has been created.",
  );

  // Deliberately do not redirect automatically.
  // Keep the result visible until the administrator continues.
  window.scrollTo({ top: 0, behavior: "smooth" });
} catch (err) {
  console.error("Failed to create teacher:", err);
  console.error("Server response:", err.response?.data);

  setError(formatApiError(err.response?.data));
} finally {
  setLoading(false);
}


};

const inputClass =
"w-full min-w-0 rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] dark:border-gray-700";

const labelClass =
"mb-2 block text-sm font-medium text-[var(--color-text)]";

if (dataLoading) {
return ( <div className="min-h-[400px] bg-[var(--color-background)] p-6"> <div className="flex min-h-[300px] items-center justify-center"> <p className="text-sm text-gray-500 dark:text-gray-400">
Loading form... </p> </div> </div>
);
}

return ( <div className="mx-auto w-full max-w-6xl p-4 md:p-6"> <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <h1 className="text-2xl font-bold text-[var(--color-text)]">
Add Teacher </h1> <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
Add a new teacher to your school. </p> </div>


    <Link
      to="/school-admin/people/teachers"
      className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2 text-center text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      ← Back to Teachers
    </Link>
  </div>

  {error && (
    <div
      role="alert"
      className="mb-5 break-words rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
    >
      {error}
    </div>
  )}

  {success && (
    <div
      role="status"
      className="mb-6 break-words rounded-xl border border-green-200 bg-green-50 p-5 text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300"
    >
      <h2 className="text-lg font-semibold">
        {success}
      </h2>

      {credentials ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm">
            Save these login credentials and share them securely
            with the teacher. The temporary password will not
            be shown again after you leave this page.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Username
            </label>
            <div className="break-all rounded-lg border border-green-200 bg-white p-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              {credentials.username}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Temporary Password
            </label>
            <div className="break-all rounded-lg border border-green-200 bg-white p-3 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              {credentials.password}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCredentials}
            className="w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 sm:w-auto"
          >
            Copy Credentials
          </button>

          {copyMessage && (
            <p className="text-sm" aria-live="polite">
              {copyMessage}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm">
          The server did not return new login credentials.
          The teacher profile may already be linked to a user
          account. Check the backend response if new credentials
          were expected.
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate("/school-admin/people/teachers")}
        className="mt-5 w-full rounded-lg border border-green-700 px-5 py-3 text-sm font-semibold transition hover:bg-green-100 dark:hover:bg-green-900/30 sm:w-auto"
      >
        Continue to Teachers
      </button>
    </div>
  )}

  {!success && (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-gray-800 sm:p-6 md:p-8"
    >
      <fieldset disabled={loading}>
        {/* PROFILE PICTURE */}
        <section className="mb-8">
          <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
            Profile Picture
          </h2>

          <div className="flex flex-col items-center gap-5 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/50 sm:flex-row sm:p-6">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow dark:border-gray-700 dark:bg-gray-800">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Teacher preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-4xl">👤</div>
                  <p className="mt-1 text-xs">No photo</p>
                </div>
              )}
            </div>

            <div className="w-full min-w-0 flex-1">
              <label htmlFor="profile_image" className={labelClass}>
                Teacher Profile Picture
              </label>
              <input
                id="profile_image"
                name="profile_image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full min-w-0 cursor-pointer rounded-lg border border-gray-300 bg-[var(--color-card)] text-sm text-[var(--color-text)] file:mr-3 file:border-0 file:bg-gray-100 file:px-3 file:py-3 file:text-sm file:font-medium hover:file:bg-gray-200 dark:border-gray-700 dark:file:bg-gray-800"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG or WebP. Maximum size: 5MB.
              </p>

              {profileImage && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="break-all text-sm text-gray-600 dark:text-gray-300">
                    {profileImage.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BASIC INFORMATION */}
        <section className="mb-8">
          <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="employee_id" className={labelClass}>
                Employee ID *
              </label>
              <input
                id="employee_id"
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                required
                placeholder="e.g. TCH001"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="first_name" className={labelClass}>
                First Name *
              </label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="middle_name" className={labelClass}>
                Middle Name
              </label>
              <input
                id="middle_name"
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="last_name" className={labelClass}>
                Last Name *
              </label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="gender" className={labelClass}>
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="date_of_birth" className={labelClass}>
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* CONTACT INFORMATION */}
        <section className="mb-8">
          <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="phone_number" className={labelClass}>
                Phone Number
              </label>
              <input
                id="phone_number"
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="address" className={labelClass}>
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className={inputClass}
            />
          </div>
        </section>

        {/* PROFESSIONAL INFORMATION */}
        <section className="mb-8">
          <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
            Professional Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="department" className={labelClass}>
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="qualification" className={labelClass}>
                Qualification
              </label>
              <input
                id="qualification"
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g. B.Sc Mathematics"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="specialization" className={labelClass}>
                Specialization
              </label>
              <input
                id="specialization"
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Mathematics Education"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="employment_date" className={labelClass}>
                Employment Date
              </label>
              <input
                id="employment_date"
                type="date"
                name="employment_date"
                value={formData.employment_date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="employment_status" className={labelClass}>
                Employment Status
              </label>
              <select
                id="employment_status"
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="RESIGNED">Resigned</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="is_class_teacher"
                  checked={formData.is_class_teacher}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-[var(--color-text)]">
                  Class Teacher
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* ADDITIONAL INFORMATION */}
        <section className="mb-8">
          <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
            Additional Information
          </h2>

          <label htmlFor="bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={5}
            placeholder="Write a short biography about the teacher..."
            className={inputClass}
          />
        </section>
      </fieldset>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:justify-end">
        <Link
          to="/school-admin/people/teachers"
          className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-6 py-3 text-center font-medium text-[var(--color-text)] transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--color-primary)] px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Adding Teacher..." : "Add Teacher"}
        </button>
      </div>
    </form>
  )}
</div>


);
};

export default AddTeacher;
