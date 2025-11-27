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

  if (loading) return <p>Loading...</p>;

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-y-auto font-sans">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Tổng tiền đã nạp (VND)"
          value={paymentSummary?.total_amount ?? 0}
        />
        <StatCard
          title="Tổng điểm đã mua"
          value={paymentSummary?.total_points ?? 0}
        />
        <StatCard
          title="Tổng số giao dịch nạp"
          value={paymentSummary?.total_orders ?? 0}
        />
        <StatCard
          title="Giao dịch thành công"
          value={paymentSummary?.successful_orders ?? 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Ứng viên theo tuần"
          data={applicantsData}
          stepSize={1}
        />
        <ChartCard
          title="Công việc theo trạng thái"
          data={jobByStatusData}
          stepSize={1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Doanh thu mua điểm theo tháng (VND)"
          data={revenuePerMonthData}
        />
        <ChartCard title="Điểm đã mua theo tháng" data={pointPerMonthData} />
      </div>
    </main>
  );
}
