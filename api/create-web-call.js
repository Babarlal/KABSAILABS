// Vercel serverless function — creates a Retell web-call session.
// The Retell API key lives only in the RETELL_API_KEY environment variable.
const AGENT_ID = "agent_8e60d33c741d23b7e3768e7b73";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
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
