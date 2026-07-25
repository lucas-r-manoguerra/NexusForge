import type { Asset, AssetType } from "@lib/domain/models/asset";

export interface DiscoverAssets {
  execute(sourceKey: string, type?: AssetType): Promise<Asset[]>;
  discoverAll(type?: AssetType): Promise<Asset[]>;
}
