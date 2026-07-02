# CLAUDE.md

Guidance for Claude Code when working in this repository. Keep changes consistent with the conventions below.

## Project Overview

LMS-SASS is an AI-powered school library management SaaS. This repo (`lms-sass`) is the core backend.

- **Staff Portal** — catalog, circulation (check-in/out, renewals, holds, fines), patrons, acquisitions, serials, inventory, reporting, approvals.
- **Public Portal (OPAC)** — search/discovery, availability, holds/reservations, reading lists, digital/physical resources.

## Tech Stack

- **Runtime:** Node.js 20 LTS + TypeScript (strict)
- **Framework:** NestJS + Express
- **ORM:** MikroORM (EntitySchema, Unit of Work, global filters for tenancy)
- **Database:** PostgreSQL 16 · **Search:** Elasticsearch 8
- **Identity:** Keycloak 24 (SSO, federated with Google Workspace / Microsoft AD)
- **Containers:** Docker Compose · **Testing:** Jest + Supertest + NestJS testing utils

## Common Commands

```bash
npm install                              # Install dependencies
docker-compose up                        # Run all services (Postgres, ES, Keycloak, API)
npm run start:dev                        # API in watch mode
npm run start:debug                      # API in watch + Node inspector
npm run build                            # Build
npm run lint                             # ESLint auto-fix
npm run format                           # Prettier
npm run test                             # All unit tests
npm run test -- catalog.service.spec     # Single test file (Jest rootDir=src/, testRegex=.*\.spec\.ts$)
npm run test:cov                         # Coverage
npm run test:e2e                         # E2E (config: test/jest-e2e.json)
npx mikro-orm migration:up               # Run migrations
npx mikro-orm migration:create           # Create migration
# Swagger/OpenAPI docs served at /api/docs when the app is running
```

## Project Structure

```
src/
├── core/       # Global infra: tenancy, auth, permissions, i18n, logging, health, config
├── common/     # Shared base classes: entity, value object, DTOs, interceptors, filters
├── modules/    # Bounded contexts: catalog, circulation, patron, inventory, organization, discovery
└── database/   # MikroORM config, migrations, seeders
```

## Conventions — Follow These

- **Module layout is graduated.** Every module starts with the base 4: `controllers/`, `services/`, `dto/`, `entities/` (plus `*.module.ts`). Add `repositories/`, `interfaces/`, `domain/`, `search/` only when complexity demands it — do not scaffold empty folders.
- **Controllers call services, never repositories directly.** Business logic lives in services, not controllers.
- **Entities use MikroORM `EntitySchema`** — keep domain classes free of ORM decorators.
- **Tenancy:** every tenant-scoped table has `program_id` (+ `branch_id`); rely on the MikroORM global filter for scoping. No schema-per-tenant. Only disable the filter for deliberate cross-program admin/reporting queries.
- **Cross-module reads:** direct service injection (import the module, use its service).
- **Cross-module writes with side effects:** emit domain events via `@nestjs/event-emitter` — no direct service calls between modules for writes.
- **Config:** add env vars to the Joi schema in `src/core/config`; the app fails-fast on invalid config at boot. Update `.env.example` when adding vars.
- **Tests co-located** with source (`catalog.service.spec.ts` next to `catalog.service.ts`).

## Response Envelope

All API responses use: `{ code, title: {en, ar}, description: {en, ar}, requestId, data, errors? }`.
Controllers return **raw data** — the envelope is applied by `ResponseInterceptor` / `GlobalExceptionFilter`.

Error code ranges: `1xxx`=auth · `2xxx`=authz · `3xxx`=validation · `4xxx`=not found/business · `5xxx`=circulation · `6xxx`=catalog · `9xxx`=system.
All messages (both languages, keyed by code) live in `src/core/i18n/messages.ts` — add new codes there.

## Domain Model

- Org hierarchy: **Group → School → Program → Branch → Library**.
- **Program + Branch = one library** (its own catalog, items, students, circulation).
- Students belong to exactly one program; physical items belong to exactly one program (no cross-program sharing). Staff can span programs/schools.
- Design follows real-world library systems (Koha/FOLIO): MARC/metadata cataloging, configurable loan rules, patron permission hierarchies.

## AI Guidelines (Phase 3)

AI features (semantic search, recommendations, summaries, reading insights) must: never replace a librarian's decisions, never bypass governance/approval flows, and ship as an optional add-on.

## Full Architecture

Detailed design, decision log, and rationale:

@docs/architecture.md
