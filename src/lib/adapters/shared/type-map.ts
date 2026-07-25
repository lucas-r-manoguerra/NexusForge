import type { AssetType } from "@lib/domain/models/asset";

type CategoryMap = Record<string, AssetType>;

/**
 * Source-specific category-to-AssetType mapping tables.
 * Each source uses different category naming conventions.
 */
const SOURCE_MAPS: Record<string, CategoryMap> = {
  kenney: {
    "3d": "model",
    "3d models": "model",
    "2d": "image",
    "2d art": "image",
    "2d images": "image",
    audio: "audio",
    sound: "audio",
    music: "audio",
    "ui": "image",
  },
  opengameart: {
    "3d models": "model",
    "2d art": "image",
    "audio": "audio",
    "music": "audio",
    "sfx": "audio",
    "gui": "image",
    tileset: "texture",
  },
  ambientcg: {
    materials: "texture",
    hdris: "hdri",
    textures: "texture",
    "3d models": "model",
  },
  polyhaven: {
    models: "model",
    textures: "texture",
    hdris: "hdri",
  },
};

const DEFAULT_TYPE: AssetType = "model";

/**
 * Map a source-specific category string to a normalized AssetType.
 *
 * @param category - Raw category string from the source
 * @param sourceKey - Adapter source key for source-specific mapping
 * @returns Normalized AssetType, defaults to "model" if unmapped
 */
export function mapCategoryToAssetType(
  category: string,
  sourceKey: string,
): AssetType {
  const normalizedCategory = category.trim().toLowerCase();
  const sourceMap = SOURCE_MAPS[sourceKey];

  if (sourceMap) {
    const mapped = sourceMap[normalizedCategory];
    if (mapped) return mapped;
  }

  // Global fallback heuristics
  if (normalizedCategory.includes("audio") || normalizedCategory.includes("sound") || normalizedCategory.includes("music")) {
    return "audio";
  }
  if (normalizedCategory.includes("hdr")) {
    return "hdri";
  }
  if (normalizedCategory.includes("texture") || normalizedCategory.includes("material")) {
    return "texture";
  }
  if (normalizedCategory.includes("model") || normalizedCategory.includes("3d")) {
    return "model";
  }
  if (normalizedCategory.includes("image") || normalizedCategory.includes("2d") || normalizedCategory.includes("art")) {
    return "image";
  }

  return DEFAULT_TYPE;
}
