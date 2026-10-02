# ManifestLint

A tiny, dependency-free Node.js CLI for validating movie JSON manifests before they reach a streaming or catalog application.

ManifestLint is designed around the data shape used by Venom4K-style movie catalogs. It catches missing required fields, malformed stream URLs, unsupported resolutions, invalid years, duplicate IDs, and common metadata gaps.

## Features

- Zero runtime dependencies
- Node.js 20+
- Accepts a JSON array or `{ "movies": [] }`
- Validates IDs, titles, stream URLs, resolutions, and years
- Detects duplicate IDs
- Reports optional metadata as warnings
- Optional strict mode for CI validation
- Human-readable or machine-readable JSON output
- Non-zero exit codes for CI pipelines

## Usage

Run directly:

```bash
node src/cli.js catalog.json
```

Or pipe JSON:

```bash
cat catalog.json | node src/cli.js
```

Machine-readable output:

```bash
node src/cli.js --json catalog.json
```

Strict validation, where warnings also fail validation:

```bash
node src/cli.js --strict catalog.json
```

Example:

```json
[
  {
    "id": 98,
    "title": "Gladiator",
    "year": 2000,
    "resolution": "1080p",
    "streamUrl": "https://example.com/gladiator.m3u8"
  }
]
```

Exit codes:

| Code | Meaning |
| --- | --- |
| 0 | Manifest is valid |
| 1 | Manifest contains validation errors |
| 2 | Input or CLI error |

## Validation

Required: `id`, `title`, and an HTTP/HTTPS `streamUrl`.

Optional fields are checked when present:
- `resolution`: 480p, 720p, 1080p, 2160p, or 4K
- `year`: integer from 1888 to 3000
- `posterUrl`: HTTP or HTTPS

Missing descriptions and invalid optional poster URLs are reported as warnings. Use `--strict` when those warnings should fail a CI check.

## Test

```bash
npm test
```

The utility has no database, framework, network calls, or external packages, so validation remains deterministic and CI-friendly.

Built as a practical utility for the Venom4K developer workflow.
