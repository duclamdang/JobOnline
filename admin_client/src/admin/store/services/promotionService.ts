import { apiAuth } from "../../../services/api";
import { Promotion, PromotionPayload } from "../redux/promotionSlice";

export const getEmployerPromotionsApi = async () => {
  const res = await apiAuth.get("/admin/employer/promotions", {
    withCredentials: true,
  });
  return res.data.data;
};

export const getAdminPromotionsApi = async () => {
  const res = await apiAuth.get("/admin/promotions", {
    withCredentials: true,
  });
  return res.data.data as {
    data: Promotion[];
    total: number;
    per_page: number;
    current_page: number;
  };
};

export const getPromotionByIdApi = async (id: number) => {
  const res = await apiAuth.get(`/admin/promotions/${id}`, {
    withCredentials: true,
  });
  return res.data.data as Promotion;
};

const buildPromotionFormData = (
  data: PromotionPayload,
  image?: File | null
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
    } else {
      formData.append(key, String(value));
    }
  });

  if (image) {
    formData.append("image", image);
  }

  return formData;
};

export const createPromotionApi = async (
  data: PromotionPayload,
  image?: File | null
) => {
  const formData = buildPromotionFormData(data, image);

  const res = await apiAuth.post("/admin/promotions", formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};

export const updatePromotionApi = async (
  id: number,
  data: PromotionPayload,
  image?: File | null
) => {
  const formData = buildPromotionFormData(data, image);
  formData.append("_method", "PUT");

  const res = await apiAuth.post(`/admin/promotions/${id}`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};

export const deletePromotionApi = async (id: number) => {
  await apiAuth.delete(`/admin/promotions/${id}`, {
    withCredentials: true,
  });
};
