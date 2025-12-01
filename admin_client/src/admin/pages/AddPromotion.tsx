import { Promotion, PromotionPayload } from "@admin/store/redux/promotionSlice";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  initialData?: Promotion | null;
  onClose: () => void;
  onSubmit: (data: PromotionPayload, image?: File | null) => Promise<void>;
}

const emptyForm: PromotionPayload = {
  name: "",
  code: "",
  description: "",
  price: 100000,
  points: 100,
  start_at: "",
  end_at: "",
  is_active: true,
};

export default function AddPromotion({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<PromotionPayload>(emptyForm);
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setForm({
          name: initialData.name,
          code: initialData.code || "",
          description: initialData.description || "",
          price: initialData.price,
          points: initialData.points,
          start_at: initialData.start_at
            ? initialData.start_at.substring(0, 10)
            : "",
          end_at: initialData.end_at ? initialData.end_at.substring(0, 10) : "",
          is_active: initialData.is_active,
        });

        // chỉ dùng cho preview UI, không gửi lên backend
        setPreviewImage(initialData.image_url || null);
        setImageFile(null);
      } else {
        setForm(emptyForm);
        setPreviewImage(null);
        setImageFile(null);
      }
    }
  }, [open, mode, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "points" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(form, imageFile);
      onClose();
    } catch (err: any) {
      console.error("Promotion error:", err.response?.data || err);
      alert(
        "Có lỗi khi lưu khuyến mãi: " +
          JSON.stringify(err.response?.data?.error_messages ?? {}, null, 2)
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Tạo khuyến mãi" : "Chỉnh sửa khuyến mãi"}
          </h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          {/* Tên */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Tên khuyến mãi *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Ảnh banner */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Ảnh khuyến mãi (banner)
            </label>
            <div className="flex items-center gap-3">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-16 w-28 rounded-lg border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400">
                  Chưa có ảnh
                </div>
              )}

              <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Nên dùng ảnh ngang, khoảng 800×300px, dung lượng &lt; 1MB.
            </p>
          </div>

          {/* Mã + trạng thái */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Mã khuyến mãi (tuỳ chọn)
              </label>
              <input
                type="text"
                name="code"
                value={form.code || ""}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-6 flex items-center gap-2 md:mt-0">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={!!form.is_active}
                onChange={handleCheckboxChange}
                className="h-4 w-4"
              />
              <label htmlFor="is_active" className="text-sm">
                Đang kích hoạt
              </label>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Mô tả (hiển thị cho nhà tuyển dụng)
            </label>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              className="min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          {/* Giá & điểm */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Giá tiền (VND) *
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Điểm nhận được *
              </label>
              <input
                type="number"
                min={1}
                name="points"
                value={form.points}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          {/* Ngày hiệu lực */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Bắt đầu từ
              </label>
              <input
                type="date"
                name="start_at"
                value={form.start_at || ""}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Kết thúc</label>
              <input
                type="date"
                name="end_at"
                value={form.end_at || ""}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
