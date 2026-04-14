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

  // User management handlers
  http.get(`${BASE_URL}/users`, () => {
    return HttpResponse.json({
      message: "Users retrieved successfully",
      data: [
        {
          id: "1",
          email: "admin@test.com",
          name: "Admin User",
          role: "SUPERADMIN",
          isNewAccount: false,
          concessionaries: [],
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          email: "user@test.com",
          name: "Test User",
          role: "CONCESSIONAIRE",
          isNewAccount: false,
          concessionaries: [
            { concessionaireId: "c1", concessionaire: { id: "c1", name: "Conc A" } },
          ],
          createdAt: "2026-02-01T00:00:00.000Z",
        },
      ],
      meta: { pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } },
    });
  }),
  http.post(`${BASE_URL}/users`, () => {
    return HttpResponse.json(
      { message: "User created successfully", data: { id: "3" } },
      { status: 201 }
    );
  }),
  http.patch(`${BASE_URL}/users/:id`, () => {
    return HttpResponse.json({ message: "User updated successfully", data: {} });
  }),
  http.delete(`${BASE_URL}/users/:id`, () => {
    return HttpResponse.json({ message: "User deleted successfully", data: {} });
  }),

  // Concessionaire management handlers
  http.get(`${BASE_URL}/concessionaires`, () => {
    return HttpResponse.json({
      message: "Concessionaires retrieved successfully",
      data: [
        {
          id: "c1",
          name: "PT ABC Distributor",
          slug: "pt-abc-distributor",
          address: "Jl. Sudirman No. 123, Jakarta",
          latitude: -6.2088,
          longitude: 106.8456,
          warehouses: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      meta: { pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
    });
  }),
  http.patch(`${BASE_URL}/concessionaires/:id`, () => {
    return HttpResponse.json({ message: "Updated", data: {} });
  }),
  http.post(`${BASE_URL}/warehouses`, () => {
    return HttpResponse.json({ message: "Created", data: {} }, { status: 201 });
  }),
  http.patch(`${BASE_URL}/warehouses/:id`, () => {
    return HttpResponse.json({ message: "Updated", data: {} });
  }),
];
