# Design: Asset Discovery Engine

## Technical Approach

Hexagonal architecture with a single output port (`AssetSourceGateway`) implemented by 6 adapters — 2 REST API adapters using `fetch()` and 4 scraping adapters using Playwright Chromium. An application-layer service (`AssetDiscoveryService`) fans out to all registered adapters via the port, aggregates results, and isolates failures per source. The service is completely source-agnostic; it never knows whether an adapter uses HTTP or a browser.

Data flows: **External Source → Adapter (normalizes to Asset[]) → Service (aggregates) → Consumer (UI/API)**.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| Port pattern | Generic repository vs purpose-specific gateway | `AssetSourceGateway` (purpose-specific) | Each source only needs `listAssets` + `getAsset`. A generic repository overloads the contract. |
| Scraping engine | Puppeteer vs Playwright vs raw HTTP | Playwright Chromium | Spec requires it; better API for navigation/waiting; supports future MCP integration. |
| Adapter instantiation | DI container vs manual registry vs factory | Manual registry (`adapter-registry.ts`) | 6 adapters, no dynamic resolution needed. Registry is a plain map — testable, explicit, zero magic. |
| Error isolation | Promise.allSettled vs try/catch per source | try/catch per adapter in loop | `Promise.allSettled` requires all promises upfront. Sequential loop with per-source catch gives logging + continues gracefully. |
| License mapping | Shared utility vs per-adapter logic | Shared `license-map.ts` utility | Duplicated SPDX mapping across 6 adapters is a maintenance liability. Single source of truth. |
| Domain types | Classes vs interfaces vs Zod schemas | Plain TS interfaces + string union | Spec mandates no ORM decorators or class inheritance. Runtime validation via Zod in adapters (boundary), not domain. |
| Browser lifecycle | New browser per call vs shared pool | New browser per `listAssets()` call | Scraping adapters are stateless per invocation. Browser pool adds complexity with no caching benefit at this stage. |
| Type filtering | Filter in adapter vs filter in service | Both — adapter pre-filters when API supports it; service post-filters as safety net | API adapters pass filter to endpoint (efficient). Scraping adapters return all; service filters. Defense in depth. |

## Data Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Consumer    │────▶│ AssetDiscovery   │────▶│ AdapterRegistry │
│  (UI/API)    │     │ Service          │     │ (map<string, GW>)│
└─────────────┘     └──────────────────┘     └─────────────────┘
                            │                         │
                   execute() or                ┌──────┴──────┐
                   discoverAll()               │             │
                            │             ┌────▼───┐   ┌────▼──────┐
                            │             │ API GW │   │ Scraping GW│
                            │             └────┬───┘   └────┬──────┘
                            │                  │             │
                            ▼                  ▼             ▼
                    ┌──────────────────────────────────────────┐
                    │         Normalized Asset[]               │
                    │  (sourceKey, name, type, license, tags)  │
                    └──────────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/domain/models/asset.ts` | Create | `Asset` interface, `AssetType` union |
| `src/lib/domain/models/license.ts` | Create | `License` value object interface |
| `src/lib/domain/models/asset-source.ts` | Create | `AssetSource` entity interface |
| `src/lib/ports/output/asset-source.gateway.ts` | Create | `AssetSourceGateway` output port interface |
| `src/lib/ports/input/asset-discovery.port.ts` | Create | `DiscoverAssets` input port interface |
| `src/lib/application/asset-discovery.service.ts` | Create | Service orchestration implementing `DiscoverAssets` |
| `src/lib/adapters/api/poly-haven.adapter.ts` | Create | REST adapter for Poly Haven API |
| `src/lib/adapters/api/ambient-cg.adapter.ts` | Create | REST adapter for AmbientCG API |
| `src/lib/adapters/scraping/opengameart.adapter.ts` | Create | Playwright adapter for OpenGameArt |
| `src/lib/adapters/scraping/kenney.adapter.ts` | Create | Playwright adapter for Kenney |
| `src/lib/adapters/scraping/quaternius.adapter.ts` | Create | Playwright adapter for Quaternius |
| `src/lib/adapters/scraping/poly-pizza.adapter.ts` | Create | Playwright adapter for Poly Pizza |
| `src/lib/adapters/shared/license-map.ts` | Create | SPDX license normalization utility |
| `src/lib/adapters/shared/type-map.ts` | Create | Source-category → AssetType mapping utility |
| `src/lib/infrastructure/adapter-registry.ts` | Create | Adapter registry (sourceKey → gateway map) |
| `prisma/schema.prisma` | Modify | Add `Asset` and `AssetSource` models |
| `package.json` | Modify | Add `playwright`, `@playwright/test`, `impeccable` |
| `tests/unit/domain/models/asset.test.ts` | Create | Domain model tests |
| `tests/unit/application/asset-discovery.service.test.ts` | Create | Service orchestration tests |
| `tests/unit/adapters/api/poly-haven.adapter.test.ts` | Create | Poly Haven adapter tests (mocked fetch) |
| `tests/unit/adapters/api/ambient-cg.adapter.test.ts` | Create | AmbientCG adapter tests (mocked fetch) |
| `tests/unit/adapters/scraping/adapters.test.ts` | Create | Scraping adapter tests (fixture HTML) |
| `tests/fixtures/responses/poly-haven/` | Create | Poly Haven API response fixtures |
| `tests/fixtures/responses/ambient-cg/` | Create | AmbientCG API response fixtures |
| `tests/fixtures/html/kenney.html` | Create | Kenney page HTML fixture |
| `tests/fixtures/html/opengameart.html` | Create | OpenGameArt page HTML fixture |
| `tests/fixtures/html/quaternius.html` | Create | Quaternius page HTML fixture |
| `tests/fixtures/html/poly-pizza.html` | Create | Poly Pizza page HTML fixture |

## Interfaces / Contracts

### Domain Layer

```typescript
// src/lib/domain/models/asset.ts
export type AssetType = "model" | "texture" | "hdri" | "audio" | "image" | "pack";

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

