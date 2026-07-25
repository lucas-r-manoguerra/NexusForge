# Proposal: Project Scaffolding

## Intent

NexusForge is a greenfield project with zero code, no git, no tests, no CI. Every subsequent change depends on having a working project skeleton. This change creates the foundational scaffold: Astro + React + Tailwind CSS v4 + Prisma + Vitest + Docker + pnpm with hexagonal architecture. Without this, no feature work can begin.

## Scope

### In Scope
- pnpm project initialization with package.json and lockfile
- Astro 5 project config with React and Tailwind CSS v4 integrations
- Hexagonal architecture directory structure under `src/lib/`
- Prisma schema with PostgreSQL datasource and placeholder User model
- Vitest config with React component testing support
- Dockerfile (multi-stage) and docker-compose.yml (PostgreSQL + app)
- TypeScript config (astro tsconfig + project-level tsconfig.base.json)
- .gitignore, .env.example, README.md
- Smoke test: `pnpm test` passes, `pnpm build` succeeds

### Out of Scope
- Domain logic, API routes, UI components
- Database migrations or seed scripts
- Authentication/authorization
- CI/CD pipeline
- Deployment configuration
- Any React components or Astro pages beyond the placeholder

## Capabilities

### New Capabilities
- `project-structure`: Hexagonal architecture layout with domain/application/ports/adapters layers
- `build-toolchain`: Astro + React + Tailwind v4 build pipeline with pnpm
- `database-foundation`: Prisma ORM with PostgreSQL datasource and schema conventions
- `test-infrastructure`: Vitest with React testing utilities and coverage config
- `containerization`: Docker multi-stage build and docker-compose for local dev

### Modified Capabilities
None — greenfield, no existing specs.

## Approach

1. Initialize pnpm project, install Astro with React and Tailwind integrations
2. Create hexagonal `src/lib/` structure: `domain/`, `application/`, `ports/`, `adapters/`, `infrastructure/`
3. Initialize Prisma with PostgreSQL datasource, create base schema
4. Configure Vitest with `@testing-library/react` and coverage
5. Write Dockerfile (node:20-alpine, multi-stage) and docker-compose.yml (app + postgres)
6. Add config files: tsconfig.base.json, .env.example, .gitignore
7. Verify: smoke test passes, build succeeds

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/` | New | Entire hexagonal architecture structure |
| `prisma/` | New | Schema with PostgreSQL datasource |
| `src/pages/index.astro` | New | Placeholder page |
| `src/components/Counter.tsx` | New | React smoke-test component with useState |
| Root configs | New | astro.config.mjs, vitest.config.ts, Dockerfile, docker-compose.yml |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Astro + React integration edge cases | Low | Use official `@astrojs/react` adapter; pin exact versions |
| Tailwind CSS v4 breaking changes (new config format) | Medium | Pin tailwindcss@4; use `@tailwindcss/vite` plugin |
| Prisma + Docker connection issues | Low | Use standard postgres image; document connection string in .env.example |
| File count exceeds 400-line review budget | Low | Most files are config/boilerplate; count will be ~20 files, well under budget |

## Rollback Plan

`git rm -rf` all scaffolded files, `pnpm remove` installed packages. Since this is the first change and no downstream work depends on it, rollback is a clean revert of the single commit.

## Dependencies

- Node.js 20 LTS
- pnpm 9+
- Docker + Docker Compose (for local PostgreSQL)
- PostgreSQL 16 (via docker-compose)

## Success Criteria

- [ ] `pnpm install` completes without errors
- [ ] `pnpm build` produces Astro output in `dist/`
- [ ] `pnpm test` runs Vitest and all tests pass
- [ ] `docker compose up` starts PostgreSQL and the app container
- [ ] Prisma schema validates (`npx prisma validate`)
- [ ] All files follow hexagonal architecture naming conventions
- [ ] No TypeScript errors (`npx tsc --noEmit`)
