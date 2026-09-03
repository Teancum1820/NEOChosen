const ALLOWED_EVENTS = new Set([
  'raffle_notification_signup',
  'raffle_prize_donation_submission',
  'raffle_general_donation_click'
]);

export async function onRequestPost({ request, env }) {
  if (!env.RAFFLE_DB) return Response.json({ error: 'Analytics is not configured.' }, { status: 503 });
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('application/json')) return Response.json({ error: 'Unsupported request.' }, { status: 415 });
  const body = await request.json().catch(() => null);
  if (!body || !ALLOWED_EVENTS.has(body.event)) return Response.json({ error: 'Invalid event.' }, { status: 400 });
  const path = typeof body.path === 'string' && body.path.startsWith('/') ? body.path.slice(0, 200) : '/raffle/';
  await env.RAFFLE_DB.prepare('INSERT INTO raffle_events (id, event_name, page_path, created_at) VALUES (?, ?, ?, ?)')
    .bind(crypto.randomUUID(), body.event, path, new Date().toISOString()).run();
  return new Response(null, { status: 204 });
}
