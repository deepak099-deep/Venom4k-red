# Miroir

A dependency-free Node.js CLI for taking lightweight directory snapshots and comparing them later.

Miroir is useful for checking what changed in a small project, build output, generated asset folder, or deployment directory without creating a full archive or requiring a file-watching service.

## Requirements

- Node.js 20+

## Usage

Create a snapshot:

    node src/cli.js snapshot ./my-project snapshot.json

Compare two snapshots:

    node src/cli.js diff before.json after.json

Get machine-readable diff output:

    node src/cli.js diff before.json after.json --json

The diff command exits with `0` when nothing changed, `1` when files were added, removed, or changed, and `2` for command/input errors. This makes Miroir suitable for simple CI checks.

## Snapshot format

Each snapshot records relative file paths, byte sizes, and modification timestamps. `.git` and `node_modules` are ignored automatically.

Miroir intentionally does not hash file contents. It is designed as a fast lightweight change detector rather than a cryptographic integrity tool.

## Test

    npm test

## License

MIT
