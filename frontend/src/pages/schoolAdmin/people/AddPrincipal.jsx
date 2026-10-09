// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../../services/api";

// const AddPrincipal = () => {
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         first_name: "",
//         last_name: "",
//         email: "",
//         phone_number: "",
//         employee_id: "",
//         appointment_date: "",
//         qualification: "",
//         bio: "",
//     });

//     const [profileImage, setProfileImage] = useState(null);
//     const [previewImage, setPreviewImage] = useState(null);

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");

//     // ============================================================
//     // HANDLE TEXT INPUTS
//     // ============================================================

//     const handleChange = (event) => {
//         const { name, value } = event.target;

//         setFormData((previous) => ({
//             ...previous,
//             [name]: value,
//         }));
//     };

//     // ============================================================
//     // HANDLE PROFILE IMAGE
//     // ============================================================

//     const handleImageChange = (event) => {
//         const file = event.target.files?.[0];

//         if (!file) {
//             setProfileImage(null);
//             setPreviewImage(null);
//             return;
//         }

//         // Basic frontend validation
//         if (!file.type.startsWith("image/")) {
//             setError("Please select a valid image file.");
//             event.target.value = "";
//             return;
//         }

//         // 5 MB limit
//         if (file.size > 5 * 1024 * 1024) {
//             setError("Profile image must not be larger than 5 MB.");
//             event.target.value = "";
//             return;
//         }

//         setError("");
//         setProfileImage(file);

//         const imageUrl = URL.createObjectURL(file);
//         setPreviewImage(imageUrl);
//     };

//     // ============================================================
//     // SUBMIT
//     // ============================================================

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         setError("");
//         setSuccess("");
//         setLoading(true);

//         try {
//             const data = new FormData();

//             data.append("role", "PRINCIPAL");
//             data.append("first_name", formData.first_name);
//             data.append("last_name", formData.last_name);
//             data.append("email", formData.email);
//             data.append("phone_number", formData.phone_number);
//             data.append("employee_id", formData.employee_id);
//             data.append(
//                 "appointment_date",
//                 formData.appointment_date
//             );
//             data.append(
//                 "qualification",
//                 formData.qualification
//             );
//             data.append("bio", formData.bio);

//             if (profileImage) {
//                 data.append(
//                     "profile_image",
//                     profileImage
//                 );
//             }

//             const response = await api.post(
//                 "/school-super-admin/users/create/",
//                 data
//             );

//             setSuccess(
//                 response.data?.message ||
//                     "Principal created successfully."
//             );

//             // Give the user a moment to see the success message
//             setTimeout(() => {
//                 navigate(
//                     "/school-admin/people/principals"
//                 );
//             }, 1200);
//         } catch (err) {
//             console.error(
//                 "Error creating principal:",
//                 err
//             );

//             const responseData =
//                 err.response?.data;

//             if (
//                 responseData &&
//                 typeof responseData === "object"
//             ) {
//                 const messages = [];

//                 Object.entries(responseData).forEach(
//                     ([field, value]) => {
//                         if (Array.isArray(value)) {
//                             messages.push(
//                                 `${field}: ${value.join(", ")}`
//                             );
//                         } else if (
//                             typeof value === "string"
//                         ) {
//                             messages.push(
//                                 `${field}: ${value}`
//                             );
//                         } else {
//                             messages.push(
//                                 `${field}: ${JSON.stringify(
//                                     value
//                                 )}`
//                             );
//                         }
//                     }
//                 );

//                 setError(
//                     messages.join("\n") ||
//                         "Failed to create principal."
//                 );
//             } else {
//                 setError(
//                     "Failed to create principal. Please try again."
//                 );
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ============================================================
//     // CANCEL
//     // ============================================================

//     const handleCancel = () => {
//         navigate(
//             "/school-admin/people/principals"
//         );
//     };

//     return (
//         <div className="p-6">
//             {/* ================================================== */}
//             {/* HEADER */}
//             {/* ================================================== */}

//             <div className="mb-6">
//                 <button
//                     type="button"
//                     onClick={handleCancel}
//                     className="mb-4 text-sm text-gray-600 hover:text-gray-900"
//                 >
//                     ← Back to Principals
//                 </button>

//                 <h1 className="text-2xl font-bold text-gray-900">
//                     Add Principal
//                 </h1>

