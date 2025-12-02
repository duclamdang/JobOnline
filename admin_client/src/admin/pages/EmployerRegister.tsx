import React, { useState, useEffect } from "react";
import logo24h from "../../assets/vieclam24h.png";
import { useTranslation } from "react-i18next";
import Banner from "@assets/banner_rgt.png";
import { apiAuth } from "@services/api";
import { toast } from "react-toastify";
import {
  registerAdminApi,
  RegisterAdminPayload,
} from "@admin/store/services/authServices";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";

type Province = { id: number; name: string };
type WorkField = { id: number; title: string };

export default function RegisterEmployer() {
  const { i18n, t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirm: "",
    taxCode: "",
    companyName: "",
    province: "" as number | "",
    industry: "" as number | "",
  });
  const [lang, setLang] = useState<"vi" | "en">("vi");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [workFields, setWorkFields] = useState<WorkField[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    i18n.changeLanguage("vi");
  }, [i18n]);

  const toggleLang = () => {
    const next = lang === "vi" ? "en" : "vi";
    setLang(next);
    i18n.changeLanguage(next);
  };

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [provinceRes, indusRes] = await Promise.all([
          apiAuth.get("/locations/provinces"),
          apiAuth.get("/catalogs/industries"),
        ]);
        setProvinces(provinceRes.data?.data ?? []);
        setWorkFields(indusRes.data?.data ?? []);
      } catch {
        toast.error("Không thể tải tỉnh/thành và lĩnh vực hoạt động!");
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchCatalogs();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "province" || name === "industry") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ====== VALIDATE MST VIỆT NAM ======
  const normalizeTaxCode = (s: string) => s.replace(/[^\d]/g, ""); // bỏ mọi ký tự không phải số
  const isValidVNTaxCode = (s: string) => {
    const d = normalizeTaxCode(s);
    return d.length === 10 || d.length === 13;
  };
  // ===================================

  const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const {
      fullName,
      email,
      password,
      passwordConfirm,
      taxCode,
      companyName,
      province,
      industry,
    } = formData;

    const nameTrim = fullName.trim();
    const emailTrim = email.trim();
    const taxCodeDigits = normalizeTaxCode(taxCode);
    const companyNameTrim = companyName.trim();

    if (!isValidEmail(emailTrim)) {
      toast.error("Email không hợp lệ!");
      return;
    }
    if (password !== passwordConfirm) {
      toast.error("Xác nhận mật khẩu không khớp!");
      return;
    }
    if (!taxCodeDigits) {
      toast.error("Vui lòng nhập mã số thuế công ty!");
      return;
    }
    if (!isValidVNTaxCode(taxCodeDigits)) {
      toast.error(
        "Mã số thuế phải có 10 số (doanh nghiệp) hoặc 13 số (đơn vị phụ thuộc)."
      );
      return;
    }

    const payload: RegisterAdminPayload = {
      name: nameTrim,
      email: emailTrim,
      password,
      password_confirmation: passwordConfirm,
      tax_code: taxCodeDigits,
      company_name: companyNameTrim,
      location_id: province === "" ? null : Number(province),
      industry_id: industry === "" ? null : Number(industry),
    };

    try {
      setSubmitting(true);
      const res = await registerAdminApi(payload);
      toast.success(res?.message ?? "Đăng ký thành công!");
      navigate("/admin/login");
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const data = error.response?.data as {
          error_messages?: unknown;
          message?: string;
        };
        const em = data?.error_messages;
        if (typeof em === "string") {
          toast.error(em);
        } else if (em && typeof em === "object") {
          const firstVal = Object.values(em as Record<string, unknown>)[0];
          if (Array.isArray(firstVal) && typeof firstVal[0] === "string") {
            toast.error(firstVal[0]);
          } else {
            toast.error("Đăng ký thất bại!");
          }
        } else if (typeof data?.message === "string") {
          toast.error(data.message);
        } else {
          toast.error("Đăng ký thất bại!");
        }
      } else {
        toast.error("Đăng ký thất bại!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-slate-900 to-slate-900">
      {/* HEADER giống trang login */}
      <header className="flex justify-between items-center px-4 sm:px-8 py-3 border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={logo24h} alt="Vieclam24h" className="h-7 sm:h-9" />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs uppercase tracking-[0.15em] text-purple-200">
              JobOnline Admin
            </span>
            <span className="text-xs text-slate-300">
              {t("register.title")}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleLang}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-white/10 transition"
        >
          <span className="uppercase">{lang}</span>
        </button>
      </header>

      {/* MAIN giống style login */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-5xl">
          <div className="bg-white/95 backdrop-blur shadow-2xl rounded-2xl overflow-hidden border border-slate-100 grid grid-cols-1 lg:grid-cols-2">
            {/* LEFT: Banner + intro (desktop) */}
            <div className="relative hidden lg:block">
              <img
                src={Banner}
                alt="Register employer banner"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-800/80 via-purple-700/70 to-indigo-700/80" />
              <div className="absolute inset-0 flex flex-col justify-between p-8 text-white">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium mb-4">
                    <span>{t("register.employerRegistration")}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">
                    {t("register.feature1")}
                  </h2>
                  <p className="text-sm text-purple-100 leading-relaxed">
                    {t("register.feature2")}
                  </p>
                </div>

                <div className="mt-6 border-t border-white/20 pt-4 text-xs text-purple-100/90">
                  <p>• {t("register.feature4")}</p>
                  <p>• {t("register.feature5")}</p>
                  <p>• {t("register.feature6")}</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Form */}
            <div className="p-6 sm:p-8 max-h-[calc(100vh-130px)] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                {t("register.title")}
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                {t("register.feature3")}
              </p>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <h3 className="text-[16px] font-semibold text-gray-800 mb-1">
                  {t("register.accountInformation")}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-[190px_minmax(0,1fr)] gap-x-6 gap-y-3">
                  <label className="self-center text-sm font-medium text-gray-700">
                    {t("register.name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={t("register.enterName")}
                    className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                    required
                    autoComplete="name"
                  />

                  <label className="self-center text-sm font-medium text-gray-700">
                    {t("register.email")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("register.enterEmail")}
                    className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                    required
                    inputMode="email"
                    autoComplete="email"
                  />

                  <label className="self-center text-sm font-medium text-gray-700">
                    {t("register.password")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("register.enterPassword")}
                    className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />

                  <label className="self-center text-sm font-medium text-gray-700">
                    {t("register.confirmPassword")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    placeholder={t("register.enterconfirmPassword")}
                    className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                <h3 className="text-[16px] font-semibold text-gray-800 pt-2">
                  {t("register.companyInformation")}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-[190px_minmax(0,1fr)] gap-x-6 gap-y-3">
                  <label className="self-center text-sm font-medium text-gray-700">
                    {t("register.companyName")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder={t("register.entercompanyName")}
                      className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                      required
                      autoComplete="organization"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      {t("register.businessLicense")}
                    </p>
                  </div>

                  <label className="self-center text-sm font-medium text-gray-700">
                    {t("register.taxCode")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleChange}
                    placeholder={t("register.entertaxCode")}
                    className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                    required
                    inputMode="numeric"
                    pattern="^\d{10}(\d{3})?$"
                    title="Mã số thuế hợp lệ gồm 10 số (doanh nghiệp) hoặc 13 số (đơn vị phụ thuộc)."
                  />

                  <label className="self-center text-sm font-medium text-gray-700">
                    {t("register.location")}
                  </label>
                  <div className="relative">
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      disabled={loadingCatalogs}
                      className="w-full h-10 border rounded-lg pl-3 pr-9 focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none disabled:bg-gray-100 text-sm"
                    >
                      <option value="">
                        <option value="">
                          {loadingCatalogs
                            ? t("register.loading")
                            : t("register.enterLocation")}
                        </option>
                      </option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <label className="self-center text-sm font-medium text-gray-700">
                    {t("register.fieldOfOperation")}
                  </label>
                  <div className="relative">
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      disabled={loadingCatalogs}
                      className="w-full h-10 border rounded-lg pl-3 pr-9 focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none disabled:bg-gray-100 text-sm"
                    >
                      <option value="">
                        {loadingCatalogs
                          ? t("register.loading")
                          : t("register.enterfieldOfOperation")}
                      </option>
                      {workFields.map((wf) => (
                        <option key={wf.id} value={wf.id}>
                          {wf.title}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <p className="text-sm text-slate-600">
                      {t("register.haveAccount")}?{" "}
                      <a
                        href="/admin/login"
                        className="text-purple-600 hover:underline"
                      >
                        {t("register.login")}
                      </a>
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-purple-700 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-lg hover:bg-purple-800 transition text-sm"
                    >
                      {submitting
                        ? t("register.processing")
                        : t("register.completeRegistration")}
                    </button>
                  </div>

                  <p className="sm:col-span-2 text-center text-xs text-gray-500 mt-1">
                    {t("register.feature7")}{" "}
                    <a href="#" className="text-purple-600 underline">
                      {t("register.termsOfUse")}
                    </a>
                    .
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-10 flex items-center justify-center text-[11px] text-slate-300">
        {t("footer.copyright")}
      </footer>
    </div>
  );
}
