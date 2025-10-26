import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import { fetchCandidates, Candidate } from "@admin/store/redux/candidateSlice";
import { ReusableTable, Column } from "../components/ReusableTable";
import { People, Download, Visibility, Edit } from "@mui/icons-material";
import Loading from "@components/Loading";
import { toast } from "react-toastify";
import { fetchJobsApi } from "@admin/store/services/jobServices";
import { updateCandidateStatusApi } from "@admin/store/services/candidateServices";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

const ActionButtons = ({ candidate }: { candidate: Candidate }) => {
  const [status, setStatus] = useState<number>(candidate.status);
  const [editing, setEditing] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { admin } = useAppSelector((state) => state.auth);
  const canEdit = [1, 2, 3].includes(admin?.role_id ?? 0);

  const statusOptions = [
    { value: 0, label: "Chờ duyệt", color: "bg-gray-100 text-gray-600" },
    { value: 1, label: "Chấp nhận", color: "bg-blue-100 text-blue-700" },
    { value: 2, label: "Từ chối", color: "bg-red-100 text-red-700" },
    { value: 3, label: "Phỏng vấn", color: "bg-purple-100 text-purple-700" },
    {
      value: 4,
      label: "Đề nghị nhận việc",
      color: "bg-yellow-100 text-yellow-700",
    },
    { value: 5, label: "Đã nhận việc", color: "bg-green-100 text-green-700" },
  ];

  const currentOption = statusOptions.find((s) => s.value === status);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = Number(e.target.value);
    setStatus(newStatus);
    setEditing(false);
    try {
      await updateCandidateStatusApi(candidate.id, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      dispatch(fetchCandidates({ page: 1, perPage: 6 }));
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <button
          className="p-1.5 rounded-lg hover:bg-sky-100 text-sky-600 transition-all duration-200"
          onClick={() => setEditing(!editing)}
        >
          <Edit fontSize="small" />
        </button>
      )}

      {editing && canEdit && (
        <select
          value={status}
          onChange={handleStatusChange}
          className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 ${currentOption?.color}`}
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={() =>
          navigate(`/admin/candidate/applications/${candidate.id}`)
        }
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-200"
      >
        <Visibility fontSize="small" />
      </button>
    </div>
  );
};

export default function CandidateListPage() {
  const dispatch = useAppDispatch();
  const { candidates, loading, error, meta } = useAppSelector(
    (state) => state.candidates
  );

  const [page, setPage] = useState<number>(1);
  const [jobs, setJobs] = useState<{ id: number; title: string }[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const rowsPerPage = 6;
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetchJobsApi();
        setJobs(res.data ?? []);
      } catch (err) {
        console.error("Lỗi load jobs:", err);
        setJobs([]);
      }
    };
    loadJobs();
  }, []);

  useEffect(() => {
    const jobId = selectedJob !== "all" ? Number(selectedJob) : undefined;
    dispatch(fetchCandidates({ page, perPage: rowsPerPage, jobId }));
  }, [dispatch, page, selectedJob]);

  const handleDownload = () => {
    if (!candidates || candidates.length === 0) {
      toast.warning("Không có dữ liệu để tải!");
      return;
    }

    const rows = candidates.map((c, idx) => ({
      STT: idx + 1,
      "Tên ứng viên": c.user?.name ?? "",
      Email: c.user?.email ?? "",
      "Tin đăng": c.job?.title ?? "",
      "Trạng thái":
        (
          {
            0: "Chờ duyệt",
            1: "Chấp nhận",
            2: "Từ chối",
            3: "Phỏng vấn",
            4: "Đề nghị nhận việc",
            5: "Đã nhận việc",
          } as Record<number, string>
        )[c.status] ?? "Không xác định",
      "Ngày nộp": new Date(c.applied_at),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ứng viên");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const ts = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const fileName = `Danh_sach_ung_vien_${ts.getFullYear()}${pad(
      ts.getMonth() + 1
    )}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}.xlsx`;

    saveAs(blob, fileName);
    toast.success("Tải danh sách thành công!");
  };

  const columns: Column<Candidate>[] = [
    {
      key: "user",
      title: "Tên hồ sơ",
      render: (c) => (
        <div className="flex items-center gap-3 transition-all duration-300 hover:translate-x-[2px]">
          <img
            src={c.user?.avatar ?? ""}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover transform transition-transform duration-300 hover:scale-110"
          />
          <div>
            <p className="font-medium text-gray-800 hover:text-purple-600 transition-colors duration-200">
              {c.user?.name}
            </p>
            <p className="text-xs text-gray-500">{c.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "job",
      title: "Tin đăng",
      render: (c) => (
        <span className="hover:text-purple-500 transition-colors duration-200">
          {c.job?.title}
        </span>
      ),
    },
    {
      key: "applied_at",
      title: "Thời gian nộp",
      render: (c) => new Date(c.applied_at).toLocaleString("vi-VN"),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (c) => {
        const map: Record<number, string> = {
          0: "bg-gray-100 text-gray-600",
          1: "bg-blue-100 text-blue-700",
          2: "bg-red-100 text-red-700",
          3: "bg-purple-100 text-purple-700",
          4: "bg-yellow-100 text-yellow-700",
          5: "bg-green-100 text-green-700",
        };
        const text =
          [
            "Chờ duyệt",
            "Đã duyệt",
            "Từ chối",
            "Phỏng vấn",
            "Đề nghị nhận việc",
            "Đã nhận việc",
          ][c.status] ?? "Không xác định";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm transition-all duration-300 ${
              map[c.status]
            }`}
          >
            {text}
          </span>
        );
      },
    },
    {
      title: "Hành động",
      render: (c) => <ActionButtons candidate={c} />,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <People className="text-purple-500" fontSize="large" />
          <h1 className="text-2xl font-bold text-gray-800">
            Danh sách ứng viên
          </h1>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          <Download fontSize="small" />
          Tải danh sách
        </button>
      </div>

      <div className="mb-6">
        <select
          value={selectedJob}
          onChange={(e) => {
            setSelectedJob(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Tất cả tin đăng</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {loading && <Loading />}
      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
        <ReusableTable columns={columns} data={candidates ?? []} />
      </div>

      {meta && meta.last_page > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
            (num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  page === num
                    ? "bg-purple-500 text-white shadow-md"
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
