const DEFAULT_TIMEOUT = 8000;

function formatError(error) {
  if (error?.name === "AbortError") return "request timed out";
  return error?.message || String(error);
}

export async function checkUrl(url, options = {}) {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const started = performance.now();

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return {
      url,
      ok: false,
      status: null,
      contentType: null,
      contentLength: null,
      latencyMs: null,
      finalUrl: null,
      redirected: false,
      error: "invalid URL"
    };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return {
      url,
      ok: false,
      status: null,
      contentType: null,
      contentLength: null,
      latencyMs: null,
      finalUrl: null,
      redirected: false,
      error: "only http:// and https:// URLs are supported"
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    let response;
    try {
      response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal
      });
    } catch (headError) {
      if (headError?.name === "AbortError") throw headError;

      response = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        redirect: "follow",
        signal: controller.signal
      });
    }

    const latencyMs = Math.round(performance.now() - started);
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    const finalUrl = response.url || url;

    return {
      url,
      ok: response.ok,
      status: response.status,
      contentType,
      contentLength,
      latencyMs,
      finalUrl,
      redirected: finalUrl !== url,
      error: null
    };
  } catch (error) {
    return {
      url,
      ok: false,
      status: null,
      contentType: null,
      contentLength: null,
      latencyMs: Math.round(performance.now() - started),
      finalUrl: null,
      redirected: false,
      error: formatError(error)
    };
  } finally {
    clearTimeout(timer);
  }
}
