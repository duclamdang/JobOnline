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
import { Line, Bar } from "react-chartjs-2";
import { fetchDashboardData } from "@admin/store/redux/dashboardSlice";
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
  type,
  data,
}: {
  title: string;
  type: "line" | "bar";
  data: any;
}) => {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
      <h4 className="font-semibold text-gray-800 mb-4">{title}</h4>
      {type === "line" ? (
        <Line data={data} options={chartOptions} />
      ) : (
        <Bar data={data} options={chartOptions} />
      )}
    </div>
  );
};

type Company = {
  id: number;
  name: string;
  jobs_count: number;
  applicants_count: number;
};

const medal = (rank: number) => {
  if (rank === 1) return "1";
  if (rank === 2) return "2";
  if (rank === 3) return "3";
  return rank.toString();
};

const TopCompaniesTable = ({ companies }: { companies: Company[] }) => {
  const { t } = useTranslation();
  const sorted = [...companies].sort((a, b) => b.jobs_count - a.jobs_count);
  const maxJobs = Math.max(1, ...sorted.map((c) => c.jobs_count));

  return (
    <section className="bg-white rounded-lg shadow border border-gray-100">
      <header className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800">
          {t("rootDashboard.topCompaniesTitle")}
        </h4>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="w-16 px-4 py-3 text-left font-medium"></th>
              <th className="px-4 py-3 text-left font-medium">
                {t("rootDashboard.colCompany")}
              </th>
              <th className="px-4 py-3 text-right font-medium">
                {t("rootDashboard.colJobsCount")}
              </th>
              <th className="px-4 py-3 text-right font-medium">
                {t("rootDashboard.colApplicantsCount")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const pct = Math.round((c.jobs_count / maxJobs) * 100);

              return (
                <tr
                  key={c.id}
                  className="group transition-colors border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 align-middle">
                    <div
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold ${
                        isTop3
                          ? "bg-amber-50 text-blue-700 ring-1 ring-blue-200"
                          : "bg-blue-100 text-blue-700"
                      }`}
                      aria-label={t("rootDashboard.rankLabel", { rank })}
                      title={t("rootDashboard.rankLabel", { rank })}
                    >
                      {medal(rank)}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-800 font-medium">
                        {c.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle text-right">
                    <div className="inline-block min-w-[6rem] text-right">
                      <span className="font-semibold text-gray-800">
                        {c.jobs_count}
                      </span>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${pct}%` }}
                          aria-hidden
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle text-right">
                    <span className="inline-flex items-center justify-end min-w-[4rem] font-medium text-gray-700">
                      {c.applicants_count}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default function AdminRootDashboard() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const {
    jobsData,
    applicantsData,
    topCompanies,
    generalStats,
    revenuePerMonthData,
    pointPerMonthData,
    paymentSummary,
    loading,
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading) return <p>{t("common.loading")}</p>;

  return (
    <main className="flex-1 bg-gray-50 min-h-screen overflow-y-auto font-sans">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* SYSTEM OVERVIEW */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t("rootDashboard.systemOverview")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t("rootDashboard.totalJobs")}
              value={generalStats.total_jobs}
            />
            <StatCard
              title={t("rootDashboard.newJobsWeek")}
              value={generalStats.new_jobs}
            />
            <StatCard
              title={t("rootDashboard.totalApplicants")}
              value={generalStats.new_applicants}
            />
            <StatCard
              title={t("rootDashboard.totalCompanies")}
              value={generalStats.new_companies}
            />
          </div>
        </section>

        {/* POINTS OVERVIEW */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t("rootDashboard.pointsOverview")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t("rootDashboard.totalAmount")}
              value={paymentSummary?.total_amount ?? 0}
            />
            <StatCard
              title={t("rootDashboard.totalPointsBought")}
              value={paymentSummary?.total_points ?? 0}
            />
            <StatCard
              title={t("rootDashboard.totalOrders")}
              value={paymentSummary?.total_orders ?? 0}
            />
            <StatCard
              title={t("rootDashboard.successfulOrders")}
              value={paymentSummary?.successful_orders ?? 0}
            />
          </div>
        </section>

        {/* JOB / APPLICANT CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title={t("rootDashboard.jobsPerMonth")}
            type="line"
            data={jobsData}
          />
          <ChartCard
            title={t("rootDashboard.applicantsPerWeek")}
            type="bar"
            data={applicantsData}
          />
        </section>

        {/* REVENUE / POINTS CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title={t("rootDashboard.revenuePerMonth")}
            type="line"
            data={revenuePerMonthData}
          />
          <ChartCard
            title={t("rootDashboard.pointsPerMonth")}
            type="line"
            data={pointPerMonthData}
          />
        </section>

        {/* TOP COMPANIES */}
        <TopCompaniesTable companies={topCompanies} />
      </div>
    </main>
  );
}
