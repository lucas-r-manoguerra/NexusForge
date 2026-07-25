# Asset Source Gateway Specification

## Purpose

Define the `AssetSourceGateway` output port — the unified contract every source adapter (API or scraping) MUST implement. This port makes the service layer source-agnostic: it calls one interface regardless of whether the adapter uses REST or Playwright.

## Requirements

### Requirement: AssetSourceGateway Interface

The system SHALL define `AssetSourceGateway` as a TypeScript interface with:

```typescript
interface AssetSourceGateway {
  readonly sourceKey: string;
  listAssets(type?: AssetType): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | null>;
}
```

#### Scenario: Gateway implemented by API adapter

- GIVEN a `PolyHavenAdapter` class
- WHEN it implements `AssetSourceGateway`
- THEN `sourceKey` returns `"polyhaven"`
- AND `listAssets()` returns `Asset[]`
- AND `getAsset("some-id")` returns `Asset | null`

#### Scenario: Gateway implemented by scraping adapter

- GIVEN a `KenneyAdapter` class
- WHEN it implements `AssetSourceGateway`
- THEN `sourceKey` returns `"kenney"`
- AND `listAssets()` returns `Asset[]`
- AND `getAsset("some-id")` returns `Asset | null`

### Requirement: listAssets Behavior

`listAssets(type?)` SHALL return all assets from the source, optionally filtered by `AssetType`. Results MUST be normalized to the canonical `Asset` shape regardless of source format.

#### Scenario: List all assets without filter

- GIVEN a Poly Haven adapter connected to the live API
- WHEN `listAssets()` is called with no arguments
- THEN a non-empty `Asset[]` is returned
- AND each asset has `sourceKey === "polyhaven"`
- AND all required fields are populated

#### Scenario: List assets filtered by type

- GIVEN a Poly Haven adapter
- WHEN `listAssets("texture")` is called
- THEN only assets with `type === "texture"` are returned
- AND each returned asset has `sourceKey === "polyhaven"`

#### Scenario: Empty source returns empty array

- GIVEN an adapter connected to a source with no assets of the requested type
- WHEN `listAssets("audio")` is called
- THEN an empty array `[]` is returned (not null, not error)

### Requirement: getAsset Behavior

`getAsset(id)` SHALL return a single `Asset` by its source-specific ID, or `null` if not found. The returned asset MUST be normalized to the canonical shape.

#### Scenario: Get existing asset

- GIVEN a valid asset ID from the source
- WHEN `getAsset(id)` is called
- THEN the matching `Asset` is returned
- AND `asset.id === id`

#### Scenario: Get nonexistent asset

- GIVEN an invalid asset ID
- WHEN `getAsset("nonexistent-id")` is called
- THEN `null` is returned (not error, not undefined)

### Requirement: Source Isolation

Each adapter instance MUST operate independently. A failure in one adapter MUST NOT affect others. The service layer handles aggregation and error isolation.

#### Scenario: One adapter fails, others succeed

- GIVEN adapters for Poly Haven and Kenney are registered
- WHEN Poly Haven's `listAssets()` throws a network error
- THEN the error is caught by the service layer
- AND Kenney's `listAssets()` still executes successfully

## Constraints

- The gateway interface MUST NOT include source-specific methods (no PolyHaven-specific methods on the interface)
- `sourceKey` MUST be a readonly property (immutable per adapter instance)
- Adapters MUST normalize all responses to the canonical `Asset` shape before returning
- The gateway interface lives in `src/lib/ports/output/` (hexagonal output port)

## Dependencies

- `Asset` entity from asset-domain
- `AssetType` from asset-domain

## Out of Scope

- Caching or rate-limiting (future infrastructure concern)
- Pagination (all sources return complete asset lists for now)
- Authentication (all sources are free/public)
