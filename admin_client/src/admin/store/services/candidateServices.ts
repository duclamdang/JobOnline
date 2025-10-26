import { apiAuth } from "../../../services/api";
import { Candidate } from "../auth/candidateSlice";


export const fetchCandidatesApi = async (page: number, perPage: number, jobId?: number) => {
  const url = jobId
    ? `/admin/job/${jobId}/applicants`
    : "/admin/job/applications";

  const res = await apiAuth.get(url, {
    params: { page, per_page: perPage },
    withCredentials: true,
  });

  return res.data;
};

export const updateCandidateStatusApi = async (
  id: number,
  status: number
) => {
  const res = await apiAuth.put(
    `/admin/job/applications/${id}/status`,
    { status },
    { withCredentials: true }
  );
  return res.data.data as Candidate;
};
