# Design: Project Scaffolding

## Technical Approach

Greenfield scaffold establishing Astro 5 + React + Tailwind v4 + Prisma + Vitest + Docker with hexagonal architecture. Single-commit creation of ~20 files implementing 5 capabilities: project-structure, build-toolchain, database-foundation, test-infrastructure, containerization. All files are new — zero modifications or deletions.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Package manager | pnpm / npm / yarn | pnpm: strict hoisting, disk-efficient; npm: universal; yarn: legacy | pnpm 9+ (project requirement) |
| CSS integration | `@tailwindcss/vite` / PostCSS plugin | Vite plugin: native HMR, no PostCSS config; PostCSS: legacy, requires extra config | `@tailwindcss/vite` (spec constraint) |
| Test runner | Vitest / Jest | Vitest: native Vite, ESM-first; Jest: requires transform config for Vite | Vitest (spec constraint) |
| Test env | jsdom / happy-dom | jsdom: mature, wider API; happy-dom: faster but incomplete | jsdom (spec constraint) |
| Coverage provider | v8 / istanbul | v8: faster, native; istanbul: more mature instrumentation | v8 (spec constraint) |
| PK strategy | UUID / auto-increment Int | UUID: no collision, distributed-safe; Int: simpler, sequential | UUID (spec constraint) |
| Docker base | node:20-alpine / node:20-slim | Alpine: ~180MB; Slim: ~250MB | node:20-alpine (spec constraint) |
| TypeScript strictness | strict / loose | strict: catches more bugs at compile time; loose: faster prototyping | strict (spec constraint) |

## Data Flow

```
Developer                    Build Pipeline                  Runtime
─────────                    ──────────────                  ───────
pnpm dev ──→ Vite ──→ Astro ──→ React ──→ Static HTML (dist/)
pnpm build ──→ Vite (prod) ──→ Static output in dist/

pnpm test ──→ Vitest ──→ jsdom ──→ @testing-library/react ──→ assertions

docker compose up
  ├── postgres:16-alpine (port 5432, named volume)
  └── app: node:20-alpine → pnpm build → static serve (port 4321)

Prisma: prisma/schema.prisma ──→ DATABASE_URL (.env) ──→ PostgreSQL
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Create | Project metadata, scripts, engine constraints, dependencies |
| `pnpm-lock.yaml` | Create | Auto-generated lockfile (via `pnpm install`) |
| `astro.config.mjs` | Create | Astro 5 config with React + Tailwind v4 integrations |
| `tsconfig.base.json` | Create | Shared strict TypeScript config |
| `tsconfig.json` | Create | Astro extends tsconfig.base.json with path aliases |
| `vitest.config.ts` | Create | Vitest config with jsdom, v8 coverage, name: nexusforge |
| `.gitignore` | Create | Node, build, env, IDE exclusions |
| `.env.example` | Create | DATABASE_URL template for PostgreSQL connection |
| `README.md` | Create | Project overview, setup, and scripts reference |
| `Dockerfile` | Create | Multi-stage: builder (pnpm install + build) → runner (static serve) |
| `docker-compose.yml` | Create | App + PostgreSQL services with named volume |
| `.dockerignore` | Create | Exclude node_modules, dist, .git, tests from build context |
| `src/pages/index.astro` | Create | Placeholder page rendering Counter component |
| `src/components/Counter.tsx` | Create | React smoke-test component with useState |
| `src/styles/global.css` | Create | Tailwind v4 import: `@import "tailwindcss"` |
| `src/lib/domain/models/.gitkeep` | Create | Domain layer placeholder |
| `src/lib/application/.gitkeep` | Create | Application layer placeholder |
| `src/lib/ports/input/.gitkeep` | Create | Input ports placeholder |
| `src/lib/ports/output/.gitkeep` | Create | Output ports placeholder |
| `src/lib/adapters/.gitkeep` | Create | Adapters layer placeholder |
| `src/lib/infrastructure/.gitkeep` | Create | Infrastructure layer placeholder |
| `prisma/schema.prisma` | Create | PostgreSQL datasource, User model with UUID id |
| `tests/smoke.test.ts` | Create | Smoke test: imports, assertions, component render |

## Interfaces / Contracts

**TypeScript path alias** (tsconfig.json):
```json
{ "compilerOptions": { "paths": { "@lib/*": ["./src/lib/*"] } } }
```

**Prisma schema conventions** (enforced via schema header comment):
- Every model: `id` (UUID, `@default(uuid())`), `createdAt` (`@default(now())`), `updatedAt` (`@updatedAt`)
- Model names: PascalCase singular; field names: camelCase

**Package scripts contract**:
| Script | Command |
|--------|---------|
| `dev` | `astro dev` |
| `build` | `astro build` |
| `preview` | `astro preview` |
| `test` | `vitest run` |
| `test:ui` | `vitest --ui` |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Smoke | Project installs, builds, and tests pass | `pnpm install && pnpm build && pnpm test` |
| Component | Counter.tsx renders, increments | `@testing-library/react` render + fireEvent |
| Schema | Prisma schema validates | `npx prisma validate` |
| Docker | Build succeeds, compose up works | `docker build -t nexusforge .` + `docker compose up` |

## Threat Matrix

| Boundary | Applicability | Reason |
|----------|--------------|--------|
| Documentation-like paths | N/A | No executable markdown or shell scripts in scaffold |
| Git repository selection | N/A | No git automation — project not yet initialized |
| Commit state | N/A | No git automation |
| Push state | N/A | No git automation |
| PR commands | N/A | No PR automation in scaffold |

## Migration / Rollout

No migration required — greenfield project, no existing data or code.

## Open Questions

- None — all decisions are constrained by specs and proposal.
