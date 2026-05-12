import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";

export default async function StudentCoursesPage() {
  const userId = (await getDemoUser("STUDENT")).id;
  const enrollments = await db.enrollment.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      course: {
        include: {
          modules: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your subjects</h1>
        <p className="text-muted-foreground">
          Structured modules, assets, and discussions per course.
        </p>
      </div>
      <div className="grid gap-4">
        {enrollments.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No enrollments</CardTitle>
              <CardDescription>
                When your program assigns subjects, they appear here with progress.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          enrollments.map((e) => (
            <Link key={e.id} href={`/student/courses/${e.course.slug}`} className="block">
              <Card className="transition hover:border-primary/40 hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>{e.course.title}</CardTitle>
                    <CardDescription>{e.course.code}</CardDescription>
                  </div>
                  <div className="w-40 shrink-0 text-right text-xs text-muted-foreground">
                    Next module
                    <p className="font-medium text-foreground">
                      {e.course.modules[0]?.title ?? "Start"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={Math.min(100, Math.round((e.progress ?? 0) * 100))} />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
