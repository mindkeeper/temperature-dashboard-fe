import { describe, expect, it } from "vitest";

import { authService } from "../auth.service";

describe("authService", () => {
  describe("login", () => {
    it("returns session on valid credentials", async () => {
      const result = await authService.login({
        email: "user@example.com",
        password: "password123",
      });

      expect(result.session).toHaveProperty("accessToken");
      expect(result.session).toHaveProperty("refreshToken");
    });

    it("throws on invalid credentials", async () => {
      await expect(
        authService.login({ email: "wrong@example.com", password: "wrongpass" })
      ).rejects.toThrow();
    });
  });

  describe("me", () => {
    it("returns the current user", async () => {
      const user = await authService.me();

      expect(user).toMatchObject({
        id: "1",
        email: "user@example.com",
      });
    });
  });

  describe("refresh", () => {
    it("returns a new session with updated token", async () => {
      const session = await authService.refresh("mock-refresh-token");

      expect(session).toHaveProperty("accessToken");
      expect(session).toHaveProperty("refreshToken");
    });
  });
});