//                 <p className="mt-1 text-sm text-gray-500">
//                     Create a new principal account for your school.
//                 </p>
//             </div>

//             {/* ================================================== */}
//             {/* SUCCESS */}
//             {/* ================================================== */}

//             {success && (
//                 <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
//                     {success}
//                 </div>
//             )}

//             {/* ================================================== */}
//             {/* ERROR */}
//             {/* ================================================== */}

//             {error && (
//                 <div className="mb-6 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//                     {error}
//                 </div>
//             )}

//             {/* ================================================== */}
//             {/* FORM */}
//             {/* ================================================== */}

//             <form
//                 onSubmit={handleSubmit}
//                 className="max-w-4xl rounded-xl bg-white p-6 shadow-sm"
//             >
//                 {/* ================================================== */}
//                 {/* PROFILE IMAGE */}
//                 {/* ================================================== */}

//                 <div className="mb-8">
//                     <h2 className="mb-4 text-lg font-semibold text-gray-900">
//                         Profile Image
//                     </h2>

//                     <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
//                         {/* IMAGE PREVIEW */}

//                         <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
//                             {previewImage ? (
//                                 <img
//                                     src={previewImage}
//                                     alt="Profile preview"
//                                     className="h-full w-full object-cover"
//                                 />
//                             ) : (
//                                 <span className="text-center text-sm text-gray-400">
//                                     No image
//                                 </span>
//                             )}
//                         </div>

//                         {/* FILE INPUT */}

//                         <div>
//                             <label className="mb-2 block text-sm font-medium text-gray-700">
//                                 Principal Photo
//                             </label>

//                             <input
//                                 type="file"
//                                 accept="image/*"
//                                 onChange={
//                                     handleImageChange
//                                 }
//                                 className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
//                             />

//                             <p className="mt-2 text-xs text-gray-500">
//                                 JPG, PNG, WEBP or another supported
//                                 image format. Maximum 5 MB.
//                             </p>

//                             {profileImage && (
//                                 <p className="mt-2 text-xs text-gray-600">
//                                     Selected:{" "}
//                                     <span className="font-medium">
//                                         {profileImage.name}
//                                     </span>
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* ================================================== */}
//                 {/* PERSONAL INFORMATION */}
//                 {/* ================================================== */}

//                 <div className="mb-8">
//                     <h2 className="mb-4 text-lg font-semibold text-gray-900">
//                         Personal Information
//                     </h2>

//                     <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                         {/* FIRST NAME */}

//                         <div>
//                             <label className="mb-2 block text-sm font-medium text-gray-700">
//                                 First Name *
//                             </label>

//                             <input
//                                 type="text"
//                                 name="first_name"
//                                 value={
//                                     formData.first_name
//                                 }
//                                 onChange={
//                                     handleChange
//                                 }
//                                 required
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                                 placeholder="Enter first name"
//                             />
//                         </div>

//                         {/* LAST NAME */}

//                         <div>
//                             <label className="mb-2 block text-sm font-medium text-gray-700">
//                                 Last Name *
//                             </label>

//                             <input
//                                 type="text"
//                                 name="last_name"
//                                 value={
//                                     formData.last_name
//                                 }
//                                 onChange={
//                                     handleChange
//                                 }
//                                 required
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                                 placeholder="Enter last name"
//                             />
//                         </div>

//                         {/* EMAIL */}

//                         <div>
//                             <label className="mb-2 block text-sm font-medium text-gray-700">
//                                 Email
//                             </label>

//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={
//                                     handleChange
//                                 }
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                                 placeholder="principal@example.com"
//                             />
//                         </div>

//                         {/* PHONE */}

//                         <div>
//                             <label className="mb-2 block text-sm font-medium text-gray-700">
//                                 Phone Number
//                             </label>

//                             <input
//                                 type="tel"
//                                 name="phone_number"
//                                 value={
//                                     formData.phone_number
//                                 }
//                                 onChange={
//                                     handleChange
//                                 }
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                                 placeholder="08012345678"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* ================================================== */}
//                 {/* EMPLOYMENT INFORMATION */}
//                 {/* ================================================== */}

//                 <div className="mb-8">
//                     <h2 className="mb-4 text-lg font-semibold text-gray-900">
//                         Employment Information
//                     </h2>

