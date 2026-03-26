const form = document.querySelector("#fbpsw-form");
const sampleButton = document.querySelector("#sample-button");
const submitButton = document.querySelector("#submit-button");
const statusText = document.querySelector("#status-text");
const emptyState = document.querySelector("#empty-state");
const output = document.querySelector("#worksheet-output");
const modelBadge = document.querySelector(".model-badge");
let activeModelLabel = modelBadge?.textContent?.replace("Model: ", "").trim() || "Gemini";

const sampleData = {
  studentName: "Jordan",
  gradeOrAge: "4th grade",
  strengths: "Enjoys science, responds well to adult praise, strong verbal skills",
  targetBehavior: "Leaves seat and refuses written math tasks",
  frequencyOrIntensity: "3-4 times per week during independent work",
  suspectedFunction: "Escape or avoidance of difficult academic work",
  triggers: "Independent math assignments\nMulti-step written tasks",
  consequences: "Sent to hallway for cool down\nAdult attention increases",
  settingEvents: "Poor sleep\nSchedule changes",
  replacementBehaviorGoal: "Ask for help or request a short break appropriately",
  supportPreferences: "Keep strategies realistic for a general education classroom"
};

function splitLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "<p>No items returned.</p>";
  }

  return `<ul class="section-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderWorksheet(worksheet) {
  output.innerHTML = `
    <h2 class="worksheet-title">${escapeHtml(worksheet.worksheetTitle)}</h2>
    <p class="worksheet-meta">${escapeHtml(worksheet.studentSummary)}</p>
    <section class="worksheet-section">
      <h3>Behavior Hypothesis</h3>
      <p>${escapeHtml(worksheet.behaviorHypothesis)}</p>
    </section>
    <section class="worksheet-section">
      <h3>Confidence Statement</h3>
      <p>${escapeHtml(worksheet.confidenceStatement)}</p>
    </section>
    <section class="worksheet-section">
      <h3>Antecedent Strategies</h3>
      ${renderList(worksheet.antecedentStrategies)}
    </section>
    <section class="worksheet-section">
      <h3>Teaching Strategies</h3>
      ${renderList(worksheet.teachingStrategies)}
    </section>
    <section class="worksheet-section">
      <h3>Reinforcement Strategies</h3>
      ${renderList(worksheet.reinforcementStrategies)}
    </section>
    <section class="worksheet-section">
      <h3>Response Strategies</h3>
      ${renderList(worksheet.responseStrategies)}
    </section>
    <section class="worksheet-section">
      <h3>Replacement Behaviors</h3>
      ${renderList(worksheet.replacementBehaviors)}
    </section>
    <section class="worksheet-section">
      <h3>Progress Monitoring</h3>
      ${renderList(worksheet.progressMonitoring?.dataToCollect ?? [])}
      <p><strong>Review schedule:</strong> ${escapeHtml(worksheet.progressMonitoring?.reviewSchedule ?? "Not provided")}</p>
      <p><strong>Success criteria:</strong> ${escapeHtml(worksheet.progressMonitoring?.successCriteria ?? "Not provided")}</p>
    </section>
    <section class="worksheet-section">
      <h3>Team Notes</h3>
      ${renderList(worksheet.teamNotes)}
    </section>
  `;

  emptyState.classList.add("hidden");
  output.classList.remove("hidden");
}

function setLoadingState(isLoading, message) {
  submitButton.disabled = isLoading;
  sampleButton.disabled = isLoading;
  statusText.textContent = message;
}

async function syncModelLabel() {
  try {
    const response = await fetch("/health");
    const data = await response.json();

    if (response.ok && typeof data.model === "string" && data.model.trim().length > 0) {
      activeModelLabel = data.model.trim();
      if (modelBadge) {
        modelBadge.textContent = `Model: ${activeModelLabel}`;
      }
    }
  } catch {
    // Leave the static label in place if the health check fails.
  }
}

sampleButton.addEventListener("click", () => {
  for (const [key, value] of Object.entries(sampleData)) {
    const field = form.elements.namedItem(key);
    if (field) {
      field.value = value;
    }
  }

  statusText.textContent = "Sample data loaded.";
});

syncModelLabel();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    studentProfile: {
      name: String(formData.get("studentName") ?? "").trim(),
      gradeOrAge: String(formData.get("gradeOrAge") ?? "").trim(),
      strengths: String(formData.get("strengths") ?? "").trim()
    },
    targetBehavior: {
      description: String(formData.get("targetBehavior") ?? "").trim(),
      frequencyOrIntensity: String(formData.get("frequencyOrIntensity") ?? "").trim()
    },
    context: {
      triggers: splitLines(String(formData.get("triggers") ?? "")),
      consequences: splitLines(String(formData.get("consequences") ?? "")),
      settingEvents: splitLines(String(formData.get("settingEvents") ?? ""))
    },
    suspectedFunction: String(formData.get("suspectedFunction") ?? "").trim(),
    replacementBehaviorGoal: String(formData.get("replacementBehaviorGoal") ?? "").trim(),
    supportPreferences: String(formData.get("supportPreferences") ?? "").trim()
  };

  setLoadingState(true, `Generating worksheet with ${activeModelLabel}...`);

  try {
    const response = await fetch("/api/fbpsw/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details?.join(" ") || data.error || "Request failed.");
    }

    renderWorksheet(data.worksheet);
    setLoadingState(false, "Worksheet generated.");
  } catch (error) {
    setLoadingState(false, error.message || "Something went wrong.");
  }
});
