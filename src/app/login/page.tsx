import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const showGoogle =
    !!(process.env.AUTH_GOOGLE_ID || process.env.AUTH_GOOGLE_CLIENT_ID);
  const showGithub =
    !!(process.env.AUTH_GITHUB_ID || process.env.AUTH_GITHUB_CLIENT_ID);

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-16">
      <Link
        href="/"
        className="mb-8 block text-center text-sm text-muted-foreground hover:text-foreground"
      >
        ← NexaLearn
      </Link>
      <Card className="mx-auto w-full max-w-md border-border/60 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Secure access with email or SSO.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted/30" />}>
            <LoginForm showGoogle={showGoogle} showGithub={showGithub} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
