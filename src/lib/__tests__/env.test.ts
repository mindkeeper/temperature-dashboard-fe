import { describe, it, expect } from "vitest";

import { env } from "../env";

describe("env", () => {
  it("validates VITE_GOOGLE_MAPS_API_KEY exists", () => {
    expect(env.VITE_GOOGLE_MAPS_API_KEY).toBeDefined();
    expect(typeof env.VITE_GOOGLE_MAPS_API_KEY).toBe("string");
  });
});
