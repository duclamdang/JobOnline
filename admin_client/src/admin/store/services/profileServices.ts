import { apiAuth } from "../../../services/api";
import { AdminProfile } from "../redux/profileSlice";

export const getProfileApi = async (): Promise<AdminProfile> => {
  const res = await apiAuth.get("/admin/profile", { withCredentials: true });
  return res.data.data.admin; 
};

export const updateProfileApi = async (
  data: { name?: string; phone?: string; address?: string; avatar?: File | string } | FormData
) => {
  let formDataToSend: FormData;

  if (data instanceof FormData) {
    formDataToSend = data;
  } else {
    formDataToSend = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataToSend.append(key, value);
      }
    });
  }

  const res = await apiAuth.post("/admin/profile", formDataToSend, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};



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
