# Project Structure Specification

## Purpose

Define the hexagonal architecture directory layout for NexusForge's `src/lib/` layer, establishing domain isolation, port/adapter boundaries, and the physical file organization that all future features build upon.

## Requirements

### Requirement: Hexagonal Architecture Layout

The system SHALL organize `src/lib/` into five top-level layers: `domain/`, `application/`, `ports/`, `adapters/`, and `infrastructure/`.

#### Scenario: Directory structure exists after scaffolding

- GIVEN the project is freshly scaffolded
- WHEN a developer inspects `src/lib/`
- THEN `domain/`, `application/`, `ports/`, `adapters/`, `infrastructure/` directories exist
- AND each directory contains at minimum a `.gitkeep` or index file

#### Scenario: Domain layer has no outward dependencies

- GIVEN the `domain/` directory exists
- WHEN a developer audits imports inside `domain/`
- THEN no file imports from `application/`, `ports/`, `adapters/`, or `infrastructure/`

### Requirement: Layer Responsibility Boundaries

Each layer SHALL have a clear, single responsibility:

| Layer | Responsibility |
|-------|---------------|
| `domain/` | Entities, value objects, domain events — pure business logic |
| `application/` | Use cases, orchestration — coordinates ports |
| `ports/` | Interfaces (input/output) — defines contracts |
| `adapters/` | Concrete implementations of ports |
| `infrastructure/` | Cross-cutting: logging, config, shared utilities |

#### Scenario: Domain contains entity placeholder

- GIVEN the scaffold is complete
- WHEN a developer inspects `src/lib/domain/`
- THEN a `models/` subdirectory exists as the canonical location for entities

#### Scenario: Ports contains interface placeholder

- GIVEN the scaffold is complete
- WHEN a developer inspects `src/lib/ports/`
- THEN `input/` and `output/` subdirectories exist

### Requirement: Project Root Structure

The project root SHALL contain these top-level directories and files:

```
/
├── src/
│   ├── pages/          # Astro pages
│   ├── components/     # React components
│   ├── layouts/        # Astro layouts
│   ├── styles/         # Global styles
│   └── lib/            # Hexagonal architecture
├── prisma/             # Prisma schema
├── public/             # Static assets
└── tests/              # Test files mirror src/ structure
```

#### Scenario: Root directories exist

- GIVEN the project is scaffolded
- WHEN a developer inspects the project root
- THEN `src/pages/`, `src/components/`, `src/lib/`, `prisma/`, `public/` exist

#### Scenario: Placeholder index page exists

- GIVEN the project is scaffolded
- WHEN a developer inspects `src/pages/`
- THEN `index.astro` exists and renders without error

### Requirement: Alias Configuration

The system SHALL configure TypeScript path aliases so imports use `@lib/` to reference `src/lib/`.

#### Scenario: Alias resolves correctly

- GIVEN the project is scaffolded
- WHEN a developer writes `import { something } from '@lib/domain/models/entity'`
- THEN TypeScript resolves the path to `src/lib/domain/models/entity.ts`

## Constraints

- Domain layer MUST NOT depend on any other layer (dependency rule)
- Application layer MAY depend on domain and ports only
- Adapters MAY depend on ports and infrastructure
- `src/lib/` is the ONLY directory governed by hexagonal rules; `src/pages/` and `src/components/` follow Astro/React conventions

## Dependencies

- None (this is the foundational capability)

## Out of Scope

- Actual domain entities, use cases, or port interfaces
- Import linting enforcement (enforced via ESLint in future changes)
- Barrel files (`index.ts`) — added when real code populates each layer
