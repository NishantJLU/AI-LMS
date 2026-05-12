import { NextResponse } from "next/server";
import { z } from "zod";
import { getChatModel, getOpenAI } from "@/lib/ai/client";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  text: z.string().min(20).max(80_000),
  courseId: z.string().optional(),
});

export async function POST(req: Request) {
  const userId = (await getDemoUser("STUDENT")).id;
  if (!rateLimit(`ai:sum:${userId}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const openai = getOpenAI();
  const model = getChatModel();

  let result: {
    summary: string;
    keyConcepts: string[];
    plainLanguage: string;
  };

  if (openai) {
    const completion = await openai.chat.completions.create({
      model,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "notes_summary",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["summary", "keyConcepts", "plainLanguage"],
            properties: {
              summary: { type: "string" },
              keyConcepts: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 8,
              },
              plainLanguage: { type: "string" },
            },
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You summarize educational material. Return valid JSON only per schema. Be concise and accurate.",
        },
        {
          role: "user",
          content: parsed.data.text.slice(0, 60_000),
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "Model error" }, { status: 502 });
    }
    result = JSON.parse(raw) as typeof result;
  } else {
    result = {
      summary:
        parsed.data.text.length > 400
          ? `${parsed.data.text.slice(0, 380)}…`
          : parsed.data.text,
      keyConcepts: ["Concept A", "Concept B", "Concept C"],
      plainLanguage:
        "Set OPENAI_API_KEY (or GROQ_API_KEY with LLM_MODEL) for live AI summaries. This is demo output.",
    };
  }

  await db.aiGeneration.create({
    data: {
      userId,
      courseId: parsed.data.courseId,
      type: "SUMMARY",
      prompt: parsed.data.text.slice(0, 2000),
      result: result as object,
      model: openai ? model : "demo",
    },
  });

  return NextResponse.json(result);
}
