import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";

export default async function TeacherAssignmentsPage() {
  const userId = (await getDemoUser("TEACHER")).id;

  const submissions = await db.submission.findMany({
    where: {
      status: { in: ["SUBMITTED", "LATE"] },
      assignment: {
        course: {
          OR: [{ authorId: userId }, { instructors: { some: { userId } } }],
        },
      },
    },
    include: {
      user: { select: { name: true, email: true } },
      assignment: { select: { title: true, maxPoints: true, course: { select: { title: true } } } },
    },
    orderBy: { submittedAt: "desc" },
    take: 40,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Grading queue</h1>
        <p className="text-muted-foreground">Submissions waiting for feedback.</p>
      </div>
      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">You are caught up.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{s.assignment.title}</CardTitle>
                  <CardDescription>
                    {s.assignment.course.title} · {s.user.name ?? s.user.email}
                  </CardDescription>
                </div>
                <Badge variant="outline">{s.status}</Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Max {s.assignment.maxPoints} pts</span>
                {s.submittedAt ? (
                  <span>Submitted {new Date(s.submittedAt).toLocaleString()}</span>
                ) : null}
                <Link href={`/teacher/courses`} className="text-primary underline-offset-4 hover:underline">
                  Open subject
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
