import assert from "node:assert/strict";
import {
  ARCHITECTURE_TA_SYSTEM_PROMPT,
  buildPolicyUserReminder,
  sanitizeConversation,
} from "../promptPolicy";

function runPromptPolicyChecks(): void {
  assert.match(ARCHITECTURE_TA_SYSTEM_PROMPT, /Do not provide direct architecture answers/i);
  assert.match(ARCHITECTURE_TA_SYSTEM_PROMPT, /Focus only on architecture setup/i);
  assert.match(buildPolicyUserReminder(), /Guide only on architecture setup/i);

  const cleaned = sanitizeConversation([
    { role: "user", content: "  I want to build a blog app. " },
    { role: "assistant", content: "  Great start.  " },
    { role: "user", content: "   " },
  ]);

  assert.equal(cleaned.length, 2);
  assert.equal(cleaned[0]?.content, "I want to build a blog app.");
  assert.equal(cleaned[1]?.content, "Great start.");
}

runPromptPolicyChecks();
console.log("Prompt policy checks passed.");
