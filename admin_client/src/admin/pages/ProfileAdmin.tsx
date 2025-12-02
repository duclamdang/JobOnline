import { useEffect, useState, ChangeEvent } from "react";
import { useAppSelector, useAppDispatch } from "@context/hooks";
import {
  fetchProfile,
  updateProfile,
  changePassword,
} from "@admin/store/redux/profileSlice";
import { toast } from "react-toastify";
import ChangePasswordModal from "../components/ChangePasswordModal";
import Loading from "@components/Loading";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { profile, loading, error } = useAppSelector((state) => state.profile);

  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    address: string;
    avatar: string | File;
  }>({
    name: "",
    phone: "",
    address: "",
    avatar: "",
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const isRestrictedRole = profile?.role_id === 1;

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        avatar: profile.avatar || "",
      });
    }
  }, [profile]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("toast.avatarTooLarge"));
        return;
      }
      setFormData((p) => ({ ...p, avatar: file }));
    }
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!formData.name.trim()) next.name = t("toast.missingName");
    if (!/^0\d{9}$/.test(formData.phone)) next.phone = t("toast.invalidPhone");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      let payload: FormData | typeof formData = formData;
      if (formData.avatar instanceof File) {
        payload = new FormData();
        payload.append("name", formData.name);
        payload.append("phone", formData.phone);
        payload.append("address", formData.address);
        payload.append("avatar", formData.avatar);
      }

      const resultAction = await dispatch(updateProfile(payload));
      if (updateProfile.fulfilled.match(resultAction)) {
        toast.success(t("toast.updateSuccess"));
        await dispatch(fetchProfile());
      } else {
        toast.error(t("toast.updateFail"));
      }
    } catch {
      toast.error(t("toast.updateError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) => {
    try {
      const resultAction = await dispatch(changePassword(data));
      if (changePassword.fulfilled.match(resultAction)) {
        toast.success(t("toast.passwordSuccess"));
        setIsOpen(false);
      } else {
        toast.error(t("toast.passwordFail"));
      }
    } catch {
      toast.error(t("toast.passwordError"));
    }
  };

  if (loading) return <Loading />;

  if (error)
    return (
      <div className="p-6 text-red-600">
        {t("toast.error")}: {error}
      </div>
    );

  if (!profile)
    return <div className="p-6">Không tìm thấy thông tin người dùng</div>;

  const avatarUrl = formData.avatar
    ? typeof formData.avatar === "string"
      ? formData.avatar.startsWith("http")
        ? formData.avatar
        : `${formData.avatar}`
      : URL.createObjectURL(formData.avatar)
    : "";

  const initials =
    (formData.name || profile.email || "?").trim().charAt(0).toUpperCase() ||
    "?";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-6 font-sans">
      {/* Tabs */}
      <div className="mx-auto mb-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
            <button
              onClick={() => navigate("/admin/profile")}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm"
            >
              {t("profilePage.tabs.accountInfo")}
            </button>

            {!isRestrictedRole && (
              <button
                onClick={() => navigate("/admin/company")}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-purple-700"
              >
                {t("profilePage.tabs.companyInfo")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 items-start">
        {/* Card: Form thông tin */}
        <section className="md:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                {t("profilePage.tabs.accountInfo")}
              </h2>
              <p className="text-xs text-gray-500">
                {t("profilePage.feature")}
              </p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-8">
            {/* Đăng nhập */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                {t("profilePage.sections.loginInfo")}
              </h3>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                {t("profilePage.labels.email")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-700 outline-none"
              />

              <label className="mt-4 mb-1.5 block text-sm font-medium text-gray-600">
                {t("profilePage.labels.password")}
              </label>
              <input
                type="password"
                value="********"
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-700 outline-none"
              />
              <button
                onClick={() => setIsOpen(true)}
                className="mt-1 inline-block text-sm font-medium text-purple-700 underline underline-offset-2 hover:opacity-90"
              >
                {t("profilePage.buttons.changePassword")}
              </button>
            </div>

            {/* Liên hệ */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                {t("profilePage.sections.contactInfo")}
              </h3>

              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                {t("profilePage.labels.fullName")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("profilePage.placeholders.fullName")}
                className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 outline-none transition
                ${
                  errors.name
                    ? "border-red-300 ring-2 ring-red-100"
                    : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}

              <label className="mt-4 mb-1.5 block text-sm font-medium text-gray-600">
                {t("profilePage.labels.phone")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t("profilePage.placeholders.phone")}
                className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 outline-none transition
                ${
                  errors.phone
                    ? "border-red-300 ring-2 ring-red-100"
                    : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
              )}

              <label className="mt-4 mb-1.5 block text-sm font-medium text-gray-600">
                {t("profilePage.labels.contactEmail")}
              </label>
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-700 outline-none"
              />

              <label className="mt-4 mb-1.5 block text-sm font-medium text-gray-600">
                {t("profilePage.labels.address")}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t("profilePage.placeholders.address")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t("profilePage.notes.addressNote")}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("profilePage.buttons.cancel")}
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-purple-400"
              >
                {submitting && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      className="opacity-20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      className="opacity-75"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                  </svg>
                )}
                {submitting
                  ? t("profilePage.buttons.updating")
                  : t("profilePage.buttons.update")}
              </button>
            </div>
          </div>
        </section>

        {/* Card: Avatar */}
        <aside className="rounded-2xl border border-gray-200 bg-white shadow-sm self-start">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-medium text-gray-900">
              {t("profilePage.sections.avatar")}
            </h2>
            <p className="text-xs text-gray-500">
              {t("profilePage.notes.avatarNote")}
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="flex flex-col items-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-28 w-28 rounded-full object-cover ring-2 ring-purple-100"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-purple-600 text-3xl font-bold text-white ring-2 ring-purple-100">
                  {initials}
                </div>
              )}

              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M12 16v-6M9 13h6" />
                  <path d="M20 7h-3l-2-2H9L7 7H4v12h16z" />
                </svg>
                {t("profilePage.buttons.changeAvatar")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>

              {typeof formData.avatar !== "string" && formData.avatar && (
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, avatar: "" }))}
                  className="mt-2 text-xs text-gray-600 underline hover:text-gray-800"
                >
                  {t("profilePage.buttons.removeAvatar")}
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      <ChangePasswordModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleChangePassword}
      />
    </main>
  );
}
