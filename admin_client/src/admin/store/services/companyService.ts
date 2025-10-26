import { apiAuth } from "../../../services/api";

// ====================
// ADMIN COMPANY
// ====================

export const getMyCompanyApi = async () => {
  const res = await apiAuth.get("/admin/companies/my-company", {
    withCredentials: true,
  });
  return res.data.data;
};

export const updateCompanyBasicApi = async (data: {
  name?: string;
  company_size?: string;
  email?: string;
  phone?: string;
  address?: string;
  location_id?: number;
  industry_id?: number;
}) => {
  const res = await apiAuth.put("/admin/companies/basic", data, {
    withCredentials: true,
  });
  return res.data.data;
};

export const updateCompanyLicenseApi = async (file: File) => {
  const formData = new FormData();
  formData.append("business_license", file);

  const res = await apiAuth.post("/admin/companies/license", formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateCompanyAdditionalApi = async (data: {
  website?: string;
  description?: string;
  founded_year?: number;
}) => {
  const res = await apiAuth.put("/admin/companies/additional", data, {
    withCredentials: true,
  });
  return res.data.data;
};

export const updateCompanyImageApi = async (
  data: { logo?: File; cover_image?: File } | FormData
) => {
  let formDataToSend: FormData;

  if (data instanceof FormData) {
    formDataToSend = data;
  } else {
    formDataToSend = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataToSend.append(key, value);
      }
    });
  }

  const res = await apiAuth.post("/admin/companies/image", formDataToSend, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};

// ====================
// ROOT ADMIN
// ====================

export const getAllCompaniesApi = async (perPage: number = 10) => {
  const res = await apiAuth.get(`/admin/companies`, {
    params: { per_page: perPage },
    withCredentials: true,
  });
  return res.data.data;
};

export const getCompanyByIdApi = async (id: number) => {
  const res = await apiAuth.get(`/admin/companies/${id}`, {
    withCredentials: true,
  });
  return res.data.data;
};

export const createCompanyApi = async (data: {
  name: string;
  tax_code: string;
  email?: string;
  phone?: string;
  address?: string;
  location_id?: number;
  industry_id?: number;
  company_size?: string;
}) => {
  const res = await apiAuth.post(`/admin/companies`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

export const updateCompanyBasicByIdApi = async (
  id: number,
  data: any
) => {
  const res = await apiAuth.put(`/admin/companies/${id}/basic`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

export const updateCompanyLicenseByIdApi = async (
  id: number,
  file: File
) => {
  const formData = new FormData();
  formData.append("business_license", file);

  const res = await apiAuth.post(`/admin/companies/${id}/license`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateCompanyAdditionalByIdApi = async (
  id: number,
  data: any
) => {
  const res = await apiAuth.put(`/admin/companies/${id}/additional`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

export const updateCompanyImageByIdApi = async (
  id: number,
  data: FormData | { logo?: File; cover_image?: File }
) => {
  let formDataToSend: FormData;

  if (data instanceof FormData) {
    formDataToSend = data;
  } else {
    formDataToSend = new FormData();
    if (data.logo) formDataToSend.append("logo", data.logo);
    if (data.cover_image) formDataToSend.append("cover_image", data.cover_image);
  }

  const res = await apiAuth.post(`/admin/companies/${id}/image`, formDataToSend, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};
