# Project specification: Web Annotator MVP (Ratings & Comments)

## 1. Project overview

Concept: A Chrome Extension that acts as a "social layer" for the web. It allows users to rate articles (1-10 stars) and leave summaries/reviews.

MVP goal: A stable, end-to-end system where a user can open the extension on a news article, see if it has been rated, and submit their own rating/comment.

Target scale: ~1,000 concurrent users (initial).

Key constraint: Quality over quantity. We only want to enable ratings on actual articles, not homepages or random web apps.

## 2. Tech stack & tools

**Frontend (Chrome extension)**

* **Language:** `TypeScript`
* **Framework:** React 19+, with functional components and hooks.
* **Package manager:** pnpm.
* **Build Tool:** [`Vite`](https://vitejs.dev/) with [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react)
    * Fast build tool and dev server. Provides HMR (Hot Module Replacement) for rapid development.
    * The React plugin enables JSX/TSX transformation and React Fast Refresh.
* **Extension Glue:** [`CRXJS`](https://github.com/crxjs/chrome-extension-tools) (Crucial for Hot Module Replacement)
* **Styling:** [`Tailwind CSS 4`](https://tailwindcss.com/) with [`@tailwindcss/vite`](https://tailwindcss.com/docs/installation/vite)
    * Utility-first CSS framework. The Vite plugin enables seamless integration with the build process.
* **Routing:** [`react-router-dom`](https://reactrouter.com/) (for URL-based navigation, e.g., `/inbox`, `/thread/id`).
* **State management:**
    * [`@tanstack/react-query`](https://tanstack.com/query) (React Query): For server state (caching, invalidating, and refetching all data from our Go API).
* **Linting/Formatting:**
    * [`ESLint`](https://eslint.org/): Code linting with TypeScript support via [`@typescript-eslint/eslint-plugin`](https://typescript-eslint.io/) and [`@typescript-eslint/parser`](https://typescript-eslint.io/).
    * [`eslint-plugin-react`](https://github.com/jsx-eslint/eslint-plugin-react), [`eslint-plugin-react-hooks`](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks), and related plugins for React-specific rules.
    * [`eslint-plugin-import`](https://github.com/import-js/eslint-plugin-import): For import/export validation.
    * [`Prettier`](https://prettier.io/): Code formatting with ESLint integration via [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) and [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier).
* **Testing:**
    * [`Vitest`](https://vitest.dev/): Fast unit and integration test runner, compatible with Jest APIs.
    * [`@testing-library/react`](https://testing-library.com/react): For testing React components.
    * [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom): Custom Jest/Vitest matchers for DOM assertions.
    * [`@testing-library/user-event`](https://testing-library.com/docs/user-event/intro): For simulating user interactions.
    * [`msw`](https://mswjs.io/) (Mock Service Worker): For API mocking in tests.
    * [`@playwright/test`](https://playwright.dev/): For end-to-end tests.

**Backend (API)**

* **Language:** `Go`
* **Database Migrations:** [`golang-migrate`](https://github.com/golang-migrate/migrate)
    * SQL migration tool for managing Postgres schema changes.
    * Migrations are stored in `backend/migrations/`.
* **Database:** `PostgreSQL`
* **Configuration:** [`github.com/joho/godotenv`](https://github.com/joho/godotenv)
    * For loading environment variables from `.env` files in development mode.
    * Automatically loads `.env` when `VMAIL_ENV` is set to "development".
* **HTTP Router:** Standard library [`http.ServeMux`](https://pkg.go.dev/net/http#ServeMux)
    * Battle-tested and well-documented. No external router dependency needed.
    * Selected based on [this guide](https://www.alexedwards.net/blog/which-go-router-should-i-use)
* **Encryption:** Standard `crypto/aes` and `crypto/cipher`
    * For encrypting/decrypting user credentials in the DB using AES-GCM.
* **Database Driver:** `pgx`
* **Go Live Reload (dev-only):** [`air`](https://github.com/air-verse/air)
    * Live reload tool for Go applications during development.
    * Automatically rebuilds and restarts the server when Go files change.
    * Configured via `.air.toml` in the project root.
    * **Note:** This is a development-only tool and is not used in production.
* **CI/CD:** [`GitHub Actions`](https://github.com/features/actions)
    * Automated testing, linting, and formatting checks on pull requests and pushes.
* **Code Quality (Go):**
    * [`gofmt`](https://pkg.go.dev/cmd/gofmt) (standard library): Code formatting.
    * [`govulncheck`](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck): Security vulnerability scanning.
    * [`go vet`](https://pkg.go.dev/cmd/vet) (standard library): Static analysis.
    * [`staticcheck`](https://staticcheck.io/): Advanced static analysis with additional checks.
    * [`ineffassign`](https://github.com/gordonklaus/ineffassign): Detects ineffective assignments.
    * [`misspell`](https://github.com/client9/misspell): Spell checking in code and comments.
    * [`gocyclo`](https://github.com/fzipp/gocyclo): Cyclomatic complexity checking (warns on functions > 15).
    * [`nilaway`](https://github.com/uber-go/nilaway): Nil pointer analysis.
* **Testing:**
    * [`github.com/stretchr/testify`](https://github.com/stretchr/testify): For assertions and test suites.
        * Provides `assert` and `require` packages for cleaner test assertions.
        * Widely adopted in the Go community and well-maintained.
    * [`github.com/vektra/mockery`](https://github.com/vektra/mockery): For generating mocks from interfaces.
        * Automatically generates mock implementations from Go interfaces, reducing boilerplate.
        * Mocks are generated in `backend/internal/testutil/mocks` and use testify's mock package.
        * See [this guide](https://gist.github.com/maratori/8772fe158ff705ca543a0620863977c2) for rationale on choosing mockery.
    * [`github.com/testcontainers/testcontainers-go`](https://github.com/testcontainers/testcontainers-go): For integration tests with real Postgres containers.

**Infrastructure**

* **Containerization:** [`Docker`](https://www.docker.com/) and [`Docker Compose`](https://docs.docker.com/compose/)
    * Used for deployment only.
    * Multi-stage Dockerfile builds both frontend and backend.
* **Auth:** Mocked for MVP (Single hardcoded user).

## 3. Architecture & data flow

1. **Browser navigation:** User visits a page.
2. **Heuristic check (Frontend):** Extension checks if the page is an "Article".
3. **Badge update:** Service Worker calls API (`GET /check`) to get rating counts; updates the extension icon badge.
4. **User action:** User clicks the extension icon (Popup).
5. **Data fetch:** Popup requests existing rating for the current URL.
6. **Submission:** User submits data; Backend normalizes the URL and saves to `Postgres`.

## 4. Specific implementation details

### A. Frontend: "Article detection" (The Filter)

Goal: Prevent spamming ratings on google.com or localhost.

Logic: Before allowing a rating, the frontend must validate the page.

The Heuristic (Implement in `TypeScript`):

Return true (allow rating) if ANY of these are true:

1. **Meta tag:** Page has &lt;meta property="og:type" content="article" />.
2. **Schema.org:** Page contains `JSON-LD` with "@type": "Article" or "NewsArticle".
3. **URL structure:** The path depth is > 2 (e.g., nytimes.com/2025/10/my-post).

*Note:* If the page fails this check, show a UI message: "Ratings are only available for articles."

### B. Backend: URL normalization (The Critical Logic)

Goal: nytimes.com/art?utm_source=twitter and nytimes.com/art must be treated as the same page.

Location: Implement this in `Go` before touching the database.

**Ruleset:**

1. **Lowercase:** Convert the entire string to lowercase.
2. **Scheme:** Force `https` (unless strictly necessary otherwise).
3. **Host:** Remove `www.` prefix.
4. **Path:** Remove trailing slashes (/article/ -> /article).
5. **Fragment:** Remove anchors (#comments).
6. **Query params:**
    * **Remove** these specific keys: `utm_*`, `gclid`, `fbclid`, `ref`, `source`, `share`.
    * **Keep** other parameters (e.g., ?id=123).
    * **Sort** remaining parameters alphabetically so ?a=1&b=2 equals ?b=2&a=1.

### C. Authentication (Mocked)

Do not build a login system yet.

* **Frontend:** Send a header in every request: `X-User-ID`: &lt;HARDCODED-UUID-HERE>.
* **Backend:** Write a Middleware that reads this header and injects it into the request Context. This makes swapping to real `Auth0` later easy.

---

## 5. Database schema (`PostgreSQL`)

```sql
CREATE TABLE users (
id UUID PRIMARY KEY,
username VARCHAR(255) NOT NULL -- Just use "Test User" for now
);

CREATE TABLE pages (
id BIGSERIAL PRIMARY KEY,
url_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA256 of the normalized URL
normalized_url TEXT NOT NULL,         -- Human readable version
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ratings (
id BIGSERIAL PRIMARY KEY,
user_id UUID REFERENCES users(id),
page_id BIGINT REFERENCES pages(id),
score INT CHECK (score >= 1 AND score <= 10),
comment TEXT,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
UNIQUE(user_id, page_id) -- Constraint: One rating per user per page
);
```

---

## 6. API contract

### 1. Check page metadata

Endpoint: `GET /api/v1/pages/check`

Query param: `url` (Raw URL from browser)

Response:

```json
{
"can_rate": true, // Result of server-side validation if any
"stats": {
"total_ratings": 15,
"average_score": 8.4
},
"user_rating": {
"has_rated": true,
"score": 9,
"comment": "My review text..."
}
}
```

### 2. Submit rating

Endpoint: `POST /api/v1/ratings`

Headers: `X-User-ID`: ...

Body:

```json
{
"url": "https://raw-url-from-browser...",
"score": 8,
"comment": "Optional text"
}
```

---

## 7. Developer milestones (Task List)

### Phase 1: The skeleton (Days 1-2)

* [ ] **Setup Repo:** Initialize monorepo (or separate folders) for /extension and /backend.
* [ ] **Backend Hello World:** Set up `Go` + `Chi` + `Air`. Create a `GET /ping` endpoint.
* [ ] **Frontend Hello World:** Set up `Vite` + `React` + `CRXJS`. Ensure the Popup opens in Chrome.
* [ ] **Database:** Spin up `Postgres` in `Docker`. Connect `Go` to it.

### Phase 2: Core logic (Days 3-4)

* [ ] **URL Normalizer:** Write the `Go` function (with unit tests!) for the normalization rules.
* [ ] **Article Detector:** Write the `TypeScript` utility to check meta tags/schema.
* [ ] **Mock Auth:** Implement the `X-User-ID` middleware in `Go`.
* [ ] **DB Migrations:** Create the `SQL` tables.

### Phase 3: The feature (Days 5-6)

* [ ] **API Implementation:** Build the `GET /check` and `POST /rating` handlers.
* [ ] **UI Implementation:** Build the Rating component (Stars + Textarea) in `React` using `Tailwind`.
* [ ] **Wiring:** Connect the `React` form to the `Go` API. Handle "Loading" and "Error" states.

### Phase 4: The polish (Day 7)

* [ ] **Service Worker:** Implement the background script to fetch rating counts and update the Extension Badge text.
* [ ] **Dark Mode:** Ensure the Popup looks good in dark mode.
* [ ] **Cleanup:** Remove console logs, format code (`Prettier`/`GoFmt`).

---

## 8. Definition of done

1. I can navigate to a news article.
2. The extension badge shows if others have rated it.
3. I can open the popup, click 8 stars, write "Good", and save.
4. If I refresh the page and open the popup again, I see my 8 stars and "Good" pre-filled.
5. If I go to localhost, the extension tells me I cannot rate this page.