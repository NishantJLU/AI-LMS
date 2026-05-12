"use server";

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { createHash } from "node:crypto";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Invalid input." };
  }
  const { name, email, password } = parsed.data;
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) {
    return { ok: false as const, message: "Email already registered." };
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({
    data: { name, email, passwordHash, role: "STUDENT" },
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function requestPasswordReset(input: z.infer<typeof forgotSchema>) {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: "Invalid email." };
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return { ok: true as const, message: "If that email exists, you will get reset instructions." };
  }
  const raw = nanoid(32);
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await db.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  const url = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${raw}`;
  return {
    ok: true as const,
    message: "Password reset link created.",
    devUrl: process.env.NODE_ENV === "development" ? url : undefined,
  };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function resetPasswordWithToken(input: z.infer<typeof resetSchema>) {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Invalid input." };
  }
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await db.passwordResetToken.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() } },
  });
  if (!record) {
    return { ok: false as const, message: "Invalid or expired token." };
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordResetToken.delete({ where: { id: record.id } }),
  ]);
  revalidatePath("/", "layout");
  return { ok: true as const };
}
