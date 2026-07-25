import type { Asset, AssetType } from "@lib/domain/models/asset";

export interface AssetSourceGateway {
  readonly sourceKey: string;
  listAssets(type?: AssetType): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | null>;
}
