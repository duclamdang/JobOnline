import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../context/hooks";
import { fetchAllAdmins, toggleAdminActive } from "../store/redux/adminSlice";
import { Button, Card, Table, Input, Spin, Tooltip, Tag } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const AdminsManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { admins, loading } = useAppSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllAdmins(20));
  }, [dispatch]);

  const handleReload = () => {
    dispatch(fetchAllAdmins(20));
    toast.success(t("adminsManagement.toast.reloadSuccess"));
  };

  const handleToggleActive = async (id: number) => {
    try {
      const result = await dispatch(toggleAdminActive(id)).unwrap();
      toast.success(result.toast || t("adminsManagement.toast.toggleSuccess"));
    } catch (err) {
      toast.error(t("adminsManagement.toast.toggleError"));
    }
  };

  const adminList = admins || [];

  const filteredAdmins = adminList.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: t("adminsManagement.table.name"),
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: t("adminsManagement.table.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("adminsManagement.table.phone"),
      dataIndex: "phone",
      key: "phone",
      render: (text: string | null) => text || "—",
    },
    {
      title: t("adminsManagement.table.company"),
      dataIndex: "company_name",
      key: "company_name",
      render: (company_name: string | null) => company_name || "—",
    },
    {
      title: t("adminsManagement.table.role"),
      dataIndex: "role_name",
      key: "role_name",
      render: (role_name: string | null) => role_name || "—",
    },
    {
      title: t("adminsManagement.table.status"),
      dataIndex: "is_active",
      key: "is_active",
      align: "center" as const,
      render: (active: boolean) =>
        active ? (
          <Tag color="green">{t("adminsManagement.table.active")}</Tag>
        ) : (
          <Tag color="red">{t("adminsManagement.table.inactive")}</Tag>
        ),
    },
    {
      title: t("adminsManagement.table.createdAt"),
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: t("adminsManagement.table.actions"),
      key: "actions",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Tooltip title={t("adminsManagement.table.toggleTooltip")}>
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
          {t("adminsManagement.title")}
        </h2>
        <div className="flex items-center gap-3">
          <Input
            placeholder={t("adminsManagement.searchPlaceholder")}
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
              {t("adminsManagement.reload")}
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
