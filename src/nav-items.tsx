
import { HomeIcon, Settings, Wrench, Users, BarChart3, Shield } from "lucide-react";
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import Builder from "./pages/Builder";
import PlatformBuilder from "./pages/PlatformBuilder";
import CostEstimatorPage from "./pages/CostEstimatorPage";
import { WorkflowsPage } from "./pages/WorkflowsPage";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index user={{}} onLogout={() => {}} />,
  },
  {
    title: "Builder",
    to: "/builder",
    icon: <Wrench className="h-4 w-4" />,
    page: <Builder user={{}} onLogout={() => {}} />,
  },
  {
    title: "Platform Builder",
    to: "/platform-builder",
    icon: <Settings className="h-4 w-4" />,
    page: <PlatformBuilder />,
  },
  {
    title: "Workflows",
    to: "/workflows",
    icon: <Wrench className="h-4 w-4" />,
    page: <WorkflowsPage />,
  },
  {
    title: "Cost Estimator",
    to: "/cost-estimator",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <CostEstimatorPage />,
  },
  {
    title: "Admin",
    to: "/admin",
    icon: <Shield className="h-4 w-4" />,
    page: <AdminPage />,
  },
];
