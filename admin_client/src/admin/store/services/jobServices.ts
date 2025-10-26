import { apiAuth } from "../../../services/api";
import { UpdateJobPayload, CreateJobPayload } from "../redux/jobSlice";

// Lấy danh sách Job
export const fetchJobsApi = async (page = 1, perPage = 10) => {
  const res = await apiAuth.get(
    `/admin/job?page=${page}&per_page=${perPage}`,
    { withCredentials: true }
  );
  console.log("FetchJobs Response:", res.data);

  return res.data;
};

// Update Job
export const updateJobApi = async (id: number, data: UpdateJobPayload) => {
  const res = await apiAuth.put(`/admin/job/${id}`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

export const toggleJobStatusApi = async (
  id: number,
  currentStatus: boolean
) => {
  const res = await apiAuth.put(
    `/admin/job/${id}`,
    { is_active: !currentStatus },
    { withCredentials: true }
  );
  console.log("Toggle Response:", res.data.data);

  return res.data.data;
};
// Create Job
export const createJobApi = async (data: CreateJobPayload) => {
  const payload = {
    ...data,
    salary_negotiable: data.salary_negotiable ? true : false,
    salary_from: data.salary_negotiable ? null : data.salary_from,
    salary_to: data.salary_negotiable ? null : data.salary_to,
  };

  const res = await apiAuth.post("/admin/job", payload, {
    withCredentials: true,
  });
  return res.data.data;
};

// Chi tiết Job
export const getJobByIdApi = async (id: number) => {
  const res = await apiAuth.get(`/admin/job/${id}`, { withCredentials: true });
  return res.data.data;
};
