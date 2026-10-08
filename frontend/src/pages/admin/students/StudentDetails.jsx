import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getStudent,
  getStudentParents,
  addStudentParent,
  updateParentGuardian,
  removeStudentParent,
  deleteStudent,
  getStudentSubjects,
  selectStudentOptionalSubject,
  removeStudentOptionalSubject,
} from "../../../services/studentsService";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ============================================================
  // STUDENT
  // ============================================================

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // PARENTS
  // ============================================================

  const [parents, setParents] = useState([]);
  const [parentsLoading, setParentsLoading] = useState(true);
  const [parentsError, setParentsError] = useState("");

  const [showParentModal, setShowParentModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [parentSaving, setParentSaving] = useState(false);

  const [parentForm, setParentForm] = useState({
    full_name: "",
    relationship: "",
    phone_number: "",
    email: "",
    address: "",
    occupation: "",
    emergency_contact: "false",
    profile_image: null,
  });

  // ============================================================
  // DELETE STUDENT
  // ============================================================

  const [deletingStudent, setDeletingStudent] = useState(false);

  // ============================================================
  // SUBJECTS
  // ============================================================

  const [showSubjects, setShowSubjects] = useState(false);

  const [subjects, setSubjects] = useState({
    general_compulsory: [],
    department_compulsory: [],
    selected_optional: [],
    available_optional: [],
    optional_selection: {
      status: "NOT_CONFIGURED",
      is_enabled: false,
      max_optional_subjects: 1,
      selected_count: 0,
      can_select: false,
      can_change: false,
      start_datetime: null,
      end_datetime: null,
    },
  });

  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");

  const [selectingSubjectId, setSelectingSubjectId] = useState(null);
  const [removingSubjectId, setRemovingSubjectId] = useState(null);

  // ============================================================
  // IMAGE URL
  // ============================================================

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // ============================================================
  // LOAD STUDENT
  // ============================================================

  const loadStudent = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStudent(id);
      setStudent(data);
    } catch (err) {
      console.error("Failed to load student:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load student.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD PARENTS
  // ============================================================

  const loadParents = async () => {
    try {
      setParentsLoading(true);
      setParentsError("");

      const data = await getStudentParents(id);

      if (Array.isArray(data)) {
        setParents(data);
      } else if (Array.isArray(data?.results)) {
        setParents(data.results);
      } else {
        setParents([]);
      }
    } catch (err) {
      console.error("Failed to load parents:", err);

      setParentsError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load parents/guardians.",
      );
    } finally {
      setParentsLoading(false);
    }
  };

  // ============================================================
  // LOAD SUBJECTS
  // ============================================================

  const loadSubjects = async () => {
    try {
      setSubjectsLoading(true);
      setSubjectsError("");

      const data = await getStudentSubjects(id);

      setSubjects({
        general_compulsory: data?.general_compulsory || [],
        department_compulsory: data?.department_compulsory || [],
        selected_optional: data?.selected_optional || [],
        available_optional: data?.available_optional || [],
        optional_selection: data?.optional_selection || {
          status: "NOT_CONFIGURED",
          is_enabled: false,
          max_optional_subjects: 1,
          selected_count: 0,
          can_select: false,
          can_change: false,
          start_datetime: null,
          end_datetime: null,
        },
      });
    } catch (err) {
      console.error("Failed to load student subjects:", err);

      setSubjectsError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load student subjects.",
      );
    } finally {
      setSubjectsLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!id) return;

    loadStudent();
    loadParents();
    loadSubjects();
  }, [id]);

  // ============================================================
  // FULL NAME
  // ============================================================

  const getFullName = () => {
    if (!student) return "Student";

    if (student.full_name) {
      return student.full_name;
    }

    return [
      student.first_name,
      student.middle_name,
      student.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (
      normalizedStatus === "active" ||
      normalizedStatus === "enrolled"
    ) {
      return "bg-green-100 text-green-700";
    }

    if (
      normalizedStatus === "inactive" ||
      normalizedStatus === "suspended"
    ) {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  // ============================================================
  // OPTIONAL SELECTION STATUS
  // ============================================================

  const getOptionalStatusClass = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-700";

      case "NOT_STARTED":
        return "bg-yellow-100 text-yellow-700";

      case "CLOSED":
        return "bg-red-100 text-red-700";

      case "DISABLED":
        return "bg-gray-100 text-gray-700";

      case "NOT_CONFIGURED":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getOptionalStatusText = (status) => {
    switch (status) {
      case "OPEN":
        return "Selection Open";

      case "NOT_STARTED":
        return "Selection Not Started";

      case "CLOSED":
        return "Selection Closed";

      case "DISABLED":
        return "Selection Disabled";

      case "NOT_CONFIGURED":
        return "Selection Not Configured";

      default:
        return status || "Unknown";
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "—";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  // ============================================================
  // PARENT FORM
  // ============================================================

  const resetParentForm = () => {
    setParentForm({
      full_name: "",
      relationship: "",
      phone_number: "",
      email: "",
      address: "",
      occupation: "",
      emergency_contact: "false",
      profile_image: null,
    });
  };

  const openAddParentModal = () => {
    setEditingParent(null);
    resetParentForm();
    setShowParentModal(true);
  };

  const openEditParentModal = (parent) => {
    setEditingParent(parent);

    setParentForm({
      full_name: parent.full_name || "",
      relationship: parent.relationship || "",
      phone_number: parent.phone_number || "",
      email: parent.email || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      emergency_contact:
        parent.emergency_contact === true
          ? "true"
          : "false",
      profile_image: null,
    });

    setShowParentModal(true);
  };

  const closeParentModal = () => {
    if (parentSaving) return;

    setShowParentModal(false);
    setEditingParent(null);
    resetParentForm();
  };

  const handleParentChange = (e) => {
    const { name, value, files } = e.target;

    setParentForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // ============================================================
  // SAVE PARENT
  // ============================================================

  const handleSaveParent = async (e) => {
    e.preventDefault();

    try {
      setParentSaving(true);

      const formData = new FormData();

      formData.append("full_name", parentForm.full_name);
      formData.append("relationship", parentForm.relationship);
      formData.append("phone_number", parentForm.phone_number);
      formData.append("email", parentForm.email);
      formData.append("address", parentForm.address);
      formData.append("occupation", parentForm.occupation);

      formData.append(
        "emergency_contact",
        parentForm.emergency_contact === "true",
      );

      if (parentForm.profile_image) {
        formData.append(
          "profile_image",
          parentForm.profile_image,
        );
      }

      if (editingParent) {
        await updateParentGuardian(
          editingParent.id,
          formData,
        );
      } else {
        await addStudentParent(id, formData);
      }

      await loadParents();

      closeParentModal();
    } catch (err) {
      console.error("Failed to save parent:", err);

      alert(
        JSON.stringify(
          err?.response?.data ||
            "Failed to save parent/guardian.",
          null,
          2,
        ),
      );
    } finally {
      setParentSaving(false);
    }
  };

  // ============================================================
  // REMOVE PARENT
  // ============================================================

  const handleRemoveParent = async (parent) => {
    const confirmed = window.confirm(
      `Remove ${
        parent.full_name || "this parent/guardian"
      } from this student?`,
    );

    if (!confirmed) return;

    try {
      await removeStudentParent(id, parent.id);
      await loadParents();
    } catch (err) {
      console.error("Failed to remove parent:", err);

      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to remove parent/guardian.",
      );
    }
  };

  // ============================================================
  // DELETE STUDENT
  // ============================================================

  const handleDeleteStudent = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${getFullName()}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingStudent(true);

      await deleteStudent(id);

      navigate("/admin/students");
    } catch (err) {
      console.error("Failed to delete student:", err);

      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete student.",
      );
    } finally {
      setDeletingStudent(false);
    }
  };

  // ============================================================
  // SELECT OPTIONAL SUBJECT
  // ============================================================

  const handleSelectOptionalSubject = async (subject) => {
    const confirmed = window.confirm(
      `Select ${subject.name} for ${getFullName()}?`,
    );

    if (!confirmed) return;

    try {
      setSelectingSubjectId(subject.subject_id);

      await selectStudentOptionalSubject(
        id,
        subject.subject_id,
      );

      await loadSubjects();
    } catch (err) {
      console.error(
        "Failed to select optional subject:",
        err,
      );

      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to select optional subject.",
      );
    } finally {
      setSelectingSubjectId(null);
    }
  };

  // ============================================================
  // REMOVE OPTIONAL SUBJECT
  // ============================================================

  const handleRemoveOptionalSubject = async (subject) => {
    const confirmed = window.confirm(
      `Remove ${subject.name} from ${getFullName()}'s selected subjects?`,
    );

    if (!confirmed) return;

    try {
      setRemovingSubjectId(subject.subject_id);

      await removeStudentOptionalSubject(
        id,
        subject.subject_id,
      );

      await loadSubjects();
    } catch (err) {
      console.error(
        "Failed to remove optional subject:",
        err,
      );

      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to remove optional subject.",
      );
    } finally {
      setRemovingSubjectId(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>

          <p className="mt-4 text-gray-600">
            Loading student...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !student) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-3">
              ⚠
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              Unable to load student
            </h2>

            <p className="text-gray-500 mt-2">
              {error || "Student not found."}
            </p>

            <button
              onClick={() =>
                navigate("/admin/students")
              }
              className="mt-5 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  const studentImage = getImageUrl(
    student.profile_image,
  );

  const optionalSelection =
    subjects.optional_selection || {};

  const maxOptionalSubjects =
    Number(
      optionalSelection.max_optional_subjects || 1,
    );

  const selectedOptionalCount =
    Number(
      optionalSelection.selected_count ??
        subjects.selected_optional.length,
    );

  const selectionOpen =
    optionalSelection.can_select === true;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <button
            onClick={() =>
              navigate("/admin/students")
            }
            className="text-sm text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Students
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Student Details
          </h1>

          <p className="text-gray-500 mt-1">
            View student information, parents and
            subjects.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              navigate(`/admin/students/${id}/edit`)
            }
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Edit Student
          </button>

          <button
            onClick={handleDeleteStudent}
            disabled={deletingStudent}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deletingStudent
              ? "Deleting..."
              : "Delete Student"}
          </button>
        </div>
      </div>

      {/* ======================================================
          STUDENT PROFILE
      ====================================================== */}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="shrink-0">
              {studentImage ? (
                <img
                  src={studentImage}
                  alt={getFullName()}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold border-4 border-white shadow">
                  {getFullName()
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {getFullName()}
              </h2>

              <p className="text-gray-500 mt-1">
                Admission No:{" "}
                <span className="font-medium text-gray-700">
                  {student.admission_number || "—"}
                </span>
              </p>

              <div className="mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                    student.status,
                  )}`}
                >
                  {student.status || "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STUDENT INFORMATION */}

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">
            Student Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoItem
              label="First Name"
              value={student.first_name}
            />

            <InfoItem
              label="Middle Name"
              value={student.middle_name}
            />

            <InfoItem
              label="Last Name"
              value={student.last_name}
            />

            <InfoItem
              label="Admission Number"
              value={student.admission_number}
            />

            <InfoItem
              label="Department"
              value={
                student.department_name ||
                student.department?.name ||
                student.department ||
                "—"
              }
            />

            <InfoItem
              label="Gender"
              value={student.gender}
            />

            <InfoItem
              label="Date of Birth"
              value={student.date_of_birth}
            />

            <InfoItem
              label="Status"
              value={student.status}
            />

            <InfoItem
              label="Email"
              value={student.email}
            />

            <InfoItem
              label="Phone"
              value={student.phone_number}
            />

            <InfoItem
              label="Address"
              value={student.address}
            />

            <InfoItem
              label="Admission Date"
              value={student.admission_date}
            />

            <InfoItem
              label="Blood Group"
              value={student.blood_group}
            />

            <InfoItem
              label="Nationality"
              value={student.nationality}
            />

            <InfoItem
              label="State of Origin"
              value={student.state_of_origin}
            />

            <InfoItem
              label="Local Government"
              value={student.local_government}
            />

            <InfoItem
              label="Created At"
              value={
                student.created_at
                  ? new Date(
                      student.created_at,
                    ).toLocaleString()
                  : "—"
              }
            />

            <InfoItem
              label="Updated At"
              value={
                student.updated_at
                  ? new Date(
                      student.updated_at,
                    ).toLocaleString()
                  : "—"
              }
            />
          </div>
        </div>
      </div>

      {/* ======================================================
          PARENTS / GUARDIANS
      ====================================================== */}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Parents / Guardians
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage the parents or guardians assigned
              to this student.
            </p>
          </div>

          <button
            onClick={openAddParentModal}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            + Add Parent / Guardian
          </button>
        </div>

        <div className="p-5">
          {parentsLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading parents/guardians...
            </div>
          ) : parentsError ? (
            <div className="bg-red-50 text-red-700 rounded-lg p-4">
              {parentsError}
            </div>
          ) : parents.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">
                No parent or guardian has been assigned
                to this student.
              </p>

              <button
                onClick={openAddParentModal}
                className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
              >
                Add Parent / Guardian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {parents.map((parent) => {
                const parentImage = getImageUrl(
                  parent.profile_image,
                );

                return (
                  <div
                    key={parent.id}
                    className="border rounded-xl p-5 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {parentImage ? (
                          <img
                            src={parentImage}
                            alt={
                              parent.full_name ||
                              "Parent"
                            }
                            className="w-16 h-16 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xl font-bold">
                            {(
                              parent.full_name || "P"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {parent.full_name || "—"}
                          </h3>

                          <p className="text-sm text-blue-600 mt-1">
                            {parent.relationship ||
                              "Guardian"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            openEditParentModal(
                              parent,
                            )
                          }
                          className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleRemoveParent(
                              parent,
                            )
                          }
                          className="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                      <InfoItem
                        label="Phone"
                        value={parent.phone_number}
                      />

                      <InfoItem
                        label="Email"
                        value={parent.email}
                      />

                      <InfoItem
                        label="Occupation"
                        value={parent.occupation}
                      />

                      <InfoItem
                        label="Emergency Contact"
                        value={
                          parent.emergency_contact
                            ? "Yes"
                            : "No"
                        }
                      />

                      <div className="md:col-span-2">
                        <InfoItem
                          label="Address"
                          value={parent.address}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          SUBJECTS - COLLAPSED BY DEFAULT
      ====================================================== */}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* SUBJECT HEADER / TOGGLE */}

        <button
          type="button"
          onClick={() =>
            setShowSubjects((previous) => !previous)
          }
          className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>

              <h2 className="text-xl font-semibold text-gray-800">
                Subjects
              </h2>
            </div>

            <p className="text-sm text-gray-500 mt-1 ml-9">
              View this student's compulsory and
              optional subjects.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!subjectsLoading &&
              !subjectsError && (
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  {subjects.general_compulsory.length +
                    subjects.department_compulsory.length +
                    subjects.selected_optional.length}{" "}
                  Assigned
                </span>
              )}

            <span className="text-gray-500 text-xl">
              {showSubjects ? "▲" : "▼"}
            </span>
          </div>
        </button>

        {/* SUBJECT CONTENT */}

        {showSubjects && (
          <div className="border-t">
            <div className="p-5">
              {subjectsLoading ? (
                <div className="text-center py-10 text-gray-500">
                  Loading subjects...
                </div>
              ) : subjectsError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                  <p className="font-medium">
                    Unable to load subjects
                  </p>

                  <p className="text-sm mt-1">
                    {subjectsError}
                  </p>

                  <button
                    onClick={loadSubjects}
                    className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* ==================================================
                      GENERAL COMPULSORY
                  ================================================== */}

                  <SubjectGroup
                    title="General Compulsory Subjects"
                    description="Compulsory subjects taken by all students in the class."
                    subjects={
                      subjects.general_compulsory
                    }
                    emptyMessage="No general compulsory subjects assigned."
                    badge="Compulsory"
                  />

                  {/* ==================================================
                      DEPARTMENT COMPULSORY
                  ================================================== */}

                  <SubjectGroup
                    title={
                      student.department_name
                        ? `${student.department_name} Compulsory Subjects`
                        : "Department Compulsory Subjects"
                    }
                    description="Compulsory subjects required for the student's department."
                    subjects={
                      subjects.department_compulsory
                    }
                    emptyMessage="No department compulsory subjects assigned."
                    badge="Department"
                  />

                  {/* ==================================================
                      OPTIONAL SUBJECTS
                  ================================================== */}

                  <div>
                    <div className="mb-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Optional Subjects
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            Select the optional subjects
                            allowed by school management.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getOptionalStatusClass(
                              optionalSelection.status,
                            )}`}
                          >
                            {getOptionalStatusText(
                              optionalSelection.status,
                            )}
                          </span>

                          {optionalSelection.is_enabled && (
                            <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                              {selectedOptionalCount} /{" "}
                              {maxOptionalSubjects}{" "}
                              Selected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SELECTION RULES */}

                      {optionalSelection.is_enabled && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                Selection Limit
                              </p>

                              <p className="text-sm font-semibold text-gray-800 mt-1">
                                Up to{" "}
                                {maxOptionalSubjects}{" "}
                                optional subject
                                {maxOptionalSubjects !==
                                1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                Opens
                              </p>

                              <p className="text-sm font-medium text-gray-800 mt-1">
                                {formatDateTime(
                                  optionalSelection.start_datetime,
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                Closes
                              </p>

                              <p className="text-sm font-medium text-gray-800 mt-1">
                                {formatDateTime(
                                  optionalSelection.end_datetime,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ==================================================
                        SELECTED OPTIONAL
                    ================================================== */}

                    <div className="mb-6">
                      <h4 className="text-base font-semibold text-gray-800 mb-3">
                        Selected Optional Subjects
                      </h4>

                      {subjects.selected_optional
                        .length === 0 ? (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <p className="text-gray-500">
                            This student has not selected
                            any optional subject.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {subjects.selected_optional.map(
                            (subject) => (
                              <div
                                key={
                                  subject.class_subject_id
                                }
                                className="border border-green-200 bg-green-50 rounded-xl p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-800">
                                      {subject.name}
                                    </h4>

                                    <p className="text-sm text-gray-500 mt-1">
                                      Code:{" "}
                                      {subject.code ||
                                        "—"}
                                    </p>

                                    {subject.department_name && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Department:{" "}
                                        {
                                          subject.department_name
                                        }
                                      </p>
                                    )}
                                  </div>

                                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                    Selected
                                  </span>
                                </div>

                                {/* REMOVE BUTTON */}

                                {optionalSelection.can_change && (
                                  <button
                                    onClick={() =>
                                      handleRemoveOptionalSubject(
                                        subject,
                                      )
                                    }
                                    disabled={
                                      removingSubjectId ===
                                      subject.subject_id
                                    }
                                    className="mt-4 w-full px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                                  >
                                    {removingSubjectId ===
                                    subject.subject_id
                                      ? "Removing..."
                                      : "Remove Subject"}
                                  </button>
                                )}

                                {/* LOCKED */}

                                {!optionalSelection.can_change && (
                                  <div className="mt-4 px-3 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm text-center">
                                    🔒 Selection is locked
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    {/* ==================================================
                        AVAILABLE OPTIONAL
                    ================================================== */}

                    {optionalSelection.status !==
                      "CLOSED" && (
                      <div>
                        <h4 className="text-base font-semibold text-gray-800 mb-3">
                          Available Optional Subjects
                        </h4>

                        {subjects.available_optional
                          .length === 0 ? (
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <p className="text-gray-500">
                              No additional optional
                              subjects are available.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {subjects.available_optional.map(
                              (subject) => {
                                const limitReached =
                                  selectedOptionalCount >=
                                  maxOptionalSubjects;

                                const cannotSelect =
                                  !selectionOpen ||
                                  limitReached;

                                return (
                                  <div
                                    key={
                                      subject.class_subject_id
                                    }
                                    className="border rounded-xl p-4 hover:shadow-sm transition"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <h4 className="font-semibold text-gray-800">
                                          {subject.name}
                                        </h4>

                                        <p className="text-sm text-gray-500 mt-1">
                                          Code:{" "}
                                          {subject.code ||
                                            "—"}
                                        </p>

                                        {subject.department_name && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Department:{" "}
                                            {
                                              subject.department_name
                                            }
                                          </p>
                                        )}
                                      </div>

                                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                        Optional
                                      </span>
                                    </div>

                                    {/* SELECT */}

                                    <button
                                      onClick={() =>
                                        handleSelectOptionalSubject(
                                          subject,
                                        )
                                      }
                                      disabled={
                                        selectingSubjectId ===
                                          subject.subject_id ||
                                        cannotSelect
                                      }
                                      className="mt-4 w-full px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {selectingSubjectId ===
                                      subject.subject_id
                                        ? "Selecting..."
                                        : !selectionOpen
                                          ? optionalSelection.status ===
                                            "NOT_STARTED"
                                            ? "Selection Not Started"
                                            : optionalSelection.status ===
                                                "DISABLED"
                                              ? "Selection Disabled"
                                              : "Selection Closed"
                                          : limitReached
                                            ? "Selection Limit Reached"
                                            : "Select Subject"}
                                    </button>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          ADD / EDIT PARENT MODAL
      ====================================================== */}

      {showParentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}

            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingParent
                    ? "Edit Parent / Guardian"
                    : "Add Parent / Guardian"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {editingParent
                    ? "Update parent or guardian information."
                    : "Add a parent or guardian to this student."}
                </p>
              </div>

              <button
                onClick={closeParentModal}
                className="text-gray-400 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSaveParent}
              className="p-5 space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Full Name"
                  name="full_name"
                  value={parentForm.full_name}
                  onChange={handleParentChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>

                  <select
                    name="relationship"
                    value={parentForm.relationship}
                    onChange={handleParentChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select relationship
                    </option>

                    <option value="Father">
                      Father
                    </option>

                    <option value="Mother">
                      Mother
                    </option>

                    <option value="Guardian">
                      Guardian
                    </option>

                    <option value="Uncle">
                      Uncle
                    </option>

                    <option value="Aunt">
                      Aunt
                    </option>

                    <option value="Brother">
                      Brother
                    </option>

                    <option value="Sister">
                      Sister
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <FormField
                  label="Phone Number"
                  name="phone_number"
                  value={parentForm.phone_number}
                  onChange={handleParentChange}
                />

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={parentForm.email}
                  onChange={handleParentChange}
                />

                <FormField
                  label="Occupation"
                  name="occupation"
                  value={parentForm.occupation}
                  onChange={handleParentChange}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>

                  <select
                    name="emergency_contact"
                    value={
                      parentForm.emergency_contact
                    }
                    onChange={handleParentChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select option
                    </option>

                    <option value="true">
                      Yes
                    </option>

                    <option value="false">
                      No
                    </option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={parentForm.address}
                    onChange={handleParentChange}
                    rows="3"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture
                  </label>

                  <input
                    type="file"
                    name="profile_image"
                    accept="image/*"
                    onChange={handleParentChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={closeParentModal}
                  disabled={parentSaving}
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={parentSaving}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {parentSaving
                    ? "Saving..."
                    : editingParent
                      ? "Update Parent"
                      : "Add Parent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({ label, value }) {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "—"
      : value;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-800 break-words">
        {displayValue}
      </p>
    </div>
  );
}

// ============================================================
// SUBJECT GROUP
// ============================================================

function SubjectGroup({
  title,
  description,
  subjects,
  emptyMessage,
  badge,
}) {
  return (
    <div>
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {title}
          </h3>

          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            {badge}
          </span>
        </div>

        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <p className="text-gray-500">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.class_subject_id}
              className="border rounded-xl p-4 bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {subject.name}
                  </h4>

                  <p className="text-sm text-gray-500 mt-1">
                    Code: {subject.code || "—"}
                  </p>

                  {subject.department_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      Department:{" "}
                      {subject.department_name}
                    </p>
                  )}
                </div>

                <span className="shrink-0 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  {badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default StudentDetails;