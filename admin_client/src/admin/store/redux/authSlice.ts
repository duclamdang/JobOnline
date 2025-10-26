import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAdminApi, logoutAdminApi, refreshTokenApi } from "../services/authServices";
import { AxiosError } from "axios";

interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string | null;
  company_id: number | null;
  role_id: number;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: any;
  admin: Admin | null;
  accessToken: string | null;
  expiresIn: number | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  admin: null,
  accessToken: null,
  expiresIn: null,
  loading: false,
  error: null,
  initialized: false,
  user: undefined
};

export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await loginAdminApi(email, password);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error_messages?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.error_messages || "Đăng nhập thất bại"
      );
    }
  }
);

export const logoutAdmin = createAsyncThunk("auth/logoutAdmin", async () => {
  return await logoutAdminApi();
});

export const refreshAdmin = createAsyncThunk(
  "auth/refreshAdmin",
  async (_, { rejectWithValue }) => {
    try {
      return await refreshTokenApi();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Không thể làm mới phiên đăng nhập"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access_token;
        state.expiresIn = action.payload.expires_in;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.accessToken = null;
        state.expiresIn = null;
        state.initialized = true;
      })

      .addCase(refreshAdmin.fulfilled, (state, action) => {
        state.admin = action.payload.admin;
        state.accessToken = action.payload.access_token;
        state.expiresIn = action.payload.expires_in;
        state.error = null;
        state.initialized = true;
      })
      .addCase(refreshAdmin.rejected, (state) => {
        state.admin = null;
        state.accessToken = null;
        state.expiresIn = null;
        state.error = null;
        state.initialized = true;
      });
  },
});

export default authSlice.reducer;
