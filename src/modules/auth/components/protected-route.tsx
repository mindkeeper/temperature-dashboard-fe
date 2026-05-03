import { type ReactNode } from "react";
import { Navigate } from "react-router";

import { useAuth } from "../hooks/use-auth";
import type { AuthUser } from "../types/auth.types";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AuthUser["role"] | AuthUser["role"][];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
