// src/pages/RegisterEmployer.tsx
import React, { useState, useEffect } from "react";
import logo24h from "../../assets/vieclam24h.png";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
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
  const { i18n } = useTranslation();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      tax_code: taxCodeDigits, // gửi MST đã chuẩn hóa chỉ gồm chữ số
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
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      <header className="h-14 mb-3 flex justify-between items-center px-4 sm:px-6 shadow-sm bg-white">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={logo24h} alt="Vieclam24h" className="h-6 sm:h-8" />
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="/"
            className="flex items-center gap-1 sm:gap-2 hover:text-purple-700 transition"
          >
            <GroupsOutlinedIcon className="text-blue-500 text-sm sm:text-base" />
            <div className="flex flex-col leading-tight text-left">
              <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">
                Đi tới trang của
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-800">
                Người Tìm Việc
              </span>
            </div>
          </a>

          <button onClick={toggleLang} className="ml-1 sm:ml-2">
            {lang === "vi" ? (
              <img
                src="https://flagcdn.com/us.svg"
                alt="Switch to English"
                className="h-4 w-6 sm:h-5 sm:w-7 object-cover border"
              />
            ) : (
              <img
                src="https://flagcdn.com/vn.svg"
                alt="Chuyển sang Tiếng Việt"
                className="h-4 w-6 sm:h-5 sm:w-7 object-cover border"
              />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-r from-[#f6f7fb] to-[#fefefe]">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6 min-h-[calc(100vh-56px-48px-12px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-stretch">
            <div className="h-full">
              <div className="w-full h-full bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(31,38,135,0.08)]">
                <div className="p-4 sm:p-5">
                  <h2 className="text-[22px] font-bold mb-3 text-gray-900">
                    Đăng ký tài khoản nhà tuyển dụng
                  </h2>

                  <h3 className="text-[16px] font-semibold text-gray-800 mb-2">
                    Thông tin tài khoản
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] gap-x-6 gap-y-3">
                      <label className="self-center text-sm font-medium text-gray-700">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Điền họ và tên"
                        className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500"
                        required
                        autoComplete="name"
                      />

                      <label className="self-center text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Điền email"
                        className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500"
                        required
                        inputMode="email"
                        autoComplete="email"
                      />

                      <label className="self-center text-sm font-medium text-gray-700">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Điền mật khẩu"
                        className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500"
                        required
                        autoComplete="new-password"
                        minLength={6}
                      />

                      <label className="self-center text-sm font-medium text-gray-700">
                        Xác nhận mật khẩu{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="passwordConfirm"
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500"
                        required
                        autoComplete="new-password"
                        minLength={6}
                      />
                    </div>

                    <h3 className="text-[16px] font-semibold text-gray-800">
                      Thông tin công ty
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] gap-x-6 gap-y-3">
                      <label className="self-center text-sm font-medium text-gray-700">
                        Tên công ty <span className="text-red-500">*</span>
                      </label>
                      <div>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Điền tên công ty"
                          className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500"
                          required
                          autoComplete="organization"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Theo giấy phép kinh doanh
                        </p>
                      </div>

                      <label className="self-center text-sm font-medium text-gray-700">
                        Mã số thuế <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="taxCode"
                        value={formData.taxCode}
                        onChange={handleChange}
                        placeholder="Nhập mã số thuế (10 hoặc 13 số)"
                        className="w-full h-10 border rounded-lg px-3 focus:ring-2 focus:ring-purple-500"
                        required
                        inputMode="numeric"
                        pattern="^\d{10}(\d{3})?$"
                        title="Mã số thuế hợp lệ gồm 10 số (doanh nghiệp) hoặc 13 số (đơn vị phụ thuộc)."
                      />

                      <label className="self-center text-sm font-medium text-gray-700">
                        Địa điểm
                      </label>
                      <div className="relative">
                        <select
                          name="province"
                          value={formData.province}
                          onChange={handleChange}
                          disabled={loadingCatalogs}
                          className="w-full h-10 border rounded-lg pl-3 pr-9 focus:ring-2 focus:ring-purple-500 appearance-none disabled:bg-gray-100"
                        >
                          <option value="">
                            {loadingCatalogs
                              ? "Đang tải..."
                              : "Chọn tỉnh thành phố"}
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
                        Lĩnh vực hoạt động
                      </label>
                      <div className="relative">
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          disabled={loadingCatalogs}
                          className="w-full h-10 border rounded-lg pl-3 pr-9 focus:ring-2 focus:ring-purple-500 appearance-none disabled:bg-gray-100"
                        >
                          <option value="">
                            {loadingCatalogs ? "Đang tải..." : "Chọn lĩnh vực"}
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

                      <div className="sm:col-span-2 flex items-center justify-between pt-1">
                        <p className="text-sm">
                          Bạn đã có tài khoản?{" "}
                          <a
                            href="/admin/login"
                            className="text-purple-600 hover:underline"
                          >
                            Đăng nhập
                          </a>
                        </p>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-purple-700 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-lg hover:bg-purple-800 transition"
                        >
                          {submitting ? "Đang xử lý..." : "Hoàn thành đăng ký"}
                        </button>
                      </div>

                      <p className="sm:col-span-2 text-center text-xs text-gray-500">
                        Bằng việc nhấn nút đăng ký, bạn đồng ý với{" "}
                        <a href="#" className="text-purple-600 underline">
                          điều khoản sử dụng
                        </a>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="hidden lg:block h-full">
              <div className="h-full rounded-2xl overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${Banner})` }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-12 flex items-center justify-center text-xs text-gray-500">
        © 2025 - Bản quyền thuộc về
      </footer>
    </div>
  );
}
