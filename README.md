# WebAnnotator

WebAnnotator is a Chrome extension that lets you augment articles with ratings and reviews/summaries.

Same in marketing talk: WebAnnotator is a social layer for the web ✨ that lets you rate articles and read community
reviews directly in your browser.

WebAnnotator deals with **articles** only, not web pages in general.

## Running the back end

### Prerequisites

- **Docker** and **Docker Compose** installed
- A Chromium-based browser (Chrome, Brave, Edge)

### Steps

1. `git clone git@github.com:vdavid/web-annotator.git` to clone the repo
2. `cd web-annotator`
3. `docker compose up -d` to start all services (Postgres, migrations, and backend)
    - The backend will automatically:
        - Wait for Postgres to be ready
        - Run database migrations
        - Start the API server on port 52181
4. `curl http://localhost:52181/ping` to test the server is running

**Note:** The default configuration uses simple passwords suitable for local testing. For production deployments, update
the database credentials in `docker-compose.yml` and ensure proper security practices.

For local development, see [CONTRIBUTING.md](CONTRIBUTING.md) for a setup that doesn't use Docker.

## Features

* **Article detection:** Automatically detects valid articles using Open Graph tags (og:type), JSON-LD schema, and URL
  path depth analysis.
* **One-click ratings:** Rate any article on a scale of 1–10.
* **Instant context:** The extension icon updates immediately to show how many ratings a page has and the average
  rating.
* **Smart canonicalization:** Ratings persist even if you visit the link from a newsletter or social media wrapper.
* **Dark mode:** The UI respects your system's light/dark preference.

## Contributing

Contributions are welcome!

See CONTRIBUTING.md for details.

Report issues and feature requests in
the [issue tracker](https://www.google.com/search?q=https://github.com/vdavid/annotator/issues).

Happy rating!

David
