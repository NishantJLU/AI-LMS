"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function LoginForm({
  showGoogle,
  showGithub,
}: {
  showGoogle: boolean;
  showGithub: boolean;
}) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function onCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading("credentials");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        toast.error("Invalid email or password");
        return;
      }
      window.location.href = callbackUrl;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {(showGoogle || showGithub) && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {showGoogle ? (
              <Button
                type="button"
                variant="outline"
                disabled={!!loading}
                onClick={() => {
                  setLoading("google");
                  signIn("google", { callbackUrl });
                }}
              >
                Google
              </Button>
            ) : null}
            {showGithub ? (
              <Button
                type="button"
                variant="outline"
                disabled={!!loading}
                onClick={() => {
                  setLoading("github");
                  signIn("github", { callbackUrl });
                }}
              >
                GitHub
              </Button>
            ) : null}
          </div>
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or email
            </span>
          </div>
        </>
      )}
      <form onSubmit={onCredentials} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={!!loading}>
          {loading === "credentials" ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
