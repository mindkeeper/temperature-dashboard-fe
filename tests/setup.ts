import "@testing-library/jest-dom";

import { cleanup } from "@testing-library/react";

import { server } from "@/mocks/server";

// MSW server setup for API mocking
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Automatically clean up after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
