import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  // Admin
  getMyCompanyApi,
  updateCompanyBasicApi,
  updateCompanyLicenseApi,
  updateCompanyAdditionalApi,
  updateCompanyImageApi,

  // Root admin
  getAllCompaniesApi,
  getCompanyByIdApi,
  createCompanyApi,
  updateCompanyBasicByIdApi,
  updateCompanyLicenseByIdApi,
  updateCompanyAdditionalByIdApi,
  updateCompanyImageByIdApi,
} from "../services/companyService";
import { AxiosError } from "axios";

interface Company {
  id: number;
  tax_code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company_size: string | null;
  website: string | null;
  description: string | null;
  founded_year: number | null;
  logo: string | null;
  cover_image: string | null;
  business_license: string | null;
  location_id: number | null;
  industry_id: number | null;
  created_at: string;
  updated_at: string;
}

interface CompanyPagination {
  data: Company[];
  total?: number;
  current_page?: number;
  last_page?: number;
}

interface CompanyState {
  company: Company | null;
  companies: Company[] | CompanyPagination;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  company: null,
  companies: [],
  loading: false,
  error: null,
};

// ====================
// ADMIN ACTIONS
// ====================

export const fetchMyCompany = createAsyncThunk(
  "company/fetchMyCompany",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyCompanyApi();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Không thể lấy thông tin công ty"
      );
    }
  }
);

export const updateCompanyBasic = createAsyncThunk(
  "company/updateCompanyBasic",
  async (data: any, { rejectWithValue }) => {
    try {
      return await updateCompanyBasicApi(data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi cập nhật thông tin cơ bản"
      );
    }
  }
);

export const updateCompanyLicense = createAsyncThunk(
  "company/updateCompanyLicense",
  async (file: File, { rejectWithValue }) => {
    try {
      return await updateCompanyLicenseApi(file);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message ||
          "Lỗi cập nhật giấy phép kinh doanh"
      );
    }
  }
);

export const updateCompanyAdditional = createAsyncThunk(
  "company/updateCompanyAdditional",
  async (data: any, { rejectWithValue }) => {
    try {
      return await updateCompanyAdditionalApi(data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi cập nhật thông tin bổ sung"
      );
    }
  }
);

export const updateCompanyImage = createAsyncThunk(
  "company/updateCompanyImage",
  async (
    data: { logo?: File; cover_image?: File } | FormData,
    { rejectWithValue }
  ) => {
    try {
      return await updateCompanyImageApi(data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi cập nhật hình ảnh công ty"
      );
    }
  }
);

// ====================
// ROOT ADMIN ACTIONS
// ====================

export const fetchAllCompanies = createAsyncThunk(
  "company/fetchAllCompanies",
  async (perPage: number = 10, { rejectWithValue }) => {
    try {
      return await getAllCompaniesApi(perPage);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Không thể lấy danh sách công ty"
      );
    }
  }
);

export const fetchCompanyById = createAsyncThunk(
  "company/fetchCompanyById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getCompanyByIdApi(id);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Không thể lấy thông tin công ty"
      );
    }
  }
);

export const createCompany = createAsyncThunk(
  "company/createCompany",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createCompanyApi(data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Lỗi khi tạo công ty mới"
      );
    }
  }
);

export const updateCompanyBasicById = createAsyncThunk(
  "company/updateCompanyBasicById",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      return await updateCompanyBasicByIdApi(id, data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message ||
          "Lỗi cập nhật thông tin cơ bản (root admin)"
      );
    }
  }
);

export const updateCompanyLicenseById = createAsyncThunk(
  "company/updateCompanyLicenseById",
  async ({ id, file }: { id: number; file: File }, { rejectWithValue }) => {
    try {
      return await updateCompanyLicenseByIdApi(id, file);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message ||
          "Lỗi cập nhật giấy phép kinh doanh (root admin)"
      );
    }
  }
);

export const updateCompanyAdditionalById = createAsyncThunk(
  "company/updateCompanyAdditionalById",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      return await updateCompanyAdditionalByIdApi(id, data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message ||
          "Lỗi cập nhật thông tin bổ sung (root admin)"
      );
    }
  }
);

export const updateCompanyImageById = createAsyncThunk(
  "company/updateCompanyImageById",
  async (
    { id, data }: { id: number; data: FormData | { logo?: File; cover_image?: File } },
    { rejectWithValue }
  ) => {
    try {
      const result = await updateCompanyImageByIdApi(id, data);
      return result;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message ||
          "Lỗi cập nhật hình ảnh công ty (root admin)"
      );
    }
  }
);

// ====================
// SLICE
// ====================

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== ADMIN =====
      .addCase(fetchMyCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload;
        state.error = null;
      })
      .addCase(fetchMyCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCompanyBasic.fulfilled, (state, action) => {
        state.company = { ...state.company, ...action.payload } as Company;
      })
      .addCase(updateCompanyLicense.fulfilled, (state, action) => {
        state.company = { ...state.company, ...action.payload } as Company;
      })
      .addCase(updateCompanyAdditional.fulfilled, (state, action) => {
        state.company = { ...state.company, ...action.payload } as Company;
      })
      .addCase(updateCompanyImage.fulfilled, (state, action) => {
        state.company = { ...state.company, ...action.payload } as Company;
      })

      // ===== ROOT ADMIN =====
      .addCase(fetchAllCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllCompanies.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.companies = Array.isArray(payload)
          ? payload
          : payload?.data || [];
        state.error = null;
      })
      .addCase(fetchAllCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.company = action.payload;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        const list = Array.isArray(state.companies)
          ? state.companies
          : (state.companies as CompanyPagination).data || [];
        list.unshift(action.payload);
        state.companies = list;
      })
      .addCase(updateCompanyBasicById.fulfilled, (state, action) => {
        state.company = { ...state.company, ...action.payload } as Company;
      })
      .addCase(updateCompanyLicenseById.fulfilled, (state, action) => {
        state.company = { ...state.company, ...action.payload } as Company;
      })
      .addCase(updateCompanyAdditionalById.fulfilled, (state, action) => {
        state.company = { ...state.company, ...action.payload } as Company;
      })
      .addCase(updateCompanyImageById.fulfilled, (state, action) => {
        state.company = { ...state.company, ...action.payload } as Company;
      });
  },
});

export default companySlice.reducer;
