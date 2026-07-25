# Build Toolchain Specification

## Purpose

Define the Astro + React + Tailwind CSS v4 build pipeline with pnpm, ensuring the project compiles, bundles, and produces deployable output with zero TypeScript errors.

## Requirements

### Requirement: pnpm Project Initialization

The system SHALL initialize with `pnpm` as the package manager, producing a valid `package.json` and `pnpm-lock.yaml`.

#### Scenario: Install completes without errors

- GIVEN a clean project directory
- WHEN a developer runs `pnpm install`
- THEN the command completes with exit code 0
- AND `node_modules/` and `pnpm-lock.yaml` are created

#### Scenario: Engine constraints enforced

- GIVEN `package.json` specifies `engines.node` and `engines.pnpm`
- WHEN a developer uses an unsupported Node.js version
- THEN `pnpm install` fails with a version mismatch error

### Requirement: Astro 5 Configuration

The system SHALL configure Astro 5 with the official React integration (`@astrojs/react`).

#### Scenario: Build produces output

- GIVEN the project is installed
- WHEN a developer runs `pnpm build`
- THEN `dist/` directory is created
- AND `dist/index.html` exists

#### Scenario: Dev server starts

- GIVEN the project is installed
- WHEN a developer runs `pnpm dev`
- THEN the dev server starts on port 4321 within 10 seconds

### Requirement: React Integration

The system SHALL integrate React via `@astrojs/react` adapter with `react` and `react-dom` as dependencies.

#### Scenario: React component compiles

- GIVEN a `.tsx` file exists in `src/components/`
- WHEN the build runs
- THEN the component compiles without errors
- AND no React deprecation warnings appear in the build output

### Requirement: Tailwind CSS v4 Integration

The system SHALL integrate Tailwind CSS v4 using the `@tailwindcss/vite` plugin (NOT the legacy PostCSS plugin).

#### Scenario: Tailwind directives work in global styles

- GIVEN `src/styles/global.css` contains `@import "tailwindcss"`
- WHEN the build runs
- THEN Tailwind utility classes are available in all React components
- AND no PostCSS deprecation warnings appear

#### Scenario: Tailwind v4 config is CSS-first

- GIVEN Tailwind v4 is installed
- WHEN a developer inspects the configuration
- THEN there is NO `tailwind.config.js` file (v4 uses CSS-based config)

### Requirement: TypeScript Configuration

The system SHALL provide a base `tsconfig.base.json` at project root with strict mode, and an Astro-specific `tsconfig.json` that extends it.

#### Scenario: No TypeScript errors on build

- GIVEN the project is scaffolded
- WHEN a developer runs `npx tsc --noEmit`
- THEN the command completes with exit code 0
- AND zero errors are reported

#### Scenario: Strict mode enabled

- GIVEN `tsconfig.base.json` exists
- WHEN a developer inspects it
- THEN `"strict": true` is set

### Requirement: Package Scripts

The system SHALL expose these scripts in `package.json`:

| Script | Command |
|--------|---------|
| `dev` | Start Astro dev server |
| `build` | Production build to `dist/` |
| `preview` | Preview production build |
| `test` | Run Vitest |
| `test:ui` | Run Vitest with UI |

#### Scenario: All scripts are callable

- GIVEN the project is installed
- WHEN a developer runs `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm test`
- THEN each command completes without script-not-found errors

## Constraints

- MUST use pnpm (not npm or yarn)
- MUST use `@tailwindcss/vite` plugin, NOT PostCSS integration
- MUST pin exact major versions for Astro, React, and Tailwind in `package.json`
- MUST NOT use Astro SSR mode (static output only for scaffolding)
- `dist/` output MUST be included in `.gitignore`

## Dependencies

- Project structure (project-structure capability) — `src/lib/` layout must exist

## Out of Scope

- ESLint / Prettier configuration
- CI/CD build pipelines
- SSR or server-side rendering
- Custom Vite plugins
- Bundle analysis or performance budgets
