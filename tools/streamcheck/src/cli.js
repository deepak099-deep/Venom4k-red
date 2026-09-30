#!/usr/bin/env node

import fs from "node:fs/promises";
import process from "node:process";
import { checkUrl } from "./check.js";

function usage() {
  console.log(`
StreamCheck - inspect media URLs from the terminal

Usage:
  streamcheck <url> [url...]
  streamcheck --file urls.txt
  streamcheck --json <url> [url...]
  streamcheck --timeout 15000 <url>

Options:
  --file <path>       Read one URL per line
  --json              Print machine-readable JSON
  --timeout <ms>      Request timeout (default: 8000)
  --help              Show this help

Exit code is 0 when every URL returns a successful HTTP status.
`);
}

function parseArgs(args) {
  const urls = [];
  let file = null;
  let json = false;
  let timeout = 8000;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") return { help: true };
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--file") {
      file = args[++i];
      if (!file) throw new Error("--file requires a path");
      continue;
    }
    if (arg === "--timeout") {
      timeout = Number(args[++i]);
      if (!Number.isInteger(timeout) || timeout < 100) {
        throw new Error("--timeout must be an integer of at least 100ms");
      }
      continue;
    }
    if (arg.startsWith("-")) throw new Error(`unknown option: ${arg}`);
    urls.push(arg);
  }

  return { urls, file, json, timeout };
}

async function loadUrls(file, urls) {
  if (!file) return urls;

  const content = await fs.readFile(file, "utf8");
  const fileUrls = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  return [...urls, ...fileUrls];
}

function printTable(results) {
  const rows = results.map((result) => [
    result.ok ? "OK" : "FAIL",
    String(result.status ?? "-"),
    String(result.latencyMs ?? "-"),
    result.contentType ?? "-",
    result.redirected ? "yes" : "no",
    result.url
  ]);

  const headers = ["RESULT", "STATUS", "MS", "CONTENT-TYPE", "REDIRECT", "URL"];
  const widths = headers.map((header, index) =>
    Math.min(
      70,
      Math.max(header.length, ...rows.map((row) => row[index].length))
    )
  );

  const line = (row) =>
    row.map((cell, i) => cell.padEnd(widths[i])).join("  ");

  console.log(line(headers));
  console.log(widths.map((width) => "-".repeat(width)).join("  "));

  for (const result of results) {
    const row = [
      result.ok ? "OK" : "FAIL",
      String(result.status ?? "-"),
      String(result.latencyMs ?? "-"),
      result.contentType ?? result.error ?? "-",
      result.redirected ? "yes" : "no",
      result.url
    ];
    console.log(line(row));
  }
}

async function main() {
  try {
    const parsed = parseArgs(process.argv.slice(2));
    if (parsed.help) {
      usage();
      return;
    }

    const urls = await loadUrls(parsed.file, parsed.urls);
    if (urls.length === 0) {
      usage();
      process.exitCode = 2;
      return;
    }

    const results = await Promise.all(
      urls.map((url) => checkUrl(url, { timeout: parsed.timeout }))
    );

    if (parsed.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      printTable(results);
    }

    if (results.some((result) => !result.ok)) process.exitCode = 1;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 2;
  }
}

main();
