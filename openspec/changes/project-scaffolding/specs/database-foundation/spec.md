# Database Foundation Specification

## Purpose

Define the Prisma ORM configuration with PostgreSQL datasource, schema conventions, and the placeholder User model that establishes the database layer foundation for NexusForge.

## Requirements

### Requirement: Prisma Schema Initialization

The system SHALL initialize Prisma with a `prisma/schema.prisma` file using PostgreSQL as the datasource provider.

#### Scenario: Schema validates successfully

- GIVEN the project is scaffolded
- WHEN a developer runs `npx prisma validate`
- THEN the command completes with exit code 0
- AND no validation errors are reported

#### Scenario: PostgreSQL datasource configured

- GIVEN `prisma/schema.prisma` exists
- WHEN a developer inspects the datasource block
- THEN `provider = "postgresql"` is set
- AND `url` references `env("DATABASE_URL")`

### Requirement: Environment Configuration

The system SHALL provide a `.env.example` file containing `DATABASE_URL` with a PostgreSQL connection string template.

#### Scenario: .env.example exists with DATABASE_URL

- GIVEN the project is scaffolded
- WHEN a developer inspects `.env.example`
- THEN `DATABASE_URL` is defined with format `postgresql://user:password@localhost:5432/nexusforge?schema=public`
- AND `.env.example` is committed to git (not gitignored)

#### Scenario: .env is gitignored

- GIVEN `.gitignore` exists
- WHEN a developer inspects it
- THEN `.env` is listed in gitignore rules
- AND `.env.example` is NOT gitignored

### Requirement: Placeholder User Model

The system SHALL include a `User` model in the Prisma schema as a reference implementation for model conventions.

#### Scenario: User model has standard fields

- GIVEN `prisma/schema.prisma` exists
- WHEN a developer inspects the `User` model
- THEN it has fields: `id` (UUID, @id @default(uuid())), `email` (String, unique), `name` (String?), `createdAt` (DateTime, @default(now())), `updatedAt` (DateTime, @updatedAt)

#### Scenario: User model follows naming convention

- GIVEN the `User` model exists
- WHEN a developer inspects the schema
- THEN the model uses PascalCase (`User`, not `user`)
- AND fields use camelCase
- AND the `id` field uses UUID (not auto-increment Int)

### Requirement: Schema Conventions

The system SHALL establish these Prisma schema conventions for all future models:

- Every model MUST have an `id` field (UUID, `@default(uuid())`)
- Every model MUST have `createdAt` (`@default(now())`) and `updatedAt` (`@updatedAt`)
- Model names MUST be PascalCase singular (e.g., `User`, not `Users`)
- Field names MUST be camelCase

#### Scenario: Conventions documented in schema header

- GIVEN `prisma/schema.prisma` exists
- WHEN a developer inspects the file
- THEN a comment block at the top documents the naming conventions

## Constraints

- MUST use PostgreSQL (not SQLite or MySQL) — aligns with docker-compose
- MUST use UUID for primary keys (not auto-increment integers)
- Schema MUST be valid before any migration command runs
- `.env` MUST NOT be committed; `.env.example` MUST be committed

## Dependencies

- Project structure (project-structure capability) — `prisma/` directory placement
- Containerization (containerization capability) — PostgreSQL instance from docker-compose

## Out of Scope

- Database migrations (`prisma migrate`)
- Seed scripts
- Multiple database schemas or multi-tenancy
- Connection pooling configuration (e.g., PgBouncer)
- Prisma Client instantiation or repository patterns
