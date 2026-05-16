"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Sparkles,
  Users,
  GraduationCap,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/generated/prisma";

const navItems: Record<
  UserRole,
  { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
> = {
  STUDENT: [
    { href: "/student", label: "Overview", icon: LayoutDashboard },
    { href: "/student/courses", label: "Subjects", icon: BookOpen },
    { href: "/student/assignments", label: "Tasks", icon: ClipboardList },
    { href: "/student/ai-studio", label: "AI Studio", icon: Sparkles },
    { href: "/student/search", label: "Semantic search", icon: Search },
  ],
  TEACHER: [
    { href: "/teacher", label: "Overview", icon: LayoutDashboard },
    { href: "/teacher/courses", label: "Subjects", icon: GraduationCap },
    { href: "/teacher/assignments", label: "Grading", icon: ClipboardList },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Directory", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

function NavLinks({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navItems[role];
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            <Icon className="size-4 opacity-80" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  role,
  userName,
  userEmail,
  children,
}: {
  role: UserRole;
  userName?: string | null;
  userEmail?: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const initials =
    userName
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  const brand =
    role === "STUDENT"
      ? "Learner"
      : role === "TEACHER"
        ? "Faculty"
        : "Admin";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r border-border/60 bg-card/40 px-4 py-6 backdrop-blur md:flex">
        <Link href={`/${role.toLowerCase()}`} className="mb-8 flex items-center gap-2 px-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              NexaLearn
            </p>
            <p className="text-sm font-semibold">{brand} space</p>
          </div>
        </Link>
        <NavLinks role={role} />
        <div className="mt-auto space-y-3 pt-8">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
            AI-native workflows, real-time grade signals, and semantic course memory.
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur md:h-16 md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet>
              <SheetTrigger>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 gap-0 p-4">
                <Link href="/" className="mb-6 flex items-center gap-2 px-2 text-lg font-semibold">
                  NexaLearn
                </Link>
                <NavLinks role={role} onNavigate={() => undefined} />
              </SheetContent>
            </Sheet>
            <span className="font-semibold">Menu</span>
          </div>

          <div className="hidden md:block" />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="relative size-9 rounded-full p-0">
                  <Avatar className="size-9 border border-border/60">
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium">{userName ?? "Account"}</div>
                  <div className="text-xs font-normal text-muted-foreground">{userEmail}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  Switch workspace
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/student")}>
                  Student
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/teacher")}>
                  Teacher
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin")}>
                  Admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}

