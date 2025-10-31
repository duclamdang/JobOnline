import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../context/hooks";
import { fetchAllAdmins, toggleAdminActive } from "../store/redux/adminSlice";
import { Button, Card, Table, Input, Spin, Tooltip, Tag } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";

const AdminsManagement: React.FC = () => {
  const dispatch = useAppDispatch();

  const { admins, loading } = useAppSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllAdmins(20));
  }, [dispatch]);

  const handleReload = () => {
    dispatch(fetchAllAdmins(20));
    toast.success("Đã tải lại danh sách admin");
  };

  const handleToggleActive = async (id: number) => {
    try {
      const result = await dispatch(toggleAdminActive(id)).unwrap();
      toast.success(result.toast || "Cập nhật trạng thái thành công");
    } catch (err) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const adminList = admins;

  const filteredAdmins = adminList.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Tên Nhà tuyển dụng",
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
      dataIndex: "company_name",
      key: "company_name",
      render: (company_name: string | null) => company_name || "—",
    },
    {
      title: "Vai trò",
      dataIndex: "role_name",
      key: "role_name",
      render: (role_name: string | null) => role_name || "—",
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
        <Tooltip title="Chỉnh sửa trạng thái">
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
            onClick={() => handleToggleActive(record.id)}
          >
            {record.is_active ? (
              <Visibility fontSize="small" />
            ) : (
              <VisibilityOff fontSize="small" />
            )}
          </button>
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
