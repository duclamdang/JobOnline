import { useEffect, useState } from "react";
import {
  getAdminPromotionsApi,
  createPromotionApi,
  updatePromotionApi,
  deletePromotionApi,
} from "@admin/store/services/promotionService";
import AddPromotion from "./AddPromotion";
import { Promotion, PromotionPayload } from "@admin/store/redux/promotionSlice";
import { useTranslation } from "react-i18next";

function formatMoney(value: number, locale: string) {
  const lang = locale.startsWith("vi") ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export default function AdminRootPromotion() {
  const { t, i18n } = useTranslation();
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
      alert(t("promotion.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!window.confirm(t("promotion.confirmDelete"))) return;
    try {
      setDeletingId(id);
      await deletePromotionApi(id);
      await fetchData();
    } catch (e) {
      console.error(e);
      alert(t("promotion.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const locale = i18n.language || "vi";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("promotion.pageTitle")}</h1>
        <button
          onClick={handleOpenCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + {t("promotion.createButton")}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">
                {t("promotion.table.headers.name")}
              </th>
              <th className="px-4 py-2 text-left">
                {t("promotion.table.headers.price")}
              </th>
              <th className="px-4 py-2 text-left">
                {t("promotion.table.headers.points")}
              </th>
              <th className="px-4 py-2 text-left">
                {t("promotion.table.headers.validity")}
              </th>
              <th className="px-4 py-2 text-left">
                {t("promotion.table.headers.status")}
              </th>
              <th className="px-4 py-2 text-right">
                {t("promotion.table.headers.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  {t("promotion.loading")}
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  {t("promotion.empty")}
                </td>
              </tr>
            )}

            {!loading &&
              items.map((item) => {
                const start = item.start_at
                  ? new Date(item.start_at).toLocaleDateString(
                      locale.startsWith("vi") ? "vi-VN" : "en-US"
                    )
                  : t("promotion.noLimit");
                const end = item.end_at
                  ? new Date(item.end_at).toLocaleDateString(
                      locale.startsWith("vi") ? "vi-VN" : "en-US"
                    )
                  : t("promotion.noLimit");

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
                          {t("promotion.table.codePrefix")} {item.code}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">
                      {formatMoney(item.price, locale)}
                    </td>
                    <td className="px-4 py-2 align-top">{item.points}</td>
                    <td className="px-4 py-2 align-top text-xs text-gray-600">
                      <div>
                        {t("promotion.modal.fields.startAt.label")}: {start}
                      </div>
                      <div>
                        {t("promotion.modal.fields.endAt.label")}: {end}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-top">
                      {item.is_active ? (
                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700">
                          {t("promotion.table.status.active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600">
                          {t("promotion.table.status.inactive")}
                        </span>
                      )}
                    </td>
                    <td className="space-x-2 px-4 py-2 align-top text-right">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                      >
                        {t("promotion.table.actions.edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {deletingId === item.id
                          ? t("promotion.table.actions.deleting")
                          : t("promotion.table.actions.delete")}
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
