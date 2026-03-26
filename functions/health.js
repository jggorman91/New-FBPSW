function sendJson(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

export async function onRequestOptions() {
  return sendJson({}, 204);
}

export async function onRequestGet(context) {
  return sendJson({
    status: "ok",
    service: "fbpsw-backend",
    provider: "gemini",
    model: context.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",
    apiConfigured: Boolean(context.env.GEMINI_API_KEY)
  });
}
