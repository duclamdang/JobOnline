import { apiAuth } from "../../../services/api";

export const fetchCandidateDetailApi = async (id: number) => {
  const res = await apiAuth.get(`/admin/job/applications/${id}/candidate`, {
    withCredentials: true,
  });
  return res.data
};
