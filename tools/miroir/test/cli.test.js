import test from "node:test";
import assert from "node:assert/strict";
import { diffSnapshots } from "../src/cli.js";

test("detects added, removed and changed files", () => {
  const before = { files: [
    { path: "README.md", size: 10, mtimeMs: 1 },
    { path: "old.js", size: 20, mtimeMs: 1 },
    { path: "app.js", size: 30, mtimeMs: 1 }
  ] };
  const after = { files: [
    { path: "README.md", size: 10, mtimeMs: 1 },
    { path: "new.js", size: 20, mtimeMs: 1 },
    { path: "app.js", size: 31, mtimeMs: 1 }
  ] };
  assert.deepEqual(diffSnapshots(before, after), { added: ["new.js"], removed: ["old.js"], changed: ["app.js"], unchanged: 1 });
});

test("returns an empty diff for identical snapshots", () => {
  const snapshot = { files: [{ path: "app.js", size: 10, mtimeMs: 1 }] };
  assert.deepEqual(diffSnapshots(snapshot, snapshot), { added: [], removed: [], changed: [], unchanged: 1 });
});