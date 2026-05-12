import Link from "next/link";
import { ClipboardCheck, Layers, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";

export default async function TeacherHomePage() {
  const userId = (await getDemoUser("TEACHER")).id;

  const courses = await db.course.findMany({
    where: {
      OR: [{ authorId: userId }, { instructors: { some: { userId } } }],
    },
    include: {
      enrollments: true,
      _count: { select: { assignments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const pendingGrades = await db.submission.count({
    where: {
      status: { in: ["SUBMITTED", "LATE"] },
      assignment: {
        course: { OR: [{ authorId: userId }, { instructors: { some: { userId } } }] },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary">
            Faculty cockpit
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Teaching overview</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Design modules, ship assignments, and read the room with analytics — without jumping
            across tabs.
          </p>
        </div>
        <Link href="/teacher/courses/new">
          <Button size="lg" className="shrink-0 rounded-xl">
            New subject
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardDescription>Your subjects</CardDescription>
            <CardTitle className="text-3xl">{courses.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Authorship or co-instruction — same streamlined workflows.
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardDescription>Learners enrolled</CardDescription>
            <CardTitle className="text-3xl">
              {courses.reduce((n, c) => n + c.enrollments.length, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Headcount across courses you lead or co-teach.
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardDescription>Queue · grading</CardDescription>
            <CardTitle className="text-3xl">{pendingGrades}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Submissions waiting for feedback or marks.
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Jump into content, learners, or analytics</CardDescription>
          </div>
          <Layers className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground md:col-span-2">
              Create your first subject to unlock assignments, quizzes, and AI authoring.
            </p>
          ) : (
            courses.map((c) => (
              <Link
                key={c.id}
                href={`/teacher/courses/${c.slug}`}
                className="group flex flex-col rounded-2xl border border-border/60 bg-muted/10 p-5 transition hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.code}</p>
                  </div>
                  <Badge variant={c.published ? "default" : "secondary"}>
                    {c.published ? "Live" : "Draft"}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" /> {c.enrollments.length} learners
                  </span>
                  <span className="flex items-center gap-1">
                    <ClipboardCheck className="size-3.5" /> {c._count.assignments} assignments
                  </span>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
