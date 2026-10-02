#!/usr/bin/env node

import fs from "node:fs";
import { validateManifest } from "./validate.js";

function usage() {
  console.log(`ManifestLint - validate a Venom4K-style movie JSON manifest

Usage:
  manifestlint <manifest.json>
  manifestlint --strict <manifest.json>
  cat manifest.json | manifestlint
  manifestlint --json <manifest.json>

Options:
  --strict  treat warnings as validation errors
  --json    print machine-readable JSON output

Exit codes:
  0  valid manifest
  1  validation failed
  2  input or CLI error
`);
}

function readInput(path) {
  if (path) return fs.readFileSync(path, "utf8");
  if (process.stdin.isTTY) throw new Error("No manifest provided. Pass a JSON file or pipe JSON through stdin.");
  return fs.readFileSync(0, "utf8");
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const jsonMode = args.includes("--json");
const strictMode = args.includes("--strict");
const paths = args.filter((arg) => arg !== "--json" && arg !== "--strict");

if (paths.length > 1) {
  console.error("Error: provide only one manifest file.");
  process.exit(2);
}

try {
  const input = JSON.parse(readInput(paths[0]));
  const result = validateManifest(input, { strict: strictMode });

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`${result.valid ? "✓" : "✗"} ${result.count ?? 0} movie(s) checked`);
    const resolutions = Object.entries(result.summary?.resolutions ?? {}).map(([key, value]) => `${key}: ${value}`).join(", ");
    const years = Object.entries(result.summary?.years ?? {}).sort(([a], [b]) => Number(a) - Number(b)).map(([key, value]) => `${key}: ${value}`).join(", ");
    if (resolutions) console.log(`  RESOLUTION ${resolutions}`);
    if (years) console.log(`  YEARS      ${years}`);
    for (const error of result.errors) console.log(`  ERROR   ${error}`);
    for (const warning of result.warnings) console.log(`  WARNING ${warning}`);
    if (result.valid && result.warnings.length === 0) console.log("  No issues found.");
  }

  process.exit(result.valid ? 0 : 1);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(2);
}
