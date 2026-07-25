import { describe, it, expect, vi } from "vitest";
import { AdapterRegistry } from "@lib/infrastructure/adapter-registry";
import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";
import type { Asset, AssetType } from "@lib/domain/models/asset";

function createMockGateway(sourceKey: string): AssetSourceGateway {
  return {
    sourceKey,
    listAssets: vi.fn().mockResolvedValue([] as Asset[]),
    getAsset: vi.fn().mockResolvedValue(null),
  };
}

describe("AdapterRegistry", () => {
  it("registers and retrieves a gateway", () => {
    const registry = new AdapterRegistry();
    const gw = createMockGateway("polyhaven");

    registry.register(gw);

    expect(registry.get("polyhaven")).toBe(gw);
    expect(registry.get("unknown")).toBeUndefined();
  });

  it("returns all registered gateways", () => {
    const registry = new AdapterRegistry();
    const gw1 = createMockGateway("polyhaven");
    const gw2 = createMockGateway("kenney");

    registry.register(gw1);
    registry.register(gw2);

    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContain(gw1);
    expect(all).toContain(gw2);
  });

  it("returns all registered keys", () => {
    const registry = new AdapterRegistry();
    registry.register(createMockGateway("polyhaven"));
    registry.register(createMockGateway("kenney"));
    registry.register(createMockGateway("ambientcg"));

    const keys = registry.getKeys();
    expect(keys).toEqual(
      expect.arrayContaining(["polyhaven", "kenney", "ambientcg"]),
    );
    expect(keys).toHaveLength(3);
  });

  it("overwrites existing gateway with same sourceKey", () => {
    const registry = new AdapterRegistry();
    const gw1 = createMockGateway("polyhaven");
    const gw2 = createMockGateway("polyhaven");

    registry.register(gw1);
    registry.register(gw2);

    expect(registry.get("polyhaven")).toBe(gw2);
    expect(registry.getAll()).toHaveLength(1);
  });

  it("returns empty array for getAll on empty registry", () => {
    const registry = new AdapterRegistry();
    expect(registry.getAll()).toEqual([]);
    expect(registry.getKeys()).toEqual([]);
  });

  it("returns undefined for get on empty registry", () => {
    const registry = new AdapterRegistry();
    expect(registry.get("anything")).toBeUndefined();
  });
});
