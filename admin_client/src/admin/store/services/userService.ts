import { apiAuth } from "../../../services/api";

// ====================
// Helper Function
// ====================

const uploadFormData = async (url: string, data: FormData) => {
  const res = await apiAuth.post(url, data, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// ====================
// ROOT ADMIN (quản trị hệ thống)
// ====================

export const getAllUsersApi = async (perPage: number = 10) => {
  const res = await apiAuth.get(`/admin/users`, {
    params: { per_page: perPage },
    withCredentials: true,
  });
  return res.data.data;
};

export const getUserByIdApi = async (id: number) => {
  const res = await apiAuth.get(`/admin/users/${id}`, {
    withCredentials: true,
  });
  return res.data.data;
};

export const createUserApi = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: string;
}) => {
  const res = await apiAuth.post(`/admin/users`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

export const updateUserByIdApi = async (id: number, data: any) => {
  const res = await apiAuth.put(`/admin/users/${id}`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

export const updateUserAvatarByIdApi = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return uploadFormData(`/admin/users/${id}/avatar`, formData);
};

export const changeUserPasswordByIdApi = async (id: number, data: {
  new_password: string;
  confirm_password: string;
}) => {
  const res = await apiAuth.put(`/admin/users/${id}/password`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

export const deleteUserByIdApi = async (id: number) => {
  const res = await apiAuth.delete(`/admin/users/${id}`, {
    withCredentials: true,
  });
  return res.data.data;
};
