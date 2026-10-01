import test from "node:test";
import assert from "node:assert/strict";
import { validateManifest } from "../src/validate.js";

test("accepts a valid movie manifest", () => {
  const result = validateManifest([{
    id: 98,
    title: "Gladiator",
    year: 2000,
    resolution: "1080p",
    streamUrl: "https://example.com/gladiator.m3u8",
    posterUrl: "https://example.com/poster.jpg",
    description: "A sample movie."
  }]);
  assert.equal(result.valid, true);
  assert.equal(result.count, 1);
  assert.deepEqual(result.errors, []);
});

test("accepts an object with a movies array", () => {
  const result = validateManifest({ movies: [{ id: "tt001", title: "Example", streamUrl: "https://example.com/movie.mp4" }] });
  assert.equal(result.valid, true);
});

test("rejects missing required fields", () => {
  const result = validateManifest([{ id: 1, title: "Broken" }]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("streamUrl")));
});

test("rejects invalid resolution and stream URL", () => {
  const result = validateManifest([{ id: 1, title: "Broken", resolution: "8K", streamUrl: "ftp://example.com/movie.mp4" }]);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 2);
});

test("detects duplicate IDs", () => {
  const result = validateManifest([
    { id: 1, title: "One", streamUrl: "https://example.com/1.mp4" },
    { id: 1, title: "Two", streamUrl: "https://example.com/2.mp4" }
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("duplicates")));
});

test("reports optional metadata as warnings", () => {
  const result = validateManifest([{ id: 1, title: "Minimal", streamUrl: "https://example.com/movie.mp4" }]);
  assert.equal(result.valid, true);
  assert.ok(result.warnings.some((warning) => warning.includes("description")));
});
