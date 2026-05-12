import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getDemoUser } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getDemoUser("ADMIN");
  return (
    <DashboardShell
      role="ADMIN"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </DashboardShell>
  );
}
