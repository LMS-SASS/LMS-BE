# LMS-SASS Agent Team

How the LMS-SASS backend agent team is set up and how to run it.
See the official docs: https://code.claude.com/docs/en/agent-teams

## Roles

| Role | Who | Model / effort | Job |
|---|---|---|---|
| **Team lead** | Your main Claude Code session | Opus 4.8 · medium | Plays the architect. Creates the plan + task list, assigns work, guides the backend dev (`/architecture`), and does code review. The lead is the main session — it is **not** an agent file. |
| **backend-developer** | Teammate (`.claude/agents/backend-developer.md`) | Sonnet 5 · high | Implements NestJS modules/services/DTOs/entities/migrations + tests. Uses the `/nestjs-expert` skill. |
| **tester** | Teammate (`.claude/agents/tester.md`) | Sonnet 5 · high | Writes/runs Jest + Supertest tests and drives the running API in Chrome (Chrome DevTools MCP) to verify behavior. |

## One-time setup (already done in this repo)

- `.claude/settings.local.json` → `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"` enables teams,
  `"teammateMode": "tmux"` gives each teammate its own split pane.
- `tmux` is installed (`tmux -V`). Split panes need it.
- Agent definitions live in `.claude/agents/`. Teammates honor each file's `tools` and
  `model`; the file body is appended to the teammate's system prompt.

## Set the lead's model + effort

The lead is your session. Before starting a team run:

```
/model            # pick Opus 4.8, set effort to Medium
```

Or launch with: `claude --model claude-opus-4-8`

> Also open `/config` → **Default teammate model** and leave it on the per-agent
> value (the agent files pin Sonnet 5), or set it to Sonnet as a fallback.

## Start the team — paste this into the lead

```
You are the team lead and architect for lms-sass. Use the /architecture skill to
guide design decisions and do the code review yourself — do not implement features.

Spawn two teammates in split panes:
- "dev" using the backend-developer agent type (Sonnet 5, high effort).
- "qa" using the tester agent type (Sonnet 5, high effort).

Workflow for <FEATURE / MODULE NAME>:
1. Plan the feature and break it into a shared task list (5-6 tasks per teammate),
   respecting the graduated module structure in CLAUDE.md and docs/architecture.md.
2. Assign implementation tasks to dev and verification tasks to qa. Have dev tell qa
   when each slice is ready; qa tests it and reports back.
3. dev must invoke /nestjs-expert for non-trivial NestJS work.
4. Require plan approval from dev before it edits code — only approve plans that
   include co-located tests and respect the program_id/branch_id tenant filter.
5. When a task is done, YOU review the diff (clean-code + clean-architecture rules,
   response envelope, tenancy) before marking it complete.
6. Wait for teammates to finish their tasks before you synthesize; don't code yourself.
```

Replace `<FEATURE / MODULE NAME>` with the actual work (e.g. "the catalog module: Book
entity, CRUD controller/service, DTOs, and migration").

## Driving the team

- **Agent panel** (below the prompt): ↑/↓ select a teammate, **Enter** open its
  transcript and message it directly, **Esc** interrupt its turn, **x** stop it,
  **Ctrl+T** toggle the task list.
- **Split panes** (tmux): click into a pane to talk to that teammate directly.
- Talk to one by name: `Tell dev to also add an index on (program_id, barcode).`
- Message qa: `Ask qa to run the E2E suite against dev's checkout endpoint.`
- Shut one down: `Ask the qa teammate to shut down.`

## Notes / gotchas

- **Effort:** teammates inherit the lead's effort level. The agent files set
  `effort: high`, but if a run comes up at the lead's effort instead, add
  "use high effort" to the spawn prompt.
- **Skills for teammates:** the `skills` frontmatter field is ignored for teammates.
  That's why the agents get the `Skill` tool and are told in their body to invoke
  `/nestjs-expert` — the skill is loaded from project/user settings at runtime.
- **Chrome:** the tester uses Chrome DevTools MCP. Start the API first
  (`npm run start:dev`, Swagger at `http://localhost:3000/api/docs`) so it has
  something to drive.
- **Permissions:** teammate permission prompts bubble up to the lead — approve them
  in your main session. Common ops are pre-approved in `settings.local.json`.
- **Resume:** `/resume` does not restore in-process teammates; if the lead messages a
  missing teammate, tell it to spawn fresh ones.
- **Orphaned panes:** if a pane lingers after exit, `tmux ls` then
  `tmux kill-session -t <name>`.
