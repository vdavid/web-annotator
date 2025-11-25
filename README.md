# WebAnnotator

A social layer for the web that lets you rate articles and read community reviews directly in your browser.

## Overview

Annotator is a Chrome extension that acts like an IMDb for journalism. It allows users to rate articles (1-10 stars), write summaries or reviews, and instantly see the community consensus via a browser badge.

Unlike generic commenting systems, Annotator is strictly focused on **articles**. It uses a smart heuristic to detect if a page is a news article or blog post, disabling itself on search engines, homepages, and web apps to maintain high-quality data. It creates a unified "canonical" URL for every page, ensuring that nytimes.com/article?utm_source=twitter and nytimes.com/article share the same rating history.

## Phase 1 Setup

### Prerequisites

- **Go 1.25+** installed
- **Node.js 20+** and **pnpm** installed
- **Docker** and **Docker Compose** installed
- A Chromium-based browser (Chrome, Brave, Edge)

### Backend Setup

1. Start the PostgreSQL database (from project root):
   ```bash
   docker compose up -d
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install Go dependencies:
   ```bash
   go mod download
   ```

4. Run the server:
   ```bash
   go run cmd/server/main.go
   ```

   Or use Air for live reload (install with `go install github.com/air-verse/air@latest`):
   ```bash
   air
   ```

5. The API will be available at `http://localhost:8080`. Test it:
   ```bash
   curl http://localhost:8080/ping
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   pnpm build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **Developer mode** in the top right
   - Click **Load unpacked** and select the `frontend/dist` folder
   - The Web Annotator icon should appear in your toolbar

5. For development with hot reload:
   ```bash
   pnpm dev
   ```

## Contributing

Contributions are welcome!

See CONTRIBUTING.md for details.

Report issues and feature requests in the [issue tracker](https://www.google.com/search?q=https://github.com/vdavid/annotator/issues).

Happy rating!

David
