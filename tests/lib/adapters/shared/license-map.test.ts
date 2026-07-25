import { describe, it, expect } from "vitest";
import { normalizeLicense } from "@lib/adapters/shared/license-map";

describe("normalizeLicense", () => {
  it("normalizes CC0 variants to CC0-1.0", () => {
    expect(normalizeLicense("CC0")).toEqual({
      spdxId: "CC0-1.0",
      name: "CC Zero 1.0",
      commercial: true,
      attribution: false,
    });
    expect(normalizeLicense("cc0-1.0")).toEqual({
      spdxId: "CC0-1.0",
      name: "CC Zero 1.0",
      commercial: true,
      attribution: false,
    });
    expect(normalizeLicense("CC-Zero")).toEqual({
      spdxId: "CC0-1.0",
      name: "CC Zero 1.0",
      commercial: true,
      attribution: false,
    });
  });

  it("normalizes CC-BY variants", () => {
    const result = normalizeLicense("CC-BY 4.0");
    expect(result.spdxId).toBe("CC-BY-4.0");
    expect(result.commercial).toBe(true);
    expect(result.attribution).toBe(true);
  });

  it("normalizes CC-BY-SA", () => {
    const result = normalizeLicense("CC-BY-SA-4.0");
    expect(result.spdxId).toBe("CC-BY-SA-4.0");
    expect(result.attribution).toBe(true);
  });

  it("normalizes CC-BY-NC as non-commercial", () => {
    const result = normalizeLicense("CC-BY-NC-4.0");
    expect(result.commercial).toBe(false);
    expect(result.attribution).toBe(true);
  });

  it("normalizes MIT", () => {
    const result = normalizeLicense("MIT");
    expect(result.spdxId).toBe("MIT");
    expect(result.commercial).toBe(true);
    expect(result.attribution).toBe(false);
  });

  it("normalizes Unlicense", () => {
    const result = normalizeLicense("Unlicense");
    expect(result.spdxId).toBe("Unlicense");
    expect(result.commercial).toBe(true);
  });

  it("normalizes 'public domain' to CC0", () => {
    const result = normalizeLicense("Public Domain");
    expect(result.spdxId).toBe("CC0-1.0");
    expect(result.commercial).toBe(true);
  });

  it("is case-insensitive", () => {
    const lower = normalizeLicense("cc-by");
    const upper = normalizeLicense("CC-BY");
    expect(lower.spdxId).toBe(upper.spdxId);
  });

  it("trims whitespace", () => {
    const result = normalizeLicense("  CC0  ");
    expect(result.spdxId).toBe("CC0-1.0");
  });

  it("falls back to unknown license for unrecognized strings", () => {
    const result = normalizeLicense("SomeCustomLicense");
    expect(result.spdxId).toBe("SomeCustomLicense");
    expect(result.name).toBe("SomeCustomLicense");
    expect(result.commercial).toBe(false);
    expect(result.attribution).toBe(false);
  });

  it("returns a new object each time (no mutation)", () => {
    const a = normalizeLicense("CC0");
    const b = normalizeLicense("CC0");
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});
