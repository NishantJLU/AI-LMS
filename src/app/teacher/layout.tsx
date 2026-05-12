import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getDemoUser } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getDemoUser("TEACHER");
  return (
    <DashboardShell
      role="TEACHER"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </DashboardShell>
  );
}
