# LMS-SASS Backend

The core backend service for LMS-SASS — an AI-powered school library management system for Egyptian and Gulf markets.

## Quick Start

### Prerequisites

- Node.js 20 LTS
- Docker & Docker Compose
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/LMS-SASS/LMS-SASS.git
cd LMS-SASS

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start all services (PostgreSQL, Elasticsearch, Keycloak, API)
docker-compose up -d

# Run database migrations
npx mikro-orm migration:up

# Seed initial data (roles, permissions, default admin)
npx mikro-orm seeder:run

# Start the API in dev mode
npm run start:dev
```

The API will be available at `http://localhost:3000`.
Swagger docs at `http://localhost:3000/api/docs`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS + Express |
| Language | TypeScript (strict mode) |
| ORM | MikroORM |
| Database | PostgreSQL 16 |
| Search | Elasticsearch 8 |
| Identity | Keycloak 24 |
| Testing | Jest + Supertest |
| Containers | Docker Compose |

---

## Project Structure

```
LMS-SASS/
├── src/
│   ├── app.module.ts                # Root module
│   ├── main.ts                      # Bootstrap, Swagger, global pipes/filters
│   │
│   ├── core/                        # Global infrastructure (imported once)
│   │   ├── core.module.ts
│   │   ├── tenancy/                 # Tenant filter middleware
│   │   │   ├── tenancy.middleware.ts
│   │   │   └── tenant.filter.ts
│   │   ├── auth/                    # Keycloak token validation
│   │   │   ├── auth.guard.ts
│   │   │   ├── auth.module.ts
│   │   │   └── keycloak.strategy.ts
│   │   ├── permissions/             # RBAC engine
│   │   │   ├── permissions.guard.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   └── permissions.module.ts
│   │   ├── i18n/                    # Bilingual message registry
│   │   │   └── messages.ts
│   │   ├── logging/                 # Structured JSON logger
│   │   │   ├── logging.interceptor.ts
│   │   │   └── logger.service.ts
│   │   ├── health/                  # Health check endpoints
│   │   │   └── health.controller.ts
│   │   └── config/                  # App config with Joi validation
│   │       └── app.config.ts
│   │
│   ├── common/                      # Shared building blocks
│   │   ├── domain/                  # Base entity, value object types
│   │   ├── application/             # Pagination DTO, response types
│   │   ├── infrastructure/          # Base repository helpers
│   │   └── presentation/           # Response interceptor, exception filter
│   │       ├── response.interceptor.ts
│   │       ├── global-exception.filter.ts
│   │       └── decorators/
│   │
│   ├── modules/                     # Bounded contexts
│   │   ├── catalog/                 # Book management, metadata
│   │   ├── circulation/             # Check-in/out, renewals, holds, fines
│   │   ├── patron/                  # Student, teacher, parent management
│   │   ├── inventory/               # Stock verification, copy tracking
│   │   ├── reporting/               # Reports and analytics
│   │   ├── organization/            # Groups, schools, programs, branches
│   │   └── discovery/               # OPAC search via Elasticsearch
│   │
│   └── database/                    # MikroORM configuration
│       ├── mikro-orm.config.ts
│       ├── migrations/
│       └── seeders/
│
├── test/                            # E2E tests
├── docs/
│   └── architecture.md              # Full architecture design document
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── nest-cli.json
├── tsconfig.json
├── package.json
└── CLAUDE.md
```

---

## Module Structure (Graduated Depth)

Every module starts with **4 base folders**. Additional folders are added only when complexity requires them.

### Base (always present)

```
modules/catalog/
├── catalog.module.ts           # NestJS module definition
├── controllers/
│   └── catalog.controller.ts   # REST endpoints
├── services/
│   └── catalog.service.ts      # Business logic
├── dto/
│   └── create-book.dto.ts      # Request/response DTOs
└── entities/
    └── book.entity.ts           # MikroORM EntitySchema
```

### Extended (add when needed)

