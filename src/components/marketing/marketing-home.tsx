"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function MarketingHome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.22_270/0.35),transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />

      <MarketingNav />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-12 md:px-8 md:pt-20">
        <motion.section
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.08 }}
          className="text-center"
        >
          <motion.p
            variants={fade}
            className="mb-4 inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary"
          >
            NexaLearn · AI-native campus OS
          </motion.p>
          <motion.h1
            variants={fade}
            className="text-balance text-4xl font-semibold tracking-tight md:text-6xl"
          >
            Learn like it is{" "}
            <span className="bg-gradient-to-r from-primary via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              2026
            </span>
            , not 2012.
          </motion.h1>
          <motion.p
            variants={fade}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            One calmer surface for students and faculty — assignments, modules, semantic search, and
            AI copilots that understand your readings instead of a lonely chatbot on the side.
          </motion.p>
          <motion.div variants={fade} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/student">
              <Button size="lg" className="rounded-2xl px-8">
                Open demo <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="/teacher">
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl border-border/60 bg-card/40 backdrop-blur"
              >
                Faculty demo
              </Button>
            </Link>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24 grid gap-6 md:grid-cols-3"
        >
          {[
            {
              icon: Sparkles,
              title: "Embedded AI",
              desc: "Summaries, quizzes, flashcards, and rubric-aware feedback tied to courses.",
            },
            {
              icon: Search,
              title: "Semantic search",
              desc: "Vector-backed RAG over slides, PDFs, and notes — not ctrl+F across uploads.",
            },
            {
              icon: Shield,
              title: "Roles that scale",
              desc: "Students, teachers, and admins with opinionated dashboards and guardrails.",
            },
            {
              icon: Brain,
              title: "Signals, not noise",
              desc: "Progress, momentum charts, and light streak mechanics for sustainable pace.",
            },
            {
              icon: Zap,
              title: "Ready to deploy",
              desc: "Next.js 15, Prisma, PostgreSQL, Docker, and Vercel-compatible defaults.",
            },
            {
              icon: MessageSquare,
              title: "Discussions-ready",
              desc: "Threaded schema for boards and realtime when you wire Pusher or WebSockets.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur transition hover:border-primary/30 hover:bg-card/60"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </motion.section>

        <section className="mt-24 rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 to-primary/5 p-10 text-center backdrop-blur md:p-16">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Ship a portfolio-grade LMS without the template look.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Opinionated UI, modular architecture, and realistic data paths — built for demos,
            hackathons, and first production pilots.
          </p>
          <Link href="/student">
            <Button size="lg" className="mt-8 rounded-2xl">
              Enter student demo
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
