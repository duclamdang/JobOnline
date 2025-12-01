import { useEffect, useState } from "react";
import {
  getAdminPromotionsApi,
  createPromotionApi,
  updatePromotionApi,
  deletePromotionApi,
} from "@admin/store/services/promotionService";
import AddPromotion from "./AddPromotion";
import { Promotion, PromotionPayload } from "@admin/store/redux/promotionSlice";

function formatMoney(value: number) {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function AdminRootPromotion() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Promotion | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdminPromotionsApi();
      setItems(res.data ?? res);
    } catch (e) {
      console.error(e);
      alert("Không tải được danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelected(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (item: Promotion) => {
    setModalMode("edit");
    setSelected(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelected(null);
  };

  const handleSubmitForm = async (
    payload: PromotionPayload,
    imageFile?: File | null
  ) => {
    if (modalMode === "create") {
      await createPromotionApi(payload, imageFile || undefined);
    } else if (modalMode === "edit" && selected) {
      await updatePromotionApi(selected.id, payload, imageFile || undefined);
    }
    await fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xoá khuyến mãi này?")) return;
    try {
      setDeletingId(id);
      await deletePromotionApi(id);
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("Không xoá được khuyến mãi");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý khuyến mãi</h1>
        <button
          onClick={handleOpenCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Tạo khuyến mãi
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Tên</th>
              <th className="px-4 py-2 text-left">Giá</th>
              <th className="px-4 py-2 text-left">Điểm</th>
              <th className="px-4 py-2 text-left">Hiệu lực</th>
              <th className="px-4 py-2 text-left">Trạng thái</th>
              <th className="px-4 py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  Chưa có khuyến mãi nào.
                </td>
              </tr>
            )}

            {!loading &&
              items.map((item) => {
                const start = item.start_at
                  ? new Date(item.start_at).toLocaleDateString("vi-VN")
                  : "Không giới hạn";
                const end = item.end_at
                  ? new Date(item.end_at).toLocaleDateString("vi-VN")
                  : "Không giới hạn";

                return (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 align-top">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500">
                          {item.description}
                        </div>
                      )}
                      {item.code && (
                        <div className="text-xs text-indigo-600">
                          Mã: {item.code}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">
                      {formatMoney(item.price)}
                    </td>
                    <td className="px-4 py-2 align-top">{item.points}</td>
                    <td className="px-4 py-2 align-top text-xs text-gray-600">
                      <div>Từ: {start}</div>
                      <div>Đến: {end}</div>
                    </td>
                    <td className="px-4 py-2 align-top">
                      {item.is_active ? (
                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700">
                          Đang kích hoạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600">
                          Tạm tắt
                        </span>
                      )}
                    </td>
                    <td className="space-x-2 px-4 py-2 align-top text-right">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {deletingId === item.id ? "Đang xoá..." : "Xoá"}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <AddPromotion
        open={openModal}
        mode={modalMode}
        initialData={selected}
        onClose={handleCloseModal}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}