| Folder | When to Add | Example |
|---|---|---|
| `repositories/` | Custom queries beyond basic CRUD | Complex loan queries in circulation |
| `interfaces/` | Contracts for swappable implementations | `ISearchEngine` for Elasticsearch |
| `domain/value-objects/` | Business rules encoded in types | ISBN validation, CallNumber formatting |
| `domain/events/` | Cross-module event-driven communication | `BookCheckedOut`, `FineCreated` |
| `search/` or `adapters/` | External service integration | Elasticsearch adapter |

### When to Promote a Module

- The module has business rules with state transitions → add `domain/`
- The module needs swappable external dependencies → add `interfaces/`
- The service has complex queries → add `repositories/`
- Start simple. Promote when it earns the complexity.

---

## Coding Conventions

### File Naming

| Type | Convention | Example |
|---|---|---|
| Module | `kebab-case.module.ts` | `catalog.module.ts` |
| Controller | `kebab-case.controller.ts` | `catalog.controller.ts` |
| Service | `kebab-case.service.ts` | `catalog.service.ts` |
| Entity | `kebab-case.entity.ts` | `book.entity.ts` |
| DTO | `kebab-case.dto.ts` | `create-book.dto.ts` |
| Interface | `kebab-case.interface.ts` | `search-engine.interface.ts` |
| Test | `kebab-case.spec.ts` (co-located) | `catalog.service.spec.ts` |
| Event | `kebab-case.event.ts` | `book-checked-out.event.ts` |

### Class Naming

| Type | Convention | Example |
|---|---|---|
| Module | `PascalCase + Module` | `CatalogModule` |
| Controller | `PascalCase + Controller` | `CatalogController` |
| Service | `PascalCase + Service` | `CatalogService` |
| Entity | `PascalCase` | `Book`, `CopyItem` |
| DTO | `PascalCase + Dto` | `CreateBookDto` |
| Interface | `I + PascalCase` | `ICatalogRepository` |
| Event | `PascalCase + Event` | `BookCheckedOutEvent` |
| Guard | `PascalCase + Guard` | `PermissionsGuard` |
| Interceptor | `PascalCase + Interceptor` | `ResponseInterceptor` |
| Filter | `PascalCase + Filter` | `GlobalExceptionFilter` |

---

## Layering Rules

These rules are **non-negotiable**. They ensure the codebase stays maintainable and testable.

### 1. Controllers Coordinate, Services Decide

```typescript
// controllers/catalog.controller.ts
@Post()
async createBook(@Body() dto: CreateBookDto) {
  return this.catalogService.createBook(dto);  // delegate to service
}
```

Controllers must **never** contain business logic, database calls, or event emissions.

### 2. Services Contain Business Logic

```typescript
// services/catalog.service.ts
async createBook(dto: CreateBookDto): Promise<Book> {
  const book = new Book(dto.title, dto.isbn, dto.programId);
  await this.em.persistAndFlush(book);
  this.eventEmitter.emit('book.created', { bookId: book.id });
  return book;
}
```

Services are the only place business rules live.

### 3. Entities Are Plain Classes

```typescript
// entities/book.entity.ts — the domain class
export class Book {
  id!: string;
  title!: string;
  isbn!: string;
  programId!: string;
  createdAt = new Date();
}

// entities/book.schema.ts — MikroORM EntitySchema (separate file)
export const BookSchema = new EntitySchema<Book>({
  class: Book,
  tableName: 'books',
  properties: {
    id: { type: 'uuid', primary: true, defaultRaw: 'gen_random_uuid()' },
    title: { type: 'string' },
    isbn: { type: 'string' },
    programId: { type: 'uuid' },
    createdAt: { type: 'Date', onCreate: () => new Date() },
  },
});
```

Domain entities have **zero** ORM decorators. EntitySchema handles persistence mapping.

### 4. No Cross-Module Internal Imports

```typescript
// WRONG — importing internal file from another module
import { BookRepository } from '../catalog/repositories/book.repository';

// CORRECT — import the exported service via module import
// In your module: imports: [CatalogModule]
// Then inject: constructor(private catalogService: CatalogService)
```

### 5. Reads = Injection, Writes = Events

