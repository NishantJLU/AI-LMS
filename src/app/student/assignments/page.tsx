import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";

export default async function StudentAssignmentsPage() {
  const userId = (await getDemoUser("STUDENT")).id;

  const rows = await db.assignment.findMany({
    where: {
      status: "PUBLISHED",
      course: { enrollments: { some: { userId } } },
    },
    include: {
      course: { select: { title: true, code: true } },
      submissions: { where: { userId }, take: 1 },
    },
    orderBy: { dueAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">Status, deadlines, and late rules per subject.</p>
      </div>
      <div className="space-y-4">
        {rows.map((a) => {
          const sub = a.submissions[0];
          const status = sub?.status ?? "—";
          return (
            <Card key={a.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <CardDescription>
                    {a.course.title}{" "}
                    <span className="text-muted-foreground">({a.course.code})</span>
                  </CardDescription>
                </div>
                <Badge variant="outline">{status}</Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Due: {new Date(a.dueAt).toLocaleString()}</span>
                {a.latePenaltyPercent > 0 ? (
                  <span>Late penalty: {a.latePenaltyPercent}%</span>
                ) : null}
                <span>Max: {a.maxPoints} pts</span>
              </CardContent>
            </Card>
          );
        })}
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing scheduled right now.</p>
        ) : null}
      </div>
    </div>
  );
}
