import { GraduationCap, Shield, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";

export default async function AdminHomePage() {
  const session = await getDemoUser("ADMIN");
  const [users, courses, enrollments] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.enrollment.count(),
  ]);

  const byRole = await db.user.groupBy({
    by: ["role"],
    _count: { _all: true },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Organization control
        </h1>
        <p className="mt-2 text-muted-foreground">
          Demo workspace · {session.email}. Platform-wide signals at a glance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader>
            <Users className="mb-2 size-5 text-muted-foreground" />
            <CardDescription>Users</CardDescription>
            <CardTitle className="text-3xl">{users}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <GraduationCap className="mb-2 size-5 text-muted-foreground" />
            <CardDescription>Courses</CardDescription>
            <CardTitle className="text-3xl">{courses}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <Shield className="mb-2 size-5 text-muted-foreground" />
            <CardDescription>Enrollments</CardDescription>
            <CardTitle className="text-3xl">{enrollments}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Users by role</CardTitle>
          <CardDescription>Directory counts</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {byRole.map((r) => (
            <div
              key={r.role}
              className="rounded-xl border border-border/50 bg-muted/15 px-4 py-3 text-sm"
            >
              <span className="font-medium">{r.role}</span>
              <span className="ml-2 text-muted-foreground">{r._count._all}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
