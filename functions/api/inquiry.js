// Cloudflare Pages Function: export/wholesale quote inquiry → email via Resend.
// Route: POST /api/inquiry  (file path functions/api/inquiry.js)
//
// Environment variables (Cloudflare → Workers & Pages → tochinacar → Settings):
//   RESEND_API_KEY   — required (same secret as the subscribe function)
//   INQUIRY_TO       — optional, where inquiries land; default hello@topchinacar.com
//   INQUIRY_FROM     — optional, verified sender; default briefing@topchinacar.com
//   TURNSTILE_SECRET — optional. Same secret as the radar newsletter Turnstile widget
//                      (sitekey 0x4AAAAAAFOeyqZP39w8eCOI). When this variable is set,
//                      the request must include a valid turnstileToken. When it is
//                      unset, verification is skipped so inquiries keep sending.

export async function onRequestPost(context) {
  const { env, request } = context;

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return json({ error: 'Not configured' }, 503);

  let b;
  try { b = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400); }

  // Honeypot: humans never see this field. Pretend success and do not send mail.
  if (String(b.website || '').trim()) return json({ ok: true }, 200);

  if (env.TURNSTILE_SECRET) {
    const passed = await verifyTurnstile(env.TURNSTILE_SECRET, b.turnstileToken, request.headers.get('CF-Connecting-IP'));
    if (!passed) return json({ error: 'Verification failed' }, 403);
  }

  const s = (v, max) => String(v || '').trim().slice(0, max || 200);
  const inquiry = {
    name: s(b.name), company: s(b.company), email: s(b.email),
    whatsapp: s(b.whatsapp), market: s(b.market), model: s(b.model),
    quantity: s(b.quantity, 50), message: s(b.message, 2000)
  };
  if (!inquiry.name || !inquiry.market || !inquiry.model
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
    return json({ error: 'Missing required fields' }, 400);
  }

  const esc = v => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const row = (k, v) => v ? `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap;">${k}</td><td style="padding:6px 0;"><strong>${esc(v)}</strong></td></tr>` : '';
  const html = `<div style="font-family:-apple-system,sans-serif;font-size:15px;line-height:1.6;">
    <h2 style="margin:0 0 4px;">🚗 新询盘 / New export inquiry</h2>
    <p style="margin:0 0 16px;color:#6b7280;">topchinacar.com/quote · ${new Date().toISOString()}</p>
    <table style="border-collapse:collapse;">
      ${row('Name', inquiry.name)}
      ${row('Company', inquiry.company)}
      ${row('Email', inquiry.email)}
      ${row('WhatsApp', inquiry.whatsapp)}
      ${row('Market', inquiry.market)}
      ${row('Model(s)', inquiry.model)}
      ${row('Quantity', inquiry.quantity)}
    </table>
    ${inquiry.message ? `<p style="margin:16px 0 0;padding:12px;background:#f9fafb;border-left:3px solid #d4302a;">${esc(inquiry.message)}</p>` : ''}
  </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `TopChinaCar Inquiries <${env.INQUIRY_FROM || 'briefing@topchinacar.com'}>`,
        to: [env.INQUIRY_TO || 'hello@topchinacar.com'],
        reply_to: inquiry.email,
        subject: `[询盘] ${inquiry.market} · ${inquiry.model} · ${inquiry.quantity || '?'} units — ${inquiry.name}`,
        html
      })
    });
    if (!r.ok) {
      console.error('Resend error:', r.status, await r.text());
      return json({ error: 'Send failed' }, 502);
    }
    return json({ ok: true }, 200);
  } catch (err) {
    console.error('inquiry failed:', err);
    return json({ error: 'Send failed' }, 502);
  }
}

export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ error: 'Method not allowed' }, 405, { 'Allow': 'POST' });
}

async function verifyTurnstile(secret, token, remoteIp) {
  try {
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', String(token || ''));
    body.set('remoteip', remoteIp || '');
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const data = await response.json();
    return !!(data && data.success);
  } catch (err) {
    console.error('turnstile verify failed:', err);
    return false;
  }
}

function json(obj, status, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...(extraHeaders || {}) }
  });
}
