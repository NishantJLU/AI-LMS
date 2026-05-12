import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Tenant branding, SSO, data retention — wire env vars and extend here for production.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <CardDescription>
            Configure <code className="text-xs">DATABASE_URL</code>,{" "}
            <code className="text-xs">AUTH_SECRET</code>, AI keys, and Pusher for realtime in{" "}
            <code className="text-xs">.env</code>.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
