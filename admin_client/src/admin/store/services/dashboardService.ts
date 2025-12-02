import { apiAuth } from "../../../services/api";
import i18n from "../../../i18n";
export const dashboardService = {
  fetchRootDashboardData: async () => {
    const [
      jobsRes,
      applicantsRes,
      companiesRes,
      totalJobsRes,
      newJobsWeekRes,
      totalCompaniesRes,
      totalUsersRes,
      revenuePerMonthRes,
      pointsPerMonthRes,
      paymentSummaryRes,
    ] = await Promise.all([
      apiAuth.get("/admin/dashboard/jobs-per-month", { withCredentials: true }),
      apiAuth.get("/admin/dashboard/applicants-per-week", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/dashboard/top-companies", { withCredentials: true }),
      apiAuth.get("/admin/dashboard/total-jobs", { withCredentials: true }),
      apiAuth.get("/admin/dashboard/new-jobs-week", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/dashboard/total-companies", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/dashboard/total-users", { withCredentials: true }),
      apiAuth.get("/admin/dashboard/revenue-per-month", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/dashboard/points-per-month", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/dashboard/payment-summary", {
        withCredentials: true,
      }),
    ]);

    return {
      jobsData: {
        labels: jobsRes.data.labels ?? [],
        datasets: [
          {
            label: i18n.t("rootDashboard.dataset.jobsCount"),
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
            label: i18n.t("rootDashboard.dataset.applicantsCount"),
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
        new_jobs_week: newJobsWeekRes.data.data ?? 0,
        new_jobs_month: 0,
      },

      revenuePerMonthData: {
        labels: revenuePerMonthRes.data.labels ?? [],
        datasets: [
          {
            label: i18n.t("rootDashboard.dataset.revenueTopup"),
            data: revenuePerMonthRes.data.data ?? [],
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.3)",
            tension: 0.4,
          },
        ],
      },
      pointPerMonthData: {
        labels: pointsPerMonthRes.data.labels ?? [],
        datasets: [
          {
            label: i18n.t("rootDashboard.dataset.pointsBought"),
            data: pointsPerMonthRes.data.data ?? [],
            borderColor: "#f97316",
            backgroundColor: "rgba(249,115,22,0.3)",
            tension: 0.4,
          },
        ],
      },
      paymentSummary: paymentSummaryRes.data.data ?? {
        total_amount: 0,
        total_points: 0,
        total_orders: 0,
        successful_orders: 0,
        last_payment_at: null,
      },
    };
  },

  fetchEmployerDashboardData: async () => {
    const [
      applicantsPerWeekRes,
      totalJobsRes,
      newJobsWeekRes,
      newJobsMonthRes,
      jobsByStatusRes,
      revenuePerMonthRes,
      pointPerMonthRes,
      paymentSummaryRes,
    ] = await Promise.all([
      apiAuth.get("/admin/employer-dashboard/applicants-per-week", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/employer-dashboard/total-jobs", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/employer-dashboard/new-jobs-week", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/employer-dashboard/new-jobs-month", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/employer-dashboard/job-by-status", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/employer-dashboard/revenue-per-month", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/employer-dashboard/point-per-month", {
        withCredentials: true,
      }),
      apiAuth.get("/admin/employer-dashboard/payment-summary", {
        withCredentials: true,
      }),
    ]);

    const applicantsData = {
      labels: applicantsPerWeekRes.data.labels ?? [],
      datasets: [
        {
          label: i18n.t("employerDashboard.dataset.applicantsCount"),
          data: applicantsPerWeekRes.data.data ?? [],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.3)",
          tension: 0.4,
        },
      ],
    };

    const generalStats = {
      total_jobs: totalJobsRes.data.data ?? 0,
      new_jobs_week: newJobsWeekRes.data.data ?? 0,
      new_jobs_month: newJobsMonthRes.data.data ?? 0,
    };

    const jobByStatusData = {
      labels: jobsByStatusRes.data.labels ?? [],
      datasets: [
        {
          label: i18n.t("employerDashboard.dataset.jobsByStatus"),
          data: jobsByStatusRes.data.data ?? [],
          backgroundColor: [
            "rgba(59,130,246,0.6)",
            "rgba(248,113,113,0.6)",
            "rgba(156,163,175,0.6)",
          ],
          borderWidth: 1,
        },
      ],
    };

    const revenuePerMonthData = {
      labels: revenuePerMonthRes.data.labels ?? [],
      datasets: [
        {
          label: i18n.t("employerDashboard.dataset.revenueBuyPoints"),
          data: revenuePerMonthRes.data.data ?? [],
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.3)",
          tension: 0.4,
        },
      ],
    };

    const pointPerMonthData = {
      labels: pointPerMonthRes.data.labels ?? [],
      datasets: [
        {
          label: i18n.t("employerDashboard.dataset.pointsBought"),
          data: pointPerMonthRes.data.data ?? [],
          borderColor: "#a855f7",
          backgroundColor: "rgba(168,85,247,0.3)",
          tension: 0.4,
        },
      ],
    };

    const paymentSummary = paymentSummaryRes.data.data ?? {
      total_amount: 0,
      total_points: 0,
      total_orders: 0,
      successful_orders: 0,
      last_payment_at: null,
    };

    return {
      applicantsData,
      generalStats,
      jobByStatusData,
      revenuePerMonthData,
      pointPerMonthData,
      paymentSummary,
    };
  },
};
