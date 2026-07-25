import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AmbientCGAdapter } from "@lib/adapters/api/ambient-cg.adapter";

import ambientAssetsFixture from "../../../fixtures/responses/ambientcg/assets.json";
import ambientDetailFixture from "../../../fixtures/responses/ambientcg/asset-detail.json";

describe("AmbientCGAdapter", () => {
  let adapter: AmbientCGAdapter;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new AmbientCGAdapter("https://ambientcg.com/api/v1");
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sourceKey", () => {
    it("returns ambientcg", () => {
      expect(adapter.sourceKey).toBe("ambientcg");
    });
  });

  describe("listAssets", () => {
    it("normalizes API response to Asset[]", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(ambientAssetsFixture),
      });

      const assets = await adapter.listAssets();

      expect(assets).toHaveLength(2);
      expect(assets[0].sourceKey).toBe("ambientcg");
      expect(assets[0].name).toBe("Pavement 025");
      expect(assets[0].type).toBe("texture");
      expect(assets[0].license.spdxId).toBe("CC0-1.0");
      expect(assets[0].tags).toContain("pavement");
      expect(assets[0].discoveredAt).toBeInstanceOf(Date);
    });

    it("passes type filter to API", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(ambientAssetsFixture),
      });

      await adapter.listAssets("texture");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://ambientcg.com/api/v1/materials?type=texture",
      );
    });

    it("maps HDRIs correctly", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(ambientAssetsFixture),
      });

      const assets = await adapter.listAssets();
      const hdri = assets.find((a) => a.name === "Sky 001");
      expect(hdri?.type).toBe("hdri");
    });

    it("throws on non-OK response", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 403 });

      await expect(adapter.listAssets()).rejects.toThrow(
        "AmbientCG API error: 403",
      );
    });

    it("throws on network error", async () => {
      fetchMock.mockRejectedValue(new Error("Connection refused"));

      await expect(adapter.listAssets()).rejects.toThrow("Connection refused");
    });
  });

  describe("getAsset", () => {
    it("normalizes detail response", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(ambientDetailFixture),
      });

      const asset = await adapter.getAsset("1001");

      expect(asset).not.toBeNull();
      expect(asset!.name).toBe("Pavement 025");
      expect(asset!.type).toBe("texture");
      expect(asset!.sourceKey).toBe("ambientcg");
      expect(asset!.metadata).toHaveProperty("category", "materials");
    });

    it("returns null on 404", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 404 });

      const asset = await adapter.getAsset("9999");
      expect(asset).toBeNull();
    });

    it("returns null on network error", async () => {
      fetchMock.mockRejectedValue(new Error("timeout"));

      const asset = await adapter.getAsset("1001");
      expect(asset).toBeNull();
    });
  });
});
