import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";

/**
 * Registry mapping source keys to their gateway (adapter) implementations.
 * Plain Map-based — testable, explicit, zero magic.
 */
export class AdapterRegistry {
  private adapters = new Map<string, AssetSourceGateway>();

  register(gateway: AssetSourceGateway): void {
    this.adapters.set(gateway.sourceKey, gateway);
  }

  get(sourceKey: string): AssetSourceGateway | undefined {
    return this.adapters.get(sourceKey);
  }

  getAll(): AssetSourceGateway[] {
    return Array.from(this.adapters.values());
  }

  getKeys(): string[] {
    return Array.from(this.adapters.keys());
  }
}
