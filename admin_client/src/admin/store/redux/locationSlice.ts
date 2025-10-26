import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProvincesApi } from "../services/locationService";
import { AxiosError } from "axios";

export interface Province {
  id: number;
  name: string;
  gso_id: string;
}

interface LocationState {
  provinces: Province[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  provinces: [],
  loading: false,
  error: null,
};

export const fetchProvinces = createAsyncThunk(
  "location/fetchProvinces",
  async (_, { rejectWithValue }) => {
    try {
      return await getProvincesApi();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Không thể lấy danh sách tỉnh/thành"
      );
    }
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProvinces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.loading = false;
        state.provinces = action.payload;
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default locationSlice.reducer;
