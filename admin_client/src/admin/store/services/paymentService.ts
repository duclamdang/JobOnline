import { apiAuth } from "../../../services/api";

export const createEmployerPayment = async (
  amount: number,
  method: "momo" | "vnpay"
) => {
  const res = await apiAuth.post("/admin/employer-payment/create", {
    amount,
    method,
  });
  return res.data as { payUrl: string; order_code: string };
};
