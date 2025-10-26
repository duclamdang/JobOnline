import { Job } from "@admin/store/redux/jobSlice";

interface JobFormProps {
  job: Job | null;
  setJob: React.Dispatch<React.SetStateAction<Job | null>>;
  provinces: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  experiences: { id: number; title: string }[];
  educations: { id: number; title: string }[];
  positions: { id: number; title: string }[];
  workFields: { id: number; title: string }[];
  /** NEW: danh mục hình thức làm việc (Onsite/Hybrid/Remote/Full-time/Part-time...) */
  workingForms: { id: number; title: string }[];
  onSubmit: () => void;
  onCancel?: () => void;
  fetchDistricts: (provinceId: number) => Promise<void>;
}

export default function JobForm({
  job,
  setJob,
  provinces,
  districts,
  experiences,
  educations,
  positions,
  workFields,
  workingForms,
  onSubmit,
  onCancel,
  fetchDistricts,
}: JobFormProps) {
  if (!job) return null;

  const handleChange = <K extends keyof Job>(field: K, value: Job[K]) =>
    setJob((prev) => (prev ? { ...prev, [field]: value } : prev));

  const formatVND = (value?: number) =>
    value ? new Intl.NumberFormat("vi-VN").format(value) + " ₫" : "";

  // === Date helpers: chỉ lấy YYYY-MM-DD & không cho chọn ngày quá khứ ===
  const toDateOnly = (s?: string) => {
    if (!s) return "";
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const todayStr = (() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  return (
    <form className="space-y-12">
      <Section title="Thông tin cơ bản">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Tiêu đề"
            value={job.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          {/* ĐÃ ĐỔI: type=date + min=todayStr (không quá khứ), bỏ time */}
          <Input
            label="Ngày hết hạn"
            type="date"
            required
            min={todayStr}
            value={toDateOnly(job.end_date)}
            onChange={(e) => handleChange("end_date", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-2">
            <input
              id="salary_negotiable"
              type="checkbox"
              checked={job.salary_negotiable ?? false}
              onChange={(e) =>
                handleChange("salary_negotiable", e.target.checked)
              }
              className="w-6 h-6 accent-blue-600"
            />
            <label
              htmlFor="salary_negotiable"
              className="text-base font-semibold text-gray-700"
            >
              Lương thỏa thuận
            </label>
          </div>

          {!job.salary_negotiable && (
            <>
              <Input
                label="Lương từ"
                value={job.salary_from ? formatVND(job.salary_from) : ""}
                onChange={(e) =>
                  handleChange(
                    "salary_from",
                    Number(e.target.value.replace(/\D/g, ""))
                  )
                }
              />
              <Input
                label="Lương đến"
                value={job.salary_to ? formatVND(job.salary_to) : ""}
                onChange={(e) =>
                  handleChange(
                    "salary_to",
                    Number(e.target.value.replace(/\D/g, ""))
                  )
                }
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label="Tỉnh/TP"
            value={job.province_id?.toString() || ""}
            options={provinces.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            onChange={(e) => {
              const provinceId = Number(e.target.value);
              handleChange("province_id", provinceId);
              fetchDistricts(provinceId);
            }}
          />

          <Select
            label="Quận/Huyện"
            value={job.district_id?.toString() || ""}
            options={districts.map((d) => ({
              value: d.id.toString(),
              label: d.name,
            }))}
            onChange={(e) =>
              handleChange("district_id", Number(e.target.value))
            }
          />

          <Input
            label="Địa chỉ chi tiết"
            placeholder="VD: 23 Trần Cao Vân, phường Đa Kao"
            value={job.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </div>
      </Section>

      <Section title="Thông tin tuyển dụng">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Số lượng tuyển"
            type="number"
            value={job.quantity?.toString() || ""}
            onChange={(e) => handleChange("quantity", Number(e.target.value))}
          />

          {/* NEW: Hình thức làm việc = working_form_id (đúng trường) */}
          <Select
            label="Hình thức làm việc"
            value={job.working_form_id?.toString() || ""}
            options={workingForms.map((wf) => ({
              value: wf.id.toString(),
              label: wf.title,
            }))}
            onChange={(e) =>
              handleChange("working_form_id", Number(e.target.value))
            }
          />

          <Select
            label="Kinh nghiệm"
            value={job.work_experience_id?.toString() || ""}
            options={experiences.map((ex) => ({
              value: ex.id.toString(),
              label: ex.title,
            }))}
            onChange={(e) =>
              handleChange("work_experience_id", Number(e.target.value))
            }
          />

          <Select
            label="Trình độ"
            value={job.education_id?.toString() || ""}
            options={educations.map((ed) => ({
              value: ed.id.toString(),
              label: ed.title,
            }))}
            onChange={(e) =>
              handleChange("education_id", Number(e.target.value))
            }
          />
          <Select
            label="Vị trí"
            value={job.position_id?.toString() || ""}
            options={positions.map((po) => ({
              value: po.id.toString(),
              label: po.title,
            }))}
            onChange={(e) =>
              handleChange("position_id", Number(e.target.value))
            }
          />
          <Select
            label="Lĩnh vực"
            value={job.work_field_id?.[0]?.toString() || ""}
            options={workFields.map((wf) => ({
              value: wf.id.toString(),
              label: wf.title,
            }))}
            onChange={(e) =>
              handleChange("work_field_id", [Number(e.target.value)])
            }
          />

          {/* ĐÃ GỠ select is_fulltime */}
          <Select
            label="Trạng thái"
            value={job.is_active ? "true" : "false"}
            options={[
              { value: "true", label: "Còn tuyển" },
              { value: "false", label: "Ngưng tuyển" },
            ]}
            onChange={(e) =>
              handleChange("is_active", e.target.value === "true")
            }
          />
          <Select
            label="Mức độ ưu tiên"
            value={job.is_urgent ? "true" : "false"}
            options={[
              { value: "true", label: "Gấp" },
              { value: "false", label: "Không gấp" },
            ]}
            onChange={(e) =>
              handleChange("is_urgent", e.target.value === "true")
            }
          />
          <Select
            label="Giới tính"
            value={job.gender?.toString() || "0"}
            options={[
              { value: "0", label: "Không yêu cầu" },
              { value: "1", label: "Nam" },
              { value: "2", label: "Nữ" },
            ]}
            onChange={(e) =>
              handleChange("gender", Number(e.target.value) as Job["gender"])
            }
          />
        </div>
      </Section>

      <Section title="Kỹ năng">
        <Input
          label="Kỹ năng (ngăn cách bằng dấu ,)"
          value={job.skills || ""}
          onChange={(e) => handleChange("skills", e.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {job.skills
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm shadow"
              >
                {skill}
              </span>
            ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Textarea
          label="Mô tả công việc"
          value={job.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        <Textarea
          label="Yêu cầu"
          value={job.requirements || ""}
          onChange={(e) => handleChange("requirements", e.target.value)}
        />
      </div>

      <Section title="Phúc lợi">
        <Textarea
          label="Phúc lợi"
          value={job.benefit || ""}
          onChange={(e) => handleChange("benefit", e.target.value)}
        />
      </Section>

      <div className="text-right">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg"
          >
            Đóng
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Lưu
        </button>
      </div>
    </form>
  );
}

/* ==== Sub components ==== */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-5 text-gray-800 border-l-4 border-blue-600 pl-3 uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
function Input({ label, ...props }: InputProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-md border border-gray-300 px-3 py-2.5"
      />
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
}
function Select({ label, options, ...props }: SelectProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <select {...props} className="w-full border rounded-md px-3 py-2.5">
        <option value="">-- Chọn --</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
function Textarea({ label, rows = 4, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        {...props}
        rows={rows}
        className="w-full border rounded-md px-3 py-2.5"
      />
    </div>
  );
}
