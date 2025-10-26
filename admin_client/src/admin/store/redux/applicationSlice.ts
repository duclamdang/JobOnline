import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchCandidateDetailApi } from "../services/applicationService";

export interface CandidateDetail {
  id: number;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  address?: string;
  birthday?: string;
  gender?: string;
  bank_info?: string;
  job_search_status?: number;
  job_search_status_text?: string;
  desired_position?: string;
  salary_range?: string;
  work_field?: string;
  province?: string;
  working_form?: string;
  work_experience?: string;
  position?: string;
  education?: string;
  status?: number | null;
  applied_at?: string | null;
  cv_file?: string | null; 
}

// State của slice
interface ApplicationState {
  candidateDetail: CandidateDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationState = {
  candidateDetail: null,
  loading: false,
  error: null,
};

export const fetchCandidateDetail = createAsyncThunk<
  CandidateDetail,
  number,
  { rejectValue: string }
>("applications/fetchCandidateDetail", async (id, { rejectWithValue }) => {
  try {
    const data = await fetchCandidateDetailApi(id);
    return data.data as CandidateDetail;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Lỗi tải dữ liệu");
  }
});

const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidateDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.candidateDetail = action.payload;
      })
      .addCase(fetchCandidateDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Lỗi không xác định";
      });
  },
});

export default applicationSlice.reducer;
