import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { defineEvalConfig } from "eve/evals";

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export default defineEvalConfig({
  timeoutMs: 180_000,
  // The free Gemini tier allows a few requests a minute: one eval at a time, and a lite judge whose quota is
  // separate from the agent's.
  maxConcurrency: 1,
  judge: { model: google.decisionModel("gemini-3.1-flash-lite") },
});
