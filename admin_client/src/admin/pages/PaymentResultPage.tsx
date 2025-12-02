import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { createEmployerPayment } from "@admin/store/services/paymentService";
import { useTranslation } from "react-i18next";

export default function EmployerPaymentPage() {
  const { t } = useTranslation();
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
    const amountToPay = packageAmount;

    // cho đúng với message: phải từ 10.000đ
    if (!amountToPay || amountToPay < 10000) {
      alert(t("employerPaymentPage.validation.minAmount"));
      return;
    }

    try {
      setLoading(true);

      const res = await createEmployerPayment(amountToPay);
      if (res?.payUrl) {
        window.location.href = res.payUrl;
      } else {
        alert(t("employerPaymentPage.toast.createFail"));
      }
    } catch (error: any) {
      console.error("Create payment error", error);
      alert(
        error?.response?.data?.message ||
          t("employerPaymentPage.toast.createError")
      );
    } finally {
      setLoading(false);
    }
  };

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
            {isSuccess
              ? t("employerPaymentPage.result.successTitle")
              : t("employerPaymentPage.result.failTitle")}
          </h1>

          <p
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
              isSuccess
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isSuccess
              ? t("employerPaymentPage.result.successBadge")
              : t("employerPaymentPage.result.failBadge")}
          </p>

          <div className="text-sm text-gray-600 mb-4 space-y-1">
            <p>
              {t("employerPaymentPage.result.orderCode")}:{" "}
              <span className="font-mono font-semibold">{order || "—"}</span>
            </p>
            <p>
              {t("employerPaymentPage.result.amount")}:{" "}
              <span className="font-semibold">{formattedAmount} ₫</span>
            </p>
            <p>
              {t("employerPaymentPage.result.points")}:{" "}
              <span className="font-semibold">{formattedPoints}</span>
            </p>
          </div>

          <p className="text-gray-500 mb-8 text-sm">
            {isSuccess
              ? t("employerPaymentPage.result.successDescription")
              : t("employerPaymentPage.result.failDescription")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/admin/payment"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            >
              {t("employerPaymentPage.result.buyMore")}
            </a>
            <a
              href="/admin/employer-dashboard"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              {t("employerPaymentPage.result.backToDashboard")}
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 flex justify-center">
      <div className="bg-white shadow rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6">
          {t("employerPaymentPage.form.title")}
        </h1>

        {/* Gói điểm nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setSelectedPackage("small")}
            className={`border rounded-xl p-4 text-left hover:border-blue-500 ${
              selectedPackage === "small" ? "border-blue-600 bg-blue-50" : ""
            }`}
          >
            <div className="font-semibold mb-1">
              {t("employerPaymentPage.form.packages.smallTitle")}
            </div>
            <div className="text-sm text-gray-600">
              {t("employerPaymentPage.form.packages.smallDesc")}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedPackage("medium")}
            className={`border rounded-xl p-4 text-left hover:border-blue-500 ${
              selectedPackage === "medium" ? "border-blue-600 bg-blue-50" : ""
            }`}
          >
            <div className="font-semibold mb-1">
              {t("employerPaymentPage.form.packages.mediumTitle")}
            </div>
            <div className="text-sm text-gray-600">
              {t("employerPaymentPage.form.packages.mediumDesc")}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedPackage("large")}
            className={`border rounded-xl p-4 text-left hover:border-blue-500 ${
              selectedPackage === "large" ? "border-blue-600 bg-blue-50" : ""
            }`}
          >
            <div className="font-semibold mb-1">
              {t("employerPaymentPage.form.packages.largeTitle")}
            </div>
            <div className="text-sm text-gray-600">
              {t("employerPaymentPage.form.packages.largeDesc")}
            </div>
          </button>
        </div>

        {/* Nhập số tiền tùy chọn */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            {t("employerPaymentPage.form.customLabel")}
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
            {t("employerPaymentPage.form.rateText")}{" "}
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
              {t("employerPaymentPage.form.summaryAmount")}:{" "}
              <span className="font-semibold">
                {new Intl.NumberFormat("vi-VN").format(packageAmount)} ₫
              </span>
            </p>
            <p>
              {t("employerPaymentPage.form.summaryPoints")}:{" "}
              <span className="font-semibold">
                {computePoints(packageAmount)}{" "}
                {t("employerPaymentPage.form.pointsUnit")}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handlePayVnpay}
            disabled={loading}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 text-sm font-medium"
          >
            {loading
              ? t("employerPaymentPage.form.submitLoading")
              : t("employerPaymentPage.form.submit")}
          </button>
        </div>

        <p className="text-xs text-gray-400">
          {t("employerPaymentPage.form.note")}
        </p>
      </div>
    </main>
  );
}
