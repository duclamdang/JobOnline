import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import {
  fetchCompanyById,
  updateCompanyBasicById,
  updateCompanyLicenseById,
  updateCompanyAdditionalById,
  updateCompanyImageById,
} from "@admin/store/redux/companySlice";
import { fetchProvinces } from "@admin/store/redux/locationSlice";
import { fetchIndustries } from "@admin/store/redux/industrySlice";
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import { useDropzone } from "react-dropzone";
import Loading from "@components/Loading";
import { useTranslation } from "react-i18next";

export default function CompanyManagement() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { company, loading, error } = useAppSelector((state) => state.company);
  const { provinces } = useAppSelector((state) => state.location);
  const { industries } = useAppSelector((state) => state.industry);

  const [tab, setTab] = useState<"basic" | "license" | "additional" | "images">(
    "basic"
  );
  const [isFetching, setIsFetching] = useState(true);

  const [savingBasic, setSavingBasic] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [savingImages, setSavingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company_size: "",
    location_id: 0,
    address: "",
    industry_id: 0,
    email: "",
    phone: "",
  });

  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const [additionalForm, setAdditionalForm] = useState({
    description: "",
    website: "",
    founded_year: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsFetching(true);
      try {
        await Promise.all([
          dispatch(fetchCompanyById(Number(id))),
          dispatch(fetchProvinces()),
          dispatch(fetchIndustries()),
        ]);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [dispatch, id]);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        company_size: company.company_size || "",
        location_id: company.location_id || 0,
        address: company.address || "",
        industry_id: company.industry_id || 0,
        email: company.email || "",
        phone: company.phone || "",
      });
      setAdditionalForm({
        description: company.description || "",
        website: company.website || "",
        founded_year:
          company.founded_year !== undefined && company.founded_year !== null
            ? String(company.founded_year)
            : "",
      });
    }
  }, [company]);

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateBasic = async () => {
    if (!id) return;
    if (!formData.name.trim()) {
      toast.error(t("companyManagement.toast.basicNameRequired"));
      return;
    }
    try {
      setSavingBasic(true);
      await dispatch(
        updateCompanyBasicById({ id: Number(id), data: formData })
      ).unwrap();
      toast.success(t("companyManagement.toast.basicUpdateSuccess"));
      await dispatch(fetchCompanyById(Number(id))).unwrap();
    } catch {
      toast.error(t("companyManagement.toast.basicUpdateError"));
    } finally {
      setSavingBasic(false);
    }
  };

  const handleUploadLicense = async () => {
    if (!id || !licenseFile) {
      toast.warning(t("companyManagement.toast.licenseSelectWarning"));
      return;
    }
    try {
      setUploadingLicense(true);
      await dispatch(
        updateCompanyLicenseById({ id: Number(id), file: licenseFile })
      ).unwrap();
      toast.success(t("companyManagement.toast.licenseUpdateSuccess"));
      setLicenseFile(null);
      dispatch(fetchCompanyById(Number(id)));
    } catch {
      toast.error(t("companyManagement.toast.licenseUpdateError"));
    } finally {
      setUploadingLicense(false);
    }
  };

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAdditionalForm({ ...additionalForm, [e.target.name]: e.target.value });

  const handleUpdateAdditional = async () => {
    if (!id) return;
    try {
      setSavingAdd(true);
      await dispatch(
        updateCompanyAdditionalById({ id: Number(id), data: additionalForm })
      ).unwrap();
      toast.success(t("companyManagement.toast.additionalUpdateSuccess"));
      dispatch(fetchCompanyById(Number(id)));
    } catch {
      toast.error(t("companyManagement.toast.additionalUpdateError"));
    } finally {
      setSavingAdd(false);
    }
  };

  const handleUpdateImages = async () => {
    if (!id) return;
    const payload = new FormData();
    if (logoFile) payload.append("logo", logoFile);
    if (coverFile) payload.append("cover_image", coverFile);
    try {
      setSavingImages(true);
      await dispatch(
        updateCompanyImageById({ id: Number(id), data: payload })
      ).unwrap();
      toast.success(t("companyManagement.toast.imagesUpdateSuccess"));
      setLogoFile(null);
      setCoverFile(null);
      dispatch(fetchCompanyById(Number(id)));
    } catch {
      toast.error(t("companyManagement.toast.imagesUpdateError"));
    } finally {
      setSavingImages(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    onDrop: (acceptedFiles) => setLicenseFile(acceptedFiles[0]),
  });

  if (loading || isFetching) return <Loading />;
  if (error)
    return (
      <div className="p-6 text-red-600">
        {t("companyManagement.common.errorLabel")}: {error}
      </div>
    );
  if (!company)
    return <div className="p-6">{t("companyManagement.common.notFound")}</div>;

  const coverSrc = coverFile
    ? URL.createObjectURL(coverFile)
    : company.cover_image
    ? `${company.cover_image}`
    : "";

  const logoSrc = logoFile
    ? URL.createObjectURL(logoFile)
    : company.logo
    ? `${company.logo}`
    : "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 font-sans">
      {/* Header */}
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("companyManagement.header.title")} {company.name}
        </h2>
        <button
          onClick={() => navigate("/admin/companies")}
          className="text-sm font-medium text-purple-700 underline underline-offset-2 hover:opacity-90"
        >
          {t("companyManagement.header.back")}
        </button>
      </div>

      {/* Tabs */}
      <div className="mx-auto mb-6 max-w-6xl">
        <div className="inline-flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
          {(
            [
              { key: "basic", label: t("companyManagement.tabs.basic") },
              { key: "license", label: t("companyManagement.tabs.license") },
              {
                key: "additional",
                label: t("companyManagement.tabs.additional"),
              },
              { key: "images", label: t("companyManagement.tabs.images") },
            ] as const
          ).map((tItem) => (
            <button
              key={tItem.key}
              onClick={() => setTab(tItem.key)}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                tab === tItem.key
                  ? "bg-purple-600 font-medium text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-purple-700"
              }`}
            >
              {tItem.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6">
        {/* TAB: BASIC */}
        {tab === "basic" && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
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
                    {t("companyManagement.sections.basic.title")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("companyManagement.sections.basic.subtitle")}
                  </p>
                </div>
              </div>
              {savingBasic && (
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
                  {t("companyManagement.common.saving")}
                </div>
              )}
            </div>

            <div className="px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                {/* MST */}
                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm font-medium text-gray-700">
                    {t("companyManagement.basic.taxCode")}
                  </label>
                  <input
                    type="text"
                    value={company.tax_code || ""}
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-700 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t("companyManagement.basic.taxNote")}
                  </p>
                </div>

                {/* Tên công ty */}
                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm font-medium text-gray-700">
                    {t("companyManagement.basic.name")}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleBasicChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* Quy mô */}
                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm font-medium text-gray-700">
                    {t("companyManagement.basic.companySize")}
                  </label>
                  <select
                    name="company_size"
                    value={formData.company_size}
                    onChange={handleBasicChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="">
                      {t("companyManagement.basic.sizeOptions.placeholder")}
                    </option>
                    <option value="Dưới 10 nhân viên">
                      {t("companyManagement.basic.sizeOptions.lt10")}
                    </option>
                    <option value="10 - 150 nhân viên">
                      {t("companyManagement.basic.sizeOptions.b10_150")}
                    </option>
                    <option value="150 - 300 nhân viên">
                      {t("companyManagement.basic.sizeOptions.b150_300")}
                    </option>
                    <option value="Trên 300 nhân viên">
                      {t("companyManagement.basic.sizeOptions.gt300")}
                    </option>
                  </select>
                </div>

                {/* Tỉnh/Thành */}
                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm font-medium text-gray-700">
                    {t("companyManagement.basic.location")}
                  </label>
                  <select
                    name="location_id"
                    value={formData.location_id}
                    onChange={handleBasicChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    <option value={0}>
                      {t("companyManagement.basic.locationPlaceholder")}
                    </option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Địa chỉ */}
                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm font-medium text-gray-700">
                    {t("companyManagement.basic.address")}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleBasicChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* Lĩnh vực */}
                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm font-medium text-gray-700">
                    {t("companyManagement.basic.industry")}
                  </label>
                  <select
                    name="industry_id"
                    value={formData.industry_id}
                    onChange={handleBasicChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    <option value={0}>
                      {t("companyManagement.basic.industryPlaceholder")}
                    </option>
                    {industries.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm font-medium text-gray-700">
                    {t("companyManagement.basic.email")}
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleBasicChange}
                    placeholder="contact@company.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* Điện thoại */}
                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm font-medium text-gray-700">
                    {t("companyManagement.basic.phone")}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleBasicChange}
                    placeholder={t("companyManagement.basic.phonePlaceholder")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {t("companyManagement.common.cancel")}
                </button>
                <button
                  onClick={handleUpdateBasic}
                  disabled={savingBasic}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-400"
                >
                  {savingBasic && (
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
                  {savingBasic
                    ? t("companyManagement.basic.updating")
                    : t("companyManagement.basic.updateButton")}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB: LICENSE */}
        {tab === "license" && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-medium text-gray-900">
                  {t("companyManagement.license.title")}
                </h2>
                <p className="text-xs text-gray-500">
                  {t("companyManagement.license.subtitle")}
                </p>
              </div>
              {uploadingLicense && (
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
                  {t("companyManagement.common.uploading")}
                </div>
              )}
            </div>

            <div className="px-6 py-6">
              {company.business_license ? (
                <p className="mb-3 text-sm text-gray-600">
                  {t("companyManagement.license.currentFile")}
                  <a
                    href={`${company.business_license}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 font-medium text-purple-700 underline"
                  >
                    {company.business_license.split("/").pop() ||
                      t("companyManagement.license.viewLicense")}
                  </a>
                </p>
              ) : (
                <p className="mb-3 text-sm italic text-gray-500">
                  {t("companyManagement.license.noLicense")}
                </p>
              )}

              <div
                {...getRootProps()}
                className={`group cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition
                ${
                  isDragActive
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-300 hover:border-purple-600 hover:bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
                    <svg
                      className="h-5 w-5 text-purple-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
                      <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                    </svg>
                  </div>
                  {licenseFile ? (
                    <p className="text-sm font-medium text-gray-700">
                      {licenseFile.name} ({(licenseFile.size / 1024).toFixed(1)}{" "}
                      KB)
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700">
                        {t("companyManagement.license.dropText")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("companyManagement.license.extensionHint")}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {licenseFile && (
                  <button
                    onClick={() => setLicenseFile(null)}
                    disabled={uploadingLicense}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {t("companyManagement.license.removeFile")}
                  </button>
                )}
                <button
                  onClick={handleUploadLicense}
                  disabled={uploadingLicense}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-400"
                >
                  {uploadingLicense && (
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
                  {uploadingLicense
                    ? t("companyManagement.license.uploadingButton")
                    : t("companyManagement.license.uploadButton")}
                </button>
              </div>

              <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
                <p className="font-medium text-gray-700">
                  {t("companyManagement.license.noteTitle")}
                </p>
                <ul className="mt-1 list-disc pl-5">
                  <li>{t("companyManagement.license.notes.0")}</li>
                  <li>{t("companyManagement.license.notes.1")}</li>
                  <li>{t("companyManagement.license.notes.2")}</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* TAB: ADDITIONAL */}
        {tab === "additional" && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-medium text-gray-900">
                  {t("companyManagement.additional.title")}
                </h2>
                <p className="text-xs text-gray-500">
                  {t("companyManagement.additional.subtitle")}
                </p>
              </div>
              {savingAdd && (
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
                  {t("companyManagement.common.saving")}
                </div>
              )}
            </div>

            <div className="px-6 py-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("companyManagement.additional.descriptionLabel")}
              </label>
              <Editor
                apiKey="haxna3coe03d4qdw3k17ba77ij7f5jt1hgglor6y0yc0yu3s"
                value={additionalForm.description}
                init={{
                  height: 280,
                  menubar: false,
                  plugins:
                    "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
                  toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
                }}
                onEditorChange={(content) =>
                  setAdditionalForm({ ...additionalForm, description: content })
                }
              />

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {t("companyManagement.additional.websiteLabel")}
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={additionalForm.website}
                    onChange={handleAdditionalChange}
                    placeholder={t(
                      "companyManagement.additional.websitePlaceholder"
                    )}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {t("companyManagement.additional.foundedYearLabel")}
                  </label>
                  <input
                    type="text"
                    name="founded_year"
                    value={additionalForm.founded_year}
                    onChange={handleAdditionalChange}
                    placeholder={t(
                      "companyManagement.additional.foundedYearPlaceholder"
                    )}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleUpdateAdditional}
                  disabled={savingAdd}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-400"
                >
                  {savingAdd && (
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
                  {savingAdd
                    ? t("companyManagement.additional.updating")
                    : t("companyManagement.additional.updateButton")}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB: IMAGES */}
        {tab === "images" && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-medium text-gray-900">
                {t("companyManagement.images.title")}
              </h2>
              <p className="text-xs text-gray-500">
                {t("companyManagement.images.subtitle")}
              </p>
            </div>

            <div className="px-6 py-6">
              <div className="relative mb-20 w-full">
                <div className="h-56 w-full overflow-hidden rounded-xl bg-gray-200 md:h-72">
                  {coverSrc ? (
                    <img
                      src={coverSrc}
                      alt="Cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                      {t("companyManagement.images.noCover")}
                    </div>
                  )}

                  <label className="absolute right-3 top-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-gray-700 shadow-md transition hover:bg-white">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 13V16H7L14.293 8.707L11.293 5.707L4 13Z" />
                    </svg>
                    {t("companyManagement.images.changeCover")}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setCoverFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="absolute left-1/2 top-full z-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative w-36 aspect-square overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg md:w-44">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt="Logo"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-purple-600 text-4xl font-bold text-white">
                        {company.name
                          ? company.name.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                    )}
                  </div>

                  <label className="absolute bottom-0 right-7 translate-x-1/4 translate-y-1/4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/95 p-2 shadow-md transition hover:bg-white">
                    <svg
                      className="h-5 w-5 text-gray-700"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 13V16H7L14.293 8.707L11.293 5.707L4 13Z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 pt-10">
                {coverFile && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs">
                    <span className="font-medium text-gray-700">
                      {t("companyManagement.images.coverChip")} {coverFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCoverFile(null)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      title={t("companyManagement.images.removeCoverTitle")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                {logoFile && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs">
                    <span className="font-medium text-gray-700">
                      {t("companyManagement.images.logoChip")} {logoFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLogoFile(null)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      title={t("companyManagement.images.removeLogoTitle")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleUpdateImages}
                  disabled={savingImages}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-400"
                >
                  {savingImages && (
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
                  {savingImages
                    ? t("companyManagement.images.updating")
                    : t("companyManagement.images.updateButton")}
                </button>
              </div>

              <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
                <p className="font-medium text-gray-700">
                  {t("companyManagement.images.hintTitle")}
                </p>
                <ul className="mt-1 list-disc pl-5">
                  <li>{t("companyManagement.images.hints.0")}</li>
                  <li>{t("companyManagement.images.hints.1")}</li>
                  <li>{t("companyManagement.images.hints.2")}</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
