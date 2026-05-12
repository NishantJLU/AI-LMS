import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";

type Props = { params: Promise<{ slug: string }> };

export default async function StudentCoursePage(props: Props) {
  const { slug } = await props.params;
  const userId = (await getDemoUser("STUDENT")).id;

  const course = await db.course.findFirst({
    where: {
      slug,
      enrollments: { some: { userId } },
    },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: { orderBy: { sortOrder: "asc" } },
        },
      },
      assignments: {
        where: { status: "PUBLISHED" },
        orderBy: { dueAt: "asc" },
        take: 6,
      },
      discussions: { take: 3, orderBy: { updatedAt: "desc" } },
    },
  });

  if (!course) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="rounded-3xl border border-border/60 bg-muted/15 p-8">
        <Badge variant="secondary" className="mb-3">
          {course.code}
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{course.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{course.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Badge variant="outline">{course.modules.length} modules</Badge>
          <Badge variant="outline">{course.assignments.length} open tasks</Badge>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Module path</h2>
        <div className="space-y-6">
          {course.modules.map((mod) => (
            <Card key={mod.id} id={mod.id}>
              <CardHeader>
                <CardTitle className="text-base">{mod.title}</CardTitle>
                {mod.description ? (
                  <CardDescription>{mod.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-3">
                {mod.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="rounded-xl border border-border/50 bg-background/50 p-4 text-sm"
                  >
                    <p className="font-medium">{lesson.title}</p>
                    <p className="mt-2 line-clamp-3 text-muted-foreground">{lesson.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Assignments</h2>
        <div className="grid gap-3">
          {course.assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published assignments.</p>
          ) : (
            course.assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {new Date(a.dueAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline">{a.maxPoints} pts</Badge>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <MessageSquareText className="size-5" />
          <h2 className="text-lg font-semibold">Discussion</h2>
        </div>
        <Card>
          <CardContent className="space-y-4 pt-6">
            {course.discussions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No threads yet.</p>
            ) : (
              course.discussions.map((t) => (
                <div key={t.id}>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(t.updatedAt).toLocaleDateString()}
                  </p>
                  <Separator className="mt-4" />
                </div>
              ))
            )}
            <p className="text-xs text-muted-foreground">
              Full threaded discussions ship in the next iteration — schema is ready (
              <code>DiscussionPost</code>, reactions, realtime).
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="text-center">
        <Link href="/student/courses" className="text-sm text-primary underline-offset-4 hover:underline">
          Back to subjects
        </Link>
      </div>
    </div>
  );
}
