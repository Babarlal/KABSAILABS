/**
 * KABS AI LABS — form submission handler
 * Replaces the mailto: handoff on /contact and /audit.
 *
 * Deploy: drop this at /api/submit-form.js in your Vercel project root.
 *
 * Required env vars (Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY   — from resend.com (free tier: 3k emails/mo). Or swap for your provider.
 *   LEAD_TO_EMAIL    — where leads land, e.g. babarlal@kabsailabs.com
 *   LEAD_FROM_EMAIL  — a verified sending address on your domain, e.g. website@kabsailabs.com
 *
 * Optional:
 *   LEAD_WEBHOOK_URL — POSTs the same payload as JSON. Point this at an n8n webhook
 *                      so the lead lands in your CRM. You automate for a living —
 *                      your own site should demo that.
 */

const ALLOWED_ORIGINS = [
  'https://www.kabsailabs.com',
  'https://kabsailabs.com'
];

// crude in-memory rate limit. Survives within a warm lambda only — good enough to
// blunt casual spam, not a substitute for a real WAF.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 5;
  const rec = hits.get(ip) || { count: 0, start: now };
  if (now - rec.start > windowMs) { rec.count = 0; rec.start = now; }
  rec.count += 1;
  hits.set(ip, rec);
  if (hits.size > 5000) hits.clear();
  return rec.count > max;
}

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// CommonJS: this project has no package.json, so Vercel treats api/*.js as CJS.
// Matches api/create-web-call.js. (ESM here would throw "Unexpected token 'export'".)
module.exports = async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many submissions. Please try again in a minute.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot — real users never fill this. Return success so bots don't learn.
  if (body.website_url) {
    return res.status(200).json({ ok: true });
  }

  const name = String(body.name || '').trim().slice(0, 200);
  const email = String(body.email || '').trim().slice(0, 200);
  const company = String(body.company || '').trim().slice(0, 200);
  const mobile = String(body.mobile || '').trim().slice(0, 40);
  const website = String(body.website || '').trim().slice(0, 300);
  const message = String(body.message || body.bottleneck || '').trim().slice(0, 5000);
  const formName = String(body._form || 'website').trim().slice(0, 60);
  const pageUrl = String(body._page || '').trim().slice(0, 300);

  if (!name || !email) {
    return res.status(400).json({ ok: false, error: 'Name and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }

  const payload = {
    form: formName, name, email, company, website, message, mobile,
    page: pageUrl, ip, receivedAt: new Date().toISOString(),
    // Aliases for the Apps Script receiver, which reads the /audit field names.
    // Sending both means one webhook can take audit and contact leads without
    // the message, source or page arriving blank.
    task_time_sink: message, source: formName, page_url: pageUrl
  };

  const rows = [
    ['Name', name], ['Email', email], ['Mobile', mobile], ['Company', company],
    ['Website', website], ['Message', message], ['Form', formName],
    ['Page', pageUrl], ['Received', payload.receivedAt]
  ].filter(([, v]) => v);

  const html =
    `<h2 style="font-family:sans-serif">New ${esc(formName)} submission</h2>` +
    '<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">' +
    rows.map(([k, v]) =>
      `<tr><td style="padding:6px 14px 6px 0;color:#5b6675;vertical-align:top"><b>${esc(k)}</b></td>` +
      `<td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`
    ).join('') +
    '</table>';

  const tasks = [];

  if (process.env.RESEND_API_KEY) {
    tasks.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.LEAD_FROM_EMAIL || 'website@kabsailabs.com',
          to: [process.env.LEAD_TO_EMAIL || 'babarlal@kabsailabs.com'],
          reply_to: email,
          subject: `[${formName}] ${name}${company ? ' — ' + company : ''}`,
          html
        })
      })
    );
  }

  if (process.env.LEAD_WEBHOOK_URL) {
    tasks.push(
      fetch(process.env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    );
  }

  if (!tasks.length) {
    console.error('submit-form: no delivery method configured', payload);
    return res.status(500).json({ ok: false, error: 'Form is not configured. Please email babarlal@kabsailabs.com.' });
  }

  const results = await Promise.allSettled(tasks);
  const delivered = results.some(r => r.status === 'fulfilled' && r.value && r.value.ok);

  if (!delivered) {
    console.error('submit-form: all delivery attempts failed', results, payload);
    return res.status(502).json({ ok: false, error: 'We could not send that. Please email babarlal@kabsailabs.com directly.' });
  }

  return res.status(200).json({ ok: true });
};
