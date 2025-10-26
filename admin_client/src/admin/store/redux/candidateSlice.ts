import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchCandidatesApi } from "../services/candidateServices";

export interface Candidate {
  id: number;
  applied_at: string;
  status: number;
  user: {
    id?: number;
    avatar: string;
    name: string;
    email: string;
  };
  job: {
    id?: number;
    title: string;
    company_id?: number;
  };
}

interface Meta {
  current_page: number;
  last_page: number;
  total: number;
}

interface CandidateResponse {
  data: Candidate[];
  meta: Meta;
}

interface CandidateState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  meta: Meta | null;
}

const initialState: CandidateState = {
  candidates: [],
  loading: false,
  error: null,
  meta: null,
};

export const fetchCandidates = createAsyncThunk<
  CandidateResponse,
  { page: number; perPage: number; jobId?: number },
  { rejectValue: string }
>("candidates/fetchCandidates", async ({ page, perPage, jobId }, { rejectWithValue }) => {
  try {
    const res = await fetchCandidatesApi(page, perPage, jobId);

    const normalizedData: Candidate[] = (res.data ?? []).map((c: any) => ({
      id: c.id ?? c.cv_id ?? Math.random(),
      applied_at: c.applied_at ?? c.created_at,
      status: c.status,
      user: {
        avatar: c.user?.avatar ?? c.avatar ?? "users/default.png",
        name: c.user?.name ?? c.name ?? "Người dùng",
        email: c.user?.email ?? c.email ?? "noemail@example.com",
      },
      job: {
        id: c.job?.id ?? jobId,
        title: c.job?.title,
        company_id: c.job?.company_id,
      },
    }));

    return { data: normalizedData, meta: res.meta };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Lỗi tải danh sách ứng viên"
    );
  }
});

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    setCandidates: (state, action: PayloadAction<Candidate[]>) => {
      state.candidates = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action: PayloadAction<CandidateResponse>) => {
        state.loading = false;
        state.candidates = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      });
  },
});

export const { setCandidates } = candidateSlice.actions;
export default candidateSlice.reducer;