//                     <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                         {/* EMPLOYEE ID */}

//                         <div>
//                             <label className="mb-2 block text-sm font-medium text-gray-700">
//                                 Employee ID *
//                             </label>

//                             <input
//                                 type="text"
//                                 name="employee_id"
//                                 value={
//                                     formData.employee_id
//                                 }
//                                 onChange={
//                                     handleChange
//                                 }
//                                 required
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                                 placeholder="PR-001"
//                             />
//                         </div>

//                         {/* APPOINTMENT DATE */}

//                         <div>
//                             <label className="mb-2 block text-sm font-medium text-gray-700">
//                                 Appointment Date
//                             </label>

//                             <input
//                                 type="date"
//                                 name="appointment_date"
//                                 value={
//                                     formData.appointment_date
//                                 }
//                                 onChange={
//                                     handleChange
//                                 }
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                             />
//                         </div>

//                         {/* QUALIFICATION */}

//                         <div className="md:col-span-2">
//                             <label className="mb-2 block text-sm font-medium text-gray-700">
//                                 Qualification
//                             </label>

//                             <input
//                                 type="text"
//                                 name="qualification"
//                                 value={
//                                     formData.qualification
//                                 }
//                                 onChange={
//                                     handleChange
//                                 }
//                                 className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                                 placeholder="e.g. B.Ed, M.Ed"
//                             />
//                         </div>

//                         {/* BIO */}

//                         <div className="md:col-span-2">
//                             <label className="mb-2 block text-sm font-medium text-gray-700">
//                                 Biography
//                             </label>

//                             <textarea
//                                 name="bio"
//                                 value={formData.bio}
//                                 onChange={
//                                     handleChange
//                                 }
//                                 rows={5}
//                                 className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                                 placeholder="Enter a short biography..."
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* ================================================== */}
//                 {/* ACTIONS */}
//                 {/* ================================================== */}

//                 <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
//                     <button
//                         type="button"
//                         onClick={handleCancel}
//                         disabled={loading}
//                         className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//                     >
//                         {loading
//                             ? "Creating Principal..."
//                             : "Create Principal"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddPrincipal;



import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const AddPrincipal = () => {
const navigate = useNavigate();


const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    employee_id: "",
    appointment_date: "",
    qualification: "",
    bio: "",
});

const [profileImage, setProfileImage] = useState(null);
const [previewImage, setPreviewImage] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [credentials, setCredentials] = useState(null);
const [copyMessage, setCopyMessage] = useState("");

useEffect(() => {
    return () => {
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }
    };
}, [previewImage]);

