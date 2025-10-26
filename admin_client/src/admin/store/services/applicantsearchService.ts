import { apiAuth } from "../../../services/api";

export const getCandidatesApi = async () => {
  const res = await apiAuth.get("/admin/users/list", { withCredentials: true });
  return res.data.data;
};

export const buyCandidateContactApi = async (id: number) => {
  const res = await apiAuth.post(`/admin/users/${id}/buy-contact`, null, {
    withCredentials: true,
  });
  return res.data;
};

export const getUserPointsApi = async () => {
  const res = await apiAuth.get("/admin/users/points", { withCredentials: true });
  return res.data; 
};

