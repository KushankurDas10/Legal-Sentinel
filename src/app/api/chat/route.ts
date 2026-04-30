import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { messages, contractText } = await req.body ? await req.json() : { messages: [], contractText: "" };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    const { text } = await generateText({
      model: openrouter("openrouter/free"),
      system: `
        You are Legal Sentinel, an expert contract AI. 
        Your goal is to help freelancers and small businesses understand their contracts and protect them from predatory terms.
        
        Context of the contract:
        ${contractText.substring(0, 10000)} // Truncated context for efficiency
        
        Rules:
        1. Always be professional but protective of the user.
        2. If asked about something not in the contract, clarify that it's not mentioned.
        3. Never give official legal advice; provide educational analysis.
        4. Keep responses concise and scannable.
      `,
      prompt: lastMessage,
    });

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Chat failed", details: error.message }, { status: 500 });
  }
}
