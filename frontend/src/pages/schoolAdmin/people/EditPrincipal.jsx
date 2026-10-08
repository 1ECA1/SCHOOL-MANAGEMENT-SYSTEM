
import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../../../services/api";

const EditPrincipal = () => {
    const { id } = useParams();

    const navigate = useNavigate();

    const [principal, setPrincipal] = useState(null);

    const [formData, setFormData] = useState({
        employee_id: "",
        appointment_date: "",
        qualification: "",
        bio: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

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

            const data = response.data;

            setPrincipal(data);

            setFormData({
                employee_id:
                    data.employee_id || "",

                appointment_date:
                    data.appointment_date || "",

                qualification:
                    data.qualification || "",

                bio:
                    data.bio || "",

                is_active:
                    data.is_active ?? true,
            });
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

    const handleChange = (event) => {
        const { name, value, type, checked } =
            event.target;

        setFormData((previous) => ({
            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            setError("");

            setSuccess("");

            const response = await api.patch(
                `/principals/${id}/`,
                {
                    employee_id:
                        formData.employee_id.trim(),

                    appointment_date:
                        formData.appointment_date ||
                        null,

                    qualification:
                        formData.qualification.trim(),

                    bio: formData.bio.trim(),

                    is_active:
                        formData.is_active,
                }
            );

            setPrincipal(response.data);

            setSuccess(
                "Principal details updated successfully."
            );

            setTimeout(() => {
                navigate(
                    `/school-admin/people/principals/${id}`
                );
            }, 800);
        } catch (err) {
            console.error(
                "Error updating principal:",
                err
            );

            const data = err.response?.data;

            if (typeof data === "object" && data !== null) {
                const messages = Object.entries(data)
                    .map(([field, message]) => {
                        const text = Array.isArray(
                            message
                        )
                            ? message.join(", ")
                            : message;

                        return `${field}: ${text}`;
                    })
                    .join(" ");

                setError(
                    messages ||
                        "Unable to update principal."
                );
            } else {
                setError(
                    "Unable to update principal."
                );
            }
        } finally {
            setSaving(false);
        }
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

    if (error && !principal) {
        return (
            <div className="p-6">
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/school-admin/people/principals/${id}`
                        )
                    }
                    className="mb-6 text-sm text-gray-600 hover:text-gray-900"
                >
                    ← Back to Principal
                </button>

                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    const fullName =
        principal?.full_name ||
        principal?.username ||
        "Principal";

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/school-admin/people/principals/${id}`
                        )
                    }
                    className="mb-3 text-sm text-gray-600 hover:text-gray-900"
                >
                    ← Back to Principal
                </button>

                <h1 className="text-2xl font-bold text-gray-900">
                    Edit Principal
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Update principal employment and
                    account information.
                </p>
            </div>

            {/* PRINCIPAL SUMMARY */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100">
                        <span className="text-2xl font-semibold text-gray-400">
                            {fullName
                                .charAt(0)
                                .toUpperCase()}
                        </span>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {fullName}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            @{principal?.username}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Employee ID:{" "}
                            {principal?.employee_id ||
                                "Not provided"}
                        </p>
                    </div>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* SUCCESS */}
            {success && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit}>
                {/* EMPLOYMENT INFORMATION */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Employment Information
                    </h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Employee ID */}
                        <div>
                            <label
                                htmlFor="employee_id"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Employee ID
                            </label>

                            <input
                                id="employee_id"
                                name="employee_id"
                                type="text"
                                value={
                                    formData.employee_id
                                }
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                placeholder="Enter employee ID"
                            />
                        </div>

                        {/* Appointment Date */}
                        <div>
                            <label
                                htmlFor="appointment_date"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Appointment Date
                            </label>

                            <input
                                id="appointment_date"
                                name="appointment_date"
                                type="date"
                                value={
                                    formData.appointment_date
                                }
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                            />
                        </div>

                        {/* Qualification */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="qualification"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Qualification
                            </label>

                            <input
                                id="qualification"
                                name="qualification"
                                type="text"
                                value={
                                    formData.qualification
                                }
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                placeholder="e.g. B.Ed, M.Ed"
                            />
                        </div>

                        {/* Biography */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="bio"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Biography
                            </label>

                            <textarea
                                id="bio"
                                name="bio"
                                rows="5"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                placeholder="Enter principal biography..."
                            />
                        </div>
                    </div>
                </div>

                {/* ACCOUNT STATUS */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-gray-900">
                        Account Status
                    </h2>

                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={
                                formData.is_active
                            }
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />

                        <span className="text-sm font-medium text-gray-700">
                            Principal account is active
                        </span>
                    </label>

                    <p className="mt-2 text-sm text-gray-500">
                        Inactive principals will not be
                        able to use their account.
                    </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/school-admin/people/principals/${id}`
                            )
                        }
                        disabled={saving}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPrincipal;
