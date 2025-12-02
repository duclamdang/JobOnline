import { useState } from "react";
import { FaBell } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa6";
import logoJob from "../../assets/vieclam24h.png";
import { useNavigate, Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@context/hooks";
import { logoutAdmin } from "@admin/store/redux/authSlice";
import { useTranslation } from "react-i18next";

export default function AdminHeader() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openNav, setOpenNav] = useState(false);

  const dispatch = useAppDispatch();
  const { admin, loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "vi";

  const toggleMenu = () => setOpenMenu(!openMenu);
  const toggleNav = () => setOpenNav(!openNav);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate("/admin/login");
  };

  const goToProfile = () => {
    navigate("/admin/profile");
    setOpenMenu(false);
  };

  const toggleLanguage = () => {
    const nextLang = currentLang.startsWith("vi") ? "en" : "vi";
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="w-full bg-white border-b shadow-sm flex items-center justify-between px-6 md:px-12 h-16 font-sans">
      <div className="flex items-center gap-8">
        <Link to="/admin">
          <img
            src={logoJob}
            alt="Vieclam24h Logo"
            className="h-10 w-auto cursor-pointer"
          />
        </Link>
        <button className="md:hidden text-gray-700" onClick={toggleNav}>
          ☰
        </button>
      </div>

      {/* User + Actions */}
      <div className="flex items-center gap-6">
        <FaBell className="text-xl text-gray-600 cursor-pointer hover:text-blue-600" />

        <div className="relative user-menu">
          <button
            onClick={toggleMenu}
            className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg"
          >
            {admin?.avatar ? (
              <img
                src={
                  typeof admin.avatar === "string"
                    ? admin.avatar.startsWith("http")
                      ? admin.avatar
                      : `${admin.avatar}`
                    : URL.createObjectURL(admin.avatar)
                }
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="bg-purple-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-bold">
                {admin?.name ? admin.name.charAt(0).toUpperCase() : "?"}
              </div>
            )}

            <span className="font-semibold text-gray-800">
              {loading ? t("header.loading") : admin?.name}{" "}
            </span>

            <FaChevronDown className="text-gray-500 text-xs" />
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg z-50">
              <button
                onClick={goToProfile}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                {t("header.viewProfile")}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                {t("header.logout")}
              </button>
            </div>
          )}
        </div>

        {/* Nút đổi ngôn ngữ */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 border rounded-full px-2 py-1 hover:bg-gray-50"
        >
          <img
            src={
              currentLang.startsWith("vi")
                ? "https://flagcdn.com/vn.svg"
                : "https://flagcdn.com/us.svg"
            }
            alt={currentLang.startsWith("vi") ? "Tiếng Việt" : "English"}
            className="h-5 w-7 border rounded-sm"
          />
          <span className="text-xs font-medium uppercase text-gray-700">
            {currentLang.startsWith("vi") ? "VI" : "EN"}
          </span>
        </button>
      </div>
    </header>
  );
}
