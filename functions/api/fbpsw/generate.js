import { generateFbpsw } from "../../../src/lib/geminiClient.js";
import { normalizePayload, validateRequestBody } from "../../../src/lib/fbpswRequest.js";

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

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const errors = validateRequestBody(body);

    if (errors.length > 0) {
      return sendJson(
        {
          error: "Validation failed.",
          details: errors
        },
        400
      );
    }

    const worksheet = await generateFbpsw(normalizePayload(body), {
      geminiApiKey: context.env.GEMINI_API_KEY ?? "",
      geminiModel: context.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",
      geminiBaseUrl: context.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta"
    });

    return sendJson({
      ok: true,
      worksheet
    });
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : 500;
    return sendJson(
      {
        error: error.message || "Unexpected server error."
      },
      status
    );
  }
}
