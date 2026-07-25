# Proposal: Asset Discovery Engine

## Intent

NexusForge has scaffolding but no real feature. The first capability must be an Asset Discovery Engine that discovers, catalogs, and normalizes assets from external sources — the foundational data pipeline the entire platform depends on. Without this, there are no assets to browse, manage, or serve.

## Scope

### In Scope
- Domain models: `Asset`, `AssetSource`, `AssetType`, `License`
- Unified `AssetSourceGateway` port (output port)
- `AssetDiscoveryService` use case (application layer)
- 2 API adapters: Poly Haven, AmbientCG (direct REST)
- 4 scraping adapters: OpenGameArt, Kenney, Quaternius, Poly Pizza (Playwright headless)
- Adapter registry: factory that instantiates adapters by source key
- Unit tests for domain models, service, and adapters (with fixtures)
- Prisma schema for `Asset` and `AssetSource` persistence

### Out of Scope
- UI/browse pages (future change, but Impeccable will be the design gate when implemented)
- Asset download/storage pipeline
- Search, filtering, or tagging
- Scheduled/cron discovery jobs
- Rate-limiting middleware
- Playwright MCP server setup (separate infra concern)

## Capabilities

### New Capabilities
- `asset-domain`: Asset, AssetSource, AssetType, License domain models
- `asset-source-gateway`: Unified port contract for all source adapters
- `asset-discovery-service`: Orchestration use case for multi-source discovery
- `api-adapters`: Poly Haven and AmbientCG REST adapters
- `scraping-adapters`: Playwright-driven adapters for non-API sources

### Modified Capabilities
None — first feature, no existing specs change.

## Approach

**Dual adapter architecture** — API and scraping adapters implement the same `AssetSourceGateway` port:

```
Domain: Asset, AssetSource, AssetType, License
    ↑
Ports: AssetSourceGateway (output), DiscoverAssets (input)
    ↑
Application: AssetDiscoveryService
    ↑
Adapters: [PolyHaven, AmbientCG] + [OpenGameArt, Kenney, Quaternius, PolyPizza]
```

**API adapters**: Direct HTTP via `fetch()` to REST endpoints. Parse JSON responses, normalize to `Asset`.

**Scraping adapters**: Use `playwright` (Chromium headless) to navigate site pages, extract asset metadata/links via CSS selectors, normalize to `Asset`. Each adapter encapsulates site-specific selector logic and pagination.

Both adapter types return identical `Asset[]` — the service layer is source-agnostic.

