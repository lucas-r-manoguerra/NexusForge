# Tasks: Asset Discovery Engine

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1500–2000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Domain models, ports, shared utilities, registry | PR 1 | `pnpm vitest run tests/unit/domain` | N/A — pure contracts, no runtime entry point | `src/lib/domain/`, `src/lib/ports/`, `src/lib/adapters/shared/`, `src/lib/infrastructure/` |
| 2 | API adapters + service + orchestration tests | PR 2 | `pnpm vitest run tests/unit/application tests/unit/adapters/api` | `pnpm exec tsx src/lib/application/asset-discovery.service.ts` (verify import chain) | `src/lib/adapters/api/`, `src/lib/application/`, `tests/unit/adapters/api/`, `tests/unit/application/`, `tests/fixtures/responses/` |
| 3 | Scraping adapters + fixture HTML + adapter tests | PR 3 | `pnpm vitest run tests/unit/adapters/scraping` | N/A — requires Playwright browser binary | `src/lib/adapters/scraping/`, `tests/unit/adapters/scraping/`, `tests/fixtures/html/` |
| 4 | Prisma schema + package.json + integration wiring | PR 4 | `pnpm prisma validate && pnpm prisma migrate dev --name add-asset-models` | `pnpm prisma migrate dev` | `prisma/schema.prisma`, `package.json` |

---

## Phase 1: Domain Foundation

- [x] 1.1 Create `src/lib/domain/models/asset.ts` — `Asset` interface, `AssetType` string union
- [x] 1.2 Create `src/lib/domain/models/license.ts` — `License` value object interface
- [x] 1.3 Create `src/lib/domain/models/asset-source.ts` — `AssetSource` entity interface
- [x] 1.4 Create `tests/unit/domain/models/asset.test.ts` — type guard tests, AssetType validation, License shape verification

## Phase 2: Ports & Contracts

- [x] 2.1 Create `src/lib/ports/output/asset-source.gateway.ts` — `AssetSourceGateway` output port interface
- [x] 2.2 Create `src/lib/ports/input/asset-discovery.port.ts` — `DiscoverAssets` input port interface

## Phase 3: Shared Utilities

- [x] 3.1 Create `src/lib/adapters/shared/license-map.ts` — `normalizeLicense()` mapping CC0, CC-BY, unknown strings
- [x] 3.2 Create `src/lib/adapters/shared/type-map.ts` — `mapCategoryToAssetType()` source-specific category mapping

## Phase 4: Adapter Registry

- [x] 4.1 Create `src/lib/infrastructure/adapter-registry.ts` — `AdapterRegistry` class with `register()`, `get()`, `getAll()`, `getKeys()`

## Phase 5: API Adapters

- [x] 5.1 Create `src/lib/adapters/api/poly-haven.adapter.ts` — Poly Haven REST adapter with `listAssets()`, `getAsset()`, response normalization
- [x] 5.2 Create `src/lib/adapters/api/ambient-cg.adapter.ts` — AmbientCG REST adapter with `listAssets()`, `getAsset()`, response normalization
- [x] 5.3 Create `tests/fixtures/responses/poly-haven/assets.json` — Poly Haven API response fixture
- [x] 5.4 Create `tests/fixtures/responses/poly-haven/asset-detail.json` — Poly Haven asset detail fixture
- [x] 5.5 Create `tests/fixtures/responses/ambientcg/assets.json` — AmbientCG API response fixture
- [x] 5.6 Create `tests/fixtures/responses/ambientcg/asset-detail.json` — AmbientCG asset detail fixture
- [x] 5.7 Create `tests/unit/adapters/api/poly-haven.adapter.test.ts` — mocked fetch tests for normalization, error handling, license mapping
- [x] 5.8 Create `tests/unit/adapters/api/ambient-cg.adapter.test.ts` — mocked fetch tests for normalization, error handling, license mapping

## Phase 6: Service Layer

- [x] 6.1 Create `src/lib/application/asset-discovery.service.ts` — `AssetDiscoveryService` implementing `DiscoverAssets`, error isolation per source
- [x] 6.2 Create `tests/unit/application/asset-discovery.service.test.ts` — mock registry tests for `execute()`, `discoverAll()`, unknown source, failure isolation

## Phase 7: Scraping Adapters

- [x] 7.1 Create `src/lib/adapters/scraping/kenney.adapter.ts` — Playwright adapter, selector constants, category→AssetType mapping
- [x] 7.2 Create `src/lib/adapters/scraping/opengameart.adapter.ts` — Playwright adapter, license extraction from page text
- [x] 7.3 Create `src/lib/adapters/scraping/quaternius.adapter.ts` — Playwright adapter, always `type: "pack"`
- [x] 7.4 Create `src/lib/adapters/scraping/poly-pizza.adapter.ts` — Playwright adapter, always `type: "model"`
- [x] 7.5 Create `tests/fixtures/html/kenney.html` — Kenney assets page snapshot
- [x] 7.6 Create `tests/fixtures/html/opengameart.html` — OpenGameArt listing page snapshot
- [x] 7.7 Create `tests/fixtures/html/quaternius.html` — Quaternius free assets page snapshot
- [x] 7.8 Create `tests/fixtures/html/poly-pizza.html` — Poly Pizza browse page snapshot
- [x] 7.9 Create `tests/unit/adapters/scraping/adapters.test.ts` — jsdom-based fixture tests for all 4 scraping adapters, graceful degradation

## Phase 8: Persistence & Wiring

- [x] 8.1 Modify `prisma/schema.prisma` — add `Asset` and `AssetSource` models with relations and indexes
- [x] 8.2 Modify `package.json` — add `playwright`, `@playwright/test`, `impeccable` devDependencies
- [x] 8.3 Create integration wiring module — bootstrap `AdapterRegistry` with all 6 adapters, export configured service instance

## Phase 9: Verification

- [x] 9.1 Run `pnpm prisma validate` — verify schema compiles
- [x] 9.2 Run `pnpm vitest run` — all unit tests pass
- [x] 9.3 Verify dependency rule — no domain layer imports from adapters/application
