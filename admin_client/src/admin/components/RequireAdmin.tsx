import { Outlet, Navigate } from "react-router-dom";
import { useAppSelector } from "@context/hooks";
import Loading from "@components/Loading";

export default function RequireAdmin() {
  const { admin, initialized } = useAppSelector((state) => state.auth);
  if (!initialized) {
    return <Loading />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
