#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

function usage() {
  console.log(`Miroir - snapshot and compare a directory tree

Usage:
  miroir snapshot <directory> [output.json]
  miroir diff <before.json> <after.json>

Options:
  --json    print diff results as JSON
  --help    show this help

The snapshot stores relative paths, file sizes and modification times.
`);
}

async function walk(root, current = root, entries = []) {
  const dirents = await fs.readdir(current, { withFileTypes: true });
  for (const entry of dirents) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) {
      await walk(root, full, entries);
    } else if (entry.isFile()) {
      const stat = await fs.stat(full);
      entries.push({
        path: path.relative(root, full).split(path.sep).join("/"),
        size: stat.size,
        mtimeMs: Math.trunc(stat.mtimeMs)
      });
    }
  }
  return entries;
}

async function makeSnapshot(directory) {
  const root = path.resolve(directory);
  const entries = await walk(root);
  entries.sort((a, b) => a.path.localeCompare(b.path));
  return { version: 1, root, createdAt: new Date().toISOString(), files: entries };
}

function indexFiles(snapshot) {
  return new Map(snapshot.files.map((file) => [file.path, file]));
}

export function diffSnapshots(before, after) {
  const oldFiles = indexFiles(before);
  const newFiles = indexFiles(after);
  const added = [];
  const removed = [];
  const changed = [];

  for (const [filePath, file] of newFiles) {
    if (!oldFiles.has(filePath)) added.push(filePath);
    else {
      const old = oldFiles.get(filePath);
      if (old.size !== file.size || old.mtimeMs !== file.mtimeMs) changed.push(filePath);
    }
  }
  for (const filePath of oldFiles.keys()) {
    if (!newFiles.has(filePath)) removed.push(filePath);
  }

  return { added, removed, changed, unchanged: newFiles.size - added.length - changed.length };
}

function printDiff(result) {
  console.log(`Added: ${result.added.length}`);
  result.added.forEach((file) => console.log(`  + ${file}`));
  console.log(`Removed: ${result.removed.length}`);
  result.removed.forEach((file) => console.log(`  - ${file}`));
  console.log(`Changed: ${result.changed.length}`);
  result.changed.forEach((file) => console.log(`  ~ ${file}`));
  console.log(`Unchanged: ${result.unchanged}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes("--help") || args.includes("-h")) {
    usage();
    return;
  }

  const json = args.includes("--json");
  const clean = args.filter((arg) => arg !== "--json");
  const command = clean[0];

  if (command === "snapshot") {
    if (!clean[1]) throw new Error("snapshot requires a directory");
    const snapshot = await makeSnapshot(clean[1]);
    const output = clean[2];
    const text = JSON.stringify(snapshot, null, 2) + "\\n";
    if (output) await fs.writeFile(output, text, "utf8");
    else console.log(text);
    return;
  }

  if (command === "diff") {
    if (!clean[1] || !clean[2]) throw new Error("diff requires two snapshot files");
    const before = JSON.parse(await fs.readFile(clean[1], "utf8"));
    const after = JSON.parse(await fs.readFile(clean[2], "utf8"));
    const result = diffSnapshots(before, after);
    if (json) console.log(JSON.stringify(result, null, 2));
    else printDiff(result);
    process.exitCode = result.added.length || result.removed.length || result.changed.length ? 1 : 0;
    return;
  }

  throw new Error(`unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 2;
});
