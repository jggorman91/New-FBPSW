export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateRequestBody(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return ["Request body must be a JSON object."];
  }

  if (!body.targetBehavior || typeof body.targetBehavior !== "object") {
    errors.push("targetBehavior is required.");
  } else if (!isNonEmptyString(body.targetBehavior.description)) {
    errors.push("targetBehavior.description is required.");
  }

  if (!isNonEmptyString(body.suspectedFunction)) {
    errors.push("suspectedFunction is required.");
  }

  return errors;
}

export function normalizePayload(body) {
  return {
    studentProfile: {
      name: body.studentProfile?.name?.trim(),
      gradeOrAge: body.studentProfile?.gradeOrAge?.trim(),
      strengths: body.studentProfile?.strengths?.trim()
    },
    targetBehavior: {
      description: body.targetBehavior.description.trim(),
      frequencyOrIntensity: body.targetBehavior.frequencyOrIntensity?.trim()
    },
    context: {
      triggers: Array.isArray(body.context?.triggers) ? body.context.triggers.filter(isNonEmptyString) : [],
      consequences: Array.isArray(body.context?.consequences) ? body.context.consequences.filter(isNonEmptyString) : [],
      settingEvents: Array.isArray(body.context?.settingEvents) ? body.context.settingEvents.filter(isNonEmptyString) : []
    },
    suspectedFunction: body.suspectedFunction.trim(),
    replacementBehaviorGoal: body.replacementBehaviorGoal?.trim(),
    supportPreferences: body.supportPreferences?.trim()
  };
}
