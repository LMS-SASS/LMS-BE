# Thoth Backend — Architecture Design

> This document captures the architecture decisions made during the brainstorming phase.
> It is the single source of truth for how the backend is designed and why.

**Version:** 1.0 | **Date:** 2026-04-10

---

## 1. Understanding Summary

- **What:** Backend for Thoth — an AI-powered school library management SaaS platform
- **Why:** Transform school libraries from back-office systems into discovery and learning platforms
- **Who:** School groups, multi-program schools, districts — Egyptian and Gulf markets
- **Scale:** 3–4 programs per school, 1–2 branches, 10K+ students, 200K+ books per library
- **Language:** Arabic (default) + English from day one
- **Deployment:** On-premise first (Docker Compose), SaaS on GCP later

---

## 2. Organizational Model

```
Platform (Thoth SaaS)
├── School Group (e.g., "EEP")
│   ├── School: SILS (IG British)
│   │   ├── Branch: Main Campus
│   │   │   └── Library (own catalog, copies, students, circulation)
│   │   └── Branch: ...
│   ├── School: WILS (American)
│   │   ├── Branch: Main Campus
│   │   │   └── Library
│   │   └── Branch: ...
│   └── Shared: some teachers may work across schools (rare)
│
├── School: Future Academy
│   ├── Program: American
│   │   ├── Branch: Giza → Library
│   │   └── Branch: Cairo → Library
│   ├── Program: IB
│   │   └── Branch: Giza → Library
│   └── Program: National
│       └── Branch: Giza → Library
```

### Key Rules

- **Program + Branch = one library** (catalog, items, students, circulation)
- A school can have multiple programs (max 3–4: National, American, IG, rarely IB)
- A school group can own multiple schools
- Students belong to exactly one program
- Staff (teachers, librarians) can span programs and schools
- Physical items belong to exactly one program — no cross-program sharing
- Branches are typically 1–2 per school, max 4–5 for large schools

---

## 3. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20 LTS |
| Framework | NestJS + Express | Latest |
| Language | TypeScript | Strict mode |
| ORM | MikroORM | Latest |
| Database | PostgreSQL | 16 |
| Search | Elasticsearch | 8 |
| Identity | Keycloak | 24 |
| Containerization | Docker Compose | Latest |

### Why MikroORM

- Unit of Work pattern — batches DB writes for performance
- Identity Map — prevents duplicate reads
- EntitySchema — keeps domain entities as plain TypeScript classes
- Native global filters — clean tenant scoping
- DDD-friendly — domain entities are not coupled to ORM decorators
- MongoDB support — future portability

---

## 4. Project Structure

```
src/
├── app.module.ts                    # Root module — imports all domain + infra modules
├── main.ts                          # Bootstrap, Swagger, global pipes/filters
│
├── core/                            # Global infrastructure (imported once in AppModule)
│   ├── core.module.ts
│   ├── tenancy/                     # Tenant column filter, middleware
│   ├── auth/                        # Keycloak token validation, guards
│   ├── permissions/                 # RBAC engine, permission guards
│   ├── i18n/                        # Message registry (ar + en), locale resolver
│   ├── logging/                     # Structured JSON logger, request context
│   ├── health/                      # Health check endpoints
│   └── config/                      # App config, validation (Joi)
│
├── common/                          # Shared building blocks (no business logic)
│   ├── domain/                      # Base entity, value object, domain event interfaces
│   ├── application/                 # Base use case, pagination DTO, response envelope
│   ├── infrastructure/              # Base repository, MikroORM helpers
│   └── presentation/               # Global filters, interceptors, decorators
│
├── modules/                         # Bounded contexts — the business
│   ├── catalog/
│   ├── circulation/
│   ├── patron/
│   ├── inventory/
│   ├── reporting/
│   ├── organization/               # School groups, schools, programs, branches
│   └── discovery/                  # OPAC search (Elasticsearch)
│
└── database/                        # MikroORM config, migrations, seeders
    ├── mikro-orm.config.ts
    ├── migrations/
    └── seeders/
```

