import { apiAuth } from "../../../services/api";

// Lấy tất cả admin (có phân trang)
export const getAllAdminsApi = async (perPage: number = 10) => {
  const res = await apiAuth.get(`/admin/employers`, {
    params: { per_page: perPage },
    withCredentials: true,
  });
  return res.data.data;
};

// Lấy chi tiết admin theo ID
export const getAdminByIdApi = async (id: number) => {
  const res = await apiAuth.get(`/admin/employers/${id}`, {
    withCredentials: true,
  });
  return res.data.data;
};



// Cập nhật trạng thái (kích hoạt / vô hiệu hóa) admin
export const toggleAdminActiveApi = async (id: number) => {
  const res = await apiAuth.put(`/admin/employers/${id}/active`, {}, {
    withCredentials: true,
  });
  return res.data;
};