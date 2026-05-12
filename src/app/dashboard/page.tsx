import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Public demo mode: default workspace is Student.
  redirect("/student");
}
