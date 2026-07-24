# Contributing to NexusForge

Thank you for your interest in contributing to NexusForge! This document provides guidelines and information for contributors.

## Code of Conduct

Please be respectful and inclusive in all interactions. We are committed to providing a welcoming and constructive community for everyone.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `pnpm install`
4. **Create** a branch for your changes: `git checkout -b feat/my-feature`
5. **Make** your changes
6. **Test** your changes: `pnpm test`
7. **Commit** using conventional commits
8. **Push** to your fork and submit a Pull Request

## Development Setup

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (optional)

### Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm test:ui      # Run tests with UI
```

## Commit Convention

We use [Conventional Commits](https://conventionalcommits.org). All commits must follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, missing semi colons, etc) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Code change that improves performance |
| `test` | Adding missing tests or correcting existing tests |
| `build` | Changes that affect the build system or external dependencies |
| `ci` | Changes to CI configuration files and scripts |
| `chore` | Other changes that don't modify src or test files |

### Examples

```bash
git commit -m "feat(assets): add semantic search endpoint"
git commit -m "fix(license): resolve false positive on CC0 detection"
git commit -m "docs: update README setup instructions"
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code compiles without errors (`pnpm build`)
- [ ] Tests pass (`pnpm test`)
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Code follows project style guidelines
- [ ] Documentation is updated (if applicable)

### PR Title

Use the same conventional commit format as commits:

```
feat(assets): add batch download support
```

### PR Description

- Describe **what** changed and **why**
- Reference any related issues
- Include screenshots for UI changes
- List any breaking changes

## Architecture Guidelines

### Hexagonal Architecture

NexusForge follows hexagonal architecture. When adding new features:

1. **Domain** (`src/lib/domain/`): Business entities and rules — no framework dependencies
2. **Ports** (`src/lib/ports/`): Interfaces defining contracts
3. **Adapters** (`src/lib/adapters/`): External integrations implementing ports
4. **Application** (`src/lib/application/`): Use cases orchestrating domain logic
5. **Infrastructure** (`src/lib/infrastructure/`): Database, cache, external APIs

### Testing Strategy

- **Unit tests**: Test domain logic and use cases in isolation
- **Component tests**: Test React components with Testing Library
- **Integration tests**: Test adapter implementations against real or mocked external services

## Questions?

If you have questions, feel free to open an issue with the `question` label.
