import { NextResponse } from "next/server";
import { z } from "zod";
import { getChatModel, getOpenAI } from "@/lib/ai/client";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  text: z.string().min(20).max(40_000),
  courseId: z.string().optional(),
  title: z.string().min(1).max(200).optional(),
});

export async function POST(req: Request) {
  const userId = (await getDemoUser("STUDENT")).id;
  if (!rateLimit(`ai:fc:${userId}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const openai = getOpenAI();
  const model = getChatModel();

  type Card = { front: string; back: string };

  let cards: Card[];

  if (openai) {
    const completion = await openai.chat.completions.create({
      model,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "flashcards",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["cards"],
            properties: {
              cards: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["front", "back"],
                  properties: {
                    front: { type: "string" },
                    back: { type: "string" },
                  },
                },
                minItems: 6,
                maxItems: 24,
              },
            },
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "Generate flashcards with clear fronts and concise backs from the notes. JSON only.",
        },
        { role: "user", content: parsed.data.text.slice(0, 32_000) },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return NextResponse.json({ error: "Model error" }, { status: 502 });
    cards = (JSON.parse(raw) as { cards: Card[] }).cards;
  } else {
    cards = [
      {
        front: "Demo card — what is this platform?",
        back: "NexaLearn: AI-native LMS. Add OPENAI_API_KEY for live flashcards.",
      },
      {
        front: "Active recall",
        back: "Retrieval practice strengthens long-term memory.",
      },
    ];
  }

  const setTitle = parsed.data.title ?? "AI flashcards";

  const gen = await db.aiGeneration.create({
    data: {
      userId,
      courseId: parsed.data.courseId,
      type: "FLASHCARDS",
      prompt: parsed.data.text.slice(0, 2000),
      result: { cards, title: setTitle } as object,
      model: openai ? model : "demo",
    },
  });

  const set = await db.flashcardSet.create({
    data: {
      title: setTitle,
      userId,
      courseId: parsed.data.courseId,
      sourceAiGenerationId: gen.id,
      cards: {
        create: cards.map((c, i) => ({
          front: c.front,
          back: c.back,
          sortOrder: i,
        })),
      },
    },
    include: { cards: true },
  });

  return NextResponse.json({ set });
}
