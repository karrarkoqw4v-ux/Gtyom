// Cloudflare Worker: وسيط آمن بين الواجهة و Anthropic API (المفتاح يبقى سرّي هنا)
// النشر: Workers & Pages > Create > Hello World > الصق هذا الكود > Deploy
// ثم Settings > Variables and Secrets > أضف Secret باسم ANTHROPIC_API_KEY
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method !== "POST") return new Response("ok", { headers: CORS });
    if (!env.ANTHROPIC_API_KEY)
      return new Response("ANTHROPIC_API_KEY غير مضبوط في الـ Worker", { status: 500, headers: CORS });

    const b = await req.json();
    const up = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: b.model || "claude-sonnet-5-5",
        max_tokens: Math.min(b.max_tokens || 4096, 8192),
        stream: true,
        system: b.system,
        messages: b.messages,
      }),
    });
    return new Response(up.body, {
      status: up.status,
      headers: { ...CORS, "Content-Type": up.headers.get("Content-Type") || "text/event-stream" },
    });
  },
};
