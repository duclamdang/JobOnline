import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../context/hooks";
import { fetchAllAdmins } from "../store/redux/adminSlice";
import { useNavigate } from "react-router-dom";
import { Button, Card, Table, Input, Spin, message, Tooltip, Tag } from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import config from "@config/config";

const AdminsManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { admins, loading } = useAppSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllAdmins(20));
  }, [dispatch]);

  const handleReload = () => {
    dispatch(fetchAllAdmins(20));
    message.success("Đã tải lại danh sách admin");
  };

  const adminList = Array.isArray(admins) ? admins : admins?.data ?? [];

  const filteredAdmins = adminList.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarUrl = (avatar: any) => {
    if (!avatar) return "/default-avatar.png";
    if (typeof avatar === "string") {
      return avatar.startsWith("http")
        ? avatar
        : `${config.storageUrl}/${avatar}`;
    }
    return URL.createObjectURL(avatar);
  };

  const columns = [
    {
      title: "Tên Admin",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
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
      title: "Công ty",
      dataIndex: ["company", "name"], // nếu backend trả kèm company
      key: "company",
      render: (companyName: string | null) => companyName || "—",
    },
    {
      title: "Vai trò",
      dataIndex: ["role", "name"],
      key: "role",
      render: (role: string | null) => role || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      align: "center" as const,
      render: (active: boolean) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Khoá</Tag>
        ),
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
        <Tooltip title="Chỉnh sửa">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/admins/${record.id}`)}
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
          Danh sách Nhà tuyển dụng
        </h2>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Tìm kiếm admin..."
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 260 }}
          />

          <div className="flex gap-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReload}
              className="rounded-lg border border-gray-300 bg-white px-4 shadow-sm hover:border-purple-500 hover:text-purple-600"
            >
              Tải lại
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="rounded-lg bg-purple-700 px-4 shadow-sm hover:bg-purple-800"
              onClick={() => navigate("/admin/admins/create")}
            >
              Thêm admin mới
            </Button>
          </div>
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
            dataSource={filteredAdmins}
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

export default AdminsManagement;
