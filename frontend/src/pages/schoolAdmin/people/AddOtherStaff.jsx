




import React, { useEffect, useState } from "react";
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

const [profileImage, setProfileImage] = useState(null);
const [previewImage, setPreviewImage] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [credentials, setCredentials] = useState(null);
const [copyMessage, setCopyMessage] = useState("");

const roleLabels = {
ACCOUNTANT: "Accountant / Finance Officer / Bursar",
LIBRARIAN: "Librarian",
ADMISSION_OFFICER: "Admission Officer",
EXAM_OFFICER: "Exam / Assessment Officer",
};

// Clean up temporary image previews.
useEffect(() => {
return () => {
if (previewImage) {
URL.revokeObjectURL(previewImage);
}
};
}, [previewImage]);

const handleCancel = () => {
navigate("/school-admin/people/other-staff");
};

const handleChange = (event) => {
const { name, value } = event.target;


setFormData((previous) => ({
  ...previous,
  [name]: value,
}));


};

const handleImageChange = (event) => {
const file = event.target.files?.[0];


setError("");

if (!file) {
  setProfileImage(null);
  setPreviewImage(null);
  return;
}

if (!file.type.startsWith("image/")) {
  setError("Please select a valid image file.");
  event.target.value = "";
  return;
}

if (file.size > 5 * 1024 * 1024) {
  setError("Profile image must not be larger than 5 MB.");
  event.target.value = "";
  return;
}

setProfileImage(file);
setPreviewImage(URL.createObjectURL(file));


};

// Read credentials from the response without assuming
// that every backend response uses the same wrapper.
const extractCredentials = (responseData) => {
const data = responseData || {};


const returnedCredentials =
  data.login_credentials ||
  data.credentials ||
  data.data?.login_credentials ||
  data.data?.credentials;

if (returnedCredentials && typeof returnedCredentials === "object") {
  const username =
    returnedCredentials.username ||
    returnedCredentials.user_name ||
    returnedCredentials.email;

  const password =
    returnedCredentials.password ||
    returnedCredentials.temporary_password ||
    returnedCredentials.temporary_password_plaintext;

  if (username || password) {
    return {
      username: username || "",
      password: password || "",
    };
  }
}

const username =
  data.username ||
  data.user_name ||
  data.data?.username ||
  data.data?.user_name;

const password =
  data.temporary_password ||
  data.temporary_password_plaintext ||
  data.password ||
  data.data?.temporary_password ||
  data.data?.temporary_password_plaintext ||
  data.data?.password;

if (username || password) {
  return {
    username: username || "",
    password: password || "",
  };
}

return null;


};

const handleSubmit = async (event) => {
event.preventDefault();


setError("");
setSuccess("");
setCredentials(null);
setCopyMessage("");
setLoading(true);

try {
  const data = new FormData();

  data.append("role", formData.role);
  data.append("first_name", formData.first_name.trim());
  data.append("last_name", formData.last_name.trim());

  if (formData.email.trim()) {
    data.append("email", formData.email.trim());
  }

  if (formData.phone_number.trim()) {
    data.append("phone_number", formData.phone_number.trim());
  }

  data.append("employee_number", formData.employee_number.trim());

  if (formData.employment_date) {
    data.append("employment_date", formData.employment_date);
  }

  if (profileImage) {
    data.append("profile_image", profileImage);
  }

  // Let the API client/browser set the multipart boundary.
  const response = await api.post(
    "/school-super-admin/users/create/",
    data
  );

  const responseData = response.data || {};
  const returnedCredentials = extractCredentials(responseData);

  setSuccess(
    responseData.message ||
      "Staff member created successfully."
  );

  if (returnedCredentials) {
    setCredentials(returnedCredentials);
  } else {
    console.warn(
      "Staff creation succeeded, but the response did not contain recognizable login credentials.",
      responseData
    );
  }
} catch (err) {
  console.error("Error creating staff member:", err);

  const responseData = err.response?.data;

  if (responseData && typeof responseData === "object") {
    const messages = [];

    Object.entries(responseData).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        messages.push(`${field}: ${value}`);
      } else if (value && typeof value === "object") {
        messages.push(`${field}: ${JSON.stringify(value)}`);
      }
    });

    setError(
      messages.join("\n") ||
        "Failed to create staff member. Please try again."
    );
  } else {
    setError(
      "Failed to create staff member. Please check your connection and try again."
    );
  }
} finally {
  setLoading(false);
}


};

