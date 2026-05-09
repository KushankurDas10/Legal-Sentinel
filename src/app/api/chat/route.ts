import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { messages, contractText } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;
    const truncatedContract = contractText ? contractText.substring(0, 10000) : "";

    const { text } = await generateText({
      model: openrouter("openrouter/free"),
      system: `You are Legal Sentinel, an expert contract AI assistant.
Your goal is to help freelancers and small businesses understand their contracts and protect them from predatory terms.

Context of the contract being analyzed:
${truncatedContract}

Rules:
1. Always be professional but protective of the user (the weaker party).
2. If asked about something not in the contract, clearly state it is not mentioned.
3. Never give official legal advice; provide educational analysis only.
4. Keep responses concise, scannable, and actionable.
5. Reference specific clauses or sections when possible.`,
      prompt: lastMessage,
    });

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Chat failed", details: error.message }, { status: 500 });
  }
}
