import { createBrowserRouter, Navigate } from "react-router-dom";
import adminRoutes from "@admin/routes/admin.route";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/admin" replace />,
  },
  {
    path: "/admin",
    children: adminRoutes,
  },
]);

export default router;
