
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";


function getProfileImageUrl(profileImage) {
  if (!profileImage) {
    return null;
  }

  if (
    profileImage.startsWith("http://") ||
    profileImage.startsWith("https://")
  ) {
    return profileImage;
  }

  const baseURL = api.defaults.baseURL || "";

  if (baseURL.endsWith("/api")) {
    return `${baseURL.slice(0, -4)}${profileImage}`;
  }

  return `${baseURL.replace(/\/$/, "")}${profileImage}`;
}


function getInitials(firstName = "", lastName = "") {
  const first = firstName?.trim()?.charAt(0) || "";
  const last = lastName?.trim()?.charAt(0) || "";

  return `${first}${last}`.toUpperCase() || "ST";
}


export default function EditOtherStaff() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentImage, setCurrentImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    is_active: true,
  });


  useEffect(() => {
    const loadStaff = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/school-super-admin/users/${id}/`
        );

        const staff = response.data;

        setForm({
          first_name: staff.first_name || "",
          last_name: staff.last_name || "",
          email: staff.email || "",
          phone_number: staff.phone_number || "",
          is_active:
            staff.is_active !== undefined
              ? staff.is_active
              : true,
        });

        setCurrentImage(
          getProfileImageUrl(
            staff.profile_image
          )
        );
      } catch (err) {
        console.error(
          "Failed to load staff:",
          err
        );

        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Unable to load staff information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, [id]);


  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile image must not be larger than 5 MB."
      );
      return;
    }

    setError("");

    setForm((previous) => ({
      ...previous,
      profile_image: file,
    }));

    setPreviewImage(
      URL.createObjectURL(file)
    );
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append(
        "first_name",
        form.first_name.trim()
      );

      formData.append(
        "last_name",
        form.last_name.trim()
      );

      formData.append(
        "email",
        form.email.trim()
      );

      formData.append(
        "phone_number",
        form.phone_number.trim()
      );

      formData.append(
        "is_active",
        form.is_active ? "true" : "false"
      );

      if (form.profile_image) {
        formData.append(
          "profile_image",
          form.profile_image
        );
      }

      await api.patch(
        `/school-super-admin/users/${id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(
        "Staff information updated successfully."
      );

      setTimeout(() => {
        navigate(
          `/school-admin/people/other-staff/${id}`
        );
      }, 800);
    } catch (err) {
      console.error(
        "Failed to update staff:",
        err
      );

      const responseData =
        err.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.entries(
          responseData
        )
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return `${field}: ${value.join(", ")}`;
            }

            return `${field}: ${value}`;
          })
          .join(" ");

        setError(
          messages ||
            "Unable to update staff information."
        );
      } else {
        setError(
          "Unable to update staff information."
        );
      }
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div
        className="flex min-h-[400px] items-center justify-center"
        style={{
          backgroundColor:
            "var(--color-background)",
        }}
      >
        <div className="text-sm text-gray-500">
          Loading staff information...
        </div>
      </div>
    );
  }


  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{
        backgroundColor:
          "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      {/* HEADER */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/school-admin/people/other-staff/${id}`
            )
          }
          className="mb-3 text-sm font-medium"
          style={{
            color: "var(--color-primary)",
          }}
        >
          ← Back to Staff Details
        </button>

        <h1 className="text-2xl font-bold">
          Edit Other Staff
        </h1>

        <p
          className="mt-1 text-sm"
          style={{
            color:
              "var(--color-muted, #6b7280)",
          }}
        >
          Update the staff member's account information.
        </p>
      </div>


      {/* MESSAGES */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}


      <form onSubmit={handleSubmit}>
        <div
          className="overflow-hidden rounded-2xl border shadow-sm"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border, #e5e7eb)",
          }}
        >
          {/* PROFILE IMAGE */}
          <div className="border-b p-6">
            <h2 className="mb-4 text-lg font-bold">
              Profile Photo
            </h2>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div>
                {previewImage || currentImage ? (
                  <img
                    src={
                      previewImage ||
                      currentImage
                    }
                    alt="Staff"
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-100"
                  />
                ) : (
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-full text-xl font-bold text-white"
                    style={{
                      backgroundColor:
                        "var(--color-primary)",
                    }}
                  >
                    {getInitials(
                      form.first_name,
                      form.last_name
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Change Profile Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm"
                />

                <p className="mt-2 text-xs text-gray-500">
                  JPG, PNG, WEBP or another supported image.
                  Maximum size: 5 MB.
                </p>
              </div>
            </div>
          </div>


          {/* PERSONAL INFORMATION */}
          <div className="border-b p-6">
            <h2 className="mb-5 text-lg font-bold">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="first_name"
                  className="mb-2 block text-sm font-semibold"
                >
                  First Name
                </label>

                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2"
                  style={{
                    borderColor:
                      "var(--color-border, #d1d5db)",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Last Name
                </label>

                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
                  style={{
                    borderColor:
                      "var(--color-border, #d1d5db)",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
                  style={{
                    borderColor:
                      "var(--color-border, #d1d5db)",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="phone_number"
                  className="mb-2 block text-sm font-semibold"
                >
                  Phone Number
                </label>

                <input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  value={form.phone_number}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
                  style={{
                    borderColor:
                      "var(--color-border, #d1d5db)",
                  }}
                />
              </div>
            </div>
          </div>


          {/* ACCOUNT STATUS */}
          <div className="p-6">
            <h2 className="mb-5 text-lg font-bold">
              Account Status
            </h2>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    is_active:
                      event.target.checked,
                  }))
                }
                className="h-4 w-4"
              />

              <span className="text-sm font-medium">
                Account is active
              </span>
            </label>
          </div>


          {/* ACTIONS */}
          <div
            className="flex flex-col-reverse gap-3 border-t p-6 sm:flex-row sm:justify-end"
          >
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/school-admin/people/other-staff/${id}`
                )
              }
              className="rounded-lg border px-5 py-2.5 text-sm font-semibold"
              style={{
                borderColor:
                  "var(--color-border, #d1d5db)",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor:
                  "var(--color-primary)",
              }}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}