# StreamCheck

> A tiny, dependency-free CLI for finding broken, redirected, slow, or unexpected media URLs.

StreamCheck is a small developer tool for checking remote media and file URLs directly from the terminal.

It solves a simple problem: URL lists become unreliable over time. A link can expire, redirect somewhere unexpected, return HTML instead of media, become unreachable, or simply become painfully slow.

**Check the URL. See what happened. Move on.**

## ✦ Features

| Feature | Description |
| --- | --- |
| HTTP status | See whether the server responds successfully |
| Content type | Detect what the server says it is returning |
| Latency | Measure request time in milliseconds |
| Redirects | Detect redirects and show the final URL |
| HEAD first | Avoid unnecessary downloads |
| GET fallback | Uses a one-byte range when HEAD is rejected |
| Batch mode | Check multiple URLs in one command |
| File mode | Load URLs from a text file |
| JSON mode | Integrate with scripts and automation |
| Timeout control | Configure request timeout |
| Exit codes | Works cleanly in CI and shell scripts |
| Zero dependencies | Uses modern Node.js APIs only |

## Preview

    $ node src/cli.js https://example.com/video.mp4

    RESULT  STATUS  MS   CONTENT-TYPE  REDIRECT  URL
    ------  ------  ---  ------------  --------  -------------------------------
    OK      200     184  video/mp4     no        https://example.com/video.mp4

## Why?

Media libraries, download lists, self-hosted projects, API fixtures, and automation scripts often contain remote URLs that silently become invalid.

Instead of opening every URL manually:

    streamcheck --file urls.txt

No database. No account. No dashboard. No telemetry. No hosted service.

## Requirements

- Node.js 20 or newer
- Internet access for the URLs being checked

## Installation

Clone the repository:

    git clone https://github.com/deepak099-deep/Venom4k-red.git
    cd Venom4k-red/tools/streamcheck

Run directly:

    node src/cli.js https://example.com/video.mp4

Or install locally:

    npm install
    npm link

Then:

    streamcheck https://example.com/video.mp4

## Usage

### One URL

    streamcheck https://example.com/video.mp4

### Multiple URLs

    streamcheck https://example.com/movie.mp4 https://example.com/trailer.mp4

### URL file

Create `urls.txt` with one URL per line:

    https://example.com/movie-1.mp4
    https://example.com/movie-2.mp4
    # comments are ignored

Then:

    streamcheck --file urls.txt

### JSON

    streamcheck --json https://example.com/video.mp4

Example:

    {
      "url": "https://example.com/video.mp4",
      "ok": true,
      "status": 200,
      "contentType": "video/mp4",
      "latencyMs": 184,
      "finalUrl": "https://example.com/video.mp4",
      "redirected": false,
      "error": null
    }

### Custom timeout

Default: 8000 ms

    streamcheck --timeout 15000 https://example.com/video.mp4

### Help

    streamcheck --help

## Exit codes

| Code | Meaning |
| ---: | --- |
| 0 | Every checked URL returned a successful HTTP status |
| 1 | At least one URL failed |
| 2 | Invalid command usage or CLI error |

## How it works

StreamCheck deliberately avoids downloading an entire media file.

    URL
     │
     ├─ Validate URL
     ├─ HEAD request
     │    ├─ success ────────┐
     │    └─ rejected ──► ranged GET
     │                       │
     └───────────────────────┤
                             ▼
                      Inspect response
                             │
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
               status     headers     latency
                             │
                             ▼
                        final URL

Redirects are followed automatically. If a server rejects `HEAD`, StreamCheck falls back to a ranged `GET` rather than downloading the complete resource.

## Project structure

    tools/streamcheck/
    ├── src/
    │   ├── check.js       # URL checking logic
    │   └── cli.js         # command-line interface
    ├── test/
    │   └── check.test.js  # automated tests
    ├── package.json
    ├── LICENSE
    └── README.md

The checker is separated from the CLI so it can also be imported:

    import { checkUrl } from './src/check.js';
    const result = await checkUrl('https://example.com/video.mp4');

## Testing

    npm test

The project uses Node.js' built-in test runner, keeping development dependency-free. GitHub Actions runs the tests whenever StreamCheck changes.

## Design principles

**Small.** StreamCheck is a focused utility, not a media-management platform.

**Dependency-free.** Modern Node.js APIs handle the job without a framework.

**Scriptable.** JSON output and predictable exit codes make automation straightforward.

**Lightweight.** The checker does not intentionally download complete media resources merely to determine whether a URL responds.

## Roadmap

- [ ] Concurrent batch limits
- [ ] CSV output
- [ ] Response-header inspection
- [ ] Expected content-type validation
- [ ] Retry policies
- [ ] Summary statistics
- [ ] Progress display for large URL lists
- [ ] Config file support
- [ ] npm package publishing
- [ ] GitHub Action for repository URL audits

The roadmap is intentionally open-ended. New features should preserve the lightweight philosophy.

## Contributing

Contributions are welcome.

1. Keep the project dependency-free unless there is a strong reason otherwise.
2. Keep CLI behavior predictable.
3. Add or update tests for behavior changes.
4. Update the README for user-facing changes.
5. Keep unrelated changes out of the same pull request.

For larger changes, opening an issue first is recommended.

## Security

StreamCheck accepts URLs supplied by the user and makes network requests to them. Do not use it with untrusted URL lists where outbound network access must be restricted.

For security issues, avoid publishing sensitive exploit details in a public issue. Contact the maintainer privately through GitHub.

## License

MIT License. See [tools/streamcheck/LICENSE](tools/streamcheck/LICENSE).

## Project

Built as an independent open-source developer utility by **Deepak Dhakar**.

GitHub: [@deepak099-deep](https://github.com/deepak099-deep)

If StreamCheck is useful, consider starring the repository or opening an issue with an improvement.

---

<p align="center">Built small. Built useful. Built in the open.</p>
