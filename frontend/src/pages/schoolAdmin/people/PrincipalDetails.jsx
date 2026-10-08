// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../../../services/api";

// const PrincipalDetails = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();

//     const [principal, setPrincipal] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         fetchPrincipal();
//     }, [id]);

//     const fetchPrincipal = async () => {
//         try {
//             setLoading(true);
//             setError("");

//             const response = await api.get(
//                 `/principals/${id}/`
//             );

//             setPrincipal(response.data);
//         } catch (err) {
//             console.error(
//                 "Error loading principal:",
//                 err
//             );

//             setError(
//                 err.response?.data?.detail ||
//                     "Unable to load principal details."
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getImageUrl = (image) => {
//         if (!image) return null;

//         if (image.startsWith("http")) {
//             return image;
//         }

//         const baseURL =
//             api.defaults.baseURL || "";

//         return `${baseURL.replace(/\/$/, "")}${image}`;
//     };

//     if (loading) {
//         return (
//             <div className="flex min-h-[400px] items-center justify-center">
//                 <div className="text-sm text-gray-500">
//                     Loading principal details...
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-6">
//                 <button
//                     type="button"
//                     onClick={() =>
//                         navigate(
//                             "/school-admin/people/principals"
//                         )
//                     }
//                     className="mb-6 text-sm text-gray-600 hover:text-gray-900"
//                 >
//                     ← Back to Principals
//                 </button>

//                 <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//                     {error}
//                 </div>
//             </div>
//         );
//     }

//     if (!principal) {
//         return null;
//     }

//     const imageUrl = getImageUrl(
//         principal.profile_image
//     );

//     const fullName =
//         `${principal.first_name || ""} ${
//             principal.last_name || ""
//         }`.trim() || principal.username;

//     return (
//         <div className="p-6">
//             {/* HEADER */}

//             <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                     <button
//                         type="button"
//                         onClick={() =>
//                             navigate(
//                                 "/school-admin/people/principals"
//                             )
//                         }
//                         className="mb-3 text-sm text-gray-600 hover:text-gray-900"
//                     >
//                         ← Back to Principals
//                     </button>

//                     <h1 className="text-2xl font-bold text-gray-900">
//                         Principal Details
//                     </h1>

//                     <p className="mt-1 text-sm text-gray-500">
//                         View principal account and employment
//                         information.
//                     </p>
//                 </div>

//                 <button
//                     type="button"
//                     onClick={() =>
//                         navigate(
//                             `/school-admin/people/principals/${id}/edit`
//                         )
//                     }
//                     className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
//                 >
//                     Edit Principal
//                 </button>
//             </div>

//             {/* PROFILE HEADER */}

//             <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
//                 <div className="flex flex-col items-center gap-5 sm:flex-row">
//                     <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
//                         {imageUrl ? (
//                             <img
//                                 src={imageUrl}
//                                 alt={fullName}
//                                 className="h-full w-full object-cover"
//                             />
//                         ) : (
//                             <span className="text-3xl font-semibold text-gray-400">
//                                 {fullName
//                                     .charAt(0)
//                                     .toUpperCase()}
//                             </span>
//                         )}
//                     </div>

//                     <div className="text-center sm:text-left">
//                         <h2 className="text-2xl font-bold text-gray-900">
//                             {fullName}
//                         </h2>

//                         <p className="mt-1 text-sm text-gray-500">
//                             {principal.role_display ||
//                                 principal.role ||
//                                 "Principal"}
//                         </p>

//                         <div className="mt-3">
//                             <span
//                                 className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
//                                     principal.is_active
//                                         ? "bg-green-100 text-green-700"
//                                         : "bg-red-100 text-red-700"
//                                 }`}
//                             >
//                                 {principal.is_active
//                                     ? "Active"
//                                     : "Inactive"}
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* PERSONAL INFORMATION */}

//             <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
//                 <h2 className="mb-5 text-lg font-semibold text-gray-900">
//                     Personal Information
//                 </h2>

//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                     <InfoItem
//                         label="First Name"
//                         value={
//                             principal.first_name
//                         }
//                     />

//                     <InfoItem
//                         label="Last Name"
//                         value={
//                             principal.last_name
//                         }
//                     />

//                     <InfoItem
//                         label="Email"
//                         value={principal.email}
//                     />

//                     <InfoItem
//                         label="Phone Number"
//                         value={
//                             principal.phone_number
//                         }
//                     />

//                     <InfoItem
//                         label="Username"
//                         value={
//                             principal.username
//                         }
//                     />

//                     <InfoItem
//                         label="Role"
//                         value={
//                             principal.role_display ||
//                             principal.role
//                         }
//                     />
//                 </div>
//             </div>

//             {/* EMPLOYMENT INFORMATION */}

//             <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
//                 <h2 className="mb-5 text-lg font-semibold text-gray-900">
//                     Employment Information
//                 </h2>

//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                     <InfoItem
//                         label="Employee ID"
//                         value={
//                             principal.employee_id ||
//                             principal.profile?.employee_id
//                         }
//                     />

//                     <InfoItem
//                         label="Appointment Date"
//                         value={
//                             principal.appointment_date ||
//                             principal.profile?.appointment_date
//                         }
//                     />

//                     <InfoItem
//                         label="Qualification"
//                         value={
//                             principal.qualification ||
//                             principal.profile?.qualification
//                         }
//                     />

//                     <InfoItem
//                         label="School"
//                         value={
//                             principal.school_name ||
//                             principal.school?.name
//                         }
//                     />
//                 </div>
//             </div>

