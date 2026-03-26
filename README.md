# FBPSW App

This project provides a lightweight FBPSW web app with a built-in frontend and a Gemini-powered backend that can run locally or be hosted for free on Cloudflare Pages Functions.

## What It Does

- Serves a single-page frontend at `/`.
- Exposes a `POST /api/fbpsw/generate` endpoint.
- Accepts student, behavior, and context details.
- Calls the Gemini API, defaulting to `gemini-2.5-flash-lite`.
- Returns a structured worksheet in JSON so a frontend can render it into a form, PDF, or editable plan.
- Includes Cloudflare Pages Functions so the app can be hosted publicly without exposing the API key to the browser.

## Setup

1. Create a Google AI Studio API key for the Gemini API.
2. Put your key in `.env` as `GEMINI_API_KEY`.
3. Optionally change `GEMINI_MODEL`, `GEMINI_BASE_URL`, or `PORT`.
4. Start the server:

```powershell
node src/server.js
```

5. Open `http://localhost:8787`.

## Environment Variables

```env
PORT=8787
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

## Free Hosting Path

This repo now includes Cloudflare Pages Functions in [functions](C:\Users\jggor\WebAppTest\functions) and config in [wrangler.toml](C:\Users\jggor\WebAppTest\wrangler.toml).

Typical free deployment flow:

1. Create a Cloudflare Pages project from this folder.
2. Set the build output directory to `public`.
3. Add a Pages secret named `GEMINI_API_KEY`.
4. Optionally add `GEMINI_MODEL`.
5. Deploy.

For local Pages development you can use:

```powershell
npx wrangler pages dev public
```

For a copy-paste deployment checklist, see [DEPLOYMENT.md](C:\Users\jggor\WebAppTest\DEPLOYMENT.md).

## Example Request

```json
{
  "studentProfile": {
    "name": "Jordan",
    "gradeOrAge": "4th grade",
    "strengths": "Enjoys science, responds well to adult praise, strong verbal skills"
  },
  "targetBehavior": {
    "description": "Leaves seat and refuses written math tasks",
    "frequencyOrIntensity": "3-4 times per week during independent work"
  },
  "context": {
    "triggers": [
      "Independent math assignments",
      "Multi-step written tasks"
    ],
    "consequences": [
      "Sent to hallway for cool down",
      "Adult attention increases"
    ],
    "settingEvents": [
      "Poor sleep",
      "Schedule changes"
    ]
  },
  "suspectedFunction": "Escape or avoidance of difficult academic work",
  "replacementBehaviorGoal": "Ask for help or request a short break appropriately",
  "supportPreferences": "Keep strategies realistic for a general education classroom"
}
```

## Example Response Shape

```json
{
  "ok": true,
  "worksheet": {
    "worksheetTitle": "Function Based Problem Solving Worksheet",
    "studentSummary": "string",
    "behaviorHypothesis": "string",
    "confidenceStatement": "string",
    "antecedentStrategies": ["string"],
    "teachingStrategies": ["string"],
    "reinforcementStrategies": ["string"],
    "responseStrategies": ["string"],
    "replacementBehaviors": ["string"],
    "progressMonitoring": {
      "dataToCollect": ["string"],
      "reviewSchedule": "string",
      "successCriteria": "string"
    },
    "teamNotes": ["string"]
  }
}
```

## Health Check

`GET /health`

Returns server status, configured Gemini model, and whether the API key is configured.
