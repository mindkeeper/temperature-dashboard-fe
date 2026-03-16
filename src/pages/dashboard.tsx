import { useAuth } from "@/modules/auth";
import { ConcessionaireDashboard } from "@/modules/dashboard/components/concessionaire-dashboard";
import { HeadOfficeDashboard } from "@/modules/dashboard/components/head-office-dashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "HEADOFFICE") {
    return <HeadOfficeDashboard />;
  }

  return <ConcessionaireDashboard />;
}
