import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService } from "../services/dashboardService";

interface Company {
  id: number;
  name: string;
  jobs_count: number;
  applicants_count: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  tension?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface GeneralStats {
  total_jobs: number;
  new_jobs: number;
  new_applicants: number;
  new_companies: number;
}

interface DashboardState {
  jobsData: ChartData;
  applicantsData: ChartData;
  topCompanies: Company[];
  generalStats: GeneralStats;
  loading: boolean;
  error: string | null;
}

type DashboardResponse = {
  jobsData: ChartData;
  applicantsData: ChartData;
  topCompanies: Company[];
  generalStats: GeneralStats;
};

const initialState: DashboardState = {
  jobsData: { labels: [], datasets: [] },
  applicantsData: { labels: [], datasets: [] },
  topCompanies: [],
  generalStats: { total_jobs: 0, new_jobs: 0, new_applicants: 0, new_companies: 0 },
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk<
  DashboardResponse,
  void,
  { rejectValue: string }
>("dashboard/fetchDashboardData", async (_, { rejectWithValue }) => {
  try {
    const data = await dashboardService.fetchDashboardData();
    return data as DashboardResponse;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Fetch dashboard failed");
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.jobsData = action.payload.jobsData;
        state.applicantsData = action.payload.applicantsData;
        state.topCompanies = action.payload.topCompanies;
        state.generalStats = action.payload.generalStats;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Fetch dashboard failed";
      });
  },
});

export default dashboardSlice.reducer;
