
import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  RefreshCw,
  Save,
  Users,
  XCircle,
} from "lucide-react";

import api from "../../services/api";

import {
  getAttendance,
  createAttendance,
  updateAttendance,
} from "../../services/attendanceService";

import {
  getMyTeacherClasses,
  getMyTeacherSubjects,
} from "../../services/teachersService";


// ============================================================
// CONSTANTS
// ============================================================

const ATTENDANCE_TYPES = [
  {
    value: "CLASS",
    label: "Class Attendance",
  },
  {
    value: "SUBJECT",
    label: "Subject Attendance",
  },
];


const ATTENDANCE_STATUSES = [
  {
    value: "PRESENT",
    label: "Present",
    shortLabel: "P",
  },
  {
    value: "ABSENT",
    label: "Absent",
    shortLabel: "A",
  },
  {
    value: "LATE",
    label: "Late",
    shortLabel: "L",
  },
  {
    value: "EXCUSED",
    label: "Excused",
    shortLabel: "E",
  },
];


// ============================================================
// HELPERS
// ============================================================

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


const getArrayData = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};


// ============================================================
// COMPONENT
// ============================================================

function TeacherAttendance() {
  // ----------------------------------------------------------
  // LOADING / ERROR
  // ----------------------------------------------------------

  const [initialLoading, setInitialLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ----------------------------------------------------------
  // ACADEMIC DATA
  // ----------------------------------------------------------

  const [academicSessions, setAcademicSessions] = useState([]);
  const [terms, setTerms] = useState([]);


  // ----------------------------------------------------------
  // TEACHER ASSIGNMENTS
  // ----------------------------------------------------------

  const [teacherClasses, setTeacherClasses] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);


  // ----------------------------------------------------------
  // ATTENDANCE TYPE
  //
  // CLASS:
  //     Session → Term → Class
  //
  // SUBJECT:
  //     Session → Term → Subject
  // ----------------------------------------------------------

  const [attendanceType, setAttendanceType] =
    useState("CLASS");


  // ----------------------------------------------------------
  // SELECTED FILTERS
  // ----------------------------------------------------------

  const [academicSession, setAcademicSession] =
    useState("");

  const [term, setTerm] = useState("");

  const [classLevel, setClassLevel] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [date, setDate] =
    useState(getToday());


  // ----------------------------------------------------------
  // STUDENTS
  // ----------------------------------------------------------

  const [students, setStudents] =
    useState([]);


  // ----------------------------------------------------------
  // ATTENDANCE
  // ----------------------------------------------------------

  const [attendance, setAttendance] =
    useState({});

  const [existingAttendance, setExistingAttendance] =
    useState({});


  // ==========================================================
  // LOAD INITIAL DATA
  // ==========================================================

  useEffect(() => {
    loadInitialData();
  }, []);


  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      setError("");
      setSuccess("");

      const [
        sessionsResponse,
        termsResponse,
        classesResponse,
        subjectsResponse,
      ] = await Promise.all([
        api.get("/academics/sessions/"),
        api.get("/academics/terms/"),
        getMyTeacherClasses(),
        getMyTeacherSubjects(),
      ]);


      const sessions =
        getArrayData(sessionsResponse.data);

      const loadedTerms =
        getArrayData(termsResponse.data);

      const classes =
        getArrayData(classesResponse);

      const subjects =
        getArrayData(subjectsResponse);


      setAcademicSessions(sessions);
      setTerms(loadedTerms);
      setTeacherClasses(classes);
      setTeacherSubjects(subjects);


      // --------------------------------------------------------
      // SELECT CURRENT / FIRST SESSION
      // --------------------------------------------------------

      if (sessions.length > 0) {
        const activeSession =
          sessions.find(
            (item) =>
              item.is_current === true ||
              item.is_active === true ||
              item.current === true,
          ) || sessions[0];

        setAcademicSession(
          String(activeSession.id),
        );
      }


      // --------------------------------------------------------
      // SELECT CURRENT / FIRST TERM
      // --------------------------------------------------------

      if (loadedTerms.length > 0) {
        const activeTerm =
          loadedTerms.find(
            (item) =>
              item.is_current === true ||
              item.is_active === true ||
              item.current === true,
          ) || loadedTerms[0];

        setTerm(
          String(activeTerm.id),
        );
      }
    } catch (err) {
      console.error(
        "Teacher attendance initial load error:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load teacher attendance information.",
      );
    } finally {
      setInitialLoading(false);
    }
  };


  // ==========================================================
  // CLASSES FOR SELECTED SESSION
  //
  // CLASS ATTENDANCE ONLY
  //
  // Only ClassTeacher assignments are used.
  // ==========================================================

  const availableClasses = useMemo(() => {
    if (!academicSession) {
      return [];
    }

    return teacherClasses.filter(
      (assignment) =>
        String(assignment.academic_session) ===
        String(academicSession),
    );
  }, [
    teacherClasses,
    academicSession,
  ]);


  // ==========================================================
  // SUBJECTS
  //
  // SUBJECT ATTENDANCE ONLY
  //
  // IMPORTANT:
  // Subjects are completely independent of class.
  // ==========================================================

  const availableSubjects = useMemo(() => {
    return teacherSubjects;
  }, [teacherSubjects]);


  // ==========================================================
  // RESET SELECTIONS WHEN ATTENDANCE TYPE CHANGES
  // ==========================================================

  useEffect(() => {
    setStudents([]);
    setAttendance({});
    setExistingAttendance({});
    setError("");
    setSuccess("");

    if (attendanceType === "CLASS") {
      setSubject("");
    }

    if (attendanceType === "SUBJECT") {
      setClassLevel("");
    }
  }, [attendanceType]);


  // ==========================================================
  // VALIDATE CLASS WHEN SESSION CHANGES
  // ==========================================================

  useEffect(() => {
    if (
      attendanceType !== "CLASS"
    ) {
      return;
    }

    if (!academicSession) {
      setClassLevel("");
      return;
    }

    const stillValid =
      availableClasses.some(
        (item) =>
          String(item.class_level) ===
          String(classLevel),
      );

    if (!stillValid) {
      setClassLevel("");
    }
  }, [
    attendanceType,
    academicSession,
    availableClasses,
    classLevel,
  ]);


  // ==========================================================
  // VALIDATE SUBJECT
  // ==========================================================

  useEffect(() => {
    if (
      attendanceType !== "SUBJECT"
    ) {
      return;
    }

    if (!subject) {
      return;
    }

    const stillValid =
      availableSubjects.some(
        (item) =>
          String(item.subject) ===
          String(subject),
      );

    if (!stillValid) {
      setSubject("");
    }
  }, [
    attendanceType,
    availableSubjects,
    subject,
  ]);


  // ==========================================================
  // LOAD STUDENTS
  //
  // NEW BACKEND ENDPOINT:
  //
  // /attendance/teacher-students/
  //
  // CLASS:
  //     Session + Term + Class
  //
  // SUBJECT:
  //     Session + Term + Subject
  //
  // NO getEnrollments() HERE.
  // ==========================================================

  useEffect(() => {
    if (
      !academicSession ||
      !term ||
      !date
    ) {
      setStudents([]);
      setAttendance({});
      setExistingAttendance({});
      return;
    }


    if (
      attendanceType === "CLASS" &&
      !classLevel
    ) {
      setStudents([]);
      setAttendance({});
      setExistingAttendance({});
      return;
    }


    if (
      attendanceType === "SUBJECT" &&
      !subject
    ) {
      setStudents([]);
      setAttendance({});
      setExistingAttendance({});
      return;
    }


    loadStudents();
  }, [
    academicSession,
    term,
    classLevel,
    subject,
    attendanceType,
    date,
  ]);


  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      setError("");
      setSuccess("");


      const params = {
        attendance_type:
          attendanceType,

        academic_session:
          academicSession,

        term,
          };


      // --------------------------------------------------------
      // CLASS ATTENDANCE
      // --------------------------------------------------------

      if (
        attendanceType === "CLASS"
      ) {
        params.class_level =
          classLevel;
      }


      // --------------------------------------------------------
      // SUBJECT ATTENDANCE
      // --------------------------------------------------------

      if (
        attendanceType === "SUBJECT"
      ) {
        params.subject =
          subject;
      }


      const response =
        await api.get(
          "/attendance/teacher-students/",
          {
            params,
          },
        );


      const loadedStudents =
        getArrayData(response.data);


      const uniqueStudents = [];
      const seen = new Set();


      loadedStudents.forEach(
        (student) => {
          const studentId =
            student.student_id ||
            student.id;


          if (
            !studentId ||
            seen.has(String(studentId))
          ) {
            return;
          }


          seen.add(
            String(studentId),
          );


          uniqueStudents.push({
            ...student,

            _studentId:
              studentId,

            _studentName:
              student.full_name ||
              `${student.first_name || ""} ${
                student.middle_name || ""
              } ${
                student.last_name || ""
              }`.trim() ||
              "Student",

            _admissionNumber:
              student.admission_number ||
              student.admission_no ||
              "",
          });
        },
      );


      uniqueStudents.sort(
        (a, b) =>
          a._studentName.localeCompare(
            b._studentName,
          ),
      );


      setStudents(
        uniqueStudents,
      );


      // --------------------------------------------------------
      // DEFAULT EVERYONE TO PRESENT
      // --------------------------------------------------------

      const initialAttendance =
        {};

      uniqueStudents.forEach(
        (student) => {
          initialAttendance[
            String(
              student._studentId,
            )
          ] = "PRESENT";
        },
      );


      setAttendance(
        initialAttendance,
      );


      // --------------------------------------------------------
      // LOAD EXISTING ATTENDANCE
      // --------------------------------------------------------

      await loadExistingAttendance(
        uniqueStudents,
      );
    } catch (err) {
      console.error(
        "Teacher attendance student load error:",
        err,
      );

      setStudents([]);
      setAttendance({});
      setExistingAttendance({});


      setError(
        err?.response?.data?.detail ||
          "Unable to load students for attendance.",
      );
    } finally {
      setStudentsLoading(false);
    }
  };


  // ==========================================================
  // LOAD EXISTING ATTENDANCE
  //
  // CLASS:
  //     Session + Term + Class + Date
  //     Only subject=NULL records.
  //
  // SUBJECT:
  //     Session + Term + Subject + Date
  // ==========================================================

  const loadExistingAttendance = async (
    currentStudents = students,
  ) => {
    if (
      !academicSession ||
      !term ||
      !date
    ) {
      return;
    }


    try {
      const params = {
        academic_session:
          academicSession,

        term,

        date,
      };


      // --------------------------------------------------------
      // CLASS ATTENDANCE
      // --------------------------------------------------------

      if (
        attendanceType === "CLASS"
      ) {
        params.class_level =
          classLevel;

        params.attendance_type =
          "CLASS";
      }


      // --------------------------------------------------------
      // SUBJECT ATTENDANCE
      // --------------------------------------------------------

      if (
        attendanceType === "SUBJECT"
      ) {
        params.subject =
          subject;

        params.attendance_type =
          "SUBJECT";
      }


      const response =
        await getAttendance(
          params,
        );


      const records =
        getArrayData(response);


      const existing = {};


      records.forEach(
        (record) => {
          const studentId =
            typeof record.student ===
            "object"
              ? record.student?.id
              : record.student;


          if (!studentId) {
            return;
          }


          // ------------------------------------------------------
          // CLASS ATTENDANCE
          //
          // Only accept records without a subject.
          // ------------------------------------------------------

          if (
            attendanceType === "CLASS" &&
            record.subject !== null &&
            record.subject !== undefined
          ) {
            return;
          }


          // ------------------------------------------------------
          // SUBJECT ATTENDANCE
          //
          // Only accept the selected subject.
          // ------------------------------------------------------

          if (
            attendanceType === "SUBJECT"
          ) {
            const recordSubjectId =
              typeof record.subject ===
              "object"
                ? record.subject?.id
                : record.subject;


            if (
              String(
                recordSubjectId,
              ) !== String(subject)
            ) {
              return;
            }
          }


          existing[
            String(studentId)
          ] = record;
        },
      );


      setExistingAttendance(
        existing,
      );


      // --------------------------------------------------------
      // REPLACE DEFAULT PRESENT WITH EXISTING STATUS
      // --------------------------------------------------------

      setAttendance(
        (previous) => {
          const next = {
            ...previous,
          };


          currentStudents.forEach(
            (student) => {
              const studentId =
                String(
                  student._studentId,
                );


              if (
                existing[studentId]
              ) {
                next[studentId] =
                  existing[
                    studentId
                  ].status;
              }
            },
          );


          return next;
        },
      );
    } catch (err) {
      console.error(
        "Existing attendance load error:",
        err,
      );

      // Do not destroy students.
      setExistingAttendance({});
    }
  };


  // ==========================================================
  // CHANGE STATUS
  // ==========================================================

  const handleStatusChange = (
    studentId,
    status,
  ) => {
    setAttendance(
      (previous) => ({
        ...previous,

        [String(studentId)]:
          status,
      }),
    );

    setSuccess("");
  };


  // ==========================================================
  // MARK ALL PRESENT
  // ==========================================================

  const markAllPresent = () => {
    const next = {};

    students.forEach(
      (student) => {
        next[
          String(
            student._studentId,
          )
        ] = "PRESENT";
      },
    );

    setAttendance(next);
    setSuccess("");
  };


  // ==========================================================
  // MARK ALL ABSENT
  // ==========================================================

  const markAllAbsent = () => {
    const next = {};

    students.forEach(
      (student) => {
        next[
          String(
            student._studentId,
          )
        ] = "ABSENT";
      },
    );

    setAttendance(next);
    setSuccess("");
  };


  // ==========================================================
  // SAVE ATTENDANCE
  // ==========================================================

  const handleSave = async () => {
    if (!academicSession) {
      setError(
        "Please select an academic session.",
      );
      return;
    }


    if (!term) {
      setError(
        "Please select a term.",
      );
      return;
    }


    if (
      attendanceType === "CLASS" &&
      !classLevel
    ) {
      setError(
        "Please select a class.",
      );
      return;
    }


    if (
      attendanceType === "SUBJECT" &&
      !subject
    ) {
      setError(
        "Please select a subject.",
      );
      return;
    }


    if (!date) {
      setError(
        "Please select a date.",
      );
      return;
    }


    if (students.length === 0) {
      setError(
        "There are no students available for this attendance.",
      );
      return;
    }


    try {
      setSaving(true);
      setError("");
      setSuccess("");


      for (
        const student of students
      ) {
        const studentId =
          String(
            student._studentId,
          );


        // ------------------------------------------------------
        // BASE PAYLOAD
        // ------------------------------------------------------

        const payload = {
          student:
            student._studentId,

          academic_session:
            Number(
              academicSession,
            ),

          term:
            Number(term),

          date,

          status:
            attendance[
              studentId
            ] || "PRESENT",
        };


        // ------------------------------------------------------
        // CLASS ATTENDANCE
        //
        // class_level is selected by teacher.
        // subject MUST be null.
        // ------------------------------------------------------

        if (
          attendanceType === "CLASS"
        ) {
          payload.class_level =
            Number(classLevel);

          payload.subject = null;
        }


        // ------------------------------------------------------
        // SUBJECT ATTENDANCE
        //
        // subject is selected by teacher.
        //
        // class_level is deliberately NOT sent.
        //
        // Backend determines the student's actual class
        // from the current enrollment.
        // ------------------------------------------------------

        if (
          attendanceType === "SUBJECT"
        ) {
          payload.subject =
            Number(subject);
        }


        const existing =
          existingAttendance[
            studentId
          ];


        if (existing?.id) {
          await updateAttendance(
            existing.id,
            payload,
          );
        } else {
          await createAttendance(
            payload,
          );
        }
      }


      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      const typeLabel =
        attendanceType === "CLASS"
          ? "Class attendance"
          : "Subject attendance";


      setSuccess(
        `${typeLabel} saved successfully for ${
          students.length
        } student${
          students.length === 1
            ? ""
            : "s"
        }.`,
      );


      await loadExistingAttendance(
        students,
      );
    } catch (err) {
      console.error(
        "Save teacher attendance error:",
        err,
      );


      const backendError =
        err?.response?.data;


      let message =
        "Unable to save attendance.";


      if (
        backendError?.detail
      ) {
        message =
          backendError.detail;
      } else if (
        backendError &&
        typeof backendError ===
          "object"
      ) {
        const firstKey =
          Object.keys(
            backendError,
          )[0];


        if (firstKey) {
          const value =
            backendError[
              firstKey
            ];


          message =
            Array.isArray(value)
              ? value[0]
              : String(value);
        }
      }


      setError(message);
    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // COUNTS
  // ==========================================================

  const attendanceCounts =
    useMemo(() => {
      const counts = {
        PRESENT: 0,
        ABSENT: 0,
        LATE: 0,
        EXCUSED: 0,
      };


      students.forEach(
        (student) => {
          const status =
            attendance[
              String(
                student._studentId,
              )
            ];


          if (
            counts[status] !==
            undefined
          ) {
            counts[status] += 1;
          }
        },
      );


      return counts;
    }, [
      students,
      attendance,
    ]);


  // ==========================================================
  // SELECTED CLASS
  // ==========================================================

  const selectedClass =
    useMemo(
      () =>
        availableClasses.find(
          (item) =>
            String(
              item.class_level,
            ) ===
            String(classLevel),
        ),
      [
        availableClasses,
        classLevel,
      ],
    );


  // ==========================================================
  // SELECTED SUBJECT
  // ==========================================================

  const selectedSubject =
    useMemo(
      () =>
        availableSubjects.find(
          (item) =>
            String(
              item.subject,
            ) ===
            String(subject),
        ),
      [
        availableSubjects,
        subject,
      ],
    );


  // ==========================================================
  // INITIAL LOADING
  // ==========================================================

  if (initialLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">

          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-500" />

          <p className="mt-3 text-sm text-slate-500">
            Loading teacher attendance...
          </p>

        </div>
      </div>
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ClipboardCheck className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Attendance
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Record attendance for your assigned
                  classes and subjects.
                </p>
              </div>

            </div>
          </div>


          <button
            type="button"
            onClick={
              loadInitialData
            }
            disabled={
              initialLoading ||
              saving
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />

            Refresh
          </button>

        </div>
      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">

            <p className="font-semibold">
              Attendance error
            </p>

            <p className="mt-1">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="rounded-lg p-1 hover:bg-red-100"
          >
            <XCircle className="h-4 w-4" />
          </button>

        </div>
      )}


      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

          <CheckCircle2 className="mt-0.5 h-5 w-5" />

          <div>

            <p className="font-semibold">
              Attendance saved
            </p>

            <p className="mt-1">
              {success}
            </p>

          </div>

        </div>
      )}


      {/* ======================================================
          ATTENDANCE DETAILS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-5 py-4">

          <h2 className="font-semibold text-slate-900">
            Attendance Details
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Choose whether you are recording class
            attendance or subject attendance.
          </p>

        </div>


        {/* ====================================================
            ATTENDANCE TYPE
        ==================================================== */}

        <div className="border-b border-slate-200 px-5 py-4">

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Attendance Type
          </label>

          <div className="grid gap-3 sm:grid-cols-2">

            {ATTENDANCE_TYPES.map(
              (type) => {
                const selected =
                  attendanceType ===
                  type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setAttendanceType(
                        type.value,
                      )
                    }
                    disabled={saving}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >

                    <p className="text-sm font-semibold">
                      {type.label}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        selected
                          ? "text-slate-300"
                          : "text-slate-500"
                      }`}
                    >
                      {type.value ===
                      "CLASS"
                        ? "Session → Term → Class"
                        : "Session → Term → Subject"}
                    </p>

                  </button>
                );
              },
            )}

          </div>

        </div>


        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">

          {/* SESSION */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Academic Session
            </label>

            <select
              value={
                academicSession
              }
              onChange={(event) =>
                setAcademicSession(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >

              <option value="">
                Select session
              </option>

              {academicSessions.map(
                (session) => (
                  <option
                    key={session.id}
                    value={session.id}
                  >
                    {session.name}
                  </option>
                ),
              )}

            </select>

          </div>


          {/* TERM */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Term
            </label>

            <select
              value={term}
              onChange={(event) =>
                setTerm(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >

              <option value="">
                Select term
              </option>

              {terms.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ),
              )}

            </select>

          </div>


          {/* CLASS ATTENDANCE SELECTOR */}

          {attendanceType ===
            "CLASS" && (
            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Class
              </label>

              <select
                value={classLevel}
                onChange={(event) =>
                  setClassLevel(
                    event.target.value,
                  )
                }
                disabled={
                  !academicSession ||
                  availableClasses.length ===
                    0
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              >

                <option value="">
                  {!academicSession
                    ? "Select session first"
                    : availableClasses.length ===
                        0
                      ? "No assigned classes"
                      : "Select class"}
                </option>

                {availableClasses.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={
                        item.class_level
                      }
                    >
                      {
                        item.class_level_name
                      }
                    </option>
                  ),
                )}

              </select>

            </div>
          )}


          {/* SUBJECT ATTENDANCE SELECTOR */}

          {attendanceType ===
            "SUBJECT" && (
            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Subject
              </label>

              <select
                value={subject}
                onChange={(event) =>
                  setSubject(
                    event.target.value,
                  )
                }
                disabled={
                  availableSubjects.length ===
                  0
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              >

                <option value="">
                  {availableSubjects.length ===
                  0
                    ? "No assigned subjects"
                    : "Select subject"}
                </option>

                {availableSubjects.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={
                        item.subject
                      }
                    >
                      {
                        item.subject_name
                      }
                    </option>
                  ),
                )}

              </select>

            </div>
          )}


          {/* DATE */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Date
            </label>

            <div className="relative">

              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />

            </div>

          </div>

        </div>


        {/* ====================================================
            SELECTED INFO
        ==================================================== */}

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">

          <div className="flex flex-wrap gap-2 text-xs">

            <span className="rounded-full bg-white px-3 py-1.5 font-medium text-slate-700 ring-1 ring-slate-200">
              Type:{" "}
              {attendanceType ===
              "CLASS"
                ? "Class Attendance"
                : "Subject Attendance"}
            </span>


            {attendanceType ===
              "CLASS" &&
              selectedClass && (
                <span className="rounded-full bg-white px-3 py-1.5 font-medium text-slate-700 ring-1 ring-slate-200">
                  Class:{" "}
                  {
                    selectedClass.class_level_name
                  }
                </span>
              )}


            {attendanceType ===
              "SUBJECT" &&
              selectedSubject && (
                <span className="rounded-full bg-white px-3 py-1.5 font-medium text-slate-700 ring-1 ring-slate-200">
                  Subject:{" "}
                  {
                    selectedSubject.subject_name
                  }
                </span>
              )}


            {date && (
              <span className="rounded-full bg-white px-3 py-1.5 font-medium text-slate-700 ring-1 ring-slate-200">
                Date: {date}
              </span>
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          NO CLASS ASSIGNMENT
      ====================================================== */}

      {attendanceType ===
        "CLASS" &&
        academicSession &&
        availableClasses.length ===
          0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">

            <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />

            <h3 className="mt-3 font-semibold text-amber-900">
              No class assignment
            </h3>

            <p className="mx-auto mt-1 max-w-lg text-sm text-amber-700">
              You do not have an active
              class-teacher assignment for
              the selected academic session.
            </p>

          </div>
        )}


      {/* ======================================================
          NO SUBJECT ASSIGNMENT
      ====================================================== */}

      {attendanceType ===
        "SUBJECT" &&
        availableSubjects.length ===
          0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">

            <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />

            <h3 className="mt-3 font-semibold text-amber-900">
              No subject assignment
            </h3>

            <p className="mx-auto mt-1 max-w-lg text-sm text-amber-700">
              You do not have any subject
              assignments available for
              attendance.
            </p>

          </div>
        )}


      {/* ======================================================
          STUDENT ATTENDANCE
      ====================================================== */}

      {(
        attendanceType ===
          "CLASS"
          ? Boolean(classLevel)
          : Boolean(subject)
      ) && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* HEADER */}

          <div className="border-b border-slate-200 px-5 py-4">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <Users className="h-5 w-5 text-slate-600" />

                  <h2 className="font-semibold text-slate-900">
                    Students
                  </h2>

                </div>

                <p className="mt-1 text-xs text-slate-500">

                  {attendanceType ===
                  "CLASS"
                    ? "Mark general class attendance for each student."
                    : "Mark subject attendance for each student."}

                </p>

              </div>


              {/* QUICK ACTIONS */}

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={
                    markAllPresent
                  }
                  disabled={
                    students.length ===
                      0 ||
                    studentsLoading ||
                    saving
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <CheckCircle2 className="h-4 w-4" />

                  Mark All Present

                </button>


                <button
                  type="button"
                  onClick={
                    markAllAbsent
                  }
                  disabled={
                    students.length ===
                      0 ||
                    studentsLoading ||
                    saving
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <XCircle className="h-4 w-4" />

                  Mark All Absent

                </button>

              </div>

            </div>

          </div>


          {/* COUNTERS */}

          <div className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">

            <div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r">

              <p className="text-xs text-slate-500">
                Present
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-600">
                {attendanceCounts.PRESENT}
              </p>

            </div>


            <div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r">

              <p className="text-xs text-slate-500">
                Absent
              </p>

              <p className="mt-1 text-xl font-bold text-red-600">
                {attendanceCounts.ABSENT}
              </p>

            </div>


            <div className="border-r border-slate-200 p-4">

              <p className="text-xs text-slate-500">
                Late
              </p>

              <p className="mt-1 text-xl font-bold text-amber-600">
                {attendanceCounts.LATE}
              </p>

            </div>


            <div className="p-4">

              <p className="text-xs text-slate-500">
                Excused
              </p>

              <p className="mt-1 text-xl font-bold text-blue-600">
                {attendanceCounts.EXCUSED}
              </p>

            </div>

          </div>


          {/* LOADING */}

          {studentsLoading && (
            <div className="flex min-h-[250px] items-center justify-center">

              <div className="text-center">

                <Loader2 className="mx-auto h-7 w-7 animate-spin text-slate-500" />

                <p className="mt-2 text-sm text-slate-500">
                  Loading students...
                </p>

              </div>

            </div>
          )}


          {/* NO STUDENTS */}

          {!studentsLoading &&
            students.length ===
              0 && (
              <div className="p-10 text-center">

                <Users className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-3 font-semibold text-slate-700">
                  No students found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  No students are available
                  for the selected attendance
                  period.
                </p>

              </div>
            )}


          {/* STUDENT TABLE */}

          {!studentsLoading &&
            students.length > 0 && (
              <>

                <div className="overflow-x-auto">

                  <table className="min-w-full divide-y divide-slate-200">

                    <thead className="bg-slate-50">

                      <tr>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          #
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Student
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Class
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Admission Number
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Attendance
                        </th>

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-100 bg-white">

                      {students.map(
                        (
                          student,
                          index,
                        ) => {

                          const studentId =
                            String(
                              student._studentId,
                            );


                          const currentStatus =
                            attendance[
                              studentId
                            ] ||
                            "PRESENT";


                          const hasExisting =
                            Boolean(
                              existingAttendance[
                                studentId
                              ],
                            );


                          return (
                            <tr
                              key={
                                studentId
                              }
                              className="transition hover:bg-slate-50"
                            >

                              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                                {index +
                                  1}
                              </td>


                              <td className="whitespace-nowrap px-5 py-4">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                                    {student._studentName
                                      ?.charAt(
                                        0,
                                      )
                                      ?.toUpperCase() ||
                                      "S"}
                                  </div>


                                  <div>

                                    <p className="text-sm font-semibold text-slate-800">
                                      {
                                        student._studentName
                                      }
                                    </p>

                                    {hasExisting && (
                                      <p className="mt-0.5 text-[11px] text-emerald-600">
                                        Previously recorded
                                      </p>
                                    )}

                                  </div>

                                </div>

                              </td>


                              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                {
                                  student.class_name ||
                                  "—"
                                }
                              </td>


                              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                {
                                  student._admissionNumber ||
                                  "—"
                                }
                              </td>


                              <td className="px-5 py-4">

                                <div className="flex flex-wrap gap-2">

                                  {ATTENDANCE_STATUSES.map(
                                    (
                                      status,
                                    ) => {

                                      const selected =
                                        currentStatus ===
                                        status.value;


                                      return (
                                        <button
                                          key={
                                            status.value
                                          }
                                          type="button"
                                          onClick={() =>
                                            handleStatusChange(
                                              studentId,
                                              status.value,
                                            )
                                          }
                                          disabled={
                                            saving
                                          }
                                          className={`
                                            rounded-lg border px-3 py-2 text-xs font-semibold transition
                                            ${
                                              selected
                                                ? status.value ===
                                                  "PRESENT"
                                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                                  : status.value ===
                                                      "ABSENT"
                                                    ? "border-red-600 bg-red-600 text-white"
                                                    : status.value ===
                                                        "LATE"
                                                      ? "border-amber-500 bg-amber-500 text-white"
                                                      : "border-blue-600 bg-blue-600 text-white"
                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                            }
                                          `}
                                        >

                                          <span className="mr-1">
                                            {
                                              status.shortLabel
                                            }
                                          </span>

                                          {
                                            status.label
                                          }

                                        </button>
                                      );
                                    },
                                  )}

                                </div>

                              </td>

                            </tr>
                          );
                        },
                      )}

                    </tbody>

                  </table>

                </div>


                {/* SAVE */}

                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-2 text-xs text-slate-500">

                    <Clock3 className="h-4 w-4" />

                    <span>
                      {date
                        ? `Attendance date: ${date}`
                        : "Select an attendance date"}
                    </span>

                  </div>


                  <button
                    type="button"
                    onClick={
                      handleSave
                    }
                    disabled={
                      saving ||
                      students.length ===
                        0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />

                        Save Attendance
                      </>
                    )}

                  </button>

                </div>

              </>
            )}

        </section>
      )}

    </div>
  );
}


export default TeacherAttendance;
