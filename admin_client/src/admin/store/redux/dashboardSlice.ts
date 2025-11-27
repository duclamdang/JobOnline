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
  new_jobs_month: number;
  new_jobs_week: number;
  total_jobs: number;
  new_jobs: number;
  new_applicants: number;
  new_companies: number;
}

interface PaymentSummary {
  total_amount: number;
  total_points: number;
  total_orders: number;
  successful_orders: number;
  last_payment_at: string | null;
}

type DashboardResponse = {
  jobsData: ChartData;
  applicantsData: ChartData;
  topCompanies: Company[];
  generalStats: GeneralStats;
  revenuePerMonthData: ChartData;
  pointPerMonthData: ChartData;
  paymentSummary: PaymentSummary;
};

type EmployerDashboardResponse = {
  applicantsData: ChartData;
  generalStats: GeneralStats;
  jobByStatusData: ChartData;
  revenuePerMonthData: ChartData;
  pointPerMonthData: ChartData;
  paymentSummary: PaymentSummary;
};

interface DashboardState {
  jobsData: ChartData;
  applicantsData: ChartData;
  topCompanies: Company[];
  generalStats: GeneralStats;
  jobByStatusData: ChartData;
  revenuePerMonthData: ChartData;
  pointPerMonthData: ChartData;
  paymentSummary: PaymentSummary;
  loading: boolean;
  error: string | null;
}

const emptyChart: ChartData = { labels: [], datasets: [] };

const initialState: DashboardState = {
  jobsData: emptyChart,
  applicantsData: emptyChart,
  topCompanies: [],
  generalStats: {
    total_jobs: 0,
    new_jobs: 0,
    new_applicants: 0,
    new_companies: 0,
    new_jobs_week: 0,
    new_jobs_month: 0,
  },

  jobByStatusData: emptyChart,
  revenuePerMonthData: emptyChart,
  pointPerMonthData: emptyChart,
  paymentSummary: {
    total_amount: 0,
    total_points: 0,
    total_orders: 0,
    successful_orders: 0,
    last_payment_at: null,
  },

  loading: false,
  error: null,
};

// -------- ROOT DASHBOARD ----------
export const fetchDashboardData = createAsyncThunk<
  DashboardResponse,
  void,
  { rejectValue: string }
>("dashboard/fetchDashboardData", async (_, { rejectWithValue }) => {
  try {
    const data = await dashboardService.fetchRootDashboardData();
    return data as DashboardResponse;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Fetch dashboard failed"
    );
  }
});

// -------- EMPLOYER DASHBOARD ----------
export const fetchEmployerDashboardData = createAsyncThunk<
  EmployerDashboardResponse,
  void,
  { rejectValue: string }
>("dashboard/fetchEmployerDashboardData", async (_, { rejectWithValue }) => {
  try {
    const data = await dashboardService.fetchEmployerDashboardData();
    return data as unknown as EmployerDashboardResponse;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Fetch employer dashboard failed"
    );
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
        state.revenuePerMonthData = action.payload.revenuePerMonthData;
        state.pointPerMonthData = action.payload.pointPerMonthData;
        state.paymentSummary = action.payload.paymentSummary;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Fetch dashboard failed";
      });

    builder
      .addCase(fetchEmployerDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployerDashboardData.fulfilled, (state, action) => {
        state.loading = false;

        state.applicantsData = action.payload.applicantsData;
        state.generalStats = action.payload.generalStats;
        state.jobByStatusData = action.payload.jobByStatusData;
        state.revenuePerMonthData = action.payload.revenuePerMonthData;
        state.pointPerMonthData = action.payload.pointPerMonthData;
        state.paymentSummary = action.payload.paymentSummary;
      })
      .addCase(fetchEmployerDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "Fetch employer dashboard failed";
      });
  },
});

export default dashboardSlice.reducer;
