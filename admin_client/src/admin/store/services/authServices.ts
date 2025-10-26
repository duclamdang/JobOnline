import { apiAuth } from "../../../services/api";

export const loginAdminApi = async (email: string, password: string) => {
  const res = await apiAuth.post(
    "/admin/login",
    { email, password },
    { withCredentials: true }
  );
  return res.data.data;
};

export const logoutAdminApi = async () => {
  const res = await apiAuth.post("/admin/logout", {}, { withCredentials: true });
  return res.data;
};

export const refreshTokenApi = async () => {
  const res = await apiAuth.post("/admin/refresh", {}, { withCredentials: true });
  return res.data.data;
};

export const getProfileApi = async () => {
  const res = await apiAuth.get("/admin/profile", { withCredentials: true });
  return res.data.data.admin;
};
export const updateProfileApi = async (data: {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}) => {
  const res = await apiAuth.post("/admin/profile", data, {
    withCredentials: true,
  });
  return res.data.admin;
};

// Change password
export const changePasswordApi = async (data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) => {
  const res = await apiAuth.put("/admin/profile/change-password", data, {
    withCredentials: true,
  });
  return res.data;
};

export type RegisterAdminPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  tax_code: string;
  company_name: string;
  location_id?: number | null;
  industry_id?: number | null;
};

export const registerAdminApi = async (payload: RegisterAdminPayload) => {
  const res = await apiAuth.post("/admin/register", payload, {
    withCredentials: true,
  });
  return res.data;
};
