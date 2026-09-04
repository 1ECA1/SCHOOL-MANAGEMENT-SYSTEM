import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";

const Teachers = () => {
const [teachers, setTeachers] = useState([]);
const [filteredTeachers, setFilteredTeachers] = useState([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [error, setError] = useState("");

useEffect(() => {
fetchTeachers();
}, []);

useEffect(() => {
const searchText = search.toLowerCase();

const filtered = teachers.filter((teacher) => {
  return (
    teacher.full_name?.toLowerCase().includes(searchText) ||
    teacher.employee_id?.toLowerCase().includes(searchText) ||
    teacher.email?.toLowerCase().includes(searchText) ||
    teacher.department_name?.toLowerCase().includes(searchText)
  );
});

setFilteredTeachers(filtered);


}, [search, teachers]);

const fetchTeachers = async () => {
try {
setLoading(true);
setError("");


  const { data } = await api.get("/teachers/");

  setTeachers(data);
  setFilteredTeachers(data);

} catch (error) {
  console.error("Error fetching teachers:", error);

  setError(
    error.response?.data?.detail ||
    "Failed to fetch teachers."
  );
} finally {
  setLoading(false);
}


};

const getStatusStyle = (status) => {
switch (status) {
case "ACTIVE":
return "bg-green-100 text-green-700";


  case "ON_LEAVE":
    return "bg-yellow-100 text-yellow-700";

  case "SUSPENDED":
    return "bg-red-100 text-red-700";

  case "RESIGNED":
    return "bg-gray-100 text-gray-700";

  case "RETIRED":
    return "bg-blue-100 text-blue-700";

  default:
    return "bg-gray-100 text-gray-700";
}


};

return ( <div className="p-4 md:p-6">


  {/* Header */}
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

    <div>
      <h1 className="text-2xl font-bold text-gray-800">
        Teachers
      </h1>

      <p className="text-sm text-gray-500">
        Manage teachers and their academic assignments
      </p>
    </div>

    <Link
      to="/admin/teachers/add"
      className="rounded-lg bg-blue-600 px-5 py-3 text-center font-medium text-white transition hover:bg-blue-700"
    >
      + Add Teacher
    </Link>

  </div>

  {/* Search */}
  <div className="mb-6">
    <input
      type="text"
      placeholder="Search by name, employee ID, email or department..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
    />
  </div>

  {/* Error */}
  {error && (
    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
      {error}
    </div>
  )}

  {/* Teachers Table */}
  <div className="overflow-x-auto rounded-xl bg-white shadow">

    {loading ? (
      <div className="p-10 text-center text-gray-500">
        Loading teachers...
      </div>
    ) : filteredTeachers.length === 0 ? (
      <div className="p-10 text-center text-gray-500">
        No teachers found.
      </div>
    ) : (
      <table className="min-w-full">

        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
              Teacher
            </th>

            <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
              Employee ID
            </th>

            <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
              Department
            </th>

            <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
              Contact
            </th>

            <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
              Status
            </th>

            <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredTeachers.map((teacher) => (
            <tr
              key={teacher.id}
              className="border-t border-gray-100"
            >

              {/* Teacher */}
              <td className="px-5 py-4">

                <div className="flex items-center gap-3">

                  {teacher.profile_image ? (
                    <img
                      src={`http://127.0.0.1:8000${teacher.profile_image}`}
                      alt={teacher.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                      {teacher.first_name?.charAt(0)}
                      {teacher.last_name?.charAt(0)}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-gray-800">
                      {teacher.full_name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {teacher.email || "No email"}
                    </p>
                  </div>

                </div>

              </td>

              {/* Employee ID */}
              <td className="px-5 py-4 text-sm text-gray-600">
                {teacher.employee_id}
              </td>

              {/* Department */}
              <td className="px-5 py-4 text-sm text-gray-600">
                {teacher.department_name || "Not assigned"}
              </td>

              {/* Contact */}
              <td className="px-5 py-4 text-sm text-gray-600">
                {teacher.phone_number || "Not available"}
              </td>

              {/* Status */}
              <td className="px-5 py-4">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    teacher.employment_status
                  )}`}
                >
                  {teacher.employment_status?.replace("_", " ")}
                </span>

              </td>

              {/* Actions */}
              <td className="px-5 py-4">

                <div className="flex flex-wrap gap-2">

                  <Link
                    to={`/admin/teachers/${teacher.id}/edit`}
                    className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                  >
                    Edit
                  </Link>

                  <Link
                    to={`/admin/teachers/${teacher.id}/subjects`}
                    className="rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-100"
                  >
                    Subjects
                  </Link>

                  <Link
                    to={`/admin/teachers/${teacher.id}/class`}
                    className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-100"
                  >
                    Class
                  </Link>

                </div>

              </td>

            </tr>
          ))}
        </tbody>

      </table>
    )}

  </div>

  {!loading && (
    <div className="mt-4 text-sm text-gray-500">
      Showing {filteredTeachers.length} teacher(s)
    </div>
  )}

</div>

);
};

export default Teachers;
