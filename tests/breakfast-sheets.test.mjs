import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import { test } from "node:test";
import worker, { handleBreakfast } from "../production/worker.ts";
import { readBounded, requestHeaders } from "../production/breakfast-sheets.ts";

// Ephemeral synthetic credentials: nothing is saved or sent to Google.
const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const credential = JSON.stringify({
  type: "service_account",
  client_email: "test@test-project.iam.gserviceaccount.com",
  private_key: pair.privateKey.export({ type: "pkcs8", format: "pem" }),
});
const sheetId = "synthetic-sheet";
const sample = {
  name: "Test Leader",
  organization: "=1+1",
  role: "Volunteer",
  email: "test@example.invalid",
  phone: "",
  community: "Test Community",
  gathering: "east-side",
  involvement: "Synthetic test only.",
};
const environment = (extra = {}) => ({
  BREAKFAST_REQUESTS_ENABLED: "true",
  BREAKFAST_ALLOWED_ORIGIN: "https://neochosen.com",
  BREAKFAST_SHEET_ID: sheetId,
  GOOGLE_SERVICE_ACCOUNT_JSON: credential,
  BREAKFAST_RATE_LIMITER: { limit: async () => ({ success: true }) },
  ASSETS: { fetch: async () => new Response("static asset") },
  ...extra,
});
function submission(
  values = sample,
  headers = {},
  url = "https://neochosen.com/api/breakfast-requests",
) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.append(key, value);
  return new Request(url, {
    method: "POST",
    headers: { origin: "https://neochosen.com", ...headers },
    body: form,
  });
}
function googleMock(overrides = {}) {
  const calls = [];
  const transport = async (url, init) => {
    calls.push({ url, init });
    assert.equal(init.redirect, "manual");
    assert.ok(init.signal instanceof AbortSignal);
    if (url === "https://oauth2.googleapis.com/token") {
      const assertion = init.body.get("assertion");
      const [head, payload, signature] = assertion.split(".");
      assert.equal(
        verify(
          "RSA-SHA256",
          Buffer.from(`${head}.${payload}`),
          pair.publicKey,
          Buffer.from(signature, "base64url"),
        ),
        true,
      );
      const claims = JSON.parse(Buffer.from(payload, "base64url"));
      assert.equal(
        claims.scope,
        "https://www.googleapis.com/auth/spreadsheets",
      );
      assert.equal(claims.aud, url);
      assert.equal(claims.exp - claims.iat, 600);
      return Response.json(
        overrides.token || {
          access_token: "synthetic-token",
          token_type: "Bearer",
        },
      );
    }
    assert.equal(init.headers.authorization, "Bearer synthetic-token");
    assert.ok(
      url.startsWith(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/`,
      ),
    );
    if (url.includes(":append?"))
      return Response.json(
        overrides.append || {
          spreadsheetId: sheetId,
          updates: { updatedRows: 1, updatedCells: 13 },
        },
      );
    return Response.json({ values: [overrides.headers || requestHeaders] });
  };
  return { calls, transport };
}
const noNetwork = () => {
  throw new Error("Unexpected network call");
};

test("refuses Google redirects without following them or confirming receipt", async () => {
  let calls = 0;
  const transport = async (_url, init) => {
    calls++;
    assert.equal(init.redirect, "manual");
    return new Response(null, {
      status: 302,
      headers: { location: "https://other.invalid/token" },
    });
  };
  const response = await handleBreakfast(submission(), environment(), transport);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "receipt_not_confirmed",
  });
  assert.equal(calls, 1);
});

test("confirms receipt only after signed authentication, schema check and a literal saved row", async () => {
  const google = googleMock();
  let rateKey;
  const env = environment({
    BREAKFAST_RATE_LIMITER: {
      limit: async ({ key }) => {
        rateKey = key;
        return { success: true };
      },
    },
  });
  const response = await handleBreakfast(submission(), env, google.transport);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const receipt = await response.json();
  assert.equal(receipt.ok, true);
  assert.match(receipt.id, /^[0-9a-f-]{36}$/);
  assert.match(rateKey, /^neochosen-breakfast:[a-f0-9]{64}$/);
  assert.equal(rateKey.includes(sample.email), false);
  assert.equal(google.calls.length, 3);
  const append = google.calls[2];
  assert.equal(new URL(append.url).searchParams.get("valueInputOption"), "RAW");
  const row = JSON.parse(append.init.body).values[0];
  assert.deepEqual(row, [
    receipt.id,
    row[1],
    sample.name,
    "=1+1",
    sample.role,
    sample.email,
    "",
    sample.community,
    "East Side",
    sample.involvement,
    "New",
    "",
    "",
  ]);
  assert.ok(Math.abs((row[1] - 25569) * 86400000 - Date.now()) < 5000);
});

test("both release switches and all server bindings are required", async () => {
  for (const extra of [
    { BREAKFAST_REQUESTS_ENABLED: "false" },
    { BREAKFAST_SHEET_ID: "" },
    { GOOGLE_SERVICE_ACCOUNT_JSON: "" },
    { BREAKFAST_RATE_LIMITER: undefined },
  ]) {
    assert.equal(
      (await handleBreakfast(submission(), environment(extra), noNetwork))
        .status,
      503,
    );
  }
});

test("rejects foreign, missing and cross-site origins and mismatched host", async () => {
  for (const request of [
    submission(sample, { origin: "https://other.invalid" }),
    submission(sample, { origin: "" }),
    submission(sample, { "sec-fetch-site": "cross-site" }),
    submission(sample, {}, "https://other.invalid/api/breakfast-requests"),
  ]) {
    assert.equal(
      (await handleBreakfast(request, environment(), noNetwork)).status,
      403,
    );
  }
});

test("rejects invalid, duplicate, uploaded, unknown and honeypot fields", async () => {
  const badValues = [
    { ...sample, email: "invalid" },
    { ...sample, name: " " },
    { ...sample, name: "x".repeat(121) },
    { ...sample, organization: "x".repeat(181) },
    { ...sample, involvement: "x".repeat(3001) },
    { ...sample, gathering: "private-venue" },
    { ...sample, name: "bad\u0000value" },
    { ...sample, unknown: "value" },
    { ...sample, website: "https://bot.invalid" },
    { ...sample, name: new Blob(["uploaded"]) },
  ];
  for (const values of badValues)
    assert.equal(
      (await handleBreakfast(submission(values), environment(), noNetwork))
        .status,
      400,
    );
  const duplicate = new FormData();
  for (const [key, value] of Object.entries(sample))
    duplicate.append(key, value);
  duplicate.append("email", "second@example.invalid");
  const request = new Request("https://neochosen.com/api/breakfast-requests", {
    method: "POST",
    headers: { origin: "https://neochosen.com" },
    body: duplicate,
  });
  assert.equal(
    (await handleBreakfast(request, environment(), noNetwork)).status,
    400,
  );
});

test("bounds request bodies with and without Content-Length; refuses other content types", async () => {
  assert.equal(
    (
      await handleBreakfast(
        submission(sample, { "content-length": "32769" }),
        environment(),
        noNetwork,
      )
    ).status,
    413,
  );
  assert.equal(
    (
      await handleBreakfast(
        new Request("https://neochosen.com/api/breakfast-requests", {
          method: "POST",
          headers: {
            origin: "https://neochosen.com",
            "content-type": "multipart/form-data; boundary=test",
          },
          body: new Uint8Array(40000),
        }),
        environment(),
        noNetwork,
      )
    ).status,
    413,
  );
  assert.equal(
    (
      await handleBreakfast(
        submission(sample, { "content-type": "application/json" }),
        environment(),
        noNetwork,
      )
    ).status,
    415,
  );
  await assert.rejects(
    readBounded(new Response("long body").body, 2),
    /Body too large/,
  );
});

test("rate limit rejection never contacts Google", async () => {
  const response = await handleBreakfast(
    submission(),
    environment({
      BREAKFAST_RATE_LIMITER: { limit: async () => ({ success: false }) },
    }),
    noNetwork,
  );
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
});

test("Google failures and mismatched columns or save acknowledgements never claim success or log private data", async () => {
  const originalError = console.error;
  const messages = [];
  console.error = (value) => messages.push(value);
  try {
    for (const overrides of [
      { token: { error: "denied" } },
      { headers: ["Wrong columns"] },
      {
        append: {
          spreadsheetId: "wrong",
          updates: { updatedRows: 1, updatedCells: 13 },
        },
      },
      {
        append: {
          spreadsheetId: sheetId,
          updates: { updatedRows: 0, updatedCells: 0 },
        },
      },
    ]) {
      const mock = googleMock(overrides);
      const response = await handleBreakfast(
        submission(),
        environment(),
        mock.transport,
      );
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        ok: false,
        error: "receipt_not_confirmed",
      });
      if (overrides.headers || overrides.token)
        assert.equal(
          mock.calls.some((call) => call.url.includes(":append?")),
          false,
        );
    }
    const failedNetwork = async () => {
      throw new Error("Synthetic network timeout");
    };
    assert.equal(
      (await handleBreakfast(submission(), environment(), failedNetwork))
        .status,
      503,
    );
    assert.equal(
      (
        await handleBreakfast(
          submission(),
          environment({ GOOGLE_SERVICE_ACCOUNT_JSON: "{}" }),
          noNetwork,
        )
      ).status,
      503,
    );
  } finally {
    console.error = originalError;
  }
  assert.equal(messages.length, 6);
  for (const value of messages) {
    assert.deepEqual(Object.keys(JSON.parse(value)), ["event", "requestId"]);
    assert.equal(value.includes(sample.email), false);
    assert.equal(value.includes(sheetId), false);
  }
});

test("API has no public read endpoint and ordinary static routes still work", async () => {
  for (const method of ["GET", "HEAD", "PUT", "OPTIONS"])
    assert.equal(
      (
        await worker.fetch(
          new Request("https://neochosen.com/api/breakfast-requests", {
            method,
          }),
          environment(),
        )
      ).status,
      405,
    );
  const asset = await worker.fetch(
    new Request("https://neochosen.com/vip-dinner/"),
    environment(),
  );
  assert.equal(await asset.text(), "static asset");
  assert.equal(
    (
      await worker.fetch(
        new Request("https://neochosen.com/elsewhere", { method: "POST" }),
        environment(),
      )
    ).status,
    405,
  );
});
