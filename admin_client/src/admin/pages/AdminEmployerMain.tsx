import { useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { fetchEmployerDashboardData } from "@admin/store/redux/dashboardSlice";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import { useTranslation } from "react-i18next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
    <h4 className="text-sm text-gray-500">{title}</h4>
    <p className="text-xl font-bold text-gray-800">{value}</p>
  </div>
);

const ChartCard = ({
  title,
  data,
  stepSize,
}: {
  title: string;
  data: any;
  stepSize?: number;
}) => {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          ...(stepSize ? { stepSize } : {}),
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
      <h4 className="font-semibold text-gray-800 mb-4">{title}</h4>
      <Bar data={data} options={chartOptions} />
    </div>
  );
};

export default function AdminEmployerDashboard() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const {
    applicantsData,
    generalStats,
    jobByStatusData,
    revenuePerMonthData,
    pointPerMonthData,
    paymentSummary,
    loading,
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchEmployerDashboardData());
  }, [dispatch]);

  if (loading) return <p>{t("common.loading")}</p>;

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-y-auto font-sans">
      {/* STAT: JOBS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard
          title={t("employerDashboard.totalJobs")}
          value={generalStats.total_jobs}
        />
        <StatCard
          title={t("employerDashboard.newJobsWeek")}
          value={generalStats.new_jobs_week}
        />
        <StatCard
          title={t("employerDashboard.newJobsMonth")}
          value={generalStats.new_jobs_month}
        />
      </div>

      {/* STAT: PAYMENT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title={t("employerDashboard.totalAmount")}
          value={paymentSummary?.total_amount ?? 0}
        />
        <StatCard
          title={t("employerDashboard.totalPointsBought")}
          value={paymentSummary?.total_points ?? 0}
        />
        <StatCard
          title={t("employerDashboard.totalOrders")}
          value={paymentSummary?.total_orders ?? 0}
        />
        <StatCard
          title={t("employerDashboard.successfulOrders")}
          value={paymentSummary?.successful_orders ?? 0}
        />
      </div>

      {/* CHART: APPLICANTS & JOB STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title={t("employerDashboard.applicantsPerWeek")}
          data={applicantsData}
          stepSize={1}
        />
        <ChartCard
          title={t("employerDashboard.jobsByStatus")}
          data={jobByStatusData}
          stepSize={1}
        />
      </div>

      {/* CHART: REVENUE & POINTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t("employerDashboard.revenuePerMonth")}
          data={revenuePerMonthData}
        />
        <ChartCard
          title={t("employerDashboard.pointsPerMonth")}
          data={pointPerMonthData}
        />
      </div>
    </main>
  );
}
