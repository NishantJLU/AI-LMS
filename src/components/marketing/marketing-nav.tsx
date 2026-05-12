"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function MarketingNav() {
  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 md:px-8">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <Sparkles className="size-5" />
        </span>
        NexaLearn
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/student">
          <Button variant="ghost">Open demo</Button>
        </Link>
      </div>
    </header>
  );
}