---

## 5. Module Internal Structure — Graduated Depth

All modules follow one pattern. Not all folders are required — they grow when complexity demands.

### Day 1 — Every Module Starts With

```
modules/catalog/
├── catalog.module.ts
├── controllers/
│   └── catalog.controller.ts
├── services/
│   └── catalog.service.ts
├── dto/
│   └── create-book.dto.ts
└── entities/
    └── book.entity.ts
```

This is standard NestJS. Any NestJS developer understands it immediately.

### When Complexity Grows — Add Folders

| You need... | Add folder | Example |
|---|---|---|
| Custom queries beyond basic CRUD | `repositories/` | Circulation needs complex loan queries |
| Contracts for swappable implementations | `interfaces/` | Catalog needs ISearchEngine for Elasticsearch |
| Business rules in value objects | `domain/value-objects/` | ISBN validation, CallNumber formatting |
| Event-driven cross-module communication | `domain/events/` | BookCheckedOut triggers notification |
| External service adapters | `search/`, `adapters/` | Elasticsearch, Keycloak |

### Rules

1. `controllers/` call `services/` — never repositories directly
2. `services/` contain business logic — not controllers
3. `entities/` use MikroORM `EntitySchema` to keep classes clean
4. `interfaces/` define contracts — implementations sit alongside the code that uses them
5. Cross-module communication via `@nestjs/event-emitter` — no direct service imports between modules for write operations
6. No folder is mandatory except the base 4 (controllers, services, dto, entities)

### Promotion Rule

> If the module has business rules, state transitions, or domain events → add `domain/`, `interfaces/`, `repositories/`
> If the module is mostly data access and transformation → keep the base 4
> Start simple, promote when complexity demands it

---

## 6. Multi-Tenancy

### Approach: Shared Schema + Tenant Column + MikroORM Global Filter

With only 3–4 programs per school, a multi-tenancy framework is unnecessary. Simple `program_id` and `branch_id` columns with a global filter.

### Data Layout

```
PostgreSQL (single schema: public)

Organization tables (no tenant scoping):
  - school_groups
  - schools
  - programs
  - branches
  - users (staff identity, cross-program)
  - roles
  - permissions

Tenant-scoped tables (every row has program_id + branch_id):
  - books              → program_id
  - copy_items         → program_id, branch_id
  - patrons            → program_id, branch_id
  - loans              → program_id, branch_id
  - holds              → program_id, branch_id
  - fines              → program_id, branch_id
  - inventory_records  → program_id, branch_id
```

### How It Works

1. Every tenant-scoped table has `program_id` and `branch_id` columns
2. MikroORM global filter auto-applies `WHERE program_id = ?` on every query
3. Middleware extracts `program_id` from JWT and sets it on the request context
4. Admin/supervisor queries disable the filter to see across programs

### Indexing Strategy

| Table | Index |
|---|---|
| books | `(program_id, title)`, full-text index, Elasticsearch for discovery |
| patrons | `(program_id, branch_id)` |
| loans | `(program_id, branch_id, status)`, date partitioning if needed later |
| copy_items | `(program_id, branch_id, barcode)` |

---

## 7. Authentication & Authorization

### Authentication

- Keycloak as identity broker
- Federates with school's existing IdP (Google Workspace or Microsoft AD)
- Students/staff log in with school email — no new passwords
- Custom Angular login page triggers Keycloak flows (no Keycloak themed UI)
- Backend validates Keycloak JWT tokens

### Authorization: Permission-based RBAC with Scoped Policies

**Permissions** are atomic capabilities:
`catalog:read`, `catalog:write`, `circulation:checkout`, `reports:view`

**Roles** are named bundles of permissions. Defaults provided, schools can create custom roles.

**Scope assignment** ties a user + role to an organizational node:

| Role | Scope | Example |
|---|---|---|
| Super Admin | Platform-wide | Thoth ops team |
| Group Admin | School group | EEP admin across SILS + WILS |
| School Admin | School | SILS principal |
| Librarian | Program + Branch | SILS IG librarian at main campus |
| Teacher | Program | Teaches in American program |
| Student | Program + Branch | Enrolled in IB at Giza |
| Parent | Linked to student(s) | Sees their children's activity |