```typescript
// READ — direct service call (import CatalogModule)
const book = await this.catalogService.findBook(bookId);

// WRITE SIDE EFFECT — emit event
this.eventEmitter.emit('book.checked_out', { loanId, bookId, patronId });

// LISTEN — in another module's service
@OnEvent('book.checked_out')
async handleCheckout(event: BookCheckedOutEvent) {
  await this.updateInventory(event.bookId);
}
```

---

## Multi-Tenancy

Every tenant-scoped table has `program_id` and `branch_id` columns. A MikroORM global filter automatically applies `WHERE program_id = ?` on every query.

### How It Works

1. Request arrives with Keycloak JWT containing `programId` and `branchId`
2. `TenancyMiddleware` extracts tenant info and sets it on the request context
3. MikroORM global filter reads from request context and applies the filter
4. All queries are automatically scoped — developers don't add WHERE clauses manually

### Querying Across Programs

Admin/supervisor endpoints disable the tenant filter explicitly:

```typescript
// Service method for school admin dashboard
async getSchoolOverview(schoolId: string) {
  const em = this.em.fork();
  em.setFilterParams('tenant', { enabled: false });  // see all programs
  return em.find(Book, { school: schoolId });
}
```

### Tenant-Scoped Tables

`books`, `copy_items`, `patrons`, `loans`, `holds`, `fines`, `inventory_records`

### Non-Scoped Tables (shared)

`school_groups`, `schools`, `programs`, `branches`, `users`, `roles`, `permissions`

---

## API Response Format

All endpoints return a consistent bilingual envelope. Controllers return raw data — the interceptor wraps it.

### Success Response

```json
{
  "code": 200,
  "title": { "en": "Success", "ar": "نجاح" },
  "description": { "en": "The request was successfully processed.", "ar": "تم معالجة الطلب بنجاح" },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": { "id": "uuid", "title": "Introduction to Physics" }
}
```

### Paginated Response

```json
{
  "code": 200,
  "title": { "en": "Success", "ar": "نجاح" },
  "description": { "en": "The request was successfully processed.", "ar": "تم معالجة الطلب بنجاح" },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "content": [],
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

### Error Response

```json
{
  "code": 5001,
  "title": { "en": "Book not available", "ar": "الكتاب غير متاح" },
  "description": { "en": "This book is currently checked out.", "ar": "هذا الكتاب مُعار حالياً" },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": null
}
```

### Error Code Ranges

| Range | Category | Frontend Action |
|---|---|---|
| 200 | Success | Display data |
| 1xxx | Authentication | Redirect to login |
| 2xxx | Authorization | Show permission denied |
| 3xxx | Validation | Highlight form fields |
| 4xxx | Not Found | Show error message |
| 5xxx | Circulation | Show business error |
| 6xxx | Catalog | Show business error |
| 9xxx | System | Show generic error page |

### Adding a New Error

All messages live in `src/core/i18n/messages.ts`:

```typescript
export const MESSAGES = {
  5001: {
    title: { en: 'Book not available', ar: 'الكتاب غير متاح' },
    description: { en: 'This book is currently checked out.', ar: 'هذا الكتاب مُعار حالياً' },
  },
  // Add new errors here
};
```

Throw from any service:

```typescript
throw new BusinessException(5001);  // auto-resolves title + description from registry
```

---

## Authentication & Authorization

### Authentication Flow

1. Angular frontend redirects to Keycloak login (custom UI, not Keycloak theme)
2. Student/staff logs in with school email (Google Workspace or Microsoft AD)
3. Keycloak issues JWT token
4. Backend validates JWT on every request via `AuthGuard`

### Authorization — Permission-Based RBAC

**Permissions** are atomic: `catalog:read`, `catalog:write`, `circulation:checkout`, `reports:view`

**Roles** bundle permissions: Librarian = `[catalog:*, circulation:*, inventory:*]`

**Scope** ties a role to an organizational level:

| Role | Scope Level |
|---|---|
| Super Admin | Platform |
| Group Admin | School Group |
| School Admin | School |
| Librarian | Program + Branch |
| Teacher | Program |
| Student | Program + Branch |
| Parent | Linked to student(s) |

### Protecting Endpoints

```typescript
@Get('books')
@RequirePermissions('catalog:read')          // permission check
@RequireScope('program')                      // must have access to the program
async listBooks() { ... }

