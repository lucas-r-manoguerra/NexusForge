# UI Search Specification

## Purpose

Define the Impeccable design quality gate for UI work and the design system foundation that ensures asset catalog pages meet visual quality standards. This spec establishes the gate that blocks AI-generated UI slop from reaching production.

## Requirements

### Requirement: Impeccable Integration

The system SHALL install `impeccable` as a devDependency and configure it for slop detection on all UI-touching code.

#### Scenario: Impeccable installed

- GIVEN the project is set up
- WHEN a developer runs `npx impeccable detect src/`
- THEN the command completes without error
- AND it scans all files under `src/` for slop patterns

#### Scenario: Slop detection passes

- GIVEN all UI code follows design tokens
- WHEN `npx impeccable detect src/` runs
- THEN exit code is 0
- AND no slop findings are reported

#### Scenario: Slop detection catches issues

- GIVEN a component has inconsistent spacing or hardcoded colors
- WHEN `npx impeccable detect src/` runs
- THEN exit code is non-zero
- AND findings include file path and line number

### Requirement: Design Token Documentation

The system SHALL generate a `DESIGN.md` file using Impeccable's documentation command, capturing typography, spacing, color, and component tokens.

#### Scenario: DESIGN.md generated

- GIVEN Impeccable is configured
- WHEN `/impeccable document` is run
- THEN `DESIGN.md` is created at the project root
- AND it contains typography scale, spacing tokens, color palette, and component patterns

#### Scenario: DESIGN.md committed

- GIVEN `DESIGN.md` is generated
- WHEN `git status` is run
- THEN `DESIGN.md` appears as a new tracked file

### Requirement: CI Gating

The system SHALL configure `npx impeccable detect src/` as a CI check that blocks PRs with slop findings.

#### Scenario: PR with slop fails CI

- GIVEN a PR introduces code with design inconsistencies
- WHEN CI runs the Impeccable check
- THEN the check fails
- AND the PR cannot be merged until findings are resolved

#### Scenario: Clean PR passes CI

- GIVEN a PR with no design inconsistencies
- WHEN CI runs the Impeccable check
- THEN the check passes

### Requirement: Asset Catalog UI Foundation

When asset catalog pages are built, they SHALL use Impeccable-polished components with consistent typography, spacing, and visual rhythm from DESIGN.md tokens.

#### Scenario: Asset card uses design tokens

- GIVEN DESIGN.md defines a spacing scale
- WHEN an asset card component is built
- THEN all spacing values come from the token system
- AND no hardcoded pixel values appear in styling

#### Scenario: Asset grid uses consistent typography

- GIVEN DESIGN.md defines a type scale
- WHEN asset names and descriptions are displayed
- THEN font sizes and weights come from the token system

## Constraints

- `npx impeccable detect src/` MUST pass before any PR touching UI code can merge
- DESIGN.md MUST be regenerated when design tokens change
- Impeccable checks are dev-time only — no runtime performance impact
- This spec covers the quality gate, not the actual UI components (future change)

## Dependencies

- `impeccable` package (devDependency)
- Project structure (project-structure capability) for `src/` layout

## Out of Scope

- Actual asset browse/search pages (future change)
- Component library or design system implementation
- Impeccable CLI beyond detect and document commands
- `/typeset` configuration (applied per-page when built)
- Playwright MCP for UI testing (separate concern)
