"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "course"}-${nanoid(6)}`;

}

const createSchema = z.object({
  title: z.string().min(3),
  code: z.string().min(2).max(32),
  description: z.string().max(5000).optional(),
  published: z.boolean().optional(),
});

export async function createCourse(input: z.infer<typeof createSchema>) {
  const teacher = await getDemoUser("TEACHER");
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: "Invalid input." };

  const slug = slugify(parsed.data.title);
  const course = await db.course.create({
    data: {
      title: parsed.data.title,
      code: parsed.data.code,
      description: parsed.data.description,
      slug,
      published: parsed.data.published ?? false,
      authorId: teacher.id,
      instructors: { create: { userId: teacher.id, isLead: true } },
    },
  });
  revalidatePath("/teacher");
  revalidatePath("/teacher/courses");
  return { ok: true as const, slug: course.slug };
}
