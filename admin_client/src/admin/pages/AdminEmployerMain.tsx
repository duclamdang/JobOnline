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

const ChartCard = ({ title, data }: { title: string; data: any }) => {
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
      <Bar data={data} options={chartOptions} />
    </div>
  );
};

export default function AdminEmployerDashboard() {
  const dispatch = useAppDispatch();
  const { applicantsData, generalStats, loading } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchEmployerDashboardData());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-y-auto font-sans">
      {/* cards tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard title="Tổng số công việc" value={generalStats.total_jobs} />
        <StatCard
          title="Công việc mới trong tuần"
          value={generalStats.new_jobs_week}
        />
        <StatCard
          title="Công việc mới trong tháng"
          value={generalStats.new_jobs_month}
        />
      </div>

      {/* chart ứng viên theo tuần */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <ChartCard title="Ứng viên theo tuần" data={applicantsData} />
      </div>
    </main>
  );
}
