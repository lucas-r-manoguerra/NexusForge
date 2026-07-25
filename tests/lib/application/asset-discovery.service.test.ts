import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssetDiscoveryService } from "@lib/application/asset-discovery.service";
import { AdapterRegistry } from "@lib/infrastructure/adapter-registry";
import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";
import type { Asset } from "@lib/domain/models/asset";

function createMockGateway(sourceKey: string, assets: Asset[] = []): AssetSourceGateway {
  return {
    sourceKey,
    listAssets: vi.fn().mockResolvedValue(assets),
    getAsset: vi.fn().mockResolvedValue(null),
  };
}

function createAsset(sourceKey: string, name: string): Asset {
  return {
    id: `${sourceKey}-${name}`,
    sourceKey,
    name,
    type: "model",
    license: {
      spdxId: "CC0-1.0",
      name: "CC Zero 1.0",
      commercial: true,
      attribution: false,
    },
    downloadUrl: `https://example.com/${name}`,
    tags: [],
    metadata: {},
    discoveredAt: new Date(),
  };
}

describe("AssetDiscoveryService", () => {
  let registry: AdapterRegistry;

  beforeEach(() => {
    registry = new AdapterRegistry();
  });

  describe("execute()", () => {
    it("delegates to the correct gateway", async () => {
      const gw = createMockGateway("polyhaven", [
        createAsset("polyhaven", "brick"),
      ]);
      registry.register(gw);
      const service = new AssetDiscoveryService(registry);

      const result = await service.execute("polyhaven");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("brick");
      expect(gw.listAssets).toHaveBeenCalledWith(undefined);
    });

    it("passes type filter to gateway", async () => {
      const gw = createMockGateway("polyhaven");
      registry.register(gw);
      const service = new AssetDiscoveryService(registry);

      await service.execute("polyhaven", "texture");

      expect(gw.listAssets).toHaveBeenCalledWith("texture");
    });

    it("throws for unknown source", async () => {
      const service = new AssetDiscoveryService(registry);

      await expect(service.execute("nonexistent")).rejects.toThrow(
        "Source not registered: nonexistent",
      );
    });
  });

  describe("discoverAll()", () => {
    it("aggregates assets from all registered gateways", async () => {
      const gw1 = createMockGateway("polyhaven", [
        createAsset("polyhaven", "brick"),
      ]);
      const gw2 = createMockGateway("ambientcg", [
        createAsset("ambientcg", "pavement"),
      ]);
      registry.register(gw1);
      registry.register(gw2);
      const service = new AssetDiscoveryService(registry);

      const result = await service.discoverAll();

      expect(result).toHaveLength(2);
      expect(result.map((a) => a.sourceKey)).toEqual(
        expect.arrayContaining(["polyhaven", "ambientcg"]),
      );
    });

    it("returns empty array when no gateways registered", async () => {
      const service = new AssetDiscoveryService(registry);

      const result = await service.discoverAll();
      expect(result).toEqual([]);
    });

    it("continues past a failing gateway", async () => {
      const failingGw = createMockGateway("failing");
      (failingGw.listAssets as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("API down"),
      );
      const okGw = createMockGateway("polyhaven", [
        createAsset("polyhaven", "asset1"),
      ]);
      registry.register(failingGw);
      registry.register(okGw);
      const service = new AssetDiscoveryService(registry);

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = await service.discoverAll();

      expect(result).toHaveLength(1);
      expect(result[0].sourceKey).toBe("polyhaven");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[failing] Discovery failed"),
      );
      consoleSpy.mockRestore();
    });

    it("passes type filter to all gateways", async () => {
      const gw1 = createMockGateway("polyhaven");
      const gw2 = createMockGateway("ambientcg");
      registry.register(gw1);
      registry.register(gw2);
      const service = new AssetDiscoveryService(registry);

      await service.discoverAll("texture");

      expect(gw1.listAssets).toHaveBeenCalledWith("texture");
      expect(gw2.listAssets).toHaveBeenCalledWith("texture");
    });
  });
});
