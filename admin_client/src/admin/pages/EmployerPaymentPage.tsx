import { useState } from "react";
import { createEmployerPayment } from "@admin/store/services/paymentService";

export default function EmployerPaymentPage() {
  const [amount, setAmount] = useState(500000);
  const [loading, setLoading] = useState(false);

  const handlePay = async (method: "momo" | "vnpay") => {
    try {
      setLoading(true);
      const { payUrl } = await createEmployerPayment(amount, method);
      if (payUrl) {
        window.location.href = payUrl; // redirect sang Momo/VNPAY
      } else {
        alert("Không tạo được link thanh toán");
      }
    } catch (e: any) {
      console.error(e);
      alert("Lỗi tạo thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Thanh toán gói dịch vụ</h1>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Số tiền (VND)
        </label>
        <input
          type="number"
          className="border rounded px-3 py-2 w-full max-w-xs"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      <div className="flex gap-4">
        <button
          disabled={loading}
          onClick={() => handlePay("momo")}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
        >
          Thanh toán MoMo
        </button>

        <button
          disabled={loading}
          onClick={() => handlePay("vnpay")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Thanh toán VNPay
        </button>
      </div>
    </main>
  );
}
