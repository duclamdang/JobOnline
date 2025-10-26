import { apiAuth } from "../../../services/api";

const uploadFormData = async (url: string, data: FormData) => {
  const res = await apiAuth.post(url, data, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// ====================
// ADMIN NHÀ TUYỂN DỤNG
// ====================

// Lấy tất cả admin (có phân trang)
export const getAllAdminsApi = async (perPage: number = 10) => {
  const res = await apiAuth.get(`/admin/admins`, {
    params: { per_page: perPage },
    withCredentials: true,
  });
  return res.data.data;
};

// Lấy chi tiết admin theo ID
export const getAdminByIdApi = async (id: number) => {
  const res = await apiAuth.get(`/admin/admins/${id}`, {
    withCredentials: true,
  });
  return res.data.data;
};

// Tạo mới admin (dành cho admin root)
export const createAdminApi = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  company_id?: number;
  role_id?: number;
}) => {
  const res = await apiAuth.post(`/admin/admins`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

// Cập nhật thông tin admin
export const updateAdminByIdApi = async (id: number, data: any) => {
  const res = await apiAuth.put(`/admin/admins/${id}`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

// Cập nhật avatar admin
export const updateAdminAvatarByIdApi = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return uploadFormData(`/admin/admins/${id}/avatar`, formData);
};

// Đổi mật khẩu admin
export const changeAdminPasswordByIdApi = async (
  id: number,
  data: { new_password: string; confirm_password: string }
) => {
  const res = await apiAuth.put(`/admin/admins/${id}/password`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

// Xóa admin
export const deleteAdminByIdApi = async (id: number) => {
  const res = await apiAuth.delete(`/admin/admins/${id}`, {
    withCredentials: true,
  });
  return res.data.data;
};
