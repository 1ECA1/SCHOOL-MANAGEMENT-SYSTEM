// import api from "./api";

// export const getSessions = async () => {
//   const { data } = await api.get("/academics/sessions/");
//   return data;
// };

// export const getSchools = async () => {
//   const { data } = await api.get("/academics/schools/");
//   return data;
// };

// export const getSchool = async (id) => {
//   const { data } = await api.get(
//     `/academics/schools/${id}/`,
//   );
//   return data;
// };

// export const createSchool = async (schoolData) => {
//   const { data } = await api.post(
//     "/academics/schools/",
//     schoolData,
//   );

//   return data;
// };

// export const updateSchool = async (
//   id,
//   schoolData,
// ) => {
//   const { data } = await api.put(
//     `/academics/schools/${id}/`,
//     schoolData,
//   );

//   return data;
// };



// export const deleteSchool = async (id) => {
//   const { data } = await api.delete(
//     `/academics/schools/${id}/`,
//   );
//   return data;
// };

// export const getTerms = async () => {
//   const { data } = await api.get("/academics/terms/");
//   return data;
// };

// export const getClassLevels = async () => {
//   const { data } = await api.get("/academics/class-levels/");
//   return data;
// };

// export const getSubjects = async () => {
//   const { data } = await api.get("/academics/subjects/");
//   return data;
// };

// // =====================================================
// // SUBJECTS
// // =====================================================

// export const getSubject = async (id) => {
//   const { data } = await api.get(`/academics/subjects/${id}/`);
//   return data;
// };

// export const createSubject = async (subjectData) => {
//   const { data } = await api.post(
//     "/academics/subjects/",
//     subjectData,
//   );
//   return data;
// };

// export const updateSubject = async (id, subjectData) => {
//   const { data } = await api.put(
//     `/academics/subjects/${id}/`,
//     subjectData,
//   );
//   return data;
// };

// export const deleteSubject = async (id) => {
//   const { data } = await api.delete(
//     `/academics/subjects/${id}/`,
//   );
//   return data;
// };

// // =====================================================
// // CLASS LEVELS
// // =====================================================

// export const getClassLevel = async (id) => {
//   const { data } = await api.get(`/academics/class-levels/${id}/`);
//   return data;
// };

// export const createClassLevel = async (classLevelData) => {
//   const { data } = await api.post(
//     "/academics/class-levels/",
//     classLevelData,
//   );
//   return data;
// };

// export const updateClassLevel = async (id, classLevelData) => {
//   const { data } = await api.put(
//     `/academics/class-levels/${id}/`,
//     classLevelData,
//   );
//   return data;
// };

// export const deleteClassLevel = async (id) => {
//   const { data } = await api.delete(
//     `/academics/class-levels/${id}/`,
//   );
//   return data;
// };

// export const getDepartments = async () => {
//   const { data } = await api.get("/academics/departments/");
//   return data;
// };

// export const getDepartment = async (id) => {
//   const { data } = await api.get(`/academics/departments/${id}/`);
//   return data;
// };

// export const createDepartment = async (departmentData) => {
//   const { data } = await api.post(
//     "/academics/departments/",
//     departmentData,
//   );
//   return data;
// };

// export const updateDepartment = async (id, departmentData) => {
//   const { data } = await api.put(
//     `/academics/departments/${id}/`,
//     departmentData,
//   );
//   return data;
// };

// export const deleteDepartment = async (id) => {
//   const { data } = await api.delete(
//     `/academics/departments/${id}/`,
//   );
//   return data;
// };

// // =====================================================
// // ACADEMIC SECTIONS
// // =====================================================

// export const getAcademicSections = async () => {
//   const { data } = await api.get("/academics/academic-sections/");
//   return data;
// };

// export const getAcademicSection = async (id) => {
//   const { data } = await api.get(
//     `/academics/academic-sections/${id}/`,
//   );
//   return data;
// };

// export const createAcademicSection = async (sectionData) => {
//   const { data } = await api.post(
//     "/academics/academic-sections/",
//     sectionData,
//   );
//   return data;
// };

// export const updateAcademicSection = async (id, sectionData) => {
//   const { data } = await api.put(
//     `/academics/academic-sections/${id}/`,
//     sectionData,
//   );
//   return data;
// };

// export const deleteAcademicSection = async (id) => {
//   const { data } = await api.delete(
//     `/academics/academic-sections/${id}/`,
//   );
//   return data;
// };


// // =====================================================
// // TERMS
// // =====================================================

// export const getTerm = async (id) => {
//   const { data } = await api.get(`/academics/terms/${id}/`);
//   return data;
// };

// export const createTerm = async (termData) => {
//   const { data } = await api.post(
//     "/academics/terms/",
//     termData,
//   );
//   return data;
// };

// export const updateTerm = async (id, termData) => {
//   const { data } = await api.put(
//     `/academics/terms/${id}/`,
//     termData,
//   );
//   return data;
// };

// export const deleteTerm = async (id) => {
//   const { data } = await api.delete(
//     `/academics/terms/${id}/`,
//   );
//   return data;
// };



