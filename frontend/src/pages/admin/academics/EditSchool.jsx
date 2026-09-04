import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSchool,
  updateSchool,
} from "../../../services/academicsService";

const EditSchool = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    principal_name: "",
    established_year: "",
    is_active: true,
    logo: null,
  });

  const [currentLogo, setCurrentLogo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD SCHOOL
  // =====================================================

  useEffect(() => {
    const loadSchool = async () => {
      try {
        setLoading(true);
        setError("");

        const school = await getSchool(id);

        setFormData({
          name: school.name || "",
          code: school.code || "",
          address: school.address || "",
          phone: school.phone || "",
          email: school.email || "",
          website: school.website || "",
          principal_name: school.principal_name || "",
          established_year:
            school.established_year || "",
          is_active: school.is_active ?? true,
          logo: null,
        });

        setCurrentLogo(school.logo || "");
      } catch (err) {
        console.error(
          "Failed to load school:",
          err,
        );

        setError(
          "Failed to load school information.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSchool();
  }, [id]);

  // =====================================================
  // HANDLE INPUT CHANGES
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        logo:
          files && files.length > 0
            ? files[0]
            : null,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // UPDATE SCHOOL
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = new FormData();

      data.append("name", formData.name);
      data.append("code", formData.code);
      data.append("address", formData.address);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("website", formData.website);
      data.append(
        "principal_name",
        formData.principal_name,
      );

      if (formData.established_year) {
        data.append(
          "established_year",
          formData.established_year,
        );
      }

      data.append(
        "is_active",
        formData.is_active
          ? "true"
          : "false",
      );

      // Only send a logo if the user selected
      // a new one.
      if (formData.logo) {
        data.append(
          "logo",
          formData.logo,
        );
      }

      await updateSchool(id, data);

      navigate(
        `/admin/academic/schools/${id}`,
      );
    } catch (err) {
      console.error(
        "Failed to update school:",
        err,
      );

      if (err.response?.data) {
        console.error(
          "Server response:",
          err.response.data,
        );
      }

      setError(
        "Failed to update school. Please check your information and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-6 shadow">
          Loading school information...
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Edit School
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update school information.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/academic/schools",
            )
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* SCHOOL NAME */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              School Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* SCHOOL CODE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              School Code
            </label>

            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* WEBSITE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Website
            </label>

            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* PRINCIPAL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Principal Name
            </label>

            <input
              type="text"
              name="principal_name"
              value={formData.principal_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* ESTABLISHED YEAR */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Established Year
            </label>

            <input
              type="number"
              name="established_year"
              value={formData.established_year}
              onChange={handleChange}
              min="1800"
              max="2100"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* SCHOOL LOGO */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              School Logo
            </label>

            {/* CURRENT LOGO */}
            {currentLogo && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Current Logo
                </p>

                <img
                  src={currentLogo}
                  alt="Current school logo"
                  className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                />
              </div>
            )}

            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              Select a new image to replace the
              current school logo.
            </p>

            {formData.logo && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {formData.logo.name}
              </p>
            )}
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* ACTIVE */}
          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-gray-700">
                School is active
              </span>
            </label>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/academic/schools/${id}`,
              )
            }
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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

export default EditSchool;