// src/lib/domain/models/license.ts
export interface License {
  spdxId: string;
  name: string;
  commercial: boolean;
  attribution: boolean;
}

// src/lib/domain/models/asset-source.ts
export interface AssetSource {
  key: string;
  name: string;
  baseUrl: string;
  adapterType: "api" | "scraping";
}
```

### Ports

```typescript
// src/lib/ports/output/asset-source.gateway.ts
import type { Asset, AssetType } from "@lib/domain/models/asset";

export interface AssetSourceGateway {
  readonly sourceKey: string;
  listAssets(type?: AssetType): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | null>;
}

// src/lib/ports/input/asset-discovery.port.ts
import type { Asset, AssetType } from "@lib/domain/models/asset";

export interface DiscoverAssets {
  execute(sourceKey: string, type?: AssetType): Promise<Asset[]>;
  discoverAll(type?: AssetType): Promise<Asset[]>;
}
```

### Adapter Registry

```typescript
// src/lib/infrastructure/adapter-registry.ts
import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";

export class AdapterRegistry {
  private adapters = new Map<string, AssetSourceGateway>();

  register(gateway: AssetSourceGateway): void { ... }
  get(sourceKey: string): AssetSourceGateway | undefined { ... }
  getAll(): AssetSourceGateway[] { ... }
  getKeys(): string[] { ... }
}
```

### Shared Utilities

```typescript
// src/lib/adapters/shared/license-map.ts
export function normalizeLicense(raw: string): License { ... }
// Maps "CC0" → { spdxId: "CC0-1.0", name: "CC Zero 1.0", commercial: true, attribution: false }
// Maps "CC-BY 4.0" → { spdxId: "CC-BY-4.0", ... attribution: true }
// Unknown → { spdxId: raw, name: raw, commercial: false, attribution: false }

// src/lib/adapters/shared/type-map.ts
export function mapCategoryToAssetType(category: string, sourceKey: string): AssetType { ... }
// Source-specific mappings: Kenney "3D" → "model", "2D" → "image", "Audio" → "audio"
// Quaternius → always "pack"
// Poly Pizza → always "model"
```

### API Adapter Pattern (example)

```typescript
// src/lib/adapters/api/poly-haven.adapter.ts
export class PolyHavenAdapter implements AssetSourceGateway {
  readonly sourceKey = "polyhaven";
  private readonly baseUrl = "https://api.polyhaven.com";

