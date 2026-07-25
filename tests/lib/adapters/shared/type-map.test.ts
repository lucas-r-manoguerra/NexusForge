import { describe, it, expect } from "vitest";
import { mapCategoryToAssetType } from "@lib/adapters/shared/type-map";

describe("mapCategoryToAssetType", () => {
  describe("kenney source", () => {
    it("maps '3D' to model", () => {
      expect(mapCategoryToAssetType("3D", "kenney")).toBe("model");
    });

    it("maps '2D' to image", () => {
      expect(mapCategoryToAssetType("2D", "kenney")).toBe("image");
    });

    it("maps 'Audio' to audio", () => {
      expect(mapCategoryToAssetType("Audio", "kenney")).toBe("audio");
    });

    it("maps 'UI' to image", () => {
      expect(mapCategoryToAssetType("UI", "kenney")).toBe("image");
    });
  });

  describe("polyhaven source", () => {
    it("maps 'models' to model", () => {
      expect(mapCategoryToAssetType("models", "polyhaven")).toBe("model");
    });

    it("maps 'textures' to texture", () => {
      expect(mapCategoryToAssetType("textures", "polyhaven")).toBe("texture");
    });

    it("maps 'hdris' to hdri", () => {
      expect(mapCategoryToAssetType("hdris", "polyhaven")).toBe("hdri");
    });
  });

  describe("ambientcg source", () => {
    it("maps 'materials' to texture", () => {
      expect(mapCategoryToAssetType("materials", "ambientcg")).toBe("texture");
    });

    it("maps 'hdris' to hdri", () => {
      expect(mapCategoryToAssetType("hdris", "ambientcg")).toBe("hdri");
    });
  });

  describe("opengameart source", () => {
    it("maps '3d models' to model", () => {
      expect(mapCategoryToAssetType("3d models", "opengameart")).toBe("model");
    });

    it("maps 'sfx' to audio", () => {
      expect(mapCategoryToAssetType("sfx", "opengameart")).toBe("audio");
    });
  });

  describe("global fallback heuristics", () => {
    it("maps 'music' to audio", () => {
      expect(mapCategoryToAssetType("music", "unknown-source")).toBe("audio");
    });

    it("maps 'HDR environment' to hdri", () => {
      expect(mapCategoryToAssetType("HDR environment", "unknown-source")).toBe("hdri");
    });

    it("maps 'PBR Material' to texture", () => {
      expect(mapCategoryToAssetType("PBR Material", "unknown-source")).toBe("texture");
    });

    it("maps '3D Scan' to model", () => {
      expect(mapCategoryToAssetType("3D Scan", "unknown-source")).toBe("model");
    });

    it("maps 'Pixel Art' to image", () => {
      expect(mapCategoryToAssetType("Pixel Art", "unknown-source")).toBe("image");
    });
  });

  describe("edge cases", () => {
    it("is case-insensitive", () => {
      expect(mapCategoryToAssetType("MODELS", "polyhaven")).toBe("model");
      expect(mapCategoryToAssetType("Models", "polyhaven")).toBe("model");
    });

    it("trims whitespace", () => {
      expect(mapCategoryToAssetType("  models  ", "polyhaven")).toBe("model");
    });

    it("returns model for completely unknown category", () => {
      expect(mapCategoryToAssetType("something-random", "unknown")).toBe("model");
    });
  });
});
