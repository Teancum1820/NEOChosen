const REQUIRED = ['legal_name', 'public_name', 'contact_person', 'email', 'phone', 'prize_name', 'prize_description', 'retail_value', 'availability', 'fulfillment'];
const MAX_LENGTHS = { legal_name: 160, public_name: 160, contact_person: 120, email: 254, phone: 40, website: 500, prize_name: 180, prize_description: 3000, retail_value: 80, availability: 80, restrictions: 2000, fulfillment: 2000, notes: 2000 };
const IMAGE_TYPES = new Map([['image/png', 'png'], ['image/jpeg', 'jpg'], ['image/webp', 'webp']]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const json = (body, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const text = (form, name) => String(form.get(name) || '').trim();
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

function validate(values, permission) {
  for (const field of REQUIRED) if (!values[field]) return 'Please complete every required field.';
  for (const [field, limit] of Object.entries(MAX_LENGTHS)) if (values[field].length > limit) return 'One or more fields is too long.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return 'Please enter a valid email address.';
  if (values.website) { try { const url = new URL(values.website); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); } catch { return 'Please enter a complete website URL beginning with http:// or https://.'; } }
  if (!permission) return 'Permission to recognize and promote the donor is required.';
  return null;
}

async function saveFile(file, kind, submissionId, bucket) {
  if (!(file instanceof File) || !file.size) return null;
  const extension = IMAGE_TYPES.get(file.type);
  if (!extension) throw new Error('Uploads must be PNG, JPG, or WebP images.');
  if (file.size > MAX_FILE_SIZE) throw new Error('Each upload must be 5 MB or smaller.');
  const key = `raffle-prize-submissions/${submissionId}/${kind}.${extension}`;
  await bucket.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { originalName: file.name.slice(0, 180) } });
  return key;
}

async function sendAlert(env, id, values, logoKey, photoKey) {
  if (!env.RESEND_API_KEY) throw new Error('Email delivery is not configured.');
  const rows = Object.entries(values).map(([key, value]) => `<tr><th align="left">${escapeHtml(key.replaceAll('_', ' '))}</th><td>${escapeHtml(value)}</td></tr>`).join('');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.RAFFLE_ALERT_FROM || 'NEOChosen Raffle <raffle@neochosen.com>', to: [env.RAFFLE_ALERT_TO || 'info@kirtlandheritagegroup.com'], reply_to: values.email, subject: `New raffle prize proposal: ${values.prize_name}`, html: `<h1>New raffle prize proposal</h1><p>Submission ID: ${escapeHtml(id)}</p><table>${rows}<tr><th align="left">logo object</th><td>${escapeHtml(logoKey || 'None')}</td></tr><tr><th align="left">photo object</th><td>${escapeHtml(photoKey || 'None')}</td></tr></table>` })
  });
  if (!response.ok) throw new Error('Alert email could not be delivered.');
}

export async function onRequestPost({ request, env }) {
  if (env.PRIZE_FORM_ENABLED !== 'true') return json({ error: 'Prize submissions are coming soon.' }, 503);
  if (!env.RAFFLE_DB || !env.RAFFLE_UPLOADS) return json({ error: 'Prize submissions are not configured yet. Please email info@kirtlandheritagegroup.com.' }, 503);
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data')) return json({ error: 'Unsupported request.' }, 415);
  const form = await request.formData().catch(() => null);
  if (!form) return json({ error: 'The submitted form could not be read.' }, 400);
  if (text(form, 'company_fax')) return json({ ok: true });

  const values = Object.fromEntries(Object.keys(MAX_LENGTHS).map((field) => [field, text(form, field)]));
  const permission = form.get('recognition_permission') === 'yes';
  const error = validate(values, permission);
  if (error) return json({ error }, 400);

  const id = crypto.randomUUID(), createdAt = new Date().toISOString();
  let logoKey = null, photoKey = null;
  try {
    logoKey = await saveFile(form.get('logo'), 'logo', id, env.RAFFLE_UPLOADS);
    photoKey = await saveFile(form.get('prize_photo'), 'prize-photo', id, env.RAFFLE_UPLOADS);
    await env.RAFFLE_DB.prepare(`INSERT INTO prize_donations
      (id, created_at, status, legal_name, public_name, contact_person, email, phone, website, prize_name, prize_description, retail_value, availability, restrictions, fulfillment, logo_key, prize_photo_key, recognition_permission, notes)
      VALUES (?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`)
      .bind(id, createdAt, values.legal_name, values.public_name, values.contact_person, values.email, values.phone, values.website, values.prize_name, values.prize_description, values.retail_value, values.availability, values.restrictions, values.fulfillment, logoKey, photoKey, values.notes).run();
    try {
      await sendAlert(env, id, values, logoKey, photoKey);
    } catch (alertFailure) {
      console.error('Prize donation alert failed', alertFailure);
      await env.RAFFLE_DB.prepare("UPDATE prize_donations SET status = 'alert_failed' WHERE id = ?").bind(id).run();
    }
    return json({ ok: true, id }, 201);
  } catch (failure) {
    if (logoKey) await env.RAFFLE_UPLOADS.delete(logoKey).catch(() => {});
    if (photoKey) await env.RAFFLE_UPLOADS.delete(photoKey).catch(() => {});
    console.error('Prize donation failed', failure);
    return json({ error: failure.message.includes('upload') || failure.message.includes('Uploads') ? failure.message : 'We could not submit the form. Please try again or email info@kirtlandheritagegroup.com.' }, 500);
  }
}
