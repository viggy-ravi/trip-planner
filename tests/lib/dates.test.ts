import { describe, it, expect } from "vitest";
import {
  toDateOrNull,
  toTimeOrNull,
  toDateInputValue,
  toTimeInputValue,
} from "@/lib/dates";

describe("toDateOrNull", () => {
  it("returns undefined when the key wasn't sent (leave column untouched)", () => {
    expect(toDateOrNull(undefined)).toBeUndefined();
  });

  it("returns null for an empty string (clear the column)", () => {
    expect(toDateOrNull("")).toBeNull();
  });

  it("parses a real value into a Date", () => {
    const result = toDateOrNull("2026-09-01");
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString().startsWith("2026-09-01")).toBe(true);
  });
});

describe("toTimeOrNull", () => {
  it("returns undefined when the key wasn't sent", () => {
    expect(toTimeOrNull(undefined)).toBeUndefined();
  });

  it("returns null for an empty string", () => {
    expect(toTimeOrNull("")).toBeNull();
  });

  it("parses HH:MM as UTC, not the server's local timezone", () => {
    // Regression test for the real timezone bug this project hit: without a
    // trailing "Z", "1970-01-01T10:00" parses in local time and drifts
    // depending on where the server runs.
    const result = toTimeOrNull("10:00");
    expect(result?.toISOString()).toBe("1970-01-01T10:00:00.000Z");
  });
});

describe("toDateInputValue / toTimeInputValue", () => {
  it("round-trips a Date back into <input> value strings", () => {
    const date = new Date("2026-09-01T10:30:00.000Z");
    expect(toDateInputValue(date)).toBe("2026-09-01");
    expect(toTimeInputValue(date)).toBe("10:30");
  });

  it("returns empty strings for null", () => {
    expect(toDateInputValue(null)).toBe("");
    expect(toTimeInputValue(null)).toBe("");
  });
});
