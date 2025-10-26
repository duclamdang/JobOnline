import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchJobsApi,
  updateJobApi,
  toggleJobStatusApi,
  createJobApi,
  getJobByIdApi,
} from "../services/jobServices";
import { AxiosError } from "axios";

export interface Job {
  id: number;
  company_id: number | null;
  title: string;
  create_by: number;
  description: string | null;
  quantity: number;
  salary_from: number | null;
  salary_to: number | null;
  province_id: number | null;
  working_form_id: number | null;
  work_field_id: string | number[];
  work_experience_id: number | null;
  education_id: number | null;
  position_id: number | null;
  requirements: string | null;
  end_date: string;
  is_fulltime: boolean;
  slug: string;
  skills: string | null;
  is_active: boolean;
  is_urgent: boolean;
  gender: number;
  benefit: string | null;
  created_at: string;
  updated_at: string;
  company_name?: string | null;
  company_logo?: string | null;
  salary_range?: string;
  location?: string | null;
  ward_id?: number | null;
  address?: string | null;
  salary_negotiable?: boolean;
  district_id?: number | null;
}

export interface UpdateJobPayload {
  title?: string;
  description?: string | null;
  quantity?: number;
  salary_from?: number | null;
  salary_to?: number | null;
  province_id?: number | null;
  working_form_id?: number | null;
  work_field_id?: number[];
  work_experience_id?: number | null;
  education_id?: number | null;
  position_id?: number | null;
  requirements?: string | null;
  end_date?: string;
  is_fulltime?: boolean;
  skills?: string | null;
  is_active?: boolean;
  is_urgent?: boolean;
  gender?: number;
  benefit?: string | null;
  ward_id?: number | null;
  address?: string | null;
  salary_negotiable?: boolean;
  district_id?: number | null;
}

export interface CreateJobPayload extends UpdateJobPayload {
  company_id: number;
  create_by: number;
}

interface JobState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
  selectedJob: Job | null;
}

const initialState: JobState = {
  jobs: [],
  loading: false,
  error: null,
  meta: null,
  selectedJob: null,
};

export const fetchJobs = createAsyncThunk(
  "job/fetchJobs",
  async (
    { page = 1, perPage = 10 }: { page?: number; perPage?: number },
    { rejectWithValue }
  ) => {
    try {
      return await fetchJobsApi(page, perPage);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi khi tải danh sách công việc"
      );
    }
  }
);

export const updateJob = createAsyncThunk(
  "job/updateJob",
  async (
    { id, data }: { id: number; data: UpdateJobPayload },
    { rejectWithValue }
  ) => {
    try {
      return await updateJobApi(id, data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi khi cập nhật công việc"
      );
    }
  }
);

export const toggleJobStatus = createAsyncThunk(
  "job/toggleJobStatus",
  async (
    { id, currentStatus }: { id: number; currentStatus: boolean },
    { rejectWithValue }
  ) => {
    try {
      return await toggleJobStatusApi(id, currentStatus);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi khi đổi trạng thái công việc"
      );
    }
  }
);

export const createJob = createAsyncThunk(
  "job/createJob",
  async (data: CreateJobPayload, { rejectWithValue }) => {
    try {
      // Ép kiểu salary_negotiable luôn là boolean
      const payload = {
        ...data,
        salary_negotiable: data.salary_negotiable ? true : false,
        salary_from: data.salary_negotiable ? null : data.salary_from,
        salary_to: data.salary_negotiable ? null : data.salary_to,
      };

      return await createJobApi(payload);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi khi tạo công việc"
      );
    }
  }
);
export const getJobById = createAsyncThunk(
  "job/getJobById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getJobByIdApi(id);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi khi tải chi tiết công việc"
      );
    }
  }
);

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const updated = action.payload;
        state.jobs = state.jobs.map((j) =>
          j.id === updated.id ? { ...j, ...updated } : j
        );
        if (state.selectedJob?.id === updated.id) {
          state.selectedJob = { ...state.selectedJob, ...updated };
        }
      })
      .addCase(toggleJobStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        state.jobs = state.jobs.map((j) => (j.id === updated.id ? updated : j));
        if (state.selectedJob?.id === updated.id) {
          state.selectedJob = { ...state.selectedJob, ...updated };
        }
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      })
      .addCase(getJobById.fulfilled, (state, action) => {
        state.selectedJob = action.payload;
      });
  },
});

export default jobSlice.reducer;
