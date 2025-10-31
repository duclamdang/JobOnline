import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@context/hooks";
import {
  FaHome,
  FaUsers,
  FaCog,
  FaUser,
  FaQuestionCircle,
  FaBriefcase,
  FaRegUser,
  FaUserShield,
  FaListAlt,
  FaIdBadge,
  FaFileAlt,
  FaBoxOpen,
  FaTags,
  FaHandsHelping,
  FaEnvelope,
  FaSearch,
} from "react-icons/fa";

export default function AdminSidebar() {
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const admin = useAppSelector((state) => state.auth.admin);
  const isRoot = admin?.role_id === 1;

  const openMenu = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHoverMenu(key);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHoverMenu(null), 180);
  };

  const MenuWrapper: React.FC<{
    id: string;
    label: React.ReactNode;
    children: React.ReactNode;
  }> = ({ id, label, children }) => (
    <div
      className="relative"
      onMouseEnter={() => openMenu(id)}
      onMouseLeave={scheduleClose}
      onFocus={() => openMenu(id)}
      onBlur={scheduleClose}
    >
      <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer">
        {label}
      </div>

      {hoverMenu === id && (
        <div
          onMouseEnter={() => openMenu(id)}
          onMouseLeave={scheduleClose}
          className="absolute left-full ml-2 top-0 bg-white shadow-lg border rounded-md w-56 py-2 z-50"
        >
          {children}
        </div>
      )}
    </div>
  );

  return (
    <aside className="w-40 bg-white border-r h-screen hidden md:flex flex-col py-6 px-3 font-sans">
      <nav className="flex flex-col gap-2 text-gray-700 text-sm font-medium relative">
        <MenuWrapper
          id="dashboard"
          label={
            <>
              <FaHome className="text-base" /> Bảng tin
            </>
          }
        >
          {isRoot ? (
            <>
              <Link
                to="/admin/root-dashboard"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaHome /> Thống kê
              </Link>
              <Link
                to="/admin/reports"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaFileAlt /> Báo cáo
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/admin/employer-dashboard"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaHome /> Thống kê
              </Link>
            </>
          )}
        </MenuWrapper>
        {!isRoot && (
          <>
            <MenuWrapper
              id="job"
              label={
                <>
                  <FaBriefcase className="text-base" /> Công việc
                </>
              }
            >
              <Link
                to="/admin/job"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaListAlt /> Danh sách Job
              </Link>
            </MenuWrapper>

            <MenuWrapper
              id="users"
              label={
                <>
                  <FaUsers className="text-base" /> Ứng viên
                </>
              }
            >
              <Link
                to="/admin/candidates"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaIdBadge /> Danh sách ứng viên
              </Link>
              <Link
                to="/admin/applicantsearch"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaSearch /> Tìm kiếm ứng viên
              </Link>
            </MenuWrapper>

            <MenuWrapper
              id="services"
              label={
                <>
                  <FaCog className="text-base" /> Dịch vụ
                </>
              }
            >
              <Link
                to="/admin/packages"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaBoxOpen /> Gói dịch vụ
              </Link>
              <Link
                to="/admin/promotions"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaTags /> Khuyến mãi
              </Link>
            </MenuWrapper>
          </>
        )}
        <MenuWrapper
          id="profile"
          label={
            <>
              <FaUser className="text-base" /> Tài khoản của tôi
            </>
          }
        >
          <Link
            to="/admin/profile"
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
          >
            <FaRegUser /> Hồ sơ cá nhân
          </Link>
          {!isRoot && (
            <Link
              to="/admin/trademark"
              className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
            >
              <FaUserShield /> Quản bá thương hiệu
            </Link>
          )}
        </MenuWrapper>
        {isRoot && (
          <>
            <MenuWrapper
              id="account"
              label={
                <>
                  <FaHome className="text-base" /> Quản lý tài khoản
                </>
              }
            >
              <Link
                to="/admin/users"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaHome /> Tài khoản ứng viên
              </Link>
              <Link
                to="/admin/recruiters"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaFileAlt /> Tài khoản nhà tuyển dụng
              </Link>
            </MenuWrapper>

            <MenuWrapper
              id="companies"
              label={
                <>
                  <FaBriefcase className="text-base" /> Công ty
                </>
              }
            >
              <Link
                to="/admin/companies"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaListAlt /> Danh sách công ty
              </Link>
            </MenuWrapper>
          </>
        )}
        <MenuWrapper
          id="support"
          label={
            <>
              <FaQuestionCircle className="text-base" /> Hỗ trợ
            </>
          }
        >
          <Link
            to="/admin/help"
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
          >
            <FaHandsHelping /> Trung tâm trợ giúp
          </Link>
          <Link
            to="/admin/contact"
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
          >
            <FaEnvelope /> Liên hệ
          </Link>
        </MenuWrapper>
      </nav>
    </aside>
  );
}
