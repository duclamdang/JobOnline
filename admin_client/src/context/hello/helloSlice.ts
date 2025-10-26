import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@services/api";
import { AxiosError } from "axios";

interface HelloState {
  message: string;
  loading: boolean;
  error: string | null;
}

const initialState: HelloState = {
  message: "",
  loading: false,
  error: null,
};

export const fetchHello = createAsyncThunk(
  "fetch/hello",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/hello");
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const helloSlice = createSlice({
  name: "hello",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHello.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHello.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(fetchHello.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default helloSlice.reducer;