@Post('books')
@RequirePermissions('catalog:write')
async createBook(@Body() dto: CreateBookDto) { ... }
```

---

## Domain Events

Events are used for cross-module write-side effects. They use `@nestjs/event-emitter` — native NestJS, no custom infrastructure.

### Emitting Events

```typescript
// In circulation service
this.eventEmitter.emit('book.checked_out', {
  loanId: loan.id,
  bookId: book.id,
  patronId: patron.id,
});
```

### Listening to Events

```typescript
// In inventory service
@OnEvent('book.checked_out')
async handleBookCheckedOut(event: BookCheckedOutEvent) {
  await this.decrementAvailableCopies(event.bookId);
}
```

### Event Payload Types

```typescript
// dto/events/book-checked-out.event.ts
export interface BookCheckedOutEvent {
  loanId: string;
  bookId: string;
  patronId: string;
}
```

---

## Testing

### Running Tests

```bash
npm run test                                    # all unit tests
npm run test -- --testPathPattern=catalog       # tests matching "catalog"
npm run test -- --watch                         # watch mode
npm run test:cov                                # coverage report
npm run test:e2e                                # integration/e2e tests
```

### Test File Location

Tests are co-located with source files:

```
modules/catalog/
├── services/
│   ├── catalog.service.ts
│   └── catalog.service.spec.ts      # unit test right next to source
├── controllers/
│   ├── catalog.controller.ts
│   └── catalog.controller.spec.ts   # integration test
```

### Unit Test Pattern

```typescript
describe('CatalogService', () => {
  let service: CatalogService;
  let em: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: EntityManager, useValue: createMock<EntityManager>() },
      ],
    }).compile();

    service = module.get(CatalogService);
    em = module.get(EntityManager);
  });

  it('should create a book', async () => {
    const dto = { title: 'Physics', isbn: '978-3-16-148410-0', programId: 'uuid' };
    const result = await service.createBook(dto);
    expect(result.title).toBe('Physics');
    expect(em.persistAndFlush).toHaveBeenCalled();
  });
});
```

---

## Database

### Migrations

```bash
npx mikro-orm migration:create     # create new migration
npx mikro-orm migration:up         # run pending migrations
npx mikro-orm migration:down       # rollback last migration
npx mikro-orm migration:list       # list all migrations
```

### Seeding

```bash
npx mikro-orm seeder:run            # run all seeders
npx mikro-orm seeder:run --class=RoleSeeder  # run specific seeder
```

---

## Docker

### Start Everything

```bash
docker-compose up -d                 # start all services in background
docker-compose logs -f lms-sass-api     # follow API logs
docker-compose down                  # stop all services
docker-compose down -v               # stop and remove volumes (reset data)
```

### Services

| Service | Port | URL |
|---|---|---|
| lms-sass-api | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | `postgresql://lms_sass:lms_sass@localhost:5432/lms_sass` |
| Elasticsearch | 9200 | http://localhost:9200 |
| Keycloak | 8080 | http://localhost:8080 |
| Swagger Docs | 3000 | http://localhost:3000/api/docs |

---

## Organizational Model

```
Platform (LMS-SASS SaaS)
├── School Group (e.g., "EEP")
│   ├── School: SILS → Program: IG British → Branch: Main → Library
│   └── School: WILS → Program: American → Branch: Main → Library
│
├── School: Future Academy
│   ├── Program: American → Branch: Giza → Library
│   ├── Program: American → Branch: Cairo → Library
│   ├── Program: IB → Branch: Giza → Library
│   └── Program: National → Branch: Giza → Library
```

**Key rules:**
- Program + Branch = one library
- Students → exactly one program
- Staff → can span programs and schools
- Items → belong to exactly one program
- Programs per school: 1–4 (National, American, IG, rarely IB)
- Branches per school: 1–5 (typically 1–2)

---

## Further Reading

- [Architecture Design Document](docs/architecture.md) — full design decisions, trade-offs, and decision log
- [Apache 2.0 License](LICENSE)
