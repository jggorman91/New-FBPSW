import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { getConfig } from "./config.js";
import { generateFbpsw } from "./lib/geminiClient.js";
import { normalizePayload, validateRequestBody } from "./lib/fbpswRequest.js";
import { loadEnvFile } from "./loadEnv.js";

loadEnvFile();
const config = getConfig();
const publicDir = path.resolve(process.cwd(), "public");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendFile(response, statusCode, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = contentTypes[extension] ?? "application/octet-stream";
  const fileContents = fs.readFileSync(filePath);

  response.writeHead(statusCode, {
    "Content-Type": contentType
  });
  response.end(fileContents);
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

function serveStaticAsset(urlPath, response) {
  const safePath = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const requestedPath = path.normalize(path.join(publicDir, safePath));

  if (!requestedPath.startsWith(publicDir)) {
    sendJson(response, 403, { error: "Forbidden." });
    return true;
  }

  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    sendFile(response, 200, requestedPath);
    return true;
  }

  if (!path.extname(urlPath)) {
    const indexPath = path.join(publicDir, "index.html");
    if (fs.existsSync(indexPath)) {
      sendFile(response, 200, indexPath);
      return true;
    }
  }

  return false;
}

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { error: "Missing request URL." });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, {
      status: "ok",
      service: "fbpsw-backend",
      provider: "gemini",
      model: config.geminiModel,
      apiConfigured: Boolean(config.geminiApiKey)
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/fbpsw/generate") {
    try {
      const body = await readJsonBody(request);
      const errors = validateRequestBody(body);

      if (errors.length > 0) {
        sendJson(response, 400, {
          error: "Validation failed.",
          details: errors
        });
        return;
      }

      const worksheet = await generateFbpsw(normalizePayload(body), config);

      sendJson(response, 200, {
        ok: true,
        worksheet
      });
    } catch (error) {
      const statusCode = error instanceof SyntaxError ? 400 : 500;
      sendJson(response, statusCode, {
        error: error.message || "Unexpected server error."
      });
    }
    return;
  }

  if (request.method === "GET") {
    if (serveStaticAsset(url.pathname, response)) {
      return;
    }
  }

  sendJson(response, 404, { error: "Route not found." });
});

server.listen(config.port, () => {
  console.log(`FBPSW backend listening on http://localhost:${config.port}`);
});
