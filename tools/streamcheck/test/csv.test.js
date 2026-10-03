import test from "node:test";
import assert from "node:assert/strict";
import { formatCsv } from "../src/cli.js";

test("formats StreamCheck results as CSV", () => {
  const csv = formatCsv([
    {
      ok: true,
      status: 200,
      latencyMs: 123,
      contentType: "video/mp4",
      redirected: false,
      url: "https://example.com/movie.mp4"
    },
    {
      ok: false,
      status: 404,
      latencyMs: 80,
      contentType: "text/html",
      redirected: true,
      url: "https://example.com/not-found.mp4",
      error: "not found, retry later"
    }
  ]);

  assert.match(csv, /^result,status,latency_ms,content_type,redirected,url,error\n/);
  assert.match(csv, /OK,200,123,video\/mp4,no,https:\/\/example\.com\/movie\.mp4,/);
  assert.match(csv, /FAIL,404,80,text\/html,yes,https:\/\/example\.com\/not-found\.mp4,"not found, retry later"$/);
});
