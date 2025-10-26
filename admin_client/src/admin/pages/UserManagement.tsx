import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../../context/hooks";
import { fetchUserById } from "../store/redux/userSlice";
import config from "@config/config";
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
    return avatar.startsWith("http")
      ? avatar
      : `${config.storageUrl}/${avatar}`;
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

        <Card className="rounded-xl shadow-sm p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={getAvatarUrl(user.avatar)}
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover border shadow-sm mb-3"
            />
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-gray-500">{user.email}</p>
          </div>

          {/* Thông tin cá nhân */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-6">
            <div>
              <span className="font-medium text-gray-700">Số điện thoại:</span>
              <p>{user.phone || "—"}</p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Địa chỉ:</span>
              <p>{user.address || "—"}</p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Ngày sinh:</span>
              <p>
                {user.birthday
                  ? dayjs(user.birthday).format("DD/MM/YYYY")
                  : "—"}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Giới tính:</span>
              <p>
                {user.gender === 1 ? "Nam" : user.gender === 0 ? "Nữ" : "—"}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700">
                Tài khoản ngân hàng:
              </span>
              <p>{user.bank_info || "—"}</p>
            </div>

            <div>
              <span className="font-medium text-gray-700">
                Trạng thái tìm việc:
              </span>
              <p>
                {user.job_search_status ? "Đang tìm việc" : "Không tìm việc"}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700">
                Vị trí mong muốn:
              </span>
              <p>{user.desired_position || "—"}</p>
            </div>

            <div>
              <span className="font-medium text-gray-700">
                Mức lương mong muốn:
              </span>
              <p>
                {user.min_salary && user.max_salary
                  ? `${user.min_salary} - ${user.max_salary} VNĐ`
                  : "—"}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700">
                Trạng thái tài khoản:
              </span>
              <p>{user.is_active ? "Hoạt động" : "Bị khóa"}</p>
            </div>

            <div>
              <span className="font-medium text-gray-700">
                Xác minh tài khoản:
              </span>
              <p>{user.is_verify ? "Đã xác minh" : "Chưa xác minh"}</p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Ngày xác minh:</span>
              <p>
                {user.verified_at
                  ? dayjs(user.verified_at).format("DD/MM/YYYY HH:mm")
                  : "—"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default UserDetailManagement;
