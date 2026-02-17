import { describe, expect, it } from "vitest";
import { formatCurrency, formatDateTime } from "./format";

describe("format helpers", () => {
  it("formats currency without decimals", () => {
    expect(formatCurrency(1250)).toContain("1,250");
  });

  it("formats datetime", () => {
    const value = formatDateTime("2025-05-01T10:30:00Z");
    expect(value.length).toBeGreaterThan(0);
  });
});
