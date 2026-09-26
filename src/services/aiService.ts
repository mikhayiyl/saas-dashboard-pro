import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  Schema,
} from "firebase/ai";

import { app } from "../lib/Firebase";
import type { DashboardMetrics } from "./dashboardService";

const ai = getAI(app, {
  backend: new GoogleAIBackend(),
});

const insightSchema = Schema.array({
  items: Schema.object({
    properties: {
      type: Schema.string({
        enum: ["positive", "warning", "info"],
      }),
      title: Schema.string(),
      description: Schema.string(),
    },
  }),
});

const model = getGenerativeModel(ai, {
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: insightSchema,
  },
});

export type AIInsight = {
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
};

export async function generateBusinessInsights(
  metrics: DashboardMetrics,
): Promise<AIInsight[]> {
  const prompt = `
You are a business analytics assistant inside a SaaS dashboard.

Analyze the following business metrics and identify the most useful
business insights.

Rules:
- Return 2 to 4 insights.
- Focus only on information supported by the provided data.
- Do not invent numbers.
- Highlight meaningful trends, opportunities, or risks.
- Keep each title concise.
- Keep each description to one or two sentences.
- Use "positive" for opportunities or positive performance.
- Use "warning" for risks or problems.
- Use "info" for neutral observations.

Business metrics:

${JSON.stringify(metrics, null, 2)}
`;

  const result = await model.generateContent(prompt);

  return JSON.parse(result.response.text()) as AIInsight[];
}
