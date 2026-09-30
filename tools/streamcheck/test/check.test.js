import test from "node:test";
import assert from "node:assert/strict";
import { checkUrl } from "../src/check.js";

test("rejects malformed URLs", async () => {
  const result = await checkUrl("not-a-url");
  assert.equal(result.ok, false);
  assert.equal(result.error, "invalid URL");
});

test("rejects unsupported protocols", async () => {
  const result = await checkUrl("ftp://example.com/file");
  assert.equal(result.ok, false);
  assert.match(result.error, /only http/);
});

test("returns a stable result shape", async () => {
  const result = await checkUrl("http://127.0.0.1:1");
  assert.equal(typeof result.ok, "boolean");
  assert.ok("status" in result);
  assert.ok("latencyMs" in result);
  assert.ok("redirected" in result);
});
