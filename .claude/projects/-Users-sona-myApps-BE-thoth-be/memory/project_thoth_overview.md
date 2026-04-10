---
name: Thoth Architecture Decisions
description: Core tech stack and architecture decisions for thoth-be — NestJS, MikroORM, DDD monolith, tenant column approach
type: project
---

Thoth-be uses NestJS + TypeScript + Express + MikroORM + PostgreSQL 16 + Elasticsearch 8 + Keycloak 24. Docker Compose for all services.

**Architecture:** DDD monolith with graduated module depth. Modules start as standard NestJS (controllers/services/dto/entities) and add domain/interfaces/repositories when complexity demands. EntitySchema keeps domain entities clean.

**Tenancy:** Shared schema with `program_id` + `branch_id` columns and MikroORM global filter. NOT schema-per-tenant. Only 3-4 programs per school (National, American, IG, rarely IB).

**Auth:** Keycloak SSO federated with Google Workspace / Microsoft AD. Permission-based RBAC with organizational scope. Custom Angular login UI (no Keycloak themes).

**API:** REST with bilingual response envelope (ar+en). Custom error code ranges (1xxx-9xxx). Message registry in `src/core/i18n/messages.ts`.

**Cross-module:** Reads via service injection, writes via domain events (`@nestjs/event-emitter`).

**Why:** Designed for Egyptian + Gulf school market. On-premise first, SaaS on GCP later. No Redis/cache/CI-CD in Phase 1 MVP.

**How to apply:** Full design in `docs/architecture.md`. Follow graduated depth rule — don't force 4-layer DDD on simple CRUD modules. All decisions documented in decision log (15 decisions).