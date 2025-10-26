import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getIndustriesApi } from "../services/industryService";
import { AxiosError } from "axios";

export interface Industry {
  id: number;
  title: string;
  description: string;
}

interface IndustryState {
  industries: Industry[];
  loading: boolean;
  error: string | null;
}

const initialState: IndustryState = {
  industries: [],
  loading: false,
  error: null,
};

export const fetchIndustries = createAsyncThunk(
  "industry/fetchIndustries",
  async (_, { rejectWithValue }) => {
    try {
      return await getIndustriesApi();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Không thể lấy danh sách lĩnh vực"
      );
    }
  }
);

const industrySlice = createSlice({
  name: "industry",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndustries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndustries.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = action.payload;
      })
      .addCase(fetchIndustries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default industrySlice.reducer;
