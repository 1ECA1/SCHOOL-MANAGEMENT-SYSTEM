import api from "./api";

// =====================================================
// EXAMINATIONS
// =====================================================

export const getExaminations = async () => {
  const { data } = await api.get("/examinations/");
  return data;
};

export const getExamination = async (id) => {
  const { data } = await api.get(`/examinations/${id}/`);
  return data;
};

export const createExamination = async (examinationData) => {
  const { data } = await api.post(
    "/examinations/",
    examinationData
  );
  return data;
};

export const updateExamination = async (id, examinationData) => {
  const { data } = await api.put(
    `/examinations/${id}/`,
    examinationData
  );
  return data;
};

export const deleteExamination = async (id) => {
  const { data } = await api.delete(
    `/examinations/${id}/`
  );
  return data;
};


// =====================================================
// EXAMINATION SUBJECTS
// =====================================================

export const getExaminationSubjects = async () => {
  const { data } = await api.get(
    "/examinations/subjects/"
  );
  return data;
};

export const getExaminationSubject = async (id) => {
  const { data } = await api.get(
    `/examinations/subjects/${id}/`
  );
  return data;
};

export const createExaminationSubject = async (
  subjectData
) => {
  const { data } = await api.post(
    "/examinations/subjects/",
    subjectData
  );
  return data;
};

export const updateExaminationSubject = async (
  id,
  subjectData
) => {
  const { data } = await api.put(
    `/examinations/subjects/${id}/`,
    subjectData
  );
  return data;
};

export const deleteExaminationSubject = async (id) => {
  const { data } = await api.delete(
    `/examinations/subjects/${id}/`
  );
  return data;
};