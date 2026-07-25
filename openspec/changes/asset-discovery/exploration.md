# Exploration: Asset Discovery Engine

## Current State

NexusForge is a freshly scaffolded project with hexagonal architecture directories under `src/lib/` — but ALL are empty (`.gitkeep` only). The only real code is:

- **Prisma schema**: Single `User` model with UUID PK, no asset-related models
- **Astro config**: Static output, React + Tailwind v4 integrations
- **Vitest**: Configured with jsdom + v8 coverage scoped to `src/lib/**`
- **TypeScript**: Strict mode, `@lib/*` path alias
- **Docker**: Multi-stage build with PostgreSQL via docker-compose

Zero domain logic, zero ports, zero adapters, zero infrastructure. This is the FIRST real feature.

## Affected Areas

| Area | Impact | Why |
|------|--------|-----|
| `prisma/schema.prisma` | Major | New Asset, AssetSource, License, Category models |
| `src/lib/domain/models/` | New | Asset entity, value objects (License, AssetType, QualityScore) |
| `src/lib/ports/input/` | New | SearchUseCase interface |
| `src/lib/ports/output/` | New | AssetSourceGateway, AssetRepository interfaces |
| `src/lib/adapters/` | New | PolyHavenAdapter, AmbientCGAdapter, OpenGameArtAdapter |
| `src/lib/application/` | New | AssetDiscoveryService (orchestrator) |
| `src/lib/infrastructure/` | New | HTTP client, cache config |
| `src/pages/` | New | Search page with React components |
| `src/components/` | New | SearchBar, AssetCard, FilterPanel, ResultsGrid |

## External API Research

### Tier 1 — Full REST API, No Auth Required

| Source | API | Auth | Assets | Key Endpoints |
|--------|-----|------|--------|---------------|
| **Poly Haven** | `api.polyhaven.com` | None | ~433 models, ~959 HDRIs, ~1000 textures | `GET /assets`, `GET /info/{id}`, `GET /files/{id}`, `GET /categories/{type}` |
| **AmbientCG** | `api/v3/assets` | None | ~1000+ materials, HDRIs, 3D models | `GET /assets?q=&type=&sort=` — supports text search, type filter, pagination |

### Tier 2 — REST API, Auth Required

| Source | API | Auth | Assets | Key Endpoints |
|--------|-----|------|--------|---------------|
| **Freesound** | `freesound.org/apiv2` | API Key (token) | ~500K+ sounds | `GET /apiv2/search/text/?query=`, `GET /apiv2/sounds/{id}/` — content-based similarity search |

### Tier 3 — No Official API (Scraping/Third-Party)

| Source | API | Workaround |
|--------|-----|------------|
| **OpenGameArt** | None | Python `oga` library (scraping), or direct HTML scraping. Tags + type + license filtering. |
| **Kenney** | None | Web scraping (`kenney.nl/assets`), or poly.pizza aggregator (CC0 packs). |
| **Quaternius** | None | poly.pizza API aggregates Quaternius + others (~5000 GLB models). Requires `POLY_PIZZA_API_KEY`. |

### Semantic Search Reality Check

True semantic search ("medieval castle" → finds medieval-themed assets regardless of exact name) requires:
- **Embedding model** (e.g., OpenAI text-embedding-3-small, or local sentence-transformers)
- **Vector database** (pgvector extension for PostgreSQL, or Pinecone/Weaviate)
- **Index pipeline** — embed all asset titles + descriptions + tags → store vectors

**This is NOT viable for slice 1.** Poly Haven and AmbientCG have no text search API — they return all assets and the client does keyword matching. Freesound has content-based search but only for audio descriptors.

**Recommendation**: Start with keyword/tag search. Semantic search is a separate future change that requires infrastructure (pgvector, embedding pipeline, periodic re-indexing).

## Approaches

### Approach A: Keyword Federation (Recommended for v1)

Fan-out search to 2-3 source APIs, normalize results, merge + deduplicate.

```
User Query → AssetDiscoveryService → [PolyHavenAdapter, AmbientCGAdapter]
                                        ↓                    ↓
                                   API response         API response
                                        ↓                    ↓
                                   NormalizedAsset[] ← merge + rank
```