  async listAssets(type?: AssetType): Promise<Asset[]> {
    const url = type
      ? `${this.baseUrl}/assets?t=${type}`
      : `${this.baseUrl}/assets`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Poly Haven API error: ${res.status}`);
    const data: PolyHavenResponse = await res.json();
    return data.map(item => this.normalize(item));
  }

  async getAsset(id: string): Promise<Asset | null> { ... }
  private normalize(raw: PolyHavenAsset): Asset { ... }
}
```

### Scraping Adapter Pattern (example)

```typescript
// src/lib/adapters/scraping/kenney.adapter.ts
import { chromium } from "playwright";

const SELECTORS = {
  assetCard: ".asset-card",
  name: ".asset-title",
  thumbnail: ".asset-thumbnail img",
  category: ".asset-category",
  link: ".asset-card a",
} as const;

export class KenneyAdapter implements AssetSourceGateway {
  readonly sourceKey = "kenney";
  private readonly baseUrl = "https://kenney.nl/assets";

  async listAssets(type?: AssetType): Promise<Asset[]> {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(this.baseUrl, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(SELECTORS.assetCard);
      const raw = await page.$$eval(SELECTORS.assetCard, (cards) =>
        cards.map((card) => ({ /* extract fields */ }))
      );
      return raw.map(item => this.normalize(item));
    } catch (err) {
      console.warn(`[kenney] Scraping failed: ${err}`);
      return [];
    } finally {
      await browser.close();
    }
  }
  // ...
}
```

### Service Layer

```typescript
// src/lib/application/asset-discovery.service.ts
import type { DiscoverAssets } from "@lib/ports/input/asset-discovery.port";
import type { AssetSourceGateway } from "@lib/ports/output/asset-source.gateway";
import type { Asset, AssetType } from "@lib/domain/models/asset";

export class AssetDiscoveryService implements DiscoverAssets {
  constructor(private readonly registry: AdapterRegistry) {}

  async execute(sourceKey: string, type?: AssetType): Promise<Asset[]> {
    const gateway = this.registry.get(sourceKey);
    if (!gateway) throw new Error(`Source not registered: ${sourceKey}`);
    return gateway.listAssets(type);
  }

  async discoverAll(type?: AssetType): Promise<Asset[]> {
    const results: Asset[] = [];
    for (const gateway of this.registry.getAll()) {
      try {
        const assets = await gateway.listAssets(type);
        results.push(...assets);
      } catch (err) {
        console.warn(`[${gateway.sourceKey}] Discovery failed: ${err}`);
      }
    }
    return results;
  }
}
```

### Prisma Schema Addition

```prisma
model Asset {
  id           String   @id @default(uuid()) @db.Uuid
  sourceId     String   @db.Uuid
  sourceAssetId String              // source-specific ID (not unique alone)
  name         String
  description  String?
  type         String               // AssetType as string
  spdxId       String               // License SPDX
  licenseName  String
  commercial   Boolean
  attribution  Boolean
  downloadUrl  String
  thumbnailUrl String?
  tags         String[]             // PostgreSQL array
  metadata     Json                 // source-specific extras
  discoveredAt DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  source       AssetSource @relation(fields: [sourceId], references: [id])

  @@unique([sourceId, sourceAssetId])
  @@index([type])
  @@index([sourceId])
}

model AssetSource {
  id          String   @id @default(uuid()) @db.Uuid
  key         String   @unique       // "polyhaven", "kenney", etc.
  name        String
  baseUrl     String
  adapterType String                 // "api" | "scraping"
  assets      Asset[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Environment Variables

```bash
# .env.example additions
SCRAPE_DELAY_MS=1000                # Delay between scraping page navigations
SCRAPE_TIMEOUT_MS=30000             # Playwright page load timeout
LOG_LEVEL=info                      # Console log level for adapter warnings
```

## Impeccable Integration (UI Phase)

The Impeccable quality gate applies when UI components are built (future tasks within this change or next change):

1. **Install**: `pnpm add -D impeccable` — adds slop detection
2. **Generate DESIGN.md**: `npx impeccable document` — captures typography, spacing, color tokens from existing CSS
3. **CI Check**: `npx impeccable detect src/` in GitHub Actions workflow — blocks PRs with design inconsistencies
4. **Polish workflow**: `npx impeccable polish src/components/` during development
5. **Typographic consistency**: `/typeset` for asset catalog pages

UI components (`SearchBar`, `AssetCard`, `FilterPanel`, `AssetGrid`) follow Atomic Design and use Tailwind v4 tokens exclusively — no hardcoded pixel values.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Unit — Domain** | `Asset` type guards, `License` normalization, `AssetType` validation | Pure function tests with `describe/it/expect`. No mocks. |
| **Unit — Service** | `AssetDiscoveryService.execute()` + `discoverAll()` with success/failure/unknown-source scenarios | Mock `AdapterRegistry` returning mock gateways. Verify error isolation (one fails → others succeed). |
| **Unit — API Adapters** | `PolyHavenAdapter.listAssets()` and `AmbientCGAdapter.listAssets()` response normalization | Mock `global.fetch` with fixture JSON. Verify normalization correctness, error handling, license mapping. |
| **Unit — Scraping Adapters** | Selector extraction, normalization, graceful degradation | Parse fixture HTML with `jsdom` (not Playwright) for unit tests. Verify empty array on missing selectors. |
| **Integration — Scraping** | Full Playwright browser lifecycle (optional, gated) | `@playwright/test` with real Chromium. Marked `describe.skip` in CI without Playwright installed. |
| **Unit — Registry** | `AdapterRegistry.register()`, `.get()`, `.getAll()` | Simple map operations — no external dependencies. |

### Fixture Structure

```
tests/fixtures/
├── responses/
│   ├── poly-haven/
│   │   ├── assets.json          # GET /assets response
│   │   └── asset-detail.json    # GET /info/{id} response
│   └── ambientcg/
│       ├── assets.json          # GET /assets response
│       └── asset-detail.json    # GET /materials/{id} response
└── html/
    ├── kenney.html              # Full assets page snapshot
    ├── opengameart.html         # Art listing page snapshot
    ├── quaternius.html          # Free assets page snapshot
    └── poly-pizza.html          # Browse page snapshot
```

## Migration / Rollout

No data migration required — this is additive. New Prisma models only. Run `prisma migrate dev --name add-asset-models` after schema update.

Feature flags: none for the discovery pipeline. Impeccable CI check gated behind GitHub Actions workflow (add `.github/workflows/impeccable.yml`).

## Implementation Order

Sequential steps for tasks phase — each step produces a testable increment:

1. **Domain models** — `Asset`, `License`, `AssetType`, `AssetSource` + domain tests
2. **Ports** — `AssetSourceGateway` output port, `DiscoverAssets` input port
3. **Shared utilities** — `license-map.ts`, `type-map.ts`
4. **API adapters** — `PolyHavenAdapter`, `AmbientCGAdapter` + fixture tests
5. **Adapter registry** — `AdapterRegistry` class + tests
6. **Service layer** — `AssetDiscoveryService` + orchestration tests
7. **Scraping adapters** — 4 Playwright adapters + fixture-based unit tests
8. **Prisma schema** — Add `Asset` + `AssetSource` models, run migration
9. **Integration wiring** — Bootstrap registry with all adapters, connect to service
10. **UI search** — SearchBar, AssetCard, FilterPanel, AssetGrid components + Impeccable gate
11. **CI pipeline** — Impeccable check in GitHub Actions

## Open Questions

- [ ] Should `discoveredAt` on the domain `Asset` be set by the adapter (at fetch time) or by the service (at aggregation time)? Recommendation: adapter sets it — it reflects when the source was actually queried.
- [ ] Playwright browser install in CI — does the project use `playwright install --with-deps chromium` in the Docker build, or skip scraping tests in CI? Recommendation: skip scraping integration tests in CI, run unit tests only with fixture HTML.
- [ ] Poly Haven API uses asset slugs as IDs, not UUIDs. AmbientCG uses numeric IDs. The composite key `(sourceKey, sourceAssetId)` handles this, but the Prisma `Asset.id` should be the generated UUID PK — source-specific ID stored as `sourceAssetId`. Confirm this is the intended mapping.