//             {/* BIO */}

//             <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
//                 <h2 className="mb-4 text-lg font-semibold text-gray-900">
//                     Biography
//                 </h2>

//                 <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
//                     {principal.bio ||
//                         principal.profile?.bio ||
//                         "No biography provided."}
//                 </p>
//             </div>

//             {/* ACCOUNT INFORMATION */}

//             <div className="rounded-xl bg-white p-6 shadow-sm">
//                 <h2 className="mb-5 text-lg font-semibold text-gray-900">
//                     Account Information
//                 </h2>

//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                     <InfoItem
//                         label="User ID"
//                         value={principal.id}
//                     />

//                     <InfoItem
//                         label="Profile ID"
//                         value={
//                             principal.profile_id ||
//                             principal.profile?.id
//                         }
//                     />

//                     <InfoItem
//                         label="Account Status"
//                         value={
//                             principal.is_active
//                                 ? "Active"
//                                 : "Inactive"
//                         }
//                     />

//                     <InfoItem
//                         label="Date Created"
//                         value={
//                             principal.created_at
//                                 ? new Date(
//                                       principal.created_at
//                                   ).toLocaleString()
//                                 : null
//                         }
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// const InfoItem = ({ label, value }) => {
//     return (
//         <div>
//             <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
//                 {label}
//             </p>

//             <p className="text-sm font-medium text-gray-800">
//                 {value !== null &&
//                 value !== undefined &&
//                 value !== ""
//                     ? value
//                     : "Not provided"}
//             </p>
//         </div>
//     );
// };

// export default PrincipalDetails;


import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../../../services/api";

const PrincipalDetails = () => {
    const { id } = useParams();

    const navigate = useNavigate();

    const [principal, setPrincipal] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {
        fetchPrincipal();
    }, [id]);

    const fetchPrincipal = async () => {
        try {
            setLoading(true);

            setError("");

            const response = await api.get(
                `/principals/${id}/`
            );

            setPrincipal(response.data);
        } catch (err) {
            console.error(
                "Error loading principal:",
                err
            );

            setError(
                err.response?.data?.detail ||
                    "Unable to load principal details."
            );
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (image) => {
        if (!image) return null;

        if (image.startsWith("http")) {
            return image;
        }

        const baseURL =
            api.defaults.baseURL || "";

        return `${baseURL.replace(/\/$/, "")}${image}`;
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-sm text-gray-500">
                    Loading principal details...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/school-admin/people/principals"
                        )
                    }
                    className="mb-6 text-sm text-gray-600 hover:text-gray-900"
                >
                    ← Back to Principals
                </button>

                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!principal) {
        return null;
    }

    const imageUrl = getImageUrl(
        principal.profile_image
    );

    /*
     * The Principal API returns:
     *
     * full_name: "John Principal"
     *
     * It does not return separate first_name
     * and last_name fields.
     */
    const fullName =
        principal.full_name ||
        principal.username ||
        "Principal";

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/school-admin/people/principals"
                            )
                        }
                        className="mb-3 text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Principals
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Principal Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View principal account and employment
                        information.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/school-admin/people/principals/${id}/edit`
                        )
                    }
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Edit Principal
                </button>
            </div>

            {/* PROFILE HEADER */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center gap-5 sm:flex-row">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={fullName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-3xl font-semibold text-gray-400">
                                {fullName
                                    .charAt(0)
                                    .toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {fullName}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Principal
                        </p>

                        <div className="mt-3">
                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                    principal.is_active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {principal.is_active
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* PERSONAL INFORMATION */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                    Personal Information
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InfoItem
                        label="Full Name"
                        value={principal.full_name}
                    />

                    <InfoItem
                        label="Email"
                        value={principal.email}
                    />

                    <InfoItem
                        label="Phone Number"
                        value={
                            principal.phone_number
                        }
                    />

                    <InfoItem
                        label="Username"
                        value={principal.username}
                    />

                    <InfoItem
                        label="Role"
                        value="Principal"
                    />

                    <InfoItem
                        label="Employee ID"
                        value={principal.employee_id}
                    />
                </div>
            </div>

            {/* EMPLOYMENT INFORMATION */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                    Employment Information
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InfoItem
                        label="Employee ID"
                        value={
                            principal.employee_id
                        }
                    />

                    <InfoItem
                        label="Appointment Date"
                        value={
                            principal.appointment_date
                        }
                    />

                    <InfoItem
                        label="Qualification"
                        value={
                            principal.qualification
                        }
                    />

                    <InfoItem
                        label="School"
                        value={
                            principal.school_name
                        }
                    />
                </div>
            </div>

            {/* BIO */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Biography
                </h2>

                <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                    {principal.bio ||
                        "No biography provided."}
                </p>
            </div>

            {/* ACCOUNT INFORMATION */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                    Account Information
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InfoItem
                        label="Username"
                        value={
                            principal.username
                        }
                    />

                    <InfoItem
                        label="Account Status"
                        value={
                            principal.is_active
                                ? "Active"
                                : "Inactive"
                        }
                    />

                    <InfoItem
                        label="Date Created"
                        value={
                            principal.created_at
                                ? new Date(
                                      principal.created_at
                                  ).toLocaleString()
                                : null
                        }
                    />
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => {
    return (
        <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                {label}
            </p>

            <p className="text-sm font-medium text-gray-800">
                {value !== null &&
                value !== undefined &&
                value !== ""
                    ? value
                    : "Not provided"}
            </p>
        </div>
    );
};

export default PrincipalDetails;
