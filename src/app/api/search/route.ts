import { NextResponse } from "next/server";
import { z } from "zod";
import { getEmbeddingModel, getOpenAI } from "@/lib/ai/client";
import { cosineSimilarity, parseEmbedding } from "@/lib/ai/vectors";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  query: z.string().min(2).max(2000),
  courseId: z.string().optional(),
  topK: z.number().min(1).max(20).default(8),
});

export async function POST(req: Request) {
  const userId = (await getDemoUser("STUDENT")).id;
  if (!rateLimit(`search:${userId}`, 40, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { query, courseId, topK } = parsed.data;

  const openai = getOpenAI();
  let queryEmbedding: number[] | null = null;

  if (openai && process.env.OPENAI_API_KEY) {
    const emb = await openai.embeddings.create({
      model: getEmbeddingModel(),
      input: query.slice(0, 8000),
    });
    queryEmbedding = emb.data[0]?.embedding ?? null;
  }

  const chunks = await db.documentChunk.findMany({
    where: courseId ? { document: { courseId } } : {},
    take: 400,
    include: { document: { select: { title: true, courseId: true } } },
  });

  const scored = chunks
    .map((c) => {
      const emb = parseEmbedding(c.embedding);
      let score = 0;
      if (queryEmbedding && emb && queryEmbedding.length === emb.length) {
        score = cosineSimilarity(queryEmbedding, emb);
      } else {
        const t = `${c.content} ${c.document.title}`.toLowerCase();
        const q = query.toLowerCase();
        const words = q.split(/\s+/).filter(Boolean);
        score = words.reduce((s, w) => (t.includes(w) ? s + 1 : s), 0) / Math.max(words.length, 1);
      }
      return { chunk: c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const results = scored.map(({ chunk, score }) => ({
    content: chunk.content,
    score,
    documentTitle: chunk.document.title,
    documentId: chunk.documentId,
  }));

  return NextResponse.json({ results, mode: queryEmbedding ? "semantic" : "keyword-fallback" });
}
