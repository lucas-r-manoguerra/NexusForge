import { describe, it, expect } from "vitest";
import { createRegistry, createAssetDiscoveryService } from "@lib/infrastructure/bootstrap";
import { AssetDiscoveryService } from "@lib/application/asset-discovery.service";

describe("bootstrap", () => {
  describe("createRegistry()", () => {
    it("creates a registry with all 6 adapters", () => {
      const registry = createRegistry();
      const keys = registry.getKeys();
      expect(keys).toHaveLength(6);
      expect(keys).toEqual(
        expect.arrayContaining([
          "polyhaven",
          "ambientcg",
          "kenney",
          "opengameart",
          "quaternius",
          "polypizza",
        ]),
      );
    });

    it("each adapter implements the sourceKey property", () => {
      const registry = createRegistry();
      for (const gw of registry.getAll()) {
        expect(typeof gw.sourceKey).toBe("string");
        expect(gw.sourceKey.length).toBeGreaterThan(0);
      }
    });
  });

  describe("createAssetDiscoveryService()", () => {
    it("returns an AssetDiscoveryService instance", () => {
      const service = createAssetDiscoveryService();
      expect(service).toBeInstanceOf(AssetDiscoveryService);
    });

    it("service can list registered sources via registry", async () => {
      const service = createAssetDiscoveryService();
      // execute with unknown source should throw
      await expect(service.execute("nonexistent")).rejects.toThrow(
        "Source not registered: nonexistent",
      );
    });
  });
});
