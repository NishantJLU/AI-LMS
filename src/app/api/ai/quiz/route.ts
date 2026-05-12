import { NextResponse } from "next/server";
import { z } from "zod";
import { getChatModel, getOpenAI } from "@/lib/ai/client";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  topic: z.string().min(2).max(500),
  difficulty: z.enum(["intro", "intermediate", "advanced"]).default("intermediate"),
  count: z.number().min(1).max(20).default(8),
  courseId: z.string().optional(),
});

export async function POST(req: Request) {
  const userId = (await getDemoUser("STUDENT")).id;
  if (!rateLimit(`ai:quiz:${userId}`, 15, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const openai = getOpenAI();
  const model = getChatModel();

  type Mcq = {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };

  let questions: Mcq[];

  if (openai) {
    const completion = await openai.chat.completions.create({
      model,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "quiz_pack",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["questions"],
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["question", "options", "answerIndex", "explanation"],
                  properties: {
                    question: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      minItems: 4,
                      maxItems: 4,
                    },
                    answerIndex: { type: "integer", minimum: 0, maximum: 3 },
                    explanation: { type: "string" },
                  },
                },
                minItems: 1,
                maxItems: 20,
              },
            },
          },
        },
      },
      messages: [
        {
          role: "system",
          content: `Create ${parsed.data.count} multiple-choice questions on the topic. Difficulty: ${parsed.data.difficulty}. JSON only.`,
        },
        { role: "user", content: parsed.data.topic },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return NextResponse.json({ error: "Model error" }, { status: 502 });
    questions = (JSON.parse(raw) as { questions: Mcq[] }).questions;
  } else {
    const n = Math.min(parsed.data.count, 5);
    questions = Array.from({ length: n }, (_, i) => ({
      question: `Sample question ${i + 1} about “${parsed.data.topic}”?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      answerIndex: 0,
      explanation: "Demo mode — configure OPENAI_API_KEY for real AI quizzes.",
    }));
  }

  await db.aiGeneration.create({
    data: {
      userId,
      courseId: parsed.data.courseId,
      type: "QUIZ",
      prompt: `${parsed.data.topic} (${parsed.data.difficulty})`,
      result: { questions } as object,
      model: openai ? model : "demo",
    },
  });

  return NextResponse.json({ questions });
}
