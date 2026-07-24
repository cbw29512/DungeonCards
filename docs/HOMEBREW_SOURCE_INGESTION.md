# DM Forge Homebrew Source Ingestion

DM Forge can import public homebrew references, but it does not run an unrestricted web crawler.

## Why the importer is controlled

A broad scraper would mix together open material, copyrighted pages, paid products, creator-only downloads, and content whose terms prohibit automated collection. That would make the library unreliable and create avoidable licensing problems.

The importer therefore uses a **manifest-only** model:

1. A maintainer or creator adds one exact HTTPS source URL.
2. The entry must declare attribution and an accepted reuse basis.
3. `robots.txt` must permit the request.
4. No login, subscription, paywall, anti-bot bypass, or hidden API is used.
5. The importer saves a limited attributed excerpt rather than mirroring an entire site.
6. The generated record keeps the original URL, author, license, and permission evidence.

## Accepted reuse bases

- `CC-BY-4.0`
- `CC-BY-SA-4.0`
- `OGL-1.0a`
- `ORC`
- `PUBLIC-DOMAIN`
- `CREATOR-PERMISSION` with a public `permissionUrl`

A page being publicly readable does **not** mean it may be copied. Sources without a clear reuse basis are rejected.

## Usage

Copy `config/homebrew-sources.example.json` to `config/homebrew-sources.json`, replace the examples with approved sources, then run:

```bash
npm run ingest:homebrew
```

Validate without writing output:

```bash
npm run ingest:homebrew -- --dry-run
```

Use alternate paths:

```bash
node scripts/homebrew/ingest-approved-sources.mjs path/to/sources.json path/to/output.json
```

The default output is `public/dm-forge/homebrew-index.json`.

## What this first version does

- validates source metadata and licensing;
- enforces HTTPS and rejects credential-bearing URLs;
- checks `robots.txt`;
- rate-limits requests by host;
- caps response size;
- accepts HTML, plain text, or JSON;
- strips scripts and styles from HTML;
- produces source-attributed records for later review and card conversion.

## What it deliberately does not do

- crawl links automatically;
- scrape D&D Beyond, DMs Guild, Patreon, DriveThruRPG, or another paid/login service;
- copy official setting material outside an applicable license;
- infer that a creator grants permission merely because a page is public;
- convert unreviewed prose directly into rules-executable cards;
- publish imported content automatically.

Every imported record still needs human review for game accuracy, edition compatibility, attribution, safety, and card layout before it enters the public catalog.
