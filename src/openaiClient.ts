import OpenAI from "openai";
import {
  ARCHITECTURE_TA_SYSTEM_PROMPT,
  buildPolicyUserReminder,
  ChatMessage,
} from "./promptPolicy";

const MODEL_NAME = "gpt-5.4-mini";

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

function extractTextFromResponse(response: OpenAI.Responses.Response): string {
  if (response.output_text && response.output_text.trim().length > 0) {
    return response.output_text.trim();
  }

  const chunks: string[] = [];
  for (const item of response.output ?? []) {
    if (item.type !== "message") {
      continue;
    }
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) {
        chunks.push(content.text);
      }
    }
  }

  const joined = chunks.join("\n").trim();
  return joined || "I need a little more context. What constraints matter most for your architecture?";
}

export async function generateArchitectureCoachReply(
  conversation: ChatMessage[],
): Promise<string> {
  const client = getClient();

  const input: OpenAI.Responses.ResponseInput = conversation.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const response = await client.responses.create({
    model: MODEL_NAME,
    instructions: [
      ARCHITECTURE_TA_SYSTEM_PROMPT,
      buildPolicyUserReminder(),
    ].join("\n\n"),
    input,
  });

  return extractTextFromResponse(response);
}
