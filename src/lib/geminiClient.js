import { buildFbpswPrompt } from "./fbpswPrompt.js";

const worksheetSchema = {
  type: "object",
  required: [
    "worksheetTitle",
    "studentSummary",
    "behaviorHypothesis",
    "confidenceStatement",
    "antecedentStrategies",
    "teachingStrategies",
    "reinforcementStrategies",
    "responseStrategies",
    "replacementBehaviors",
    "progressMonitoring",
    "teamNotes"
  ],
  properties: {
    worksheetTitle: { type: "string" },
    studentSummary: { type: "string" },
    behaviorHypothesis: { type: "string" },
    confidenceStatement: { type: "string" },
    antecedentStrategies: {
      type: "array",
      items: { type: "string" }
    },
    teachingStrategies: {
      type: "array",
      items: { type: "string" }
    },
    reinforcementStrategies: {
      type: "array",
      items: { type: "string" }
    },
    responseStrategies: {
      type: "array",
      items: { type: "string" }
    },
    replacementBehaviors: {
      type: "array",
      items: { type: "string" }
    },
    progressMonitoring: {
      type: "object",
      required: ["dataToCollect", "reviewSchedule", "successCriteria"],
      properties: {
        dataToCollect: {
          type: "array",
          items: { type: "string" }
        },
        reviewSchedule: { type: "string" },
        successCriteria: { type: "string" }
      }
    },
    teamNotes: {
      type: "array",
      items: { type: "string" }
    }
  }
};

function hasItems(value) {
  return Array.isArray(value) && value.some((item) => typeof item === "string" && item.trim().length > 0);
}

function extractTextResponse(data) {
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    throw new Error("Gemini returned an unexpected response shape.");
  }

  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

function validateWorksheet(worksheet) {
  if (!worksheet || typeof worksheet !== "object") {
    throw new Error("Gemini returned an invalid worksheet payload.");
  }

  const requiredStrings = [
    "worksheetTitle",
    "studentSummary",
    "behaviorHypothesis",
    "confidenceStatement"
  ];

  for (const key of requiredStrings) {
    if (typeof worksheet[key] !== "string" || worksheet[key].trim().length === 0) {
      throw new Error(`Gemini returned an incomplete worksheet: missing ${key}.`);
    }
  }

  const requiredLists = [
    "antecedentStrategies",
    "teachingStrategies",
    "reinforcementStrategies",
    "responseStrategies",
    "replacementBehaviors",
    "teamNotes"
  ];

  for (const key of requiredLists) {
    if (!hasItems(worksheet[key])) {
      throw new Error(`Gemini returned an incomplete worksheet: ${key} was empty.`);
    }
  }

  if (!worksheet.progressMonitoring || typeof worksheet.progressMonitoring !== "object") {
    throw new Error("Gemini returned an incomplete worksheet: progressMonitoring was missing.");
  }

  if (!hasItems(worksheet.progressMonitoring.dataToCollect)) {
    throw new Error("Gemini returned an incomplete worksheet: progressMonitoring.dataToCollect was empty.");
  }

  for (const key of ["reviewSchedule", "successCriteria"]) {
    if (typeof worksheet.progressMonitoring[key] !== "string" || worksheet.progressMonitoring[key].trim().length === 0) {
      throw new Error(`Gemini returned an incomplete worksheet: progressMonitoring.${key} was missing.`);
    }
  }

  return worksheet;
}

export async function generateFbpsw(payload, config) {
  if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await fetch(`${config.geminiBaseUrl}/models/${config.geminiModel}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": config.geminiApiKey
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildFbpswPrompt(payload)
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200,
        responseMimeType: "application/json",
        responseSchema: worksheetSchema
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return validateWorksheet(JSON.parse(extractTextResponse(data)));
}
