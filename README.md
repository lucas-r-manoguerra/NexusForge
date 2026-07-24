<div align="center">

# NexusForge

### Asset Intelligence Platform for Game Development

[![CI](https://github.com/lucas/NexusForge/actions/workflows/ci.yml/badge.svg)](https://github.com/lucas/NexusForge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

*"Google + GitHub + NPM for game assets"*

</div>

---

## Overview

NexusForge is an AI-powered asset intelligence platform for game developers. It discovers, evaluates, normalizes, and delivers assets from multiple sources — so developers can focus on building games, not managing files.

### Key Capabilities

- **Asset Discovery** — Semantic search across OpenGameArt, Kenney, Quaternius, Poly Haven, and more
- **License Intelligence** — Automatic license detection, compliance checking, and credit generation
- **Quality Analysis** — Polygon count, texture resolution, animation complexity scoring
- **Format Normalization** — FBX→GLB, OBJ→GLB, TGA→PNG, WAV→OGG conversion
- **Godot Integration** — Native MCP tools for search, download, import, and scene generation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro](https://astro.build) |
| UI | [React](https://react.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| ORM | [Prisma](https://www.prisma.io) |
| Database | [PostgreSQL](https://www.postgresql.org) |
| Testing | [Vitest](https://vitest.dev) |
| Container | [Docker](https://www.docker.com) |
| Language | [TypeScript](https://www.typescriptlang.org) (strict) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 20
- [pnpm](https://pnpm.io) >= 9
- [Docker](https://www.docker.com) (optional, for containerized development)

### Installation

```bash
# Clone the repository
git clone https://github.com/lucas/NexusForge.git
cd NexusForge

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start development server
pnpm dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run test suite |
| `pnpm test:ui` | Run tests with UI |

### Docker

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Architecture

NexusForge follows **Hexagonal Architecture** (Ports & Adapters):

```
src/
├── lib/
│   ├── domain/          # Business entities and rules
│   ├── application/     # Use cases and orchestration
│   ├── ports/
│   │   ├── input/       # Inbound interfaces (driven adapters)
│   │   └── output/      # Outbound interfaces (drivers)
│   ├── adapters/        # External integrations
│   └── infrastructure/  # Database, cache, external APIs
├── components/          # React UI components
├── pages/               # Astro page routes
└── styles/              # Global styles
```

### Design Principles

- **Domain-Driven**: Business logic lives in `src/lib/domain/`, independent of frameworks
- **Port-Based**: Interfaces define contracts between layers
- **Adapter Pattern**: External systems (APIs, databases) implement port interfaces
- **Thin Controllers**: Astro pages and React components are thin — they delegate to `src/lib/`

## Project Structure

```
NexusForge/
├── .github/            # GitHub templates and workflows
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
├── prisma/             # Database schema
├── src/                # Source code
├── tests/              # Test files
├── docker/             # Docker configuration
├── openspec/           # SDD artifacts (design docs)
├── Dockerfile          # Multi-stage build
├── docker-compose.yml  # Development services
└── vitest.config.ts    # Test configuration
```

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

### Commit Convention

This project uses [Conventional Commits](https://conventionalcommits.org):

```
feat: add asset search endpoint
fix: resolve license detection bug
docs: update README setup section
```

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with care for the game development community**

</div>
