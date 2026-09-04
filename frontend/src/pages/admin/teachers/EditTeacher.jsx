import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";

const EditTeacher = () => {
const { id } = useParams();
const navigate = useNavigate();

const [schools, setSchools] = useState([]);
const [departments, setDepartments] = useState([]);

const [loading, setLoading] = useState(false);
const [dataLoading, setDataLoading] = useState(true);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const [formData, setFormData] = useState({
school: "",
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
fetchData();
}, [id]);

const fetchData = async () => {
try {
setDataLoading(true);
setError("");


  const [
    teacherResponse,
    schoolsResponse,
    departmentsResponse,
  ] = await Promise.all([
    api.get(`/teachers/${id}/`),
    api.get("/academics/schools/"),
    api.get("/academics/departments/"),
  ]);

  const teacherData = teacherResponse.data;
  const schoolsData = schoolsResponse.data;
  const departmentsData = departmentsResponse.data;

  setSchools(schoolsData);
  setDepartments(departmentsData);

  setFormData({
    school: teacherData.school || "",
    employee_id: teacherData.employee_id || "",
    first_name: teacherData.first_name || "",
    middle_name: teacherData.middle_name || "",
    last_name: teacherData.last_name || "",
    email: teacherData.email || "",
    phone_number: teacherData.phone_number || "",
    date_of_birth: teacherData.date_of_birth || "",
    gender: teacherData.gender || "",
    address: teacherData.address || "",
    department: teacherData.department || "",
    specialization: teacherData.specialization || "",
    qualification: teacherData.qualification || "",
    employment_date: teacherData.employment_date || "",
    employment_status:
      teacherData.employment_status || "ACTIVE",
    is_class_teacher:
      teacherData.is_class_teacher || false,
    bio: teacherData.bio || "",
  });

} catch (error) {
  console.error("Error loading teacher:", error);

  setError(
    error.response?.data?.detail ||
    "Failed to load teacher information."
  );

} finally {
  setDataLoading(false);
}


};

const handleChange = (e) => {
const { name, value, type, checked } = e.target;


setFormData((previousData) => ({
  ...previousData,
  [name]: type === "checkbox" ? checked : value,
}));


};

const handleSubmit = async (e) => {
e.preventDefault();


try {
  setLoading(true);
  setError("");
  setSuccess("");

  await api.patch(
    `/teachers/${id}/`,
    formData
  );

  setSuccess("Teacher updated successfully.");

  setTimeout(() => {
    navigate("/admin/teachers");
  }, 1200);

} catch (error) {
  console.error("Error updating teacher:", error);

  const data = error.response?.data;

  const errorMessage =
    typeof data === "object" && data !== null
      ? Object.entries(data)
          .map(([key, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : value;

            return `${key}: ${message}`;
          })
          .join(", ")
      : "Failed to update teacher.";

  setError(errorMessage);

} finally {
  setLoading(false);
}


};

if (dataLoading) {
return ( <div className="p-6 text-center text-gray-500">
Loading teacher information... </div>
);
}

return ( <div className="mx-auto max-w-6xl p-4 md:p-6">


  {/* Header */}
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

    <div>
      <h1 className="text-2xl font-bold text-gray-800">
        Edit Teacher
      </h1>

      <p className="text-sm text-gray-500">
        Update teacher information and employment details.
      </p>
    </div>

    <Link
      to="/admin/teachers"
      className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      ← Back to Teachers
    </Link>

  </div>

  {/* Error */}
  {error && (
    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
      {error}
    </div>
  )}

  {/* Success */}
  {success && (
    <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600">
      {success}
    </div>
  )}

  <form
    onSubmit={handleSubmit}
    className="rounded-xl bg-white p-5 shadow md:p-8"
  >

    {/* Basic Information */}
    <div className="mb-8">

      <h2 className="mb-5 text-lg font-semibold text-gray-800">
        Basic Information
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            School *
          </label>

          <select
            name="school"
            value={formData.school}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select School</option>

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

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Employee ID *
          </label>

          <input
            type="text"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            First Name *
          </label>

          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Middle Name
          </label>

          <input
            type="text"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Last Name *
          </label>

          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Gender
          </label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Date of Birth
          </label>

          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

      </div>
    </div>

    {/* Contact Information */}
    <div className="mb-8">

      <h2 className="mb-5 text-lg font-semibold text-gray-800">
        Contact Information
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Phone Number
          </label>

          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Address
        </label>

        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="3"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

    </div>

    {/* Professional Information */}
    <div className="mb-8">

      <h2 className="mb-5 text-lg font-semibold text-gray-800">
        Professional Information
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Department
          </label>

          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Department</option>

            {departments.map((department) => (
              <option
                key={department.id}
                value={department.id}
              >
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Qualification
          </label>

          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Specialization
          </label>

          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Employment Date
          </label>

          <input
            type="date"
            name="employment_date"
            value={formData.employment_date}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Employment Status
          </label>

          <select
            name="employment_status"
            value={formData.employment_status}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="RESIGNED">Resigned</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

      </div>
    </div>

    {/* Additional Information */}
    <div className="mb-8">

      <h2 className="mb-5 text-lg font-semibold text-gray-800">
        Additional Information
      </h2>

      <textarea
        name="bio"
        value={formData.bio}
        onChange={handleChange}
        rows="5"
        placeholder="Write a short biography about the teacher..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
      />

    </div>

    {/* Buttons */}
    <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">

      <Link
        to="/admin/teachers"
        className="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-100"
      >
        Cancel
      </Link>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update Teacher"}
      </button>

    </div>

  </form>
</div>


);
};

export default EditTeacher;
