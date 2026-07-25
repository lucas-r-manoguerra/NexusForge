import { AdapterRegistry } from "@lib/infrastructure/adapter-registry";
import { AssetDiscoveryService } from "@lib/application/asset-discovery.service";
import { PolyHavenAdapter } from "@lib/adapters/api/poly-haven.adapter";
import { AmbientCGAdapter } from "@lib/adapters/api/ambient-cg.adapter";
import { KenneyAdapter } from "@lib/adapters/scraping/kenney.adapter";
import { OpenGameArtAdapter } from "@lib/adapters/scraping/opengameart.adapter";
import { QuaterniusAdapter } from "@lib/adapters/scraping/quaternius.adapter";
import { PolyPizzaAdapter } from "@lib/adapters/scraping/poly-pizza.adapter";

/**
 * Bootstrap an AdapterRegistry with all 6 known adapters.
 * Returns the configured registry ready for use.
 */
export function createRegistry(): AdapterRegistry {
  const registry = new AdapterRegistry();

  // API adapters
  registry.register(new PolyHavenAdapter());
  registry.register(new AmbientCGAdapter());

  // Scraping adapters
  registry.register(new KenneyAdapter());
  registry.register(new OpenGameArtAdapter());
  registry.register(new QuaterniusAdapter());
  registry.register(new PolyPizzaAdapter());

  return registry;
}

/**
 * Create a fully configured AssetDiscoveryService with all adapters wired.
 * Convenience entry point for application bootstrap.
 */
export function createAssetDiscoveryService(): AssetDiscoveryService {
  return new AssetDiscoveryService(createRegistry());
}
