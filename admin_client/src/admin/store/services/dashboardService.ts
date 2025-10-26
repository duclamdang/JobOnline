import { apiAuth } from "../../../services/api";

export const dashboardService = {
  fetchDashboardData: async () => {
    const [
      jobsRes,
      applicantsRes,
      companiesRes,
      totalJobsRes,
      newJobsWeekRes,
      totalCompaniesRes,
      totalUsersRes,
    ] = await Promise.all([
      apiAuth.get("/admin/dashboard/jobs-per-month", { withCredentials: true }),
      apiAuth.get("/admin/dashboard/applicants-per-week", { withCredentials: true }),
      apiAuth.get("/admin/dashboard/top-companies", { withCredentials: true }),
      apiAuth.get("/admin/dashboard/total-jobs", { withCredentials: true }),
      apiAuth.get("/admin/dashboard/new-jobs-week", { withCredentials: true }),
      apiAuth.get("/admin/dashboard/total-companies", { withCredentials: true }),
      apiAuth.get("/admin/dashboard/total-users", { withCredentials: true }),
    ]);

    return {
      jobsData: {
        labels: jobsRes.data.labels ?? [],
        datasets: [
          {
            label: "Số lượng công việc",
            data: jobsRes.data.data ?? [],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.3)",
            tension: 0.4,
          },
        ],
      },
      applicantsData: {
        labels: applicantsRes.data.labels ?? [],
        datasets: [
          {
            label: "Số lượng ứng viên",
            data: applicantsRes.data.data ?? [],
            backgroundColor: "#3b82f6",
          },
        ],
      },
      topCompanies: companiesRes.data.data ?? [],
      generalStats: {
        total_jobs: totalJobsRes.data.data ?? 0,
        new_jobs: newJobsWeekRes.data.data ?? 0,
        new_applicants: totalUsersRes.data.data ?? 0,
        new_companies: totalCompaniesRes.data.data ?? 0,
      },
    };
  },
};
