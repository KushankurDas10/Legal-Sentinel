import { z } from "zod";

export const AnalysisResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  confidenceScore: z.number(),
  riskLevel: z.enum(["High", "Moderate", "Low"]),
  summary: z.string(),
  documentType: z.string(),
  keyPillars: z.array(
    z.object({
      title: z.string(),
      status: z.enum(["Unbalanced", "Standard", "Favorable"]),
      description: z.string(),
      eli5: z.string(),
      pushback: z.string(),
      redline: z.string().optional(),
    })
  ).min(3).max(3),
  powerBalance: z.object({
    partyA: z.string(),
    partyB: z.string(),
    rightsA: z.number(),
    rightsB: z.number(),
    obligationsA: z.number(),
    obligationsB: z.number(),
    balanceScore: z.number(), // -100 to 100, where 0 is balanced
  }).optional(),
  heatmap: z.array(
    z.object({
      section: z.string(),
      risk: z.enum(["safe", "caution", "danger"]),
    })
  ).max(8), // Limit to 8 sections for UI consistency
  missingClauses: z.array(
    z.object({
      clause: z.string(),
      description: z.string(),
      whyItMatters: z.string(),
    })
  ).optional(),
});

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
