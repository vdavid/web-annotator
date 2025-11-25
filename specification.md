# Project specification: WebAnnotator MVP (ratings & comments)

## 1. Project overview

Concept: A Chrome Extension that acts as a "social layer" for the web. It allows users to rate articles (1–10 stars) and leave summaries/reviews.

MVP goal: A stable, end-to-end system where a user can open the extension on a news article, see if it has been rated, and submit their own rating/comment.

Target scale: ~1,000 concurrent users (initial).

Key constraint: Quality over quantity. We only want to enable ratings on actual articles, not homepages or random web apps.

## 2. Tech stack & tools

**Frontend (Chrome extension)**

* **State management:**
    * [`@tanstack/react-query`](https://tanstack.com/query) (React Query): For server state (caching, invalidating, and refetching all data from our Go API).

**Backend (API)**

* **Encryption:** Standard `crypto/aes` and `crypto/cipher`
    * For encrypting/decrypting user credentials in the DB using AES-GCM.
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

* **Auth:** Mocked for MVP (Single hardcoded user).

## 3. Architecture & data flow

1. **Browser navigation:** User visits a page.
2. **Heuristic check (Frontend):** Extension checks if the page is an "Article".
3. **Badge update:** Service Worker calls API (`GET /check`) to get rating counts; updates the extension icon badge.
4. **User action:** User clicks the extension icon (Popup).
5. **Data fetch:** Popup requests existing rating for the current URL.
6. **Submission:** User submits data; Backend normalizes the URL and saves to `Postgres`.

## 4. Developer milestones (task list)

### Phase 1: The skeleton (Days 1-2)

* [x] **Setup Repo:** Initialize monorepo (or separate folders) for /extension and /backend.
* [x] **Backend Hello World:** Set up `Go` + `Chi` + `Air`. Create a `GET /ping` endpoint.
* [x] **Frontend Hello World:** Set up `Vite` + `React` + `CRXJS`. Ensure the Popup opens in Chrome.
* [x] **Database:** Spin up `Postgres` in `Docker`. Connect `Go` to it.

### Phase 2: Core logic (Days 3-4)

* [x] **URL Normalizer:** Write the `Go` function (with unit tests!) for the normalization rules.
* [x] **Article Detector:** Write the `TypeScript` utility to check meta tags/schema.
* [x] **Mock Auth:** Implement the `X-User-ID` middleware in `Go`.
* [x] **DB Migrations:** Create the `SQL` tables.

### Phase 3: The feature (Days 5-6)

**Goal:** Turn the empty "Hello World" extension into a functional application that can read and write data to the database.

Overview:

* [x] **API Implementation:** Build the `GET /check` and `POST /rating` handlers.
* [x] **UI Implementation:** Build the Rating component (Stars + Textarea) in `React` using `Tailwind`.
* [x] **Wiring:** Connect the `React` form to the `Go` API. Handle "Loading" and "Error" states.

### Phase 4: The polish (Day 7)

* [ ] **Service Worker:** Implement the background script to fetch rating counts and update the extension badge text.
* [ ] **Dark Mode:** Ensure the Popup looks good in dark mode.
* [ ] **Cleanup:** Remove console logs, format code (`prettier`/`gofmt`).

---

## 8. Definition of done

1. I can navigate to a news article.
2. The extension badge shows if others have rated it.
3. I can open the popup, click 8 stars, write "Good", and save.
4. If I refresh the page and open the popup again, I see my 8 stars and "Good" pre-filled.
5. If I go to localhost, the extension tells me I cannot rate this page.