import {
  readBounded,
  saveRequest,
  type InvitationRequest,
} from "./breakfast-sheets.ts";

const route = "/api/breakfast-requests";
const maxBodyBytes = 32768;
const fields = {
  name: [120, true],
  organization: [180, false],
  role: [160, false],
  email: [254, true],
  phone: [40, false],
  community: [160, true],
  gathering: [32, true],
  involvement: [3000, true],
} as const;
function reply(
  status: number,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Response {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

export async function handleBreakfast(
  request: Request,
  env: Env,
  transport: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST")
    return reply(
      405,
      { ok: false, error: "method_not_allowed" },
      { allow: "POST" },
    );
  if (
    env.BREAKFAST_REQUESTS_ENABLED !== "true" ||
    !env.BREAKFAST_SHEET_ID ||
    !env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    !env.BREAKFAST_RATE_LIMITER
  )
    return reply(503, { ok: false, error: "requests_unavailable" });
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  if (
    origin !== env.BREAKFAST_ALLOWED_ORIGIN ||
    url.origin !== env.BREAKFAST_ALLOWED_ORIGIN ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return reply(403, { ok: false, error: "origin_not_allowed" });
  const contentType = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data;\s*boundary=/i.test(contentType))
    return reply(415, { ok: false, error: "unsupported_content_type" });
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBodyBytes))
    return reply(413, { ok: false, error: "body_too_large" });
  let bytes: Uint8Array;
  try {
    bytes = await readBounded(request.body, maxBodyBytes);
  } catch {
    return reply(413, { ok: false, error: "body_too_large" });
  }
  let data: FormData;
  try {
    data = await new Response(bytes, {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    return reply(400, { ok: false, error: "invalid_form" });
  }
  const allowed = new Set<string>([...Object.keys(fields), "website"]);
  for (const [name, value] of data.entries()) {
    if (
      !allowed.has(name) ||
      typeof value !== "string" ||
      data.getAll(name).length !== 1
    )
      return reply(400, { ok: false, error: "invalid_fields" });
  }
  if (data.get("website"))
    return reply(400, { ok: false, error: "invalid_request" });
  const clean: Record<string, string> = {};
  for (const [name, [max, required]] of Object.entries(fields)) {
    const value = data.get(name);
    if (value !== null && typeof value !== "string")
      return reply(400, { ok: false, error: "invalid_fields" });
    clean[name] = typeof value === "string" ? value.trim() : "";
    if (
      (required && !clean[name]) ||
      clean[name].length > max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(clean[name])
    )
      return reply(400, { ok: false, error: "invalid_fields" });
  }
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email) ||
    !["east-side", "south-summit"].includes(clean.gathering)
  )
    return reply(400, { ok: false, error: "invalid_fields" });
  const id = crypto.randomUUID();
  try {
    // An email-based counter avoids blocking different leaders behind a shared
    // church/business network. The key is hashed; email is never logged.
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(clean.email.toLowerCase()),
    );
    const key =
      "neochosen-breakfast:" +
      Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
    const limit = await env.BREAKFAST_RATE_LIMITER.limit({ key });
    if (!limit.success)
      return reply(
        429,
        { ok: false, error: "too_many_requests" },
        { "retry-after": "60" },
      );
    await saveRequest(env, clean as InvitationRequest, id, transport);
    return reply(201, { ok: true, id });
  } catch {
    // Deliberately omit form fields, Google response bodies, keys and Sheet ID.
    console.error(
      JSON.stringify({ event: "breakfast_save_failed", requestId: id }),
    );
    return reply(503, { ok: false, error: "receipt_not_confirmed" });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname === route)
      return handleBreakfast(request, env);
    if (request.method !== "GET" && request.method !== "HEAD")
      return reply(
        405,
        { ok: false, error: "method_not_allowed" },
        { allow: "GET, HEAD" },
      );
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
