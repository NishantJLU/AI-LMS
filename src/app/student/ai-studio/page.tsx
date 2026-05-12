import { AiStudioClient } from "@/components/ai/ai-studio-client";

export default function AiStudioPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI Studio</h1>
        <p className="text-muted-foreground">
          Tools are embedded in your workflow — summarize uploads, spin up quizzes, and generate
          flashcards without leaving context.
        </p>
      </div>
      <AiStudioClient />
    </div>
  );
}
