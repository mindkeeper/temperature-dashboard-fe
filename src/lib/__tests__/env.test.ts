import { describe, it, expect } from "vitest";

import { env } from "../env";

describe("env", () => {
  it("validates VITE_MAPBOX_ACCESS_TOKEN exists", () => {
    expect(env.VITE_MAPBOX_ACCESS_TOKEN).toBeDefined();
    expect(typeof env.VITE_MAPBOX_ACCESS_TOKEN).toBe("string");
  });
});
