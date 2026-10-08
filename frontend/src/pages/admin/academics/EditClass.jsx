import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getClassLevel,
  getDepartments,
  getSchools,
  updateClassLevel,
} from "../../../services/academicsService";

const EditClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    school: "",
    name: "",
    code: "",
    description: "",
    education_level: "",
    department: "",
    capacity: 40,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Determine whether this is Senior Secondary
  // --------------------------------------------------
  const isSeniorSecondary =
    formData.education_level === "SS";

  // --------------------------------------------------
  // Load class, schools and departments
  // --------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          classData,
          schoolsData,
          departmentsData,
        ] = await Promise.all([
          getClassLevel(id),
          getSchools(),
          getDepartments(),
        ]);

        setSchools(schoolsData);
        setDepartments(departmentsData);

        setFormData({
          school: classData.school ?? "",
          name: classData.name ?? "",
          code: classData.code ?? "",
          description: classData.description ?? "",
          education_level: classData.education_level ?? "",
          department: classData.department ?? "",
          capacity: classData.capacity ?? 40,
          is_active: classData.is_active ?? true,
        });
      } catch (err) {
        console.error("Failed to load class:", err);

        setError(
          "Failed to load class information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // --------------------------------------------------
  // Handle input changes
  // --------------------------------------------------
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      // ----------------------------------------------
      // Primary/JSS cannot have a department
      // ----------------------------------------------
      if (
        name === "education_level" &&
        value !== "SS"
      ) {
        updated.department = "";
      }

      return updated;
    });
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ----------------------------------------------
    // Validate Senior Secondary department
    // ----------------------------------------------
    if (
      isSeniorSecondary &&
      !formData.department
    ) {
      setError(
        "Please select a department for Senior Secondary."
      );
      return;
    }

    // ----------------------------------------------
    // Department must not exist for Primary/JSS
    // ----------------------------------------------
    if (
      !isSeniorSecondary &&
      formData.department
    ) {
      setError(
        "Department is only allowed for Senior Secondary."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        school: Number(formData.school),
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description:
          formData.description?.trim() || "",
        education_level:
          formData.education_level,

        // Department is only sent for SS
        department:
          isSeniorSecondary && formData.department
            ? Number(formData.department)
            : null,

        capacity: Number(formData.capacity),

        is_active: formData.is_active,
      };

      console.log(
        "Updating class with payload:",
        payload
      );

      await updateClassLevel(id, payload);

      // Go back to class details
      navigate(`/admin/classes/${id}`);
    } catch (err) {
      console.error(
        "Failed to update class:",
        err
      );

      const responseData =
        err?.response?.data;

      if (responseData) {
        if (
          typeof responseData === "object"
        ) {
          const messages = Object.entries(
            responseData
          )
            .flatMap(([field, messages]) => {
              if (Array.isArray(messages)) {
                return messages.map(
                  (message) =>
                    `${field}: ${message}`
                );
              }

              return [`${field}: ${messages}`];
            });

          setError(
            messages.join(" ")
          );
        } else {
          setError(
            "Failed to update class."
          );
        }
      } else {
        setError(
          "Failed to update class."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-white p-6 text-center shadow">
          Loading class...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Class
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the information for this
          class level.
        </p>
      </div>

      <div className="max-w-3xl rounded-lg bg-white p-6 shadow">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* -------------------------------------- */}
          {/* School */}
          {/* -------------------------------------- */}
          <div>
            <label
              htmlFor="school"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              School
            </label>

            <select
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                Select school
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

          {/* -------------------------------------- */}
          {/* Class Name */}
          {/* -------------------------------------- */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Class Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* -------------------------------------- */}
          {/* Class Code */}
          {/* -------------------------------------- */}
          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Class Code
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm uppercase outline-none focus:border-blue-500"
            />
          </div>

          {/* -------------------------------------- */}
          {/* Education Level */}
          {/* -------------------------------------- */}
          <div>
            <label
              htmlFor="education_level"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Education Level
            </label>

            <select
              id="education_level"
              name="education_level"
              value={formData.education_level}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                Select education level
              </option>

              <option value="PRIMARY">
                Primary
              </option>

              <option value="JSS">
                Junior Secondary
              </option>

              <option value="SS">
                Senior Secondary
              </option>
            </select>
          </div>

          {/* -------------------------------------- */}
          {/* Department */}
          {/* -------------------------------------- */}
          {isSeniorSecondary && (
            <div>
              <label
                htmlFor="department"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Department{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">
                  Select department
                </option>

                {departments
                  .filter((department) => {
                    if (!formData.school) {
                      return true;
                    }

                    return (
                      Number(
                        department.school
                      ) ===
                      Number(formData.school)
                    );
                  })
                  .map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* -------------------------------------- */}
          {/* Capacity */}
          {/* -------------------------------------- */}
          <div>
            <label
              htmlFor="capacity"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Capacity
            </label>

            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* -------------------------------------- */}
          {/* Description */}
          {/* -------------------------------------- */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Optional class description"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* -------------------------------------- */}
          {/* Status */}
          {/* -------------------------------------- */}
          <div className="flex items-center gap-3">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4"
            />

            <label
              htmlFor="is_active"
              className="text-sm font-medium text-gray-700"
            >
              Active
            </label>
          </div>

          {/* -------------------------------------- */}
          {/* Buttons */}
          {/* -------------------------------------- */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/classes/${id}`
                )
              }
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClass;