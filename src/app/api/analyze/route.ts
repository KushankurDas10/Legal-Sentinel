import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { extractText } from "unpdf";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return createCORSResponse({ error: "Configuration Error", details: "OPENROUTER_API_KEY is missing on this server." }, 500);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return createCORSResponse({ error: "No file provided" }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    let extractedText = "";

    // Content extraction (PDF/TXT)
    if (file.name.toLowerCase().endsWith(".txt")) {
      extractedText = Buffer.from(arrayBuffer).toString("utf-8");
    } else {
      try {
        const data = new Uint8Array(arrayBuffer);
        const { text } = await extractText(data, { mergePages: true });
        extractedText = text;
      } catch (parseError: any) {
        return createCORSResponse({ error: "Failed to parse document content" }, 400);
      }
    }

    if (!extractedText?.trim()) {
      return createCORSResponse({ error: "Document is empty or unreadable" }, 400);
    }

    // Limit context window for performance
    if (extractedText.length > 15000) {
      extractedText = extractedText.substring(0, 15000) + "... [TRUNCATED]";
    }

    try {
      const { text } = await generateText({
        model: openrouter("openrouter/free"),
        prompt: `You are a senior legal contract analyst. Analyze this document with extreme precision.

STEP 1: Determine if this is a legal document (contract, agreement, terms of service, NDA, lease, employment agreement, policy, etc.).
- If NOT a legal document (code, marketing copy, personal letter, junk text, etc.), respond with:
  {"overallScore":0,"confidenceScore":0,"riskLevel":"High","summary":"This is not a legal document. [explain why]","documentType":"Non-Legal Document","keyPillars":[],"powerBalance":null,"heatmap":[],"missingClauses":[]}

STEP 2: For legal documents, analyze and return ALL of the following fields:

SCORING RULES (follow strictly):
- "overallScore": 0-100. This is the SAFETY score from the WEAKER party's perspective. 100 = perfectly safe and balanced. 0 = extremely dangerous. A one-sided contract with harsh penalties scores 10-30. A standard balanced contract scores 60-80. A highly favorable contract scores 80-95.
- "confidenceScore": 0-100. How confident you are in your analysis. Short/vague documents get 30-50. Detailed multi-page contracts get 70-95.
- "riskLevel": "High" if overallScore < 40, "Moderate" if 40-69, "Low" if >= 70.
- "balanceScore": -100 to 100. Negative means Party A (first named party) is favored. Positive means Party B is favored. 0 means perfectly balanced. A contract heavily favoring the company over an individual should be +40 to +80.
- "rightsA" / "rightsB": Count of distinct enforceable rights granted to each party (integer, typically 1-15).
- "obligationsA" / "obligationsB": Count of distinct mandatory obligations imposed on each party (integer, typically 1-15).

REQUIRED JSON SCHEMA (return ONLY this JSON, no markdown, no explanation):
{
  "overallScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "riskLevel": "High" | "Moderate" | "Low",
  "summary": "<2-3 sentence executive summary of key findings and risks>",
  "documentType": "<specific type e.g. Employment Agreement, NDA, Terms of Service, Lease Agreement>",
  "keyPillars": [
    {
      "title": "<pillar name e.g. Termination Rights, Liability Cap, Non-Compete>",
      "status": "Unbalanced" | "Standard" | "Favorable",
      "description": "<detailed technical analysis of this clause>",
      "eli5": "<explain like I'm 5 years old, plain language>",
      "pushback": "<specific negotiation language the weaker party can use>",
      "redline": "<suggested contract edit using ~~strikethrough~~ for removals and **bold** for additions>"
    }
  ],
  "powerBalance": {
    "partyA": "<full name of first party>",
    "partyB": "<full name of second party>",
    "rightsA": <integer count of Party A's rights>,
    "rightsB": <integer count of Party B's rights>,
    "obligationsA": <integer count of Party A's obligations>,
    "obligationsB": <integer count of Party B's obligations>,
    "balanceScore": <number -100 to 100>
  },
  "heatmap": [
    {"section": "<contract section name>", "risk": "safe" | "caution" | "danger"}
  ],
  "missingClauses": [
    {"clause": "<missing clause name>", "description": "<what should be included>", "whyItMatters": "<legal risk of omission>"}
  ]
}

RULES:
- Return EXACTLY 3 keyPillars. Pick the 3 most critical legal issues.
- Return 3-8 heatmap sections covering all major contract areas.
- Return 1-5 missingClauses for clauses that SHOULD exist but don't.
- All string values must be substantive, not generic filler.
- Do NOT wrap the JSON in markdown code blocks. Return raw JSON only.

DOCUMENT TEXT:
${extractedText}`,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI did not return valid JSON");
      }
      const parsed = JSON.parse(jsonMatch[0]);

      // Ensure powerBalance has all required fields with sensible defaults
      if (parsed.powerBalance) {
        parsed.powerBalance.rightsA = parsed.powerBalance.rightsA ?? 0;
        parsed.powerBalance.rightsB = parsed.powerBalance.rightsB ?? 0;
        parsed.powerBalance.obligationsA = parsed.powerBalance.obligationsA ?? 0;
        parsed.powerBalance.obligationsB = parsed.powerBalance.obligationsB ?? 0;
        parsed.powerBalance.balanceScore = Math.max(-100, Math.min(100, parsed.powerBalance.balanceScore ?? 0));
      }

      // Clamp scores to valid ranges
      parsed.overallScore = Math.max(0, Math.min(100, parsed.overallScore ?? 50));
      parsed.confidenceScore = Math.max(0, Math.min(100, parsed.confidenceScore ?? 50));

      // Ensure riskLevel matches overallScore
      if (parsed.overallScore < 40) parsed.riskLevel = "High";
      else if (parsed.overallScore < 70) parsed.riskLevel = "Moderate";
      else parsed.riskLevel = "Low";

      return createCORSResponse({ result: parsed, extractedText });
    } catch (aiError: any) {
      return createCORSResponse({ error: "AI analysis engine failure", details: aiError.message }, 500);
    }
  } catch (error: any) {
    return createCORSResponse({ error: error.message || "Internal Server Error" }, 500);
  }
}

// Global CORS helper for extension access
function createCORSResponse(data: any, status = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  return createCORSResponse(null, 204);
}
