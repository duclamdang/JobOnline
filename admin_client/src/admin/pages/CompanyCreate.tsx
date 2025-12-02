import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import { createCompany } from "../store/redux/companySlice";
import { fetchProvinces } from "@admin/store/redux/locationSlice";
import { fetchIndustries } from "@admin/store/redux/industrySlice";
import { useTranslation } from "react-i18next";

const CompanyCreate: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { provinces } = useAppSelector((s) => s.location);
  const {
    industries,
    loading: industryLoading,
    error: industryError,
  } = useAppSelector((s) => s.industry);
  const { loading: locationLoading, error: locationError } = useAppSelector(
    (s) => s.location
  );

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
      toast.error(t("companyCreate.toast.loadMetaError"));
    }
  }, [industryError, locationError, t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!formData.name.trim())
      next.name = t("companyCreate.validation.nameRequired");
    if (!formData.tax_code.trim())
      next.tax_code = t("companyCreate.validation.taxCodeRequired");
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
      next.email = t("companyCreate.validation.emailInvalid");
    if (formData.phone && !/^[\d\s+().-]{6,}$/.test(formData.phone))
      next.phone = t("companyCreate.validation.phoneInvalid");
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
          location_id: formData.location_id
            ? Number(formData.location_id)
            : undefined,
          industry_id: formData.industry_id
            ? Number(formData.industry_id)
            : undefined,
        })
      ).unwrap();

      toast.success(t("companyCreate.toast.createSuccess"));
      navigate("/admin/companies");
    } catch (err: any) {
      const msg = err?.message || t("companyCreate.toast.createErrorDefault");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const metaLoading = submitting || industryLoading || locationLoading;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
            <span className="h-2 w-2 rounded-full bg-purple-600"></span>
            {t("companyCreate.header.chip")}
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900">
            {t("companyCreate.header.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t("companyCreate.header.subtitle")}
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
                <p className="text-sm font-medium text-gray-900">
                  {t("companyCreate.card.title")}
                </p>
                <p className="text-xs text-gray-500">
                  {t("companyCreate.card.subtitle")}
                </p>
              </div>
            </div>
            {metaLoading && (
              <div className="inline-flex items-center gap-2 text-xs text-gray-500">
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
                {t("companyCreate.card.loading")}
              </div>
            )}
          </div>

          {/* Card body */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Tên công ty */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  {t("companyCreate.fields.name.label")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("companyCreate.fields.name.placeholder")}
                  className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition
                    ${
                      errors.name
                        ? "border-red-300 ring-2 ring-red-100"
                        : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Mã số thuế */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  {t("companyCreate.fields.taxCode.label")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="tax_code"
                  value={formData.tax_code}
                  onChange={handleChange}
                  placeholder={t("companyCreate.fields.taxCode.placeholder")}
                  className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition
                    ${
                      errors.tax_code
                        ? "border-red-300 ring-2 ring-red-100"
                        : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    }`}
                />
                {errors.tax_code && (
                  <p className="mt-1 text-xs text-red-600">{errors.tax_code}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  {t("companyCreate.fields.email.label")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("companyCreate.fields.email.placeholder")}
                  className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition
                    ${
                      errors.email
                        ? "border-red-300 ring-2 ring-red-100"
                        : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  {t("companyCreate.fields.phone.label")}
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("companyCreate.fields.phone.placeholder")}
                  className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition
                    ${
                      errors.phone
                        ? "border-red-300 ring-2 ring-red-100"
                        : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Tỉnh/Thành phố */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  {t("companyCreate.fields.location.label")}
                </label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  disabled={locationLoading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="">
                    {t("companyCreate.fields.location.placeholder")}
                  </option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {t("companyCreate.fields.location.helper")}
                </p>
              </div>

              {/* Ngành nghề */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  {t("companyCreate.fields.industry.label")}
                </label>
                <select
                  name="industry_id"
                  value={formData.industry_id}
                  onChange={handleChange}
                  disabled={industryLoading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="">
                    {t("companyCreate.fields.industry.placeholder")}
                  </option>
                  {industries.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {t("companyCreate.fields.industry.helper")}
                </p>
              </div>

              {/* Quy mô công ty */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  {t("companyCreate.fields.companySize.label")}
                </label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">
                    {t("companyCreate.fields.companySize.placeholder")}
                  </option>
                  <option value="Dưới 10 nhân viên">
                    {t("companyCreate.fields.companySize.options.lt10")}
                  </option>
                  <option value="10 - 150 nhân viên">
                    {t("companyCreate.fields.companySize.options.10_150")}
                  </option>
                  <option value="150 - 300 nhân viên">
                    {t("companyCreate.fields.companySize.options.150_300")}
                  </option>
                  <option value="Trên 300 nhân viên">
                    {t("companyCreate.fields.companySize.options.gt300")}
                  </option>
                </select>
              </div>

              {/* Địa chỉ */}
              <div className="md:col-span-2 flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  {t("companyCreate.fields.address.label")}
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t("companyCreate.fields.address.placeholder")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              {t("companyCreate.footer.notice")}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={metaLoading}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("companyCreate.footer.cancel")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={metaLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-purple-400"
              >
                {metaLoading && (
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
                {metaLoading
                  ? t("companyCreate.footer.submitting")
                  : t("companyCreate.footer.submit")}
              </button>
            </div>
          </div>
        </div>

        {/* Small helper */}
        <p className="mx-auto mt-4 w-full max-w-4xl text-center text-xs text-gray-500">
          {t("companyCreate.helper.tip")}
        </p>
      </div>
    </main>
  );
};

export default CompanyCreate;
