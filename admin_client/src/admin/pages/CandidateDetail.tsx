import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchCandidateDetail } from "@admin/store/redux/applicationSlice";
import type { AppDispatch, RootState } from "@context/store";
import {
  MailOutline,
  PhoneOutlined,
  LocationOnOutlined,
  CakeOutlined,
  HomeOutlined,
  WorkOutline,
  PaymentsOutlined,
  SchoolOutlined,
  BusinessCenterOutlined,
  AccessTimeOutlined,
  PictureAsPdfOutlined,
  CloudDownloadOutlined,
} from "@mui/icons-material";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { candidateDetail, loading, error } = useSelector(
    (state: RootState) => state.applications
  );

  useEffect(() => {
    if (id) dispatch(fetchCandidateDetail(Number(id)));
  }, [id, dispatch]);

  const yearAndGender = useMemo(() => {
    if (!candidateDetail) return "-";
    const year = candidateDetail.birthday
      ? new Date(candidateDetail.birthday).getFullYear()
      : undefined;
    const gender = candidateDetail.gender;
    if (!year && !gender) return "-";
    if (year && gender) return `${year}, ${gender}`;
    return String(year ?? gender);
  }, [candidateDetail]);

  const F = (v?: string | number | null) =>
    v !== null && v !== undefined && String(v).trim() !== "" ? String(v) : "-";

  if (loading) return <p className="text-gray-500 px-6 py-6">Đang tải…</p>;
  if (error) return <p className="text-red-500 px-6 py-6">{error}</p>;
  if (!candidateDetail) return <p className="px-6 py-6">Không có dữ liệu.</p>;

  const statusTone = candidateDetail.job_search_status_text?.includes("mở")
    ? "emerald"
    : "sky";

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-emerald-50" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur shadow-lg">
          <div className="absolute -top-16 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-300/30 to-fuchsia-300/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-300/30 to-cyan-300/30 blur-3xl" />

          <div className="relative p-6 md:p-8">
            <div className="flex items-start gap-5">
              <div className="shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-md">
                  <img
                    src={candidateDetail.avatar ?? "/images/default-avatar.png"}
                    alt={candidateDetail.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                    {candidateDetail.name}
                  </h1>
                  {candidateDetail.job_search_status_text && (
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-${statusTone}-100 text-${statusTone}-700 ring-1 ring-${statusTone}-200`}
                    >
                      <span className="inline-block h-2 w-2 rounded-full bg-current" />
                      {candidateDetail.job_search_status_text}
                    </span>
                  )}
                </div>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  {F(candidateDetail.desired_position)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {candidateDetail.cv_file && (
                    <>
                      <a
                        href={candidateDetail.cv_file}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-2 text-white shadow hover:opacity-95 transition"
                      >
                        <PictureAsPdfOutlined fontSize="small" />
                        Xem CV
                      </a>
                      <a
                        href={candidateDetail.cv_file}
                        download
                        className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-indigo-700 hover:bg-indigo-50 transition"
                      >
                        <CloudDownloadOutlined fontSize="small" />
                        Tải CV
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <section className="mt-6">
          <CardSection title="Thông tin cá nhân">
            <InfoItem
              tone="indigo"
              icon={<MailOutline fontSize="small" />}
              label="Email"
              value={F(candidateDetail.email)}
            />
            <InfoItem
              tone="rose"
              icon={<PhoneOutlined fontSize="small" />}
              label="Số điện thoại"
              value={F(candidateDetail.phone)}
            />
            <InfoItem
              tone="amber"
              icon={<CakeOutlined fontSize="small" />}
              label="Năm sinh & Giới tính"
              value={yearAndGender}
            />
            <InfoItem
              tone="emerald"
              icon={<LocationOnOutlined fontSize="small" />}
              label="Tỉnh / Thành phố"
              value={F(candidateDetail.province)}
            />
            <InfoItem
              tone="cyan"
              icon={<HomeOutlined fontSize="small" />}
              label="Địa chỉ"
              value={F(candidateDetail.address)}
            />
          </CardSection>
        </section>
        <section className="mt-6">
          <CardSection title="Thông tin chung">
            <InfoItem
              tone="violet"
              icon={<BusinessCenterOutlined fontSize="small" />}
              label="Vị trí mong muốn"
              value={F(candidateDetail.desired_position)}
            />
            <InfoItem
              tone="sky"
              icon={<WorkOutline fontSize="small" />}
              label="Cấp bậc hiện tại"
              value={F(candidateDetail.position)}
            />
            <InfoItem
              tone="pink"
              icon={<PaymentsOutlined fontSize="small" />}
              label="Mức lương mong muốn"
              value={F(candidateDetail.salary_range)}
            />
            <InfoItem
              tone="lime"
              icon={<AccessTimeOutlined fontSize="small" />}
              label="Hình thức làm việc"
              value={F(candidateDetail.working_form)}
            />
            <InfoItem
              tone="indigo"
              icon={<AccessTimeOutlined fontSize="small" />}
              label="Số năm kinh nghiệm"
              value={F(candidateDetail.work_experience)}
            />
            <InfoItem
              tone="emerald"
              icon={<BusinessCenterOutlined fontSize="small" />}
              label="Nghề nghiệp / Lĩnh vực"
              value={F(candidateDetail.work_field)}
            />
            <InfoItem
              tone="orange"
              icon={<SchoolOutlined fontSize="small" />}
              label="Học vấn"
              value={F(candidateDetail.education)}
            />
            <InfoItem
              tone="teal"
              icon={<PaymentsOutlined fontSize="small" />}
              label="Ngân hàng"
              value={F(candidateDetail.bank_info)}
            />
          </CardSection>
        </section>
        {candidateDetail.cv_file && (
          <div className="mt-6 rounded-3xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              File đính kèm
            </h2>
            <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-gray-100">
              <iframe
                title="CV Preview"
                src={`${candidateDetail.cv_file}#view=fitH`}
                className="w-full h-[720px] bg-gray-50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur shadow-lg">
      <div className="px-6 pt-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children}
        </div>
      </div>
      <div className="px-6 pt-6 pb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  tone = "indigo",
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?:
    | "indigo"
    | "rose"
    | "emerald"
    | "cyan"
    | "amber"
    | "violet"
    | "sky"
    | "pink"
    | "lime"
    | "orange"
    | "teal";
}) {
  const ring = `ring-${tone}-200`;
  const bg = `bg-${tone}-50`;
  const dot = `bg-${tone}-500`;

  return (
    <div
      className={`group rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-4 transition hover:bg-white hover:shadow-md`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${bg} ${ring} ring-1`}
        >
          {icon}
        </span>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
          <span>{label}</span>
        </div>
      </div>
      <div className="mt-2 text-gray-900">{value}</div>
    </div>
  );
}
