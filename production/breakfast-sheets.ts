// Server-only Sheets integration. Neither credentials nor the Sheet ID are
// included in the static build. Google receives literal values (RAW), so user
// text beginning with '=' can never become an executable spreadsheet formula.
export const requestHeaders = [
  "Request ID",
  "Received (UTC)",
  "Name",
  "Organization or Congregation",
  "Position / Role",
  "Email",
  "Phone",
  "City / Community",
  "Preferred Gathering",
  "Community Involvement",
  "Status",
  "Assigned To",
  "Internal Notes",
] as const;

export type InvitationRequest = {
  name: string;
  organization: string;
  role: string;
  email: string;
  phone: string;
  community: string;
  gathering: "east-side" | "south-summit";
  involvement: string;
};
export type GoogleConnection = Pick<
  Env,
  "GOOGLE_SERVICE_ACCOUNT_JSON" | "BREAKFAST_SHEET_ID"
>;

const encoder = new TextEncoder();
const tokenUrl = "https://oauth2.googleapis.com/token";
const sheetsRoot = "https://sheets.googleapis.com/v4/spreadsheets/";
function base64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function readBounded(
  stream: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<Uint8Array> {
  if (!stream) return new Uint8Array();
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function googleJson(
  url: string,
  init: RequestInit,
  transport: typeof fetch,
): Promise<Record<string, unknown>> {
  const response = await transport(url, {
    ...init,
    signal: AbortSignal.timeout(4500),
    // Workers supports manual redirects; refuse non-2xx responses below.
    // Never forward the assertion or bearer token to a redirect destination.
    redirect: "manual",
  });
  const body = await readBounded(response.body, 32768);
  if (!response.ok) throw new Error("Google request failed");
  const result: unknown = JSON.parse(new TextDecoder().decode(body));
  if (!result || typeof result !== "object" || Array.isArray(result))
    throw new Error("Invalid Google response");
  return result as Record<string, unknown>;
}

async function accessToken(
  connection: GoogleConnection,
  transport: typeof fetch,
): Promise<string> {
  const credential: unknown = JSON.parse(
    connection.GOOGLE_SERVICE_ACCOUNT_JSON,
  );
  if (!credential || typeof credential !== "object")
    throw new Error("Invalid service account");
  const account = credential as Record<string, unknown>;
  if (
    account.type !== "service_account" ||
    typeof account.client_email !== "string" ||
    !account.client_email.endsWith(".iam.gserviceaccount.com") ||
    typeof account.private_key !== "string"
  )
    throw new Error("Invalid service account");
  const pem = account.private_key.replace(
    /-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,
    "",
  );
  const keyBytes = Uint8Array.from(atob(pem), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(
    encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })),
  );
  const payload = base64Url(
    encoder.encode(
      JSON.stringify({
        iss: account.client_email,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: tokenUrl,
        iat: now,
        exp: now + 600,
      }),
    ),
  );
  const input = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    encoder.encode(input),
  );
  const result = await googleJson(
    tokenUrl,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: `${input}.${base64Url(new Uint8Array(signature))}`,
      }),
    },
    transport,
  );
  if (
    typeof result.access_token !== "string" ||
    !result.access_token ||
    result.token_type !== "Bearer"
  )
    throw new Error("Token missing");
  return result.access_token;
}

export async function saveRequest(
  connection: GoogleConnection,
  request: InvitationRequest,
  id: string,
  transport: typeof fetch = fetch,
): Promise<void> {
  if (!/^[a-zA-Z0-9_-]+$/.test(connection.BREAKFAST_SHEET_ID))
    throw new Error("Invalid Sheet ID");
  const token = await accessToken(connection, transport);
  const base = `${sheetsRoot}${encodeURIComponent(connection.BREAKFAST_SHEET_ID)}/values/`;
  const headers = { authorization: `Bearer ${token}` };
  // Refuse to append if reviewers have moved/renamed the expected columns.
  const schema = await googleJson(
    `${base}${encodeURIComponent("'Requests'!A1:M1")}`,
    { headers },
    transport,
  );
  const values = schema.values;
  if (
    !Array.isArray(values) ||
    !Array.isArray(values[0]) ||
    values[0].length !== requestHeaders.length ||
    values[0].some(
      (value: unknown, index: number) => value !== requestHeaders[index],
    )
  )
    throw new Error("Sheet columns mismatch");
  const received = Date.now() / 86400000 + 25569; // Typed Google Sheets UTC date serial.
  const row = [
    id,
    received,
    request.name,
    request.organization,
    request.role,
    request.email,
    request.phone,
    request.community,
    request.gathering === "east-side" ? "East Side" : "South / Summit",
    request.involvement,
    "New",
    "",
    "",
  ];
  const result = await googleJson(
    `${base}${encodeURIComponent("'Requests'!A:M")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ majorDimension: "ROWS", values: [row] }),
    },
    transport,
  );
  const updates = result.updates;
  if (
    result.spreadsheetId !== connection.BREAKFAST_SHEET_ID ||
    !updates ||
    typeof updates !== "object" ||
    !("updatedRows" in updates) ||
    updates.updatedRows !== 1 ||
    !("updatedCells" in updates) ||
    updates.updatedCells !== 13
  )
    throw new Error("Saved row not confirmed");
}
