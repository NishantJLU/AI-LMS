import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";

export default async function TeacherCoursesPage() {
  const userId = (await getDemoUser("TEACHER")).id;

  const courses = await db.course.findMany({
    where: {
      OR: [{ authorId: userId }, { instructors: { some: { userId } } }],
    },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { enrollments: true, modules: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">Authoring, cohorts, and assets.</p>
        </div>
        <Link href="/teacher/courses/new">
          <Button>Create subject</Button>
        </Link>
      </div>
      <div className="grid gap-4">
        {courses.map((c) => (
          <Link key={c.id} href={`/teacher/courses/${c.slug}`} className="block">
            <Card className="transition hover:border-primary/40 hover:shadow-sm">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle>{c.title}</CardTitle>
                  <CardDescription>{c.code}</CardDescription>
                </div>
                <Badge variant={c.published ? "default" : "secondary"}>
                  {c.published ? "Published" : "Draft"}
                </Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {c._count.modules} modules · {c._count.enrollments} learners
              </CardContent>
            </Card>
          </Link>
        ))}
        {courses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No subjects yet</CardTitle>
              <CardDescription>Create one to add modules, lessons, and assignments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/teacher/courses/new">
                <Button>Create subject</Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
