import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowRight, BookMarked, Flame, LineChart, Sparkles } from "lucide-react";
import { LearningMomentumChart } from "@/components/dashboard/learning-momentum-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo";

export default async function StudentHomePage() {
  const user = await getDemoUser("STUDENT");
  const userId = user.id;

  const enrollments = await db.enrollment.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      course: {
        select: { id: true, title: true, code: true, slug: true, description: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const assignments = await db.assignment.findMany({
    where: {
      status: "PUBLISHED",
      course: { enrollments: { some: { userId } } },
    },
    include: { course: { select: { title: true, slug: true } } },
    orderBy: { dueAt: "asc" },
    take: 8,
  });

  const announcements = await db.announcement.findMany({
    where: { course: { enrollments: { some: { userId } } } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { course: { select: { code: true } } },
  });

  const streak = await db.user.findUnique({ where: { id: userId }, select: { studyStreak: true } });

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-8 md:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative">
          <Badge className="mb-4 border-primary/30 bg-primary/15 text-primary">Adaptive learning</Badge>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Welcome back, {user?.name?.split(" ")[0] ?? "learner"}.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Your subjects, deadlines, and AI study tools in one calm surface — tuned for focus, not
            clutter.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/student/ai-studio">
              <Button>
                <Sparkles className="mr-2 size-4" />
                Open AI Studio
              </Button>
            </Link>
            <Link href="/student/search">
              <Button variant="outline">Semantic search</Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription>Study streak</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Flame className="size-6 text-orange-400" />
              {streak?.studyStreak ?? 0} days
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Micro-goals, streaks, and AI nudges keep cadence without burnout.
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription>Active subjects</CardDescription>
            <CardTitle className="text-3xl">{enrollments.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Compact progress per subject — drill in from the cards below.
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription>Upcoming deadlines</CardDescription>
            <CardTitle className="text-3xl">{assignments.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sorted by due date with late rules surfaced early.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="border-border/60 bg-card/50 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="size-5 text-muted-foreground" />
              Learning momentum
            </CardTitle>
            <CardDescription>Concept focus vs. retrieval mastery (sample analytics)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <LearningMomentumChart />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>AI picks for today</CardTitle>
            <CardDescription>Reasons map to your enrolled materials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="font-medium">Review weak prerequisite</p>
              <p className="text-muted-foreground">
                Tighten fundamentals on the first module of your densest subject this week.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="font-medium">Simulate an exam block</p>
              <p className="text-muted-foreground">
                Use AI Quiz from notes then a 25-minute focused sprint.
              </p>
            </div>
            <Link href="/student/ai-studio" className="block w-full">
              <Button variant="secondary" className="w-full">
                Launch tools <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Subjects</CardTitle>
              <CardDescription>Continue where you left off</CardDescription>
            </div>
            <BookMarked className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enrollments yet — check back soon.</p>
            ) : (
              enrollments.map((e) => (
                <Link
                  key={e.id}
                  href={`/student/courses/${e.course.slug}`}
                  className="block rounded-xl border border-border/50 bg-muted/10 p-4 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{e.course.title}</p>
                      <p className="text-xs text-muted-foreground">{e.course.code}</p>
                    </div>
                    <div className="w-24 shrink-0">
                      <Progress value={Math.round(e.progress * 100)} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Assignments & deadlines</CardTitle>
            <CardDescription>Across all active subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open tasks.</p>
            ) : (
              assignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.course.title}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{format(a.dueAt, "MMM d")}</p>
                    <p>{formatDistanceToNow(a.dueAt, { addSuffix: true })}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Latest from faculty</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements.</p>
          ) : (
            announcements.map((n) => (
              <div key={n.id} className="rounded-xl bg-muted/15 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{n.title}</p>
                  <Badge variant="outline">{n.course.code}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
