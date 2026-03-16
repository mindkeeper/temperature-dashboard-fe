import { act, renderHook } from "@testing-library/react";
import { wrapper } from "tests/test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { useAuthStore } from "../../store/auth.store";
import { useAuth } from "../use-auth";

afterEach(() => {
  useAuthStore.getState().clearAuth();
});

describe("useAuth", () => {
  it("starts unauthenticated", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("sets isAuthenticated and user after successful login", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: "user@example.com", password: "password123" });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({ email: "user@example.com" });
  });

  it("clears auth state after logout", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: "user@example.com", password: "password123" });
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("throws on invalid credentials", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login({ email: "bad@example.com", password: "badpassword" });
      })
    ).rejects.toThrow();
  });
});
