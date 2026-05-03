import { BrowserRouter, Route, Routes } from "react-router";

import { RootLayout } from "@/components/layout/root-layout";
import { AuthGuard, ProtectedRoute } from "@/modules/auth";
import ConcessionaireConfigPageRoute from "@/pages/concessionaire-config";
import ConcessionaireDetailPage from "@/pages/concessionaire-detail";
import ConcessionairesPage from "@/pages/concessionaires";
import DashboardPage from "@/pages/dashboard";
import DeviceConfigPage from "@/pages/device-config";
import IndexPage from "@/pages/index";
import LoginPage from "@/pages/login";
import ProfilePageRoute from "@/pages/profile";
import UsersPage from "@/pages/users";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login has its own full-screen layout — outside RootLayout */}
        <Route
          path="login"
          element={
            <AuthGuard>
              <LoginPage />
            </AuthGuard>
          }
        />

        {/* All other pages share RootLayout (sidebar + outlet) */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<IndexPage />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="device-config"
            element={
              <ProtectedRoute requiredRole="SUPERADMIN">
                <DeviceConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRole="SUPERADMIN">
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="concessionaires"
            element={
              <ProtectedRoute requiredRole="SUPERADMIN">
                <ConcessionairesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="concessionaires/:id"
            element={
              <ProtectedRoute requiredRole="SUPERADMIN">
                <ConcessionaireDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute requiredRole={["CONCESSIONAIRE", "HEADOFFICE"]}>
                <ProfilePageRoute />
              </ProtectedRoute>
            }
          />
          <Route
            path="concessionaire-config"
            element={
              <ProtectedRoute requiredRole="CONCESSIONAIRE">
                <ConcessionaireConfigPageRoute />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
