import { SemanticSearchClient } from "@/components/search/semantic-search-client";

export default function StudentSearchPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Course memory</h1>
        <p className="text-muted-foreground">
          RAG over uploaded materials — tuned for recall, not keyword bingo.
        </p>
      </div>
      <SemanticSearchClient />
    </div>
  );
}
