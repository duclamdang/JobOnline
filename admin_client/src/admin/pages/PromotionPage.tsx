import { useEffect, useState } from "react";
import { getEmployerPromotionsApi } from "@admin/store/services/promotionService";
import { createEmployerPromotionPayment } from "@admin/store/services/paymentService";

interface Promotion {
  id: number;
  name: string;
  description?: string;
  price: number;
  points: number;
  start_at?: string | null;
  end_at?: string | null;
  image_url?: string | null;
}

export default function PromotionPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPayId, setLoadingPayId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getEmployerPromotionsApi();
        setPromotions(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePay = async (promo: Promotion) => {
    try {
      setLoadingPayId(promo.id);
      const res = await createEmployerPromotionPayment(promo.id);
      window.location.href = res.payUrl;
    } finally {
      setLoadingPayId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Khuyến mãi</h2>

      {loading ? (
        <p>Đang tải khuyến mãi...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promo) => (
            <div key={promo.id} className="relative">
              {loadingPayId === promo.id && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 text-sm font-medium text-gray-700">
                  Đang chuyển đến cổng thanh toán...
                </div>
              )}

              <PromotionCard promo={promo} onPay={handlePay} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type PromotionCardProps = {
  promo: Promotion;
  onPay: (promo: Promotion) => void;
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
};

const PromotionCard = ({ promo, onPay }: PromotionCardProps) => {
  const hasImage = !!promo.image_url;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* Ảnh banner */}
      {hasImage && (
        <div className="h-32 w-full overflow-hidden bg-gray-100">
          <img
            src={promo.image_url!}
            alt={promo.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Nội dung */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Tag + thời gian */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            Khuyến mãi
          </span>

          {promo.start_at && promo.end_at && (
            <span className="text-xs text-gray-400">
              {formatDate(promo.start_at)} – {formatDate(promo.end_at)}
            </span>
          )}
        </div>

        {/* Tiêu đề + mô tả: CHỪA SẴN CHIỀU CAO */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[48px]">
            {promo.name}
          </h3>
          {promo.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
              {promo.description}
            </p>
          )}
        </div>

        {/* Giá & điểm */}
        <div className="mt-1 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Giá</p>
            <p className="text-lg font-bold text-gray-900">
              {promo.price.toLocaleString("vi-VN")} đ
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Điểm nhận được
            </p>
            <p className="text-xl font-extrabold text-blue-600">
              {promo.points.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Nút thanh toán */}
        <button
          type="button"
          onClick={() => onPay(promo)}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Thanh toán khuyến mãi này
        </button>
      </div>

      {/* Góc nhỏ decor */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-blue-100 opacity-60 group-hover:opacity-80" />
    </div>
  );
};
