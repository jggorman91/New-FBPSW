const DEFAULT_PORT = 8787;
const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export function getConfig() {
  return {
    port: Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10),
    geminiApiKey: process.env.GEMINI_API_KEY ?? "",
    geminiModel: process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
    geminiBaseUrl: process.env.GEMINI_BASE_URL ?? DEFAULT_BASE_URL
  };
}