const handleCopyCredentials = async () => {
if (!credentials) return;


const text = [
  `Username: ${credentials.username || "Not provided"}`,
  `Temporary Password: ${credentials.password || "Not provided"}`,
].join("\n");

try {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (!copied) {
      throw new Error("Copy command failed.");
    }
  }

  setCopyMessage("Credentials copied successfully.");
} catch (err) {
  console.error("Could not copy credentials:", err);
  setCopyMessage(
    "Copy failed. Please select and copy the credentials manually."
  );
}


};

const handleContinue = () => {
navigate("/school-admin/people/other-staff");
};

return ( <div className="min-h-full p-4 sm:p-6"> <div className="mb-6"> <button
       type="button"
       onClick={handleCancel}
       className="mb-4 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
     >
← Back to Other Staff </button>


    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
      Add Other Staff
    </h1>

    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Create an account for a non-teaching staff member in your school.
    </p>
  </div>

  {error && (
    <div
      role="alert"
      className="mb-6 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
    >
      {error}
    </div>
  )}

  {/* Successful creation and temporary login credentials */}
  {success && (
    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-900/20">
      <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
        Staff Created Successfully
      </h2>

      <p className="mt-2 text-sm text-green-700 dark:text-green-400">
        {success}
      </p>

      {credentials ? (
        <div className="mt-5 rounded-lg border border-green-200 bg-white p-4 dark:border-green-900/50 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Staff Login Credentials
          </h3>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Save these credentials and share them securely with the staff
            member. The temporary password may not be available to view
            again later.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Username
              </label>

              <div className="break-all rounded-md bg-gray-100 px-3 py-2 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-white">
                {credentials.username || "Not returned by the server"}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Temporary Password
              </label>

              <div className="break-all rounded-md bg-gray-100 px-3 py-2 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-white">
                {credentials.password || "Not returned by the server"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCredentials}
            disabled={!credentials.username && !credentials.password}
            className="mt-4 w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Copy Credentials
          </button>

          {copyMessage && (
            <p
              role="status"
              className="mt-2 text-sm text-gray-700 dark:text-gray-300"
            >
              {copyMessage}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          The staff account was created, but the server did not return
          recognizable login credentials. Do not create the staff account
          again just to retrieve the password. Check the browser Network
          tab and the backend response for this request.
        </div>
      )}

      <button
        type="button"
        onClick={handleContinue}
        className="mt-5 w-full rounded-lg border border-green-300 px-4 py-2.5 text-sm font-medium text-green-800 hover:bg-green-100 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/40 sm:w-auto"
      >
        Continue to Other Staff
      </button>
    </div>
  )}

  {!success && (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl rounded-xl bg-white p-4 shadow-sm dark:bg-[var(--color-card)] sm:p-6"
    >
      <fieldset disabled={loading}>
        {/* Staff Role */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Staff Role
          </h2>

          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Role *
          </label>

          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            The selected role determines which staff profile is created.
          </p>
        </section>

        {/* Profile Image */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Profile Image
          </h2>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Staff profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-center text-sm text-gray-400">
                  No image
                </span>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="profile_image"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Staff Photo
              </label>

              <input
                id="profile_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:text-gray-300"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Maximum file size: 5 MB.
              </p>

              {profileImage && (
                <p className="mt-2 break-all text-xs text-gray-600 dark:text-gray-400">
                  Selected: {profileImage.name}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="first_name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name *
              </label>

              <input
                id="first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                autoComplete="given-name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name *
              </label>

              <input
                id="last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                autoComplete="family-name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="staff@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="phone_number"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone Number
              </label>

              <input
                id="phone_number"
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                autoComplete="tel"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="08012345678"
              />
            </div>
          </div>
        </section>

        {/* Employment Information */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Employment Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="employee_number"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Employee Number *
              </label>

              <input
                id="employee_number"
                type="text"
                name="employee_number"
                value={formData.employee_number}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="ACC001"
              />
            </div>

            <div>
              <label
                htmlFor="employment_date"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Employment Date
              </label>

              <input
                id="employment_date"
                type="date"
                name="employment_date"
                value={formData.employment_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Staff..." : "Create Staff"}
          </button>
        </div>
      </fieldset>
    </form>
  )}
</div>


);
};

export default AddOtherStaff;
