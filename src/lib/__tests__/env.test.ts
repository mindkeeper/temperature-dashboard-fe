import { describe, it, expect } from "vitest";

import { env } from "../env";

describe("env", () => {
  it("validates VITE_API_URL exists", () => {
    expect(env.VITE_API_URL).toBeDefined();
    expect(typeof env.VITE_API_URL).toBe("string");
  });
});
