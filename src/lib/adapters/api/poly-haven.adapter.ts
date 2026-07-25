import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";
import type { Asset, AssetType } from "@lib/domain/models/asset";
import type { License } from "@lib/domain/models/license";
import { normalizeLicense } from "@lib/adapters/shared/license-map";

interface PolyHavenAssetResponse {
  name: string;
  type: string;
  categories?: string[];
  tags?: string[];
  latest_version?: {
    id: string;
    license: string;
    size?: number;
    files?: Record<string, string>;
  };
}

interface PolyHavenAssetDetail extends PolyHavenAssetResponse {
  description?: string;
}

const TYPE_MAP: Record<string, AssetType> = {
  textures: "texture",
  hdris: "hdri",
  models: "model",
};

export class PolyHavenAdapter implements AssetSourceGateway {
  readonly sourceKey = "polyhaven";
  private readonly baseUrl: string;

  constructor(baseUrl = "https://api.polyhaven.com") {
    this.baseUrl = baseUrl;
  }

  async listAssets(type?: AssetType): Promise<Asset[]> {
    const url = type
      ? `${this.baseUrl}/assets?t=${type}`
      : `${this.baseUrl}/assets`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Poly Haven API error: ${res.status}`);
    }
    const data: PolyHavenAssetResponse[] = await res.json();
    const assets = data.map((item) => this.normalize(item));
    return type ? assets.filter((a) => a.type === type) : assets;
  }

  async getAsset(id: string): Promise<Asset | null> {
    try {
      const res = await fetch(`${this.baseUrl}/info/${id}`);
      if (!res.ok) return null;
      const data: PolyHavenAssetDetail = await res.json();
      return this.normalize(data);
    } catch {
      return null;
    }
  }

  private normalize(raw: PolyHavenAssetResponse): Asset {
    const license = normalizeLicense(
      raw.latest_version?.license ?? "unknown",
    );
    const type = TYPE_MAP[raw.type] ?? "model";

    const files = raw.latest_version?.files;
    const downloadUrl = files
      ? `https://dl.polyhaven.org/file/ph-assets/${raw.type}/${raw.name}/${raw.latest_version!.id}/${Object.keys(files)[0]}`
      : `https://polyhaven.com/${raw.type}/${raw.name}`;

    return {
      id: raw.name,
      sourceKey: this.sourceKey,
      name: raw.name,
      type,
      license,
      downloadUrl,
      tags: raw.tags ?? [],
      metadata: {
        categories: raw.categories ?? [],
        ...(files ? { files } : {}),
      },
      discoveredAt: new Date(),
    };
  }
}
