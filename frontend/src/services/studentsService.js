
// import api from "./api";

// // =====================================================
// // STUDENTS
// // =====================================================

// // export const getStudents = async () => {
// //   const { data } = await api.get("/students/");
// //   return data;
// // };

// // export const getStudent = async (id) => {
// //   const { data } = await api.get(`/students/${id}/`);
// //   return data;
// // };


// export const getStudents = async (search = "") => {
//   const params = {};

//   if (search?.trim()) {
//     params.search = search.trim();
//   }

//   const { data } = await api.get("/students/", { params });

//   return data;
// };


// export const createStudent = async (studentData) => {
//   const { data } = await api.post("/students/", studentData);
//   return data;
// };

// export const updateStudent = async (id, studentData) => {
//   const { data } = await api.patch(`/students/${id}/`, studentData);
//   return data;
// };

// export const deleteStudent = async (id) => {
//   await api.delete(`/students/${id}/`);
// };

// // =====================================================
// // STUDENT ENROLLMENTS
// // =====================================================

// export const getEnrollments = async ({
//   classLevel,
//   academicSession,
//   term,
// } = {}) => {
//   const params = {};

//   if (classLevel) {
//     params.class_level = classLevel;
//   }

//   if (academicSession) {
//     params.academic_session = academicSession;
//   }

//   if (term) {
//     params.term = term;
//   }

//   const { data } = await api.get("/students/enrollments/", { params });

//   return data;
// };

// export const createEnrollment = async (enrollmentData) => {
//   const { data } = await api.post(
//     "/students/enrollments/",
//     enrollmentData,
//   );

//   return data;
// };

// export const updateEnrollment = async (id, enrollmentData) => {
//   const { data } = await api.put(
//     `/students/enrollments/${id}/`,
//     enrollmentData,
//   );

//   return data;
// };

// export const deleteEnrollment = async (id) => {
//   await api.delete(`/students/enrollments/${id}/`);
// };

// // =====================================================
// // STUDENT PARENTS / GUARDIANS
// // =====================================================

// export const getStudentParents = async (studentId) => {
//   const { data } = await api.get(
//     `/students/${studentId}/parents/`,
//   );

//   return data;
// };

// // =====================================================
// // PARENT / GUARDIAN
// // =====================================================

// export const addStudentParent = async (studentId, parentData) => {
//   const { data } = await api.post(
//     `/students/${studentId}/parents/add/`,
//     parentData,
//   );

//   return data;
// };

// export const updateParentGuardian = async (parentId, parentData) => {
//   const { data } = await api.patch(
//     `/students/parents/${parentId}/`,
//     parentData,
//   );

//   return data;
// };

// export const removeStudentParent = async (studentId, parentId) => {
//   await api.delete(
//     `/students/${studentId}/parents/${parentId}/`,
//   );
// };

// // Alias kept for compatibility with any existing code.
// export const updateParent = async (parentId, parentData) => {
//   const { data } = await api.patch(
//     `/students/parents/${parentId}/`,
//     parentData,
//   );

//   return data;
// };

// // =====================================================
// // ALL PARENTS / GUARDIANS
// // =====================================================

// export const getParents = async () => {
//   const { data } = await api.get("/students/parents/");
//   return data;
// };

// export const getParent = async (parentId) => {
//   const { data } = await api.get(
//     `/students/parents/${parentId}/`,
//   );

//   return data;
// };

// export const deleteParent = async (parentId) => {
//   await api.delete(`/students/parents/${parentId}/`);
// };





import api from "./api";

// =====================================================
// STUDENTS
// =====================================================

export const getStudents = async ({
  search = "",
  school = "",
  classLevel = "",
  academicSession = "",
  term = "",
} = {}) => {
  const params = {};

  if (search?.trim()) {
    params.search = search.trim();
  }

  if (school) {
    params.school = school;
  }

  if (classLevel) {
    params.class_level = classLevel;
  }

  if (academicSession) {
    params.academic_session = academicSession;
  }

  if (term) {
    params.term = term;
  }

  const { data } = await api.get("/students/", {
    params,
  });

  return data;
};

export const getStudent = async (id) => {
const { data } = await api.get(`/students/${id}/`);
return data;
};

export const createStudent = async (studentData) => {
const { data } = await api.post("/students/", studentData);
return data;
};

export const updateStudent = async (id, studentData) => {
const { data } = await api.patch(`/students/${id}/`, studentData);
return data;
};

export const deleteStudent = async (id) => {
await api.delete(`/students/${id}/`);
};

// =====================================================
// ENROLLMENTS
// =====================================================

export const getEnrollments = async ({
classLevel,
academicSession,
term,
} = {}) => {
const params = {};

if (classLevel) params.class_level = classLevel;
if (academicSession) params.academic_session = academicSession;
if (term) params.term = term;

const { data } = await api.get("/students/enrollments/", {
params,
});

return data;
};

export const createEnrollment = async (enrollmentData) => {
const { data } = await api.post(
"/students/enrollments/",
enrollmentData
);

return data;
};

export const updateEnrollment = async (id, enrollmentData) => {
const { data } = await api.put(
`/students/enrollments/${id}/`,
enrollmentData
);

return data;
};

export const deleteEnrollment = async (id) => {
await api.delete(`/students/enrollments/${id}/`);
};

