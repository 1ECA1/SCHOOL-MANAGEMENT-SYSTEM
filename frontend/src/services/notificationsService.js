import api from "./api";

// =====================================================
// NOTIFICATIONS
// =====================================================

export const getNotifications = async () => {
  const response = await api.get("/notifications/");
  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await api.get("/notifications/unread/");
  return response.data;
};

export const getNotification = async (id) => {
  const response = await api.get(
    `/notifications/${id}/`,
  );

  return response.data;
};

export const updateNotification = async (
  id,
  data,
) => {
  const response = await api.patch(
    `/notifications/${id}/`,
    data,
  );

  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(
    `/notifications/${id}/`,
  );

  return response.data;
};

export const sendNotification = async (data) => {
  const response = await api.post(
    "/notifications/send/",
    data,
  );

  return response.data;
};

export const getSentNotifications = async () => {
  const response = await api.get(
    "/notifications/sent/",
  );

  return response.data;
};