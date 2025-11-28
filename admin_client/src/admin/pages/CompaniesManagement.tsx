import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../context/hooks";
import { fetchAllCompanies } from "../store/redux/companySlice";
import { useNavigate } from "react-router-dom";
import { Button, Card, Table, Input, Spin, message, Tooltip } from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const CompaniesManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { companies, loading } = useAppSelector((state) => state.company);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllCompanies(20));
  }, [dispatch]);

  const handleReload = () => {
    dispatch(fetchAllCompanies(20));
    message.success("Đã tải lại danh sách công ty");
  };

  const companyList = Array.isArray(companies)
    ? companies
    : companies?.data ?? [];

  const filteredCompanies = companyList.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const getLogoUrl = (logo: any) => {
    if (!logo) return "";
    if (typeof logo === "string") {
      return logo.startsWith("http") ? logo : `${logo}`;
    }
    return URL.createObjectURL(logo);
  };

  const columns = [
    {
      title: "Tên công ty",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: any) => {
        const logoUrl = getLogoUrl(record.logo);
        return (
          <div className="flex items-center gap-3">
            <img
              src={logoUrl || "/default-company.png"}
              alt={record.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
            />
            <span className="font-medium text-gray-800">{record.name}</span>
          </div>
        );
      },
    },
    {
      title: "Mã số thuế",
      dataIndex: "tax_code",
      key: "tax_code",
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
      title: "Quy mô",
      dataIndex: "company_size",
      key: "company_size",
      render: (size: string | null) => size || "—",
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
            onClick={() => navigate(`/admin/companies/${record.id}`)}
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
          Danh sách công ty
        </h2>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Tìm kiếm công ty..."
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 260 }}
            className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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
              onClick={() => navigate("/admin/companies/create")}
            >
              Tạo công ty mới
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
            dataSource={filteredCompanies}
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

export default CompaniesManagement;
