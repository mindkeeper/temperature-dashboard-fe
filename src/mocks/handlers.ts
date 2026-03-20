import { http, HttpResponse } from "msw";

const BASE_URL = "http://localhost:3000";

const MOCK_SESSION = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
};

export const handlers = [
  // Auth — login
  http.post(`${BASE_URL}/auth/sign-in`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email === "user@example.com" && body.password === "password123") {
      return HttpResponse.json({
        message: "Login successful",
        accessToken: MOCK_SESSION.accessToken,
        refreshToken: MOCK_SESSION.refreshToken,
      });
    }

    return HttpResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }),

  // Auth — logout
  http.post(`${BASE_URL}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Auth — current user
  http.get(`${BASE_URL}/users/me`, () => {
    return HttpResponse.json({
      message: "Success",
      id: "1",
      name: "Jane Doe",
      email: "user@example.com",
      role: "HEADOFFICE",
      isNewAccount: false,
      concessionaries: [],
    });
  }),

  // Auth — refresh token
  http.post(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      message: "Token refreshed",
      accessToken: "mock-access-token-refreshed",
      refreshToken: MOCK_SESSION.refreshToken,
    });
  }),
];
