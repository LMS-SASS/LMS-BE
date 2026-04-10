# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thoth is an AI-powered school library management system. This repository (`thoth-be`) is the core backend service.

**Dual-portal model:**
- **Staff Portal** — catalog management, circulation (check-in/out, renewals, holds, fines), patron management, acquisitions, serials, inventory, reporting, approvals
- **Public Portal (OPAC)** — search/discovery, availability, holds/reservations, reading lists, digital/physical resources

## Tech Stack

- **Runtime:** Node.js 20 LTS + TypeScript (strict)
- **Framework:** NestJS + Express
- **ORM:** MikroORM (EntitySchema, Unit of Work, global filters for tenancy)
- **Database:** PostgreSQL 16
- **Search:** Elasticsearch 8
- **Identity:** Keycloak 24 (SSO, federated with Google Workspace / Microsoft AD)
- **Containers:** Docker Compose (all services)
- **Testing:** Jest + Supertest + NestJS testing utilities

## Build & Run Commands

```bash
# Install dependencies
npm install

# Run all services (PostgreSQL, Elasticsearch, Keycloak, API)
docker-compose up

# Run API in development mode
npm run start:dev

# Run API in production mode
npm run start:prod

# Build
npm run build

# Lint
npm run lint

# Run all tests
npm run test

# Run single test file
npm run test -- --testPathPattern=catalog.service.spec

# Run integration tests
npm run test:e2e

# Run MikroORM migrations
npx mikro-orm migration:up

# Create new migration
npx mikro-orm migration:create

# Generate Swagger/OpenAPI docs
# Available at /api/docs when app is running
```

## Architecture

**DDD monolith with graduated module depth.** Full details in `docs/architecture.md`.

### Project Structure

```
src/
├── core/           # Global infra: tenancy, auth, permissions, i18n, logging, health, config
├── common/         # Shared base classes: entity, value object, DTOs, interceptors, filters
├── modules/        # Bounded contexts: catalog, circulation, patron, inventory, etc.
└── database/       # MikroORM config, migrations, seeders
```

### Module Structure (Graduated)

Every module starts with: `module.ts`, `controllers/`, `services/`, `dto/`, `entities/`.
Add `repositories/`, `interfaces/`, `domain/`, `search/` only when complexity demands it.

### Key Patterns

- **Tenancy:** `program_id` + `branch_id` columns with MikroORM global filter. No schema-per-tenant.
- **Cross-module reads:** Direct service injection (import the module, use the service).
- **Cross-module writes:** Domain events via `@nestjs/event-emitter`.
- **Auth:** Keycloak JWT validation → permission-based RBAC with organizational scope.
- **API format:** REST with bilingual response envelope (`title`/`description` in `{en, ar}`), custom error code ranges.
- **Entities:** Use MikroORM `EntitySchema` to keep domain classes free of ORM decorators.

### Response Envelope

All responses follow: `{ code, title: {en, ar}, description: {en, ar}, requestId, data, errors? }`.
Error code ranges: 1xxx=auth, 2xxx=authz, 3xxx=validation, 4xxx=not found, 5xxx=circulation, 6xxx=catalog, 9xxx=system.
Message registry lives in `src/core/i18n/messages.ts`.

## Domain Patterns

Design follows real-world library system patterns (Koha/FOLIO):
- Cataloging with MARC/metadata standards
- Circulation lifecycle with configurable loan rules
- Patron roles with permission hierarchies
- Multi-school/district organizational model: Group → School → Program → Branch → Library
- Program + Branch = one library (catalog, items, students, circulation)
- Students belong to exactly one program; staff can span programs/schools

## AI Guidelines

AI capabilities (semantic search, recommendations, summaries, reading insights) are Phase 3 and must:
- Never replace a librarian's decisions
- Never bypass governance or approval flows
- Be packaged as an optional add-on

## Business Model Context

Subscription tiers: Starter (core) → Growth (expanded) → District (multi-school governance) → AI add-on. Key metrics: search-to-borrow conversion, active readers, overdue reduction, librarian effort reduction.
