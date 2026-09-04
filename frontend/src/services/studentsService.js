// import api from "./api";

// export const getEnrollments = async ({ classLevel, academicSession, term }) => {
//   const params = {};
//   if (classLevel) params.class_level = classLevel;
//   if (academicSession) params.academic_session = academicSession;
//   if (term) params.term = term;

//   const { data } = await api.get("/students/enrollments/", { params });
//   return data;
// };

import api from "./api";

// =====================================================
// STUDENTS
// =====================================================

export const getStudents = async () => {
  const { data } = await api.get("/students/");
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
// STUDENT ENROLLMENTS
// =====================================================

export const getEnrollments = async ({
  classLevel,
  academicSession,
  term,
} = {}) => {
  const params = {};

  if (classLevel) {
    params.class_level = classLevel;
  }

  if (academicSession) {
    params.academic_session = academicSession;
  }

  if (term) {
    params.term = term;
  }

  const { data } = await api.get("/students/enrollments/", { params });

  return data;
};

export const createEnrollment = async (enrollmentData) => {
  const { data } = await api.post("/students/enrollments/", enrollmentData);

  return data;
};

export const updateEnrollment = async (id, enrollmentData) => {
  const { data } = await api.put(
    `/students/enrollments/${id}/`,
    enrollmentData,
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
  const { data } = await api.get(`/students/${studentId}/parents/`);

  return data;
};

export const addStudentParent = async (studentId, parentData) => {
  const { data } = await api.post(
    `/students/${studentId}/parents/add/`,
    parentData,
  );

  return data;
};

export const updateParentGuardian = async (parentId, parentData) => {
  const { data } = await api.put(`/students/parents/${parentId}/`, parentData);

  return data;
};

export const removeStudentParent = async (studentId, parentId) => {
  await api.delete(`/students/${studentId}/parents/${parentId}/`);
};

export const updateParent = async (parentId, parentData) => {
  const { data } = await api.patch(
    `/students/parents/${parentId}/`,
    parentData,
  );

  return data;
};


// =====================================================
// ALL PARENTS / GUARDIANS
// =====================================================

export const getParents = async () => {
  const { data } = await api.get("/students/parents/");
  return data;
};

export const getParent = async (parentId) => {
  const { data } = await api.get(`/students/parents/${parentId}/`);
  return data;
};

export const deleteParent = async (parentId) => {
  await api.delete(`/students/parents/${parentId}/`);
};