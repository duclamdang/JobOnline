import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getCandidatesApi,
  buyCandidateContactApi,
  getUserPointsApi,
} from "../services/applicantsearchService";

export interface Candidate {
  id: number;
  name: string;
  birthday?: string | null;
  address?: string | null;
  gender?: string | null;
  avatar?: string | null;
  phone?: string | null;
  email?: string | null;
  bank_info?: string | null;
  desired_position?: string | null;
  min_salary?: number | null;
  max_salary?: number | null;
  working_form_id?: number | null;
  working_form_title?: string | null;
  work_experience_id?: number | null;
  work_experience_title?: string | null;
  position_id?: number | null;
  position_title?: string | null;
  education_id?: number | null;
  education_title?: string | null;
  work_field_id?: number | null;
  work_field_title?: string | null;
  province_id?: number | null;
  province_title?: string | null;
  is_verify?: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
  job_search_status?: number | null;
  job_search_status_text?: string | null;
}

interface ApplicantSearchState {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  loading: boolean;
  userPoints: number;
}

const initialState: ApplicantSearchState = {
  candidates: [],
  selectedCandidate: null,
  loading: false,
  userPoints: 0,
};

// Async Thunks
export const fetchCandidates = createAsyncThunk(
  "applicantSearch/fetchCandidates",
  async () => {
    const [candidatesData, pointsData] = await Promise.all([
      getCandidatesApi(),
      getUserPointsApi(),
    ]);
    return { candidatesData, pointsData };
  }
);

export const buyCandidateContact = createAsyncThunk(
  "applicantSearch/buyCandidateContact",
  async (candidateId: number) => {
    const res = await buyCandidateContactApi(candidateId);
    return { candidateId, ...res };
  }
);


const applicantSearchSlice = createSlice({
  name: "applicantSearch",
  initialState,
  reducers: {
    selectCandidate(state, action: PayloadAction<Candidate>) {
      state.selectedCandidate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.candidates = action.payload.candidatesData;
        state.userPoints = action.payload.pointsData.remainingPoints ?? 0;
        state.selectedCandidate =
          action.payload.candidatesData.length > 0
            ? action.payload.candidatesData[0]
            : null;
        state.loading = false;
      })
      .addCase(fetchCandidates.rejected, (state) => {
        state.loading = false;
      })
      .addCase(buyCandidateContact.fulfilled, (state, action) => {
        if (action.payload.success && state.selectedCandidate) {
          const updatedCandidate = {
            ...state.selectedCandidate,
            ...action.payload.contact,
          };
          state.selectedCandidate = updatedCandidate;
          state.candidates = state.candidates.map((c) =>
            c.id === action.payload.candidateId ? updatedCandidate : c
          );
          state.userPoints = action.payload.remainingPoints ?? state.userPoints;
        }
      });
  },
});

export const { selectCandidate } = applicantSearchSlice.actions;

export default applicantSearchSlice.reducer;
