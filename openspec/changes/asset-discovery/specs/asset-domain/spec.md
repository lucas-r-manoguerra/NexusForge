# Asset Domain Specification

## Purpose

Define the core domain models — `Asset`, `AssetSource`, `AssetType`, and `License` — that represent the universal asset abstraction across all external sources. This is the canonical shape every adapter produces and every consumer reads.

## Requirements

### Requirement: Asset Entity

The system SHALL define an `Asset` entity with these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Source-specific identifier |
| `sourceKey` | `string` | Yes | Adapter key (e.g., `"polyhaven"`, `"kenney"`) |
| `name` | `string` | Yes | Human-readable asset name |
| `description` | `string` | No | Asset description from source |
| `type` | `AssetType` | Yes | Asset classification |
| `license` | `License` | Yes | License information |
| `downloadUrl` | `string` | Yes | Primary download URL |
| `thumbnailUrl` | `string` | No | Preview image URL |
| `tags` | `string[]` | Yes | Searchable tags (empty array if none) |
| `metadata` | `Record<string, unknown>` | Yes | Source-specific extra fields |
| `discoveredAt` | `Date` | Yes | Timestamp of discovery |

#### Scenario: Asset created from API response

- GIVEN a valid API response from Poly Haven
- WHEN the adapter normalizes the response to an `Asset`
- THEN all required fields are populated
- AND `tags` is an array (empty if no tags found)
- AND `discoveredAt` is set to the current timestamp

#### Scenario: Asset preserves source-specific metadata

- GIVEN an AmbientCG asset with extra fields `colorSpace` and `format`
- WHEN the adapter normalizes the response
- THEN `metadata.colorSpace` and `metadata.format` are preserved
- AND standard fields are populated independently of metadata

### Requirement: AssetType Enumeration

The system SHALL define `AssetType` as a string union: `"model" | "texture" | "hdri" | "audio" | "image" | "pack"`.

#### Scenario: Valid asset type accepted

- GIVEN a string `"texture"`
- WHEN used as an `AssetType`
- THEN the value is accepted without error

#### Scenario: Invalid asset type rejected

- GIVEN a string `"video"`
- WHEN used as an `AssetType`
- THEN TypeScript compilation fails or a runtime guard throws

### Requirement: License Classification

The system SHALL define a `License` value object with fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `spdxId` | `string` | Yes | SPDX identifier (e.g., `"CC0-1.0"`, `"CC-BY-4.0"`) |
| `name` | `string` | Yes | Human-readable name |
| `commercial` | `boolean` | Yes | Whether commercial use is permitted |
| `attribution` | `boolean` | Yes | Whether attribution is required |

#### Scenario: CC0 license detected

- GIVEN an asset licensed under CC0
- WHEN the adapter maps the license
- THEN `spdxId` is `"CC0-1.0"`
- AND `commercial` is `true`
- AND `attribution` is `false`

#### Scenario: CC-BY license detected

- GIVEN an asset licensed under CC-BY-4.0
- WHEN the adapter maps the license
- THEN `spdxId` is `"CC-BY-4.0"`
- AND `commercial` is `true`
- AND `attribution` is `true`

#### Scenario: Unknown license string mapped

- GIVEN a license string `"Custom Free License"` not in the SPDX database
- WHEN the adapter maps the license
- THEN `spdxId` is set to the raw string
- AND `name` defaults to the raw string
- AND `commercial` defaults to `false` (conservative)

### Requirement: AssetSource Model

The system SHALL define an `AssetSource` entity with:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | `string` | Yes | Unique adapter key |
| `name` | `string` | Yes | Display name |
| `baseUrl` | `string` | Yes | Source website root URL |
| `adapterType` | `"api" \| "scraping"` | Yes | How assets are fetched |

#### Scenario: API source configured

- GIVEN a Poly Haven source definition
- WHEN registered in the adapter registry
- THEN `key` is `"polyhaven"`
- AND `adapterType` is `"api"`

#### Scenario: Scraping source configured

- GIVEN a Kenney source definition
- WHEN registered in the adapter registry
- THEN `key` is `"kenney"`
- AND `adapterType` is `"scraping"`

## Constraints

- Domain models MUST NOT import from any other layer (dependency rule)
- All domain types MUST be plain TypeScript interfaces/types (no class inheritance, no ORM decorators)
- `Asset.id` is source-specific — it is NOT globally unique across sources (composite key is `sourceKey + id`)

## Dependencies

- None (pure domain layer)

## Out of Scope

- Prisma schema mapping (handled by infrastructure adapter)
- Asset validation beyond type-level (no runtime schema in domain)
- Asset equality/comparison logic
