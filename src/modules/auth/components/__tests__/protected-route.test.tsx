import { screen } from "@testing-library/react";
import { render } from "tests/test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { useAuthStore } from "../../store/auth.store";
import { ProtectedRoute } from "../protected-route";

afterEach(() => {
  useAuthStore.getState().clearAuth();
});

describe("ProtectedRoute", () => {
  it("renders children when authenticated", () => {
    useAuthStore.getState().setAuth(
      {
        id: "1",
        name: "Jane",
        email: "user@example.com",
        role: "CONCESSIONAIRE",
        isNewAccount: false,
        concessionaries: [],
      },
      { accessToken: "tok", refreshToken: "rtok" }
    );

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });
});
