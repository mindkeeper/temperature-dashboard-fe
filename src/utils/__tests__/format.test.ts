import { describe, expect, it } from "vitest";

import { formatDate } from "../format";

describe("formatDate", () => {
  it("formats a date to a readable string", () => {
    const date = new Date("2025-01-15T00:00:00Z");
    expect(formatDate(date)).toMatch(/Jan.+15.+2025/);
  });

  it("handles different months", () => {
    const date = new Date("2025-12-25T00:00:00Z");
    expect(formatDate(date)).toMatch(/Dec.+25.+2025/);
  });

  it("returns a non-empty string", () => {
    expect(formatDate(new Date())).toBeTruthy();
  });
});
