import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import {
  fetchMyCompany,
  updateCompanyAdditional,
  updateCompanyImage,
} from "@admin/store/redux/companySlice";
import { toast } from "react-toastify";
import Loading from "@components/Loading";
import { Editor } from "@tinymce/tinymce-react";
import config from "../../config/config";

export default function TrademarkPage() {
  const dispatch = useAppDispatch();
  const { company, loading, error } = useAppSelector((state) => state.company);
  const { profile } = useAppSelector((state) => state.profile);

  // chỉ role 1,2 được chỉnh sửa
  const canEdit = [1, 2].includes(profile?.role_id ?? -1);

  const [additionalForm, setAdditionalForm] = useState({
    description: "",
    website: "",
    founded_year: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    dispatch(fetchMyCompany());
  }, [dispatch]);

  useEffect(() => {
    if (company) {
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

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    setAdditionalForm({ ...additionalForm, [e.target.name]: e.target.value });
  };

  const validateInfo = () => {
    if (!canEdit) return false;
    if (additionalForm.website) {
      const ok = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}([/?#].*)?$/i.test(
        additionalForm.website.trim()
      );
      if (!ok) {
        toast.error("Website không hợp lệ (ví dụ: https://example.com)");
        return false;
      }
    }
    if (additionalForm.founded_year) {
      const y = Number(additionalForm.founded_year);
      if (!Number.isInteger(y) || y < 1800 || y > currentYear) {
        toast.error(`Năm thành lập phải là số từ 1800 đến ${currentYear}`);
        return false;
      }
    }
    return true;
  };

  const handleUpdateAdditional = async () => {
    if (!canEdit) return;
    if (!validateInfo()) return;
    try {
      setSavingInfo(true);
      const resultAction = await dispatch(updateCompanyAdditional(additionalForm));
      if (updateCompanyAdditional.fulfilled.match(resultAction)) {
        toast.success("Cập nhật thông tin bổ sung thành công 🎉");
        await dispatch(fetchMyCompany());
      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin bổ sung!");
    } finally {
      setSavingInfo(false);
    }
  };

  const onPickCover = (f?: File | null) => {
    if (!canEdit) return;
    if (!f) return setCoverFile(null);
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Ảnh bìa quá lớn (tối đa 5MB)");
      return;
    }
    setCoverFile(f);
  };

  const onPickLogo = (f?: File | null) => {
    if (!canEdit) return;
    if (!f) return setLogoFile(null);
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Logo quá lớn (tối đa 5MB)");
      return;
    }
    setLogoFile(f);
  };

  const handleUpdateImages = async () => {
    if (!canEdit) return;
    if (!logoFile && !coverFile) {
      toast.info("Vui lòng chọn logo hoặc ảnh bìa cần cập nhật");
      return;
    }
    try {
      setSavingImages(true);
      const payload = new FormData();
      if (logoFile) payload.append("logo", logoFile);
      if (coverFile) payload.append("cover_image", coverFile);

      const resultAction = await dispatch(updateCompanyImage(payload));
      if (updateCompanyImage.fulfilled.match(resultAction)) {
        toast.success("Cập nhật hình ảnh công ty thành công 🎉");
        await dispatch(fetchMyCompany());
        setLogoFile(null);
        setCoverFile(null);
      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật hình ảnh!");
    } finally {
      setSavingImages(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;
  if (!company) return <div className="p-6">Không tìm thấy thông tin công ty</div>;

  const coverSrc = coverFile
    ? URL.createObjectURL(coverFile)
    : company.cover_image
    ? `${config.storageUrl}/${company.cover_image}`
    : "";

  const logoSrc = logoFile
    ? URL.createObjectURL(logoFile)
    : company.logo
    ? `${config.storageUrl}/${company.logo}`
    : "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 font-sans">
      {/* Banner chỉ xem */}
      {!canEdit && (
        <div className="mx-auto mb-4 max-w-5xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Bạn đang ở <b>chế độ chỉ xem</b>. Vui lòng liên hệ quản trị viên nếu cần quyền chỉnh sửa.
        </div>
      )}

      {/* Card: Giới thiệu */}
      <section className="mx-auto mb-6 max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-medium text-gray-900">Giới thiệu công ty</h2>
            <p className="text-xs text-gray-500">Mô tả, website và năm thành lập.</p>
          </div>
          {savingInfo && (
            <div className="inline-flex items-center gap-2 text-xs text-gray-500">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" className="opacity-20" stroke="currentColor" strokeWidth="4" fill="none" />
                <path d="M4 12a8 8 0 018-8" className="opacity-75" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
              Đang lưu…
            </div>
          )}
        </div>

        <div className="px-6 py-6">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Giới thiệu doanh nghiệp</label>
          <Editor
            apiKey="haxna3coe03d4qdw3k17ba77ij7f5jt1hgglor6y0yc0yu3s"
            value={additionalForm.description}
            init={{
              height: 280,
              menubar: false,
              plugins:
                "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
              toolbar: canEdit
                ? "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat"
                : false,
              readonly: !canEdit ? 1 : 0, // TinyMCE readonly
            } as any}
            onEditorChange={(content) =>
              canEdit && setAdditionalForm({ ...additionalForm, description: content })
            }
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Website</label>
              <input
                type="text"
                name="website"
                value={additionalForm.website}
                onChange={handleAdditionalChange}
                disabled={!canEdit}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">Nhập link đầy đủ để ứng viên có thể truy cập.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Năm thành lập</label>
              <input
                type="text"
                name="founded_year"
                value={additionalForm.founded_year}
                onChange={handleAdditionalChange}
                disabled={!canEdit}
                placeholder={`VD: ${currentYear - 10}`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>
          </div>

          {canEdit && (
            <div className="mt-6">
              <button
                onClick={handleUpdateAdditional}
                disabled={savingInfo}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-400"
              >
                {savingInfo && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" className="opacity-20" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path d="M4 12a8 8 0 018-8" className="opacity-75" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                )}
                {savingInfo ? "Đang lưu..." : "Cập nhật thông tin"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Card: Ảnh công ty */}
      <section className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-medium text-gray-900">Ảnh công ty</h2>
          <p className="text-xs text-gray-500">Ảnh bìa và logo thương hiệu (PNG/JPG, ≤ 5MB).</p>
        </div>

        <div className="px-6 py-6">
          {/* Cover */}
          <div className="relative w-full mb-20">
            <div className="h-56 w-full overflow-hidden rounded-xl bg-gray-200 md:h-72">
              {coverSrc ? (
                <img src={coverSrc} alt="Cover" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                  Chưa có ảnh bìa
                </div>
              )}

              {canEdit && (
                <label className="absolute right-3 top-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-gray-700 shadow-md transition hover:bg-white">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 13V16H7L14.293 8.707L11.293 5.707L4 13Z" />
                  </svg>
                  Đổi ảnh bìa
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickCover(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="absolute left-1/2 top-full z-10 -translate-x-1/2 -translate-y-1/2 pb-10">
              <div className="relative w-36 aspect-square rounded-full border-4 border-white bg-gray-100 shadow-lg md:w-44 overflow-hidden">
                {logoSrc ? (
                  <img src={logoSrc} alt="Logo" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-purple-600 text-4xl font-bold text-white">
                    {company.name ? company.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>

              {canEdit && (
                <label className="absolute translate-x-1/4 translate-y-1/4 right-7 bottom-10 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/95 p-2 shadow-md transition hover:bg-white">
                  <svg className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 13V16H7L14.293 8.707L11.293 5.707L4 13Z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickLogo(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {canEdit && (
            <>
              <div className="mt-2 flex flex-wrap items-center pt-10 gap-3">
                {coverFile && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs">
                    <span className="text-gray-700 font-medium">Cover: {coverFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setCoverFile(null)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      title="Bỏ chọn cover"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {logoFile && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs">
                    <span className="text-gray-700 font-medium">Logo: {logoFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setLogoFile(null)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      title="Bỏ chọn logo"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
                      <circle cx="12" cy="12" r="10" className="opacity-20" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path d="M4 12a8 8 0 018-8" className="opacity-75" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                  )}
                  {savingImages ? "Đang cập nhật..." : "Cập nhật hình ảnh"}
                </button>
              </div>
            </>
          )}

          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
            <p className="font-medium text-gray-700">Gợi ý:</p>
            <ul className="mt-1 list-disc pl-5">
              <li>Ảnh bìa ngang, tối thiểu 1200×400 để hiển thị sắc nét.</li>
              <li>Logo nên là hình vuông hoặc PNG nền trong suốt.</li>
              <li>Kích thước tối đa mỗi ảnh 5MB.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
