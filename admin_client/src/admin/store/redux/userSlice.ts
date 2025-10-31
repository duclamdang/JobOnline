import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  // Root admin
  getAllUsersApi,
  getUserByIdApi,
  createUserApi,
  updateUserByIdApi,
  updateUserAvatarByIdApi,
} from "../services/userService";
import { AxiosError } from "axios";

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  password?: string;
  birthday: string | null;
  address: string | null;
  gender: string | null; 
  avatar: string | null;
  bank_info: string | null;
  job_search_status: number; 
  job_search_status_text?: string; 
  desired_position: string | null;
  work_field_id: number | null;
  province_id: number | null;
  working_form_id: number | null;
  work_experience_id: number | null;
  position_id: number | null;
  education_id: number | null;
  work_field_title?: string | null;
  province_title?: string | null;
  working_form_title?: string | null;
  work_experience_title?: string | null;
  position_title?: string | null;
  education_title?: string | null;
  min_salary: number | null;
  max_salary: number | null;
  is_active: boolean;
  is_verify: boolean;
  verified_by: number | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}


interface UserPagination {
  data: User[];
  total?: number;
  current_page?: number;
  last_page?: number;
}

interface UserState {
  user: User | null;
  users: User[] | UserPagination;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  users: [],
  loading: false,
  error: null,
};

export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (perPage: number = 10, { rejectWithValue }) => {
    try {
      return await getAllUsersApi(perPage);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Không thể lấy danh sách người dùng"
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getUserByIdApi(id);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Không thể lấy thông tin người dùng"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createUserApi(data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi khi tạo người dùng mới"
      );
    }
  }
);

export const updateUserById = createAsyncThunk(
  "user/updateUserById",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      return await updateUserByIdApi(id, data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi cập nhật thông tin người dùng"
      );
    }
  }
);

export const updateUserAvatarById = createAsyncThunk(
  "user/updateUserAvatarById",
  async ({ id, file }: { id: number; file: File }, { rejectWithValue }) => {
    try {
      return await updateUserAvatarByIdApi(id, file);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message ||
          "Lỗi cập nhật ảnh đại diện người dùng"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.users = Array.isArray(payload) ? payload : payload?.data || [];
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
  },
});

export default userSlice.reducer;
