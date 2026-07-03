# LMS-SASS Agent Team — POC

A small, three-agent team for building LMS-SASS backend features. This is a
proof-of-concept: you hand a request to **Cobra Head**, it writes a simple blueprint,
**Senior Backend** builds it, and **Eagle Eye** verifies it.
Official docs: https://code.claude.com/docs/en/agent-teams

## The team

| Agent | Who | Model · effort | Permissions | Job |
|---|---|---|---|---|
| 🐍 **Cobra Head** | Your main Claude Code session (the lead/architect — not an agent file) | Opus 4.8 · medium | Normal (approves nothing outward) | Turns your request into a short **feature blueprint**, assigns the work, reviews the diff. Never writes feature code. |
| 🛠️ **Senior Backend** | `backend-developer` agent (`.claude/agents/backend-developer.md`) | Sonnet 4.6 · medium | **auto-accept** (`acceptEdits`) — no prompts to you | Implements the NestJS module/service/DTO/entity/migration + co-located tests. Uses the `/nestjs-expert` skill. |
| 🦅 **Eagle Eye** | `tester` agent (`.claude/agents/tester.md`) | Sonnet 4.6 · medium | **auto-accept** (`acceptEdits`) — no prompts to you | Verifies against **what you tell Cobra Head you need**. Runs Jest/Supertest and drives the API in Chrome (Chrome DevTools MCP). |

> Model note: the agent files pin `claude-sonnet-4-6`. If your CLI doesn't recognize
> that id, use the `sonnet` alias instead. Cobra Head is your session — set it with
> `/model` (Opus 4.8, medium) or launch `claude --model claude-opus-4-8`.

## The flow

```
You ──request──▶ 🐍 Cobra Head ──blueprint + tasks──▶ 🛠️ Senior Backend ──"ready"──▶ 🦅 Eagle Eye
                      ▲                                                                   │
                      └──────────────── review diff ◀── verdict (PASS / FAIL) ───────────┘
```

- **You → Cobra Head:** describe the feature and (separately) tell it what Eagle Eye
  should check ("verify checkout blocks a second loan on the same copy").
- **Cobra Head → blueprint:** one short blueprint (see below), split into implementation
  tasks for Senior Backend and verification tasks for Eagle Eye.
- **Senior Backend → builds:** implements the slice with co-located tests, respects the
  graduated module layout and the `program_id`/`branch_id` tenant filter, pings Eagle Eye.
- **Eagle Eye → verifies:** runs the tests and drives Chrome against the checks you asked
  for, reports PASS or FAIL-with-repro.
- **Cobra Head → reviews:** reads the diff (clean-code, clean-architecture, response
  envelope, tenancy) and closes the loop back to you.

## One-time setup (already done in this repo)

- `.claude/settings.local.json` → `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"` enables
  teams; `"teammateMode": "tmux"` gives each teammate its own split pane.
- A `UserPromptSubmit` **hook** for Cobra Head that reminds it, on every request, to
  write a blueprint, assign to Senior Backend + Eagle Eye in auto-accept mode, and
  review rather than code.
- `tmux` installed (`tmux -V`). Agent definitions live in `.claude/agents/`.

## Start the team — paste this into Cobra Head

```
You are Cobra Head, the team lead and architect for lms-sass. Use the /architecture
skill for design decisions and do the code review yourself — do not implement features.

Spawn two teammates in split panes, both in acceptEdits mode so they run without
asking me for permission:
- "Senior Backend" using the backend-developer agent type (Sonnet 4.6, medium).
- "Eagle Eye" using the tester agent type (Sonnet 4.6, medium).

Feature: <WHAT I WANT>
Verify: <WHAT EAGLE EYE SHOULD CHECK>

Do this:
- Write a short feature blueprint (goal, module + folders to touch, tenancy notes,
  the endpoints/behavior) — keep it simple, no ceremony.
- Assign implementation to Senior Backend and verification to Eagle Eye. Senior
  Backend must invoke /nestjs-expert for non-trivial NestJS work and ship co-located
  tests. Have it ping Eagle Eye when a slice is ready.
- Require plan approval from Senior Backend before it edits code; only approve plans
  with co-located tests that respect the program_id/branch_id filter.
- When a slice is done, YOU review the diff (clean-code + clean-architecture,
  response envelope, tenancy) before marking it complete. Wait for the teammates —
  don't code yourself.
```

Replace `<WHAT I WANT>` and `<WHAT EAGLE EYE SHOULD CHECK>` with the real request.

## Blueprint shape (what Cobra Head produces)

Keep it to a few lines — this is a POC, not a spec document:

```
Feature: <name>
Goal: <one sentence>
Module: modules/<context> — folders: controllers, services, dto, entities (+ others only if needed)
Tenancy: program_id (+ branch_id) on <tables>; rely on the global filter
Endpoints / behavior: <bullet list>
Tests: co-located *.spec.ts — happy path, error path, tenant isolation
Verify (Eagle Eye): <the checks you asked for>
```

## Driving the team

- **Agent panel** (below the prompt): ↑/↓ select a teammate, **Enter** to open its
  transcript, **Esc** interrupt, **x** stop, **Ctrl+T** toggle the task list.
- **Split panes** (tmux): click into a pane to talk to that teammate directly.
- By name: `Tell Senior Backend to add an index on (program_id, barcode).`
- `Ask Eagle Eye to run the E2E suite against the checkout endpoint.`
- Shut one down: `Ask Eagle Eye to shut down.`

## Notes / gotchas

- **Permissions:** Senior Backend and Eagle Eye run in `acceptEdits` — file edits are
  auto-accepted, so nothing bubbles up to you. Common shell/Chrome ops are also
  pre-approved in `settings.local.json`. For a truly zero-prompt run, spawn them in
  `bypassPermissions` instead (use with care).
- **Effort:** teammates inherit the lead's effort unless the agent file pins it — the
  files pin `medium`. If a run comes up wrong, add "use medium effort" to the spawn.
- **Skills for teammates:** the `skills` frontmatter field is ignored for teammates —
  that's why both agents have the `Skill` tool and are told to invoke `/nestjs-expert`.
- **Chrome:** Eagle Eye uses Chrome DevTools MCP. Start the API first
  (`npm run start:dev`, Swagger at `http://localhost:3000/api/docs`) so it has
  something to drive.
- **Resume:** `/resume` does not restore in-process teammates; if Cobra Head messages a
  missing teammate, tell it to spawn fresh ones.
- **Orphaned panes:** if a pane lingers after exit, `tmux ls` then
  `tmux kill-session -t <name>`.