const handleCancel = () => {
    navigate("/school-admin/people/principals");
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

const extractCredentials = (responseData) => {
    const data = responseData || {};

    const returnedCredentials =
        data.login_credentials ||
        data.credentials ||
        data.data?.login_credentials ||
        data.data?.credentials;

    if (
        returnedCredentials &&
        typeof returnedCredentials === "object"
    ) {
        const username =
            returnedCredentials.username ||
            returnedCredentials.user_name ||
            returnedCredentials.email ||
            "";

        const password =
            returnedCredentials.password ||
            returnedCredentials.temporary_password ||
            returnedCredentials.temporary_password_plaintext ||
            "";

        if (username || password) {
            return { username, password };
        }
    }

    const username =
        data.username ||
        data.user_name ||
        data.data?.username ||
        data.data?.user_name ||
        "";

    const password =
        data.temporary_password ||
        data.temporary_password_plaintext ||
        data.password ||
        data.data?.temporary_password ||
        data.data?.temporary_password_plaintext ||
        data.data?.password ||
        "";

    if (username || password) {
        return { username, password };
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

        data.append("role", "PRINCIPAL");
        data.append("first_name", formData.first_name.trim());
        data.append("last_name", formData.last_name.trim());

        if (formData.email.trim()) {
            data.append("email", formData.email.trim());
        }

        if (formData.phone_number.trim()) {
            data.append("phone_number", formData.phone_number.trim());
        }

        data.append("employee_id", formData.employee_id.trim());

        if (formData.appointment_date) {
            data.append(
                "appointment_date",
                formData.appointment_date
            );
        }

        if (formData.qualification.trim()) {
            data.append(
                "qualification",
                formData.qualification.trim()
            );
        }

        if (formData.bio.trim()) {
            data.append("bio", formData.bio.trim());
        }

        if (profileImage) {
            data.append("profile_image", profileImage);
        }

        const response = await api.post(
            "/school-super-admin/users/create/",
            data
        );

        const responseData = response.data || {};

        setSuccess(
            responseData.message ||
            "Principal created successfully."
        );

        const returnedCredentials =
            extractCredentials(responseData);

        if (returnedCredentials) {
            setCredentials(returnedCredentials);
        } else {
            console.warn(
                "Principal creation succeeded, but the response did not contain recognizable login credentials.",
                responseData
            );
        }
    } catch (err) {
        console.error("Error creating principal:", err);

        const responseData = err.response?.data;

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
                    } else if (typeof value === "string") {
                        messages.push(`${field}: ${value}`);
                    } else if (
                        value &&
                        typeof value === "object"
                    ) {
                        messages.push(
                            `${field}: ${JSON.stringify(value)}`
                        );
                    }
                }
            );

            setError(
                messages.join("\n") ||
                "Failed to create principal."
            );
        } else {
            setError(
                "Failed to create principal. Please try again."
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

return (
    <div className="min-h-full p-4 sm:p-6">
        <div className="mb-6">
            <button
                type="button"
                onClick={handleCancel}
                className="mb-4 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
                ← Back to Principals
            </button>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add Principal
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create a new principal account for your school.
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

        {success && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-900/20">
                <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
                    Principal Created Successfully
                </h2>

                <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    {success}
                </p>

                {credentials ? (
                    <div className="mt-5 rounded-lg border border-green-200 bg-white p-4 dark:border-green-900/50 dark:bg-gray-900">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Principal Login Credentials
                        </h3>

                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Save these credentials and share them securely
                            with the principal.
                        </p>

                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Username
                                </label>

                                <div className="break-all rounded-md bg-gray-100 px-3 py-2 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-white">
                                    {credentials.username ||
                                        "Not returned by the server"}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Temporary Password
                                </label>

                                <div className="break-all rounded-md bg-gray-100 px-3 py-2 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-white">
                                    {credentials.password ||
                                        "Not returned by the server"}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyCredentials}
                            disabled={
                                !credentials.username &&
                                !credentials.password
                            }
                            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
                        The principal account was created, but the server
                        did not return recognizable login credentials.
                        Check the Network tab response for this request.
                    </div>
                )}

                <button
                    type="button"
                    onClick={() =>
                        navigate("/school-admin/people/principals")
                    }
                    className="mt-5 w-full rounded-lg border border-green-300 px-4 py-2.5 text-sm font-medium text-green-800 hover:bg-green-100 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/40 sm:w-auto"
                >
                    Continue to Principals
                </button>
            </div>
        )}

        {!success && (
            <form
                onSubmit={handleSubmit}
                className="max-w-4xl rounded-xl bg-white p-4 shadow-sm dark:bg-[var(--color-card)] sm:p-6"
            >
                <fieldset disabled={loading}>
                    <section className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Profile Image
                        </h2>

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Principal profile preview"
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
                                    Principal Photo
                                </label>

                                <input
                                    id="profile_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:text-gray-300"
                                />

                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Supported image formats. Maximum 5 MB.
                                </p>

                                {profileImage && (
                                    <p className="mt-2 break-all text-xs text-gray-600 dark:text-gray-400">
                                        Selected: {profileImage.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

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
                                    placeholder="principal@example.com"
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

                    <section className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Employment Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="employee_id"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Employee ID *
                                </label>

                                <input
                                    id="employee_id"
                                    type="text"
                                    name="employee_id"
                                    value={formData.employee_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    placeholder="PR-001"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="appointment_date"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Appointment Date
                                </label>

                                <input
                                    id="appointment_date"
                                    type="date"
                                    name="appointment_date"
                                    value={formData.appointment_date}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="qualification"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Qualification
                                </label>

                                <input
                                    id="qualification"
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    placeholder="e.g. B.Ed, M.Ed"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="bio"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Biography
                                </label>

                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    placeholder="Enter a short biography..."
                                />
                            </div>
                        </div>
                    </section>

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
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Creating Principal..."
                                : "Create Principal"}
                        </button>
                    </div>
                </fieldset>
            </form>
        )}
    </div>
);


};

export default AddPrincipal;
