import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import {
  createJob,
  updateJob,
  getJobById,
  Job,
  CreateJobPayload,
  UpdateJobPayload,
} from "@admin/store/redux/jobSlice";
import { apiAuth } from "@services/api";
import { toast } from "react-toastify";
import Loading from "@components/Loading";
import JobForm from "@admin/components/JobForm";
import { toDateOnly, validateAndSanitizeJob } from "@utils/jobValidation";
import { useTranslation } from "react-i18next";

type JobEditorProps =
  | { mode: "create"; jobId?: never }
  | { mode: "edit"; jobId: number };

export default function JobEditor(props: JobEditorProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { admin } = useAppSelector((s) => s.auth);
  const { selectedJob, loading, error } = useAppSelector((s) => s.jobs);

  const [job, setJob] = useState<Job | null>(null);

  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>(
    []
  );
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>(
    []
  );
  const [experiences, setExperiences] = useState<
    { id: number; title: string }[]
  >([]);
  const [educations, setEducations] = useState<{ id: number; title: string }[]>(
    []
  );
  const [positions, setPositions] = useState<{ id: number; title: string }[]>(
    []
  );
  const [workFields, setWorkFields] = useState<{ id: number; title: string }[]>(
    []
  );
  const [workingForms, setWorkingForms] = useState<
    { id: number; title: string }[]
  >([]);

  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const isEdit = props.mode === "edit";
  const isLoading =
    loading || loadingCatalogs || loadingDistricts || (isEdit && !job);

  useEffect(() => {
    if (isEdit && props.jobId) {
      dispatch(getJobById(props.jobId));
    }
  }, [dispatch, isEdit, props]);

  useEffect(() => {
    if (isEdit && selectedJob) {
      setJob(selectedJob);
      if (selectedJob.province_id) {
        fetchDistricts(selectedJob.province_id);
      }
    }
  }, [isEdit, selectedJob]);
  useEffect(() => {
    if (!isEdit) {
      setJob({
        id: 0,
        company_id: admin?.company_id || null,
        create_by: admin?.id || 0,
        title: "",
        description: "",
        quantity: 1,
        salary_from: null,
        salary_to: null,
        salary_negotiable: false,
        province_id: null,
        district_id: null,
        working_form_id: null,
        work_field_id: [],
        work_experience_id: null,
        education_id: null,
        position_id: null,
        requirements: "",
        end_date: "",
        is_fulltime: true,
        slug: "",
        skills: "",
        is_active: true,
        is_urgent: false,
        gender: 0,
        benefit: "",
        address: "",
        created_at: "",
        updated_at: "",
      });
    }
  }, [admin, isEdit]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [provinceRes, expRes, eduRes, posRes, wfRes, wformRes] =
          await Promise.all([
            apiAuth.get("/locations/provinces"),
            apiAuth.get("/catalogs/work-experiences"),
            apiAuth.get("/catalogs/educations"),
            apiAuth.get("/catalogs/positions"),
            apiAuth.get("/catalogs/work-fields"),
            apiAuth.get("/catalogs/working-forms"),
          ]);
        setProvinces(provinceRes.data.data);
        setExperiences(expRes.data.data);
        setEducations(eduRes.data.data);
        setPositions(posRes.data.data);
        setWorkFields(wfRes.data.data);
        setWorkingForms(wformRes.data.data);
      } catch {
        toast.error(t("jobEditor.catalogError"));
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchCatalogs();
  }, [t]);

  const fetchDistricts = async (provinceId: number) => {
    setLoadingDistricts(true);
    try {
      const res = await apiAuth.get(`/locations/districts/${provinceId}`);
      setDistricts(res.data.data);
    } catch {
      toast.error(t("jobEditor.districtError"));
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleSubmit = async () => {
    if (!job) return;

    const { ok, errors, sanitized } = validateAndSanitizeJob(job);
    if (!ok) {
      toast.error(
        <div>
          <b>{t("jobEditor.validationTitle")}</b>
          <ul className="list-disc ml-5 mt-2">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>,
        { autoClose: 5000 }
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      if (isEdit) {
        const payload: UpdateJobPayload = {
          title: sanitized.title ?? job.title,
          description: sanitized.description ?? job.description,
          quantity: sanitized.quantity ?? job.quantity,
          salary_from: sanitized.salary_negotiable
            ? null
            : sanitized.salary_from ?? job.salary_from,
          salary_to: sanitized.salary_negotiable
            ? null
            : sanitized.salary_to ?? job.salary_to,
          province_id: sanitized.province_id ?? undefined,
          district_id: sanitized.district_id ?? undefined,
          address: sanitized.address ?? job.address ?? "",
          salary_negotiable:
            sanitized.salary_negotiable ?? job.salary_negotiable ?? false,
          working_form_id:
            sanitized.working_form_id ?? job.working_form_id ?? undefined,
          work_field_id: Array.isArray(sanitized.work_field_id)
            ? sanitized.work_field_id
            : Array.isArray(job.work_field_id)
            ? job.work_field_id
            : [],
          work_experience_id:
            sanitized.work_experience_id ?? job.work_experience_id ?? undefined,
          education_id: sanitized.education_id ?? job.education_id ?? undefined,
          position_id: sanitized.position_id ?? job.position_id ?? undefined,
          requirements: sanitized.requirements ?? job.requirements,
          end_date: sanitized.end_date || toDateOnly(job.end_date),
          is_fulltime: Boolean(sanitized.is_fulltime ?? job.is_fulltime),
          skills: job.skills,
          is_active: Boolean(sanitized.is_active ?? job.is_active),
          is_urgent: Boolean(sanitized.is_urgent ?? job.is_urgent),
          gender: sanitized.gender ?? job.gender,
          benefit: job.benefit ?? "",
        };

        await dispatch(updateJob({ id: job.id, data: payload })).unwrap();
        toast.success(t("jobEditor.updateSuccess"));
      } else {
        const payload: CreateJobPayload = {
          ...job,
          ...sanitized,
          company_id: admin?.company_id || 0,
          create_by: admin?.id || 0,
          work_field_id: Array.isArray(sanitized.work_field_id)
            ? sanitized.work_field_id
            : [],
          salary_negotiable:
            typeof sanitized.salary_negotiable === "boolean"
              ? sanitized.salary_negotiable
              : job.salary_negotiable ?? false,
          salary_from: sanitized.salary_negotiable
            ? null
            : sanitized.salary_from ?? job.salary_from,
          salary_to: sanitized.salary_negotiable
            ? null
            : sanitized.salary_to ?? job.salary_to,
          end_date: sanitized.end_date || toDateOnly(job.end_date),
        };

        await dispatch(createJob(payload)).unwrap();
        toast.success(t("jobEditor.createSuccess"));
        navigate("/admin/job");
      }
    } catch {
      toast.error(
        isEdit ? t("jobEditor.updateFail") : t("jobEditor.createFail")
      );
    }
  };

  if (isLoading) return <Loading />;

  if (error && isEdit)
    return (
      <div className="p-6 text-red-500">
        {t("jobEditor.errorPrefix")}: {error}
      </div>
    );

  if (!job) return <div className="p-6">{t("jobEditor.notFound")}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200 w-full max-w-7xl mx-auto">
        {isEdit && (
          <div className="flex items-center gap-6 border-b pb-6 mb-8 bg-gray-50 rounded-lg p-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
            </div>
          </div>
        )}

        <JobForm
          job={job}
          setJob={setJob}
          provinces={provinces}
          districts={districts}
          fetchDistricts={fetchDistricts}
          experiences={experiences}
          educations={educations}
          positions={positions}
          workFields={workFields}
          workingForms={workingForms}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/job")}
        />
      </div>
    </div>
  );
}