// =====================================================
// STUDENT PARENTS / GUARDIANS
// =====================================================

export const getStudentParents = async (studentId) => {
const { data } = await api.get(
`/students/${studentId}/parents/`
);

return data;
};

export const addStudentParent = async (studentId, parentData) => {
const { data } = await api.post(
`/students/${studentId}/parents/add/`,
parentData
);

return data;
};

export const updateParentGuardian = async (
parentId,
parentData
) => {
const { data } = await api.patch(
`/students/parents/${parentId}/`,
parentData
);

return data;
};

export const removeStudentParent = async (
studentId,
parentId
) => {
await api.delete(
`/students/${studentId}/parents/${parentId}/`
);
};

export const updateParent = async (
parentId,
parentData
) => {
const { data } = await api.patch(
`/students/parents/${parentId}/`,
parentData
);

return data;
};

export const getParents = async () => {
const { data } = await api.get("/students/parents/");
return data;
};

export const getParent = async (parentId) => {
const { data } = await api.get(
`/students/parents/${parentId}/`
);

return data;
};

export const deleteParent = async (parentId) => {
await api.delete(`/students/parents/${parentId}/`);
};

// =====================================================
// STUDENT SUBJECTS
// =====================================================

export const getStudentSubjects = async (studentId) => {
  const { data } = await api.get(
    `/students/${studentId}/subjects/`,
  );

  return data;
};


// =====================================================
// SELECT OPTIONAL SUBJECT
// =====================================================

export const selectStudentOptionalSubject = async (
  studentId,
  subjectId,
) => {
  const { data } = await api.post(
    `/students/${studentId}/subjects/select/`,
    {
      subject_id: subjectId,
    },
  );

  return data;
};


// =====================================================
// REMOVE OPTIONAL SUBJECT
// =====================================================

export const removeStudentOptionalSubject = async (
  studentId,
  subjectId,
) => {
  const { data } = await api.delete(
    `/students/${studentId}/subjects/${subjectId}/remove/`,
  );

  return data;
};


// ===============================
// Optional Subject Selection Settings
// ===============================

export const getOptionalSubjectSettings = async () => {
  const { data } = await api.get(
    "/students/optional-subject-settings/"
  );

  return data;
};

export const getOptionalSubjectSetting = async (id) => {
  const { data } = await api.get(
    `/students/optional-subject-settings/${id}/`
  );

  return data;
};

export const createOptionalSubjectSetting = async (settingData) => {
  const { data } = await api.post(
    "/students/optional-subject-settings/",
    settingData
  );

  return data;
};

export const updateOptionalSubjectSetting = async (
  id,
  settingData
) => {
  const { data } = await api.patch(
    `/students/optional-subject-settings/${id}/`,
    settingData
  );

  return data;
};

export const deleteOptionalSubjectSetting = async (id) => {
  const { data } = await api.delete(
    `/students/optional-subject-settings/${id}/`
  );

  return data;
};

export const getStudentEnrollments = async (studentId) => {
  const { data } = await api.get(
    `/students/enrollments/?student=${studentId}`
  );

  return data;
};

export const getCurrentStudentEnrollment = async (studentId) => {
  const { data } = await api.get(
    `/students/enrollments/?student=${studentId}&is_current=true`
  );

  return Array.isArray(data)
    ? data[0] || null
    : data?.results?.[0] || null;
};

export const getStudentClassmates = async (studentId) => {
  const { data } = await api.get(
    `/students/${studentId}/classmates/`
  );

  return data;
};

// =========================================================
// STUDENT SUBJECTS
// =========================================================



// =========================================================
// SELECT OPTIONAL SUBJECT
// =========================================================

export const selectOptionalSubject = async (
  studentId,
  subjectId
) => {
  const response = await api.post(
    `/students/${studentId}/subjects/select/`,
    {
      subject_id: subjectId,
    }
  );

  return response.data;
};


// =========================================================
// REMOVE OPTIONAL SUBJECT
// =========================================================

export const removeOptionalSubject = async (
  studentId,
  subjectId
) => {
  const response = await api.delete(
    `/students/${studentId}/subjects/${subjectId}/remove/`
  );

  return response.data;
};



// =========================================================
// GRADUATION
// =========================================================

// Get students who are currently eligible for graduation.
export const getGraduationEligibleStudents = async () => {
  const { data } = await api.get(
    "/students/graduation/eligible/"
  );

  return data;
};


// Graduate a student.
export const graduateStudent = async ({
  student,
  graduation_year,
  remarks = "",
}) => {
  const payload = {
    student,
    remarks,
  };

  // Only send graduation_year when a value was actually supplied.
  // This allows the backend to automatically use the academic
  // session's end year.
  if (
    graduation_year !== undefined &&
    graduation_year !== null &&
    graduation_year !== ""
  ) {
    payload.graduation_year = Number(graduation_year);
  }

  const { data } = await api.post(
    "/students/graduation/",
    payload
  );

  return data;
};


// Get graduation history.
export const getGraduationHistory = async ({
  student,
  academicSession,
} = {}) => {
  const params = {};

  if (student) {
    params.student = student;
  }

  if (academicSession) {
    params.session = academicSession;
  }

  const { data } = await api.get(
    "/students/graduation/history/",
    { params }
  );

  return data;
};