# Contributing

Thanks for your interest in contributing to WebAnnotator! You're most welcome to do so.
The easiest way to contribute is to fork the repo, make your changes, and submit a PR.
This doc is here to help you get started.

## Development getting started

This setup lets you run the Go backend locally for debugging.
It's different from the prod guide in the [README](README.md), which uses Docker Compose for everything.

The project uses [mise](https://mise.jdx.dev) for tool version management.
It automatically installs and manages the correct versions of Go, Node, and pnpm.

1. `brew install mise` to install mise. See more alternatives [here](https://mise.jdx.dev/getting-started.html).
2. `mise install` (in project root) to install all required tool versions: Go, Node, and pnpm.
3. `brew install golang-migrate` to install `golang-migrate` separately.
    - Alternatively, via Go: `go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest`
4. `go install github.com/air-verse/air@latest` to install Air for live reload.
5. `docker run -d --name vmail-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=webannotator postgres:18-alpine` to start Postgres
    - Alternatively, bring your own Postgres.
6. `cp .env.example .env` in project root to create a `.env` file. Then edit it to match your local setup.
7. `migrate -path backend/migrations -database "$DATABASE_URL" up` to run migrations.
    - If you used individual variables in the main `.env`, use a command like
      `migrate -path backend/migrations -database "postgres://postgres:postgres@localhost:5432/webannotator?sslmode=disable" up`
8. `air` to run the backend.
    - Or without live reload: `go run backend/cmd/server/main.go`

### Frontend
1. `cp frontend/.env.example frontend/.env` to create frontend env file. Then edit this too.
2. `cd frontend && pnpm install` to install frontend deps
3. `pnpm build` to build the extension
4. Load the extension in Chrome:
    - Open Chrome and go to `chrome://extensions`
    - Enable **Developer mode** in the top right
    - Click **Load unpacked** and select the `web-annotator/frontend/dist` folder
    - The WebAnnotator icon should appear in your toolbar
5. `pnpm dev` for development with hot reload (TODO untested!)

### Auth (TODO later)

1. Set up [Authelia](https://www.authelia.com) locally or remotely.
2. Make sure you know its URL (e.g., `http://localhost:9091`).

## Tooling

- Backend: Use `go fmt`, `go vet`, and `go test`.
- Frontend: Use `pnpm format`, `pnpm lint`, and `pnpm test`.

## Keeping things up to date

For a step-by-step process on updating tools, dependencies, and Docker images, see [`docs/maintenance.md`](docs/maintenance.md). (TODO it doesn't exist yet!)

## Architecture

### Parts

The system consists of these main parts:

1. **The extension (client)** provides the popup UI.
2. **The content script** runs the "article detector" logic to detect article pages.
3. **The service worker** runs in the background to fetch rating counts on page load and update the browser badge icon.
4. **The backend** stored the data, coordinates login, and does URL normalization.

### Data flow

1. **Browser navigation:** User visits a page.
2. **Heuristic check (Frontend):** Extension checks if the page is an "Article".
3. **Badge update:** Service Worker calls API (`GET /check`) to get rating counts; updates the extension icon badge.
4. **User action:** User clicks the extension icon (Popup).
5. **Data fetch:** Popup requests existing rating for the current URL.
6. **Submission:** User submits data; Backend normalizes the URL and saves to `Postgres`.
