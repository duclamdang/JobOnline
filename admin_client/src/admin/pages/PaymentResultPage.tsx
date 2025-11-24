import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { createEmployerPayment } from "@admin/store/services/paymentService";

export default function EmployerPaymentPage() {
  const [search] = useSearchParams();
  const status = search.get("status");
  const order = search.get("order");
  const amount = search.get("amount");
  const points = search.get("points");

  const isSuccess = status === "success";
  const isResultMode = !!status;

  // --------- STATE MUA ĐIỂM ----------
  const [selectedPackage, setSelectedPackage] = useState<
    "small" | "medium" | "large" | "custom"
  >("small");
  const [customAmount, setCustomAmount] = useState<number>(100000);
  const [loading, setLoading] = useState(false);

  // quy đổi ví dụ: 1.000đ = 1 điểm
  const computePoints = (money: number) => Math.floor(money / 1000);

  const packageAmount =
    selectedPackage === "small"
      ? 100000
      : selectedPackage === "medium"
      ? 300000
      : selectedPackage === "large"
      ? 500000
      : customAmount || 0;

  const packagePoints = computePoints(packageAmount);

  const formattedAmount =
    amount && !Number.isNaN(Number(amount))
      ? new Intl.NumberFormat("vi-VN").format(Number(amount))
      : new Intl.NumberFormat("vi-VN").format(packageAmount);

  const formattedPoints = points ?? packagePoints.toString();

  // --------- HANDLE THANH TOÁN ----------
  const handlePayVnpay = async () => {
    if (!packageAmount || packageAmount < 1000) {
      alert("Số tiền phải từ 1.000đ trở lên");
      return;
    }

    try {
      setLoading(true);
      const res = await createEmployerPayment(packageAmount);
      window.location.href = res.payUrl;
    } catch (err) {
      console.error(err);
      alert("Không tạo được thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // MODE 1: KẾT QUẢ THANH TOÁN (KHI CÓ status)
  // ------------------------------------------------
  if (isResultMode) {
    return (
      <main className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white shadow rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="mb-4 flex justify-center">
            <div
              className={`h-14 w-14 rounded-full flex items-center justify-center ${
                isSuccess ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              <span className="text-2xl">{isSuccess ? "✅" : "⚠️"}</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">
            {isSuccess ? "Mua điểm thành công" : "Mua điểm không thành công"}
          </h1>

          <p
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
              isSuccess
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isSuccess ? "Thanh toán hoàn tất" : "Thanh toán thất bại"}
          </p>

          <div className="text-sm text-gray-600 mb-4 space-y-1">
            <p>
              Mã đơn hàng:{" "}
              <span className="font-mono font-semibold">{order || "—"}</span>
            </p>
            <p>
              Số tiền:{" "}
              <span className="font-semibold">{formattedAmount} ₫</span>
            </p>
            <p>
              Số điểm: <span className="font-semibold">{formattedPoints}</span>
            </p>
          </div>

          <p className="text-gray-500 mb-8 text-sm">
            {isSuccess
              ? "Điểm đã được cộng vào tài khoản tuyển dụng của bạn. Bạn có thể sử dụng để đăng tin và nâng cấp dịch vụ ngay."
              : "Có lỗi xảy ra trong quá trình thanh toán. Điểm chưa được cộng vào tài khoản. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/admin/payment"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            >
              Mua thêm điểm
            </a>
            <a
              href="/admin/employer-dashboard"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Quay về trang quản trị
            </a>
          </div>
        </div>
      </main>
    );
  }

  // ------------------------------------------------
  // MODE 2: FORM MUA ĐIỂM (KHI KHÔNG CÓ status)
  // ------------------------------------------------
  return (
    <main className="p-6 flex justify-center">
      <div className="bg-white shadow rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6">Mua điểm dịch vụ</h1>

        {/* Gói điểm nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setSelectedPackage("small")}
            className={`border rounded-xl p-4 text-left hover:border-blue-500 ${
              selectedPackage === "small" ? "border-blue-600 bg-blue-50" : ""
            }`}
          >
            <div className="font-semibold mb-1">Gói 100.000đ</div>
            <div className="text-sm text-gray-600">~ 100 điểm</div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedPackage("medium")}
            className={`border rounded-xl p-4 text-left hover:border-blue-500 ${
              selectedPackage === "medium" ? "border-blue-600 bg-blue-50" : ""
            }`}
          >
            <div className="font-semibold mb-1">Gói 300.000đ</div>
            <div className="text-sm text-gray-600">~ 300 điểm</div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedPackage("large")}
            className={`border rounded-xl p-4 text-left hover:border-blue-500 ${
              selectedPackage === "large" ? "border-blue-600 bg-blue-50" : ""
            }`}
          >
            <div className="font-semibold mb-1">Gói 500.000đ</div>
            <div className="text-sm text-gray-600">~ 500 điểm</div>
          </button>
        </div>

        {/* Nhập số tiền tùy chọn */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Hoặc nhập số tiền khác (VND)
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-full"
              min={10000}
              step={10000}
              value={
                selectedPackage === "custom" ? customAmount : packageAmount
              }
              onChange={(e) => {
                setSelectedPackage("custom");
                setCustomAmount(Number(e.target.value) || 0);
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            1.000đ ≈ 1 điểm. Số điểm dự kiến:{" "}
            <span className="font-semibold">
              {computePoints(
                selectedPackage === "custom" ? customAmount : packageAmount
              )}
            </span>
          </p>
        </div>

        {/* Tóm tắt & nút thanh toán */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="text-sm text-gray-700">
            <p>
              Số tiền thanh toán:{" "}
              <span className="font-semibold">
                {new Intl.NumberFormat("vi-VN").format(packageAmount)} ₫
              </span>
            </p>
            <p>
              Số điểm nhận được:{" "}
              <span className="font-semibold">
                {computePoints(packageAmount)} điểm
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handlePayVnpay}
            disabled={loading}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 text-sm font-medium"
          >
            {loading ? "Đang tạo thanh toán..." : "Thanh toán qua VNPAY"}
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Sau khi thanh toán thành công, điểm sẽ được cộng trực tiếp vào tài
          khoản tuyển dụng của bạn.
        </p>
      </div>
    </main>
  );
}
