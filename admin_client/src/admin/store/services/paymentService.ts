import { apiAuth } from "../../../services/api";

export const createEmployerPayment = async (amount: number) => {
  const res = await apiAuth.post("/admin/employer-payment/create", {
    amount,
  });
  return res.data;
};

export const createEmployerPromotionPayment = async (promotionId: number) => {
  const res = await apiAuth.post("/admin/employer-payment/create", {
    promotion_id: promotionId,
  });
  return res.data;
};
