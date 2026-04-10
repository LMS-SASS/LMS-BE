---
name: Keep It Simple
description: User consistently pushes back on over-engineering — always prefer the simplest correct solution
type: feedback
---

Always prefer the simplest correct approach. User has pushed back multiple times on over-engineering during brainstorming.

**Why:** Startup context with junior/mid devs. Complexity slows development and creates confusion. The user explicitly said "simple and also maintain and scale but not over complex" multiple times.

**How to apply:**
- Don't propose multi-tenancy frameworks when a column + filter works
- Don't add abstraction layers unless the module has earned the complexity
- Don't create custom event infrastructure when `@nestjs/event-emitter` exists natively
- Don't split into tiers/categories when one graduated pattern works
- Start with standard NestJS patterns, extend only when complexity demands
- When presenting options, always recommend the simplest one that meets requirements