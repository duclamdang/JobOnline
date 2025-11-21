import { useSearchParams } from "react-router-dom";

export default function PaymentResultPage() {
  const [search] = useSearchParams();
  const status = search.get("status");
  const order = search.get("order");

  const isSuccess = status === "success";

  return (
    <main className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white shadow rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">
          {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
        </h1>
        <p className="text-gray-600 mb-4">
          Mã đơn hàng: <span className="font-mono">{order}</span>
        </p>
        <p className="text-gray-500 mb-6">
          {isSuccess
            ? "Hệ thống đã ghi nhận thanh toán. Bạn có thể sử dụng dịch vụ ngay."
            : "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."}
        </p>
        <a
          href="/admin/employer-dashboard"
          className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Quay về trang quản trị
        </a>
      </div>
    </main>
  );
}
