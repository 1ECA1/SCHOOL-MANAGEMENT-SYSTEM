// import api from "./api";

// const BASE = "/teachers/";

// const teachersService = {
//   // Teachers CRUD
//   getAll: (params) => api.get(BASE, { params }),
//   getById: (id) => api.get(`${BASE}${id}/`),
//   create: (data) => api.post(BASE, data),
//   update: (id, data) => api.put(`${BASE}${id}/`, data),
//   partialUpdate: (id, data) => api.patch(`${BASE}${id}/`, data),
//   delete: (id) => api.delete(`${BASE}${id}/`),

//   // Teacher-Subject assignment
//   getSubjectAssignments: (params) =>
//     api.get(`${BASE}subjects/`, { params }),
//   assignSubject: (data) => api.post(`${BASE}subjects/`, data),
//   updateSubjectAssignment: (id, data) =>
//     api.put(`${BASE}subjects/${id}/`, data),
//   deleteSubjectAssignment: (id) =>
//     api.delete(`${BASE}subjects/${id}/`),

//   // Class Teacher assignment
//   getClassAssignments: (params) =>
//     api.get(`${BASE}class-teachers/`, { params }),
//   assignClass: (data) => api.post(`${BASE}class-teachers/`, data),
//   updateClassAssignment: (id, data) =>
//     api.put(`${BASE}class-teachers/${id}/`, data),
//   deleteClassAssignment: (id) =>
//     api.delete(`${BASE}class-teachers/${id}/`),
// };

// export default teachersService;



// import api from "./api";

// const BASE = "/teachers/";

// // =====================================================
// // TEACHERS
// // =====================================================

// export const getTeachers = async (params) => {
//   const { data } = await api.get(BASE, { params });
//   return data;
// };

// export const getTeacher = async (id) => {
//   const { data } = await api.get(`${BASE}${id}/`);
//   return data;
// };

// export const createTeacher = async (payload) => {
//   const { data } = await api.post(BASE, payload);
//   return data;
// };

// export const updateTeacher = async (id, payload) => {
//   const { data } = await api.put(`${BASE}${id}/`, payload);
//   return data;
// };

// export const partialUpdateTeacher = async (id, payload) => {
//   const { data } = await api.patch(`${BASE}${id}/`, payload);
//   return data;
// };

// export const deleteTeacher = async (id) => {
//   const { data } = await api.delete(`${BASE}${id}/`);
//   return data;
// };

// // =====================================================
// // TEACHER SUBJECT ASSIGNMENTS
// // =====================================================

// export const getSubjectAssignments = async (params) => {
//   const { data } = await api.get(`${BASE}subjects/`, { params });
//   return data;
// };

// export const assignSubject = async (payload) => {
//   const { data } = await api.post(`${BASE}subjects/`, payload);
//   return data;
// };

// export const updateSubjectAssignment = async (id, payload) => {
//   const { data } = await api.put(`${BASE}subjects/${id}/`, payload);
//   return data;
// };

// export const deleteSubjectAssignment = async (id) => {
//   const { data } = await api.delete(`${BASE}subjects/${id}/`);
//   return data;
// };

// // =====================================================
// // CLASS TEACHER ASSIGNMENTS
// // =====================================================

// export const getClassAssignments = async (params) => {
//   const { data } = await api.get(`${BASE}class-teachers/`, { params });
//   return data;
// };

// export const assignClass = async (payload) => {
//   const { data } = await api.post(`${BASE}class-teachers/`, payload);
//   return data;
// };

// export const updateClassAssignment = async (id, payload) => {
//   const { data } = await api.put(`${BASE}class-teachers/${id}/`, payload);
//   return data;
// };

// export const deleteClassAssignment = async (id) => {
//   const { data } = await api.delete(`${BASE}class-teachers/${id}/`);
//   return data;
// };

import api from "./api";

const BASE = "/teachers/";

// =====================================================
// TEACHERS
// =====================================================

export const getTeachers = async (params) => {
  const { data } = await api.get(BASE, { params });
  return data;
};

export const getTeacher = async (id) => {
  const { data } = await api.get(`${BASE}${id}/`);
  return data;
};

export const createTeacher = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data;
};

export const updateTeacher = async (id, payload) => {
  const { data } = await api.put(`${BASE}${id}/`, payload);
  return data;
};

export const partialUpdateTeacher = async (id, payload) => {
  const { data } = await api.patch(`${BASE}${id}/`, payload);
  return data;
};

export const deleteTeacher = async (id) => {
  const { data } = await api.delete(`${BASE}${id}/`);
  return data;
};

// =====================================================
// TEACHER SUBJECT ASSIGNMENTS
// =====================================================

export const getSubjectAssignments = async (params) => {
  const { data } = await api.get(`${BASE}assign-subject/`, {
    params,
  });

  return data;
};

export const assignSubject = async (payload) => {
  const { data } = await api.post(
    `${BASE}assign-subject/`,
    payload
  );

  return data;
};

export const updateSubjectAssignment = async (id, payload) => {
  const { data } = await api.put(
    `${BASE}assign-subject/${id}/`,
    payload
  );

  return data;
};

export const deleteSubjectAssignment = async (id) => {
  const { data } = await api.delete(
    `${BASE}assign-subject/${id}/`
  );

  return data;
};

// =====================================================
// CLASS TEACHER ASSIGNMENTS
// =====================================================

export const getClassAssignments = async (params) => {
  const { data } = await api.get(`${BASE}assign-class/`, {
    params,
  });

  return data;
};

export const assignClass = async (payload) => {
  const { data } = await api.post(
    `${BASE}assign-class/`,
    payload
  );

  return data;
};

export const updateClassAssignment = async (id, payload) => {
  const { data } = await api.put(
    `${BASE}assign-class/${id}/`,
    payload
  );

  return data;
};

export const deleteClassAssignment = async (id) => {
  const { data } = await api.delete(
    `${BASE}assign-class/${id}/`
  );

  return data;
};

// =====================================================
// TEACHER PORTAL
// =====================================================

/**
 * Get classes assigned to the currently logged-in teacher.
 *
 * Backend:
 * GET /teachers/my-classes/
 */
export const getMyTeacherClasses = async () => {
  const { data } = await api.get(`${BASE}my-classes/`);
  return data;
};

/**
 * Get subjects assigned to the currently logged-in teacher.
 *
 * Backend:
 * GET /teachers/my-subjects/
 */
export const getMyTeacherSubjects = async () => {
  const { data } = await api.get(`${BASE}my-subjects/`);
  return data;
};