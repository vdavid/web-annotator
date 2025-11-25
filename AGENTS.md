# Project overview

WebAnnotator is a social layer for the web that lets you rate articles and read community reviews
directly in your browser. It's a Chrome extension plus a back-end server.

## Tech stack

Annotator uses a **Postgres** database, a **Go** (Standard Library + Chi) back end, and a **React 19** front end built with **Vite** and **CRXJS**.

## Dev process

Always follow this process when developing in this project:

1. Before developing a feature, make sure to do the planning and know exactly what you want to achieve and have a task list.
2. Before touching code of a specific domain, read the related docs within `/docs` or similar.
   List folders if you need to. Example: `docs/backend/auth.md` for auth logic, `backend/migrations/*.sql` for DB schema.
3. Do the changes, in small iterations. Adhere to the [style guide](docs/style-guide.md)!
4. Use `./scripts/check.sh` to check that everything is still working. (THIS IS NOT READY YET! Just run prettier, lint, gofmt, etc.)
    - Or use a subset, for example, if you only touch the front end.
    - Even fix gocyclo's cyclomatic complexity warnings! I know it's a pain, but it's helpful to keep Go funcs simple.
5. Make sure to add tests for the new code. Think about unit tests, integration tests, and end-to-end tests.
6. Check if you added new patterns, external dependencies, or architectural changes. Update all related docs.
7. Also consider updating `AGENTS.md` (incl. this very process) to keep the next agent's work streamlined.
8. Before you call it done, see the diff of your changes (`git diff`) and make sure all changes are actually
   needed. Revert unneeded changes.
9. Rerun `./scripts/check.sh` to make sure everything still works.  (THIS IS NOT READY YET! Just run prettier, lint, gofmt, etc.)
10. Suggest a commit message, in the format seen in the style guide.

Always keep the dev process and style guide in mind.

## High-level map

(These are not all used yet! This section is future-looking.)

- **Frontend**: React 19 + Vite. Entry: `frontend/src/main.tsx`. State: Zustand.
- **Backend**: Go 1.25 (Standard lib HTTP). Entry: `backend/cmd/server`.
- **Architecture**: Handlers (`api/`) -> Service/core logic (`internal/`) -> DB (`db/`).
- **Testing**: Playwright (E2E), Vitest (unit), Go `testing` package, `testify` for assertions and mocking support,
`mockery` for generating mocks.

## "Red line" rules (do not break)
- Always make check.sh happy, including warnings and gocyclo complexity!
- Modular architecture, no global state, no package cycles.
- Sentence case titles and labels
- If you add a new tool, script, or architectural pattern, you MUST update this file (`AGENTS.md`) and any relevant docs
  before finishing your response.

## Style guide highlights

### General
- **Commits**: First line max 50 chars. Blank line. Detailed description, usually as concise bullets.
- **Writing**: Friendly, active voice, and ALWAYS sentence case titles and labels!
- **Complexity**: Max cyclomatic complexity of 15 per function. (checked by gocyclo)

### Frontend (TypeScript/React)
- **No classes**: Use modules and functional components only.
- **Strict types**: `no-explicit-any` is enforced.
- **Imports**: Organized by groups (builtin, external, internal, parent, sibling, index).
- **Formatting**: Prettier is the authority.
- **React**: Hooks rules enforced, no dangerous HTML.

### Backend (Go)
- **Comments**: Meaningful comments for public functions/types.
- **DB**: Plural table names, singular columns. Add comments in SQL and Go structs.
