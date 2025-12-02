import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../../context/hooks";
import { fetchUserById } from "../store/redux/userSlice";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const UserDetailManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.user);
  const { t } = useTranslation();

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

  const fields = [
    {
      label: t("userDetail.fields.phone"),
      value: user.phone,
    },
    {
      label: t("userDetail.fields.address"),
      value: user.address,
    },
    {
      label: t("userDetail.fields.birthday"),
      value: user.birthday ? dayjs(user.birthday).format("DD/MM/YYYY") : "—",
    },
    {
      label: t("userDetail.fields.gender"),
      value: user.gender,
    },
    {
      label: t("userDetail.fields.workField"),
      value: user.work_field_title,
    },
    {
      label: t("userDetail.fields.province"),
      value: user.province_title,
    },
    {
      label: t("userDetail.fields.workingForm"),
      value: user.working_form_title,
    },
    {
      label: t("userDetail.fields.experience"),
      value: user.work_experience_title,
    },
    {
      label: t("userDetail.fields.education"),
      value: user.education_title,
    },
    {
      label: t("userDetail.fields.position"),
      value: user.position_title,
    },
    {
      label: t("userDetail.fields.desiredPosition"),
      value: user.desired_position,
    },
    {
      label: t("userDetail.fields.desiredSalary"),
      value:
        user.min_salary && user.max_salary
          ? `${user.min_salary.toLocaleString()} - ${user.max_salary.toLocaleString()} VNĐ`
          : "—",
    },
    {
      label: t("userDetail.fields.jobSearchStatus"),
      value: user.job_search_status_text,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          {t("userDetail.title")}
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

            <div className="mt-3 h-0.5 w-16 bg-gray-300 rounded" />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 text-[15px]">
            {fields.map((item, idx) => (
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
