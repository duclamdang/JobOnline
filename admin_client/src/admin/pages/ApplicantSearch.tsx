import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { HeartOutlined, LockOutlined } from "@ant-design/icons";
import Loading from "@components/Loading";
import { toast } from "react-toastify";
import {
  fetchCandidates,
  buyCandidateContact,
  selectCandidate,
  Candidate,
} from "@admin/store/redux/applicantsearchSlice";
import { RootState, AppDispatch } from "@context/store";
import config from "@config/config";

const CandidatesSearch = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { candidates, selectedCandidate, loading, userPoints } = useSelector(
    (state: RootState) => state.applicantSearch
  );

  useEffect(() => {
    dispatch(fetchCandidates()).catch(() =>
      toast.error("Lấy dữ liệu thất bại")
    );
  }, [dispatch]);
  const getAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return "/images/default-avatar.png";
    return `${config.storageUrl}/${avatar}`;
  };

  const handleSelect = (candidate: Candidate) => {
    dispatch(selectCandidate(candidate));
  };

  const handleBuyContact = () => {
    if (!selectedCandidate) return;
    dispatch(buyCandidateContact(selectedCandidate.id))
      .unwrap()
      .then((res) => {
        if (res.success) toast.success("Mua thông tin liên hệ thành công!");
        else toast.warning(res.message || "Mua thất bại, thử lại sau");
      })
      .catch((err) => {
        if (err.response?.status === 403)
          toast.warning("Điểm của bạn không đủ");
        else toast.error("Có lỗi xảy ra, thử lại sau");
      });
  };

  if (loading) return <Loading />;

  return (
    <div className="flex bg-gray-50 min-h-screen p-4 gap-4">
      {/* Danh sách ứng viên */}
      <div className="w-1/3 bg-white rounded-lg shadow-sm overflow-y-auto h-[90vh] p-4">
        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold text-gray-700">
            {candidates.length} ứng viên
          </p>
        </div>

        {candidates.map((c) => (
          <div
            key={c.id}
            onClick={() => handleSelect(c)}
            className={`cursor-pointer p-3 rounded-lg mb-2 transition ${
              selectedCandidate?.id === c.id
                ? "bg-blue-50 border-l-4 border-blue-500"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={getAvatarUrl(c.avatar)}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{c.name}</p>
                <p className="text-sm text-gray-600">
                  {c.desired_position || "Chưa cập nhật vị trí mong muốn"}
                </p>
                {c.job_search_status_text && (
                  <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded mt-1">
                    {c.job_search_status_text}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm p-6 overflow-y-auto h-[90vh]">
        {selectedCandidate ? (
          <>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedCandidate.name}
                </h2>
                <p className="text-gray-600">
                  {selectedCandidate.desired_position || "Chưa cập nhật vị trí"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-2">
                  <button className="p-2 rounded hover:bg-gray-100">
                    <HeartOutlined className="text-gray-600 text-lg" />
                  </button>
                  <button
                    onClick={handleBuyContact}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Mua thông tin liên hệ
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Điểm còn lại:</span>{" "}
                  {userPoints}
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={getAvatarUrl(selectedCandidate.avatar)}
                    alt={selectedCandidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-700 flex-1">
                <p>
                  <span className="font-semibold">Số điện thoại:</span>{" "}
                  {selectedCandidate.phone ?? (
                    <LockOutlined className="text-gray-400 text-sm" />
                  )}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedCandidate.email ?? (
                    <LockOutlined className="text-gray-400 text-sm" />
                  )}
                </p>
                <p>
                  <span className="font-semibold">Ngày sinh:</span>{" "}
                  {selectedCandidate.birthday
                    ? new Date(selectedCandidate.birthday).toLocaleDateString()
                    : "Chưa cập nhật"}
                </p>
                <p>
                  <span className="font-semibold">Địa chỉ:</span>{" "}
                  {selectedCandidate.address ?? "Chưa cập nhật"}
                </p>
                <p>
                  <span className="font-semibold">Mức lương mong muốn:</span>{" "}
                  {selectedCandidate.min_salary && selectedCandidate.max_salary
                    ? `${selectedCandidate.min_salary.toLocaleString()} - ${selectedCandidate.max_salary.toLocaleString()} VND`
                    : "Chưa cập nhật"}
                </p>
                <p>
                  <span className="font-semibold">Ngành nghề:</span>{" "}
                  {selectedCandidate.work_field_title ?? "Chưa cập nhật"}
                </p>
                <p>
                  <span className="font-semibold">Tỉnh/Thành phố:</span>{" "}
                  {selectedCandidate.province_title ?? "Chưa cập nhật"}
                </p>
                <p>
                  <span className="font-semibold">Hình thức làm việc:</span>{" "}
                  {selectedCandidate.working_form_title ?? "Chưa cập nhật"}
                </p>
                <p>
                  <span className="font-semibold">Kinh nghiệm:</span>{" "}
                  {selectedCandidate.work_experience_title ?? "Chưa cập nhật"}
                </p>
                <p>
                  <span className="font-semibold">Vị trí mong muốn:</span>{" "}
                  {selectedCandidate.position_title ?? "Chưa cập nhật"}
                </p>
                <p>
                  <span className="font-semibold">Trình độ học vấn:</span>{" "}
                  {selectedCandidate.education_title ?? "Chưa cập nhật"}
                </p>
                <p>
                  <span className="font-semibold">Trạng thái tìm việc:</span>{" "}
                  {selectedCandidate.job_search_status_text ?? "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">
            Chọn một ứng viên để xem chi tiết
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatesSearch;
