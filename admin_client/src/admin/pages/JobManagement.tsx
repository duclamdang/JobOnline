import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import { fetchJobs, toggleJobStatus, Job } from "@admin/store/redux/jobSlice";
import { useNavigate } from "react-router-dom";
import { ReusableTable, Column } from "../components/ReusableTable";
import {
  Add,
  BusinessCenter,
  Edit,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import Loading from "@components/Loading";
import { useTranslation } from "react-i18next";

export default function JobManagement() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { jobs, loading, error, meta } = useAppSelector((state) => state.jobs);

  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  useEffect(() => {
    dispatch(fetchJobs({ page, perPage: rowsPerPage }));
  }, [dispatch, page]);

  const handleViewEdit = (job: Job) => {
    navigate(`/admin/job/${job.id}`);
  };

  const handleToggleStatus = async (job: Job) => {
    try {
      await dispatch(
        toggleJobStatus({ id: job.id, currentStatus: job.is_active })
      ).unwrap();

      const newStatusLabel = job.is_active
        ? t("jobPage.status.inactive")
        : t("jobPage.status.active");

      toast.success(
        t("jobPage.toast.toggleStatusSuccess", { status: newStatusLabel })
      );
    } catch {
      toast.error(t("jobPage.toast.toggleStatusError"));
    }
  };

  const columns: Column<Job>[] = [
    {
      key: "title",
      title: t("jobPage.columns.job"),
      render: (job) => (
        <div className="flex items-center gap-2">
          <img
            src={job.company_logo ?? ""}
            alt="logo"
            className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
          />
          <span className="font-medium text-gray-700">{job.title ?? ""}</span>
        </div>
      ),
    },
    {
      key: "salary_range",
      title: t("jobPage.columns.salary"),
      render: (job) => (
        <span className="text-sm font-semibold text-sky-600">
          {job.salary_negotiable
            ? t("jobPage.salary.negotiable")
            : job.salary_range || t("jobPage.salary.notUpdated")}
        </span>
      ),
    },
    {
      key: "location",
      title: t("jobPage.columns.location"),
    },
    {
      key: "is_active",
      title: t("jobPage.columns.status"),
      render: (job) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
            job.is_active
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-gray-100 text-gray-600 border border-gray-300"
          }`}
        >
          {job.is_active
            ? t("jobPage.status.active")
            : t("jobPage.status.inactive")}
        </span>
      ),
    },
    {
      title: t("jobPage.columns.actions"),
      render: (job) => (
        <div className="flex gap-2">
          <button
            className="p-1.5 rounded-lg hover:bg-sky-100 text-sky-600 transition"
            onClick={() => handleViewEdit(job)}
          >
            <Edit fontSize="small" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
            onClick={() => handleToggleStatus(job)}
          >
            {job.is_active ? (
              <Visibility fontSize="small" />
            ) : (
              <VisibilityOff fontSize="small" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <BusinessCenter className="text-sky-500" fontSize="large" />
          <h1 className="text-2xl font-bold text-gray-800">
            {t("jobPage.title")}
          </h1>
        </div>
        <button
          onClick={() => navigate("/admin/job/add")}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          <Add fontSize="small" />
          {t("jobPage.addJobButton")}
        </button>
      </div>

      <div className="border-b-2 border-sky-500 mb-6"></div>

      {loading && <Loading />}
      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <ReusableTable columns={columns} data={jobs} />
      </div>

      {/* Pagination */}
      {meta && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
            (num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  page === num
                    ? "bg-sky-500 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {num}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
