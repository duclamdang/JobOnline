import { createBrowserRouter } from "react-router-dom";
import adminRoutes from "@admin/routes/admin.route";

const router = createBrowserRouter([
  {
    path: "/admin",
    children: adminRoutes,
  },
]);

export default router;
