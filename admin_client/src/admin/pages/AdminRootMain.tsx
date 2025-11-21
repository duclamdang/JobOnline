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
  const sorted = [...companies].sort((a, b) => b.jobs_count - a.jobs_count);
  const maxJobs = Math.max(1, ...sorted.map((c) => c.jobs_count));

  return (
    <section className="bg-white rounded-lg shadow border border-gray-100">
      <header className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800">
          Xếp hạng công ty đăng nhiều việc nhất
        </h4>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="w-16 px-4 py-3 text-left font-medium"></th>
              <th className="px-4 py-3 text-left font-medium">Công ty</th>
              <th className="px-4 py-3 text-right font-medium">
                Số lượng công việc
              </th>
              <th className="px-4 py-3 text-right font-medium">Số ứng viên</th>
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
                  className={
                    "group transition-colors border-t border-gray-100 hover:bg-gray-50"
                  }
                >
                  <td className="px-4 py-3 align-middle">
                    <div
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold ${
                        isTop3
                          ? "bg-amber-50 text-blue-700 ring-1 ring-blue-200"
                          : "bg-blue-100 text-blue-700"
                      }`}
                      aria-label={`Hạng ${rank}`}
                      title={`Hạng ${rank}`}
                    >
                      {medal(rank)}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-800 font-medium">
                          {c.name}
                        </span>
                      </div>
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
  const { jobsData, applicantsData, topCompanies, generalStats, loading } =
    useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-y-auto font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Tổng số công việc" value={generalStats.total_jobs} />
        <StatCard title="Công việc mới" value={generalStats.new_jobs} />
        <StatCard title="Tổng ứng viên" value={generalStats.new_applicants} />
        <StatCard title="Tổng công ty" value={generalStats.new_companies} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Công việc theo tháng" type="line" data={jobsData} />
        <ChartCard
          title="Ứng viên theo tuần"
          type="bar"
          data={applicantsData}
        />
      </div>
      <TopCompaniesTable companies={topCompanies} />
    </main>
  );
}
