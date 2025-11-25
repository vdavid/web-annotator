# Project overview

WebAnnotator is a Chrome extension that lets you augment articles with ratings and reviews/summaries,
plus a back-end server.

## Tech stack

WebAnnotator uses Go 1.25, Postgres 18, React 19, Vite, and CRXJS.

## Dev process

Always follow this process when developing in this project:

1. Before developing a feature, plan, know exactly what you want to achieve, and have a task list.
2. Do the changes in small iterations. Adhere to the [style guide](docs/style-guide.md)!
3. Use `go fmt`, `go vet`, `go test`, `pnpm format`, `pnpm lint`, and `pnpm test` to check that everything is up to standards.
4. Add tests for new code. Think about unit and integration tests.
5. If you added new patterns, external deps, or made architectural changes, update the related docs.
   Even consider updating `AGENTS.md` (incl. this very process) to keep the next agent's work streamlined.
6. Before you call it done, reflect on the diff of your changes and make sure all changes are actually needed.
   Revert unneeded changes. Simplify.
7. Suggest a commit message, in the format seen in the style guide.

Always keep the dev process and style guide in mind.

## High-level map

- Frontend entry: `frontend/src/main.tsx`. State: Zustand.
- Backend entry: `backend/cmd/server`.
- Architecture: Handlers (`api/`) -> Service/core logic (`internal/`) -> DB (`db/`).
- Testing: Vitest, Go `testing` package, `testify` for assertions and mocking support, `mockery` for generating mocks.

## "Red line" rules (do not break)
- Modular architecture, no global state, no package cycles.
- Always make the checks happy, including warnings.
- Sentence case titles and labels!

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
