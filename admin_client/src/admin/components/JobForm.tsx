import { Job } from "@admin/store/redux/jobSlice";
import { useTranslation } from "react-i18next";

interface JobFormProps {
  job: Job | null;
  setJob: React.Dispatch<React.SetStateAction<Job | null>>;
  provinces: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  experiences: { id: number; title: string }[];
  educations: { id: number; title: string }[];
  positions: { id: number; title: string }[];
  workFields: { id: number; title: string }[];
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
  const { t } = useTranslation();

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
      <Section title={t("jobForm.sections.basicInfo")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t("jobForm.fields.title")}
            value={job.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <Input
            label={t("jobForm.fields.expiredAt")}
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
              {t("jobForm.fields.salaryNegotiable")}
            </label>
          </div>

          {!job.salary_negotiable && (
            <>
              <Input
                label={t("jobForm.fields.salaryFrom")}
                value={job.salary_from ? formatVND(job.salary_from) : ""}
                onChange={(e) =>
                  handleChange(
                    "salary_from",
                    Number(e.target.value.replace(/\D/g, ""))
                  )
                }
              />
              <Input
                label={t("jobForm.fields.salaryTo")}
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
            label={t("jobForm.fields.province")}
            value={job.province_id?.toString() || ""}
            options={provinces.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            placeholder={t("jobForm.select.placeholder")}
            onChange={(e) => {
              const provinceId = Number(e.target.value);
              handleChange("province_id", provinceId);
              fetchDistricts(provinceId);
            }}
          />

          <Select
            label={t("jobForm.fields.district")}
            value={job.district_id?.toString() || ""}
            options={districts.map((d) => ({
              value: d.id.toString(),
              label: d.name,
            }))}
            placeholder={t("jobForm.select.placeholder")}
            onChange={(e) =>
              handleChange("district_id", Number(e.target.value))
            }
          />

          <Input
            label={t("jobForm.fields.address")}
            placeholder={t("jobForm.placeholders.address")}
            value={job.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </div>
      </Section>

      <Section title={t("jobForm.sections.recruitmentInfo")}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label={t("jobForm.fields.quantity")}
            type="number"
            value={job.quantity?.toString() || ""}
            onChange={(e) => handleChange("quantity", Number(e.target.value))}
          />

          <Select
            label={t("jobForm.fields.workingForm")}
            value={job.working_form_id?.toString() || ""}
            options={workingForms.map((wf) => ({
              value: wf.id.toString(),
              label: wf.title,
            }))}
            placeholder={t("jobForm.select.placeholder")}
            onChange={(e) =>
              handleChange("working_form_id", Number(e.target.value))
            }
          />

          <Select
            label={t("jobForm.fields.experience")}
            value={job.work_experience_id?.toString() || ""}
            options={experiences.map((ex) => ({
              value: ex.id.toString(),
              label: ex.title,
            }))}
            placeholder={t("jobForm.select.placeholder")}
            onChange={(e) =>
              handleChange("work_experience_id", Number(e.target.value))
            }
          />

          <Select
            label={t("jobForm.fields.education")}
            value={job.education_id?.toString() || ""}
            options={educations.map((ed) => ({
              value: ed.id.toString(),
              label: ed.title,
            }))}
            placeholder={t("jobForm.select.placeholder")}
            onChange={(e) =>
              handleChange("education_id", Number(e.target.value))
            }
          />

          <Select
            label={t("jobForm.fields.position")}
            value={job.position_id?.toString() || ""}
            options={positions.map((po) => ({
              value: po.id.toString(),
              label: po.title,
            }))}
            placeholder={t("jobForm.select.placeholder")}
            onChange={(e) =>
              handleChange("position_id", Number(e.target.value))
            }
          />

          <Select
            label={t("jobForm.fields.workField")}
            value={job.work_field_id?.[0]?.toString() || ""}
            options={workFields.map((wf) => ({
              value: wf.id.toString(),
              label: wf.title,
            }))}
            placeholder={t("jobForm.select.placeholder")}
            onChange={(e) =>
              handleChange("work_field_id", [Number(e.target.value)])
            }
          />

          <Select
            label={t("jobForm.fields.status")}
            value={job.is_active ? "true" : "false"}
            options={[
              { value: "true", label: t("jobForm.options.statusActive") },
              { value: "false", label: t("jobForm.options.statusInactive") },
            ]}
            placeholder={t("jobForm.select.placeholder")}
            onChange={(e) =>
              handleChange("is_active", e.target.value === "true")
            }
          />

          <Select
            label={t("jobForm.fields.priority")}
            value={job.is_urgent ? "true" : "false"}
            options={[
              { value: "true", label: t("jobForm.options.priorityUrgent") },
              { value: "false", label: t("jobForm.options.priorityNormal") },
            ]}
            placeholder={t("jobForm.select.placeholder")}
            onChange={(e) =>
              handleChange("is_urgent", e.target.value === "true")
            }
          />

          <Select
            label={t("jobForm.fields.gender")}
            value={job.gender?.toString() || "0"}
            options={[
              { value: "0", label: t("jobForm.options.genderAny") },
              { value: "1", label: t("jobForm.options.genderMale") },
              { value: "2", label: t("jobForm.options.genderFemale") },
            ]}
            placeholder={t("jobForm.select.placeholder")}
            onChange={(e) =>
              handleChange("gender", Number(e.target.value) as Job["gender"])
            }
          />
        </div>
      </Section>

      <Section title={t("jobForm.sections.skills")}>
        <Input
          label={t("jobForm.fields.skillsWithHint")}
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
          label={t("jobForm.fields.description")}
          value={job.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        <Textarea
          label={t("jobForm.fields.requirements")}
          value={job.requirements || ""}
          onChange={(e) => handleChange("requirements", e.target.value)}
        />
      </div>

      <Section title={t("jobForm.sections.benefits")}>
        <Textarea
          label={t("jobForm.fields.benefits")}
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
            {t("jobForm.buttons.close")}
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {t("jobForm.buttons.save")}
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
  placeholder?: string;
}
function Select({ label, options, placeholder, ...props }: SelectProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <select {...props} className="w-full border rounded-md px-3 py-2.5">
        <option value="">{placeholder ?? "-- Chọn --"}</option>
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