- Pros: No infrastructure beyond HTTP, fast to implement, immediate value
- Cons: No semantic understanding, keyword-only matching, sources without APIs need scraping
- Effort: **Medium** (~2-3 weeks)

### Approach B: Indexed Search with pgvector

Build a local index: crawl sources → embed metadata → store in pgvector → search via cosine similarity.

- Pros: True semantic search, cross-source unified index, offline capability
- Cons: Requires pgvector setup, embedding pipeline, periodic re-indexing, significant infrastructure
- Effort: **High** (~4-6 weeks)

### Approach C: MCP-Based (ASSETMCP pattern)

Build as MCP server that searches multiple sources via their APIs.

- Pros: Reusable across AI agents, standardized protocol
- Cons: Over-engineered for first feature, Astro frontend needs HTTP not MCP
- Effort: **Medium-High**

## Recommendation

**Approach A: Keyword Federation** for the first slice. Start with Poly Haven (best API, no auth, rich metadata) and AmbientCG (also no auth, good search). Freesound as Tier 2 addition (requires API key).

This follows the hexagonal architecture perfectly:
- **Port**: `AssetSourceGateway` interface defines what a source adapter must provide
- **Adapter**: Each source gets its own adapter implementing the port
- **Application**: `AssetDiscoveryService` orchestrates the fan-out
- **Domain**: `Asset` entity is source-agnostic, normalized

## Scope

### IN (First Slice — "Asset Discovery MVP")

- **Poly Haven adapter** — search models, HDRIs, textures via public API
- **AmbientCG adapter** — search materials, HDRIs, 3D models via public API
- **Domain models**: `Asset`, `AssetType` (model/texture/hdri/audio), `License` (CC0/CC-BY/CC-BY-SA), `AssetSource` enum, `QualityScore`
- **Search use case**: keyword search across sources, paginated results
- **License display**: show license type + attribution text per asset
- **Basic classification**: map source categories → NexusForge categories (character, building, weapon, environment, etc.)
- **Prisma models**: `Asset`, `AssetSource` (tracking which sources are configured)
- **Search UI**: search bar, results grid with thumbnails, source filter, type filter
- **Tests**: adapter unit tests (mocked HTTP), domain model tests, search use case tests

### OUT (Future Changes)

- ❌ Semantic/embedding search (requires pgvector + embedding pipeline)
- ❌ Freesound adapter (requires API key, OAuth setup)
- ❌ OpenGameArt adapter (no API, needs scraping — lower priority)
- ❌ Kenney adapter (no API, scraping complexity)
- ❌ Quaternius adapter (needs poly.pizza API key)
- ❌ Asset download/import to projects
- ❌ User collections, favorites, project management
- ❌ Quality scoring (mobile_score, pc_score, vr_score) — requires heuristic engine
- ❌ Automatic classification ML model
- ❌ Attribution PDF generation
- ❌ Caching layer (add when sources are stable)
- ❌ Background sync/crawl jobs

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Poly Haven / AmbientCG API rate limits | Low | Medium | Implement request throttling, respect rate headers |
| API changes breaking adapters | Medium | Medium | Port interface isolates changes, adapter tests catch breakage |
| Search quality poor with keyword-only | High | Low | Acceptable for MVP; semantic search is a known future need |
| License compliance edge cases | Medium | High | Show license per asset, let user verify before use |
| No real-time data (stale listings) | Low | Low | Poly Haven/AmbientCG are stable, rarely change structure |

## Ready for Proposal

**Yes.** The codebase is fully scaffolded and ready for the first feature. The hexagonal architecture is in place (directories exist), Prisma is configured, tests work. The orchestrator should:

1. Tell the user that semantic search requires infrastructure (pgvector + embeddings) and recommend deferring it to a future change
2. Recommend starting with Poly Haven + AmbientCG (both have free, no-auth APIs with rich metadata)
3. Propose the first slice as "Keyword Federation Search" — the foundation that all future sources and semantic search will build on
