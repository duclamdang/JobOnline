import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../../context/hooks";
import { fetchUserById } from "../store/redux/userSlice";
import dayjs from "dayjs";

const UserDetailManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (id) dispatch(fetchUserById(Number(id)));
  }, [dispatch, id]);

  const getAvatarUrl = (avatar: string) => {
    if (!avatar) return "/default-avatar.png";
    return avatar.startsWith("http") ? avatar : `${avatar}`;
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          Thông tin chi tiết người dùng
        </h2>

        <Card className="rounded-2xl shadow-md p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={getAvatarUrl(user.avatar ?? "")}
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover border shadow-md mb-4"
            />

            <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-gray-500">{user.email || "—"}</p>

            <div className="mt-3 h-0.5 w-16 bg-gray-300 rounded"></div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 text-[15px]">
            {[
              { label: "Số điện thoại", value: user.phone },
              { label: "Địa chỉ", value: user.address },
              {
                label: "Ngày sinh",
                value: user.birthday
                  ? dayjs(user.birthday).format("DD/MM/YYYY")
                  : "—",
              },
              { label: "Giới tính", value: user.gender },
              { label: "Ngành nghề", value: user.work_field_title },
              { label: "Tỉnh / Thành phố", value: user.province_title },
              { label: "Hình thức làm việc", value: user.working_form_title },
              { label: "Kinh nghiệm", value: user.work_experience_title },
              { label: "Trình độ học vấn", value: user.education_title },
              { label: "Chức vụ hiện tại", value: user.position_title },
              { label: "Vị trí mong muốn", value: user.desired_position },
              {
                label: "Mức lương mong muốn",
                value:
                  user.min_salary && user.max_salary
                    ? `${user.min_salary.toLocaleString()} - ${user.max_salary.toLocaleString()} VNĐ`
                    : "—",
              },
              {
                label: "Trạng thái tìm việc",
                value: user.job_search_status_text,
              },
            ].map((item, idx) => (
              <div key={idx}>
                <p className="text-gray-500 font-medium">{item.label}:</p>
                <p className="text-gray-800 mt-1">{item.value || "—"}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
};

export default UserDetailManagement;
