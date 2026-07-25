# Asset Discovery Service Specification

## Purpose

Define the `AssetDiscoveryService` application-layer use case that orchestrates multi-source asset discovery. This service calls `AssetSourceGateway` adapters, aggregates results, and provides a unified interface for consumers.

## Requirements

### Requirement: DiscoverAssets Input Port

The system SHALL define `DiscoverAssets` as an input port interface:

```typescript
interface DiscoverAssets {
  execute(sourceKey: string, type?: AssetType): Promise<Asset[]>;
  discoverAll(type?: AssetType): Promise<Asset[]>;
}
```

#### Scenario: Service implements input port

- GIVEN an `AssetDiscoveryService` instance
- WHEN it is created with a registry of adapters
- THEN it implements `DiscoverAssets`
- AND can be injected into consumers via the interface

### Requirement: Single Source Discovery

`execute(sourceKey, type?)` SHALL discover assets from a single source identified by `sourceKey`. It MUST look up the adapter from the registry, call `listAssets(type?)`, and return normalized results.

#### Scenario: Discover from valid source

- GIVEN the registry contains a Poly Haven adapter
- WHEN `execute("polyhaven", "model")` is called
- THEN Poly Haven's `listAssets("model")` is called
- AND the returned `Asset[]` is passed through

#### Scenario: Discover from unknown source

- GIVEN the registry does NOT contain a source with key `"unknown"`
- WHEN `execute("unknown")` is called
- THEN an error is thrown with a message indicating the source is not registered
- AND no adapter methods are called

### Requirement: Multi-Source Discovery

`discoverAll(type?)` SHALL iterate over ALL registered adapters, call `listAssets(type?)` on each, and aggregate results. It MUST be resilient — a failure in one source MUST NOT prevent results from other sources.

#### Scenario: All sources succeed

- GIVEN adapters for Poly Haven, AmbientCG, and Kenney are registered
- WHEN `discoverAll()` is called
- THEN each adapter's `listAssets()` is called
- AND results are concatenated into a single `Asset[]`
- AND assets from all sources appear in the result

#### Scenario: One source fails, others continue

- GIVEN adapters for Poly Haven (will fail) and Kenney (will succeed) are registered
- WHEN `discoverAll()` is called
- THEN Poly Haven's failure is logged and skipped
- AND Kenney's assets are still returned
- AND the returned array contains only Kenney assets

#### Scenario: All sources fail

- GIVEN all registered adapters throw errors
- WHEN `discoverAll()` is called
- THEN an empty array `[]` is returned (not an error)
- AND all failures are logged

### Requirement: Adapter Registry

The system SHALL provide an adapter registry that maps `sourceKey` strings to `AssetSourceGateway` instances. The registry is the single source of truth for which adapters are available.

#### Scenario: Registry contains all adapters

- GIVEN the registry is initialized with 6 adapters
- WHEN `registry.getAll()` is called
- THEN 6 `AssetSourceGateway` instances are returned
- AND each has a unique `sourceKey`

#### Scenario: Registry lookup by key

- GIVEN the registry contains a Poly Haven adapter
- WHEN `registry.get("polyhaven")` is called
- THEN the `PolyHavenAdapter` instance is returned

#### Scenario: Registry lookup miss

- GIVEN the registry does NOT contain key `"nonexistent"`
- WHEN `registry.get("nonexistent")` is called
- THEN `undefined` is returned (not error)

### Requirement: Error Logging

The service MUST log adapter failures with source key and error message. Logs MUST include enough context for debugging without exposing sensitive data.

#### Scenario: Adapter failure logged

- GIVEN Poly Haven's `listAssets()` throws `NetworkError`
- WHEN the service catches the error during `discoverAll()`
- THEN a log entry is emitted with level `warn`
- AND the log includes `sourceKey: "polyhaven"` and the error message
- AND execution continues with remaining adapters

## Constraints

- The service MUST NOT import from adapter implementations (depends only on ports)
- The service MUST NOT know whether an adapter uses API or scraping (source-agnostic)
- Error isolation is mandatory — adapter failures are caught per-source, not globally
- The service lives in `src/lib/application/` (hexagonal application layer)

## Dependencies

- `AssetSourceGateway` port from asset-source-gateway
- `Asset` entity from asset-domain
- Adapter registry from infrastructure

## Out of Scope

- Persistence (saving discovered assets to database)
- Scheduling or cron-based discovery
- Webhook notifications for new assets
- Deduplication across sources