**UI Design Quality Gate (Impeccable)**: When UI pages are added (browse, catalog), the design workflow uses [Impeccable](https://impeccable.style/) to eliminate AI-generated UI slop:
- Run `npx impeccable install` to add slop detection + design tokens to the project
- Generate `DESIGN.md` via `/impeccable document` as part of UI deliverable — captures typography, spacing, color, and component tokens
- Run `npx impeccable detect src/` as a CI check on every PR touching UI code
- Use `/impeccable polish` during development to clean layouts, spacing, and visual rhythm
- Use `/typeset` for typographic consistency across asset catalog pages
- Impeccable slop detection gates the PR — `npx impeccable detect src/` must exit clean before merge

## File Tree

```
src/lib/
├── domain/models/
│   ├── asset.ts
│   ├── asset-source.ts
│   ├── asset-type.ts
│   └── license.ts
├── ports/
│   ├── input/
│   │   └── asset-discovery.port.ts
│   └── output/
│       └── asset-source.gateway.ts
├── application/
│   └── asset-discovery.service.ts
├── adapters/
│   ├── api/
│   │   ├── poly-haven.adapter.ts
│   │   └── ambient-cg.adapter.ts
│   └── scraping/
│       ├── opengameart.adapter.ts
│       ├── kenney.adapter.ts
│       ├── quaternius.adapter.ts
│       └── poly-pizza.adapter.ts
└── infrastructure/
    └── adapter-registry.ts

prisma/
└── schema.prisma (add Asset, AssetSource models)

tests/
├── unit/domain/models/asset.test.ts
├── unit/application/asset-discovery.service.test.ts
├── unit/adapters/api/poly-haven.adapter.test.ts
├── unit/adapters/api/ambient-cg.adapter.test.ts
├── unit/adapters/scraping/adapters.test.ts
└── fixtures/responses/{poly-haven,ambient-cg}/

DESIGN.md              # UI phase — Impeccable-generated design tokens
src/components/        # UI phase — Impeccable-polished components
```

## Port/Adapter Design

```typescript
// output port — the contract
interface AssetSourceGateway {
  readonly sourceKey: string;
  listAssets(type?: AssetType): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | null>;
}

// input port — use case interface
interface DiscoverAssets {
  execute(sourceKey: string, type?: AssetType): Promise<Asset[]>;
  discoverAll(type?: AssetType): Promise<Asset[]>;
}

// Domain model
interface Asset {
  id: string;                // source-specific ID
  sourceKey: string;         // e.g. "polyhaven", "kenney"
  name: string;
  description?: string;
  type: AssetType;           // MODEL | TEXTURE | HDRI | AUDIO | IMAGE | PACK
  license: License;
  downloadUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  metadata: Record<string, unknown>;  // source-specific extras
  discoveredAt: Date;
}

type AssetType = "model" | "texture" | "hdri" | "audio" | "image" | "pack";
```

## Dependencies

| Package | Purpose | Tier |
|---------|---------|------|
| `playwright` | Headless Chromium for scraping adapters | dependency |
| `@playwright/test` | Test runner integration for scraping tests | devDependency |
| `impeccable` | Design slop detection + DESIGN.md generation | devDependency |

No auth tokens needed — all sources are free/public.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/domain/models/` | New | Asset, AssetSource, AssetType, License entities |
| `src/lib/ports/output/` | New | AssetSourceGateway interface |
| `src/lib/ports/input/` | New | DiscoverAssets use case interface |
| `src/lib/application/` | New | AssetDiscoveryService orchestration |
| `src/lib/adapters/api/` | New | PolyHaven, AmbientCG adapters |
| `src/lib/adapters/scraping/` | New | 4 Playwright scraping adapters |
| `src/lib/infrastructure/` | New | Adapter registry |
| `prisma/schema.prisma` | Modified | Add Asset, AssetSource models |
| `package.json` | Modified | Add playwright + impeccable dev dependency |
| `DESIGN.md` | New (UI phase) | Design system tokens generated by Impeccable |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Scraping adapters break when sites change selectors | High | Selector config per adapter; fixture-based tests; graceful degradation (skip failed sources) |
| Playwright adds heavy dependency (browser binary) | Medium | Isolate behind port — API-only mode possible; CI can skip scraping tests |
| Rate limiting from rapid scraping | Medium | Configurable delay between requests per adapter; respect robots.txt |
| Poly Haven / AmbientCG API changes | Low | Fixture-based tests catch schema drift; adapters isolate API surface |
| Sites block headless browsers | Medium | Use realistic user-agent; add stealth mode; fallback to empty results with warning |

## Rollback Plan

1. Remove all files under `src/lib/adapters/`, `src/lib/application/asset-discovery.service.ts`, `src/lib/ports/`
2. Revert `prisma/schema.prisma` changes
3. Remove `playwright` and `impeccable` from `package.json`
4. Delete `DESIGN.md` if generated
5. Delete test fixtures
6. `git checkout` the affected paths — no migration to revert since this is additive

## Success Criteria

- [ ] `AssetSourceGateway` port implemented by all 6 adapters
- [ ] `AssetDiscoveryService.discoverAll()` returns `Asset[]` from all sources
- [ ] API adapters pass unit tests with fixture data
- [ ] Scraping adapters pass unit tests with fixture HTML
- [ ] Prisma schema validates with Asset/AssetSource models
- [ ] No domain layer imports from adapters/application (dependency rule holds)
- [ ] Each adapter can be instantiated independently via registry
- [ ] `npx impeccable detect src/` passes with zero slop findings (UI phase)
- [ ] `DESIGN.md` generated and committed with design system tokens (UI phase)
- [ ] Impeccable PR check blocks merge on slop detection failures (CI phase)
