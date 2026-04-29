import { Navigate } from "react-router";

import { useAuth } from "@/modules/auth";

export default function IndexPage() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "SUPERADMIN") {
    return <Navigate to="/device-config" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
