import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import { createCompany } from "../store/redux/companySlice";
import { fetchProvinces } from "@admin/store/redux/locationSlice";
import { fetchIndustries } from "@admin/store/redux/industrySlice";

const CompanyCreate: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { provinces } = useAppSelector((s) => s.location);
  const { industries, loading: industryLoading, error: industryError } = useAppSelector((s) => s.industry);
  const { loading: locationLoading, error: locationError } = useAppSelector((s) => s.location);

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tax_code: "",
    email: "",
    phone: "",
    address: "",
    location_id: "",
    industry_id: "",
    company_size: "",
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    dispatch(fetchProvinces());
    dispatch(fetchIndustries());
  }, [dispatch]);

  useEffect(() => {
    if (industryError || locationError) {
      toast.error("Không thể tải dữ liệu địa phương/ngành nghề");
    }
  }, [industryError, locationError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!formData.name.trim()) next.name = "Vui lòng nhập tên công ty.";
    if (!formData.tax_code.trim()) next.tax_code = "Vui lòng nhập mã số thuế.";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
      next.email = "Email không hợp lệ.";
    if (formData.phone && !/^[\d\s+().-]{6,}$/.test(formData.phone))
      next.phone = "Số điện thoại không hợp lệ.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await dispatch(
        createCompany({
          ...formData,
          location_id: formData.location_id ? Number(formData.location_id) : undefined,
          industry_id: formData.industry_id ? Number(formData.industry_id) : undefined,
        })
      ).unwrap();

      toast.success("Tạo công ty mới thành công 🎉");
      navigate("/admin/companies");
    } catch (err: any) {
      toast.error(err || "Lỗi khi tạo công ty mới");
    } finally {
      setSubmitting(false);
    }
  };

  const metaLoading = submitting || industryLoading || locationLoading;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white  pb-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
            <span className="h-2 w-2 rounded-full bg-purple-600"></span>
            Tạo hồ sơ doanh nghiệp
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900">Tạo công ty mới</h1>
          <p className="mt-1 text-sm text-gray-600">
            Điền thông tin cơ bản của doanh nghiệp. Các trường có dấu * là bắt buộc.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <svg
                  className="h-5 w-5 text-purple-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M3 21h18M5 21V7a2 2 0 012-2h2l2-2 2 2h2a2 2 0 012 2v14" />
                  <path d="M9 13h6M9 17h6M9 9h6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Thông tin công ty</p>
                <p className="text-xs text-gray-500">Cấu hình tên, MST, địa chỉ, liên hệ…</p>
              </div>
            </div>
            {metaLoading && (
              <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" className="opacity-20" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path d="M4 12a8 8 0 018-8" className="opacity-75" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
                Đang tải dữ liệu…
              </div>
            )}
          </div>

          {/* Card body */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Tên công ty */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: Công ty ABC"
                  className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition
                    ${errors.name ? "border-red-300 ring-2 ring-red-100" : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"}`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Mã số thuế */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Mã số thuế <span className="text-red-500">*</span>
                </label>
                <input
                  name="tax_code"
                  value={formData.tax_code}
                  onChange={handleChange}
                  placeholder="VD: 0312xxxxxx"
                  className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition
                    ${errors.tax_code ? "border-red-300 ring-2 ring-red-100" : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"}`}
                />
                {errors.tax_code && <p className="mt-1 text-xs text-red-600">{errors.tax_code}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition
                    ${errors.email ? "border-red-300 ring-2 ring-red-100" : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Số điện thoại */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="VD: 028 3xxx xxx / 09xx xxx xxx"
                  className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition
                    ${errors.phone ? "border-red-300 ring-2 ring-red-100" : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"}`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              {/* Tỉnh/Thành phố */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  disabled={locationLoading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Dùng để gợi ý địa điểm việc làm phù hợp.</p>
              </div>

              {/* Ngành nghề */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">Ngành nghề</label>
                <select
                  name="industry_id"
                  value={formData.industry_id}
                  onChange={handleChange}
                  disabled={industryLoading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="">-- Chọn ngành nghề --</option>
                  {industries.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Hiển thị cho ứng viên biết lĩnh vực hoạt động.</p>
              </div>

              {/* Quy mô công ty */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">Quy mô công ty</label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">-- Chọn quy mô --</option>
                  <option value="Dưới 10 nhân viên">Dưới 10 nhân viên</option>
                  <option value="10 - 150 nhân viên">10 - 150 nhân viên</option>
                  <option value="150 - 300 nhân viên">150 - 300 nhân viên</option>
                  <option value="Trên 300 nhân viên">Trên 300 nhân viên</option>
                </select>
              </div>

              {/* Địa chỉ */}
              <div className="md:col-span-2 flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">Địa chỉ</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="VD: 123 Lê Lợi, Phường Bến Thành, Quận 1, TP. HCM"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Bằng cách tạo công ty, bạn đồng ý với điều khoản sử dụng của hệ thống.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={metaLoading}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={metaLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-purple-400"
              >
                {metaLoading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" className="opacity-20" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path d="M4 12a8 8 0 018-8" className="opacity-75" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                )}
                {metaLoading ? "Đang tạo..." : "Tạo công ty"}
              </button>
            </div>
          </div>
        </div>

        {/* Small helper */}
        <p className="mx-auto mt-4 w-full max-w-4xl text-center text-xs text-gray-500">
          Mẹo: Điền đầy đủ thông tin giúp tăng độ tin cậy với ứng viên.
        </p>
      </div>
    </main>
  );
};

export default CompanyCreate;
