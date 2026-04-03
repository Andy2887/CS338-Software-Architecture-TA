import dotenv from "dotenv";
import express, { Request, Response } from "express";
import path from "path";
import { generateArchitectureCoachReply } from "./openaiClient";
import { ChatMessage, sanitizeConversation } from "./promptPolicy";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.resolve(process.cwd(), "public")));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const rawMessages = req.body?.messages;
    if (!Array.isArray(rawMessages)) {
      return res.status(400).json({
        error: "Expected body.messages to be an array.",
      });
    }

    const typedMessages: ChatMessage[] = rawMessages;
    const conversation = sanitizeConversation(typedMessages);
    if (conversation.length === 0) {
      return res.status(400).json({
        error: "Conversation must include at least one non-empty message.",
      });
    }

    const reply = await generateArchitectureCoachReply(conversation);
    return res.json({ reply });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    const statusCode = message.includes("OPENAI_API_KEY") ? 500 : 502;
    return res.status(statusCode).json({
      error: message,
    });
  }
});

app.get(/.*/, (_req: Request, res: Response) => {
  res.sendFile(path.resolve(process.cwd(), "public/index.html"));
});

app.listen(port, () => {
  // Keep startup log minimal for simple local MVP.
  console.log(`Architecture TA server running at http://localhost:${port}`);
});
