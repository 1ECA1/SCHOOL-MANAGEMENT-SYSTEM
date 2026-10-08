import api from "./api";

export const getPrincipals = async () => {
  const { data } = await api.get("/principals/");
  return data;
};

export const getPrincipal = async (id) => {
  const { data } = await api.get(`/principals/${id}/`);
  return data;
};