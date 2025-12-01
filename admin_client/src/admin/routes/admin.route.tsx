import AdminLogin from "@admin/pages/AdminLogin.tsx";
import { RouteObject } from "react-router-dom";
import RequireAdmin from "@admin/components/RequireAdmin";
import ProfilePage from "@admin/pages/ProfileAdmin";
import JobManagement from "@admin/pages/JobManagement";
import AdminLayout from "@admin/components/AdminLayout";
import JobDetail from "@admin/pages/JobDetailAdmin";
import AddJob from "@admin/pages/AddJob";
import RegisterEmployer from "@admin/pages/EmployerRegister";
import CandidateManagement from "@admin/pages/CandidateManagement";
import CandidateDetail from "@admin/pages/CandidateDetail";
import CompanyPage from "@admin/pages/CompanyPage";
import Trademark from "@admin/pages/TrademarkPage";
import CompaniesManagement from "@admin/pages/CompaniesManagement";
import RequireAdminRoot from "@admin/components/RequireAdminRoot";
import CompanyCreate from "@admin/pages/CompanyCreate";
import CompanyManagement from "@admin/pages/CompanyManagement";
import UsersManagement from "@admin/pages/UsersManagement";
import AdminsManagement from "@admin/pages/AdminsManagement";
import UserManagement from "@admin/pages/UserManagement";
import ApplicantSearch from "@admin/pages/ApplicantSearch";
import RootDashboard from "@admin/pages/AdminRootMain";
import EmployerDashboard from "@admin/pages/AdminEmployerMain";
import PaymentResultPage from "@admin/pages/PaymentResultPage";
import PromotionPage from "@admin/pages/PromotionPage";
import AdminRootPromotion from "@admin/pages/AdminRootPromotion";

const adminRoutes: RouteObject[] = [
  {
    path: "login",
    element: <AdminLogin />,
  },
  { path: "register", element: <RegisterEmployer /> },

  {
    element: <RequireAdmin />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          { path: "profile", element: <ProfilePage /> },
          { path: "company", element: <CompanyPage /> },
          { path: "job", element: <JobManagement /> },
          { path: "job/add", element: <AddJob /> },
          { path: "job/:id", element: <JobDetail /> },
          { path: "trademark", element: <Trademark /> },
          { path: "candidates", element: <CandidateManagement /> },
          { path: "candidate/applications/:id", element: <CandidateDetail /> },
          { path: "applicantsearch", element: <ApplicantSearch /> },
          { index: true, path: "root-dashboard", element: <RootDashboard /> },
          {
            index: true,
            path: "employer-dashboard",
            element: <EmployerDashboard />,
          },
          {
            index: true,
            path: "payment",
            element: <PaymentResultPage />,
          },
          {
            index: true,
            path: "promotion",
            element: <PromotionPage />,
          },
          {
            index: true,
            path: "root-payment",
            element: <PaymentResultPage />,
          },
          {
            index: true,
            path: "root-promotion",
            element: <AdminRootPromotion />,
          },

          {
            element: <RequireAdminRoot />,
            children: [
              { path: "companies", element: <CompaniesManagement /> },
              { path: "companies/create", element: <CompanyCreate /> },
              { path: "companies/:id", element: <CompanyManagement /> },
            ],
          },
          {
            element: <RequireAdminRoot />,
            children: [
              { path: "users", element: <UsersManagement /> },
              { path: "users/:id", element: <UserManagement /> },
            ],
          },
          {
            element: <RequireAdminRoot />,
            children: [{ path: "recruiters", element: <AdminsManagement /> }],
          },
        ],
      },
    ],
  },
];

export default adminRoutes;
