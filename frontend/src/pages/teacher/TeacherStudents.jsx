import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getTeacher,
  getClassAssignments,
} from "../../services/teachersService";

function TeacherStudents() {
  const { user } = useAuth();

  const [teacher, setTeacher] = useState(null);
  const [classAssignments, setClassAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudentsPage = async () => {
      if (!user?.teacher_id) {
        setError("No teacher profile is linked to this account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [teacherData, classData] = await Promise.all([
          getTeacher(user.teacher_id),
          getClassAssignments(),
        ]);

        setTeacher(teacherData);

        const classes = Array.isArray(classData)
          ? classData
          : classData?.results || [];

        const myClasses = classes.filter(
          (assignment) =>
            Number(assignment.teacher) === Number(user.teacher_id) &&
            assignment.is_active !== false
        );

        setClassAssignments(myClasses);
      } catch (err) {
        console.error(
          "Failed to load teacher students page:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load your students."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudentsPage();
  }, [user?.teacher_id]);

  const teacherName =
    teacher?.full_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username ||
    "Teacher";

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading your students...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-800">
          Unable to load students
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <p className="text-sm font-medium text-slate-500">
          Teacher Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          My Students
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View students belonging to the classes assigned to you.
        </p>
      </div>

      {/* TEACHER INFORMATION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
            👨‍🏫
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {teacherName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {teacher?.employee_id || "Teacher"}
            </p>
          </div>
        </div>
      </div>

      {/* ASSIGNED CLASSES */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              My Classes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a class to view its students.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
            🏫
          </div>
        </div>

        {classAssignments.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <div className="text-3xl">🏫</div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No classes assigned
            </p>

            <p className="mt-1 text-sm text-slate-500">
              You have not been assigned any classes yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                    🏫
                  </div>

                  {assignment.is_active !== false && (
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {assignment.class_level_name || "Class"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {assignment.academic_session_name ||
                    "Academic Session"}
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-5 w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
                >
                  View Students
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STUDENTS AREA */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
            👨‍🎓
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Students
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Students will appear here after the class is selected.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <div className="text-3xl">👨‍🎓</div>

          <p className="mt-3 text-sm font-semibold text-slate-700">
            No class selected
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Select one of your assigned classes to view its students.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherStudents;