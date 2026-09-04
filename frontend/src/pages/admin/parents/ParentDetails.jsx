import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getParent,
  updateParent,
  removeStudentParent,
  deleteParent,
} from "../../../services/studentsService";

const ParentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parent, setParent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    relationship: "",
    phone_number: "",
    email: "",
    address: "",
    occupation: "",
    emergency_contact: false,
    is_active: true,
  });

  // =====================================================
  // LOAD PARENT
  // =====================================================

  const loadParent = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getParent(id);

      setParent(data);

      setForm({
        full_name: data.full_name || "",
        relationship: data.relationship || "",
        phone_number: data.phone_number || "",
        email: data.email || "",
        address: data.address || "",
        occupation: data.occupation || "",
        emergency_contact: data.emergency_contact || false,
        is_active: data.is_active !== false,
      });
    } catch (err) {
      console.error("Failed to load parent:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load parent details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParent();
  }, [id]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // START EDITING
  // =====================================================

  const handleEdit = () => {
    setSaveError("");

    setForm({
      full_name: parent.full_name || "",
      relationship: parent.relationship || "",
      phone_number: parent.phone_number || "",
      email: parent.email || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      emergency_contact: parent.emergency_contact || false,
      is_active: parent.is_active !== false,
    });

    setEditing(true);
  };

  // =====================================================
  // CANCEL EDITING
  // =====================================================

  const handleCancel = () => {
    setSaveError("");

    setForm({
      full_name: parent.full_name || "",
      relationship: parent.relationship || "",
      phone_number: parent.phone_number || "",
      email: parent.email || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      emergency_contact: parent.emergency_contact || false,
      is_active: parent.is_active !== false,
    });

    setEditing(false);
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSaveError("");

      const updatedParent = await updateParent(id, {
        full_name: form.full_name,
        relationship: form.relationship,
        phone_number: form.phone_number,
        email: form.email,
        address: form.address,
        occupation: form.occupation,
        emergency_contact: form.emergency_contact,
        is_active: form.is_active,
      });

      setParent(updatedParent);

      setForm({
        full_name: updatedParent.full_name || "",
        relationship: updatedParent.relationship || "",
        phone_number: updatedParent.phone_number || "",
        email: updatedParent.email || "",
        address: updatedParent.address || "",
        occupation: updatedParent.occupation || "",
        emergency_contact:
          updatedParent.emergency_contact || false,
        is_active: updatedParent.is_active !== false,
      });

      setEditing(false);
    } catch (err) {
      console.error("Failed to update parent:", err);

      setSaveError(
        err.response?.data?.detail ||
          "Unable to update parent information. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

    // =====================================================
  // UNLINK STUDENT
  // =====================================================

    // =====================================================
  // DELETE PARENT
  // =====================================================

  const handleDeleteParent = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${parent.full_name}?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await deleteParent(parent.id);

      alert("Parent successfully deleted.");

      navigate("/admin/parents");
    } catch (err) {
      console.error("Failed to delete parent:", err);

      alert(
        err.response?.data?.detail ||
          "Unable to delete parent. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

    // =====================================================
  // TOGGLE PARENT STATUS
  // =====================================================

  const handleToggleStatus = async () => {
    const newStatus = !parent.is_active;

    const action = newStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${parent.full_name}?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const updatedParent = await updateParent(parent.id, {
        full_name: parent.full_name,
        relationship: parent.relationship,
        phone_number: parent.phone_number,
        email: parent.email,
        address: parent.address,
        occupation: parent.occupation,
        emergency_contact: parent.emergency_contact,
        is_active: newStatus,
      });

      setParent(updatedParent);

      setForm({
        full_name: updatedParent.full_name || "",
        relationship: updatedParent.relationship || "",
        phone_number: updatedParent.phone_number || "",
        email: updatedParent.email || "",
        address: updatedParent.address || "",
        occupation: updatedParent.occupation || "",
        emergency_contact:
          updatedParent.emergency_contact || false,
        is_active: updatedParent.is_active !== false,
      });
    } catch (err) {
      console.error(
        "Failed to change parent status:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Unable to change parent status. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUnlinkStudent = async (studentId, studentName) => {
    const confirmed = window.confirm(
      `Are you sure you want to unlink ${studentName} from this parent?`
    );

    if (!confirmed) return;

    try {
      await removeStudentParent(studentId, parent.id);

      // Reload parent so the student disappears immediately
      await loadParent();

      alert("Student successfully unlinked from parent.");
    } catch (err) {
      console.error("Failed to unlink student:", err);

      alert(
        err.response?.data?.detail ||
          "Unable to unlink student. Please try again."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading parent details...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}

          <button
            type="button"
            onClick={loadParent}
            className="ml-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            Parent not found.
          </p>
        </div>
      </div>
    );
  }

  const students = parent.students || [];
  const studentCount =
    parent.student_count ?? students.length;

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Parents
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Parent Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage parent/guardian information.
          </p>
        </div>

        <div className="flex gap-3">
          {!editing && (
  <>
    <button
      type="button"
      onClick={loadParent}
      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
    >
      Refresh
    </button>

    <button
      type="button"
      onClick={handleEdit}
      className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
    >
      Edit Parent
    </button>

    <button
  type="button"
  onClick={handleToggleStatus}
  disabled={saving}
  className={`rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
    parent.is_active
      ? "border-orange-200 bg-white text-orange-600 hover:bg-orange-50"
      : "border-green-200 bg-white text-green-600 hover:bg-green-50"
  }`}
>
  {parent.is_active
    ? "Deactivate"
    : "Activate"}
</button>

    <button
      type="button"
      onClick={handleDeleteParent}
      disabled={saving}
      className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      Delete Parent
    </button>
  </>
)}
        </div>
      </div>

      {/* =====================================================
          EDIT FORM
      ===================================================== */}

      {editing ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Parent Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update the parent's information below.
            </p>
          </div>

          {saveError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full Name */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Relationship */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Relationship
              </label>

              <input
                type="text"
                name="relationship"
                value={form.relationship}
                onChange={handleChange}
                placeholder="Father, Mother, Guardian..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <input
                type="text"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Occupation */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Occupation
              </label>

              <input
                type="text"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Address */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          {/* Checkboxes */}

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="emergency_contact"
                checked={form.emergency_contact}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />

              <span className="text-sm text-gray-700">
                Emergency Contact
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />

              <span className="text-sm text-gray-700">
                Parent is Active
              </span>
            </label>
          </div>

          {/* Buttons */}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* =====================================================
              PARENT PROFILE
          ===================================================== */}

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {/* Avatar */}

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-700">
                {parent.full_name
                  ?.charAt(0)
                  ?.toUpperCase() || "P"}
              </div>

              {/* Information */}

              <div className="flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {parent.full_name || "—"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {parent.relationship ||
                        "Parent / Guardian"}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      parent.is_active === false
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {parent.is_active === false
                      ? "Inactive"
                      : "Active"}
                  </span>
                </div>

                {/* Details */}

                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {parent.phone_number || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Email
                    </p>

                    <p className="mt-1 break-words text-sm text-gray-900">
                      {parent.email || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Occupation
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {parent.occupation || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Address
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {parent.address || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Emergency Contact
                    </p>

                    <p
                      className={`mt-1 text-sm font-medium ${
                        parent.emergency_contact
                          ? "text-orange-600"
                          : "text-gray-700"
                      }`}
                    >
                      {parent.emergency_contact
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Assigned Students
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {studentCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              ASSIGNED STUDENTS
          ===================================================== */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Assigned Students
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Students connected to this parent or guardian.
              </p>
            </div>

            {students.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-500">
                  No students are currently assigned to
                  this parent.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {student.full_name || "—"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Admission No:{" "}
                        <span className="font-medium text-gray-700">
                          {student.admission_number || "—"}
                        </span>
                      </p>
                    </div>

                <div className="flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() =>
      navigate(
        `/admin/students/${student.id}`,
      )
    }
    className="w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
  >
    View Student
  </button>

  <button
    type="button"
    onClick={() =>
      handleUnlinkStudent(
        student.id,
        student.full_name || "this student",
      )
    }
    className="w-fit rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
  >
    Unlink
  </button>
</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentDetails;