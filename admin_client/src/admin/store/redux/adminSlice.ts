import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllAdminsApi,
  getAdminByIdApi,
  createAdminApi,
  updateAdminByIdApi,
  deleteAdminByIdApi,
} from "../services/adminService";

export const fetchAllAdmins = createAsyncThunk(
  "admin/fetchAll",
  async (perPage: number = 20) => {
    const data = await getAllAdminsApi(perPage);
    return data;
  }
);

export const fetchAdminById = createAsyncThunk(
  "admin/fetchById",
  async (id: number) => {
    const data = await getAdminByIdApi(id);
    return data;
  }
);

export const createAdmin = createAsyncThunk(
  "admin/create",
  async (formData: any) => {
    const data = await createAdminApi(formData);
    return data;
  }
);

export const updateAdmin = createAsyncThunk(
  "admin/update",
  async ({ id, formData }: { id: number; formData: any }) => {
    const data = await updateAdminByIdApi(id, formData);
    return data;
  }
);

export const deleteAdmin = createAsyncThunk(
  "admin/delete",
  async (id: number) => {
    const data = await deleteAdminByIdApi(id);
    return data;
  }
);

interface AdminState {
  admins: any[];
  adminDetail: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admins: [],
  adminDetail: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== LẤY DANH SÁCH =====
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

      // ===== LẤY CHI TIẾT =====
      .addCase(fetchAdminById.fulfilled, (state, action) => {
        state.adminDetail = action.payload;
      })

      // ===== TẠO MỚI =====
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.admins.push(action.payload);
      })

      // ===== CẬP NHẬT =====
      .addCase(updateAdmin.fulfilled, (state, action) => {
        const index = state.admins.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) state.admins[index] = action.payload;
      })

      // ===== XOÁ =====
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.admins = state.admins.filter((a) => a.id !== action.payload.id);
      });
  },
});

export default adminSlice.reducer;
