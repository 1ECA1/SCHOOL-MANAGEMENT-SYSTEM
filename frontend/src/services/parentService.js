import api from "./api";

// =====================================================
// PARENT PROFILE
// =====================================================

export const getParent = async (id) => {
  const { data } = await api.get(
    `/students/parents/${id}/`
  );

  return data;
};

export const updateParent = async (id, payload) => {
  const { data } = await api.put(
    `/students/parents/${id}/`,
    payload
  );

  return data;
};

export const partialUpdateParent = async (id, payload) => {
  const { data } = await api.patch(
    `/students/parents/${id}/`,
    payload
  );

  return data;
};

// =====================================================
// PARENT CHILDREN
// =====================================================

export const getParentChildren = async (parentId) => {
  const { data } = await api.get(
    `/students/parents/${parentId}/`
  );

  return data.students || [];
};