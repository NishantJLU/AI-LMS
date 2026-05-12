import { NextResponse } from "next/server";
import { z } from "zod";
import { getChatModel, getOpenAI } from "@/lib/ai/client";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  submissionText: z.string().min(20).max(40_000),
  assignmentTitle: z.string().optional(),
  rubricHint: z.string().optional(),
});

export async function POST(req: Request) {
  const userId = (await getDemoUser("STUDENT")).id;
  if (!rateLimit(`ai:fb:${userId}`, 25, 60_000)) {
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
    strengths: string[];
    improvements: string[];
    missingConcepts: string[];
    grammarNotes: string[];
    suggestedScoreBand: string;
  };

  if (openai) {
    const completion = await openai.chat.completions.create({
      model,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "assignment_feedback",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "strengths",
              "improvements",
              "missingConcepts",
              "grammarNotes",
              "suggestedScoreBand",
            ],
            properties: {
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              missingConcepts: { type: "array", items: { type: "string" } },
              grammarNotes: { type: "array", items: { type: "string" } },
              suggestedScoreBand: { type: "string" },
            },
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You are a teaching assistant. Give constructive, rigorous feedback. JSON only per schema.",
        },
        {
          role: "user",
          content: `Assignment: ${parsed.data.assignmentTitle ?? "General"}\nRubric/context: ${parsed.data.rubricHint ?? "none"}\n\nSubmission:\n${parsed.data.submissionText.slice(0, 30_000)}`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return NextResponse.json({ error: "Model error" }, { status: 502 });
    result = JSON.parse(raw) as typeof result;
  } else {
    result = {
      strengths: ["Clear writing intent in demo mode"],
      improvements: [
        "Add structured argument and cite sources from course readings.",
        "Connect concepts to one concrete example.",
      ],
      missingConcepts: ["Set OPENAI_API_KEY for concept gap detection against your syllabus."],
      grammarNotes: [],
      suggestedScoreBand: "N/A (demo)",
    };
  }

  await db.aiGeneration.create({
    data: {
      userId,
      type: "ASSIGNMENT_FEEDBACK",
      prompt: parsed.data.submissionText.slice(0, 2000),
      result: result as object,
      model: openai ? model : "demo",
    },
  });

  return NextResponse.json(result);
}
