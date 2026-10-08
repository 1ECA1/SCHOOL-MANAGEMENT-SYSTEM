import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getSubject,
  getSchools,
  getDepartments,
  getClassSubjects,
  getSessions,
  getTerms,
} from "../../../services/academicsService";

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET TODAY
  // =====================================================

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          subjectData,
          schoolData,
          departmentData,
          classSubjectData,
          sessionsData,
          termsData,
        ] = await Promise.all([
          getSubject(id),
          getSchools(),
          getDepartments(),
          getClassSubjects(),
          getSessions(),
          getTerms(),
        ]);

        setSubject(subjectData);

        setSchools(
          Array.isArray(schoolData)
            ? schoolData
            : schoolData?.results || [],
        );

        setDepartments(
          Array.isArray(departmentData)
            ? departmentData
            : departmentData?.results || [],
        );

        setClassSubjects(
          Array.isArray(classSubjectData)
            ? classSubjectData
            : classSubjectData?.results || [],
        );

        setSessions(
          Array.isArray(sessionsData)
            ? sessionsData
            : sessionsData?.results || [],
        );

        setTerms(
          Array.isArray(termsData)
            ? termsData
            : termsData?.results || [],
        );
      } catch (err) {
        console.error(
          "Failed to load subject details:",
          err,
        );

        setError(
          err?.response?.data?.detail ||
            "Failed to load subject details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // =====================================================
  // SCHOOL
  // =====================================================

  const getSchoolName = (schoolId) => {
    const school = schools.find(
      (item) =>
        String(item.id) === String(schoolId),
    );

    return school?.name || "—";
  };

  // =====================================================
  // DEPARTMENT
  // =====================================================

  const getDepartmentName = (departmentId) => {
    if (!departmentId) {
      return "None";
    }

    const department = departments.find(
      (item) =>
        String(item.id) === String(departmentId),
    );

    return department?.name || "—";
  };

  // =====================================================
  // EDUCATION LEVEL
  // =====================================================

  const getEducationLevelName = (level) => {
    const levels = {
      PRIMARY: "Primary",
      JSS: "Junior Secondary",
      SS: "Senior Secondary",
    };

    return levels[level] || level || "—";
  };

  // =====================================================
  // ASSIGNMENT TYPE
  // =====================================================

  const getAssignmentTypeName = (type) => {
    const types = {
      GENERAL_COMPULSORY: "General Compulsory",
      DEPARTMENT_COMPULSORY:
        "Department Compulsory",
      OPTIONAL: "Optional",
    };

    return types[type] || type || "—";
  };

  // =====================================================
  // ASSIGNMENT TYPE STYLE
  // =====================================================

  const getAssignmentTypeStyle = (type) => {
    switch (type) {
      case "GENERAL_COMPULSORY":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";

      case "DEPARTMENT_COMPULSORY":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";

      case "OPTIONAL":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // =====================================================
  // CURRENT ACADEMIC SESSION
  // =====================================================

  const currentSession = useMemo(() => {
    return (
      sessions.find(
        (session) =>
          session.is_current === true,
      ) || null
    );
  }, [sessions]);

  // =====================================================
  // CURRENT TERM
  // =====================================================

  const currentTerm = useMemo(() => {
    return (
      terms.find(
        (term) =>
          term.is_current === true,
      ) || null
    );
  }, [terms]);

  // =====================================================
  // SUBJECT ASSIGNMENTS
  // =====================================================

  const subjectAssignments = useMemo(() => {
    if (!subject) {
      return [];
    }

    return classSubjects.filter((item) => {
      const subjectId =
        item.subject ?? item.subject_id;

      return (
        String(subjectId) === String(subject.id)
      );
    });
  }, [subject, classSubjects]);

  // =====================================================
  // ASSIGNMENT TYPES
  // =====================================================

  const assignmentTypes = useMemo(() => {
    return [
      ...new Set(
        subjectAssignments
          .map(
            (item) => item.assignment_type,
          )
          .filter(Boolean),
      ),
    ];
  }, [subjectAssignments]);

  // =====================================================
  // TOTAL STUDENTS
  // =====================================================

  const totalStudents = useMemo(() => {
    const students = new Map();

    subjectAssignments.forEach(
      (assignment) => {
        const assignmentStudents =
          Array.isArray(
            assignment.students,
          )
            ? assignment.students
            : [];

        assignmentStudents.forEach(
          (student) => {
            const studentId =
              student.student_id;

            if (studentId != null) {
              students.set(
                String(studentId),
                student,
              );
            }
          },
        );
      },
    );

    return students.size;
  }, [subjectAssignments]);

  // =====================================================
  // TOTAL TEACHERS
  // =====================================================

  const totalTeachers = useMemo(() => {
    const teachers = new Map();

    subjectAssignments.forEach(
      (assignment) => {
        const assignmentTeachers =
          Array.isArray(
            assignment.teachers,
          )
            ? assignment.teachers
            : [];

        assignmentTeachers.forEach(
          (teacher) => {
            if (teacher.id != null) {
              teachers.set(
                String(teacher.id),
                teacher,
              );
            }
          },
        );
      },
    );

    return teachers.size;
  }, [subjectAssignments]);

  // =====================================================
  // OPEN ATTENDANCE ROSTER
  // =====================================================

  const handleAttendanceRoster = (
    assignment,
  ) => {
    const classLevelId =
      assignment.class_level ??
      assignment.class_level_id;

    if (!classLevelId) {
      setError(
        "This class assignment does not have a valid class.",
      );
      return;
    }

    if (!currentSession?.id) {
      setError(
        "There is no current academic session. Please set a current session first.",
      );
      return;
    }

    if (!currentTerm?.id) {
      setError(
        "There is no current term. Please set a current term first.",
      );
      return;
    }

    const params = new URLSearchParams({
      academic_session: String(
        currentSession.id,
      ),
      term: String(currentTerm.id),
      class_level: String(classLevelId),
      subject: String(subject.id),
      date: getToday(),
    });

    navigate(
      `/admin/attendance/take?${params.toString()}`,
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] p-10 text-center shadow-sm dark:border-gray-700">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-primary)]" />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading subject details...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
          <p className="font-medium text-red-700 dark:text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/academics/subjects",
              )
            }
            className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // SUBJECT NOT FOUND
  // =====================================================

  if (!subject) {
    return (
      <div className="w-full p-6">
        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] p-10 text-center shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Subject not found.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/academics/subjects",
              )
            }
            className="mt-4 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  const schoolName = getSchoolName(
    subject.school,
  );

  const departmentName =
    getDepartmentName(subject.department);

  const educationLevelName =
    getEducationLevelName(
      subject.education_level,
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="w-full space-y-6 p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Subject Details
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View subject information, classes,
            teachers and students.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* EDIT SUBJECT
              Editing is handled inside Subjects.jsx.
              We return to the Subjects page and tell it
              which subject should be opened in edit mode.
          */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/academics/subjects",
                {
                  state: {
                    editSubjectId: subject.id,
                  },
                },
              )
            }
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Edit Subject
          </button>

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/academics/subjects",
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      {/* =================================================
          CURRENT ACADEMIC PERIOD
      ================================================= */}

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-900/50 dark:bg-blue-950/20">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Attendance Period
            </p>

            <p className="mt-1 text-sm font-medium text-blue-900 dark:text-blue-200">
              {currentSession?.name ||
                "No current session"}{" "}
              •{" "}
              {currentTerm?.name ||
                "No current term"}
            </p>
          </div>

          <p className="text-xs text-blue-700 dark:text-blue-300">
            Attendance roster buttons will use
            this current academic period.
          </p>
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Education Level
          </p>

          <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
            {educationLevelName}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Department
          </p>

          <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
            {departmentName}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Students Taking Subject
          </p>

          <p className="mt-2 text-2xl font-bold text-[var(--color-primary)]">
            {totalStudents}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Teachers Assigned
          </p>

          <p className="mt-2 text-2xl font-bold text-[var(--color-primary)]">
            {totalTeachers}
          </p>
        </div>
      </div>

      {/* =================================================
          SUBJECT INFORMATION
      ================================================= */}

      <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                {subject.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Subject Code:{" "}
                {subject.code || "—"}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                subject.is_active
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {subject.is_active
                ? "Active"
                : "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Subject Name
            </p>

            <p className="mt-1 font-medium text-[var(--color-text)]">
              {subject.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Subject Code
            </p>

            <p className="mt-1 font-medium text-[var(--color-text)]">
              {subject.code || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              School
            </p>

            <p className="mt-1 font-medium text-[var(--color-text)]">
              {schoolName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Education Level
            </p>

            <p className="mt-1 font-medium text-[var(--color-text)]">
              {educationLevelName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Department
            </p>

            <p className="mt-1 font-medium text-[var(--color-text)]">
              {departmentName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Status
            </p>

            <p
              className={`mt-1 font-medium ${
                subject.is_active
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {subject.is_active
                ? "Active"
                : "Inactive"}
            </p>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Assignment Types
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {assignmentTypes.length > 0 ? (
                assignmentTypes.map(
                  (type) => (
                    <span
                      key={type}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getAssignmentTypeStyle(
                        type,
                      )}`}
                    >
                      {getAssignmentTypeName(
                        type,
                      )}
                    </span>
                  ),
                )
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Not assigned to any class
                  yet.
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Description
            </p>

            <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
              {subject.description ||
                "No description provided."}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Created
            </p>

            <p className="mt-1 text-sm text-[var(--color-text)]">
              {subject.created_at
                ? new Date(
                    subject.created_at,
                  ).toLocaleString()
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Last Updated
            </p>

            <p className="mt-1 text-sm text-[var(--color-text)]">
              {subject.updated_at
                ? new Date(
                    subject.updated_at,
                  ).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          CLASS ASSIGNMENTS
      ================================================= */}

      <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                Class Assignments
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Classes, teachers, students and
                attendance for this subject.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {subjectAssignments.length}{" "}
              {subjectAssignments.length === 1
                ? "Class"
                : "Classes"}
            </span>
          </div>
        </div>

        {subjectAssignments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This subject has not been
              assigned to any class yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/school-admin/academics/class-subjects/add",
                )
              }
              className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Assign to Class
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Class
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Education Level
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Assignment Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Teacher
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Students
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Attendance
                  </th>
                </tr>
              </thead>

              <tbody>
                {subjectAssignments.map(
                  (assignment) => {
                    const className =
                      assignment.class_level_name ||
                      "—";

                    const educationLevel =
                      assignment.class_level_education_level ||
                      subject.education_level;

                    const assignmentTeachers =
                      Array.isArray(
                        assignment.teachers,
                      )
                        ? assignment.teachers
                        : [];

                    const assignmentStudents =
                      Array.isArray(
                        assignment.students,
                      )
                        ? assignment.students
                        : [];

                    const studentCount =
                      assignment.student_count ??
                      assignmentStudents.length;

                    return (
                      <tr
                        key={assignment.id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                      >
                        {/* CLASS */}

                        <td className="px-6 py-4">
                          <p className="font-semibold text-[var(--color-text)]">
                            {className}
                          </p>
                        </td>

                        {/* EDUCATION LEVEL */}

                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {getEducationLevelName(
                            educationLevel,
                          )}
                        </td>

                        {/* ASSIGNMENT TYPE */}

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAssignmentTypeStyle(
                              assignment.assignment_type,
                            )}`}
                          >
                            {getAssignmentTypeName(
                              assignment.assignment_type,
                            )}
                          </span>
                        </td>

                        {/* TEACHER */}

                        <td className="px-6 py-4">
                          {assignmentTeachers.length ===
                          0 ? (
                            <span className="text-sm text-gray-400">
                              Not assigned
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {assignmentTeachers.map(
                                (teacher) => (
                                  <div
                                    key={
                                      teacher.id
                                    }
                                    className="flex items-center gap-2"
                                  >
                                    <span className="font-medium text-[var(--color-text)]">
                                      {teacher.name ||
                                        "—"}
                                    </span>

                                    {teacher.is_primary && (
                                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                        Primary
                                      </span>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </td>

                        {/* STUDENTS */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-[var(--color-primary)]">
                              {studentCount}
                            </span>

                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {studentCount ===
                              1
                                ? "student"
                                : "students"}
                            </span>
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              assignment.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {assignment.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* ATTENDANCE */}

                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleAttendanceRoster(
                                assignment,
                              )
                            }
                            disabled={
                              !currentSession?.id ||
                              !currentTerm?.id
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span>
                              ✓
                            </span>

                            Attendance Roster
                          </button>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          STUDENTS TAKING SUBJECT
      ================================================= */}

      {subjectAssignments.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">
          <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              Students Taking {subject.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Students are shown according to
              their class assignment and subject
              enrollment rules.
            </p>
          </div>

          <div className="space-y-6 p-6">
            {subjectAssignments.map(
              (assignment) => {
                const students =
                  Array.isArray(
                    assignment.students,
                  )
                    ? assignment.students
                    : [];

                const teachers =
                  Array.isArray(
                    assignment.teachers,
                  )
                    ? assignment.teachers
                    : [];

                return (
                  <div
                    key={assignment.id}
                    className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    {/* CLASS HEADER */}

                    <div className="flex flex-col gap-3 bg-gray-50 px-5 py-4 dark:bg-gray-800/60 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--color-text)]">
                          {assignment.class_level_name ||
                            "Class"}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getAssignmentTypeStyle(
                              assignment.assignment_type,
                            )}`}
                          >
                            {getAssignmentTypeName(
                              assignment.assignment_type,
                            )}
                          </span>

                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {assignment.student_count ??
                              students.length}{" "}
                            students
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Teacher:{" "}
                          </span>

                          {teachers.length ===
                          0 ? (
                            <span className="font-medium text-gray-400">
                              Not assigned
                            </span>
                          ) : (
                            <span className="font-medium text-[var(--color-text)]">
                              {teachers
                                .map(
                                  (
                                    teacher,
                                  ) =>
                                    teacher.name,
                                )
                                .join(
                                  ", ",
                                )}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleAttendanceRoster(
                              assignment,
                            )
                          }
                          disabled={
                            !currentSession?.id ||
                            !currentTerm?.id
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ✓ Attendance Roster
                        </button>
                      </div>
                    </div>

                    {/* STUDENT LIST */}

                    {students.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No students are currently
                          taking this subject in
                          this class.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                #
                              </th>

                              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Student
                              </th>

                              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Admission Number
                              </th>

                              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Roll Number
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {students.map(
                              (
                                student,
                                index,
                              ) => (
                                <tr
                                  key={
                                    student.student_id
                                  }
                                  className="border-b border-gray-100 last:border-b-0 dark:border-gray-800"
                                >
                                  <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {index +
                                      1}
                                  </td>

                                  <td className="px-5 py-3">
                                    <p className="font-medium text-[var(--color-text)]">
                                      {student.full_name ||
                                        "—"}
                                    </p>
                                  </td>

                                  <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                    {student.admission_number ||
                                      "—"}
                                  </td>

                                  <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                    {student.roll_number ?? "—"}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* =================================================
          BACK
      ================================================= */}

      <div className="flex justify-start">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/school-admin/academics/subjects",
            )
          }
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Back to Subjects
        </button>
      </div>
    </div>
  );
};

export default SubjectDetails;