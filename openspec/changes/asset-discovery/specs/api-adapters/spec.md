# API Adapters Specification

## Purpose

Define the Poly Haven and AmbientCG REST API adapters that implement `AssetSourceGateway` by calling public JSON APIs. These adapters demonstrate the API adapter pattern — direct HTTP fetch, JSON parse, normalize to `Asset`.

## Requirements

### Requirement: Poly Haven Adapter

The system SHALL provide a `PolyHavenAdapter` that fetches assets from the Poly Haven REST API (`https://api.polyhaven.com`).

#### Scenario: List all assets

- GIVEN the Poly Haven API is reachable
- WHEN `listAssets()` is called
- THEN a GET request is made to the assets endpoint
- AND the JSON response is parsed
- AND each item is normalized to the `Asset` shape
- AND `sourceKey` is `"polyhaven"`

#### Scenario: Filter by asset type

- GIVEN the Poly Haven API supports type filtering
- WHEN `listAssets("hdri")` is called
- THEN the request includes a type filter parameter
- AND only HDRI assets are returned

#### Scenario: Get single asset

- GIVEN a valid Poly Haven asset slug
- WHEN `getAsset(slug)` is called
- THEN a GET request is made to the asset detail endpoint
- AND the response is normalized to `Asset`
- AND `asset.id === slug`

#### Scenario: API returns 404

- GIVEN a nonexistent Poly Haven asset slug
- WHEN `getAsset("nonexistent")` is called
- THEN `null` is returned

#### Scenario: API returns error

- GIVEN the Poly Haven API is unreachable
- WHEN `listAssets()` is called
- THEN a descriptive error is thrown
- AND the error includes the HTTP status or network message

### Requirement: AmbientCG Adapter

The system SHALL provide an `AmbientCGAdapter` that fetches assets from the AmbientCG API (`https://ambientcg.com/api`).

#### Scenario: List all assets

- GIVEN the AmbientCG API is reachable
- WHEN `listAssets()` is called
- THEN a GET request is made to the material list endpoint
- AND the JSON response is parsed
- AND each item is normalized to the `Asset` shape
- AND `sourceKey` is `"ambientcg"`

#### Scenario: Filter by asset type

- GIVEN the AmbientCG API supports type filtering
- WHEN `listAssets("texture")` is called
- THEN the request includes a category filter
- AND only texture/material assets are returned

#### Scenario: Get single asset

- GIVEN a valid AmbientCG asset ID
- WHEN `getAsset(assetId)` is called
- THEN a GET request is made to the material detail endpoint
- AND the response is normalized to `Asset`

### Requirement: License Normalization

Both API adapters SHALL map source-specific license strings to the canonical `License` value object using a shared license mapping table.

#### Scenario: Known SPDX license mapped

- GIVEN Poly Haven returns `license: "CC0"`
- WHEN the adapter normalizes the license
- THEN `spdxId` is `"CC0-1.0"`
- AND `commercial` is `true`
- AND `attribution` is `false`

#### Scenario: Unknown license preserved

- GIVEN AmbientCG returns `license: "Free"`
- WHEN the adapter normalizes the license
- THEN `spdxId` is `"Free"` (raw value)
- AND `commercial` defaults to `false`

### Requirement: Tag Extraction

API adapters SHALL extract tags from source-specific response fields and map them to the `Asset.tags` array.

#### Scenario: Poly Haven categories become tags

- GIVEN Poly Haven returns `categories: ["wood", "planks"]`
- WHEN the adapter normalizes the asset
- THEN `tags` contains `"wood"` and `"planks"`

#### Scenario: No tags available

- GIVEN an API response with no tag/category field
- WHEN the adapter normalizes the asset
- THEN `tags` is an empty array `[]`

## Constraints

- API adapters MUST use `fetch()` (no axios or other HTTP libraries)
- API adapters MUST handle HTTP errors gracefully (non-200 responses)
- API adapters MUST map all responses to the canonical `Asset` shape
- Each adapter is a single file in `src/lib/adapters/api/`
- Adapters MUST NOT cache responses (caching is an infrastructure concern)

## Dependencies

- `AssetSourceGateway` port from asset-source-gateway
- `Asset`, `License`, `AssetType` from asset-domain
- Network access to `api.polyhaven.com` and `ambientcg.com`

## Out of Scope

- Rate limiting or retry logic
- Authentication (APIs are public)
- Pagination handling (APIs return complete lists)
- Response caching
