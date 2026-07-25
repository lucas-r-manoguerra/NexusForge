import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PolyHavenAdapter } from "@lib/adapters/api/poly-haven.adapter";
import type { Asset, AssetType } from "@lib/domain/models/asset";

import polyAssetsFixture from "../../../fixtures/responses/poly-haven/assets.json";
import polyDetailFixture from "../../../fixtures/responses/poly-haven/asset-detail.json";

describe("PolyHavenAdapter", () => {
  let adapter: PolyHavenAdapter;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new PolyHavenAdapter("https://api.polyhaven.com");
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sourceKey", () => {
    it("returns polyhaven", () => {
      expect(adapter.sourceKey).toBe("polyhaven");
    });
  });

  describe("listAssets", () => {
    it("normalizes API response to Asset[]", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(polyAssetsFixture),
      });

      const assets = await adapter.listAssets();

      expect(assets).toHaveLength(2);
      expect(assets[0].sourceKey).toBe("polyhaven");
      expect(assets[0].name).toBe("brick_wall_001");
      expect(assets[0].type).toBe("texture");
      expect(assets[0].license.spdxId).toBe("CC0-1.0");
      expect(assets[0].license.commercial).toBe(true);
      expect(assets[0].license.attribution).toBe(false);
      expect(assets[0].tags).toContain("brick");
      expect(assets[0].discoveredAt).toBeInstanceOf(Date);
    });

    it("passes type filter to API", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(polyAssetsFixture),
      });

      await adapter.listAssets("texture");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.polyhaven.com/assets?t=texture",
      );
    });

    it("maps HDRIs correctly", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(polyAssetsFixture),
      });

      const assets = await adapter.listAssets();
      const hdri = assets.find((a) => a.name === "hdri_outdoor");
      expect(hdri?.type).toBe("hdri");
    });

    it("throws on non-OK response", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500 });

      await expect(adapter.listAssets()).rejects.toThrow(
        "Poly Haven API error: 500",
      );
    });

    it("throws on network error", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"));

      await expect(adapter.listAssets()).rejects.toThrow("Network error");
    });
  });

  describe("getAsset", () => {
    it("normalizes detail response", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(polyDetailFixture),
      });

      const asset = await adapter.getAsset("brick_wall_001");

      expect(asset).not.toBeNull();
      expect(asset!.name).toBe("brick_wall_001");
      expect(asset!.type).toBe("texture");
      expect(asset!.sourceKey).toBe("polyhaven");
      expect(asset!.metadata).toHaveProperty("files");
    });

    it("returns null on 404", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 404 });

      const asset = await adapter.getAsset("nonexistent");
      expect(asset).toBeNull();
    });

    it("returns null on network error", async () => {
      fetchMock.mockRejectedValue(new Error("fail"));

      const asset = await adapter.getAsset("brick_wall_001");
      expect(asset).toBeNull();
    });
  });
});
