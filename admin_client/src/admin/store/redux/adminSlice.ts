import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllAdminsApi,
  getAdminByIdApi,
  toggleAdminActiveApi,
} from "../services/adminService";

// -------------------- INTERFACES --------------------

export interface Admin {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company_name?: string | null;
  role_name?: string | null;
  is_active: boolean;
  created_at: string;
}

interface AdminListResponse {
  status_code: number;
  message: string;
  data: Admin[];
}

interface AdminState {
  admins: Admin[];              // Danh sách admin
  adminDetail: Admin | null;    // Chi tiết 1 admin
  loading: boolean;             // Trạng thái tải dữ liệu
  error: string | null;         // Lỗi (nếu có)
}

// -------------------- INITIAL STATE --------------------

const initialState: AdminState = {
  admins: [],
  adminDetail: null,
  loading: false,
  error: null,
};

// -------------------- ASYNC ACTIONS --------------------

export const fetchAllAdmins = createAsyncThunk<Admin[], number>(
  "admin/fetchAll",
  async (perPage: number = 20) => {
    const response: AdminListResponse = await getAllAdminsApi(perPage);
    // Nếu API trả về object { data: [...] } thì lấy ra data
    return response.data;
  }
);

export const fetchAdminById = createAsyncThunk<Admin, number>(
  "admin/fetchById",
  async (id: number) => {
    const data: Admin = await getAdminByIdApi(id);
    return data;
  }
);

export const toggleAdminActive = createAsyncThunk<any, number>(
  "admin/toggleActive",
  async (id: number) => {
    const res = await toggleAdminActiveApi(id);
    return res; 
  }
);


// -------------------- SLICE --------------------

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAllAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi tải danh sách admin";
      })

      .addCase(fetchAdminById.fulfilled, (state, action) => {
        state.adminDetail = action.payload;
      })

      .addCase(toggleAdminActive.fulfilled, (state, action) => {
        const id = action.meta.arg; 
        state.admins = state.admins.map((a) =>
          a.id === id ? { ...a, is_active: !a.is_active } : a
        );
      });
  },
});

export default adminSlice.reducer;
