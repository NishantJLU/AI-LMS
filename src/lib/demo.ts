import { cache } from "react";
import type { UserRole } from "@/generated/prisma";
import { db } from "@/lib/db";

const emails: Record<UserRole, string> = {
  STUDENT: "student@nexalearn.edu",
  TEACHER: "teacher@nexalearn.edu",
  ADMIN: "admin@nexalearn.edu",
};

export const getDemoUser = cache(async (role: UserRole) => {
  const email = emails[role];
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    throw new Error(
      `Demo user for role ${role} not found. Run: npm run db:seed`,
    );
  }
  return user;
});


