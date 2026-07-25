import type { DiscoverAssets } from "@lib/ports/input/asset-discovery.port";
import type { Asset, AssetType } from "@lib/domain/models/asset";
import { AdapterRegistry } from "@lib/infrastructure/adapter-registry";

/**
 * Application-layer service orchestrating asset discovery across all
 * registered adapters. Source-agnostic — fans out via AssetSourceGateway
 * port and isolates failures per source.
 */
export class AssetDiscoveryService implements DiscoverAssets {
  constructor(private readonly registry: AdapterRegistry) {}

  async execute(sourceKey: string, type?: AssetType): Promise<Asset[]> {
    const gateway = this.registry.get(sourceKey);
    if (!gateway) {
      throw new Error(`Source not registered: ${sourceKey}`);
    }
    return gateway.listAssets(type);
  }

  async discoverAll(type?: AssetType): Promise<Asset[]> {
    const results: Asset[] = [];
    for (const gateway of this.registry.getAll()) {
      try {
        const assets = await gateway.listAssets(type);
        results.push(...assets);
      } catch (err) {
        console.warn(
          `[${gateway.sourceKey}] Discovery failed: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
    return results;
  }
}
