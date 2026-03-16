import { http, HttpResponse } from "msw";

const MOCK_USER = {
  id: "1",
  name: "Jane Doe",
  email: "user@example.com",
  role: "user" as const,
};

const MOCK_SESSION = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour from now
};

export const handlers = [
  // Auth — login
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email === "user@example.com" && body.password === "password123") {
      return HttpResponse.json({ user: MOCK_USER, session: MOCK_SESSION });
    }

    return HttpResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }),

  // Auth — logout
  http.post("/api/auth/logout", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Auth — current user
  http.get("/api/auth/me", () => {
    return HttpResponse.json(MOCK_USER);
  }),

  // Auth — refresh token
  http.post("/api/auth/refresh", () => {
    const refreshedSession = {
      ...MOCK_SESSION,
      accessToken: "mock-access-token-refreshed",
      expiresAt: Date.now() + 1000 * 60 * 60,
    };
    return HttpResponse.json(refreshedSession);
  }),
];
