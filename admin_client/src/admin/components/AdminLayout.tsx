// AdminLayout.tsx
import { Outlet, Navigate, useLocation } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "./AdminSideBar";
import { useAppSelector } from "@context/hooks";

export default function AdminLayout() {
  const admin = useAppSelector((s) => s.auth.admin);
  const { pathname } = useLocation();
  const isRoot = admin?.role_id === 1;
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  if (pathname === "/admin") {
    return (
      <Navigate
        to={isRoot ? "/admin/root-dashboard" : "/admin/employer-dashboard"}
        replace
      />
    );
  }
  return (
    <div className="flex flex-col h-screen">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
