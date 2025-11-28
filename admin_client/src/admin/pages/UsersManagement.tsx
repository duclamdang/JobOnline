import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../context/hooks";
import { fetchAllUsers } from "../store/redux/userSlice";
import { useNavigate } from "react-router-dom";
import { Button, Card, Table, Input, Spin, message, Tooltip } from "antd";
import { ReloadOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";

const UsersManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { users, loading } = useAppSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllUsers(1000));
  }, [dispatch]);

  const handleReload = () => {
    dispatch(fetchAllUsers(1000));
    message.success("Đã tải lại danh sách người dùng");
  };

  const userList = Array.isArray(users) ? users : users?.data ?? [];

  const filteredUsers = userList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarUrl = (avatar: any) => {
    if (!avatar) return "";
    if (typeof avatar === "string") {
      return avatar.startsWith("http") ? avatar : `${avatar}`;
    }
    return URL.createObjectURL(avatar);
  };

  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: any) => {
        const avatarUrl = getAvatarUrl(record.avatar);
        return (
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl || "/default-avatar.png"}
              alt={record.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
            />
            <span className="font-medium text-gray-800">{record.name}</span>
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text: string | null) => text || "—",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Tooltip title="Xem chi ti">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/users/${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 font-sans">
      {/* Header */}
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Danh sách người dùng
        </h2>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Tìm kiếm người dùng..."
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 260 }}
            className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={handleReload}
            className="rounded-lg border border-gray-300 bg-white px-4 shadow-sm hover:border-purple-500 hover:text-purple-600"
          >
            Tải lại
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="mx-auto max-w-6xl rounded-2xl border border-gray-200 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{
              pageSize: 10,
              position: ["bottomCenter"],
            }}
            bordered
            className="rounded-lg"
          />
        )}
      </Card>
    </main>
  );
};

export default UsersManagement;
