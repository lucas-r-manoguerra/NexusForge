# Scraping Adapters Specification

## Purpose

Define the Playwright-driven scraping adapters for OpenGameArt, Kenney, Quaternius, and Poly Pizza — sources that lack public REST APIs. These adapters implement `AssetSourceGateway` by navigating headless Chromium, extracting data via CSS selectors, and normalizing to `Asset`.

## Requirements

### Requirement: Scraping Adapter Pattern

All scraping adapters SHALL follow a consistent pattern: launch browser → navigate to page → extract data via selectors → normalize to `Asset` → close/return.

#### Scenario: Adapter uses Playwright Chromium

- GIVEN a scraping adapter for Kenney
- WHEN `listAssets()` is called
- THEN a Chromium browser instance is used
- AND navigation occurs to the source's asset listing page

#### Scenario: Adapter extracts metadata from DOM

- GIVEN the Kenney assets page is loaded
- WHEN the adapter parses the page
- THEN asset names, URLs, and descriptions are extracted via CSS selectors
- AND each extracted item is normalized to `Asset`

### Requirement: Kenney Adapter

The system SHALL provide a `KenneyAdapter` that scrapes `https://kenney.nl/assets`.

#### Scenario: List all assets

- GIVEN the Kenney website is reachable
- WHEN `listAssets()` is called
- THEN the adapter navigates to the assets page
- AND extracts asset cards with name, URL, thumbnail, and category
- AND each is normalized with `sourceKey: "kenney"`

#### Scenario: Asset type detection from category

- GIVEN Kenney categorizes assets as "3D", "2D", "Audio"
- WHEN the adapter normalizes assets
- THEN `"3D"` maps to `AssetType "model"`
- AND `"2D"` maps to `AssetType "image"`
- AND `"Audio"` maps to `AssetType "audio"`

### Requirement: OpenGameArt Adapter

The system SHALL provide an `OpenGameArtAdapter` that scrapes `https://opengameart.org`.

#### Scenario: List all assets

- GIVEN the OpenGameArt website is reachable
- WHEN `listAssets()` is called
- THEN the adapter navigates to the art listing page
- AND extracts asset entries with title, author, license, and download link
- AND each is normalized with `sourceKey: "opengameart"`

#### Scenario: License extraction from page text

- GIVEN OpenGameArt displays license info as page text
- WHEN the adapter parses the license field
- THEN it maps recognized strings (e.g., "CC-BY 3.0") to `License`
- AND unknown strings are preserved as raw `spdxId`

### Requirement: Quaternius Adapter

The system SHALL provide a `QuaterniusAdapter` that scrapes `https://quaternius.com`.

#### Scenario: List all assets

- GIVEN the Quaternius website is reachable
- WHEN `listAssets()` is called
- THEN the adapter navigates to the free assets page
- AND extracts pack names, descriptions, and download links
- AND each is normalized with `sourceKey: "quaternius"` and `type: "pack"`

### Requirement: Poly Pizza Adapter

The system SHALL provide a `PolyPizzaAdapter` that scrapes `https://poly.pizza`.

#### Scenario: List all assets

- GIVEN the Poly Pizza website is reachable
- WHEN `listAssets()` is called
- THEN the adapter navigates to the browse page
- AND extracts model names, authors, license, and thumbnail URLs
- AND each is normalized with `sourceKey: "polypizza"` and `type: "model"`

### Requirement: Selector Configuration

Each scraping adapter SHALL encapsulate its CSS selectors as private constants, not hardcoded in extraction logic. Selector changes MUST NOT require restructuring extraction code.

#### Scenario: Selectors isolated from extraction

- GIVEN the KenneyAdapter's selectors are defined as constants
- WHEN Kenney changes their HTML structure
- THEN only the selector constants need updating
- AND the extraction logic remains unchanged

### Requirement: Graceful Degradation

Scraping adapters MUST handle page load failures, missing elements, and structural changes without crashing the discovery process. Failed scraping returns an empty array, not an error.

#### Scenario: Page fails to load

- GIVEN the target website is unreachable
- WHEN `listAssets()` is called
- THEN the adapter catches the navigation error
- AND returns `[]` (empty array)
- AND logs a warning with the source key

#### Scenario: Selector misses (page structure changed)

- GIVEN the target page loads but CSS selectors match nothing
- WHEN the adapter parses the page
- THEN an empty array `[]` is returned
- AND a warning is logged indicating selectors may need update

### Requirement: Browser Lifecycle

Scraping adapters MUST manage the Playwright browser instance efficiently — reuse when possible, close when done. Each adapter instance SHOULD share a browser context within a single discovery session.

#### Scenario: Browser closed after use

- GIVEN a scraping adapter completes `listAssets()`
- WHEN the method returns
- THEN the browser page is closed
- AND the browser context is released

## Constraints

- Scraping adapters MUST use `playwright` package (Chromium only, no Firefox/WebKit)
- CSS selectors MUST be configurable constants (not inline strings in logic)
- Scraping adapters MUST respect a configurable delay between page navigations (default: 1 second)
- Each adapter is a single file in `src/lib/adapters/scraping/`
- Scraping adapters MUST NOT store browser state between calls (stateless per invocation)
- Playwright MCP server setup is out of scope (infra concern)

## Dependencies

- `AssetSourceGateway` port from asset-source-gateway
- `Asset`, `License`, `AssetType` from asset-domain
- `playwright` package (runtime dependency)

## Out of Scope

- Playwright MCP server installation/configuration
- Stealth mode or anti-bot evasion
- Pagination beyond first page
- Rate limiting (configurable delay only)
- Screenshot or visual regression testing of scraped pages
