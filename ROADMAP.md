# Product roadmap

Random stuff that might be remaining:

* [ ] Frontend: State management: [`@tanstack/react-query`](https://tanstack.com/query) (React Query): For server state (caching, invalidating, and refetching all data from our Go API).
* [ ] Backend: Encryption: Use standard `crypto/aes` and `crypto/cipher` for encrypting/decrypting user credentials in the DB using AES-GCM.
* [ ] Ensure Go code quality with ALL of these tools:
    * [`gofmt`](https://pkg.go.dev/cmd/gofmt) (standard library): Code formatting.
    * [`govulncheck`](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck): Security vulnerability scanning.
    * [`go vet`](https://pkg.go.dev/cmd/vet) (standard library): Static analysis.
    * [`staticcheck`](https://staticcheck.io/): Advanced static analysis with additional checks.
    * [`ineffassign`](https://github.com/gordonklaus/ineffassign): Detects ineffective assignments.
    * [`misspell`](https://github.com/client9/misspell): Spell checking in code and comments.
    * [`gocyclo`](https://github.com/fzipp/gocyclo): Cyclomatic complexity checking (warns on functions > 15).
    * [`nilaway`](https://github.com/uber-go/nilaway): Nil pointer analysis.
* [ ] Ensure Go testedness with ALL of these tools (if needed):
    * [`github.com/stretchr/testify`](https://github.com/stretchr/testify): For assertions and test suites.
        * Provides `assert` and `require` packages for cleaner test assertions.
        * Widely adopted in the Go community and well-maintained.
    * [`github.com/vektra/mockery`](https://github.com/vektra/mockery): For generating mocks from interfaces.
        * Automatically generates mock implementations from Go interfaces, reducing boilerplate.
        * Mocks are generated in `backend/internal/testutil/mocks` and use testify's mock package.
        * See [this guide](https://gist.github.com/maratori/8772fe158ff705ca543a0620863977c2) for rationale on choosing mockery.
    * [`github.com/testcontainers/testcontainers-go`](https://github.com/testcontainers/testcontainers-go): For integration tests with real Postgres containers.

Definitely needed:

* [ ] Auth: Currently mocked for MVP (Single hardcoded user). Use Authelia.
* [ ] Create a code QA tool that can be used locally and in CI.
* [ ] CI/CD: Set up [`GitHub Actions`](https://github.com/features/actions) for automated testing, linting, and formatting checks on pull requests and pushes.]

Ideas:
* A user front end to let users see their content, search it, and export it to Obsidian/Notion. Stats are cool, too.
* An admin front end to see stats, track system health, and moderate content
* Improve article recognition
* Improve testing: a runnable interface for the extension for better in-browser testing?
* Add content guidelines to avoid trolling
* Add automated trolling detection
* Add review/summary quality metrics and adjust the average score based on them
* Add char counter and char limit (soft+hard)
* Improve the UI: make the design cleaner, add animations, help text, a little friendly guidance
* Set up goals for when this can go to production
* Add a way to see other people's content, and a content privacy setting