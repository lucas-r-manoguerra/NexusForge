import { describe, it, expect } from "vitest";
import {
  isValidAssetType,
  VALID_ASSET_TYPES,
} from "@lib/domain/models/asset";
import type { Asset, AssetType } from "@lib/domain/models/asset";
import type { License } from "@lib/domain/models/license";
import type { AssetSource } from "@lib/domain/models/asset-source";

describe("AssetType", () => {
  it("contains all 6 expected types", () => {
    const expected = ["model", "texture", "hdri", "audio", "image", "pack"];
    expect(VALID_ASSET_TYPES.size).toBe(6);
    for (const t of expected) {
      expect(VALID_ASSET_TYPES.has(t as AssetType)).toBe(true);
    }
  });

  it("isValidAssetType returns true for valid types", () => {
    expect(isValidAssetType("model")).toBe(true);
    expect(isValidAssetType("texture")).toBe(true);
    expect(isValidAssetType("hdri")).toBe(true);
    expect(isValidAssetType("audio")).toBe(true);
    expect(isValidAssetType("image")).toBe(true);
    expect(isValidAssetType("pack")).toBe(true);
  });

  it("isValidAssetType returns false for invalid types", () => {
    expect(isValidAssetType("")).toBe(false);
    expect(isValidAssetType("Model")).toBe(false);
    expect(isValidAssetType("video")).toBe(false);
    expect(isValidAssetType("MODEL")).toBe(false);
    expect(isValidAssetType("model ")).toBe(false);
  });
});

describe("Asset interface shape", () => {
  const validAsset: Asset = {
    id: "abc-123",
    sourceKey: "polyhaven",
    name: "Test Asset",
    type: "model",
    license: {
      spdxId: "CC0-1.0",
      name: "CC Zero 1.0",
      commercial: true,
      attribution: false,
    },
    downloadUrl: "https://example.com/download",
    tags: ["free", "3d"],
    metadata: { format: "glb" },
    discoveredAt: new Date("2025-01-01"),
  };

  it("has all required fields", () => {
    expect(validAsset.id).toBeDefined();
    expect(validAsset.sourceKey).toBeDefined();
    expect(validAsset.name).toBeDefined();
    expect(validAsset.type).toBeDefined();
    expect(validAsset.license).toBeDefined();
    expect(validAsset.downloadUrl).toBeDefined();
    expect(validAsset.tags).toBeDefined();
    expect(validAsset.metadata).toBeDefined();
    expect(validAsset.discoveredAt).toBeDefined();
  });

  it("accepts optional fields", () => {
    const withOptionals: Asset = {
      ...validAsset,
      description: "A detailed description",
      thumbnailUrl: "https://example.com/thumb.jpg",
    };
    expect(withOptionals.description).toBe("A detailed description");
    expect(withOptionals.thumbnailUrl).toBe("https://example.com/thumb.jpg");
  });

  it("type must be a valid AssetType", () => {
    expect(isValidAssetType(validAsset.type)).toBe(true);
  });

  it("license has required License shape", () => {
    const lic: License = validAsset.license;
    expect(typeof lic.spdxId).toBe("string");
    expect(typeof lic.name).toBe("string");
    expect(typeof lic.commercial).toBe("boolean");
    expect(typeof lic.attribution).toBe("boolean");
  });

  it("tags is an array of strings", () => {
    expect(Array.isArray(validAsset.tags)).toBe(true);
    for (const tag of validAsset.tags) {
      expect(typeof tag).toBe("string");
    }
  });

  it("metadata is a Record<string, unknown>", () => {
    expect(typeof validAsset.metadata).toBe("object");
    expect(validAsset.metadata).not.toBeNull();
  });

  it("discoveredAt is a Date", () => {
    expect(validAsset.discoveredAt).toBeInstanceOf(Date);
  });
});

describe("License interface shape", () => {
  it("has all required fields with correct types", () => {
    const license: License = {
      spdxId: "CC-BY-4.0",
      name: "Creative Commons Attribution 4.0",
      commercial: true,
      attribution: true,
    };
    expect(typeof license.spdxId).toBe("string");
    expect(typeof license.name).toBe("string");
    expect(typeof license.commercial).toBe("boolean");
    expect(typeof license.attribution).toBe("boolean");
  });
});

describe("AssetSource interface shape", () => {
  it("has all required fields", () => {
    const source: AssetSource = {
      key: "polyhaven",
      name: "Poly Haven",
      baseUrl: "https://api.polyhaven.com",
      adapterType: "api",
    };
    expect(source.key).toBe("polyhaven");
    expect(source.name).toBe("Poly Haven");
    expect(source.baseUrl).toContain("https://");
    expect(["api", "scraping"]).toContain(source.adapterType);
  });

  it("accepts scraping adapter type", () => {
    const source: AssetSource = {
      key: "kenney",
      name: "Kenney",
      baseUrl: "https://kenney.nl/assets",
      adapterType: "scraping",
    };
    expect(source.adapterType).toBe("scraping");
  });
});
