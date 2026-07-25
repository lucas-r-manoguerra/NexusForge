# Test Infrastructure Specification

## Purpose

Define the Vitest testing configuration with React component testing support, coverage thresholds, and test directory conventions that all future tests build upon.

## Requirements

### Requirement: Vitest Configuration

The system SHALL configure Vitest as the test runner with a `vitest.config.ts` at project root.

#### Scenario: Vitest runs successfully

- GIVEN the project is installed
- WHEN a developer runs `pnpm test`
- THEN Vitest executes and completes with exit code 0
- AND at least one test file is discovered and run

#### Scenario: Vitest config uses project name

- GIVEN `vitest.config.ts` exists
- WHEN a developer inspects it
- THEN the `test.name` property is set to `nexusforge`

### Requirement: React Component Testing

The system SHALL support React component testing via `@testing-library/react` and `jsdom` environment.

#### Scenario: Smoke test component exists

- GIVEN the project is scaffolded
- WHEN a developer inspects `tests/`
- THEN a `smoke.test.ts` file exists
- AND it contains at least one passing assertion

#### Scenario: React test imports work

- GIVEN a test file in `tests/`
- WHEN the test imports a React component from `src/components/`
- THEN the import resolves and the component renders without error

### Requirement: Test Directory Structure

The system SHALL organize tests in a top-level `tests/` directory that mirrors `src/` structure.

```
tests/
├── smoke.test.ts          # Global smoke test
├── components/            # Component tests (mirrors src/components/)
├── lib/                   # lib layer tests (mirrors src/lib/)
└── pages/                 # Page tests (mirrors src/pages/)
```

#### Scenario: Test directories exist

- GIVEN the project is scaffolded
- WHEN a developer inspects `tests/`
- THEN `components/`, `lib/`, `pages/` subdirectories exist

### Requirement: Test File Naming Convention

The system SHALL enforce test file naming: `{name}.test.ts` for unit tests, `{name}.test.tsx` for React component tests.

#### Scenario: Test discovery finds all test files

- GIVEN test files exist with `.test.ts` and `.test.tsx` extensions
- WHEN a developer runs `pnpm test`
- THEN all test files are discovered and executed

### Requirement: Coverage Configuration

The system SHALL configure Vitest coverage to report on `src/lib/` with `v8` provider.

#### Scenario: Coverage report generates

- GIVEN the project is installed
- WHEN a developer runs `pnpm test -- --coverage`
- THEN a coverage report is generated
- AND the report covers files in `src/lib/`

#### Scenario: Coverage output is gitignored

- GIVEN coverage output directories exist
- WHEN a developer inspects `.gitignore`
- THEN `coverage/` is listed in gitignore rules

## Constraints

- MUST use `vitest` (not Jest) — native Vite integration
- MUST use `@testing-library/react` for React component testing
- MUST use `jsdom` environment (not `happy-dom`)
- Test files MUST be in `tests/` directory, NOT colocated with source
- Coverage provider MUST be `v8` (not `istanbul`)

## Dependencies

- Build toolchain (build-toolchain capability) — Vitest runs on Vite, needs working build pipeline
- Project structure (project-structure capability) — test directory mirrors `src/` layout

## Out of Scope

- E2E testing (Playwright, Cypress)
- Integration tests against real database
- Test fixtures or factories
- Mutation testing
- Performance or load testing
- Snapshot testing
