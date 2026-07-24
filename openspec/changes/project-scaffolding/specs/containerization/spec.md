# Containerization Specification

## Purpose

Define the Docker multi-stage build for the NexusForge application and docker-compose.yml for local development with PostgreSQL, enabling a self-contained development environment.

## Requirements

### Requirement: Multi-Stage Dockerfile

The system SHALL provide a `Dockerfile` using multi-stage builds based on `node:20-alpine`.

#### Scenario: Docker build succeeds

- GIVEN the project is scaffolded
- WHEN a developer runs `docker build -t nexusforge .`
- THEN the build completes with exit code 0
- AND the image is created successfully

#### Scenario: Multi-stage build produces small image

- GIVEN the Dockerfile uses multi-stage builds
- WHEN a developer inspects the Dockerfile
- THEN it has at least 2 stages: `builder` (build) and `runner` (production)
- AND the runner stage uses `node:20-alpine`

#### Scenario: Production image does not include dev dependencies

- GIVEN the Docker build completes
- WHEN a developer inspects the runner stage
- THEN `devDependencies` are NOT installed in the final image

### Requirement: Docker Compose for Local Development

The system SHALL provide a `docker-compose.yml` with two services: `app` and `postgres`.

#### Scenario: Compose starts PostgreSQL

- GIVEN `docker-compose.yml` exists
- WHEN a developer runs `docker compose up -d postgres`
- THEN the PostgreSQL container starts on port 5432
- AND the container is healthy within 30 seconds

#### Scenario: Compose starts application

- GIVEN `docker-compose.yml` exists
- WHEN a developer runs `docker compose up app`
- THEN the app container starts and binds to port 4321

#### Scenario: Compose uses .env for database credentials

- GIVEN `.env` and `.env.example` exist
- WHEN a developer inspects `docker-compose.yml`
- THEN database credentials reference environment variables from `.env`
- AND `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` are configurable

### Requirement: PostgreSQL Service Configuration

The `postgres` service SHALL use `postgres:16-alpine` image with persistent volume.

#### Scenario: PostgreSQL data persists across restarts

- GIVEN the postgres container is running
- WHEN a developer runs `docker compose down` then `docker compose up -d postgres`
- THEN the data from the previous session is still available

#### Scenario: PostgreSQL uses named volume

- GIVEN `docker-compose.yml` exists
- WHEN a developer inspects the postgres service
- THEN a named volume is declared for `/var/lib/postgresql/data`

### Requirement: Docker .dockerignore

The system SHALL provide a `.dockerignore` file excluding unnecessary files from the Docker build context.

#### Scenario: Docker context excludes dev artifacts

- GIVEN `.dockerignore` exists
- WHEN a developer builds the Docker image
- THEN `node_modules/`, `dist/`, `.git/`, `tests/` are NOT included in the build context

## Constraints

- MUST use `node:20-alpine` as base image (aligns with Node.js 20 LTS requirement)
- MUST use `postgres:16-alpine` for database (aligns with PostgreSQL 16 requirement)
- Dockerfile MUST use multi-stage build (builder → runner)
- PostgreSQL credentials MUST come from `.env` (not hardcoded)
- Ports: PostgreSQL on 5432, app on 4321
- The `.env` file MUST NOT be copied into Docker images

## Dependencies

- Build toolchain (build-toolchain capability) — Dockerfile needs working `pnpm build`
- Database foundation (database-foundation capability) — PostgreSQL service aligns with Prisma datasource

## Out of Scope

- Production deployment (Kubernetes, cloud run)
- Nginx reverse proxy
- SSL/TLS configuration
- Health check endpoints
- Container orchestration beyond docker-compose
- CI/CD Docker builds
- Multi-architecture builds (ARM64)
