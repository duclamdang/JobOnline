import { Job } from "@admin/store/redux/jobSlice";

export const toDateOnly = (val?: string): string => {
  if (!val) return "";
  const m = val.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
};

export const isFutureDate = (yyyyMMdd: string): boolean => {
  if (!yyyyMMdd) return false;
  const [y, m, d] = yyyyMMdd.split("-").map(Number);
  const end = new Date(y, (m ?? 1) - 1, d ?? 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end.getTime() > today.getTime();
};

const asInt = (v: unknown) =>
  typeof v === "number" ? v : parseInt(String(v ?? "0"), 10);

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  sanitized: Partial<Job>;
};

export const validateAndSanitizeJob = (job: Job): ValidationResult => {
  const errors: string[] = [];
  const sanitized: Partial<Job> = {};

  // Required + min-length
  if (!job.title?.trim()) errors.push("Tiêu đề công việc là bắt buộc.");
  if (!job.province_id) errors.push("Vui lòng chọn Tỉnh/Thành phố.");
  if (!job.working_form_id) errors.push("Vui lòng chọn Hình thức làm việc.");
  if (!job.work_field_id || job.work_field_id.length === 0) {
    errors.push("Vui lòng chọn ít nhất 1 Ngành nghề.");
  }
  if (!job.description?.trim() || job.description.trim().length < 20) {
    errors.push("Mô tả công việc tối thiểu 20 ký tự.");
  }
  if (!job.requirements?.trim() || job.requirements.trim().length < 10) {
    errors.push("Yêu cầu ứng viên tối thiểu 10 ký tự.");
  }

  // quantity
  const quantity = Math.max(1, asInt(job.quantity));
  if (!Number.isFinite(quantity) || quantity < 1) {
    errors.push("Số lượng tuyển phải là số nguyên ≥ 1.");
  } else {
    sanitized.quantity = quantity;
  }

  // salary
  const MIN_SALARY = 1_000_000;
  const MAX_SALARY = 1_000_000_000;
  if (job.salary_negotiable) {
    sanitized.salary_negotiable = true;
    sanitized.salary_from = null;
    sanitized.salary_to = null;
  } else {
    const sf = job.salary_from == null ? NaN : asInt(job.salary_from);
    const st = job.salary_to == null ? NaN : asInt(job.salary_to);
    if (!Number.isFinite(sf) || !Number.isFinite(st)) {
      errors.push("Lương từ/đến là bắt buộc khi không chọn Thương lượng.");
    } else {
      if (sf < MIN_SALARY || st < MIN_SALARY) {
        errors.push(`Lương phải ≥ ${MIN_SALARY.toLocaleString("vi-VN")} VND.`);
      }
      if (sf > MAX_SALARY || st > MAX_SALARY) {
        errors.push(`Lương phải ≤ ${MAX_SALARY.toLocaleString("vi-VN")} VND.`);
      }
      if (st < sf) errors.push("Lương đến phải ≥ Lương từ.");
      sanitized.salary_negotiable = false;
      sanitized.salary_from = sf;
      sanitized.salary_to = st;
    }
  }

  // end_date: date-only & > today
  const endDateOnly = toDateOnly(job.end_date);
  if (!endDateOnly) {
    errors.push("Vui lòng chọn Ngày hết hạn.");
  } else if (!isFutureDate(endDateOnly)) {
    errors.push("Ngày hết hạn phải sau hôm nay.");
  } else {
    sanitized.end_date = endDateOnly;
  }

  // trim fields
  sanitized.title = job.title?.trim();
  sanitized.description = job.description?.trim();
  sanitized.requirements = job.requirements?.trim();
  sanitized.address = job.address?.trim() || job.address;

  // normalize ids
  sanitized.province_id = job.province_id ?? null;
  sanitized.district_id = job.district_id ?? null;
  sanitized.working_form_id = job.working_form_id ?? null;
  sanitized.work_field_id = Array.isArray(job.work_field_id)
    ? job.work_field_id
    : [];
  sanitized.work_experience_id = job.work_experience_id ?? null;
  sanitized.education_id = job.education_id ?? null;
  sanitized.position_id = job.position_id ?? null;

  // flags
  sanitized.is_fulltime = Boolean(job.is_fulltime);
  sanitized.is_active = Boolean(job.is_active);
  sanitized.is_urgent = Boolean(job.is_urgent);
  sanitized.gender = job.gender ?? 0;

  return { ok: errors.length === 0, errors, sanitized };
};