// export const deleteSession = async (id) => {
//   const { data } = await api.delete(
//     `/academics/sessions/${id}/`,
//   );

//   return data;
// };

// export const createSession = async (sessionData) => {
//   const { data } = await api.post(
//     "/academics/sessions/",
//     sessionData,
//   );

//   return data;
// };

// export const getSession = async (id) => {
//   const { data } = await api.get(
//     `/academics/sessions/${id}/`,
//   );

//   return data;
// };

// export const updateSession = async (id, sessionData) => {
//   const { data } = await api.put(
//     `/academics/sessions/${id}/`,
//     sessionData,
//   );

//   return data;
// };




// export const getClassSubjects = async () => {
//   const { data } = await api.get("/academics/class-subjects/");
//   return data;
// };

// export const getClassSubject = async (id) => {
//   const { data } = await api.get(`/academics/class-subjects/${id}/`);
//   return data;
// };

// export const createClassSubject = async (classSubjectData) => {
//   const { data } = await api.post(
//     "/academics/class-subjects/",
//     classSubjectData
//   );
//   return data;
// };

// export const updateClassSubject = async (id, classSubjectData) => {
//   const { data } = await api.put(
//     `/academics/class-subjects/${id}/`,
//     classSubjectData
//   );
//   return data;
// };

// export const deleteClassSubject = async (id) => {
//   const { data } = await api.delete(
//     `/academics/class-subjects/${id}/`
//   );
//   return data;
// };

// export const setCurrentTerm = async (id) => {
//   const { data } = await api.post(`/academics/terms/${id}/set-current/`);
//   return data;
// };






import api from "./api";

// =====================================================
// SCHOOLS
// =====================================================


export const getSchools = async () => {
  const response = await api.get("/academics/schools/");

  console.log("========== GET SCHOOLS DEBUG ==========");
  console.log("URL:", response.config?.baseURL + response.config?.url);
  console.log("STATUS:", response.status);
  console.log("REQUEST AUTH:", response.config?.headers?.Authorization);
  console.log("RAW RESPONSE:", response.data);
  console.log(
    "RAW RESPONSE COUNT:",
    Array.isArray(response.data)
      ? response.data.length
      : response.data?.results?.length,
  );
  console.log("========================================");

  return response.data;
};



export const getSchool = async (id) => {
  const { data } = await api.get(`/academics/schools/${id}/`);
  return data;
};

export const createSchool = async (schoolData) => {
  const { data } = await api.post("/academics/schools/", schoolData);
  return data;
};

export const updateSchool = async (id, schoolData) => {
  const { data } = await api.put(`/academics/schools/${id}/`, schoolData);
  return data;
};

export const deleteSchool = async (id) => {
  const { data } = await api.delete(`/academics/schools/${id}/`);
  return data;
};

// =====================================================
// ACADEMIC SESSIONS
// =====================================================

export const getSessions = async (schoolId = null) => {
  const url = schoolId
    ? `/academics/sessions/?school=${schoolId}`
    : "/academics/sessions/";

  const { data } = await api.get(url);
  return data;
};

export const getSession = async (id) => {
  const { data } = await api.get(`/academics/sessions/${id}/`);
  return data;
};

export const createSession = async (sessionData) => {
  const { data } = await api.post(
    "/academics/sessions/",
    sessionData,
  );
  return data;
};

export const updateSession = async (id, sessionData) => {
  const { data } = await api.patch(
    `/academics/sessions/${id}/`,
    sessionData,
  );
  return data;
};

export const deleteSession = async (id) => {
  const { data } = await api.delete(
    `/academics/sessions/${id}/`,
  );
  return data;
};

// =====================================================
// TERMS
// =====================================================

export const getTerms = async (schoolId = null) => {
const url = schoolId
? `/academics/terms/?school=${schoolId}`
: "/academics/terms/";

const response = await api.get(url);

console.log("========== GET TERMS DEBUG ==========");
console.log(
"REQUEST URL:",
`${response.config?.baseURL || ""}${response.config?.url || url}`
);
console.log("STATUS:", response.status);
console.log("RESPONSE DATA:", response.data);

const data = response.data;
const terms = Array.isArray(data)
? data
: Array.isArray(data?.results)
? data.results
: [];

console.log("TERM COUNT:", terms.length);
console.log(
"TERM IDs:",
terms.map((term) => ({
id: term.id,
name: term.name,
academic_session: term.academic_session,
}))
);
console.log("======================================");

return data;
};


// export const getTerms = async (schoolId = null) => {
//   const url = schoolId
//     ? `/academics/terms/?school=${schoolId}`
//     : "/academics/terms/";

//   const { data } = await api.get(url);
//   return data;
// };

export const getTerm = async (id) => {
  const { data } = await api.get(`/academics/terms/${id}/`);
  return data;
};

export const createTerm = async (termData) => {
  const { data } = await api.post(
    "/academics/terms/",
    termData,
  );
  return data;
};

export const updateTerm = async (id, termData) => {
  const { data } = await api.patch(
    `/academics/terms/${id}/`,
    termData,
  );
  return data;
};

export const deleteTerm = async (id) => {
  const { data } = await api.delete(
    `/academics/terms/${id}/`,
  );
  return data;
};

