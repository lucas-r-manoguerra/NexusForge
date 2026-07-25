import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";
import type { Asset, AssetType } from "@lib/domain/models/asset";
import { normalizeLicense } from "@lib/adapters/shared/license-map";
import { mapCategoryToAssetType } from "@lib/adapters/shared/type-map";

interface AmbientCGAssetResponse {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  license: string;
}

interface AmbientCGAssetDetail extends AmbientCGAssetResponse {
  description?: string;
  previews?: Record<string, string>;
}

export class AmbientCGAdapter implements AssetSourceGateway {
  readonly sourceKey = "ambientcg";
  private readonly baseUrl: string;

  constructor(baseUrl = "https://ambientcg.com/api/v1") {
    this.baseUrl = baseUrl;
  }

  async listAssets(type?: AssetType): Promise<Asset[]> {
    const url = type
      ? `${this.baseUrl}/materials?type=${type}`
      : `${this.baseUrl}/materials`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`AmbientCG API error: ${res.status}`);
    }
    const data: AmbientCGAssetResponse[] = await res.json();
    const assets = data.map((item) => this.normalize(item));
    return type ? assets.filter((a) => a.type === type) : assets;
  }

  async getAsset(id: string): Promise<Asset | null> {
    try {
      const res = await fetch(`${this.baseUrl}/materials/${id}`);
      if (!res.ok) return null;
      const data: AmbientCGAssetDetail = await res.json();
      return this.normalize(data);
    } catch {
      return null;
    }
  }

  private normalize(raw: AmbientCGAssetResponse): Asset {
    const license = normalizeLicense(raw.license);
    const type = mapCategoryToAssetType(raw.category, this.sourceKey);

    return {
      id: raw.id,
      sourceKey: this.sourceKey,
      name: raw.name,
      type,
      license,
      downloadUrl: `${this.baseUrl}/materials/${raw.id}`,
      tags: raw.tags ?? [],
      metadata: {
        category: raw.category,
      },
      discoveredAt: new Date(),
    };
  }
}