---

## 8. Cross-Module Communication

### Rule

> **Reads (queries) → direct service injection**
> **Writes that trigger side effects → domain events**

### Examples

| Scenario | Mechanism |
|---|---|
| Circulation checks if book exists | `catalogService.findBook(id)` — direct injection |
| Book checked out → update inventory | Inventory listens for `BookCheckedOut` event |
| OPAC searches catalog | `catalogService.search(query)` — direct injection |
| Fine created → notify parent | Notification listens for `FineCreated` event |

### Implementation

- `@nestjs/event-emitter` — native NestJS, zero custom infrastructure
- Events are simple typed interfaces in `dto/events/`
- Listeners are `@OnEvent()` decorated methods in services
- Migration to microservices: replace `EventEmitter2` with RabbitMQ/Kafka transport

---

## 9. API Design

### Versioning

URL-based: `/api/v1/catalog/books`

### Response Envelope

Every API response follows this format. Controllers return raw data — the envelope is applied by `ResponseInterceptor` and `GlobalExceptionFilter`.

**Success (single item):**
```json
{
  "code": 200,
  "title": { "en": "Success", "ar": "نجاح" },
  "description": { "en": "The request was successfully processed.", "ar": "تم معالجة الطلب بنجاح" },
  "requestId": "uuid",
  "data": { ... }
}
```

**Success (paginated):**
```json
{
  "code": 200,
  "title": { "en": "Success", "ar": "نجاح" },
  "description": { "en": "The request was successfully processed.", "ar": "تم معالجة الطلب بنجاح" },
  "requestId": "uuid",
  "data": {
    "content": [ ... ],
    "page": 1,
    "size": 20,
    "totalElements": 1523,
    "totalPages": 77,
    "first": true,
    "last": false,
    "empty": false
  }
}
```

**Validation error:**
```json
{
  "code": 3001,
  "title": { "en": "Validation failed", "ar": "فشل التحقق" },
  "description": { "en": "Please check the highlighted fields.", "ar": "يرجى التحقق من الحقول المحددة" },
  "requestId": "uuid",
  "data": null,
  "errors": [
    { "field": "isbn", "message": { "en": "Invalid ISBN format", "ar": "صيغة ISBN غير صالحة" } }
  ]
}
```

**Business error:**
```json
{
  "code": 5001,
  "title": { "en": "Book not available", "ar": "الكتاب غير متاح" },
  "description": { "en": "This book is currently checked out.", "ar": "هذا الكتاب مُعار حالياً" },
  "requestId": "uuid",
  "data": null
}
```

### Custom Error Code Ranges

| Range | Category | Frontend Action |
|---|---|---|
| 200 | Success | Display data |
| 1xxx | Authentication | Redirect to login |
| 2xxx | Authorization | Show permission denied |
| 3xxx | Validation | Highlight form fields |
| 4xxx | Not Found / Business | Show business error message |
| 5xxx | Circulation errors | Show business error message |
| 6xxx | Catalog errors | Show business error message |
| 9xxx | System / Server | Show generic error page |

### Message Registry

All response messages live in `src/core/i18n/messages.ts` — one file, both languages, keyed by error code.

---

## 10. Internationalization (i18n)

- Backend returns both `ar` and `en` in title/description fields
- Frontend decides which language to display based on user locale
- Dynamic content (error messages, notifications, system messages) is localized by backend
- Static UI labels are frontend's responsibility (ar.json / en.json)
- API accepts `Accept-Language` header for any future single-language needs
- Third language can be added by extending the `LocalizedText` type

---

## 11. Observability

- **Structured JSON logging** with request ID, user context, duration
- **Request/response logging** with correlation IDs for tracing
- **Basic metrics endpoint** — request count, response time, error rate
- **Health check endpoint** — `/api/health`
- No ELK stack, no Grafana, no Prometheus in Phase 1

---

