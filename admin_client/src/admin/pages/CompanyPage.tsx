import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import {
  fetchMyCompany,
  updateCompanyBasic,
  updateCompanyLicense,
} from "@admin/store/redux/companySlice";
import { fetchProvinces } from "@admin/store/redux/locationSlice";
import { fetchIndustries } from "@admin/store/redux/industrySlice";
import { toast } from "react-toastify";
import Loading from "@components/Loading";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";

export default function CompanyPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { company, loading, error } = useAppSelector((state) => state.company);
  const { provinces } = useAppSelector((state) => state.location);
  const { industries } = useAppSelector((state) => state.industry);
  const { profile } = useAppSelector((state) => state.profile); // ⬅️ lấy role

  // chỉ role 1 hoặc 2 mới được chỉnh sửa
  const canEdit = [1, 2].includes(profile?.role_id ?? -1);

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

  const [submittingBasic, setSubmittingBasic] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);

  useEffect(() => {
    dispatch(fetchMyCompany());
    dispatch(fetchProvinces());
    dispatch(fetchIndustries());
  }, [dispatch]);

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
    }
  }, [company]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateBasic = async () => {
    if (!canEdit) {
      toast.info("Bạn không có quyền chỉnh sửa. Chỉ được xem.");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Tên công ty không được để trống!");
      return;
    }
    setSubmittingBasic(true);
    try {
      const resultAction = await dispatch(updateCompanyBasic(formData));
      if (updateCompanyBasic.fulfilled.match(resultAction)) {
        toast.success("Cập nhật thông tin công ty thành công 🎉");
        await dispatch(fetchMyCompany());
      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật!");
    } finally {
      setSubmittingBasic(false);
    }
  };

  const handleUploadLicense = async () => {
    if (!canEdit) {
      toast.info("Bạn không có quyền tải lên giấy phép. Chỉ được xem.");
      return;
    }
    if (!licenseFile) {
      toast.warning("Vui lòng chọn file giấy phép kinh doanh!");
      return;
    }
    if (!licenseFile.type.includes("pdf")) {
      toast.error("Vui lòng chọn file PDF hợp lệ!");
      return;
    }

    setUploadingLicense(true);
    try {
      const resultAction = await dispatch(updateCompanyLicense(licenseFile));
      if (updateCompanyLicense.fulfilled.match(resultAction)) {
        toast.success("Cập nhật giấy phép kinh doanh thành công 🎉");
        await dispatch(fetchMyCompany());
        setLicenseFile(null);
      } else {
        toast.error("Tải lên thất bại!");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tải lên!");
    } finally {
      setUploadingLicense(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: !canEdit, // ⬅️ khóa dropzone khi không có quyền
    onDrop: (acceptedFiles) => {
      setLicenseFile(acceptedFiles[0]);
    },
  });

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;
  if (!company)
    return <div className="p-6">Không tìm thấy thông tin công ty</div>;

  const fieldDisabled = !canEdit || submittingBasic;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-6 font-sans">
      {/* Tabs/Header */}
      <div className="mx-auto mb-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
            <button
              onClick={() => navigate("/admin/profile")}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-purple-700"
            >
              Thông tin tài khoản
            </button>
            <button
              onClick={() => navigate("/admin/company")}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm"
            >
              Thông tin công ty
            </button>
          </div>
        </div>

        {!canEdit && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Bạn đang ở <b>chế độ chỉ xem</b>. Vui lòng liên hệ quản trị viên nếu
            cần quyền chỉnh sửa.
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-5xl gap-6">
        {/* Card: Thông tin công ty */}
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
                  Thông tin công ty
                </p>
                <p className="text-xs text-gray-500">
                  Cập nhật tên, MST, địa chỉ, liên hệ…
                </p>
              </div>
            </div>
            {submittingBasic && canEdit && (
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
                Đang lưu…
              </div>
            )}
          </div>

          <div className="px-6 py-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Mã số thuế */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Mã số thuế
                </label>
                <input
                  type="text"
                  value={company.tax_code || ""}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-700 outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  MST được cấp và không thể chỉnh sửa tại đây.
                </p>
              </div>

              {/* Tên công ty */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={fieldDisabled}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Quy mô */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Quy mô nhân sự
                </label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  disabled={fieldDisabled}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">Chọn quy mô</option>
                  <option value="Dưới 10 nhân viên">Dưới 10 nhân viên</option>
                  <option value="10 - 150 nhân viên">10 - 150 nhân viên</option>
                  <option value="150 - 300 nhân viên">
                    150 - 300 nhân viên
                  </option>
                  <option value="Trên 300 nhân viên">Trên 300 nhân viên</option>
                </select>
              </div>

              {/* Địa điểm */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Địa điểm
                </label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  disabled={fieldDisabled}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value={0}>Chọn tỉnh/thành</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Phục vụ hiển thị vị trí trên hồ sơ công ty.
                </p>
              </div>

              {/* Địa chỉ */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={fieldDisabled}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Lĩnh vực */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Lĩnh vực hoạt động
                </label>
                <select
                  name="industry_id"
                  value={formData.industry_id}
                  onChange={handleChange}
                  disabled={fieldDisabled}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value={0}>Chọn lĩnh vực</option>
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
                  Địa chỉ email liên hệ
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  disabled={fieldDisabled}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Điện thoại */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-700">
                  Điện thoại cố định
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="VD: 028 3xxx xxx / 09xx xxx xxx"
                  disabled={fieldDisabled}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {canEdit && (
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateBasic}
                  disabled={submittingBasic}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-400"
                >
                  {submittingBasic && (
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
                  {submittingBasic ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Card: Giấy phép kinh doanh */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-medium text-gray-900">
              Giấy phép kinh doanh
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Tải lên bản PDF GPKD có dấu giáp lai hoặc công chứng.
            </p>
          </div>

          <div className="px-6 py-6">
            {company.business_license ? (
              <p className="mb-3 text-sm text-gray-600">
                Giấy phép hiện tại:
                <a
                  href={`${company.business_license}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 font-medium text-purple-700 underline"
                >
                  {company.business_license.split("/").pop() || "Xem giấy phép"}
                </a>
              </p>
            ) : (
              <p className="mb-3 text-sm italic text-gray-500">
                Chưa cập nhật giấy phép kinh doanh
              </p>
            )}

            {/* Dropzone */}
            <div
              {...(canEdit ? getRootProps() : {})}
              className={`group rounded-xl border-2 border-dashed p-6 text-center transition
                ${
                  !canEdit
                    ? "cursor-not-allowed opacity-60"
                    : isDragActive
                    ? "border-purple-600 bg-purple-50 cursor-pointer"
                    : "border-gray-300 hover:border-purple-600 hover:bg-gray-50 cursor-pointer"
                }`}
            >
              {canEdit && <input {...getInputProps()} />}
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
                      {canEdit ? (
                        <>
                          Kéo thả hoặc{" "}
                          <span className="font-medium text-purple-700 underline">
                            nhấn để chọn
                          </span>{" "}
                          file PDF
                        </>
                      ) : (
                        "Bạn không có quyền tải lên"
                      )}
                    </p>
                    {canEdit && (
                      <p className="text-xs text-gray-500">
                        Chỉ chấp nhận định dạng .pdf
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            {canEdit && (
              <div className="mt-4 flex items-center gap-3">
                {licenseFile && (
                  <button
                    onClick={() => setLicenseFile(null)}
                    disabled={uploadingLicense}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    Xóa file
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
                  {uploadingLicense ? "Đang tải lên..." : "Tải lên"}
                </button>
              </div>
            )}

            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
              <p className="font-medium text-gray-700">Lưu ý:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>Chứng thực tài khoản doanh nghiệp.</li>
                <li>Tạo lòng tin với Người Tìm Việc.</li>
                <li>
                  GPKD hợp lệ: có dấu giáp lai cơ quan thẩm quyền; nếu là bản
                  photo phải có dấu công chứng.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
