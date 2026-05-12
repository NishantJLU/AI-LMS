import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getDemoUser } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getDemoUser("STUDENT");
  return (
    <DashboardShell
      role="STUDENT"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </DashboardShell>
  );
}
