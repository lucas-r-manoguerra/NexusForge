import type { License } from "./license";

export type AssetType = "model" | "texture" | "hdri" | "audio" | "image" | "pack";

export const VALID_ASSET_TYPES: ReadonlySet<AssetType> = new Set<AssetType>([
  "model",
  "texture",
  "hdri",
  "audio",
  "image",
  "pack",
]);

export function isValidAssetType(value: string): value is AssetType {
  return VALID_ASSET_TYPES.has(value as AssetType);
}

export interface Asset {
  id: string;
  sourceKey: string;
  name: string;
  description?: string;
  type: AssetType;
  license: License;
  downloadUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  discoveredAt: Date;
}
