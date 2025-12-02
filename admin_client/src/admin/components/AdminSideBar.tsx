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
  FaPlus,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function AdminSidebar() {
  const { t } = useTranslation();
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const admin = useAppSelector((state) => state.auth.admin);
  const isRoot = admin?.role_id === 1;

  const iconCls = "w-5 h-5 flex-shrink-0";

  const openMenu = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHoverMenu(key);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHoverMenu(null), 180);
  };

  type MenuWrapperProps = {
    id: string;
    label: React.ReactNode;
    children: React.ReactNode;
  };

  const MenuWrapper: React.FC<MenuWrapperProps> = ({ id, label, children }) => (
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
    <aside className="w-56 min-w-[220px] bg-white border-r h-screen hidden md:flex flex-col py-6 px-4 font-sans">
      <nav className="flex flex-col gap-3 text-gray-700 text-sm font-medium relative">
        {/* DASHBOARD */}
        <MenuWrapper
          id="dashboard"
          label={
            <>
              <FaHome className={iconCls} /> {t("sidebar.dashboard")}
            </>
          }
        >
          {isRoot ? (
            <>
              <Link
                to="/admin/root-dashboard"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaHome className={iconCls} /> {t("sidebar.dashboardStats")}
              </Link>
              <Link
                to="/admin/reports"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaFileAlt className={iconCls} />{" "}
                {t("sidebar.dashboardReports")}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/admin/employer-dashboard"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaHome className={iconCls} /> {t("sidebar.dashboardStats")}
              </Link>
            </>
          )}
        </MenuWrapper>

        {/* EMPLOYER ONLY (NOT ROOT) */}
        {!isRoot && (
          <>
            {/* JOBS */}
            <MenuWrapper
              id="job"
              label={
                <>
                  <FaBriefcase className={iconCls} /> {t("sidebar.job")}
                </>
              }
            >
              <Link
                to="/admin/job"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
              >
                <FaListAlt className={`${iconCls} text-blue-600`} />
                <span>{t("sidebar.jobList")}</span>
              </Link>

              <Link
                to="/admin/job/add"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
              >
                <FaPlus className={`${iconCls} text-blue-600`} />
                <span>{t("sidebar.jobAdd")}</span>
              </Link>
            </MenuWrapper>

            {/* CANDIDATES */}
            <MenuWrapper
              id="users"
              label={
                <>
                  <FaUsers className={iconCls} /> {t("sidebar.candidate")}
                </>
              }
            >
              <Link
                to="/admin/candidates"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaIdBadge className={iconCls} /> {t("sidebar.candidateList")}
              </Link>
              <Link
                to="/admin/applicantsearch"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaSearch className={iconCls} /> {t("sidebar.candidateSearch")}
              </Link>
            </MenuWrapper>
          </>
        )}

        {/* MY ACCOUNT */}
        <MenuWrapper
          id="profile"
          label={
            <>
              <FaUser className={iconCls} /> {t("sidebar.myAccount")}
            </>
          }
        >
          <Link
            to="/admin/profile"
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
          >
            <FaRegUser className={iconCls} /> {t("sidebar.profile")}
          </Link>
          {!isRoot && (
            <Link
              to="/admin/trademark"
              className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
            >
              <FaUserShield className={iconCls} /> {t("sidebar.branding")}
            </Link>
          )}
        </MenuWrapper>

        {/* ROOT ONLY */}
        {isRoot && (
          <>
            {/* ACCOUNT MANAGEMENT */}
            <MenuWrapper
              id="account"
              label={
                <>
                  <FaHome className={iconCls} /> {t("sidebar.accountManage")}
                </>
              }
            >
              <Link
                to="/admin/users"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaHome className={iconCls} /> {t("sidebar.candidateAccount")}
              </Link>
              <Link
                to="/admin/recruiters"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaFileAlt className={iconCls} /> {t("sidebar.employerAccount")}
              </Link>
            </MenuWrapper>

            {/* COMPANIES */}
            <MenuWrapper
              id="companies"
              label={
                <>
                  <FaBriefcase className={iconCls} /> {t("sidebar.company")}
                </>
              }
            >
              <Link
                to="/admin/companies"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
              >
                <FaListAlt className={`${iconCls} text-blue-600`} />
                <span>{t("sidebar.companyList")}</span>
              </Link>

              <Link
                to="/admin/companies/create"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
              >
                <FaPlus className={`${iconCls} text-blue-600`} />
                <span>{t("sidebar.companyCreate")}</span>
              </Link>
            </MenuWrapper>
          </>
        )}

        {/* SERVICES */}
        <MenuWrapper
          id="services"
          label={
            <>
              <FaCog className={iconCls} /> {t("sidebar.services")}
            </>
          }
        >
          {isRoot ? (
            <>
              <Link
                to="/admin/root-payment"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaBoxOpen className={iconCls} /> {t("sidebar.servicePackages")}
              </Link>
              <Link
                to="/admin/root-promotion"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaTags className={iconCls} /> {t("sidebar.promotions")}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/admin/payment"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaBoxOpen className={iconCls} /> {t("sidebar.servicePackages")}
              </Link>
              <Link
                to="/admin/promotion"
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
              >
                <FaTags className={iconCls} /> {t("sidebar.promotions")}
              </Link>
            </>
          )}
        </MenuWrapper>

        {/* SUPPORT */}
        <MenuWrapper
          id="support"
          label={
            <>
              <FaQuestionCircle className={iconCls} /> {t("sidebar.support")}
            </>
          }
        >
          <Link
            to="/admin/help"
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
          >
            <FaHandsHelping className={iconCls} /> {t("sidebar.helpCenter")}
          </Link>
          <Link
            to="/admin/contact"
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
          >
            <FaEnvelope className={iconCls} /> {t("sidebar.contact")}
          </Link>
        </MenuWrapper>
      </nav>
    </aside>
  );
}
