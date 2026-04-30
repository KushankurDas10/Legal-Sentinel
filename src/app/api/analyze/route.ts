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
        prompt: `
          Analyze this document as a legal expert. 
          Identify document type, 3 key legal pillars, redlines, power balance, and missing clauses.
          
          IF NON-LEGAL (code, marketing, junk):
          - Set type to "Non-Legal Document"
          - Set score to 0
          - Explain why in summary
          
          SCHEMA:
          {
            "overallScore": number,
            "riskLevel": "High"|"Moderate"|"Low",
            "summary": "string",
            "documentType": "string",
            "confidenceScore": number,
            "keyPillars": [{ "title": "string", "status": "Unbalanced"|"Standard"|"Favorable", "description": "string", "eli5": "string", "pushback": "string", "redline": "string" }],
            "powerBalance": { "partyA": "string", "partyB": "string", "balanceScore": number },
            "heatmap": [{ "section": "string", "risk": "safe"|"caution"|"danger" }],
            "missingClauses": [{ "clause": "string", "description": "string", "whyItMatters": "string" }]
          }

          Text: ${extractedText}
        `,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = JSON.parse(jsonMatch ? jsonMatch[0] : text);

      return createCORSResponse({ result, extractedText });
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