export const setCurrentTerm = async (id) => {
  const { data } = await api.post(
    `/academics/terms/${id}/set-current/`,
  );
  return data;
};

// =====================================================
// CLASS LEVELS
// =====================================================

export const getClassLevels = async () => {
  const { data } = await api.get("/academics/class-levels/");
  return data;
};

export const getClassLevel = async (id) => {
  const { data } = await api.get(
    `/academics/class-levels/${id}/`,
  );
  return data;
};

export const createClassLevel = async (classLevelData) => {
  const { data } = await api.post(
    "/academics/class-levels/",
    classLevelData,
  );
  return data;
};

export const updateClassLevel = async (id, classLevelData) => {
  const { data } = await api.patch(
    `/academics/class-levels/${id}/`,
    classLevelData,
  );
  return data;
};

export const deleteClassLevel = async (id) => {
  const { data } = await api.delete(
    `/academics/class-levels/${id}/`,
  );
  return data;
};

// =====================================================
// DEPARTMENTS
// =====================================================

export const getDepartments = async () => {
  const { data } = await api.get("/academics/departments/");
  return data;
};

export const getDepartment = async (id) => {
  const { data } = await api.get(
    `/academics/departments/${id}/`,
  );
  return data;
};

export const createDepartment = async (departmentData) => {
  const { data } = await api.post(
    "/academics/departments/",
    departmentData,
  );
  return data;
};

export const updateDepartment = async (id, departmentData) => {
  const { data } = await api.patch(
    `/academics/departments/${id}/`,
    departmentData,
  );
  return data;
};

export const deleteDepartment = async (id) => {
  const { data } = await api.delete(
    `/academics/departments/${id}/`,
  );
  return data;
};

// =====================================================
// SUBJECTS
// =====================================================

export const getSubjects = async () => {
  const { data } = await api.get("/academics/subjects/");
  return data;
};

export const getSubject = async (id) => {
  const { data } = await api.get(
    `/academics/subjects/${id}/`,
  );
  return data;
};

export const createSubject = async (subjectData) => {
  const { data } = await api.post(
    "/academics/subjects/",
    subjectData,
  );
  return data;
};

export const updateSubject = async (id, subjectData) => {
  const { data } = await api.patch(
    `/academics/subjects/${id}/`,
    subjectData,
  );
  return data;
};

export const deleteSubject = async (id) => {
  const { data } = await api.delete(
    `/academics/subjects/${id}/`,
  );
  return data;
};

// =====================================================
// CLASS SUBJECTS
// =====================================================

export const getClassSubjects = async () => {
  const { data } = await api.get(
    "/academics/class-subjects/",
  );
  return data;
};

export const getClassSubject = async (id) => {
  const { data } = await api.get(
    `/academics/class-subjects/${id}/`,
  );
  return data;
};

export const createClassSubject = async (classSubjectData) => {
  const { data } = await api.post(
    "/academics/class-subjects/",
    classSubjectData,
  );
  return data;
};

export const updateClassSubject = async (
  id,
  classSubjectData,
) => {
  const { data } = await api.patch(
    `/academics/class-subjects/${id}/`,
    classSubjectData,
  );
  return data;
};

export const deleteClassSubject = async (id) => {
  const { data } = await api.delete(
    `/academics/class-subjects/${id}/`,
  );
  return data;
};

// // =====================================================
// // ACADEMIC SECTIONS
// // =====================================================

// export const getAcademicSections = async () => {
//   const { data } = await api.get(
//     "/academics/sections/",
//   );
//   return data;
// };

// export const getAcademicSection = async (id) => {
//   const { data } = await api.get(
//     `/academics/sections/${id}/`,
//   );
//   return data;
// };

// export const createAcademicSection = async (sectionData) => {
//   const { data } = await api.post(
//     "/academics/sections/",
//     sectionData,
//   );
//   return data;
// };

// export const updateAcademicSection = async (
//   id,
//   sectionData,
// ) => {
//   const { data } = await api.patch(
//     `/academics/sections/${id}/`,
//     sectionData,
//   );
//   return data;
// };

// export const deleteAcademicSection = async (id) => {
//   const { data } = await api.delete(
//     `/academics/sections/${id}/`,
//   );
//   return data;
// };


// =====================================================
// ACADEMIC SECTIONS
// =====================================================

export const getAcademicSections = async () => {
  const { data } = await api.get(
    "/academics/academic-sections/",
  );
  return data;
};

export const getAcademicSection = async (id) => {
  const { data } = await api.get(
    `/academics/academic-sections/${id}/`,
  );
  return data;
};

export const createAcademicSection = async (sectionData) => {
  const { data } = await api.post(
    "/academics/academic-sections/",
    sectionData,
  );
  return data;
};

export const updateAcademicSection = async (
  id,
  sectionData,
) => {
  const { data } = await api.patch(
    `/academics/academic-sections/${id}/`,
    sectionData,
  );
  return data;
};

export const deleteAcademicSection = async (id) => {
  const { data } = await api.delete(
    `/academics/academic-sections/${id}/`,
  );
  return data;
};