import { BrowserRouter, Route, Routes } from "react-router";

import { RootLayout } from "@/components/layout/root-layout";
import { AuthGuard, ProtectedRoute } from "@/modules/auth";
import DashboardPage from "@/pages/dashboard";
import DeviceConfigPage from "@/pages/device-config";
import IndexPage from "@/pages/index";
import LiveDataPage from "@/pages/live-data";
import LoginPage from "@/pages/login";

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
            path="live-data"
            element={
              <ProtectedRoute>
                <LiveDataPage />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
