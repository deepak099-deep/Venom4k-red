# StreamCheck

A small, dependency-free Node.js CLI for checking media and file URLs from the terminal.

StreamCheck reports HTTP status, response content type, latency, redirects, and the final URL. It is useful when maintaining self-hosted media libraries, download lists, API fixtures, or any collection of remote URLs.

## Requirements

- Node.js 20+

## Usage

Run directly after cloning:

```bash
node src/cli.js https://example.com/video.mp4
```

Check multiple URLs:

```bash
node src/cli.js https://example.com/a.mp4 https://example.com/b.m3u8
```

Read URLs from a file:

```bash
node src/cli.js --file urls.txt
```

Get machine-readable JSON output:

```bash
node src/cli.js --json https://example.com/video.mp4
```

Export results as spreadsheet-friendly CSV:

```bash
node src/cli.js --csv https://example.com/video.mp4 https://example.com/trailer.mp4
```

CSV includes result, HTTP status, latency, content type, redirect state, URL, and any error message, making it convenient for audits or importing into spreadsheet tools.

Increase the timeout:

```bash
node src/cli.js --timeout 15000 https://example.com/video.mp4
```

The command exits with code `0` when every URL returns a successful HTTP status, `1` when at least one check fails, and `2` for invalid CLI usage.

## Why it exists

Media libraries often contain URLs that expire, redirect, return HTML instead of media, or become unavailable. StreamCheck provides a fast terminal-level sanity check without installing a large dependency tree.

## Design

The checker first attempts a `HEAD` request. If the server rejects HEAD, it falls back to a one-byte ranged GET. Redirects are followed automatically.

The library function is also importable:

```js
import { checkUrl } from "./src/check.js";

const result = await checkUrl("https://example.com/video.mp4");
console.log(result);
```

## License

MIT