## 12. Testing Strategy

- **Unit tests** for services (business logic) — using Jest
- **Integration tests** for controllers (API endpoints) — using NestJS testing utilities + Supertest
- **Minimal in dev/MVP** — test infrastructure is there, coverage grows toward production
- Test files co-located with source: `catalog.service.spec.ts` next to `catalog.service.ts`

---

## 13. Caching Strategy

- **No Redis in Phase 1** — PostgreSQL + Elasticsearch handle reads efficiently at current scale
- **Design cacheable patterns now** — clean read/write separation in services
- **NestJS CacheModule abstraction** — when Redis is added later, it's a config change
- **Rule:** Code as if cache exists (clean read paths), but don't wire it until needed

---

## 14. Infrastructure

### Docker Compose (single file: `docker-compose.yml`)

| Service | Image | Purpose |
|---|---|---|
| thoth-api | Custom (multi-stage Node 20 Alpine) | NestJS application |
| postgres | postgres:16-alpine | Primary database |
| elasticsearch | elasticsearch:8 (single node) | Search and discovery |
| keycloak | keycloak:24 (dev mode) | Identity and SSO |

- One `docker-compose up` to run everything
- Keycloak configurable to point to external instance for schools with their own IdP
- No separate dev/prod compose files for MVP

### Future Infrastructure (not now, but designed for)

- Redis for caching
- CI/CD pipeline (GitHub Actions)
- GCP deployment (Cloud Run or GKE)
- Separate dev/staging/production environments

---

## 15. Decision Log

| # | Decision | Alternatives Considered | Why This Choice |
|---|---|---|---|
| 1 | NestJS + TypeScript + Express | Fastify, Python/FastAPI | Team expertise, enterprise ecosystem, DI built-in |
| 2 | PostgreSQL + MikroORM | TypeORM (declining maintenance), Prisma (weak DDD fit) | DDD alignment, Unit of Work, EntitySchema, global filters |
| 3 | Elasticsearch for discovery | PostgreSQL full-text search | 200K+ books, semantic search in Phase 3 |
| 4 | Keycloak SSO | Custom auth, Auth0 | Federate Google/Microsoft, on-premise, open source |
| 5 | Shared schema + tenant column | Schema-per-tenant, RLS, separate DBs | Only 3–4 programs, simple, easy cross-program reporting |
| 6 | Permission-based RBAC with scoped policies | Simple RBAC, ABAC | Custom roles per school, clean in DDD, SaaS-ready |
| 7 | DDD monolith, graduated depth | Strict 4-layer all modules, flat NestJS, hexagonal | Zero learning curve, standard NestJS, grows when needed |
| 8 | Mixed cross-module communication | Pure events, pure injection | Reads=injection, writes=events, microservice migration path |
| 9 | Bilingual response envelope + custom error codes | Single language, HTTP-only codes | Frontend decides language, toaster-ready, error ranges |
| 10 | Docker Compose for everything | Kubernetes, separate VMs | On-premise MVP, one command, GCP later |
| 11 | No Redis in Phase 1 | Redis from day one | Small data in MVP, design for it, add when needed |
| 12 | No CI/CD in Phase 1 | GitHub Actions from day one | Local dev, manual builds, pipeline when moving to cloud |
| 13 | Structured JSON logging + basic metrics | Full observability, console.log | Enough to debug, not over-engineered |
| 14 | Unit + integration tests, minimal in dev | Full coverage, no tests | Infrastructure ready, coverage grows |
| 15 | Arabic + English from day one | English first | Egyptian + Gulf market, backend returns both |

---

## Assumptions

- MikroORM global filters handle the tenant column scoping cleanly
- Elasticsearch is used for OPAC discovery/search, not as a primary data store
- Keycloak can federate with both Google Workspace and Microsoft AD
- A single PostgreSQL instance is sufficient for on-premise deployments
- The Angular frontend is a separate repository, communicates via REST API only
- Programs per school are 3–4 max (National, American, IG, rarely IB)
- Branches per school are 1–5 max (typically 1–2)
