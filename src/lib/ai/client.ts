import OpenAI from "openai";

export function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY ?? process.env.GROQ_API_KEY;
  if (!key) return null;
  const baseURL =
    process.env.OPENAI_BASE_URL ??
    (process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined);
  return new OpenAI({
    apiKey: key,
    baseURL,
  });
}

export function getEmbeddingModel() {
  return process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";
}

export function getChatModel() {
  return process.env.LLM_MODEL ?? "gpt-4o-mini";
}
