# Tasks: Project Scaffolding

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~342 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-chain |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Full scaffold | PR 1 | `pnpm install && pnpm build && pnpm test` | `docker compose up` | All files — single commit revert |

## Phase 1: Root Configuration

- [x] 1.1 Create `package.json` with name "nexusforge", pnpm scripts (dev/build/preview/test/test:ui), engines (node>=20, pnpm>=9), dependencies (astro, @astrojs/react, react, react-dom, tailwindcss@4, @tailwindcss/vite, prisma) and devDependencies (vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @vitest/coverage-v8)
- [x] 1.2 Create `tsconfig.base.json` with `strict: true`, `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`
- [x] 1.3 Create `tsconfig.json` extending `./tsconfig.base.json` with Astro `jsx: react-jsx` and path alias `@lib/*: ./src/lib/*`
- [x] 1.4 Create `.gitignore` covering node_modules, dist, coverage, .env, IDE files, pnpm-debug.log
- [x] 1.5 Create `.env.example` with `DATABASE_URL=postgresql://user:password@localhost:5432/nexusforge?schema=public`
- [x] 1.6 Run `pnpm install` — verify lockfile generates and exit code 0

## Phase 2: Build Toolchain & Source Structure

- [x] 2.1 Create `astro.config.mjs` importing `@astrojs/react` and `@tailwindcss/vite`, setting `output: static`
- [x] 2.2 Create `src/styles/global.css` with `@import "tailwindcss"`
- [x] 2.3 Create `src/pages/index.astro` rendering Counter component with Tailwind classes
- [x] 2.4 Create `src/components/Counter.tsx` — React component with `useState` counter, increment button, Tailwind-styled
- [x] 2.5 Create 6 `.gitkeep` files: `src/lib/domain/models/`, `src/lib/application/`, `src/lib/ports/input/`, `src/lib/ports/output/`, `src/lib/adapters/`, `src/lib/infrastructure/`
- [x] 2.6 Verify: `pnpm build` produces `dist/index.html` — exit code 0

## Phase 3: Database Foundation

- [x] 3.1 Create `prisma/schema.prisma` with postgresql datasource (env DATABASE_URL), convention comment header, and `User` model (id UUID, email unique, name?, createdAt, updatedAt)
- [x] 3.2 Verify: `npx prisma validate` — exit code 0

## Phase 4: Test Infrastructure

- [x] 4.1 Create `vitest.config.ts` with `test.name: "nexusforge"`, environment: jsdom, coverage provider: v8, include `src/lib/**`
- [x] 4.2 Create `tests/smoke.test.ts` with assertion that project imports work, plus `@testing-library/react` render test for Counter component verifying initial count and increment behavior
- [x] 4.3 Verify: `pnpm test` — all tests pass, exit code 0

## Phase 5: Containerization & Documentation

- [x] 5.1 Create `Dockerfile` — multi-stage: builder stage (node:20-alpine, pnpm install + build) → runner stage (node:20-alpine, copy dist, serve on port 4321)
- [x] 5.2 Create `docker-compose.yml` — app service (builds from Dockerfile, port 4321) + postgres service (postgres:16-alpine, port 5432, named volume, env from .env)
- [x] 5.3 Create `.dockerignore` excluding node_modules, dist, .git, tests, coverage
- [x] 5.4 Create `README.md` with project overview, prerequisites, setup instructions (`pnpm install`, `docker compose up`), and scripts reference table
- [x] 5.5 Verify: `docker build -t nexusforge .` — exit code 0
