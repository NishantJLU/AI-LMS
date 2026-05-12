import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";

type Props = { params: Promise<{ slug: string }> };

export default async function TeacherCourseDetailPage(props: Props) {
  const { slug } = await props.params;
  const userId = (await getDemoUser("TEACHER")).id;

  const course = await db.course.findFirst({
    where: {
      slug,
      OR: [{ authorId: userId }, { instructors: { some: { userId } } }],
    },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
      },
      assignments: { orderBy: { dueAt: "desc" }, take: 10 },
      enrollments: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  if (!course) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Badge className="mb-2">{course.code}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{course.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{course.description}</p>
        </div>
        <Badge variant={course.published ? "default" : "secondary"}>
          {course.published ? "Live" : "Draft"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Learners</CardTitle>
            <CardDescription>Enrollment overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {course.enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No learners yet.</p>
            ) : (
              course.enrollments.map((e) => (
                <div
                  key={e.id}
                  className="flex justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm"
                >
                  <span>{e.user.name ?? e.user.email}</span>
                  <span className="text-muted-foreground">{Math.round(e.progress * 100)}%</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Latest tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {course.assignments.map((a) => (
              <div key={a.id} className="rounded-lg border border-border/50 px-3 py-2 text-sm">
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">
                  Due {new Date(a.dueAt).toLocaleString()} · {a.status}
                </p>
              </div>
            ))}
            {course.assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Modules & lessons</h2>
        <div className="space-y-4">
          {course.modules.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="text-base">{m.title}</CardTitle>
                {m.description ? <CardDescription>{m.description}</CardDescription> : null}
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {m.lessons.map((l) => (
                    <li key={l.id}>{l.title}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="text-center">
        <Link href="/teacher/courses" className="text-sm text-primary underline-offset-4 hover:underline">
          All subjects
        </Link>
      </div>
    </div>
  );
}
