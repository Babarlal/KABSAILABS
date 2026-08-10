// Vercel serverless function — creates a Retell web-call session.
// The Retell API key lives only in the RETELL_API_KEY environment variable.
//
// Every successful call to this endpoint mints a billable Retell session,
// so it is rate limited and origin restricted. Neither is a substitute for
// a hard monthly spend cap set in the Retell dashboard — set one.
const AGENT_ID = "agent_8e60d33c741d23b7e3768e7b73";

const ALLOWED_ORIGINS = [
  "https://www.kabsailabs.com",
  "https://kabsailabs.com"
];

// Crude in-memory rate limit, same shape as api/submit-form.js. Survives
// within a warm lambda only, and each region keeps its own counter, so
// treat it as a speed bump rather than a guarantee.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;   // 1 hour
  const max = 3;                     // 3 sessions per IP per hour
  const rec = hits.get(ip) || { count: 0, start: now };
  if (now - rec.start > windowMs) { rec.count = 0; rec.start = now; }
  rec.count += 1;
  hits.set(ip, rec);
  if (hits.size > 5000) hits.clear();
  return rec.count > max;
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;
  const allowed = origin && ALLOWED_ORIGINS.includes(origin);
  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // A cross-origin caller sends an Origin we do not recognise. Same-origin
  // browser requests may omit it entirely, so only reject when one is
  // present and unrecognised.
  if (origin && !allowed) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({
      error: "You have started several demo calls recently. Please try again later, or book a call at /audit."
    });
  }

  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing RETELL_API_KEY" });
  }

  try {
    const retellRes = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ agent_id: AGENT_ID })
    });

    if (!retellRes.ok) {
      const detail = await retellRes.text().catch(function () { return ""; });
      return res.status(502).json({ error: "Failed to create web call", detail: detail });
    }

    const call = await retellRes.json();
    return res.status(200).json({ accessToken: call.access_token, callId: call.call_id });
  } catch (err) {
    return res.status(500).json({ error: "Unexpected server error" });
  }
};
